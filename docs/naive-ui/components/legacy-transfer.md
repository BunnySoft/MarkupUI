# Legacy Transfer

**Plan: Intentionally omitted as a deprecated API. Current baseline: modern widgets transfer only.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) supplies a small transfer control, not the retired upstream API.

- **HTML:** migrate to labelled native dual lists described in [Transfer](transfer.md).
- **JS:** no second compatibility selection engine.
- **CSS:** reuse modern transfer layout.
- **Placement:** no legacy bundle; every documented property retains an omission row.

## Acceptance and gaps

Document selected-value, filter and option conversion when implementing migration examples. Omission is not counted as implementation; upstream explicitly recommends the newer Transfer route.

## Migration steps

**Delivery lane:** deferred/exclusions — deprecated Transfer API. **Task state:** 🔵 Planned for migration guidance; API disposition ⏭️ Intentionally omitted.
**Prerequisites:** P5 modern Transfer contract and P0 compatibility policy in the [master plan](../migration-plan.md).
**Next task:** document legacy option/value conversion into the modern transfer scope without a second engine.

1. [ ] **Retain the deprecated inventory.** Give every old prop and option field an explicit replacement or omission reason.
2. [ ] **Map selection semantics.** Explain source/target order, selected values and filter differences in a modern dual-list example.
3. [ ] **Exclude redundant runtime code.** Keep legacy aliases/providers out of new optional bundles unless a separately approved compatibility need exists.
4. [ ] **Verify conversion examples.** Test preserved values, disabled options and filter behavior; do not mark the omitted API implemented.

### Native primitives and fallback

- **Native path:** modern native multi-selects/checkbox lists and move buttons provide the replacement, optionally cloning native option/item templates.
- **Small enhancement:** only the modern light-DOM Transfer controller owns value movement and lifecycle cleanup. CSS grid/flex degrades to stacked lists; unsupported advanced capabilities reduce to native/static selection. No legacy custom element, reactive template adapter or transfer polyfill is added to preserve the omitted API.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/legacy-transfer)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **16 local table rows + 0 supplementary declarations + 0 inherited rows = 16 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Transfer](transfer.md). Opaque types without local member definitions remain unreviewed.


### Transfer Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L28) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L29) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`filterable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L30) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L31) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L32) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L33) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`source-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L34) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`source-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L35) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`target-filter-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L36) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`target-title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L37) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L38) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L39) | Callback | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`virtual-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L40) | Prop | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### TransferOption Type

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L46) | Record field | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L47) | Record field | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/legacy-transfer/demos/enUS/index.demo-entry.md#L48) | Record field | Use the modern linked alternative; no legacy compatibility contract. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

<!-- END PINNED API INVENTORY -->
