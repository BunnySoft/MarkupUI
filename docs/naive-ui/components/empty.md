# Empty

**Plan: Planned. Current baseline: partial core empty state; not parity-verified.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) creates fallback icon/description only when no element children exist.

- **HTML:** readable description and optional native recovery action; decorative illustration is hidden.
- **JS:** normally none; dynamic status announcement is opt-in.
- **CSS:** external sizing and illustration/text/action layout.
- **Placement:** proposed `src/components/empty/`.

## Acceptance and gaps

Test authored versus generated content, localization, action naming and dynamically replaced empty states. No icon dependency or mandatory empty-state illustration is proposed.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P0 authored children and P1 Button for recovery actions in the [master plan](../migration-plan.md).
**Next task:** define how authored description/icon/action content takes precedence over generated defaults.

1. [ ] **Preserve author content.** Specify fallback text only when the corresponding region is absent, not by replacing the whole subtree.
2. [ ] **Separate illustration semantics.** Keep decorative icons hidden and make the empty condition understandable without imagery.
3. [ ] **Extract layout/size rules.** Style description and recovery actions externally with localizable text.
4. [ ] **Test empty-state transitions.** Cover generated/authored content, replaced results, keyboard recovery actions and optional live announcements.

### Native primitives and fallback

- **Native path:** readable paragraph/heading, optional decorative image and native recovery link/button. An authored template may provide an application-specific empty state, but no generic renderer is needed.
- **Small enhancement:** CSS flex/grid and logical spacing handle layout; normal flow is the fallback. Only explicitly requested dynamic announcement needs a small owner-controlled update. Without JavaScript or custom elements, the empty explanation and recovery navigation remain ordinary usable HTML.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/empty)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Empty Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate `description` attribute or JS `description`; exact target contract not reviewed. | ⚪ Not reviewed | B1 generated fallback text; partial only, verify this row. |
| [`show-description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate live JS `showDescription` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate live JS `showIcon` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L22) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Empty Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L28) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L29) | Slot | Candidate authored `extra` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md#L30) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
