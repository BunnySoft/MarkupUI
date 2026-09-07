# Result

**Plan: Planned as composition. Current baseline: empty/heading/button primitives.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) supplies empty content but no Result component.

- **HTML:** heading, readable outcome, decorative illustration and recovery actions.
- **JS:** none beyond explicit native actions.
- **CSS:** external status and responsive content layout.
- **Placement:** proposed `src/components/result/result.css`.

## Acceptance and gaps

Check outcome meaning without color/images, heading order, action priority and dynamic announcements. No framework icon package or forced page-navigation behavior.

## Migration steps

**Delivery phase:** P2 — outcome composition. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button and P2 Empty/Typography in the [master plan](../migration-plan.md).
**Next task:** define readable outcome text and recovery actions independently of illustration/status colors.

1. [ ] **Author semantic regions.** Use a heading, description, optional decorative image and explicit action area.
2. [ ] **Resolve outcome variants.** Define success/error/empty meaning without requiring an icon package or router.
3. [ ] **Extract page layout.** Style spacing, image sizes and action alignment externally for narrow and wide containers.
4. [ ] **Test recovery paths.** Verify heading order, keyboard action priority, missing illustrations and optional dynamic announcements.

### Native primitives and fallback

- **Native path:** section/heading/text, optional decorative image and real recovery links/buttons. A reusable authored template can represent an outcome without interpreting a component schema.
- **Small enhancement:** none is required for static outcomes. CSS grid/flex/container queries supplies presentation with plain-flow fallback. Keep live announcement behavior explicit to the owner and avoid a dedicated result controller, icon dependency, routing framework or required Shadow DOM.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/result)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Result Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `description` attribute or JS `description`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Result Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L37) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L38) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L39) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
