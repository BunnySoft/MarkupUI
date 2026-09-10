# Carousel and CarouselItem

**🟢 Verified retained native single-slide-per-view scope.** Native authored scroll
containers and external scroll-snap CSS, small opt-in JS, real buttons and guarded
autoplay. This is not a Swiper/gesture/animation engine or framework compatibility layer.

## Baseline, target and review

The unchanged [widgets baseline](../../../src/plugins/widgets.ts) adopts legacy
`mui-carousel-item` nodes and implements `next`, `previous`, `select` with hidden-slide
wraparound. Its legacy behavior is not silently replaced.

- **HTML:** named native region/viewport, authored article/section/div CarouselItems,
  hidden-until-bound controls and separate readout. Inactive slides are not hidden/inert.
- **JS:** [optional controller](../../../src/components/carousel/carousel.ts) owns
  current/target/default indices, native alignment, controls and autoplay lifetime.
- **CSS:** [external style](../../../src/components/carousel/carousel.css) owns one-slide
  layout, overflow, start snap, focus and print. No runtime style installation.
- **Default-style audit:** [2026-09-11 rendered comparison](../../style-audit/components/carousel.md)
  records 28px labelled controls, theme/current/disabled treatment and retained
  native scroll-snap/control topology.
- **Contract and observed evidence:** [canonical Carousel](../../components/carousel.md),
  [tests](../../../tests/carousel.test.ts), [local demo](../../../demo/components/carousel.html).

Pinned [Carousel source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/Carousel.tsx#L73-L145),
[interaction](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/Carousel.tsx#L578-L786),
[arrows](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselArrow.tsx#L50-L77),
[dots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselDots.tsx#L30-L138)
and [CarouselItem](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L12-L101)
were reviewed. Source wheel interception, custom role controls and hidden inactive
options are deliberately not copied. Native touch/wheel scrolling, real type=button
actions, no focus relocation, preserved native form membership and focus/hover/
visibility/motion autoplay pauses are adaptations, not claims of identical behavior.

## Migration steps

**Delivery phase:** P6 — specialized. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted P1 controls and native P3 focus/motion/ownership conventions;
broader P0-01–P0-09 foundation tasks remain independently open/partial.
**Next task:** dependency-ready Watermark or a separately scoped Time/Number Animation/
Countdown temporal primitive route; no other P6 route is implemented here.

1. [x] **Preserve slide identity.** Original node/form/listener adoption, current-node
   refresh/reorder/removal, restoration and no-JS behavior verified.
2. [x] **Implement manual navigation.** Native button/viewport keys, current/target
   indices, snap completion, bounds/wrap, vertical/RTL/zoom/hidden/resize verified.
3. [x] **Gate autoplay.** Explicit opt-in accessible pause/play; persistent user pause,
   temporary pause reasons, motion, stale work and disposal verified.
4. [x] **Bound advanced scope.** Every reference identity below resolved, companion
   source additions explicit, no clone loop/multislide/effect claims; independent
   ESM/classic/CSS build budgets, native/legacy and browser fallback acceptance recorded.

### Native primitives and fallback

Native overflow and scroll-snap provide plain scrolling before JS. A helper adopts,
never registers/re-renders/clones, authored CarouselItem elements. Manual commands wrap
between actual endpoints, **not** seamless infinite swipe. ResizeObserver observes
the native viewport; missing observation requires resize/explicit refresh. Native
scrollend or bounded event-driven debounce finalizes actual alignment, with no
per-frame physics/layout polling. Missing Element.scrollTo leaves controls hidden.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/carousel)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel)
- [Catalog and provenance](../index.md) · [Architecture and statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **31 original local table rows + 10 original inline
declarations + 6 explicit source supplements + 3 source-inherited rows = 50 tracker
rows**. All original 41 identities remain one-for-one, including their pinned links.
The nine added identities are explicitly identified below, not invented English-table
props. **35 native adaptations + 15 intentional omissions; zero unresolved.**
Verified means the declared target, never all upstream effects/props or all-browser/AT parity.

### Carousel Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`autoplay`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L34) | Prop | Explicit `autoplay` option, false by default; requires a real pause/play button. | 🟢 Verified | Persistent user pause plus focus/hover/visibility/motion/layout/lifetime gates. |
| [`centered-slides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L35) | Prop | No centered or multi-slide geometry engine. | ⏭️ Intentionally omitted | One full start-aligned native slide. |
| [`current-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L36) | Prop | Initial `currentIndex`, silent `set({currentIndex})`, settled state/getter. | 🟢 Verified | Target is separate; native completion resolves actual index; -1 when empty. |
| [`default-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L37) | Prop | Clamped defaultIndex and explicit reset. | 🟢 Verified | Future default is distinct from current; no form-reset or reactive watcher inference. |
| [`direction`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L38) | Prop | horizontal/vertical option and external flex/snap CSS. | 🟢 Verified | Native physical axis; horizontal-tb writing mode; RTL separately inherited. |
| [`dot-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L39) | Prop | Author controls in DOM and external layout CSS. | 🟢 Verified | No overlay-positioning prop; labels and reading order remain native. |
| [`dot-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L40) | Prop | Author labelled indicator buttons with external dot/line/number decoration. | 🟢 Verified | No prop-generated dot renderer; native button dimensions/focus remain. |
| [`draggable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L41) | Prop | No simulated mouse swipe/drag engine. | ⏭️ Intentionally omitted | Native scrollbar, trackpad, touch and text selection remain. |
| [`effect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L42) | Prop | Native scrolling only; no fade/card/custom/3D effect contract. | ⏭️ Intentionally omitted | Normal native scroll is not an effect-prop implementation. |
| [`interval`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L43) | Prop | interval option, 5000ms default, explicit bounded integer. | 🟢 Verified | Full delay after completion/resume; no catch-up burst. |
| [`keyboard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L44) | Prop | Viewport-only axis arrows/Home/End; default true. | 🟢 Verified | Deliberate dots-only/default-false difference; no editing/cross-axis key capture. |
| [`loop`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L45) | Prop | Modulo wrap for to/prev/next; false clamps and disables boundaries. | 🟢 Verified | Native swipe still ends at real extent; no clones/seamless infinite swipe. |
| [`mousewheel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L46) | Prop | No wheel-to-slide interception flag. | ⏭️ Intentionally omitted | Passive observation; horizontal native scrolling and vertical page scroll remain. |
| [`next-slide-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L47) | Prop | No inline style-string/object or card-effect pipeline. | ⏭️ Intentionally omitted | External inner-content decoration may use native next-slide marker. |
| [`prev-slide-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L48) | Prop | No inline style-string/object or card-effect pipeline. | ⏭️ Intentionally omitted | External inner-content decoration may use native previous-slide marker. |
| [`show-arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L49) | Prop | Author/omit previous/next type=button controls. | 🟢 Verified | No automatic arrow injection; keep disabled focused controls usable. |
| [`show-dots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L50) | Prop | Author/omit indexed type=button indicators. | 🟢 Verified | Native aria-current, not incomplete tab semantics. |
| [`slides-per-view`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L51) | Prop | Fixed one full slide per view; no numeric/auto-width API. | ⏭️ Intentionally omitted | Multi-slide/variable-width sizing requires separate scope. |
| [`space-between`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L52) | Prop | Zero viewport/outer-slide gap only. | ⏭️ Intentionally omitted | Put visual spacing inside each original slide. |
| [`touchable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L53) | Prop | Browser-owned touch scrolling, touch-action:auto. | 🟢 Verified | Touch available without JS; no disable-touch gesture flag. |
| [`transition-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Prop | No inline transition or custom animation pipeline. | ⏭️ Intentionally omitted | Browser decides native smooth timing; reduced motion uses instant commands. |
| [`transition-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L55) | Prop | No Vue TransitionProps forwarding/hooks. | ⏭️ Intentionally omitted | No VDOM/transition framework. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L56) | Prop | Native button click/keyboard activation only. | 🟢 Verified | Hover-to-switch deliberately excluded; hover instead pauses autoplay. |
| [`on-update:current-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L57) | Callback | mui:carousel-change and onUpdateCurrentIndex option. | 🟢 Verified | Settled index/identity, previous index/node and reason; stale reentrant callbacks suppressed. |

### Carousel Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L63) | Slot | Original native viewport slide children. | 🟢 Verified | App may instantiate a template for new content; no loop clones or renderer. |
| [`arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Slot | Original previous/next buttons with literal children. | 🟢 Verified | No scoped slot/provider; explicit controller context below. |
| [`dots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Slot | Original indexed buttons with literal labels/decorations. | 🟢 Verified | No dot VNodes, automatic collection renderer or focus stealing. |

### Carousel Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L71) | Method | controller.to(safeInteger). | 🟢 Verified | Native target then actual completion; clamps or wraps. |
| [`prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L72) | Method | controller.prev(). | 🟢 Verified | Uses latest pending target; legacy previous remains separate. |
| [`next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L73) | Method | controller.next(). | 🟢 Verified | Rapid next commands accumulate; real boundaries and empty state. |
| [`getCurrentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L74) | Method | controller.getCurrentIndex(). | 🟢 Verified | Settled index, initial hidden selection caveat, -1 when empty. |

### Carousel Props: transition-style inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`transition-style.transitionDuration?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Inline record field | No programmable native smooth duration. | ⏭️ Intentionally omitted | Browser owns scrolling timing, not an authored transition object. |
| [`transition-style.transitionTimingFunction?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L54) | Inline record field | No programmable smooth easing. | ⏭️ Intentionally omitted | No animation engine. |

### Carousel Slots: arrow inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`arrow.total`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | controller.state.total / slides.length. | 🟢 Verified | Explicit fresh state, not injected slot props. |
| [`arrow.currentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | controller.state.currentIndex. | 🟢 Verified | Separate targetIndex while moving. |
| [`arrow.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | controller.to. | 🟢 Verified | Bound native operation, no renderer context. |
| [`arrow.prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | controller.prev. | 🟢 Verified | Same command/boundary contract. |
| [`arrow.next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L64) | Inline record field | controller.next. | 🟢 Verified | Same rapid-target/completion contract. |

### Carousel Slots: dots inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`dots.total`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | controller.state.total. | 🟢 Verified | App owns the indicator collection. |
| [`dots.currentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | controller.state.currentIndex / native aria-current. | 🟢 Verified | No tabs or automatic focus changes. |
| [`dots.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/demos/enUS/index.demo-entry.md#L65) | Inline record field | controller.to / data-carousel-to buttons. | 🟢 Verified | One native activation and settled notification. |

### Explicit source additions: callback alias and CarouselItem

These **six source supplements** were absent from the original 41-row inventory.
CarouselItem has no additional public props table; its source default-slot context
is retained as native authored content and read-only DOM markers, not an option-role
or hidden-slide renderer.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`onUpdateCurrentIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/Carousel.tsx#L142-L144) | Source callback alias | One explicit onUpdateCurrentIndex callback. | 🟢 Verified | Not a second duplicate notification path. |
| [`CarouselItem.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L92-L97) | Source slot | Original data-carousel-item descendants. | 🟢 Verified | Identity, fields, reading order and listeners remain. |
| [`CarouselItem.default.isPrev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L93) | Source slot field | data-carousel-previous-slide marker. | 🟢 Verified | Logical previous node, wrapping only with enabled loop and another slide. |
| [`CarouselItem.default.isNext`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L94) | Source slot field | data-carousel-next-slide marker. | 🟢 Verified | Logical next node; no style forwarding. |
| [`CarouselItem.default.isActive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L95) | Source slot field | data-carousel-current marker. | 🟢 Verified | Settled current identity, not hidden/inert/aria-hidden suppression. |
| [`CarouselItem.default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/CarouselItem.tsx#L96) | Source slot field | data-carousel-index and controller.slides. | 🟢 Verified | Real refreshed DOM order, no cloned/generated index. |

### Explicit source-inherited theme props

The source [useTheme.props spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/carousel/src/Carousel.tsx#L74)
adds these **three inherited source rows**, not English table rows.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No theme graph/provider/CSS-in-JS. | ⏭️ Intentionally omitted | Explicit external CSS and local custom properties. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No runtime component theme override bag. | ⏭️ Intentionally omitted | Author external inner-content/focus/size CSS. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No private theme override precedence. | ⏭️ Intentionally omitted | Legacy theme compatibility remains separate. |

<!-- END PINNED API INVENTORY -->
