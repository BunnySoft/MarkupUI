# Transfer

**🟢 Verified retained native membership scope.** Two labelled unnamed native multi-selects,
actual option-node movement, separate staging, locked members, matched bulk operations and
explicit membership serialization. No renderer, provider, drag engine or virtualization.

[Canonical anatomy/acceptance](../../components/transfer.md) distinguishes target membership
from native highlighted options. Optional owned formdata serialization appends every member;
there is no hidden proxy or misleading named target multi-select.
The [existing widgets Transfer](../../../src/plugins/widgets.ts) is unchanged. The separate
Naive UI Legacy Transfer exclusion is not reopened by this component.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained scope.
**Next:** Data Table; Log, Infinite Scroll, Popselect and Split remain independent.

1. [x] **Choose accessible lists.** Native multi-selects/actions preserve actual options,
   labels, keyboard and explicit staging-versus-membership state.
2. [x] **Implement bounded transfer.** Unique string keys, append-in-origin-order movement,
   exact target-value ordering, locked members and independent defaults.
3. [x] **Scope filtering and scale.** Preserve hidden highlights/membership, move only
   eligible matching options, and keep all bounded native nodes mounted.
4. [x] **Verify transitions.** Tests/build/budgets plus Chromium membership/FormData/
   keyboard/filter/lock/reset/focus/ownership/no-JS/coexistence evidence.

### Native primitives and fallback

Native options move between two real selects rather than being rebuilt. The selects are
unnamed staging controls, never implicit membership serializers. No-JS keeps readable,
highlightable static lists and hides enhancement actions/submission. Normal disconnect
retains current native membership/order/highlights without restoring old removed data.

## Reference and review

- [Current official page](https://www.naiveui.com/en-US/os-theme/components/transfer):
  reviewed 2026-09-09, rendered Naive UI 2.45.3 despite HTTP 404.
- [Pinned API][api], [controller][controller], [data/check/filter rules][data],
  [interfaces][interface], [exports][exports], [public types][public].
- [Index](../index.md) · [Architecture](../architecture.md).

Revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**. The source builds reactive option/value
maps, filters each side and preserves disabled values during bulk clear/check operations.
Its target order follows the value array; source may duplicate target members via show-selected.
The native target instead moves one actual node between disjoint panes and documents append
order. Markdown lists disabled=true, while implementation uses undefined for form merging;
native HTML disabling is authoritative here.

**24 original API rows + eight original inline fields + 20 source supplements = 52 rows.**
All **32 original section/member/kind/API-line identities** remain in order.
`API:Lnn` denotes the exact pinned `[api]` URL below plus `#Lnn`.
Verified means the stated native adaptation, not framework/API compatibility.
All rows are resolved: **28 adapted native capabilities and 24 intentional omissions**.

<!-- BEGIN PINNED API INVENTORY -->

### Transfer Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `clear-text` · API:L23 | Prop | Authored remove/clear action text; locked/filtered scope explicit. | 🟢 Verified |
| `default-value` · API:L24 | Prop | Captured target membership or explicit defaultValue; separate from staging defaultSelected. | 🟢 Verified |
| `disabled` · API:L25 | Prop | Native select/fieldset disabling; either disabled pane disables the transfer unit. | 🟢 Verified |
| `filter` · API:L26 | Prop | Independent literal label matching per pane; arbitrary callback predicates excluded. | 🟢 Verified |
| `options` · API:L27 | Prop | Actual authored option nodes, not a value-object renderer. | 🟢 Verified |
| `render-source-label` · API:L28 | Prop | Authored plain native option labels; no VNode callback. | 🟢 Verified |
| `render-target-label` · API:L29 | Prop | Same actual option label follows the item; no per-side renderer. | 🟢 Verified |
| `render-source-list` · API:L30 | Prop | Authored native multi-select and actions, not a list render function. | 🟢 Verified |
| `render-target-list` · API:L31 | Prop | Authored native membership pane with independent staging. | 🟢 Verified |
| `select-all-text` · API:L32 | Prop | Authored highlight-matches and move-all-matches labels distinguish staging from membership. | 🟢 Verified |
| `show-selected` · API:L33 | Prop | Disjoint panes with one physical option per key; no duplicate selected source rows. | ⏭️ Intentionally omitted |
| `size` · API:L34 | Prop | External small/medium/large CSS; native size controls visible list rows separately. | 🟢 Verified |
| `source-filterable` · API:L35 | Prop | Optional labelled data-transfer-filter=source native input. | 🟢 Verified |
| `source-filter-placeholder` · API:L36 | Prop | Native input placeholder attribute. | 🟢 Verified |
| `source-title` · API:L37 | Prop | Authored native source heading/label; no render callback. | 🟢 Verified |
| `target-filterable` · API:L38 | Prop | Optional labelled target filter. | 🟢 Verified |
| `target-filter-placeholder` · API:L39 | Prop | Native target input placeholder, independent of source. | 🟢 Verified |
| `target-title` · API:L40 | Prop | Authored native target heading/label. | 🟢 Verified |
| `value` · API:L41 | Prop | Every target option key in DOM order; not selectedOptions. | 🟢 Verified |
| `on-update:value` · API:L42 | Callback | One mui:transfer-change for user membership movement; staging has a separate event. | 🟢 Verified |
| `virtual-scroll` · API:L43 | Prop | Bounded full native lists, no Virtual List/scrollbar runtime. | ⏭️ Intentionally omitted |

### TransferOption Type

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `label` · API:L49 | Record field | Native option label/text, safely preserved on movement. | 🟢 Verified |
| `value` · API:L50 | Record field | Unique nonempty native string key; numbers are not coerced. | 🟢 Verified |
| `disabled` · API:L51 | Record field | Native option.disabled locks membership movement; locked target keys still are members. | 🟢 Verified |

### Transfer Props: render-source-label inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-source-label.option` · API:L28 | Inline record field | No renderer argument object. | ⏭️ Intentionally omitted |

### Transfer Props: render-target-label inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-target-label.option` · API:L29 | Inline record field | No renderer argument object. | ⏭️ Intentionally omitted |

### Transfer Props: render-source-list inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-source-list.onCheck` · API:L30 | Inline record field | No custom list-render callback; explicit membership setters instead. | ⏭️ Intentionally omitted |
| `render-source-list.checkedOptions` · API:L30 | Inline record field | No VNode/data-option list; native membership/staging are distinct. | ⏭️ Intentionally omitted |
| `render-source-list.pattern` · API:L30 | Inline record field | Native filter input, not a renderer context. | ⏭️ Intentionally omitted |

### Transfer Props: render-target-list inline fields

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `render-target-list.onCheck` · API:L31 | Inline record field | No custom target-list renderer. | ⏭️ Intentionally omitted |
| `render-target-list.checkedOptions` · API:L31 | Inline record field | No checked-option renderer array. | ⏭️ Intentionally omitted |
| `render-target-list.pattern` · API:L31 | Inline record field | Native filter text, not a renderer argument. | ⏭️ Intentionally omitted |

### Source-only supplements

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NTransfer` · [exports][exports] | Export supplement | No Vue alias/custom-element replacement. | ⏭️ Intentionally omitted |
| `transferProps` · [exports][exports] | Export supplement | No runtime prop schema. | ⏭️ Intentionally omitted |
| `TransferProps` · [exports][exports] | Type supplement | No ExtractPublicPropTypes compatibility. | ⏭️ Intentionally omitted |
| `TransferOption` · [exports][exports] | Type alias supplement | Native options, not imported label/value data objects. | ⏭️ Intentionally omitted |
| `TransferRenderSourceLabel` · [exports][exports] | Type supplement | No source label VNode function. | ⏭️ Intentionally omitted |
| `TransferRenderTargetLabel` · [exports][exports] | Type supplement | No target label VNode function. | ⏭️ Intentionally omitted |
| `TransferRenderSourceList` · [exports][exports] | Type supplement | Source also uses this type for target rendering; neither callback renderer is reproduced. | ⏭️ Intentionally omitted |
| `TransferSize` · [public][public] | Type supplement | Native small/medium/large CSS choices. | 🟢 Verified |
| `filterable` · [controller][controller] | Deprecated prop supplement | Explicit source native filter; no deprecated prop registration. | 🟢 Verified |
| `onUpdateValue` · [controller][controller] | Callback alias supplement | Same single native membership notification as colon spelling. | 🟢 Verified |
| `onChange` · [controller][controller] | Deprecated callback supplement | Same native change adaptation, not duplicate alias emission. | 🟢 Verified |
| `Option` · [interface][interface] | Type supplement | Source label/value/disabled object interface is not the native node API. | ⏭️ Intentionally omitted |
| `OptionValue` · [interface][interface] | Type supplement | Strict string keys; numeric alternative excluded. | 🟢 Verified |
| `Filter` · [interface][interface] | Type supplement | No arbitrary pattern/option/from predicate callback. | ⏭️ Intentionally omitted |
| `RenderLabelProps` · [interface][interface] | Type supplement | No option renderer record. | ⏭️ Intentionally omitted |
| `RenderListProps` · [interface][interface] | Type supplement | No onCheck/checkedOptions/pattern VNode context. | ⏭️ Intentionally omitted |
| `OnUpdateValue` · [interface][interface] | Type supplement | Explicit readonly native membership string-array event. | 🟢 Verified |
| `TransferInjection`, `transferInjectionKey` · [interface][interface] | Internal group supplement | No reactive provider/value-set graph. | ⏭️ Intentionally omitted |
| `ThemeProps`, `useFormItem` · [controller][controller] | Mixin group supplement | No framework form/theme injection; native ownership and CSS used directly. | ⏭️ Intentionally omitted |
| `useTransferData` · [data][data] | Source helper supplement | Replaced by actual native option location and a bounded key index, not a parallel reactive array model. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/demos/enUS/index.demo-entry.md
[controller]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/src/Transfer.tsx
[data]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/src/use-transfer-data.ts
[interface]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/src/interface.ts
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/index.ts
[public]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/transfer/src/public-types.ts
