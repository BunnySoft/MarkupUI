# Flex

**Plan: Planned. Current baseline: row/stack/wrap CSS primitives.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) styles existing flex-based layout wrappers.

- **HTML:** ordinary containers in logical reading order.
- **JS:** none for layout.
- **CSS:** external flex direction, wrap, gap, alignment and responsive rules.
- **Placement:** proposed `src/components/flex/flex.css`; reuse existing names where possible.

## Acceptance and gaps

Check wrapping, nested gaps, RTL and content zoom. Visual ordering must not contradict DOM/focus order; Vue-specific wrapper/render choices are unnecessary.

## Migration steps

**Delivery phase:** P2 — layout. **Task state:** 🔵 Planned.
**Prerequisites:** P0 external CSS/logical-direction conventions in the [master plan](../migration-plan.md).
**Next task:** map existing row/stack/wrap wrappers to explicit native flex-container classes.

1. [ ] **Define child layout.** Preserve DOM order and avoid mandatory generated item wrappers.
2. [ ] **Resolve CSS properties.** Map direction, wrapping, alignment, justification and gaps to scoped styles/tokens.
3. [ ] **Specify responsive behavior.** Use media/container rules rather than JavaScript breakpoint state.
4. [ ] **Test layout extremes.** Cover nested gaps, overflowing children, RTL, zoom and visual order without changing focus order.

### Native primitives and fallback

- **Native path:** ordinary authored elements with CSS flexbox, gap, wrap and logical properties. No custom element, template cloning or layout controller is required.
- **Small enhancement:** optional container queries and `:has()` selectors are guarded by @supports/CSS.supports; use media queries/explicit classes or normal block flow when unavailable. Keep browser layout responsible for sizing rather than implementing a JavaScript flexbox or breakpoint polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/flex)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Flex Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L28) | Prop | External CSS token/class for `align`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `inline`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`justify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `justify`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `vertical`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `wrap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Flex Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md#L39) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
