# Scrollbar

**Plan: Planned with native scrolling. Current baseline: ordinary overflow and positioning helpers.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) applies overflow; there is no custom scrollbar controller.

- **HTML:** native scroll container with an accessible name/focus only when necessary.
- **JS:** native scrollTo/scroll events; custom drag-thumb emulation is not the baseline.
- **CSS:** external overflow, scrollbar-width/color and optional gutter styling.
- **Placement:** proposed `src/components/scrollbar/`; any extra controller separately justified.

## Acceptance and gaps

Test keyboard, touch, forced colors, RTL and browser-native scrollbar preferences. Do not replace native scrolling to mimic appearance; specialized upstream container callbacks remain unreviewed.

## Migration steps

**Delivery phase:** P2 — native scrolling; custom scrollbar emulation remains excluded. **Task state:** 🔵 Planned.
**Prerequisites:** P0 scroll-container ownership and external CSS in the [master plan](../migration-plan.md).
**Next task:** define a native overflow container and identify which upstream custom-scrollbar behaviors are unnecessary.

1. [ ] **Preserve browser scrolling.** Keep native keyboard/touch behavior, accessibility and user scrollbar preferences.
2. [ ] **Extract optional styling.** Use scrollbar-width/color/gutter only where supported, with unchanged native fallback.
3. [ ] **Resolve imperative methods.** Map approved scrolling to native scrollTo/scroll events instead of a draggable-thumb engine.
4. [ ] **Test platform behavior.** Cover RTL offsets, forced colors, nested overflow, keyboard access and unsupported styling.

### Native primitives and fallback

- **Native path:** native overflow scrolling, scrollTo and ordinary keyboard/touch behavior; browser scrollbars remain the implementation.
- **Small enhancement:** external scrollbar-width/color/gutter styling is guarded by @supports and falls back to unmodified native appearance. A small optional controller may expose documented scroll events/methods with lifecycle cleanup, but custom thumb dragging, custom-elements registration and scrollbar polyfills are unnecessary for basic scrolling.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/scrollbar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 local table rows + 6 supplementary declarations + 0 inherited rows = 16 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Scrollbar Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `trigger` attribute or JS `trigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`x-scrollable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `x-scrollable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`x-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate explicit JS `xPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`y-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate explicit JS `yPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L29) | Callback | Candidate DOM `mui:scroll` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Scrollbar Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L35) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Scrollbar Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollBy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Method | Candidate plain-JS `scrollBy` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Scrollbar Methods: scrollBy inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollBy.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollBy.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollBy.behavior?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Scrollbar Methods: scrollTo inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.behavior?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
