# Constelutions.github.io

Source for the Constelutions marketing site, built with [Astro](https://astro.build). The site is deployed to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), and can also be built into a self-contained nginx Docker image for hosting elsewhere (e.g. Coolify).

## Project structure

```txt
/
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD
└── src/                           # Astro project
    ├── src/pages/                 # Routes (each file = one page)
    ├── public/                    # Static assets, served as-is
    ├── Dockerfile                  # Build + nginx runtime image
    ├── nginx.conf                  # nginx security headers / routing
    └── docker-compose.yml          # Local Docker Compose setup
```

All app commands below are run from the `src/` directory.

## Local development

Requires Node.js 22+ and [pnpm](https://pnpm.io/).

```sh
cd src
pnpm install
pnpm dev          # http://localhost:4321
```

| Command        | Action                                   |
| :------------- | :--------------------------------------- |
| `pnpm dev`     | Start the local dev server               |
| `pnpm build`   | Build the production site to `src/dist/` |
| `pnpm preview` | Preview the production build locally     |

## Running with Docker

`src/Dockerfile` builds the Astro site and serves it with a hardened nginx image (see `src/nginx.conf` for the security headers and error-page setup). This is the same image used for non-GitHub-Pages deployments.

### Docker Compose (recommended)

```sh
cd src
docker compose up --build -d
```

The site is then available at <http://localhost:8080>. Stop it with `docker compose down`. Since the image bakes in a static production build, re-run `docker compose up --build -d` after making changes.

### Plain Docker

```sh
cd src
docker build -t constelutions-site .
docker run --rm -p 8080:8080 constelutions-site
```

Then open <http://localhost:8080>.
