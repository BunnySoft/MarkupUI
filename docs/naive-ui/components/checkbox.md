# Checkbox

**🟢 Verified retained native Checkbox/CheckboxGroup scope, with explicit omissions.**

Individual controls are CSS-only native input/label. The optional
[group helper](../../../src/components/checkbox/group.ts) adds selected-string operations,
min/max interaction limits, reversible ARIA and one aggregate user notification.
[Legacy forms.ts](../../../src/components/forms.ts) is unchanged.
[Canonical contract and acceptance](../../components/checkbox.md) ·
[Separate HTML/CSS/JS demo](../../../demo/components/checkbox.html).

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** relevant P0 native-control rules and Input's concrete ownership/reset
conventions, not global P0 completion. **Next:** Radio, then Switch/Select/native controls
before Form enhancements.

1. [x] **Retain native form behavior.** Original checkbox/label/name/form identity, native disabled-fieldset and reset retained; no proxies.
2. [x] **Specify state reflection.** Boolean checked/defaultChecked, independent indeterminate and native string submission are explicit; setters/refresh/reset silent.
3. [x] **Design CheckboxGroup.** Native fieldset/legend, unique string keys, nested/external-form ownership, selected values and min/max interaction bounds retained.
4. [x] **Verify selection boundaries.** Native pre-activation cancellation/rollback, mixed state, labels/Space, form data, refresh/disposal and browser/media/no-JS acceptance obtained.

### Native primitives and fallback

No Checkbox custom element, synthetic toggle or options renderer is introduced. Authored
native checkboxes retain their browser rendering, labels, Space, required and submission.
Without JS the group remains a usable native fieldset but has no min/max helper bounds.
The standalone mixed property needs explicit native JS initialization; checked HTML remains
the no-JS fallback, not a fake three-state submitted value.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/checkbox) · [API] ·
[Checkbox source] · [Group source] · [Interface source] · [Size source].
Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**24 original local rows + five original inline declarations + 13 explicit source
supplements = 42 rows: 28 Verified adapted targets and 14 Intentionally omitted.**
All 29 original owner/prop/slot/method/inline identities remain; source line numbers refer
to the immutable public table. Green means the documented native adaptation, not Vue parity.
Evidence **C1** = [targeted tests](../../../tests/checkbox.test.ts);
**C2** = [browser/build/scope record](../../components/checkbox.md#acceptance).

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/demos/enUS/index.demo-entry.md
[Checkbox source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/src/Checkbox.tsx
[Group source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/src/CheckboxGroup.tsx
[Interface source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/src/interface.ts
[Size source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/checkbox/src/public-types.ts

### Checkbox Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `checked` · [API] L26 | Prop | Native boolean checked | 🟢 Verified | C1/C2; no token-valued checked property. |
| `checked-value` · [API] L27 | Prop | Native value string for checked submission, not custom state tokens | ⏭️ Intentionally omitted | String/number/boolean payload protocol is omitted. |
| `default-checked` · [API] L28 | Prop | Native defaultChecked/checked HTML | 🟢 Verified | C1/C2 changed default/native reset; independent current state. |
| `disabled` · [API] L29 | Prop | Native disabled and fieldset inheritance | 🟢 Verified | C1/C2; no derived disabled writes that remove submissions. |
| `focusable` · [API] L30 | Prop | Native focus/tabindex, no wrapper focusability mode | ⏭️ Intentionally omitted | Focusable false/Enter-toggle source behavior not emulated. |
| `indeterminate` · [API] L31 | Prop | Native independent indeterminate property | 🟢 Verified | C1/C2 mixed rollback and checked submission; no third payload. |
| `label` · [API] L32 | Prop | Actual native label content/for association | 🟢 Verified | C1/C2 original label/control identity and native activation. |
| `size` · [API] L33 | Prop | small/medium/large CSS | 🟢 Verified | External font/control sizes, native appearance. |
| `unchecked-value` · [API] L34 | Prop | Unchecked controls are absent from native submission | ⏭️ Intentionally omitted | No token event model or hidden unchecked field. |
| `value` · [API] L35 | Prop | Native string value; explicit unique group key | 🟢 Verified | C1/C2 numeric keys not silently coerced; values and names separate. |
| `on-update:checked` · [API] L36 | Callback | Native change listener reads checked | 🟢 Verified | C1/C2; no extra custom individual checkbox event. |

### CheckboxGroup Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `disabled` · [API] L42 | Prop | Native fieldset disabled | 🟢 Verified | C1/C2 first-legend exception preserved. |
| `default-value` · [API] L43 | Prop | Each native defaultChecked; no separate default array | 🟢 Verified | C1/C2 independent resets including external forms. |
| `label-field` · [API] L44 | Prop | Author real labels | ⏭️ Intentionally omitted | No options object field lookup. |
| `max` · [API] L45 | Prop | Nonnegative integer interaction upper bound or null | 🟢 Verified | C1/C2 native click cancellation; not validation/clamping. |
| `min` · [API] L46 | Prop | Nonnegative integer interaction lower bound | 🟢 Verified | C1/C2; never required on every member. |
| `options` · [API] L47 | Prop | Authored controls instead of options rendering | ⏭️ Intentionally omitted | No object renderer, label fallback or slot precedence. |
| `value` · [API] L48 | Prop | state.values / silent setValues(existing strings) | 🟢 Verified | C1/C2 DOM order, strict keys, disabled selected members included. |
| `value-field` · [API] L49 | Prop | Explicit native value | ⏭️ Intentionally omitted | No configurable object field mapping. |
| `on-update:value` · [API] L50 | Callback | mui:checkbox-group-change on group root | 🟢 Verified | C1/C2 one accepted user snapshot; no synthetic setter/reset events. |

### Checkbox Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default` · [API] L56 | Slot | Authored label/span content | 🟢 Verified | C1/C2 identity preserved; no renderer. |

### CheckboxGroup Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default` · [API] L62 | Slot | Authored fieldset/legend/children | 🟢 Verified | C1/C2 nested ownership and template clone adoption. |

### Checkbox Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `focus` · [API] L68 | Method | Native input.focus() | 🟢 Verified | C1/C2 native focus, not a wrapper method. |
| `blur` · [API] L69 | Method | Native input.blur() | 🟢 Verified | Native browser method, no custom focus protocol. |

### CheckboxGroup Props: options inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `options.label?` · [API] L47 | Inline record field | Authored native label text | 🟢 Verified | Not an accepted options-array property. |
| `options.value` · [API] L47 | Inline record field | Authored explicit native string value | 🟢 Verified | C1 validates uniqueness/missing/changed values. |
| `options.disabled?` · [API] L47 | Inline record field | Native disabled on authored input | 🟢 Verified | C1/C2 submission and limits distinguish disabled selected state. |

### CheckboxGroup Props: on-update:value inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `on-update:value.actionType` · [API] L50 | Inline record field | detail.actionType check/uncheck | 🟢 Verified | C1 accepted change snapshot only. |
| `on-update:value.value` · [API] L50 | Inline record field | detail.value native string key | 🟢 Verified | C1 no number/string coercion or unknown-key success. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Checkbox checked/defaultChecked string/number expansion · [Checkbox source] | Source type supplement | Native booleans only | ⏭️ Intentionally omitted | Source accepts wider state tokens than the official boolean table; not promoted. |
| Checkbox `onUpdateChecked` · [Checkbox source] | Source alias | Native change reading checked | 🟢 Verified | No duplicated alias notification. |
| Checkbox `onChange` · [Checkbox source] | Deprecated source alias | Native change instead | ⏭️ Intentionally omitted | No deprecated callback-array protocol. |
| Checkbox `privateInsideTable` · [Checkbox source] | Private source prop | None | ⏭️ Intentionally omitted | No private Table/theme integration. |
| Checkbox `theme`, `themeOverrides`, `builtinThemeOverrides` · [Checkbox source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No provider/theme-object/CSS-in-JS translation. |
| Checkbox `CheckboxSize` · [Size source] | Source type | Three explicit CSS sizes | 🟢 Verified | small/medium/large retained. |
| Checkbox `CheckboxInst` · [Interface source] | Source type | Original native input focus/blur | 🟢 Verified | No component instance/ref facade. |
| Checkbox `OnUpdateChecked`, `OnUpdateCheckedImpl` · [Interface source] | Source callback type group | Native Event and boolean checked | ⏭️ Intentionally omitted | No intersection/union state-token or MouseEvent/KeyboardEvent callback API. |
| CheckboxGroup `size` · [Group source] | Source prop | Group CSS size inherited by labels | 🟢 Verified | No Form/provider size inheritance. |
| CheckboxGroup `onUpdateValue` · [Group source] | Source alias | Root group-change snapshot | 🟢 Verified | One event, not duplicate callback aliases. |
| CheckboxGroup `onChange` · [Group source] | Deprecated source alias | Root group-change instead | ⏭️ Intentionally omitted | No deprecated callback API. |
| CheckboxGroup `CheckboxGroupOption`, optional `value?`, `[key: string]` · [Group source] | Source option type group | Authored native controls only | ⏭️ Intentionally omitted | Source optional value differs from public table; helper requires explicit strings, no object fields. |
| CheckboxGroup `CheckboxGroupInjection`, `checkboxGroupInjectionKey` · [Group source] | Source injection group | None | ⏭️ Intentionally omitted | No injected refs/provider graph. |

<!-- END PINNED API INVENTORY -->
