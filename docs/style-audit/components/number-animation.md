# Number Animation default-style audit

**2026-09-11 — matched inherited-text scope.**
No Number Animation source CSS changed. This task adds regression checks and
documentation only; controller behavior, generated files, dependencies and demos are
unchanged.

## Reference result

Naive UI 2.45.3 Number Animation at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` renders its formatted integer, decimal
separator and fraction directly. It imports no style module, applies no wrapper class
and owns no theme variables, font, color, background, border, spacing or transition.
The text inherits its application context.

MarkupUI follows the same visual ownership decision. The native data/span/div/p target,
prefix and surrounding content retain authored typography and paint. It does not create
a statistic card, monospace family, fixed size, status color or animated digit layout.

## Optional native additions

The existing optional stylesheet adds only:

- `font-variant-numeric: tabular-nums` for stable changing digit widths;
- overflow wrapping for long formatted or custom literal output;
- a visible current-color outline when an authored focusable numeric target receives
  keyboard focus.

These additions do not override color, background, font size, family, weight or line
height. They add no CSS animation or transition; all optional motion remains owned by
the requestAnimationFrame controller and its reduced-motion contract.

## Retained limits

Provider locale/theme injection, generated integer/fraction fragment styling and custom
VNode rendering remain outside the native text contract. Applications may deliberately
style the output through its surrounding context or authored classes.

## Validation and budget

Three checks in the existing Number Animation fixture protect the **500-byte** ceiling,
readability/focus additions and absence of component-owned typography/paint/motion.
All **65 Number Animation tests** pass.

| Number Animation CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before and after | 183 | 147 | 500 |

Status is **Matched** because the relevant upstream default is inherited text, not
because omitted provider or renderer surfaces were reproduced.
