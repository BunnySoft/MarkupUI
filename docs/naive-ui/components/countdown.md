# Countdown

**🟢 Verified retained elapsed-duration scope.** Native existing text or explicit
unit Text nodes, monotonic timestamp-derived remaining time, bounded display precision/
cadence and finish once per run. No date/animation dependency, epoch-deadline guessing,
timer provider, VNode renderer, alarm action or injected live announcements.

## Baseline and implementation evidence

The unchanged [registry](../../../src/components/elements.ts) has no countdown.
The optional [controller](../../../src/components/countdown/countdown.ts) and
[pure duration formatter](../../../src/components/countdown/format.ts) use native
performance/timer/text primitives and existing owned-attribute restoration, not Time's
instant parser or a speculative shared clock. [External CSS](../../../src/components/countdown/countdown.css)
owns numeric/unit presentation.

See the [canonical contract and acceptance](../../components/countdown.md),
[tests](../../../tests/countdown.test.ts) and [local demo](../../../demo/components/countdown.html).
Pinned [props/types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L11-L39),
[elapsed/format/frame logic](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L45-L143),
[reset](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L150-L158)
and [render rounding](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L169-L193)
were reviewed. Source remainder-based short timeouts, VNode callbacks and reactive
duration watcher behavior are not promoted to native parity.

## Migration steps

**Delivery phase:** P6 — timed utilities. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** explicit native text/timing/ownership contracts; elapsed durations
are separate from Time instants and Calendar floating dates.
**Next task:** Number Animation, then Heatmap and Marquee. None is implemented here.
Broader P0 foundation IDs remain open/partial.

1. [x] **Specify readable output.** Native text/unit targets, rounded duration text and
   optional native time duration metadata; meaningful static fallback and no form proxy.
2. [x] **Implement elapsed timing.** Timestamp-derived remaining, separate duration/
   current value, active pause/resume, generation reset and finish once per current run.
3. [x] **Control lifecycle and announcements.** Hidden/selected rendering pauses without
   freezing elapsed time, bounded timers, native focus/selection and owned restoration.
4. [x] **Test elapsed-time edges.** Late callbacks, zero/restart, rounding, failures,
   reentrant hooks/disposal, native Chromium and independent assets/budgets.

### Native primitives and fallback

A small explicit helper owns existing native Text nodes, not a custom-element renderer.
Remaining is derived from monotonic timestamps; no decrement-per-callback drift.
One timeout follows display boundaries or completion, with a hard 50ms minimum.
Rendering suppression does not pause elapsed duration. Native role=timer/live=off may
be authored, but none is added blindly; completion announcements belong outside the
display in application code. Static native text remains readable without JavaScript.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/countdown)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **6 original table rows + 4 original inline declarations + 2 explicit
source type supplements + 2 source behavior supplements = 14 tracker rows**.
All original ten identities/links remain one-for-one.
**12 native adaptations + two intentional omissions; zero unresolved.**
There are no invented inherited theme/locale props in this source.
Verified means the stated bounded native target, not renderer/reactivity/alarm/browser parity.

### Countdown Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L20) | Prop | active defaults true; explicit pause freezes remaining elapsed duration and start resumes it. A finished run needs reset/value replacement, not active toggling. | 🟢 Verified |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L21) | Prop | Finite 0..365-day millisecond default/reset duration; later set(duration) changes the future reset target only. Explicit value replacement starts a new run. | 🟢 Verified |
| [`precision`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L22) | Prop | 0..3 decimal display digits, rounded upward; no promise of per-millisecond rendering or early completion from rounded text. | 🟢 Verified |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Prop | No VNode/arbitrary child renderer. Use a separate typed literal format callback or explicit native unit targets. | ⏭️ Intentionally omitted |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L24) | Callback | Finish event and synchronous onFinish once per current run; errors surface, reentrant reset/dispose invalidates stale work. No sound/navigation/network/focus effect. | 🟢 Verified |

### Countdown Methods

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`reset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L30) | Method | Fresh run ID/value from current duration, preserving active flag. Clears old completion/error state and cancels stale timers. | 🟢 Verified |

### Countdown Props: render inline fields

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`render.hours`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline field | Frozen display info.hours, total hours without 24-hour wrap; native hours target available. | 🟢 Verified |
| [`render.minutes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline field | Frozen rounded minute component 0..59, not a renderer slot. | 🟢 Verified |
| [`render.seconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline field | Frozen rounded second component 0..59; actual remaining remains separately available. | 🟢 Verified |
| [`render.milliseconds`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/demos/enUS/index.demo-entry.md#L23) | Inline field | Frozen rounded millisecond component 0..999; precision controls displayed fractional digits, not timer frequency. | 🟢 Verified |

### Explicit source type/behavior supplements

These four identities are source additions, not extra English API rows.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`CountdownTimeInfo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L11-L16) | Source public type | Native frozen components plus actual remaining/displayed duration and precision; no VNode metadata. | 🟢 Verified |
| [`CountdownInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L18-L20) | Source public interface | Plain CountdownController reset/start/pause/set/refresh/disconnect and observations, not a framework instance. | 🟢 Verified |
| [`performance.now / elapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L55-L59) | Source behavior | Named monotonic elapsed clock and timestamp difference, not interval subtraction or epoch deadline inference. | 🟢 Verified |
| [`duration watchEffect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/countdown/src/Countdown.tsx#L51-L53) | Source behavior | No watcher-driven current-distance rewrite. Markdown says nonreactive; explicit future duration/current value/reset contracts avoid copying conflicting runtime behavior. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
