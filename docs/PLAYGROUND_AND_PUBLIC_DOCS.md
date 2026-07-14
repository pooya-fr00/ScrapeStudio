# Playground and public documentation

## Purpose

Phase 9 makes ScrapeStudio reviewable without an external URL. Every playground page is original, bundled project content with deterministic structure and bilingual presentation.

The visible demo page and the HTML analyzed by the workspace share the same typed data source. A reviewer can inspect the page first, then use the **Analyze this demo** action to open `/en/scrape?demo=<kind>` or its Persian equivalent. The workspace constructs a local `FetchedPage` and never calls the fetch API for this path.

## Demo matrix

| Kind       | Visible structure                                           | Extraction coverage                                  |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `products` | 12 product cards with title, price, category, and link      | links, images, headings, metadata, repeated patterns |
| `table`    | 8 meaningful schedule rows with five semantic columns       | normalized table headers and rows                    |
| `article`  | long-form article, headings, image, link, metadata, JSON-LD | headings, links, images, metadata, structured data   |

All demo URLs use the reserved `demo.scrapestudio.example` hostname inside the synthetic result. They are identifiers for deterministic extraction output, not external fetch destinations.

## Public documentation routes

Every route has English and Persian variants:

- `/docs` — documentation directory;
- `/methodology` — network and analysis boundary;
- `/security` — threat model and enforced controls;
- `/limitations` — static-page and operational boundaries;
- `/privacy` — network, server, and local-browser data handling;
- `/responsible-use` — proportional and lawful use expectations;
- `/about` — product mission, architecture, and current release scope;
- `/playground` plus `/playground/products`, `/playground/table`, and `/playground/article`;
- `/tools/table-extractor`, `/tools/link-extractor`, `/tools/image-extractor`, `/tools/metadata-extractor`, and `/tools/custom-selector`.

Public documentation pages set localized titles, descriptions, canonical links, Open Graph metadata, and English/Persian `hreflang` alternatives at runtime. The production build finalizer creates an exact-origin sitemap and robots reference only when validated HTTPS frontend/API origins are supplied; the repository does not publish a placeholder sitemap.

## Safety properties

- Demo loading makes no network request.
- Demo HTML is parsed in the same detached `DOMParser` boundary as fetched pages.
- The product demo includes 12 repeated records but remains inside all public extraction caps.
- No third-party media is loaded in result previews.
- All copy and fixture content is original to the project.
- No fetched HTML or result rows are added to local history.

## Test coverage

Automated coverage verifies:

- 12 product cards and repeated-structure input;
- one table with eight normalized data rows;
- article headings, metadata, image, link, and JSON-LD;
- Persian RTL demo generation;
- all three playground navigation and workspace links;
- query-selected demo loading without an API call;
- localized public documentation and tool-guide routes;
- canonical and `hreflang` metadata.
