# ScrapeStudio v1.0.0 release evidence

This record links the public evidence for the first free release. It is historical release evidence, not a reusable checklist and not proof of any manual check that is not represented by a linked artifact.

## Release identity

- Published release: [ScrapeStudio v1.0.0 — Public Release](https://github.com/pooya-fr00/ScrapeStudio/releases/tag/v1.0.0), published on 2026-07-14.
- Git tag: [`v1.0.0`](https://github.com/pooya-fr00/ScrapeStudio/tree/v1.0.0).
- Release commit: [`daa043c49e83f0382b647ae4bc7cd4b8fc232ca0`](https://github.com/pooya-fr00/ScrapeStudio/commit/daa043c49e83f0382b647ae4bc7cd4b8fc232ca0).
- Changelog entry: [`CHANGELOG.md`](../CHANGELOG.md#100--2026-07-14).

The annotated `v1.0.0` tag resolves to the release commit above, which is also the commit used by the successful CI and production runs.

## Automated evidence

- [CI run 29315174898](https://github.com/pooya-fr00/ScrapeStudio/actions/runs/29315174898) completed successfully on the release commit. Its quality-gate job covered the repository's private-file, security, deployment-policy, formatting, lint, type, unit, integration, end-to-end, accessibility, dependency-audit, build, bundle-budget, and documentation-link steps.
- [Production deployment run 29315309023](https://github.com/pooya-fr00/ScrapeStudio/actions/runs/29315309023) completed successfully on the same commit. The job ran the complete quality gate, validated protected production configuration, deployed the Worker and Pages artifacts, and completed the production smoke-test step.

The [published release notes](https://github.com/pooya-fr00/ScrapeStudio/releases/tag/v1.0.0) preserve the release-time test totals and highlight summary. This document does not restate those numbers as current results.

## Published endpoints

The release notes and deployment runbook identify these production endpoints:

- English application: <https://scrapestudio.pages.dev/en>
- Persian application: <https://scrapestudio.pages.dev/fa>
- Bundled product playground: <https://scrapestudio.pages.dev/en/playground/products>
- API health: <https://scrapestudio-api.pooya-fr2005.workers.dev/api/v1/health>

All four endpoints returned HTTP 200 when rechecked on 2026-07-17. The successful production workflow is the retained release-time evidence; a later availability check does not guarantee uninterrupted service.

## Related records

- [Production deployment and rollback runbook](./DEPLOYMENT.md)
- [Implementation status and verification history](./IMPLEMENTATION_STATUS.md)
- [Reusable release checklist](./RELEASE_CHECKLIST.md)
- [Security reporting and supported release](../SECURITY.md)
