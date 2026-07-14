# Security policy

## Supported code

Security fixes target the current public free release on the main development line. There is no deployed production service yet; the repository status is recorded in [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).

## Reporting a vulnerability

Please avoid publishing an exploitable report before the maintainer has had a reasonable opportunity to investigate it. Open a GitHub security advisory for the repository when available, or contact the maintainer through the verified profile linked in the project footer.

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
