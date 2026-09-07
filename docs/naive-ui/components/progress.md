# Progress

**Plan: Planned. Current baseline: partial generated linear progress; not parity-verified.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) clamps value/max, updates ARIA and writes a bar width.

- **HTML:** labelled native progress for completion; explicit text alternative for circular/multiple measures.
- **JS:** synchronize value/max/indeterminate state only; geometry adapter isolated if needed.
- **CSS:** external track, state, thickness and circular presentation.
- **Placement:** proposed `src/components/progress/`.

## Acceptance and gaps

Test zero max, invalid/out-of-range values, indeterminate state and reduced motion. Upstream percentage is not the same public name as current value; circle/multiple-circle APIs remain additional scope.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P0 numeric/ARIA contracts and external CSS in the [master plan](../migration-plan.md).
**Next task:** reconcile current value/max with upstream percentage and native progress semantics.

1. [ ] **Define completion state.** Specify bounds, invalid values and indeterminate mode on a labelled native progress element.
2. [ ] **Extract linear presentation.** Move track, thickness, status and motion styles out of the width-writing controller.
3. [ ] **Scope circular variants.** Decide circle/multiple-measure geometry separately, with readable value alternatives and isolated measurement.
4. [ ] **Verify unusual values.** Test zero max, negative/over-range values, loading transitions and reduced motion before accepting non-linear modes.

### Native primitives and fallback

- **Native path:** labelled native progress provides determinate/indeterminate semantics and readable fallback text; simple display needs no custom progress renderer.
- **Small enhancement:** an optional light-DOM wrapper normalizes approved values only. CSS owns track/status presentation and reduced motion; circular SVG is a separately approved authored visual with equivalent text. Feature-detect retained styling capabilities and fall back to native progress appearance, not a canvas/animation polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/progress)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **20 local table rows + 1 supplementary declarations + 0 inherited rows = 21 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Progress Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L27) | Prop | External CSS token/class for `border-radius`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`circle-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `circle-gap` attribute or JS `circleGap`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`fill-border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `fill-border-radius` attribute or JS `fillBorderRadius`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`gap-degree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `gap-degree` attribute or JS `gapDegree`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`gap-offset-degree`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `gap-offset-degree` attribute or JS `gapOffsetDegree`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`indicator-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate explicit JS `indicatorPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indicator-text-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `indicator-text-color` attribute or JS `indicatorTextColor`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`offset-degress`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `offset-degress` attribute or JS `offsetDegress`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`percentage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L37) | Prop | Adapt current value/max to native progress; explicitly convert percentages and bound invalid input. | 🔵 Planned | B1 value/max linear ratio; name differs; partial only, verify this row. |
| [`processing`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate presence attribute `processing`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rail-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate JS `railColor` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rail-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L40) | Prop | External CSS class/custom property for `rail-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`show-indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate live JS `showIndicator` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`stroke-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `stroke-width` attribute or JS `strokeWidth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`unit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `unit` attribute or JS `unit`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Progress Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L51) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Progress Props: color inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color.stops`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md#L29) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
