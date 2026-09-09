# Select

**🟢 Verified retained P4 native scope, with explicit P5/renderer omissions. Not NSelect parity.**

The authored native select/options/optgroups remain the editing/submission owner.
The [optional helper](../../../src/components/select/select.ts) provides strict string
mode operations, clear and external literal list filtering without detaching selected options.
[Legacy forms.ts](../../../src/components/forms.ts) is unchanged.
[Canonical contract/evidence](../../components/select.md) · [Native demo](../../../demo/components/select.html).

## Migration steps

**Delivery phase:** P4 — native selection; P5 rich collections remain independent.
**Task state:** 🟢 Verified retained scope. **Prerequisites:** relevant native-control
ownership/reset rules; no mandatory P3 popup runtime. **Next:** Input Number, then Slider/Rate/native controls before Form.

1. [x] **Repair native ownership.** Original labelled select, option/optgroup nodes, listeners, names and native form states are retained.
2. [x] **Resolve native value modes.** String/null versus string[] modes, empty placeholder/no-selection, defaultSelected/reset, silent writes and validated rebind are explicit.
3. [x] **Split rich selection.** External literal list filtering is an adaptation; remote/tag/VNode/virtual/pending popup surfaces have named P5 omissions, not a shipped rich module.
4. [x] **Test selection continuity.** Native keys/typeahead, filtering/composition, preserved selection/FormData, clear/focus, reset/disabled groups, dynamic mode/options and browser fallback tested; no custom pending-menu engine claimed.

### Native primitives and fallback

No hidden select/proxy combobox, virtual list, option renderer or duplicate form value.
The native control works without JS; clear/filter enhancement regions stay hidden.
Option visibility filtering is limited to native lists and retains selected nonmatches.
The browser owns dropdown placement, picker lifecycle, keyboard, popup scroll and painting.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/select) · [API] ·
[Select source] · [Types] · [Size]. Snapshot: Naive UI **2.45.3**,
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**68 original local rows + 11 original inline declarations + 19 explicit source
supplements = 98 tracker rows: 35 Verified adapted targets + 63 Intentionally omitted.** All 79 original owner/property/record/slot/method/inline
identities remain. **Zero inherited rows:** PopoverProps and ScrollbarProps are referenced
composition types, not inheritance; both integration surfaces are wholly omitted here.
Existing [Popover](popover.md)/[Scrollbar](scrollbar.md) scopes are unchanged.
Evidence **E1** = [tests](../../../tests/select.test.ts); **E2** =
[obtained acceptance](../../components/select.md#acceptance). Green means a native adaptation only.

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/select/demos/enUS/index.demo-entry.md
[Select source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/select/src/Select.tsx
[Types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/select/src/interface.ts
[Size]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/select/src/public-types.ts

### Select Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `consistent-menu-width` · [API] L40 | Prop | Platform-owned native picker | ⏭️ Intentionally omitted | No custom menu geometry/virtual coupling. |
| `children-field` · [API] L41 | Prop | Authored optgroup children | ⏭️ Intentionally omitted | No object-field lookup. |
| `clearable` · [API] L42 | Prop | Authored clear button/controller clear | 🟢 Verified | E1/E2 focus, guards, native notification sequence. |
| `clear-created-options-on-clear` · [API] L43 | Prop | No created options | ⏭️ Intentionally omitted | P5 tag creation excluded; clear never deletes options. |
| `clear-filter-after-select` · [API] L44 | Prop | Query stays author/native-input owned | ⏭️ Intentionally omitted | No automatic query rewrite. |
| `default-value` · [API] L45 | Prop | Native option.defaultSelected/selected HTML | 🟢 Verified | E1/E2; select has no defaultValue property. |
| `disabled` · [API] L46 | Prop | Native disabled/fieldset state | 🟢 Verified | E1/E2 submitted values and clear availability. |
| `ellipsis-tag-popover-props` · [API] L47 | Prop | No tag-preview overlay | ⏭️ Intentionally omitted | No PopoverProps inheritance/import. |
| `fallback-option` · [API] L48 | Prop | Unknown setter keys throw | ⏭️ Intentionally omitted | No fallback option factory. |
| `filterable` · [API] L49 | Prop | External literal native-list filter | 🟢 Verified | E1/E2; not an in-popup rich combobox. |
| `filter` · [API] L50 | Prop | Fixed literal option/group text matcher | ⏭️ Intentionally omitted | Arbitrary predicate callback omitted. |
| `ignore-composition` · [API] L51 | Prop | Defer external filtering during composition | 🟢 Verified | E1/E2 native drafts retained; no flag overriding this policy. |
| `input-props` · [API] L52 | Prop | Authored external native filter attributes | 🟢 Verified | No prop forwarding or trigger-input renderer. |
| `keyboard` · [API] L53 | Prop | Native keyboard/typeahead always retained | 🟢 Verified | E2; keyboard=false override omitted. |
| `label-field` · [API] L54 | Prop | Native option/group labels | ⏭️ Intentionally omitted | No field mapping. |
| `loading` · [API] L55 | Prop | Application-owned external status/disabled | ⏭️ Intentionally omitted | No remote/spinner orchestration. |
| `max-tag-count` · [API] L56 | Prop | Native multiple list | ⏭️ Intentionally omitted | No chips/responsive ellipsis renderer. |
| `menu-props` · [API] L57 | Prop | Platform menu, not authored DOM | ⏭️ Intentionally omitted | No popup prop forwarding. |
| `menu-size` · [API] L58 | Prop | Platform-owned picker presentation | ⏭️ Intentionally omitted | Control size is separate. |
| `multiple` · [API] L59 | Prop | Native multiple mode and selected options | 🟢 Verified | E1/E2; disconnect/rebind for mode changes. |
| `node-props` · [API] L60 | Prop | Authored native option attrs | ⏭️ Intentionally omitted | No callback attr generator. |
| `options` · [API] L61 | Prop | Authored option/optgroup nodes | 🟢 Verified | E1/E2 identity and dynamic refresh; no data-array renderer. |
| `placeholder` · [API] L62 | Prop | Marked first empty-value dropdown option | 🟢 Verified | E1/E2 empty string versus null and required/native submission. |
| `placement` · [API] L63 | Prop | Native picker placement | ⏭️ Intentionally omitted | No anchored popup engine. |
| `remote` · [API] L64 | Prop | Application may edit native options | ⏭️ Intentionally omitted | P5 fetch/async races not implemented. |
| `render-label` · [API] L65 | Prop | Native string labels | ⏭️ Intentionally omitted | No VNode renderer. |
| `render-option` · [API] L66 | Prop | Native options | ⏭️ Intentionally omitted | No custom menu-row renderer. |
| `render-tag` · [API] L67 | Prop | No selected chips | ⏭️ Intentionally omitted | P5 tag renderer excluded. |
| `reset-menu-on-options-change` · [API] L68 | Prop | Native browser view behavior | ⏭️ Intentionally omitted | No pending/scroll menu state. |
| `scrollbar-props` · [API] L69 | Prop | Native list/picker scrolling | ⏭️ Intentionally omitted | No ScrollbarProps inheritance/import. |
| `show` · [API] L70 | Prop | No controlled popup state | ⏭️ Intentionally omitted | Native showPicker is separate, with no hidePicker API. |
| `show-arrow` · [API] L71 | Prop | Native arrow retained | ⏭️ Intentionally omitted | No custom arrow visibility API. |
| `show-checkmark` · [API] L72 | Prop | Native platform selection UI | ⏭️ Intentionally omitted | No menu checkmark rendering flag. |
| `show-on-focus` · [API] L73 | Prop | Native focus behavior | ⏭️ Intentionally omitted | No automatic picker-opening handler. |
| `size` · [API] L74 | Prop | tiny/small/medium/large control CSS | 🟢 Verified | E2 native control sizing/RTL/wrapping. |
| `status` · [API] L75 | Prop | success/warning/error border CSS | 🟢 Verified | No automatic aria-invalid/live/schema validation. |
| `tag` · [API] L76 | Prop | No option creation | ⏭️ Intentionally omitted | P5 tag editing excluded. |
| `to` · [API] L77 | Prop | Native popup stays platform-owned | ⏭️ Intentionally omitted | No portal/detached container. |
| `value` · [API] L78 | Prop | Strict native strings: scalar/null or string[] | 🟢 Verified | E1/E2 silent setters, disabled selections and actual native FormData. |
| `value-field` · [API] L79 | Prop | Explicit native value strings | ⏭️ Intentionally omitted | No option-model field mapping. |
| `virtual-scroll` · [API] L80 | Prop | Native options stay in DOM | ⏭️ Intentionally omitted | P5 virtualization excluded. |
| `on-blur` · [API] L81 | Callback | Native select blur | 🟢 Verified | No duplicate custom blur. |
| `on-clear` · [API] L82 | Callback | mui:select-clear after input/change | 🟢 Verified | E1/E2 previous value snapshot; no-op clear silent. |
| `on-create` · [API] L83 | Callback | No created options | ⏭️ Intentionally omitted | Unknown values never invoke a factory. |
| `on-focus` · [API] L84 | Callback | Native select focus | 🟢 Verified | E1/E2 focused clear recovery. |
| `on-scroll` · [API] L85 | Callback | No custom popup scroll channel | ⏭️ Intentionally omitted | Native element events may be observed by applications, not menu parity. |
| `on-search` · [API] L86 | Callback | Native external query input events | 🟢 Verified | E1/E2 read input.value; no remote request/extra event. |
| `on-update:show` · [API] L87 | Callback | No native popup open-state mirror | ⏭️ Intentionally omitted | No synthetic show/hide callbacks. |
| `on-update:value` · [API] L88 | Callback | Native input/change, helper value/selectedOptions | 🟢 Verified | E1/E2 no object-model callback or setter event. |

### SelectOption Properties

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `class` · [API] L94 | Record field | Authored native option class | 🟢 Verified | DOM preserved; native popup styling varies by platform. |
| `disabled` · [API] L95 | Record field | Native option disabled | 🟢 Verified | E1/E2 selection versus successful submission distinction. |
| `label` · [API] L96 | Record field | Native text/label string | 🟢 Verified | Function-valued label rendering omitted. |
| `render` · [API] L97 | Record field | No VNode option renderer | ⏭️ Intentionally omitted | P5 rich option content excluded. |
| `style` · [API] L98 | Record field | Authored CSS/class ownership | 🟢 Verified | No style-object translation or universal popup paint guarantee. |
| `value` · [API] L99 | Record field | Explicit unique string value | 🟢 Verified | E1/E2 empty values supported precisely; numeric model keys omitted. |

### SelectGroupOption Properties

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `children` · [API] L105 | Record field | Native optgroup options | 🟢 Verified | One native optgroup level; nodes retained. |
| `label` · [API] L106 | Record field | Native nonempty optgroup label | 🟢 Verified | Callback labels omitted; literal matching includes group text. |
| `key` · [API] L107 | Record field | Native DOM identity/id instead | ⏭️ Intentionally omitted | No keyed group-record model. |
| `render` · [API] L108 | Record field | No group renderer | ⏭️ Intentionally omitted | P5 custom group rows excluded. |
| `type` · [API] L109 | Record field | Authored optgroup element | 🟢 Verified | No type discriminator object or provider. |

### Select Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `header` · [API] L115 | Slot | External authored context instead | ⏭️ Intentionally omitted | No content inside a native picker header. |
| `action` · [API] L116 | Slot | External native buttons instead | ⏭️ Intentionally omitted | No native picker action slot. |
| `empty` · [API] L117 | Slot | Adjacent authored empty/match message | 🟢 Verified | E1/E2 pinned selected nonmatches may remain; not popup-slot parity. |
| `arrow` · [API] L118 | Slot | Native arrow only | ⏭️ Intentionally omitted | No custom popup arrow renderer. |

### Select Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `focus` · [API] L124 | Method | Native select.focus() | 🟢 Verified | E1/E2 no wrapper tabstop. |
| `focusInput` · [API] L125 | Method | External filter.focus() when authored | 🟢 Verified | Not an input inside the picker/trigger. |
| `blur` · [API] L126 | Method | Native select.blur() | 🟢 Verified | Native semantics preserved. |
| `blurInput` · [API] L127 | Method | External filter.blur() when authored | 🟢 Verified | No component facade or internal input model. |

### Select Props: render-option inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `render-option.node` · [API] L66 | Inline record field | None | ⏭️ Intentionally omitted | No VNode option context. |
| `render-option.option` · [API] L66 | Inline record field | None | ⏭️ Intentionally omitted | No renderer option model. |
| `render-option.selected` · [API] L66 | Inline record field | None | ⏭️ Intentionally omitted | Native selectedness, no render callback context. |

### Select Props: render-tag inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `render-tag.option` · [API] L67 | Inline record field | None | ⏭️ Intentionally omitted | No selected-tag model. |
| `render-tag.handleClose` · [API] L67 | Inline record field | None | ⏭️ Intentionally omitted | No tag close callback. |

### SelectOption Properties: render inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `render.node` · [API] L97 | Inline record field | None | ⏭️ Intentionally omitted | No VNode renderer. |
| `render.option` · [API] L97 | Inline record field | None | ⏭️ Intentionally omitted | No renderer option context. |
| `render.selected` · [API] L97 | Inline record field | None | ⏭️ Intentionally omitted | No renderer selected context. |

### SelectGroupOption Properties: render inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `render.node` · [API] L108 | Inline record field | None | ⏭️ Intentionally omitted | No group VNode renderer. |
| `render.option` · [API] L108 | Inline record field | None | ⏭️ Intentionally omitted | Original public option-type identity retained despite source type differences. |
| `render.selected` · [API] L108 | Inline record field | None | ⏭️ Intentionally omitted | Original public field retained; source group-render signature differs. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Select `bordered` · [Select source] | Source prop | data-borderless CSS | 🟢 Verified | External native control border, focus retained. |
| Select `widthMode` · [Select source] | Source prop | Native popup dimensions | ⏭️ Intentionally omitted | No popup geometry override. |
| Select `displayDirective` · [Select source] | Source prop | Native DOM stays authored | ⏭️ Intentionally omitted | No menu mount/show strategy. |
| Select `onUpdateValue` · [Select source] | Source alias | Native change observation | 🟢 Verified | No duplicate alias event. |
| Select `onUpdateShow` · [Select source] | Source alias | None | ⏭️ Intentionally omitted | No popup lifecycle mirror. |
| Select `onChange` · [Select source] | Deprecated source alias | Native change instead | ⏭️ Intentionally omitted | No deprecated callback-array protocol. |
| Select `items` · [Select source] | Deprecated source alias | Authored options | ⏭️ Intentionally omitted | No array renderer/alias. |
| Select `theme`, `themeOverrides`, `builtinThemeOverrides` · [Select source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No provider/theme-object/CSS-in-JS translation. |
| Select `SelectSize` · [Size] | Source type | Four explicit CSS sizes | 🟢 Verified | tiny/small/medium/large retained. |
| Select `SelectInst` · [Types] | Source type | Original select and optional external filter methods | 🟢 Verified | No framework ref facade. |
| Select `SelectSlots.default` · [Select source] | Source slot declaration | Authored native children instead | ⏭️ Intentionally omitted | No VNode default-slot API promoted from the declaration. |
| SelectOption `SelectBaseOption`, optional value/label, `[k: string]` · [Types] | Source record type group | Native options only | ⏭️ Intentionally omitted | No object fields; helper requires explicit native values. |
| SelectGroupOption `SelectGroupOptionBase`, `SelectGroupOption`, deprecated name and render signature · [Types] | Source record type group | Native optgroup only | ⏭️ Intentionally omitted | Source render uses group option without selected; original public fields remain separately above. |
| Select `SelectIgnoredOption` · [Types] | Source option variant | No ignored/custom row model | ⏭️ Intentionally omitted | No P5 renderer rows. |
| Select `ValueAtom`, `Value` · [Types] | Source value type group | Own native-string SelectValue type | ⏭️ Intentionally omitted | Source numeric/mixed model aliases not exported as compatible types. |
| Select `OnUpdateValue`, `OnUpdateValueImpl` · [Types] | Source callback type group | Native events/selectedOptions | ⏭️ Intentionally omitted | No intersection/union model callbacks or option records. |
| Select `SelectTreeMate` · [Types] | Source helper type | None | ⏭️ Intentionally omitted | No TreeMate dependency/model. |
| Select `SelectFallbackOption`, `SelectFallbackOptionImpl` · [Types] | Source factory type group | Unknown keys throw | ⏭️ Intentionally omitted | No synthetic fallback creator. |
| Select `SelectFilter` · [Types] | Source callback type | Fixed literal external filter instead | ⏭️ Intentionally omitted | No arbitrary option-model predicate. |

<!-- END PINNED API INVENTORY -->
