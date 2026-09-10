# Countdown default-style audit

**2026-09-11 — matched inherited-text scope.**
No Countdown source CSS changed. This task adds regression checks and documentation
only; controller behavior, generated files, dependencies and demos are unchanged.

## Reference result

Naive UI 2.45.3 Countdown at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` renders the formatted countdown string
directly. The component has no style module, theme variables, wrapper class, default
font, color, background, border, spacing or animation. Its output inherits its actual
application context.

MarkupUI follows the same ownership decision. The native time/span/div and surrounding
prefixes/units retain authored typography and paint. It does not add a timer card,
status color, monospace family, fixed size or transition.

## Optional native additions

The existing optional stylesheet adds only:

- `font-variant-numeric: tabular-nums` for stable changing digit widths;
- overflow wrapping for long custom literal formats;
- inline-flex wrapping and `.35em` separation for explicitly authored unit targets;
- a visible current-color outline when an authored focusable timer/text target receives
  keyboard focus.

These additions do not override color, background, font size, family, weight or line
height. They also add no animation/transition, which preserves reduced-motion behavior
without a separate policy.

## Retained limits

Custom VNode rendering, locale/theme providers and animated digit transitions remain
outside the native text contract. Application prefixes/unit labels may deliberately
use any surrounding style. This audit does not claim all-font digit metrics, all-browser
focus rendering, timer announcement behavior or alarm delivery.

## Validation and budget

Three checks in the existing Countdown fixture protect the **750-byte** ceiling,
readability/focus additions and absence of component-owned typography/paint/motion.
The fixture has **68 passing Countdown tests**.

| Countdown CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before and after | 322 | 208 | 750 |

Status is **Matched** because the relevant upstream default is inherited text, not
because the omitted renderer/theme surfaces were reproduced.
