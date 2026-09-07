# Drawer

**Plan: Planned. Current baseline: dialog-derived drawer wrapper; not parity-verified.**

## Baseline and target

[B1: overlays.ts](../../../src/components/overlays.ts) gives drawer the same native-modal controller as dialog; [B2: styles.ts](../../../src/components/styles.ts) positions it.

- **HTML:** native dialog with authored header/content/footer; nonmodal navigation uses different semantics.
- **JS:** open/close, focus, scroll ownership and optional resize.
- **CSS:** external edge placement, responsive extent and reduced-motion transitions.
- **Placement:** proposed `src/components/drawer/`.

## Acceptance and gaps

Test all edges, mobile viewport, nested overlays, scroll locking and resize keyboard alternative. DrawerContent props and transition callbacks are not inherited merely from the class name.

## Upstream implementation evidence

Targeted [Drawer body review](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/src/DrawerBodyWrapper.tsx#L75-L220) and [resize lifecycle](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/src/DrawerBodyWrapper.tsx#L245-L353) show coordinated modal behavior and temporary body mouse listeners. Cleanup is useful reference evidence; the reviewed resize trigger does not establish keyboard resizing. MarkupUI's optional resize handle must be a labelled, keyboard-operable separator, with pointer cancellation and disconnect tests. No blanket Drawer parity is claimed.

## Migration steps

**Delivery phase:** P3 — modal interactions. **Task state:** 🔵 Planned.
**Prerequisites:** P3 Dialog focus/scroll ownership and P1 authored content in the [master plan](../migration-plan.md).
**Next task:** distinguish modal drawers from nonmodal navigation panels and define edge-specific anatomy.

1. [ ] **Specify DrawerContent.** Preserve authored header/body/footer and accessible naming without replacing existing panel content.
2. [ ] **Resolve lifecycle.** Define open/default state, mask/Escape policy, scroll locking and transition completion events.
3. [ ] **Scope optional resizing.** Use a keyboard-operable separator, bounded sizes and pointer capture with cleanup.
4. [ ] **Test panel edges.** Cover all placements, mobile viewport changes, nested overlays, resized bounds and focus after dismissal.

### Native primitives and fallback

- **Native path:** native dialog for modal drawers or ordinary aside/navigation for nonmodal content, with authored header/body/footer and real close controls.
- **Small enhancement:** a light-DOM controller owns lifecycle and optional Pointer Events/setPointerCapture resizing with a keyboard separator. Feature-detect dialog/pointer capabilities; fall back to an inline panel or fixed nonresizable size instead of polyfills. CSS logical edge placement/container queries and reduced motion handle presentation.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/drawer)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **47 local table rows + 0 supplementary declarations + 0 inherited rows = 47 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Drawer Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`auto-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate explicit JS `autoFocus` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`block-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate explicit JS `blockScroll` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`close-on-esc`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate presence attribute `close-on-esc`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`default-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate native default/reset state for `default-width`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate native default/reset state for `default-height`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L34) | Prop | No framework if/show directive; document native hidden/open state and node preservation instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS token/class for `height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate explicit JS `nativeScrollbar` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`mask-closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate presence attribute `mask-closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L38) | Prop | External CSS token/class for `max-width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`max-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L39) | Prop | External CSS token/class for `max-height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`min-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L40) | Prop | External CSS token/class for `min-width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`min-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L41) | Prop | External CSS token/class for `min-height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`resizable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate presence attribute `resizable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-mask`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate live JS `showMask` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trap-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate explicit JS `trapFocus` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L49) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`z-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate `z-index` attribute or JS `zIndex`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-after-enter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L51) | Callback | Candidate DOM `mui:after-enter` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-after-leave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L52) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-esc`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L53) | Callback | Candidate DOM `mui:esc` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-mask-click`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L54) | Callback | Candidate DOM `mui:mask-click` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L55) | Callback | Candidate DOM `mui:change:height` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L56) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L57) | Callback | Candidate DOM `mui:change:width` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DrawerContent Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`body-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L63) | Prop | Candidate `body-class` attribute or JS `bodyClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`body-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L64) | Prop | External CSS class/custom property for `body-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`body-content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L65) | Prop | Candidate `body-content-class` attribute or JS `bodyContentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`body-content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L66) | Prop | External CSS class/custom property for `body-content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L67) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L68) | Prop | Candidate `footer-class` attribute or JS `footerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L69) | Prop | External CSS class/custom property for `footer-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`header-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L70) | Prop | Candidate `header-class` attribute or JS `headerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L71) | Prop | External CSS class/custom property for `header-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L72) | Prop | Candidate explicit JS `nativeScrollbar` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L73) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L74) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Drawer Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L80) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DrawerContent Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L86) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L87) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/drawer/demos/enUS/index.demo-entry.md#L88) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
