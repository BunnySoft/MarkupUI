# Anchor

**Plan: Planned. Current baseline: native link wrapper only.**

## Baseline and target

[B1: foundation.ts](../../../src/components/foundation.ts) creates anchors; no active-section tracker exists.

- **HTML:** navigation list of real fragment links, nested where necessary.
- **JS:** optional IntersectionObserver active-section tracking and explicit scrolling.
- **CSS:** scroll margins, active marker and sticky layout.
- **Placement:** proposed `src/optional/anchor/`.

## Acceptance and gaps

Test deep links, browser back, missing targets, nested containers, reduced motion and active state near page end. Preserve native fragment navigation without JavaScript.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🔵 Planned.
**Prerequisites:** P2 native links and P0 observer/scroll ownership in the [master plan](../migration-plan.md).
**Next task:** write nested fragment-link navigation that works before active-section tracking exists.

1. [ ] **Preserve deep links.** Specify stable target IDs, AnchorLink labels and native hash/history behavior.
2. [ ] **Add active-section tracking.** Use an explicit observer root and define ties near section/page boundaries.
3. [ ] **Map scrolling and offsets.** Prefer scroll-margin CSS and native scrolling; respect reduced motion.
4. [ ] **Verify navigation history.** Test missing targets, nested containers, browser Back and keyboard focus after fragment activation.

### Native primitives and fallback

- **Native path:** labelled navigation with native fragment links and stable target IDs. Browser hash navigation, history and CSS scroll-margin replace custom routing/offset calculations.
- **Small enhancement:** feature-detect IntersectionObserver for optional active-section tracking in a small custom element. Clean observers/listeners on disconnect; without them, the links still work. Respect reduced motion for native smooth scrolling and avoid a scrolling/router polyfill or a mandatory generated-link template engine.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/anchor)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **11 local table rows + 0 supplementary declarations + 0 inherited rows = 11 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Anchor Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`affix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate presence attribute `affix`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`bound`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `bound` attribute or JS `bound`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`ignore-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate presence attribute `ignore-gap`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`offset-target`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate explicit JS `offsetTarget` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-rail`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate live JS `showRail` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-background`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate live JS `showBackground` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### AnchorLink Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`href`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L34) | Prop | Authored native link `href`; preserve browser navigation and security semantics. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### AnchorLink Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L41) | Slot | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Anchor Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L47) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
