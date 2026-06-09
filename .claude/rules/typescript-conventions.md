# TypeScript Conventions

## Always use TypeScript, never JavaScript

All source files in this project must be TypeScript (`.ts` or `.tsx`). Never create or commit plain JavaScript source files (`.js`, `.mjs`, `.cjs`) — this applies to scripts, utilities, and any other hand-written code.

Config files that require JavaScript by convention (e.g. `astro.config.mjs`, `tailwind.config.*`) are the only exception.

Astro `<script is:inline>` blocks are also exempt. Astro bypasses Vite for these and outputs them verbatim into the HTML, so TypeScript is not processed. They are intentionally kept as plain JS. If a script does not need to run inline (e.g. it does not need to execute before first paint or before the DOM is ready), move it to a `.ts` file and import it from a regular `<script>` block instead — Astro bundles those through Vite and TypeScript is fully supported.

When converting existing JavaScript:

- Rename the file to `.ts` / `.tsx`
- Add explicit types to function parameters and return values
- Type DOM queries with the appropriate generic (e.g. `querySelector<HTMLElement>`)
- Use `type` or `interface` for any non-trivial object shapes
- Update all import statements to reference the `.ts` extension

## Strict mode is enforced

The project's `tsconfig.json` extends `astro/tsconfigs/strict`. All code must compile without errors under strict mode. Do not use `@ts-ignore` or `@ts-expect-error` to silence genuine type errors.
