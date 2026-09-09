# Input

**🟢 Verified for the retained native Input/textarea/InputGroup/InputGroupLabel scope,
with explicit omissions. Not upstream/Vue/Form-validation parity.**

## Baseline and target

[Legacy forms.ts](../../../src/components/forms.ts) remains unchanged. The new optional
[native helper](../../../src/components/input/input.ts) enhances authored fields without
registering Custom Elements, replacing controls or adding proxy submission values.
[Canonical loading/anatomy/mapping/evidence](../../components/input.md) and the separate
[local demo](../../../demo/components/input.html) define the accepted contract.

- **HTML:** real labelled/named input/textarea, explicit affixes/actions/count and group/addon content.
- **JS:** explicit root ownership, silent setters/refresh, clear, click reveal, text count and post-native reset.
- **CSS:** scoped external input/group/status/size/RTL/focus; native field-sizing with honest rows fallback.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** relevant P0 native-control ownership contracts applied here, not global P0 completion.
**Next task:** Checkbox, then Radio/Switch/Select and other native controls before Form enhancements.

1. [x] **Preserve editing state.** Original control/value/default/listeners/labels and selection survive enhancement; no input rewrite during ordinary editing/composition.
2. [x] **Specify live attributes.** Native ownership, silent assignments, explicit refresh, disabled/readonly/fieldset and post-default/cancelled/associated form resets documented and tested.
3. [x] **Separate adornments.** Labelled clear/click-reveal, count, prefix/suffix, group/addon/pair markup and CSS-only textarea sizing retained; renderer/hold/validation omissions explicit.
4. [x] **Validate editing paths.** Targeted tests and Chromium typing/CDP composition/paste/selection/undo/clear/reveal/reset/submission/media/no-JS acceptance recorded; real password-manager/OS-IME parity not claimed.

### Native primitives and fallback

Native controls, not a custom-element form model, own editing and submission. The helper
is optional and fixes its anatomy for one lifetime; disconnect and recreate for replacement
children. Without JS, controls and native form reset/submission still work and enhancement
buttons stay hidden. Unsupported field-sizing falls back to authored rows/manual resize.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/input)
- [API]: pinned public table; each row below retains its original owner/name and source line.
- [Input source], [Group source], [Label source], [public types], [interface source], [theme source]
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/demos/enUS/index.demo-entry.md
[Input source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/src/Input.tsx
[Group source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/src/InputGroup.tsx
[Label source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/src/InputGroupLabel.tsx
[public types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/src/public-types.ts
[interface source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input/src/interface.ts
[theme source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**45 original local rows + 7 original inline declarations + 19 explicit source-only
supplements = 71 tracker rows**. All 52 original owner/property/slot/method/inline identities
remain below. Upstream sources were read for scope, not copied. Every green row means the
**adapted** contract in the canonical document, not source implementation or framework parity.
Acceptance evidence **I1** = [Input tests](../../../tests/input.test.ts);
**I2** = [obtained Chromium/build evidence](../../components/input.md#acceptance-and-boundaries).

### Input Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `allow-input` · [API] L35 | Prop | Native constraints/validity or application-owned beforeinput, not rollback | ⏭️ Intentionally omitted | Vetoing/replacing drafts risks IME/undo/caret; no predicate API. |
| `autofocus` · [API] L36 | Prop | Authored native autofocus | 🟢 Verified | I1/I2 native ownership; timing is browser-owned, not helper refocusing. |
| `autosize` · [API] L37 | Prop | CSS field-sizing with explicit line bounds | 🟢 Verified | I2 growth/shrink; unsupported engines use rows/manual resize. |
| `clearable` · [API] L38 | Prop | Authored clear button/controller clear | 🟢 Verified | I1/I2 focus, readonly/disabled, ordered single notifications. |
| `count-graphemes` · [API] L39 | Prop | No custom constraint/count algorithm | ⏭️ Intentionally omitted | Native UTF-16 maxlength/minlength remain; do not claim grapheme parity. |
| `default-value` · [API] L40 | Prop | Native defaultValue/initial HTML | 🟢 Verified | I1/I2 changed defaults, post-default reset; no null/tuple state. |
| `disabled` · [API] L41 | Prop | Native field disabled and fieldset inheritance | 🟢 Verified | I1/I2; original field attribute is never rewritten. |
| `input-props` · [API] L42 | Prop | Authored control attributes/properties/listeners | 🟢 Verified | I1/I2 identity/ARIA/name/constraints; no object forwarding. |
| `loading` · [API] L43 | Prop | No managed loading indicator/reservation | ⏭️ Intentionally omitted | Author suffix busy text or explicitly compose Spin; not a spinner prop. |
| `maxlength` · [API] L44 | Prop | Native maxlength | 🟢 Verified | I1/I2 UTF-16 units and count; no truncating programmatic assignments. |
| `minlength` · [API] L45 | Prop | Native minlength | 🟢 Verified | I1 preserved constraints; native user-edit validity, not eager schema validation. |
| `pair` · [API] L46 | Prop | Two independently labelled/named native fields | 🟢 Verified | I2 native paired submission; no tuple renderer/state. |
| `passively-activated` · [API] L47 | Prop | Native focus only | ⏭️ Intentionally omitted | No wrapper role/tabstop/activation state. |
| `placeholder` · [API] L48 | Prop | Native placeholder on each field | 🟢 Verified | I1/I2 no implicit label/default translation/tuple placeholder. |
| `readonly` · [API] L49 | Prop | Native readonly; helper actions disabled | 🟢 Verified | I1/I2 submission/selection retained. |
| `render-count` · [API] L50 | Prop | Plain text localization instead of renderer | ⏭️ Intentionally omitted | formatCount returns a string, never VNode/HTML. |
| `round` · [API] L51 | Prop | data-round CSS | 🟢 Verified | I2 authored single-line example; no runtime shape. |
| `rows` · [API] L52 | Prop | Native textarea rows | 🟢 Verified | I1/I2; field-sizing overrides rows only in supported opt-in mode. |
| `separator` · [API] L53 | Prop | Authored separator text | 🟢 Verified | I2 pair/group example; no prop-vs-slot precedence algorithm. |
| `show-count` · [API] L54 | Prop | Optional text-only span[data-input-count] | 🟢 Verified | I1/I2 count refresh/reset; not an automatic live region. |
| `show-password-on` · [API] L55 | Prop | Click/keyboard toggle with pressed state | 🟢 Verified | I1/I2 masking/selection; mousedown/hold explicitly omitted. |
| `size` · [API] L56 | Prop | Explicit tiny/small/medium/large CSS | 🟢 Verified | I2 variants/wrapping; no inherited Form size. |
| `status` · [API] L57 | Prop | success/warning/error border CSS | 🟢 Verified | I2; not automatic aria-invalid, announcements or validity. |
| `type` · [API] L58 | Prop | Authored input/textarea with helper type constraints | 🟢 Verified | I1 rejects nontext helper types; I2 password/textarea. |
| `value` · [API] L59 | Prop | Original native current value; silent setValue/refresh | 🟢 Verified | I1/I2; defaults remain independent, no model/tuple binding. |
| `on-blur` · [API] L60 | Callback | Native blur listener | 🟢 Verified | I1/I2 native focus departure; no duplicate custom blur. |
| `on-change` · [API] L61 | Callback | Native change listener | 🟢 Verified | I1/I2 user edit commit and one documented clear change. |
| `on-clear` · [API] L62 | Callback | mui:input-clear detail.previous | 🟢 Verified | I1/I2 after input/change, successful clears only. |
| `on-focus` · [API] L63 | Callback | Native focus listener | 🟢 Verified | I1/I2; wrapper never receives an extra tabstop. |
| `on-input` · [API] L64 | Callback | Native input listener, read control.value | 🟢 Verified | I1/I2 no per-keystroke rewrite or duplicate event. |
| `on-update:value` · [API] L65 | Callback | Observe native input, not a separate binding event | 🟢 Verified | I1/I2 silent setters; no reactive model protocol. |

### Input Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `clear-icon` · [API] L71 | Slot | Authored named clear button children | 🟢 Verified | I1/I2 original children/listeners remain. |
| `count` · [API] L72 | Slot | Text-only span, plain-string formatter | 🟢 Verified | I1/I2 safe textContent, no renderer. |
| `password-invisible-icon` · [API] L73 | Slot | Authored .mui-input__password-invisible child | 🟢 Verified | CSS pressed-state selector; retain stable button name. |
| `password-visible-icon` · [API] L74 | Slot | Authored .mui-input__password-visible child | 🟢 Verified | CSS pressed-state selector; no icon package. |
| `prefix` · [API] L75 | Slot | Authored .mui-input__affix before field | 🟢 Verified | I2; does not substitute for a label. |
| `separator` · [API] L76 | Slot | Authored pair separator | 🟢 Verified | I2 independent field names/labels. |
| `suffix` · [API] L77 | Slot | Authored suffix/independent actions | 🟢 Verified | I1/I2 no interactive decoration inside labels. |

### InputGroup Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default` · [API] L83 | Slot | Authored .mui-input-group children | 🟢 Verified | I2 flex wrapping/RTL/pair submission; no role/tuple renderer. |

### InputGroupLabel Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default` · [API] L89 | Slot | Authored .mui-input-group-label content | 🟢 Verified | I2; only an actual label[for] or explicit association labels a field. |

### Input Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `blur` · [API] L95 | Method | Native control.blur() | 🟢 Verified | I1/I2 focus lifecycle; not a wrapper ref. |
| `clear` · [API] L96 | Method | controller.clear() | 🟢 Verified | I1/I2 documented no-op/editability/events. |
| `focus` · [API] L97 | Method | Native control.focus() | 🟢 Verified | I1/I2 selection/focus recovery. |
| `scrollTo` · [API] L98 | Method | Native control.scrollTo(options) | 🟢 Verified | Native scroll behavior; no scrollbar wrapper. |
| `select` · [API] L99 | Method | Native control.select() | 🟢 Verified | I1/I2 selection remains on original field. |

### Input Props: autosize inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `autosize.minRows?` · [API] L37 | Inline record field | --mui-input-min-rows CSS token | 🟢 Verified | I2 minimum height; positive author value, no JS row parser. |
| `autosize.maxRows?` · [API] L37 | Inline record field | --mui-input-max-rows CSS token | 🟢 Verified | I2 bounded growth/scroll; max must be at least min. |

### Input Props: render-count inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `render-count.value` · [API] L50 | Inline record field | No renderer context | ⏭️ Intentionally omitted | Plain-string formatCount is not renderer parity. |

### Input Slots: count inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `count.value` · [API] L72 | Inline record field | formatCount receives the native string value | 🟢 Verified | I1 safe localized text; native constraints unchanged. |

### Input Methods: scrollTo inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `scrollTo.left?` · [API] L98 | Inline record field | Native ScrollToOptions.left | 🟢 Verified | Browser-owned scrolling, no coordinate proxy. |
| `scrollTo.top?` · [API] L98 | Inline record field | Native ScrollToOptions.top | 🟢 Verified | Browser-owned textarea scrolling. |
| `scrollTo.behavior?` · [API] L98 | Inline record field | Native ScrollToOptions.behavior | 🟢 Verified | Native auto/smooth semantics/support; not a custom animation. |

### Explicit source-only supplements (not additions to the official API table)

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Input `bordered` · [Input source] | Source prop | data-borderless CSS | 🟢 Verified | External border/focus styling, not a provider default. |
| Input `resizable` · [Input source] | Source prop | Native vertical resize / .mui-input__fixed | 🟢 Verified | CSS only, no resize observer/mirror. |
| Input `stateful` · [Input source] | Source prop | Native editing state only | ⏭️ Intentionally omitted | No framework controlled/uncontrolled activation mode. |
| Input `onMousedown` · [Input source] | Source callback | Native mousedown listener | 🟢 Verified | Author listeners preserved; not hold reveal. |
| Input `onKeydown` · [Input source] | Source callback | Native keydown listener | 🟢 Verified | Native keyboard editing remains. |
| Input `onKeyup` · [Input source] | Source callback | Native keyup listener | 🟢 Verified | No framework callback-array dispatcher. |
| Input `onClick` · [Input source] | Source callback | Native click listener | 🟢 Verified | I1 cancellation; no wrapper activation model. |
| Input `onUpdateValue` · [Input source] | Source alias | Native input observation | 🟢 Verified | No duplicate alias event/two-way binding. |
| Input `showPasswordToggle` · [Input source] | Deprecated source prop | Use explicit reveal button | ⏭️ Intentionally omitted | Deprecated boolean alias is not exposed. |
| Input `theme`, `themeOverrides`, `builtinThemeOverrides` · [Input source], [theme source] | Source theme group | External CSS tokens instead | ⏭️ Intentionally omitted | No theme-object/provider/CSS-in-JS translation. |
| Input `textDecoration`, `attrSize`, `onInputBlur`, `onInputFocus`, `onDeactivate`, `onActivate`, `onWrapperFocus`, `onWrapperBlur`, `internalDeactivateOnEnter`, `internalForceFocus`, `internalLoadingBeforeSuffix` · [Input source] | Private source group | Native attributes/listeners and author CSS only | ⏭️ Intentionally omitted | No private wrapper/Form integration hooks. |
| InputGroupLabel `size` · [Label source] | Source prop | Explicit data-size CSS | 🟢 Verified | No Form-inherited size. |
| InputGroupLabel `bordered` · [Label source] | Source prop | data-borderless CSS | 🟢 Verified | Independent label/addon presentation. |
| InputGroupLabel `theme`, `themeOverrides`, `builtinThemeOverrides` · [Label source], [theme source] | Source theme group | External CSS tokens instead | ⏭️ Intentionally omitted | No provider/object props. |
| Input `InputSize` · [public types] | Source type | Four authored CSS sizes | 🟢 Verified | tiny/small/medium/large retained. |
| Input `InputInst` · [public types] | Source type | Explicit controller plus original native control | 🟢 Verified | Native methods, not an UnwrapRef facade. |
| Input `InputWrappedRef` · [interface source] | Source type | controller.control/native methods | 🟢 Verified | wrapperElRef/textareaElRef/inputElRef/isCompositing and activate/deactivate ref API omitted. |
| Input `OnUpdateValue`, `OnUpdateValueImpl` · [interface source] | Source callback type group | Native Event + control.value | ⏭️ Intentionally omitted | No tuple/intersection value type or source 0/1/clear metadata contract. |
| Input `inputInjectionKey` · [interface source] | Source injection | None | ⏭️ Intentionally omitted | No injected count/value/maxlength/class-prefix refs. |

<!-- END PINNED API INVENTORY -->
