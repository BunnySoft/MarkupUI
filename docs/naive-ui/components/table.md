# Table

**Plan: 🟢 Verified for retained native Table scope; four explicit type/theme omissions.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) retains its separate generated data-grid
table. Native Table is an independent stylesheet, not that renderer or a new custom element.

- **HTML:** actual table/caption/colgroup/thead/tbody/tfoot/tr/th/td, with authored scope/headers/spans and native controls.
- **JS:** none in the component; optional application form feedback only.
- **CSS:** scoped borders, stripe/density variants and explicit native scrolling; never grid/block-card table conversion.
- **Placement:** [table.css](../../../src/components/table/table.css), stylesheet export and [native demo](../../../demo/components/table.html); independent of Data Table.

## Acceptance and gaps

The [canonical acceptance record](../../components/table.md) reports 467 passing tests
(12 Table cases), build/budget gates and Chromium native structure/header/span/border/
stripe/form/scroll/hidden/nested/RTL/zoom/print/forced-color/legacy/no-JS evidence.
CSS is 1,023 gzip bytes and component JS is zero. Core/widgets/advanced remain unchanged.
Native collapsed borders and data-row-header/visible-row striping adaptations are explicit,
not source pixel parity. Sorting, selection and virtualization remain separate Data Table work.

## Migration steps

**Delivery phase:** P2 — semantic display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 authored HTML and P2 CSS tokens in the [master plan](../migration-plan.md).
**Next task:** Highlight; seven P2-assigned catalog rows remain Planned, so full P2 is not complete.

1. [x] **Define native anatomy.** Caption/rowgroups/headers/cells/colgroups and native spans/associations preserved.
2. [x] **Extract table variants.** Actual border axes, bottom-edge interactions, sizes and stripe scope implemented; no invented row hover.
3. [x] **Specify narrow-screen behavior.** Explicit named native scrolling without grid roles, cell moves or hidden controls.
4. [x] **Verify readable structure.** Associations/spans, 16 border combinations, forms/focus, hidden/nested, print/forced-color and no-JS behavior accepted.

### Native primitives and fallback

- **Native path:** actual table/caption/rowgroups/headers/cells with native associations, spans and controls. Authored templates stay inert until explicitly cloned by the application.
- **Small enhancement:** native collapsed borders, logical edges, CSS striping and an explicit overflow wrapper. No renderer, grid role, table polyfill, measurement, wrapper constructor or mandatory plugin.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/table)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 original local table rows + 5 public helper/default-content groups + 5 explicit source-only entries + 0 inherited rows = 16 tracker rows**.
All six original property identities remain: **12 Verified ADAPTED native targets and
4 Intentionally omitted contracts**. The five named helpers were present in public prose
but absent from the initial six-row tracker; they are not mislabeled as source-only discoveries.
Their simple default-child source behavior is grouped with each helper row below.
Table, helper and presentation source were reviewed for this retained scope, not every
framework edge case or browser. The canonical record defines adaptations and actual evidence.


### Table Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`bottom-bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L28) | Prop | Default on; exact data-bottom-bordered="false" suppresses the bottom perimeter only when data-bordered="false". | 🟢 Verified ADAPTED target | Four outer-edge combinations checked; bordered=true keeps its bottom edge regardless. Native collapsed-border handling includes spanning cells. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L29) | Prop | Default enclosing border; exact data-bordered="false" suppresses perimeter edges except optional bottom. | 🟢 Verified ADAPTED target | Native collapsed borders, not source separate-border/corner clipping. Internal row/column axes stay independent. |
| [`single-column`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L30) | Prop | Presence data-single-column removes tbody/tfoot row dividers; it does not change column count. | 🟢 Verified ADAPTED target | Native th/td data-row consistency; header separators retained. Source td-only/non-final-row details explicitly documented as adapted. |
| [`single-line`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L31) | Prop | Column dividers off by default; exact data-single-line="false" enables them. | 🟢 Verified ADAPTED target | Logical cell edges and all 16 border-flag combinations checked. Not a nowrap/text-layout feature. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L32) | Prop | data-size small/medium/large; absent/unknown uses medium. | 🟢 Verified ADAPTED target | 6/12/12px cell padding and 14/16/18px native rem text measured at a 16px root; no provider-font lookup. |
| [`striped`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L33) | Prop | Presence data-striped; alternate tbody row cells, including row headers. | 🟢 Verified ADAPTED target | Modern visible-row filtering ignores hidden/template entries; DOM-row fallback and source td-only parity differences documented. |

### Public named helper/default-content expansions

The [Components paragraph](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components)
names these five wrappers in addition to the Table owner. Each source wrapper only emits
its corresponding native tag and default children; those two aspects are grouped per row.
There are no separately declared helper props/events here. Framework wrapper exports and
dependency-collection machinery are not part of the native target.

| Upstream item · public source | Kind | Native target | Status | Source/default-content evidence |
| --- | --- | --- | --- | --- |
| [`n-thead`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components) | Public helper/default-content group | Native thead with authored rows. | 🟢 Verified ADAPTED target | [Thead source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Thead.tsx); native header-group display preserved. |
| [`n-tbody`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components) | Public helper/default-content group | Native tbody with authored rows. | 🟢 Verified ADAPTED target | [Tbody source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Tbody.tsx); hidden/templates and rowgroups remain native. |
| [`n-tr`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components) | Public helper/default-content group | Native tr with actual cells. | 🟢 Verified ADAPTED target | [Tr source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Tr.tsx); original row/cell order and native row display. |
| [`n-th`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components) | Public helper/default-content group | Native th with authored scope, IDs, spans and content. | 🟢 Verified ADAPTED target | [Th source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Th.tsx); row/column/group header semantics inspected. |
| [`n-td`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#components) | Public helper/default-content group | Native td with authored headers/spans/rich content. | 🟢 Verified ADAPTED target | [Td source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Td.tsx); native forms and nested table content preserved. |

### Explicit source-only supplements

These five entries were not present in the six-row public property table or named-helper
paragraph. Caption/colgroup/tfoot remain native HTML options, not invented wrapper APIs.
There are no source Table sorting, selection, hover or virtualization props/methods.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Table.tsx) | Source-only Table slot | Actual authored native table children. | 🟢 Verified ADAPTED target | No VNode renderer, data array or template evaluator; caption/rowgroups/cells/controls retained. |
| [`TableSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/public-types.ts) | Source-only exported type | No exported TypeScript alias; size vocabulary is accounted for in its property row. | ⏭️ Intentionally omitted | CSS-only entry, not a framework prop/type API. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Table prop | External CSS, not a framework theme/provider object. | ⏭️ Intentionally omitted | Table spreads useTheme.props; no provider or generated theme CSS. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Table prop | CSS tokens instead of runtime override merging. | ⏭️ Intentionally omitted | No style-object bridge, modal/popover mode detection or theme execution. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Table prop | No built-in override object. | ⏭️ Intentionally omitted | External scoped presentation; zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
