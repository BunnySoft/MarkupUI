# Tree

**🟢 Verified retained native-outline scope, not an ARIA-tree/framework compatibility layer.**

[Canonical anatomy, ownership and acceptance](../../components/tree.md) implements native
ul/ol/li, details/summary, separate selection buttons and real checkboxes. DOM is the
hierarchy source; an iterative bounded index references actual nodes. Optional label
shortcuts and caller-supplied cancellable native-node loading do not introduce a renderer.
The [legacy core tree](../../../src/components/navigation.ts) is unchanged and not redefined.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Menu/Collapse/Checkbox contracts and stable node identity.
**Next:** Cascader, using this hierarchy/index/loading evidence without imposing Tree's
outline interaction on a cascaded chooser. Tree Select follows the hierarchy/chooser work.

1. [x] **Preserve node identity.** Reviewed pinned API, Tree/interface/keyboard/TreeNode/
   utils/public-types/exports and the live 2.45.3 page. Resolve every original identity.
2. [x] **Implement hierarchy navigation.** Native outline plus visible-node label shortcuts,
   parent/child movement, typeahead and focus recovery; no invented ARIA tree/roving claim.
3. [x] **Stage checking/loading.** Native checked/mixed state, explicit disabled barriers,
   check reports, safe atomic lazy insertions, AbortSignal/identity/generation guards.
4. [x] **Verify structural mutations.** Tests, real Chromium native interaction/races/forms/
   cleanup/coexistence, build/declarations and independent budgets; see canonical evidence.

### Native primitives and fallback

Authored nested lists and details remain readable/disclosable without JavaScript; native
checkboxes still work independently. Custom selection may start disabled until explicitly
enabled by demo JS. An unloaded branch includes an honest no-JS description. No forced
virtualization, drag/drop, provider, treemate, implicit HTTP or synthetic form payload.

## Reference and source review

- [Current official page](https://www.naiveui.com/en-US/os-theme/components/tree): reviewed
  2026-09-09; rendered API/TreeOption/drag/virtual/check/loading surfaces, version 2.45.3.
  The live SPA rendered despite an HTTP 404 document response.
- [API][api], [Tree implementation][tree], [node implementation][node],
  [keyboard][keyboard], [interfaces][interface], [utilities][utils], [exports][exports],
  [public types][public].
- [Index/provenance](../index.md) · [Architecture](../architecture.md).

Pinned revision: **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**.
The wrapper uses treemate for checking/flattening, vueuc for virtualization, Vue refs/
injection/controlled defaults, separate motion and drag machinery. Source loading tracks
keys and can load expanded unknown nodes automatically; this native scope instead uses
explicit safe-node results and never recursively fetches via default-expand-all.
Keyboard source confirms disabled skipping and parent/child movement, but does not make
our native-outline mode an ARIA tree. Source-only disabled/aliases/dragover/deprecated and
Tree Select integration contracts have explicit dispositions below.

**70 original API table rows + 49 original expanded declarations + one named public type
+ 27 explicit source supplements = 147 tracker rows.** All **119 original section,
member, kind and pinned API line identities** remain in order. Compact `API:Lnn` locators
mean the exact `[api]` URL below with fragment `#Lnn`; they do not change provenance.
Verified means the stated native adaptation, not TypeScript/VNode/prop compatibility.
All rows are resolved: **60 adapted native capabilities and 87 intentional omissions**.

<!-- BEGIN PINNED API INVENTORY -->

### Tree Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `accordion` · API:L35 | Prop | Independent native disclosures; exclusive sibling mode deferred. | ⏭️ Intentionally omitted |
| `allow-checking-not-loaded` · API:L36 | Prop | Cascade blocks any unknown reachable subtree; no incomplete all-children promise. | ⏭️ Intentionally omitted |
| `allow-drop` · API:L37 | Prop | No drag engine; application may provide explicit move actions. | ⏭️ Intentionally omitted |
| `animated` · API:L38 | Prop | Native immediate disclosure; no motion rows. | ⏭️ Intentionally omitted |
| `block-line` · API:L39 | Prop | Native full-width flex row, no whole-row click forwarding. | 🟢 Verified |
| `block-node` · API:L40 | Prop | External data-tree-block-labels CSS. | 🟢 Verified |
| `cancelable` · API:L41 | Prop | cancelable option controls repeated selection-button activation. | 🟢 Verified |
| `cascade` · API:L42 | Prop | Explicit native-checkbox cascade and bottom-up mixed state. | 🟢 Verified |
| `check-strategy` · API:L43 | Prop | all/parent/child reporting; native checked fields are not rewritten for reporting. | 🟢 Verified |
| `checkable` · API:L44 | Prop | Author an optional labelled native data-tree-check field per node. | 🟢 Verified |
| `checkbox-placement` · API:L45 | Prop | Author real checkbox/label order in the row; no visual-only tab-order reversal. | 🟢 Verified |
| `children-field` · API:L46 | Prop | Explicit native child data-tree-list, not a data-field-name parser. | 🟢 Verified |
| `checked-keys` · API:L47 | Prop | checkedKeys initialization and setCheckedKeys; native fields remain authoritative. | 🟢 Verified |
| `check-on-click` · API:L48 | Prop | Only native checkbox/label activation checks; selection labels do not also check. | ⏭️ Intentionally omitted |
| `data` · API:L49 | Prop | Authored DOM hierarchy and explicit refresh; no parallel data-rendering tree. | 🟢 Verified |
| `default-checked-keys` · API:L50 | Prop | Native checked/defaultChecked; explicit defaultCheckedKeys configures native reset defaults. | 🟢 Verified |
| `default-expand-all` · API:L51 | Prop | Opens known enabled branches once; no unknown-branch fetch. | 🟢 Verified |
| `default-expanded-keys` · API:L52 | Prop | Initial disclosure fallback; expandedKeys takes precedence. | 🟢 Verified |
| `default-selected-keys` · API:L53 | Prop | Initial selection fallback; selectedKeys takes precedence. | 🟢 Verified |
| `draggable` · API:L54 | Prop | No drag/drop runtime. | ⏭️ Intentionally omitted |
| `expand-on-dragenter` · API:L55 | Prop | No drag-triggered expansion/fetch. | ⏭️ Intentionally omitted |
| `expand-on-click` · API:L56 | Prop | Native summary only; separate primary selection controls never double-toggle. | 🟢 Verified |
| `expanded-keys` · API:L57 | Prop | Read current native open keys; silent setExpandedKeys. | 🟢 Verified |
| `ellipsis` · API:L58 | Prop | External data-tree-ellipsis CSS; accessible label remains complete. | 🟢 Verified |
| `filter` · API:L59 | Prop | Search/filter algorithms deferred; caller may author hidden state and refresh. | ⏭️ Intentionally omitted |
| `get-children` · API:L60 | Prop | Native index node.children references actual children; no callback data getter. | 🟢 Verified |
| `indent` · API:L61 | Prop | External --mui-tree-indent logical CSS length. | 🟢 Verified |
| `indeterminate-keys` · API:L62 | Prop | Real checkbox.indeterminate; derived in cascade mode, authored in independent mode. | 🟢 Verified |
| `keyboard` · API:L63 | Prop | Optional enhancement supplies outline shortcuts; native Tab/Enter/Space retained, no ARIA-tree mode. | 🟢 Verified |
| `key-field` · API:L64 | Prop | Required stable data-tree-key strings; numbers are not coerced. | 🟢 Verified |
| `label-field` · API:L65 | Prop | Named authored data-tree-label, re-read on refresh/typeahead. | 🟢 Verified |
| `disabled-field` · API:L66 | Prop | data-tree-disabled and native disabled controls; exact boundaries documented. | 🟢 Verified |
| `node-props` · API:L67 | Prop | Author native attributes directly; no callback prop forwarding. | 🟢 Verified |
| `multiple` · API:L68 | Prop | Independent single/multiple selection option, not checked-field semantics. | 🟢 Verified |
| `on-load` · API:L69 | Callback | Caller load(node,{signal}) returns bounded fresh native nodes and optional cleanup. | 🟢 Verified |
| `override-default-node-click-behavior` · API:L70 | Prop | No override dispatcher; native controls each own one action. | ⏭️ Intentionally omitted |
| `pattern` · API:L71 | Prop | No reactive filtering/pattern model. | ⏭️ Intentionally omitted |
| `render-label` · API:L72 | Prop | Authored native label/button/link; no VNode result. | 🟢 Verified |
| `render-prefix` · API:L73 | Prop | Authored row content, not an invoked renderer. | 🟢 Verified |
| `render-suffix` · API:L74 | Prop | Authored native links/actions/content with unchanged behavior. | 🟢 Verified |
| `render-switcher-icon` · API:L75 | Prop | Browser disclosure marker; custom renderer/icon object excluded. | 🟢 Verified |
| `scrollbar-props` · API:L76 | Prop | Native page/container scrolling; no Scrollbar forwarding. | ⏭️ Intentionally omitted |
| `selectable` · API:L77 | Prop | Opt-in data-tree-select on a type=button label; static groups/links are not selected. | 🟢 Verified |
| `selected-keys` · API:L78 | Prop | Real selection-button aria-pressed state and silent setSelectedKeys. | 🟢 Verified |
| `show-irrelevant-nodes` · API:L79 | Prop | No filter result renderer or filter memoization. | ⏭️ Intentionally omitted |
| `show-line` · API:L80 | Prop | data-tree-lines external logical borders. | 🟢 Verified |
| `spin-props` · API:L81 | Prop | Native aria-busy and plain CSS indication; no Spin runtime. | ⏭️ Intentionally omitted |
| `virtual-scroll` · API:L82 | Prop | Native nested DOM/forms retained; Virtual List is not silently injected. | ⏭️ Intentionally omitted |
| `watch-props` · API:L83 | Prop | Explicit setters/refresh/native defaults; no reactive prop watcher. | ⏭️ Intentionally omitted |
| `on-dragend` · API:L84 | Callback | No managed drag state/notifications. | ⏭️ Intentionally omitted |
| `on-dragenter` · API:L85 | Callback | No managed drag state/notifications. | ⏭️ Intentionally omitted |
| `on-dragleave` · API:L86 | Callback | No managed drag state/notifications. | ⏭️ Intentionally omitted |
| `on-dragstart` · API:L87 | Callback | No managed drag state/notifications. | ⏭️ Intentionally omitted |
| `on-drop` · API:L88 | Callback | No managed reparenting/drop notifications. | ⏭️ Intentionally omitted |
| `on-update:checked-keys` · API:L89 | Callback | One mui:tree-check after real native change; includes keys/nodes and source node. | 🟢 Verified |
| `on-update:indeterminate-keys` · API:L90 | Callback | Same single check notification includes indeterminateKeys; no duplicate event. | 🟢 Verified |
| `on-update:expanded-keys` · API:L91 | Callback | One mui:tree-expand for native/keyboard user expansion, not programmatic setters. | 🟢 Verified |
| `on-update:selected-keys` · API:L92 | Callback | One mui:tree-select after uncancelled selection-button activation. | 🟢 Verified |

### TreeOption Properties

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `key` · API:L98 | Record field | Stable unique string attribute on native li; strict bounded keys. | 🟢 Verified |
| `label` · API:L99 | Record field | Original native label node and accessible name. | 🟢 Verified |
| `checkboxDisabled?` · API:L100 | Record field | Native checkbox disabled/fieldset behavior; a cascade barrier. | 🟢 Verified |
| `children?` · API:L101 | Record field | Native branch list, indexed without cloning/re-rendering. | 🟢 Verified |
| `disabled?` · API:L102 | Record field | Node-local interaction disable; descendants independent unless natively disabled/inert. | 🟢 Verified |
| `isLeaf?` · API:L103 | Record field | No details means leaf; empty data-tree-lazy distinguishes unknown branch. | 🟢 Verified |
| `prefix?` · API:L104 | Record field | Authored native content, not a VNode callback. | 🟢 Verified |
| `suffix?` · API:L105 | Record field | Authored native content/actions, not a VNode callback. | 🟢 Verified |

### Tree Slots

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `empty` · API:L111 | Slot | Author an empty-state paragraph outside the list; caller owns visibility. | 🟢 Verified |

### Tree Methods

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `scrollTo` · API:L119 | Method | Source virtual-scroll method omitted; separate native reveal(key) opens known ancestors. | ⏭️ Intentionally omitted |
| `getCheckedData` · API:L120 | Method | Returns keys and native node records; optional reporting strategy. | 🟢 Verified |
| `getIndeterminateData` · API:L121 | Method | Returns keys/native nodes with real indeterminate checkboxes. | 🟢 Verified |

### Exported helper

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `treeGetClickTarget` · API:L137 | Method | No source CSS-class click classifier export; scoped native targets already own their actions. | ⏭️ Intentionally omitted |

### ScrollTo overloads

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `scrollTo(x, y)` · API:L127 | Method overload | Use native scrolling separately; no virtual coordinate contract. | ⏭️ Intentionally omitted |
| `scrollTo({ left, top, debounce })` · API:L128 | Method overload | No virtual scrolling overload. | ⏭️ Intentionally omitted |
| `scrollTo({ index, debounce })` · API:L129 | Method overload | No flattened virtual index contract. | ⏭️ Intentionally omitted |
| `scrollTo({ key, debounce })` · API:L130 | Method overload | Native reveal is distinct, without virtual/smooth/debounce semantics. | ⏭️ Intentionally omitted |
| `scrollTo({ position, debounce })` · API:L131 | Method overload | Native page/container scrolling remains available. | ⏭️ Intentionally omitted |

### ScrollTo option fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `left` · API:L128 | Record field | No virtual horizontal coordinate. | ⏭️ Intentionally omitted |
| `top` · API:L128 | Record field | No virtual vertical coordinate. | ⏭️ Intentionally omitted |
| `index` · API:L129 | Record field | No virtual flattened index. | ⏭️ Intentionally omitted |
| `key` · API:L130 | Record field | Source scroll-option field omitted; native reveal has its own strict string key. | ⏭️ Intentionally omitted |
| `position` · API:L131 | Record field | No virtual top/bottom target. | ⏭️ Intentionally omitted |
| `debounce` · API:L128 | Record field | No debounce option/promise. | ⏭️ Intentionally omitted |

### Tree Props: allow-drop inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `allow-drop.dropPosition` · API:L37 | Inline record field | Drag/drop context omitted. | ⏭️ Intentionally omitted |
| `allow-drop.node` · API:L37 | Inline record field | Drag/drop context omitted. | ⏭️ Intentionally omitted |
| `allow-drop.phase` · API:L37 | Inline record field | Drag/drop context omitted. | ⏭️ Intentionally omitted |

### Tree Props: node-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `node-props.option` · API:L67 | Inline record field | No callback data-renderer object; author attributes directly. | ⏭️ Intentionally omitted |

### Tree Props: override-default-node-click-behavior inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `override-default-node-click-behavior.option` · API:L70 | Inline record field | No click-override dispatcher. | ⏭️ Intentionally omitted |

### Tree Props: render-label inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-label.option` · API:L72 | Inline record field | No render callback record. | ⏭️ Intentionally omitted |
| `render-label.checked` · API:L72 | Inline record field | Read native checkedness separately; no VNode callback. | ⏭️ Intentionally omitted |
| `render-label.selected` · API:L72 | Inline record field | Read native selection separately; no VNode callback. | ⏭️ Intentionally omitted |

### Tree Props: render-prefix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-prefix.option` · API:L73 | Inline record field | No render callback record. | ⏭️ Intentionally omitted |
| `render-prefix.checked` · API:L73 | Inline record field | Native state is not a renderer context. | ⏭️ Intentionally omitted |
| `render-prefix.selected` · API:L73 | Inline record field | Native state is not a renderer context. | ⏭️ Intentionally omitted |

### Tree Props: render-suffix inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-suffix.option` · API:L74 | Inline record field | No render callback record. | ⏭️ Intentionally omitted |
| `render-suffix.checked` · API:L74 | Inline record field | Native state is not a renderer context. | ⏭️ Intentionally omitted |
| `render-suffix.selected` · API:L74 | Inline record field | Native state is not a renderer context. | ⏭️ Intentionally omitted |

### Tree Props: render-switcher-icon inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-switcher-icon.option` · API:L75 | Inline record field | Native summary marker, no callback record. | ⏭️ Intentionally omitted |
| `render-switcher-icon.expanded` · API:L75 | Inline record field | Native details.open, no icon renderer. | ⏭️ Intentionally omitted |
| `render-switcher-icon.selected` · API:L75 | Inline record field | Selection stays on its native button. | ⏭️ Intentionally omitted |

### Tree Props: spin-props inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `spin-props.strokeWidth?` · API:L81 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.stroke?` · API:L81 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.scale?` · API:L81 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |
| `spin-props.radius?` · API:L81 | Inline record field | No Spin/icon geometry. | ⏭️ Intentionally omitted |

### Tree Props: on-dragend inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-dragend.node` · API:L84 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |
| `on-dragend.event` · API:L84 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |

### Tree Props: on-dragenter inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-dragenter.node` · API:L85 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |
| `on-dragenter.event` · API:L85 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |

### Tree Props: on-dragleave inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-dragleave.node` · API:L86 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |
| `on-dragleave.event` · API:L86 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |

### Tree Props: on-dragstart inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-dragstart.node` · API:L87 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |
| `on-dragstart.event` · API:L87 | Inline record field | No managed drag payload. | ⏭️ Intentionally omitted |

### Tree Props: on-drop inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `on-drop.node` · API:L88 | Inline record field | No managed drop payload. | ⏭️ Intentionally omitted |
| `on-drop.dragNode` · API:L88 | Inline record field | No managed drop payload. | ⏭️ Intentionally omitted |
| `on-drop.dropPosition` · API:L88 | Inline record field | No managed drop payload. | ⏭️ Intentionally omitted |
| `on-drop.event` · API:L88 | Inline record field | No managed drop payload. | ⏭️ Intentionally omitted |

### Tree Methods: getCheckedData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getCheckedData.keys` · API:L120 | Inline record field | Strict string keys in document order. | 🟢 Verified |
| `getCheckedData.options` · API:L120 | Inline record field | Adapted as nodes: real native node records, not TreeOption/null data objects. | 🟢 Verified |

### Tree Methods: getIndeterminateData inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `getIndeterminateData.keys` · API:L121 | Inline record field | Keys with native indeterminate state. | 🟢 Verified |
| `getIndeterminateData.options` · API:L121 | Inline record field | Adapted as nodes: actual native records. | 🟢 Verified |

### Named public type supplement

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `ScrollTo` · API:L126 | Type supplement | Virtual-list overload interface intentionally not reproduced. | ⏭️ Intentionally omitted |

### Source-only supplements

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NTree` · [exports][exports] | Export supplement | No Vue alias/custom-element redefinition. | ⏭️ Intentionally omitted |
| `treeProps` · [exports][exports] | Export supplement | No runtime framework schema. | ⏭️ Intentionally omitted |
| `TreeProps` · [exports][exports] | Type supplement | No ExtractPublicPropTypes compatibility. | ⏭️ Intentionally omitted |
| `TreeSlots` · [tree][tree] | Type supplement | Source default/empty VNode slot declarations are not native slot objects. | ⏭️ Intentionally omitted |
| `TreeInst` · [interface][interface] | Type supplement | Native TreeController is a distinct API, not a vueuc instance. | ⏭️ Intentionally omitted |
| `TreeOption` · [interface][interface] | Type supplement | No source Record data object type; native TreeNode references DOM. | ⏭️ Intentionally omitted |
| `TreeDragInfo` · [interface][interface] | Type supplement | Source node/event drag record excluded. | ⏭️ Intentionally omitted |
| `TreeDropInfo` · [interface][interface] | Type supplement | Source node/dragNode/dropPosition/event record excluded. | ⏭️ Intentionally omitted |
| `TreeOverrideNodeClickBehavior` · [interface][interface] | Type supplement | No click dispatcher callback type. | ⏭️ Intentionally omitted |
| `TreeOverrideNodeClickBehaviorReturn` · [interface][interface] | Type supplement | No toggleSelect/toggleExpand/toggleCheck/default/none union dispatcher. | ⏭️ Intentionally omitted |
| `TreeSpinProps` · [public][public] | Type supplement | Opaque SharedSpinProps alias not imported. | ⏭️ Intentionally omitted |
| `disabled` · [tree][tree] | Prop supplement | Root data-tree-disabled blocks tree interaction; native fieldset disabled owns form omission. | 🟢 Verified |
| `leafOnly` · [tree][tree] | Deprecated prop supplement | Source alias excluded; use explicit child report when appropriate. | ⏭️ Intentionally omitted |
| `onDragover` · [tree][tree] | Callback supplement | No managed dragover prevention/payload. | ⏭️ Intentionally omitted |
| `onUpdateCheckedKeys` · [tree][tree] | Callback alias supplement | Same single native mui:tree-check adaptation as colon spelling. | 🟢 Verified |
| `onUpdateIndeterminateKeys` · [tree][tree] | Callback alias supplement | Same check event carries indeterminateKeys; no duplicate alias emission. | 🟢 Verified |
| `onUpdateExpandedKeys` · [tree][tree] | Callback alias supplement | Same mui:tree-expand adaptation. | 🟢 Verified |
| `onUpdateSelectedKeys` · [tree][tree] | Callback alias supplement | Same mui:tree-select adaptation. | 🟢 Verified |
| `treeSharedProps` · [tree][tree] | Source export supplement | No shared reactive prop schema/provider. | ⏭️ Intentionally omitted |
| `Key` · [interface][interface] | Type supplement | Strict native strings; source numeric-key alternative deliberately excluded. | 🟢 Verified |
| `OnLoad` · [interface][interface] | Type supplement | Explicit native load result, AbortSignal and lifetime guards, not Promise<unknown> mutation. | 🟢 Verified |
| `TreeOptionBase` · [interface][interface] | Type supplement | Source optional key/label/data fields not reproduced; native anatomy is required. | ⏭️ Intentionally omitted |
| `TreeOptions` · [interface][interface] | Type supplement | No TreeOption[] rendering model. | ⏭️ Intentionally omitted |
| `TreeRenderProps` · [interface][interface] | Type supplement | Source option/checked/selected callback record excluded. | ⏭️ Intentionally omitted |
| `internalTreeSelect`, `internalScrollable`, `internalScrollablePadding`, `internalRenderEmpty`, `internalHighlightKeySet`, `internalUnifySelectCheck`, `internalCheckboxFocusable`, `internalFocusable` · [tree][tree] | Internal prop group supplement | Eight source-only integration identities; no injection, unified checks/selection or hidden renderer. Future consumers compose real hierarchy ownership explicitly. | ⏭️ Intentionally omitted |
| `ThemeProps` · [tree][tree] | Mixin group supplement | Framework theme/config/RTL injection excluded; authored direction and external CSS retained separately. | ⏭️ Intentionally omitted |
| `RenderLabel`, `RenderPrefix`, `RenderSuffix`, `RenderSwitcherIcon`, `TreeNodeProps`, `CheckOnClick`, `GetChildren`, `DropPosition`, `AllowDrop` · [interface][interface] | Type alias group supplement | Nine source renderer/click/data/drag alias identities remain traceable; no framework callback type compatibility. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/demos/enUS/index.demo-entry.md
[tree]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/Tree.tsx
[node]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/TreeNode.tsx
[keyboard]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/keyboard.tsx
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/interface.ts
[utils]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/utils.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tree/src/public-types.ts
