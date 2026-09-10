# Virtual List

**🟢 Verified retained fixed-height native scope; not framework or dynamic-size parity.**

The explicit [native controller and acceptance record](../../components/virtual-list.md)
uses a constrained native div/section viewport, authored ul/ol spacer, safe native li
factories, stable unique data keys and a bounded window. No Vue, vueuc, VDOM, row schema,
provider, custom scrollbar, network source or automatic child-component registration.
[Default-style audit](../../style-audit/components/virtual-list.md).

The [legacy advanced plugin](../../../src/plugins/advanced.ts) is unchanged. Its basic
`MuiVirtualList`/`mui-virtual-list` remains available through the old plugin; importing
the new helper does not redefine or register that element.

## Four completed steps

**Delivery phase:** P5 — bounded collections. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native P3 scrolling/focus and P4 actual-node/lifetime ownership.
**Next task:** Tree's native hierarchy foundation; other P5 routes remain independent.

1. [x] **Define item ownership.** Review pinned API/source and current reference page;
   retain all 29 original identities and add twelve explicitly classified declarations.
   Require fresh native li factories and a same-key updater; caller data owns remounts.
2. [x] **Bound the window.** Fixed positive CSS-pixel row size, native extent validation,
   at most 512 window rows plus one focused pin, at most 8,000,000 total CSS pixels.
3. [x] **Specify scrolling/focus.** Index/key/top/bottom/offset with start/center/end/nearest;
   native scrolling/keyboard, stable focused-row pin and viewport focus before key removal.
4. [x] **Test scale and mutation.** Targeted logic/DOM tests, Chromium 100k measurements,
   resize/hidden/zoom/RTL, updates, errors, native forms, cleanup, legacy coexistence and
   independent build budgets are recorded in the canonical component document.

### Native primitives and fallback

Author a meaningful static sample or application-owned paginated list **outside** the
initially hidden, empty enhancement viewport. The helper never deletes/adopts a fallback.
Clone native template content with `document.importNode(template.content.firstElementChild,
true)` and bind text/properties explicitly. No-JS keeps the authored alternative and no
dead enhancement controls. Fixed-height clipping is not dynamic layout support.

## Reference and review boundary

- [Current official page](https://www.naiveui.com/en-US/os-theme/components/virtual-list),
  rendered and reviewed 2026-09-09: Naive UI 2.45.3, Basic/Dynamic size/Scroll/Keep state
  demos and full API. Its SPA document returned HTTP 404 but the reference rendered.
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md).
- [Pinned wrapper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160)
  and [exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/index.ts#L1-L2).
- [Index/provenance](../index.md) · [Architecture](../architecture.md).

The wrapper delegates its algorithm and instance/scroll types to **vueuc**, wraps it in
`NxScrollbar`, forwards sizing/key/padding/resize settings and passes `{ item, index }`
through the default slot. Source-only object-valued `visibleItemsTag`, Vue prop extraction,
and exposed container/content getters were reviewed explicitly. No opaque vueuc type
members or hidden upstream algorithm are inferred.

**17 direct API rows + 12 original expanded declarations + one named public ScrollTo type
+ eleven source supplements = 41 tracker rows: 26 adapted, 15 intentionally omitted.**
All original section/source/kind identities remain in their original order. Verified
means the stated adaptation, never a drop-in prop/type/overload implementation.

<!-- BEGIN PINNED API INVENTORY -->

### Virtual List Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default-scroll-key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L24) | Prop | Explicit post-create `scrollTo({ key })`. | 🟢 Verified | Initial navigation, not a reactive/default/reset property. |
| [`default-scroll-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L25) | Prop | Explicit post-create `scrollTo({ index })`. | 🟢 Verified | Zero-based validated index; no keep-alive/default machinery. |
| [`ignore-item-resize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L26) | Prop | No per-item resize observation or toggle. | ⏭️ Intentionally omitted | Fixed-size rows only. |
| [`items`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L27) | Prop | `items` option and `setItems(array)`. | 🟢 Verified | Copied array, complete key/bounds validation; caller-owned objects. |
| [`item-resizable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L28) | Prop | No dynamic-height measuring framework. | ⏭️ Intentionally omitted | Reflowing/expandable row heights need another design. |
| [`item-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L29) | Prop | Fixed `rowSize`, in CSS pixels. | 🟢 Verified | Exact border-box height, not upstream minimum/estimate. |
| [`items-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L30) | Prop | Authored external list/row CSS. | 🟢 Verified | Static presentation only; numeric geometry belongs to helper. |
| [`key-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L31) | Prop | Required `key(item, index)` callback. | 🟢 Verified | Stable unique string/number keys; no field-name parser. |
| [`padding-top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L32) | Prop | No virtual padding option. | ⏭️ Intentionally omitted | Place authored content outside the viewport; internal vertical padding must be zero. |
| [`padding-bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L33) | Prop | No virtual padding option. | ⏭️ Intentionally omitted | No focusable/invisible padding elements. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L34) | Prop | Native viewport scrollbar. | ⏭️ Intentionally omitted | No Scrollbar prop forwarding or package. |
| [`visible-items-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L35) | Prop | Author native ul/ol and native li rows. | 🟢 Verified | Arbitrary tag/component objects excluded; native list semantics only. |
| [`visible-items-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L36) | Prop | Authored list attributes and optional `role=list`. | 🟢 Verified | No unrestricted object/renderer passthrough. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L37) | Callback | Native viewport `scroll` listener. | 🟢 Verified | No duplicate synthetic scroll; helper's own listener is passive and frame-coalesced. |
| [`on-wheel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L38) | Callback | Caller may listen for native `wheel`. | 🟢 Verified | Helper installs no wheel or drag handler. |
| [`on-resize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L39) | Callback | Caller-owned native ResizeObserver if notifications are needed. | 🟢 Verified | Helper observes only its viewport; `refresh()` fallback, no prop callback emulation. |

### Virtual List Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L45) | Method | Narrow synchronous `scrollTo(options)`. | 🟢 Verified | Exactly one target; no completion promise, left coordinate or smooth engine. |

### ScrollTo overloads

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollTo(x, y)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L51) | Method overload | No positional x/y overload. | ⏭️ Intentionally omitted | Use helper `{ top }`; native viewport scrolling remains available. |
| [`scrollTo({ left, top, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L53) | Method overload | `{ top }`, finite CSS pixels, clamped. | 🟢 Verified | Narrow vertical adaptation; left/debounce/behavior excluded below. |
| [`scrollTo({ index, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L59) | Method overload | `{ index, align? }`. | 🟢 Verified | Integer 0..count-1; start/center/end/nearest. |
| [`scrollTo({ key, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L64) | Method overload | `{ key, align? }`. | 🟢 Verified | Exact stable key lookup; missing keys reject before scrolling. |
| [`scrollTo({ position, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L69) | Method overload | `{ position: "top" \| "bottom" }`. | 🟢 Verified | Native extent clamping; empty list supported. |

### ScrollTo option fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L53) | Record field | No horizontal axis. | ⏭️ Intentionally omitted | This is a vertical collection, including RTL. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L54) | Record field | Finite CSS-pixel offset. | 🟢 Verified | Clamped to reachable native extent. |
| [`index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L59) | Record field | Zero-based dataset index. | 🟢 Verified | Global order and aria-posinset/setsize maintained. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L64) | Record field | Stable string or finite number. | 🟢 Verified | Numeric/string identities distinct; duplicates reject. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L69) | Record field | Top/bottom target. | 🟢 Verified | No overshoot or unreachable final row at supported bounds. |
| [`debounce`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L56) | Record field | No API debounce option. | ⏭️ Intentionally omitted | Native scroll/resize handling is frame-coalesced internally. |
| [`behavior`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L55) | Record field | No smooth/instant option passthrough. | ⏭️ Intentionally omitted | Immediate numeric scrollTop writes; no motion/completion promise. |

### Named public type supplement

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`ScrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L50) | Type supplement | Explicit `VirtualListScrollOptions` and controller method. | 🟢 Verified | Named interface identity preserved; narrowed targets/alignments documented above. |

### Source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`NVirtualList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/index.ts#L1) | Export supplement | No Vue component alias. | ⏭️ Intentionally omitted | Explicit helper; old custom element left untouched. |
| [`virtualListProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/index.ts#L1) | Export supplement | No runtime framework prop schema. | ⏭️ Intentionally omitted | Native markup plus narrow typed options. |
| [`VirtualListProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/index.ts#L2) | Type supplement | No ExtractPublicPropTypes compatibility. | ⏭️ Intentionally omitted | Independent `VirtualListOptions<T>` is not upstream props. |
| [`VirtualListInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/index.ts#L2) | Type supplement | Opaque vueuc instance type not reproduced. | ⏭️ Intentionally omitted | Native controller methods have their own declared contract. |
| [`getScrollContainer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Method supplement | Readonly controller `viewport`. | 🟢 Verified | Original native div/section, no component ref lookup. |
| [`getScrollContent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Method supplement | Readonly controller `list`. | 🟢 Verified | Authored ul/ol acts as the spacer. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Slot supplement | Required native `render`/`update`; optional template import. | 🟢 Verified | No unsafe HTML strings, VNodes or generic binding renderer. |
| [`default.item`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Slot field supplement | Caller data item passed directly to hooks. | 🟢 Verified | Remountable data and hook side effects remain caller-owned. |
| [`default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Slot field supplement | Frozen `context.index`, plus stable `context.key`. | 🟢 Verified | Index changes update retained rows without replacing keyed elements. |
| [`VirtualListItemData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Imported type supplement | Opaque external data type not copied. | ⏭️ Intentionally omitted | Generic caller domain data is not a vueuc type implementation. |
| [`VirtualListScrollToOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) | Imported type supplement | Opaque external overload type not copied. | ⏭️ Intentionally omitted | Public Markdown targets have explicit narrowed dispositions above. |

<!-- END PINNED API INVENTORY -->
