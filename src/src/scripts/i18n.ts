/* ============================================================
   CONSTELUTIONS — localization (ES default · EN)
   HTML literal text is Spanish; this swaps to English on toggle.
   ============================================================

   The translation table lives in ./i18nDict.ts and is pulled in with a
   dynamic import, so it ships as its own chunk instead of riding along in
   the entry bundle. The default render needs none of it — the Spanish copy
   is already in the HTML — so it is fetched only when a swap is actually
   requested: on a toggle click, or on load when a previous visit left
   "en" in storage.
   ============================================================ */
import type { Lang, Translation } from "./i18nDict";

(function () {
  "use strict";

  type Dict = Record<string, Translation>;

  const STORAGE_KEY = "cl_lang";
  const DEFAULT_LANG: Lang = "es";

  /* ---------- dictionary chunk (fetched at most once) ---------- */
  let dictPromise: Promise<Dict> | null = null;
  function loadDict(): Promise<Dict> {
    dictPromise ??= import("./i18nDict").then(function (m) {
      return m.DICT;
    });
    return dictPromise;
  }

  /* ---------- storage ---------- */
  function readLang(): Lang {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  function writeLang(lang: Lang): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked for this origin — the swap still applies for the
         lifetime of the page, it just will not be remembered */
    }
  }

  /* ---------- DOM ---------- */
  // Stamped separately from the text swap so the toggle pill (which is styled
  // off html[data-lang]) and the document language both update on the click,
  // rather than a chunk-fetch later.
  function markLang(lang: Lang): void {
    const html = document.documentElement;
    html.setAttribute("data-lang", lang);
    html.setAttribute("lang", lang);
  }

  function paint(dict: Dict, lang: Lang): void {
    const get = function (key: string): string | null {
      return dict[key]?.[lang] ?? null;
    };
    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(function (el) {
      const v = get(el.getAttribute("data-i18n") ?? "");
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach(function (el) {
      const v = get(el.getAttribute("data-i18n-html") ?? "");
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll<HTMLElement>("[data-i18n-attr]").forEach(function (el) {
      (el.getAttribute("data-i18n-attr") ?? "").split(";").forEach(function (pair) {
        const p = pair.split(":");
        if (p.length < 2) return;
        const v = get(p[1].trim());
        if (v != null) el.setAttribute(p[0].trim(), v);
      });
    });
  }

  function apply(lang: Lang): Promise<void> {
    const previous = (document.documentElement.getAttribute("data-lang") as Lang | null) ?? DEFAULT_LANG;
    markLang(lang);
    writeLang(lang);
    return loadDict().then(
      function (dict) {
        paint(dict, lang);
      },
      function () {
        // The chunk did not arrive, so the text is still in `previous`.
        // Roll the attributes back rather than leave the toggle claiming a
        // language the page is not actually showing.
        dictPromise = null;
        markLang(previous);
        writeLang(previous);
      },
    );
  }

  /* ---------- wiring ---------- */
  document.addEventListener("click", function (e: MouseEvent) {
    const b = (e.target as Element | null)?.closest<HTMLElement>("[data-set-lang]");
    if (!b) return;
    e.preventDefault();
    const lang = b.getAttribute("data-set-lang");
    if (lang === "es" || lang === "en") void apply(lang);
  });

  const initial = readLang();
  if (initial === DEFAULT_LANG) {
    // Nothing to fetch: the HTML is already Spanish.
    markLang(DEFAULT_LANG);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      void apply(initial);
    });
  } else {
    void apply(initial);
  }

  (window as Window & { CLI18N?: { apply: typeof apply; getLang: () => Lang } }).CLI18N = {
    apply,
    getLang: readLang,
  };
})();
