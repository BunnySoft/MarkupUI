# Infinite Scroll

**🟢 Verified retained native loading-permission scope.** An authored content region,
empty sentinel, labelled manual button and explicit status messages. Native
IntersectionObserver roots/distances, bounded automatic permission and one pending
application loader, including cancellation acknowledgement. No fetcher, item renderer,
custom scrollbar, hidden data model or mandatory virtualization.

[Canonical anatomy/API/acceptance](../../components/infinite-scroll.md).
The existing advanced Virtual List remains independent. This helper never generates,
reorders or serializes application items.

**Delivery phase:** P5. **Task state:** 🟢 Verified retained native scope.
**Next:** Popselect, then Split. P5 remains incomplete.

1. [x] **Author the manual fallback.** Real type=button loading/retry and a reachable
   static route/footer; native items/fields remain readable without JavaScript.
2. [x] **Add sentinel enhancement.** Explicit page/element root, bottom pixel distance,
   one load per entry and a bounded automatic-load budget.
3. [x] **Resolve load lifecycle.** Explicit progress/hasMore/guarded commit, serialized
   cancellation, stale result/error rejection and deliberate retry/reset.
4. [x] **Test scroll boundaries.** Real Chromium intersections/thresholds, underfill,
   manual fallback, roots, races, native forms/focus, nesting/media and coexistence.

### Native primitives and fallback

The application authors and owns actual item nodes and transport. The helper borrows only
native attributes, status visibility, manual activation and observer/request permission.
It reuses the existing owned-attribute utility, not a positioning/runtime provider.
Missing IntersectionObserver leaves manual loading available without a polyfill.
No-JS hides enhancement buttons and retains items plus a real static-sample route.

## Pinned evidence and behavior differences

- [Pinned API][api], [implementation and types][source], [exports][exports].
- [Official route](https://www.naiveui.com/en-US/os-theme/components/infinite-scroll)
  redirected to `/lander` during the 2026-09-10 acceptance attempt. The unrelated landing
  tab was closed; no live-reference UI parity is claimed. Pinned GitHub source is authoritative.
- [Catalog](../index.md) · [Architecture](../architecture.md).

Revision **42a52e6436b38bed456fee19eb0b89cdcd00fcc2**, Naive UI 2.45.3.
Source uses NxScrollbar, checks native bottom distance on scroll/downward wheel, sets a
private loading flag, awaits onLoad returning void/Promise<void>, and catches rejected loads
without surfacing them. It has no public hasMore, disabled, reset or commit contract.

The target deliberately differs: IntersectionObserver entry plus explicit manual activation;
validated `{added,hasMore,commit?}` completion; visible error/cancelling/finished states;
AbortSignal and generation checks; no repeated wheel-at-edge retry. It does not preserve
silent-error behavior or claim void loader compatibility.

**Three original section/member/kind/API-line identities remain in order.**
`API:Lnn` means the exact pinned [API][api] URL plus `#Lnn`.
Four source-only export/default-slot supplements are separate, yielding **seven rows:
four adapted native capabilities + three intentional omissions; zero unresolved**.

<!-- BEGIN PINNED API INVENTORY -->

### Infinite Scroll Props

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `distance` · API:L20 | Prop | Explicit finite 0..4096 CSS-pixel bottom rootMargin, default 0; native page or element intersection root. | 🟢 Verified |
| `scrollbar-props` · API:L21 | Prop | No NxScrollbar/ScrollbarProps forwarding or custom-scrollbar API inheritance. Author native overflow/root/labels externally. | ⏭️ Intentionally omitted |
| `on-load` · API:L22 | Callback | Explicit application load(context), validated progress/hasMore and guarded synchronous commit; no void-success or swallowed-error fallback. | 🟢 Verified |

### Source-only public exports and native content

These are explicit [index.ts][exports]/[implementation][source] supplements, not added
original Markdown rows. The source default slot is observed in resolveSlot($slots.default).

| Upstream item · source | Kind | Native mapping / boundary | Status |
| --- | --- | --- | --- |
| `NInfiniteScroll` · exports | Component export | createInfiniteScroll on original native anatomy; no custom-element registration. | 🟢 Verified |
| `infiniteScrollProps` · exports | Props record | No Vue prop-schema/runtime bridge. | ⏭️ Intentionally omitted |
| `InfiniteScrollProps` · exports | Type alias | Independently typed native settings/options; no ExtractPublicPropTypes compatibility alias. | ⏭️ Intentionally omitted |
| `default` · source default slot | Slot | Authored native content and retained item nodes; no slot/VNode renderer. | 🟢 Verified |

<!-- END PINNED API INVENTORY -->

Disabled/finished/manual retry, added/hasMore/commit results, automatic budgets, reset,
AbortSignal/generation context and state/error events are explicit **target extensions**,
not invented upstream props. See the canonical document for every retained API and limit.

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/demos/enUS/index.demo-entry.md
[source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/src/InfiniteScroll.tsx
[exports]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/index.ts
