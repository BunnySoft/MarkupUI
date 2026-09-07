# Data Table

**Plan: Planned. Current baseline: partial advanced data grid; not parity-verified.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) renders rows/column children into native table cells and offers one-column string sorting.

- **HTML:** semantic table, caption, header cells and authored column/cell templates.
- **JS:** stable row keys; explicitly staged sort/filter/page/selection state; optional virtual window only when needed.
- **CSS:** external table layout, sticky columns/headers and resize handles.
- **Placement:** proposed `src/optional/data-table/`; keep simple table independent.

## Acceptance and gaps

Test grouped headers, sorting/filtering order, remote state, selection after reorder, CSV formula safety and keyboard resizing. Column records, summary/sort/filter types and every documented scrolling overload remain separately tracked. A rendered table is not 100-property parity.

## Upstream implementation evidence

Targeted [body rendering](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/TableParts/Body.tsx#L1060-L1177) and [scroll coordination](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/src/use-scroll.ts#L200-L309) show different native/virtual structures, horizontal virtual cells that may be divs, and explicit header/body scroll synchronization. Keep MarkupUI's baseline a real table. Horizontal virtualization remains **Not reviewed** for implementation until a complete accessible grid design and separate budget exist; do not copy semantic compromises just to reproduce appearance. Other table subsystems have not received exhaustive source review.

## Migration steps

**Delivery phase:** P5 — collections. **Task state:** 🔵 Planned.
**Prerequisites:** P2 semantic Table, P3 focus and P5 stable keys in the [master plan](../migration-plan.md).
**Next task:** reconcile existing rows/column children with explicit row keys and native table/header semantics.

1. [ ] **Define column records.** Resolve grouped headers, cell templates, spans and stable column identity before adding more render hooks.
2. [ ] **Stage data operations.** Specify sort/filter/page order, local versus remote ownership and selection persistence as separate contracts.
3. [ ] **Isolate scale features.** Approve fixed-height virtualization independently; defer horizontal virtualization until an accessible grid design exists.
4. [ ] **Exercise table invariants.** Test reordered rows, grouped headings, CSV formula safety, keyboard resizing and every retained scrolling overload.

### Native primitives and fallback

- **Native path:** real table/caption/th/td markup; native row/cell templates may clone explicit authored structures while stable keys preserve unaffected nodes. Native buttons/selects operate sort/filter controls.
- **Small enhancement:** an optional custom element owns data operations, AbortController requests and narrowly needed ResizeObserver measurements. CSS sticky/logical properties supplies simple fixed headers/columns with nonsticky fallback. Feature-detect advanced scale capabilities and prefer pagination/full native tables over a horizontal-grid polyfill or generic virtual renderer.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/data-table)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **115 local table rows + 32 supplementary declarations + 0 inherited rows = 147 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Ellipsis](ellipsis.md), [Popover](popover.md), [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### DataTable Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`allow-checking-not-loaded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L72) | Prop | Candidate presence attribute `allow-checking-not-loaded`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L73) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`bottom-bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L74) | Prop | Candidate presence attribute `bottom-bordered`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`checked-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L75) | Prop | Candidate JS `checkedRowKeys` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`cascade`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L76) | Prop | Candidate explicit JS `cascade` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`children-key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L77) | Prop | Candidate `children-key` attribute or JS `childrenKey`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`columns`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L78) | Prop | Extend authored mui-data-column definitions; column record/cell template contracts need individual review. | ⚪ Not reviewed | B1 mui-data-column children; partial only, verify this row. |
| [`data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L79) | Prop | Adapt existing rows JS array with stable row identity; preserve native table semantics. | 🔵 Planned | B1 rows array; name differs; partial only, verify this row. |
| [`default-checked-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L80) | Prop | Candidate native default/reset state for `default-checked-row-keys`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-expanded-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L81) | Prop | Candidate native default/reset state for `default-expanded-row-keys`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-expand-all`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L82) | Prop | Candidate native default/reset state for `default-expand-all`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`expanded-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L83) | Prop | Candidate JS `expandedRowKeys` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter-icon-popover-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L84) | Prop | Candidate explicit native-child configuration for `filter-icon-popover-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`flex-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L85) | Prop | Candidate presence attribute `flex-height`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`get-csv-cell`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L86) | Prop | Candidate explicit JS `getCsvCell` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`get-csv-header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L87) | Prop | Candidate explicit JS `getCsvHeader` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L88) | Prop | Candidate `header-height` attribute or JS `headerHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`height-for-row`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L89) | Prop | Candidate explicit JS `heightForRow` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L90) | Prop | Candidate `indent` attribute or JS `indent`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L91) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L92) | Prop | External CSS token/class for `max-height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`min-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L93) | Prop | External CSS token/class for `min-height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`min-row-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L94) | Prop | Candidate `min-row-height` attribute or JS `minRowHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`paginate-single-page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L95) | Prop | Candidate presence attribute `paginate-single-page`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pagination`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L96) | Prop | Candidate JS `pagination` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pagination-behavior-on-filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L97) | Prop | Candidate explicit JS `paginationBehaviorOnFilter` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`remote`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L98) | Prop | Candidate presence attribute `remote`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-cell`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L99) | Prop | Candidate authored `render-cell` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-expand-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L100) | Prop | Candidate authored `render-expand-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`row-class-name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L101) | Prop | Candidate explicit JS `rowClassName` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`row-key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L102) | Prop | Candidate explicit JS `rowKey` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`row-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L103) | Prop | Candidate explicit native-child configuration for `row-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scroll-x`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L104) | Prop | Candidate `scroll-x` attribute or JS `scrollX`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L105) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`single-column`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L106) | Prop | Candidate presence attribute `single-column`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`single-line`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L107) | Prop | Candidate presence attribute `single-line`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L108) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`spin-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L109) | Prop | Candidate explicit native-child configuration for `spin-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sticky-expanded-rows`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L110) | Prop | Candidate presence attribute `sticky-expanded-rows`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`striped`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L111) | Prop | Candidate presence attribute `striped`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`summary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L112) | Prop | Candidate `summary` attribute or JS `summary`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`summary-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L113) | Prop | Candidate explicit JS `summaryPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`table-layout`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L114) | Prop | Candidate `table-layout` attribute or JS `tableLayout`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`virtual-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L115) | Prop | Candidate explicit JS `virtualScroll` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`virtual-scroll-header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L116) | Prop | Candidate explicit JS `virtualScrollHeader` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`virtual-scroll-x`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L117) | Prop | Candidate explicit JS `virtualScrollX` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-load`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L118) | Callback | Explicit `on-load` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L119) | Callback | Candidate DOM `mui:scroll` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:checked-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L120) | Callback | Candidate DOM `mui:change:checked-row-keys` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:expanded-row-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L121) | Callback | Candidate DOM `mui:change:expanded-row-keys` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:filters`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L122) | Callback | Candidate DOM `mui:change:filters` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L123) | Callback | Candidate DOM `mui:change:page` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:page-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L124) | Callback | Candidate DOM `mui:change:page-size` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:sorter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L125) | Callback | Candidate DOM `mui:change:sorter` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L131) | Record field | Candidate plain-JS `align` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`allowExport`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L132) | Record field | Candidate plain-JS `allowExport` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`cellProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L133) | Record field | Candidate explicit native-child configuration for `cellProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`children`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L134) | Record field | Candidate plain-JS `children` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`className`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L135) | Record field | Candidate plain-JS `className` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`colSpan`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L136) | Record field | Candidate plain-JS `colSpan` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`customNextSortOrder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L137) | Record field | Candidate plain-JS `customNextSortOrder` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`defaultFilterOptionValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L138) | Record field | Candidate plain-JS `defaultFilterOptionValue` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`defaultFilterOptionValues`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L139) | Record field | Candidate plain-JS `defaultFilterOptionValues` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`defaultSortOrder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L140) | Record field | Candidate plain-JS `defaultSortOrder` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L141) | Record field | Candidate plain-JS `disabled` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`ellipsis`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L142) | Record field | Candidate plain-JS `ellipsis` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`ellipsis-component`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L143) | Record field | Candidate plain-JS `ellipsis-component` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`expandable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L144) | Record field | Candidate plain-JS `expandable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L145) | Record field | Candidate plain-JS `filter` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterMode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L146) | Record field | Candidate plain-JS `filterMode` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterMultiple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L147) | Record field | Candidate plain-JS `filterMultiple` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterOptionValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L148) | Record field | Candidate plain-JS `filterOptionValue` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterOptionValues`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L149) | Record field | Candidate plain-JS `filterOptionValues` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L150) | Record field | Candidate plain-JS `filterOptions` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`fixed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L151) | Record field | Candidate plain-JS `fixed` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L152) | Record field | Candidate plain-JS `key` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`maxWidth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L153) | Record field | Candidate plain-JS `maxWidth` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`minWidth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L154) | Record field | Candidate plain-JS `minWidth` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`multiple`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L155) | Record field | Candidate plain-JS `multiple` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L156) | Record field | Candidate plain-JS `options` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L157) | Record field | Candidate authored `render` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderExpand`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L158) | Record field | Candidate authored `renderExpand` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderFilter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L159) | Record field | Candidate authored `renderFilter` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderFilterIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L160) | Record field | Candidate authored `renderFilterIcon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderFilterMenu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L161) | Record field | Candidate authored `renderFilterMenu` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderSorter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L162) | Record field | Candidate authored `renderSorter` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderSorterIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L163) | Record field | Candidate authored `renderSorterIcon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`resizable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L164) | Record field | Candidate plain-JS `resizable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rowSpan`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L165) | Record field | Candidate plain-JS `rowSpan` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sortOrder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L166) | Record field | Candidate plain-JS `sortOrder` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sorter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L167) | Record field | Candidate plain-JS `sorter` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L168) | Record field | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleAlign`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L169) | Record field | Candidate plain-JS `titleAlign` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleColSpan`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L170) | Record field | Candidate plain-JS `titleColSpan` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L171) | Record field | Candidate plain-JS `tree` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L172) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L173) | Record field | Candidate plain-JS `width` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`clearFilters`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L221) | Method | Candidate plain-JS `clearFilters` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clearSorter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L222) | Method | Candidate plain-JS `clearSorter` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`downloadCsv`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L223) | Method | Candidate plain-JS `downloadCsv` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getCurrentPageData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L224) | Method | Candidate plain-JS `getCurrentPageData` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`getFilteredAndSortedData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L225) | Method | Candidate plain-JS `getFilteredAndSortedData` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filters`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L226) | Method | Candidate plain-JS `filters` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`page`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L227) | Method | Candidate plain-JS `page` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L228) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sort`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L229) | Method | Candidate plain-JS `sort` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L235) | Slot | Candidate authored `empty` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L236) | Slot | Candidate authored `loading` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableScrollTo Type

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`(x: number, y: number)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L244) | Record field | Candidate plain-JS `(x: number, y: number)` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ left?, top?, behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L245) | Record field | Candidate plain-JS `{ left?, top?, behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ position: 'top' \| 'bottom', behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L246) | Record field | Candidate plain-JS `{ position: 'top' \| 'bottom', behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ index, behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L247) | Record field | Candidate plain-JS `{ index, behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ key, behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L248) | Record field | Candidate plain-JS `{ key, behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ el, behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L249) | Record field | Candidate plain-JS `{ el, behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`{ index, elSize, behavior?, debounce? }`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L250) | Record field | Candidate plain-JS `{ index, elSize, behavior?, debounce? }` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableSortState

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`columnKey`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L181) | Record field | Candidate plain-JS `columnKey` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sorter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L182) | Record field | Candidate plain-JS `sorter` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`order`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L183) | Record field | Candidate plain-JS `order` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableFilterState

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`[key: string]`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L191) | Index field | Candidate plain-JS `[key: string]` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableCreateSummary

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DataTableCreateSummary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L198) | Return hook | Candidate plain-JS `DataTableCreateSummary` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pageData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L198) | Parameter | Candidate plain-JS `pageData` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableCreateSummary result

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`[columnKey: string]`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L200) | Record field | Candidate plain-JS `[columnKey: string]` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L201) | Record field | Candidate plain-JS `value?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`colSpan?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L202) | Record field | Candidate plain-JS `colSpan?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rowSpan?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L203) | Record field | Candidate plain-JS `rowSpan?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Props: render-expand-icon inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-expand-icon.expanded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L100) | Inline record field | Candidate authored `render-expand-icon.expanded` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-expand-icon.rowData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L100) | Inline record field | Candidate authored `render-expand-icon.rowData` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Props: spin-props inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spin-props.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L109) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L109) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L109) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L109) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Props: on-update:checked-row-keys inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-update:checked-row-keys.row`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L120) | Inline record field | Candidate DOM `mui:change:checked-row-keys.row` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:checked-row-keys.action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L120) | Inline record field | Candidate DOM `mui:change:checked-row-keys.action` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: filterOptions inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`filterOptions.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L150) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filterOptions.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L150) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: options inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`options.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L156) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L156) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.onSelect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L156) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: renderFilter inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderFilter.active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L159) | Inline record field | Candidate authored `renderFilter.active` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderFilter.show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L159) | Inline record field | Candidate authored `renderFilter.show` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: renderFilterIcon inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderFilterIcon.active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L160) | Inline record field | Candidate authored `renderFilterIcon.active` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`renderFilterIcon.show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L160) | Inline record field | Candidate authored `renderFilterIcon.show` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: renderFilterMenu inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderFilterMenu.hide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L161) | Inline record field | Candidate authored `renderFilterMenu.hide` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: renderSorter inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderSorter.order`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L162) | Inline record field | Candidate authored `renderSorter.order` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTableColumn Properties: renderSorterIcon inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`renderSorterIcon.order`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L163) | Inline record field | Candidate authored `renderSorterIcon.order` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DataTable Methods: downloadCsv inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`downloadCsv.fileName?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L223) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`downloadCsv.keepOriginalData?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/data-table/demos/enUS/index.demo-entry.md#L223) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
