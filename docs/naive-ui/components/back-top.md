# Back Top

**Plan: Planned. Current baseline: button/link primitives only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) provides buttons, not scroll-threshold behavior.

- **HTML:** labelled top-of-page fragment link or explicit container-scroll button.
- **JS:** optional threshold visibility and native `scrollTo`.
- **CSS:** external fixed position, safe-area offsets and visibility states.
- **Placement:** proposed `src/optional/back-top/`.

## Acceptance and gaps

Test nested containers, reduced motion, focus destination, zoom and cleanup. Scrolling alone must not leave keyboard focus in a now-distant control without a documented policy.

## Migration steps

**Delivery phase:** P3 — scroll navigation. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button/link semantics and P0 scroll-listener disposal in the [master plan](../migration-plan.md).
**Next task:** choose a top fragment link for document scrolling or an explicit button for a named container.

1. [ ] **Define destination/focus.** Specify where activation scrolls and whether focus moves to a meaningful top target.
2. [ ] **Implement threshold state.** Observe only the owned container and update visibility without excessive scroll work.
3. [ ] **Extract placement.** Use logical offsets, safe areas and external visible/hidden motion styles.
4. [ ] **Test scroll ownership.** Cover nested roots, reduced motion, root removal, keyboard use and focus after returning to the top.

### Native primitives and fallback

- **Native path:** a real top fragment link, or an explicitly labelled button for a separate scroll container; native scrolling owns the movement.
- **Small enhancement:** an optional light-DOM controller owns threshold observation/listeners and cleanup. CSS logical fixed positioning/safe areas handles placement. Feature-detect observer/smooth-scroll affordances and fall back to a visible link and instant scroll, not a scroll-animation polyfill. Reduced motion takes precedence over decorative movement.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/back-top)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### BackTop Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate `bottom` attribute or JS `bottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`listen-to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate explicit JS `listenTo` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `right` attribute or JS `right`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`visibility-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `visibility-height` attribute or JS `visibilityHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/back-top/demos/enUS/index.demo-entry.md#L30) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
