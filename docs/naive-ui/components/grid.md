# Grid

**Plan: Planned. Current baseline: partial CSS-grid wrapper; not parity-verified.**

## Baseline and target

[B1: foundation.ts](../../../src/components/foundation.ts) maps `columns` to grid-template-columns; [B2: styles.ts](../../../src/components/styles.ts) provides layout.

- **HTML:** authored containers/items in semantic reading order.
- **JS:** none for responsive layout; avoid JavaScript breakpoint listeners unless an actual behavioral need appears.
- **CSS:** external grid columns, gap, spans, offsets and media/container queries.
- **Placement:** proposed `src/components/grid/`.

## Acceptance and gaps

Test responsive spans, overflow, nested grids, RTL and zoom. Existing arbitrary columns strings are not the same contract as upstream numeric/responsive column props.

## Migration steps

**Delivery phase:** P2 — layout. **Task state:** 🔵 Planned.
**Prerequisites:** P0 external CSS/tokens and child preservation in the [master plan](../migration-plan.md).
**Next task:** reconcile existing columns strings with a bounded responsive CSS-grid contract.

1. [ ] **Define GridItem anatomy.** Preserve authored children and specify spans/offsets without generating positional wrappers.
2. [ ] **Extract grid styling.** Move columns, x/y gaps and alignment into CSS with logical direction.
3. [ ] **Resolve responsiveness.** Use media/container queries and document overflow/empty-track behavior rather than runtime breakpoint props.
4. [ ] **Verify composition.** Test nested grids, responsive spans, long content, RTL and zoom while retaining DOM reading order.

### Native primitives and fallback

- **Native path:** native authored containers/items with CSS grid tracks, gap, spans and logical placement; browser layout replaces JavaScript sizing.
- **Small enhancement:** optional container queries/subgrid must be feature-detected and reduced to media queries/simple tracks or block flow when unsupported. A compatibility custom element may adopt existing nodes but must not require observers, native slot projection or a responsive-layout/template framework for static grid behavior.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/grid)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **13 local table rows + 0 supplementary declarations + 0 inherited rows = 13 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Grid Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`cols`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `cols` attribute or JS `cols`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate presence attribute `collapsed`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-rows`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `collapsed-rows` attribute or JS `collapsedRows`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`layout-shift-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `layout-shift-disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`responsive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `responsive` attribute or JS `responsive`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-responsive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate presence attribute `item-responsive`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS token/class for `x-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L36) | Prop | External CSS token/class for `y-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### GridItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `offset` attribute or JS `offset`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `span` attribute or JS `span`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate presence attribute `suffix`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Grid Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L50) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### GridItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L56) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
