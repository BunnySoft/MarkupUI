# Calendar default-style audit

**2026-09-11 — default styling fixed; native table differences retained.**
Only Calendar CSS, its existing test fixture and Calendar documentation changed in
this task. Calendar JavaScript, Date Picker, shared themes, generated files,
dependencies and demos are unchanged. No full build or commit.

## Reference and method

Compared the current native Calendar against Naive UI 2.45.3 Calendar source pinned
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2` and the official rendered Calendar.
The native demo loaded the current source stylesheet over its existing isolated page.
Light and dark states used the same Chromium session and measured computed rectangles,
type, colors, borders, radii and shadows.

The reference rendered a div-based seven-column calendar. MarkupUI rendered its
existing captioned table with six rows, 42 cells and native buttons. Measurements
therefore compare owned defaults and state paint, not equal outer width/cell height:
the native demo deliberately gives cells a 5rem application height and uses a wider
stage.

## Matched defaults

| Role | Reference | MarkupUI after |
| --- | --- | --- |
| Body type | 14px / 22.4px | 14px / 22.4px |
| Title | 22px / 22px, weight 500 | 22px / 22px, weight 500 |
| Cell padding | 10px | 10px |
| Controls | 28px high, 10px inline padding, 3px radius | 28px high, 10px inline padding, 3px radius |
| Today number | 25.1979px circle | 25.1979px circle |
| Selected marker | 3px primary bottom bar | 3px primary inset bottom bar |

Light text/title/muted/border values are `#333639`, `#1f2225`, `#c2c2c2` and
`#efeff5`. Dark equivalents are white `.82`, white `.9`, white `.38` and `#2d2d30`.
Today uses `#18a058` with white text in light mode and `#63e2b7` with black text in
dark mode. Hover uses `#f3f3f5` / `#2d2d30`.

The inherited draft initially left cells transparent. On the existing white demo,
dark mode therefore showed dark text roles over a white surface. Calendar now owns
the reference default surface through `--mui-calendar-background`: white in light
mode and `#18181c` in dark mode. Application authors can still override it.

Public Calendar tokens remain authoritative for primary, font size, text, background,
title, padding, border, muted, hover, control radius, Today and focus colors. Theme
selectors provide private scheme defaults rather than replacing public values.

## Native behavior and retained differences

- The native table keeps one caption, an explicit weekday header and 42 bounded cells.
  The reference repeats weekday names in first-row cells and uses a div grid.
- MarkupUI keeps labelled native previous/next/year/today/clear buttons. It does not
  manufacture the reference icon-only navigation, grouped borders, waves or motion.
- Native day buttons retain focus, activation, `aria-current`, `aria-pressed` and
  focusable `aria-disabled` behavior from the existing controller. CSS adds no roles,
  event handling, popup, timestamp or formatter behavior.
- Narrow layouts scroll the table instead of shrinking day/action meaning. Cell
  height and authored notes remain application/content driven.
- Forced colors use Canvas/CanvasText/Highlight/GrayText. Print hides controls and
  live status, exposes the complete table, removes the minimum width and prints a
  black selected marker on white. These rules are structurally covered; this pass
  does not claim all-browser print or assistive-technology parity.

## Validation and budget

The existing Calendar fixture now also checks the unchanged **1,250-byte** CSS
ceiling, measured theme surfaces, native ownership metrics and explicit hidden/media
rules. Calendar behavior and style checks pass together.

| Calendar CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before style pass | 1,809 | 633 | 1,250 |
| After | 4,645 | 1,241 | 1,250 |

No ceiling, dependency or generated artifact changed. Full repository build and
distribution validation remain outside this isolated component task.
