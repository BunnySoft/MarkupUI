# Table

**Migration status: 🟢 Verified for the retained native scope.**
This is CSS for an authored native table, **not Data Table**. It adds no row renderer,
sorting, selection, pagination, virtual window, grid role or component runtime.

## Loading and references

| Asset | Purpose |
| --- | --- |
| `src/components/table/table.css` | Maintained scoped stylesheet. |
| `dist/markup-ui-table.css` | Browser distribution. |
| `@dataengine/markup-ui/table/style.css` | Stylesheet-only package export. |
| `demo/components/table.html`, `.css`, `.js` | Native tables and optional application form-submit feedback. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-table.css">
```

There is no `./table` JavaScript export, global, registration, measurement or required
advanced/widgets dependency. The existing advanced plugin's generated data-grid table
remains separate. Do not put an author-owned table into a container whose legacy renderer
owns/replaces its rows; same-page coexistence does not change that ownership boundary.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/table),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md),
[Table source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Table.tsx),
[border/stripe source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/styles/index.cssr.ts)
and [size padding constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/styles/_common.ts)
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/table.md) preserves the **six original
property rows**, expands **five publicly named helper/default-content groups**, and adds
**five explicit source-only default-slot/type/theme entries**: **16 rows, 12 Verified
adapted targets and 4 Intentionally omitted contracts**. No framework/pixel parity is claimed.

## Native anatomy and associations

```html
<table class="mui-table">
  <caption>Project hours</caption>
  <colgroup><col><col></colgroup>
  <thead>
    <tr><th scope="col" id="project">Project</th><th scope="col" id="hours">Hours</th></tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" id="alpha">Alpha</th>
      <td headers="alpha hours">40</td>
    </tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Total</th><td>40</td></tr>
  </tfoot>
</table>
```

Use actual `table`/`caption`/`colgroup`/`thead`/`tbody`/`tfoot`/`tr`/`th`/`td` elements.
Keep rows in their native rowgroups, and controls/content inside cells. The stylesheet
never changes their display roles into grid/block cards, moves cells, or manufactures
header associations. Author captions, `scope`, stable header IDs and `headers` references
appropriate to the data. Complex associations and row/column spans remain native HTML.

The public `n-thead`, `n-tbody`, `n-tr`, `n-th`, `n-td` wrappers map to these existing
native tags and their authored child content. They are not new custom elements or JS
exports. Framework dependency-collection granularity is irrelevant to this CSS-only
target. Caption, colgroup and tfoot are additional native HTML anatomy, not invented
Naive UI wrapper names.

Native `rowspan`, `colspan`, `colgroup span`, explicit widths and alignment remain
author/browser-owned. Default table width is 100% **unless a native `width` attribute
is present**; external CSS can override the low-specificity defaults. Cells/captions with
an `align` attribute retain that native hint; otherwise text follows logical table start
alignment. Prefer external CSS for new authored widths/alignment. No fixed table-layout,
column-index algorithm, automatic width parser or default nowrap is imposed.

## Border properties: meanings and combinations

| Property | Native mapping | Default |
| --- | --- | --- |
| `bordered` | Exact `data-bordered="false"` removes the enclosing border. | Enclosing border on. |
| `bottom-bordered` | Exact `data-bottom-bordered="false"` removes the bottom perimeter **only when bordered is false**. | Bottom perimeter on. |
| `single-line` | Exact `data-single-line="false"` enables column dividers. This name does **not** mean single-line text/nowrap. | Column dividers off. |
| `single-column` | Presence `data-single-column` suppresses body/footer row dividers. It does **not** change column count. | Body/footer row dividers on. |
| `striped` | Presence `data-striped` alternates body-row backgrounds. | Off. |
| `size` | `data-size="small"` / `"medium"` / `"large"`; absent/unknown uses medium. | Medium. |

Presence flags remain enabled with a literal value of `"false"`; remove `data-striped`
or `data-single-column` to disable them. The three explicit value-based opt-outs above
are different: only exact `"false"` changes their defaults. All changes are live CSS,
not a component property bridge.

| `bordered` | `bottom-bordered` | Enclosing sides/top | Bottom perimeter |
| --- | --- | --- | --- |
| true/default | true/default | Shown | Shown |
| true/default | false | Shown | Shown; bottom flag has no effect here |
| false | true/default | Hidden | Shown |
| false | false | Hidden | Hidden |

Column dividers are independent of those outer edges. Body/footer row dividers follow
`single-column`; header-section separators remain. The native target consistently treats
body row-header `th` cells as members of their data rows rather than leaving isolated
header-cell lines behind.

### Deliberate source adaptations

The pinned stylesheet uses separate borders: it adds bottom/right lines to cells, removes
the last cell's right edge, removes last-row **td** bottoms in each rowgroup when bordered,
and removes non-final-row **td** bottoms for single-column. It leaves **th** bottom lines
in those cases. Its bottom-border opt-out also targets final-row td cells; the enclosing
border still remains when bordered is true.

This target uses **native collapsed-border conflict resolution** instead. The table
perimeter controls the actual outside edge, including spanning cells. Borderless edges
use CSS `border-style: hidden` (not the HTML hidden attribute and not overflow clipping)
so cell borders cannot reintroduce an unwanted perimeter. Bottom-border opt-in restores
only the bottom edge when needed. Header separators stay distinct, while row-divider
suppression applies uniformly to th/td in tbody/tfoot. There is no JS last-cell calculation,
separate-border corner rounding or clipped table surface.

These are explicit native adaptations, not claims of identical upstream last-row/group/
row-header rendering. All 16 combinations of the four border flags were checked in Chromium.

## Striping, sizes and scope

Striping applies to **tbody rows**, including their row-header th cells, and resets in
each tbody. Modern filtered `:nth-child(... of tr:not([hidden]))` counts visible rows and
ignores templates/hidden rows. The fallback uses native `tr:nth-of-type(even)` positions,
so hidden rows can affect stripe parity in an older engine. No row observer or reindexer
is added. Spanning cells retain their origin row's paint; CSS does not repaint subrows
inside one rowspan cell.

Upstream stripes even tr positions on td only, including applicable rows in other groups.
This target deliberately keeps header/footer summaries outside zebra striping and gives
body row headers the same background as their row. Plain nested tables do not receive
the parent's cell borders, padding or striping. Normal font/color inheritance still applies.

Small uses `.375rem` cell padding and `.875rem` font size; medium uses `.75rem`/`1rem`;
large uses `.75rem`/`1.125rem`. The small/medium/large padding pattern follows the pinned
6/12/12px constants at a 16px root; typography is an explicit native rem adaptation rather
than a provider-font lookup.

Tokens: `--mui-table-cell-padding`, `--mui-table-font-size`, `--mui-table-color`,
`--mui-table-background`, `--mui-table-header-background`, `--mui-table-header-weight`,
`--mui-table-border-color` and `--mui-table-striped-background`. Private
`--_mui-table-*` presets are not API. Use valid values in external CSS; native CSS
validation applies. Source `theme`, `themeOverrides`, `builtinThemeOverrides` and the
exported TypeScript `TableSize` alias are intentionally not implemented. The native size
vocabulary is already covered by the size mapping.

The implicit upstream default slot is actual authored table content here, not a slot
function, data array, row template evaluator or wrapper constructor. Source declares no
sorting/hover/selection/pagination/virtualization or table-specific event/method API.
Those belong to separate Data Table/application work, not this component.

## Scrolling, hidden content and controls

```html
<p id="table-help">Scroll horizontally or Tab to the cell actions.</p>
<div class="mui-table-scroll" tabindex="0" role="region"
  aria-labelledby="report-caption" aria-describedby="table-help">
  <table class="mui-table">
    <caption id="report-caption">Project report</caption>
    <!-- Authored native rowgroups and cells -->
  </table>
</div>
```

The wrapper is an explicit author choice, not generated markup. Give a standalone
scrollable region an appropriate name/instruction and keyboard focus when needed.
Native horizontal scrolling and Tab reveal offscreen controls without turning the table
into an interactive grid. Wrapper padding and normal cell padding allow native focus
outlines room; the library never hides overflow on the table itself. For RTL scrolling,
put `dir="rtl"` on the wrapper/table's native context, not a CSS row reversal.

Native labels, required validation, form submission/reset, disabled controls and fieldsets
inside cells remain intact. The demo's submit feedback is application JS; without JS,
native GET submission and reset still work. There is no cell-click/row-selection alias,
automatic aria-sort, live announcement or keyboard interception.

Native hidden tables/rowgroups/rows/cells and templates remain hidden/inert without
deleting nodes. Standalone CSS does not force `hidden="until-found"` to display:none;
that reveal path is not separately certified. Print expands scrolling wrappers while
retaining native table/header-group rendering; author fixed/minimum widths may need print
overrides, as demonstrated. Forced colors retain text and borders instead of relying on
zebra color alone. No animation or runtime measurement is required.

## Migration steps and acceptance

1. [x] Preserve native caption/rowgroups/headers/cells/colgroups and row/column spans.
2. [x] Implement the actual border axes, bottom-edge combinations, sizes and striping.
3. [x] Use explicitly named native overflow without converting table semantics or cell order.
4. [x] Verify associations, geometry, controls, hidden/nested scope, print and forced colors.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**467 tests**, including **12 Table cases**. Chromium acceptance exercised:

- Native table/caption/rowgroup/row/columnheader/rowheader/cell accessibility structure,
  explicit scope/headers references, colgroup span, and correct native colspan/rowspan
  geometry. No table/grid roles were synthesized; screen-reader speech is not certified.
- All **16 bordered/bottom-bordered/single-line/single-column combinations**, header
  separators, visible-row stripe changes without node replacement, row-header stripes,
  6/12/12px padding, 14/16/18px text, native width=360 and explicit right alignment.
- Plain nested-table cell styles, hidden first/middle/last rows and inert templates.
- Native Tab/focus, required validation, one valid cell-form submission, reset and disabled
  exclusion. No selection, sorting or row keyboard model was added.
- 280px/320px widths and 200% CSS zoom without document overflow while retaining intentional
  wrapper overflow. Native ArrowRight scrolling and Tab revealed the input in LTR and RTL.
- Print wrapper expansion/native header-group display and forced-color text/borders.
- Later core/widgets/advanced loading preserved native nodes/table rendering; a separate
  legacy data-grid still generated its own header/row, and no mui-table definition appeared.
- JavaScript-disabled native reset/GET submission to `?note=NoJS`, with caption and both
  visible body rows retained.

CSS is **4,037 bytes / 1,023 gzip bytes**, under its new **1,500-byte** ceiling; component
JS is **0 bytes**. Demo-only JS is **229 / 183 gzip bytes** and CSS **1,171 / 527 gzip bytes**.
Core stays **62,558 / 14,611 gzip bytes** under **15,000**; widgets **10,858 / 2,779** under
**4,000**; advanced **6,554 / 2,181** under **3,000**. Existing outputs/budgets and zero
runtime dependencies are unchanged. This is not all-browser, paper-pagination,
browser-UI zoom, framework or pixel-parity certification.
