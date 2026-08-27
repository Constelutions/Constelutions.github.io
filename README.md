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
    └── docker-compose.yml         # Builds and runs both
```

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

Copy [`src/.env.example`](src/.env.example) to `src/.env` and fill in the key:

```sh
cd src
cp .env.example .env      # then set RESEND_API_KEY
```

Only `RESEND_API_KEY` is required. `docker compose` reads `.env` from the
directory holding `docker-compose.yml`, so it must live in `src/`; anywhere else
is silently ignored. `.env` is git-ignored — in production these are set in
Coolify's environment UI instead.

Full variable list: [`src/mailer/README.md`](src/mailer/README.md#configuration).

## Running with Docker

`src/site/Dockerfile` builds the Astro site and serves it with a hardened nginx
image (see `src/site/nginx.conf`). `src/mailer/Dockerfile` builds the mail relay.
`docker compose` builds and runs both.

### Docker Compose (recommended)

```sh
cd src
cp .env.example .env      # then set RESEND_API_KEY
docker compose up --build -d
```

The site is then available at <http://localhost:80>. Stop it with
`docker compose down`. Since the image bakes in a static production build,
re-run `docker compose up --build -d` after making changes.

Without a `RESEND_API_KEY`, Compose refuses to start and says so:

```
required variable RESEND_API_KEY is missing a value: RESEND_API_KEY is required
```

To try the form without mailing the real inbox, uncomment the Resend
[test address](https://resend.com/docs/dashboard/emails/send-test-emails) line
in `.env`:

```sh
CONTACT_TO=delivered+contact-form@resend.dev
```

### Verifying a running stack

```sh
# Both services should report (healthy)
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

docker compose logs mailer
```

Register `/healthz` as the health check path for the site container in Coolify.
The mailer publishes no port and probes itself via `/app/bin/server --health`.

### Plain Docker

```sh
cd src/site
docker build -t constelutions-site .
docker run --rm -p 80:80 constelutions-site
```

Then open <http://localhost:80>. Note this runs the static site **without** the
mailer, so the contact form will show its error state.

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
