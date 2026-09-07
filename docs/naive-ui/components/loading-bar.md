# Loading Bar

**Plan: Planned. Current baseline: progress/overlay concepts only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) has progress; [B2: overlay service](../../../src/overlay/index.ts) has timed feedback, not loading-bar state.

- **HTML:** labelled progress/status element in a document-owned host.
- **JS:** explicit start/finish/error service and concurrent-operation ownership.
- **CSS:** external top-edge progress and reduced-motion states.
- **Placement:** proposed `src/optional/loading-bar/`.

## Acceptance and gaps

Test overlapping work, repeated finish/error, timer disposal and root removal. A simulated loading bar must not imply precise task completion.

## Migration steps

**Delivery phase:** P3 — managed feedback. **Task state:** 🔵 Planned.
**Prerequisites:** P2 Progress and P0 explicit service/timer ownership in the [master plan](../migration-plan.md).
**Next task:** define who owns start/finish/error when several operations overlap.

1. [ ] **Author the service host.** Use a labelled progress/status element attached to an explicit document/root.
2. [ ] **Specify operation state.** Resolve repeated starts, completion/error order and determinate versus simulated progress.
3. [ ] **Separate animation/CSS.** Keep top-edge presentation and reduced motion external; dispose timers with the service.
4. [ ] **Test concurrent work.** Cover overlapping requests, repeated finish, root removal and error recovery without provider injection.

### Native primitives and fallback

- **Native path:** a native progress element/readable status in an explicitly owned root; the service may adopt an authored host instead of creating a hidden app.
- **Small enhancement:** a small controller owns operation state, timers and disposal; CSS supplies top-edge layout and reduced-motion transitions. Feature-detect animation only as decoration, retaining a static busy/progress indication when unavailable. Native progress semantics replace a custom canvas/loading framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/loading-bar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 3 supplementary declarations + 0 inherited rows = 10 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### LoadingBarProvider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`container-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate `container-class` attribute or JS `containerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`container-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L51) | Prop | External CSS class/custom property for `container-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`loading-bar-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Prop | External CSS class/custom property for `loading-bar-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### loadingBar Injection Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L59) | Method | Candidate plain-JS `error` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L60) | Method | Candidate plain-JS `finish` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`start`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L61) | Method | Candidate plain-JS `start` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Documented service entry

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useLoadingBar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L19) | Framework API | Replace framework injection with an explicitly selected plain-JS service. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### LoadingBarProvider Props: loading-bar-style inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`loading-bar-style.loading?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Inline record field | External CSS class/custom property for `loading-bar-style.loading`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`loading-bar-style.error?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Inline record field | External CSS class/custom property for `loading-bar-style.error`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
