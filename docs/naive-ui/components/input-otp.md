# Input OTP

**Plan: Planned. Current baseline: input primitive only.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) has no OTP controller.

- **HTML:** prefer one labelled input with `autocomplete="one-time-code"`; segmented presentation must retain one accessible value.
- **JS:** optional segment navigation, paste distribution and complete/change events.
- **CSS:** visual cell spacing without hiding native focus.
- **Placement:** proposed `src/optional/input-otp/`.

## Acceptance and gaps

Test autofill, full/partial paste, backspace, IME, mobile keyboards and screen-reader reading order. Never log OTP values or imply client-side security validation.

## Migration steps

**Delivery phase:** P4 — enhanced entry. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Input/IME handling and P0 form/label contracts in the [master plan](../migration-plan.md).
**Next task:** choose one accessible input with one-time-code autofill as the baseline before segmenting its appearance.

1. [ ] **Define the value contract.** Specify length, allowed characters, empty/default state and when completion is announced.
2. [ ] **Preserve native autofill.** Keep autocomplete, mobile input hints, submission and readable labelling on the actual input.
3. [ ] **Add optional segmentation.** Define paste distribution, selection and backspace without creating confusing duplicate accessible controls.
4. [ ] **Test sensitive entry.** Cover full/partial paste, IME, autofill and reset; never log codes or imply client-side validation provides security.

### Native primitives and fallback

- **Native path:** one labelled input with autocomplete one-time-code, inputmode and native selection is the default; CSS may present cells without multiplying accessible values.
- **Small enhancement:** optional segment templates/controllers must preserve paste, autofill and composition, with listeners released on disconnect. Browser/OS autofill is an enhancement, not a guarantee; ordinary text entry is always the fallback. Do not require WebOTP, a custom keyboard, Shadow DOM or an OTP package.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/input-otp)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **18 local table rows + 5 supplementary declarations + 0 inherited rows = 23 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Input](input.md). Opaque types without local member definitions remain unreviewed.


### InputOTP Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`allow-input`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate explicit JS `allowInput` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`block`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L27) | Prop | External CSS token/class for `block`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L29) | Prop | Explicit native `disabled` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`length`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `length` attribute or JS `length`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`mask`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `mask`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L33) | Prop | Explicit native `placeholder` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L34) | Prop | Explicit native `readonly` attribute/property on the authored control; validate reflection and defaults. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L38) | Callback | Candidate DOM `mui:blur` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L39) | Callback | Candidate DOM `mui:finish` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L40) | Callback | Candidate DOM `mui:focus` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputOTP Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputOTP Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`focusOnChar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L53) | Method | Candidate plain-JS `focusOnChar` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputOTP Props: on-update:value inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-update:value.diff`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | Candidate DOM `mui:change:value.diff` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | Candidate DOM `mui:change:value.index` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value.source`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | Candidate DOM `mui:change:value.source` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### InputOTP Slots: default inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default.ref`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
