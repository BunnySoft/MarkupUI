# Descriptions and DescriptionItem

**Migration status: 🟢 Verified for the retained native scope.**
Descriptions uses a real `dl`, with author-owned `dt`/`dd` pairs grouped in `div` elements.
External CSS arranges these groups. No runtime, registration, provider or renderer exists.

**Default-style audit (2026-09-10):** corrected unbordered spacing, size-specific
typography/padding, label weights, inline left labels and light/dark colors. Seven
controlled unbordered cases match the pinned reference pixel-for-pixel in both themes.
The [rendered audit](../style-audit/components/descriptions.md) also records the remaining
native grid/per-group-border differences; this does not introduce a table-layout engine.

## Distribution and authority

| Asset | Purpose |
| --- | --- |
| `src/components/descriptions/descriptions.css` | Maintained isolated CSS. |
| `dist/markup-ui-descriptions.css` | Browser stylesheet. |
| `@dataengine/markup-ui/descriptions/style.css` | Stylesheet-only package export. |
| `demo/components/descriptions.html`, `.css`, `.js` | Native examples plus optional application form/action handlers. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-descriptions.css">
```

There is no `./descriptions` JavaScript export, ESM/classic controller, global or
registration-order requirement. The legacy aggregate's `mui-descriptions` and
`mui-description-item` are unchanged; the new native classes neither redefine them nor
pretend the legacy label/value spans have become terms and definitions.

References: [official page](https://www.naiveui.com/en-US/os-theme/components/descriptions),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md),
[Descriptions source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/Descriptions.tsx),
[companion source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/DescriptionsItem.ts)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/src/styles/index.cssr.ts),
all at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/descriptions.md) preserves **21 original
public rows**, with **six explicit source-only supplements**: **17 Verified adapted
targets and 10 Intentionally omitted contracts**. This is a native adaptation, not Vue,
table-layout or pixel parity.

## Valid native anatomy

```html
<section aria-labelledby="project-title">
  <h2 id="project-title">Project details</h2>
  <dl class="mui-descriptions project-details" data-bordered
    aria-labelledby="project-title">
    <div class="mui-description-item">
      <dt>Owner</dt>
      <dd><a href="./profile.html">Morgan Chen</a></dd>
    </div>
    <div class="mui-description-item project-summary">
      <dt>Summary</dt>
      <dd>Authored content that occupies two group columns.</dd>
    </div>
  </dl>
</section>
```

```css
.project-details { --mui-descriptions-columns: 3; }
.project-summary { --mui-description-span: 2; }
@media (max-width: 40rem) {
  .project-details { --mui-descriptions-columns: 1; }
  .project-details > .mui-description-item { --mui-description-span: 1; }
}
```

This composition requires direct `div.mui-description-item` groups, each containing one
`dt` followed by one `dd`. These are valid `dl` groups, not arbitrary layout children.
Put titles/header content **outside** the `dl`, and give headings meaningful levels.
Do not insert headings or decorative `div` children directly into the description list.
Do not replace term/definition semantics with table/grid roles or `display: contents`.
For data that genuinely needs a table's row/column relationships, author a real table
instead of imposing table semantics on these pairs.

Text, rich values, links, actions, form controls and listeners remain authored nodes.
`dt` is not a form label by itself: use a real `label[for]` for controls inside `dd`, as
the demo does. An empty term stays empty; supply meaningful terms when the information
requires them. There is no generated title, label, placeholder, tooltip, ARIA name or
live announcement. Native templates remain inert and may be cloned explicitly by
application code; there is no expression evaluator or duplicate data tree.

Nested descriptions belong inside `dd` and use their own full `dl` composition. Their
column/span presets, alignment and placement reset independently. Unclassed `dl`/`dt`/`dd`
outside the component retain their normal browser presentation.

## Properties and companion scope

| Upstream surface | Native mapping and disposition |
| --- | --- |
| Descriptions `bordered` | Presence `data-bordered` adds independent group borders and term/value separators; absent is false. Default gap is zero, but touching outlines are not collapsed table borders. |
| Descriptions `column` | `--mui-descriptions-columns` on the actual `dl`; default `3`, positive integer. No attribute/string parser. |
| DescriptionItem `span` | `--mui-description-span` on its actual group; default `1`, positive integer no greater than the active column count. |
| Descriptions `label-placement` | Default/`"top"`/unknown values stack the term above its definition. `data-label-placement="left"` puts the term at **logical inline-start**, including on the right in RTL. |
| Descriptions `label-align` | `data-label-align="left"` / `"center"` / `"right"` preserve physical alignment; missing/unknown uses `left`. An explicit local alignment token wins. Inline unbordered left labels follow native inline flow. |
| Descriptions `size` | `data-size="small"` / `"medium"` / `"large"`; missing/unknown uses medium. Fonts, bordered padding and unbordered row spacing use pinned CSS defaults, not runtime theme lookup. |
| Descriptions `separator` | An authored `.mui-descriptions-separator` text span directly in `dt`, normally `:`. CSS shows it only for unbordered `"left"` placement. Nothing is generated. |
| Descriptions `title`, `header` slot | One authored real heading/header region outside `dl`; no title-versus-slot precedence engine or native `title` tooltip mapping. |
| Descriptions `default` slot | Authored native `dl` groups, not VNodes or a child renderer. |
| DescriptionItem `label` prop/slot | Actual `dt` text/nodes; use `textContent` for dynamic plain text. No label-attribute rendering or prop/slot precedence. |
| DescriptionItem `default` slot | Actual rich `dd` content, including nested lists, descriptions and controls. |
| Both owners' `label-class`, `content-class` | Native classes/classList on actual `dt`/`dd`, or scoped parent CSS selecting direct terms/definitions; no host-to-child class forwarding. |
| Both owners' `label-style`, `content-style` | ⏭️ Runtime string/object forwarding omitted; external CSS on the actual nodes is the alternative. |
| Source `columns` compatibility alias | ⏭️ No additional parser/precedence alias. Use the single columns CSS token. Legacy `columns` attribute support remains untouched in the old component. |
| Source `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ Framework theme/provider/override merging omitted; external CSS tokens only. |
| Source `DescriptionProps`, `DescriptionsSize` | ⏭️ Deprecated framework props alias and exported TypeScript size alias omitted. The size vocabulary is already retained through the `size` row; no type export is promised. |

Pinned source declares companion class props but its rendering reads parent-level classes.
The direct-node class path intentionally supports author-specific styling without emulating
that implementation detail. The companion's framework render returns no standalone DOM;
the native target instead keeps an actual term/definition group. No component-specific
events/methods, item `content-align` prop, or action/extra slot are declared in this source.
Content text alignment is a **local CSS customization**, not a claimed upstream prop.

`data-bordered="false"` is still present/enabled; remove the attribute to turn it off.
All layout switches and native class/text changes work live through the browser. There
is no observer, measurement loop, custom-element lifecycle, synthetic notification or
style-object bridge.

## Columns, spans and presentation constraints

Groups use equal-width native CSS Grid tracks with sparse row auto-placement, preserving
DOM and Tab order. A span covers the **whole term/definition group**. It is not upstream
`td colspan`, label/content subcolumn packing, automatic final-item expansion or aligned
table header/value rows. A group that cannot fit moves to the next row, leaving any gap;
there is no dense packing or visual reordering.

Keep column/span values positive integers and constrain spans to the current column count
at **every** responsive breakpoint. Oversized spans can create implicit grid tracks;
invalid CSS values follow browser validation rather than component coercion. There is no
automatic clamping, responsive string parser or provider breakpoint configuration.
For an explicit full-width group, application CSS can use `grid-column: 1 / -1`, as in the
demo. The library never silently stretches the last item.

Bordered groups have independent outlines with a zero default gap. Touching group outlines
can produce double seams and each group retains its own corner radius; there is no
collapsed table frame or automatic matching of term heights across columns.
The default top layout keeps each term/value pair together. Unbordered `"left"` uses
an inline term/separator followed by an inline-block definition, not a fixed label track.
Bordered `"left"` retains the native local 1:2 track ratio and logical term/value border;
`--mui-descriptions-label-width` can override that track. No overflow clipping, fixed
row height or truncation is imposed.

| CSS token | Default / responsibility |
| --- | --- |
| `--mui-descriptions-columns`, `--mui-description-span` | `3` on each list / `1` on each direct group; assign directly to the corresponding node. |
| `--mui-descriptions-gap` | Unbordered: 8/12/16px row gap for small/medium/large, zero column gap; bordered: zero gap. An explicit CSS gap value overrides both defaults. |
| `--mui-descriptions-label-align`, `--mui-descriptions-content-align` | Local alignment overrides; top/bordered terms default to physical `left`, values to `start`. Unbordered inline left terms inherit alignment unless explicitly overridden. |
| `--mui-descriptions-label-width` | Bordered horizontal mode only: one flexible track against two content tracks. Fixed widths need author narrow-layout constraints. |
| `--mui-descriptions-padding-block`, `--mui-descriptions-padding-inline` | Unbordered cells default to zero. Bordered presets: small 8px/12px, medium 12px/16px, large 16px/24px. Explicit tokens override either mode. |
| `--mui-descriptions-font-size` | Shared small/medium/large font-size role, then 14/14/15px; a local value overrides the active size. |
| `--mui-descriptions-font-family`, `--mui-descriptions-line-height` | Local overrides over shared `--mui-font-family` / `--mui-line-height`; fallback family is inherited and leading is 1.6. |
| `--mui-descriptions-label-weight` | Unbordered top: shared strong weight, then 500; bordered: 400; unbordered inline left: inherited body weight. A local value wins in all modes. |
| `--mui-descriptions-color`, `--mui-descriptions-label-color` | Value/body defaults `#333639` / white-.82; top/bordered labels `#1f2225` / white-.9. Inline unbordered labels inherit body color unless explicitly overridden. |
| `--mui-descriptions-background`, `--mui-descriptions-label-background` | Unbordered groups default transparent; bordered surface is white / `#18181c`, term fill `#fafafc` / `#26262a`. |
| `--mui-descriptions-border-color`, `--mui-descriptions-border-radius` | `#efeff5` / `#2d2d30` border by theme; 3px group corner radius. |

An ancestor or list `data-mui-theme="dark"` selects the dark fallback roles; explicit
nested `"light"` restores light. Legacy surface/text/border tokens do not describe these
same roles and are not silently reused. Public local paint/type overrides remain
authoritative over theme defaults and state presets. Size roles are
`--mui-font-size-small`, `--mui-font-size-medium` and `--mui-font-size-large`;
document `--mui-font-size` alone does not replace these component size roles.

Unbordered row gaps replace the upstream non-final-row cell bottom padding, avoiding
any last-row parser. This yields the same default text positions while retaining native
group boxes. Inline-mode group whitespace is suppressed between the authored `dt` and
`dd`; text inside those nodes remains unchanged. The authored separator uses 2px/8px
inline margins, matching the live pinned rendering.

Private `--_mui-descriptions-*` preset values are not public API. Native CSS validation,
cascade and ordinary token inheritance apply; state presets reset at nested lists.
Decorative separators should be `aria-hidden="true"` and contain authored text; omit the
span entirely to omit punctuation. Do not hide meaningful term text from accessibility.

Native hidden roots/groups/terms/definitions and templates remain hidden/inert. The
`hidden="until-found"` browser path is not forcibly replaced with `display:none` and was
not separately certified. Use whole-group `hidden` for filtering to retain paired semantics.
Native controls keep their focus outlines, validation, form types, disabled/fieldset rules,
submission and reset. Application actions require application listeners, but links and GET
forms remain functional with JavaScript disabled. Print requests unbroken groups where
pagination permits; forced colors preserve text/background/border distinctions.
Cells have 0.3s color/background/border transitions, disabled for reduced motion;
there is no value animation or runtime.

## Migration steps and acceptance

1. [x] Define real term/definition groups, rich/empty terms and an external shared heading.
2. [x] Map column/span to explicit native grid constraints without table packing or aliases.
3. [x] Ship separate density, borders, placement/alignment and responsive application CSS.
4. [x] Validate reading order, content, forms, spans, nesting and live/narrow layout changes.

On 2026-09-08, the focused **12 Descriptions tests** passed, then
`pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and **419 tests**.
Chromium acceptance exercised:

- Accessibility-tree terms and definitions in original order, an external named heading,
  nested descriptions, empty terms, rich definitions, hidden/inert exclusion and native
  labelled/disabled controls; no table/grid roles were added.
- At a 1,200px viewport, three roughly 341.33px tracks with 16px gaps: the two-track group
  measured roughly 698.66px; the explicit full-width group filled the list. Live two-column
  changes preserved authored nodes; the ordinary date group remained `span 1`.
- 8/12/16px density padding at 16px root size, top/horizontal layouts, physical label
  alignment, logical RTL placement/borders, centered content and separator visibility.
- Tab order through the link, action and form; Enter and Space each activated the native
  action once with its native focus outline. Required validation blocked an empty value;
  one valid submission contained only the enabled named input, reset restored its default,
  and the disabled button did not activate.
- 280px/320px authored one-column/span-reset layouts, long terms/values and 200% CSS zoom
  without group/document horizontal overflow; print and forced-colors rules.
- Later legacy aggregate loading preserved native nodes/terms/grid while legacy generated
  label/value spans and its `columns` handling still worked.
- A separate JavaScript-disabled Chromium context retained eight top-level visible terms,
  native reset and native GET submission to `?name=NoJS`.

Library CSS: **4,194 bytes / 880 gzip bytes**, under its new **1,500-byte** ceiling.
Component JS: **0 bytes**. Demo-only application JS is **401 / 239 gzip bytes** and CSS
is **1,177 / 520 gzip bytes**; neither is a library runtime dependency. Core remains
**62,558 bytes / 14,611 gzip bytes** under its unchanged **15,000-byte** ceiling.
These checks do not certify screen-reader speech, all browsers, browser-UI zoom,
table-layout algorithms, pixel parity or framework compatibility.
