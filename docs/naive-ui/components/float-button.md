# Float Button

**Plan: Planned. Current baseline: button primitive only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) contains `MuiButton`, not floating-group behavior.

- **HTML:** native button/link and optionally labelled action group.
- **JS:** only grouped disclosure/focus behavior when needed.
- **CSS:** fixed/sticky positioning, safe-area offsets and responsive grouping.
- **Placement:** proposed `src/components/float-button/`; CSS-first.

## Acceptance and gaps

Test mobile safe areas, zoom, sticky headers, keyboard traversal and expanded-group focus. Floating placement must not hide form controls or rely on arbitrary global z-index escalation.

## Migration steps

**Delivery phase:** P2 — CSS placement; P3 for group disclosure. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button and P3 focus ownership for expandable groups in the [master plan](../migration-plan.md).
**Next task:** define fixed/sticky native-button markup with safe-area-aware external CSS.

1. [ ] **Reuse native actions.** Preserve Button activation/naming and keep links as links rather than creating a second button engine.
2. [ ] **Resolve group anatomy.** Specify ordering, labels and any expandable action list independently of single-button placement.
3. [ ] **Implement placement CSS.** Use logical offsets and safe areas; avoid arbitrary global z-index escalation.
4. [ ] **Verify obstruction and focus.** Test zoom/mobile keyboards, underlying form access, collapsed-group focus and reduced motion.

### Native primitives and fallback

- **Native path:** native buttons/links plus CSS fixed/sticky positioning, logical offsets and safe-area environment variables. A static group can remain ordinary authored light DOM.
- **Small enhancement:** only expandable groups need a small lifecycle-managed disclosure/popover controller. Feature-detect popover support and fall back to visible grouped actions or details/summary. Keep safe defaults when environment variables are unavailable; do not add global overlay state merely for placement.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/float-button)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **20 local table rows + 0 supplementary declarations + 0 inherited rows = 20 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### FloatButton Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate `bottom` attribute or JS `bottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L25) | Prop | External CSS token/class for `height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `left` attribute or JS `left`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`menu-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `menu-trigger` attribute or JS `menuTrigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `right` attribute or JS `right`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`shape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `shape` attribute or JS `shape`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate live JS `showMenu` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `top` attribute or JS `top`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show-menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L35) | Callback | Candidate DOM `mui:change:show-menu` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### FloatButtonGroup Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate `bottom` attribute or JS `bottom`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`left`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `left` attribute or JS `left`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`right`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `right` attribute or JS `right`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`shape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `shape` attribute or JS `shape`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate `top` attribute or JS `top`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### FloatButton Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L52) | Slot | Candidate authored `description` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`menu`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md#L53) | Slot | Candidate authored `menu` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
