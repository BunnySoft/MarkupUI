# Auto Complete

**Plan: 🟢 Verified retained native input/datalist scope; rich P5 suggestions omitted.**

[Canonical anatomy/API/ownership/mappings and acceptance](../../components/auto-complete.md).
Native input/datalist remains the baseline, with an optional bounded AbortSignal loader,
reversible original options and explicit query-result/error events. Clear/value editing
reuses Input; native Form fields/constraints/defaults/submission remain untouched.
No fake combobox, HTTP client, selector-based name lookup or native selection inference.

## Migration steps

**Delivery phase:** P4 — native entry; P5 rich suggestion contracts explicitly omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Input/Form contracts.
**Next task:** Input OTP; P4 as a whole remains In progress.

1. [x] **Reconcile native options.** Original field/list/option/template identity, free text and live authored fallback preserved.
2. [x] **Define suggestion state.** Native current/default values/events, IME and bounded query snapshots verified.
3. [x] **Scope the optional combobox.** Small loader retained; custom popup/group/render/selection inference explicitly omitted.
4. [x] **Validate entry paths.** Targeted tests, review fixes, native forms/reset/clear/errors/no-JS and Chromium evidence in canonical record.

### Native primitives and fallback

Authored input plus datalist is usable with no helper. Shared static lists are native;
each managed writer requires exclusive input/list ownership. Unsupported popup UI falls
back to text entry, not an overlay polyfill. There is no hidden model value or fake
loading/error option. Native labels/autocomplete/name/form/reset/required remain intact.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/auto-complete)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md)
- [Pinned source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **46 original identities** remain: **38 local table rows + eight inline declarations**,
no inherited rows. **Ten explicit source supplements** add named implementation/type/
alias surfaces, giving **56 tracker rows**. Verified means an **ADAPTED** native target,
not framework signature, popup or matching parity. Canonical evidence applies to retained
rows; omissions receive no implementation credit.

AutoComplete.tsx, interface.ts, public-types.ts and index exports were reviewed. The source
uses a tree/menu/follower/provider and pending-option Enter interception; those are not
portably equivalent to a native datalist. Native value/label selection differences and
documented-but-uninjected default.theme are explicitly identified below.

### AutoComplete Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`append`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L25) | Prop | No append-on-selection engine. | ⏭️ Intentionally omitted | Native selection is not inferred from matching text. |
| [`blur-after-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L26) | Prop | Never blur on a value match. | ⏭️ Intentionally omitted | No reliable native selection event. |
| [`clear-after-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L27) | Prop | No automatic clear after a string match. | ⏭️ Intentionally omitted | Explicit Input clear remains available. |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L28) | Prop | Compose existing Input clear action. | 🟢 Verified | Native input/change, IME/focus/default behavior reused. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L29) | Prop | Native value attribute/defaultValue. | 🟢 Verified | Actual native reset, never overwritten by suggestions. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L30) | Prop | Actual input/fieldset disabled. | 🟢 Verified | Query eligibility/FormData remain native. |
| [`get-show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L31) | Prop | No native popup visibility callback/control. | ⏭️ Intentionally omitted | minLength gates loading, not popup visibility. |
| [`input-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L32) | Prop | Author attributes on the original input. | 🟢 Verified | No unrestricted prop-forwarder. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L33) | Prop | Optional nonlive status and actual loading state. | 🟢 Verified | Never selectable loading data or fake expanded state. |
| [`menu-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L34) | Prop | No custom menu node. | ⏭️ Intentionally omitted | Browser owns suggestion popup. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L35) | Prop | Authored options or strict bounded string/value-label-disabled results. | 🟢 Verified | Atomic native option updates; groups omitted. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L36) | Prop | Actual authored input placeholder. | 🟢 Verified | Not a label or generated localization string. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L37) | Prop | No popup positioning API. | ⏭️ Intentionally omitted | Native placement is browser-owned. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L38) | Prop | Plain native option labels instead. | ⏭️ Intentionally omitted | No VNode label renderer. |
| [`render-option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L39) | Prop | No custom option rendering. | ⏭️ Intentionally omitted | Native option properties only. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L40) | Prop | No popup scrollbar component. | ⏭️ Intentionally omitted | No mandatory Scrollbar dependency. |
| [`show-empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L41) | Prop | Empty results have optional separate status, not an empty popup. | ⏭️ Intentionally omitted | No selectable placeholder data. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L42) | Prop | External field CSS small/medium/large. | 🟢 Verified | No popup font/geometry promise. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L43) | Prop | Native/Form validation presentation on original field/item. | 🟢 Verified | Loading state is separate, no required membership check. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L44) | Prop | No portal target or teleported popup. | ⏭️ Intentionally omitted | Native datalist association only. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L45) | Prop | Original native string input.value. | 🟢 Verified | Free text, no hidden selected-option model. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L46) | Callback | Original native blur event. | 🟢 Verified | No duplicate wrapper callback or forced blur. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L47) | Callback | Original native focus event. | 🟢 Verified | No automatic query/popup guarantee on focus. |
| [`on-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L48) | Callback | No fabricated native selection notification. | ⏭️ Intentionally omitted | Same text can result from typing or choosing a suggestion. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L49) | Callback | Native input/change with input.value. | 🟢 Verified | ADAPTED timing/payload; empty string, not hidden null model. |

### AutoCompleteOption Properties

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L55) | Record field | Native option.disabled or explicit boolean. | 🟢 Verified | Browser may omit disabled suggestions; no styled disabled-row claim. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L56) | Record field | Native option.label display metadata. | 🟢 Verified | ADAPTED: native selection offers value, not source select-label replacement. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L57) | Record field | Unique bounded nonempty string option.value. | 🟢 Verified | No implicit numeric/object conversion. |

### AutoCompleteGroupOption Properties

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`children`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L63) | Record field | No recursive grouped suggestions. | ⏭️ Intentionally omitted | Flat native datalist only. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L64) | Record field | No native group-label renderer. | ⏭️ Intentionally omitted | Option labels are not group headings. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L65) | Record field | No group identity/model. | ⏭️ Intentionally omitted | Numeric group keys not mapped to hidden values. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L66) | Record field | No group discriminant. | ⏭️ Intentionally omitted | Strict helper rejects nested records. |

### AutoComplete Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Slot | Original authored native input. | 🟢 Verified | No VNode substitution or injected event handlers. |
| [`empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L73) | Slot | Separate nonlive status alternative. | ⏭️ Intentionally omitted | No empty-menu slot/custom popup. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L74) | Slot | Authored field affix DOM. | 🟢 Verified | Decorative content aria-hidden when appropriate. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L75) | Slot | Original affix/count/Input action markup. | 🟢 Verified | No replacement of field or Form tokens. |

### AutoComplete Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L81) | Method | Native input.blur(). | 🟢 Verified | Explicit application action, not async completion. |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L82) | Method | Native input.focus(options). | 🟢 Verified | No popup/focus engine or focus stealing. |

### AutoComplete Props: render-option inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`render-option.node`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L39) | Inline record field | No VNode argument. | ⏭️ Intentionally omitted | Native option writes only. |
| [`render-option.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L39) | Inline record field | No render context/group option. | ⏭️ Intentionally omitted | Narrow result data instead. |
| [`render-option.selected`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L39) | Inline record field | No selected render flag. | ⏭️ Intentionally omitted | Native typing/selection indistinguishability. |

### AutoComplete Slots: default inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default.handleInput`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Inline record field | Native input/change listeners on actual field. | 🟢 Verified | ADAPTED, no injected handler function. |
| [`default.handleFocus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Inline record field | Native focus listener. | 🟢 Verified | No automatic popup state. |
| [`default.handleBlur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Inline record field | Native blur listener. | 🟢 Verified | No false after-select blur. |
| [`default.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Inline record field | Actual input.value string. | 🟢 Verified | No slot-provided model. |
| [`default.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md#L72) | Inline record field | External CSS, no theme injection. | ⏭️ Intentionally omitted | Public docs mention theme; reviewed render/interface do not inject it. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`AutoComplete.bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/AutoComplete.tsx) | Source prop | External field border CSS. | 🟢 Verified | No popup border control. |
| [`AutoComplete.zIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/AutoComplete.tsx) | Source prop | No native popup stacking API. | ⏭️ Intentionally omitted | No follower/portal. |
| [`onUpdateValue / deprecated onInput`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/AutoComplete.tsx) | Source callback alias group | Native input/change alternatives. | ⏭️ Intentionally omitted | No duplicate prop callbacks or callback arrays. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/AutoComplete.tsx) | Source theme group | External native field CSS. | ⏭️ Intentionally omitted | No CSS-in-JS/provider API. |
| [`AutoCompleteProps / autoCompleteProps / NAutoComplete`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/index.ts) | Source public type/export group | Narrow helper options and authored HTML instead. | ⏭️ Intentionally omitted | No framework prop-object/constructor aliases. |
| [`AutoCompleteSlots / AutoCompleteDefaultSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/index.ts) | Source public slot type group | Authored input/affix DOM. | ⏭️ Intentionally omitted | Original slot names adapted above; no VNode/injected-callback types. |
| [`AutoCompleteOption / AutoCompleteOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/interface.ts) | Source type group | Strict AutoCompleteSuggestion/strings alternative. | ⏭️ Intentionally omitted | No SelectBaseOption inheritance or rich/group union compatibility. |
| [`AutoCompleteGroupOption`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/interface.ts) | Source public type | Flat native data only. | ⏭️ Intentionally omitted | No SelectGroupOption inheritance. |
| [`AutoCompleteInst / AutoCompleteSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/index.ts) | Source type group | Original native focus/blur and small/medium/large CSS. | 🟢 Verified | ADAPTED anatomy/vocabulary; declarations in interface/public-types, no TS alias promise. |
| [`OnSelect / OnSelectImpl / OnUpdateValue / OnUpdateImpl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/interface.ts) | Source callback type group | Native events; explicit query-result event is not select. | ⏭️ Intentionally omitted | Source public intersection and implementation signatures differ; not ported. |

<!-- END PINNED API INVENTORY -->
