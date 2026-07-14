# Client Extraction Core

The `@scrapestudio/extraction-core` package implements ScrapeStudio's static HTML analysis and custom selector extraction. It is browser-oriented, dependency-light, and independent from React so extraction behavior can be tested as pure domain logic.

## Security boundary

Remote HTML is parsed with `DOMParser.parseFromString(..., "text/html")` into a detached `Document`. The package never inserts remote nodes or markup into the live application document, never executes returned scripts, and never downloads extracted images.

The serializable `analyzePage()` result contains data only. The detached `Document` is available solely through the lower-level parser boundary for individual extractor calls and is never included in the analysis envelope.

## URL resolution

- The backend-provided final URL is the default base.
- The first valid HTTP(S) `<base href>` may replace the resolution base.
- Relative, root-relative, query, fragment, and protocol-relative references use the WHATWG `URL` implementation.
- Credentialed and unsupported URL schemes are not returned as HTTP resources.
- Link classification compares the resolved origin with the final fetched page origin, not with a potentially external `<base>` origin.

Extracted URLs are data. Later UI phases must render them as text or deliberately controlled links; they must not automatically load remote assets.

## Extractors

### Links

Links include normalized text, absolute URL when valid, relationship tokens, target, title, and one classification: internal, external, mail, telephone, download, fragment, or invalid. Internal/external filters, unique-only mode, and result caps are supported.

### Images

Images resolve `src`, `data-src`, and a best-effort highest `srcset` candidate. Width, height, loading mode, alt text, title, and the selected source attribute are returned. Unsupported sources are ignored and no image request is initiated by the package.

### Headings

H1-H6 elements retain their level and document order. An absolute fragment reference is generated only when an ID exists.

### Metadata

Metadata includes title, description, canonical URL, language, robots, viewport, Open Graph, Twitter card fields, JSON-LD validity and values, favicon candidates, H1 count, and basic document statistics. Script, style, template, SVG, and noscript content is excluded from the text estimate.

### Tables

Tables use stable column names, deterministic fallback names, and bounded practical normalization of `rowspan` and `colspan`. Nested table rows and text are excluded from their parent table. Header inference uses `<thead>`, or the first `<th>` row when no `<thead>` exists. Counts describe detected data while returned rows and columns remain bounded.

### Custom selectors

`inspectCustomRecipe()` validates an item selector and every field independently, returning stable issue codes and live match counts without throwing raw selector errors. `extractCustomRecipe()` produces serializable rows for valid fields even if another field is invalid.

Supported modes are normalized text, inner text, attribute, resolved HTTP(S) `href`, resolved HTTP(S) `src`, sanitized HTML, existence, and match count. Fields may collect multiple values, trim text, or provide a fallback. Sanitized HTML removes active elements, remote-loading attributes, inline styles, and event handlers; the UI still displays the returned markup as text and never injects it into the live document.

Custom extraction processes at most 10 fields and 200 matching items. Multiple-value fields return at most 100 values per item and expose truncation in the result envelope. Callers may lower these limits but cannot raise them.

## Public limits

- 500 links
- 100 images
- 200 rows across a multi-table analysis (and up to 200 for a directly selected table)
- 20 JSON-LD blocks
- 10 custom fields
- 200 custom item matches
- 100 values per multiple-value field and item
- 500 headings
- 50 top-level tables
- 100 returned table columns
- cell spans normalized up to 100 positions

The Master Spec limits are centralized in `@scrapestudio/shared`. Callers may lower limits for an operation but cannot raise them through the public options.

## Fixture strategy

Original HTML fixtures cover products, tables, articles, metadata, malformed markup, relative links, and repeated cards. Core tests do not depend on live websites. Malformed HTML is intentionally excluded from automated formatting so its parser-recovery behavior remains meaningful.

## Known limitations

- Table header inference is deterministic but cannot infer every visually implied header arrangement.
- `srcset` selection is best effort and does not reproduce the browser's viewport-dependent layout algorithm.
- Word count is a whitespace-based estimate, not linguistic tokenization or AI summarization.
- The package analyzes static HTML only; content rendered later by page JavaScript is unavailable.
