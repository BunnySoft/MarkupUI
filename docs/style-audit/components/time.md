# Time default-style audit

**2026-09-11 — matched inherited-text scope.**
No Time source CSS changed. This task adds regression checks and documentation only;
formatter/binding behavior, generated files, dependencies and demos are unchanged.

## Reference result

Naive UI 2.45.3 Time at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` renders its formatted text directly or
inside a native `time` element. It imports no style module, applies no component class
and owns no theme variables, font, color, background, border, spacing or transition.
The output inherits its application context.

MarkupUI follows the same ownership decision. The native `time` element, text target
and surrounding author markup retain application typography and paint. It does not add
a timestamp card, fixed size, muted/status color, monospace family or animated changes.

## Optional native additions

The existing optional stylesheet adds only:

- `font-variant-numeric: tabular-nums` for stable changing relative-time digits;
- overflow wrapping for long localized/custom output;
- a visible current-color outline when an authored focusable time target receives
  keyboard focus.

These additions do not override color, background, font size, family, weight or line
height and add no animation or transition.

## Retained limits

Date-fns token rendering, locale providers, arbitrary VNodes and automatic semantic
decoration remain outside the native text contract. Applications may deliberately style
the authored `time` element and prefixes through their normal cascade.

## Validation and budget

Three checks in the existing Time fixture protect the **500-byte** ceiling,
readability/focus additions and absence of component-owned typography/paint/motion.
All **69 Time tests** pass.

| Time CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before and after | 159 | 139 | 500 |

Status is **Matched** because the relevant upstream default is inherited text, not
because omitted provider or renderer surfaces were reproduced.
