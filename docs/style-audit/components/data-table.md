# Data Table style audit

**2026-09-10–11 — bounded native presentation correction, not a renderer migration.**
The authored table, rows, cells, fields and existing state algorithms remain intact.
No data binding, row factory, templates, column renderer, checkbox skin, spinner or
empty-state renderer was added.

## Reference and reproducibility

- [Official Data Table page](https://www.naiveui.com/en-US/os-theme/components/data-table).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, pinned commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected Data Table CSS, light/dark theme composition, padding/sorter/empty defaults,
  and the common table hover/stripe/header/loading roles.
- Native baseline: MarkupUI `64ed80b21798fbd7449e9b930ab78bf6a6e1bd3e`.
  The before and after sheets both compose the **same already-audited Table base**.
  Table's collapsed-border policy is deliberately unchanged.
- Private fixture/evidence:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\data-table`.
  Existing esbuild bundles the reference and native helper only into that directory.
  `node server.mjs` serves a fixed allowlist on `http://127.0.0.1:4213`, stopped after
  verification. No shared server/build/source file was edited.
- Reference uses real `NDataTable`, default rendering and meaningful Project/Score/Status
  data: Alpha 10, Beta 2, Gamma 20, Delta 5, Epsilon 12, Zeta 1, Eta 7, Theta 3.
  Native HTML contains eight explicitly authored keyed rows with matching text,
  real row headers, named native checkboxes and a labelled sort button.
  The fixture's setup is not shipped as a row/data-binding renderer.
- Variants cover default/small/large, borderless/grid, stripes, selection, sort,
  loading, empty, sticky, dark and author overrides. Parent viewport is **900×850**,
  table root **700px** wide, Chromium **151.0.7922.174**, Windows fonts, DPR approximately 1.
- All browser pages use private contexts closed in `finally`. Finite transitions
  are settled for ordinary paint measurements; source loading animation is not
  mistaken for a native spinner counterpart.
- `before.json`, `measurements.json` (**44 document runs**), `hover-sticky.json`,
  `native-checks.json`, `no-js-table.json` and before/reference/after PNGs persist.

## Corrected Data Table-specific defaults

| Property / case | Before native | Corrected native | Reference |
| --- | --- | --- | --- |
| Eight-row default root height | 438.229187 | **424.229187** | 424.229187 |
| Small root height | 330.229187 | **352.229187** | 352.229187 |
| Large root height | 452.666687 | **438.666687** | 438.666687 |
| Small cell padding | 6px from Table base | **8px, scoped to Data Table** | 8px |
| Medium/large padding | 12px | Unchanged | 12px |
| Medium/large font | 14px / 15px | Unchanged | 14px / 15px |
| Scroll-wrapper inset | 4px around table | **0**, author-overridable | No native focus gutter |
| Sort button chrome | Browser border/padding/background enlarged header | **Reset, with authored text retained** | Source uses its own header/sorter renderer |
| Semantic body row-header type | 500 weight / header color | **400 / body color by default** | Ordinary data text is 400/body color |
| Numeric typography | Table's tabular-nums default | **Normal within Data Table** | Normal |
| Checked row paint | Automatic `#e7f2ff` blue fill | **No default tint** | Checking does not recolor the row |
| Sorted header | Normal header fill | **Sorting/hover fill** | Matching source role |
| Busy table border | Dashed | **Normal solid border retained** | No dashed loading frame |

The 14px default height excess was the wrapper gutter plus native sort-button chrome.
Removing those does not remove the button, its label, keyboard behavior or focus support.
Disabled sort controls retain reduced emphasis and a non-action cursor.

The scoped small-padding override is intentional: **standalone Table remains 6px**,
while Data Table's pinned small density is 8px. No change to Table or its shared defaults
was proposed or made.

## Paint roles, stripes, sort and selection

The existing audited Table base already supplies correct normal/header/stripe colors.
Data Table-specific states now add the missing roles:

| Role | Light | Dark |
| --- | --- | --- |
| Normal body text/surface | `#333639` / white | white-.82 / `#18181c` |
| Header text/surface | `#1f2225` / `#fafafc` | white-.9 / `#26262a` |
| Stripe | `#fafafc` | `#242427` |
| Body hover | **`#f7f7fa`** | **`#26262a`** |
| Sortable-hover/sorted header | **`#f3f3f7`** | **`#333337`** |
| Active native sort arrow | Shared primary, then `#18a058` | Shared primary, then `#63e2b7` |

Actual default, striped, checked-and-striped, sorted and authored-color hover comparisons
matched the reference fills. Selection remains actual native checkedness:

- Checked Beta stays white normally or striped when applicable; it is not given a
  fabricated selected-row background.
- `--mui-data-table-selected-background` is still available as an **explicit author
  overlay**. Unset, its transparent inset paint leaves stripe and hover colors intact.
  It does not stage selection or replace checkbox appearance.
- Native sorting is still activated only by the labelled button, not a fake clickable
  header. The header itself stays cursor-auto while the reference sortable header is
  pointer-clickable.
- Native arrows remain text glyphs driven by `aria-sort`, not the source's neutral/
  active dual-SVG sorter. Their active color now uses the correct role.
- Only the header is automatically tinted for sorting. Source body cells in the sorted
  column use `#f7f7fa` / `#26262a`; native ordinary body cells remain normal unless hovered.
  No runtime column-index markers or generated column styling were added.

## Measured renderer, width and border limits

**This is not a whole-table pixel-parity result.** Meaningful rows and controls expose
the retained differences rather than hiding them in an empty/no-paint fixture.

- Both roots are 700px wide, but source's inner separate-border table measures
  **698.666687px**; the native collapsed table measures **700px**.
  First-header origins are approximately **(.6667,.6667)** versus **(.3333,.3333)**.
- Default Project header width is **230.697922px** in source versus **215.979172px**
  natively. Actual sort-button text, native cell content and browser table layout
  participate in width allocation; no column renderer or width-sync engine is supplied.
- Selection source uses a **40px renderer column**, zero selection-cell padding and
  its custom Checkbox peer. The authored native checkbox column measures
  **111.479172px** with ordinary padded cells/native controls in this fixture.
  No label/control was erased or fake checkbox inserted to force the width.
- Header/cell borders remain native collapsed-border conflicts, including the existing
  borderless/grid/stripe policies. Source's separate wrapper borders/corners, fixed-column
  shadows and split-table layout are not grafted onto the Table base.
- Source and native ordinary-column **font family, size, line-height, weight, color and
  padding matched** in the compared cases. The selection-renderer cells are explicitly
  excluded from that equality statement; their differences are recorded.
- Default/small/large, borderless/grid, stripe, selection and sort root heights match
  after the correction. Equal total height is not evidence of equal column widths,
  checkbox/sort skins or border rasterization.

## Sticky, loading and empty presentation

- At scrollTop=80, the native sticky header remains at its own scrollport top (**0px**
  relative to root) with an opaque `#fafafc` fill. Source's separate header remains at
  approximately **.6667px** inside its wrapper border.
- Native max-height **140px** bounds the whole scrollport, including header.
  Source max-height=140 bounds the body, producing **188.395844px** overall.
  No split-table width synchronization, sticky-column calculator or shadow renderer
  was introduced. Native collapsed-border/sticky combinations remain browser layout.
- Source loading fades its wrapper to **.5 light / .38 dark**, blocks pointer events
  and overlays a spinner. Native loading remains informative `aria-busy`, **opacity 1 /
  pointer-events auto**, with explicit authored text outside the table. Fields stay usable.
  The native example is **462.625px** tall versus source **424.229187px** because its
  message participates in flow. This is deliberate, not a hidden loading renderer.
- Source empty uses its Empty peer, “No Data”, and **48px vertical padding**, measuring
  **214.791672px** overall. Native keeps the table header and the author's plain
  “No matching projects” region with **8px vertical padding**, measuring **86.125px**.
  Filtering hides but does not unmount/recreate the eight native rows.

## Author overrides and native ownership checks

- Local/shared Table tokens matched **16px monospace / 1.5**, **10px cell padding**,
  custom body/header/surface/border/stripe colors, Data Table hover/sort fills and active
  arrow color. The custom default/small examples both measured **402.666687px** high,
  showing that public padding/type overrides remain authoritative.
- A real edited input appended to Alpha's existing cell retained **Edited** and focus
  through ascending sorting plus loading. Rows remained the same objects; source order
  stayed `a,b,c,d,e,f,g,h`, while visible order became `f,b,h,d,g,a,e,c`.
  Native checked Beta stayed checked; no table/grid role or row-header association changed.
- Setting an explicit selected tint rendered the requested `rgb(1,2,3)` inset paint.
  Clearing the view to empty kept **eight mounted rows**; revealAll reused those nodes.
- JavaScript-disabled HTML retained a real table, caption, scoped column/row headers,
  8px small padding and native named fields. Sort stayed author-hidden.
  Required validation blocked an empty value, then native GET submitted **`?score=23`**.

## Validation and integration boundary

- `pnpm exec vitest run tests\data-table.test.ts`: **64/64 passed**.
  Added scoped default/composed-budget and style/state identity checks; existing key,
  sort/filter/page, selection, form/reset, focus, error and row-bound algorithms remain.
- Controller and entrypoint source are unchanged. Table base and shared helpers are
  unchanged, checked with scoped `git diff --exit-code`.
- Production-equivalent isolated esbuild / level-9 gzip, without rebuilding `dist`:

| Asset | Raw bytes | Gzip bytes | Existing ceiling |
| --- | ---: | ---: | ---: |
| Data Table ESM | 21,263 | 7,305 | 9,000 |
| Data Table classic | 21,552 | 7,441 | 9,000 |
| **Composed Table + Data Table CSS** | 9,293 | 1,936 | **2,000** |

The Data Table extension itself is 4,036 bytes; the enforced CSS number above includes
the unchanged 5,256-byte Table base and composition newline. No ceiling was relaxed.
No full build, index/generated update, commit, push or broadcasts were performed.
Parent owns final integration and manifest checks.

## Coordinated release integration

Parent review limited sorted-header tint to the helper's supported **ascending/descending**
states instead of treating every `aria-sort` attribute as active. `none` and `other`
retain the ordinary surface. Disabled native sort buttons also keep full opacity and
system GrayText in forced colors instead of compounding native disabled paint.

The isolated release build passed; all **65 Data Table tests** and **15 Table regression
tests** passed. jsdom cannot evaluate the complete mixed `:is()`/`:has()` selector, so
unit coverage isolates the state alternatives and actual emitted Chromium CSS verifies
the whole live selector: `none/other` stayed **#fafafc**, ascending/descending became
**#f3f3f7**, and forced-color disabled sort opacity was **1**.

Final composed CSS is **9,531 raw / 1,960 gzip bytes**, below the unchanged 2,000-byte
ceiling. Controller, Table base and state algorithms remain unchanged.

## Outcome and remaining scope

Data Table default density/typography and supported state paint are corrected within the
native contract. Native automatic widths, collapsed borders, row-header semantics,
checkbox/button skins, text sort arrows, loading/empty messages, and scrollport/sticky
behavior remain bounded alternatives to the source renderer. Arbitrary custom nested
content and all-browser/AT/zoom combinations are not certified here.

No data binding, templates, row renderer, new state algorithm or shared Table change was
introduced. **No base/shared proposal is required for these scoped fixes.**
See the [canonical Data Table guide](../../components/data-table.md).
