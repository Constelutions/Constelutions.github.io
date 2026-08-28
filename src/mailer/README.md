# mailer

A small Dart service that relays contact-form submissions from the Constelutions
marketing site to [Resend](https://resend.com).

It exists because the site is a static Astro build with no server of its own,
and a Resend API key can never be shipped to the browser — anyone could read it
out of devtools and send mail as Constelutions. The key therefore has to live in
a process the public cannot reach directly, which is what this service is.

## Architecture

```
browser ──► nginx :80 ─┬─ /            → static dist/
                       └─ /api/*       → proxy_pass http://mailer:8080
                                              │
                                        mailer (this service)
                                              │ RESEND_API_KEY
                                              ▼
                                        api.resend.com ──► CONTACT_TO
```

The service **publishes no ports**. Compose puts it on a private network where
only nginx can reach it, so the API key has no inbound path from the internet —
its only route out is the outbound HTTPS call to Resend.

Because nginx serves the site and proxies `/api/` on the same origin, the form
makes a same-origin request. There is no CORS anywhere in this design.

### Request flow

```
POST /api/contact
  │
  ├─ read body, cap at 32 KB                     → 413 {"error":"too_large"}
  ├─ jsonDecode                                  → 400 {"error":"validation","fields":["body"]}
  ├─ ContactRequest.validate
  │     ├─ honeypot filled                       → 200 {"ok":true}  (fake success, logged)
  │     └─ field validation failed               → 400 {"error":"validation","fields":[…]}
  ├─ CapVerifier.verify (only if CAP_SITEVERIFY_URL is set)
  │     └─ missing/invalid token                 → 403 {"error":"captcha_failed"}
  │        (unreachable Cap → fails open, falls through)
  ├─ SendThrottle.tryAcquire()
  │     └─ bucket empty                          → 429 {"error":"rate_limited"} + Retry-After
  ├─ MailSender.send → api.resend.com
  │     ├─ ResendApiException                    → 502 {"error":"send_failed"}
  │     ├─ ResendTimeoutException                → 504 {"error":"send_failed"}
  │     ├─ ResendNetworkException                → 502 {"error":"send_failed"}
  │     └─ ResendDecodeException                 → 502 {"error":"send_failed"}
  └─ ok                                          → 200 {"ok":true}
```

The full anti-spam design — honeypot, Cap captcha, rate limiting, and why
each check is ordered the way it is above — is specified in
[`../../specs/contact-form-anti-spam.md`](../../specs/contact-form-anti-spam.md).

| Route | Purpose |
| :--- | :--- |
| `POST /api/contact` | Accept and relay a submission |
| `GET /api/health` | Liveness probe |
| anything else | `404 {"error":"not_found"}` |

Routes are mounted under `/api/` to match the nginx location that proxies here,
so paths are identical inside and outside the container and nothing has to
rewrite a prefix.

### Modules

| File | Responsibility |
| :--- | :--- |
| `bin/server.dart` | Startup, signal handling, `--health` probe |
| `lib/config.dart` | Environment parsing, fail-fast validation |
| `lib/contact_request.dart` | Typed submission model, its validation rules, and the honeypot trap |
| `lib/contact_handler.dart` | HTTP routing, body limits, status mapping |
| `lib/cap_verifier.dart` | Cap Standalone siteverify boundary |
| `lib/send_throttle.dart` | In-memory hourly send cap (Resend quota guard) |
| `lib/mail_sender.dart` | Resend boundary — builds the email, translates failures |
| `lib/log.dart` | Structured logging and request-logging middleware |

`mail_sender.dart` is the only file that imports `dart_resend`. Every Resend
type, exceptions included, is translated into a plain `SendOutcome` there, so
the HTTP layer stays ignorant of the SDK and swapping providers touches one
file.

## Design decisions

### Configuration fails fast

`MailerConfig.fromEnvironment` throws and the process exits 1 when
`RESEND_API_KEY` is missing. A service that boots without a usable key would
report healthy and fail only when a real visitor submits the form, which is the
worst possible time to discover it.

`CONTACT_FROM` and `CONTACT_TO` default instead of throwing — neither is a
secret, so the service stays runnable with nothing but an API key in the
environment.

### One Resend client for the process lifetime

`dart_resend`'s README example ends in `finally { resend.close(); }`. That is
correct for a one-shot script and wrong for a server: closing per request throws
away the connection pool and forces a fresh TLS handshake on every submission.
The client is built once in `bin/server.dart` and closed only on shutdown.

### Every interpolated value is HTML-escaped

The message field is free text typed by an anonymous visitor and lands directly
inside an HTML document. Without escaping, a submission could inject markup into
the recipient's inbox. `escapeHtml` replaces `&` first — doing it later would
double-escape the entities introduced by the other replacements.

### Exception matching order is load-bearing

`ResendTimeoutException` **extends** `ResendNetworkException`. The timeout case
must be matched first; reversed, every timeout would be silently swallowed by
the generic network branch and reported as a 502 instead of a 504.

`ResendException` is a sealed class, so the translation is written as an
exhaustive `switch` and the analyzer fails the build if a new subtype appears.

### Failures are logged in full, reported generically

Resend's own error bodies never reach the browser. The client gets
`{"error":"send_failed"}` while the log keeps the status, error name, request id
and raw body. Upstream API internals are not something to hand to an anonymous
visitor.

`ResendApiException.requestId` is used rather than a direct header lookup — it
tries five different header spellings, so reading `x-request-id` alone would
miss four of them.

### Body size is capped twice

`Content-Length` is checked first as a cheap rejection, but it is client-supplied
and absent on chunked uploads, so the byte count is enforced again while the
stream is consumed. nginx caps the same request at 32 KB; this is the backstop
for anything reaching the service without passing through it.

### Bot traps answer with fake success

A submission with the honeypot field filled gets `200 {"ok":true}`, identical
to a real success — not a 400. Naming the offending field would hand a bot
its exact fix; fake success burns its retries harmlessly instead. The check
runs before any other validation, so a bot that also sends garbage in every
other field still gets the fake success, never the helpful field list.

### Captcha failures answer 403, not fake success

Unlike the honeypot, a missing or invalid Cap token gets an honest
`403 {"error":"captcha_failed"}`. Cap tokens are one-time and expire, so a
human whose token went stale needs actionable feedback to re-solve — the
proof-of-work itself is the wall keeping bots out, so telling one its token
failed reveals nothing useful to it.

### Cap outages fail open

If `CAP_SITEVERIFY_URL` cannot be reached (timeout, DNS, connection refused),
`CapVerifier` logs `cap siteverify unreachable` and the submission proceeds
as if verified. Losing a real lead to a captcha-service outage costs more
than one spam email getting through during that same window. The log line
is the operator's signal to investigate.

### A global send cap protects the Resend quota

Per-IP rate limiting (in nginx) is blind to distributed spam — many IPs, each
submitting within its own limit. `SendThrottle` caps total *verified* sends
per hour regardless of source. The default, 4/hour, allows 96/day worst
case, comfortably under Resend's free-tier 100/day, while never throttling a
realistic handful of legitimate submissions in one hour. Trapped and
rejected submissions never consume a token — only ones that would actually
reach Resend do, so garbage traffic cannot starve real visitors of the
shared budget.

### `service` is an allowlist

The submitted service id must be one of the ids in `../site/src/repositories/services.json`,
or `other`, or empty. It is interpolated into the email subject, so an allowlist
keeps a crafted payload from smuggling arbitrary text there.

### Logging is UTC throughout

`shelf`'s built-in `logRequests()` stamps lines in local time while everything
else here logs UTC. Interleaving two clocks in one `docker logs` stream is a
needless obstacle when correlating a report against a Resend request id, so
`log.dart` supplies its own middleware instead.

Logs go to stdout/stderr because Docker captures only those — a file-based log
would leave `docker logs` and Coolify's log view silent while the service runs
fine. This mirrors the same choice in `../site/nginx.conf`.

### The service emits no security headers

`shelf` adds `X-Powered-By: Dart with package:shelf` and `dart:io`'s `HttpServer`
adds `X-Frame-Options`, `X-Content-Type-Options` and `X-XSS-Protection`. All four
are suppressed at startup:

- `X-Powered-By` announces the stack, which only helps someone deciding which
  CVEs to try. The site already strips the nginx `Server` header for the same
  reason.
- nginx sets the other two on this location and has to restate them there, since
  `add_header` does not merge across levels. Leaving them on would send each
  header twice through the proxy.
- `X-XSS-Protection` is deprecated and unwanted.

nginx owns response headers at the edge. For the same reason its `/api/` block
sets `proxy_hide_header Cache-Control` — this service sets its own
`Cache-Control`, correct when reached directly, and `add_header` appends rather
than replaces.

### Binds `0.0.0.0`, not loopback

The socket has to be reachable from the nginx container across the Compose
network. A loopback bind would accept only connections originating inside this
container.

### Handles SIGTERM

Coolify and `docker compose down` stop containers with SIGTERM. Without a
handler the Dart VM ignores it and the container is SIGKILLed after the grace
period, cutting off any send already in flight.

### `--health` probes the running server

The Compose healthcheck re-invokes the binary as `/app/bin/server --health`,
which issues a request against the listening process and exits 0 or 1. This
tests the real server rather than proving some tool in the image can open a
socket, and needs no extra package.

The flag is handled **before** configuration is read, so a probe never depends
on `RESEND_API_KEY` being present.

## The Docker image builds against musl

`dart compile exe` emits a *dynamically linked* executable bound to the libc of
the SDK that built it. `ldd` on the output of the official Debian-based SDK
lists `libc.so.6` and `/lib64/ld-linux-x86-64.so.2`. Alpine is musl and ships no
such loader, so a binary built by the official image cannot exec there at all.

The Dockerfile therefore builds with the community musl SDK,
[`ghcr.io/dart-musl/dart`](https://github.com/dart-musl/dart). **This affects
the image only** — local development uses the ordinary Dart SDK and
`pubspec.yaml` is unchanged, so `dart run`, `dart test` and `dart analyze` all
work normally.

The runtime stage installs `ca-certificates` explicitly. Without root certs the
outbound TLS handshake to `api.resend.com` fails, and that fault would first
appear on a real visitor's submission rather than at build or boot. It runs as
`uid=10001`; the service reads no files and writes only to stdout, so it needs
no home directory and no write access anywhere.

Resulting image: ~25 MB.

## Configuration

| Variable | Required | Default |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | yes | — |
| `CONTACT_FROM` | no | `Constelutions <no-reply@constelutions.tech>` |
| `CONTACT_TO` | no | `theconstelutions@gmail.com` |
| `PORT` | no | `8080` |
| `CAP_SITEVERIFY_URL` | no | unset (captcha enforcement off) |
| `CAP_SECRET_KEY` | iff `CAP_SITEVERIFY_URL` is set | — |
| `MAX_SENDS_PER_HOUR` | no | `4` |

`CONTACT_FROM` must sit on a domain verified in Resend. `constelutions.tech` is
verified; `constelutions.com` is not.

`CAP_SITEVERIFY_URL`, `CAP_SECRET_KEY` and `MAX_SENDS_PER_HOUR` are the
mailer's half of the anti-spam design in
[`../../specs/contact-form-anti-spam.md`](../../specs/contact-form-anti-spam.md);
see that spec for the first-deploy bootstrap that mints a Cap site key.

When running under Compose, set these in `../.env` — see `../.env.example`.
`PORT` is pinned to `8080` there to match the port `../site/nginx.conf` proxies to.

## Development

Requires the [Dart SDK](https://dart.dev/get-dart) 3.8 or newer.

```sh
dart pub get
RESEND_API_KEY=re_your_key_here dart run bin/server.dart   # http://localhost:8080
```

| Command | Action |
| :--- | :--- |
| `dart analyze` | Static analysis; must be clean |
| `dart test` | Unit tests |
| `dart format .` | Format |
| `dart compile exe bin/server.dart -o bin/server` | AOT-compile as the image does |

Point `CONTACT_TO` at a Resend
[simulator address](https://resend.com/docs/dashboard/emails/send-test-emails)
to exercise the full API flow without mailing the real inbox or affecting
domain reputation:

```sh
RESEND_API_KEY=re_xxx CONTACT_TO=delivered+contact-form@resend.dev \
  dart run bin/server.dart
```

```sh
# Health, a valid submission, and a rejected one
curl -s localhost:8080/api/health
curl -s -X POST localhost:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"hola","service":"development"}'
curl -s -X POST localhost:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"","email":"nope","message":""}'
# → {"error":"validation","fields":["name","email","message"]}

# Honeypot: fake success, no email sent, logged as trapped
curl -s -X POST localhost:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"hola","website":"http://spam"}'
# → {"ok":true} — check stdout for "submission trapped reason=honeypot"

# With CAP_SITEVERIFY_URL set: no token → captcha_failed
curl -s -X POST localhost:8080/api/contact -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"hola"}'
# → {"error":"captcha_failed"}

# Throttle: repeat a valid + verified submission past MAX_SENDS_PER_HOUR
# → {"error":"rate_limited"} with a Retry-After header
```

The captcha check above needs a reachable Cap instance, which running the
mailer standalone (outside Compose) does not provide on its own. Start just
Cap and its Redis in another terminal, then point this process at Cap's
port on the host (already published there for the dashboard, so it works
the same way from outside Compose):

```sh
cd ..
docker compose up cap valkey -d
cd mailer
RESEND_API_KEY=re_xxx CAP_SITEVERIFY_URL=http://localhost:3000/<site_key>/siteverify \
  CAP_SECRET_KEY=<site_key_secret> dart run bin/server.dart
```

`<site_key>` and `<site_key_secret>` come from the Cap dashboard at
<http://localhost:3000> — see the bootstrap in the top-level
[`README.md`](../../README.md#docker-compose-recommended) if you haven't
minted one yet.

## Dependency note

[`dart_resend`](https://pub.dev/packages/dart_resend) is **community-maintained,
not an official Resend SDK**, and is **GPL-3.0** licensed. Dart AOT statically
links it into the binary. Building and running the image on your own server
triggers no GPL obligation — it binds on distribution, and this is not AGPL —
but publishing the image to a public registry would require offering source.
