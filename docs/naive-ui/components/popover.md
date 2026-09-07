# Popover

**Plan: Planned. Current baseline: partial core floating controller; not parity-verified.**

## Baseline and target

[B1: overlays.ts](../../../src/components/overlays.ts) toggles trigger/content, outside click and Escape. [B2: position.ts](../../../src/core/position.ts) computes basic positioning.

- **HTML:** authored trigger and content, preferring native popover/anchor capabilities with supported fallback.
- **JS:** dismiss ownership, placement updates and event contracts without a positioning dependency.
- **CSS:** external surface, arrow and state styles.
- **Placement:** proposed `src/components/popover/` with narrowly shared positioning.

## Acceptance and gaps

Test clipping, scroll/resize, nested overlays, hover/focus, Escape ownership and reconnect. Current fixed placement is not collision, timing or lifecycle parity.

## Upstream implementation evidence

Targeted review of [Popover state/triggers](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/Popover.tsx#L269-L446) and [body behavior](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/src/PopoverBody.tsx#L142-L320) found coordinated visibility, disabled-state closure, separate hover timers and nested/outside-click handling. These are interaction requirements to assess, not code to port: upstream relies on Vue-oriented positioning/directive dependencies. Use authored triggers, native popover where supported, and per-instance listener/timer disposal. This review does not verify every public row.

## Migration steps

**Delivery phase:** P3 — floating foundations. **Task state:** 🔵 Planned.
**Prerequisites:** P0 authored-child/lifecycle contracts and native capability decisions in the [master plan](../migration-plan.md).
**Next task:** define trigger/content ownership and the native Popover/anchor fallback boundary.

1. [ ] **Specify visibility state.** Resolve show/default, disabled behavior, trigger modes and silent programmatic updates.
2. [ ] **Own dismissal locally.** Coordinate Escape, outside clicks, nested triggers and hover/focus timers without duplicate document listeners.
3. [ ] **Separate positioning/CSS.** Isolate measured coordinates from surface/arrow presentation and update on owned scroll/resize changes.
4. [ ] **Verify floating boundaries.** Test clipping, nested overlays, detached anchors, rapid hover changes and reconnect disposal across capability paths.

### Native primitives and fallback

- **Native path:** authored trigger/content using the Popover API and declarative popover targets where supported; optional reusable content may clone a native template without renderer syntax.
- **Small enhancement:** feature-detect popover and CSS anchor positioning independently. A small light-DOM controller owns only required fallback positioning/trigger coordination and lifecycle cleanup; otherwise use an inline/details disclosure. CSS logical properties and reduced motion style the surface. No positioning polyfill stack, dependency or Shadow DOM slot adapter.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/popover)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **38 local table rows + 0 supplementary declarations + 0 inherited rows = 38 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Popover Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`animated`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate presence attribute `animated`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow-point-to-center`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate presence attribute `arrow-point-to-center`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `arrow-class` attribute or JS `arrowClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS class/custom property for `arrow-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`arrow-wrapper-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `arrow-wrapper-class` attribute or JS `arrowWrapperClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow-wrapper-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS class/custom property for `arrow-wrapper-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L36) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`delay`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `delay` attribute or JS `delay`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L39) | Prop | No framework if/show directive; document native hidden/open state and node preservation instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate `duration` attribute or JS `duration`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`flip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate presence attribute `flip`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `footer-class` attribute or JS `footerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L43) | Prop | External CSS class/custom property for `footer-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`header-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `header-class` attribute or JS `headerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L45) | Prop | External CSS class/custom property for `header-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`keep-alive-on-hover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate presence attribute `keep-alive-on-hover`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`overlap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate presence attribute `overlap`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`raw`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate presence attribute `raw`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate presence attribute `scrollable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate live JS `showArrow` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate `trigger` attribute or JS `trigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L55) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`x`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate `x` attribute or JS `x`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`y`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L57) | Prop | Candidate `y` attribute or JS `y`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`z-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L58) | Prop | Candidate `z-index` attribute or JS `zIndex`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-clickoutside`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L59) | Callback | Candidate DOM `mui:clickoutside` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L60) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Popover Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L66) | Slot | Candidate authored `trigger` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L67) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L68) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L69) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Popover Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`setShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L75) | Method | Candidate plain-JS `setShow` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`syncPosition`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/popover/demos/enUS/index.demo-entry.md#L76) | Method | Candidate plain-JS `syncPosition` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
