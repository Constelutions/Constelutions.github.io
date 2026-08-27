/**
 * Prepares an SVG file's source for inlining into the page with `set:html`.
 *
 * The mark files are documented in place — how the lockup was generated, why
 * its optical spacing differs from the header's, that the path data must be
 * regenerated rather than hand-edited. That documentation belongs in the .svg,
 * but `?raw` hands back the file byte for byte, so without stripping it the
 * comments are inlined into the markup and shipped to every visitor on every
 * page (848 B per page for logo-long.svg alone).
 *
 * Runs at build time — the site is statically rendered, so this costs nothing
 * at runtime.
 */
export function inlineSvg(markup: string): string {
  return markup.replace(/<!--[\s\S]*?-->/g, "").trim();
}
