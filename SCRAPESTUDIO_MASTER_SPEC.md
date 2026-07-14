# ScrapeStudio — Master Product & Engineering Specification

> **Status:** Approved implementation specification for the current free public release  
> **Audience:** Codex / coding agents / project owner  
> **Working project name:** `ScrapeStudio`  
> **Version:** 1.0  
> **Prepared:** 2026-07-14  
> **Primary language of this specification:** English, because implementation agents and technical tooling generally perform more reliably with precise English technical specifications.  
> **Product UI languages:** Persian (`fa`, RTL) and English (`en`, LTR)

---

## 0. Read this first

This document is the single source of truth for building ScrapeStudio from zero to a polished public release.

ScrapeStudio is a **free, open-source, responsive, bilingual no-code web scraping studio**. A user enters the URL of a public web page, ScrapeStudio securely fetches the static HTML, analyzes extractable structures, lets the user choose what to extract, and returns structured results that can be previewed, copied, exported, saved locally as recipes, and converted into starter code.

The current release is intentionally designed to be:

- useful to real users;
- technically impressive as a portfolio project;
- safe enough to expose publicly;
- cheap enough to operate within free hosting limits;
- open source and suitable for GitHub;
- usable without account registration;
- bilingual in Persian and English;
- responsive on desktop, tablet, and mobile.

### Absolute scope rule

**Build only the current free public release described in this file.**

There is a separate private future roadmap named `poya.txt`. It is **not part of the current implementation scope**. Do not implement subscriptions, payments, premium accounts, team features, unlimited scraping, paid infrastructure, or any other future commercial functionality now.

If `poya.txt` is visible to the agent, treat it as private owner-only planning context. It must not be committed to the public repository and must not influence the current implementation unless the owner explicitly starts a future upgrade project.

---

# 1. Product definition

## 1.1 One-sentence product pitch

**Turn public web pages into structured data without writing scraping code.**

## 1.2 Product promise

A user should be able to:

1. paste a public `http://` or `https://` URL;
2. have the page fetched through a secure backend gateway;
3. inspect what can be extracted;
4. extract tables, links, images, metadata, headings, or custom CSS-selected fields;
5. preview results in a clean UI;
6. export CSV or JSON;
7. save reusable recipes locally without creating an account;
8. generate starter scraping code from a recipe;
9. use the entire core product in Persian or English;
10. use it comfortably on mobile and desktop.

## 1.3 What the product is not

ScrapeStudio is not:

- a proxy service;
- an anti-bot bypass service;
- a CAPTCHA bypass tool;
- a credentialed-session scraper;
- a login-protected content extractor;
- a private-network fetcher;
- an unlimited crawler;
- a browser automation platform;
- a data resale service;
- a tool for scraping arbitrary files or non-HTML protocols;
- an account-based SaaS in the current version.

---

# 2. Success criteria

The release is considered successful only when all of the following are true:

1. A first-time user can scrape a supported public static page without reading documentation.
2. A technical user can use custom CSS selectors and multi-field recipes.
3. Exported CSV and JSON are valid and useful.
4. Persian RTL and English LTR are both first-class experiences.
5. The mobile experience is genuinely designed for small screens, not merely shrunk desktop UI.
6. The public backend blocks obvious SSRF and abuse vectors.
7. The application runs on free-tier-friendly infrastructure.
8. The repository is professional enough to be shown as a serious portfolio project.
9. Automated tests cover security-sensitive URL validation and core extraction behavior.
10. The live demo contains built-in safe playground pages so reviewers can test the product immediately.
11. No secret, owner-private roadmap, `.env` file, token, or credential is committed.
12. The current release contains no payment or premium implementation.

---

# 3. Target users

## 3.1 Primary user groups

### Non-technical users
People who want structured data from a public page without writing code.

Examples:

- extract a table;
- collect all links from a page;
- export article headings;
- collect image URLs;
- inspect page metadata.

### Developers and technical users
People who understand CSS selectors or want a quick extraction recipe.

Examples:

- use `.product-card .price`;
- define several fields;
- save a recipe;
- generate Python or JavaScript starter code.

### Recruiters, clients, and portfolio reviewers
People evaluating the project owner.

They should immediately see evidence of:

- frontend engineering;
- backend engineering;
- web scraping concepts;
- browser APIs;
- security thinking;
- SSRF protection;
- rate limiting;
- export pipelines;
- local persistence;
- internationalization;
- RTL/LTR support;
- testing;
- CI/CD;
- Cloudflare deployment;
- product design.

---

# 4. Core user journeys

## 4.1 Quick extraction journey

1. User opens `/en` or `/fa`.
2. User enters a supported public URL.
3. User submits.
4. Backend validates and fetches the static HTML.
5. Frontend analyzes the detached document.
6. UI shows detected extractable categories:
   - tables;
   - links;
   - images;
   - headings;
   - metadata;
   - repeated structures when confidently detected.
7. User selects a category.
8. Results are previewed.
9. User exports CSV or JSON, or copies JSON.

## 4.2 Advanced selector journey

1. User opens Custom Extractor.
2. User enters URL.
3. Page is fetched.
4. User enters an item selector, for example `.product-card`.
5. User adds fields:
   - `title` → `.title` → text;
   - `price` → `.price` → text;
   - `url` → `a` → `href`;
   - `image` → `img` → `src`.
6. Live validation shows matches.
7. User runs extraction.
8. User sees structured rows.
9. User exports, saves recipe locally, or generates starter code.

## 4.3 Recipe journey

1. User completes an extraction configuration.
2. User chooses Save Recipe.
3. Recipe is stored in IndexedDB.
4. Recipe appears in `/recipes`.
5. User can:
   - reopen;
   - rename;
   - duplicate;
   - export as `.json`;
   - import from `.json`;
   - delete.
6. Recipe never needs to be stored on the server in the current version.

## 4.4 Portfolio reviewer journey

1. Reviewer opens the landing page.
2. Reviewer sees a clear value proposition.
3. Reviewer clicks Try Demo.
4. A built-in demo page loads.
5. Reviewer extracts products or tables without relying on an external website.
6. Reviewer visits:
   - About;
   - Methodology;
   - Security;
   - Limitations;
   - GitHub repository.
7. Reviewer can see architecture, tests, CI/CD, and documented engineering decisions.

---

# 5. Current free release scope

The current free public release must contain the following.

## 5.1 Landing page

Required sections:

- navigation;
- hero;
- primary URL input;
- concise explanation;
- demo CTA;
- feature overview;
- how it works;
- example use cases;
- free/open-source/no-signup badges;
- limitations summary;
- GitHub CTA;
- footer.

Hero message example:

> Turn websites into structured data.  
> Extract tables, links, metadata, images, and custom fields from public web pages — no coding required.

Do not copy this wording blindly if a better final product line is produced. Keep the meaning.

## 5.2 Main scraping workspace

Route:

- `/en/scrape`
- `/fa/scrape`

Required capabilities:

- URL input;
- URL validation feedback;
- fetch progress state;
- analysis progress state;
- detected extraction types;
- quick extract;
- advanced/custom mode;
- result preview;
- export;
- recipe save;
- recent local history.

## 5.3 Quick extractors

### Table extractor

Detect all `<table>` elements.

For each table show:

- table index;
- optional inferred title/caption;
- row count;
- column count;
- preview.

Extraction behavior:

- read `<thead>`, `<tbody>`, `<th>`, `<td>`;
- normalize rowspan/colspan only when practical;
- produce stable column names;
- avoid crashing on malformed HTML;
- cap returned rows according to product limits.

### Link extractor

Extract anchors and classify:

- internal;
- external;
- mailto;
- tel;
- downloadable-looking;
- hash/fragment;
- invalid/ignored.

Fields:

- text;
- absolute URL;
- type;
- rel;
- target;
- optional title attribute.

Filters:

- all;
- internal;
- external;
- unique only.

### Image extractor

Extract image references from:

- `src`;
- `data-src`;
- `srcset` best candidate when feasible.

Fields:

- absolute URL;
- alt;
- title;
- width;
- height;
- loading mode when present.

Do not automatically download third-party images.

### Metadata extractor

Extract:

- title;
- meta description;
- canonical URL;
- document language;
- robots meta;
- viewport;
- Open Graph fields;
- Twitter/X card fields;
- JSON-LD blocks;
- favicon candidates;
- main headings count;
- basic document statistics.

### Headings extractor

Extract:

- H1 through H6;
- text;
- heading level;
- order;
- optional generated anchor reference when an ID exists.

### Raw text summary

Optional but useful:

- page title;
- text length;
- word estimate;
- paragraph count.

Do not position this as AI summarization. No AI API is required.

---

# 6. Advanced custom extractor

This is a major portfolio feature and must be implemented in the current free release.

## 6.1 Item selector

User defines a repeating item selector:

```text
.product-card
```

The system finds item nodes.

## 6.2 Field schema

Each field contains:

- `name`;
- `selector`;
- `extractionMode`;
- optional `attribute`;
- optional `multiple`;
- optional `trim`;
- optional fallback.

Supported extraction modes:

- text;
- inner text;
- attribute;
- href;
- src;
- HTML only if sanitized and explicitly labeled;
- existence boolean;
- count.

For the public V1, keep modes understandable and safe.

## 6.3 Multi-field extraction

Example:

```json
{
  "itemSelector": ".product-card",
  "fields": [
    {
      "name": "title",
      "selector": ".product-title",
      "mode": "text"
    },
    {
      "name": "price",
      "selector": ".price",
      "mode": "text"
    },
    {
      "name": "url",
      "selector": "a",
      "mode": "attribute",
      "attribute": "href"
    }
  ]
}
```

## 6.4 Selector validation

Requirements:

- invalid CSS selectors must show human-readable errors;
- one invalid field must not crash the entire application;
- match counts should be visible before running full extraction;
- enforce maximum number of fields;
- enforce maximum item matches.

---

# 7. Smart repeated-structure detection

This feature makes the project significantly stronger but must remain best-effort and resource-bounded.

## 7.1 Goal

Detect likely repeating content units such as:

- product cards;
- article cards;
- result cards;
- directory entries;
- list items.

## 7.2 Constraints

- run client-side;
- preferably use a Web Worker to avoid blocking UI;
- strict node-count caps;
- strict execution timeout;
- graceful fallback;
- never promise perfect detection.

## 7.3 Suggested heuristic

A reasonable first implementation may score candidate parent structures based on:

- repeated sibling tag signatures;
- shared class tokens;
- similar subtree depth;
- similar child tag sequence;
- multiple repeated instances;
- presence of meaningful text or links;
- avoidance of tiny navigation-only elements.

The algorithm should return a small list of candidates:

- confidence score;
- selector suggestion;
- item count;
- suggested text/link/image fields.

## 7.4 UI wording

Use wording like:

> Repeated structure detected  
> 18 similar items found

Do not claim AI unless an actual AI model is used.

---

# 8. Recipe system

## 8.1 Storage

Use IndexedDB through a lightweight wrapper library or a small internal abstraction.

Do not require a server database for user recipes.

## 8.2 Recipe model

At minimum:

```ts
type ScrapeRecipe = {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  targetUrl?: string;
  itemSelector?: string;
  fields: Array<{
    id: string;
    name: string;
    selector: string;
    mode: "text" | "attribute" | "href" | "src" | "exists" | "count";
    attribute?: string;
    multiple?: boolean;
  }>;
};
```

Exact implementation may evolve, but version recipes from day one.

## 8.3 Recipe operations

Required:

- create;
- save;
- rename;
- duplicate;
- delete;
- import;
- export;
- reopen.

## 8.4 Privacy

Recipes remain local by default.

The UI should say this clearly.

---

# 9. Code generator

The current free release should include a template-based code generator.

It must not depend on an AI API.

## 9.1 Required generated targets

At least:

- Python + `requests` + `BeautifulSoup`;
- JavaScript/TypeScript + `fetch` + a documented parser approach.

Optional if cleanly implemented:

- Node.js + Cheerio.

## 9.2 Rules

- generate code from the active recipe;
- warn that generated code may require adaptation for JavaScript-rendered or protected sites;
- escape selectors and strings safely;
- never include cookies, auth tokens, or private credentials;
- include reasonable timeout and user-agent examples without pretending to bypass protections.

---

# 10. Local history

Use IndexedDB or local storage.

Store only lightweight metadata:

- URL;
- timestamp;
- extraction type;
- result count;
- recipe reference when applicable.

Do not store huge raw HTML snapshots by default.

User must be able to clear history.

---

# 11. Playground and built-in demos

This is mandatory.

Create local demo pages under routes such as:

- `/en/playground/products`
- `/en/playground/table`
- `/en/playground/article`
- Persian equivalents.

Demo content must be original and bundled with the project.

Examples:

### Demo products
12 fake products with:

- title;
- price;
- category;
- image placeholder;
- link.

### Demo table
A meaningful dataset with multiple columns.

### Demo article
Headings, paragraphs, links, images, metadata, and JSON-LD.

Purpose:

- reliable testing;
- portfolio demonstration;
- no dependency on third-party websites;
- predictable E2E tests.

---

# 12. Page and route map

Required public routes:

```text
/
├── /en
├── /fa
├── /en/scrape
├── /fa/scrape
├── /en/tools/table-extractor
├── /fa/tools/table-extractor
├── /en/tools/link-extractor
├── /fa/tools/link-extractor
├── /en/tools/image-extractor
├── /fa/tools/image-extractor
├── /en/tools/metadata-extractor
├── /fa/tools/metadata-extractor
├── /en/tools/custom-selector
├── /fa/tools/custom-selector
├── /en/recipes
├── /fa/recipes
├── /en/history
├── /fa/history
├── /en/docs
├── /fa/docs
├── /en/methodology
├── /fa/methodology
├── /en/security
├── /fa/security
├── /en/limitations
├── /fa/limitations
├── /en/about
├── /fa/about
├── /en/playground
├── /fa/playground
└── localized playground demo routes
```

Optional:

- `/status`, only if there is meaningful live status data.

Avoid fake operational dashboards.

---

# 13. Product limitations for the free public release

The following defaults should be implemented as configuration constants and documented.

Suggested initial values:

| Capability | Initial free public limit |
|---|---:|
| Scrapes per 10 minutes | 5 |
| Scrapes per day per anonymous identity | 20 |
| External pages per operation | 1 |
| Redirects | 3 |
| Fetch timeout | 10 seconds |
| Max accepted HTML | 1 MiB initially |
| Max extracted rows | 200 |
| Max links returned | 500 |
| Max images returned | 100 |
| Max custom fields | 10 |
| Max item selector matches | 200 |
| Max JSON-LD blocks | 20 |
| Local saved recipes | 100 |
| Local history entries | 100 |
| Browser-rendered scraping | disabled by default |

These are starting values, not religious constants. Codex may tune a limit downward for free-tier reliability, but not upward without documenting the reason and validating platform constraints.

## 13.1 Why 1 MiB HTML initially

The Workers Free tier currently has a 10 ms CPU limit per HTTP request. Therefore, the backend should avoid heavy DOM parsing. The preferred architecture is:

- backend validates URL and fetches static HTML;
- frontend parses the detached HTML document;
- client-side Web Workers handle heavier heuristics.

Official reference:
https://developers.cloudflare.com/workers/platform/limits/

## 13.2 Browser rendering

Cloudflare Browser Run currently includes 10 browser minutes per day on Workers Free.

Therefore:

- browser-rendered scraping is not a default core dependency;
- do not build the current product around browser availability;
- do not expose unlimited browser automation;
- if an experimental browser mode is added later to the free release, it must be behind a feature flag and shared daily quota.

Official reference:
https://developers.cloudflare.com/browser-run/pricing/

---

# 14. Recommended technical architecture

## 14.1 High-level architecture

```text
User Browser
    |
    |  URL + extraction configuration
    v
React Web App
    |
    | POST /api/fetch-page
    v
Cloudflare Worker API
    |
    |-- Input validation
    |-- Rate limit check
    |-- URL normalization
    |-- SSRF protections
    |-- Redirect validation
    |-- Timeout
    |-- Content-Type check
    |-- Size cap
    v
Public HTTP/HTTPS Page
    |
    | static HTML response
    v
Cloudflare Worker
    |
    | safe response envelope
    v
Browser
    |
    | DOMParser in detached document
    | Quick extractors
    | Custom selectors
    | Smart repeated-item heuristic in Web Worker
    v
Preview / JSON / CSV / Recipe / Generated Code
```

## 14.2 Why parsing is client-heavy

Cloudflare Workers Free currently allows 10 ms CPU time per HTTP request, while parsing large HTML into a full DOM can exceed that budget.

Therefore:

- the Worker should do security-sensitive network access;
- the browser should do user-specific extraction logic;
- never inject fetched third-party HTML into the live application DOM;
- parse it using a detached `DOMParser`;
- extract only data structures;
- sanitize any HTML that is ever rendered.

## 14.3 Frontend stack

Recommended:

- React;
- TypeScript;
- Vite;
- React Router or another lightweight, stable routing solution;
- Tailwind CSS;
- shadcn/ui where appropriate;
- TanStack Table for rich desktop tables if bundle and UX remain acceptable;
- `i18next`/`react-i18next` or equivalent mature i18n;
- IndexedDB wrapper such as `idb` if useful;
- Vitest;
- React Testing Library;
- Playwright for E2E.

Codex may choose equivalent mature packages if there is a concrete compatibility reason, but must document deviations.

## 14.4 Backend stack

Recommended:

- Cloudflare Workers;
- TypeScript;
- Hono;
- Zod;
- Cloudflare Durable Objects for rate-limit state.

The backend must remain small and security-focused.

## 14.5 Monorepo

Use a clean monorepo.

Recommended:

```text
scrapestudio/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── extraction-core/
│   ├── schemas/
│   └── code-generator/
├── tests/
│   └── fixtures/
├── docs/
├── .github/
│   └── workflows/
├── AGENTS.md
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── pnpm-workspace.yaml
└── .gitignore
```

Use `pnpm` unless there is a compelling reason not to.

---

# 15. Fetch API contract

## 15.1 Endpoint

Example:

```text
POST /api/v1/fetch-page
```

Request:

```json
{
  "url": "https://example.com/products"
}
```

Success response:

```json
{
  "ok": true,
  "requestId": "opaque-id",
  "page": {
    "requestedUrl": "https://example.com/products",
    "finalUrl": "https://example.com/products",
    "status": 200,
    "contentType": "text/html; charset=utf-8",
    "byteLength": 123456,
    "fetchedAt": "2026-07-14T12:00:00.000Z",
    "html": "<!doctype html>..."
  },
  "limits": {
    "maxHtmlBytes": 1048576,
    "maxRows": 200
  }
}
```

Error response:

```json
{
  "ok": false,
  "requestId": "opaque-id",
  "error": {
    "code": "FETCH_TIMEOUT",
    "message": "The page took too long to respond."
  }
}
```

## 15.2 Stable error codes

At minimum:

- `INVALID_URL`;
- `UNSUPPORTED_PROTOCOL`;
- `BLOCKED_HOST`;
- `BLOCKED_IP`;
- `BLOCKED_PORT`;
- `TOO_MANY_REDIRECTS`;
- `REDIRECT_BLOCKED`;
- `FETCH_TIMEOUT`;
- `UPSTREAM_ERROR`;
- `UNSUPPORTED_CONTENT_TYPE`;
- `RESPONSE_TOO_LARGE`;
- `RATE_LIMITED`;
- `DAILY_LIMIT_REACHED`;
- `SERVICE_LIMIT_REACHED`;
- `INTERNAL_ERROR`.

The frontend must map these to localized user-friendly messages.

---

# 16. Security requirements

This section is non-negotiable.

## 16.1 SSRF threat model

Because users can submit URLs, the backend must assume malicious input.

Block:

- `localhost`;
- `.localhost`;
- loopback IPs;
- private IPv4 ranges;
- link-local IPv4 ranges;
- reserved and unspecified ranges where applicable;
- private/reserved IPv6 ranges;
- IPv4-mapped IPv6 forms;
- cloud metadata hostnames and IPs;
- embedded credentials in URLs;
- unsupported protocols;
- suspicious non-standard ports according to policy.

Examples that must not be fetched:

```text
http://localhost
http://127.0.0.1
http://0.0.0.0
http://10.0.0.1
http://172.16.0.1
http://192.168.1.1
http://169.254.169.254
http://[::1]
file:///etc/passwd
ftp://example.com
```

## 16.2 Redirect validation

Never trust redirects automatically.

For every redirect:

1. read the `Location`;
2. resolve relative URL;
3. validate protocol;
4. validate host;
5. validate IP literal when applicable;
6. validate port;
7. enforce redirect count;
8. only then fetch the next location.

Prefer manual redirect handling.

## 16.3 Host normalization

Handle:

- uppercase;
- trailing dots;
- punycode/IDN;
- encoded forms;
- IPv4 variants where the runtime accepts them;
- IPv6 bracket notation;
- username/password URL syntax.

Use tested normalization.

## 16.4 DNS rebinding caveat

Where runtime-level DNS resolution cannot be fully controlled, document the limitation honestly.

Do not claim perfect SSRF protection.

Use defense in depth and Cloudflare runtime constraints.

## 16.5 Protocol policy

Allow only:

- `http:`
- `https:`

Reject everything else.

## 16.6 Port policy

Recommended initial allowlist:

- default port;
- 80;
- 443.

If broader port support is ever added, document and test it.

## 16.7 Content type

Accept HTML-like responses only, such as:

- `text/html`;
- optionally `application/xhtml+xml`.

Reject binary and unrelated content types.

## 16.8 Response size

Enforce size before and during body reading when possible.

Do not buffer unbounded response bodies.

Return a clear `RESPONSE_TOO_LARGE` error.

## 16.9 Timeout

Use `AbortController`.

Initial target: 10 seconds.

## 16.10 XSS

Never directly inject fetched remote HTML into the application's live DOM.

Safe strategy:

- parse with detached `DOMParser`;
- extract text/URLs/metadata;
- display values as escaped text;
- sanitize explicitly if any HTML preview is later introduced.

## 16.11 CSV injection

When exporting CSV, protect spreadsheet users against formula injection.

Potentially dangerous leading characters include:

```text
=
+
-
@
```

Implement a documented CSV safety strategy.

## 16.12 URL output normalization

Resolve relative URLs against the final fetched URL.

Do not execute returned URLs.

## 16.13 Secrets

Never commit:

- Cloudflare tokens;
- account IDs when sensitive;
- API secrets;
- signing secrets;
- `.dev.vars`;
- `.env*`;
- private roadmap files.

## 16.14 CORS

Restrict backend origins in production.

Allow localhost only in development.

## 16.15 Security headers

At minimum, evaluate and configure:

- Content-Security-Policy;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- frame-ancestors through CSP;
- Strict-Transport-Security where appropriate.

## 16.16 Logging privacy

Do not log full submitted URLs indiscriminately because URLs may contain sensitive query parameters.

Prefer:

- request ID;
- hostname;
- error code;
- response status;
- timing;
- size;
- hashed or redacted identifiers.

Never log raw IPs longer than necessary.

---

# 17. Anonymous identity and rate limiting

## 17.1 Goal

Protect the free public service without requiring login.

## 17.2 Recommended identity signal

Use a privacy-conscious combination of:

- anonymous browser UUID stored locally;
- salted hash of IP available at the edge;
- optional coarse fingerprint only if privacy-friendly and clearly documented.

Do not create invasive fingerprinting.

## 17.3 Rate-limit storage

Use SQLite-backed Durable Objects.

Current official reference:
https://developers.cloudflare.com/durable-objects/platform/pricing/

Suggested behavior:

- bucket by hashed identity;
- rolling or fixed short window;
- daily counter;
- automatic expiry/cleanup;
- no raw IP persistence.

## 17.4 Limits

Initial:

- 5 fetches per 10 minutes;
- 20 fetches per UTC day.

Return:

- retry information where possible;
- localized message;
- current remaining quota when safe.

## 17.5 Global safety valve

Add configuration that can:

- temporarily reduce limits;
- disable external fetch;
- switch to demo-only mode;
- disable smart detection;
- disable experimental browser mode.

This is essential for free-tier survival.

---

# 18. Cloudflare free-tier assumptions

These values were checked on 2026-07-14 and can change. Codex must verify current official documentation before final deployment.

## Workers Free

Official docs:
https://developers.cloudflare.com/workers/platform/limits/

Relevant current values:

- 100,000 requests/day;
- 10 ms CPU time per HTTP request;
- 128 MB memory per isolate;
- 50 external subrequests per invocation.

## Browser Run Free

Official docs:
https://developers.cloudflare.com/browser-run/pricing/

Relevant current value:

- 10 browser minutes/day.

Therefore browser rendering is not a core dependency.

## Durable Objects Free

Official docs:
https://developers.cloudflare.com/durable-objects/platform/pricing/

SQLite-backed Durable Objects are currently available on Workers Free.

Use them carefully for rate limiting.

## Pages / static assets

The web frontend should be deployed as static assets whenever possible.

Keep backend work limited to secure network fetching and related controls.

---

# 19. Internationalization

## 19.1 Languages

Required:

- English: `en`;
- Persian: `fa`.

## 19.2 Direction

English:

```html
<html lang="en" dir="ltr">
```

Persian:

```html
<html lang="fa" dir="rtl">
```

Direction must apply correctly to:

- page layout;
- navigation;
- icons with directional meaning;
- breadcrumbs;
- form controls;
- tables/cards;
- drawers;
- toast placement when appropriate.

## 19.3 URL strategy

Use explicit locale prefixes:

```text
/en/...
/fa/...
```

Root `/` may redirect based on stored preference or browser language.

Avoid confusing automatic redirects after the user has selected a language.

## 19.4 Localized content

Translate:

- navigation;
- buttons;
- validation;
- errors;
- progress states;
- empty states;
- settings;
- limitations;
- docs;
- security page;
- methodology;
- SEO metadata.

## 19.5 Numbers and dates

Use `Intl`.

Examples:

- English digits in English UI;
- Persian digit display where appropriate in Persian UI;
- localized date formatting.

Do not mutate technical values such as CSS selectors or URLs.

## 19.6 Typography

Use fonts that display Persian and Latin cleanly.

Do not bundle unlicensed font files.

Prefer system fonts or properly licensed web fonts.

---

# 20. Responsive UX

## 20.1 Mobile-first principle

Do not build desktop first and merely stack everything.

## 20.2 Desktop result view

Can use data table with:

- pagination;
- column visibility;
- horizontal scroll where unavoidable;
- copy/export actions.

## 20.3 Mobile result view

Prefer card-based records.

Example:

```text
Product A
Price: $25
URL: example.com/...
```

Provide a switch to raw JSON where useful.

## 20.4 Filters and controls

On mobile:

- use drawers/bottom sheets;
- keep primary action visible;
- avoid dense sidebars.

## 20.5 Accessibility

Required:

- keyboard navigation;
- visible focus states;
- semantic labels;
- error association;
- contrast;
- reduced-motion support;
- screen-reader-friendly status messages.

Target WCAG 2.1 AA practices where practical.

---

# 21. Design system

## 21.1 Visual direction

Modern developer tool + refined SaaS.

Avoid:

- excessive gradients;
- excessive glassmorphism;
- fake 3D;
- noisy animations;
- generic dashboard overload.

Prefer:

- clean typography;
- generous spacing;
- subtle borders;
- light shadows;
- strong information hierarchy;
- restrained accent color;
- excellent dark mode.

## 21.2 Theme

Required:

- light;
- dark;
- system.

Persist locally.

## 21.3 Brand motif

A subtle data-flow / selector / structured-grid motif is preferable.

Do not make the interface look like a cybersecurity attack tool.

## 21.4 Motion

Use small purposeful transitions.

Respect `prefers-reduced-motion`.

---

# 22. Extraction core design

Create a reusable extraction package.

Suggested structure:

```text
packages/extraction-core/
├── src/
│   ├── parse-document.ts
│   ├── normalize-url.ts
│   ├── tables.ts
│   ├── links.ts
│   ├── images.ts
│   ├── metadata.ts
│   ├── headings.ts
│   ├── custom-selector.ts
│   ├── repeated-structures.ts
│   ├── limits.ts
│   └── types.ts
└── tests/
```

## 22.1 Detached parsing

Use:

```ts
new DOMParser().parseFromString(html, "text/html")
```

Never mount the remote document into the live DOM.

## 22.2 Base URL

All relative links and image URLs must resolve against `finalUrl`.

## 22.3 Limits

Extraction functions accept explicit limits.

Example:

```ts
extractLinks(document, {
  maxItems: 500,
  baseUrl
})
```

## 22.4 Determinism

Given identical HTML and settings, extraction should be deterministic.

---

# 23. CSV and JSON exports

## 23.1 JSON

Requirements:

- UTF-8;
- valid JSON;
- readable indentation option;
- stable key order where practical.

## 23.2 CSV

Requirements:

- UTF-8;
- proper escaping;
- quote handling;
- newline handling;
- Persian text preservation;
- spreadsheet formula injection mitigation.

## 23.3 Filenames

Examples:

```text
scrapestudio-example-com-links-2026-07-14.csv
scrapestudio-example-com-products-2026-07-14.json
```

Sanitize filenames.

---

# 24. Error UX

Never show raw stack traces to users.

Examples:

### Unsupported page

> This page could not be processed because it did not return supported HTML.

### JavaScript-rendered page

> The page loaded successfully, but little extractable content was found. The website may render its content with JavaScript.

### Too large

> The page exceeded the current free-service size limit.

### Rate limited

> You have reached the temporary free usage limit. Please try again later.

Every user-facing error must exist in Persian and English.

---

# 25. SEO and public presentation

## 25.1 Public pages

SEO-friendly:

- landing;
- tools;
- docs;
- methodology;
- security;
- limitations;
- about.

Workspace state does not need to be indexed.

## 25.2 Metadata

Provide:

- localized title;
- localized description;
- canonical URLs;
- hreflang;
- Open Graph;
- favicon;
- sitemap;
- robots.txt.

## 25.3 Portfolio presentation

README should clearly include:

- screenshot;
- live demo;
- problem;
- solution;
- features;
- architecture;
- security;
- free-tier design;
- tech stack;
- local setup;
- tests;
- deployment;
- limitations;
- roadmap limited to non-commercial public items only.

Do not publish `poya.txt`.

---

# 26. Legal and responsible-use pages

Create clear pages:

- Terms / acceptable use;
- Privacy;
- Responsible scraping;
- Limitations.

The product should state:

- only public URLs are supported;
- users are responsible for respecting website terms, applicable law, copyright, privacy, and robots policies;
- the tool does not bypass authentication or CAPTCHAs;
- source websites can block automated access;
- extraction availability is not guaranteed.

Do not make absolute legal claims.

---

# 27. robots.txt policy

The tool must have a documented policy.

Recommended current behavior:

- The product is a user-triggered fetch tool, not a broad autonomous crawler.
- Do not claim that `robots.txt` alone defines legality.
- Add an optional preflight check that can inspect `robots.txt` and provide a warning where feasible.
- Do not build bypass behavior.
- Respect explicit site blocks and upstream refusals.

Keep implementation simple and honest.

---

# 28. Observability

For free release, keep observability lightweight.

Collect:

- request ID;
- route;
- hostname only, preferably redacted;
- success/failure;
- error code;
- upstream status;
- duration;
- byte length;
- extraction telemetry only if privacy-safe and disclosed.

Do not store:

- full HTML;
- user recipe contents;
- full private-looking query strings;
- raw persistent IP logs.

Provide a small internal configuration for log level.

---

# 29. Testing strategy

Testing is mandatory.

## 29.1 Unit tests

Required for:

- URL parsing;
- protocol blocking;
- private IPv4 blocking;
- IPv6 blocking;
- encoded host edge cases;
- port rules;
- redirect validation;
- size limits;
- timeout mapping;
- table extraction;
- link classification;
- image extraction;
- metadata extraction;
- heading extraction;
- custom selector extraction;
- invalid selector handling;
- CSV escaping;
- CSV injection mitigation;
- recipe version parsing;
- localization keys.

## 29.2 Fixture tests

Create original fixture HTML:

```text
tests/fixtures/
├── products.html
├── table.html
├── article.html
├── metadata.html
├── malformed.html
├── relative-links.html
└── repeated-cards.html
```

Do not depend on live external websites for core tests.

## 29.3 Integration tests

Backend:

- valid public URL through mocked upstream;
- redirect chain;
- blocked redirect;
- timeout;
- wrong content type;
- oversized response;
- rate limiting.

## 29.4 E2E tests

Using Playwright:

1. load landing page;
2. switch English/Persian;
3. verify RTL/LTR;
4. use built-in product demo;
5. extract table;
6. run custom selector;
7. save recipe;
8. export JSON;
9. reopen recipe;
10. clear history.

## 29.5 Visual regression

Optional, but useful for critical pages.

---

# 30. CI/CD

Use GitHub Actions.

For a public repository, standard GitHub-hosted runners are currently free according to official GitHub documentation:
https://docs.github.com/en/billing/concepts/product-billing/github-actions

Required workflows:

## Pull request / push checks

- install dependencies;
- typecheck;
- lint;
- unit tests;
- integration tests;
- build.

## Optional scheduled checks

Avoid excessive scheduled jobs.

## Deployment

Use Cloudflare deployment through secure GitHub secrets or Cloudflare's Git integration.

Never expose tokens.

---

# 31. Git and repository quality

## 31.1 Commit style

Prefer small, meaningful commits.

Examples:

```text
feat(web): add localized scrape workspace
feat(api): add SSRF-safe redirect validation
test(core): cover malformed table extraction
docs(security): document fetch threat model
```

## 31.2 Branching

For solo work, simple branches are enough:

- `main`;
- feature branches.

## 31.3 Public files

Required:

- `README.md`;
- `LICENSE`;
- `CONTRIBUTING.md`;
- `SECURITY.md`;
- `CODE_OF_CONDUCT.md` optional but recommended;
- issue templates optional.

Recommended license: MIT, unless the owner chooses another open-source license.

---

# 32. Private file protection

`poya.txt` is owner-private.

The root `.gitignore` must include:

```gitignore
poya.txt
**/poya.txt
PRIVATE_*
*.private.txt
```

Codex must verify before each release that `poya.txt` is not tracked.

Command:

```bash
git ls-files | grep -E '(^|/)poya\.txt$' && exit 1 || true
```

Add a CI safeguard that fails if a file named `poya.txt` is committed.

---

# 33. Performance

## 33.1 Frontend

- lazy-load heavy routes;
- code-split editor and smart detection;
- move repeated-structure heuristic to Web Worker;
- virtualize only when necessary;
- no oversized dependency without justification.

## 33.2 Backend

- do minimal CPU work;
- validate before fetch;
- stream/read with size guard;
- avoid full DOM parsing;
- no database for extracted content;
- no raw HTML persistence.

## 33.3 UX

- progress indicators;
- abort/cancel action where feasible;
- do not freeze UI during analysis.

---

# 34. Browser rendering policy

For the current release:

**Default: OFF.**

Implement an abstraction boundary so future browser rendering can be added later, but do not make the public product depend on it.

Suggested interface:

```ts
interface PageFetcher {
  fetchStatic(input: FetchInput): Promise<FetchResult>;
}
```

Future extensions can add another fetcher without rewriting extraction core.

Do not build a paid feature now.

---

# 35. Current release feature phases

Codex should execute in phases.

## Phase 0 — Repository foundation

Deliver:

- monorepo;
- package manager;
- TypeScript;
- formatting;
- linting;
- test runners;
- base CI;
- `.gitignore`;
- `AGENTS.md`.

Definition of done:

- install works;
- lint works;
- typecheck works;
- tests run;
- build runs.

## Phase 1 — Design foundation and i18n

Deliver:

- app shell;
- route strategy;
- English/Persian;
- RTL/LTR;
- theme;
- responsive navigation;
- shared components.

Definition of done:

- locale switching works;
- URLs are localized;
- page direction correct;
- mobile nav usable.

## Phase 2 — Safe fetch backend

Deliver:

- Hono Worker API;
- Zod schema;
- URL normalization;
- SSRF rules;
- manual redirects;
- timeout;
- size cap;
- content type enforcement;
- error codes;
- rate limiter.

Definition of done:

- all security tests pass;
- blocked targets never fetch;
- redirect validation tested;
- rate limit tested.

## Phase 3 — Client extraction core

Deliver:

- detached parser;
- links;
- images;
- headings;
- metadata;
- tables;
- URL resolution;
- limits.

Definition of done:

- fixture tests pass;
- malformed HTML does not crash.

## Phase 4 — Scrape workspace

Deliver:

- URL flow;
- progress UI;
- detected category cards;
- result preview;
- error UX;
- mobile layout.

Definition of done:

- end-to-end demo works.

## Phase 5 — Custom selector builder

Deliver:

- item selector;
- fields;
- extraction modes;
- match count;
- validation;
- results.

Definition of done:

- user can create a multi-field recipe without code.

## Phase 6 — Export, history, recipes

Deliver:

- CSV;
- JSON;
- copy;
- local history;
- IndexedDB recipes;
- import/export.

Definition of done:

- data survives reload locally;
- no server account needed.

## Phase 7 — Code generator

Deliver:

- Python starter code;
- JavaScript/Node starter code;
- safe escaping;
- copy/download.

Definition of done:

- generated output is syntactically sane and tested from fixtures.

## Phase 8 — Smart repeated structures

Deliver:

- bounded heuristic;
- Web Worker;
- candidate UI;
- graceful fallback.

Definition of done:

- does not block UI;
- demo repeated cards detected;
- false-positive behavior documented.

## Phase 9 — Playground and docs

Deliver:

- product demo pages;
- methodology;
- security;
- limitations;
- privacy;
- responsible use;
- README.

Definition of done:

- a reviewer can test without external URLs.

## Phase 10 — Hardening

Deliver:

- accessibility pass;
- security pass;
- performance pass;
- localization completeness;
- responsive QA;
- CI guard for private file;
- dependency audit;
- release checklist.

## Phase 11 — Deployment

Deliver:

- Cloudflare deployment config;
- production env docs;
- GitHub Actions;
- live frontend;
- live API;
- smoke tests.

Definition of done:

- production URL works;
- no secrets in repo;
- free-tier limits documented.

---

# 36. Definition of done for the whole project

Do not call the project finished unless:

- [ ] English and Persian are complete.
- [ ] RTL and LTR are correct.
- [ ] Responsive mobile UX is polished.
- [ ] Dark/light/system themes work.
- [ ] Static public HTML fetching works.
- [ ] SSRF protections are covered by tests.
- [ ] Redirects are manually validated.
- [ ] Rate limiting works.
- [ ] Page size and timeout limits work.
- [ ] Tables extract correctly.
- [ ] Links extract and classify correctly.
- [ ] Images extract correctly.
- [ ] Metadata extracts correctly.
- [ ] Headings extract correctly.
- [ ] Custom selector multi-field extraction works.
- [ ] CSV export is safe.
- [ ] JSON export works.
- [ ] Local recipes work.
- [ ] Local history works.
- [ ] Recipe import/export works.
- [ ] Code generation works.
- [ ] Smart repeated-item detection is bounded and non-blocking.
- [ ] Built-in demos work.
- [ ] Documentation is complete.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] E2E tests pass.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Production build passes.
- [ ] CI passes.
- [ ] Live deployment works.
- [ ] `poya.txt` is not tracked or published.
- [ ] No paid feature was implemented.

---

# 37. Codex decision rules

Codex should follow these rules:

1. Read `AGENTS.md` and this file before coding.
2. Do not ask the owner trivial questions.
3. Make reasonable engineering decisions consistent with this specification.
4. When a third-party API or platform detail may have changed, verify current official documentation.
5. Prefer primary/official technical docs.
6. Keep a decision log for material deviations.
7. Do not silently reduce security.
8. Do not silently expand scope.
9. Never implement the private paid roadmap during this project.
10. Keep changes small and testable.
11. Run tests after relevant changes.
12. Fix root causes, not only symptoms.
13. Do not leave fake data pretending to be live production data.
14. Do not build fake dashboards.
15. Do not claim perfect SSRF security.
16. Do not expose raw remote HTML in the live DOM.
17. Do not persist fetched HTML on the server.
18. Do not create login/accounts in the current version.
19. Do not add AI API dependency to the core product.
20. Do not require the owner to pay for hosting for the initial release.

---

# 38. Implementation quality bar

The project should feel like a product, not a tutorial.

Avoid:

- giant single components;
- untyped `any`;
- duplicated extraction logic;
- hidden magic constants;
- dead code;
- fake loading;
- fake statistics;
- excessive TODOs;
- disabled tests;
- security logic without tests;
- giant generated README filler.

Prefer:

- cohesive modules;
- explicit types;
- schema validation;
- small components;
- meaningful test names;
- centralized limits;
- localized error catalog;
- documented tradeoffs.

---

# 39. Suggested environment files

Never commit real values.

Example:

```text
apps/api/.dev.vars.example
```

Possible values:

```text
ALLOWED_ORIGINS=http://localhost:5173
IP_HASH_SALT=replace-me
FETCH_TIMEOUT_MS=10000
MAX_HTML_BYTES=1048576
RATE_LIMIT_SHORT_MAX=5
RATE_LIMIT_SHORT_WINDOW_SECONDS=600
RATE_LIMIT_DAILY_MAX=20
EXTERNAL_FETCH_ENABLED=true
```

Secrets belong in Cloudflare secrets / GitHub Actions secrets.

---

# 40. Release checklist

Before publishing:

1. Remove debug logs.
2. Verify no secrets.
3. Verify `poya.txt` is not tracked.
4. Run all tests.
5. Run full production build.
6. Test both locales.
7. Test mobile widths.
8. Test keyboard navigation.
9. Test rate limit.
10. Test timeout.
11. Test oversized response.
12. Test private IP blocks.
13. Test blocked redirects.
14. Test malformed HTML.
15. Test CSV safety.
16. Check README links.
17. Check SEO metadata.
18. Check sitemap and robots.
19. Check Cloudflare usage limits.
20. Smoke-test live deployment.

---

# 41. Explicit non-goals for current implementation

Do not implement now:

- user registration;
- login;
- OAuth;
- subscriptions;
- Stripe or other payments;
- premium tiers;
- teams;
- shared cloud recipes;
- scheduled scraping;
- bulk crawling;
- unlimited pagination;
- proxy rotation;
- anti-bot bypass;
- CAPTCHA bypass;
- credentialed scraping;
- cookie imports;
- browser automation scripts;
- private-page scraping;
- AI extraction API;
- long-term server result storage;
- commercial billing logic.

---

# 42. Future-safe boundaries without future implementation

The code should have clean boundaries so future upgrades are possible, but must not implement them now.

Prepare interfaces, not features:

- `PageFetcher`;
- `RateLimiter`;
- `RecipeStore`;
- `UsagePolicy`;
- `FeatureFlags`.

Current implementations:

- static fetcher;
- anonymous free usage policy;
- local recipe store;
- free feature flags.

Do not create dormant payment code.

---

# 43. Deliverables expected from Codex

By completion, the repository should contain:

- production source code;
- tests;
- fixture pages;
- localized copy;
- API code;
- deployment configuration;
- CI/CD;
- documentation;
- architecture diagram in Mermaid;
- security threat model;
- release checklist;
- professional README;
- screenshots added when available;
- changelog or release notes;
- no private roadmap.

---

# 44. Final instruction to Codex

Build ScrapeStudio as a serious, secure, polished, free public web product.

Do not optimize merely for completing checkboxes. Optimize for:

- real user value;
- clear architecture;
- security;
- free-tier survivability;
- excellent bilingual UX;
- strong portfolio quality;
- maintainability.

When forced to choose between a flashy feature and a reliable secure core, choose the reliable secure core.

The finished project should be something the owner can confidently put on GitHub, link from a personal portfolio, deploy publicly for free, and allow real users to use.
