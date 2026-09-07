# Affix

**Plan: Planned. Current baseline: layout primitives only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) offers basic layout attributes, not affix behavior.

- **HTML:** content remains in normal document order.
- **JS:** none for sticky baseline; optional boundary observation only for retained fixed-container behavior.
- **CSS:** `position: sticky`, logical offsets and explicit containing block.
- **Placement:** proposed `src/components/affix/`; optional observer separately imported.

## Acceptance and gaps

Test nested scroll containers, overflow ancestors, top/bottom offsets, zoom and layout shifts. CSS sticky limitations are not silently treated as fixed-position parity.

## Migration steps

**Delivery phase:** P2 — native/CSS positioning. **Task state:** 🔵 Planned.
**Prerequisites:** P0 external CSS and explicit scroll-container ownership in the [master plan](../migration-plan.md).
**Next task:** choose sticky positioning and document which ancestor establishes its scrolling boundary.

1. [ ] **Keep content in flow.** Define sticky wrapper markup without moving authored nodes into a global host.
2. [ ] **Map offsets to CSS.** Resolve top/bottom and logical-axis offsets with responsive rules.
3. [ ] **Scope non-sticky cases.** Decide whether fixed-container observation is justified; keep any listener-based fallback optional.
4. [ ] **Test containing blocks.** Cover nested overflow, short containers, zoom, layout shifts and simultaneous top/bottom constraints.

### Native primitives and fallback

- **Native path:** ordinary authored content with CSS position: sticky and logical inset properties; no custom element is needed for the sticky baseline.
- **Small enhancement:** feature-detect positioning/CSS needs and leave content in normal flow when sticky cannot apply. Only a separately approved boundary notification may use an observer in a lifecycle-managed wrapper. Do not build a scroll-driven affix polyfill merely to force unsupported containing-block behavior.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/affix)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 local table rows + 0 supplementary declarations + 0 inherited rows = 6 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Affix Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L18) | Prop | Candidate `bottom` attribute or JS `bottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`listen-to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate explicit JS `listenTo` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger-bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate `trigger-bottom` attribute or JS `triggerBottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger-top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `trigger-top` attribute or JS `triggerTop`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `top` attribute or JS `top`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
