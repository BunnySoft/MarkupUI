# Checkbox default-style audit

## Scope and result

Audited **2026-09-10** from MarkupUI **`8cc4a49`**. Geometry, typography, label colors,
semantic accents and focus-ring values now align with the retained reference cases.
**Native checkbox paint is not exact Naive parity**: browser-rendered unchecked/disabled
surfaces, hover borders and check/mixed glyphs remain intact. No native input hiding,
`appearance:none`, SVG copying, replacement role, event emulation, binding or template
layer was introduced. Group helper JavaScript and shared files are unchanged.

Reference: rendered **Naive UI 2.45.3 / Vue 3.5.30**, backed by source revision
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox).
Inspected `styles/light.ts`, `styles/dark.ts`, `styles/_common.ts` and
`src/styles/index.cssr.ts`. Reference packages are fixture-only, not dependencies.

Real Chromium **151.0.7922.174**, isolated contexts, **1000×1000** viewport and
340px fixture columns. Separate reference/native pages used private loopback **62900**,
the same inherited system font stack and light `#fff` / dark `#101014` canvases.
Cases use “Planning updates”, a long accessibility-review label, and
“Design / Engineering / Documentation” groups. Native groups retain a real
“Review topics” legend; no customer data or services are involved.

Private artifacts: session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\checkbox-audit-private`, containing authored
fixture pages/cases/server, `before.css`, `measurements.json`, six before/reference/after
light/dark PNGs, and isolated `budgets.mjs`/`budgets.json`. Each comparison used a new
browser context and settled reference transitions. Screenshots and native-control pixel
histograms were actually obtained; computed native `background-color: transparent`
alone does **not** describe its rendered skin.

## Measured geometry

All dimensions are CSS pixels; fractional values reflect this browser's layout rounding.
Checked, unchecked and mixed variants have the same dimensions in both schemes.

| Metric | Before | Reference = after |
| --- | ---: | ---: |
| Small native box / font | 16 / 14 | 14 / 14 |
| Medium native box / font | 18 / 16 | 16 / 14 |
| Large native box / font | 22 / 18 | 18 / 15 |
| Small row height / box top | 21 / 2.667 | 22.3958 / 4.1979 |
| Medium row height / box top | 24 / 2.667 | 22.3958 / 3.1979 |
| Large row height / box top | 27 / 2.667 | 24 / 3 |
| Small / medium / large visible text inset | 23 / 26 / 31 | 22 / 24 / 26 |
| “Planning updates” medium total width | 148.4271 | 139.125 |
| Long-label height at 340px | 72 | 44.7917 |

Native labels use an 8px gap plus 8px trailing space; reference labels use 8px padding
on both sides of their text node. The visible text offsets and overall widths match,
although those text wrapper rectangles intentionally differ.
Top inline alignment also removes surplus native-control baseline space: the medium
fixture section, including its heading, is **47.59375px** like the reference rather
than **50.125px** before that alignment correction.

Group member widths now match individually: **74.6458 / 105.6354 / 127.8438px** for
Design/Engineering/Documentation. Removing the extra item gap avoids double spacing.
An inherited small group measures **14px** boxes; an explicit medium child measures
**16px**, with the following inherited-small child remaining **14px**.

The group envelope is a retained native adaptation, **not** a matched Naive container.
Its real fieldset/legend, 12px padding and boundary produce **69.4583px** height versus
the reference bare group's **22.3958px**; the old native group was **116.6667px** and
wrapped its last item at this width. No legend was hidden or replaced to force equality.

## Paint: fixed versus native-owned

| Authored role | Before | After / reference |
| --- | --- | --- |
| Light label | `#17212b` | `#333639` |
| Dark label | Light default | White 82% |
| Disabled label, light / dark | `#64707a` in both | `#c2c2c2` / white 38% |
| Checked and mixed accent, light / dark | Blue `#075eae` | `#18a058` / `#63e2b7` |
| Keyboard-focus ring | Solid blue, 3px offset | `0 0 0 2px`, accent 30% |
| Group boundary, light / dark | `#687787` | `#e0e0e6` / white 24% |

Neutral roles are local fallbacks because shared legacy neutrals are not equivalent to
the pinned theme. Shared primary/warning/error semantic roles are reused correctly.
Native `color-scheme` now follows the explicit component theme. Focus color-mix values
may serialize as `color(srgb …)` rather than reference `rgba(…)`, with equal channels.

Actual **16×17 screenshot crops** of nominal 16px controls include fractional-edge
rasterization. Dominant interior pixels make the remaining differences measurable:

| Case | Reference RGB | Native after RGB |
| --- | --- | --- |
| Light checked/mixed fill | 24,160,88 | 24,160,88 |
| Dark checked/mixed fill | 99,226,183 | 99,226,183 |
| Dark unchecked fill over the page | 16,16,20 | 59,59,59 |
| Light disabled unchecked fill | 250,250,252 | 248,248,248 |
| Light disabled checked/mixed fill | 250,250,252 | 209,209,209 |
| Dark disabled checked/mixed fill | 30,30,33 | 117,117,117 |

The native unchecked light edge contains gray **118,118,118**, becoming **79,79,79**
on hover; reference hover uses the primary-colored boundary. Tick/mixed shape, mark
contrast and native corner rendering also differ. These are browser-skin boundaries,
not claimed fixes: styling them exactly would require abandoning the retained native
skin. Native `appearance: auto` remains true before/after, including forced colors.

All seven public tokens were exercised on a dark, explicitly small checkbox or error
group: **20px font, 24px box**, authored label/disabled colors, purple accent, blue focus
ring and red group boundary all won. Public tokens are never reassigned by defaults.
Temporary group `aria-disabled` does not dim labels as native disabling would; it
continues to allow checked successful controls to be submitted.

## Validation

- `pnpm test -- tests\checkbox.test.ts`: **49/49 passed** (45 original native cases,
  four CSS regressions). No unrelated selectors or full suite were run.
- Real Space activation retained focus and emitted exactly native `input`, then `change`.
  Label activation cleared mixed state; cancelled activation restored unchecked+mixed.
- Group minimum cancellation preserved checked+mixed, kept native `.disabled=false`
  and submitted “Design”. At maximum, Space could not check the third member.
  Native reset honored changed `defaultChecked` without clearing `indeterminate`.
- Disabled fieldset members retained disabled label paint while the first-legend input
  remained enabled and normally colored. Explicit/inherited group sizing passed.
- Forced colors kept `accent-color:auto`, native appearance and a solid system focus
  outline. Print retained native controls. RTL at 360px and 200% CSS zoom had equal
  **345px scroll/client widths**. Separate JavaScript-disabled label/reset checks passed.
- No OS-native-theme, cross-engine, browser-chrome-zoom or screen-reader certification
  is inferred from these Chromium checks.

## Exact isolated budgets

Existing recipes only: ES2022 bundle, minified ESM `index.ts` / IIFE `global.ts`,
source maps enabled, no legal comments; CSS copied verbatim; gzip level **9**.

| Asset | Raw bytes | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-checkbox.js` | 5,410 | 2,171 | 3,500 |
| `markup-ui-checkbox.global.js` | 5,576 | 2,246 | 3,500 |
| `markup-ui-checkbox.css` | 3,215 | 989 | 1,000 |

Readable source CSS is already CRLF; normalized CRLF checkout also measures **3,215 /
989**, leaving **11 gzip bytes**. CSS-only Checkbox costs **989**; enhanced groups
cost **3,160 ESM / 3,235 classic gzip bytes** including CSS. No ceilings, scripts,
dependencies, generated assets or shared styles changed. Full release integration,
build, commit and push remain parent-owned.

## Coordinated release integration

The coordinator's isolated release `pnpm build` and all **49 Checkbox tests** passed.
Final CSS is **3,215 raw / 989 gzip bytes**, below the unchanged 1,000-byte ceiling.
Group helper JavaScript is unchanged. This accepts the measured geometry/palette
corrections, not exact browser-native checkmark or disabled-skin parity.
