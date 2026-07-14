# Hardening baseline

This document records the Phase 10 release baseline for the free public ScrapeStudio release. It complements the detailed security and architecture documents; it does not claim that automated checks replace human review.

## Accessibility

- Semantic landmarks, a skip link, visible focus styles, associated validation errors, polite/assertive status regions, and reduced-motion behavior are part of the application shell and workspace.
- Locale changes update both `lang` and `dir`. Client-side route changes move focus to the main landmark so keyboard and screen-reader users do not remain in stale navigation context.
- Playwright runs axe-core WCAG 2.1 A/AA scans on English and Persian landing pages, documentation, a product playground, the populated workspace, and the open mobile navigation dialog.
- The critical-flow suite checks keyboard dismissal and focus restoration for mobile navigation.
- Automated accessibility scanning detects only a subset of accessibility problems. Manual keyboard, zoom, contrast, reading-order, and screen-reader checks remain required before a public release.

## Security

- Backend SSRF, redirect, protocol, port, timeout, response-size, content-type, CORS, privacy-safe logging, and rate-limit behaviors remain fixture- or integration-tested.
- Cloudflare Pages `_headers` supplies a restrictive CSP, clickjacking protection, no-sniff, no-referrer, permissions restrictions, cross-origin opener isolation, and HTTPS HSTS policy.
- `pnpm check:security` rejects inline-style mutation and raw React HTML injection patterns that would weaken or conflict with that CSP.
- Remote HTML remains detached from the live document. Remote images are represented as text records, CSV output mitigates formula injection, and fetched HTML is not persisted by the server.
- `pnpm check:private-files` rejects tracked private-roadmap, environment, private, and generated production-config files. Environment and private-roadmap patterns remain ignored by Git.
- `pnpm audit:dependencies` fails for high or critical advisories. This is a point-in-time ecosystem check, not a permanent guarantee.

## Performance

- Heavy routes, public content, and smart detection are split into separate production chunks. Repeated-structure scoring runs in a bounded Worker.
- `pnpm check:bundle` enforces these uncompressed release budgets after production build:
  - largest JavaScript asset: 350 KiB;
  - all JavaScript assets combined: 700 KiB;
  - largest CSS asset: 100 KiB.
- The budget check also requires production `_headers` and `robots.txt` assets.
- Performance budgets detect major regressions but do not replace production-origin Lighthouse and real-user measurements.

## Localization and responsive behavior

- Compile-time shapes and unit tests require English/Persian key parity and reject blank translation values.
- Public documentation and tool-guide tests require every supported slug and reject blank localized copy.
- E2E tests exercise route-preserving locale switching and verify the resulting LTR/RTL document state.
- Responsive browser QA covers 320 px, 390 px, tablet, and desktop widths. Small-screen records use cards rather than compressed desktop tables.

## CI and release evidence

The pull-request and main-branch workflow installs locked dependencies, rejects private files, validates the fail-closed deployment policy, checks docs and formatting, runs lint and typecheck, runs unit/integration/E2E/accessibility tests, audits dependencies, builds production artifacts, and enforces bundle budgets. A separate manual-only production workflow repeats the full gate, requires the protected `production` environment, creates exact-origin artifacts, deploys API before frontend, and runs live health, CORS, header, route, sitemap, and approved-fetch smoke tests.

Use the companion [release checklist](./RELEASE_CHECKLIST.md) and [deployment runbook](./DEPLOYMENT.md) for the final owner-approved deployment gate.
