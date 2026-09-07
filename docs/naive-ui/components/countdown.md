# Countdown

**Plan: Planned. Current baseline: no countdown controller identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no countdown.

- **HTML:** readable remaining duration and optional pause/start controls.
- **JS:** derive remaining time from a deadline, not repeated decrement; clean up timers and finish once.
- **CSS:** external numeric presentation.
- **Placement:** proposed `src/optional/countdown/`.

## Acceptance and gaps

Test background-tab throttling, zero/negative duration, restart, disconnect and locale formatting. Avoid a live-region announcement on every animation frame.

## Migration steps

**Delivery phase:** P6 — timed utilities. **Task state:** 🔵 Planned.
**Prerequisites:** P0 timer disposal and P6 duration-format decisions in the [master plan](../migration-plan.md).
**Next task:** define a deadline-based duration contract rather than decrementing a counter on each timer tick.

1. [ ] **Specify readable output.** Choose remaining-time units and a static final/expired message with optional start/pause controls.
2. [ ] **Implement deadline timing.** Derive time from the clock, define reset/restart and emit completion only once per run.
3. [ ] **Control lifecycle and announcements.** Release timers and avoid announcing every visual update to assistive technology.
4. [ ] **Test elapsed-time edges.** Cover throttled tabs, zero/negative durations, paused/resumed runs and disconnect before completion.

### Native primitives and fallback

- **Native path:** readable text/output and native start/pause buttons; a small custom element derives remaining time from an explicit deadline.
- **Small enhancement:** use clock/timer APIs and document visibility, formatting only with supported Intl features. Lifecycle cleanup cancels scheduled work; CSS handles digits. If precise enhancement is unavailable, show the deadline or a static remaining value rather than implementing a timing/formatting polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/countdown)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 local table rows + 4 supplementary declarations + 0 inherited rows = 10 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Countdown Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate presence attribute `active`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `duration` attribute or JS `duration`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`precision`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate explicit JS `precision` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate authored `render` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L24) | Callback | Candidate DOM `mui:finish` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Countdown Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`reset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L30) | Method | Candidate plain-JS `reset` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Countdown Props: render inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render.hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate authored `render.hours` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render.minutes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate authored `render.minutes` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render.seconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate authored `render.seconds` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render.milliseconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate authored `render.milliseconds` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
