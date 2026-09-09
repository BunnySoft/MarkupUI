# Dynamic Input

**Plan: 🟢 Verified retained bounded native-row scope; renderer/model contracts omitted.**

[Canonical anatomy, API, hook/error/focus contracts and evidence](../../components/dynamic-input.md).
An explicit helper clones an authored native template, preserves original rows, and moves
actual nodes. Native controls/names/defaults/FormData remain authoritative. No VNode preset
renderer, object-path model, drag framework, hidden Form registration or dependency.

## Migration steps

**Delivery phase:** P4 — native enhanced entry; P5 renderer/model scope explicitly omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Input/Form, DOM templates and explicit ownership.
**Next task:** Dynamic Tags; P4 as a whole remains In progress.

1. [x] **Define row anatomy.** Authored native input/pair templates, labels and hidden no-JS custom actions.
2. [x] **Implement bounded edits.** Stable keys, validated limits, insertion/removal/actual-node reorder and failure cleanup.
3. [x] **Integrate value/validation.** Literal names, native FormData/current defaults and explicit Form/resource refresh.
4. [x] **Test editing focus.** Native moveBefore/fallback caret/focus, action boundaries, callbacks, nested scopes, reset/no-JS and review fixes.

### Native primitives and fallback

HTMLTemplateElement content is imported/cloned without expressions or string HTML.
Existing/server rows remain native and editable without JS; hidden custom actions are not
presented as working. Native reset affects current fields, not a saved row list.
Disconnect keeps current edited rows and disposes only explicitly registered resources.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/dynamic-input)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md)
- [Pinned source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **32 original identities** remain: **23 local table rows + nine inline declarations**,
no inherited rows. **Ten explicit source supplements** give **42 total rows**.
Verified means an **ADAPTED** native target, not framework signature/model parity.
Canonical tests/browser/build evidence applies to retained rows; omissions receive no credit.

DynamicInput.tsx, InputPreset.tsx, PairPreset.tsx, interface.ts and exports were reviewed.
Controlled arrays, object/index key derivation, injected paths/themes and VNode presets
are deliberately not ported. Source create-after-index and callbacks are mapped explicitly,
not represented as an identical operation/signature.

### DynamicInput Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`create-button-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L28) | Prop | Authored labelled hidden type=button and native attributes. | 🟢 Verified | No unrestricted ButtonProps forwarding. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L29) | Prop | Existing authored row set plus native field defaults. | 🟢 Verified | ADAPTED; reset does not recreate a default row array. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L30) | Prop | Native fieldset/buttons/fields. | 🟢 Verified | User actions honor native eligibility; explicit programmatic transactions remain allowed. |
| [`item-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L31) | Prop | Original row classes. | 🟢 Verified | No row recreation. |
| [`item-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L32) | Prop | External row/pair/action CSS. | 🟢 Verified | No inline style-object API. |
| [`key-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L33) | Prop | Immutable data-dynamic-key and stable row descriptors. | 🟢 Verified | ADAPTED DOM identity, not object-path lookup or index renaming. |
| [`min`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L34) | Prop | Validated min count, default 0. | 🟢 Verified | Never allocates implicit minimum rows. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L35) | Prop | Default 20, hard ceiling 100; explicit bounded updates. | 🟢 Verified | ADAPTED finite policy, no source unbounded default. |
| [`preset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L36) | Prop | Authored input/pair row templates instead. | ⏭️ Intentionally omitted | No preset enum renderer. |
| [`show-sort-button`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L37) | Prop | Optional native up/down buttons, hidden until enhancement. | 🟢 Verified | Actual node moves, no drag framework. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L38) | Prop | Native fields/rows/FormData, no unknown[] model. | ⏭️ Intentionally omitted | No controlled array or deep mutation store. |
| [`on-create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L39) | Callback | Detached initialize and attached connect hooks, with explicit cleanup. | 🟢 Verified | ADAPTED sync/void contract; no return-value model overload. |
| [`on-remove`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L40) | Callback | Committed remove event and owned resource cleanup. | 🟢 Verified | Not a before-remove veto callback; committed cleanup errors are explicit. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L41) | Callback | Structural change event plus original native input/change. | 🟢 Verified | No duplicate aggregate value array. |

### DynamicInput Props (Input Preset)

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L47) | Prop | Actual native string fields with literal/repeated names. | 🟢 Verified | FormData filtering/order remains native; no array setter. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L48) | Prop | Authored input placeholder. | 🟢 Verified | No generated locale/provider default. |

### DynamicInput Props (Pair Preset)

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L54) | Prop | Two original native fields per authored row. | 🟢 Verified | ADAPTED pair anatomy, not Array<{key,value}> mutation/serialization. |
| [`key-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L55) | Prop | Native first-field placeholder. | 🟢 Verified | Pair key value is not stable row identity. |
| [`value-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L56) | Prop | Native second-field placeholder. | 🟢 Verified | No injected preset provider. |

### DynamicInput Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Slot | Authored labelled native action buttons. | 🟢 Verified | Fixed action identities, reversible attributes, no renderer callback. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L63) | Slot | HTMLTemplateElement row and existing native DOM. | 🟢 Verified | No expression/VNode engine. |
| [`create-button-default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L64) | Slot | Native add-button text/aria-label. | 🟢 Verified | Usable label and no-JS hidden fallback. |
| [`create-button-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L65) | Slot | Authored decorative noninteractive icon. | 🟢 Verified | No icon dependency; meaningful button name stays native. |

### DynamicInput Props (Pair Preset): value inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`value.key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L54) | Inline record field | First actual pair field. | 🟢 Verified | Not the collection's stable key or a deep path. |
| [`value.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L54) | Inline record field | Second actual pair field. | 🟢 Verified | Native current/default/disabled/reset semantics. |

### DynamicInput Slots: action inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`action.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Inline record field | Read original native row controls explicitly. | ⏭️ Intentionally omitted | No injected unknown model value. |
| [`action.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Inline record field | Current rows/DOM order and structural event index. | 🟢 Verified | No index paths in native names. |
| [`action.create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Inline record field | add(insertionIndex); row add-after action. | 🟢 Verified | Explicit zero-based insertion, not source create-after-index signature. |
| [`action.remove`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Inline record field | remove(stableKey), respecting min. | 🟢 Verified | Original node removed; no silent data resurrection. |
| [`action.move`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L62) | Inline record field | move(stableKey, absoluteIndex), native up/down actions. | 🟢 Verified | Native moveBefore/focus-safe fallback with documented state limits. |

### DynamicInput Slots: default inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L63) | Inline record field | Original native controls, not slot model injection. | ⏭️ Intentionally omitted | No reactive value renderer. |
| [`default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md#L63) | Inline record field | Native row order/metadata; creation context index is call-time only. | 🟢 Verified | No live interpolation or relabelling after moves. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`onUpdateValue / deprecated onInput`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/DynamicInput.tsx) | Source callback alias group | Native events and explicit structural notification instead. | ⏭️ Intentionally omitted | No callback-array/controlled model ABI. |
| [`deprecated onClear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/DynamicInput.tsx) | Source callback | Explicit bounded remove operations. | ⏭️ Intentionally omitted | No clear-list shortcut or implicit row reset. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/DynamicInput.tsx) | Source theme group | External native CSS. | ⏭️ Intentionally omitted | No CSS-in-JS/provider object. |
| [`DynamicInputProps / dynamicInputProps / NDynamicInput`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/index.ts) | Source public type/export group | Narrow DynamicInputOptions/native anatomy. | ⏭️ Intentionally omitted | No framework constructor/prop aliases. |
| [`DynamicInputSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/DynamicInput.tsx) | Source public slot type | Authored native template/buttons. | ⏭️ Intentionally omitted | Original named slots adapted above, no VNode[] type compatibility. |
| [`DynamicInputDefaultSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/interface.ts) | Source public record type | Actual row element plus stable key/call-time context. | ⏭️ Intentionally omitted | No any-value/index slot injection ABI. |
| [`DynamicInputActionSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/interface.ts) | Source public record type | Explicit native buttons/controller operations. | ⏭️ Intentionally omitted | Different stable-key and insertion/absolute-move signatures. |
| [`OnUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/interface.ts) | Source generic callback type | Native fields/FormData instead of generic T[] updates. | ⏭️ Intentionally omitted | No model emitter. |
| [`DynamicInputInjection / dynamicInputInjectionKey`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/interface.ts) | Source internal provider group | Explicit root/lifecycle ownership only. | ⏭️ Intentionally omitted | No injected placeholder/theme/provider graph. |
| [`InputPreset.path / PairPreset.path`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src) | Source private preset prop group | Literal native names and explicit Form mappings. | ⏭️ Intentionally omitted | No deep validation path or preset FormItem renderer. |

<!-- END PINNED API INVENTORY -->
