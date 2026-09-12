# MarkupUI documentation

This is the entry point for the **current ViewElement architecture and full component
rewrite**. Design decisions and implementation status are separate: a documented target
is not automatically a delivered API.

## Choose a topic

| Folder | Read it to |
| --- | --- |
| [architecture](architecture/README.md) | Understand the system boundaries, Web/native profiles, rewrite and metadata design. |
| [api](api/README.md) | Use the implemented shared core and Avatar family. |
| [elements](elements/README.md) | Find an element's contract, unresolved decisions and place in the inventory. |
| [binding](binding/README.md) | Understand optional data binding, scopes, templates and composition. |
| [styling](styling/README.md) | Understand theme resources, CSS ownership and visual review requirements. |

New readers should follow Architecture first, then the relevant Element Contract.
Binding and Styling explain shared rules rather than repeating them in every contract.
Numbered filenames give the reading order within each topic.

## Working on the code

Contributors and AI agents must read the [source layout](architecture/06-source.md) and
[module delivery rules](architecture/07-modules.md) before changing source or packaging.
Shared bundle extraction does not justify a second source tree. End users must be able
to take the core and only the component/plugin JS and CSS they use.

## Documentation rules

Use short, single-word topic folders; avoid hyphenated folder names. Keep numbered
filenames within each topic so the reading sequence is explicit.

Active pages describe the latest selected design and genuine open decisions. They do not
carry old API tutorials, compatibility plans or historical completion reports.
An implemented component's demo page is its API/usage reference. Generate its API tables
from source-generated JSON in demo-only code; keep behavior and accessibility notes in the page's HTML.
Keep Markdown for shared architecture/core guidance and pending design contracts, not
duplicate per-component API pages.
Use `ViewElement` consistently; metadata is development tooling, not a production API. Current implementation
gaps must be stated without presenting older names as a second supported design.

Keep useful previous work in separate archive files. Link it from a dedicated
**References** section, explaining what the reader can learn from it.
Do not treat a past comparison or passing test record as acceptance of the rewrite.

## References

- [Archive](archive/README.md): previous implementations, architecture discussions,
  binding alternatives and pinned visual/API comparisons.
