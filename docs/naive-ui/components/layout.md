# Layout

**Plan: Planned. Current baseline: structural/layout wrappers; not parity-verified.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) applies basis/overflow; [B2: foundation.ts](../../../src/components/foundation.ts) supplies structure. No interactive sider exists.

- **HTML:** native header/main/footer/aside landmarks and authored content.
- **JS:** optional accessible sider collapse and explicit scroll methods.
- **CSS:** external shell/grid/sticky and responsive side-panel layout.
- **Placement:** proposed `src/components/layout/`; sider controller optional.

## Acceptance and gaps

Test landmark uniqueness, narrow screens, nested scrolling and collapsed-panel focus. Shared layout/header/footer/sider owners remain distinct; current wrappers do not prove native-scrollbar or collapse parity.

## Migration steps

**Delivery phase:** P2 — structural layout; P3 for interactive sider. **Task state:** 🔵 Planned.
**Prerequisites:** P0 native landmarks/external CSS and P3 focus rules for collapse in the [master plan](../migration-plan.md).
**Next task:** define native header/main/footer/aside anatomy and explicit scroll containers.

1. [ ] **Reconcile companion regions.** Map LayoutContent/Header/Footer/Sider without replacing authored structure or duplicating main landmarks.
2. [ ] **Extract shell layout.** Use CSS grid/flex, logical sizing and responsive rules instead of inline layout styles.
3. [ ] **Scope sider behavior.** Specify collapsed/default state, trigger actions and focus handling when navigation is hidden.
4. [ ] **Test nested shells.** Cover narrow screens, independent scrolling, sticky regions and sider focus before adding imperative scroll methods.

### Native primitives and fallback

- **Native path:** header/main/footer/aside landmarks with CSS grid/flex, logical sizing and authored content. Ordinary shells do not need a lifecycle controller.
- **Small enhancement:** only interactive sider disclosure uses a small light-DOM custom element, native button/details and cleanup. Feature-detect optional container-query/sticky/popover behavior and fall back to stacked landmarks/visible navigation. No layout measurement framework, native-slot claim or generic shell template runtime is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/layout)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **39 local table rows + 3 supplementary declarations + 0 inherited rows = 42 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Layout, Layout Content Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`embedded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `embedded`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`has-sider`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate presence attribute `has-sider`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate explicit JS `nativeScrollbar` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`sider-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit JS `siderPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L41) | Callback | Candidate DOM `mui:scroll` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout Footer Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L47) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate presence attribute `inverted`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout Header Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L55) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate presence attribute `inverted`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L57) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout Sider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L63) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`collapse-mode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L64) | Prop | Candidate `collapse-mode` attribute or JS `collapseMode`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L65) | Prop | Candidate presence attribute `collapsed`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-trigger-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L66) | Prop | Candidate `collapsed-trigger-class` attribute or JS `collapsedTriggerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-trigger-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L67) | Prop | External CSS class/custom property for `collapsed-trigger-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L68) | Prop | Candidate `collapsed-width` attribute or JS `collapsedWidth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L69) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L70) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`default-collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L71) | Prop | Candidate native default/reset state for `default-collapsed`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L72) | Prop | Candidate presence attribute `inverted`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L73) | Prop | Candidate explicit JS `nativeScrollbar` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L74) | Prop | Candidate `position` attribute or JS `position`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L75) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-collapsed-content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L76) | Prop | Candidate live JS `showCollapsedContent` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L77) | Prop | Candidate live JS `showTrigger` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L78) | Prop | Candidate `trigger-class` attribute or JS `triggerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L79) | Prop | External CSS class/custom property for `trigger-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L80) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`on-after-enter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L81) | Callback | Candidate DOM `mui:after-enter` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-after-leave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L82) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L83) | Callback | Candidate DOM `mui:scroll` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L84) | Callback | Candidate DOM `mui:change:collapsed` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout, Layout Content, Layout Sider, Layout Header, Layout Footer Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L90) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout, Layout Content, Layout Sider Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Layout, Layout Content, Layout Sider Methods: scrollTo inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.behavior`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
