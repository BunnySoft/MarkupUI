# Dynamic Input default-style audit

**2026-09-11 — row/action layout fixed; native templates and labels retained.**
Changed Dynamic Input CSS, its existing fixture, the composition demo and canonical/
audit documentation. Controller code, Input/Form sources, generated files and
dependencies are unchanged. No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local native Dynamic Input demo.
Chromium measured the source's input preset rows and the native pair-row composition.

The source uses generated Input presets and icon actions. MarkupUI uses authored labels,
real fields and readable native action buttons. Spacing/alignment and control density
are comparison targets; exact action width/icon topology is intentionally different.

## Fixed layout

Reference input rows measured **34px** high, **10px** apart, with a **20px** margin
between the field/preset and its action group. The native result now uses:

- 10px between owned rows;
- 20px between the flexible field grid and actions;
- bottom alignment so actions line up with controls beneath authored labels;
- 34px action height, 10px inline padding and 3px radius;
- 34px standalone fields with 12px inline padding and the common field palette.

The source action area was 68px for icon controls. Native action width remains
label/content driven so "Move up", "Add after" and "Remove row" stay visibly usable.
No text is hidden to manufacture icon-only parity.

## Input composition ownership

The previous generic selector styled every descendant input/select/textarea, including
`data-input-control` fields already owned by Input. Dynamic Input now excludes those
controls. With Input CSS loaded, the rendered composed field is **34px** high with
12px wrapper padding and a zero-padding owned input; Dynamic Input actions remain 34px.

The demo previously loaded Input JavaScript but omitted Input CSS, masking that omission
through the competing Dynamic Input selector. It now links `markup-ui-input.css`
explicitly. This is a dependency declaration in demo HTML, not a runtime CSS import.

## Themes, media and retained differences

Standalone fields/actions use `#333639`, white and `#e0e0e6` in light mode, with
white `.82`, white `.1` and white `.24` in dark mode. Hover uses the primary hover
role and disabled buttons use the muted role. Forced colors retain Canvas/CanvasText/
GrayText; print hides structure-changing buttons while preserving current native rows
and field values.

MarkupUI does not add source preset renderers, icon assets, drag sorting, object models,
provider spacing or automatic field generation. Responsive pair fields still stack
below 30rem, and native labels/content may increase row height.

## Validation and budget

Four checks in the existing fixture cover the **1,000-byte** ceiling, measured spacing/
alignment, Input exclusion and native responsive/media behavior. All **55 Dynamic Input
tests** pass.

| Dynamic Input CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,159 | 414 | 1,000 |
| After | 2,719 | 783 | 1,000 |

No ceiling or package dependency changed. Full Input/Form/build validation remains with
the parent integration pass.
