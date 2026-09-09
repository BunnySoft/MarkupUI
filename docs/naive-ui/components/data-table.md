# Data Table

**🟢 Verified retained native table scope, not advanced-grid/framework parity.**
[Canonical anatomy, ownership and measured acceptance](../../components/data-table.md).
Real authored rows, explicit string keys, typed synchronous comparator/predicate callbacks,
single-column stable sort, AND-combined string filters, local hide-only paging, native
checkbox selection, footer text summaries and explicit reveal-before-validation.
No renderer, virtual tbody, data loader, hidden form proxy or cell keyboard grid is introduced.
The [legacy advanced MuiDataGrid](../../../src/plugins/advanced.ts) remains unchanged.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Next:** Log, then Infinite Scroll, Popselect and Split; P5 is still incomplete.

1. [x] **Define column records.** Original table/headers/rows/cells remain authored; reject
   grouped enhanced headers/body spans, preserve independent static Table and footer spans.
2. [x] **Stage data operations.** Validate keys/configuration/callback results before own
   mutation; distinguish local sort/filter/page order, selection scope and native fields.
3. [x] **Isolate scale features.** At most 2,000 mounted rows/64 columns; bounded two-button
   pager, no virtualization, remote engine, drag/resize or export claim.
4. [x] **Exercise table invariants.** Targeted tests, declarations/build/budgets and actual
   Chromium keyboard/identity/FormData/reveal/reset/scroll/RTL/media/no-JS/coexistence.

### Native primitives and fallback

Authored native table/caption/rowgroups/cells/controls remain readable without JavaScript.
Enhancement controls are hidden until bound; sorting moves original rows and paging hides
but never unmounts fields. Explicit whole-form reveal precedes native validation. Native
details in a cell, browser scrolling and scoped sticky CSS replace framework machinery.
Disconnect retains current rows/edits/checks and releases helper visibility/owned attributes.

## Reference and review boundary

- [Official live page](https://www.naiveui.com/en-US/os-theme/components/data-table):
  rendered 2.45.3 with 53 tables on 2026-09-09 despite HTTP 404.
- [Pinned API][api], [interfaces][interface], [controller][controller],
  [data/filter/page staging][data], [selection][check], [exports][exports],
  [public types][public].
- [Catalog](../index.md) · [Architecture](../architecture.md).

Pinned revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**.
The source uses reactive tree/data/column models, Vue renderers, native and virtual table
paths, cascade checking and framework-controlled props. Source remote mode bypasses local
page slicing, while filtered/sorted data getters still have their own current-data scope.
The target does not implement a remote flag or pretend local sorting performs remote work.
Public Markdown describes get-csv-header with a columns array; source public-types instead
accepts one TableBaseColumn. Neither CSV signature is retained.

**All 147 original identities remain, in their original section/member/kind/API-line order.**
This is **115 original table rows + 32 original inline/type declarations**.
`API:Lnn` denotes the exact pinned [API][api] URL plus `#Lnn`.
Source-only additions are explicitly separated below. A Verified row means only the
documented native adaptation; an omission is a deliberate boundary, not an unchecked task.
No opaque renderer/provider/column-family type is claimed compatible.
**147 original identities + 64 source-only supplements = 211 rows:
76 adapted native capabilities + 135 intentional omissions; zero unresolved.**

<!-- BEGIN PINNED API INVENTORY -->

### DataTable Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `allow-checking-not-loaded` · API:L72 | Prop | No unloaded/tree keys; unknown keys reject. | ⏭️ Intentionally omitted |
| `bordered` · API:L73 | Prop | Composed native Table CSS data-bordered. | 🟢 Verified |
| `bottom-bordered` · API:L74 | Prop | Table bottom/perimeter rules, independent of row dividers. | 🟢 Verified |
| `checked-row-keys` · API:L75 | Prop | state.checkedKeys and setCheckedKeys; original native checkboxes. | 🟢 Verified |
| `cascade` · API:L76 | Prop | Flat rows only; no hierarchy checking. | ⏭️ Intentionally omitted |
| `children-key` · API:L77 | Prop | No tree row model. | ⏭️ Intentionally omitted |
| `columns` · API:L78 | Prop | Native keyed headers plus narrow comparator/predicate records, not renderer columns. | 🟢 Verified |
| `data` · API:L79 | Prop | Authored keyed tbody rows; caller updates DOM and calls refresh. | 🟢 Verified |
| `default-checked-row-keys` · API:L80 | Prop | Native checkbox defaultChecked and form reset, not a second default-key model. | 🟢 Verified |
| `default-expanded-row-keys` · API:L81 | Prop | No expanded tree/row keys. | ⏭️ Intentionally omitted |
| `default-expand-all` · API:L82 | Prop | Author native details.open inside a cell instead. | ⏭️ Intentionally omitted |
| `expanded-row-keys` · API:L83 | Prop | No generated expansion row model. | ⏭️ Intentionally omitted |
| `filter-icon-popover-props` · API:L84 | Prop | Labelled native controls, no filter popover. | ⏭️ Intentionally omitted |
| `flex-height` · API:L85 | Prop | No measured/flex split-header layout. | ⏭️ Intentionally omitted |
| `get-csv-cell` · API:L86 | Prop | No export or business serialization. | ⏭️ Intentionally omitted |
| `get-csv-header` · API:L87 | Prop | No CSV header extractor. | ⏭️ Intentionally omitted |
| `header-height` · API:L88 | Prop | Native automatic header height; no virtual header. | ⏭️ Intentionally omitted |
| `height-for-row` · API:L89 | Prop | No virtual row measurement. | ⏭️ Intentionally omitted |
| `indent` · API:L90 | Prop | No tree data. | ⏭️ Intentionally omitted |
| `loading` · API:L91 | Prop | Informative aria-busy and authored loading text; fields stay usable. | 🟢 Verified |
| `max-height` · API:L92 | Prop | External --mui-data-table-max-height scroll-region token. | 🟢 Verified |
| `min-height` · API:L93 | Prop | External --mui-data-table-min-height token. | 🟢 Verified |
| `min-row-height` · API:L94 | Prop | No virtual geometry contract. | ⏭️ Intentionally omitted |
| `paginate-single-page` · API:L95 | Prop | Two authored pager buttons remain present, disabled at bounds; no flag. | ⏭️ Intentionally omitted |
| `pagination` · API:L96 | Prop | Local page/pageSize and optional native previous/next/size controls. | 🟢 Verified |
| `pagination-behavior-on-filter` · API:L97 | Prop | Filter changes default to first page; explicit simultaneous page validates. | 🟢 Verified |
| `remote` · API:L98 | Prop | App owns remote request/intent/update; no remote emulation. | ⏭️ Intentionally omitted |
| `render-cell` · API:L99 | Prop | Authored original cells and native controls, never a VNode callback. | 🟢 Verified |
| `render-expand-icon` · API:L100 | Prop | No custom expansion icon renderer. | ⏭️ Intentionally omitted |
| `row-class-name` · API:L101 | Prop | Original native row classes remain application-owned. | 🟢 Verified |
| `row-key` · API:L102 | Prop | Explicit immutable data-data-key string, no implicit coercion. | 🟢 Verified |
| `row-props` · API:L103 | Prop | Real authored row attributes/listeners remain intact on moves. | 🟢 Verified |
| `scroll-x` · API:L104 | Prop | Native overflow and author table/column widths; no synchronized split table. | 🟢 Verified |
| `scrollbar-props` · API:L105 | Prop | Browser scrollbar, no forwarding. | ⏭️ Intentionally omitted |
| `single-column` · API:L106 | Prop | Table CSS suppresses row dividers; does not mean one column. | 🟢 Verified |
| `single-line` · API:L107 | Prop | Table CSS controls column dividers; does not mean nowrap. | 🟢 Verified |
| `size` · API:L108 | Prop | Composed Table small/medium/large CSS. | 🟢 Verified |
| `spin-props` · API:L109 | Prop | No spinner dependency/prop bag. | ⏭️ Intentionally omitted |
| `sticky-expanded-rows` · API:L110 | Prop | No generated expanded rows. | ⏭️ Intentionally omitted |
| `striped` · API:L111 | Prop | Native Table visible-row striping; hidden rows stay mounted. | 🟢 Verified |
| `summary` · API:L112 | Prop | Explicit scoped text callbacks targeting authored tfoot spans. | 🟢 Verified |
| `summary-placement` · API:L113 | Prop | Bottom native tfoot only; no top relocation. | ⏭️ Intentionally omitted |
| `table-layout` · API:L114 | Prop | Browser/native author CSS auto/fixed; no implicit layout switch. | 🟢 Verified |
| `virtual-scroll` · API:L115 | Prop | Bounded full mounted rows; never an absolute li window in tbody. | ⏭️ Intentionally omitted |
| `virtual-scroll-header` · API:L116 | Prop | No virtual header. | ⏭️ Intentionally omitted |
| `virtual-scroll-x` · API:L117 | Prop | No virtual columns. | ⏭️ Intentionally omitted |
| `on-load` · API:L118 | Callback | No loader/fetch/async expansion. | ⏭️ Intentionally omitted |
| `on-scroll` · API:L119 | Callback | Native scroll event on authored region, not a custom alias. | 🟢 Verified |
| `on-update:checked-row-keys` · API:L120 | Callback | mui:data-table-change source=selection, state.checkedKeys and native event. | 🟢 Verified |
| `on-update:expanded-row-keys` · API:L121 | Callback | Native details toggle is application-owned, not row expansion keys. | ⏭️ Intentionally omitted |
| `on-update:filters` · API:L122 | Callback | Native change -> source=filter; setters silent. | 🟢 Verified |
| `on-update:page` · API:L123 | Callback | Settled native pager click -> source=page. | 🟢 Verified |
| `on-update:page-size` · API:L124 | Callback | Native size change -> source=page-size and first page. | 🟢 Verified |
| `on-update:sorter` · API:L125 | Callback | Settled native header button -> source=sort and sort/null state. | 🟢 Verified |

### DataTableColumn Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `align` · API:L131 | Record field | Authored cell CSS/native alignment retained. | 🟢 Verified |
| `allowExport` · API:L132 | Record field | No export. | ⏭️ Intentionally omitted |
| `cellProps` · API:L133 | Record field | Authored native cell attributes/listeners, no prop generator. | 🟢 Verified |
| `children` · API:L134 | Record field | Enhanced grouped headers rejected; use independent static Table. | ⏭️ Intentionally omitted |
| `className` · API:L135 | Record field | Original cell/column/header classes remain. | 🟢 Verified |
| `colSpan` · API:L136 | Record field | Enhanced body spans rejected, not silently broken. | ⏭️ Intentionally omitted |
| `customNextSortOrder` · API:L137 | Record field | Fixed ascending/descending/null native button cycle. | ⏭️ Intentionally omitted |
| `defaultFilterOptionValue` · API:L138 | Record field | Native filter input/select defaults restored by form reset. | 🟢 Verified |
| `defaultFilterOptionValues` · API:L139 | Record field | No multiple-option filter state. | ⏭️ Intentionally omitted |
| `defaultSortOrder` · API:L140 | Record field | Initial options.sort is the native reset target. | 🟢 Verified |
| `disabled` · API:L141 | Record field | Native checkbox/fieldset :disabled; setter/bulk cannot alter locked selection. | 🟢 Verified |
| `ellipsis` · API:L142 | Record field | No automatic ellipsis/tooltip renderer. Author wrapping by default. | ⏭️ Intentionally omitted |
| `ellipsis-component` · API:L143 | Record field | No performant-ellipsis swap/remount. | ⏭️ Intentionally omitted |
| `expandable` · API:L144 | Record field | No generated expansion eligibility. | ⏭️ Intentionally omitted |
| `filter` · API:L145 | Record field | Explicit synchronous (nativeRow,string)->boolean; no implicit parser. | 🟢 Verified |
| `filterMode` · API:L146 | Record field | AND across column predicates; OR/AND option arrays excluded. | ⏭️ Intentionally omitted |
| `filterMultiple` · API:L147 | Record field | Single native string per column, not arrays. | ⏭️ Intentionally omitted |
| `filterOptionValue` · API:L148 | Record field | filters[key] string, including native select value; empty means no predicate. | 🟢 Verified |
| `filterOptionValues` · API:L149 | Record field | No filter value arrays. | ⏭️ Intentionally omitted |
| `filterOptions` · API:L150 | Record field | Authored native option labels/values, no data renderer. | 🟢 Verified |
| `fixed` · API:L151 | Record field | Author scoped sticky logical column CSS with explicit widths; no width engine. | 🟢 Verified |
| `key` · API:L152 | Record field | Unique string operation key matching th[data-data-column]. | 🟢 Verified |
| `maxWidth` · API:L153 | Record field | No draggable/resizable width limiter. | ⏭️ Intentionally omitted |
| `minWidth` · API:L154 | Record field | Author native table/cell/col sizing CSS. | 🟢 Verified |
| `multiple` · API:L155 | Record field | Native checkboxes only; radio/single-selection mode excluded. | ⏭️ Intentionally omitted |
| `options` · API:L156 | Record field | Explicit select(page/filtered/all,boolean) and authored action buttons. | 🟢 Verified |
| `render` · API:L157 | Record field | Original authored cell content, not a generic renderer. | 🟢 Verified |
| `renderExpand` · API:L158 | Record field | Native details in a cell is an alternative, not full-width expansion parity. | ⏭️ Intentionally omitted |
| `renderFilter` · API:L159 | Record field | No VNode trigger renderer; native labelled controls instead. | ⏭️ Intentionally omitted |
| `renderFilterIcon` · API:L160 | Record field | No filter icon renderer. | ⏭️ Intentionally omitted |
| `renderFilterMenu` · API:L161 | Record field | No filter menu/overlay. | ⏭️ Intentionally omitted |
| `renderSorter` · API:L162 | Record field | Author real header button text; renderer function excluded. | ⏭️ Intentionally omitted |
| `renderSorterIcon` · API:L163 | Record field | External CSS arrows plus one aria-sort; no VNode icon. | ⏭️ Intentionally omitted |
| `resizable` · API:L164 | Record field | No drag/keyboard resize handles or sizing observer. | ⏭️ Intentionally omitted |
| `rowSpan` · API:L165 | Record field | Enhanced body spans, including rowspan=0, rejected. | ⏭️ Intentionally omitted |
| `sortOrder` · API:L166 | Record field | Explicit set({sort}) or null, not controlled framework props. | 🟢 Verified |
| `sorter` · API:L167 | Record field | Explicit finite-number row comparator; stable ties; no boolean/default parser. | 🟢 Verified |
| `title` · API:L168 | Record field | Authored native th content; no title renderer. | 🟢 Verified |
| `titleAlign` · API:L169 | Record field | Independently authored th CSS/alignment. | 🟢 Verified |
| `titleColSpan` · API:L170 | Record field | Single unspanned enhanced header row only. | ⏭️ Intentionally omitted |
| `tree` · API:L171 | Record field | No treegrid/indentation/row expansion model. | ⏭️ Intentionally omitted |
| `type` · API:L172 | Record field | Native selection checkbox anatomy only; no column-type renderer/expand mode. | 🟢 Verified |
| `width` · API:L173 | Record field | Native colgroup/cell external CSS, including explicitly sized sticky demo. | 🟢 Verified |

### DataTable Methods

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `clearFilters` · API:L221 | Method | set({filters:null}) clears filters and returns to page one. | 🟢 Verified |
| `clearSorter` · API:L222 | Method | set({sort:null}) restores captured source order. | 🟢 Verified |
| `downloadCsv` · API:L223 | Method | No export/download; tests trigger no real downloads. | ⏭️ Intentionally omitted |
| `getCurrentPageData` · API:L224 | Method | state.visibleKeys addresses original native rows; no copied business-data return. | 🟢 Verified |
| `getFilteredAndSortedData` · API:L225 | Method | state.filteredKeys is the sorted filtered local scope, independent of page. | 🟢 Verified |
| `filters` · API:L226 | Method | set({filters}) validates known string predicate columns atomically. | 🟢 Verified |
| `page` · API:L227 | Method | set({page}) rejects out-of-range requests; refresh shrink clamps explicitly. | 🟢 Verified |
| `scrollTo` · API:L228 | Method | Native region.scrollTo/element.scrollIntoView belongs to caller; no facade. | ⏭️ Intentionally omitted |
| `sort` · API:L229 | Method | set({sort:{key,order}}), ascending/descending or null. | 🟢 Verified |

### DataTable Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `empty` · API:L235 | Slot | Authored plain-text data-data-empty region. | 🟢 Verified |
| `loading` · API:L236 | Slot | Authored plain-text data-data-loading region. | 🟢 Verified |

### DataTableScrollTo Type

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `(x: number, y: number)` · API:L244 | Record field | No custom scrolling overload. | ⏭️ Intentionally omitted |
| `{ left?, top?, behavior?, debounce? }` · API:L245 | Record field | Native ScrollToOptions is separate; no debounce facade. | ⏭️ Intentionally omitted |
| `{ position: 'top' \| 'bottom', behavior?, debounce? }` · API:L246 | Record field | No position overload. | ⏭️ Intentionally omitted |
| `{ index, behavior?, debounce? }` · API:L247 | Record field | No virtual index scrolling. | ⏭️ Intentionally omitted |
| `{ key, behavior?, debounce? }` · API:L248 | Record field | reveal(key) changes visibility/page only, not this scroll signature. | ⏭️ Intentionally omitted |
| `{ el, behavior?, debounce? }` · API:L249 | Record field | Caller may use native element.scrollIntoView after reveal. | ⏭️ Intentionally omitted |
| `{ index, elSize, behavior?, debounce? }` · API:L250 | Record field | No index/element-size geometry. | ⏭️ Intentionally omitted |

### DataTableSortState

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `columnKey` · API:L181 | Record field | DataTableSort.key, explicit known string. | 🟢 Verified |
| `sorter` · API:L182 | Record field | Comparator belongs to immutable column options, not returned sorter/boolean union. | ⏭️ Intentionally omitted |
| `order` · API:L183 | Record field | Native aria-sort vocabulary; null resets the entire sort. | 🟢 Verified |

### DataTableFilterState

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `[key: string]` · API:L191 | Index field | Known column string->string record, not array/numeric/undefined union. | 🟢 Verified |

### DataTableCreateSummary

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `DataTableCreateSummary` · API:L198 | Return hook | Narrow DataTableSummary.value returns safe text, not a cell record renderer. | 🟢 Verified |
| `pageData` · API:L198 | Parameter | Explicit page/filtered/all scope supplies readonly original native-row array. | 🟢 Verified |

### DataTableCreateSummary result

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `[columnKey: string]` · API:L200 | Record field | No generated summary record->cell map; target is an explicit span key. | ⏭️ Intentionally omitted |
| `value?` · API:L201 | Record field | Text-only synchronous callback value, not VNodeChild. | 🟢 Verified |
| `colSpan?` · API:L202 | Record field | Original native footer colspan remains authored and unchanged. | 🟢 Verified |
| `rowSpan?` · API:L203 | Record field | Original native footer rowspan remains outside sortable tbody. | 🟢 Verified |

### DataTable Props: render-expand-icon inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-expand-icon.expanded` · API:L100 | Inline record field | No expansion renderer argument. | ⏭️ Intentionally omitted |
| `render-expand-icon.rowData` · API:L100 | Inline record field | No expansion renderer row argument. | ⏭️ Intentionally omitted |

### DataTable Props: spin-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `spin-props.strokeWidth?` · API:L109 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.stroke?` · API:L109 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.scale?` · API:L109 | Inline record field | No spinner. | ⏭️ Intentionally omitted |
| `spin-props.radius?` · API:L109 | Inline record field | No spinner. | ⏭️ Intentionally omitted |

### DataTable Props: on-update:checked-row-keys inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-update:checked-row-keys.row` · API:L120 | Inline record field | Native event.target identifies the action/control; no business-row meta object. | ⏭️ Intentionally omitted |
| `on-update:checked-row-keys.action` · API:L120 | Inline record field | source=selection plus actual checkedness/scope; no checkAll string alias. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: filterOptions inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `filterOptions.label` · API:L150 | Inline record field | Native option text/label. | 🟢 Verified |
| `filterOptions.value` · API:L150 | Inline record field | Explicit native string option.value; no number coercion. | 🟢 Verified |

### DataTableColumn Properties: options inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `options.label` · API:L156 | Inline record field | Authored native action button label states selection scope. | 🟢 Verified |
| `options.key` · API:L156 | Inline record field | No menu option-key model. | ⏭️ Intentionally omitted |
| `options.onSelect` · API:L156 | Inline record field | App button handler calls select(scope,checked); no pageData menu callback. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: renderFilter inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `renderFilter.active` · API:L159 | Inline record field | No renderer state. | ⏭️ Intentionally omitted |
| `renderFilter.show` · API:L159 | Inline record field | No overlay state. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: renderFilterIcon inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `renderFilterIcon.active` · API:L160 | Inline record field | No renderer state. | ⏭️ Intentionally omitted |
| `renderFilterIcon.show` · API:L160 | Inline record field | No overlay state. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: renderFilterMenu inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `renderFilterMenu.hide` · API:L161 | Inline record field | No menu lifecycle function. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: renderSorter inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `renderSorter.order` · API:L162 | Inline record field | No renderer argument; native header owns aria-sort. | ⏭️ Intentionally omitted |

### DataTableColumn Properties: renderSorterIcon inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `renderSorterIcon.order` · API:L163 | Inline record field | No renderer argument. | ⏭️ Intentionally omitted |

### DataTable Methods: downloadCsv inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `downloadCsv.fileName?` · API:L223 | Inline record field | No file download. | ⏭️ Intentionally omitted |
| `downloadCsv.keepOriginalData?` · API:L223 | Inline record field | No export data scope/serializer. | ⏭️ Intentionally omitted |

### Source-only public exports

Each identity below is explicit source evidence from [index.ts][exports] or
[public-types.ts][public], **not an additional original Markdown API row**.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NDataTable` · exports | Component export | createDataTable on a native root; no registration. | 🟢 Verified |
| `dataTableProps` · exports | Props record | No Vue prop schema. | ⏭️ Intentionally omitted |
| `DataTableBaseColumn` · exports | Type alias | No renderer-capable base-column compatibility alias. | ⏭️ Intentionally omitted |
| `DataTableColumn` · exports | Type alias | MarkupUI same-named type is deliberately narrower: key/compare/filter only. | 🟢 Verified |
| `DataTableColumnGroup` · exports | Type alias | No enhanced grouped headers. | ⏭️ Intentionally omitted |
| `DataTableColumnKey` · exports | Type alias | Native nonempty strings only, no numeric union alias. | ⏭️ Intentionally omitted |
| `DataTableColumns` · exports | Type alias | Readonly native operation records; no upstream column-family array alias. | ⏭️ Intentionally omitted |
| `DataTableCreateRowClassName` · exports | Type alias | No row class factory. | ⏭️ Intentionally omitted |
| `DataTableCreateRowKey` · exports | Type alias | Explicit DOM keys, not a key factory. | ⏭️ Intentionally omitted |
| `DataTableCreateRowProps` · exports | Type alias | No row prop factory. | ⏭️ Intentionally omitted |
| `DataTableCreateSummary` · exports | Type alias | DataTableSummary explicit text target/scope, not upstream return union. | 🟢 Verified |
| `DataTableExpandColumn` · exports | Type alias | No generated expansion columns. | ⏭️ Intentionally omitted |
| `DataTableFilterState` · exports | Type alias | Native filters is a string record; opaque upstream array/numeric union omitted. | ⏭️ Intentionally omitted |
| `DataTableInst` · exports | Interface | Native DataTableController has explicit, independently typed methods. | 🟢 Verified |
| `DataTableProps` · exports | Type alias | No ExtractPublicPropTypes or runtime prop bridge. | ⏭️ Intentionally omitted |
| `DataTableRenderFilter` · exports | Type alias | No VNode renderer. | ⏭️ Intentionally omitted |
| `DataTableRenderFilterIcon` · exports | Type alias | No VNode renderer. | ⏭️ Intentionally omitted |
| `DataTableRenderSorter` · exports | Type alias | No VNode renderer. | ⏭️ Intentionally omitted |
| `DataTableRenderSorterIcon` · exports | Type alias | No VNode renderer. | ⏭️ Intentionally omitted |
| `DataTableRowData` · exports | Type alias | Original native rows, no Record<string,any> business-data model. | ⏭️ Intentionally omitted |
| `DataTableRowKey` · exports | Type alias | Native string keys only; no compatibility alias. | ⏭️ Intentionally omitted |
| `DataTableScrollTo` · exports | Type alias | All seven overloads individually omitted above. | ⏭️ Intentionally omitted |
| `DataTableSelectionColumn` · exports | Type alias | No selection column renderer family. | ⏭️ Intentionally omitted |
| `DataTableSlots` · exports | Interface | Authored native regions, not slot functions. | ⏭️ Intentionally omitted |
| `DataTableSortOrder` · exports | Type alias | Native ascending/descending; null whole-sort reset, no ascend/descend/false alias. | ⏭️ Intentionally omitted |
| `DataTableSortState` · exports | Interface alias | DataTableSort key/order plus null; no sorter field. | 🟢 Verified |
| `DataTableGetCsvCell` · public | Type alias | No export extractor. | ⏭️ Intentionally omitted |
| `DataTableGetCsvHeader` · public | Type alias | Source singular column differs from API Markdown array; both excluded. | ⏭️ Intentionally omitted |
| `DataTableSize` · public | Type alias | Native Table CSS vocabulary, not a runtime/type compatibility export. | ⏭️ Intentionally omitted |
| `DataTableSpinProps` · public | Type alias | No SharedSpinProps dependency. | ⏭️ Intentionally omitted |

### Source-only props, aliases and declarations

These are separately identified in [interface.ts][interface] and
[DataTable.tsx][controller]. Deprecated spellings are not silently merged into current
API rows. Private injection/measurement/render-tree internals are not public API claims.

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `DataTableSlots.default` · interface | Slot | Actual authored native table content, not a default VNode slot. | 🟢 Verified |
| `DataTableInst.filter` · interface | Method | Native set({filters}); deprecated/singular facade is not exported. | ⏭️ Intentionally omitted |
| `DataTableInst.clearFilter` · interface | Deprecated method | Use set({filters:null}); no legacy alias. | ⏭️ Intentionally omitted |
| `onUpdatePage` · interface | Callback alias | No framework camel-case callback alias. | ⏭️ Intentionally omitted |
| `onUpdatePageSize` · interface | Callback alias | No callback alias. | ⏭️ Intentionally omitted |
| `onUpdateSorter` · interface | Callback alias | No callback alias. | ⏭️ Intentionally omitted |
| `onUpdateFilters` · interface | Callback alias | No callback alias. | ⏭️ Intentionally omitted |
| `onUpdateCheckedRowKeys` · interface | Callback alias | No callback alias. | ⏭️ Intentionally omitted |
| `onUpdateExpandedRowKeys` · interface | Callback alias | No callback alias. | ⏭️ Intentionally omitted |
| `onPageChange` · interface | Deprecated callback | No legacy callback alias. | ⏭️ Intentionally omitted |
| `onPageSizeChange` · interface | Deprecated callback | No legacy callback alias. | ⏭️ Intentionally omitted |
| `onSorterChange` · interface | Deprecated callback | No legacy callback alias. | ⏭️ Intentionally omitted |
| `onFiltersChange` · interface | Deprecated callback | No legacy callback alias. | ⏭️ Intentionally omitted |
| `onCheckedRowKeysChange` · interface | Deprecated callback | No legacy callback alias. | ⏭️ Intentionally omitted |
| `onUnstableColumnResize` · interface | Callback | No column resize engine. | ⏭️ Intentionally omitted |
| `onUnstableColumnResize.resizedWidth` · interface | Parameter | No resize callback. | ⏭️ Intentionally omitted |
| `onUnstableColumnResize.limitedWidth` · interface | Parameter | No resize callback. | ⏭️ Intentionally omitted |
| `onUnstableColumnResize.column` · interface | Parameter | No resize callback. | ⏭️ Intentionally omitted |
| `onUnstableColumnResize.getColumnWidth` · interface | Parameter | No measured width lookup. | ⏭️ Intentionally omitted |
| `theme` · interface useTheme.props | Prop | External CSS only, no theme provider. | ⏭️ Intentionally omitted |
| `themeOverrides` · interface useTheme.props | Prop | No theme object merging. | ⏭️ Intentionally omitted |
| `builtinThemeOverrides` · interface useTheme.props | Prop | No builtin theme override object. | ⏭️ Intentionally omitted |
| `AdvancedTable` · controller alias | Component alias | No legacy component registration. | ⏭️ Intentionally omitted |
| `CompareFn` · interface | Type alias | Explicit native-row finite-number comparator. | 🟢 Verified |
| `SorterMultiple` · interface | Interface | Single sorted column only. | ⏭️ Intentionally omitted |
| `SorterMultiple.multiple` · interface | Record field | No multi-sort priority. | ⏭️ Intentionally omitted |
| `SorterMultiple.compare` · interface | Record field | No multi-sort/default comparator union. | ⏭️ Intentionally omitted |
| `Filter` · interface | Type alias | Explicit native-row/string boolean predicate, no coercion. | 🟢 Verified |
| `SummaryCell` · interface | Interface | No generated VNode summary cell record. | ⏭️ Intentionally omitted |
| `SummaryRowData` · interface | Type alias | No generated summary row map. | ⏭️ Intentionally omitted |
| `DataTableOnLoad` · interface | Type alias | No Promise loader. | ⏭️ Intentionally omitted |
| `DataTableSelectionOptions` · interface | Type alias | App native buttons replace menu/render callback array. | ⏭️ Intentionally omitted |
| `DataTableSelectionOption` · interface | Type alias | Explicit page/filtered/all scope and boolean, no all/none menu strings. | ⏭️ Intentionally omitted |
| `CsvOptionsType` · interface | Interface | No download options facade. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

See [canonical documentation](../../components/data-table.md) for exact retained APIs,
limits, operation/reset/selection/FormData lifetimes and acceptance evidence.

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/interface.ts
[controller]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/DataTable.tsx
[data]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/use-table-data.ts
[check]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/use-check.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/public-types.ts
