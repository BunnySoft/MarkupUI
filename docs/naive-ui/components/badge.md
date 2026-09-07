# Badge

**Plan: Planned. Current baseline: core badge styling only.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) styles `mui-badge`.

- **HTML:** visible count/status associated with its labelled target; decorative duplicates hidden.
- **JS:** optional count cap and explicit status updates.
- **CSS:** external dot/count positioning and size/color treatment.
- **Placement:** proposed `src/components/badge/`.

## Acceptance and gaps

Test zero/negative/large values, standalone badges, zoom and accessible unread labels. Position offsets are CSS choices, not implicit inline style objects.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P0 accessible status text and P2 CSS placement in the [master plan](../migration-plan.md).
**Next task:** specify whether a badge conveys a numeric count, a status dot or decorative duplication.

1. [ ] **Define readable meaning.** Associate the badge with its target and provide text for unread/status information.
2. [ ] **Resolve count display.** Decide zero, negative values, caps and standalone behavior without treating formatted text as the numeric source.
3. [ ] **Extract positioning.** Use external logical offsets, sizes and dot/count variants.
4. [ ] **Verify updates and zoom.** Test large counts, changed targets, hidden decorative duplicates and readable labels at enlarged text sizes.

### Native primitives and fallback

- **Native path:** ordinary text/span markup associated with its target and an accessible count/status description. No custom element is needed for a static badge.
- **Small enhancement:** optional count updates change text and explicit state only; CSS logical positioning and inline-flex supply dot/count layout. Unsupported advanced selectors fall back to classes, and unstyled text remains readable. Avoid a template/reactive wrapper solely to format a small count.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/badge)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 local table rows + 0 supplementary declarations + 0 inherited rows = 10 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Badge Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`dot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `dot`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `max` attribute or JS `max`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `offset` attribute or JS `offset`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`processing`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate presence attribute `processing`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-zero`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate live JS `showZero` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Badge Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md#L40) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
