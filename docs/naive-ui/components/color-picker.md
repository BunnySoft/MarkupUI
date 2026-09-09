# Color Picker

**Plan: 🟢 Verified retained classic native RGB scope; advanced P6 color editing omitted.**

[Canonical anatomy, value/draft/ownership contracts and evidence](../../components/color-picker.md).
The real color input owns choosing/preview/defaults/FormData. A small optional helper
validates RGB hex setters and synchronizes a plain readout/optional native hex draft.
Black is a color, not clear/null. No color parser, HSV/alpha plane, popup framework or
permission/screen/clipboard side effect.

## Migration steps

**Delivery phase:** P4 — native control; P6 advanced modes/geometry explicitly omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Input/Form/default/reset ownership contracts.
**Next task:** Date Picker, then Time Picker; P4 as a whole remains In progress.

1. [x] **Adopt the native picker.** Original field/label/name/default/reset/datalist retained.
2. [x] **Expose readable values.** Plain readout and optional native validatable hex drafts, silent setters and honest events.
3. [x] **Decide advanced formats.** Strict six-digit RGB; null/alpha/gamut/mode/popup machinery excluded, never flattened.
4. [x] **Test browser differences.** Targeted tests/review/build and Chromium native value/forms/focus/fallback evidence; chooser UI not invoked.

### Native primitives and fallback

Native input[type=color] is the usable no-JS chooser. Optional literal datalist colors remain
browser-owned. Readout/hex entry/actions start hidden, the unnamed auxiliary field disabled;
only the actual color field submits. Native chooser availability is not a universal open/
hide/confirm callback, and black is not an empty state.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/color-picker)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md)
- [Pinned source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **25 original identities** remain: **22 local table rows + three inline declarations**,
no inherited rows. **Ten explicit source supplements** give **35 total rows**.
Verified means the documented **ADAPTED** native target, not source format/UI/ABI parity.
Canonical tests/browser/build evidence applies to retained rows; omissions receive no credit.

ColorPicker.tsx, interface/public-types, exports and the legacy widgets color wrapper were
reviewed. Source HSV/alpha/palette/toolbar/history/nullable behavior is not inferred merely
from having a native type=color input. No source EyeDropper integration is invented.

### ColorPicker Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default-show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L26) | Prop | No native default-open state controller. | ⏭️ Intentionally omitted | User/platform owns chooser activation. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L27) | Prop | Actual native six-digit hex defaultValue/value attribute. | 🟢 Verified | Invalid explicit defaults rejected; omitted native default may be black. |
| [`modes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L28) | Prop | Classic RGB hex only. | ⏭️ Intentionally omitted | No RGB/HSL/HSV format selector/parser. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L29) | Prop | Native chooser placement belongs to the browser/OS. | ⏭️ Intentionally omitted | No popup geometry. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L30) | Prop | Plain authored label/readout instead. | ⏭️ Intentionally omitted | No VNode callback. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L31) | Prop | No owned native dialog visibility state. | ⏭️ Intentionally omitted | No universal hide-picker API or inferred open state. |
| [`show-alpha`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L32) | Prop | Advanced alpha markup remains outside this helper. | ⏭️ Intentionally omitted | Alpha/colorspace attributes rejected without flattening data. |
| [`show-preview`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L33) | Prop | Native control swatch plus optional readable RGB text. | 🟢 Verified | ADAPTED native preview, not a separate source panel. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L34) | Prop | External small/medium/large control CSS. | 🟢 Verified | No native dialog sizing claim. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L35) | Prop | Actual input/fieldset disabled. | 🟢 Verified | Native first-legend and FormData semantics retained. |
| [`swatches`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L36) | Prop | Authored native datalist with literal #RRGGBB options. | 🟢 Verified | Browser-dependent UI; no JS/VNode palette renderer or fake selection event. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L37) | Prop | No portal target. | ⏭️ Intentionally omitted | Native chooser remains outside helper ownership. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L38) | Prop | Strict validated RGB setter/native string value. | 🟢 Verified | Null/empty/advanced formats excluded; black remains a real color. |
| [`on-complete`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L39) | Callback | Native change remains a browser event, not this callback. | ⏭️ Intentionally omitted | No universal source completion timing from native picker. |
| [`on-confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L40) | Callback | Hex Apply is a separate documented draft action. | ⏭️ Intentionally omitted | Not source/native-dialog confirmation parity. |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L41) | Callback | No nullable clear mode. | ⏭️ Intentionally omitted | Revert affects draft only; never maps clear to black. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L42) | Callback | No inferred native chooser visibility event. | ⏭️ Intentionally omitted | showPicker availability is not visibility ownership. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L43) | Callback | Original input/change plus one changed explicit Apply pair. | 🟢 Verified | Setters/reset/refresh silent, native events not duplicated. |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L44) | Prop | No source confirm/clear toolbar renderer. | ⏭️ Intentionally omitted | Authored hex Apply/Revert have independent native contracts. |

### ColorPicker Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L50) | Slot | Authored native auxiliary actions outside the chooser. | 🟢 Verified | ADAPTED markup, no custom popup/VNode slot. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L51) | Slot | Original native label and separate plain readout. | 🟢 Verified | No mutable label renderer. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L52) | Slot | Use the actual native color control. | ⏭️ Intentionally omitted | No replacement trigger component/ref/activation graph. |

### ColorPicker Slots: trigger inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`trigger.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L52) | Inline record field | Read native control.value outside any slot API. | ⏭️ Intentionally omitted | No nullable trigger payload. |
| [`trigger.onClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L52) | Inline record field | Native user activation, not an injected callback. | ⏭️ Intentionally omitted | No automatic chooser or permission request. |
| [`trigger.ref`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md#L52) | Inline record field | Original native reference instead of ComponentPublicInstance callback. | ⏭️ Intentionally omitted | No trigger/portal measurement graph. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`onUpdateShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx) | Source callback alias | No owned picker visibility. | ⏭️ Intentionally omitted | No callback-array alias. |
| [`onUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx) | Source callback alias | Original native events. | ⏭️ Intentionally omitted | No duplicate controlled-value ABI. |
| [`internalActions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx) | Source private prop | No custom undo/redo color-history toolbar. | ⏭️ Intentionally omitted | Native editing/chooser remains browser-owned. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx) | Source theme group | External native CSS. | ⏭️ Intentionally omitted | No CSS-in-JS/provider object. |
| [`ColorPickerProps / colorPickerProps / NColorPicker`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/index.ts) | Source public type/export group | Explicit native root/controller instead. | ⏭️ Intentionally omitted | No framework constructor/prop aliases. |
| [`ColorPickerSlots.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx) | Source slot declaration | Original authored fields, no VNode[] slot injection. | ⏭️ Intentionally omitted | Distinct from original public slot rows. |
| [`ColorPickerSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/index.ts) | Source public slot type | Native labels/auxiliary markup alternatives. | ⏭️ Intentionally omitted | No source callback/ref record ABI. |
| [`ColorPickerSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/public-types.ts) | Source public type | Small/medium/large external CSS vocabulary. | 🟢 Verified | ADAPTED control size, not dialog UI/type alias parity. |
| [`OnUpdateValue / OnUpdateValueImpl / OnConfirm / OnConfirmImpl / OnClear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/interface.ts) | Source callback type group | Native events and explicit draft methods. | ⏭️ Intentionally omitted | Source string-and-null intersection differs from implementation union; no nullable callback compatibility. |
| [`RenderLabel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/interface.ts) | Source render type | Plain nonlive text only. | ⏭️ Intentionally omitted | No VNodeChild function. |

<!-- END PINNED API INVENTORY -->
