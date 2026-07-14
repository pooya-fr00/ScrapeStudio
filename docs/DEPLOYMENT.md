# Production deployment and operations

This runbook covers the free public ScrapeStudio release. The owner-approved production deployment is live at <https://scrapestudio.pages.dev>, with its API at <https://scrapestudio-api.pooya-fr2005.workers.dev>. Tokens, salts, and account identifiers remain outside the repository in the protected GitHub `production` environment.

## Topology and safety model

- Cloudflare Pages serves `apps/web/dist` as the bilingual React application.
- A Cloudflare Worker serves the Hono API and a SQLite-backed Durable Object enforces anonymous quotas.
- The committed Worker configuration is fail-closed: its origin allowlist is empty and external fetch is disabled.
- `scripts/create-production-worker-config.mjs` produces an ignored, secret-free config with one exact approved frontend origin.
- `scripts/prepare-production-web.mjs` replaces the broad build-template connection policy with the exact API origin and creates the final sitemap and robots reference.
- `IP_HASH_SALT` is a Worker secret. It is supplied to Wrangler from the protected GitHub environment and never written to a repository file or browser bundle.

Cloudflare Pages Direct Upload is used because the release workflow already builds and verifies the artifact. Cloudflare documents that a Direct Upload project cannot later switch to Git integration, so this choice should be retained unless the owner deliberately creates a replacement Pages project: <https://developers.cloudflare.com/pages/get-started/direct-upload/>.

## One-time owner-approved setup

1. Establish a reviewed Git baseline on `main`; do not include `poya.txt`, environment files, generated Wrangler config, tokens, or private screenshots.
2. Create or select one Cloudflare Pages Direct Upload project and one Worker name. Resource creation is an external operation and must not be automated before approval.
3. Determine the exact HTTPS origins, for example the stable `pages.dev` frontend origin and `workers.dev` API origin. Do not use preview-deployment URLs as the canonical production origin.
4. Create a scoped Cloudflare API token limited to the target account and the permissions needed to edit Workers scripts and Pages. Follow Cloudflare's token guidance rather than using the global API key: <https://developers.cloudflare.com/fundamentals/api/get-started/create-token/>.
5. In GitHub, create an environment named `production`, restrict it to `main`, and enable required reviewer approval where the repository plan supports it.
6. Add the following GitHub environment configuration.

| Kind     | Name                       | Meaning                                                           |
| -------- | -------------------------- | ----------------------------------------------------------------- |
| Variable | `PUBLIC_APP_ORIGIN`        | Exact stable HTTPS frontend origin, with no trailing path         |
| Variable | `PUBLIC_API_ORIGIN`        | Exact stable HTTPS Worker origin, with no trailing path           |
| Variable | `CLOUDFLARE_PAGES_PROJECT` | Existing lowercase Pages project name                             |
| Variable | `CLOUDFLARE_WORKER_NAME`   | Existing lowercase Worker name                                    |
| Variable | `SMOKE_FETCH_URL`          | Owner-approved public static HTTPS page for one post-deploy fetch |
| Secret   | `CLOUDFLARE_API_TOKEN`     | Scoped deploy token                                               |
| Secret   | `CLOUDFLARE_ACCOUNT_ID`    | Target Cloudflare account identifier                              |
| Secret   | `IP_HASH_SALT`             | Random deployment-specific value of at least 32 characters        |

A salt can be generated locally without printing other credentials:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Store the result directly as the GitHub environment secret. Do not place it in `.dev.vars`, shell history shared with others, a commit, an issue, or a screenshot. Cloudflare's Worker secret model is documented at <https://developers.cloudflare.com/workers/configuration/secrets/>.

## Deployment workflow

The workflow `.github/workflows/deploy-production.yml` is never triggered by a push. From GitHub Actions, an authorized operator chooses **Production deployment**, selects **Run workflow** on `main`, and chooses `DEPLOY_PRODUCTION` only after owner approval.

The job then:

1. installs the frozen dependency graph and Chromium;
2. runs the complete `pnpm check` quality gate;
3. validates origins, resource names, smoke target, and secret presence;
4. produces and dry-runs the exact-origin Worker config;
5. deploys the Worker and its `IP_HASH_SALT` secret;
6. rebuilds the web artifact with the exact API origin;
7. verifies that no private files, source maps, broad HTTPS CSP, or placeholder sitemap remain;
8. deploys the verified `dist` directory to the existing Pages project;
9. runs production smoke tests.

The lockfile-pinned Wrangler CLI performs both uploads. The Worker secret is supplied through a mode-`0600` temporary file that is removed when the deployment step exits; the value is never printed or committed. A local production dry run runs before either upload.

## Smoke coverage

`pnpm test:smoke` requires `PUBLIC_APP_ORIGIN` and `PUBLIC_API_ORIGIN`. With `SMOKE_FETCH_URL`, it verifies:

- English and Persian application routes;
- `robots.txt` and the exact-origin sitemap;
- CSP, HSTS, framing, no-sniff, referrer, and permissions headers;
- API health response;
- allowed-origin CORS preflight;
- denial of CORS reflection for an unapproved origin;
- one real fetch of the explicitly approved static page.

The smoke command has a 15-second deadline per request and never prints fetched HTML. Rate-limit, timeout, oversized-body, SSRF, redirect, and content-type edge cases remain deterministic integration tests rather than destructive production probes.

## Rollback and incident controls

1. If the frontend is faulty, use the Cloudflare Pages deployments view to roll back to the last known-good production deployment.
2. If the Worker is faulty, use Cloudflare Workers version rollback to restore the last known-good deployment. Do not delete the Durable Object migration or storage during an application rollback.
3. For suspected abuse, set `EXTERNAL_FETCH_ENABLED` to `false` or `DEMO_ONLY_MODE` to `true` in a generated emergency config and deploy only after owner approval. Built-in playgrounds continue to work without the API.
4. Re-run the live smoke suite after rollback. Record deployment/version identifiers and the reason in the release issue.
5. Rotate the API token and `IP_HASH_SALT` if either may have been exposed. Changing the salt resets the anonymous rate-limit identity mapping; this is an expected privacy-preserving consequence.

## Current free-tier envelope

Revalidated against official Cloudflare documentation on 2026-07-14; limits and pricing can change and must be checked again before each public release.

- Workers Free: 100,000 requests per UTC day, 10 ms CPU per invocation, 128 MB memory, and 50 external subrequests per invocation. Cloudflare applies the Free-plan CPU ceiling automatically; the configuration intentionally omits the paid-plan-only explicit CPU limit field. See <https://developers.cloudflare.com/workers/platform/limits/> and <https://developers.cloudflare.com/workers/platform/pricing/>.
- Durable Objects are available on the Free plan only with the SQLite storage backend. ScrapeStudio uses SQLite-backed objects and stores quota counters, not fetched HTML or raw IPs.
- Pages Free: 500 builds per month, one concurrent build, 20-minute build timeout, 20,000 files per site, 25 MiB maximum per asset, and up to 100 custom domains per project. Direct Upload deployments are built in GitHub, so the checked artifact remains the release source. See <https://developers.cloudflare.com/pages/platform/limits/>.
- Product-side survival limits are stricter than platform maxima: five fetches per 10 minutes, 20 per UTC day per anonymous identity, 10-second fetch timeout, 1 MiB HTML ceiling, five redirects, bounded result rows, and browser-rendered scraping disabled.

These are operational ceilings, not a promise of uninterrupted free capacity. If quota pressure appears, the safe response is to lower product limits or enable demo-only mode—not to add billing, accounts, proxy rotation, or bypass behavior to the current release.
