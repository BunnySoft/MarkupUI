# Carousel and CarouselItem: native scroll-snap slides

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

The public native helper, M-prefixed classes and platform definitions below have been
retired. Use the [current Carousel demo and API](../../../demo/components/carousel.html).

**🟢 Verified retained single-slide-per-view scope.** The canonical Custom Element owns
the existing native scroll-snap controller while keeping every authored slide in light
DOM. Native scrolling owns touch, trackpad and wheel; there is no duplicate model tree,
slide renderer, mouse-drag/physics engine, cloned loop track, dependency or automatic
stylesheet installation. The plain-JavaScript native adapter remains available.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/carousel` | `MCarousel`, region classes, platform definitions, `registerCarousel`, `createCarousel`, and controller types |
| `dist/markup-ui-carousel.js` | Optional ESM |
| `dist/markup-ui-carousel.global.js` | `MarkupUICarousel`; refuses to overwrite an existing namespace |
| `@dataengine/markup-ui/carousel/style.css` | Required external native layout, snap, controls, focus and media CSS |
| [Local demo](../../../demo/components/carousel.html) | Comparison page mirroring all eighteen pinned Naive UI 2.45.3 demos with local assets, one highlighted code control per case, functional retained cases and explicit unsupported comparisons |
| [Complete reference](../naive/components/carousel.md) | Original 41 identities plus nine explicit source additions; all dispositions |

## Default-style audit — 2026-09-11

The [isolated rendered audit](../styling/components/carousel.md) keeps the native
one-slide scroll-snap viewport and adapts the reference's **28px** controls to labelled
native buttons. Previous/next/toggle actions retain readable text; numeric indicators
are 28px controls rather than inaccessible 8px custom dots.

Light/dark control surfaces, primary current state, disabled treatment, hover, forced
colors and print are explicit. Print expands all authored slides and hides both
enhancement controls and their current-slide readout. No transform track, cloned loop
slides, icon-only controls, custom drag engine or hidden inactive slides were added.

```html
<m-carousel aria-label="Project examples">
  <m-carousel-viewport id="examples" tabindex="0" aria-label="Example slides">
    <m-carousel-item><div class="slide-content">
      <h2>Draft</h2><label>Title <input name="title" required value="Original"></label>
    </div></m-carousel-item>
    <m-carousel-item><div class="slide-content">
      <h2>Review</h2><a href="#review">Open the review section</a>
    </div></m-carousel-item>
  </m-carousel-viewport>
  <m-carousel-controls hidden>
    <button type="button" data-carousel-prev>Previous slide</button>
    <button type="button" data-carousel-next>Next slide</button>
    <button type="button" data-carousel-to="0">Go to slide 1</button>
    <button type="button" data-carousel-to="1">Go to slide 2</button>
    <button type="button" data-carousel-toggle>Pause / play rotation</button>
  </m-carousel-controls>
  <m-carousel-readout>Scroll both examples.</m-carousel-readout>
</m-carousel>
```

```js
import "@dataengine/markup-ui/carousel"
const carousel = document.querySelector("m-carousel")
carousel.defaultIndex = 0
carousel.loop = true
carousel.next()
```

The connected root is a named `m-carousel`. Its direct `m-carousel-viewport` has a
unique author-owned ID, accessible name and `tabindex="0"`. Every element child of the
viewport is an `m-carousel-item`; item identity and authored form/listener state are
preserved. Whitespace/comments are not slides. Keep slide outer boxes undecorated; put
padding, borders and scrollable content inside. Nested carousels have independent
controllers. Native `div`/`section`/`article` elements with the corresponding
`data-carousel-*` markers remain supported as a Web-specific alternative.

At most one direct `m-carousel-controls` container is authored **hidden**. All its
enhancement actions are distinct labelled `type=button` controls: previous, next, rotation
and zero-based decimal `data-carousel-to` indicators. Each kind is optional; rotation
is mandatory when enabling autoplay. Indicators beyond the current count are disabled;
refresh does not generate/remove them. Controls may contain decorative spans, not
interactive descendants, implicit submit types, command/popover actions or fake tab roles.
One separate plain-text `m-carousel-readout` is required. Author no competing live region
around the carousel. All region, viewport and slide names must be unique and meaningful
in context.

Before upgrade, external CSS leaves the scrolling viewport, all slide contents, native
fields and links available while hidden enhancement controls stay absent. The Custom
Element validates before exposing controls and surfaces invalid anatomy explicitly.
Missing `Element.scrollTo` leaves the authored scrolling fallback unenhanced. Load the
external CSS explicitly: component JavaScript alone is not a carousel layout.

## Settings, indices and commands

| Setting | Default and retained meaning |
| --- | --- |
| `defaultIndex` | 0; safe integer, clamped on initial adoption/reset, not a form default |
| `currentIndex` | Initial default; `set({currentIndex})` silently clamps/aligns |
| `direction` | horizontal; initial `data-carousel-direction="vertical"` is also accepted |
| `loop` | true; command indices wrap by modulo; false clamps and disables boundaries |
| `autoplay` | false; explicit opt-in, requires rotation control |
| `interval` | 5000ms; integer 1000..2147483647; fresh delay after completion/resume |
| `keyboard` | true; viewport-only axis arrows/Home/End; deliberately not upstream dots-only default |
| `smooth` | true; native smooth scrolling, instant under reduced motion |
| `disabled` | false; stops enhancement movement/observers/timers, not native scrolling or fields |
| `onUpdateCurrentIndex` | Optional `(index, previousIndex, frozenChange)` notification |

Unknown keys, nonboolean flags, noninteger indices or invalid intervals reject. There
is no reactive prop watcher. `set` changes explicit settings; default changes do not
reset current selection. `reset()` silently clamps to the current default; native
form reset only restores native fields. Commands are ignored while disabled; do not
use disabled `set({currentIndex})` as a deferred navigation queue.

`to(index)`, `prev()` and `next()` navigate; `getCurrentIndex()` returns the settled
index, `-1` for empty. Empty and single-slide collections cannot rotate. Initial
adoption selects a clamped index even while hidden; its first physical alignment waits
for measurable layout. Thereafter an unmeasurable command retains `state.targetIndex`
and the previous settled index until reveal/refresh. `state` also exposes total,
defaultIndex, direction, disabled, ready, playing, paused and frozen pauseReasons.

**Target and current are different.** Rapid commands use the most recent target, not
the still-scrolling current slide. Only completion commits the nearest snap point.
Native `scrollend` commits immediately when consistent with the requested target;
an older mismatching completion is ignored until fresh scroll events or the bounded
**180ms quiet-event debounce** settle the actual nearest slide. Thus an interrupted
command can commit a different slide. No per-frame layout polling or physics occurs.
Instant/API settings and resize alignment settle synchronously when measurable.

`m:carousel-change` bubbles once per settled index **or current node identity**
change with `{index, previousIndex, slide, previousSlide, reason}`. Reasons are
api/control/autoplay/scroll/refresh. Initialization, `set` and reset are silent.
Resizing an already settled slide is silent; resize/reveal completing a pending command
retains that command's notification policy. Explicit identity/order `refresh` reports a changed index/identity.
Notifications never claim every intermediate smooth-scroll position. The event precedes
the options callback; a reentrant new command/settings/refresh/disconnect invalidates
the older callback. A callback may issue a new command or disconnect.

## Native geometry and extent

The external CSS defines **one full slide per viewport**, horizontal-tb writing mode,
zero outer slide/viewport margin/padding/border/gap, a positioned viewport containing
block and start-aligned mandatory snap. `--m-carousel-height` defaults to 20rem;
vertical carousels require a definite block size. Use external classes for root width,
inner decoration and responsive height. No JS style strings or geometry styles are written.

Targets are native slide `offsetLeft`/`offsetTop` differences relative to the first
slide. They and `scrollLeft`/`scrollTop` use **layout CSS pixels**, not visual rectangles.
Modern horizontal RTL uses negative native scrollLeft; vertical scrollTop remains
positive. Fractional layout rounding has a small bounded tolerance. Root/ancestor
CSS zoom was measured separately from the visual rectangle; native browser pinch/page
zoom is not an anchoring engine. Do not transform, independently zoom, reorder with CSS,
add margins/gaps to, change the containing block of, or apply custom scroll-padding/
scroll-margin/snap alignments to viewport/slide boxes. Rotated/skewed/transformed boxes,
alternate RTL coordinate models and non-horizontal writing modes are not supported.

Unsupported/zero geometry suspends movement rather than guessing distances. ResizeObserver
realigns the retained current/target slide, including initially hidden/revealed sizes;
without it use window resize or explicit `refresh()` after container changes. Closed
details ancestors and hidden/inert/content-visibility-hidden roots pause movement.
Native details toggle is observed; arbitrary CSS visibility changes that do not resize
need `refresh()` before resuming. Native extents bound swipes/scrolling at either end.

**Wrap commands are not seamless infinite swipe.** They scroll between actual end
positions without duplicates. There is no multi-slide/auto-width/centered/spacing engine,
fade/card/3D/custom transition, hover-to-switch, wheel interception or simulated mouse
drag. These omissions are individually retained in the reference, not marketed as parity.

## Focus, forms, live policy and autoplay

- Root role=region/roledescription=carousel, viewport role=group and slide
  role=group/roledescription=slide are owned. Unnamed slides get “n of total”.
  Authored slide names survive. Owned item markers expose current, previous, next and
  index; previous/next wrap only when loop is enabled and there is another slide.
- The single readout says “n / total”. It is polite for manual-only/user-paused mode,
  **off while autoplay is enabled and not user-paused**, even during temporary pauses.
  Slide contents are not live regions. There is no focus announcement duplication or
  promise of tested screen-reader speech.
- Native buttons retain Space/Enter activation exactly once. Indicators use
  aria-current, **not** tab roles. A focused boundary button stays focusable with
  aria-disabled and guarded activation; once focus leaves it becomes natively disabled.
  A helper does not focus a slide or move focus out of one.
- Only the viewport itself handles physical axis arrows/Home/End. Cross-axis page
  keys, modifiers, composition and all descendant editing keys remain native.
  Pointer/wheel listeners are passive; touch-action remains auto. Text selection,
  vertical page scrolling and nested scroll areas belong to the browser.
- **Inactive slides are never hidden, aria-hidden or inert.** Native Tab or validation
  focus can reveal offscreen content and then native scrolling updates the index.
  A focused offscreen field stays usable when the user scrolls elsewhere. All named
  controls still submit and validate; there are no hidden proxy fields or validity
  overrides. If an application hides the entire carousel, it owns reveal-before-
  validation just like any other hidden form section.
- `play()` clears only the persistent user pause; it requires enabled autoplay.
  `pause()` persists through hover/focus leave, refresh and setting changes. The real
  rotation button has explicit Pause/Play slide rotation accessible names. It remains
  focusable; focusing it itself temporarily pauses automatic movement.
- Automatic movement pauses for hover, focus anywhere in the root, pointer interaction/
  pending scrolling, document.hidden, reduced motion (also conservatively if matchMedia
  is absent), disabled/unsupported layout, fewer than two slides, nonloop end and an
  unavailable rotation control. Entering a pause stops an in-flight automatic smooth
  move. Leaving a temporary pause starts a fresh full interval, never cancels user pause.
  Changing autoplay does not register a timer outside this root.

## Refresh and ownership

Authored slide subtrees, text, controls, values/defaults, form participation, listeners,
selection and reading order remain application-owned. The demo app clones a native
template **only when explicitly adding new content**, never to fake loop slides.
After adding/removing/reordering original nodes call `refresh()`; commands reject a
stale collection, and autoplay fails closed. Refresh retains the selected/target node
if present; removal selects the clamped old index, or -1 for empty. Removed item
attributes are restored. This is not a keyed renderer or MutationObserver re-render loop.

Disconnect is idempotent: stop native smooth motion, clear timers, disconnect resize/
removal observers, remove all listeners, restore only attributes/text still equal to
owned values and release the ownership token. Root removal automatically disconnects
an enabled owner. Disabled owners have no observers/timers; explicitly disconnect them
when removing their roots. Rebind to reconnect. Do not replace viewport/readout/control
anatomy beneath a controller; disconnect then create a new owner.

Disabled settings and refresh cancel old scheduled scroll/autoplay work and disconnect/
replace observers. Bound listeners remain until disconnect so reenable works. The
document child-list observer only detects removal; it never renders application nodes.
Readout text and documented owned ARIA/data/action-disabled attributes are reserved
while bound. Refresh rereads authored disabled buttons; disposal does not overwrite
later differing author attributes. No complete style or attribute object is restored.

Legacy `widgetsPlugin` keeps its existing `m-carousel`/`m-carousel-item`,
`next/previous/select` and hidden-slide behavior unchanged. It is **not** this opt-in
native implementation. Native and legacy owners coexist on separate roots.

## Acceptance — 2026-09-10

1. **Preserve identity:** adopted node/order/form/listener, refresh/reorder/remove/empty,
   source CarouselItem slots and restoration tests; no slides reconstructed.
2. **Manual navigation:** native buttons/keys/snap/current/target/bounds/RTL/vertical/
   resize/zoom/hidden behavior observed in Chromium, plus deterministic unit coverage.
3. **Gate autoplay:** opt-in control, full pause-reason/user-pause/motion/dispose/
   reentrant timing tests; real Chromium rotation/focus/hover/reduced-motion checks.
4. **Bound scope and integration:** all reference identities retained with explicit
   omissions, ESM/classic/legacy/no-JS acceptance and independent build budgets.

The current Carousel test file contains **53 passing tests**, including canonical Custom
Element registration, atomic conflict handling and controller ownership in addition to
the retained native adapter contract. The integration build passes with level-nine
payloads of **6,505/7,000 ESM**, **6,641/7,000 classic** and **1,075/1,500 CSS**
gzip bytes. The architecture adds no cloned slide tree and does not change the aggregate
core, advanced or widgets bundles.
The [current catalog acceptance](../naive/index.md#carousel-and-carouselitem-accepted)
records raw sizes, ceilings and exact inventory totals.

Observed Chromium on the dedicated local demo tab: rapid next/next settled directly at
index 2 with **one** event; horizontal wheel snapped to one viewport; vertical wheel
advanced the page from 0 to 280px; native validation focused/revealed an invalid first
field; nested controls changed only their own index. A focused first-slide field stayed
focused and non-inert at index 2, with edited native FormData intact. Horizontal RTL
targets were 0/-1024/-2048; vertical targets 0/384/768. CSS zoom 2 used a 400px layout
viewport/800px visual rectangle and -800px index-2 target. A 641px browser viewport
resized the carousel to 578px and index 2 to 1156px. Closed details suspended initial
index 1 until opening. A real Chromium touch input sequence snapped at 406px/index 1
without a gesture listener preventing default. JavaScript-disabled context retained
scrolling/edited fields, three original slides and no visible enhancement controls.
Classic namespace and ESM coexist; legacy next still exposed only its second old item.

No claims of all-browser, assistive-technology, universal transformed anchoring, full
framework API parity or seamless loop behavior. Broader P0 foundation exceptions and
other P6 routes are unchanged.

## Current documentation

[Read the current demo and API](../../../demo/components/carousel.html).
