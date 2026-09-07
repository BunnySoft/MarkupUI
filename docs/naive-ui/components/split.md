# Split

**Plan: Planned. Current baseline: layout primitives only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) has no resizable-panel controller.

- **HTML:** labelled panels and an accessible keyboard-operable separator.
- **JS:** pointer capture, keyboard resizing, bounds and cancel/reconnect cleanup.
- **CSS:** external grid/flex tracks and handle states; measured dimension writes isolated.
- **Placement:** proposed `src/optional/split/`.

## Acceptance and gaps

Test min/max, percentage/pixel conversion, nested splitters, RTL, pointer cancellation and non-pointer use. Preserve panel content/focus rather than rebuilding on drag.

## Migration steps

**Delivery phase:** P5 — optional panel coordination. **Task state:** 🔵 Planned.
**Prerequisites:** P2 Layout and P3 keyboard/pointer ownership in the [master plan](../migration-plan.md).
**Next task:** define labelled panels and an accessible separator with explicit size units and bounds.

1. [ ] **Specify panel anatomy.** Preserve both panel subtrees and identify which size the separator controls.
2. [ ] **Implement input parity.** Support keyboard adjustments and pointer capture with equivalent min/max enforcement.
3. [ ] **Isolate measured layout.** Keep grid/flex styling external and numeric drag dimensions in a narrow measurement adapter.
4. [ ] **Verify cancellation.** Test nested splitters, RTL, percentage/pixel resizing, lost pointer capture and disconnect during drag.

### Native primitives and fallback

- **Native path:** authored panels in CSS grid/flex plus a labelled keyboard-operable separator. A small light-DOM custom element updates only the approved size variable.
- **Small enhancement:** feature-detect Pointer Events/setPointerCapture and optional ResizeObserver; keyboard resizing or a fixed stacked layout remains available without them. Lifecycle cleanup handles capture/listeners/observers, and container queries/logical properties drive presentation. No drag polyfill, layout engine or generic panel renderer.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/split)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **19 local table rows + 0 supplementary declarations + 0 inherited rows = 19 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Split Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate native default/reset state for `default-size`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`direction`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `direction` attribute or JS `direction`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `max` attribute or JS `max`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`min`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `min` attribute or JS `min`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pane1-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `pane1-class` attribute or JS `pane1Class`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pane1-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS class/custom property for `pane1-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`pane2-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `pane2-class` attribute or JS `pane2Class`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`pane2-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS class/custom property for `pane2-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`resize-trigger-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit JS `resizeTriggerSize` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`watch-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate explicit native-child configuration for `watch-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-drag-start`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L36) | Callback | Candidate DOM `mui:drag-start` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-drag-move`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L37) | Callback | Candidate DOM `mui:drag-move` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-drag-end`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L38) | Callback | Candidate DOM `mui:drag-end` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L39) | Callback | Candidate DOM `mui:change:size` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Split Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`1`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L45) | Slot | Candidate authored `1` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`2`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L46) | Slot | Candidate authored `2` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`resize-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/split/demos/enUS/index.demo-entry.md#L47) | Slot | Candidate authored `resize-trigger` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
