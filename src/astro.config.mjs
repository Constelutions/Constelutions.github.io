// @ts-check
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
    build: {
        assets: '_static' // We do this to prevent exposing "astro" in request URL
    },
    // Self-hosts the brand fonts and auto-generates metric-matched fallback
    // fonts, so the swap from fallback -> webfont causes no reflow (the
    // "text jumps down a moment after load" bug from loading these via the
    // Google Fonts <link> instead).
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Space Grotesk",
            cssVariable: "--font-space-grotesk",
            weights: [400, 500, 600, 700],
        },
        {
            provider: fontProviders.google(),
            name: "IBM Plex Sans",
            cssVariable: "--font-ibm-plex-sans",
            weights: [400, 500, 600],
        },
        {
            provider: fontProviders.google(),
            name: "IBM Plex Mono",
            cssVariable: "--font-ibm-plex-mono",
            weights: [400, 500, 600],
            fallbacks: ["monospace"],
        },
    ],
});
