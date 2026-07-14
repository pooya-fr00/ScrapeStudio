# Smart Repeated-Structure Detection

ScrapeStudio's repeated-structure detector is a deterministic, client-side heuristic. It does not use an AI model and does not promise perfect detection.

## Processing boundary

1. The fetched HTML is parsed into a detached document on the main browser thread.
2. ScrapeStudio builds a compact, serializable structural snapshot with strict caps.
3. Only the snapshot is posted to a dedicated module Web Worker; raw HTML and live DOM nodes are not transferred.
4. The Worker scores repeated sibling groups and returns at most five candidates.
5. Selecting a candidate creates an editable custom recipe. Nothing is saved until the user explicitly saves it.

The detector UI and runtime module are lazy-loaded. The Worker bundle is separate from the main application bundle.

## Safety and performance limits

| Limit                               |  Value |
| ----------------------------------- | -----: |
| Snapshot nodes                      |  2,500 |
| Element children inspected per node |     80 |
| Snapshot depth                      |     12 |
| Minimum repeated items              |      3 |
| Returned candidates                 |      5 |
| Suggested fields per candidate      |      4 |
| Worker execution timeout            | 750 ms |

Snapshot construction stops when any relevant cap is reached and reports truncation. Worker timeout overrides are hard-capped at two seconds.

If Worker creation is unavailable or fails, the same bounded heuristic runs after yielding one task to the browser. If an active Worker reaches its timeout, it is terminated and no synchronous heavy fallback is attempted. Quick and custom extraction remain available in every failure mode. Navigating away or starting another page aborts and terminates in-flight analysis.

The API exposes the Boolean `features.smartDetection`, sourced from `SMART_DETECTION_ENABLED`. This acts as an operational safety switch for remotely fetched pages. The bundled no-network demo remains available for deterministic local review.

## Candidate scoring

Direct siblings are grouped by a bounded structural signature containing tags and child-tag sequences. Candidate scores consider:

- three or more repeated sibling shapes;
- a class token shared by every item;
- meaningful text across most items;
- links and images across most items;
- semantic `article` items;
- non-trivial subtree size.

Items inside `header`, `nav`, or `footer` are strongly penalized. Table rows, cells, form options, scripts, and styles are excluded from candidacy. Tiny groups without meaningful text, links, or images are penalized.

The displayed confidence is a relative heuristic score, not a calibrated probability.

## Suggested recipes

The detector prefers a shared card-like class for the item selector. It can suggest up to four common descendant fields:

- heading or title-like element → `title` text;
- price/cost/amount-like class → `price` text;
- anchor → absolute `url` via `href` mode;
- image → absolute `image` via `src` mode.

Suggestions are passed through the existing custom-selector validation before extraction. Users can edit, remove, or add fields before running or saving the recipe.

## Expected false positives and negatives

Possible false positives include visually unrelated components that happen to share the same HTML shape, generic list grids outside navigation, and repeated layout wrappers with enough text. A suggested selector can also match similar items elsewhere on the page.

Possible false negatives include:

- fewer than three items;
- cards with substantially different child structures;
- deeply nested content beyond the snapshot cap;
- content created after load by page JavaScript;
- repeated items hidden behind shadow DOM or frames;
- useful data whose class names and tags provide too little common structure.

For these reasons, the interface calls results suggestions, explains the detection signals, and asks the user to review the generated custom recipe.

## Test coverage

- six repeated workshop cards are detected from a local fixture;
- product cards produce title, price, URL, and image fields;
- navigation-only lists and ordinary article paragraphs are rejected;
- pathological markup respects node and candidate caps;
- Worker success, unavailability, timeout, and cancellation are covered;
- UI candidates convert into editable custom recipes;
- the production build emits separate detector and Worker chunks.
