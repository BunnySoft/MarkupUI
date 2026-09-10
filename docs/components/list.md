# List and ListItem

**Migration status: 🟢 Verified for the retained native scope.**
List and ListItem are external CSS plus authored `ul`/`ol`/`li` HTML. No controller,
registration, renderer, provider or runtime dependency is required.

**Default-style audit (2026-09-10):** corrected default padding, type/leading, borders,
header/footer boundaries, affix spacing and light/dark hover paint. The comparison uses
an explicitly markerless native equivalent; ordinary native markers remain opt-in to
remove, not silently suppressed. See the [rendered audit](../style-audit/components/list.md)
for exact results and retained size/marker adaptations. No data binding, template or
repeater implementation is part of this change.

## Loading and reference boundary

| Asset | Purpose |
| --- | --- |
| `src/components/list/list.css` | Maintained scoped stylesheet. |
| `dist/markup-ui-list.css` | Browser distribution. |
| `@dataengine/markup-ui/list/style.css` | Stylesheet-only package export. |
| `demo/components/list.html`, `.css`, `.js` | Native examples and optional application action/form handlers. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-list.css">
```

There is no `./list` JavaScript export, ESM/classic runtime, global or registration order.
The unchanged aggregate's `mui-list` and `mui-list-item` remain available as legacy
elements; these native classes neither redefine them nor silently upgrade their markup.
Other enhanced custom elements still have their own legacy-registration restrictions.

Authority: [official List page](https://www.naiveui.com/en-US/os-theme/components/list),
the [pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/demos/enUS/index.demo-entry.md),
[List source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/src/List.tsx),
[ListItem source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/src/ListItem.tsx)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/list/src/styles/index.cssr.ts)
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. The
[reference tracker](../naive-ui/components/list.md) keeps all ten original public rows and
four explicitly source-only supplements: **11 Verified adapted targets, 3 omissions**.
Green means the documented native target, not Vue compatibility or pixel parity.

## Native anatomy and markers

```html
<section aria-labelledby="reports-heading">
  <div class="mui-list" data-bordered data-hoverable>
    <div class="mui-list-header">
      <h2 id="reports-heading">Reports</h2>
    </div>
    <ul class="mui-list-items" data-markerless role="list"
      aria-labelledby="reports-heading">
      <li class="mui-list-item">
        <div class="mui-list-row">
          <span class="mui-list-prefix" aria-hidden="true">◈</span>
          <div class="mui-list-content">
            <h3><a href="./report.html">Quarterly report</a></h3>
            <p>Authored description, media or nested lists.</p>
          </div>
          <div class="mui-list-suffix mui-list-actions">
            <button type="button">Archive report</button>
            <a href="./report.html">Report details</a>
          </div>
        </div>
      </li>
    </ul>
    <div class="mui-list-footer">One report</div>
  </div>
</section>
```

The `.mui-list` shell can be a `div` or an appropriately named native section. Its direct
`.mui-list-items` child is a real `ul` or `ol`. Actual `li.mui-list-item` nodes stay
direct children; no illegal `div` list children, item wrappers outside `li`, or
`display: contents` semantics workaround is used. Header/footer are siblings **outside**
the list, unlike the upstream implementation's header/footer `div` children inside `ul`.
Use meaningful heading levels; the stylesheet creates no landmarks or ARIA names.

Markers remain visible by default; items retain `display: list-item`. Native `ol`
`start`, `reversed` and `li value` remain browser-owned; `start` and `value` were exercised.
Only explicit `data-markerless` removes markers. Safari/VoiceOver can omit list semantics
when `list-style: none` is used; authors choosing markerless lists can add `role="list"`
on the real list, as in the example. This is not a Safari or screen-reader certification.
Retain ordered markers when sequence matters. Large numbers or custom markers may need
an application `padding-inline-start` override on the list.

Prefix, content and suffix are optional, author-owned children **inside** a row. The
content region grows; other regions shrink or wrap without changing DOM order. Text,
images, icons and controls are not cloned, moved, rendered or assigned alternative text.
Supply media dimensions/alternative text and responsive CSS where needed. Unclassed nested
lists keep their browser styles; a nested styled list uses its own complete shell.
Templates remain inert; explicit application cloning is possible, not a built-in data API.
Empty lists/regions do not cause generated placeholders or announcements.

## Properties, regions and deliberate adaptations

| Upstream surface | Retained native mapping and default |
| --- | --- |
| `bordered` | `data-bordered` on the shell; absent means no enclosing border. |
| `hoverable` | `data-hoverable` adds pointer-hover background and 3px item corners on hover-capable devices, and hides the hovered item's bottom divider. Does not imply an action. |
| `clickable` | `data-clickable` supplies pointer cursor **only on direct native row-action buttons/links**, not passive `li`. No focusability or event is generated. |
| `show-divider` | Item dividers are on by default. Exact `data-show-divider="false"` removes them, including the final item/footer boundary. The header separator is independent. |
| `size` (source-only) | `data-size="small"` / `"medium"` / `"large"` density presets; missing or unknown values use medium. |
| List `default` | Authored `ul`/`ol` and direct `li` children. |
| List `header`, `footer` | `.mui-list-header` / `.mui-list-footer` siblings outside the list, omitted by leaving out the node. |
| ListItem `default` | `.mui-list-content` inside an optional `.mui-list-row`, or ordinary item content for a simple list. |
| ListItem `prefix`, `suffix` | Optional `.mui-list-prefix` / `.mui-list-suffix` in meaningful reading order. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` (source-only) | ⏭️ Provider/runtime object contracts omitted; external CSS tokens are the native alternative. |

Presence switches (`data-bordered`, `data-hoverable`, `data-clickable`, `data-markerless`)
are enabled even with a value of `"false"`; remove the attribute to disable them.
`data-show-divider="false"` is the one explicit value-based opt-out. CSS updates immediately
when attributes/classes change; no live-property bridge or lifecycle cleanup is needed.
Item dividers are 1px empty `::after` decorations at the item bottom, not layout-consuming
borders. A visible following item or footer enables the line; the last item without a
footer has none. Header-only/footer-only compositions have no orphan separator.
Hidden items/templates do not create a leading or trailing item divider. Hiding content
solely through unrelated application CSS is outside that selector contract; use native
`hidden` when appropriate.

Default/medium padding is **12px block / 0 inline**, changing to **12px / 20px** when
bordered or hoverable, matching the reference. Small **8px / 12px** and large
**16px / 20px** remain useful native density presets. Pinned source declares `size`
but never consumes it in render/style, so those small/large effects remain an
**explicit adaptation**, not an upstream visual-effect claim. Unknown sizes use medium.
Public padding tokens override all presets; use them for rem-based application density.

Public tokens: `--mui-list-color`, `--mui-list-background`, `--mui-list-border-color`,
`--mui-list-border-radius`, `--mui-list-hover-background`, `--mui-list-padding-block`,
`--mui-list-padding-inline`, `--mui-list-font-size`, `--mui-list-font-family`,
`--mui-list-line-height` and `--mui-list-gap`.

- Font size/family/leading use local tokens, then shared `--mui-font-size`,
  `--mui-font-family`, `--mui-line-height`; fallbacks are 14px, inherited family and 1.6.
- Body text defaults to `#333639` / white-.82; surface to white / `#18181c`;
  border to `#efeff5` / white-.09; hover to `#f3f3f5` / white-.09. The dark alpha
  paints composite over the list surface. Border/hover corners default to 3px.
- `data-mui-theme="dark"` on an ancestor or shell selects dark fallback roles;
  nested explicit `"light"` restores light. Generic legacy text/surface/border
  tokens are not equivalent and are not silently reused.
- Prefix end and suffix start margins each default to **20px**. Both still apply when
  main content is absent, giving 40px between affixes. `--mui-list-gap` overrides each.
  The optional `.mui-list-actions` helper retains its separate 12px default gap;
  the same explicit gap token overrides it.

Supply valid CSS values in external application styles. The private `--_mui-list-*`
preset variables are not API. Nested shells reset state presets; public token inheritance
follows ordinary CSS and local overrides remain authoritative.

Neither pinned List nor ListItem declares an `extra`, `action` or `content` slot or a
component event/method API. `.mui-list-content` and `.mui-list-actions` are **local anatomy
helpers**, not invented upstream slots. Extra content/actions are authored in default/
suffix regions. ListItem has no separate props in the reviewed source. Framework slot
functions, injection requirements, automatic modal/popover theming and style-object
adapters are not reproduced.

## Actions, forms and static behavior

For one action occupying the content row, use a real root control:

```html
<li class="mui-list-item">
  <button type="button" class="mui-list-row mui-list-action">
    <span class="mui-list-prefix" aria-hidden="true">↗</span>
    <span class="mui-list-content">Open report</span>
  </button>
</li>
```

For navigation, use `a.mui-list-row.mui-list-action[href]`. Keep links visibly underlined.
Use valid button phrasing content, a useful accessible name, and no nested buttons,
links or form controls inside a row action. The padded `li` outside the native control's
box is **not** an activation target. Multi-action rows use a passive `.mui-list-row` with
independent links/buttons, as in the first example. Do not add a click listener, `tabindex`
or a button role to an entire passive item to imitate row selection.

Native Enter/Space, focus-visible outlines, `disabled`, disabled fieldsets, required
validation, reset and submission are preserved. Always choose a button `type`; an authored
untyped button keeps its native submit default. Listen to native `click`/`submit` events
on actual controls. There is no synthetic selection, live region, row-click alias, navigation
router or automatic focus policy. Demo status messages are application behavior only.

Without JavaScript, list structure, links and native forms still work; application-specific
archive/preview buttons need application listeners. Hidden roots/items/regions/actions and
templates remain hidden/inert. Native `hidden="until-found"` is not forcibly converted to
`display:none`; its reveal behavior is browser-owned and was not separately certified.

Wrapping uses flex/gap and logical properties, not measurements, reordering or a breakpoint
controller. No truncation, fixed row height, virtualization or overflow clipping is imposed.
Forced-colors fallbacks preserve borders and disabled text; print removes hover backgrounds
and requests unbroken items where pagination allows. Paint transitions last 0.3s;
reduced motion removes them. There is no runtime animation or data processing.

## Migration steps and acceptance

1. [x] Specify native list/item, prefix/content/suffix and external header/footer regions.
2. [x] Keep single-action and multi-action semantics on explicitly authored native controls.
3. [x] Ship isolated border/divider/size/hover/wrapping CSS with no component JavaScript.
4. [x] Validate semantics, nesting, empty/hidden/template cases, forms, focus and payload.

On 2026-09-08, focused List tests passed, then `pnpm --dir D:\repos\MarkupUI check`
passed the build/budget gates and **407 tests**, including **11 List cases**.
Chromium acceptance on the local demo exercised:

- Accessibility-tree lists/listitems, external headings/footer, named button/link/form
  controls, nested list semantics, disabled controls and hidden/inert exclusion.
- Tab order through independent actions, skipping disabled/passive rows; native Enter
  and Space each activated the explicit button once, with visible focus.
- Required-field blocking, one valid submission containing only the enabled named input,
  native reset, and no disabled activation.
- 8/12/16px density padding at 16px root size, visible-sibling divider boundaries,
  live size/divider changes without node replacement, hover and non-clickable passive items.
- 320px and 280px viewports, 200% CSS zoom, logical RTL prefix/suffix order, ordered
  markers, no row/document horizontal overflow, forced colors and print rules.
- Later legacy-aggregate loading preserving original nodes, native item display/dividers
  and legacy `list`/`listitem` roles; inert templates with presentation classes.
- A separate JavaScript-disabled Chromium context: two visible authored project items,
  native reset and GET submission to `?name=NoJS`.

Library CSS is **4,324 bytes / 1,054 gzip bytes**, under a new **1,500-byte** CSS ceiling.
Component JavaScript is **0 bytes**. The optional demo application script is **611 bytes /
307 gzip bytes**, and demo-only CSS is **692 / 375 bytes**; neither is a library dependency.
The core remains **62,558 bytes / 14,611 gzip bytes**, under its unchanged **15,000-byte**
ceiling. This is retained-scope Chromium evidence, not browser-zoom UI, all-browser,
screen-reader speech, pixel parity or framework API certification.
