# Switch

**Plan: Planned. Current baseline: checkbox subclass with switch role; not parity-verified.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) extends checkbox behavior and adds a host switch role.

- **HTML:** labelled native checkbox styled as a switch, avoiding duplicate interactive roles.
- **JS:** checked/default state, loading/disabled policy and explicit custom-value mapping only if needed.
- **CSS:** external track/thumb and reduced-motion rules.
- **Placement:** proposed `src/components/switch/`.

## Acceptance and gaps

Test accessible checked state, native submission/reset, keyboard, loading suppression and custom checked values. Existing boolean checkbox events are not arbitrary-value parity.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Checkbox and P0 native value/event rules in the [master plan](../migration-plan.md).
**Next task:** place switch semantics on one actual control instead of combining a switch host with a separately exposed checkbox.

1. [ ] **Define boolean anatomy.** Keep a labelled native checkbox, form name and submitted value while presenting a switch.
2. [ ] **Resolve custom values.** Decide checked/unchecked aliases, defaults and reset without losing native boolean state.
3. [ ] **Implement busy/disabled policy.** Specify activation suppression and externally styled track/thumb/loading states.
4. [ ] **Check assistive behavior.** Test checked announcements, Space activation, fieldset disabling, reset and rapid loading transitions.

### Native primitives and fallback

- **Native path:** a labelled native checkbox owns checked state, keyboard activation, name/value and reset; avoid duplicate interactive semantics on the wrapper.
- **Small enhancement:** a light-DOM custom element handles only custom-value/loading rules, with lifecycle cleanup. CSS checked/focus selectors, logical properties and reduced-motion media queries style the track/thumb; optional `:has()` falls back to explicit state. An ordinary checkbox is the usable unsupported-enhancement path.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/switch)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **17 local table rows + 6 supplementary declarations + 0 inherited rows = 23 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Switch Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`checked-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate live JS `checkedValue` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L27) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rail-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS class/custom property for `rail-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `round`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`rubber-band`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `rubber-band`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`spin-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit native-child configuration for `spin-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`unchecked-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `unchecked-value` attribute or JS `uncheckedValue`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 checked boolean only; value alias absent; partial only, verify this row. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L36) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Switch Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L42) | Slot | Candidate authored `checked` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`checked-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L43) | Slot | Candidate authored `checked-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L44) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`unchecked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L45) | Slot | Candidate authored `unchecked` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`unchecked-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L46) | Slot | Candidate authored `unchecked-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Switch Props: rail-style inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`rail-style.focused`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L29) | Inline record field | External CSS class/custom property for `rail-style.focused`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`rail-style.checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L29) | Inline record field | External CSS class/custom property for `rail-style.checked`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Switch Props: spin-props inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spin-props.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L33) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L33) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L33) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md#L33) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
