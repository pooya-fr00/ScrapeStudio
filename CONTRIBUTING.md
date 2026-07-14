# Contributing to ScrapeStudio

ScrapeStudio is currently built in approved phases. Read `AGENTS.md`, `SCRAPESTUDIO_MASTER_SPEC.md`, and `docs/IMPLEMENTATION_STATUS.md` before changing scope or architecture.

Participation in this repository is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Security reports belong in a private GitHub security advisory rather than a public issue.

## Local workflow

```bash
corepack enable
pnpm install
pnpm check
```

Keep changes small and typed. Add fixture-based tests for extraction behavior and explicit tests for every security-sensitive change. Do not disable tests or lower security limits to make a check pass.

## Product scope

Contributions to the current release must remain free, public, no-signup, bilingual, responsive, and compatible with the documented security model. Do not add accounts, payments, subscriptions, credentialed scraping, private-page access, anti-bot bypass, proxy rotation, cookie import, arbitrary browser automation, or unlimited crawling.

## User-facing changes

- Localize every string in English and Persian.
- Preserve correct LTR and RTL behavior.
- Keep URLs, code, selectors, JSON, and technical identifiers in their natural technical direction.
- Treat mobile as a first-class layout.
- Maintain semantic HTML, keyboard access, visible focus, reduced motion, and reasonable contrast.

## Commit style

Use small conventional messages such as:

```text
feat(web): add localized playground article
test(security): cover redirect target validation
docs(privacy): clarify local history boundary
```

Real deployment, production secrets, paid resources, and destructive repository operations require explicit owner approval.
