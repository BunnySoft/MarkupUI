# Checkbox

**Plan: Planned. Current baseline: partial core control; not parity-verified.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) creates a checkbox, reflects initial checked state and emits boolean change.

- **HTML:** real labelled checkboxes with names/values; groups use fieldset/legend.
- **JS:** live checked/indeterminate/default state and group selection bounds.
- **CSS:** external checked, mixed, disabled and focus treatment.
- **Placement:** proposed `src/components/checkbox/`.

## Acceptance and gaps

Test native submission, reset, disabled fieldsets, mixed state, group limits and keyboard use. Existing text spans are not sufficient proof of label association or group parity.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🔵 Planned.
**Prerequisites:** P0 native labels/submission/defaults and P1 focus styling in the [master plan](../migration-plan.md).
**Next task:** define authored checkbox/label anatomy and distinguish checked, indeterminate and submitted value.

1. [ ] **Retain native form behavior.** Adopt a named input with a real label and disabled-fieldset/reset support.
2. [ ] **Specify state reflection.** Separate initial checked/default state, live checked and indeterminate appearance from submitted values.
3. [ ] **Design CheckboxGroup.** Use fieldset/legend, stable option values and explicit min/max group constraints.
4. [ ] **Verify selection boundaries.** Test mixed state, keyboard, group limits, duplicate events and native form data before closing retained rows.

### Native primitives and fallback

- **Native path:** native checkbox inputs, labels and fieldset/legend supply submission, reset, disabled-fieldset and keyboard semantics. A light-DOM wrapper adds only group constraints and documented custom events.
- **Small enhancement:** use native checked/defaultChecked/indeterminate properties and lifecycle-managed change listeners. CSS accent-color, logical spacing and optional `:has()` simplify presentation; explicit state selectors remain the fallback. Retained native controls make ElementInternals or a checkbox polyfill unnecessary.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/checkbox)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **24 local table rows + 5 supplementary declarations + 0 inherited rows = 29 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Checkbox Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate live JS `checked` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 boolean native checked access; partial only, verify this row. |
| [`checked-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate live JS `checkedValue` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate native default/reset state for `default-checked`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L29) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`focusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate presence attribute `focusable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indeterminate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `indeterminate`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `label` attribute or JS `label`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`unchecked-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `unchecked-value` attribute or JS `uncheckedValue`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L36) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | B1 boolean mui:change event; different signature; partial only, verify this row. |

### CheckboxGroup Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `label-field` attribute or JS `labelField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `max` attribute or JS `max`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`min`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate `min` attribute or JS `min`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate JS `value` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate live JS `valueField` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L50) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Checkbox Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L56) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CheckboxGroup Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L62) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Checkbox Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L68) | Method | Candidate plain-JS `focus` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L69) | Method | Candidate plain-JS `blur` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CheckboxGroup Props: options inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`options.label?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L47) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L47) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.disabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L47) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CheckboxGroup Props: on-update:value inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-update:value.actionType`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L50) | Inline record field | Candidate DOM `mui:change:value.action-type` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md#L50) | Inline record field | Candidate DOM `mui:change:value.value` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
