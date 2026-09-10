# Dynamic Tags default-style audit

**2026-09-11 — Tag/Input density aligned; native values and labelled actions retained.**
Changed Dynamic Tags CSS, its existing fixture and canonical/audit documentation.
Controller code, Dynamic Input/Form sources, generated files and dependencies are
unchanged. No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local native Dynamic Tags demo.
Chromium measured the source's default tag, close control and wrapping container.

The source composes generated Tag/Input/Space components. MarkupUI keeps visible readonly
named fields, one persistent native editor and labelled native buttons. Size, rhythm,
palette and control density are comparison targets; generated close icons and
trigger-to-input replacement are intentionally different.

## Fixed defaults

The reference measured a **28px** medium tag, **14px** text and line-height, **2px**
radius, **7px** inline padding, **14px** close control and **4px 8px** row/column gaps.
Dynamic Tags now uses:

- the source Tag scale of **22 / 28 / 34px** for small / medium / large;
- 12 / 14 / 14px type and 2px default corners;
- 4px × 8px wrapping rhythm and 7px tag inline padding;
- content-sized readonly fields with bounded fallback width;
- matching-height native editor/Add controls and compact labelled remove controls.

`data-round` still creates pills. The visible "Remove tag" action is wider than the
source's icon-only 14px close control by design; text is not hidden to manufacture parity.

## Theme, media and ownership

Default controls use Naive's light `#333639`, white and `#e0e0e6` roles and dark
white-opacity roles. Primary, info, success, warning and error tags use semantic
light/dark border and tint pairs. Public `--mui-tags-*` author overrides remain intact.

Forced colors use Canvas/Button system roles. Print keeps committed native values while
hiding the editor, remove controls and transient status. Dynamic Tags still owns only
its actual native tag anatomy; it does not import or restyle an Input or Tag runtime.

## Validation and budget

Four checks in the existing fixture cover the **1,500-byte** ceiling, size/rhythm,
label visibility, semantic media palettes and print behavior.

| Dynamic Tags CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,571 | 517 | 1,500 |
| After | 4,868 | 1,153 | 1,500 |

Chromium confirmed a **28px** medium tag and editor/Add controls, a **22px** labelled
remove control, 14px tag type, 7px inline padding and 4px × 8px gaps. All **60 Dynamic
Tags tests** pass. No ceiling or package dependency changed. Full integration validation
remains with the parent final pass.
