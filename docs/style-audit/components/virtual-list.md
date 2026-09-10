# Virtual List default-style audit

**2026-09-11 — matched component-neutral window geometry.**
No Virtual List source CSS changed. This task adds regression checks and documentation
only; windowing behavior, generated files, dependencies and demos are unchanged.

## Reference result

Naive UI 2.45.3 Virtual List at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` is a thin wrapper around vueuc's virtual
list inside `NxScrollbar`. It imports no Virtual List style module and owns no row
typography, color, background, border, spacing or transition.

MarkupUI follows that component-neutral presentation boundary. Its stylesheet contains
only the required fixed-window/list/row geometry, native overflow behavior and focus
visibility. Row content and paint remain application-owned.

## Optional native differences

MarkupUI uses the viewport's native scrollbar rather than importing `NxScrollbar`.
`overflow-y:auto`, `overflow-x:hidden`, `scroll-behavior:auto` and disabled scroll
anchoring support the bounded native window without adding custom scrollbar paint or
smooth-motion policy.

The fixed row height, absolute positioning and zero margins/padding are algorithmic
invariants, not visual defaults. They deliberately differ from the source's dynamic-size
and external vueuc implementation boundary.

The existing focus outline and forced-color Highlight role make the leased native viewport
keyboard-visible without imposing component colors or typography. No animation or
transition is added.

## Retained limits

Custom scrollbar styling, variable-height rows, virtual padding, provider themes and
rendered row defaults remain outside the retained scope. Applications own all row
presentation through their authored elements/classes.

## Validation and budget

Three checks in the existing Virtual List fixture protect the **1,000-byte** ceiling,
fixed geometry, native scrollbar ownership and absence of component paint/typography/
motion. All **47 Virtual List tests** pass.

| Virtual List CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before and after | 859 | 376 | 1,000 |

Status is **Matched** for component-owned defaults; the custom source scrollbar remains
an explicit architectural omission rather than hidden visual parity.
