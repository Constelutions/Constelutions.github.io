/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cap site key, baked in at build time. Public by nature — see
   *  specs/contact-form-anti-spam.md. */
  readonly PUBLIC_CAP_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
