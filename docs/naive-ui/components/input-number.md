# Input Number

**Plan: Planned. Current baseline: partial native number stepper in widgets.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) creates number input and step buttons; exposes numeric value and min/max/step attributes.

- **HTML:** labelled native number input and named decrement/increment buttons.
- **JS:** empty/NaN semantics, bounds, precision policy and optional locale display without a parser dependency.
- **CSS:** external button/input grouping.
- **Placement:** proposed `src/optional/input-number/`.

## Acceptance and gaps

Test decimal steps, negative bounds, empty input, keyboard stepping, reset and invalid text. Custom parsing/formatting needs a documented return contract; current native stepping is not arbitrary precision arithmetic.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Input and P0 numeric/default-event contracts in the [master plan](../migration-plan.md).
**Next task:** choose explicit empty/NaN semantics before extending the current native number stepper.

1. [ ] **Adopt numeric anatomy.** Keep a labelled number input and accessible decrement/increment buttons with native name and constraints.
2. [ ] **Resolve stepping.** Define min/max, decimal step, keyboard/wheel policy and behavior at bounds.
3. [ ] **Scope formatting hooks.** Separate displayed text from numeric value; document parse/format returns without a numeric parser dependency.
4. [ ] **Test numeric edges.** Cover negative bounds, fractional steps, invalid text, empty input, reset and duplicate change notifications.

### Native primitives and fallback

- **Native path:** `input[type=number]`, native stepUp/stepDown and actual buttons handle bounded numeric entry inside a light-DOM wrapper.
- **Small enhancement:** use lifecycle listeners for explicit value events and native Intl.NumberFormat only for approved presentation, not an assumed inverse parser. Feature-detect any required number-input behavior and fall back to validated text/server entry. CSS grid/flex controls grouping; no numeric-control or arbitrary-precision dependency is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/input-number)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **34 local table rows + 2 supplementary declarations + 0 inherited rows = 36 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### InputNumber Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`autofocus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L33) | Prop | Explicit native `autofocus` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`button-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate explicit JS `buttonPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate presence attribute `clearable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L38) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit JS `format` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit native-child configuration for `input-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keyboard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate JS `keyboard` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L43) | Prop | Explicit native `max` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 native max; partial only, verify this row. |
| [`min`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L44) | Prop | Explicit native `min` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 native min; partial only, verify this row. |
| [`parse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate explicit JS `parse` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L46) | Prop | Explicit native `placeholder` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`precision`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate explicit JS `precision` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L48) | Prop | External CSS token/class for `round`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L49) | Prop | Explicit native `readonly` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`show-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate live JS `showButton` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L51) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`step`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L53) | Prop | Explicit native `step` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | B1 native step; partial only, verify this row. |
| [`update-value-on-input`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate presence attribute `update-value-on-input`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`validator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate explicit JS `validator` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 numeric native value; partial only, verify this row. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L57) | Callback | Candidate DOM `mui:blur` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L58) | Callback | Candidate DOM `mui:clear` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L59) | Callback | Candidate DOM `mui:focus` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L60) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputNumber Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`add-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L66) | Slot | Candidate authored `add-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`minus-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L67) | Slot | Candidate authored `minus-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L68) | Slot | Candidate authored `prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L69) | Slot | Candidate authored `suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputNumber Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L75) | Method | Candidate plain-JS `blur` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L76) | Method | Candidate plain-JS `focus` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputNumber Props: keyboard inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`keyboard.ArrowUp?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L41) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keyboard.ArrowDown?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md#L41) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
