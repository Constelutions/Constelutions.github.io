import { CAP_ORIGIN } from "../utils/cap";

/** Loads the widget from the shared Cap instance, which serves it together
 *  with the WASM it solves challenges with, so the widget and the server
 *  always run matching versions. The WASM URLs must be set before the script
 *  runs: without them the widget fetches its WASM from jsdelivr at runtime. */
export function loadCapWidget(): void {
  window.CAP_CUSTOM_WASM_URL = `${CAP_ORIGIN}/assets/cap_wasm_bg.wasm`;
  window.CAP_CUSTOM_HASHWX_URL = `${CAP_ORIGIN}/assets/hashwx.wasm`;

  const script = document.createElement("script");
  script.src = `${CAP_ORIGIN}/assets/widget.js`;
  script.async = true;
  // Without a widget the form only shows its "complete the verification"
  // message, so leave a trace of the real cause for whoever debugs it.
  script.addEventListener("error", () => {
    console.error(`Cap widget failed to load from ${CAP_ORIGIN}`);
  });
  document.head.append(script);
}
