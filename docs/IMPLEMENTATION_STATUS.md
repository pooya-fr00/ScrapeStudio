# ScrapeStudio Implementation Status

Last updated: 2026-07-14

## Scope guardrails

- Current free public release only.
- No accounts, login, payments, subscriptions, premium plans, or commercial billing.
- No private-page scraping, credentialed scraping, anti-bot bypass, or browser automation.
- `poya.txt` is ignored and rejected by CI if tracked.

## Phase status

| Phase                                | Status                          | Exit gate                                                                  |
| ------------------------------------ | ------------------------------- | -------------------------------------------------------------------------- |
| Phase 0 — Repository foundation      | Complete                        | Install, format, lint, typecheck, tests, and build pass                    |
| Phase 1 — Design foundation and i18n | Complete                        | Localized routes, RTL/LTR, theme, responsive navigation                    |
| Phase 2 — Safe fetch backend         | Complete                        | SSRF, redirect, timeout, size, content type, and rate-limit tests pass     |
| Phase 3 — Client extraction core     | Complete                        | Fixture tests pass; malformed HTML is safe                                 |
| Phase 4 — Scrape workspace           | Complete                        | Built-in end-to-end demo works                                             |
| Phase 5 — Custom selector builder    | Complete                        | Multi-field recipe can be created without code                             |
| Phase 6 — Export, history, recipes   | Complete                        | Local data survives reload without an account                              |
| Phase 7 — Code generator             | Complete                        | Generated Python and JavaScript are syntactically sane                     |
| Phase 8 — Smart repeated structures  | Complete                        | Bounded worker does not block UI                                           |
| Phase 9 — Playground and docs        | Complete                        | Reviewer can test without an external site                                 |
| Phase 10 — Hardening                 | Complete                        | Accessibility, security, performance, localization, and release gates pass |
| Phase 11 — Deployment                | Ready for owner-approved deploy | Local gates pass; live URL awaits approved external deployment             |

## Current implementation

- pnpm workspace with `apps/web`, `apps/api`, and `packages/shared`.
- Strict shared TypeScript configuration.
- ESLint flat configuration and Prettier formatting policy.
- Vitest unit and integration projects.
- React/Vite web entry point and Hono API health endpoint.
- GitHub Actions quality gate.
- Tracked-private-roadmap guard.
- Locale-prefixed React Router application shell for English and Persian.
- Bundled i18next resources with compile-time shape and runtime key-parity checks.
- Correct document `lang`/`dir`, localized metadata, and route-preserving language switching.
- Light, dark, and system themes persisted locally.
- Mobile-first design tokens, shared UI components, desktop navigation, and an accessible opaque full-screen mobile menu with focus trapping and background isolation.
- Purpose-built mobile landing and workspace layouts, horizontally scrollable extraction categories, full-width touch actions, and record-card results down to a 320 px RTL viewport.
- Balanced bilingual page introductions that pair concise copy with real product assurances instead of leaving the opposite side visually empty.
- A richer responsive footer with product navigation, responsible-use context, creator attribution, and the owner's verified public GitHub profile.
- Self-hosted Vazirmatn variable typography for Persian, with language-specific heading metrics and natural RTL copy instead of reused Latin typography rules.
- Restrained ambient, hover, and scroll-reveal motion with an explicit reduced-motion fallback and route-level scroll restoration.
- Versioned Hono Worker endpoint with a strict Zod request schema and stable success/error envelopes.
- Public URL normalization and explicit rejection of credentials, local/internal hosts, metadata targets, non-public IP literals, unsupported protocols, and nonstandard ports.
- Manual redirect validation, one overall fetch deadline, streamed 1 MiB size enforcement, and HTML-only content-type handling.
- Privacy-conscious anonymous identity hashing and SQLite-backed Durable Object quotas with short-window, UTC-day, and stale-state cleanup behavior.
- Exact-origin CORS, API security headers, privacy-safe structured logs, and fail-closed operational safety switches.
- Production Worker configuration with public-network fetch enforcement and no fetched-HTML server persistence.
- Framework-independent browser extraction package using a detached `DOMParser` document and serializable result envelopes.
- Quick extractors for classified links, images, headings, metadata, JSON-LD, favicons, document statistics, and normalized tables.
- Explicit URL resolution against the final fetched URL and valid page `<base>` declarations.
- Central free-release extraction limits shared by the API contract and client extraction core, with lower per-operation overrides.
- Original fixture suite covering products, tables, articles, metadata, malformed markup, relative links, and repeated cards.
- Localized `/en/scrape` and `/fa/scrape` workspace routes with client-side URL validation, fetch progress, analysis progress, stable localized errors, and retry guidance.
- Strict Zod validation of API success and error envelopes plus a locally persisted anonymous client identifier for quota continuity.
- Built-in no-network demo that exercises the complete detached parsing and quick-extract workflow deterministically.
- Detected-category cards and structured or JSON previews for tables, links, images, headings, and metadata.
- Responsive desktop tables and purpose-built mobile result cards, with Persian RTL support and accessible live status regions.
- Remote image results rendered as text-only records so previewing a result cannot trigger third-party image downloads.
- Quick/custom extraction mode switcher that preserves an in-progress custom recipe draft while the fetched page remains active.
- Multi-field selector builder with item selector, add/remove fields, eight extraction modes, optional attribute, multiple values, trimming, fallback values, live match counts, and localized validation.
- Framework-independent custom recipe inspection and extraction with per-field failure isolation and stable issue codes.
- Central limits of 10 custom fields, 200 matched items, and 100 multiple values per field and item, including explicit truncation feedback.
- Responsive custom result tables and mobile cards, plus a deterministic three-field recipe for the bundled demo.
- Sanitized HTML mode that removes active and remote-loading markup and is previewed only as text.
- Stable-key readable JSON export, Clipboard copy, and UTF-8 CSV download for quick and custom results.
- Spreadsheet formula-injection mitigation, full CSV quote/newline handling, Persian text preservation, and sanitized query-free filenames.
- Native IndexedDB persistence with versioned recipe and history stores, centralized limits of 100 recipes and 100 lightweight history entries, and no persisted fetched HTML or result rows.
- Local recipe create/update, rename, duplicate, delete, reopen, strict JSON import, individual/all export, and explicit privacy messaging.
- Localized `/en/history` and `/fa/history` routes with quick/custom activity metadata and explicit clear-history confirmation.
- Deterministic locale switching that loads the target translation before route navigation, eliminating the refresh requirement.
- Custom accessible theme picker with styled light, dark, and system choices, RTL/LTR support, selected-state feedback, outside dismissal, and full keyboard navigation.
- Framework-independent template code generator for Python with Requests and BeautifulSoup and JavaScript/Node with built-in fetch and LinkeDOM.
- Live generation from the active custom recipe with localized target switching, code preview, Clipboard copy, and `.py` or `.js` download.
- Safe generated-source escaping, credentialed URL rejection, likely-secret query redaction, explicit static-page limitations, timeouts, user-agent examples, and bounded result loops.
- Deterministic repeated-structure heuristic using sibling shape, shared classes, subtree similarity, meaningful content, link/image signals, and navigation-context penalties.
- Compact structural snapshots capped at 2,500 nodes, 80 children per node, depth 12, five candidates, and four suggested fields.
- Lazy-loaded smart-detection UI and dedicated module Web Worker with a 750 ms timeout, cancellation, termination, and bounded main-thread fallback when Worker creation fails.
- Localized candidate cards with heuristic confidence, explainable signals, suggested selectors and fields, and one-click conversion into a fully editable custom recipe.
- API-propagated `SMART_DETECTION_ENABLED` operational safety switch for remotely fetched pages; the deterministic no-network demo remains available.
- Locale-ready scroll reveals that make direct Persian and English route loads visible without requiring a refresh.
- Original bilingual playground routes for products, a meaningful schedule table, and a long-form article, with dedicated responsive presentation for each content shape.
- A 12-item fictional product catalog, an 8-row community schedule, and an article containing headings, paragraphs, links, image metadata, page metadata, and JSON-LD.
- One-click no-network analysis from every playground page through the real scrape workspace, without consuming API quota or contacting the reserved synthetic demo host.
- Public bilingual documentation for methodology, security, limitations, privacy, responsible use, and project background, plus focused guides for table, link, image, metadata, and custom-selector extraction.
- Localized canonical, Open Graph, and alternate-language metadata on public documentation and playground routes.
- Route-level lazy loading for workspace, local-data, playground, and documentation surfaces so the expanded public content does not inflate the main production bundle unnecessarily.
- Maintainer-facing `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, and playground/public-documentation notes that accurately describe the current free release without implying a live deployment.
- Playwright critical-flow coverage for locale/direction switching, mobile focus management, no-network table analysis, custom extraction, JSON download, local recipe save/reopen, history creation, and history clearing.
- Automated axe-core WCAG 2.1 A/AA scans across English and Persian landing, documentation, playground, populated workspace, and open mobile-dialog states.
- SPA route focus management, keyboard-safe dialog dismissal, and deterministic focus restoration for every mobile-menu close path.
- Cloudflare Pages security headers with a restrictive CSP, framing denial, no-sniff, no-referrer, permissions restrictions, opener isolation, and HSTS, plus an automated source guard against CSP-incompatible inline styles or raw React HTML injection.
- Enforced uncompressed production budgets of 350 KiB for the largest JavaScript asset, 700 KiB for all JavaScript, and 100 KiB for CSS, including required `_headers` and `robots.txt` release assets.
- CI coverage for private-file rejection, CSP compatibility, local documentation links, formatting, lint, typecheck, unit/integration/E2E/accessibility tests, dependency audit, production build, and bundle budgets.
- Public-content completeness tests for every English/Persian document and tool guide, in addition to existing translation-key parity and nonblank-value tests.
- A documented hardening baseline and release checklist separating locally verifiable gates from owner-approved production-only Phase 11 work.
- Fail-closed committed Worker configuration plus an ignored, exact-origin production-config generator that never writes `IP_HASH_SALT`.
- Cloudflare Pages configuration, SPA deep-link redirects, production sitemap/robots generation, and exact API-origin CSP finalization.
- Manual-only protected GitHub Actions deployment that repeats the full gate, deploys API before web, and requires explicit `DEPLOY_PRODUCTION` confirmation.
- Deployment guards for origins, resource names, required secret presence, tracked environment files, source maps, private release files, and broad production CSP.
- Live smoke coverage for localized routes, sitemap/robots, security headers, API health, allowed and denied CORS, and one owner-approved public static fetch.
- A production runbook covering protected environment configuration, scoped secrets, current Cloudflare free-tier limits, rollback, emergency switches, and release evidence.

## Material decisions

| Date       | Decision                                              | Reason                                                                                                                                               |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-14 | Use Node.js 24 and pnpm 11                            | Matches the current local toolchain and current CI action runtime generation.                                                                        |
| 2026-07-14 | Pin TypeScript 6.0.3 instead of 7.0.2                 | Current stable `typescript-eslint` supports TypeScript below 6.1.                                                                                    |
| 2026-07-14 | Use Vitest `projects` configuration                   | The earlier workspace configuration is deprecated.                                                                                                   |
| 2026-07-14 | Require a 24-hour minimum dependency release age      | Reduces exposure to newly published supply-chain compromises.                                                                                        |
| 2026-07-14 | Keep the Phase 0 web UI intentionally minimal         | Full localized UX begins in Phase 1; no temporary unlocalized product copy is introduced.                                                            |
| 2026-07-14 | Use explicit `/en` and `/fa` route prefixes           | Produces stable, shareable localized URLs without surprising redirects after selection.                                                              |
| 2026-07-14 | Bundle i18next resources in the web app               | Avoids a runtime translation network dependency and enables deterministic parity tests.                                                              |
| 2026-07-14 | Use Tailwind CSS through its first-party Vite plugin  | Matches the current official integration and keeps the design foundation build-time only.                                                            |
| 2026-07-14 | Implement the theme provider internally               | The three required modes need little code and do not justify another runtime dependency.                                                             |
| 2026-07-14 | Keep external fetching disabled in Phase 1            | The public UI must not expose URL fetching before the Phase 2 security controls pass.                                                                |
| 2026-07-14 | Keep extraction out of the Worker                     | The free Worker performs only security-sensitive network access; DOM parsing remains a later client-side concern.                                    |
| 2026-07-14 | Use `ipaddr.js` for address classification            | A mature parser provides explicit range classification for IPv4, IPv6, mapped, and transition forms.                                                 |
| 2026-07-14 | Use one SQLite Durable Object per hashed identity     | Object isolation plus a pure fixed-window policy keeps quota updates small, testable, and free of raw IP persistence.                                |
| 2026-07-14 | Require a deployment-specific identity salt           | Missing or weak configuration fails closed instead of creating predictable persisted identifiers.                                                    |
| 2026-07-14 | Enable `global_fetch_strictly_public`                 | Cloudflare's public fetch path complements application checks for literal addresses and redirects.                                                   |
| 2026-07-14 | Isolate extraction in a framework-independent package | Pure domain functions keep React out of parsing logic and make fixture behavior deterministic and reusable.                                          |
| 2026-07-14 | Return serializable collection envelopes              | Total, returned, and truncation counts let later responsive UI explain limits without retaining remote DOM nodes.                                    |
| 2026-07-14 | Resolve against final URL plus valid `<base>`         | This follows browser URL semantics while preserving the fetched page origin for internal/external classification.                                    |
| 2026-07-14 | Bound table spans, rows, columns, and table count     | Practical normalization remains useful without allowing pathological markup to create unbounded client work.                                         |
| 2026-07-14 | Use original local HTML fixtures                      | Core extraction tests remain deterministic, legally clean, and independent from live third-party websites.                                           |
| 2026-07-14 | Validate API envelopes again in the browser           | The network boundary remains untrusted even though the Worker already owns a typed response contract.                                                |
| 2026-07-14 | Ship a bundled original workspace demo                | Reviewers can verify the end-to-end workflow without depending on an external website or spending fetch quota.                                       |
| 2026-07-14 | Render remote image metadata without image elements   | Result inspection must not disclose user activity to third-party image hosts or trigger unbounded media downloads.                                   |
| 2026-07-14 | Use tables on desktop and record cards on mobile      | Mobile users receive a readable first-class result layout instead of a compressed wide table.                                                        |
| 2026-07-14 | Keep custom selector logic in extraction core         | Selector validation and extraction remain pure, reusable, fixture-tested domain behavior rather than React logic.                                    |
| 2026-07-14 | Validate every custom field independently             | One malformed selector is reported locally and cannot crash or hide otherwise valid fields.                                                          |
| 2026-07-14 | Support sanitized HTML as text-only output            | The required advanced mode stays useful without creating a remote markup injection or media-loading path.                                            |
| 2026-07-14 | Cap multiple values at 100 per field and item         | This bounds result growth beyond the required item and field limits while exposing truncation to the user.                                           |
| 2026-07-14 | Defer persistence of recipe drafts to Phase 6         | Phase 5 creates and runs a recipe; IndexedDB storage, import, and export remain in their specified phase.                                            |
| 2026-07-14 | Self-host Vazirmatn for the Persian interface         | A dedicated OFL-licensed variable font makes Persian readable without adding a runtime font request or changing technical text.                      |
| 2026-07-14 | Keep interface motion restrained and optional         | Short reveals and micro-interactions add hierarchy and feedback while `prefers-reduced-motion` keeps the experience accessible.                      |
| 2026-07-14 | Use a small native IndexedDB abstraction              | The required two local stores do not justify another runtime dependency, and an injected memory implementation keeps behavior easy to test.          |
| 2026-07-14 | Import recipes with new local identifiers             | A valid imported bundle cannot silently overwrite an existing recipe that happens to share an ID.                                                    |
| 2026-07-14 | Prefix spreadsheet-formula CSV cells with apostrophes | Values beginning with optional whitespace and `=`, `+`, `-`, or `@` remain visible while avoiding formula execution in common spreadsheet tools.     |
| 2026-07-14 | Generate code in a framework-independent package      | Deterministic templates and syntax checks remain reusable, fixture-driven, and isolated from React presentation state.                               |
| 2026-07-14 | Use LinkeDOM only in the generated Node starter       | Its documented `parseHTML` API supplies a detached DOM without adding a runtime parser dependency to ScrapeStudio itself.                            |
| 2026-07-14 | Redact likely-secret URL query values                 | Active page URLs can contain sensitive parameters; generated source must not silently copy those values into files or the Clipboard.                 |
| 2026-07-14 | Replace the native theme select with a custom listbox | Native option popups cannot be styled reliably and produced unreadable, visually inconsistent Persian dark-theme output.                             |
| 2026-07-14 | Send a compact DOM snapshot to the detection Worker   | Web Workers lack the required live DOM parser surface; a bounded serializable snapshot keeps remote HTML detached and transfer costs predictable.    |
| 2026-07-14 | Treat detection confidence as a relative score        | The heuristic is explainable but not statistically calibrated, so UI and documentation never present it as AI or guaranteed probability.             |
| 2026-07-14 | Skip synchronous fallback after a Worker timeout      | A timeout is a hard performance boundary; quick and custom extraction remain responsive instead of repeating work on the main thread.                |
| 2026-07-14 | Lazy-load detector UI, runtime, and Worker            | Smart analysis starts only after a result and does not push the main production chunk past its warning budget.                                       |
| 2026-07-14 | Use an opaque full-screen menu on mobile              | Navigation remains legible above page content, owns the small-screen interaction space, and can isolate background content accessibly.               |
| 2026-07-14 | Publish only verified creator links                   | The owner's GitHub profile is confirmed; a personal website or additional social profiles will not be guessed and require exact owner-provided URLs. |
| 2026-07-14 | Generate visible and analyzed demos from one catalog  | A single typed, localized source prevents the public sample page and detached extraction fixture from drifting apart.                                |
| 2026-07-14 | Use a reserved synthetic host for demo result URLs    | Demo links behave like realistic absolute URLs while the workspace explicitly avoids every network request for bundled playground content.           |
| 2026-07-14 | Lazy-load product and documentation route groups      | Phase 9 adds substantial public copy and UI; route boundaries keep the initial application chunk below the prior Vite warning threshold.             |
| 2026-07-14 | Defer absolute production origin artifacts            | Canonical metadata uses the current origin locally; sitemap and final public-origin verification require the owner-approved Phase 11 destination.    |
| 2026-07-14 | Use Playwright plus axe for the release E2E gate      | The required real-browser flows and common WCAG violations are verified together while manual accessibility review remains explicitly documented.    |
| 2026-07-14 | Keep the CI browser gate on Chromium                  | One current engine covers the specified critical E2E flows without multiplying public free-tier CI cost; responsive QA separately covers key widths. |
| 2026-07-14 | Reject inline style mutation in production source     | The deployed CSP must be executable in practice, so theme, scrolling, mobile overflow, and demo color behavior use data attributes and CSS classes.  |
| 2026-07-14 | Enforce conservative uncompressed bundle budgets      | Stable numeric gates catch major dependency or code-splitting regressions before gzip can hide their parse and execution cost.                       |
| 2026-07-14 | Gate only high/critical dependency advisories in CI   | Current audits stay actionable while all findings are still reviewed; safe patch updates are applied and the TypeScript compatibility pin stays.     |
| 2026-07-14 | Use Pages Direct Upload plus a Worker API             | GitHub builds and verifies one immutable web artifact while the security-sensitive fetch boundary remains an independently deployable Worker.        |
| 2026-07-14 | Keep committed deployment settings fail-closed        | An accidental dry run or deploy cannot enable public fetching or broad CORS without generating a config from an explicitly validated HTTPS origin.   |
| 2026-07-14 | Make production deployment manual and protected       | `main`, a GitHub `production` environment, owner-approved values, and an explicit confirmation phrase guard every external upload.                   |
| 2026-07-14 | Do not claim Phase 11 complete before a live smoke    | Local dry runs prove artifacts and policy, but they cannot satisfy the Master Spec requirement that the actual production URL works.                 |

## Verification history

### Phase 0 — 2026-07-14

- `pnpm install`: passed and produced a shared lockfile.
- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for the API, web app, shared package, tests, and tool configs.
- `pnpm test:unit`: passed with 1 test file and 1 test.
- `pnpm test:integration`: passed with 1 test file and 1 test.
- `pnpm test`: passed with both projects, 2 test files, and 2 tests.
- `pnpm build`: passed for the API, web app, and shared package.
- Web production output: 190.60 kB JavaScript before gzip, 60.05 kB after gzip.

### Phase 1 — 2026-07-14

- `pnpm check:private-files`: passed.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling.
- `pnpm test:unit`: 5 test files and 17 tests passed.
- `pnpm test:integration`: 1 test file and 1 test passed.
- `pnpm test`: 6 test files and 18 tests passed.
- `pnpm build`: passed for the API, web app, and shared package.
- Web production output: 303.37 kB JavaScript before gzip, 97.23 kB after gzip; CSS is 17.25 kB before gzip and 4.66 kB after gzip.
- Browser QA verified English and Persian copy, LTR/RTL document state, route-preserving locale switching, light/system themes, zero horizontal overflow at the inspected viewport, and no console warnings or errors.

### Phase 2 — 2026-07-14

- `pnpm install`: passed with an explicit build-script allowlist for `esbuild`, `sharp`, and `workerd`.
- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects, Worker bindings, tests, and tooling.
- `pnpm test:unit`: 10 test files and 81 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed.
- `pnpm test`: 12 test files and 93 tests passed.
- `pnpm build`: passed for the API, web app, and shared package, including a Wrangler production dry run.
- Local Worker smoke test: health and a public static HTML fetch passed through the real Workerd runtime and SQLite Durable Object binding.
- Local quota smoke test: the first five fetches were accepted and the sixth returned HTTP 429 without another upstream fetch.

### Phase 3 — 2026-07-14

- `pnpm install`: passed with all five workspace projects resolved from the shared lockfile.
- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed; intentionally malformed fixture markup is explicitly excluded from formatting.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for the API, web app, shared package, extraction core, tests, and tooling.
- Extraction fixture suite: 8 test files and 29 tests passed.
- `pnpm test:unit`: 18 test files and 110 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed.
- `pnpm test`: 20 test files and 122 tests passed.
- `pnpm build`: passed for the API, web app, shared package, and extraction core, including declarations and the Wrangler production dry run.
- Malformed HTML smoke coverage completed all extractors and produced a serializable result without throwing.

### Phase 4 — 2026-07-14

- `pnpm install`: passed for all five workspace projects.
- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for the API, web app, shared package, extraction core, tests, and tooling.
- `pnpm test:unit`: 21 test files and 123 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed.
- `pnpm test`: 23 test files and 135 tests passed.
- `pnpm build`: passed for all workspace projects, including declarations and the Wrangler production dry run.
- Web production output: 417.69 kB JavaScript before gzip, 129.14 kB after gzip; CSS is 28.56 kB before gzip and 6.69 kB after gzip.
- Browser QA verified the English desktop workflow and Persian 390 px RTL workflow, desktop tables, mobile cards, category switching, zero horizontal overflow, no remote preview images, and no console warnings or errors.

### Phase 5 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling.
- `pnpm test:unit`: 23 test files and 132 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed.
- `pnpm test`: 25 test files and 144 tests passed.
- Custom selector core coverage includes all eight extraction modes, URL resolution, fallbacks, multiple values, sanitized HTML, independent invalid fields, duplicate names, missing attributes, and public limits.
- `pnpm build`: passed for all workspace projects, including declarations and the Wrangler production dry run.
- Web production output: 437.91 kB JavaScript before gzip, 134.27 kB after gzip; CSS is 34.17 kB before gzip and 7.50 kB after gzip.
- Browser QA verified the English desktop three-field demo recipe and a manually built Persian two-field recipe at 390 px, including live match counts, desktop tables, mobile cards, RTL, zero horizontal overflow, no remote preview images, and no console warnings or errors.

### Post-Phase 5 local UX refinement — 2026-07-14

- Reworked the primary Persian landing and workspace copy for a shorter, more natural product voice and removed stale pre-Phase 2 messaging.
- Added self-hosted Vazirmatn variable font assets and separate Persian title sizing, line height, text wrapping, and body rhythm while keeping URLs and selectors LTR/technical.
- Added lightweight ambient motion, staged scroll reveals, responsive hover feedback, and animated technical illustration details with a complete reduced-motion fallback.
- Added route scroll restoration so navigation never opens the next workspace view at the previous page position.
- Updated lint ignores for Wrangler's generated local runtime directory so running the local Worker cannot pollute project lint results.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling.
- `pnpm test`: 25 test files and 144 tests passed.
- `pnpm build`: passed for all workspace projects, including declarations and the Wrangler production dry run.
- Web production output: 439.56 kB JavaScript before gzip, 134.69 kB after gzip; CSS is 42.01 kB before gzip and 9.28 kB after gzip; bundled Vazirmatn subsets total 102.68 kB before transfer compression.
- Browser QA verified the Persian landing page, route scroll restoration, no-network demo through result preview, English route preservation, correct RTL/LTR and font boundaries, zero horizontal overflow, and no console errors at the inspected desktop viewport.

### Phase 6 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling.
- `pnpm test:unit`: 27 test files and 151 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed.
- `pnpm test`: 29 test files and 163 tests passed.
- Export coverage includes stable JSON ordering, UTF-8 Persian CSV, embedded quotes/newlines, formula-injection mitigation, and sanitized filenames.
- Local-data coverage includes versioned recipe parsing, bounded import size, strict unknown-field rejection, CRUD, rename/duplicate/delete flows, local recipe caps, bounded history, and explicit history clearing.
- `pnpm build`: passed for all workspace projects, including declarations and the Wrangler production dry run.
- Web production output: 469.76 kB JavaScript before gzip, 142.84 kB after gzip; CSS is 47.69 kB before gzip and 10.18 kB after gzip.
- Browser QA verified Persian-to-English and English-to-Persian switching without refresh, JSON Clipboard copy, CSV action availability, IndexedDB recipe persistence across reload, recipe reopen and field reconstruction, quick/custom history entries, and no console errors.
- Responsive browser QA verified recipe layout at 1280 px and 390 px with zero horizontal overflow.

### Phase 7 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling, including the new code-generator package.
- `pnpm test:unit`: 29 test files and 158 tests passed.
- `pnpm test:integration`: 2 test files and 12 tests passed as part of the full run.
- `pnpm test`: 31 test files and 170 tests passed.
- Generated-code coverage compiles Python with an installed interpreter and parses JavaScript as an ES module with Node, using a valid repeated-card fixture recipe.
- Escaping coverage includes quotes, newlines, backslashes, hostile-looking fallback strings, likely-secret query redaction, fragment removal, credentialed URL rejection, and unsupported protocols.
- `pnpm build`: passed for all workspace projects, including code-generator declarations and the Wrangler production dry run.
- Web production output: 485.92 kB JavaScript before gzip, 147.60 kB after gzip; CSS is 52.90 kB before gzip and 10.95 kB after gzip.
- Browser QA verified the redesigned Persian dark-theme picker, selected and focus states, the bundled custom demo recipe, Python generation, JavaScript/Node switching, and correctly LTR technical code inside the RTL page.

### Phase 8 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects, Worker protocol types, API feature contract, and tooling.
- `pnpm test:unit`: 32 test files and 169 tests passed as part of the full run.
- `pnpm test:integration`: 2 test files and 12 tests passed as part of the full run.
- `pnpm test`: 34 test files and 181 tests passed.
- Fixture coverage detects six workshop cards and three product cards, suggests title/price/URL/image fields, rejects navigation-only lists and ordinary article paragraphs, and enforces pathological node/candidate caps.
- Worker-boundary coverage verifies successful transfer, unavailability fallback, strict timeout without repeated main-thread work, cancellation, and termination.
- `pnpm build`: passed for all workspace projects, including declarations and the Wrangler production dry run with `SMART_DETECTION_ENABLED=true`.
- Web production output: main JavaScript is 496.97 kB before gzip and 151.34 kB after gzip; CSS is 57.54 kB before gzip and 11.71 kB after gzip.
- Smart code splitting produced a 5.46 kB UI chunk, a 1.43 kB detector runtime chunk, and a separate 4.38 kB Worker bundle, all before gzip where reported by Vite.
- Browser QA verified the real Persian dark-theme Worker flow: one `article.product-card` candidate, three items, 94% relative score, explainable signals, correct RTL/LTR boundaries, and one-click creation of an editable three-field custom recipe.

### Pre-Phase 9 responsive UX refinement — 2026-07-14

- Reworked the mobile experience as dedicated small-screen layouts rather than compressed desktop sections, including the landing page, extraction workspace, result records, category navigation, actions, page introductions, and footer.
- Replaced the translucent mobile drawer with an opaque full-viewport navigation surface containing localized context, icon-led navigation, language and theme controls, a focus trap, Escape dismissal, and inert background content.
- Balanced the Persian and English tools, recipes, history, and documentation pages with localized assurance panels and removed the large direction-dependent empty region.
- Expanded the footer with product links, local/open-source messaging, creator attribution for Pouya Fereydouni, and the verified `pooya-fr00` GitHub profile. Other personal links remain pending exact owner-provided URLs.
- Fixed direct localized route reveals that could leave Persian content invisible until refresh, and removed the 320 px RTL clipping caused by a document minimum width.
- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects and tooling.
- `pnpm test`: 34 test files and 182 tests passed, including mobile-menu accessibility, localized page balance, creator attribution, and direct Persian-route visibility regressions.
- `pnpm build`: passed for all workspace projects, including the Wrangler production dry run without deploying.
- Web production output: main JavaScript is 506.91 kB before gzip and 154.02 kB after gzip; CSS is 70.10 kB before gzip and 13.69 kB after gzip.
- Browser QA covered Persian viewports at 320×740, 390×844, and 1440 px desktop plus English at 390 px. It verified the full-screen menu, balanced foundation/local-data pages, mobile workspace and demo results, card layouts, internal category scrolling, footer, RTL/LTR direction, and absence of document-level horizontal overflow.

### Phase 9 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects, public-page types, generated demo data, tests, and tooling.
- `pnpm test`: 36 test files and 191 tests passed, including 179 unit tests and 12 integration tests.
- Demo coverage verifies all 12 product records, the 8-row semantic table, article headings and metadata, detached extraction output, Persian RTL markup, and direct query-driven workspace loading without an API call.
- Public-page coverage verifies English and Persian playground routes, localized security and tool documentation, route metadata, and visible sample counts.
- `pnpm build`: passed for every workspace project, including declarations and the Wrangler production dry run without deploying.
- Worker dry-run output: 667.23 kB before gzip and 107.81 kB after gzip.
- Web production output: main JavaScript is 294.60 kB before gzip and 92.09 kB after gzip; CSS is 86.60 kB before gzip and 16.11 kB after gzip.
- Route splitting produced separate workspace (53.00 kB), public-content (35.75 kB), catalog (9.20 kB), playground (6.86 kB), and documentation (6.48 kB) chunks before gzip.
- Browser QA verified Persian playground/product/documentation routes at mobile and desktop widths, the 12-card product presentation, English mobile table cards, Persian methodology copy, correct RTL/LTR boundaries, zero inspected horizontal overflow, and automatic no-network loading of the real extraction workspace with a 12-item smart-detection candidate.

### Phase 10 — 2026-07-14

- `pnpm check:private-files`: passed; no tracked `poya.txt` file.
- `pnpm check:security`: passed across 64 production frontend source files; no CSP-incompatible inline style mutation or raw React HTML injection pattern was found.
- `pnpm check:docs`: passed across 12 documentation files with no broken local link.
- `pnpm format:check`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed for all workspace projects, Playwright configuration, E2E tests, and tooling.
- `pnpm test:unit`: 35 test files and 181 tests passed.
- `pnpm test:integration`: 3 test files and 14 tests passed.
- `pnpm test`: 38 test files and 195 tests passed.
- `pnpm test:e2e`: 8 Chromium tests passed, including three critical product flows and five axe-core WCAG 2.1 A/AA scenarios; monitored pages produced no runtime or console errors.
- `pnpm build`: passed for every workspace project, including declarations and the Wrangler production dry run without deploying.
- Worker dry-run output: 667.23 KiB before gzip and 107.81 KiB after gzip.
- Web production output: main JavaScript is 294.77 kB before gzip and 92.14 kB after gzip; CSS is 87.59 kB before gzip and 16.37 kB after gzip.
- Bundle budgets passed: largest JavaScript asset 287.87 KiB, all JavaScript 573.23 KiB, and largest CSS asset 85.54 KiB.
- `pnpm audit:dependencies`: passed with no known vulnerabilities. Hono and Cloudflare Worker types were updated to current compatible patch releases; TypeScript 6.0.3 remains intentionally pinned for `typescript-eslint` compatibility.
- Responsive browser QA covered 320×740, 390×844, 768×900, and 1440×900 in Persian and English. It verified dedicated mobile records, desktop/table transitions, 12 product cards and CSS-only color treatments, dark theme, menu overflow/focus behavior, RTL/LTR, landmarks, and no inspected document-level horizontal overflow.

### Phase 11 — 2026-07-14 — ready for owner-approved deploy

- Revalidated Cloudflare Pages Direct Upload, Wrangler, Worker secrets, Worker/Durable Object free-tier availability, Workers limits, and Pages limits against current official documentation.
- `pnpm check:deployment`: passed; the release path is manual-only, fail-closed, exact-origin, and secret-free.
- Production Worker config generation passed with reserved test origins; Wrangler dry run passed with the exact CORS origin, public fetch enabled, SQLite Durable Object binding, and 10 ms CPU limit. Nothing was uploaded.
- `pnpm build:production` passed with reserved test origins; 39 web artifact files passed private-file, source-map, sitemap, robots, and exact-origin CSP checks.
- `pnpm check`: passed locally: private/security/deployment/doc/format/lint/type gates, 39 Vitest files and 199 tests, 8 Playwright/axe tests, all builds, bundle budgets, and dependency audit.
- Test split: 181 unit tests and 18 integration tests passed; the integration suite now covers HTTPS-only origins, secret-free Worker generation, manual deployment policy, SPA redirects, and non-indexed local workspace routes.
- Worker dry-run output: 667.23 KiB before gzip and 107.81 KiB after gzip.
- Web production output: main JavaScript is 294.77 kB before gzip and 92.14 kB after gzip; CSS is 87.59 kB before gzip and 16.37 kB after gzip.
- Bundle budgets passed: largest JavaScript asset 287.87 KiB, all JavaScript 573.23 KiB, and largest CSS asset 85.54 KiB.
- Browser QA against the finalized production artifact covered Persian mobile at 390×844, English mobile playground, and Persian desktop at 1440×900. Direct routes, eight mobile table records, RTL/LTR, localized metadata, landmarks, footer, and absence of inspected horizontal overflow or console warnings/errors passed.
- No Push, Cloudflare resource creation, secret registration, account connection, or real deployment occurred. The Master Spec live-URL exit criterion and remote GitHub Actions evidence remain pending explicit owner approval and exact production values.

## Known risks

- Cloudflare limits were revalidated on 2026-07-14 but remain third-party policy and must be checked again immediately before deployment.
- Hostname resolution relies on Cloudflare's strictly-public global fetch path in addition to application-level URL and IP-literal checks; another runtime needs an equivalent DNS/rebinding defense.
- Real Cloudflare deployment, production origins, resource names, and production secrets remain intentionally unconfigured until owner approval.
- Production must configure `VITE_API_BASE_URL` when the frontend and Worker do not share an origin; local development uses the Vite API proxy.
- Table header inference and `srcset` selection are deterministic best-effort strategies rather than full browser layout reconstruction.
- Static HTML analysis cannot observe content created later by remote page JavaScript.
- IndexedDB data remains device- and browser-local and can be cleared by browser privacy settings or storage eviction; recipe JSON export is the portable backup path.
- Custom selector inspection and bounded smart-snapshot construction still run briefly on the main thread; repeated-structure scoring runs in a dedicated Worker with a hard timeout.
- Repeated-structure scores are relative heuristic rankings, not calibrated probabilities; unusual but structurally homogeneous layouts can still create false positives or false negatives.
- The sitemap, robots reference, and exact API CSP are generated and tested with reserved dry-run origins; their final values require the approved live origins.
- Production-origin Lighthouse, deployed-header verification, live fetch smoke, and real-network measurements cannot be completed before the owner-approved Phase 11 destination exists.
- Automated axe scans cannot replace a human screen-reader and 200% zoom review; both remain explicit pre-publication items in the release checklist.
- The source CSP remains a build template; `build:production` replaces its broad HTTPS token with the exact approved API origin and the release-artifact gate rejects any remaining wildcard.
- Git currently reports the entire project as untracked because no repository baseline commit exists; CI and release evidence become meaningful only after the owner establishes that baseline without including private files.
