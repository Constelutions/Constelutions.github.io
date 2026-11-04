# ---- Build stage: AOT-compile against musl ----
#
# `dart compile exe` emits a *dynamically* linked executable bound to the libc
# of the SDK that produced it, so the official Dart image (Debian/glibc) cannot
# build something that runs on Alpine: musl ships no ld-linux-x86-64.so.2 and
# the process would fail to exec at all. Verified locally with the glibc SDK —
# `ldd` on the output lists libc.so.6 and /lib64/ld-linux-x86-64.so.2.
#
# ghcr.io/dart-musl/dart is the community musl build of the same SDK version
# and is used ONLY here. Local development stays on the ordinary glibc SDK and
# pubspec.yaml is untouched, so `dart run`, `dart test` and `dart analyze` work
# normally on a developer machine.
FROM ghcr.io/dart-musl/dart:3.13.7@sha256:c7c35a148d85c173747d3302109d82828af5b7c4b6f1b39976b30f75de9362d7 AS build
WORKDIR /app

# Dependencies resolve before the sources are copied so that editing a .dart
# file does not invalidate the pub cache layer.
COPY pubspec.yaml pubspec.lock ./
RUN dart pub get

COPY . .
RUN dart pub get --offline \
    && dart compile exe bin/server.dart -o bin/server

# ---- Runtime stage ----
# Alpine matches the musl the binary was linked against, and unlike `scratch`
# it supplies a real user account and a shell — worth ~8 MB when the only way
# to inspect a misbehaving container on Coolify is `docker exec`.
FROM alpine:3.24@sha256:be2656061b536c1883c4034790e21d0a09c5aaaf51968b89368a3c0371ea2c9a

# ca-certificates is load-bearing: without root certs the outbound TLS
# handshake to api.resend.com fails, and that fault would first appear on a
# real visitor's submission rather than at build or boot time.
RUN apk add --no-cache ca-certificates \
    && adduser -D -H -u 10001 mailer

COPY --from=build /app/bin/server /app/bin/server

# The service reads no files and writes only to stdout, so it needs no home
# directory and no write access anywhere.
USER mailer

EXPOSE 8080
ENTRYPOINT ["/app/bin/server"]
