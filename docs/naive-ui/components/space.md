# Space

**Plan: Planned. Current baseline: row/stack/wrap spacing primitives.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) supplies layout/spacing selectors.

- **HTML:** normal container children, without mandatory anonymous wrappers.
- **JS:** none.
- **CSS:** external gap, alignment, wrap and direction with logical axes.
- **Placement:** proposed `src/components/space/space.css`; prefer existing composition.

## Acceptance and gaps

Check mixed inline/block children, empty items, wrapping, RTL and DOM order. Internal wrapper toggles are not required when native gap solves spacing.

## Migration steps

**Delivery phase:** P2 — CSS spacing. **Task state:** 🔵 Planned; a dedicated spacing controller is unnecessary.
**Prerequisites:** P2 Flex and P0 CSS-token conventions in the [master plan](../migration-plan.md).
**Next task:** map Space's retained spacing/alignment behavior to native gap on existing layout wrappers.

1. [ ] **Define gap equivalents.** Resolve horizontal/vertical size and alignment without inserting anonymous wrappers.
2. [ ] **Specify wrapping.** Keep mixed inline/block children and empty items predictable under native flex/grid layout.
3. [ ] **Record framework exclusions.** Omit wrapper-rendering controls that exist only to support the upstream component abstraction.
4. [ ] **Test CSS-only use.** Verify nested gaps, RTL, wrapping and focus order with JavaScript absent.

### Native primitives and fallback

- **Native path:** CSS flex/grid gap, wrap and alignment on existing authored containers; no anonymous item wrappers or dedicated custom element are needed.
- **Small enhancement:** optional container queries and `:has()` are guarded with plain classes/media-query fallback. Ordinary margins/block flow may serve the supported legacy baseline if gap behavior is unavailable. Do not add measurement observers, slot emulation or a spacing polyfill framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/space)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **11 local table rows + 0 supplementary declarations + 0 inherited rows = 11 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Space Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L25) | Prop | External CSS token/class for `align`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS token/class for `inline`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`wrap-item`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `wrap-item`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `item-class` attribute or JS `itemClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`item-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS class/custom property for `item-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`justify`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `justify`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`reverse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `reverse`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `vertical`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `wrap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Space Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md#L40) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
