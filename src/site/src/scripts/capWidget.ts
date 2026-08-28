/** Loads the Cap widget chunk. CAP_CUSTOM_WASM_URL must be set before the
 *  import: without it the widget fetches its WASM from jsdelivr at runtime,
 *  reintroducing the third-party dependency this design removes. The path
 *  is Cap Standalone's own asset server, proxied same-origin by nginx. */
export async function loadCapWidget(): Promise<void> {
  window.CAP_CUSTOM_WASM_URL = "/cap/assets/cap_wasm_bg.wasm";
  await import("cap-widget");
}
