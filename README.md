# Constelutions.github.io

Source for the Constelutions marketing site, built with [Astro](https://astro.build). The site is deployed to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), and can also be built into a self-contained nginx Docker image for hosting elsewhere (e.g. Coolify).

The contact form posts to a contact API that does not exist yet: the mail relay that used to run alongside nginx was removed, and its replacement is a shared microservice (also meant for the FincaApp marketing site) still to be built. Until its URL is set in `CONTACT_ENDPOINT` (`src/site/src/scripts/main.ts`), submitting the form shows its error state. The Cap captcha widget does work: it loads from the shared Cap instance.

## Project structure

```txt
/
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD
└── src/
    ├── site/                      # Astro project
    │   ├── src/pages/             # Routes (each file = one page)
    │   ├── public/                # Static assets, served as-is
    │   ├── Dockerfile             # Build + nginx runtime image
    │   └── nginx.conf             # Security headers / routing
    └── docker-compose.yml         # Builds and runs the site
```

See [`specs/contact-form-anti-spam.md`](specs/contact-form-anti-spam.md) for
the full anti-spam design (Cap captcha, honeypot, rate limiting) this compose stack
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

> The contact form shows its error state on submit until `CONTACT_ENDPOINT` is
> set (see above). The captcha widget loads from the shared Cap instance, so it
> needs network access.

## Environment

Only `PUBLIC_CAP_SITE_KEY` is needed, and only for Docker (compose refuses to
start without it). Copy [`src/.env.example`](src/.env.example) to `src/.env`:

```sh
cd src
cp .env.example .env
```

The captcha is not part of this stack: the widget comes from the shared Cap
instance at <https://captcha.constelutions.tech> (see the infra repo, ADR
0004), and `PUBLIC_CAP_SITE_KEY` is this site's key there. `docker compose`
reads `.env` from the directory holding `docker-compose.yml`, so it must live
in `src/`; anywhere else is silently ignored. `.env` is git-ignored — in
production it is set in Coolify's environment UI instead (see
[Deploying to Coolify](#deploying-to-coolify)).

## Running with Docker

`src/site/Dockerfile` builds the Astro site and serves it with a hardened nginx
image (see `src/site/nginx.conf`). `docker compose` builds and runs it.

### Docker Compose (recommended)

```sh
cd src
cp .env.example .env     # then set PUBLIC_CAP_SITE_KEY (this site's key on the shared Cap instance)
docker compose up --build -d
```

The site is up at <http://localhost:80>. The image bakes in a static
production build, so iteration is `docker compose up --build -d`. Stop it with
`docker compose down`. Without `PUBLIC_CAP_SITE_KEY`, Compose refuses to start
and says so:

```
required variable PUBLIC_CAP_SITE_KEY is missing a value: PUBLIC_CAP_SITE_KEY is required
```

### Verifying a running stack

```sh
# marketing-site should report (healthy)
docker compose ps

# Health probe
curl -i http://localhost/healthz

# Static site
curl -i http://localhost/

# Security headers must survive on assets too
curl -D - -o /dev/null http://localhost/_static/<hashed>.js
```

### Plain Docker

```sh
cd src/site
docker build --build-arg PUBLIC_CAP_SITE_KEY=<site key> -t constelutions-site .
docker run --rm -p 80:80 constelutions-site
```

Then open <http://localhost:80>.

## Deploying to Coolify

The stack deploys exactly as `src/docker-compose.yml` describes it, with a
handful of Coolify-specific settings the first time you set the resource up.

### One-time resource setup

1. Create a **Docker Compose** resource in Coolify pointed at this
   repository. Set the **Base Directory** to `src` and the **Docker Compose
   Location** to `docker-compose.yml` (see [Project structure](#project-structure)
   above).
2. In the resource's environment variables, add `PUBLIC_CAP_SITE_KEY` (see
   [`src/.env.example`](src/.env.example)).
3. Assign a **public domain** to `marketing-site`. It deliberately has no
   `ports:` publish in the compose file — only `expose: "80"` — because
   `coolify-proxy` already owns host `0.0.0.0:80`/`:443`; the assigned domain
   is what makes Coolify route traffic to the container over the internal
   network instead. Publishing the container's port straight to the host as
   well would fight `coolify-proxy` for the same port and fail with
   `port is already allocated`.
4. Register `/healthz` as the health check path for `marketing-site`.

### Content Security Policy

The nginx config serves a strict CSP on every HTML response: scripts and styles run only from this origin, the shared Cap instance, or with a per-request nonce. The pages are static, so nginx generates the nonce (`$request_id`), adds it to every `<script>` and `<style>` tag with `sub_filter`, and sets `window.CAP_SCRIPT_NONCE` and `window.CAP_CSS_NONCE` for the widget (it needs them for its injected style and its instrumentation iframe). That is why the Dockerfile does not precompress `.html`. When `CONTACT_ENDPOINT` points to another origin, add it to `connect-src` in `src/site/nginx.conf`, or the browser blocks the request. The GitHub Pages build has no nginx, so it gets no CSP.

### Captcha

The captcha runs on the shared Cap instance, not in this stack. Create a site
key for this site in its dashboard (<https://captcha.constelutions.tech>,
admin key in Bitwarden, instrumentation challenges on) and set it as
`PUBLIC_CAP_SITE_KEY`, then **Redeploy** so it is baked into the build. If the
shared instance is down, the widget cannot load and the form shows its
verification error. Verification of the token belongs to the contact service
(not built yet).
