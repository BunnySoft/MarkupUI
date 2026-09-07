# Transfer

**Plan: Planned. Current baseline: partial widgets transfer; not parity-verified.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) manages option/value arrays and moves one pending item between lists.

- **HTML:** two labelled native multi-selects or accessible checkbox lists and move buttons.
- **JS:** stable-key transfer, batch selection, disabled options and focus retention.
- **CSS:** external responsive dual-list layout.
- **Placement:** proposed `src/optional/transfer/`; do not adopt deprecated legacy semantics.

## Acceptance and gaps

Test selected order, duplicate keys, batch moves, filtering and changes during async loading. Existing single-item transfer does not establish selection-limit, virtualization or render-hook coverage.

## Migration steps

**Delivery phase:** P5 — collections. **Task state:** 🔵 Planned.
**Prerequisites:** P4 multiple selection and P5 stable-key/filter rules in the [master plan](../migration-plan.md).
**Next task:** define source/target ordering and selected-value identity independently of visual positions.

1. [ ] **Choose accessible lists.** Use labelled multi-selects or checkbox lists with real move buttons and preserved nodes.
2. [ ] **Implement bounded transfer.** Specify single/bulk moves, disabled items and whether target order follows source or insertion order.
3. [ ] **Scope filtering and scale.** Keep pending selections stable across filters and make virtualization an independent opt-in.
4. [ ] **Verify list transitions.** Test duplicate keys, removed options, async updates, batch limits and focus after moving the active item.

### Native primitives and fallback

- **Native path:** two labelled native multi-selects or checkbox lists and actual move buttons; data-driven items can clone an authored template per stable key.
- **Small enhancement:** a small light-DOM controller moves selection and retains node identity, cleaning listeners on disconnect. CSS grid/container queries become stacked lists when unsupported. Feature-detect optional windowing/observers independently; paginated or complete native lists are preferable to a transfer-widget polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/transfer)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **24 local table rows + 8 supplementary declarations + 0 inherited rows = 32 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Transfer Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`clear-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `clear-text` attribute or JS `clearText`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate explicit JS `filter` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | B1 label/value option array; partial only, verify this row. |
| [`render-source-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate authored `render-source-label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-target-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate authored `render-target-label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-source-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate authored `render-source-list` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-target-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate authored `render-target-list` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`select-all-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `select-all-text` attribute or JS `selectAllText`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-selected`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate live JS `showSelected` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`source-filterable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate explicit JS `sourceFilterable` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`source-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate explicit JS `sourceFilterPlaceholder` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`source-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate authored `source-title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`target-filterable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate explicit JS `targetFilterable` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`target-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit JS `targetFilterPlaceholder` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`target-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate authored `target-title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate JS `value` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | B1 selected string array; partial only, verify this row. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L42) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`virtual-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate explicit JS `virtualScroll` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### TransferOption Type

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L49) | Record field | Candidate plain-JS `label` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L50) | Record field | Candidate plain-JS `value` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L51) | Record field | Candidate plain-JS `disabled` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Transfer Props: render-source-label inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-source-label.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L28) | Inline record field | Candidate authored `render-source-label.option` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Transfer Props: render-target-label inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-target-label.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L29) | Inline record field | Candidate authored `render-target-label.option` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Transfer Props: render-source-list inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-source-list.onCheck`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L30) | Inline record field | Candidate authored `render-source-list.onCheck` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-source-list.checkedOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L30) | Inline record field | Candidate authored `render-source-list.checkedOptions` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-source-list.pattern`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L30) | Inline record field | Candidate authored `render-source-list.pattern` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Transfer Props: render-target-list inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-target-list.onCheck`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L31) | Inline record field | Candidate authored `render-target-list.onCheck` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-target-list.checkedOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L31) | Inline record field | Candidate authored `render-target-list.checkedOptions` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-target-list.pattern`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md#L31) | Inline record field | Candidate authored `render-target-list.pattern` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
