# Split default-style audit

**2026-09-11 — handle palette aligned; accessible track and native grid retained.**
Changed Split CSS, its existing fixture and canonical/audit documentation. Controller
geometry, generated files, dependencies and demos are unchanged. No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local native Split implementation.
Chromium measured horizontal, vertical and nested source examples.

The source renders flex panes and a **3px** resize trigger using the border color,
primary hover color and a 0.3s standard-bezier background transition. MarkupUI uses an
accessible native separator in CSS grid with keyboard/pointer behavior. Trigger palette
and transition are comparison targets; layout topology and interaction ownership remain
intentionally different.

## Fixed defaults

The separator now uses:

- light/dark neutral roles `#e0e0e6` / white 24% at rest;
- primary-hover roles `#36ad6a` / `#7fe7c4` on hover and drag;
- the source's 0.3s `cubic-bezier(.4, 0, .2, 1)` background transition;
- primary light/dark focus color with an inset visible outline.

The existing public `--mui-split-handle-*` and focus overrides remain available.
Reduced motion removes transition duration, forced colors use Canvas/CanvasText/Highlight,
and print hides the nonfunctional separator while placing panes in normal flow.

## Retained geometry difference

MarkupUI deliberately keeps a **12px** separator track instead of the source's 3px
mouse-only trigger. That larger target supports the named focusable separator and pointer
capture contract. It remains an owned grid track; pane dimensions, requested/effective
size handling, RTL, bounds and suspension behavior are unchanged.

The source hides pane overflow. MarkupUI retains native pane scrolling because original
forms/content remain usable and impossible bounds have an explicit stacked fallback.

## Validation and budget

Four checks in the existing fixture cover the **1,500-byte** ceiling, semantic palette,
public overrides and forced-color/reduced-motion/print behavior.

| Split CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 3,198 | 773 | 1,500 |
| After | 3,618 | 894 | 1,500 |

Chromium confirmed the retained **12px** horizontal track, neutral `rgb(224, 224, 230)`
rest state and 0.3s transition. All **52 Split tests** pass. Full pointer/keyboard/build
integration remains with the parent final pass.
