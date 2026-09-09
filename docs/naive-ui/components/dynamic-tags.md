# Dynamic Tags

**Plan: 🟢 Verified retained native string-tag/editor scope.**

[Canonical anatomy, value/intent/ownership contracts and evidence](../../components/dynamic-tags.md).
Dynamic Input is reused for bounded row/template/removal/focus/lifetime behavior. Tags are
visible readonly named fields, with one unnamed native draft editor. No Tag/Input runtime,
VNode/object renderer, hidden proxy value, controlled array store or implicit blur commit.

## Migration steps

**Delivery phase:** P4 — native enhanced entry; P5 renderer/object-model contracts omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted native Dynamic Input/Form contracts.
**Next task:** Mention; overall P4 remains In progress.

1. [x] **Compose native editing.** Original readonly values/list/editor/actions and inherited row ownership.
2. [x] **Specify insertion policy.** Whole strings, exact duplicate policy, bounded results and IME-safe explicit commit.
3. [x] **Define removal/defaults.** Stable-key removal, native current-field reset and draft-safe focus/teardown.
4. [x] **Exercise customized tags.** Authored templates/native fields, callback errors, no-JS and browser evidence; object/render overloads omitted.

### Native primitives and fallback

Native readonly named inputs own committed values and FormData. The editor is unnamed;
unsaved text is not a duplicate submitted value. Existing tags remain readable/submittable
without JS, while editor/action enhancements are hidden. No provider, hidden Tag selection
state or keyboard layer outside the actual draft editor.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/dynamic-tags)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md)
- [Pinned source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **32 original identities** remain: **19 local table rows + 13 declarations/inline fields**,
no inherited rows. **Ten explicit source supplements** give **42 total rows**.
Verified means an **ADAPTED** native target, not framework object/signature parity.
Canonical evidence applies to retained rows; omissions receive no implementation credit.

DynamicTags.tsx, interface.ts, public-types.ts, index exports and the Tag common-props
declaration were reviewed. Source object unions, indexed rendering, trigger/input swapping,
blur auto-commit and NTag/NInput/NSpace providers are not accidentally imported.
Native labels for controls are distinct from the omitted DynamicTagsOption.label model field.

### DynamicTags Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L23) | Prop | Optional authored native sibling remove button. | 🟢 Verified | Stable-key removal, not a selectable/checkable Tag runtime. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Prop | External background/border/text CSS variables. | 🟢 Verified | No JS color object or CSS-in-JS. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L25) | Prop | Authored initial native tags and field defaultValue. | 🟢 Verified | Reset affects current fields, not an initial array. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L26) | Prop | Actual native fieldset/controls. | 🟢 Verified | Native FormData filtering; no hidden enabled proxy value. |
| [`input-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L27) | Prop | Authored unnamed native text editor attributes. | 🟢 Verified | ADAPTED, no InputProps forwarding/runtime. |
| [`input-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L28) | Prop | Original editor classes. | 🟢 Verified | No editor replacement. |
| [`input-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L29) | Prop | External editor CSS. | 🟢 Verified | No inline style-object forwarding. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L30) | Prop | Reused bounded row cap, default 20, maximum 100. | 🟢 Verified | Capacity rejection preserves drafts. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L31) | Prop | data-round external chip border-radius. | 🟢 Verified | Presentation only. |
| [`render-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Prop | Authored native template alternative. | ⏭️ Intentionally omitted | No VNode renderer or object-label display layer. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L33) | Prop | Small/medium/large external CSS. | 🟢 Verified | No provider sizing. |
| [`tag-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L34) | Prop | Authored row/readonly field classes. | 🟢 Verified | Original tag controls retained. |
| [`tag-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L35) | Prop | External row/field CSS. | 🟢 Verified | No hidden field plus mirrored tag text. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L36) | Prop | data-type default/primary/info/success/warning/error styling. | 🟢 Verified | No validity/checkable state implied by color. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L37) | Prop | Native readonly field values; fresh values getter. | 🟢 Verified | ADAPTED string ownership, no controlled array setter/store. |
| [`on-create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Callback | Optional synchronous string-to-string create callback. | 🟢 Verified | Explicit derivation only; object branch/async results rejected. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L39) | Callback | Committed mui:dynamic-tags-change string snapshot. | 🟢 Verified | Native setters/refresh/reset remain silent; no model-provider emitter. |

### DynamicTags Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`input`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Slot | Persistent authored native editor/label/entry region. | 🟢 Verified | No generated Input/VNode swap or arbitrary input runtime. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Slot | Authored native Add button and label/focus actions. | 🟢 Verified | ADAPTED persistent editor; no trigger-to-renderer activation graph. |

### DynamicTagsOption

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L45) | Record field | No separate object display label. | ⏭️ Intentionally omitted | Native field displays its canonical string value. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L46) | Record field | No object option branch/hidden serialized value. | ⏭️ Intentionally omitted | Strings only; native control value remains authoritative. |

### DynamicTags Props: color inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`color.color?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | --mui-tags-background external CSS. | 🟢 Verified | No color-object parser. |
| [`color.borderColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | --mui-tags-border external CSS. | 🟢 Verified | Native focus outline remains visible. |
| [`color.textColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | --mui-tags-text external CSS. | 🟢 Verified | No selected/checked color semantics. |

### DynamicTags Props: render-tag inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`render-tag.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Inline record field | No VNode label context. | ⏭️ Intentionally omitted | Author static native anatomy instead. |
| [`render-tag.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Inline record field | No renderer model value. | ⏭️ Intentionally omitted | Native field value is not an injected object renderer. |

### DynamicTags Props: on-create inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`on-create.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Inline record field | Object-return label branch excluded. | ⏭️ Intentionally omitted | String callback result only. |
| [`on-create.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Inline record field | Object-return value branch excluded. | ⏭️ Intentionally omitted | No implicit object conversion. |

### DynamicTags Slots: input inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`input.submit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Inline record field | commit() of current native draft. | 🟢 Verified | ADAPTED command, no any-value slot callback or form submission. |
| [`input.deactivate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Inline record field | Blur/Escape preserve draft, do not auto-commit/hide. | ⏭️ Intentionally omitted | Deliberate safety reduction from source handleInputBlur. |

### DynamicTags Slots: trigger inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`trigger.activate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Inline record field | Native label/input.focus and authored Add intent. | 🟢 Verified | Persistent editor, no source show-input renderer method. |
| [`trigger.disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Inline record field | Native Add disabled at max and native fieldset inheritance. | 🟢 Verified | Editor remains available at capacity; rejected draft is retained. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`DynamicTags.defaultValue / value (source object union)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/DynamicTags.tsx) | Source shape discrepancy | Preserve wider source string/object union identity explicitly. | ⏭️ Intentionally omitted | Public string rows adapted above; mixed object arrays not accepted. |
| [`onUpdateValue / deprecated onChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/DynamicTags.tsx) | Source callback alias group | Explicit Tags change event instead. | ⏭️ Intentionally omitted | No callback-array or duplicate model update ABI. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/DynamicTags.tsx) | Source theme group | External native CSS. | ⏭️ Intentionally omitted | No Tag/Input/Space provider runtime. |
| [`DynamicTagsProps / dynamicTagsProps / NDynamicTags`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/index.ts) | Source public type/export group | Narrow DynamicTagsOptions/native anatomy. | ⏭️ Intentionally omitted | No framework constructor/prop aliases. |
| [`DynamicTagsSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/DynamicTags.tsx) | Source public slot type | Authored editor/trigger/tag template instead. | ⏭️ Intentionally omitted | No VNode slot-type compatibility. |
| [`DynamicTagsOption`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/interface.ts) | Source public record type | Canonical native strings only. | ⏭️ Intentionally omitted | No separated label/value record model. |
| [`DynamicTagsInputSlotProps / DynamicTagsTriggerSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/interface.ts) | Source public record type group | Native editor/current-draft command and button attributes. | ⏭️ Intentionally omitted | No injected any-value/deactivate/activation object ABI. |
| [`OnCreate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/interface.ts) | Source callback type | Strict synchronous string derivation alternative. | ⏭️ Intentionally omitted | Source object/string union not aliased. |
| [`OnUpdateValue / OnUpdateValueImpl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/interface.ts) | Source callback type group | Committed native string snapshots. | ⏭️ Intentionally omitted | No mixed model-array callback signatures. |
| [`DynamicTagsSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/public-types.ts) | Source public type | Small/medium/large CSS vocabulary. | 🟢 Verified | ADAPTED native styles, no TypeScript alias claim. |

<!-- END PINNED API INVENTORY -->
