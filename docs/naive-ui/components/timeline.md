# Timeline

**Plan: Planned. Current baseline: widgets registration/styles only.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) registers timeline/item and supplies connector styling, not chronology logic.

- **HTML:** ordered list with headings and native time elements.
- **JS:** none for static events.
- **CSS:** external connector, icon, status, horizontal/vertical and reverse layout.
- **Placement:** proposed `src/components/timeline/timeline.css`; retain optional plugin compatibility.

## Acceptance and gaps

Check DOM chronology versus visual reversal, date semantics, long events and narrow layouts. Colored dots must not be the sole status communication.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🔵 Planned.
**Prerequisites:** P2 List/Typography and P0 decorative status policy in the [master plan](../migration-plan.md).
**Next task:** define a chronological native ordered list with headings and time elements.

1. [ ] **Resolve item regions.** Map title, time, content and icon/status to authored nodes without generating chronology from visual positions.
2. [ ] **Specify direction/reversal.** Keep DOM order meaningful when the visual timeline is horizontal or reversed.
3. [ ] **Extract connectors.** Implement lines, dots and type colors in CSS with non-color status text.
4. [ ] **Test event layouts.** Cover long events, missing dates, narrow screens, RTL and screen-reader chronological order.

### Native primitives and fallback

- **Native path:** an ordered list of authored headings/time elements and descriptions; native templates can repeat event anatomy when data-driven output is needed.
- **Small enhancement:** external CSS grid/flex, logical borders and responsive rules create connectors/orientation; plain chronological list flow is the fallback. No custom-element controller is needed for static events. Optional `:has()` region styling must fall back to explicit classes without changing DOM chronology.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/timeline)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **15 local table rows + 0 supplementary declarations + 0 inherited rows = 15 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Timeline Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`horizontal`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate presence attribute `horizontal`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `icon-size` attribute or JS `iconSize`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate explicit JS `itemPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### TimelineItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `content` attribute or JS `content`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`line-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `line-type` attribute or JS `lineType`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `time` attribute or JS `time`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Timeline Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L41) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### TimelineItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L47) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L48) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L49) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L50) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
