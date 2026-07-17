# Release checklist template

Use this reusable checklist when preparing a free public release. Its unchecked boxes describe work to perform for the next release; they are not a claim that `v1.0.0` omitted those checks. Record the commit, reviewer, date, production URLs, and command output in the release issue or pull request.

The repository keeps the verified production record for `v1.0.0` in [RELEASE_EVIDENCE.md](./RELEASE_EVIDENCE.md). Do not copy completed states from that record into a future release without new evidence, and do not mark production-only items complete against localhost or a dry run.

## Source and automated gate

- [ ] Confirm the release contains no account, payment, subscription, premium, credentialed-scraping, anti-bot, CAPTCHA-bypass, proxy-rotation, or private-page feature.
- [ ] Run `pnpm install --frozen-lockfile` on a clean checkout.
- [ ] Run `pnpm check` and attach the successful output.
- [ ] Run `pnpm check:private-files`; confirm `poya.txt` is not tracked or published.
- [ ] Run `pnpm audit:dependencies`; review every reported advisory rather than suppressing the command.
- [ ] Inspect the diff for secrets, `.env*`, `.dev.vars`, tokens, account identifiers, debug logs, disabled tests, and unresolved release TODOs.
- [ ] Confirm local documentation links with `pnpm check:docs`.

## Product and accessibility

- [ ] Test English and Persian routes, natural copy, LTR/RTL direction, and route-preserving language switching.
- [ ] Test light, dark, and system themes.
- [ ] Test 320 px and 390 px mobile, tablet, and desktop layouts with no document-level horizontal overflow.
- [ ] Test keyboard-only navigation, skip link, focus order, visible focus, mobile focus trap, Escape dismissal, dialogs, and validation errors.
- [ ] Test at 200% browser zoom and with reduced motion enabled.
- [ ] Run a manual screen-reader smoke test on landing, workspace, results, recipes, and history.

## Security and data handling

- [ ] Test localhost, private/reserved IPv4, IPv6, metadata IP, embedded credentials, unsupported protocols, and blocked ports.
- [ ] Test allowed redirect chains, blocked redirect targets, redirect limits, timeout, non-HTML content, and oversized HTML.
- [ ] Test short-window and daily anonymous rate limits.
- [ ] Confirm fetched HTML is not injected into the live DOM, persisted by the server, or stored in local history.
- [ ] Test CSV formula-injection mitigation and JSON/recipe import validation.
- [ ] Verify exact production CORS origins and review deployed CSP, HSTS, no-sniff, referrer, permissions, and framing headers.

## Product workflows

- [ ] Run all three built-in playground demos without an external request.
- [ ] Test quick table, link, image, heading, and metadata extraction.
- [ ] Build and run a multi-field custom selector recipe.
- [ ] Save, rename, duplicate, export, import, reopen, and delete a local recipe.
- [ ] Download JSON and CSV; reopen and clear local history.
- [ ] Generate and syntax-check Python and JavaScript starter code.
- [ ] Verify smart repeated-structure analysis remains bounded, cancelable, and non-blocking.

## Production-only Phase 11 gate

- [ ] Approve the exact frontend and API origins before deployment.
- [ ] Revalidate current Cloudflare free-tier limits and deployment behavior against official documentation.
- [ ] Configure production variables and secrets outside the repository.
- [ ] Run `pnpm build:production` with the exact origins; verify the generated sitemap, `robots.txt`, and exact API CSP.
- [ ] Verify README live links and truthful screenshots from the finalized release artifact.
- [ ] Deploy the frontend and API only after owner approval.
- [ ] Run live health, fetch, playground, CORS allow/deny, and security-header smoke tests.
- [ ] Keep rate-limit, timeout, redirect, SSRF, content-type, and oversized-response edge cases in deterministic integration tests rather than destructive production probes.
- [ ] Confirm no secrets or private files exist in the checked deployment artifacts.
- [ ] Record the final frontend URL, API URL, free-tier limits, and rollback procedure in [DEPLOYMENT.md](./DEPLOYMENT.md).
- [ ] Retain the successful protected GitHub Actions run as release evidence.
