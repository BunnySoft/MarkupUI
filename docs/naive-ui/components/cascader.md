# Cascader

**🟢 Verified retained native dependent-select scope.** A strict string terminal value,
explicit key path, real native selects and a dedicated passive authored hierarchy.
This is not a floating multi-checkbox cascader, Tree controller or data/VNode renderer.

[Canonical implementation, ownership and acceptance](../../components/cascader.md)
reuses `readTreeHierarchy`/`TreeNode` without modifying Tree or claiming another Tree/
Select owner's nodes. The [legacy widgets Cascader](../../../src/plugins/widgets.ts)
remains unchanged: its path-array/automatic-first-child behavior is not silently replaced.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** Tree's real-node index and native Select/Form contracts.
**Next:** Tree Select, with its own native selection/chooser/value/reset contract.

1. [x] **Stabilize hierarchy identity.** Preserve all original source identities; validate
   globally unique string keys, contiguous paths, disabled ancestors and bounded native source.
2. [x] **Preserve the native fallback.** Stable labelled selects/option nodes, passive
   source outline, explicit partial/terminal state and truthful native FormData.
3. [x] **Stage richer selection.** Guard caller-supplied async native batches; explicitly
   omit multi-check/filter/popup/virtual/renderer surfaces. Reconstruct default paths on reset.
4. [x] **Verify path mutations.** Tests/build/budgets and actual Chromium path/reset/
   required/loading/clear/focus/refresh/forms/RTL/zoom/no-JS/coexistence evidence.

### Native primitives and fallback

One authored native select per level (one to eight columns) projects only the relevant
siblings from a separate passive Tree-anatomy source. Source form controls and competing
Tree owners are rejected. The helper never hides a live named Tree as a fake data source.
Without JS, the demo keeps its dependent fields disabled and exposes the static native
outline; it does not pretend static descendant options automatically follow a new parent.

## Reference and source review

- [Current official page](https://www.naiveui.com/en-US/os-theme/components/cascader):
  rendered/reviewed 2026-09-09, Naive UI 2.45.3. The SPA rendered despite HTTP 404.
- [Pinned API][api], [controller][controller], [option/loading behavior][option],
  [interfaces][interface], [path utilities][utils], [public types][public], [exports][exports].
- [Index](../index.md) · [Architecture](../architecture.md).

Pinned revision: **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**.
The source uses treemate, Vue reactive selection/checking, floating followers, an internal
selection renderer and virtualized submenus. Its option component loads by mutating
`option.children` through a Promise<void>, and separately manages hover/check state.
The native target instead returns validated DOM batches, captures default paths independently
of currently mounted option families, and gates incomplete native forms.

**54 original API table rows + 15 original inline fields + 26 explicit source supplements
= 95 tracker rows.** All **69 original section/member/kind/API-line identities** remain
in their original order. `API:Lnn` is the precise pinned `[api]` URL below with `#Lnn`.
Verified denotes the stated native adaptation, never source prop/type/popup compatibility.
All rows are resolved: **40 adapted native capabilities and 55 intentional omissions**.

<!-- BEGIN PINNED API INVENTORY -->

### Cascader Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `allow-checking-not-loaded` · API:L28 | Prop | No incomplete multi-check set; a pending strict-leaf path is invalid. | ⏭️ Intentionally omitted |
| `cascade` · API:L29 | Prop | No checkbox cascade engine or competing Tree checkbox owner. | ⏭️ Intentionally omitted |
| `check-strategy` · API:L30 | Prop | Explicit selection=leaf/any for single paths; source parent/multiple reporting excluded. Native default is leaf, not source all. | 🟢 Verified |
| `children-field` · API:L31 | Prop | Native nested data-tree-list source, not a field-name parser. | 🟢 Verified |
| `clearable` · API:L32 | Prop | Optional authored clear button and clear(); enabled root required for safe full-path clearing. | 🟢 Verified |
| `clear-filter-after-select` · API:L33 | Prop | No filter or multi-tag input model. | ⏭️ Intentionally omitted |
| `default-value` · API:L34 | Prop | Strict string/null defaultValue or authored defaultSelected path; captured across option-family changes. | 🟢 Verified |
| `disabled` · API:L35 | Prop | Native disabled selects/fieldsets, including native FormData and legend rules. | 🟢 Verified |
| `disabled-field` · API:L36 | Prop | data-tree-disabled source flags plus ancestor rejection; native option disabling preserved. | 🟢 Verified |
| `ellipsis-tag-popover-props` · API:L37 | Prop | No tag overflow/popover. | ⏭️ Intentionally omitted |
| `expand-trigger` · API:L38 | Prop | Real native select change, not hover-only expansion or custom popup clicks. | 🟢 Verified |
| `filterable` · API:L39 | Prop | No custom search UI. | ⏭️ Intentionally omitted |
| `filter` · API:L40 | Prop | No predicate renderer or flattened search results. | ⏭️ Intentionally omitted |
| `filter-menu-props` · API:L41 | Prop | No filter menu/attribute forwarding. | ⏭️ Intentionally omitted |
| `get-column-style` · API:L42 | Prop | Author external CSS for each real column; no string/object style callback. | 🟢 Verified |
| `value-field` · API:L43 | Prop | Stable data-tree-key strings; no numeric/object coercion. | 🟢 Verified |
| `label-field` · API:L44 | Prop | Named passive span source labels; plain native option text. | 🟢 Verified |
| `max-tag-count` · API:L45 | Prop | No multiple tags or responsive tag calculation. | ⏭️ Intentionally omitted |
| `menu-props` · API:L46 | Prop | No synthetic menu or forwarding object. | ⏭️ Intentionally omitted |
| `multiple` · API:L47 | Prop | Exactly one dependent path; no multi-checkbox/tag model. | ⏭️ Intentionally omitted |
| `options` · API:L48 | Prop | Dedicated passive native hierarchy, not a parallel CascaderOption[] renderer. | 🟢 Verified |
| `placeholder` · API:L49 | Prop | Authored first enabled empty option in each native select. | 🟢 Verified |
| `placement` · API:L50 | Prop | In-flow native columns; no floating geometry. | ⏭️ Intentionally omitted |
| `remote` · API:L51 | Prop | Caller-supplied load function and explicit lazy marker; no built-in HTTP. | 🟢 Verified |
| `render-prefix` · API:L52 | Prop | No rich per-option renderer inside native selects. | ⏭️ Intentionally omitted |
| `render-label` · API:L53 | Prop | Plain text projected from authored span labels; VNode/rich labels excluded. | 🟢 Verified |
| `render-suffix` · API:L54 | Prop | No per-option checkbox/arrow/renderer replacement. | ⏭️ Intentionally omitted |
| `scrollbar-props` · API:L55 | Prop | Native browser scrolling only. | ⏭️ Intentionally omitted |
| `separator` · API:L56 | Prop | Plain text separator, at most 32 characters, default space/slash/space. | 🟢 Verified |
| `show` · API:L57 | Prop | No popup visibility model. Column availability is derived from the path. | ⏭️ Intentionally omitted |
| `show-path` · API:L58 | Prop | Optional plain full-path or last-label readout; never a form proxy. | 🟢 Verified |
| `size` · API:L59 | Prop | External small/medium/large native control CSS. | 🟢 Verified |
| `spin-props` · API:L60 | Prop | Plain pending text/aria-busy, no Spin runtime. | ⏭️ Intentionally omitted |
| `status` · API:L61 | Prop | Real native validity plus explicit status text; no forced-success override/provider state. | 🟢 Verified |
| `to` · API:L62 | Prop | No portal/teleport/container transport. | ⏭️ Intentionally omitted |
| `value` · API:L63 | Prop | state.value is one complete terminal key or null; state.path separately exposes the prefix. | 🟢 Verified |
| `virtual-scroll` · API:L64 | Prop | Native selects/options and bounded source; no Virtual List injection. | ⏭️ Intentionally omitted |
| `on-blur` · API:L65 | Callback | Native field blur/focusout events. | 🟢 Verified |
| `on-focus` · API:L66 | Callback | Native field focus/focusin events. | 🟢 Verified |
| `on-load` · API:L67 | Callback | load(node,{signal}) returns safe native source rows; identity/generation/native-value guards. | 🟢 Verified |
| `on-update:show` · API:L68 | Callback | No popup open/close event. | ⏭️ Intentionally omitted |
| `on-update:value` · API:L69 | Callback | One mui:cascader-change per native selection/clear; detail includes precise value/path/complete/pending/default state. | 🟢 Verified |

### CascaderOption Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `label` · API:L75 | Record field | Authored native source label; safely projected as text. | 🟢 Verified |
| `value` · API:L76 | Record field | Native string key only; source numeric alternative omitted. | 🟢 Verified |
| `disabled?` · API:L77 | Record field | A disabled source ancestor prevents selecting its descendants. | 🟢 Verified |
| `children?` · API:L78 | Record field | Authored nested list; empty/lazy branches remain branches, not automatically selected leaves. | 🟢 Verified |

### Cascader Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `action` · API:L84 | Slot | Authored native action buttons outside selects/source. | 🟢 Verified |
| `arrow` · API:L85 | Slot | Native select owns its arrow; no custom slot replacement. | ⏭️ Intentionally omitted |
| `empty` · API:L86 | Slot | Plain no-choices status or caller-owned empty description, not a popup renderer. | 🟢 Verified |
| `not-found` · API:L87 | Slot | No filter/search result surface. | ⏭️ Intentionally omitted |

### Cascader Methods

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `blur` · API:L93 | Method | Call blur() on the original native control. | 🟢 Verified |
| `focus` · API:L94 | Method | Call focus() on an available original native control; no popup promise. | 🟢 Verified |
| `getCheckedData` · API:L95 | Method | No multi-check data API; state.value/path are distinct native single-path observations. | ⏭️ Intentionally omitted |
| `getIndeterminateData` · API:L96 | Method | No indeterminate check model. | ⏭️ Intentionally omitted |

### Cascader Props: get-column-style inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `get-column-style.level` · API:L42 | Inline record field | Zero-based controls index/real authored column order; no callback record. | 🟢 Verified |

### Cascader Props: render-prefix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-prefix.option` · API:L52 | Inline record field | Rich option renderer context omitted. | ⏭️ Intentionally omitted |
| `render-prefix.node` · API:L52 | Inline record field | No VNode prefix to replace. | ⏭️ Intentionally omitted |
| `render-prefix.checked` · API:L52 | Inline record field | No checkbox renderer state. | ⏭️ Intentionally omitted |

### Cascader Props: render-suffix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-suffix.option` · API:L54 | Inline record field | Rich option renderer context omitted. | ⏭️ Intentionally omitted |
| `render-suffix.node` · API:L54 | Inline record field | No VNode suffix to replace. | ⏭️ Intentionally omitted |
| `render-suffix.checked` · API:L54 | Inline record field | No checkbox renderer state. | ⏭️ Intentionally omitted |

### Cascader Props: spin-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `spin-props.strokeWidth?` · API:L60 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.stroke?` · API:L60 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.scale?` · API:L60 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.radius?` · API:L60 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |

### Cascader Methods: getCheckedData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getCheckedData.keys` · API:L95 | Inline record field | No multi-check report; explicit single path instead. | ⏭️ Intentionally omitted |
| `getCheckedData.options` · API:L95 | Inline record field | No TreeOption/null data-array report. | ⏭️ Intentionally omitted |

### Cascader Methods: getIndeterminateData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getIndeterminateData.keys` · API:L96 | Inline record field | No mixed check keys. | ⏭️ Intentionally omitted |
| `getIndeterminateData.options` · API:L96 | Inline record field | No mixed option data report. | ⏭️ Intentionally omitted |

### Source-only supplements

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NCascader` · [exports][exports] | Export supplement | No Vue alias or custom-element redefinition. | ⏭️ Intentionally omitted |
| `cascaderProps` · [exports][exports] | Export supplement | No runtime framework prop schema. | ⏭️ Intentionally omitted |
| `CascaderProps` · [exports][exports] | Type supplement | No ExtractPublicPropTypes compatibility. | ⏭️ Intentionally omitted |
| `CascaderSlots` · [controller][controller] | Type supplement | Source action/arrow/empty/not-found VNode slot object excluded. | ⏭️ Intentionally omitted |
| `CascaderInst` · [interface][interface] | Type supplement | Native CascaderController is a different API, not a source instance. | ⏭️ Intentionally omitted |
| `CascaderOption` · [interface][interface] | Type supplement | Source optional value/label/children[]/extra-fields object not copied. Source array declaration clarifies the Markdown children type. | ⏭️ Intentionally omitted |
| `CascaderSize` · [public][public] | Type supplement | Native data-cascader-size small/medium/large CSS. | 🟢 Verified |
| `CascaderSpinProps` · [public][public] | Type supplement | Opaque SharedSpinProps alias excluded. | ⏭️ Intentionally omitted |
| `bordered` · [controller][controller] | Prop supplement | No inherited/provider border toggle; native borders remain author CSS. | ⏭️ Intentionally omitted |
| `leafOnly` · [controller][controller] | Deprecated prop supplement | Explicit selection=leaf; no deprecated alias registration. | 🟢 Verified |
| `onChange` · [controller][controller] | Deprecated callback supplement | Same single mui:cascader-change adaptation; no duplicate alias emission. | 🟢 Verified |
| `onUpdateValue` · [controller][controller] | Callback alias supplement | Same native change notification as the colon spelling. | 🟢 Verified |
| `onUpdateShow` · [controller][controller] | Callback alias supplement | No popup state or notification. | ⏭️ Intentionally omitted |
| `ValueAtom` · [interface][interface] | Type supplement | Strict native strings; numeric atoms are intentionally excluded. | 🟢 Verified |
| `Value` · [interface][interface] | Type supplement | Native value is string/null, never a multiple-value array; path is a separate field. | 🟢 Verified |
| `Key` · [interface][interface] | Type supplement | Stable globally unique source strings, not arbitrary numeric objects. | 🟢 Verified |
| `OnLoad` · [interface][interface] | Type supplement | Explicit native-node result plus AbortSignal, not mutating option.children in Promise<void>. | 🟢 Verified |
| `OnUpdateValue` · [interface][interface] | Type supplement | Source intersection callback declaration not reproduced. Native event detail is explicitly typed independently. | ⏭️ Intentionally omitted |
| `OnUpdateValueImpl` · [interface][interface] | Type supplement | Source broad value/option/path object unions are not the native event shape. | ⏭️ Intentionally omitted |
| `Filter` · [interface][interface] | Type supplement | No pattern/option/path predicate callback. | ⏭️ Intentionally omitted |
| `ExpandTrigger` · [interface][interface] | Type supplement | No hover/click popup enum; native change owns selection. | ⏭️ Intentionally omitted |
| `TmNode` · [interface][interface] | Type supplement | Opaque treemate node is not the reused native TreeNode. | ⏭️ Intentionally omitted |
| `MenuModel` · [interface][interface] | Type supplement | No TmNode[][] renderer model; columns contain real native options only. | ⏭️ Intentionally omitted |
| `CascaderInjection`, `cascaderInjectionKey` · [interface][interface] | Internal group supplement | No provider/ref graph, injected selection state or hidden store. | ⏭️ Intentionally omitted |
| `CascaderMenuExposedMethods`, `CascaderMenuInstance`, `CascaderSubmenuInstance`, `SelectMenuInstance` · [interface][interface] | Internal type group supplement | No popup scrolling/error/keyboard instance graph; native controls retain behavior. | ⏭️ Intentionally omitted |
| `ThemeProps` · [controller][controller] | Mixin group supplement | Framework theme/config/Form injection excluded; explicit native forms and external CSS retained. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/demos/enUS/index.demo-entry.md
[controller]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/src/Cascader.tsx
[option]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/src/CascaderOption.tsx
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/src/interface.ts
[utils]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/src/utils.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/src/public-types.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/cascader/index.ts
