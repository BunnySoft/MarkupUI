# Input OTP

**Plan: 🟢 Verified retained native single-field scope.**

[Canonical anatomy, API, sensitive-data/completion contracts and evidence](../../components/input-otp.md).
One original text/password input owns the whole string, native selection/paste/IME,
constraints/defaults and form value. The small optional helper emits metadata-only,
deduplicated local completion and optional nonlive count presentation.
No per-cell editor, auth/WebOTP/SMS/clipboard client, code logging/storage or dependency.

## Migration steps

**Delivery phase:** P4 — enhanced entry. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Input/IME and Form contracts.
**Next task:** Dynamic Input, then Dynamic Tags; overall P4 remains In progress.

1. [x] **Define the value contract.** Whole strings, bounded ASCII length and local completion stretches.
2. [x] **Preserve native autofill.** Original one-time-code hint/label/name/form/default/selection semantics.
3. [x] **Add optional segmentation.** Single-field letter-spacing adaptation; multi-cell rendering/navigation explicitly omitted.
4. [x] **Test sensitive entry.** Native forms, leading zeroes, insertion/composition/reset/review fixes; no code payloads or auth effects.

### Native primitives and fallback

One labelled native field remains usable without JS. Matching maxlength/pattern and
inputmode/autocomplete hints are authored, not provider-generated. Mobile autofill remains
platform-dependent. Native password masking is presentation, not a security guarantee.
The demo uses method=dialog to avoid code-bearing URLs/network requests even without JS.

### Rendered default-style comparison

The [Input OTP style audit](../../style-audit/components/input-otp.md) records actual
pinned light/dark rendering and the retained single-field limits. Native small/medium/
large heights now match source **28/34/40px**, with **14/14/15px** type, 3px radius and
source light/dark border, placeholder, disabled and error palettes. Eight-pixel native
letter spacing is an adaptation of the source's eight-pixel **inter-cell** gap, not
a claim of six-cell geometry or navigation parity. Authored gap participates in width.

The original monospace field, visible system focus outline, dashed aria-invalid cue,
one native form value and metadata-only completion remain. Warning decoration and
cell/slot rendering remain outside the retained model. Input-owned wrappers are not
repainted by OTP focus/disabled rules. OTP's disabled/media text is corrected; shared
Input wrapper forced-disabled borders and focused print paint are explicitly proposed
to the parent, not changed in this scope. No inventory identities or omissions below
were expanded into new runtime APIs.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/input-otp)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md)
- [Pinned source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **23 original identities** remain: **18 local table rows + five inline declarations**,
no inherited rows. **Eleven explicit source supplements** identify implementation/type
discrepancies and exports; **34 total rows**. Verified means the documented **ADAPTED**
single-field native target, not per-cell/source signature parity. Retained rows use
canonical acceptance evidence; omissions receive no implementation credit.

InputOtp.tsx, public-types.ts and exports were reviewed. The source pads/truncates arrays,
distributes/vetoes paste, forwards cell InputProps and intercepts navigation/deletion.
Those behaviors are intentionally not ported. Original source identities—including
InputOtp-prefixed type names and the public value string/source array discrepancy—are preserved.

### InputOTP Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`allow-input`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L26) | Prop | Native pattern/validity, no character veto or normalization. | ⏭️ Intentionally omitted | Never strips pasted separators or rewrites case. |
| [`block`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L27) | Prop | `.mui-input-otp[data-block]` native full width. | 🟢 Verified | External CSS only. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L28) | Prop | Native defaultValue/value attribute string. | 🟢 Verified | ADAPTED from source string array; native reset owns defaults. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L29) | Prop | Actual input/fieldset disabled. | 🟢 Verified | Native FormData and first-legend eligibility preserved. |
| [`gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L30) | Prop | --mui-input-otp-gap letter spacing. | 🟢 Verified | ADAPTED single-field presentation, not inter-cell gaps. |
| [`length`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L31) | Prop | Fixed integer 1–12 with matching native maxlength/ASCII pattern. | 🟢 Verified | No cell generation or secret truncation. |
| [`mask`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L32) | Prop | Actual input type=password or text. | 🟢 Verified | Native presentation only, no security guarantee. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L33) | Prop | Authored native placeholder. | 🟢 Verified | Not a label or per-cell renderer. |
| [`readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L34) | Prop | Actual input.readOnly. | 🟢 Verified | Never emits completion while readonly; native form behavior unchanged. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L35) | Prop | data-size small/large, medium default. | 🟢 Verified | External native field CSS. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L36) | Prop | Native/Form validation and optional count/state presentation. | 🟢 Verified | Local format is not auth success. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L37) | Prop | Original input.value string, including leading zeroes/empty. | 🟢 Verified | Docs say string/null; implementation uses array/null; neither array normalization nor hidden null model is ported. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L38) | Callback | Original native blur event. | 🟢 Verified | No per-cell index. |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L39) | Callback | mui:input-otp-complete with length/characters only. | 🟢 Verified | ADAPTED one-per-complete-stretch, no code payload/authentication/submit. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L40) | Callback | Original native focus event. | 🟢 Verified | One field, no automatic focus navigation. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Callback | Native input/change with original input.value. | 🟢 Verified | No duplicate array/diff/index/source notification. |

### InputOTP Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Slot | One authored native code input. | 🟢 Verified | ADAPTED anatomy; no repeated InputProps/VNode templates. |

### InputOTP Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`focusOnChar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L53) | Method | Native input.focus/setSelectionRange are explicit application alternatives. | ⏭️ Intentionally omitted | No per-cell focus engine or injected index refs. |

### InputOTP Props: on-update:value inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`on-update:value.diff`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | No duplicate changed-code payload. | ⏭️ Intentionally omitted | Native input event/field remains authoritative. |
| [`on-update:value.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | No fabricated cell index. | ⏭️ Intentionally omitted | One native selection range. |
| [`on-update:value.source`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L41) | Inline record field | Native InputEvent information, no rewritten source enum. | ⏭️ Intentionally omitted | No custom paste/deletion engine. |

### InputOTP Slots: default inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Inline record field | No per-cell template index. | ⏭️ Intentionally omitted | Single original field. |
| [`default.ref`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md#L47) | Inline record field | Direct original input reference, no ref callback graph. | ⏭️ Intentionally omitted | Native identity/listeners retained. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`InputOtpProps.value (source array)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/InputOtp.tsx) | Source shape discrepancy | Preserve explicit source array/null versus public string/null distinction. | ⏭️ Intentionally omitted | Native whole-string adaptation, not source controlled-array parity. |
| [`onUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/InputOtp.tsx) | Source callback alias | Native input/change instead of duplicate callback props. | ⏭️ Intentionally omitted | No callback arrays. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/InputOtp.tsx) | Source theme group | External CSS only. | ⏭️ Intentionally omitted | No provider or CSS-in-JS. |
| [`InputOtpProps / inputOtpProps / NInputOtp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/index.ts) | Source public type/export group | Narrow InputOtpOptions and authored native HTML. | ⏭️ Intentionally omitted | No framework constructor/prop-object aliases. |
| [`InputOtpAllowInput`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source public type | Native pattern/validity instead of char/index/array veto. | ⏭️ Intentionally omitted | No mutation filtering/normalization. |
| [`InputOtpSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source public type | Small/medium/large CSS vocabulary. | 🟢 Verified | ADAPTED native style, no TS alias claim. |
| [`InputOtpOnFocus / InputOtpOnBlur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source callback type group | Native events on one input. | ⏭️ Intentionally omitted | No cell-index callback signature. |
| [`InputOtpOnFinish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source callback type | Metadata-only completion alternative. | ⏭️ Intentionally omitted | No string-array code payload. |
| [`InputOtpOnUpdateValue / InputOtpOnUpdateValueMeta / InputOtpOnUpdateValueMetaSource`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source callback/meta type group | Native field/event state. | ⏭️ Intentionally omitted | No array/diff/index/source ABI. |
| [`InputOtpSlots / InputOtpDefaultSlot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source slot type group | Original native input; no VNode/InputProps template. | ⏭️ Intentionally omitted | No implicit Input prop inheritance. |
| [`InputOtpInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts) | Source public type | Native focus/selection APIs instead. | ⏭️ Intentionally omitted | focusOnChar interface not exported as compatibility alias. |

<!-- END PINNED API INVENTORY -->
