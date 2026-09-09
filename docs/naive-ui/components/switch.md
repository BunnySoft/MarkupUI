# Switch

**🟢 Verified retained native binary Switch scope, with explicit omissions.**

The actual labelled native checkbox carries role switch and paints its own CSS rail/thumb.
The optional [helper](../../../src/components/switch/switch.ts) only adds focus-safe loading,
strict boolean setters and reversible attributes. [Legacy forms.ts](../../../src/components/forms.ts)
is unchanged. [Canonical contract/evidence](../../components/switch.md) ·
[Separate local HTML/CSS/JS](../../../demo/components/switch.html).

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** Checkbox/Input native ownership/reset conventions applied narrowly;
no mandatory Form or global state. **Next:** Select, then remaining native controls before Form enhancements.

1. [x] **Define boolean anatomy.** One actual input[type=checkbox][role=switch], stable native label, native name/submission and no duplicate wrapper role/tabstop.
2. [x] **Resolve custom values.** Native checked/defaultChecked remain booleans; native value/defaultValue are submission strings; token protocol and mixed state explicitly unsupported.
3. [x] **Implement busy/disabled policy.** Loading cancels native activation without disabling/hiding the focused input or omitting its form value; reversible busy attributes and external CSS retained.
4. [x] **Check assistive behavior.** Chromium role/stable-name/checked and native Space/label/focus, fieldset/reset/submission, busy rollback, RTL/media/no-JS checks recorded; no universal AT claim.

### Native primitives and fallback

No custom element/proxy value/toggle engine is added. CSS-only native switches remain usable
without JS; optional loading enforcement needs the helper. Unsupported appearance/gradient
support, forced colors and print retain a native checkbox rendering of the real control.
Readonly and indeterminate are rejected by the helper, not promoted to extra switch states.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/switch) · [API] ·
[Switch source] · [Public types] · [Callback types].
Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**17 original local rows + six original inline fields + eight explicit source supplements =
31 rows: 17 Verified adapted targets + 14 Intentionally omitted.** All 23 original
owner/prop/slot/inline identities remain. API line numbers refer to the pinned public table.
**S1** = [tests](../../../tests/switch.test.ts), **S2** =
[obtained browser/build record](../../components/switch.md#acceptance). Green is an adaptation,
not framework or arbitrary-value parity.

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/demos/enUS/index.demo-entry.md
[Switch source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/src/Switch.tsx
[Public types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/src/public-types.ts
[Callback types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/switch/src/interface.ts

### Switch Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `checked-value` · [API] L25 | Prop | Native checked string submission instead of state tokens | ⏭️ Intentionally omitted | No arbitrary boolean/string/number checked payload protocol. |
| `default-value` · [API] L26 | Prop | Native defaultChecked/checked HTML | 🟢 Verified | S1/S2 explicitly not input.defaultValue, which is a submission string. |
| `disabled` · [API] L27 | Prop | Native disabled/fieldset semantics | 🟢 Verified | S1/S2 helper never overwrites child disabled property. |
| `loading` · [API] L28 | Prop | Explicit loading helper and authored indicator | 🟢 Verified | S1/S2 focus-safe native click cancellation; no async request machinery. |
| `rail-style` · [API] L29 | Prop | External CSS rail/thumb tokens/selectors | 🟢 Verified | Style callback/inline string or object generation omitted. |
| `round` · [API] L30 | Prop | Default round rail/thumb, data-square alternative | 🟢 Verified | External CSS on actual input, no proxy. |
| `rubber-band` · [API] L31 | Prop | No stretch/press engine | ⏭️ Intentionally omitted | No gesture or key-driven animation. |
| `size` · [API] L32 | Prop | small/medium/large CSS | 🟢 Verified | Native fallback and explicit rail/thumb sizes. |
| `spin-props` · [API] L33 | Prop | Authored busy text/decorative icon instead | ⏭️ Intentionally omitted | No Spin dependency or forwarded spinner props. |
| `unchecked-value` · [API] L34 | Prop | Unchecked controls absent from native submission | ⏭️ Intentionally omitted | No hidden unchecked field or custom false token. |
| `value` · [API] L35 | Prop | Native checked / silent setChecked(boolean) | 🟢 Verified | S1/S2 string/number model values omitted; input.value remains a submission string. |
| `on-update:value` · [API] L36 | Callback | Native change, read event.target.checked | 🟢 Verified | S1/S2 one original input/change sequence; no extra custom user event. |

### Switch Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `checked` · [API] L42 | Slot | Authored aria-hidden .mui-switch__on | 🟢 Verified | S1/S2 native checked CSS, separate stable accessible label. |
| `checked-icon` · [API] L43 | Slot | Authored aria-hidden .mui-switch__checked-icon | 🟢 Verified | Adjacent decorative content, not inserted into the void input/thumb. |
| `icon` · [API] L44 | Slot | Authored aria-hidden .mui-switch__icon | 🟢 Verified | Common static icon; no source slot fallback renderer. |
| `unchecked` · [API] L45 | Slot | Authored aria-hidden .mui-switch__off | 🟢 Verified | S1/S2 no renaming from On to Off. |
| `unchecked-icon` · [API] L46 | Slot | Authored aria-hidden .mui-switch__unchecked-icon | 🟢 Verified | Native state visibility; no Icon/transition dependency. |

### Switch Props: rail-style inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `rail-style.focused` · [API] L29 | Inline record field | Native :focus/:focus-visible CSS | 🟢 Verified | S2 focus paint on the actual input; no callback record. |
| `rail-style.checked` · [API] L29 | Inline record field | Native :checked CSS | 🟢 Verified | S2 logical thumb/rail state; no mirrored JS checked model. |

### Switch Props: spin-props inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `spin-props.strokeWidth?` · [API] L33 | Inline record field | None | ⏭️ Intentionally omitted | No spinner drawing API. |
| `spin-props.stroke?` · [API] L33 | Inline record field | None | ⏭️ Intentionally omitted | No spinner color prop. |
| `spin-props.scale?` · [API] L33 | Inline record field | None | ⏭️ Intentionally omitted | No spinner scale prop. |
| `spin-props.radius?` · [API] L33 | Inline record field | None | ⏭️ Intentionally omitted | No spinner radius prop. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Switch `defaultValue` string/number expansion · [Switch source] | Source type supplement | Native boolean defaultChecked only | ⏭️ Intentionally omitted | Source is wider than public boolean table; not DOM defaultValue or typed state tokens. |
| Switch `onUpdateValue` · [Switch source] | Source alias | Native change reading checked | 🟢 Verified | No duplicate callback-alias event. |
| Switch `onChange` · [Switch source] | Deprecated source alias | Native change instead | ⏭️ Intentionally omitted | No deprecated callback-array model. |
| Switch `theme`, `themeOverrides`, `builtinThemeOverrides` · [Switch source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No provider/CSS-in-JS/theme-object translation. |
| Switch `SwitchSize` · [Public types] | Source type | Three CSS sizes | 🟢 Verified | small/medium/large retained. |
| Switch `SwitchSpinProps` / `SharedSpinProps` · [Public types] | Source type alias | None | ⏭️ Intentionally omitted | No internal spinner dependency or inherited renderer API. |
| Switch `OnUpdateValue`, `OnUpdateValueImpl` · [Callback types] | Source callback type group | Native boolean checked observation | ⏭️ Intentionally omitted | No intersection/union state-token protocol. |
| Switch `SwitchSlots` · [Switch source] | Source VNode slot type | Authored DOM only | ⏭️ Intentionally omitted | No function/VNode slot object or icon-priority renderer. |

<!-- END PINNED API INVENTORY -->
