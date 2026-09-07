# Number Animation

**Plan: Planned. Current baseline: static statistic primitive only.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) displays a statistic but has no numeric animation.

- **HTML:** readable final numeric value.
- **JS:** optional requestAnimationFrame interpolation and native `Intl.NumberFormat`; cleanup and restart semantics.
- **CSS:** numeric layout; reduced motion skips intermediate animation.
- **Placement:** proposed `src/optional/number-animation/`.

## Acceptance and gaps

Test decreasing/fractional values, restart, hidden tabs, reduced motion and disconnect. Screen readers receive meaningful final values rather than frame-by-frame announcements.

## Migration steps

**Delivery phase:** P6 — optional motion. **Task state:** 🔵 Planned.
**Prerequisites:** P2 Statistic, P0 resource disposal and reduced-motion policy in the [master plan](../migration-plan.md).
**Next task:** choose a readable final-value fallback and define animation restart semantics.

1. [ ] **Specify numeric inputs.** Resolve start/end, precision, duration and Intl formatting independently of frame rendering.
2. [ ] **Implement bounded animation.** Use requestAnimationFrame and explicit cancellation; skip motion when the user requests reduction.
3. [ ] **Separate announcements.** Expose meaningful final values rather than every interpolated frame to live regions.
4. [ ] **Test interruption.** Cover decreasing/fractional values, changed targets, hidden tabs and disconnect mid-animation.

### Native primitives and fallback

- **Native path:** a readable output/text node contains the final value. Optional animation uses a small custom element, requestAnimationFrame and supported Intl.NumberFormat.
- **Small enhancement:** feature-detect animation/formatting needs and respect prefers-reduced-motion/document visibility. Cancel frames on disconnect and show the final value immediately when motion is unsupported or unwanted. CSS controls layout; no animation library, template framework or frame-by-frame accessible announcement is needed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/number-animation)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **9 local table rows + 0 supplementary declarations + 0 inherited rows = 9 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### NumberAnimation Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`active`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate presence attribute `active`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `duration` attribute or JS `duration`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`from`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `from` attribute or JS `from`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`locale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate explicit JS `locale` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`precision`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate explicit JS `precision` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate live JS `showSeparator` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `to` attribute or JS `to`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L28) | Callback | Candidate DOM `mui:finish` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### NumberAnimation Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`play`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/number-animation/demos/enUS/index.demo-entry.md#L34) | Method | Candidate plain-JS `play` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
