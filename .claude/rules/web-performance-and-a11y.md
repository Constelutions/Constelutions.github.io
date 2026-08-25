# Web Performance & Accessibility

Rules distilled from Lighthouse/axe audits of this site. Each one states the
audit it answers to, so a future change can be checked against the source.

## Reference

| Audit                    | Rule                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Contrast                 | https://dequeuniversity.com/rules/axe/4.12/color-contrast                              |
| Heading order            | https://dequeuniversity.com/rules/axe/4.12/heading-order                               |
| One main landmark        | https://dequeuniversity.com/rules/axe/4.12/landmark-one-main                            |
| Unused JavaScript        | https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/             |
| Unminified JavaScript    | https://developer.chrome.com/docs/lighthouse/performance/unminified-javascript/         |
| Critical request chains  | https://developer.chrome.com/docs/performance/insights/network-dependency-tree          |
| Forced reflow            | https://developer.chrome.com/docs/performance/insights/forced-reflow                    |

---

## Accessibility

### Every page has exactly one `<main>`

`<main>` is the landmark assistive tech uses to skip the header and nav. It
lives in `Layout.astro` wrapping the `<slot />`. Site-wide furniture — header,
CTA banner, footer — stays outside it. Do not add a second `<main>` in a page
or component.

### Heading levels descend by at most one

Screen-reader users navigate by heading outline, so a jump like `h2 -> h4`
reads as a missing section. Rules:

- One `<h1>` per page, and it is the page's actual title.
- Pick the tag from the document outline, never from the desired font size.
  If a heading needs to look smaller, size it with a class.
- Section headings are `h2`; things nested inside a section are `h3`.

Sizing lives in CSS, so retagging a heading is usually a one-line class-selector
change (e.g. `.foot-col h2`, not `.foot-col h5`).

### Colour: `--accent` fills, `--accent-ink` writes

The accent has two roles that pull its lightness in opposite directions, so it
is two tokens. Getting this wrong is the single easiest way to reintroduce a
contrast failure:

| Token          | Role                                                    | Constraint                          |
| -------------- | ------------------------------------------------------- | ----------------------------------- |
| `--accent`     | fill behind white text — buttons, active pills, selection | white on it must clear 4.5:1        |
| `--accent-ink` | the accent used **as text** on a surface                  | must clear 4.5:1 on `--surface-hi`  |

Never use `--accent` for `color:` or `--accent-ink` for `background:`.

### Every text token clears AA against the darkest surface it can land on

`--faint`, `--muted`, `--accent-ink`, `--accent-2` and `--ok` are all verified
at >= 4.5:1 against `--surface-hi` — the lowest-contrast surface in the set —
so they are safe on any surface. When adding or retuning a token, check it
against `--surface-hi`, not against `--bg`, or it will pass on the page
background and fail inside a card.

Both themes must be checked. Lighthouse audits whichever theme the inline
script stamps before paint (currently dark), so a light-mode regression will
not show up in a default run.

### Theme-dependent colours never get hardcoded

A literal `oklch(0.24 0.03 264 / 0.5)` is a dark-theme value. Dropped into a
hover or chip background, it survives the theme switch and puts a dark wash
under dark `--ink` text in light mode. Use a token that is defined in both
theme blocks (e.g. `--hover-veil`).

**Known gap:** several components still carry hardcoded dark chip/tile
backgrounds (`oklch(0.28 0.06 266 / …)`, `oklch(0.4 0.08 266 / …)`) behind
`--accent-2`/`--faint` text — see `PortfolioProjects`, `PortfolioDemos`,
`PortfolioSummary`, `ServicesGrid`, `WhyUs`, `MisionVision`, `Process`,
`Contact`. These fail contrast in light mode and want tokenizing.

---

## Payload

### Comments in `.astro` templates use `{/* */}`, not `<!-- -->`

Astro emits `<!-- -->` into the response verbatim; `{/* */}` is dropped at
build time. Developer notes in an HTML comment ship to every visitor, and a
comment inside a `.map()` ships once per iteration. This was 2.7–3.2 KB per
page (3–6.5% of the raw HTML) before conversion.

Applies to the template only — `<style>` and `<script>` blocks keep their
native comment syntax.

### Ship only the JS the first render needs

Anything large and conditional belongs behind a dynamic `import()` so Vite
splits it into its own chunk. The translation dictionary is the worked
example: it was 26 KB of the 30 KB entry bundle, and the default Spanish
render needs none of it, because that copy is already in the HTML. It now
loads only on a language swap. Entry bundle: 12.9 KB -> 2.7 KB gzipped.

When splitting, keep the synchronous part synchronous. `apply()` stamps
`data-lang` and persists immediately so the toggle responds on the click, and
only the text swap awaits the chunk — with a rollback if the chunk never
arrives.

### `is:inline` scripts are neither bundled nor minified

Astro passes `is:inline` through verbatim, bypassing Vite. Only code that must
run before first paint earns it:

- theme init (prevents a flash of the wrong theme)
- `history.scrollRestoration = "manual"` (must precede the browser's restore)

Keep those compact and put the explanation in a `{/* */}` comment outside the
tag. Everything else goes in a `.ts` file imported from a normal `<script>`,
where it gets bundled and minified.

---

## Critical request chain

### Request only the font faces that render

`fonts:` in `astro.config.mjs` defaults to `styles: ["normal", "italic"]`,
emitting a second `@font-face` per weight. The site renders no italics, so
those files were dead — and the italic face was the one `<Font preload>`
pointed at for IBM Plex Sans, putting a 44 KB font no glyph resolves to on the
critical path. Always pin `styles: ["normal"]` unless italics actually render.

Audit the result after changing font config: compare the `rel="preload"` hrefs
in the built HTML against the `@font-face` `src` that the cascade actually
selects. When duplicate rules share family/weight/unicode-range, the **last**
one wins — a preload aimed at any earlier one is pure waste.

### Internal links carry the trailing slash

The static build emits `/about/index.html`, so nginx serves it at `/about/`
and 301s `/about` to it. A slash-less internal link costs a redirect round trip
on every navigation. `trailingSlash: "always"` in `astro.config.mjs` makes
`astro dev` enforce the deployed shape.

### A frame cap is not free: scale motion by elapsed time

Capping a `requestAnimationFrame` loop to save CPU is fine, but any motion
written as "add velocity once per frame" is silently also a **speed** cap.
Capping the hero constellation from 60fps to 30fps cut its drift and its
cursor attraction to ~50%, which read as "the stars slowed down and stopped
reacting to the mouse".

Per-frame motion is refresh-rate-dependent to begin with — the same code ran
at ~200% speed on a 120Hz display before any cap.

Scale every position update by real elapsed time instead:

```ts
const step = Math.min(now - lastFrameTime, 100) / (1000 / 60);
a.x += a.vx * step;
```

- `1000 / 60` is whatever rate the velocity constants were tuned at, so
  `step === 1` reproduces the original feel exactly.
- Clamp the elapsed value: `rAF` is paused while the tab is backgrounded, and
  without a clamp every node teleports on return.
- Seed `lastFrameTime` on the first callback rather than from 0, or the first
  frame treats the whole navigation-to-now span as one elapsed frame.

Give the interval comparison a couple of ms of slack. A 30fps target falls
exactly on every 2nd frame of a 60Hz display, so comparing ~33.333 against
~33.333 flips on float error — it painted every 2nd frame sometimes and every
3rd otherwise, averaging 24fps with visible judder.

### Forced reflow: check the attribution before optimising

A forced-reflow entry naming a file the project does not contain
(`bootstrap-autofill-overlay.js` is Bitwarden's autofill content script) is the
browser extension's cost, not the site's. Re-run in an incognito window with
extensions disabled before chasing it. Only the rows attributed to project
bundles are actionable.

---

## nginx

### `add_header` does not merge across levels

A block declaring any `add_header` of its own inherits **none** from its
parent. Adding `Cache-Control` to `location /_static/` silently stripped
`X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy` from every
script, stylesheet and font. Any location that sets a header must restate the
security headers. Verify with `curl -D - -o /dev/null` against both an HTML
path and an asset path.

### `expires` and `add_header Cache-Control` both emit the header

Using them together sends two `Cache-Control` lines. Pick one — spell out
`max-age` in a single `add_header` when `immutable` is wanted.

### `absolute_redirect off` behind a proxy

Coolify terminates TLS and proxies to `:80`, so nginx's own scheme/host/port
are not the client's. Left on, the directory redirect answered `Location:
http://localhost:80/about/`. Relative `Location` values resolve against the
URL the browser actually requested and are correct under any proxy.

### Spell both JavaScript media types in `*_types`

nginx's bundled `mime.types` maps `.js` to `application/javascript` up to
1.25.0 and `text/javascript` from 1.25.1 on, and `gzip_types`/`brotli_types`
match the resolved Content-Type. Listing only one means a future base-image
bump silently stops compressing every script.

### Precompress at build time

The Dockerfile writes `.br` (brotli -11) and `.gz` (gzip -9) beside every text
asset; nginx serves them via `brotli_static`/`gzip_static`. Max ratio, no
request-time CPU. Dynamic `brotli`/`gzip` stay enabled as the fallback, and
note that nginx's default `gzip_comp_level` is **1** — set it explicitly.
