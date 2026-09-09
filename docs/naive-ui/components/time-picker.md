# Time Picker

**Plan: 🟢 Verified retained native single-time scope.**

[Canonical time/precision/ownership contracts and evidence](../../components/time-picker.md).
The original native time input owns its string/defaults/constraints/FormData. Shared
temporal probing and focus primitives avoid date anchoring and preserve native clear/reset.
No range API, timezone/formatter/column renderer, hidden proxy or dependency.

## Migration steps

**Delivery phase:** P4 — native time entry; P6 custom panel/format/timezone scope omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native temporal probe and accepted form/default/ownership contracts.
**Next task:** audit retained P4 and recommend a P5 collection foundation; no next component starts here.

1. [x] **Adopt native time entry.** Original label/name/precision/constraints/default/reset retained.
2. [x] **Resolve time rules.** Time-only strings, midnight/empty, native wrapping bounds and precision checks.
3. [x] **Gate panel features.** Native clear/readout only; source format/hour-list/timezone/popup machinery omitted.
4. [x] **Test temporal edges.** Targeted/P4-wide tests, native browser probes and explicit platform limits.

### Native primitives and fallback

Native input[type=time] remains the no-JS field. Empty string is still a successful named
empty field; midnight is 00:00. Missing native parsing/precision is an explicit fallback,
not a calendar/token library. Native min>max may wrap midnight and is never reordered.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/time-picker)
- [Pinned API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md)
- [Pinned implementation](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **34 original identities** remain; **16 explicit source supplements** give **50 rows**.
Verified means an **ADAPTED retained native target**, not source epoch/format/UI parity.
Canonical tests/browser/build evidence applies to retained rows; omissions receive no credit.
TimePicker.tsx, interface/public-types and exports were reviewed; source date-fns/date-fns-tz
formatting and date-anchored strictParse are not ported.

### TimePicker Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L28) | Prop | No source clear/now/confirm toolbar array. | ⏭️ Intentionally omitted |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L29) | Prop | Authored native type=button clear. | 🟢 Verified |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L30) | Prop | Actual native time-string defaults; no epoch/null model conversion. | 🟢 Verified |
| [`default-formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L31) | Prop | No formatted default model; Markdown number differs from source String. | ⏭️ Intentionally omitted |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L32) | Prop | Native input/fieldset disabled and successful-control filtering. | 🟢 Verified |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L33) | Prop | Native time strings, no date-fns tokens. | ⏭️ Intentionally omitted |
| [`formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L34) | Prop | No second formatted binding/hidden date anchor. | ⏭️ Intentionally omitted |
| [`hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L35) | Prop | Native constraints are not selectable hour arrays. | ⏭️ Intentionally omitted |
| [`minutes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L36) | Prop | No custom minute column/list. | ⏭️ Intentionally omitted |
| [`seconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L37) | Prop | Native seconds precision/step, not a source seconds array. | ⏭️ Intentionally omitted |
| [`input-readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L38) | Prop | Actual readonly, including native picker/validation behavior. | 🟢 Verified |
| [`is-hour-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L39) | Prop | No arbitrary disabled native popup hours. | ⏭️ Intentionally omitted |
| [`is-minute-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L40) | Prop | No minute/hour-dependent cell predicate. | ⏭️ Intentionally omitted |
| [`is-second-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L41) | Prop | No second/minute/hour-dependent cell predicate. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L42) | Prop | Native labels/hints; platform placeholder UI is not controlled. | ⏭️ Intentionally omitted |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L43) | Prop | No native popup positioning API. | ⏭️ Intentionally omitted |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L44) | Prop | No owned picker visibility state. | ⏭️ Intentionally omitted |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L45) | Prop | External small/medium/large native CSS. | 🟢 Verified |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L46) | Prop | Native/Form validity and plain readout, no date/instant validity claim. | 🟢 Verified |
| [`time-zone`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L47) | Prop | Time-of-day has no timezone; conversion requires application policy. | ⏭️ Intentionally omitted |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L48) | Prop | No portal target. | ⏭️ Intentionally omitted |
| [`use-12-hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L49) | Prop | Native locale UI is not a configurable twelve-hour panel. | ⏭️ Intentionally omitted |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L50) | Prop | Validated native time strings only; no timestamp anchoring. | 🟢 Verified |
| [`value-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L51) | Prop | No formatted binding token API. | ⏭️ Intentionally omitted |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L52) | Callback | Original native blur event. | 🟢 Verified |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L53) | Callback | Explicit native input/change and time-clear notification. | 🟢 Verified |
| [`on-confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L54) | Callback | Native change is not source timestamp/formatted confirmation. | ⏭️ Intentionally omitted |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L55) | Callback | Original native focus event. | 🟢 Verified |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L56) | Callback | No dual formatted/timestamp emitter. | ⏭️ Intentionally omitted |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L57) | Callback | No inferred native open/hide notification. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L58) | Callback | Native time-string input/change; silent setters/reset/refresh. | 🟢 Verified |

### TimePicker Slots

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L64) | Slot | Authored decorative affix, not native-popup icon replacement. | 🟢 Verified |

### TimePicker Methods

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L70) | Method | Original native control.focus(options). | 🟢 Verified |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md#L71) | Method | Original native control.blur(). | 🟢 Verified |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source prop | External native input border CSS. | 🟢 Verified |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source prop | No native-picker icon toggle. | ⏭️ Intentionally omitted |
| [`stateful`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source private prop | Native current/default field, no framework stateful-mode switch. | ⏭️ Intentionally omitted |
| [`onUpdateValue / deprecated onChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source callback alias group | Native events, no duplicate callback-array ABI. | ⏭️ Intentionally omitted |
| [`onUpdateShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source callback alias | No native visibility model. | ⏭️ Intentionally omitted |
| [`onUpdateFormattedValue / onUpdate:formattedValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source callback alias group | No source formatted/timezone binding channel. | ⏭️ Intentionally omitted |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source theme group | External CSS, no provider or CSS-in-JS. | ⏭️ Intentionally omitted |
| [`TimePickerProps / timePickerProps / NTimePicker`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/index.ts) | Source public type/export group | Explicit native root/controller, no framework aliases. | ⏭️ Intentionally omitted |
| [`TimePickerSlots.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx) | Source slot declaration | Authored native input, no VNode[] injection. | ⏭️ Intentionally omitted |
| [`TimePickerSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/index.ts) | Source public slot type | Native markup rather than a renderer ABI. | ⏭️ Intentionally omitted |
| [`TimePickerInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts) | Source public interface | Native focus/blur with separate controller type. | ⏭️ Intentionally omitted |
| [`TimePickerSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/public-types.ts) | Source public type | Small/medium/large CSS vocabulary. | 🟢 Verified |
| [`OnUpdateValue / OnUpdateValueImpl / OnUpdateFormattedValue / OnUpdateFormattedValueImpl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts) | Source callback type group | No epoch/formatted callback signature compatibility. | ⏭️ Intentionally omitted |
| [`IsHourDisabled / IsMinuteDisabled / IsSecondDisabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts) | Source validator type group | Native constraints are not arbitrary disabled-time cells. | ⏭️ Intentionally omitted |
| [`TimePickerInjection / timePickerInjectionKey / PanelRef`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts) | Source internal provider/ref group | No scrolling-column/provider graph. | ⏭️ Intentionally omitted |
| [`Item / ItemValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts) | Source internal column types | No number/am/pm item renderer/model. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
