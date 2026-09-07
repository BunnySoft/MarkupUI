# Statistic

**Plan: Planned. Current baseline: partial core statistic; not parity-verified.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) generates label/value spans from label/value/prefix/suffix attributes.

- **HTML:** labelled value with authored prefix/suffix regions; prefer an output or description pair.
- **JS:** optional live value update; number formatting uses native `Intl`.
- **CSS:** external label/value hierarchy.
- **Placement:** proposed `src/components/statistic/`.

## Acceptance and gaps

Test live updates, units, localized numbers, empty values and preserved rich children. Initial generated text is not all slot or formatting behavior.

## Migration steps

**Delivery phase:** P2 — numeric display. **Task state:** 🔵 Planned.
**Prerequisites:** P0 child ownership and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** define label/value/prefix/suffix anatomy that preserves authored rich content.

1. [ ] **Choose semantic output.** Use a labelled output or description pair and specify empty/invalid value display.
2. [ ] **Resolve formatting.** Separate numeric value, localized presentation and units with native Intl where needed.
3. [ ] **Extract visual hierarchy.** Move label/value sizing and region spacing into CSS; leave animation outside this component.
4. [ ] **Verify updates.** Test live values, localized units, rich prefixes/suffixes and meaningful announcements without subtree replacement.

### Native primitives and fallback

- **Native path:** labelled native output or a dl pair, with authored prefix/suffix text. Static statistics need only HTML and external CSS.
- **Small enhancement:** a custom element is optional for live updates and supported Intl formatting; it changes text/property values without replacing authored regions. Unsupported formatting falls back to an explicitly supplied readable string. CSS grid/logical spacing handles layout, and numeric animation remains a separate module.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/statistic)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Statistic Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L17) | Prop | Candidate `label` attribute or JS `label`; exact target contract not reviewed. | ⚪ Not reviewed | B1 initial label text; partial only, verify this row. |
| [`tabular-nums`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L18) | Prop | Candidate presence attribute `tabular-nums`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 initial value text; partial only, verify this row. |

### Statistic Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L25) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L26) | Slot | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L27) | Slot | Candidate authored `prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md#L28) | Slot | Candidate authored `suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
