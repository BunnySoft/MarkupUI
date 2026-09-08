# Collapse

**🟢 Verified for retained native Collapse/CollapseItem scope.**
All **27 original identities** remain: 19 public rows and eight original inline fields.
Six source-only additions make **33 rows: 19 Verified adapted targets, 14 omissions**.

## Baseline and delivery

Historical [dynamic.ts](../../../src/components/dynamic.ts) generates a legacy accordion
header button/content wrapper and remains unchanged. The new native baseline is authored
details/summary with [external CSS](../../../src/components/collapse/collapse.css).
The optional [small helper](../../../src/components/collapse/collapse.ts) adds only actual
key aggregation, scoped exclusivity, disabled activation, events and ownership cleanup.

- **HTML:** first meaningful native summary, direct authored content and sibling header-extra
  actions; existing nodes/listeners/templates and open state remain native.
- **JS:** string names, one-time defaults/live open requests, root-specific names, disabled
  click prevention without inert/hidden labels, and explicit native toggle/header reporting.
- **CSS:** spacing/borders/focus/RTL, native or authored arrows and optional arrow-only motion.
  No height measurement, renderer or CollapseTransition dependency.
- **Evidence:** [API/loading/limits/acceptance](../../components/collapse.md),
  [demo](../../../demo/components/collapse.html), [tests](../../../tests/collapse.test.ts).

## Upstream source evidence

Pinned [Collapse state/events](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx#L30-L210),
[CollapseItem trigger/disabled/header behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItem.tsx#L26-L180)
and [content rendering](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItemContent.tsx)
were read. The native design replaces controlled/default merging, generated random names,
rendered header trigger areas and mount/transition machinery with authored disclosure.
Disabled source behavior blocks header activation, not explicit controlled expansion.

## Migration steps

**Delivery phase:** P3 — interactions. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native ownership/disclosure contracts; no mandatory animation package.
**Next task:** Anchor, then Back Top. CollapseTransition remains a separate later route.

1. [x] **Adopt disclosure markup.** Native summaries/content and valid extra actions retain
   original DOM; legacy generated anatomy remains unchanged rather than being silently upgraded.
2. [x] **Specify group state.** String names/defaults/native open, exclusive naming scope,
   disabled activation and native event timing accepted.
3. [x] **Separate presentation.** External indicators/borders/spacing/RTL/motion/print with
   no height observer, renderer or duplicated expanded semantics.
4. [x] **Exercise nested panels.** Pointer/native keyboard, disabled labels, nested/independent
   groups, transfers/refresh/focus and no-JS disclosures verified.

### Native primitives and fallback

CSS-only details/summary is usable without a controller. Native names are document-scoped,
so authors must avoid cross-group collisions and verify browser support. The helper isolates
names while bound, supplies a small open-mutation exclusivity fallback and real disabled
activation prevention. Without it, disabled markers do not claim to disable native summaries.
Print follows native open state; hidden content is not advertised as universally printed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/collapse)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **19 public rows + 8 original inline fields + 6 source-only additions = 33**.
All original owner/name/source-line identities remain. **ADAPTED** denotes the linked native
contract, not identical Vue props, numeric/random keys, controlled callbacks or slot objects.
Omissions receive no implementation credit.

### Collapse Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`accordion`][a27] | Prop | ADAPTED scoped exclusive native disclosures. | 🟢 Verified | Root-unique names and fallback; author names are document-global outside helper ownership. |
| [`arrow-placement`][a28] | Prop | ADAPTED custom-arrow left/right CSS/RTL order. | 🟢 Verified | Native marker otherwise remains browser-owned; no JS placement engine. |
| [`default-expanded-names`][a29] | Prop | ADAPTED one-time string/scalar/array/null defaults. | 🟢 Verified | Explicit live option wins; native open persists and defaults never replay. |
| [`display-directive`][a30] | Prop | No if/show renderer. | ⏭️ Intentionally omitted | Native details preserves content and form state. |
| [`expanded-names`][a31] | Prop | ADAPTED validated native open requests and array getter. | 🟢 Verified | No continuous controlled lock; numeric names omitted. |
| [`trigger-areas`][a32] | Prop | No configurable main/arrow/extra trigger array. | ⏭️ Intentionally omitted | Native summary toggles; external sibling extra actions remain independent. |
| [`on-item-header-click`][a33] | Callback | ADAPTED mui:collapse-header-click after accepted native click. | 🟢 Verified | Final defaultPrevented/disabled checks and actual deferred state. |
| [`on-update:expanded-names`][a34] | Callback | ADAPTED mui:collapse-change reflecting native toggle. | 🟢 Verified | Async/coalesced; includes programmatic changes, not a fake user-only update. |

### CollapseItem Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`disabled`][a40] | Prop | ADAPTED data-collapse-disabled/setDisabled activation lock. | 🟢 Verified | Real click/Enter/Space prevention; readable focusable summary, no inert or fake expanded state. |
| [`display-directive`][a41] | Prop | No item renderer/mount directive. | ⏭️ Intentionally omitted | Original native content remains. |
| [`name`][a42] | Prop | ADAPTED unique explicit string data-collapse-key. | 🟢 Verified | Separate from native name grouping; no numeric/random identity. |
| [`title`][a43] | Prop | ADAPTED authored meaningful summary text/markup. | 🟢 Verified | No title-to-HTML renderer or generated label. |

### Collapse Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`arrow`][a49] | Slot | ADAPTED authored decorative arrow/native marker. | 🟢 Verified | External [open] CSS; no VNode slot callback. |
| [`default`][a50] | Slot | ADAPTED authored native items/content. | 🟢 Verified | Stable nodes/listeners/templates and explicit group boundaries. |
| [`header`][a51] | Slot | ADAPTED authored native summary/header content. | 🟢 Verified | No duplicated button/expanded semantics. |

### CollapseItem Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`arrow`][a57] | Slot | ADAPTED decorative native child/CSS. | 🟢 Verified | aria-hidden custom artwork, no icon dependency. |
| [`default`][a58] | Slot | ADAPTED original direct content region. | 🟢 Verified | Native hidden-by-details behavior; no state destruction. |
| [`header`][a59] | Slot | ADAPTED noninteractive native summary markup. | 🟢 Verified | Native keyboard and explicit disabled policy. |
| [`header-extra`][a60] | Slot | ADAPTED sibling extra region outside details/summary. | 🟢 Verified | Explicit native button type; no nested-button trap or unintended toggle. |

### Collapse Props: on-item-header-click inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`on-item-header-click.name`][a33] | Inline record field | ADAPTED string detail.name. | 🟢 Verified | Captured stable item identity, not numeric/random names. |
| [`on-item-header-click.expanded`][a33] | Inline record field | ADAPTED actual detail.expanded. | 🟢 Verified | State when the post-dispatch notification runs, not synchronous requested Vue state. |
| [`on-item-header-click.event`][a33] | Inline record field | ADAPTED original native MouseEvent. | 🟢 Verified | Disabled/canceled header clicks do not notify. |

### Collapse Slots: arrow inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`arrow.collapsed`][a49] | Inline record field | No renderer slot-prop object. | ⏭️ Intentionally omitted | Read native !details.open or style [open] instead. |

### Collapse Slots: header inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`header.collapsed`][a51] | Inline record field | No renderer slot-prop object. | ⏭️ Intentionally omitted | Native state remains available without pretending CSS emits callback props. |

### CollapseItem Slots: arrow inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`arrow.collapsed`][a57] | Inline record field | No item renderer slot object. | ⏭️ Intentionally omitted | Authored [open] CSS/native open property. |

### CollapseItem Slots: header inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`header.collapsed`][a59] | Inline record field | No item renderer slot object. | ⏭️ Intentionally omitted | Native summary/open state rather than function forwarding. |

### CollapseItem Slots: header-extra inline fields

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`header-extra.collapsed`][a60] | Inline record field | No extra renderer slot object. | ⏭️ Intentionally omitted | Sibling actions can explicitly read native item.open; not generated callbacks. |

### Source-only supplements — six explicit groups

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`CollapseSlots.header-extra`][s87] | Source-only root slot | No root fallback slot renderer. | ⏭️ Intentionally omitted | Each item authors its own safe sibling extras. |
| [`onUpdateExpandedNames`, `onExpandedNamesChange`][s60] | Source-only callback aliases | No alias/array compatibility. | ⏭️ Intentionally omitted | Explicit native change/header events instead. |
| [`CollapseProps`][collapse-type], [`CollapseItemProps`][item-type], [slot/header/update types][types] | Source-only type group | No Vue extracted-prop/slot aliases. | ⏭️ Intentionally omitted | Native controller/options/detail types are independent. |
| [`NCollapseInjection`, `collapseInjectionKey`, theme/RTL/cssVars][s90] | Source-only provider/theme group | No injection/config/style renderer. | ⏭️ Intentionally omitted | External CSS and native direction; theme spread at source line 31. |
| [`randomName`, `mergedNameRef`][item47] | Source-only identity defaults | No generated random item key. | ⏭️ Intentionally omitted | Explicit string data keys, distinct from helper-scoped native group names. |
| [`CollapseItemContent`, `useFalseUntilTruthy`, `NFadeInExpandTransition`][content] | Source-only render/transition group | No lazy mount/fade-height framework. | ⏭️ Intentionally omitted | Native details; CollapseTransition remains a separate later catalog route. |

[a27]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L27
[a28]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L28
[a29]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L29
[a30]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L30
[a31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L31
[a32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L32
[a33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L33
[a34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L34
[a40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L40
[a41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L41
[a42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L42
[a43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L43
[a49]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L49
[a50]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L50
[a51]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L51
[a57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L57
[a58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L58
[a59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L59
[a60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L60
[s87]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx#L87
[s60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx#L60-L78
[types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/interface.ts
[collapse-type]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx#L81
[item-type]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItem.tsx#L33
[s90]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/Collapse.tsx#L90-L103
[item47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItem.tsx#L47-L50
[content]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/src/CollapseItemContent.tsx

<!-- END PINNED API INVENTORY -->
