# Tree Select style audit

**Integrated.** Scope: existing native select/listbox plus passive authored hierarchy.
No popup tree renderer, checkbox cascade, tag renderer, binding or template work.

## Dependency boundary

Reported before edits:

- `tree-select.ts` composes parent-owned `select/select.ts` and `tree/hierarchy.ts`.
- No shared Select, Tree hierarchy, Popover, or consumer source was edited.
- Select's matching public CSS tokens are reused as fallbacks; its stylesheet is not
  imported or made mandatory. Tree Select keeps a complete standalone control surface.
- The native implementation does not call a Popover/floating helper. An upstream popup
  cannot be reproduced by editing these native-control styles alone.

Only the Tree Select stylesheet, its tests and component/audit documentation changed.

## Actual reference and method

- Pinned source: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered `naive-ui@2.45.3`, `vue@3.5.30`, real `NTreeSelect` in default light/dark
  providers, including forced-open ordinary and checkable popup cases.
- Eleven cases per theme: empty, selected, tiny/small/large, disabled, multiple, filtering,
  visible passive source, open popup and open checkable popup.
- Dedicated installed Chrome 151 headless process/profile and a private browser context,
  900×1500 viewport, device scale 1, matching system font and 320px fixture width.
  The shared browser was not used or modified. No browser package was installed.
- Session `files/tree-select-style-audit` retains fixtures, screenshots, source/peer
  measurements and native verification results.
- Reference popup cases are compared with an explicitly authored visible native listbox
  alternative. This is not a screenshot of an OS-native dropdown popup or a claim that
  native options have become framework DOM rows.

## Trigger defaults corrected

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Selected dropdown width in 320px wrapper | 171.188px | 320px |
| Medium dropdown height | 34.188px | 34px |
| Tiny height / font | 34.188px / 14px | 22px / 12px |
| Small height | 27.781px | 28px |
| Large height / font | 42.188px / 14px | 40px / 15px |
| Default radius | browser default | 3px |
| Native control padding | 5.6px all sides | 0 / 12px |

The native control fills the available field width and uses minimum heights rather than
fixed heights, preserving the native multiple/listbox `size` behavior. Native arrow and
option appearance are not suppressed. Caption labels, source, status/readout and clear
content remain authored rather than a generated trigger shell.

The reference uses an overlay border and 12px leading text padding; native select borders
and its arrow consume browser-controlled space. Full-path native text differs from the
reference's default leaf label. Exact trigger-glyph/inset pixel parity is not claimed.

| Control role | Light | Dark |
| --- | --- | --- |
| Text | `#333639` | white `.82` |
| Background | `#fff` | white `.1` |
| Border | `#e0e0e6` | transparent |
| Disabled text | `#c2c2c2` | white `.38` |
| Disabled background | `#fafafc` | white `.06` |

These values were compared with actual reference inner-selection surfaces, not its
transparent outer wrapper. The native focus treatment remains a visible outline; it
does not duplicate the upstream open-state shadow/border composition.

## Popup, row and check limits

The real reference popup measured **320×158px**, with 3px corners. Its theme specifies
4px menu padding and a `34px × 7.6` maximum tree height. Background was white in light
and `#48484e` in dark, with the theme's actual popup shadow.

Reference rows had **24px content boxes plus 3px wrapper padding per edge**. The selected
ordinary popup row used green `.1` / `.15` fill. The checkable popup rendered five 16px
checkboxes, including a mixed parent and checked README.

None of that is fabricated in the native target:

- A five-row native listbox measured **102px**, versus the reference's 34px closed
  multiple-tag trigger and 158px floating popup.
- Native rows, selection highlight, arrow and popup/listbox gestures remain browser-owned.
- Native multiple selection of Documents and README submits two independent keys; it does
  not create a checked/mixed parent or cascading descendant state.
- Native option text is always the full path. Empty enhanced selection remains a blank
  native unselected state, not a generated “Choose file” placeholder.
- The passive hierarchy stays authored; it is visible only when the author leaves it
  visible. Its native details are not a second interactive picker.

These are retained architecture limits, not missing shared Popover changes.

## Author, form, keyboard and ownership verification

- Native ArrowDown changed README→Notes and then skipped disabled Archive paths to
  Standalone. Focus stayed on the original select, with a 2px visible outline.
- FormData contained the selected native key; a disabled select retained its valid value
  while producing no successful field.
- Filtering by “Standalone” preserved selected README, hid unselected Notes and kept
  FormData unchanged. No custom tree-search or check engine was added.
- Independent multiple values `docs/readme` remained two native successful values, with
  **zero checkbox inputs** in the native fixture.
- Renaming the passive README source updated the same option to “Documents / Read me”;
  original control, option and native label identities remained unchanged.
- Author overrides produced 46px height, 18px font, 20px inline padding, 8px radius,
  requested foreground/background/border colors and requested focus color.
- Loading parent-owned Select CSS afterward preserved Tree Select defaults in both
  themes and did not defeat the component-specific focus override.
- The passive source's root list had 0px start padding and nested list 24px. No Tree
  controller was initialized on that source.
- Forced colors restored Canvas/CanvasText/GrayText control styling. Print used a light
  field scheme with readable disabled text and border.
- At a 280px viewport with RTL, the control fit its 240px available width and the document
  had no horizontal overflow. Native direction, form attributes and source nodes stayed intact.

## Validation and payload

| Asset | Isolated gzip bytes | Unchanged ceiling |
| --- | ---: | ---: |
| Tree Select ESM | 8,844 | 9,000 |
| Tree Select classic | 8,977 | 9,000 |
| Tree Select CSS | 845 | 1,250 |

- `pnpm test -- tests\tree-select.test.ts`: **39 tests passed**.
- Classic JS has only **23 bytes** of headroom; no runtime change was made.
- No new production dependency, shared/index/generated edit, full build, commit or
  broadcast. Parent owns the isolated release build and aggregate validation.
- Chromium only. Modern palette CSS, OS option rendering, other browsers and spoken
  accessibility need downstream consideration; no framework-popup pixel parity is claimed.
- See [Tree Select](../../components/tree-select.md) for unchanged state, projection,
  ownership, native handoff and form contracts.

## Integration

The isolated release build and **79 Tree Select/Select tests** passed. Actual emitted
CSS is **3392 raw / 845 gzip bytes**, below the unchanged **1250-byte ceiling**.
ESM/classic remain **8844/8977 gzip bytes**, each below 9000.
Shared Select/Tree sources and controller behavior remain unchanged; native popup,
listbox and path-label differences are not described as full visual parity.
