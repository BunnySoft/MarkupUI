# Timeline and TimelineItem

**Migration status: 🟢 Verified for the retained native scope.**
Timeline is authored list HTML and external CSS. Chronology, headings, dates, statuses
and actions stay in the document; no component runtime or chronology engine exists.

## Default-style audit — 2026-09-10

The [isolated rendered audit](../style-audit/components/timeline.md) corrects title/
content/metadata metrics, node and rail alignment, event spacing, intrinsic horizontal
sizing and light/dark colors. Dark status markers use Naive's **supplementary** colors.
**16 focused tests pass**; 60 item comparisons and 60 line/terminal slots matched
the checked reference properties in light/dark LTR. Logical RTL and native dashed
borders remain explicit adaptations.

CSS is **6,891 raw / 1,471 gzip bytes**, below the unchanged **1,500-byte ceiling**.
The coordinator's isolated release build and all **16 Timeline tests** pass;
no shared source or generated adapter changed.

## Loading and source boundary

| Asset | Purpose |
| --- | --- |
| `src/components/timeline/timeline.css` | Maintained isolated stylesheet. |
| `dist/markup-ui-timeline.css` | Browser stylesheet. |
| `@dataengine/markup-ui/timeline/style.css` | Stylesheet-only package export. |
| `demo/components/timeline.html`, `.css`, `.js` | Native examples and optional application form/action handlers. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-timeline.css">
```

There is no `./timeline` JavaScript export, global, controller, registration requirement
or mandatory widgets/Icon/date library. The unchanged optional widgets plugin still
registers legacy `mui-timeline`/`mui-timeline-item` elements and their old styles; the
native classes do not redefine them. Timeline CSS can coexist with the aggregate and
widgets plugin without any Timeline-specific loading-order restriction.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/timeline),
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md),
[Timeline source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/src/Timeline.tsx),
[TimelineItem source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/src/TimelineItem.tsx)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/src/styles/index.cssr.ts),
pinned to `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/timeline.md) retains **15 original public
rows** and **four explicit source-only supplements**: **16 Verified adapted targets and
3 Intentionally omitted theme contracts**. Green is native-scope acceptance, not Vue,
visual, animation or screen-reader certification.

## Native event anatomy

```html
<section aria-labelledby="history-title">
  <h2 id="history-title">Project history</h2>
  <ol class="mui-timeline" data-markerless role="list"
    aria-labelledby="history-title">
    <li class="mui-timeline-item" data-type="success">
      <span class="mui-timeline-marker" aria-hidden="true"></span>
      <div class="mui-timeline-body">
        <h3 class="mui-timeline-title">Review approved — Success</h3>
        <p>Authored event details and <a href="./review.html">review notes</a>.</p>
        <div class="mui-timeline-footer">
          <time class="mui-timeline-time" datetime="2026-09-03">3 September 2026</time>
        </div>
      </div>
    </li>
  </ol>
</section>
```

Use `ol` for an intentionally ordered history, or `ul` when sequence is not meaningful.
Actual `li.mui-timeline-item` nodes remain direct list children and retain list-item
display. Each item may contain a decorative marker and an authored body. Do not wrap
`li` in invalid list child `div` elements or use `display: contents` to hide structure.
There is no invented timeline role, generated heading level, selection state or live region.

Default native list markers remain. `data-markerless` explicitly removes numbering/bullets
for the decorative-rail presentation. Safari/VoiceOver can omit list semantics for
`list-style: none`; authors choosing markerless presentation can retain an explicit
`role="list"` on the real list, as above. This is a documented author-controlled workaround,
not Safari/VoiceOver test certification. Native numbering is demonstrated separately.

Chronology is **DOM order**. Sort source data or deliberately reorder authored nodes when
the application needs newest-first output; CSS does not reverse flex order or reading/Tab
order. Neither pinned public API nor reviewed props declares a `reverse` property.
`ol reversed` only changes numbering and is not a chronology/reordering substitute.
The newest-first demo authors the later event first with normal list numbering.

Author valid `time[datetime]` values and human-readable text where a real date/time is known.
For unknown, relative or arbitrary metadata, use ordinary text such as
`span.mui-timeline-time`. The source also permits a number for `time`, although the public
table lists strings: render that value as explicit text, for example `textContent =
String(value)`, without inferring epoch units, a timezone or a valid `datetime`.
No parsing, date formatting, inference, automatic announcements or live sorting occurs.

## Properties and regions

| Upstream surface | Native target and default |
| --- | --- |
| Timeline `horizontal` | Presence `data-horizontal` creates a single non-wrapping lane; default is vertical. Use the explicit scrolling composition below when needed. |
| Timeline `icon-size` | `--mui-timeline-icon-size` on the real list, default `14px` in both sizes; supply a positive CSS length, not a unitless number/attribute. |
| Timeline `item-placement` | Default/`"left"`/unknown values put the rail at logical start. `data-item-placement="right"` puts it at logical end and end-aligns the body. Ignored in horizontal mode. |
| Timeline `size` | Default/`"medium"`/unknown values use 14px titles; `data-size="large"` uses 16px titles with the source -2px top margin. Event spacing and icon size do not increase. No small preset. |
| TimelineItem `type` | `data-type="default"` / `"success"` / `"info"` / `"warning"` / `"error"`; missing/unknown values use neutral default marker color. |
| TimelineItem `color` | `--mui-timeline-item-color` on the actual item overrides its marker border/icon color, not status text or chronology. |
| TimelineItem `line-type` | Default/`"default"`/unknown values use a solid connector; `data-line-type="dashed"` uses a native dashed border. |
| TimelineItem `title`, `header` slot | One authored `.mui-timeline-title` heading or header region inside the body; no tooltip/title attribute or slot/prop precedence engine. |
| TimelineItem `content`, `default` slot | Native body children: text, paragraphs, media, nested lists and real actions. No string renderer or VNode/slot projection. |
| TimelineItem `time`, `footer` slot | Author `.mui-timeline-footer` and `time` or ordinary metadata text. Rich footer content is allowed; no generated date or slot/prop precedence. |
| TimelineItem `icon` slot | Authored `.mui-timeline-marker[data-icon]` with SVG/image/glyph content; no icon component, vendor asset or callback is loaded. |
| Timeline `default` slot | Actual `ol`/`ul` and direct authored items/templates. |
| Source `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ Framework theme/provider objects and override merging omitted; external CSS tokens are the alternative. |

Presence switches (`data-horizontal`, `data-markerless`, marker `data-icon`) stay enabled
even with a value of `"false"`; remove the attribute to disable them. CSS reacts to live
attributes/classes immediately without observers or component events. No component-specific
events/methods are declared in the reviewed source.

The placement values are deliberately **logical**: `"right"` means inline-end, which is
physically left in RTL. This differs from hard-coded physical offsets while preserving
meaningful DOM order. It is not reverse chronology.

## Markers, connectors and nested timelines

Markers and connecting lines are decorative, not controls. Always provide visible
status words such as “Warning” or “Success”; color or an icon alone cannot carry state.
Use `aria-hidden="true"` for redundant markers and authored decorative SVG
(`focusable="false"` where appropriate). If an icon conveys additional meaningful
information, give it an explicit accessible name instead of hiding that information.
Keep links/buttons outside the non-interactive marker; the body owns native actions.
CSS honors authored media and `currentColor`, without replacing nodes or names.

Connectors are empty pseudo-elements and only appear when a visible native item has a
later visible sibling item, using guarded `:has()`. Native `hidden` middle/trailing
items and inert templates do not leave an extra last-event connector. Dynamic hide/show,
append and removal update this boundary through CSS. Nested lists have independent rails,
types, default sizes and orientation; direct-child selectors do not connect across levels.

Without `:has()` support, markers, content and the semantic list remain usable **without
connectors** rather than drawing misleading last-event lines. Filtering through arbitrary
application `display:none` selectors is not detected; use the item's `hidden` state.
Native hidden roots/items/regions/templates stay hidden/inert. `hidden="until-found"`
is not forcibly replaced with `display:none`; that browser reveal path is not separately
certified. No custom-element lifecycle, duplicate event data, SVG generator, Houdini
registration, animation or gradient-transition engine is shipped.

The list uses native column flex layout while its real `li` nodes retain list-item
semantics. Content defaults to 14px/1.25, title weight 500 and bottom margin 6px;
metadata is 12px with a 6px top margin. Vertical spacing comes from the authored
body's 20px end margin, not an invented row-height floor or extra item padding.
The last-visible body loses that end margin through the same guarded sibling rule.

An explicit empty footer can retain source content-only spacing without inventing a date:

```html
<div class="mui-timeline-body">
  <div>Oops</div>
  <div class="mui-timeline-footer"></div>
</div>
```

No footer is generated when omitted. Rich paragraphs/headings/controls retain
native/application margins. Marker position follows the declared title/icon sizes;
large icons may extend above an item, so clipping ancestors remain application-owned.

## Horizontal scrolling, forms and print

```html
<p id="lane-help">Scroll horizontally or Tab to each event action.</p>
<div class="mui-timeline-scroll" tabindex="0" role="region"
  aria-label="Scrollable milestones" aria-describedby="lane-help">
  <ol class="mui-timeline" data-horizontal data-markerless role="list">
    <!-- Direct authored li items with native controls -->
  </ol>
</div>
```

The author chooses the region's name, focusability and instruction. Items use an intrinsic
`auto` basis with a 40px logical end gap, matching ordinary source sizing. The wrapper
provides native horizontal scrolling when needed; it does not conceal controls
with `overflow:hidden` or invent roving focus. Native Tab focus scrolls offscreen actions
into view. For RTL lanes, put `dir="rtl"` on the scrolling region so direction and scroll
geometry agree. The horizontal lane does not automatically wrap into ambiguous connected
rows or trigger a JavaScript breakpoint. Use the vertical composition when horizontal
navigation is unnecessary.

Set `--mui-timeline-item-width:16rem` or another length when fixed-width items are
desired. This remains a native flex-basis choice, not an upstream width prop or
JavaScript item-sizing algorithm.

Links, typed buttons and form controls retain native names, keyboard behavior, validation,
disabled/fieldset semantics, submission and reset. The list/items are not action roots.
Demo form/status handlers are application code, not automatic library announcements.
Without JavaScript, lists, links, dates, scrolling and GET forms still work; application
milestone buttons need their authored listeners.

Print stacks horizontal items and expands the scroll wrapper, suppressing decorative
connectors to avoid suggesting the wrong direction. It requests unbroken event groups
where pagination permits. Forced-colors styling preserves marker/connector visibility;
status words remain the primary information. Long body content wraps without truncation.

## CSS customization

| Token | Default / scope |
| --- | --- |
| `--mui-timeline-icon-size` | `14px` in medium/large; inherited by items and reset at nested lists. |
| `--mui-timeline-item-gap` | Vertical `20px`, horizontal `40px`, independent of size; reset on each list. |
| `--mui-timeline-title-size` | Medium `14px`, large `16px`. |
| `--mui-timeline-item-width` | Horizontal item basis `auto`; set a length for fixed-width items. |
| `--mui-timeline-item-color` | Per-item marker override; resets on each item rather than leaking to nested items. |
| `--mui-timeline-line-color` | Neutral connector color, independent of marker type. |
| `--mui-timeline-text-color`, `--mui-timeline-time-color` | Body and secondary metadata text colors. |

Use external CSS classes or stylesheets on the actual nodes. Private `--_mui-timeline-*`
values are not API. Native CSS validation/cascade applies; there is no numeric length
parser, theme-object bridge or automatic media-query configuration.

### Light/dark role colors

Use `data-mui-theme="light|dark"` on an ancestor or the list. No marker means light.
Private dark defaults reset at nested light boundaries; public per-item/color/size
overrides remain authoritative.

| Role | Light | Dark |
| --- | --- | --- |
| Title | `#1f2225` | white `.9` |
| Body | `#333639` | white `.82` |
| Metadata / neutral marker | `#767c82` | white `.52` |
| Rail | `#dbdbdf` | white `.2` |
| Information | `#2080f0` | `#3889c5` |
| Success | `#18a058` | `#2a947d` |
| Warning | `#f0a020` | `#f08a00` |
| Error | `#d03050` | `#d03a52` |

Dark statuses use **supplementary**, not normal dark semantic colors. Legacy
primary/secondary text and general border tokens are not equivalent roles.
Defaults stay local; applications may explicitly map a correctly chosen shared
color through `--mui-timeline-item-color` on the actual item.

Shared `--mui-font-size` supplies body sizing, falling back to 14px; title presets
and 12px metadata remain independent. Family, backdrop and `color-scheme` stay
application-owned. `--mui-timeline-text-color` overrides title/body; ordinary title
CSS can supply a separately authored title color.

## Original migration steps and acceptance (historical)

1. [x] Define authored title/time/body/icon/footer regions without generating chronology.
2. [x] Keep vertical, end-side and horizontal layouts in meaningful DOM/Tab order.
3. [x] Ship isolated decorative markers/connectors/type colors with visible status text.
4. [x] Exercise long/missing-date events, nested/hidden items, native actions and layouts.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**431 tests**, including **12 Timeline cases**. Chromium acceptance exercised:

- Native list/listitem/heading/time accessibility trees, visible status words, decorative
  icon exclusion, explicit names and authored newest-first ordering without reversal.
- All five marker types and custom color; 14px default / 24px custom markers, 16px/18px
  title presets, solid/dashed vertical and horizontal connectors and logical RTL placement.
- Hidden middle/trailing items/templates, independent nested last-item boundaries and
  live hide/show/append/remove without replacing original nodes.
- Native Tab order, skipping hidden/disabled targets; Enter/Space each activated an
  explicit action once with native focus. Required validation blocked empty submission;
  one valid submission contained only the enabled named field, reset restored its default.
- 280px/320px layouts and 200% CSS zoom without document/vertical-event overflow. Horizontal
  lanes kept intentional local overflow; ArrowRight scrolled natively, and Tab made the last
  action visible with positive LTR and negative RTL scroll offsets.
- Print stacking/expansion/no connectors and forced-color markers/lines. Removing the
  connector `@supports` block in Chromium verified the marker-only fallback; this is not
  an actual legacy-browser compatibility certification.
- Later legacy aggregate plus widgets-plugin loading preserved native nodes/list styles
  and last-event treatment; legacy Timeline still registered with its 9px marker style.
- A JavaScript-disabled Chromium context retained six visible top-level events, native
  reset and GET submission to `?note=NoJS`.

At original delivery library CSS was **6,259 bytes / 1,320 gzip bytes**, under its **1,500-byte** ceiling.
Component JS is **0 bytes**. Demo-only JS is **483 / 277 gzip bytes** and CSS is
**1,022 / 486 gzip bytes**. Core remains **62,558 / 14,611 gzip bytes** under **15,000**;
widgets remains **10,858 / 2,779 gzip bytes** under **4,000**. Existing outputs/budgets
and zero runtime dependencies were unchanged. These are historical figures, not
evidence of a newly run integrated build. Evidence is retained-scope Chromium work,
not all-browser, browser-UI zoom, screen-reader speech, animation or framework parity.
