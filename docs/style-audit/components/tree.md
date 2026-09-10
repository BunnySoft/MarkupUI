# Tree style audit

Date: 2026-09-11. Scope: existing native outline appearance only. No new renderer,
binding/template layer, ARIA tree model or keyboard/selection/check implementation.

**Coordinated integration complete:** the isolated release build and all **48 Tree
tests** passed. Parent review added forced-color protection for native checks and disabled
labels. Emitted Chromium CSS changed disabled/inert check opacity from **.5 to 1** and
restored **accent-color:auto / appearance:auto**, without changing live controls.
Final CSS is **1,136/1,250 gzip bytes**; shared hierarchy/controller code is unchanged.

## Dependency boundary

Reported before edits:

- TreeSelect and Cascader consume `tree/hierarchy.ts` (`readTreeHierarchy`, `treeLabel`
  and related types). Cascader also references `TreeLoadResult` as a type.
- Tree and CheckboxGroup use the existing checkbox ownership symbol guard, not a shared
  state engine.
- No hierarchy/controller, consumer or shared file was changed. The build does not
  concatenate Tree CSS into those consumers' standalone stylesheets.

The audit is limited to `tree.css`, Tree tests and component/audit documentation.

## Reference and rendered matrix

- Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Actually rendered `naive-ui@2.45.3`, `vue@3.5.30`, `NTree` under light/default and dark
  providers. Theme, row/switcher/check CSS and content-height calculations were inspected.
- Chromium private contexts, 900×2400 viewport, device scale 1, matching system font and
  320px outlines; a 240px ellipsis case and 280px viewport were also checked.
- Ten cases per theme: plain, block labels, checks, mixed cascade, expanded/collapsed,
  native connecting lines, disabled parent with enabled child, ellipsis and custom indent.
- Native cases bind the existing Tree controller to actual buttons, labelled native
  checkboxes and separate details/summary branches. No reference option renderer is
  transplanted into the component.
- Session `files/tree-style-audit` retains fixtures, stylesheet snapshots, bundle
  measurements and before/reference/after images.

## Corrected row/type/palette defaults

The reference's `nodeHeight:30px` includes wrapper padding. Actual label content is
**24px**, with **3px above and below**; it is not a 30px label plus padding.

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Plain three-row height | 98.375px | 90px |
| Label box height | 30.125px | 24px |
| First label y | 0 | 3px |
| Root text start | 8.667px | 28px |
| Plain Alpha label width | 53.031px | 45.698px |
| Block Alpha text x | 142.146px | 28px |
| Selection weight | bold | normal/default 400 |
| Checkbox dimensions | 13×13px | 16×16px |

Removed the native selection button's frame/padding and permanent selected outline;
the separate focus-visible outline remains. Label typography is 14px/1.5, with 4px start/
6px end padding and a transparent bottom border to align the native text box. Leading
reserve and nested indent default to 24px. A custom 32px indent produced root/child/deep
text starts 36/68/100px, matching the reference's horizontal coordinates.

| State | Light | Dark |
| --- | --- | --- |
| Normal label | `#333639` | white `.82` |
| Disabled label | `#c2c2c2` | white `.38` |
| Hover fill | `#f3f3f5` | white `.09` |
| Pressed fill | `#ededef` | white `.05` |
| Selected fill | `#18a058` at `.1` | `#63e2b7` at `.15` |
| Native checkbox accent | `#18a058` | `#63e2b7` |

Real pointer hover/press confirmed the values, including dark pressed `.05` rather than
an assumed close-button/other-component pressed color. Disabled/inert text is styled at
the control level; checkbox opacity is not placed on row/branch containers.

## Native glyph/layout boundaries

- There is no synthetic switcher. The native selection/check row keeps its leading
  reserve, and the existing named summary remains below it.
- The expanded native example is **174px** high versus upstream **120px** because it has
  two additional native summaries. Collapsed native is **57px** versus upstream **30px**.
- Native checkboxes remain separate from selection buttons, in authored order, with
  their visible naming text. The reference places a custom checkbox before its label;
  this audit does not reorder native controls or erase names to imitate that layout.
- Native check/mixed glyphs and summary markers are browser-owned, not copied artwork.
- `data-tree-lines` retains a simple logical list border. It can consume a fractional
  border width and does not duplicate upstream connector strokes/termination geometry.
- Native button paint is not identical in every selected corner/border pixel. Fixed-origin
  plain/block comparisons had 95/591 differing pixels in light and 97/591 in dark
  (maximum channel difference 7/6 and 9/8 respectively). Both 240×30 ellipsis comparisons
  had **zero differing pixels**. No blanket pixel-parity claim is made.
- Labels/extra controls still wrap without clipping. The 280px viewport had no document
  overflow. Existing keyboard Left/Right semantics are preserved, including their
  documented non-flipped behavior in RTL.

## Real interaction and author checks

- Native Enter selected Alpha once, exposing the existing `aria-pressed` state and one
  `mui:tree-select`; focus retained its 2px outline.
- Right entered Child, Down/Right reached Deep, Left returned to Branch. Programmatically
  collapsing ancestors recovered focused Deep to Parent.
- Native Tab from a selection label reached its checkbox. Space changed checkedness while
  selected keys remained independent.
- Checking the cascade parent updated the four real fields with one check notification;
  restoring only Child recreated the native parent's mixed state.
- Native FormData contained the actual checked values `parent/child/branch/deep`.
- A disabled parent stayed disabled/muted while its enabled child remained normally
  colored and independently checkable. No CSS ancestor rule crosses a node-disabled
  barrier; native inert subtrees are separately unavailable.
- Author 18px text, line-height 2, 40px label height, 5px row padding, 32px indent and
  foreground/selected colors were honored without replacing nodes.
- Nested light scope restored the light label color; native direction stayed RTL.
- Later legacy CSS changed none of the measured normal fields. Forced colors retained
  readable system text, selected border indication and visible focus.

The retained disabled/check ownership behavior is covered by the existing Tree suite;
the CSS audit does not rewrite ARIA or checkbox state. No shared consumer changes were needed.

## Validation and payload

| Asset | Isolated gzip bytes | Unchanged ceiling |
| --- | ---: | ---: |
| Tree ESM | 7,710 | 9,000 |
| Tree classic | 7,860 | 9,000 |
| Tree CSS | 1,102 | 1,250 |

- `pnpm test -- tests\tree.test.ts`: **48 tests passed**.
- No dependency, renderer, shared/index/generated edit, full build or commit was added.
  Parent owns the isolated release build and downstream aggregate validation.
- Chromium only. Native glyphs, separate controls, arbitrary authored content, other
  browser engines and spoken accessibility require downstream verification.
- See [Tree](../../components/tree.md) for unchanged state, form, loading, keyboard and
  ownership contracts.
