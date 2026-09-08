# Scrollbar: native-only scope

**Migration status: 🟢 Verified for retained native scrolling.**
The actual HTML element scrolls using browser scrollbars and APIs. There is no custom rail,
thumb, drag engine, synchronization layer, reactive-ref adapter or component runtime.

## Loading and authority

| Asset | Purpose |
| --- | --- |
| `src/components/scrollbar/scrollbar.css` | Maintained native overflow and optional standards styling. |
| `dist/markup-ui-scrollbar.css` | Browser stylesheet. |
| `@dataengine/markup-ui/scrollbar/style.css` | Stylesheet-only package export. |
| `demo/components/scrollbar.html`, `.css`, `.js` | Authored scroll regions and native application scroll/form examples. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-scrollbar.css">
```

No `./scrollbar` JavaScript export, custom element or registration order exists. Layout
and Affix native-scroll conventions informed the examples, but their stylesheets/runtimes
are not dependencies. Core/widgets/advanced remain unchanged.

References: [official page](https://www.naiveui.com/en-US/os-theme/components/scrollbar),
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md),
[public wrapper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/src/Scrollbar.tsx)
and [internal scrollbar](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx),
pinned to `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/scrollbar.md) preserves all **16 original
rows** and adds **11 explicit source-only declaration/exclusion groups**: **27 rows,
12 Verified adapted targets and 15 Intentionally omitted contracts/groups**. Internal
features are clearly distinguished from the public wrapper, which exposes only scrollTo/
scrollBy through its instance interface. This is not custom-chrome or framework parity.

## Native anatomy and ownership

```html
<h2 id="activity-heading">Activity</h2>
<p id="activity-help">Focus the region to scroll with the keyboard, or Tab to its controls.</p>
<div class="mui-scrollbar activity-region" tabindex="0" role="region"
  aria-labelledby="activity-heading" aria-describedby="activity-help">
  <div class="mui-scrollbar-content activity-content">
    <!-- Original content, links and native controls -->
  </div>
</div>
```

```css
.activity-region { max-block-size: 18rem; }
.activity-content { padding: .75rem; }
```

The outer element is the **actual scroll container**. Name/focus a standalone region when
needed; the stylesheet generates neither roles nor tabindex. The content wrapper is optional,
real author markup, not a generated layer. Native text, media, forms, labels, listeners,
focus and DOM order remain untouched. There is no content renderer or hidden duplicate tree.

Height/max-height, width, wrapping and any wide content area are author CSS. By default both
axes use native `overflow:auto`, rather than silently clipping horizontal content. This
deliberately differs from the source's false xScrollable default/custom rail and fit-content
wrapper behavior. An x-scrollable target is composed with native overflow and explicit content
width; there is no no-op `x-scrollable` attribute parser or automatic width generator.

The component adds only `.25rem` default padding to provide focus-outline room, configurable
with `--mui-scrollbar-padding`. Keep additional padding/scroll-padding appropriate for your
controls. Nested scroll regions remain separate native elements. Normal scroll chaining
is preserved; application CSS can explicitly choose `overscroll-behavior:contain`, as the
demo's checkbox does. The library sets no containment, wheel handler, touch-action restriction,
keyboard trap or pointer capture.

## Native APIs, events and coordinates

```js
const region = document.querySelector(".activity-region");
region.scrollTo(0, 0);
region.scrollTo({ top: 200, behavior: "auto" });
region.scrollBy({ top: 120, left: 0, behavior: "auto" });
region.scrollBy(0, -60);
region.addEventListener("scroll", event => {
  console.log(event.target.scrollTop, event.target.scrollLeft);
}, { passive: true });
```

These are existing **Element methods/properties**, not methods installed by a component:

- Both numeric `(x, y)` and native options `{ left?, top?, behavior? }` overloads work.
- Native `scrollTo` keeps an omitted axis unchanged; the internal upstream implementation
  instead zero-fills missing coordinates before calling its container. No zero-fill adapter
  is added. `scrollBy` applies native deltas.
- `scrollTop`, `scrollLeft`, dimensions, clamping, fractional values and event timing remain
  browser-owned. `scroll` is not a bubbling custom `mui:scroll` event.
- RTL horizontal coordinates can be negative, with zero at logical start/right. The
  internal source normalizes a cached scrollLeft for its rail calculations; this target
  exposes the original native value without sign normalization.
- `behavior:"auto"` follows native/CSS behavior. Applications explicitly requesting smooth
  scroll should honor reduced motion. The demo chooses auto when reduction is requested;
  the stylesheet forces no animation.
- Use native `element.scrollIntoView({ block:"nearest", inline:"nearest" })` for an offscreen
  child. This is an independent native route, not emulation of the source's element/index/
  position/debounce overloads. Native Tab also reveals offscreen focusable controls.

No sync/syncUnifiedContainer, manual hover methods, wrapper ref, cached scroll state,
resize event adapter or fake no-op method is exported. The public wrapper's ScrollbarInst
type is not re-exported by a stylesheet-only component; retain actual element references.

## Public and internal scope decisions

| Source surface | Native target / omission |
| --- | --- |
| `content-class` | Native class/classList on an optional authored content wrapper, or directly on content when no wrapper is needed. |
| `content-style` | ⏭️ Runtime string/object forwarding omitted; external CSS on the actual content. |
| `x-scrollable` | Native horizontal overflow eligibility and authored content width. Both native axes are auto by default; no horizontal clipping/fit-content side effect. |
| `trigger` | ⏭️ Hover/always-visible custom rail state omitted. OS/browser preferences control native chrome. |
| `x-placement`, `y-placement` | ⏭️ Custom top/bottom/left/right rail placement omitted; native scrollbar placement remains platform-owned. |
| `on-scroll` | A native listener on the actual scrolling element, with the native Event. |
| Default slot | Original author content, with no required extra wrapper. |
| `scrollTo`, `scrollBy` and their documented fields | Native Element operations/arguments as described above. |
| Source theme/instance/internal surfaces | ⏭️ No theme objects, Vue refs, custom geometry/rails, resize-sync controller, hidden width cache, manual hover or advanced scroll overload adapter. |

The internal implementation uses resize observers, timers, rail geometry, mouse drag
listeners, cached refs and additional scrolling overloads. They are not silently accepted
as public native features. The reference page records explicit grouped exclusions for
those inspected internal families without treating every private implementation detail as
a new public API.

CSS does not emit resize notifications. If an application needs them, it can independently
own a native observer and cleanup:

```js
const observer = new ResizeObserver(entries => {
  // Application-specific measurement/notification, not scrollbar synchronization.
  console.log(entries[0].contentRect);
});
observer.observe(region);
// When the application no longer needs the observation:
observer.disconnect();
```

Native overflow/scrollbars respond to content/container resizing without a sync call.
The demo changes a height class directly; it installs no resize observer or polling loop.

## Optional standards styling and platform limits

The following are **local CSS presentation conventions**, not new upstream props:

- `data-thin`: guarded `scrollbar-width:thin`.
- `data-colored`: guarded `scrollbar-color`, using `--mui-scrollbar-thumb-color` /
  `--mui-scrollbar-track-color` (defaults `#71717a` / `#e4e4e7`).
- `data-stable-gutter`: guarded `scrollbar-gutter:stable`.

They are presence flags, including when their value is the string `"false"`; remove them
to opt out. Without the supported standards or flags, native appearance/cascade remains.
`scrollbar-color` inherits normally: explicitly set it to `auto` on a nested region if
that region should not inherit an ancestor's chosen colors.
No default scrollbar hiding, vendor pseudo-element implementation or pixel-sized rail
promise exists. “Thin” and “stable” do not override OS overlay preferences or guarantee
always-visible chrome. Forced colors restores auto color/width so the user's native
contrast and sizing policy can take precedence.

Print expands overflow and clears fixed/min/max block constraints; application wide content
may need its own print width override, as demonstrated. Hidden roots/content/templates stay
hidden/inert. Standalone CSS does not force hidden-until-found to display:none; that reveal
path is not separately certified. Native source remains usable without JS; demo buttons
requiring explicit application scroll commands are not library methods or no-JS promises.

## Migration steps and acceptance

1. [x] Keep native keyboard/wheel/touch policy, content ownership and explicit region semantics.
2. [x] Provide opt-in standards styling with native/forced-color fallback, not custom rails.
3. [x] Map public methods/events to existing Element APIs and explicitly omit sync/ref/resize adapters.
4. [x] Verify nested/RTL/focus/forms/resize/print/no-JS behavior and native platform boundaries.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**540 tests**, including **12 Scrollbar cases**. Chromium acceptance exercised:

- Named native regions, original nodes/listeners, keyboard ArrowDown and wheel scrolling,
  actual scroll Event targets, numeric/options scrollTo/scrollBy and omitted-axis preservation.
- Native scrollIntoView/focus revealed the far link; RTL Tab revealed its far link using
  the native negative scrollLeft, without normalization.
- Native resize from 222px to 350px client height updated geometry with unchanged nodes.
  A separate acceptance-only ResizeObserver received entries and was disconnected; CSS
  itself emitted no resize callback or synchronization event.
- Inner-boundary wheel motion chained 180px to the outer region by default; the explicit
  application containment opt-in left outer scrollTop at zero.
- Required native form validation, one submission, reset, disabled exclusion and visible focus.
- Standards thin/color/gutter computed styles, no generated rails, 280px/320px widths,
  200% CSS zoom, forced-color auto fallbacks and print content expansion.
- Aggregate/widgets/advanced coexistence with no mui-scrollbar definition or node changes.
- JavaScript-disabled keyboard scrolling and native reset/GET submission.

CSS is **1,378 bytes / 468 gzip bytes**, below the new **750-byte** ceiling; component JS
is **0 bytes**. Demo JS is **1,521 / 558 gzip bytes**, demo CSS **1,624 / 640**.
Core remains **14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes
with unchanged outputs/budgets and zero runtime dependencies. Actual touch hardware,
all OS scrollbar policies, all browsers and screen-reader speech are not certified.
