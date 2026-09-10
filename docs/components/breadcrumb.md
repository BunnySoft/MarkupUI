# Breadcrumb and BreadcrumbItem

**Migration status: 🟢 Verified for retained native scope.**
Breadcrumb is a named native navigation landmark with a real list and real destination
links. It ships only CSS; the demo also has no JavaScript.

## Default-style audit — 2026-09-10

The [isolated rendered audit](../style-audit/components/breadcrumb.md) corrects
14px/1.25 typography, 4px padding, 3px corners, normal current-item weight,
light/dark text colors and genuine-link hover/pressed fills. Horizontal spacing
now belongs to actual separators, so suppressing one leaves no phantom item gap.

**17 focused tests pass.** Twenty authored-text-separator case/theme/direction
comparisons matched the checked reference properties; hover/pressed colors also
matched. The non-text default slash, explicit current-page ownership and passive
disabled semantics retain documented differences. CSS is **5,146 raw / 1,120 gzip
bytes** under the unchanged **1,500-byte ceiling**. The coordinator's isolated
release build and all **17 Breadcrumb tests** pass; no shared source changed.

## Loading and authority

| Asset | Purpose |
| --- | --- |
| `src/components/breadcrumb/breadcrumb.css` | Maintained isolated stylesheet. |
| `dist/markup-ui-breadcrumb.css` | Browser distribution. |
| `@dataengine/markup-ui/breadcrumb/style.css` | Stylesheet-only package export. |
| `demo/components/breadcrumb.html`, `.css` | Script-free native examples. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-breadcrumb.css">
```

There is no `./breadcrumb` JavaScript export, controller, global or registration-order
requirement. No widgets/Icon/Menu/Dropdown/router module is required. The unchanged
optional widgets plugin still provides its legacy `mui-breadcrumb`/`mui-breadcrumb-item`
elements; the new native classes do not replace or redefine them.

References: [official page](https://www.naiveui.com/en-US/os-theme/components/breadcrumb),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md),
[Breadcrumb source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/src/Breadcrumb.tsx),
[BreadcrumbItem source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/src/BreadcrumbItem.tsx)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/src/styles/index.cssr.ts),
all at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/breadcrumb.md) preserves **eight original
public rows**, plus **four explicit source-only click/theme supplements**:
**9 Verified adapted targets and 3 Intentionally omitted theme contracts**.
This is native-scope acceptance, not Vue, pixel or screen-reader speech parity.

## Valid native anatomy

```html
<nav class="mui-breadcrumb" aria-label="Project breadcrumb">
  <ol class="mui-breadcrumb-list" role="list">
    <li class="mui-breadcrumb-item">
      <span class="mui-breadcrumb-row">
        <a class="mui-breadcrumb-link" href="./projects.html">Projects</a>
        <span class="mui-breadcrumb-separator" aria-hidden="true"></span>
      </span>
    </li>
    <li class="mui-breadcrumb-item">
      <span class="mui-breadcrumb-row">
        <span class="mui-breadcrumb-link" aria-current="page">Current project</span>
        <span class="mui-breadcrumb-separator" aria-hidden="true"></span>
      </span>
    </li>
  </ol>
</nav>
```

Choose a meaningful, localized `aria-label` or `aria-labelledby` for the actual `nav`,
especially when a page has multiple navigation landmarks. The direct list can be `ol`
or `ul`; its actual `li` nodes retain list-item display. The authored inner row keeps a
label and its trailing separator together while labels themselves can wrap. Do not insert
separator `div`/`span` nodes directly between list items, nest interactive controls inside
an anchor, or remove native structure with `display: contents`.

CSS removes list markers for the breadcrumb presentation. Safari/VoiceOver can omit list
semantics when `list-style: none` is used; the examples explicitly author `role="list"`
on the real list as a workaround. This is not a Safari/VoiceOver certification. All
labels, links, headings, icon alternatives, list/current-page roles and announcements
remain author-controlled; the stylesheet generates none of them.

## Properties, callbacks and deliberate mappings

| Upstream surface | Native target and scope |
| --- | --- |
| Breadcrumb `separator` | The repeated authored separator convention. Empty separator spans draw a non-text CSS slash; for a shared custom string/shape, author it in each appropriate item. No global string-prop forwarding. |
| BreadcrumbItem `separator` | Author this item's separator span text or SVG instead of the empty default shape. |
| BreadcrumbItem `show-separator` | Default on when there is a later visible sibling; exact `data-show-separator="false"` on the item opts out. A final visible item's separator stays hidden even with an explicit true value. |
| BreadcrumbItem `href` | Native `a[href]`; `target`, `rel`, download and URL behavior stay browser/application-owned rather than becoming component props. |
| BreadcrumbItem `clickable` | Choose a real destination anchor for navigation, or a passive span/placeholder anchor for non-navigation. No `clickable` attribute parser or pointer-only disabled state is introduced. |
| Breadcrumb `default` slot | Authored native list and direct `li`/template children. |
| Breadcrumb Item `default` slot | Authored link/text content inside the item row, including optional decorative icons. There is no separate upstream icon slot. |
| Breadcrumb Item `separator` slot | Authored separator contents within that item's row, not Shadow DOM or VNode slot projection. |
| Source-only `onClick` | An application `addEventListener("click", handler)` on the actual native action. The native event and default navigation remain intact unless application code intentionally cancels them. |
| Source-only `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ Framework/provider/style-object contracts omitted; external CSS tokens are the alternative. |

There are no public style-object, target, disabled, overflow-menu or router props in the
reviewed Breadcrumb declarations. Native HTML attributes are not newly invented framework
APIs. The actual `onClick` declaration is separately inventoried because the public Markdown
omits it. Optional application code can observe navigation without replacing it:

```js
document.querySelector("#projects-link").addEventListener("click", event => {
  console.log(event.currentTarget.href);
});
```

The library itself installs no click listener, synthetic event, URL/history observer,
router interception or navigation callback wrapper. Arbitrary data/URL validation stays
with the application; no runtime renderer or sanitizer is implied by this CSS-only path.

## Current page and non-clickable items

Author `aria-current="page"` on the current label, either a passive span or a genuine current
page anchor. The stylesheet applies current color to **that attribute**, not the last
child's position; its default weight is **400**, matching the reference.
An anchor with `aria-current` remains navigable and focusable. A passive current-page span
is not a keyboard stop. Choose one current item for each path; if application navigation
changes the path, update its markup/state explicitly.

Pinned source compares the current browser URL with `href` and sets `aria-current="location"`;
its stylesheet also emphasizes the final child. Neither automatic URL comparison nor
position-based current-page inference is reproduced. Native page state remains correct
only to the extent that the author/application keeps it correct.

For an unavailable ancestor, use passive markup such as:

```html
<span class="mui-breadcrumb-link" aria-disabled="true">Archive (unavailable)</span>
```

`aria-disabled` communicates state but does **not** disable an `a[href]`, a click listener,
or keyboard navigation. Do not use `pointer-events:none` as a disabled implementation.
Choose a passive element or remove the destination and any application activation policy
when making an existing link unavailable. Do not add `tabindex`, link/button roles or
activation listeners to a passive span to create a pseudo-link.

The upstream `clickable` flag is primarily styling and does not remove the href/callback.
The retained target deliberately uses native semantics instead. For application commands,
use real buttons rather than pseudo-links, preferably outside the breadcrumb destination
path. Breadcrumb introduces no form/value/control abstraction; the demo contains only
ordinary destination navigation. Native keyboard activation and fragment focus behavior
are not overridden.

Genuine non-current destination anchors receive the reference hover/pressed text
and background colors. Current-page anchors remain native links but receive no
default hover/pressed fill. Passive unavailable spans never gain those interactive
styles. Naive still changes foreground on a hovered `clickable=false` span; that
visual behavior is deliberately not copied to an unavailable native item.

## Separators, hidden items and wrapping

Separator spans are decorative and should be `aria-hidden="true"`; SVG/glyph content
must not create focus stops or duplicate spoken labels. An **empty** span draws a rotated
CSS border with reserved inline space, not a generated slash text character. Author text
or SVG for a custom separator. No Icon dependency, string renderer or separator-precedence
engine is needed. Put directional custom symbols in the appropriate authored orientation
for RTL; the neutral default slash is not a direction/ordering algorithm.

Scoped, guarded `:has()` selectors show a trailing separator only when its real `li`
has a later visible sibling `li`. Hiding the first item creates no leading separator;
hidden middle/trailing items and inert templates do not create a spurious end separator.
Exact item `data-show-separator="false"` overrides that default. Removing it, or assigning
another value, restores the visible-sibling rule. Hiding only through arbitrary application
`display:none` selectors is not detected: use the whole item's native `hidden` state.

Without `:has()` support, the safe fallback is a readable named navigation/list with no
separators, rather than incorrect hidden-item boundaries. A separator-only `hidden`
attribute also remains authoritative. Native hidden roots/items/rows/links/templates stay
hidden/inert; standalone CSS does not force `hidden="until-found"` to `display:none`.
That reveal path is browser-owned and not separately certified. Application-owned templates
can be cloned explicitly; no template evaluator or automatic child adoption exists.

The list wraps in DOM order; long labels wrap within their row without truncation, scrolling
traps or overflow menus. Logical gaps follow `dir`, including RTL. Each nested named
breadcrumb has independent separator/current-item boundaries and a reset gap default.
The nested demo is a scoping check, not a requirement to nest breadcrumb landmarks.
Focus outlines remain visible while links are focused. Native navigation may move focus
to a fragment target; the stylesheet does not restore it or announce route changes.

The gap is now applied as a margin on each visible separator, not a permanent gap
between list items. A suppressed or hidden separator therefore leaves adjacent
link boxes directly adjoining, as in the reference. Wrapped rows retain the same
configured row gap.

The default non-text slash reserves **.5em (7px at 14px)**. In the audited font,
Naive's textual `/` occupied **5.46875px**; two default shape separators therefore
shifted the final label by **3.0625px**. Author `/` inside the existing decorative
separator spans when matching text-glyph spacing is desired. The asset does not
generate separator text or pretend that a border shape has font-glyph parity.

## Appearance, themes and public overrides

Set `data-mui-theme="light|dark"` on an ancestor or the breadcrumb itself. No marker
means light. Theme boundaries set only private defaults; explicit public color
overrides still inherit normally. The application owns its background and
`color-scheme`, and no body/theme watcher is added.

| Role | Light | Dark |
| --- | --- | --- |
| Idle, passive disabled, separator | `#767c82` | white `.52` |
| Current, hover, pressed foreground | `#333639` | white `.82` |
| Hover fill | `rgb(46 51 56 / .09)` | white `.12` |
| Pressed fill | `rgb(46 51 56 / .13)` | white `.08` |

Links are no longer blue/underlined by default; they use the reference presentation
while retaining real href/keyboard semantics and the explicit focus-visible outline.
Authors can restore underlining with ordinary CSS.

Existing tokens are `--mui-breadcrumb-gap` (default **8px**, reset on each `nav`),
`--mui-breadcrumb-color`, `--mui-breadcrumb-link-color`, `--mui-breadcrumb-current-color`,
`--mui-breadcrumb-disabled-color` and `--mui-breadcrumb-separator-color`.
Additional typography/state tokens are:

- `--mui-breadcrumb-font-size` (shared `--mui-font-size`, then 14px);
- `--mui-breadcrumb-line-height` (1.25), `--mui-breadcrumb-radius` (3px),
  `--mui-breadcrumb-current-weight` (400);
- `--mui-breadcrumb-hover-color`, `--mui-breadcrumb-pressed-color`;
- `--mui-breadcrumb-hover-background`, `--mui-breadcrumb-pressed-background`.

Explicit hover/pressed foreground overrides win first; otherwise an authored
`--mui-breadcrumb-link-color` remains effective in those states before reference
fallbacks. Shared legacy primary/secondary text colors are not equivalent to these
roles and are no longer substituted. Family remains inherited; no font is loaded.

Apply valid CSS values using external author styles. There is no runtime theme merging or measurement.
Print preserves wrapping and requests unbroken items where possible; forced colors use
native link/current/disabled/separator colors. There is no animation.

## Original migration steps and acceptance (historical)

1. [x] Preserve native destination/target/rel behavior without router interception.
2. [x] Define authored default/separator regions and non-duplicated decorative icons.
3. [x] Ship external wrapping, focus and logical separator rules without measurement.
4. [x] Verify nav/list structure, current attributes, disabled keyboard behavior and no-JS navigation.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**443 tests**, including **12 Breadcrumb cases**. Chromium acceptance exercised:

- Named navigation/list/listitem/link accessibility trees, decorative text/SVG separator
  exclusion, explicit `aria-current="page"` markup on spans and anchors, and disabled state
  on the passive unavailable span. Current-page attributes and structures were inspected;
  screen-reader current-page speech was not certified.
- Tab order skipped unavailable, hidden and passive current-page items. Focus outlines
  were visible before activation; Enter performed real fragment navigation and delivered
  one native click event without default cancellation. The current-page anchor remained
  navigable; current state did not silently follow hash changes.
- Native `_blank`/`noopener noreferrer` opened the local reference destination with
  `window.opener === null`; the acceptance-created tab was then closed.
- Default non-text slash, custom text/SVG, explicit separator opt-out, nested boundaries
  and live hidden-first/last/current-position updates without replacing nodes.
- 280px/320px widths and 200% CSS zoom without row/document horizontal overflow.
  The default rotated separator reserves 8px at a 16px font, avoiding overflow from its ink.
  Logical RTL ordering, print and forced-colors presentation were checked.
- Removing the conditional separator block verified the separator-free fallback in Chromium,
  not in a separate older engine. Later aggregate/widgets loading preserved native nodes,
  list structure and separators while legacy labels/slash styles still worked.
- A separate JavaScript-disabled Chromium context retained four visible main-path items,
  skipped passive items and navigated by keyboard to the real `#projects` destination.
  The normal demo itself loads zero scripts.

At original delivery, library CSS was **3,827 bytes / 928 gzip bytes**, below its **1,500-byte** ceiling.
Component and demo JavaScript are **0 bytes**. Demo-only CSS is **542 / 304 gzip bytes**.
Core remains **62,558 / 14,611 gzip bytes** under **15,000**; widgets remains
**10,858 / 2,779 gzip bytes** under **4,000**. Existing outputs/ceilings and zero runtime
dependencies were unchanged. These are historical delivery figures, not a newly run
integrated build. This does not certify all browsers, browser-UI zoom, screen-reader
speech or framework/pixel parity.
