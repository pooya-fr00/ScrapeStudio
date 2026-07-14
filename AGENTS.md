# AGENTS.md — ScrapeStudio project instructions

These instructions apply to every Codex task in this repository.

## Project mission

Build and maintain **ScrapeStudio**, a free, open-source, bilingual, responsive no-code web scraping studio for public static web pages.

The current project is the free public release only.

## Sources of truth

Read in this order:

1. `AGENTS.md`
2. `SCRAPESTUDIO_MASTER_SPEC.md`
3. existing architecture/docs in `docs/`
4. current source code and tests

If there is a conflict, the master specification wins unless the owner explicitly changes scope.

## Private roadmap rule

`poya.txt` is an owner-private future paid-version roadmap.

- Do not implement it now.
- Do not commit it.
- Do not quote it in public docs.
- Do not build payment, subscriptions, premium plans, login, cloud accounts, teams, or commercial billing during the current project.
- The repository `.gitignore` must exclude it.
- CI should fail if `poya.txt` is tracked.

## Product rules

The current release must be:

- free to use;
- no-signup;
- public;
- open source;
- deployable on free-tier-friendly infrastructure;
- Persian and English;
- RTL/LTR;
- responsive;
- secure against obvious URL-fetch abuse;
- useful to real users.

## Architecture rule

Preferred architecture:

- React + TypeScript + Vite frontend.
- Cloudflare Worker + Hono + Zod backend.
- Durable Objects for anonymous rate limiting.
- Backend securely validates and fetches static HTML.
- Client parses detached HTML with `DOMParser`.
- Heavy repeated-structure analysis runs client-side, preferably in a Web Worker.
- User recipes/history stay local in IndexedDB.
- No server persistence of fetched HTML.
- No account database in current release.

Do not move heavy general DOM parsing into the Free Worker without strong evidence it fits current CPU limits.

## Security rules

Never weaken these without explicit owner approval:

- `http`/`https` only;
- block localhost;
- block private/reserved IP ranges;
- block cloud metadata targets;
- reject embedded URL credentials;
- manually validate every redirect;
- restrict ports;
- enforce timeout;
- enforce response size;
- accept HTML content types only;
- never inject fetched remote HTML into live DOM;
- mitigate CSV formula injection;
- do not log full URLs with sensitive query strings;
- do not persist raw IPs longer than needed;
- do not persist fetched HTML on the server.

Every security-sensitive behavior needs tests.

## Unsupported behavior

Never add:

- CAPTCHA bypass;
- anti-bot bypass;
- proxy rotation;
- credentialed scraping;
- cookie stealing/import;
- private-page scraping;
- arbitrary browser automation;
- unlimited crawling;
- private-network fetching.

## Scope behavior

Do not ask the owner trivial implementation questions.

When details are unspecified:

1. choose the simplest secure production-quality option;
2. stay within the master spec;
3. document the choice if material.

Do not silently add scope.

## Third-party freshness

Before relying on limits, APIs, pricing, SDK syntax, or deployment behavior that may have changed, check official documentation.

Prefer primary sources.

Do not rely on old blog posts when current official docs exist.

## Quality gate after every meaningful change

Run the relevant subset of:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Before declaring a phase complete, run the full project checks.

Do not disable failing tests to make CI green.

## Commit discipline

Use small, meaningful commits when Git operations are available.

Examples:

```text
feat(api): add redirect-safe URL fetcher
feat(web): add localized extraction workspace
test(security): block IPv4-mapped loopback targets
docs(architecture): document client-side parsing boundary
```

## Code style

Prefer:

- strict TypeScript;
- explicit domain types;
- Zod at trust boundaries;
- small cohesive modules;
- pure extraction functions;
- centralized constants;
- localized error codes;
- fixture-based tests.

Avoid:

- `any`;
- giant components;
- giant utility files;
- duplicated selectors;
- hidden magic numbers;
- fake statistics;
- fake operational data;
- unresolved TODOs in release code.

## i18n

Every user-facing string must be localized.

Required:

- English;
- Persian.

English uses LTR.

Persian uses RTL.

Do not apply Persian digit transformation to:

- URLs;
- code;
- CSS selectors;
- JSON;
- technical IDs.

## Accessibility

Maintain:

- semantic HTML;
- keyboard access;
- visible focus;
- labels;
- live status messages;
- reduced motion;
- reasonable contrast.

## Responsive design

Mobile is a first-class UI.

Do not simply squeeze the desktop table into mobile.

Prefer card results on small screens and rich table views on larger screens.

## Data handling

User content:

- recipes local;
- history local;
- fetched HTML ephemeral;
- no account required.

Do not create a backend database for user data in the current release.

## Error handling

Use stable machine error codes and localized human-readable messages.

Never show raw stack traces to users.

## Free-tier survival

The service must have:

- short-window rate limit;
- daily limit;
- max HTML size;
- timeout;
- result caps;
- global safety switches.

Browser-rendered scraping is disabled by default.

## Implementation sequence

Follow the phases in `SCRAPESTUDIO_MASTER_SPEC.md`.

Do not jump to smart detection before the secure fetch core and basic extractors are solid.

## Definition of done

A task is not done until:

- implementation exists;
- errors handled;
- tests added/updated;
- types pass;
- lint passes;
- docs updated when needed.

## Final reminder

Build a real product, not a demo toy.

Security and reliability beat flashy features.

Do not implement the private paid roadmap now.
