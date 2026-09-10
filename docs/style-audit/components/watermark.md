# Watermark default-style audit

**2026-09-11 — overlay mechanics matched; safer native ownership differences retained.**
No Watermark source CSS changed. This task adds regression checks and documentation only;
Canvas generation, generated files, dependencies and demos are unchanged.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the MarkupUI overlay and generation
contracts. The pinned source stylesheet positions a full-size absolute layer, repeats
its background image, disables pointer events and switches fullscreen layers to fixed.

MarkupUI already matches those component-owned overlay mechanics using one authored empty
decorative node. It uses logical `inset:0`, explicit z-index/image/size/position/opacity
variables, inherited corners and the same fixed fullscreen placement.

## Retained ownership differences

The source creates and positions an extra container and can suppress selection. MarkupUI
requires the application to choose an existing positioned wrapper and never changes
selection behavior. Underlying native text, controls and links therefore retain selection,
focus and pointer ownership.

MarkupUI also hides decorative pixels in forced colors and print rather than claiming
that generated alpha colors remain readable or useful in those media.

The generated tile defaults remain deliberately different:

| Metric | Naive UI 2.45.3 | MarkupUI retained default |
| --- | ---: | ---: |
| Mark width × height | 32 × 32px | 160 × 80px |
| x/y gap | 0 / 0px | 40 / 40px |
| Font size / line height | 14 / 14px | 14 / 20px |
| Font color | rgba(128,128,128,.3) | same |

The larger mark and spacing support readable literal text and bounded rotated-fit checks.
They are documented native adaptation defaults, not accidental CSS drift. Whole-layer
rotation, source URL image loading and selection suppression remain omitted.

## Validation and budget

Four checks in the existing Watermark fixture protect the **1,000-byte** ceiling,
reference overlay mechanics, application ownership and forced-color/print policy.
All **61 Watermark tests** pass.

| Watermark CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before and after | 850 | 319 | 1,000 |

Status is **Fixed / Remaining**: overlay defaults match, while tile density and omitted
container/global-rotation behavior remain explicit native differences.
