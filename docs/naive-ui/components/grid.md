# Grid

**Migration status: 🟢 Verified retained CSS-only native Grid/GridItem scope.**
Automatic row packing, relative offsets, overflow-aware suffixes and framework responsive/SSR
contracts are explicit omissions, not hidden layout-engine dependencies.

## Baseline and target

[A1: retained contract and acceptance](../../components/grid.md) and
[S1: native Grid CSS](../../../src/components/grid/grid.css) implement the new slice.
[B1: foundation.ts](../../../src/components/foundation.ts) still maps legacy `columns` to
grid-template-columns; [B2: styles.ts](../../../src/components/styles.ts) provides unchanged legacy layout.

- **HTML:** authored containers/items in semantic reading order.
- **JS:** none for responsive layout; avoid JavaScript breakpoint listeners unless an actual behavioral need appears.
- **CSS:** external tracks/gaps/spans/absolute start and authored media/container queries; no relative-offset algorithm.
- **Placement:** `src/components/grid/grid.css`; stylesheet-only export `@dataengine/markup-ui/grid/style.css`.

## Acceptance and gaps

A1 records **385 passing tests** (12 focused), build/export gates and Chromium columns/
spans/gaps/absolute placement, self-wrapper versus screen queries, nested/hidden/native
disclosure/lists/forms/focus, RTL/zoom/print and legacy coexistence. CSS is **527 gzip bytes /
1,500 ceiling**; core stays 14,611/15,000. Source offset is not absolute grid-column-start;
native preview/details and trailing-action alternatives do not implement row/suffix packing.

## Migration steps

**Delivery phase:** P2 — layout. **Task state:** 🟢 Verified retained native scope.
**Prerequisites:** P0 external CSS/tokens and child preservation in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Layout; P2 and explicit algorithm omissions are not complete parity.

1. [x] **Define GridItem anatomy.** Original direct children and native span/start/hidden ownership; relative offsets and private renderer props explicitly omitted.
2. [x] **Extract grid styling.** Fixed/native tracks, zero-default x/y gaps, alignment and independent low-specificity nested/item defaults; no dense/reverse flow.
3. [x] **Resolve responsiveness.** Correct authored query wrapper targets descendants, separate screen/item CSS rules and static fallback; no responsive-string parser or observer.
4. [x] **Verify composition.** A1 verifies native geometry/nesting/hidden/disclosure/focus/forms/RTL/zoom/print/coexistence; row budgets, suffix reservation and overflow callback omissions remain explicit.

### Native primitives and fallback

- **Native path:** native authored containers/items with CSS grid tracks, gap, spans and logical placement; browser layout replaces JavaScript sizing.
- **Small enhancement:** native query wrapper and real details/summary suffice for retained
  responsive/disclosure composition. Unsupported queries keep authored base tracks; no subgrid,
  custom element, measurement observer, responsive parser or generic placement framework is supplied.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/grid)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **13 original public rows + 2 explicit public expansions + 6 source supplements
= 21 rows**: **10 Verified ADAPTED native targets and 11 Intentionally omitted contracts**.
Public expansions identify the referenced ResponsiveDescription type and the overflow slot
field; the pinned page does not define a ResponsiveDescription schema. Source supplements
record itemStyle, four private GridItem props and grouped NGi/giProps aliases. No nonexistent
theme props are added. A1/S1 establish native scope, not renderer/packing or Vue API parity.


### Grid Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`cols`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED native column count/tracks and authored query rules. | 🟢 Verified | Default 24 equal tracks; no responsive notation/number parser. |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED author-selected preview plus native details/extra grid. | 🟢 Verified | Two explicit grids/native open state, not automatic same-grid row packing; closed controls skip focus. |
| [`collapsed-rows`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L31) | Prop | Application-selected preview scope instead. | ⏭️ Intentionally omitted | No occupied-row budget across spans/offsets/suffix capacity. |
| [`layout-shift-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L32) | Prop | Fixed native CSS when desired. | ⏭️ Intentionally omitted | No framework SSR/observer mode flag or promise of zero native layout shift. |
| [`responsive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED separate self-query wrapper or screen media queries. | 🟢 Verified | Query targets descendant grid, never its own container; no mode/string/Boolean parser or provider breakpoints. |
| [`item-responsive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L34) | Prop | ADAPTED item span/visibility CSS within matching queries. | 🟢 Verified | Explicit compact spans/real display:none, no per-item string grammar. |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L35) | Prop | ADAPTED --mui-grid-x-gap / native column-gap. | 🟢 Verified | Default zero; native CSS values/queries, no conversion runtime. |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L36) | Prop | ADAPTED --mui-grid-y-gap / native row-gap. | 🟢 Verified | Default zero; independent nested roots and native invalid-value behavior. |

### GridItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L42) | Prop | Native absolute placement/authored spacer alternative. | ⏭️ Intentionally omitted | Relative offset-plus-span packing/margins are not absolute grid-column-start; spacer can wrap separately. |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L43) | Prop | ADAPTED positive native span; translate source zero to hidden. | 🟢 Verified | No implicit span clamp or zero-token hiding; queries explicitly keep spans within active columns. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L44) | Prop | Authored DOM-last trailing action alternative. | ⏭️ Intentionally omitted | No reserved last-visible-row capacity or overflow-aware suffix placement. |

### Grid Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L50) | Slot | ADAPTED original direct native children. | 🟢 Verified | No constructor filtering, wrappers, directive stripping or VNode cloning. |

### GridItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L56) | Slot | ADAPTED original native item content. | 🟢 Verified | Nodes/controls/semantics remain native; overflow argument is explicitly omitted below. |

### Explicit public type and slot-field expansions

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`ResponsiveDescription`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L29) | Public referenced type | Native CSS/media/container declarations instead. | ⏭️ Intentionally omitted | Referenced for cols/gaps/item placement; pinned page defines no inline schema. No DSL/parser/provider is fabricated. |
| [`GridItem.default.overflow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L56) | Public inline slot parameter | No automatic overflow signal. | ⏭️ Intentionally omitted | Native disclosure open state is not a row-packing overflow calculation. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`Grid.itemStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/Grid.tsx) | Source prop | ADAPTED external native item CSS/classes. | 🟢 Verified | No string/object injection provider or runtime style merge. |
| [`GridItem.privateOffset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/GridItem.tsx) | Private source prop | Explicit native placement/spacer alternatives. | ⏭️ Intentionally omitted | No private relative-offset margin pipeline. |
| [`GridItem.privateSpan`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/GridItem.tsx) | Private source prop | Native authored span declaration. | ⏭️ Intentionally omitted | No parent-computed private span/clamp prop. |
| [`GridItem.privateColStart`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/GridItem.tsx) | Private source prop | Explicit native absolute line, not suffix injection. | ⏭️ Intentionally omitted | No private placement override or reserved suffix engine. |
| [`GridItem.privateShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/GridItem.tsx) | Private source prop | Native hidden/display/disclosure ownership. | ⏭️ Intentionally omitted | No VNode-private visibility store or directive rewriting. |
| [`NGi / giProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/index.ts) | Source companion constructor/props aliases | Same native item anatomy. | ⏭️ Intentionally omitted | No component/props alias exports or synthetic custom element. |

<!-- END PINNED API INVENTORY -->
