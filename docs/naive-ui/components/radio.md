# Radio

**🟢 Verified retained native Radio/RadioGroup/RadioButton scope, with explicit omissions.**

Radio and RadioButton are CSS-only labelled native inputs. The optional
[group helper](../../../src/components/radio/group.ts) validates a complete native
name/form/tree group, provides silent string selection and observes native changes.
[Legacy forms.ts](../../../src/components/forms.ts) is unchanged.
[Canonical contract/evidence](../../components/radio.md) · [Native demo](../../../demo/components/radio.html).

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** relevant P0 form contracts and Input/Checkbox's native ownership/reset
conventions, not a global Form model. **Next:** Switch, then Select and other native
controls before Form enhancements.

1. [x] **Adopt exclusive controls.** Original named/labelled radios keep native exclusivity, keyboard and form association; complete native peers are validated rather than renamed.
2. [x] **Reconcile group state.** Native checked/default state, strict string/null setter, silent reset/refresh and one accepted group-change snapshot specified and tested.
3. [x] **Style RadioButton separately.** Labelled, visible native radios in button-like CSS segments; no buttons, proxies, roving engine or VNode splitters.
4. [x] **Verify native behavior.** Native keys/labels/required/disabled/default/reset/submission, dynamic scope, peer conflicts, media/fallback and coexistence acceptance obtained.

### Native primitives and fallback

Name, actual form owner and tree—not a component fieldset—define native peers. A conflicting
enhancement is rejected; native behavior is not intercepted to fake isolation. With no JS,
labels/keys/required/reset/submission and regular/segmented appearances still work.
Without `:has()` enhancement, visible native circles and checked-sibling text remain usable.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/radio) · [API] ·
[Radio source] · [RadioButton source] · [Group source] · [Shared source] · [Types] · [Size].
Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**17 original local rows + three original inline fields + 14 explicit source supplements =
34 rows: 23 Verified adapted targets + 11 Intentionally omitted.** All 20 original grouped
owner/prop/inline identities remain. Source line numbers refer to the immutable public table.
Evidence **R1** = [tests](../../../tests/radio.test.ts), **R2** =
[browser/build/scope record](../../components/radio.md#acceptance). Green means adaptation,
not source framework behavior.

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/demos/enUS/index.demo-entry.md
[Radio source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/Radio.tsx
[RadioButton source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/RadioButton.tsx
[Group source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/RadioGroup.tsx
[Shared source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/use-radio.ts
[Types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/interface.ts
[Size]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/radio/src/public-types.ts

### Radio Props, RadioButton Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `checked` · [API] L23 | Prop | Native boolean checked | 🟢 Verified | R1/R2; browser exclusivity, no controlled renderer. |
| `default-checked` · [API] L24 | Prop | Native defaultChecked/checked HTML | 🟢 Verified | R1/R2 dirty-state/default/reset semantics preserved. |
| `disabled` · [API] L25 | Prop | Native disabled/fieldset behavior | 🟢 Verified | R1/R2; no attribute/proxy rewriting. |
| `label` · [API] L26 | Prop | Authored native label content | 🟢 Verified | R1/R2 identity and native activation; no prop/slot precedence algorithm. |
| `name` · [API] L27 | Prop | Authored native name on each radio | 🟢 Verified | R1/R2 common nonempty enhanced names; no name forwarding or silent renaming. |
| `size` · [API] L28 | Prop | small/medium/large CSS sizes | 🟢 Verified | Explicit native/segmented CSS presentation. |
| `value` · [API] L29 | Prop | Native string submission/key | 🟢 Verified | Numeric/boolean framework tokens omitted; unique explicit helper keys required. |
| `on-update:checked` · [API] L30 | Callback | Native selected-input change; read checked | 🟢 Verified | R1/R2 no false callback synthesized on former peer. |

### RadioGroup Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `disabled` · [API] L36 | Prop | Native fieldset disabled | 🟢 Verified | R1/R2 first-legend exception and selected/disabled submission remain native. |
| `default-value` · [API] L37 | Prop | Per-radio defaultChecked | 🟢 Verified | R1/R2 no parallel default-value model or clamping. |
| `label-field` · [API] L38 | Prop | Author native labels | ⏭️ Intentionally omitted | No options-field lookup. |
| `name` · [API] L39 | Prop | Explicit common native member names | 🟢 Verified | R1/R2 complete name/form/tree scope validated; fieldset.name is not forwarded. |
| `options` · [API] L40 | Prop | Authored radios instead of an options renderer | ⏭️ Intentionally omitted | No VNode/DOM options generation or slot precedence. |
| `size` · [API] L41 | Prop | Explicit inherited CSS size | 🟢 Verified | No provider/Form size injection. |
| `value` · [API] L42 | Prop | state.value and silent setValue(string/null) | 🟢 Verified | R1/R2 strict keys, native exclusivity, no auto-selection on removal/empty groups. |
| `value-field` · [API] L43 | Prop | Explicit native value attribute | ⏭️ Intentionally omitted | No arbitrary object-field mapping. |
| `on-update:value` · [API] L44 | Callback | Root mui:radio-group-change snapshot | 🟢 Verified | R1/R2 one accepted native change; reset/setters remain silent. |

### RadioGroup Props: options inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `options.label?` · [API] L40 | Inline record field | Native label content | 🟢 Verified | Not an accepted options-array API. |
| `options.value` · [API] L40 | Inline record field | Explicit unique native string | 🟢 Verified | R1 strict missing/duplicate/unknown-key errors. |
| `options.disabled?` · [API] L40 | Inline record field | Native disabled | 🟢 Verified | R1/R2 no selection-state/submission conflation. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Radio `default` · [Radio source] | Source slot | Authored label/span content | 🟢 Verified | Preserved original DOM; no renderer. |
| RadioButton `default` · [RadioButton source] | Source slot | Authored native-radio label content | 🟢 Verified | Visible circle and checked/focus CSS fallback. |
| RadioGroup `default` · [Group source] | Source slot | Authored fieldset/legend/member structure | 🟢 Verified | No VNode traversal/child generation. |
| Radio/RadioButton `onUpdateChecked` · [Shared source] | Source alias | Native selected-input change | 🟢 Verified | No duplicate alias event. |
| Radio/RadioButton `checkedValue` · [Shared source] | Deprecated source alias | Native checked only | ⏭️ Intentionally omitted | Deprecated checked-value alias is not exposed. |
| RadioGroup `onUpdateValue` · [Group source] | Source alias | Root native-change snapshot | 🟢 Verified | No separate model callback aliases. |
| Radio `theme`, `themeOverrides`, `builtinThemeOverrides` · [Radio source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No theme-object/provider/CSS-in-JS props. |
| RadioGroup `theme`, `themeOverrides`, `builtinThemeOverrides` · [Group source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | RadioButton has no own source theme props. |
| Radio `RadioSize` · [Size] | Source type | Three CSS sizes | 🟢 Verified | small/medium/large retained. |
| RadioGroup `RadioGroupOption`, optional `value?`, `[key: string]` · [Group source] | Source option type group | Native authored controls only | ⏭️ Intentionally omitted | Source optional value differs from public table; no options records. |
| RadioGroup `RadioGroupInjection`, `radioGroupInjectionKey` · [Shared source] | Source injection group | None | ⏭️ Intentionally omitted | No injected name/value/size/disabled/class-prefix refs or Form model. |
| Radio/RadioButton `UseRadio` · [Shared source] | Source internal result | Native input and CSS state | ⏭️ Intentionally omitted | No inputRef/labelRef/merged refs/focus/handler object or forced checked restoration. |
| RadioGroup `OnUpdateValue`, `OnUpdateValueImpl` · [Types] | Source callback type group | Native event plus string selection | ⏭️ Intentionally omitted | No intersection/union string/number/boolean model protocol. |
| RadioGroup `mapSlot` / generated splitter priority · [Group source] | Source renderer behavior | Native labelled segmented CSS | ⏭️ Intentionally omitted | No VNode button detection, child restrictions or generated state-border splitters. |

<!-- END PINNED API INVENTORY -->
