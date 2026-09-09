# Input Number

**🟢 Verified retained native number-input scope, with explicit omissions.**

The original labelled input[type=number] owns numeric editing, constraints/defaults and forms.
The [optional helper](../../../src/components/input-number/input-number.ts) derives button
availability with a never-inserted native stepping probe and calls native stepUp/stepDown
on the actual field. No text parser/model/decimal engine is added.
[Legacy widgets](../../../src/plugins/widgets.ts) remain unchanged.
[Canonical contract/evidence](../../components/input-number.md) · [Native demo](../../../demo/components/input-number.html).

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** relevant Input/native ownership, event and reset conventions only.
**Next:** Slider, then Rate/native controls before Form enhancements.

1. [x] **Adopt numeric anatomy.** Original labelled native input and named type=button actions retained; no proxy, duplicate spinbutton role or inserted probe.
2. [x] **Resolve stepping.** Native decimal/grid/min/max/default-base behavior, empty/badInput distinction, no-op/error availability and native keyboard/wheel policy specified.
3. [x] **Scope formatting hooks.** Parser/formatter/precision/model-timing/validator/loading exclusions explicit; no arbitrary-precision or locale inverse parser.
4. [x] **Test numeric edges.** Fractional/off-grid/bounds/empty/invalid-draft/readonly/reset/form/focus/event/media/no-JS/coexistence acceptance recorded.

### Native primitives and fallback

Native input is never replaced and its own steppers are not hidden. Without JS, labelled
numeric entry, keyboard, constraints, reset and submission remain usable; custom buttons
stay hidden. The helper uses reversible action state and a local off-DOM native number
probe with no name/form/insertion, not a hidden submitted value or measurement framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/input-number) · [API] ·
[Source] · [Interface] · [Size]. Pinned Naive UI **2.45.3**,
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**34 original local rows + two original inline fields + ten explicit source supplements =
46 rows: 33 Verified adapted targets + 13 Intentionally omitted.** All 36 original
owner/prop/slot/method/inline identities remain. Green is native adaptation, not source parity.
**N1** = [tests](../../../tests/input-number.test.ts); **N2** =
[obtained native/browser/build record](../../components/input-number.md#acceptance).

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/demos/enUS/index.demo-entry.md
[Source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/src/InputNumber.tsx
[Interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/src/interface.ts
[Size]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-number/src/public-types.ts

### InputNumber Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `autofocus` · [API] L33 | Prop | Native autofocus | 🟢 Verified | Browser-owned timing, no helper refocus on connect. |
| `bordered` · [API] L34 | Prop | External data-borderless CSS | 🟢 Verified | Native focus retained. |
| `button-placement` · [API] L35 | Prop | Authored right/both-side button order | 🟢 Verified | N2 no CSS/JS reorder or extra keyboard engine. |
| `clearable` · [API] L36 | Prop | Optional native clear button/controller clear | 🟢 Verified | N1/N2 empty/badInput/focus/event behavior. |
| `default-value` · [API] L37 | Prop | Native defaultValue/value attribute | 🟢 Verified | N1/N2 separate current/reset state and step base. |
| `disabled` · [API] L38 | Prop | Native disabled/fieldset | 🟢 Verified | N1/N2 no child disabled rewrites. |
| `format` · [API] L39 | Prop | Native number rendering | ⏭️ Intentionally omitted | No string/locale formatter or text proxy. |
| `input-props` · [API] L40 | Prop | Actual native attributes/properties | 🟢 Verified | No prop forwarding/type override; real number required. |
| `keyboard` · [API] L41 | Prop | Native keyboard and repeat always retained | 🟢 Verified | Per-key suppression omitted. |
| `loading` · [API] L42 | Prop | Application-owned external status | ⏭️ Intentionally omitted | No spinner/dependency/reserved-space prop. |
| `max` · [API] L43 | Prop | Native max/validity/stepping | 🟢 Verified | N1/N2 no typing-time clamp. |
| `min` · [API] L44 | Prop | Native min/validity/step base | 🟢 Verified | N1/N2 below-bound drafts remain native. |
| `parse` · [API] L45 | Prop | Native number grammar/valueAsNumber | ⏭️ Intentionally omitted | No general string parser or formatting inverse. |
| `placeholder` · [API] L46 | Prop | Authored native placeholder | 🟢 Verified | No implicit translated default/label substitution. |
| `precision` · [API] L47 | Prop | Native JS/browser number precision | ⏭️ Intentionally omitted | No requested rounding/fixed decimals/arbitrary precision. |
| `round` · [API] L48 | Prop | data-round CSS | 🟢 Verified | External input border shape. |
| `readonly` · [API] L49 | Prop | Native readonly; custom actions blocked | 🟢 Verified | N1/N2 copy/focus/submission remain native. |
| `show-button` · [API] L50 | Prop | Authored optional custom actions | 🟢 Verified | Native steppers not suppressed, including no-JS. |
| `size` · [API] L51 | Prop | Four CSS sizes | 🟢 Verified | tiny/small/medium/large, no provider state. |
| `status` · [API] L52 | Prop | Native-field border CSS | 🟢 Verified | No automatic aria-invalid/live/schema validation. |
| `step` · [API] L53 | Prop | Native stepUp/stepDown rules | 🟢 Verified | N1/N2 decimals/grid/no-ops/any errors; no numeric engine. |
| `update-value-on-input` · [API] L54 | Prop | Observe native input/change explicitly | ⏭️ Intentionally omitted | No last-valid-value or model commit/blur timing policy. |
| `validator` · [API] L55 | Prop | Native validity/application custom validity | ⏭️ Intentionally omitted | No callback validator. |
| `value` · [API] L56 | Prop | Native finite number/null state plus badInput/validity | 🟢 Verified | N1/N2 empty and invalid are not zero; setters silent. |
| `on-blur` · [API] L57 | Callback | Native blur event | 🟢 Verified | No clamp/round-on-blur. |
| `on-clear` · [API] L58 | Callback | mui:input-number-clear after input/change | 🟢 Verified | N1/N2 previous number/text/badInput snapshot. |
| `on-focus` · [API] L59 | Callback | Native focus event | 🟢 Verified | N1/N2 boundary/clear focus recovery. |
| `on-update:value` · [API] L60 | Callback | Native events, state.value and native flags | 🟢 Verified | No duplicate numeric callback/model event. |

### InputNumber Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `add-icon` · [API] L66 | Slot | Authored named increment button content | 🟢 Verified | No Icon/Button component dependency. |
| `minus-icon` · [API] L67 | Slot | Authored named decrement button content | 🟢 Verified | Keep actual accessible button name. |
| `prefix` · [API] L68 | Slot | Authored affix content | 🟢 Verified | Label/description association stays author-owned. |
| `suffix` · [API] L69 | Slot | Authored affix content | 🟢 Verified | No VNode renderer. |

### InputNumber Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `blur` · [API] L75 | Method | Native control.blur() | 🟢 Verified | No wrapper/ref facade. |
| `focus` · [API] L76 | Method | Native control.focus() | 🟢 Verified | Native focusability and disabled rules. |

### InputNumber Props: keyboard inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `keyboard.ArrowUp?` · [API] L41 | Inline record field | Native ArrowUp left untouched | ⏭️ Intentionally omitted | No disabling flag or extra key listener. |
| `keyboard.ArrowDown?` · [API] L41 | Inline record field | Native ArrowDown left untouched | ⏭️ Intentionally omitted | No disabling flag or global suppression. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| InputNumber min/max/step Number-or-String declarations · [Source] | Source type group | Native raw attribute strings | 🟢 Verified | Native grammar/default fallback, not custom parseNumber/abs-step normalization. |
| InputNumber `onUpdateValue` · [Source] | Source alias | Native input/change observation | 🟢 Verified | No duplicate alias event. |
| InputNumber `onChange` · [Source] | Deprecated source alias | Native change instead | ⏭️ Intentionally omitted | No deprecated callback-array registration. |
| InputNumber `theme`, `themeOverrides`, `builtinThemeOverrides` · [Source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No provider/theme-object/CSS-in-JS integration. |
| InputNumber `InputNumberSize`, `Size` · [Size], [Interface] | Source type aliases | Four explicit CSS sizes | 🟢 Verified | No Form/provider inheritance. |
| InputNumber `InputNumberInst` · [Interface] | Source type | Original native control methods | 🟢 Verified | Native method support, not a component ref facade. |
| InputNumber `select` · [Interface] | Source-only method | Native control.select() | 🟢 Verified | Number selection APIs remain browser-limited; no caret/range shim. |
| InputNumber `OnUpdateValue` · [Interface] | Source callback type | Native event + nullable numeric snapshot | ⏭️ Intentionally omitted | No numeric callback registration contract. |
| InputNumber `InputNumberSlots` · [Source] | Source VNode slot type | Authored DOM only | ⏭️ Intentionally omitted | No function/VNode slot map. |
| InputNumber `HOLDING_CHANGE_THRESHOLD`, `HOLDING_CHANGE_INTERVAL` / hold timers · [Source] | Source interaction implementation | Native key repeat, one custom action per click | ⏭️ Intentionally omitted | No custom 800ms/100ms press-repeat engine. |

<!-- END PINNED API INVENTORY -->
