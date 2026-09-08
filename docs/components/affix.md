# Affix: native sticky scope

**Migration status: 🟢 Verified for retained CSS-sticky behavior.**
This is ordinary authored HTML with `position: sticky`, not the upstream scroll-triggered
fixed/absolute controller. Incompatible target/trigger/position contracts are explicitly omitted.

## Loading and source boundary

| Asset | Purpose |
| --- | --- |
| `src/components/affix/affix.css` | Maintained positioning CSS. |
| `dist/markup-ui-affix.css` | Browser stylesheet. |
| `@dataengine/markup-ui/affix/style.css` | Stylesheet-only package export. |
| `demo/components/affix.html`, `.css`, `.js` | Window/nested/bottom/constraint examples; optional application scroll/form actions. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-affix.css">
<div class="mui-affix document-tools">
  <a href="#notes">Notes</a>
  <button type="button">Project action</button>
</div>
```

```css
.document-tools { --mui-affix-block-start: 8px; }
```

There is no `./affix` JS export, custom-element definition, controller, observer, placeholder,
global overlay host or lifecycle API. No scroll/resize listeners or polling are needed for
the retained native behavior. The legacy aggregate/plugins remain unchanged; loading order
does not affect native Affix CSS.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/affix),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md),
[Affix source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/Affix.tsx),
[positioning stylesheet](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/styles/index.cssr.ts)
and [scroll-target utilities](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/utils.ts),
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/affix.md) keeps six original rows and four
source-only deprecated/default-content supplements: **10 rows, 3 Verified adapted targets
and 7 Intentionally omitted contracts**.

## What native sticking means

- The element keeps its normal-flow space, width rules and original nodes. CSS may shift its
  painted box while scrolling; no cloned placeholder or node move is involved.
- The nearest relevant scrolling ancestor establishes the sticky scrollport. It is not an
  arbitrary selector, element, function result or separate document chosen by the component.
- Its containing block limits how far it can travel. At the boundary it releases/moves out
  with the container; it cannot stay attached to the viewport after leaving that boundary.
- Width remains governed by normal layout. It is not measured, cached or copied, and does
  not become fixed/absolute shrink-to-fit sizing.
- Sticky creates a stacking context. The default local layer is `1`; choose application
  layers deliberately. Ancestor stacking/clipping still constrains the element.

Pinned source listens to a chosen scroll target, measures distances, stores activation
scroll positions and switches its own div to `fixed` or `absolute`. Its trigger offsets
can differ from its eventual CSS top/bottom offsets. The inspected source does **not**
teleport or create a placeholder; this target introduces neither. Native sticky is not
claimed to reproduce fixed/absolute activation, global overlay escape or any hypothetical
teleported variant.

## Property dispositions

| Upstream item | Retained mapping / omission |
| --- | --- |
| `top` | `--mui-affix-block-start` on the actual element; default `auto`. A logical sticky constraint, not a post-trigger fixed coordinate. |
| `bottom` | `--mui-affix-block-end`; default `auto`, with the bottom-flow preconditions below. |
| `listen-to` | ⏭️ Selector/element/document/window/function target API omitted. Native scroll ancestry controls sticking. |
| `trigger-top`, `trigger-bottom` | ⏭️ Independent activation thresholds and stored scroll-position state omitted. A CSS inset is not an equivalent trigger callback/model. |
| `position` | ⏭️ Upstream fixed/absolute modes omitted. Native sticky is the only retained positioning mode. |
| Source `offsetTop`, `offsetBottom` | ⏭️ Deprecated trigger aliases omitted rather than falsely mapped to simple CSS offsets. |
| Source `target` | ⏭️ Deprecated function-based scroll-target alias omitted. |
| Source default slot | Original authored content remains in normal DOM order. No slot projection or runtime renderer. |

The three native tokens are `--mui-affix-block-start`, `--mui-affix-block-end` and
`--mui-affix-z-index` (defaults `auto`, `auto`, `1`). Set them **on the element** using
external CSS; nested Affix elements reset their defaults. Supply valid CSS lengths/`auto`
and native z-index values, not unitless-number or selector props. CSS validation/cascade
apply; there is no numeric parser, style-object adapter or theme/provider dependency.

In ordinary horizontal writing, block-start/end correspond to top/bottom. In other writing
modes they are logical, deliberately not forced physical coordinates. RTL follows native
direction without DOM reversal. Both auto insets leave the element at its normal flow
position, although its computed positioning/stacking model remains sticky.

There is no synthetic `on-change`, affixed-state event, boolean state getter, imperative
update method or no-op callback. The public table and inspected props/exports do not declare
such methods/events. Internal setup state is not being promoted into a new native API.

## Bottom and simultaneous-inset constraints

`bottom: 10px` does **not** mean “dock this arbitrary early element to the viewport bottom.”
It constrains a box whose normal-flow lower edge would cross the scrollport's block-end
boundary. Author the element near the end of a sufficiently tall containing block, as the
demo does. It may be pulled upward into view while its normal-flow slot remains later in
the content; near the end it returns to its normal constrained position.

The counterexample deliberately places a bottom-only sticky element at the beginning of
content. It stays near that flow position and can scroll out above the scrollport; a bottom
inset does not add a top constraint. Neither case has fixed-position/teleport semantics.

Both block insets are allowed as ordinary CSS constraints, not two independent triggers.
The element and available scrollport space must fit; oversized sticky boxes can cause the
browser to reduce an effective end constraint. Short containers offer little or no travel.
Do not promise simultaneous top/bottom distances for content too tall to satisfy them.

## Scroll ancestors, transforms and readable controls

An `overflow:auto`, `scroll` or `hidden` ancestor can capture the scrolling reference,
even when it does not visibly scroll. The overflow:hidden counterexample therefore does
not pin to the window. A transform can affect coordinate/stacking/clipping contexts but
does not make native sticky viewport-fixed; the transformed nested-scroller example keeps
its own scrollport constraint. Fixed-position elements also have their own transformed
containing-block rules, so no cross-mode equivalence is implied.

Use a bounded scroll container only when needed, give a standalone scroll region a useful
name and keyboard focus, and ensure the sticky element has room to travel. Avoid a stretched
grid/flex item occupying the entire containing block; author appropriate alignment/height.
The library does not force dimensions or restructure ancestors to make sticking work.

Sticky content can obscure underlying links/inputs. Provide an opaque background when
needed and reserve space based on the **actual responsive toolbar height**, including zoom.
For example:

```css
.scroll-region { scroll-padding-block-start: 6rem; }
.scroll-region .anchor-target { scroll-margin-block-start: 1rem; }
.bottom-scroll-region { scroll-padding-block-end: 6rem; }
```

Scroll padding belongs to the scroller; target scroll margin adds a separate gap. Do not
blindly duplicate the full toolbar height in both. The demo uses these author-controlled
budgets and verifies representative anchor/focus targets remain visible. Arbitrary
application layouts, enlarged content and browser focus scrolling still need checking;
CSS does not measure the toolbar, reserve overlay space automatically or trap/restore focus.

Native content, labels, links, input values, required validity, form submission/reset,
disabled state and listeners are untouched. Hidden roots/templates remain hidden/inert;
standalone CSS does not force `hidden="until-found"` to display:none, and that reveal path
is not separately certified. With unsupported sticky positioning, authored content remains
normal flow rather than acquiring a polyfill. No headings, landmarks or announcements are
generated.

Print forcibly returns Affix elements to static positioning, auto offsets and auto layers.
Application-owned scroll-container clipping must also be removed for print, as shown in the
demo. There is no library animation; the demo's user-initiated native scrollTo actions use
automatic scrolling when reduced motion is requested. Its form feedback is application
behavior, not an affix notification system.

## Migration steps and acceptance

1. [x] Keep authored content, normal-flow space and native semantics without global relocation.
2. [x] Map top/bottom appearance to explicit logical CSS insets and local layers.
3. [x] Omit incompatible fixed/absolute targets/triggers/aliases rather than adding a fake controller.
4. [x] Exercise window/nested/bottom/short/overflow contexts, focus, form and print behavior.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**504 tests**, including **10 Affix cases**. Chromium acceptance covered:

- Window toolbar pinned at 8px with unchanged 960px width and following content's document
  position; original nodes stayed intact. It released at its containing-block end.
- Native disclosure shifted its initial position by 132px; the browser recalculated sticking
  without an observer. Anchor targets landed clear of the toolbar using authored offsets.
- A transformed nested scroll container retained a 12px start inset independently of window
  scrolling; the reduced-motion application end-scroll action reached the native scroll end.
- A late bottom toolbar held a 10px end inset, while the early-position counterexample
  scrolled above the container. Both 12px insets and a short containing block remained native
  constraints; overflow:hidden ancestry prevented viewport pinning.
- Native names/links, Tab focus clear of the toolbar, required validation, one form submission,
  reset and disabled exclusion. No affix-specific event or focus trap was added.
- 280px/320px widths, RTL, 200% CSS zoom and visible anchor targets; print restored all visible
  affixes to static flow and forced colors retained readable toolbar content.
- Aggregate/widgets/advanced coexistence with unchanged nodes and no mui-affix definition.
- JavaScript-disabled sticking, native anchor navigation and reset/GET form submission.

CSS is **618 bytes / 270 gzip bytes**, below the new **500-byte** ceiling. Component JS is
**0 bytes**. Demo JS is **701 / 378 gzip bytes**, and demo CSS **2,000 / 753 gzip bytes**.
Core remains **14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes,
with unchanged outputs/limits and zero runtime dependencies. This is native-scope Chromium
evidence, not fixed/absolute/teleport, all-browser, browser-UI zoom or screen-reader certification.
