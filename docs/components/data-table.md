# Data Table: original native rows

**🟢 Verified retained native scope.** A bounded local table enhancement, not a Vue-style
column renderer, virtual grid, treegrid, data-fetch engine or replacement for CSS-only
[Table](table.md). All table/row/cell nodes and business fields remain authored light DOM.

**Style audit (2026-09-10–11):** scoped Data Table CSS now corrects small density, sort-button
chrome, body row-header typography, hover/sorted-header colors and default selection paint.
See the [rendered report](../style-audit/components/data-table.md) for measured results and
the remaining collapsed-border, width, native-control, loading/empty and renderer limits.
No data binding, row/template renderer or state algorithm was added or changed.

## Loading and anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/data-table` | createDataTable and strong native options/state/controller types |
| `dist/markup-ui-data-table.js` | Independent optional ESM; no custom element registration |
| `dist/markup-ui-data-table.global.js` | Classic MarkupUIDataTable namespace; replacement rejected |
| `@dataengine/markup-ui/data-table/style.css` | External CSS, including the existing native Table stylesheet |
| [Local demo](../../demo/components/data-table.html) | Separate HTML/CSS/JS; static table plus actual native fields/actions |
| [Complete reference inventory](../naive-ui/components/data-table.md) | Every original owner/member/type/inline identity and explicit source supplement |

No core, advanced, widgets, Checkbox, Form, Pagination or Virtual List JavaScript is
automatically loaded. Existing advanced MuiDataGrid remains a separate unchanged legacy
renderer. Never place an author-owned table inside a legacy renderer's owned output region.

```html
<section class="mui-data-table" data-data-table aria-label="Project scores">
  <div class="mui-data-table-scroll" tabindex="0" role="region"
       aria-labelledby="scores-caption">
    <table class="mui-table" data-data-table-table>
      <caption id="scores-caption">Project scores</caption>
      <thead><tr>
        <th scope="col" data-data-column="project">Project</th>
        <th scope="col" data-data-column="score">
          Score <button type="button" data-data-sort="score" hidden>Sort scores</button>
        </th>
      </tr></thead>
      <tbody>
        <tr data-data-key="alpha">
          <th scope="row" id="alpha">Alpha</th>
          <td><label>Alpha score <input type="number" value="10"></label></td>
        </tr>
        <tr data-data-key="bravo">
          <th scope="row" id="bravo">Bravo</th>
          <td><label>Bravo score <input type="number" value="2"></label></td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

```js
import { createDataTable } from "@dataengine/markup-ui/data-table"
const score = row => row.querySelector('input[type="number"]').valueAsNumber
const table = createDataTable(document.querySelector("[data-data-table]"), {
  columns: [{ key: "score", compare: (a, b) => score(a) - score(b) }],
  pageSize: null
})
```

Use a connected native div/section root, exactly one marked table, one thead with **one
unspanned header row**, and one tbody. Every header is th[scope=col]; body th[scope=row],
caption, colgroup, tfoot, IDs and explicit headers associations remain author/browser-owned.
The helper never changes table display/roles, turns th into a fake clickable control, or
adds an ARIA grid/roving-cell keyboard model. Native links, buttons, inputs, textareas,
details and ordinary nested tables inside cells remain intact.

Maximum **2,000 native rows, 64 header cells/operation columns**. Each body row has exactly
one unspanned th/td per header. Duplicate/missing keys, enhanced grouped headers, extra
tbodies, body colspan/rowspan (including zero), role overrides and hidden=until-found
rows reject rather than silently corrupting geometry. Native footer spans remain supported
because footer rows are neither sorted nor paginated. More elaborate grouped headings/body
spans remain in independent CSS-only Table. Native details inside a cell is a deliberate
expansion alternative, not a generated full-width expansion-row feature.

Direct tbody templates remain inert; the helper does not evaluate/clone them. Applications
may use their own explicit native template once to create a row, give it a stable key, and
refresh. There is no row-factory callback, renderer column family or parallel virtual DOM.

## Stable keys and source ownership

`tr[data-data-key]` is an explicit unique nonempty string of at most 256 characters.
Numbers are not coerced. Keys are immutable while a node is owned. For a different entity,
replace the row deliberately rather than renaming an owned row.

- Initial DOM row order is the **natural source order**.
- Sorting/filtering moves the same rows. Natural order is not re-read from the helper's
  own sorted DOM on refresh.
- `refresh()` retains surviving source keys in their prior natural order, adopts a
  replacement node at its existing key, and appends new keys in their current DOM order.
- `refresh({sourceOrder: keys})` explicitly replaces natural order. It must name **every
  current key exactly once**; partial/duplicate/unknown lists reject atomically.
- The application owns adding/removing/replacing rows, editing cells, names, locks and
  default values. Call refresh after those changes. There is no polling/MutationObserver,
  implicit input parser, HTTP request, router or loader.
- Removed rows/defaults are never recreated. Invalid external changes remain the caller's
  data to repair; the helper does not undo application edits.

State arrays are frozen snapshots. `sourceKeys` and `checkedKeys` use natural source order.
`filteredKeys` uses the current sorted/filtered order; `visibleKeys` is the page slice.
Getters reference the last committed row set; call refresh after structural changes.
Checkedness is read from actual native checkboxes, never inferred from arbitrary cell data.

## Operation order and typed callbacks

Each column operation is `{key, compare?, filter?}`. A key must identify a distinct
authored th[data-data-column]. Options are copied; replacing callbacks/anatomy requires
disconnect/rebind. The same-named DataTableColumn type is intentionally **not** compatible
with Naive UI's renderer-capable union.

1. Exclude author-hidden rows and apply active column predicates.
2. Stable-sort matching rows by the one selected comparator.
3. Slice the explicit local page.
4. Calculate all requested footer text results.
5. Only after validating keys/configuration/results, move/hide rows and update owned UI.

`compare(leftNativeRow,rightNativeRow)` must return a **finite number**, synchronously.
Numeric semantics require a numeric extractor, such as valueAsNumber; no automatic
lexical/numeric/date parser is built in. Both ascending and descending ties use natural
source order. Comparators must be pure, deterministic and consistent; no library can
repair an inconsistent comparator's ordering.

`filter(nativeRow,string)` must synchronously return boolean. Column filters combine with
AND. Each column has one explicit string (at most 1,024 characters); `""` means inactive.
No multiple-option union, implicit search grammar or OR-mode implementation is claimed.
Native filters are labelled text/search inputs or single selects **outside the owned
table** with data-data-filter=columnKey. Selects need an empty-value clear option.
Typing remains a draft; apply on native change (Enter/blur/select change) or compositionend,
not every keystroke. Programmatic replacement of a composing draft rejects.

`set({sort:{key,order}})` uses ascending/descending; `set({sort:null})` returns to natural
order. Native type=button header actions cycle ascending → descending → null. Exactly
one active keyed header receives meaningful aria-sort; inactive headers have none. Author
one visible instruction describing that cycle. CSS arrows are visual, not another live
announcement channel. No keydown interception is needed: Enter and Space activate buttons.

All comparator/filter/summary exceptions and invalid results abort before owned row/UI
mutation and throw from programmatic view methods. Asynchronous/thenable results reject;
promises are not treated as truthy predicates. Reentrant operations from callbacks reject;
disconnect is permitted and aborts stale work. Callbacks must not mutate data/structure,
and the helper checks structural/key/visibility consistency again before committing.
Arbitrary side effects performed inside an application callback cannot be rolled back.

## Paging is bounded, but not virtualization

`pageSize` is null (all matching rows) or an integer 1..2,000. Default is all unless a
native page-size select supplies the initial choice. `page` is a positive safe integer.
There is no fictitious remote itemCount or huge generated page-button array.

Optional controls:

- At most one type=button data-data-page=previous and one =next, outside the table.
  They remain present and are natively disabled at bounds; **always two buttons maximum**.
- A labelled single select[data-data-page-size], with unique decimal size values and an
  `all` option. All is required for the validation/reveal path.
- A plain-text span/output[data-data-count], never an automatically live region.

Filter changes return to page one unless a simultaneously supplied page is explicit.
Explicit out-of-range page requests reject rather than selecting unrelated data.
On refresh after removal, the page clamps to the last surviving page. Empty results are
**page 1, pageCount 0, visibleKeys []**, not an accidental first data row. Page-size UI changes
return to page one; API callers specify page when needed.

All source rows remain **mounted**. Pagination only changes hidden and native order.
With pageSize=20 the visible bound is 20, but mounted bound remains 2,000. For more data,
the application must supply its own loaded subset/intent/pager and own its lifetime.
Existing Pagination can drive set({page,pageSize}) explicitly, but is not a dependency
and must not pretend unloaded records belong to this local table.

## Native selection, disabled rows and reset

Selection is opt-in: at most one labelled input[type=checkbox][data-data-check] per row.
Its explicit value must equal data-data-key. A header input[data-data-check-all] requires
one checkbox per row, is **unnamed/non-required**, and declares data-data-scope:

| Scope | Eligible row set |
| --- | --- |
| `page` | Current visible page |
| `filtered` | All sorted/filtered matches, independent of page |
| `all` | Every current data row, including filtered-out and author-hidden rows |

Bulk operations skip native :disabled checkboxes, including native fieldset disabling.
Disabled selected rows stay checked. Exact setCheckedKeys must include any currently
checked disabled key and cannot add disabled unchecked keys; otherwise it rejects before
changing anything. There is no checkbox staging queue: row checkedness is current
selection, unlike Transfer's staging-versus-membership lists.

Header checked/indeterminate reflect only **enabled rows in its declared scope**.
Zero eligible rows disables the header and is not “all selected.” Do not put these row
checkboxes into another CheckboxGroup owner; overlap is rejected across module copies.

Native checkbox checked and defaultChecked remain separate. Setters/bulk never rewrite
defaults or dispatch synthetic input/change. On uncancelled native form reset, the browser
restores defaults, including disabled checkbox defaults: **native reset is the explicit
exception to API lock protection**. A settlement microtask then restores initial sort,
initial page size/page one and native filter defaults and derives header mixed state.
Unbound initial filters retain their configured reset defaults. No user-operation event
is emitted. Canceled reset leaves selection/filters/view unchanged. Operations during
pending reset reject; await settlement before making an application update.

## FormData and validation: explicit whole-table policy

**hidden is not disabled or unmounted.** Hidden named fields still contribute to native
FormData, and required hidden fields remain invalid and may be impossible for a browser
to focus. The helper never silently disables them, clears names, fabricates proxies,
intercepts FormData or treats checkedKeys as a business serializer.

- Named enabled row checkboxes contribute their native value only when checked.
- Disabled selected checkbox keys remain in state.checkedKeys but **do not submit** as
  native checkbox values. Other enabled fields on that row still submit normally.
- Other cell names/values remain independent native fields, including on hidden rows.
- FormData ordering follows current physical DOM order, which sorting/filtering changes;
  do not use field position as a stable row identity.
- Direct new FormData(form) does not run validation. Native form.submit() bypasses submit
  handlers/validation. Neither is patched.

The demo explicitly authors novalidate and hides submission without JS; its application
submit handler prevents default, calls **revealAll() before reportValidity()**, and only
then constructs FormData. This is a real whole-table gate, not a claim that hidden fields
are excluded:

```js
form.addEventListener("submit", event => {
  event.preventDefault()
  table.revealAll() // Clear sort/filters/paging; preserve author-hidden exclusions.
  if (!form.reportValidity()) return
  const values = new FormData(form)
  // Application owns persistence; the helper never fetches or serializes business data.
})
```

revealAll clears sort too, so an incomplete numeric edit does not invoke a stale comparator
before the invalid field can be shown. Summary callbacks must tolerate incomplete native
edits if used in this gate (the demo totals only finite values); callback errors still
throw and prevent saving. Author-hidden/inert/closed-details fields remain application-owned:
reveal/unhide/open those containers before native validation as appropriate. The helper
does not promise to reveal arbitrary CSS or application disclosure state.

`reveal(key)` clears filters and selects the key's current sorted page; unknown and
author-hidden keys reject without changing the view. It returns the original tr, **not**
a scroll/focus overload. The app may then call native scrollIntoView/focus on a field.
Use revealAll before validating the whole form; successively revealing single invalid
rows could hide an earlier invalid field. Existing native Form composes after this
explicit reveal step; no Form provider/runtime is forced.

## Native presentation and summary ownership

Data Table CSS composes [Table's native collapsed-border, stripe, hidden and overflow
contracts](table.md), without changing Table's standalone asset. It styles only opted-in
tables/direct cells; ordinary nested tables do not gain parent cell padding/borders.
Selection paint targets direct cell checkboxes or a direct native label wrapper; other
author checkbox nesting still works but needs explicit author CSS.

Table tokens/data-bordered/data-bottom-bordered/data-single-line/data-single-column/
data-striped/data-size remain available. Data Table uses **8px small cell padding**,
while standalone Table intentionally retains 6px; medium/large retain 12px and the shared
14px/15px type defaults. Public `--mui-table-cell-padding` overrides that scoped preset.
Data cells use normal numeric typography; semantic body `th[scope=row]` retains its role
but defaults to ordinary data-cell color/400 weight. Explicit Table header color/weight
tokens remain authoritative when authors intentionally style those headers.

Additional tokens:

- `--mui-data-table-max-height`, `--mui-data-table-min-height`: native scrollport bounds.
- `--mui-data-table-scroll-padding`: zero by default; authors can restore a focus/layout gutter.
- `--mui-data-table-color`: data-table text, including body cells, with Table color as fallback.
- `--mui-data-table-hover-background`: hovered body-cell fill; default `#f7f7fa` in light
  and `#26262a` in dark.
- `--mui-data-table-sort-background`: sortable-hover/current sorted header fill;
  default `#f3f3f7` / `#333337`.
- `--mui-data-table-sort-icon-color`: active native CSS arrow color; shared primary
  color or pinned light/dark primary fallback by default.
- `--mui-data-table-selected-background`: **optional** selected-cell tint. There is no
  default blue row fill, matching the reference's unchanged checked-row background.
  The optional tint is a clipped inset paint overlay, preserving underlying stripes/
  hover colors when unset. Native checkbox skins and labels are not replaced.

Sort buttons remain real labelled buttons; their extra browser padding/border/background
are reset without hiding authored text. Disabled sort buttons keep a non-action cursor
and reduced emphasis. Only the button activates sorting, not the whole
header. Native text arrows are not the source's generated dual-SVG sorter, and no runtime
column-index styling was added to tint every sorted-column body cell.
Native wrapping remains the default. No global reset, inline style engine, mandatory
spinner, layout polling or runtime animation is installed.

data-data-sticky-header is optional CSS. Sticky columns are deliberate **author CSS** with
explicit widths/logical offsets; the demo pins only its first column. There is no dynamic
multi-column offset calculator, resizing engine, shadow/scroll synchronization or claim
that arbitrary sticky/span combinations work.

Optional plain-text data-data-empty/data-data-loading regions live outside the table.
Loading is informative aria-busy, not a hidden data-fetch lock; native fields remain usable.
The busy table keeps its normal solid border; it is not automatically dimmed or pointer-locked.
This deliberately differs from the source's faded wrapper and overlaid spinner.
Author the loading text. Counts/summaries are not automatically aria-live, avoiding
per-sort/per-field announcement spam.

Summary records are `{key,scope,value(rows)}`. Each key identifies exactly one text-only
span[data-data-summary] in the original tfoot. Scope is page/filtered/all; rows is a frozen
array of original tr references. Results must be synchronous strings <=16,384 characters,
written with textContent. The helper never replaces a cell/row, inserts markup, parses
action text into CSV or manufactures footer header associations. Native tfoot colspan/
rowspan remain authored, but generated summary-cell records and top placement are omitted.

Print expands the scroll region and restores static headers, **while retaining the
current hidden rows**. Call revealAll before printing all local data. Fixed/minimum
author widths may need print overrides. Forced colors keep native controls and selection
outlines; no custom animation engine is present.

## API, events, focus and handoff

| API | Meaning |
| --- | --- |
| `table`, `connected`, `state`, `error` | Original table; lifecycle; committed scopes/native checkedness; last view/UI failure |
| `set(values)` | Atomic silent sort/filters/page/pageSize/loading update |
| `setCheckedKeys(keys)` | Silent exact native checkedness; known keys and locks validated first |
| `select(scope,checked)` | Silent eligible native bulk selection, no implicit scope |
| `refresh({sourceOrder?})` | Validate caller data/edits; retain/redeclare natural order; clamp shrunk page |
| `reveal(key)` | Clear filters, choose sorted page, return original row; no implicit scroll |
| `revealAll()` | Clear sort/filters/paging for native whole-table validation/printing |
| `disconnect()` | Release listeners/owned attributes/ownership without recreating or resetting data |

One mui:data-table-change describes each accepted native operation:
`{source,state,event}` with source sort/filter/page/page-size/selection. Accepted sort/page
clicks settle after dispatch so preventDefault is honored. Native checkbox cancellation/
default rollback stays browser-owned. Programmatic setters/refresh/reset emit no user
notification. Native cell input/change events are not renamed into row-data updates.

Handled UI failures emit mui:data-table-error with `{error}` and no success event.
A rejected native filter/size value remains an **uncommitted draft**; the prior view/state
remains committed. Correct/reapply or explicitly clear it. Refresh recalculates committed
filters, not a rejected draft. Application event-listener exceptions retain browser
semantics; they are not swallowed or presented as successful callback results.

Rows are reordered with moveBefore when available. The documented fallback uses
insertBefore on the same nodes and restores a lost focused input/textarea and its text
selection only if focus fell to body; it never overrides an application-selected outside
focus target. Nodes/listeners/current edits/defaults remain. The fallback cannot promise
state-preserving custom-element lifecycle/media/iframe behavior; prefer native cell
controls or a browser with moveBefore for those application-owned states. A disconnect
during a native move aborts further stale work; arbitrary application DOM side effects
are not transactionally rolled back.

If paging/filtering hides a focused row, or refresh observes removal of the last focused
row, focus falls back to the native root with an owned tabindex=-1. Programmatic operations
do not steal outside focus. Arbitrary application CSS/inert/disclosure changes still need
an application focus destination.

Disconnect releases helper-hidden rows, sort/loading/action attributes and derived header
state conditionally, preserving externally overridden attributes. **Current physical row
order, edits and row checkbox checkedness remain**, not the initial data/defaults.
Final text counts/summaries remain static; they are no longer live promises.
Removed data is not resurrected. Filters keep current native values but no longer control
visibility. The application must end its submit gate/hide or disable enhancement controls;
the demo does so. Rebind explicitly to establish a new natural-order/lifecycle baseline.
After disconnect, state retains the last committed view with current native checkedness;
its page/filter arrays no longer describe actual visibility after hiding is released.

## Complete retained/omitted mapping and source evidence

The [reference tracker](../naive-ui/components/data-table.md) is the exhaustive
owner/member/kind/line mapping: **147 original identities + 64 explicit source supplements
= 211 rows, 76 adapted and 135 omitted, zero unresolved**. It preserves every original
prop, method, column, scroll overload, selection/filter/summary/slot/inline type separately.

Retained native adaptations cover borders/sizes/stripe/layout, authored row/column/cell
content/classes/attributes, stable string keys, single sort/reset/comparator, native
single-value filter/defaults/options, local pagination and change notifications, explicit
checkbox checked/default/disabled/bulk scopes, native overflow events, footer text/spans,
empty/loading regions and narrow public controller/type replacements.

Individually recorded omissions include unloaded/cascade/tree/children/indent/on-load;
expanded keys/defaults/expand-all/expandable/render-expand-icon/renderExpand/sticky expansion;
remote requests; virtual-scroll/header/x/header-height/height-for-row/min-row-height/flex-height;
enhanced group headers/body colSpan/rowSpan/titleColSpan; multiple sort/customNextSortOrder;
multiple filter values/filterMultiple/filterMode; radio/single selection; renderFilter/
renderFilterIcon/renderFilterMenu/renderSorter/renderSorterIcon and every inline argument;
ellipsis/component remount; spinner and all stroke/scale/radius fields; scrollbar/Popover
forwarding; top summary placement/generated SummaryRowData; CSV extractors/allowExport/
downloadCsv/fileName/keepOriginalData; all seven scrolling signatures; resize callback and
width arguments; theme props; framework callback aliases/deprecated methods/props; and
every incompatible public renderer/column-family/row-data/slot/export type.

Native details, native element scrolling, scoped fixed-column CSS and explicit application
pager/filter/submit code are **alternatives**, not hidden claims that omitted source APIs
exist. Source Markdown/source get-csv-header signature disagreement is recorded, not erased.
Source-only CompareFn/Filter/SorterMultiple/SummaryCell/selection-option families and all
public exports are explicitly tracked. No full grid/framework/pixel/assistive-tech parity.

## Four accepted steps

1. [x] Preserve pinned original identities; review native Table, Virtual List, Transfer,
   Checkbox/Pagination/Form and legacy advanced prior art.
2. [x] Implement native data/column/key/selection ownership and validated local operations.
3. [x] Preserve nodes/edits/focus, enforce span/scale limits and a real hidden-form reveal policy.
4. [x] Targeted regressions, declaration/build/budget checks and actual Chromium acceptance.

**Next: Log**, then Infinite Scroll, Popselect and Split. P5 remains in progress; no later
component implementation is included in this commit.

## Measured acceptance — 2026-09-09

`pnpm exec vitest run tests\data-table.test.ts tests\table.test.ts tests\checkbox.test.ts
tests\pagination.test.ts tests\form.test.ts tests\native.test.ts`: **252 tests** including
**62 Data Table** cases. `pnpm build` validates declarations, independent ESM/classic/CSS
exports and all old/new budgets. No new dependency was installed.

Chromium **151.0.7922.174**, dedicated local Data Table demo tab; other existing demo/user
tabs untouched. The live Naive UI 2.45.3 page was reviewed in its own reference tab.

| Actual browser acceptance | Result |
| --- | --- |
| Native accessibility structure | table/caption/rowgroup/columnheader/rowheader/cell, labelled native checkbox/spinbutton/textbox/buttons; no grid role |
| Header keyboard | Enter -> ascending; Space -> descending; Enter -> natural order; one meaningful aria-sort and one event per accepted click |
| Numeric stable ties | 2/2/5/8/10/30 ascending; original Bravo/Charlie tie order retained |
| Row identity/edit/focus | All six original rows remained; edited Alpha note and selectionStart=2 survived programmatic sorting |
| Native page checkbox | Space checked Alpha/Bravo on page one; off-page Charlie and disabled Delta selection remained |
| Real FormData | Hidden Charlie checkbox/score/note submitted; disabled selected Delta checkbox excluded while Delta score submitted |
| Filter/pager/summary | Charlie-only filter retained hidden fields; page two showed Charlie/Delta, page total 32, filtered total 57 |
| Filtered empty | No matching rows, page 1/pageCount 0/empty visible set, no unrelated row selected |
| Invalid hidden numeric field | Gate cleared stale sort, revealed all, native validation focused Alpha score; no field was disabled |
| Reset/cancellation/locks | Native defaults restored; canceled reset retained Alpha/Delta; bulk uncheck left disabled Delta, native checkbox FormData empty |
| Focus when paging away | Focus moved to the native section root rather than a hidden row |
| 2,000-row native fixture | Exactly 2,000 mounted original rows, 20 visible, 100 local pages, only two pager buttons |
| All-data selection fixture | 2,000 selected keys and 2,000 real FormData entries; disconnect revealed all 2,000 original nodes |
| Measured fixture timing | Final build: 358.4ms bind and 274.2ms sort on that fixture/browser; observations, not throughput/SLA claims |
| 320px scroll/nesting | 305px document width; native region 273px client/968px scroll; ArrowRight moved 40px; nested cell padding 1px versus parent 6px |
| RTL + 200% CSS zoom | 305px document width; native table/table-header-group/sticky structure preserved |
| Print/media | Scroll overflow visible/max-height none, static header; current four hidden rows stayed hidden; forced-colors/reduced-motion matched |
| No JavaScript | Six editable/readable rows, enhancement controls hidden, native reset restored Alpha note; grouped static table retained rowspan=2 |
| ESM/classic/core/plugins | No native custom-element registration; original nodes survived later core/advanced/widgets loading; legacy grid rendered its own “legacy” cell; classic namespace replacement rejected |
| Final dynamic/handoff check | Removing the focused last-page row clamped to page 2 and focused the root; changed count markup rejected without destruction; disconnect preserved four surviving rows/edits/checks and did not resurrect removed keys |
| Bidirectional checkbox ownership | A later CheckboxGroup could not steal a table checkbox; it could bind after Data Table explicitly disconnected |

Review/regression fixes include early dataset-bound validation, nested-owner controls,
footer span coverage, preserving native hidden toolbar fallback, explicit rejected drafts,
external native form reset, bidirectional checkbox/dynamic-anatomy ownership and clearing stale numeric sorting
before whole-form validation. Final-browser recheck had no unexpected page errors. This is not all-browser,
browser-UI zoom, paper-pagination, screen-reader speech or framework-renderer certification.

### Payload and previous-asset preservation

All gzip figures use the build's **level 9**, not a different default compression setting.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Data Table ESM | 21,263 | 7,305 | 9,000 |
| Data Table classic | 21,552 | 7,441 | 9,000 |
| Data Table CSS (including native Table) | 6,469 | 1,496 | 2,000 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional ESM + CSS: **8,801 gzip bytes**; classic + CSS: **8,937**.
All **187 prior top-level JS/CSS assets byte-match** the pre-Data-Table build.
Sorted filename + NUL + content SHA-256:
`1413502c2c4b945616be24be3edbe33027cb3a16d76a7f9e165ddc8c0c60cc83`.
No previous source asset or budget changed; generated dist follows the existing ignore policy.
All **503 scoped Data Table/reference/index/master relative links** resolve.

Catalog after this component: **3,853 rows / 304 of 384 tasks / 76 accepted pages**,
80 unchecked tasks. P5 has six of ten routes accepted: **765 rows = 269 adapted +
400 omitted + 96 unresolved**. Remaining P5 Log/Infinite Scroll/Popselect/Split:
**99 rows / 96 unresolved**. P4's 984 rows/68 tasks remain unchanged.
