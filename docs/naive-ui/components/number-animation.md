# Number Animation

**🟢 Verified retained native number/text scope.** A small monotonic/RAF owner,
overflow-safe finite interpolation, exact requested endpoints and cached native
Intl.NumberFormat. No countup/animation/rounding library, provider, renderer, financial
decimal claim, global scheduler or per-frame layout engine.

## Baseline and implementation evidence

The unchanged [statistic baseline](../../../src/components/navigation.ts) is static.
The optional [animation owner](../../../src/components/number-animation/number-animation.ts),
[pure numeric helpers](../../../src/components/number-animation/number.ts) and
[external CSS](../../../src/components/number-animation/number-animation.css) keep
author text/native data attributes isolated from input values and form submission.
They reuse the owned-attribute primitive and explicit Text-node lease approach already
used by Time/Countdown, without importing their date/duration formatters or changing
their existing assets.

See [canonical loading/semantics/acceptance](../../components/number-animation.md),
[default-style audit](../../style-audit/components/number-animation.md),
[tests](../../../tests/number-animation.test.ts) and [local demo](../../../demo/components/number-animation.html).
Pinned [props/defaults](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/NumberAnimation.tsx#L8-L28),
[format/play/watch behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/NumberAnimation.tsx#L43-L119)
and [tween](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/utils.ts#L1-L27)
were reviewed. Source mixed digit/separator formatting, uncancelled tween/watch behavior
and overflow-prone from+(to-from)*t are not claimed as native parity.

## Migration steps

**Delivery phase:** P6 — optional motion. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** Statistic/native text and scoped Time/Countdown ownership/timing
conventions. Broad P0 task IDs remain independently open/partial.
**Next task:** Heatmap, then Marquee. Neither is implemented here.

1. [x] **Specify numeric inputs.** Finite endpoints, bounded duration/precision,
   native locale/grouping and exact target versus display rounding are explicit.
2. [x] **Implement bounded animation.** One RAF, timestamp interpolation, cancellation/
   retarget/pause/replay, reduced-motion final output and guarded stale work.
3. [x] **Separate announcements.** No frame live region or focus side effects; original
   Text/data pair is selection-safe and completion notice is application-owned.
4. [x] **Test interruption.** Extremes/decreasing/fractional/zero/reduced/hidden,
   callback errors/reentrancy, native browser behavior and independent budgets verified.

### Native primitives and fallback

Readable author final-value text remains without JS. Optional enhancement owns an
existing Text node (or explicit span target) and optional native data[value], not
a custom element. Native RAF and a named monotonic clock derive current values;
unsupported RAF/motion preferences or reduced motion skip to the useful exact target.
No frame reads layout. Native Text/Intl/selection/media mechanisms replace an animation
or formatting package.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/number-animation)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **9 original public table rows + one explicit source type + two source
behavior supplements = 12 tracker rows**. Every original identity/link remains.
**11 native adaptations + one intentional omission; zero unresolved.** There are no
invented inherited theme props. Verified means the declared bounded adaptation, not
financial-decimal, watcher, provider, callback or all-browser/AT parity.

### NumberAnimation Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L21) | Prop | active=true starts; false freezes elapsed progress, true resumes unfinished work. Finished replay is explicit play. Source watchEffect behavior is not copied. | 🟢 Verified |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L22) | Prop | Finite 0..3,600,000ms. Default 2000 follows pinned source, which differs from Markdown's 3000. Changing it explicitly replaces the run. | 🟢 Verified |
| [`from`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L23) | Prop | Finite Number start, default 0; no coercion/BigInt/decimal-money model. | 🟢 Verified |
| [`locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L24) | Prop | Explicit supported native locale, en-US default; no Config Provider dependency. | 🟢 Verified |
| [`precision`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L25) | Prop | Fixed native fraction digits 0..20. Display rounding is separate from exact IEEE Number endpoints, not lodash/toFixed parity. | 🟢 Verified |
| [`show-separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L26) | Prop | showSeparator=false by default; native Intl useGrouping and whole-number locale formatting. Digits/decimal signs are localized together, not spliced source fragments. | 🟢 Verified |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L27) | Prop | Finite Number target; exact endpoint forced on successful completion. Default 0 follows source rather than Markdown's undefined. | 🟢 Verified |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L28) | Callback | Finish event then synchronous onFinish once per completed current run; reentrant changes/dispose suppress stale work and errors surface. | 🟢 Verified |

### NumberAnimation Methods

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`play`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L34) | Method | No-op while playing; starts/resumes idle/paused work and replays finished/cancelled work. Explicit reset/retarget/cancel are documented native additions. | 🟢 Verified |

### Explicit source type/behavior supplements

These three review additions are source declarations/behavior, not English table props.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`NumberAnimationInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/NumberAnimation.tsx#L35-L37) | Source public type | Plain NumberAnimationController and explicit commands; no framework instance. | 🟢 Verified |
| [`easeOut`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/utils.ts#L1) | Source behavior | Native built-in ease-out quint, plus explicit linear/bounded synchronous easing. No overshoot or animation package. | 🟢 Verified |
| [`localeRef`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/src/NumberAnimation.tsx#L43-L50) | Source behavior | No injected locale graph or mixed ASCII/localized output. Explicit Intl locale is the alternative. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
