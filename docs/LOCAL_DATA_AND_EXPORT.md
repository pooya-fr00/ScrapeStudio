# Local data and export boundary

Phase 6 keeps every recipe and history entry in the user's browser. No recipe, history entry, fetched HTML document, or extracted result row is sent to a persistence API.

## IndexedDB stores

The web app opens the versioned `scrapestudio-local` IndexedDB database with two object stores:

- `recipes`: version 1 custom-selector recipes keyed by recipe ID;
- `history`: lightweight extraction metadata keyed by history-entry ID.

The public limits are centralized in `LOCAL_DATA_LIMITS`:

- 100 recipes;
- 100 history entries.

History contains only the final URL, timestamp, extraction type, result count, and an optional recipe reference. It never contains fetched HTML or extracted result values. Old history entries are removed after the cap is exceeded.

## Recipe format

Recipes are versioned from the first persisted format. A recipe contains its ID, name, timestamps, optional target URL, item selector, and bounded custom fields.

Recipe exports use a strict bundle envelope:

```json
{
  "format": "scrapestudio-recipes",
  "version": 1,
  "exportedAt": "2026-07-14T08:00:00.000Z",
  "recipes": []
}
```

Imports are limited to 256 KiB, parsed as untrusted JSON, validated with a strict Zod schema, and capped to the public recipe and field limits. Imported recipes receive new local IDs so importing cannot silently overwrite an existing recipe.

## Result exports

JSON exports are UTF-8, readable, and recursively sort object keys while preserving array and row order.

CSV exports:

- include a UTF-8 BOM for spreadsheet compatibility and Persian text preservation;
- use CRLF rows;
- quote every cell;
- double embedded quote characters;
- preserve embedded newlines inside quoted cells;
- prefix values that begin with optional whitespace followed by `=`, `+`, `-`, or `@` with an apostrophe to mitigate spreadsheet formula injection.

Export filenames contain only sanitized hostname, result type, UTC date, and the requested extension. URL query strings are never placed in filenames.

## Failure behavior

Extraction remains usable if IndexedDB or Clipboard access is unavailable. The UI reports the local failure and offers JSON download when Clipboard copying is not available. Local browser storage may be cleared by the user, browser privacy settings, or device cleanup, so the recipe page provides explicit JSON import and export.
