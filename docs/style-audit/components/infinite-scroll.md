# Infinite Scroll default-style audit

**2026-09-11 — matched component-neutral scrolling surface.**
The stylesheet was narrowed and regression checks were added. Controller behavior,
generated files, dependencies, demos and shared audit indexes are unchanged.

## Reference result

Naive UI 2.45.3 Infinite Scroll at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` contains only `index.ts` and
`src/InfiniteScroll.tsx` outside its demos. The component imports no style module,
defines no theme variables and owns no viewport height, border, padding, status color,
typography, spacing, cursor or motion.

Its renderer delegates scrolling to `NxScrollbar` and passes through the authored
default slot. That custom scrollbar is a separate component dependency; its chrome is
not an Infinite Scroll-owned default.

## MarkupUI correction

MarkupUI retains its native implementation boundary but no longer supplies an invented
panel skin. The optional stylesheet removes the default 20rem maximum height, border,
padding, message margins, red error color, disabled cursor, print border reset and
blanket print hiding of authored controls/status messages.

Applications now own viewport sizing and all content/status paint through ordinary CSS.
The existing height hook remains available as an explicit author opt-in with no-maximum
fallback. No replacement palette, spacing scale, theme token or scrollbar styling was
introduced.

## Optional native differences

The stylesheet still provides native `overflow:auto`, min-content safety, the 1px
IntersectionObserver sentinel, current-color focus outlines, reduced-motion
`scroll-behavior:auto`, and print overflow/sentinel handling. These rules support the
native observer/manual-control anatomy without styling application items or statuses.

MarkupUI continues to use the browser scrollbar instead of `NxScrollbar`. Exact rail,
thumb, hover and overlay behavior therefore remains platform-owned and is not claimed
as visual parity.

## Validation and budget

Three checks in the existing Infinite Scroll fixture protect the unchanged
**1,000-byte** ceiling, required native geometry/focus/media behavior and the absence of
component paint, spacing, default height, status styling and motion. All **62 Infinite
Scroll tests** pass.

| Infinite Scroll CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,318 | 462 | 1,000 |
| After | 706 | 305 | 1,000 |

Status is **Matched** for component-owned defaults. It does not claim custom-scrollbar
or full framework API parity.
