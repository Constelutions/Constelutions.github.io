# Contact-form anti-spam

Specification for protecting the contact pipeline (`Contact.astro` → `main.ts`
→ nginx `/api/` → Dart mailer → Resend) against automated spam. Today that
pipeline has zero bot protection: no honeypot, no rate limiting anywhere, no
captcha, and anyone can POST JSON directly to `/api/contact`. A spam wave
would bury real leads in the inbox and burn the Resend free-tier quota
(100 emails/day).

The design centers on [Cap](https://github.com/tiagozip/cap), a self-hosted,
open-source proof-of-work captcha, deployed in the same compose stack and
proxied same-origin through nginx — no third-party script, no external
account, no visitor data leaving the stack. Supporting layers: a honeypot
field, an nginx per-IP rate limit (with the real-IP fix Coolify requires),
and a global send throttle in the mailer.

This spec is self-contained: every file path, field name, env var, and
directive is fixed here. Implement it as written.

## Threat model

| Attacker tier | Behavior | Stopped by |
| --- | --- | --- |
| Dumb scrapers | Autofill every input on the real form, submit | Honeypot → fake success (no PoW burned) |
| Script POSTers | POST JSON straight to `/api/contact`, never load the page | Missing/unverifiable Cap token → 403 |
| Headless-browser bots | Load the page, execute JS, solve challenges | Cap PoW cost tax + instrumentation challenges; nginx per-IP limit |
| Distributed spam | Many IPs, each with a valid token | Mailer global send cap (Resend quota guard); Cap dashboard escalation knobs |

## Architecture

```
                          Coolify (TLS termination, Traefik)
                                       │
                                       ▼
                        ┌───────────────────────────────┐
                        │  marketing-site (nginx :80)   │
                        │                               │
    static pages ◄──────┤  /            (dist)          │
                        │  /api/   ──── limit_req ────► │────► mailer:8080
                        │  /cap/   ─── strip prefix ──► │────► cap:3000
                        └───────────────────────────────┘
                                                │              │
                                                │   siteverify │
                                    mailer ─────┴──────────────┤
                                       │                       ▼
                                       ▼                 valkey:6379
                                  Resend API
```

Request flow for one legitimate submission:

```
visitor loads page
  └─ scrolls to #contact-form → capWidget.ts chunk loads → <cap-widget> upgrades
       └─ visitor clicks widget → GET/POST /cap/<site-key>/… (PoW challenge)
            └─ widget injects hidden input[name="cap-token"]
                 └─ submit → POST /api/contact {…, capToken, website:""}
                      ├─ nginx limit_req (3r/m, burst 5)     → 429 {"error":"rate_limited"}
                      ├─ mailer: field validation             → 400 {"error":"validation","fields":[…]}
                      ├─ mailer: honeypot filled              → 200 {"ok":true}   (fake success, logged)
                      ├─ mailer: siteverify POST to cap       → 403 {"error":"captcha_failed"}
                      ├─ mailer: global throttle empty        → 429 {"error":"rate_limited"} + Retry-After
                      └─ mailer: Resend send                  → 200 {"ok":true}
```

## Implementation

Ordered steps. Steps 1–3 are the mailer, 4–5 the site, 6 nginx, 7 compose,
8 tests, 9 docs.

### Step 1 — Honeypot in the validator (`src/mailer/lib/contact_request.dart`)

Add above the length constants:

```dart
/// Honeypot field rendered off-screen by Contact.astro. A human never sees
/// it; any non-empty value marks the submission as a bot.
const String honeypotField = 'website';
```

Add a third sealed variant next to `ContactAccepted`/`ContactRejected`:

```dart
/// The submission tripped a bot trap. The caller must answer with a fake
/// success so the bot learns nothing.
final class ContactTrapped extends ContactValidation {
  const ContactTrapped(this.reason);

  final String reason; // currently only 'honeypot'
}
```

In `validate`, immediately after the `body is! Map<String, Object?>` guard and
**before** any field check — a bot with a filled honeypot *and* a bad email
must get the fake success, never the helpful 400 field list:

```dart
if (_readString(body[honeypotField]).isNotEmpty) {
  return const ContactTrapped('honeypot');
}
```

### Step 2 — Cap verification and send throttle (mailer)

#### `src/mailer/lib/cap_verifier.dart` (new)

```dart
/// Outcome of verifying a widget token against the Cap standalone server.
enum CapVerdict {
  /// Cap confirmed the token ({"success": true}).
  valid,

  /// Cap rejected the token, or answered with a non-2xx status.
  invalid,

  /// Cap could not be reached (timeout, socket error). The caller fails
  /// open: losing a real lead costs more than one spam email during an
  /// outage of the captcha service.
  unavailable,
}

final class CapVerifier {
  CapVerifier({
    required String siteverifyUrl,
    required String secretKey,
    HttpClient? client, // injectable for tests
  });

  Future<CapVerdict> verify(String token);
}
```

`verify` POSTs JSON `{"secret": <secretKey>, "response": <token>}` with
`content-type: application/json` to `siteverifyUrl`, with a 5-second timeout
on the whole exchange. Decode the response body; `{"success": true}` →
`CapVerdict.valid`; any 2xx without `success: true`, or any non-2xx status →
`CapVerdict.invalid`; `TimeoutException`/`SocketException`/`HttpException` →
`CapVerdict.unavailable`. Use `dart:io`'s `HttpClient` (no new pub
dependency). Expose a `void close()` that closes the client; call it from the
shutdown path in `bin/server.dart` alongside the Resend client.

#### `src/mailer/lib/send_throttle.dart` (new)

```dart
/// Caps total sends per hour across all clients, protecting the Resend
/// quota from distributed spam that per-IP limiting cannot see.
final class SendThrottle {
  SendThrottle({required int maxPerHour, DateTime Function()? now});

  /// Takes a token if one is available. False means "answer 429".
  bool tryAcquire();

  /// Whole seconds until the next token exists. For the Retry-After header.
  int get retryAfterSeconds;
}
```

Token bucket: capacity `maxPerHour`, continuous refill at `maxPerHour` tokens
per hour, token count tracked as a `double`, last-refill timestamp taken from
the injected clock (defaults to `DateTime.now`) — injectable exactly so tests
need no real sleeps. State is in-memory; a restart refills the bucket, which
is acceptable for a single container and documented in the trade-offs.

#### `src/mailer/lib/config.dart`

Add three fields following the existing `PORT` parse-and-validate pattern:

| Field | Env var | Rule |
| --- | --- | --- |
| `capSiteverifyUrl` | `CAP_SITEVERIFY_URL` | Optional `String?`. **Presence enables captcha enforcement**; unset skips the check entirely (local dev, first-deploy bootstrap). Must parse as an absolute http(s) URI or throw `MailerConfigException`. |
| `capSecretKey` | `CAP_SECRET_KEY` | Required iff `CAP_SITEVERIFY_URL` is set (throw `MailerConfigException` if the URL is set and this is missing/blank); ignored otherwise. |
| `maxSendsPerHour` | `MAX_SENDS_PER_HOUR` | Optional int, default `4`; reject non-integer or `< 1`. |

### Step 3 — Handler and server wiring (mailer)

#### `src/mailer/lib/contact_handler.dart`

- Signature: `Router buildRouter(MailSender sender, SendThrottle throttle, CapVerifier? capVerifier)` — `capVerifier` is null when `CAP_SITEVERIFY_URL` is unset.
- Extend `_json` with an optional `Map<String, String> headers = const {}` merged over the base headers.
- `_handleContact` order (each step must precede the next — the comments say why):

```dart
final ContactValidation validation = ContactRequest.validate(decoded);
switch (validation) {
  // Fake success: a 400 naming the honeypot field would hand the bot its
  // exact fix, and the trap must also fire before siteverify so dumb bots
  // never consume Cap challenge capacity.
  case ContactTrapped(:final String reason):
    logInfo('submission trapped', <String, Object?>{'reason': reason});
    return _json(200, <String, Object?>{'ok': true});

  case ContactRejected(:final List<String> fields):
    return _json(400, <String, Object?>{'error': 'validation', 'fields': fields});

  case ContactAccepted(:final ContactRequest request):
    if (capVerifier != null) {
      final String token =
          decoded is Map<String, Object?> && decoded['capToken'] is String
              ? (decoded['capToken']! as String).trim()
              : '';
      // 403 rather than fake success: Cap tokens are one-time and expire, so
      // a human with a stale token needs actionable feedback to re-solve.
      // The PoW is the wall — telling a bot its token failed reveals nothing.
      final CapVerdict verdict =
          token.isEmpty ? CapVerdict.invalid : await capVerifier.verify(token);
      if (verdict == CapVerdict.invalid) {
        logInfo('captcha rejected', <String, Object?>{'emptyToken': token.isEmpty});
        return _json(403, <String, Object?>{'error': 'captcha_failed'});
      }
      // CapVerdict.unavailable falls through: fail open. CapVerifier already
      // logged the error.
    }

    // Throttle only submissions that would actually send — trapped, rejected
    // and captcha-failed requests must not starve legitimate visitors.
    if (!throttle.tryAcquire()) {
      logInfo('submission throttled',
          <String, Object?>{'retryAfterSeconds': throttle.retryAfterSeconds});
      return _json(429, <String, Object?>{'error': 'rate_limited'},
          headers: <String, String>{'retry-after': '${throttle.retryAfterSeconds}'});
    }

    // …existing sender.send path unchanged…
}
```

Inside `CapVerifier.verify`, log the `unavailable` case as
`logError('cap siteverify unreachable', …)` with the exception type — this
line is the operator's signal that spam may be slipping through fail-open.

#### `src/mailer/bin/server.dart`

- Construct once after the Resend client: `SendThrottle(maxPerHour: config.maxSendsPerHour)` and, when `config.capSiteverifyUrl != null`, a `CapVerifier(siteverifyUrl: …, secretKey: …)`.
- Pass both to `buildRouter`.
- Add `maxSendsPerHour` and `capEnforced: config.capSiteverifyUrl != null` to the `'mailer listening'` startup log fields.
- Close the verifier in the SIGTERM/SIGINT path next to `resend`.

### Step 4 — Site: honeypot, widget markup, i18n

#### `src/site/src/components/Contact.astro`

Honeypot — immediately after the `<form …>` open tag (before `.form-fields`):

```html
{/* Bot trap: off-screen (not display:none — form-filler bots skip
    non-rendered inputs), out of the a11y tree and tab order. The label is
    deliberately static English with no data-i18n: it must never surface in
    the dictionary or be announced. Server counterpart: honeypotField in
    mailer/lib/contact_request.dart. */}
<div class="hp-field" aria-hidden="true">
  <label for="contact-website">Website</label>
  <input id="contact-website" type="text" name="website"
         tabindex="-1" autocomplete="off" />
</div>
```

Scoped CSS in the component's `<style>`:

```css
.hp-field {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

Cap widget — between the message field block and the submit button:

```astro
<cap-widget
  id="contact-cap"
  data-cap-api-endpoint={`/cap/${import.meta.env.PUBLIC_CAP_SITE_KEY}/`}
  data-cap-i18n-initial-state="Verifica que eres humano"
  data-cap-i18n-verifying-label="Verificando…"
  data-cap-i18n-solved-label="Verificado"
  data-cap-i18n-error-label="Error, inténtalo de nuevo"
  data-cap-i18n-verify-aria-label="Haz clic para verificar que eres humano"
  data-cap-i18n-verifying-aria-label="Verificando, espera un momento"
  data-cap-i18n-verified-aria-label="Verificado"
  data-cap-i18n-error-aria-label="Ocurrió un error, inténtalo de nuevo"
  data-i18n-attr="data-cap-i18n-initial-state:cap_initial;data-cap-i18n-verifying-label:cap_verifying;data-cap-i18n-solved-label:cap_solved;data-cap-i18n-error-label:cap_error;data-cap-i18n-verify-aria-label:cap_verify_aria;data-cap-i18n-verifying-aria-label:cap_verifying_aria;data-cap-i18n-verified-aria-label:cap_verified_aria;data-cap-i18n-error-aria-label:cap_error_aria"
></cap-widget>
<p id="contact-cap-err" class="field-err" hidden data-i18n="f_err_captcha">
  Completa la verificación antes de enviar.
</p>
```

The i18n system's `paint()` already handles `data-i18n-attr`
(`attr:key;attr:key` pairs), so the language toggle repaints the widget
labels with no new mechanism. `PUBLIC_CAP_SITE_KEY` is read at build time via
`import.meta.env` (Step 7 wires it through Docker).

#### `src/site/src/scripts/i18nDict.ts`

Add to the contact block (Spanish is the source of truth):

```ts
cap_initial:        { es: "Verifica que eres humano", en: "Verify you're human" },
cap_verifying:      { es: "Verificando…", en: "Verifying…" },
cap_solved:         { es: "Verificado", en: "Verified" },
cap_error:          { es: "Error, inténtalo de nuevo", en: "Error, try again" },
cap_verify_aria:    { es: "Haz clic para verificar que eres humano", en: "Click to verify you're human" },
cap_verifying_aria: { es: "Verificando, espera un momento", en: "Verifying, please wait" },
cap_verified_aria:  { es: "Verificado", en: "Verified" },
cap_error_aria:     { es: "Ocurrió un error, inténtalo de nuevo", en: "An error occurred, please try again" },
f_err_captcha:      { es: "Completa la verificación antes de enviar.", en: "Complete the verification before sending." },
f_error_rate_d: {
  es: "Has enviado demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.",
  en: "Too many requests. Please wait a few minutes and try again.",
},
```

### Step 5 — Site: widget loading and submit handler

#### `src/site/package.json`

`pnpm add cap-widget` (exact pinned version; the widget is bundled through
Vite — never loaded from a CDN, per the payload rules).

#### `src/site/src/scripts/capWidget.ts` (new)

```ts
/* Loads the Cap widget chunk. CAP_CUSTOM_WASM_URL must be set before the
 * import: without it the widget fetches its WASM from jsdelivr at runtime,
 * reintroducing the third-party dependency this design removes. The path is
 * Cap standalone's asset server, proxied same-origin by nginx. */
export async function loadCapWidget(): Promise<void> {
  (window as Window & { CAP_CUSTOM_WASM_URL?: string }).CAP_CUSTOM_WASM_URL =
    "/cap/assets/cap_wasm_bg.wasm";
  await import("cap-widget");
}
```

(Adjust the `window` typing to whatever the widget's own types provide; do
not use `@ts-ignore`.)

#### `src/site/src/scripts/main.ts` — inside `contactForm()`

- Lazy-load the widget the same way the i18n dict is lazy: the entry bundle
  ships only what first render needs. Use an `IntersectionObserver` on the
  form (disconnect after first hit, with a no-`IntersectionObserver` fallback
  that loads immediately):

```ts
const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    observer.disconnect();
    void import("./capWidget").then((m) => m.loadCapWidget());
  }
}, { rootMargin: "200px" });
observer.observe(form);
```

- Grab the captcha error node next to the other error nodes:
  `const capError = document.getElementById("contact-cap-err");`
- In the submit handler, after the existing field gate passes: the widget
  auto-injects `input[name="cap-token"]` into the form once solved. Read it;
  if missing/empty, show the captcha error (`capError.hidden = false`, focus
  the widget) and return without sending. Clear it in `clearErrors()`.
- Keep `values: Record<string, string>` untouched (field validation depends
  on it); widen `send`'s parameter to the same type and call:

```ts
void send({
  ...values,
  website: byName<HTMLInputElement>("website")?.value ?? "",
  capToken: byName<HTMLInputElement>("cap-token")?.value ?? "",
});
```

- In `send()`, before the generic fallthrough:

```ts
// A 403 means the one-time Cap token was stale or already redeemed. Reset
// the widget so the visitor can re-solve, and return to the fields.
if (response.status === 403) {
  document.querySelector<HTMLElement & { reset(): void }>("cap-widget")?.reset();
  showPane(null);
  if (capError) capError.hidden = false;
  return;
}
if (response.status === 429) {
  showRateLimited();
  return;
}
```

- `showRateLimited()`: capture the error pane's `[data-i18n="f_error_d"]`
  element and its original key/text once (mirroring the `submitLabelKey`
  pattern at the top of `contactForm()`); the helper sets its `data-i18n` to
  `f_error_rate_d`, sets `textContent` to the Spanish literal, and calls
  `showPane(errorPane)`. The retry handler and each fresh submit restore the
  original key/text — same reasoning as `f_sending`: the key must move with
  the text or a mid-flight language toggle repaints the wrong message.

### Step 6 — nginx (`src/site/nginx.conf`)

#### Real IP (server block, before the locations)

Load-bearing for every per-IP limit in this design: Coolify terminates TLS
and proxies here, so `$remote_addr` is the proxy — without this fix one
spammer rate-limits the whole internet, and Cap's own limiter sees a single
client.

```nginx
# Coolify's Traefik fronts this container, so $remote_addr is the proxy.
# Trust X-Forwarded-For only when the request arrives from a private
# (RFC1918) source — the proxy and docker networks. A client hitting :80
# directly has a public $remote_addr, so its forged XFF is ignored entirely.
# A client going through Coolify can prepend fake entries, but Traefik
# appends the true client IP last and real_ip_recursive walks right-to-left
# past trusted addresses only, stopping at the first untrusted one — the
# genuine client.
set_real_ip_from 10.0.0.0/8;
set_real_ip_from 172.16.0.0/12;
set_real_ip_from 192.168.0.0/16;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

Alpine's nginx package compiles the realip module in; confirm during
implementation with `nginx -V 2>&1 | grep -o http_realip_module` inside the
image and note it in the Dockerfile if anything needs adding.

#### Rate-limit zone (http block, near `log_format`)

```nginx
# 1 MB tracks ~16k client IPs — far beyond this site's traffic. 3r/m with
# burst 5 below: five instant requests (submit → 400 → fix → resubmit →
# retry all fit), then one per 20 s.
limit_req_zone $binary_remote_addr zone=contact:1m rate=3r/m;
```

#### `location /api/` additions

```nginx
limit_req zone=contact burst=5 nodelay;
# Default would be 503, indistinguishable from @api_unavailable's
# "mailer down".
limit_req_status 429;
error_page 429 = @api_rate_limited;
```

Scope is the whole `/api/`, not POST-only: the only routes are
`/api/contact` and `/api/health`, and health is probed by the binary inside
the container, never through nginx.

#### New named location (after `@api_unavailable`)

```nginx
# Body matches the mailer's own 429 so main.ts handles both identically.
location @api_rate_limited {
    default_type application/json;
    add_header Cache-Control "no-store" always;
    # add_header does not merge across levels: restate the security trio.
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    return 429 '{"error":"rate_limited"}';
}
```

#### New `location /cap/` (next to `/api/`)

```nginx
# Same-origin proxy to the Cap standalone container. The prefix is stripped:
# the widget's apiEndpoint is /cap/<site-key>/, Cap serves /<site-key>/….
# Variable proxy_pass does no automatic URI mapping, hence the rewrite.
location /cap/ {
    resolver 127.0.0.11 valid=10s ipv6=off;
    set $cap_upstream http://cap:3000;
    rewrite ^/cap/(.*)$ /$1 break;
    proxy_pass $cap_upstream$uri$is_args$args;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    # Cap keys its per-IP challenge rate limit on X-Forwarded-For and trusts
    # it as-is, so send ONLY the resolved real client (post-realip), never
    # $proxy_add_x_forwarded_for's spoofable chain.
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;

    client_max_body_size 32k;
    proxy_connect_timeout 5s;
    proxy_read_timeout 15s;

    proxy_hide_header Cache-Control;
    add_header Cache-Control "no-store" always;
    # add_header does not merge across levels: restate the security trio.
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    proxy_intercept_errors off;
    error_page 502 503 504 = @api_unavailable;
}
```

The Cap dashboard is not usable through this proxy (its SPA references
root-absolute asset paths that the stripped prefix breaks) and is admin-key
gated regardless; admin access is the localhost port binding in Step 7.

### Step 7 — Compose, Dockerfile, env

#### `src/docker-compose.yml`

Add to the existing stack (pin the current `tiago2/cap` tag at implementation
time — check https://hub.docker.com/r/tiago2/cap/tags — and pin
`WIDGET_VERSION`/`WASM_VERSION` to real npm releases matching the installed
`cap-widget` package, never `latest`):

```yaml
  cap:
    image: tiago2/cap:<pinned>
    # Dashboard only reachable from the host itself (SSH tunnel:
    # ssh -L 3000:127.0.0.1:3000 <host>). The widget path goes through
    # nginx's /cap/ proxy on the compose network; the container must never
    # be internet-reachable directly — it trusts X-Forwarded-For as-is.
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      ADMIN_KEY: ${CAP_ADMIN_KEY:?CAP_ADMIN_KEY is required}
      REDIS_URL: redis://valkey:6379
      # Self-hosts the widget's WASM at /assets/ so the browser never
      # touches jsdelivr at runtime. Versions pinned: "latest" can ship
      # breaking changes on a container restart.
      ENABLE_ASSETS_SERVER: "true"
      WIDGET_VERSION: "<pinned>"
      WASM_VERSION: "<pinned>"
      # Defaults to Cap's own "*" when unset. The real page always reaches
      # Cap same-origin through nginx's /cap/ proxy, so this does not gate
      # the legitimate flow either way — it only stops a third-party page
      # from embedding this site's widget to farm valid tokens in visitors'
      # browsers. It does NOT stop a script calling the challenge/redeem
      # endpoints directly (CORS is browser-enforced only) — the
      # instrumentation challenges and headless-browser detection are what
      # answer that.
      CORS_ORIGIN: ${CAP_CORS_ORIGIN:-}
    depends_on:
      valkey:
        condition: service_healthy
    restart: unless-stopped

  valkey:
    image: valkey/valkey:9-alpine
    volumes:
      - valkey-data:/data
    command: valkey-server --save 60 1 --loglevel warning --maxmemory-policy noeviction
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  valkey-data:
```

Mailer service: add `CAP_SITEVERIFY_URL: ${CAP_SITEVERIFY_URL:-}`,
`CAP_SECRET_KEY: ${CAP_SECRET_KEY:-}`, and
`MAX_SENDS_PER_HOUR: ${MAX_SENDS_PER_HOUR:-4}` to `environment`.

Site service: add under `build:`:

```yaml
      args:
        PUBLIC_CAP_SITE_KEY: ${PUBLIC_CAP_SITE_KEY:?PUBLIC_CAP_SITE_KEY is required}
```

#### `src/site/Dockerfile`

In the build stage, before `pnpm build`:

```dockerfile
ARG PUBLIC_CAP_SITE_KEY
ENV PUBLIC_CAP_SITE_KEY=$PUBLIC_CAP_SITE_KEY
```

#### `src/.env.example`

```bash
# Cap (self-hosted captcha) — see specs/contact-form-anti-spam.md
CAP_ADMIN_KEY=change-me-to-a-32-plus-char-secret   # dashboard login for the cap container
PUBLIC_CAP_SITE_KEY=                               # from the Cap dashboard; baked into the site at build time (public)
CAP_SITEVERIFY_URL=http://cap:3000/<site_key>/siteverify  # unset = captcha enforcement off (local dev)
CAP_SECRET_KEY=                                    # the site key's secret (NOT the admin key)
# MAX_SENDS_PER_HOUR=4  # global mailer cap: 4/h = worst case 96/day, under Resend's free 100/day
# CAP_CORS_ORIGIN=constelutions.tech  # optional: restricts which origins may embed the widget; unset = Cap's own "*"
```

### Step 8 — Tests (`src/mailer/test/`)

`contact_request_test.dart` — extend the existing `validBody()` helper with
`'website': ''`, then add (matching the existing naming style):

- `traps a submission with the honeypot filled` → `ContactTrapped` with
  `reason == 'honeypot'`
- `honeypot outranks field validation` — filled honeypot **plus** an invalid
  email must yield `ContactTrapped`, not `ContactRejected`.

New `send_throttle_test.dart` with a manually advanced fake clock
(`DateTime Function()` closure over a mutable `DateTime`):

- `allows a burst up to the hourly cap` (cap 4 → 4 acquires succeed)
- `rejects once the bucket is empty` (5th fails)
- `refills a token after a fraction of the window` (advance 15 min at cap 4
  → one more acquire succeeds)
- `reports seconds until the next token` (`retryAfterSeconds` > 0 and ≤ 900
  after drain at cap 4; `0` while tokens remain)

`cap_verifier_test.dart` only if injecting a fake `HttpClient` proves cheap;
otherwise the verifier is covered by the Verification curls below.

### Step 9 — Docs

`src/mailer/README.md`:

- Configuration table: rows for `CAP_SITEVERIFY_URL`, `CAP_SECRET_KEY`,
  `MAX_SENDS_PER_HOUR`.
- New `### ` Design-decision subheads in the house style (each names the
  failure mode prevented):
  - **Bot traps answer with fake success** — a 400 naming `website` teaches
    the bot its exact fix; fake success burns bot retries harmlessly.
  - **Captcha failures answer 403, not fake success** — Cap tokens are
    one-time and expire; a human with a stale token needs actionable
    feedback, and the PoW itself is the wall.
  - **Cap outages fail open** — losing a real lead costs more than one spam
    email while the captcha service is down; the ERROR log line is the alarm.
  - **A global send cap protects the Resend quota** — distributed spam with
    valid tokens is invisible to per-IP limits; 4/h keeps worst-case volume
    under the free tier.
- Request-flow tree updated with the trapped/403/429 branches.

Note in the spec (and top-level README if it mentions the form): the GitHub
Pages deployment is unaffected — it has no `/api` or `/cap`, and the form is
already non-functional there.

## Configuration

| Variable | Where | Required | Default | Purpose |
| --- | --- | --- | --- | --- |
| `CAP_ADMIN_KEY` | cap container | yes | — | Dashboard login; ≥32 chars recommended |
| `PUBLIC_CAP_SITE_KEY` | site build arg | yes | — | Widget endpoint path segment; public by nature |
| `CAP_SITEVERIFY_URL` | mailer | no | unset (captcha off) | `http://cap:3000/<site_key>/siteverify`; presence enables enforcement |
| `CAP_SECRET_KEY` | mailer | iff URL set | — | Site key's secret for siteverify |
| `MAX_SENDS_PER_HOUR` | mailer | no | `4` | Global send cap (Resend quota guard) |
| `CAP_CORS_ORIGIN` | cap container | no | unset (Cap's own `*`) | Restricts which origins may embed the widget — defense in depth, not load-bearing (see Step 7) |
| `MIN_FILL_MS` | — | — | — | Not used; see Considered and rejected |

## First-deploy bootstrap

The site key exists only after the Cap dashboard is up, so the first deploy
is two-phase:

1. Deploy the stack with the two new containers. Set `PUBLIC_CAP_SITE_KEY`
   to a placeholder and leave `CAP_SITEVERIFY_URL` unset — the form works,
   captcha enforcement is off, the widget shows an error state (harmless,
   short-lived).
2. `ssh -L 3000:127.0.0.1:3000 <host>`, open `http://localhost:3000`, log in
   with `CAP_ADMIN_KEY`, create a site key (keep **instrumentation
   challenges** enabled — they are on by default and significantly raise the
   bar for bots). Record the site key and its secret.
3. Set `PUBLIC_CAP_SITE_KEY`, `CAP_SITEVERIFY_URL`
   (`http://cap:3000/<site_key>/siteverify`) and `CAP_SECRET_KEY` in the
   deployment env; redeploy site and mailer. Enforcement is now on.

## Dashboard access

The Cap dashboard is deliberately not reachable from the internet. The `cap`
service publishes its port as `127.0.0.1:3000:3000`, so it only answers on
the server's own loopback. To use it, open an SSH tunnel:

```bash
ssh -L 3000:127.0.0.1:3000 <host>
```

Then browse to `http://localhost:3000` and log in with `CAP_ADMIN_KEY`. Keep
the SSH session open while working; closing it closes the tunnel. Needed
only occasionally: minting the site key at first deploy, adjusting the
escalation knobs, or reading Cap's analytics.

Why it is not exposed any other way:

- **Not through the nginx `/cap/` proxy** — that location strips the `/cap/`
  prefix, and the dashboard SPA references root-absolute asset paths
  (`/assets/…`) that would then resolve against the site and 404. Only the
  widget's `/<site-key>/…` API endpoints survive prefix-stripping, which is
  exactly what that proxy is scoped to.
- **Not on its own public subdomain** — the dashboard is admin-key gated,
  but a login page that is never exposed cannot be brute-forced or probed.
  Admin access is rare enough that the tunnel is the right trade.

## Verification

Mailer, direct (compose network or `docker exec`):

```bash
# No capToken → 403
curl -s -X POST http://mailer:8080/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Ana","email":"ana@example.com","message":"Hola"}'
# → {"error":"captcha_failed"}

# Honeypot filled → fake success, no email, log line
curl -s -X POST http://mailer:8080/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Ana","email":"ana@example.com","message":"Hola","website":"http://spam"}'
# → {"ok":true} ; docker logs mailer | grep 'submission trapped'

# Throttle: >4 verified sends within the hour → 429 with Retry-After header
```

Through nginx:

```bash
# 6 rapid POSTs → the 6th answers 429 with the JSON body AND all three
# security headers (X-Content-Type-Options, X-Frame-Options,
# Referrer-Policy) — verify with -D -
for i in $(seq 6); do curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST https://<site>/api/contact -H 'content-type: application/json' -d '{}'; done
curl -s -D - -o /dev/null -X POST https://<site>/api/contact \
  -H 'content-type: application/json' -d '{}'

# Cap proxy + self-hosted WASM
curl -sI https://<site>/cap/assets/cap_wasm_bg.wasm   # → 200
```

Browser, end-to-end: load the contact section, solve the widget, submit —
success pane shows and the email arrives. Toggle the language — the widget
labels repaint in English. nginx access log shows the real client IP, not
Coolify's proxy address.

Unit tests: `dart test` green in `src/mailer`.

Operator signal that spam is happening (and whether to escalate):

```bash
docker logs mailer | grep -E 'trapped|captcha|throttled'
```

## Escalation

All escalation is dashboard configuration on the site key — no code changes:

1. Raise the instrumentation challenge level (default 3; higher levels are
   stronger obfuscation but slower challenge generation).
2. Enable **"Attempt to block headless browsers"**.
3. Switch the key's challenge protocol to the **RSW time-lock puzzle**
   (GPU-resistant, sequential squarings; the widget auto-detects the wire
   format). Tune the squarings slider — default `75_000` ≈ 300–800 ms of
   client work.

Trigger: sustained `submission trapped` / `captcha rejected` /
`submission throttled` log lines, or spam reaching the inbox.

Infrastructure-level escalation — banning the IPs behind sustained abuse at
the host firewall — is specified separately in
[fail2ban-ip-bans.md](fail2ban-ip-bans.md); note its rollout-order
dependency on this spec's nginx realip changes.

## Considered and rejected

- **Cloudflare Turnstile** — same protection class as Cap but adds a
  third-party script, an external account, and Cloudflare observing visitor
  traffic. Cap self-hosted wins on every axis this project cares about.
- **Minimum-fill-time (`elapsedMs`) check** — redundant once every send
  requires a freshly solved one-time PoW token: the token requirement already
  kills payload replays and instant submits.
- **Cap invisible/programmatic mode** — a visible widget was chosen; it also
  gives humans feedback when a solve is slow on weak hardware.
- **Origin/Referer check** — needs an `ALLOWED_ORIGIN` knob whose wrong value
  silently kills the form, and catches nothing the token requirement doesn't.
- **Content-Type enforcement** — a cross-site plain HTML form can only send
  encodings that already fail `jsonDecode` → 400. Redundant.
- **Link-count / content heuristics** — real prospects paste URLs; the
  false-positive cost exceeds the benefit at this traffic level.
- **Per-IP limiting inside the Dart mailer** — nginx owns the edge;
  duplicating it adds state for nothing.
- **Loading the widget from jsdelivr** — reintroduces a third-party runtime
  dependency; npm-pinned bundling plus the self-hosted asset server keeps
  the whole path first-party.

## Known trade-offs

- **Honeypot fake-success false positives**: an aggressive autofill
  extension filling the hidden field silently drops a real message. Judged
  acceptable; the `submission trapped` log makes the rate observable.
- **PoW costs legitimate visitors CPU** — roughly a second, more on old
  phones. The visible widget communicates the wait instead of hiding it.
- **Fail-open during a Cap outage** admits spam briefly rather than losing
  leads; the `cap siteverify unreachable` ERROR line is the alarm.
- **The send throttle is per-process memory**: a restart refills the bucket;
  a crash-loop could briefly over-send. Fine for one container.
- **`set_real_ip_from` trusts all RFC1918 sources**: anything on the docker
  or host private networks could spoof XFF — but those are already inside
  the trust boundary (they can reach `mailer:8080` directly anyway).
- **A NAT'd office burst can hit 429** (e.g. several people submitting from
  one IP): burst 5 then one per 20 s, and the UI message says to wait rather
  than dead-ending.
- **Two more containers** (Cap ≈ 50 MB idle + Valkey) in the stack, plus a
  first-deploy bootstrap step to mint the site key.
