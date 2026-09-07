# Spin

**Plan: Planned. Current baseline: core status role/label and spinner styles; not parity-verified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) assigns status role and an initial label; [B2: styles.ts](../../../src/components/styles.ts) provides `mui-spin` presentation.

- **HTML:** visible loading text/status; decorative animation is hidden from accessibility APIs.
- **JS:** optional delayed visibility with timer cleanup; owner defines whether content is busy.
- **CSS:** external spinner and overlay sizing with reduced-motion fallback.
- **Placement:** proposed `src/components/spin/`.

## Acceptance and gaps

Test brief/long loads, delay cancellation, blocked versus usable content and accessible naming. A spinner must not silently become a focus trap or hide the status text.

## Migration steps

**Delivery phase:** P2 — loading feedback. **Task state:** 🔵 Planned.
**Prerequisites:** P0 status labels/timer disposal and external motion CSS in the [master plan](../migration-plan.md).
**Next task:** preserve readable loading text while treating the animated spinner as decorative.

1. [ ] **Define busy anatomy.** Specify standalone versus content-overlay use and whether underlying controls remain usable.
2. [ ] **Extract spinner CSS.** Resolve stroke/size/color/rotation with reduced-motion fallback and no icon package.
3. [ ] **Scope optional delay.** Define show/hide timing and cancel pending timers when loading ends or the owner disconnects.
4. [ ] **Test short and long loads.** Cover repeated toggles, delayed display, accessible labels and content focus without introducing a focus trap.

### Native primitives and fallback

- **Native path:** readable status text plus a decorative CSS spinner, with aria-busy placed on the actual content owner when appropriate.
- **Small enhancement:** a tiny optional custom element owns display-delay timers and disconnect cleanup; CSS animation and prefers-reduced-motion handles presentation. Static loading text is the fallback when motion or enhancement is unavailable. No SVG/icon package, focus-trap overlay or spinner polyfill should be needed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/spin)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **14 local table rows + 0 supplementary declarations + 0 inherited rows = 14 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Spin Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L22) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `description` attribute or JS `description`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate presence attribute `rotate`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L25) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`stroke-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `stroke-width` attribute or JS `strokeWidth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `radius` attribute or JS `radius`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scale`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `scale` attribute or JS `scale`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`stroke`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `stroke` attribute or JS `stroke`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`delay`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `delay` attribute or JS `delay`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Spin Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L37) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L38) | Slot | Candidate authored `description` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md#L39) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
