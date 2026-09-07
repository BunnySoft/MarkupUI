# Slider

**Plan: Planned. Current baseline: partial native range input; not parity-verified.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) creates range input with min/max/step/value and numeric input/change events.

- **HTML:** labelled native range, visible value/output and optional ticks.
- **JS:** optional two-handle coordination with explicit crossing/bounds semantics.
- **CSS:** native track/thumb treatment, logical direction and vertical layout.
- **Placement:** proposed `src/components/slider/`; multi-handle enhancement optional.

## Acceptance and gaps

Test bounds, fractional steps, keyboard, RTL, reset and accessible value text. Marks, tooltip formatting, range arrays and custom handles are not provided by the existing single control.

## Upstream implementation evidence

Targeted [keyboard stepping](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/src/Slider.tsx#L414-L448) and [handle semantics](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/src/Slider.tsx#L740-L770) show custom slider-role handles with value bounds/orientation and reverse-aware movement. Prefer a native range for MarkupUI's basic case. Any independently implemented multi-handle extension must explicitly test direction, orientation, focus and value announcements rather than assuming upstream ARIA attributes alone confer parity.

## Migration steps

**Delivery phase:** P4 — bounded entry. **Task state:** 🔵 Planned.
**Prerequisites:** P0 numeric/form contracts and P4 native range conventions in the [master plan](../migration-plan.md).
**Next task:** define labelled native range/output anatomy and preserve the current scalar value contract.

1. [ ] **Adopt range input.** Keep name, min/max/step, label association and reset behavior on the native control.
2. [ ] **Map presentation.** Move track/thumb, ticks, orientation and focus styles into CSS with logical direction.
3. [ ] **Separate multiple handles.** Decide crossing, range values and tooltip formatting in an optional extension with its own accessibility contract.
4. [ ] **Verify movement.** Test fractional steps, bounds, arrows, RTL/reverse orientation, accessible value text and unchanged programmatic event semantics.

### Native primitives and fallback

- **Native path:** a labelled native range input with output and optional datalist ticks supplies bounds, keyboard and form behavior. A custom wrapper only synchronizes approved events/presentation.
- **Small enhancement:** CSS accent-color, logical dimensions and reduced motion simplify styling. Feature-detect orientation/tick affordances and keep a horizontal range or numeric input fallback. Multi-handle behavior is separately scoped; it must not force a slider/gesture polyfill into the single-input baseline.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/slider)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **19 local table rows + 0 supplementary declarations + 0 inherited rows = 19 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Slider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L30) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`format-tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate explicit JS `formatTooltip` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keyboard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `keyboard`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`marks`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate authored `marks` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L34) | Prop | Explicit native `max` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 initial max; partial only, verify this row. |
| [`min`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L35) | Prop | Explicit native `min` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 initial min; partial only, verify this row. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`range`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate presence attribute `range`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`reverse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate presence attribute `reverse`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate live JS `showTooltip` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`step`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L40) | Prop | Explicit native `step` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 initial step; partial only, verify this row. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate presence attribute `tooltip`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L42) | Prop | External CSS token/class for `vertical`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 single numeric range; partial only, verify this row. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L44) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-dragstart`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L45) | Callback | Candidate DOM `mui:dragstart` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-dragend`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L46) | Callback | Candidate DOM `mui:dragend` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Slider Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`thumb`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md#L52) | Slot | Candidate authored `thumb` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
