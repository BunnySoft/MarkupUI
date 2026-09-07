# List

**Plan: Planned. Current baseline: list/item roles and styles; not parity-verified.**

## Baseline and target

[B1: elements.ts](../../../src/components/elements.ts) assigns list/listitem roles; [B2: styles.ts](../../../src/components/styles.ts) supplies presentation.

- **HTML:** native ordered/unordered list with authored item, prefix and action regions.
- **JS:** none for a static list.
- **CSS:** external borders, spacing, hover and responsive action alignment.
- **Placement:** proposed `src/components/list/list.css`.

## Acceptance and gaps

Check reading order, nested lists, actual link/button actions and text zoom. Clickable appearance must not turn every list item into an undocumented control.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🔵 Planned.
**Prerequisites:** P0 semantic children and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** define native ul/ol/li markup preserving existing list/item compatibility.

1. [ ] **Specify item regions.** Map prefix, content, suffix and actions to authored children in meaningful reading order.
2. [ ] **Separate action semantics.** Keep links/buttons explicit rather than treating hoverable items as controls.
3. [ ] **Extract list presentation.** Move borders, spacing and responsive action alignment to CSS with no mandatory renderer.
4. [ ] **Validate list contexts.** Test nested lists, empty regions, long content, keyboard actions and no-JS structure.

### Native primitives and fallback

- **Native path:** authored `ul`/`ol`/`li` and actual action links/buttons. Data-provided items may clone `HTMLTemplateElement` content explicitly, with stable keyed nodes.
- **Small enhancement:** ordinary lists need no controller. CSS grid/flex, gap and optional container queries arrange regions with block-flow fallback. Keep action behavior with native controls; do not make a runtime list renderer, custom-element lifecycle or Shadow DOM slot layer mandatory.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/list)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 local table rows + 0 supplementary declarations + 0 inherited rows = 10 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### List Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L21) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`clickable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate presence attribute `clickable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`hoverable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate presence attribute `hoverable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-divider`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate live JS `showDivider` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### List Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L30) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L31) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L32) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ListItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L38) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L39) | Slot | Candidate authored `prefix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md#L40) | Slot | Candidate authored `suffix` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
