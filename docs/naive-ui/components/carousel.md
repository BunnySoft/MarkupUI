# Carousel

**Plan: Planned. Current baseline: partial widgets plugin; not parity-verified.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) moves authored slides into a viewport and implements `next`, `previous`, `select`, and wraparound.

- **HTML:** ordered slides, native previous/next buttons, and a static reading fallback.
- **JS:** preserve focus and index identity; add autoplay only with explicit pause/visibility controls.
- **CSS:** prefer scroll snapping and reduced-motion-aware transitions.
- **Placement:** proposed `src/optional/carousel/`; retain plugin compatibility.

## Acceptance and gaps

Test empty/single slides, dynamic children, touch/keyboard use, focus in hidden slides and reconnect cleanup. Effects, drag gestures, autoplay and responsive slide sizing are not existing parity.

## Upstream implementation evidence

Targeted [carousel interaction](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/Carousel.tsx#L578-L786), [arrows](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselArrow.tsx#L50-L77), and [dots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselDots.tsx#L30-L138) review found wheel interception, limited reviewed autoplay pause conditions, and custom-role controls whose files do not establish complete keyboard semantics. Use actual buttons; do not capture wheel scrolling by default. Pause optional autoplay on focus, document invisibility and reduced-motion preference as well as pointer interaction. These are deliberate improvements, not claims of identical behavior.

## Migration steps

**Delivery phase:** P6 — specialized. **Task state:** 🔵 Planned.
**Prerequisites:** P1 native buttons, P3 focus/motion policy and optional-module budgets in the [master plan](../migration-plan.md).
**Next task:** define a readable static slide list and native previous/next controls before choosing animation effects.

1. [ ] **Preserve slide identity.** Adopt authored slides and specify index changes after insertion/removal; do not reconstruct slide contents.
2. [ ] **Implement manual navigation.** Add keyboard-operable controls, current-slide announcements and scroll-snap presentation without wheel capture.
3. [ ] **Gate autoplay.** Make it optional with pause on focus, pointer use, document invisibility and reduced motion; dispose timers on disconnect.
4. [ ] **Bound advanced scope.** Decide drag/effect/responsive-slide rows separately and test empty/single slides, hidden focus and repeated connection.

### Native primitives and fallback

- **Native path:** ordered light-DOM slides, real buttons and CSS scroll snapping provide manual navigation. Data-created slides may clone a native template; existing keyed slide nodes remain intact.
- **Small enhancement:** a custom element owns scroll/autoplay listeners and timers. Use reduced-motion media queries and document visibility; observe size only when responsive measurements are necessary. Feature-detect observers/scroll capabilities and fall back to a readable scrolling slide list, not a gesture or animation polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/carousel)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **31 local table rows + 10 supplementary declarations + 0 inherited rows = 41 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Carousel Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`autoplay`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate presence attribute `autoplay`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`centered-slides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `centered-slides`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`current-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `current-index` attribute or JS `currentIndex`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate native default/reset state for `default-index`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`direction`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `direction` attribute or JS `direction`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dot-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit JS `dotPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dot-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate `dot-type` attribute or JS `dotType`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`draggable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate explicit JS `draggable` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`effect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `effect` attribute or JS `effect`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`interval`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `interval` attribute or JS `interval`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keyboard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate presence attribute `keyboard`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loop`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate presence attribute `loop`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`mousewheel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate presence attribute `mousewheel`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`next-slide-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L47) | Prop | External CSS class/custom property for `next-slide-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`prev-slide-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L48) | Prop | External CSS class/custom property for `prev-slide-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`show-arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate live JS `showArrow` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-dots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate live JS `showDots` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`slides-per-view`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate `slides-per-view` attribute or JS `slidesPerView`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`space-between`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate `space-between` attribute or JS `spaceBetween`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`touchable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate presence attribute `touchable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`transition-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Prop | External CSS class/custom property for `transition-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`transition-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate explicit native-child configuration for `transition-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate `trigger` attribute or JS `trigger`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:current-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L57) | Callback | Candidate DOM `mui:change:current-index` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Carousel Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L63) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Slot | Candidate authored `arrow` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Slot | Candidate authored `dots` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Carousel Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L71) | Method | Candidate plain-JS `to` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | B1 select(index); name differs; partial only, verify this row. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L72) | Method | Candidate plain-JS `prev` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | B1 previous(); name differs; partial only, verify this row. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L73) | Method | Candidate plain-JS `next` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | B1 next(); partial only, verify this row. |
| [`getCurrentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L74) | Method | Candidate plain-JS `getCurrentIndex` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Carousel Props: transition-style inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`transition-style.transitionDuration?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Inline record field | External CSS class/custom property for `transition-style.transition-duration`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`transition-style.transitionTimingFunction?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Inline record field | External CSS class/custom property for `transition-style.transition-timing-function`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Carousel Slots: arrow inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`arrow.total`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow.currentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow.prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow.next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Carousel Slots: dots inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`dots.total`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dots.currentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dots.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
