# Language Conventions

## Code and Data: English only

All identifiers, keys, IDs, and values that live in code or data files must be in English:

- Variable, function, class, and type names
- HTML `id` and `class` attributes used as anchors or selectors (e.g. `#contact`, not `#contacto`)
- URL path segments and hash fragments (e.g. `/services#consulting`, not `/services#consultoria`)
- JSON/data file keys and ID fields (e.g. `"id": "development"`, not `"id": "desarrollo"`)
- i18n translation keys (e.g. `contact_title`, `svc1_t`)
- File and directory names
- Git branch names, commit messages, PR titles

## UI Display: Spanish-first with i18n support

Anything visible to an end user must be Spanish by default, with English translation support via the i18n system:

- All hardcoded display text in `.astro`, `.html`, and template files must be in Spanish
- Every piece of display text must have a corresponding `data-i18n` attribute pointing to a translation key
- Translation keys must provide both `es` (Spanish, default) and `en` (English) values
- The Spanish value is the source of truth; English is the translation

## Summary

| Context                           | Language                                  |
| --------------------------------- | ----------------------------------------- |
| Code identifiers, IDs, keys, URLs | English                                   |
| User-facing text, labels, copy    | Spanish (with `data-i18n` for EN support) |
