# Constelutions.github.io

Source for the Constelutions marketing site, built with [Astro](https://astro.build). The site is deployed to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), and can also be built into a self-contained nginx Docker image for hosting elsewhere (e.g. Coolify).

The contact form is backed by a small Dart service in [`src/mailer/`](src/mailer/README.md), which runs as a second container alongside nginx and has its own README covering architecture and design. The form therefore only works on the Docker/Coolify deployment — the GitHub Pages build is static and has no `/api/contact` endpoint.

## Project structure

```txt
/
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD
└── src/
    ├── site/                      # Astro project
    │   ├── src/pages/             # Routes (each file = one page)
    │   ├── public/                # Static assets, served as-is
    │   ├── Dockerfile             # Build + nginx runtime image
    │   └── nginx.conf             # Security headers / routing / /api proxy
    ├── mailer/                    # Dart contact-form relay (own image + README)
    └── docker-compose.yml         # Builds and runs the site, mailer, and Cap (captcha) + Valkey
```

See [`specs/contact-form-anti-spam.md`](specs/contact-form-anti-spam.md) for
the full anti-spam design (Cap, honeypot, rate limiting) this compose stack
implements.

Docker commands are run from `src/`, where `docker-compose.yml` and `.env` live.
Astro commands are run from `src/site/`.

## Local development

Requires Node.js 22+ and [pnpm](https://pnpm.io/).

```sh
cd src/site
pnpm install
pnpm dev          # http://localhost:4321
```

| Command                 | Action                                        |
| :---------------------- | :-------------------------------------------- |
| `pnpm dev`              | Start the local dev server                    |
| `pnpm build`            | Build the production site to `src/site/dist/` |
| `pnpm preview`          | Preview the production build locally          |
| `pnpm exec astro check` | Type-check `.astro` and `.ts` files           |

> `pnpm dev` serves the static site only. There is no `/api/contact` route in
> `astro dev`, so submitting the contact form will show its error state. To
> exercise the form end to end, use Docker Compose below.

## Environment

Copy [`src/.env.example`](src/.env.example) to `src/.env` and fill in the
required values:

```sh
cd src
cp .env.example .env
```

`RESEND_API_KEY`, `CAP_ADMIN_KEY` and `PUBLIC_CAP_SITE_KEY` are required —
see [Docker Compose](#docker-compose-recommended) below for the local
bootstrap that mints `PUBLIC_CAP_SITE_KEY`, since it doesn't exist until Cap
itself has started once. `docker compose` reads `.env` from the directory
holding `docker-compose.yml`, so it must live in `src/`; anywhere else is
silently ignored. `.env` is git-ignored — in production these are set in
Coolify's environment UI instead (see [Deploying to Coolify](#deploying-to-coolify)).

Full variable list, required and optional: [`src/.env.example`](src/.env.example).
The mailer's own subset is also documented in
[`src/mailer/README.md`](src/mailer/README.md#configuration).

## Running with Docker

`src/site/Dockerfile` builds the Astro site and serves it with a hardened nginx
image (see `src/site/nginx.conf`). `src/mailer/Dockerfile` builds the mail relay.
`docker compose` builds and runs both.

### Docker Compose (recommended)

The contact form's captcha ([Cap](https://github.com/tiagozip/cap),
self-hosted) needs a site key that only exists after Cap itself has started
once, so **the very first run is two phases**. Every run after that is the
one-liner you'd expect.

**Phase 1 — bring the stack up**

```sh
cd src
cp .env.example .env
```

Edit `.env`: set `RESEND_API_KEY`, and set `CAP_ADMIN_KEY` to any 32+
character string (`openssl rand -hex 32` works). Leave `PUBLIC_CAP_SITE_KEY`
as a placeholder for now — any non-empty value, e.g. `bootstrap` — it has to
be *something* for Compose to start, but the real key doesn't exist yet.

```sh
docker compose up --build -d
```

The site is now up at <http://localhost:80>, but captcha enforcement stays
off and the widget shows an error state until Phase 3.

**Phase 2 — mint a Cap site key**

Open <http://localhost:3000> — Cap's dashboard is published straight to your
own machine locally, no SSH tunnel needed. Log in with `CAP_ADMIN_KEY`,
create a site key (leave instrumentation challenges on — they raise the bar
for bots), and copy both the site key and its secret.

**Phase 3 — wire in the real values and rebuild**

In `.env`:

```sh
PUBLIC_CAP_SITE_KEY=<the site key>
CAP_SITEVERIFY_URL=http://cap:3000/<the site key>/siteverify
CAP_SECRET_KEY=<the secret>
```

```sh
docker compose up --build -d
```

This rebuilds the site image with the real key baked in (it's a build arg —
see [`src/site/Dockerfile`](src/site/Dockerfile)) and restarts the mailer
with captcha enforcement on. From here, day-to-day iteration is just that
same command — `docker compose up --build -d` — since the image bakes in a
static production build.

Stop the stack with `docker compose down`. Without `RESEND_API_KEY`,
`CAP_ADMIN_KEY`, or `PUBLIC_CAP_SITE_KEY`, Compose refuses to start and says
so, e.g.:

```
required variable RESEND_API_KEY is missing a value: RESEND_API_KEY is required
```

To try the form without mailing the real inbox, uncomment the Resend
[test address](https://resend.com/docs/dashboard/emails/send-test-emails) line
in `.env`:

```sh
CONTACT_TO=delivered+contact-form@resend.dev
```

Full design rationale — why Cap is proxied same-origin, why the honeypot and
rate limits are ordered the way they are, the complete verification
checklist — is in
[`specs/contact-form-anti-spam.md`](specs/contact-form-anti-spam.md).

### Verifying a running stack

```sh
# marketing-site, mailer and valkey should report (healthy); cap has no
# explicit healthcheck and will show as running
docker compose ps

# Health probe
curl -i http://localhost/healthz

# Static site and the API, through nginx
curl -i http://localhost/
curl -i -X POST http://localhost/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"hola"}'

# Security headers must survive on assets too
curl -D - -o /dev/null http://localhost/_static/<hashed>.js

# The site must stay up when the mailer is not
docker compose stop mailer
curl -i http://localhost/                      # still 200
curl -i -X POST http://localhost/api/contact   # 503 {"error":"unavailable"}
docker compose start mailer

# Captcha enforcement, once Phase 3 above has set CAP_SITEVERIFY_URL:
# no token → 403 {"error":"captcha_failed"}
curl -i -X POST http://localhost/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"hola"}'

docker compose logs mailer
docker compose logs cap
```

The full verification checklist (rate-limit bursts through nginx, honeypot
trap logging, Cap's self-hosted WASM asset) is in
[`specs/contact-form-anti-spam.md`](specs/contact-form-anti-spam.md#verification).

### Plain Docker

```sh
cd src/site
docker build -t constelutions-site .
docker run --rm -p 80:80 constelutions-site
```

Then open <http://localhost:80>. Note this runs the static site **without** the
mailer, so the contact form will show its error state.

## Deploying to Coolify

The stack deploys exactly as `src/docker-compose.yml` describes it — same
four services, same env vars as local — with a handful of Coolify-specific
settings the first time you set the resource up.

### One-time resource setup

1. Create a **Docker Compose** resource in Coolify pointed at this
   repository. Set the **Base Directory** to `src` and the **Docker Compose
   Location** to `docker-compose.yml` (see [Project structure](#project-structure)
   above).
2. In the resource's environment variables, add every var from
   [`src/.env.example`](src/.env.example): `RESEND_API_KEY`, `CAP_ADMIN_KEY`,
   `PUBLIC_CAP_SITE_KEY` (placeholder for now — see the bootstrap below),
   `CAP_SITEVERIFY_URL`, `CAP_SECRET_KEY`, and optionally `CONTACT_FROM`,
   `CONTACT_TO`, `MAX_SENDS_PER_HOUR`, `CAP_CORS_ORIGIN`.
3. Assign a **public domain only to `marketing-site`**. If Coolify offers to
   map a domain to `cap` too (it publishes `127.0.0.1:3000:3000`), decline
   it — that binding is host-loopback-only by design, and Cap must never be
   reachable from the internet directly (it trusts `X-Forwarded-For` as-is
   for its own rate limiting). `mailer` gets no domain either, unchanged
   from before Cap existed.
4. Register `/healthz` as the health check path for `marketing-site`. The
   mailer needs no path configured — it self-probes via
   `/app/bin/server --health`. `cap` has no explicit healthcheck in the
   compose file, so Coolify will show it as running rather than healthy;
   that's expected, not a misconfiguration.
5. Check the **Persistent Storage** tab lists the `valkey-data` volume and
   that it's set to survive redeploys. This matters more than it looks:
   **the Cap site key and its secret live inside Valkey**, not in a
   Coolify-tracked variable. If that volume is ever wiped, the site key
   becomes invalid and you're back to the bootstrap below with a new one.

### First-deploy bootstrap

Same two-phase shape as local (see [Docker Compose](#docker-compose-recommended)
above), via Coolify's redeploy button instead of `docker compose up --build -d`:

1. Deploy with `PUBLIC_CAP_SITE_KEY` set to a placeholder and
   `CAP_SITEVERIFY_URL`/`CAP_SECRET_KEY` left blank. The site and mailer
   come up fine; captcha enforcement stays off.
2. Open an SSH tunnel to the Cap dashboard through your Coolify host, using
   its configured SSH port and deploy user:

   ```sh
   ssh -p <ssh_port> -L 3000:127.0.0.1:3000 <deploy_user>@<your-coolify-host>
   ```

   Then open <http://localhost:3000> on your own machine, log in with
   `CAP_ADMIN_KEY`, create a site key (leave instrumentation challenges on),
   and record the site key and its secret. Keep the SSH session open while
   working — closing it closes the tunnel.
3. Set `PUBLIC_CAP_SITE_KEY`, `CAP_SITEVERIFY_URL`
   (`http://cap:3000/<site key>/siteverify`), and `CAP_SECRET_KEY` in
   Coolify's environment UI, then **Redeploy**. That rebuilds the site image
   with the real key baked in and restarts the mailer with enforcement on.

Full rationale for every one of these steps — why Cap isn't exposed any
other way, why the widget's proxy strips the `/cap/` prefix, why rate limits
key off the real client IP behind Coolify's proxy — is in
[`specs/contact-form-anti-spam.md`](specs/contact-form-anti-spam.md).

## Mailer

The contact-form service has its own README covering architecture, design
decisions and development commands:

**[`src/mailer/README.md`](src/mailer/README.md)**

```sh
cd src/mailer
dart pub get
dart analyze && dart test
RESEND_API_KEY=re_your_key_here dart run bin/server.dart   # http://localhost:8080
```
