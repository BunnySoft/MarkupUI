# Infinite Scroll

**Plan: Planned. Current baseline: virtual-list primitive only.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) supplies windowed rendering but no data-loading sentinel.

- **HTML:** content list, explicit Load more button and status/error region.
- **JS:** optional IntersectionObserver enhancement with one pending request and cancellation.
- **CSS:** viewport/sentinel layout outside behavior.
- **Placement:** proposed `src/optional/infinite-scroll/`; independent of virtualization.

## Acceptance and gaps

Test short initial lists, repeated intersections, errors/retry, exhausted data and disconnection. Keep a keyboard/manual loading path and do not hijack browser history.

## Migration steps

**Delivery phase:** P5 — async collections. **Task state:** 🔵 Planned.
**Prerequisites:** P5 cancellation/identity and P0 observer disposal in the [master plan](../migration-plan.md).
**Next task:** define an explicit Load more button and exhausted/error states before automatic loading.

1. [ ] **Author the manual fallback.** Keep content, loading status and a keyboard-operable retry/load control usable without observers.
2. [ ] **Add sentinel enhancement.** Use IntersectionObserver with explicit root/distance and at most one active request.
3. [ ] **Resolve load lifecycle.** Cancel obsolete work, distinguish empty from exhausted results and avoid repeated requests for short initial lists.
4. [ ] **Test scroll boundaries.** Cover repeated intersections, failures, exhausted data, root changes and disconnect without requiring virtualization.

### Native primitives and fallback

- **Native path:** a normal list and real Load more/retry button with readable status. New items may clone a native template without rerendering prior items.
- **Small enhancement:** feature-detect IntersectionObserver; a lifecycle-managed custom element adds sentinel loading and AbortController cancellation only when supported. Manual loading remains the fallback and must not require an observer polyfill. CSS controls viewport/sentinel layout; scrolling and virtualization are separate concerns.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/infinite-scroll)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **3 local table rows + 0 supplementary declarations + 0 inherited rows = 3 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Infinite Scroll Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`distance`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate `distance` attribute or JS `distance`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-load`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/infinite-scroll/demos/enUS/index.demo-entry.md#L22) | Callback | Explicit `on-load` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
