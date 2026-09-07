# Divider

**Plan: Planned. Current baseline: core separator role/orientation and styles; not parity-verified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) assigns separator role and initial orientation; [B2: styles.ts](../../../src/components/styles.ts) styles `mui-divider`.

- **HTML:** native `hr` for thematic breaks; decorative separators remain hidden from accessibility APIs.
- **JS:** none for basic separation.
- **CSS:** logical borders, vertical/horizontal layout and optional caption alignment.
- **Placement:** proposed `src/components/divider/divider.css`; preserve existing markup.

## Acceptance and gaps

Check semantic versus decorative use, text captions, high contrast and RTL. Vertical orientation must not introduce redundant announced separators.

## Migration steps

**Delivery phase:** P2 — primitives/layout. **Task state:** 🔵 Planned.
**Prerequisites:** P0 semantic/decorative distinctions and external CSS in the [master plan](../migration-plan.md).
**Next task:** decide when Divider is a thematic `hr` and when it is a decorative border.

1. [ ] **Choose semantics.** Define horizontal/vertical separation and caption markup without duplicate screen-reader announcements.
2. [ ] **Extract border layout.** Implement logical borders and title alignment entirely in CSS; retain existing orientation compatibility.
3. [ ] **Resolve size and placement rows.** Set supported caption positions and border variants without a runtime layout controller.
4. [ ] **Check rendering contexts.** Verify RTL, forced colors, print, narrow containers and decorative accessibility hiding.

### Native primitives and fallback

- **Native path:** use `hr` for thematic separation or a decorative CSS border; captioned layouts use ordinary authored text and flex/grid.
- **Small enhancement:** none is required. Logical border properties and media queries cover direction/orientation; optional `:has()` caption selectors fall back to explicit classes. A custom-element wrapper must not add unnecessary lifecycle work or pretend child conventions are native slots.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/divider)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **4 local table rows + 0 supplementary declarations + 0 inherited rows = 4 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Divider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`dashed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L19) | Prop | External CSS token/class for `dashed`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate explicit JS `titlePlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L21) | Prop | External CSS token/class for `vertical`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Divider Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md#L27) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
