# Tree Select

**🟢 Verified retained path-aware native Select scope.** One labelled native single or
multiple select with full-path labels, distinct real string keys, literal filtering,
native defaults/forms and a deliberate native-option handoff on disconnect.
No expandable checkbox popup, mixed-state tree, renderer, provider or virtualization.

[Canonical implementation and acceptance](../../components/tree-select.md) composes the
existing `readTreeHierarchy`/`TreeNode` index and exactly one Native Select owner.
The source is passive and separate; a live Tree's controls cannot be hidden or stolen.
There was no dedicated legacy Tree Select contract to redefine; core Tree/Select and
all prior standalone assets remain unchanged.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Next:** Transfer, with its own source/target order, multi-selection and form contract.

1. [x] **Define stable selection.** Read pinned API/controller/interfaces/exports and live
   reference; preserve all original identities and explicit native value/path semantics.
2. [x] **Compose native behavior.** Reuse one Native Select for fields/filtering; preserve
   labels, keys, option identity and native focus/keyboard instead of a fabricated tree popup.
3. [x] **Scope filter/data modes.** Preserve selected/form values under filtering; prune
   invalid source keys/defaults; leave loading and expansion application-owned.
4. [x] **Test behavior and handoff.** Native forms/defaults/filter/focus/ownership/source
   replacement, browser evidence, build/budgets and non-resurrecting teardown accepted.

### Native primitives and fallback

Author the initial flat native options with full-path labels, plus a readable passive
hierarchy. The select remains usable without JS. Optional filter/clear enhancements start
hidden. Disconnect releases observation/ownership and retains the **current** native
options, selections and surviving defaults; it never restores stale original data.

## Reference and review boundary

- [Current reference](https://www.naiveui.com/en-US/os-theme/components/tree-select):
  rendered/reviewed 2026-09-09, Naive UI 2.45.3 (SPA rendered despite HTTP 404).
- [Pinned API][api], [controller][controller], [interfaces][interface], [exports][exports],
  [public types][public], related [Tree source][tree].
- [Catalog](../index.md) · [Architecture](../architecture.md).

Revision: **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**.
The source combines NTree, internal selection, treemate and floating followers, with
different checked/selected paths, injected pending state, tag rendering and form callbacks.
The native target deliberately does not reproduce that graph. Its independent native
multiple selection is not cascade/check-strategy/indeterminate behavior.

**66 original API rows + 21 original inline declarations + 33 source supplements =
120 tracker rows.** All **87 original section/member/kind/API-line identities** remain
in order. `API:Lnn` means the exact pinned `[api]` URL with fragment `#Lnn`.
Verified refers to the stated adaptation, not source prop/type compatibility.
All rows are resolved: **39 adapted native capabilities and 81 intentional omissions**.

<!-- BEGIN PINNED API INVENTORY -->

### TreeSelect Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `allow-checking-not-loaded` · API:L28 | Prop | No unloaded-subtree checking promise. | ⏭️ Intentionally omitted |
| `cascade` · API:L29 | Prop | Native multiple keys are independent. | ⏭️ Intentionally omitted |
| `checkable` · API:L30 | Prop | No checkbox-tree owner or checkbox proxy. | ⏭️ Intentionally omitted |
| `check-strategy` · API:L31 | Prop | No parent/child check reports; explicit leaf/any eligibility is a separate contract. | ⏭️ Intentionally omitted |
| `children-field` · API:L32 | Prop | Authored nested source lists, not a field-name data parser. | 🟢 Verified |
| `clearable` · API:L33 | Prop | Optional native clear action; one explicit value change. | 🟢 Verified |
| `clear-filter-after-select` · API:L34 | Prop | Query remains user-controlled; no popup-closing/filter-reset model. | ⏭️ Intentionally omitted |
| `consistent-menu-width` · API:L35 | Prop | No floating menu width/virtualization coupling. | ⏭️ Intentionally omitted |
| `default-value` · API:L36 | Prop | Strict mode-specific defaults and native defaultSelected flags. | 🟢 Verified |
| `default-expand-all` · API:L37 | Prop | No interactive tree expansion mode. | ⏭️ Intentionally omitted |
| `default-expanded-keys` · API:L38 | Prop | No picker expansion model. | ⏭️ Intentionally omitted |
| `disabled` · API:L39 | Prop | Native select/fieldset disabling and disabled source paths. | 🟢 Verified |
| `ellipsis-tag-popover-props` · API:L40 | Prop | No tags/overflow popover. | ⏭️ Intentionally omitted |
| `expanded-keys` · API:L41 | Prop | Passive source disclosure is not a selectable expanded-key model. | ⏭️ Intentionally omitted |
| `indent` · API:L42 | Prop | Full-path labels replace tree-row geometry. | ⏭️ Intentionally omitted |
| `indeterminate-keys` · API:L43 | Prop | No mixed checkbox state. | ⏭️ Intentionally omitted |
| `filterable` · API:L44 | Prop | Optional labelled Native Select filter for multiple or size>=2 list controls. | 🟢 Verified |
| `filter` · API:L45 | Prop | Literal full-path filtering only; no custom predicate/VNode search renderer. | ⏭️ Intentionally omitted |
| `get-children` · API:L46 | Prop | Native index references actual child nodes; no data getter callback. | 🟢 Verified |
| `key-field` · API:L47 | Prop | Required unique source data-tree-key strings. | 🟢 Verified |
| `label-field` · API:L48 | Prop | Named source spans, projected safely as full-path option text. | 🟢 Verified |
| `disabled-field` · API:L49 | Prop | Source data-tree-disabled, including unavailable ancestor paths. | 🟢 Verified |
| `loading` · API:L50 | Prop | Application owns data loading/busy status. | ⏭️ Intentionally omitted |
| `max-tag-count` · API:L51 | Prop | No selected-tag renderer. | ⏭️ Intentionally omitted |
| `menu-props` · API:L52 | Prop | No menu/attribute forwarding object. | ⏭️ Intentionally omitted |
| `multiple` · API:L53 | Prop | Authored native multiple mode; independent key array in DOM order. | 🟢 Verified |
| `node-props` · API:L54 | Prop | Authored source/control attributes, not callback prop forwarding. | 🟢 Verified |
| `options` · API:L55 | Prop | Passive authored hierarchy plus native options; no parallel TreeSelectOption[] renderer. | 🟢 Verified |
| `override-default-node-click-behavior` · API:L56 | Prop | Native select behavior is not a tree click dispatcher. | ⏭️ Intentionally omitted |
| `placeholder` · API:L57 | Prop | Authored empty option for single dropdowns; no empty choice in multiple mode. | 🟢 Verified |
| `placement` · API:L58 | Prop | In-flow native field, not a positioned popup. | ⏭️ Intentionally omitted |
| `render-label` · API:L59 | Prop | Plain full-path labels; arbitrary VNode content excluded. | 🟢 Verified |
| `render-prefix` · API:L60 | Prop | No per-option renderer. | ⏭️ Intentionally omitted |
| `render-suffix` · API:L61 | Prop | No per-option renderer. | ⏭️ Intentionally omitted |
| `render-switcher-icon` · API:L62 | Prop | No tree switcher in the native select. | ⏭️ Intentionally omitted |
| `render-tag` · API:L63 | Prop | No tag/handleClose renderer. | ⏭️ Intentionally omitted |
| `separator` · API:L64 | Prop | Literal full-path separator, <=32 characters. | 🟢 Verified |
| `show-line` · API:L65 | Prop | No picker tree connecting lines. | ⏭️ Intentionally omitted |
| `show-path` · API:L66 | Prop | Controls selected readout detail; option labels always retain full paths for disambiguation. | 🟢 Verified |
| `size` · API:L67 | Prop | External small/medium/large native control styling; native size attribute controls list rows separately. | 🟢 Verified |
| `status` · API:L68 | Prop | Real native validity and explicit source/default status text. | 🟢 Verified |
| `to` · API:L69 | Prop | No portal/teleport. | ⏭️ Intentionally omitted |
| `value` · API:L70 | Prop | String/null single value or independent native string[] multiple value. | 🟢 Verified |
| `virtual-scroll` · API:L71 | Prop | All bounded native options remain mounted; no Virtual List runtime. | ⏭️ Intentionally omitted |
| `watch-props` · API:L72 | Prop | Explicit setters/refresh and native default flags, not reactive prop watching. | ⏭️ Intentionally omitted |
| `on-blur` · API:L73 | Callback | Native control/filter blur events. | 🟢 Verified |
| `on-focus` · API:L74 | Callback | Native control/filter focus events. | 🟢 Verified |
| `on-load` · API:L75 | Callback | Application updates source atomically and refreshes; no built-in lazy loader. | ⏭️ Intentionally omitted |
| `on-update:expanded-keys` · API:L76 | Callback | No expansion state event. | ⏭️ Intentionally omitted |
| `on-update:indeterminate-keys` · API:L77 | Callback | No mixed-state event. | ⏭️ Intentionally omitted |
| `on-update:value` · API:L78 | Callback | One mui:tree-select-change with explicit native value/keys/paths/action/event. | 🟢 Verified |

### TreeSelectOption Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `key` · API:L84 | Record field | Stable unique native string key; numbers are not coerced. | 🟢 Verified |
| `label` · API:L85 | Record field | Original source label and full-path native option text. | 🟢 Verified |
| `children?` · API:L86 | Record field | Native lists/details hierarchy, indexed iteratively. | 🟢 Verified |
| `disabled?` · API:L87 | Record field | Disabled paths cannot remain selected/submitted as eligible values. | 🟢 Verified |
| `isLeaf?` · API:L88 | Record field | Leaf means no authored branch; known empty/lazy branches are not automatically promoted. | 🟢 Verified |

### TreeSelect Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `header` · API:L94 | Slot | Authored native field/source headings. | 🟢 Verified |
| `action` · API:L95 | Slot | Authored native actions outside select/options. | 🟢 Verified |
| `arrow` · API:L96 | Slot | Browser owns the native arrow; no replacement slot. | ⏭️ Intentionally omitted |
| `empty` · API:L97 | Slot | Plain authored empty/filter message, not a menu renderer. | 🟢 Verified |

### TreeSelect Methods

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `blur` · API:L103 | Method | Native controller.control.blur(). | 🟢 Verified |
| `blurInput` · API:L104 | Method | Native optional filter.blur(). | 🟢 Verified |
| `focus` · API:L105 | Method | Native controller.control.focus(); no popup promise. | 🟢 Verified |
| `focusInput` · API:L106 | Method | Native optional filter.focus(). | 🟢 Verified |
| `getCheckedData` · API:L107 | Method | No tree-check report; explicit selected keys/paths instead. | ⏭️ Intentionally omitted |
| `getIndeterminateData` · API:L108 | Method | No indeterminate model. | ⏭️ Intentionally omitted |

### TreeSelect Props: node-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `node-props.option` · API:L54 | Inline record field | No callback data record. | ⏭️ Intentionally omitted |

### TreeSelect Props: override-default-node-click-behavior inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `override-default-node-click-behavior.option` · API:L56 | Inline record field | No tree click dispatcher. | ⏭️ Intentionally omitted |

### TreeSelect Props: render-label inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-label.option` · API:L59 | Inline record field | No renderer record. | ⏭️ Intentionally omitted |
| `render-label.checked` · API:L59 | Inline record field | No checkbox renderer state. | ⏭️ Intentionally omitted |
| `render-label.selected` · API:L59 | Inline record field | Native selectedness is not a VNode callback argument. | ⏭️ Intentionally omitted |

### TreeSelect Props: render-prefix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-prefix.option` · API:L60 | Inline record field | No renderer record. | ⏭️ Intentionally omitted |
| `render-prefix.checked` · API:L60 | Inline record field | No checkbox renderer state. | ⏭️ Intentionally omitted |
| `render-prefix.selected` · API:L60 | Inline record field | No renderer state. | ⏭️ Intentionally omitted |

### TreeSelect Props: render-suffix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-suffix.option` · API:L61 | Inline record field | No renderer record. | ⏭️ Intentionally omitted |
| `render-suffix.checked` · API:L61 | Inline record field | No checkbox renderer state. | ⏭️ Intentionally omitted |
| `render-suffix.selected` · API:L61 | Inline record field | No renderer state. | ⏭️ Intentionally omitted |

### TreeSelect Props: render-tag inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-tag.option` · API:L63 | Inline record field | No tag renderer. | ⏭️ Intentionally omitted |
| `render-tag.handleClose` · API:L63 | Inline record field | Native selection/clear is not a tag callback. | ⏭️ Intentionally omitted |

### TreeSelect Props: on-update:expanded-keys inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-update:expanded-keys.node` · API:L76 | Inline record field | No expansion payload. | ⏭️ Intentionally omitted |
| `on-update:expanded-keys.action` · API:L76 | Inline record field | No expand/collapse/filter action union. | ⏭️ Intentionally omitted |

### TreeSelect Props: on-update:value inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-update:value.node` · API:L78 | Inline record field | Native event uses explicit keys/paths, not a TreeOption object. | ⏭️ Intentionally omitted |
| `on-update:value.action` · API:L78 | Inline record field | Narrow select/clear action on one native notification; no tag-delete/tree-unselect union. | 🟢 Verified |

### TreeSelect Methods: getCheckedData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getCheckedData.keys` · API:L107 | Inline record field | No tree-check report. | ⏭️ Intentionally omitted |
| `getCheckedData.options` · API:L107 | Inline record field | No TreeOption/null array report. | ⏭️ Intentionally omitted |

### TreeSelect Methods: getIndeterminateData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getIndeterminateData.keys` · API:L108 | Inline record field | No mixed keys. | ⏭️ Intentionally omitted |
| `getIndeterminateData.options` · API:L108 | Inline record field | No mixed option report. | ⏭️ Intentionally omitted |

### Source-only supplements

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NTreeSelect` · [exports][exports] | Export supplement | No Vue alias/custom element. | ⏭️ Intentionally omitted |
| `treeSelectProps` · [exports][exports] | Export supplement | No framework prop schema. | ⏭️ Intentionally omitted |
| `TreeSelectProps` · [exports][exports] | Type supplement | No ExtractPublicPropTypes compatibility. | ⏭️ Intentionally omitted |
| `TreeSelectSlots` · [controller][controller] | Type supplement | No VNode slot object. | ⏭️ Intentionally omitted |
| `TreeSelectInst` · [interface][interface] | Type supplement | Native controller is distinct from the source instance. | ⏭️ Intentionally omitted |
| `TreeSelectNodeProps` · [exports][exports] | Type supplement | No callback attribute object. | ⏭️ Intentionally omitted |
| `TreeSelectOption` · [interface][interface] | Type supplement | Source TreeOptionBase-derived data type not reproduced; the source interface omits isLeaf while Markdown names it. Native branch/leaf policy is explicit. | ⏭️ Intentionally omitted |
| `TreeSelectRenderLabel` · [exports][exports] | Type supplement | No VNode renderer type. | ⏭️ Intentionally omitted |
| `TreeSelectRenderPrefix` · [exports][exports] | Type supplement | No VNode renderer type. | ⏭️ Intentionally omitted |
| `TreeSelectRenderSuffix` · [exports][exports] | Type supplement | No VNode renderer type. | ⏭️ Intentionally omitted |
| `TreeSelectRenderTag` · [exports][exports] | Type supplement | No option/handleClose VNode tag type. | ⏭️ Intentionally omitted |
| `TreeSelectSize` · [public][public] | Type supplement | Native small/medium/large CSS choice. | 🟢 Verified |
| `TreeSelectOverrideNodeClickBehavior` · [exports][exports] | Re-export supplement | No Tree click-dispatch callback. | ⏭️ Intentionally omitted |
| `TreeSelectOverrideNodeClickBehaviorReturn` · [exports][exports] | Re-export supplement | No toggleExpand/toggleSelect/toggleCheck/default/none dispatcher union. | ⏭️ Intentionally omitted |
| `bordered` · [controller][controller] | Prop supplement | Native author CSS borders; no provider toggle. | ⏭️ Intentionally omitted |
| `defaultShow` · [controller][controller] | Prop supplement | No popup default state. | ⏭️ Intentionally omitted |
| `show` · [controller][controller] | Prop supplement | No popup visibility state. | ⏭️ Intentionally omitted |
| `onUpdateShow` · [controller][controller] | Callback supplement | No popup callback. | ⏭️ Intentionally omitted |
| `onUpdate:show` · [controller][controller] | Callback alias supplement | No popup callback. | ⏭️ Intentionally omitted |
| `onUpdateValue` · [controller][controller] | Callback alias supplement | Same single native change adaptation as colon spelling, not duplicate emissions. | 🟢 Verified |
| `leafOnly` · [controller][controller] | Deprecated prop supplement | Explicit selection=leaf policy; no deprecated prop alias. | 🟢 Verified |
| `onUpdateExpandedKeys` · [tree][tree] | Shared callback alias supplement | No expansion event. | ⏭️ Intentionally omitted |
| `onUpdateIndeterminateKeys` · [tree][tree] | Shared callback alias supplement | No indeterminate event. | ⏭️ Intentionally omitted |
| `Value` · [interface][interface] | Type supplement | Strict native single string/null or multiple string[]; numeric members excluded. | 🟢 Verified |
| `TreeSelectTmNode` · [interface][interface] | Type supplement | Opaque treemate node not adopted. | ⏭️ Intentionally omitted |
| `TreeSelectRenderProps` · [interface][interface] | Type supplement | No option/checked/selected VNode record. | ⏭️ Intentionally omitted |
| `TreeSelectRenderTreePart` · [interface][interface] | Type supplement | No callback renderer alias. | ⏭️ Intentionally omitted |
| `OnUpdateValue` · [interface][interface] | Type supplement | Source intersection callback type not reproduced. | ⏭️ Intentionally omitted |
| `OnUpdateValueImpl` · [interface][interface] | Type supplement | Broad option/node/tag action unions replaced by explicit native event detail. | ⏭️ Intentionally omitted |
| `OnUpdateIndeterminateKeysImpl` · [interface][interface] | Type supplement | No mixed-state callback type. | ⏭️ Intentionally omitted |
| `TreeSelectInjection`, `treeSelectInjectionKey` · [interface][interface] | Internal group supplement | No pending-key/provider/dataTreeMate graph. | ⏭️ Intentionally omitted |
| `ThemeProps`, `treeSharedProps` · [controller][controller] | Mixin group supplement | No framework theme/form/config/shared-prop injection. | ⏭️ Intentionally omitted |
| `OnLoad` · [controller][controller] | Type supplement | No implicit lazy callback; application owns loading and refresh. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree-select/demos/enUS/index.demo-entry.md
[controller]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree-select/src/TreeSelect.tsx
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree-select/src/interface.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree-select/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree-select/src/public-types.ts
[tree]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/Tree.tsx
