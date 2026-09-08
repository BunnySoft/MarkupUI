# Back Top

**Plan: 🟢 Verified retained native link/button, threshold and CSS scope; six explicit omissions.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) remains the unchanged historical baseline.
[The optional controller](../../../src/components/back-top/back-top.ts) now reuses
[Anchor's native scroll context](../../../src/components/anchor/scroll.ts); the
[canonical API and acceptance](../../components/back-top.md) define precise target behavior.

- **HTML:** authored named fragment link, or explicit type=button; no generated controls.
- **JS:** optional inclusive threshold/show, native root scroll and focus-held visibility.
- **CSS:** external logical fixed/in-flow placement, size/shape, safe areas and hidden/focus.
- **Placement:** `src/components/back-top/`; standalone ESM/classic/CSS, no required component asset.

## Acceptance and gaps

104 targeted tests, build/budgets and Chromium cover thresholds, native activation, cancellation,
focus-held hide, forms/links, root isolation, x preservation, cleanup, RTL/zoom and fallback.
Focus is not moved: focused actions remain helper-visible until blur. Fixed placement remains
subject to native containing blocks. No portal, easing engine or provider parity is claimed.

## Migration steps

**Delivery phase:** P3 — scroll navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Button/link semantics and P0 scroll-listener disposal in the [master plan](../migration-plan.md).
**Next task:** Pagination, then Steps; P3 is not complete.

1. [x] **Define destination/focus.** Native fragment semantics or explicit root zero; focused actions stay until blur.
2. [x] **Implement threshold state.** Inclusive threshold, silent show override, passive/coalesced root reads and explicit lifecycle.
3. [x] **Extract placement.** Independent external logical offsets, safe areas, size/shape and hidden/focus CSS.
4. [x] **Test scroll ownership.** Targeted/browser evidence covers roots, reduced motion, cleanup, native keyboard and focus safety.

### Native primitives and fallback

- **Native path:** a real top fragment link, or an explicitly labelled button for a separate scroll container; native scrolling owns the movement.
- **Small enhancement:** optional light-DOM threshold/root-scroll controller; no click listener on links or key synthesis on buttons. Missing ResizeObserver uses native signals/explicit update; missing element scrollTo uses scrollTop. External CSS hides the owned marker; no-JS links remain visible. Author JS-only buttons hidden until connected. No mutation observer or scroll animation polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/back-top)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 original local table rows + 9 explicit source supplements + 0 inherited rows = 16 tracker rows**.
Pinned Markdown, BackTop.tsx and public index were reviewed for this retained scope.
Every original owner/name/source identity below is preserved. **10 Verified adapted targets;
6 intentionally omitted targets**, not framework API or source-behavior parity.
The source uses >= threshold, an independently observed uncontrolled show result, native smooth
scrollTo, lazy teleport and a default slot/icon. It has no public duration, size/shape prop or
documented imperative method table; CSS tokens and this helper's method are native alternatives.


### BackTop Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L24) | Prop | External block-end inset token and safe-area minimum. | 🟢 Verified | Logical CSS, not runtime length props; native fixed constraints. |
| [`listen-to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L25) | Prop | Explicit same-document `root`; default window/document, not nearest parent. | 🟢 Verified | Native root validation/scroll isolation; selector inference excluded. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L26) | Prop | External inline-end token; flips logically in RTL. | 🟢 Verified | Deliberate adaptation of physical right; no body-lock compensation. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L27) | Prop | Boolean/null helper override; focused action retained until blur. | 🟢 Verified | Silent assignments; author hidden/CSS remains authoritative. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L28) | Prop | Author the node in a suitable containing block. | ⏭️ Intentionally omitted | No teleport/provider/portal or automatic DOM relocation. |
| [`visibility-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L29) | Prop | Finite nonnegative `visibilityHeight`, inclusive >=, default 180. | 🟢 Verified | Zero/fractions, root scroll/resize/update tests. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L30) | Callback | `mui:back-top-update-show` with `{ show }` for measured threshold changes after initialization. | 🟢 Verified | Independent of show override/focus; not user-only or animation completion. |

### BackTop explicit source-only supplements

These additions identify source surfaces, not previously documented rows or new upstream props.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`listenTo` Document/function expansion](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L58-L60) | Source prop type supplement | Document/window/HTMLElement roots; no function/selector resolution. | 🟢 Verified | Reused validated Anchor scroll context; explicit reconnect for root changes. |
| [`target`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L66) | Deprecated prop | Use explicit root. | ⏭️ Intentionally omitted | No function alias. |
| [`onShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L67) | Deprecated callback | Use the explicit threshold event. | ⏭️ Intentionally omitted | No legacy watch/callback alias. |
| [`onHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L68) | Deprecated callback | Use the explicit threshold event. | ⏭️ Intentionally omitted | Source watcher quirks are not migration requirements. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L304-L308) | Source slot | Authored label/decorative icon children. | 🟢 Verified | Native action semantics and preserved nodes; no VNode slot/icon dependency. |
| [`$attrs` / `onClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L294-L302) | Source native attribute/event forwarding | Author attributes/listeners directly on native action. | 🟢 Verified | Final synchronous cancellation; no intercepted link or synthesized key click. |
| [`width` / `height` / `iconSize` / `borderRadius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L224-L227) | Source theme presentation group | External size/shape classes/tokens and authored icon CSS. | 🟢 Verified | Not invented upstream size/shape props or runtime theme values. |
| [`useTheme.props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L37) | Source theme group | External scoped CSS instead. | ⏭️ Intentionally omitted | No theme/provider/CSS-in-JS machinery. |
| [`BackTopProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/src/BackTop.tsx#L71) | Public source type | Native `BackTopOptions` / `BackTopController` types. | ⏭️ Intentionally omitted | No Vue extracted-prop type compatibility. |

<!-- END PINNED API INVENTORY -->
