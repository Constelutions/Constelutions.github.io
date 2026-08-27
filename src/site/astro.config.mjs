// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
    // The static build emits /about/index.html, which nginx serves at /about/
    // and 301-redirects /about to. Every internal link therefore has to carry
    // the trailing slash or each navigation pays an extra round trip; stating
    // it here makes `astro dev` enforce the same shape the deployed site has,
    // so a slash-less link fails locally instead of in production.
    trailingSlash: "always",
    build: {
        assets: '_static', // We do this to prevent exposing "astro" in request URL
        // Every page's CSS is small enough (a few KB) that inlining it into the
        // HTML beats the extra render-blocking request + chain hop a linked
        // <link rel="stylesheet"> costs on first paint (flagged by Lighthouse).
        inlineStylesheets: 'always',
    },
    // Self-hosts the brand fonts and auto-generates metric-matched fallback
    // fonts, so the swap from fallback -> webfont causes no reflow (the
    // "text jumps down a moment after load" bug from loading these via the
    // Google Fonts <link> instead).
    //
    // styles: ["normal"] on every family is load-bearing, not tidiness. The
    // Fonts API defaults to ["normal", "italic"], which emits a second
    // @font-face per weight whose only difference is font-style: italic. The
    // site renders no italics at all (global.css even resets `h1 em` back to
    // font-style: normal), so those files were dead weight — and worse, the
    // italic face is the one <Font preload> pointed at for IBM Plex Sans,
    // putting a 44 KB font that no glyph ever resolves to on the critical
    // request path while the normal face queued behind it.
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Space Grotesk",
            cssVariable: "--font-space-grotesk",
            weights: [400, 500, 600, 700],
            styles: ["normal"],
        },
        {
            provider: fontProviders.google(),
            name: "IBM Plex Sans",
            cssVariable: "--font-ibm-plex-sans",
            weights: [400, 500, 600],
            styles: ["normal"],
        },
        {
            provider: fontProviders.google(),
            name: "IBM Plex Mono",
            cssVariable: "--font-ibm-plex-mono",
            weights: [400, 500, 600],
            styles: ["normal"],
            fallbacks: ["monospace"],
        },
    ],
});
