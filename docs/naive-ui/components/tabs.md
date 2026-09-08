# Tabs

**🟢 Verified for retained native paired Tabs/Tab/TabPane scope.**
All **44 original identities** remain: 43 public table rows plus the original addable
inline field. Six source-only groups make **50 rows: 40 Verified adapted targets,
10 intentional omissions**. This is not renderer or controlled-Vue API parity.

## Baseline and delivery

Historical [navigation.ts](../../../src/components/navigation.ts) generates flat core tab
buttons and selects by index; it remains unchanged. The new
[Tabs controller](../../../src/components/tabs/tabs.ts) adopts existing labelled buttons
and panes with explicit stable string keys/IDs and validates one-to-one associations.

- **HTML:** native type=button tabs, authored tablist/bar/pane/message regions, original pane
  state and separate add/close controls or Delete intent.
- **JS:** actual roles/selection/roving focus, automatic/manual keyboard activation, async
  boolean leave guards, stale-request/association protection, refresh and ownership cleanup.
- **CSS:** independent external bar/line/card/segment, placements, overflow, indicator,
  focus/motion/forced-color/print rules; no measured animation engine.
- **Evidence:** [native API/loading/limits/acceptance](../../components/tabs.md),
  [demo](../../../demo/components/tabs.html), [tests](../../../tests/tabs.test.ts).

Tabs have their own small coupled focus/selection implementation, not an imported menu or
popup engine with inappropriate typeahead/hidden-ancestor policy. Only a tiny existing
owned-attribute utility is reused. No nodes, IDs, renderer or provider are generated.

## Upstream implementation evidence

The original targeted [Tab guard review](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tab.tsx#L40-L165)
and [TabPane ownership](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/TabPane.tsx#L55-L83)
remain provenance. This migration read those complete files plus
[Tabs declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tabs.tsx#L70-L128)
and [interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/interface.ts).
Upstream Tab increments a change ID around Promise-based leave decisions. The native target
keeps that useful outcome boundary while independently establishing full retained ARIA,
focus, cancellation, reentrant bookkeeping and DOM ownership.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native actions and stable authored child/event ownership.
**Next task:** Collapse; global P3 remains incomplete.

1. [x] **Adopt tab anatomy.** Native paired buttons/panes, names/IDs/ARIA and visible no-JS
   content accepted without destroying or cloning application nodes.
2. [x] **Complete movement rules.** Disabled skipping, horizontal/vertical/RTL arrows,
   Home/End, automatic/manual activation and native Tab/Enter/Space accepted.
3. [x] **Resolve asynchronous changes.** Boolean leave guards, errors, supersession,
   reentrant request publication and captured add/close intents verified.
4. [x] **Test active-tab replacement.** Nested focus recovery, node/ID replacement, selected
   removal, empty state, scrolling and reconnect restoration verified.

### Native primitives and fallback

The browser has no general tabs element, so a small explicit controller supplies the
validated tablist/tab/tabpanel model. Inactive panes use native hidden, preserving inputs
and listeners. Without JS all titled panes remain readable in authored order; optional
fragment navigation belongs outside the enhanced button-only tablist. No popup/menu,
Shadow DOM, lazy renderer or style-text engine is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/tabs)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **43 public rows + 1 original inline field + 6 source-only additions = 50**.
Reference definitions preserve original owner/name/source-line identities. **ADAPTED**
means the linked native contract has evidence, not identical defaults, numeric/VNode shapes,
callback arrays or renderer behavior. Omitted rows receive no implementation credit.

### Tabs Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`addable`][a36] | Prop | ADAPTED authored add button outside the tablist. | 🟢 Verified | Intent only; application clones/adds a pair. Not generated card-only UI. |
| [`add-tab-class`][a37] | Prop | ADAPTED authored add-control class. | 🟢 Verified | No render-prop forwarding. |
| [`add-tab-style`][a38] | Prop | ADAPTED external add-control CSS. | 🟢 Verified | No style-object injection. |
| [`animated`][a39] | Prop | ADAPTED opt-in opacity entrance class. | 🟢 Verified | External reduced-motion rules; no measured transition/slide engine. |
| [`bar-width`][a40] | Prop | ADAPTED external selected-indicator width token. | 🟢 Verified | Per-tab pseudo-element, not runtime geometry. |
| [`center-active-tab`][a41] | Prop | ADAPTED native axis-aware centering option/method. | 🟢 Verified | Native scrolling, with explicit limits; not a width-measurement observer. |
| [`closable`][a42] | Prop | ADAPTED marker/external close controls/Delete intent. | 🟢 Verified | No nested close button or automatic application removal; not restricted by CSS type. |
| [`default-value`][a43] | Prop | ADAPTED one-time available string-key default. | 🟢 Verified | Explicit value wins; refresh does not replay defaults. |
| [`justify-content`][a44] | Prop | ADAPTED external flex justification token. | 🟢 Verified | Authored stylesheet values, not JS prop forwarding. |
| [`size`][a45] | Prop | ADAPTED small/default medium/large CSS classes. | 🟢 Verified | No provider/measurement requirement. |
| [`pane-class`][a46] | Prop | ADAPTED authored pane classes. | 🟢 Verified | Original nodes/state retained. |
| [`pane-style`][a47] | Prop | ADAPTED external pane CSS. | 🟢 Verified | No inline style objects. |
| [`pane-wrapper-class`][a48] | Prop | ADAPTED authored direct wrapper class. | 🟢 Verified | One validated pane wrapper, no hidden clone. |
| [`pane-wrapper-style`][a49] | Prop | ADAPTED external wrapper CSS. | 🟢 Verified | Native grid/flow layout. |
| [`placement`][a50] | Prop | ADAPTED six visual placements with logical DOM order. | 🟢 Verified | Side orientation/RTL, explicit visual-versus-DOM policy; no segment restriction parity. |
| [`show-scroll-button`][a51] | Prop | No generated scroll controls. | ⏭️ Intentionally omitted | Native strip overflow/focus scrolling and explicit method instead. |
| [`tab-class`][a52] | Prop | ADAPTED native tab-button classes. | 🟢 Verified | One semantic owner, no generated labels. |
| [`tab-style`][a53] | Prop | ADAPTED external tab CSS. | 🟢 Verified | No style object/renderer. |
| [`tabs-padding`][a54] | Prop | ADAPTED logical strip-padding token. | 🟢 Verified | Native CSS owns dimensions. |
| [`trigger`][a55] | Prop | ADAPTED native click and automatic/manual keyboard policy. | 🟢 Verified | Hover activation excluded; no doubled Enter/Space or focus-click guards. |
| [`type`][a56] | Prop | ADAPTED bar/line/card/segment data/CSS presentation. | 🟢 Verified | No constructor/render-mode switch. |
| [`value`][a57] | Prop | ADAPTED validated string selection/current getter. | 🟢 Verified | Direct setter silent/guard-bypassing; null only when no tab available. |
| [`on-add`][a58] | Callback | ADAPTED mui:tabs-add native intent. | 🟢 Verified | Application owns data/DOM creation. |
| [`on-before-leave`][a59] | Callback | ADAPTED boolean/Promise guard. | 🟢 Verified | False/error preserve old pane; explicit error and stale/reentrant request protection. |
| [`on-close`][a60] | Callback | ADAPTED captured mui:tabs-close intent. | 🟢 Verified | Retargeted controls cannot close another pane; app owns removal. |
| [`on-update:value`][a61] | Callback | ADAPTED mui:tabs-change after valid user commit. | 🟢 Verified | No user event for property/default/recovery changes or stale requests. |

### TabPane Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`closable`][a67] | Prop | ADAPTED paired pane/tab closable marker or external control. | 🟢 Verified | Delete/captured close intent; no automatic pane destruction. |
| [`disabled`][a68] | Prop | ADAPTED associated native tab-button disabled state. | 🟢 Verified | Skip unavailable tabs; deliberate empty/replacement policy. |
| [`display-directive`][a69] | Prop | No if/show/lazy renderer. | ⏭️ Intentionally omitted | Original panes persist and use native hidden. |
| [`name`][a70] | Prop | ADAPTED paired string key and authored pane ID. | 🟢 Verified | Optional pane key mirror must agree; no numeric coercion. |
| [`tab`][a71] | Prop | ADAPTED original native button-label content. | 🟢 Verified | No VNode/function renderer. |
| [`tab-props`][a72] | Prop | No arbitrary object forwarding. | ⏭️ Intentionally omitted | Author validated native tab attributes directly. |

### Tab Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`closable`][a78] | Prop | ADAPTED close marker/intent on a paired tab. | 🟢 Verified | Label-only Tab widgets omitted; no nested action buttons. |
| [`disabled`][a79] | Prop | ADAPTED native button disabling. | 🟢 Verified | No action/close request from unavailable tabs. |
| [`name`][a80] | Prop | ADAPTED unique string key with required pane target. | 🟢 Verified | No unassociated tab labels or option-object API. |

### Tabs Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`][a86] | Slot | ADAPTED authored bar/list/panes/messages structure. | 🟢 Verified | Stable original DOM, templates remain inert unless app instantiates them. |
| [`prefix`][a87] | Slot | ADAPTED authored prefix outside tablist. | 🟢 Verified | Native DOM/focus order remains explicit. |
| [`suffix`][a88] | Slot | ADAPTED authored suffix/extra outside tablist. | 🟢 Verified | No arbitrary action roles mixed into tablist. |

### TabPane Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`][a94] | Slot | ADAPTED retained pane content. | 🟢 Verified | Native form state, listeners and nested tabs survive switches. |
| [`tab`][a95] | Slot | ADAPTED paired native label markup. | 🟢 Verified | Explicit names, no renderer. |

### Tab Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`][a101] | Slot | ADAPTED authored paired tab-button label. | 🟢 Verified | No generated fallback label or unpaired Tab surface. |

### Tabs Methods

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollToCurrentTab`][a107] | Method | ADAPTED native nearest/centered scroll request. | 🟢 Verified | Boolean actual availability; no custom geometry engine. |
| [`syncBarPosition`][a108] | Method | No measurement-bar synchronization API. | ⏭️ Intentionally omitted | CSS indicator needs no fake successful no-op. |

### Tabs Props: addable inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`addable.disabled?`][a36] | Inline record field | ADAPTED native disabled add button. | 🟢 Verified | Original inline identity preserved; no object-constructor API. |

### Source-only supplements — six explicit groups

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`TabsProps`][tabs-type], [`TabProps`][tab-type], [`TabPaneProps`][pane-type], [`TabsInst` and callback/type aliases][types] | Source-only type group | No Vue instance/prop/callback alias surface. | ⏭️ Intentionally omitted | Native controller/options/guard shapes are independent; original method rows remain. |
| [`onUpdateValue`, `onActiveNameChange`, `activeName`, `labelSize`][s116] | Source-only aliases | No callback/deprecated value/size aliases. | ⏭️ Intentionally omitted | Explicit native values/events/CSS instead. |
| [`internalLeftPadded`, `internalAddable`, `internalCreatedByPane`][tab11] | Source-only Tab internals | No generated-tab/internal renderer protocol. | ⏭️ Intentionally omitted | Authored pair/template ownership. |
| [`label`, `TabPanel`][pane32] | Source-only deprecated/alias group | No deprecated label or component-name alias. | ⏭️ Intentionally omitted | Native label/pane markers; alias declared at line 49. |
| [`TabPaneSlots.prefix`, `TabPaneSlots.suffix`][pane39] | Source-only slot declarations | No extra companion slot API. | ⏭️ Intentionally omitted | Source body renders default content; root prefix/suffix rows remain independently supported. |
| [`TabsInjection`, `tabsInjectionKey`, `useTheme.props`][inject21] | Source-only provider/theme group | No injection/theme/renderer coordination. | ⏭️ Intentionally omitted | External CSS and explicit local state; theme spread at Tabs.tsx line 71. |

[a36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L36
[a37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L37
[a38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L38
[a39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L39
[a40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L40
[a41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L41
[a42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L42
[a43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L43
[a44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L44
[a45]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L45
[a46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L46
[a47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L47
[a48]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L48
[a49]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L49
[a50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L50
[a51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L51
[a52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L52
[a53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L53
[a54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L54
[a55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L55
[a56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L56
[a57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L57
[a58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L58
[a59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L59
[a60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L60
[a61]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L61
[a67]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L67
[a68]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L68
[a69]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L69
[a70]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L70
[a71]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L71
[a72]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L72
[a78]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L78
[a79]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L79
[a80]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L80
[a86]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L86
[a87]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L87
[a88]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L88
[a94]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L94
[a95]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L95
[a101]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L101
[a107]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L107
[a108]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/demos/enUS/index.demo-entry.md#L108
[types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/interface.ts#L4-L51
[tabs-type]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tabs.tsx#L128
[tab-type]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tab.tsx#L17
[pane-type]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/TabPane.tsx#L37
[s116]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tabs.tsx#L116-L125
[tab11]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/Tab.tsx#L11-L14
[pane32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/TabPane.tsx#L32-L49
[pane39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/TabPane.tsx#L39-L44
[inject21]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tabs/src/interface.ts#L21-L46

<!-- END PINNED API INVENTORY -->
