# Secure Fetch Boundary

This document records the Phase 2 security boundary for ScrapeStudio's static-page fetch API. It is an implementation note, not a claim of perfect SSRF protection.

## Request flow

`POST /api/v1/fetch-page` performs these steps before returning remote HTML:

1. Validate the JSON body with Zod.
2. Parse and normalize the URL with the WHATWG URL parser.
3. Reject credentials, non-HTTP(S) protocols, nonstandard ports, local/internal hostnames, cloud metadata targets, and non-public IP literals.
4. Apply anonymous short-window and UTC-day quotas.
5. Fetch with `redirect: "manual"` and one overall abort deadline.
6. Resolve and fully revalidate every redirect target.
7. Accept only `text/html` or `application/xhtml+xml` responses.
8. Enforce the HTML byte cap from both `Content-Length` and the streamed body.
9. Return a stable JSON envelope. Remote HTML is never persisted by the Worker.

The Worker configuration enables Cloudflare's `global_fetch_strictly_public` compatibility flag. This complements application-level IP-literal checks by keeping global `fetch()` on the public Internet path. Deploying the API on another runtime would require an equivalent DNS resolution, address validation, rebinding defense, and destination-pinning design.

## Current limits

- Protocols: HTTP and HTTPS only.
- Ports: default, 80, or 443.
- Redirects: at most 5.
- Overall fetch timeout: 10 seconds.
- HTML response body: at most 1 MiB.
- Anonymous short window: 5 fetches per 10 minutes.
- Anonymous UTC-day quota: 20 fetches.

All operational values can be reduced without a code release. Hard upper bounds prevent accidental configuration from silently removing the principal safeguards.

## Anonymous rate-limit identity

The identity is a SHA-256 digest of:

- a deployment salt;
- the edge-provided IP address;
- an optional browser UUID.

Only the digest is used as the Durable Object key. Raw IP addresses and submitted URLs are not stored in rate-limit state. Each identity uses a SQLite-backed Durable Object with fixed short-window and daily counters; an alarm removes stale counter rows.

## Logging and data handling

Structured logs are limited to request ID, route, hostname, outcome/error code, upstream status, duration, and response byte length. Query strings, raw IP addresses, response HTML, and stack traces are excluded.

Fetched HTML exists only for the duration of the request and in the returned response. The backend has no account database and no fetched-page persistence.

## Safety switches

The runtime configuration can:

- reduce fetch and quota limits;
- disable external fetching;
- force demo-only mode;
- keep smart detection disabled;
- keep experimental browser fetching disabled.

Smart detection and browser-rendered fetching are not implemented in Phase 2. Their flags default to disabled so later phases cannot accidentally expose them.

## Known boundary

This endpoint fetches static public HTML only. It does not execute page JavaScript, send cookies or credentials, bypass anti-bot systems, crawl a site, or access authenticated/private pages. A destination can still refuse automated requests, return misleading content, or change between requests.
