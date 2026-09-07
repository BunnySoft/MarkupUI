# Time Picker

**Plan: Planned. Current baseline: partial native time input in advanced plugin.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) exposes native time value/min/max/step and string events.

- **HTML:** labelled `input[type=time]` with seconds precision when supported.
- **JS:** explicit time-only serialization, bounds and optional panel navigation using native `Intl`.
- **CSS:** external input/panel presentation.
- **Placement:** proposed `src/optional/time-picker/`.

## Acceptance and gaps

Test midnight, second steps, empty values, locale display and crossing-day bounds. Format tokens, disabled hour/minute callbacks and timestamp conversion require explicit decisions, not a date-library dependency.

## Migration steps

**Delivery phase:** P4 — native time input; P6 for custom panels. **Task state:** 🔵 Planned.
**Prerequisites:** P0 time-only serialization, P4 Input and P3 panel focus in the [master plan](../migration-plan.md).
**Next task:** distinguish native time strings from upstream timestamp values and document conversion boundaries.

1. [ ] **Adopt native time entry.** Preserve label, name, seconds precision, min/max/step and form reset.
2. [ ] **Resolve time rules.** Define empty values, midnight, crossing-day bounds and disabled-time callback scope.
3. [ ] **Gate panel features.** Add hour/minute/second choices and locale display only as optional behavior using native Intl.
4. [ ] **Test temporal edges.** Cover seconds steps, invalid entry, timezone conversion decisions and locale changes without reproducing a date-library token engine.

### Native primitives and fallback

- **Native path:** adopt a labelled `input[type=time]` with min/max/step and native form semantics; detect retained seconds/time-entry support and allow simple validated text when unavailable.
- **Small enhancement:** optional choice panels clone native templates, format with Intl and use feature-detected popover positioning. Custom-element lifecycle owns listeners and observers; CSS lays out columns. Missing advanced panel support reduces scope rather than importing a date/time parser or picker polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/time-picker)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **34 local table rows + 0 supplementary declarations + 0 inherited rows = 34 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### TimePicker Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate JS `actions` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate presence attribute `clearable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate native default/reset state for `default-formatted-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L32) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit JS `format` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate explicit JS `formattedValue` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate JS `hours` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`minutes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate JS `minutes` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`seconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate JS `seconds` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input-readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate presence attribute `input-readonly`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`is-hour-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit JS `isHourDisabled` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`is-minute-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit JS `isMinuteDisabled` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`is-second-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate explicit JS `isSecondDisabled` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L42) | Prop | Explicit native `placeholder` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L45) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`time-zone`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate `time-zone` attribute or JS `timeZone`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`use-12-hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate presence attribute `use-12-hours`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L50) | Prop | Current native time string differs from upstream timestamp; define time-only/timezone conversion explicitly. | ⚪ Not reviewed | B1 time string, not upstream timestamp; partial only, verify this row. |
| [`value-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate explicit JS `valueFormat` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L52) | Callback | Candidate DOM `mui:blur` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L53) | Callback | Candidate DOM `mui:clear` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L54) | Callback | Candidate DOM `mui:confirm` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L55) | Callback | Candidate DOM `mui:focus` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L56) | Callback | Candidate DOM `mui:change:formatted-value` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L57) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L58) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### TimePicker Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L64) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### TimePicker Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L70) | Method | Candidate plain-JS `focus` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L71) | Method | Candidate plain-JS `blur` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
