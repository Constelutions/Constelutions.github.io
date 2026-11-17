/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cap site key, baked in at build time. Public by nature — see
   *  specs/contact-form-anti-spam.md. */
  readonly PUBLIC_CAP_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** The `<cap-widget>` element, defined by the script the shared Cap instance
 *  serves (see scripts/capWidget.ts). Only what this site calls is declared. */
interface CapWidgetElement extends HTMLElement {
  reset(): void;
}

interface HTMLElementTagNameMap {
  "cap-widget": CapWidgetElement;
}

interface Window {
  CAP_CUSTOM_WASM_URL?: string;
  CAP_CUSTOM_HASHWX_URL?: string;
}
