# Template Code Generator

ScrapeStudio generates editable starter code from the active custom extraction recipe. Generation is deterministic, runs entirely in the browser, and does not call an AI service.

## Targets

### Python

- Python 3;
- `requests` for bounded-time HTTP fetching;
- `BeautifulSoup` with the built-in `html.parser`;
- JSON output with Unicode preserved.

Install the generated script dependencies with:

```bash
python -m pip install requests beautifulsoup4
```

### JavaScript / Node.js

- Node.js 20 or newer;
- the stable built-in `fetch` API;
- `AbortSignal.timeout` for the request deadline;
- `linkedom` and its documented `parseHTML` API for detached DOM parsing;
- JSON output.

Install the generated script dependency with:

```bash
npm install linkedom
```

The parser choice follows the current [LinkeDOM project documentation](https://github.com/WebReflection/linkedom). Node's current `fetch` and `AbortSignal.timeout` behavior is documented in the [Node.js global APIs](https://nodejs.org/api/globals.html).

## Safety boundary

Generated code is intentionally a transparent starter, not a hosted scraper or a security gateway.

- It includes no cookies, session state, authorization headers, tokens, private credentials, proxy rotation, CAPTCHA bypass, or anti-bot bypass.
- URLs with embedded usernames or passwords are rejected.
- Query parameters whose names look like credentials or secrets are replaced with `REPLACE_WITH_VALUE`; the UI lists the redacted parameter names.
- URL fragments are removed because they are not sent in HTTP requests.
- Requests use a 10-second timeout, a clear ScrapeStudio starter user agent, an HTML content-type check, a 200-item result cap, and a 100-value per-field cap.
- HTML field output is treated as untrusted text and is only serialized to JSON.
- Users are warned that protected or JavaScript-rendered sites may require an authorized, site-specific approach.

The generated examples do not reproduce the Worker's complete SSRF and redirect validation. They are intended for a user-selected public target and must not be adapted into an arbitrary-URL server endpoint without an equivalent network security layer.

## Escaping and tests

Selectors, field names, attribute names, fallback values, and URLs are emitted as language-safe string literals. JavaScript additionally escapes `<`, U+2028, and U+2029 so a generated value cannot break its surrounding source context.

Automated coverage:

- builds both targets from the repeated-card fixture recipe;
- compiles generated Python with an installed Python interpreter;
- parses generated JavaScript with Node's syntax checker in ESM mode;
- verifies quotes, backslashes, newlines, and hostile-looking fallback strings;
- verifies sensitive query redaction and credentialed URL rejection;
- verifies localized UI target switching and Clipboard copy.

Tests validate syntax and the recipe-to-template contract without executing network requests.
