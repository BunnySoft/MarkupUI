# Grid and GridItem

**Migration status: 🟢 Verified retained native CSS/disclosure scope.**
**Architecture: CSS-only.** Native Grid handles tracks, spans, gaps and auto-placement;
authored media/container queries handle responsiveness. There is no responsive-string parser,
ResizeObserver, provider, child renderer, packing engine or new Custom Element.

**Scope boundary:** automatic collapsed-row budgeting, relative-offset packing, reserved
overflow-aware suffixes, the overflow slot signal and framework SSR/layout-shift flags are
intentionally omitted. Native alternatives below are not presented as identical algorithms.

## Default-style audit — 2026-09-10

The [isolated source/rendered audit](../style-audit/components/grid.md) verified **200
retained-geometry comparisons** across fixed columns/gaps/spans, native zero-span
visibility adaptation, authored self/screen queries, light/dark and RTL. All matched
the measured reference at equal available widths. Relative offsets, oversized-span
clamping and oversized query frames were tested separately as explicit limitations.

No default CSS correction was necessary. Source remains **1,448 raw / 527 gzip
bytes**, below the strict **1,500-byte ceiling**. **16 focused tests pass**.
Only tests/documentation changed; no responsive parser, shared theme source,
or component CSS changes were added. The coordinator's isolated release build and
all **16 Grid tests** pass; unrelated unfinished component changes were excluded.

## Pinned reference and distribution

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/grid)
- [Grid/GridItem props, slots and overflow parameter](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md)
- [Grid implementation and row/suffix packing](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/Grid.tsx)
- [GridItem implementation and private placement props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/src/GridItem.tsx)
- [Source NGi/giProps aliases](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/index.ts)

All thirteen original public rows remain individually tracked. Two public declarations are
expanded explicitly: the referenced ResponsiveDescription type and GridItem's overflow
slot parameter. Six source supplements record Grid.itemStyle, four private GridItem props
and the grouped NGi/giProps aliases. **No theme prop is invented:** these sources do not
declare the theme-prop mixin used by other components.

| Asset | Purpose |
| --- | --- |
| `src/components/grid/grid.css` | Maintained native Grid/GridItem/query-wrapper/disclosure CSS. |
| `dist/markup-ui-grid.css` | Browser stylesheet distribution. |
| `@dataengine/markup-ui/grid/style.css` | Stylesheet-only package export. |
| `demo/components/grid.html`, `.css` | Fixed/self/screen/nested/native-control examples; no script. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-grid.css">
```

Serve/copy the stylesheet normally. There is no `./grid` JS export, ESM/classic runtime/global,
GridItem constructor or registration-order rule. The old mui-grid custom element still
copies its authored `columns` string into native grid-template-columns at connection,
with existing legacy layout styles. It is unchanged, not transparently upgraded.
The new CSS class can load before/after the legacy aggregate without importing it.

## Native tracks, items and gaps

```html
<div class="mui-grid product-grid">
  <article class="mui-grid-item">First original item</article>
  <article class="mui-grid-item featured">Second original item</article>
  <p>Any valid direct native child is a grid item; it is not filtered out.</p>
</div>
```

```css
.product-grid {
  --mui-grid-cols: 4;
  --mui-grid-x-gap: 12px;
  --mui-grid-y-gap: 8px;
}
.featured { --mui-grid-span: 2; }
```

Defaults match the useful fixed source geometry: **24 equal minmax(0,1fr) tracks, zero
x/y gaps and one-column items**. Every native direct element participates without a
GridItem marker/constructor. `.mui-grid-item` is an optional item-box hook adding border-box
max sizing; normal direct children also receive the span/start defaults and min-inline-size:0.
The library creates no wrappers or native slot mechanism and never strips directives/attributes.

| Native CSS token | Contract |
| --- | --- |
| `--mui-grid-cols` | Positive CSS integer, default 24. |
| `--mui-grid-tracks` | Complete native grid-template-columns value; overrides the equal-column recipe. |
| `--mui-grid-x-gap`, `--mui-grid-y-gap` | Column/row gaps, default 0px. Use native nonnegative lengths/percentages. |
| `--mui-grid-align`, `--mui-grid-justify` | Native align-items/justify-items; default normal. These are target CSS capabilities, not invented upstream props. |
| Item `--mui-grid-span` | Positive CSS integer, default 1. |
| Item `--mui-grid-start` | Native absolute column line or auto, default auto. **Not a relative offset.** |

For authored track lists, use a normal CSS value:

```css
.sidebar-grid { --mui-grid-tracks: 5rem minmax(0, 1fr); }
```

This also provides a clear native translation for the legacy columns-string use case.
The target does not interpret a native element's columns/cols/span/offset attributes or
JavaScript properties. External CSS, not an inline-style object, is the interface.

### Independent nested defaults and validation boundaries

Root track/count/gap/alignment defaults reset **on each grid**, and span/start defaults
reset **on each direct item**, using low-specificity rules. A nested grid that spans two
outer columns does not make each inner item span two columns or inherit an outer start line.
Application selectors can override these defaults regardless of library-link order.

Set tokens on the actual grid/item, not merely an ancestor wrapper. In particular, a query
wrapper's --mui-grid-cols value is not a configuration provider: the descendant grid has its
own defaults. Custom track overrides also reset between independent grids.

Keep spans and explicit start lines valid for the active track count. Unlike the source,
the CSS helper does not clamp an oversized span/offset: native Grid can create implicit
tracks. Responsive rules must update spans when the number of columns decreases.
Zero/negative/fractional column counts or spans are invalid native grammar, not a parsed
source value with a fallback success result.

**Upstream span=0 translates to native hidden, not --mui-grid-span:0.** An invalid zero span
token resets native placement to auto; it does not hide the item. Author `hidden` or a
responsive display:none rule to remove the whole item's layout/focus footprint.
Invalid gaps become native initial normal rather than magically returning to a configured
gap. The library does not catch errors, parse responsive descriptions or emit validation events.

## Self-responsive versus screen-responsive CSS

A container query cannot select its **own query container** to change that container's
column count. Use a real authored wrapper and query a descendant grid:

```html
<div class="mui-grid-container gallery-size">
  <div class="mui-grid gallery">
    <article class="mui-grid-item gallery-feature">Original content</article>
    <article class="mui-grid-item">Original content</article>
  </div>
</div>
```

```css
.gallery-size { container-name: gallery; }
.gallery { --mui-grid-cols: 1; }
.gallery > .gallery-feature { --mui-grid-span: 1; }
@container gallery (min-width: 30rem) {
  .gallery { --mui-grid-cols: 3; }
  .gallery > .gallery-feature { --mui-grid-span: 2; }
}
```

The helper supplies only native inline-size containment/min/max sizing. The application
owns the wrapper's available width and optional container name. Give flex/grid ancestors
appropriate sizing; size containment is not a shrink-to-fit content measurement.
Keep feature spans at one in the base/compact rule, as the example explicitly does.

The helper's max-inline-size:100% also bounds an oversized authored wrapper: a
nominal 640px wrapper in a 500px parent measured 500px, unlike an unbounded 640px
source fixture. Compare **actual available widths**, not just width declarations.
Any deliberate overflow/max-size override and its scrolling policy are application-owned.

For screen mode, use a viewport media query on the actual grid/items:

```css
.screen-grid { --mui-grid-cols: 2; }
@media (min-width: 48rem) {
  .screen-grid { --mui-grid-cols: 4; }
}
```

These are **application breakpoints**, not a copied source breakpoint dictionary or a
responsive/self/item-responsive prop parser. Source ResponsiveDescription syntax is not
accepted as a CSS value or reconstructed as a new DSL. The referenced type is named but
not defined on the pinned public page; no invented inline schema is claimed.

Container-query absence leaves the authored baseline (one column in the demo); media queries
remain independent. Choose a usable static baseline instead of assuming a hidden observer
polyfill. Grid without CSS support falls back to normal native flow. No subgrid dependency
or hydration/layout-shift mode is required.

For responsive visibility, use an application display:none rule and a proper visible state
such as display:revert. Do not use height clipping or aria-hidden alone for focusable content.
The demo's optional wide link is removed from rendering/focus and has an always-visible
destination link outside the query. Native hidden remains authoritative; CSS queries do not
override it unless the application removes the attribute.

## Relative offsets versus native placement

The upstream offset consumes space relative to the current packing cursor together with the
item's span; GridItem then applies an internal offset margin. **grid-column-start is an
absolute line**, and is not that contract. After a two-column item, start line 3 is adjacent,
not a three-column gap. Line numbering follows native inline direction, including RTL.

An authored aria-hidden spacer item can reserve known empty tracks:

```html
<div class="mui-grid product-grid">
  <div class="mui-grid-item featured">Two columns first</div>
  <span class="mui-grid-item" aria-hidden="true"></span>
  <div class="mui-grid-item">Then an explicit empty track and this item</div>
</div>
```

This example has a four-column grid and a two-column featured item. The spacer can wrap
separately from its neighbor; it does not implement atomic offset-plus-span packing.
Group or place the units explicitly when that distinction matters. The automatic relative
offset prop is intentionally omitted, rather than mislabeled as the start token.

The audit measured these distinctions in a 480px/four-column grid with 12px gaps:

- In simple LTR placement, explicit one-track spacers matched two `offset=1` items
  at x **123px** and **369px**.
- After a three-column item, source offset-plus-span packing placed the next item
  at x **123px** on row two; a separately wrapping native spacer put it at **0px**.
- After a two-column item, native absolute start line 3 placed the next item at
  **246px**, while source relative offset 1 placed it at **369px**.
- Source offset styling uses physical `margin-left`. In RTL the same simple
  spacer composition therefore differs: native x **246/0px** versus source
  **369/123px**. No physical-margin workaround is injected into the native API.

Auto-flow is **row, never dense**. No order/reverse helper or explicit grid-row interface is
provided. Keep placement consistent with DOM/reading/tab order; arbitrary application row
placement or dense CSS can undo that policy and is not made accessible by this stylesheet.

## Collapse, row limits, suffixes and overflow

The retained collapse alternative is an application-selected preview grid followed by real
native details/summary containing a separate extra grid:

```html
<div class="mui-grid product-grid">Author-selected preview items</div>
<details class="mui-grid-disclosure">
  <summary>Show or hide remaining results</summary>
  <div class="mui-grid product-grid">Original additional items and native controls</div>
</details>
```

Use native open/details.open to choose the disclosure state. Closed body controls are not
rendered or sequentially focusable; the visible summary owns native keyboard/expanded
behavior. CSS supplies a focus outline, not handlers. Applications performing programmatic
state changes own any desired focus-return policy.

These are **two grids**, not an automatic collapsed-rows implementation. The application
chooses which items form the preview. Native CSS is not counting occupied rows, spans,
offsets or a reserved suffix capacity. `collapsed-rows` is intentionally omitted.

A DOM-last action can be placed on its own row with `grid-column:1 / -1; justify-self:end`.
That is a useful explicit trailing-action composition, **not** upstream suffix reservation
at the end of the last visible packed row. The suffix algorithm and computed overflow signal
are intentionally omitted. No GridItem callback receives `{ overflow }`; native details.open
is disclosure state, not an overflow calculation.

The framework layout-shift-disabled flag, source SSR marker/remount paths and private
placement props are also omitted. Choosing fixed tracks without query rules is the native
static-layout path, but not a promise of zero layout shift: stylesheet/font/content changes
and native responsive layout can still move content.

## Native ownership and scope

CSS Grid is visual layout, **not an ARIA data grid**. No grid/row/gridcell role, heading level,
tabindex, key-navigation model or live announcement is added. Native lists require direct
li items; markers, links, controls and form types/disabled/reset behavior remain native.
Extra wrappers are real grid items, so put span/placement on the actual direct wrapper rather
than expecting recursive GridItem discovery through arbitrary component boundaries.

Authored children, text, IDs/ARIA, classes/styles, listeners, empty items and templates are
not filtered, cloned or rewritten. Templates stay inert. Hidden roots/items/query wrappers
stay hidden despite layout display rules; until-found is not converted to ordinary hidden
by this new CSS. No pre-upgrade property/lifecycle/observer/disposal contract exists.

Grid/item style objects map to normal external CSS classes. Root/item defaults use logical
inline sizing; interiors of arbitrary fixed-width controls/assets remain author-owned.
There is no truncation, animation or forced-color opt-out. Print preserves native disclosure
and hidden states, not an automatic expansion of every closed section.

Grid declares no theme-prop mixin or default font/color palette. Shared font/color
tokens and `data-mui-theme` are not interpreted by this stylesheet; application
typography still inherits normally. Light/dark do not need separate Grid rules.
Root/item configuration must remain on the actual owner because the explicit local
defaults reset inherited grid tokens, unlike a framework configuration provider.

## API tracker and numbered acceptance

🟢 Verified **native adaptation**, not a compatible renderer/prop/type API.
⏭️ Intentionally omitted algorithm/framework contract.

| Upstream item | Native target | Status / limits |
| --- | --- | --- |
| Grid cols | Positive column count or native tracks plus authored queries. | 🟢 Default 24; no ResponsiveDescription parser. |
| Grid collapsed | Explicit preview plus native details/extra grid. | 🟢 Native disclosure adaptation, not same-grid automatic packing. |
| Grid collapsed-rows | Application-selected preview scope. | ⏭️ Automatic occupied-row budget omitted. |
| Grid layout-shift-disabled | Fixed native CSS when wanted. | ⏭️ Framework SSR/observer mode flag and zero-shift promise omitted. |
| Grid responsive | Separate query wrapper for self; media queries for screen. | 🟢 No source mode/Boolean parser or provider breakpoints. |
| Grid item-responsive | Item CSS in matching native queries. | 🟢 Update spans/visibility explicitly; no per-item responsive string parsing. |
| Grid x-gap / y-gap | Native column/row-gap tokens. | 🟢 Zero defaults, native CSS grammar. |
| GridItem offset | Native absolute placement or explicit spacer alternative. | ⏭️ Relative packing/margin algorithm is not an absolute start line. |
| GridItem span | Positive native span; use hidden for source zero. | 🟢 No implicit track-count clamp or zero-token hiding. |
| GridItem suffix | Authored DOM-last action alternative. | ⏭️ Reserved overflow-aware suffix algorithm omitted. |
| Grid default slot | Original direct native children. | 🟢 No constructor filtering or VNode rewriting. |
| GridItem default slot | Original native item content. | 🟢 No overflow callback argument. |
| Public ResponsiveDescription type | Native CSS query declarations instead. | ⏭️ Referenced notation/schema/parser omitted. |
| Public GridItem.default.overflow field | No automatic overflow signal. | ⏭️ Not replaced with an unrelated open/busy state. |
| Source Grid.itemStyle | External item CSS/classes. | 🟢 No string/object injection provider. |
| Source privateOffset/privateSpan/privateColStart/privateShow | Native authored placement/hidden alternatives. | ⏭️ Four private renderer contracts omitted individually in the reference. |
| Source NGi/giProps aliases | Same native GridItem anatomy. | ⏭️ No component/props constructor aliases exported. |

All thirteen original rows plus two explicit public expansions and six source supplements:
**21 rows, 10 Verified ADAPTED native targets and 11 intentional omissions**.

1. [x] Inventory both owners, public responsive/overflow declarations and actual source supplements.
2. [x] Implement fixed native tracks/gaps/spans, independent nested defaults and direct item ownership.
3. [x] Demonstrate correct descendant self queries and separate viewport/item query rules.
4. [x] Scope relative offset/packing/suffix/overflow omissions and safe native alternatives explicitly.
5. [x] Add no-JS demo plus existing-runner structure/native/source/packaging tests.
6. [x] Validate build/budgets and Chromium geometry/responsiveness/focus/RTL/print/coexistence.
7. [x] Reconcile all reference rows/four tasks, inventory counts and next Layout.

### Original migration evidence — 2026-09-08 (historical)

- Focused Grid tests passed; `pnpm build && pnpm test` passed **385 tests**
  (12 Grid/GridItem tests and all 373 prior tests).
- Tests cover original native children, 24/zero-gap/one-span defaults, absolute/spacer
  distinctions, correct query wrapper structure, low-specificity nested resets, native
  hidden/templates/disclosure, trailing actions, lists/forms and no dense/role/runtime behavior.
- Chromium loaded no scripts/injected styles. The default had 24 tracks. A 912px four-column
  grid measured 219px tracks, 450px two-column items and exact 12px x / 8px y gaps.
  Custom tracks began at 80px; inner grids retained two columns/4px gaps and one-span children.
- A 640px query wrapper produced three self columns/two-span feature while screen mode used
  four columns. Changing only that wrapper to 320px produced one self column/one-span feature
  while screen stayed four; the CSS-hidden optional link rejected focus.
- At 960/500/320/280px there was no document/cell overflow. Screen modes changed at their
  viewport breakpoint, nested grids stayed independent and RTL followed native inline-start.
  Removing the demo CSSContainerRule simulated unsupported queries: one-column/one-span
  self fallback remained while the four-column screen rule still worked.
- Native Tab skipped both hidden items and closed details controls. Enter/Space opened/
  closed the native disclosure and preserved extra nodes. Chromium AX retained native A./B.
  list markers with no fabricated grid/row/gridcell roles. Reset and disabled-focus behavior
  passed; actual GET submit reached `grid.html?name=Accepted#result`.
- A negative gap computed to native normal; span token 0 stayed visible with auto placement,
  not fake source-zero hiding. At 200% CSS zoom the 12px gap became 24px.
- Forced colors retained native summary focus and no motion ran. Print retained four tracks,
  12px gap, list markers, hidden roots and closed details state. In-memory A4 PDF generation
  without backgrounds returned a valid 42,675-byte PDF; no PDF file was written.
- Late native items/listeners and reconnects passed. CSS-before/after-legacy checks preserved
  exact native markup, spans/query/nested layouts and outside styles. Legacy columns attributes
  remained intact and native CSSOM normalized their track string while rendering 80px/remaining
  tracks with the original 8px small gap. No new Grid runtime/global appeared.
- **CSS: 1,448 raw / 527 gzip bytes, under its 1,500-byte ceiling.**
  Core stays **14,611 / 15,000 gzip bytes**, without a dependency or JavaScript bundle added.
- Reference validation preserved all thirteen original name/source rows plus two public
  expansions and six source supplements: **96 pages, 3,143 rows, 384 tasks (80 accepted),
  757 relative file links**. The new public inline/type expansions are counted separately
  from the source-only additions.

The figures above describe original delivery, not a newly run integrated build.
Browser evidence is Chromium, not all-browser/AT, hydration/zero-CLS or automatic packing
certification. Layout is next through coordinator selection; P2 and retained algorithm
omissions remain explicit rather than being hidden behind a CSS-only success claim.
