# Collapse Transition

**Plan: Planned as optional CSS motion. Current baseline: shared animation styles only.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) contains animation rules, not an upstream transition wrapper.

- **HTML:** existing disclosure content remains intact.
- **JS:** optional minimal measurement/completion helper only when CSS cannot satisfy the retained behavior.
- **CSS:** external expansion transition with reduced-motion and interrupted-state handling.
- **Placement:** proposed `src/optional/collapse-transition/`; no framework transition runtime.

## Acceptance and gaps

Test rapid reversal, dynamic height, hidden descendants, reduced motion and disconnect mid-transition. Do not animate a disclosure at the cost of keyboard/visibility correctness.

## Migration steps

**Delivery phase:** P3 — optional interaction motion. **Task state:** 🔵 Planned.
**Prerequisites:** P3 Collapse state and P0 reduced-motion/disposal rules in the [master plan](../migration-plan.md).
**Next task:** establish correct disclosure visibility without animation before adding expansion transitions.

1. [ ] **Define transition ownership.** Keep disclosure state with its owner and preserve existing content/focus.
2. [ ] **Implement CSS-first motion.** Resolve expansion/collapse timing and reduced-motion behavior outside JavaScript.
3. [ ] **Scope measurement helpers.** Add height measurement only where required and define interruption/completion callbacks explicitly.
4. [ ] **Test interrupted movement.** Cover rapid reversal, changing content height, disconnect and focus inside a collapsing region.

### Native primitives and fallback

- **Native path:** existing details/summary or explicit hidden/open state remains the disclosure source of truth; CSS transitions and reduced-motion rules supply optional decoration.
- **Small enhancement:** feature-detect retained CSS intrinsic-size/transition capabilities. Prefer instant disclosure when unsupported; any necessary measurement belongs to a small lifecycle-cleaned adapter. Do not emulate framework transition components, remount authored content or add an animation/height polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/collapse-transition)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **4 local table rows + 0 supplementary declarations + 0 inherited rows = 4 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### CollapseTransition Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`appear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L17) | Prop | Candidate presence attribute `appear`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L18) | Prop | No framework if/show directive; document native hidden/open state and node preservation instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseTransition Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L25) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
