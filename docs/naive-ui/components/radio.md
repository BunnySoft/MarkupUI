# Radio

**Plan: Planned. Current baseline: partial core radio/group controls; not parity-verified.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) creates radios and synchronizes a group value; it does not establish full native name/group semantics.

- **HTML:** labelled same-name native radios inside fieldset/legend.
- **JS:** live value/default state and event deduplication.
- **CSS:** ordinary and button-like radio appearances outside JavaScript.
- **Placement:** proposed `src/components/radio/`.

## Acceptance and gaps

Test arrow keys, tab stops, form submission/reset, disabled items and dynamic options. RadioButton is a companion presentation, not a separate route or separate selection engine.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🔵 Planned.
**Prerequisites:** P0 form/default contracts and P4 labelled-control anatomy in the [master plan](../migration-plan.md).
**Next task:** establish same-name native radios and fieldset/legend grouping before custom selection logic.

1. [ ] **Adopt exclusive controls.** Preserve radio names, values, labels and native keyboard movement.
2. [ ] **Reconcile group state.** Specify current/default selection, external value updates and one user-change notification.
3. [ ] **Style RadioButton separately.** Provide button-like appearance without changing radio semantics or creating another selection engine.
4. [ ] **Verify native behavior.** Test disabled items, arrow keys, tab entry, dynamically reordered options, form submission and reset.

### Native primitives and fallback

- **Native path:** same-name native radios, labels and fieldset/legend supply exclusive selection, arrow behavior and submitted values. Repeated options may clone a native template only when application data requires it.
- **Small enhancement:** light-DOM lifecycle listeners coordinate documented group events, not a second radio-selection engine. CSS accent-color or button-like styles use checked/focus states; optional `:has()` has explicit state fallback. Native radios remain usable without custom elements or ElementInternals.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/radio)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **17 local table rows + 3 supplementary declarations + 0 inherited rows = 20 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Radio Props, RadioButton Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate live JS `checked` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 radio checked access only; partial only, verify this row. |
| [`default-checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate native default/reset state for `default-checked`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L25) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `label` attribute or JS `label`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L27) | Prop | Explicit native `name` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L28) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 radio string value only; partial only, verify this row. |
| [`on-update:checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L30) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### RadioGroup Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `label-field` attribute or JS `labelField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate `name` attribute or JS `name`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L41) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 group value synchronization; partial only, verify this row. |
| [`value-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate live JS `valueField` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L44) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### RadioGroup Props: options inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`options.label?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L40) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L40) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options.disabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md#L40) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
