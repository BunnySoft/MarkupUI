# Thing

**Plan: Planned as composition. Current baseline: card/list primitives only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) supplies cards, not a Thing controller.

- **HTML:** article/list item with authored image, heading, description and actions.
- **JS:** unnecessary beyond native action controls.
- **CSS:** external media-object layout with responsive region alignment.
- **Placement:** proposed `src/components/thing/thing.css`; prefer composition over another controller.

## Acceptance and gaps

Test missing regions, long content, heading/link semantics and action order. Framework component props are replaced by explicit child anatomy.

## Migration steps

**Delivery phase:** P2 — compound content. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Card and P2 List/Typography in the [master plan](../migration-plan.md).
**Next task:** define an article/list-item composition rather than a new general-purpose renderer.

1. [ ] **Name authored regions.** Resolve image, header, description, content and action areas with semantic headings.
2. [ ] **Keep interactions native.** Use real links/buttons in action regions; avoid making the entire content object implicitly clickable.
3. [ ] **Implement media-object CSS.** Align optional regions responsively while preserving DOM reading order.
4. [ ] **Exercise sparse content.** Test missing regions, long descriptions, stacked actions and nested headings with no controller import.

### Native primitives and fallback

- **Native path:** an article/list item containing a heading, image, text and native actions. Repeated application items may clone an authored template with explicit node updates.
- **Small enhancement:** CSS grid/flex and optional container queries align media/content; block flow is the usable fallback. No dedicated custom element, generic item renderer or Shadow DOM slot projection is needed for this composition. Native action controls retain their own lifecycle/behavior.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/thing)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **16 local table rows + 0 supplementary declarations + 0 inherited rows = 16 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Thing Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-indented`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate presence attribute `content-indented`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `content` attribute or JS `content`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L23) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate `description` attribute or JS `description`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`description-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `description-class` attribute or JS `descriptionClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`description-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS class/custom property for `description-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `title-extra` attribute or JS `titleExtra`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Thing Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L34) | Slot | Candidate authored `action` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L35) | Slot | Candidate authored `avatar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L36) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L37) | Slot | Candidate authored `description` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L38) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L39) | Slot | Candidate authored `header-extra` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L40) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
