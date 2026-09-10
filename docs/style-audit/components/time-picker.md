# Time Picker default-style audit

**2026-09-11 — native trigger density aligned; labelled clear and platform picker retained.**
Changed Time Picker CSS, its existing fixture and canonical/audit documentation.
Controller code, temporal probes, generated files, dependencies and demos are unchanged.
No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local native Time Picker demo.
Chromium measured source small, medium and large triggers.

The source uses generated Input and a custom scrolling time panel. MarkupUI keeps one
native `input[type=time]`, its platform picker and an optional labelled clear button.
Trigger density and palette are comparison targets; popup columns, icons, actions and
timezone/format models remain intentionally omitted.

## Fixed defaults

The source measured **28 / 34 / 40px** for small / medium / large, with 14 / 14 / 15px
type, 12px inline padding, 3px corners and the standard Input palette. Time Picker now
uses those same component-owned metrics for its native field and labelled clear action.

Light mode uses `#333639`, white and `#e0e0e6`; dark mode uses the corresponding
white-opacity roles. Hover uses primary-hover colors, disabled controls use native
GrayText, and public `--mui-time-picker-*` field overrides remain available.

The clear action remains content-width and visibly labelled instead of becoming the
source's icon inside the trigger. Native locale-specific time segments and picker
indicator remain browser-owned.

## Media and retained differences

Forced colors uses ButtonText/ButtonFace. Print hides the enhancement-only clear button
while retaining the native field value and readout. No CSS attempts to restyle or replace
the browser's picker popup, twelve-hour presentation or precision UI.

The fieldset/legend, labels, native min/max/step behavior and midnight-wrapping constraints
remain unchanged.

## Validation and budget

Four checks in the existing fixture cover the **1,000-byte** ceiling, reference sizing,
label visibility and forced-color/print behavior.

| Time Picker CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 861 | 388 | 1,000 |
| After | 2,705 | 686 | 1,000 |

Chromium confirmed a **34px** medium field and labelled clear action, 14px type, 12px
inline padding, 3px corners and the reference light palette. All **68 Time Picker tests**
pass. Full Date Picker/Form/build integration remains with the parent final pass.
