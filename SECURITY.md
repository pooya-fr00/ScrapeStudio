# Security policy

## Supported code

Security fixes target the current free public release on the main development line. ScrapeStudio `v1.0.0` is deployed at [scrapestudio.pages.dev](https://scrapestudio.pages.dev/en); see the [published release](https://github.com/pooya-fr00/ScrapeStudio/releases/tag/v1.0.0), [`docs/RELEASE_EVIDENCE.md`](docs/RELEASE_EVIDENCE.md), and [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) for the recorded release state.

The documented controls reduce risk at the public URL-fetch boundary, but they are not a claim of complete security. Runtime behavior, upstream services, and platform limits can change.

## Reporting a vulnerability

Please avoid publishing an exploitable report before the maintainer has had a reasonable opportunity to investigate it. Open a [private GitHub security advisory](https://github.com/pooya-fr00/ScrapeStudio/security/advisories/new). If that route is unavailable, contact the maintainer through the [verified GitHub profile](https://github.com/pooya-fr00) without disclosing exploit details publicly.

Include:

- the affected route, package, or commit;
- a minimal reproduction that does not target unrelated systems;
- the expected and observed security boundary;
- potential impact;
- any suggested mitigation.

Do not include real credentials, personal data, private URLs, or secrets in a report.

## Important boundaries

ScrapeStudio accepts only supported public HTTP/HTTPS pages and explicitly blocks private-network targets, URL credentials, restricted ports, unsafe redirects, oversized responses, unsupported content types, and unbounded request rates. Remote markup is parsed in a detached document and is never inserted into the live application DOM.

Security controls must not be tested against systems without authorization. Use the bundled local playground and project fixtures for safe reproduction whenever possible.
