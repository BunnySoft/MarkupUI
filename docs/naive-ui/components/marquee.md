# Marquee

**Plan: Planned as optional CSS motion. Current baseline: no marquee component.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no marquee controller.

- **HTML:** readable static content, not the obsolete marquee element; any duplicate visual copy is accessibility-hidden.
- **JS:** optional measurement/restart only.
- **CSS:** external animation with pause and reduced-motion disablement.
- **Placement:** proposed `src/optional/marquee/`.

## Acceptance and gaps

Test pause controls, hover/focus, screen readers, resizing and reduced motion. Never require motion to discover essential content.

## Migration steps

**Delivery phase:** P6 — optional motion; automatic essential-content motion excluded. **Task state:** 🔵 Planned.
**Prerequisites:** P0 reduced-motion/accessibility policy and explicit optional CSS in the [master plan](../migration-plan.md).
**Next task:** make the static content fully readable before approving any moving presentation.

1. [ ] **Define static anatomy.** Use normal text/content markup; exclude the obsolete marquee element and accessible duplicate copies.
2. [ ] **Specify user control.** Require pause/stop and focus/hover/reduced-motion behavior for retained animation.
3. [ ] **Isolate motion CSS.** Keep measurement/restart code optional and release observers on disconnect.
4. [ ] **Test moving content.** Cover resize, long text, paused focus, reduced motion and screen-reader output without requiring motion to discover information.

### Native primitives and fallback

- **Native path:** normal static text/content, not the obsolete marquee element. Any repeated visual copy may clone a template only if hidden from accessibility APIs.
- **Small enhancement:** external CSS animation and prefers-reduced-motion provide optional motion; a tiny controller is justified only for pause/measurement and must dispose observers. Feature-detect the required animation/measurement capabilities and retain static content otherwise. No motion polyfill, animation library or essential moving-only content.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/marquee)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **3 local table rows + 0 supplementary declarations + 0 inherited rows = 3 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Marquee Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`auto-fill`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate presence attribute `auto-fill`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`speed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `speed` attribute or JS `speed`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Marquee Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L28) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
