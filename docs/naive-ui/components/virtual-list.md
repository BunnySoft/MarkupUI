# Virtual List

**Plan: Planned. Current baseline: partial fixed-height advanced list; not parity-verified.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) windows stringified items with fixed height/overscan and emits visible ranges.

- **HTML:** labelled list and static/paginated fallback with authored item template.
- **JS:** stable keys, bounded DOM, scrolling/focus contracts and optional measured heights only after separate review.
- **CSS:** external viewport/item presentation; numeric positioning isolated.
- **Placement:** proposed `src/optional/virtual-list/`.

## Acceptance and gaps

Test large lists, resize, item mutation, focus outside the current window and scroll-to-key. Variable heights, grid rows and arbitrary render callbacks are not current fixed-height parity.

## Upstream implementation evidence

The [reviewed wrapper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/src/VirtualList.tsx#L1-L160) delegates the windowing algorithm to `vueuc` and coordinates item sizing, keys, resizing and scrollbar state. Its brevity is not evidence that the full behavior can fit a tiny dependency-free controller. MarkupUI needs its own independently budgeted algorithm and stable-key/focus tests; variable-height behavior remains separately scoped.

## Migration steps

**Delivery phase:** P5 — bounded collections. **Task state:** 🔵 Planned.
**Prerequisites:** P5 stable keys, P3 focus rules and an independent optional budget in the [master plan](../migration-plan.md).
**Next task:** specify fixed-height windowing, stable keys and a readable static/paginated fallback.

1. [ ] **Define item ownership.** Replace string-only output with explicit authored templates while preserving keyed item identity.
2. [ ] **Bound the window.** Resolve item height, overscan, viewport resize and spacer geometry independently from presentation CSS.
3. [ ] **Specify scrolling/focus.** Review each scroll-to overload and define behavior when the focused item leaves the rendered window.
4. [ ] **Test scale and mutation.** Cover large/reordered datasets, resizing, disconnect and scroll-to-key; keep variable heights and grid modes separately unreviewed.

### Native primitives and fallback

- **Native path:** readable list/paginated markup and an optional native item template; the browser has no general native virtual-list algorithm, so any retained windowing remains an explicit small module.
- **Small enhancement:** a light-DOM custom element uses native scrolling and feature-detected ResizeObserver, cloning only needed keyed items and disposing resources on disconnect. CSS owns presentation; numeric positioning stays isolated. Unsupported scale capabilities reduce to bounded pagination/full lists rather than importing vueuc or building a generic reactive renderer.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/virtual-list)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **17 local table rows + 12 supplementary declarations + 0 inherited rows = 29 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Virtual List Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-scroll-key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate native default/reset state for `default-scroll-key`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-scroll-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate native default/reset state for `default-scroll-index`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`ignore-item-resize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate explicit JS `ignoreItemResize` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`items`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L27) | Prop | Retain items JS property; add stable identity and authored templates beyond stringification. | 🔵 Planned | B1 stringified fixed-height items; partial only, verify this row. |
| [`item-resizable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate presence attribute `item-resizable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L29) | Prop | Current item-height covers fixed scalar height only; variable/mode sizing needs separate review. | ⚪ Not reviewed | B1 item-height scalar; name differs; partial only, verify this row. |
| [`items-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS class/custom property for `items-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`key-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `key-field` attribute or JS `keyField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`padding-top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `padding-top` attribute or JS `paddingTop`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`padding-bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `padding-bottom` attribute or JS `paddingBottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`visible-items-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `visible-items-tag` attribute or JS `visibleItemsTag`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`visible-items-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate explicit native-child configuration for `visible-items-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L37) | Callback | Candidate DOM `mui:scroll` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-wheel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L38) | Callback | Candidate DOM `mui:wheel` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-resize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L39) | Callback | Candidate DOM `mui:resize` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Virtual List Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L45) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ScrollTo overloads

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo(x, y)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L51) | Method overload | Candidate plain-JS `scrollTo(x, y)` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo({ left, top, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L53) | Method overload | Candidate plain-JS `scrollTo({ left, top, debounce })` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo({ index, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L59) | Method overload | Candidate plain-JS `scrollTo({ index, debounce })` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo({ key, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L64) | Method overload | Candidate plain-JS `scrollTo({ key, debounce })` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo({ position, debounce })`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L69) | Method overload | Candidate plain-JS `scrollTo({ position, debounce })` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ScrollTo option fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L53) | Record field | Candidate plain-JS `left` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L54) | Record field | Candidate plain-JS `top` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L59) | Record field | Candidate plain-JS `index` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L64) | Record field | Candidate plain-JS `key` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L69) | Record field | Candidate plain-JS `position` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`debounce`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L56) | Record field | Candidate plain-JS `debounce` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`behavior`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/virtual-list/demos/enUS/index.demo-entry.md#L55) | Record field | Candidate plain-JS `behavior` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
