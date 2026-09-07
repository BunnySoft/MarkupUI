# Ellipsis

**Plan: Planned. Current baseline: no dedicated component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no ellipsis controller.

- **HTML:** keep complete readable text in light DOM.
- **JS:** optional overflow detection/disclosure only; avoid remounting cell contents.
- **CSS:** `text-overflow` and line clamping with readable fallback.
- **Placement:** proposed `src/components/ellipsis/`; CSS-only baseline, optional tooltip integration.

## Acceptance and gaps

Test one/multiple lines, resize/font changes, keyboard access to hidden text and selectable content. PerformantEllipsis is a companion upstream surface, not a requirement to copy its lifecycle trade-offs.

## Migration steps

**Delivery phase:** P2 — text presentation; P3 for interactive disclosure. **Task state:** 🔵 Planned.
**Prerequisites:** P0 external CSS and P3 Tooltip only if overflow disclosure is retained in the [master plan](../migration-plan.md).
**Next task:** define one-line and multiline CSS truncation while leaving complete text in the DOM.

1. [ ] **Build the CSS baseline.** Specify overflow constraints, line clamping and unsupported-browser fallback without a controller.
2. [ ] **Choose disclosure policy.** Decide how keyboard/touch users obtain hidden text; avoid requiring hover for essential content.
3. [ ] **Scope measurement.** Add optional overflow observation only for disclosure and clean it up on resize/disconnect.
4. [ ] **Reject remount shortcuts.** Test selectable text, font changes and table-cell content identity rather than copying performant-wrapper lifecycle behavior.

### Native primitives and fallback

- **Native path:** full text stays in a normal element; CSS text-overflow/line clamping provides optional truncation without JavaScript.
- **Small enhancement:** only an approved disclosure path needs a light-DOM controller and optional ResizeObserver. Guard clamping/observer support and otherwise show or scroll complete text. Container queries may adjust layout with media-query fallback; never remount text to mimic a framework wrapper.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/ellipsis)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **5 local table rows + 0 supplementary declarations + 0 inherited rows = 5 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Tooltip](tooltip.md). Opaque types without local member definitions remain unreviewed.


### Ellipsis, PerformantEllipsis Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`expand-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `expand-trigger` attribute or JS `expandTrigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`line-clamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `line-clamp` attribute or JS `lineClamp`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `tooltip` attribute or JS `tooltip`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Ellipsis Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L33) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md#L34) | Slot | Candidate authored `tooltip` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
