# Transfer style audit

**Integrated — controllable native styling corrected; list/rendering differences retained.**
The original multi-selects/options, staging, membership, locks, form ownership and state
algorithms remain unchanged. No data binding, templates, row renderer, checkbox/close-icon
renderer or synthetic form controls were added.

## Reference and reproducibility

- [Official Transfer page](https://www.naiveui.com/en-US/os-theme/components/transfer).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, pinned source
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected modern `Transfer.tsx`, Header/Filter/List/ListItem, CSS and both themes.
  This is not the deprecated Legacy Transfer.
- Native baseline: MarkupUI `67aee793d9e6fc3287fc855fc840b44351932591`.
- Private fixtures:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\transfer`.
  Existing esbuild builds only the isolated comparison bundles. Native HTML authors
  six real options across the two lists; the source receives the same six options and
  initial Core/Reader membership.
- `node server.mjs` serves a fixed allowlist at `http://127.0.0.1:4215`; stopped after
  verification. No shared source/build/server file was changed.
- Chromium **151.0.7922.174**, Windows fonts, **850×750 viewport**, DPR approximately 1,
  700px available width. Separate private contexts are closed in `finally`.
  Reference uses actual `NTransfer`, `NConfigProvider`, `NGlobalStyle`.
- Routes compare default, explicit Source/Target titles, filters, small/large sizes,
  disabled state, dark and local overrides. Source titles are **optional props**;
  the unqualified source has header actions/counts but no generated Source/Target title.
- `before.json`, `measurements.json`, `native-checks.json`, `native-scheme.json`,
  `no-js-lists.json` and before/reference/after/staging PNGs retain actual evidence.

## Controllable corrections

| Area | Before native | Corrected native / pinned role |
| --- | --- | --- |
| Body/list type | Inherited 14px throughout | **14/14/15px** small/medium/large roles |
| Authored pane headings | Browser h2 21px / 700 in fixture | **14/16/16px**, weight **400**, 1.5 leading |
| Header space with titles | Browser heading margins | 44px minimum small/medium, 50px large; medium heading block **46px**, matching source's header-row height |
| Pane surface | Transparent, no source-style panel | White light / **white-.1 dark**, 3px frame |
| Normal list text | Black even on dark pages | `#333639` / white-.82 |
| Title text | Inherited body color | `#1f2225` / white-.9 |
| Counts | Inherited 14px/body color | **12/12/14px**, `#767c82` / white-.52 |
| Disabled text | Native uncontrolled gray | `#c2c2c2` / white-.38 on actual disabled controls/options and their pane headings/counts |
| Native filters | Uncontrolled browser border/padding | 28px minimum, 3px corners, explicit control color/border roles |
| Outer fieldset chrome | Browser groove border, padding and margins | Removed extra chrome; **fieldset/legend semantics remain** |
| Native dark control scheme | Light browser control/scrollbar scheme over dark styling | Scoped **dark color-scheme**, with native control rendering retained |
| Author list padding | Size rules could override the public value | Public token now wins over private size presets |

The dark source's `listColor` is **`rgba(255,255,255,.1)`**, not opaque `cardColor`.
Its outer border is transparent; its center divider uses a separate role. The native
separate-pane frames use the matching outer-border role rather than inventing an opaque
dark surface.

The source declares a header-color theme value but its live header has **transparent
background** over the list surface. Native headings likewise do not acquire a guessed
gray header fill.

No fixed 300px component height, 34px/40px option renderer, selected-option repaint or
`appearance:none` replacement was added. Native listbox size/keyboard behavior remains.

## Actual measured layout and skin limits

**There is no whole-widget pixel-parity claim.** These are materially different retained
interaction and DOM models, and meaningful labels/options remain visible in both fixtures.

- Source is **700×300**, two adjoining **350px** panels. Native preserves its legend,
  two listboxes, visible control labels, middle move buttons, counts and status.
  With titles/filters it changed from **696×391.364594** before to
  **700×369.708344** after; native panes are about **263.25px** wide, not 350px.
- Default source items are **34px** high (40px large). Native options in this environment
  are about **19.6667px** at 14px, inside an authored `size=6` multi-select.
  List height, native scrollbars and selection drawing remain platform-owned.
- Source title glyph boxes are 24px high within a 46px header. Native authored heading
  blocks include that header padding themselves. Their same type/role does not imply
  identical wrapper rectangles or inline placement of header actions/counts.
- Source default filter wrapper is at **(12,50), 326×28** with titles. Native filter is
  approximately **(12.6667,99.4583), 237.9167×28** because native visible labels, legend,
  pane frames and central action column are retained.
- Source header Select-all button is approximately **58.6563×22**.
  Native “Add highlighted” is approximately **141.4896×31.7292** and performs a
  different operation. Native action text is not hidden or replaced by arrows to fake a match.
- Source filter search/clear affordances, checkbox skin, target close icons, rounded
  pending-row backgrounds and custom scrollbar are not recreated around native options.
- Source counts are header text such as “Total 6 items” / “2 items selected”.
  Native counts remain the helper's more explicit available/highlighted/movable
  observations below each list; no count/label data contract changed.
- The source has no native overall fieldset legend; native keeps that meaningful group
  name. Source empty/list renderer spacing is not imposed on empty native listboxes.

## Selection and membership are not interchangeable

The modern source's default `showSelected=true` leaves all six options in Source and
shows membership checkboxes. Clicking Alpha immediately changed source value to
`core, reader, alpha`, with **six source items and three target items**.

Native has **four physical source options and two target members** initially. Its
selection highlight is staging, not membership:

1. Native Home/ArrowDown/Shift+ArrowDown highlighted **Bravo and Charlie**.
   Membership stayed **Core and Reader**.
2. The explicit Add button moved the **same original option nodes**, producing
   Core/Reader/Bravo/Charlie and one membership-change event.
3. Focus moved to the target native list as required by the existing helper contract.
4. A target filter hid non-Charlie entries, but real FormData still serialized all
   **Core/Reader/Bravo/Charlie** members.
5. Clearing target highlights left membership unchanged.
6. Disabling the native fieldset retained membership but serialized **no membership
   entries**, with all move actions disabled. Actual disabled titles/list text were gray.

Option identity, native names (both empty), locks and defaultSelected flags survived.
No parallel Source copies, synthetic checkboxes, staging-to-membership inference or new
render pipeline was introduced.

## Author overrides and native fallback

- Controlled local overrides matched **17px** item type, **20px/400** headings,
  **13px** count type, custom pane/text/title/count/border/disabled colors.
  Source item text and native option text both resolved to `rgb(1,2,3)`.
- Public list padding **7px** survived the large-size preset; the native filter could
  grow slightly above its 28px minimum for larger authored text. This is native sizing,
  not a fixed-height source Input renderer.
- Public pane/control colors and font tokens remain external CSS. Size presets are
  private; no style-object bridge or theme provider is installed.
- Native dark lists reported `color-scheme:dark`, transparent select background over
  the source-matching white-.1 pane, and white-.82 text. Forced-color borders remained visible.
- With page scripts disabled, the real unnamed multiple selects remained usable.
  Alpha could be highlighted while target membership stayed Core/Reader, locked Core
  stayed disabled, move/submit controls stayed author-hidden and FormData was empty.
  No-JS staging is not falsely advertised as membership submission.

## Forced-color and print correction

Parent review identified two coupled media regressions in the first style pass.
The emitted stylesheet now restores disabled action opacity to **1** and uses system
`GrayText` for disabled actions, controls, pane headings and counts in forced colors.
The system color is compared to an actual `GrayText` probe rather than assuming a
particular RGB value for the user's contrast theme.

Print changes the private scheme/palette defaults only: root/select scheme **light**,
normal text `#333639`, headings `#1f2225`, counts `#767c82`, and white pane/filter/action
surfaces. Disabled text uses `GrayText` without an extra action-opacity fade. Explicit
public text, title, count, disabled, pane/control background and border overrides were
rendered and retained, including disabled print cases.

`media-check/verify.mjs` uses a session-only browser runner and a private Chrome
**151.0.7922.174** instance against the copied **emitted `transfer.css`**, not a
separate test stylesheet. Meaningful dark, forced-disabled, print and authored-print
fixtures retain labelled native lists, actions, counts and selected/locked options.
Assertions verify the computed colors/schemes/opacity, unchanged option objects,
unchanged staging and unchanged target membership. The browser/context close in `finally`.
`media-check/results.json`, `forced-disabled.png`, `dark-print.png` and
`authored-print.png` preserve the evidence. No controller or repository dependency changed.

## Validation and budgets

- `pnpm exec vitest run tests\transfer.test.ts`: **44/44 passed**.
  Existing membership/staging/locks/filter/order/form/reset/ownership tests remain,
  with scoped styling, no-selected-skin, CSS budget/author-override and media-rule
  regressions. CSSOM assertions require top-level media rules and private-only print
  palette defaults.
- Controller, entrypoint and classic namespace sources are unchanged. No shared helper,
  dependency or data/state algorithm was edited.
- Production-equivalent isolated ES2022/minified esbuild with source-map reference and
  level-9 gzip:

| Asset | Raw bytes | Gzip bytes | Existing ceiling |
| --- | ---: | ---: | ---: |
| Transfer ESM | 17,241 | 5,986 | 8,000 |
| Transfer classic | 17,527 | 6,125 | 8,000 |
| Transfer CSS | 5,374 | 1,213 | 1,250 |

No ceiling was relaxed. No full build, index/generated update, commit, push or broadcasts
were performed. Parent owns integrated build/manifest checks.

## Bounded outcome

Pane surfaces, borders, type, visible headings/counts, filter sizing and disabled roles
are corrected where native CSS can control them. Native keyboard/staging highlights,
option metrics, forms, the middle-action workflow and original-option ownership are
deliberately retained. The source's immediate checkbox membership, duplicate selected
source display, rendered rows/headers/filters/actions and fixed-height layout remain limits.

No pixel-equivalence percentage hides those differences. No data binding, templates,
row renderer or new selection/form implementation was added. Private contexts and the
fixture server are closed after verification. See the [canonical guide](../../components/transfer.md).

## Integration

The isolated release build and all **44 Transfer tests** passed after the parent-requested
forced-color and print corrections. Final emitted CSS is **5407 raw / 1215 gzip bytes**
under the existing **1250-byte ceiling**; ESM/classic remain **5986/6125 gzip bytes**,
each under 8000. Checkout line endings account for the small difference from private CSS
measurements. Native selection/membership and controller code remain unchanged.
