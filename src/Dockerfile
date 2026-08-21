# ---- Build stage: compile the Astro static site ----
FROM node:22-alpine AS build
WORKDIR /app
ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY . .
RUN pnpm build

# Precompress every text asset so nginx's brotli_static/gzip_static can serve
# max-quality bytes (brotli -11, gzip -9) without burning request-time CPU on
# them. Skipped for woff2/png/ico, which are already compressed formats, and
# for anything under 512 B, where the framing overhead cancels out the gain.
RUN apk add --no-cache brotli \
    && find dist -type f -size +512c \
      \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' \
         -o -name '*.svg' -o -name '*.json' -o -name '*.xml' -o -name '*.txt' \) \
      -print0 \
    | xargs -0 -r -I{} sh -c 'gzip -9 -c "{}" > "{}.gz" && brotli -Z -c "{}" > "{}.br"'

# ---- Runtime stage: nginx with the Server header fully stripped ----
# Built from plain alpine (not the nginx:*-alpine image) so that "nginx" and
# "nginx-mod-http-headers-more" are installed from the same apk repo snapshot
# — the module is an ABI-sensitive binary .so, and the nginx:*-alpine image's
# nginx binary is built upstream by nginx, Inc., not by Alpine, so its version
# rarely matches whatever build Alpine's own module package was compiled
# against (this mismatch fails at startup with a version-check error).
FROM alpine:3.21

# nginx-mod-http-headers-more lets us clear the "Server" response header
# entirely (server_tokens off only hides the version number, not the
# "nginx" string itself) — see nginx.conf for where it's used.
# nginx-mod-http-brotli supplies both the brotli filter and brotli_static;
# gzip_static is already compiled into Alpine's nginx.
RUN apk add --no-cache nginx nginx-mod-http-headers-more nginx-mod-http-brotli

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
