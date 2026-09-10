# Legacy Grid: explicit native replacement, not Row/Col compatibility

**Resolved deprecated-API lane / verified native replacement.** Use the already
shipped [Grid](grid.md), [Flex](flex.md) and [Space](space.md) CSS on original
semantic HTML. Six useful layout/content capabilities have verified native
replacements; deprecated constructors, prop syntax and source machinery do not return.

There is **no Legacy Grid runtime, export, stylesheet distribution, dependency,
observer, responsive parser or new budget**. The [HTML](../../demo/components/legacy-grid.html),
[application CSS](../../demo/components/legacy-grid.css) and
[tests](../../tests/legacy-grid.test.ts) are an explicit migration recipe. Existing
modern Grid implementation/acceptance and legacy MarkupUI wrappers are unchanged.
See the [complete Row/Col tracker](../naive-ui/components/legacy-grid.md).

## Load the actual target, then author native structure

The demo explicitly loads the existing distributions:

```html
<link rel="stylesheet" href="../../dist/markup-ui-grid.css">
<link rel="stylesheet" href="../../dist/markup-ui-flex.css">
<link rel="stylesheet" href="../../dist/markup-ui-space.css">
<link rel="stylesheet" href="legacy-grid.css">
```

Package stylesheet exports remain `@dataengine/markup-ui/grid/style.css`,
`.../flex/style.css` and `.../space/style.css`. None has a Legacy Row/Col alias or
requires a registration step. There is no automatic upgrade from n-row/n-col,
NRow/NCol, legacy attributes or Vue slots.

Choose a real container appropriate to the content: native div/section, nav,
form/fieldset or a list with actual li children. The demo keeps label/input and
fieldset/legend semantics, links, articles and native details. Every direct native
grid child is a grid item; put item span/start on that real child, not on an imagined
Col wrapper. Native CSS Grid is not an ARIA data grid.

## Row/Col migration decisions

| Source surface | Explicit target / boundary |
| --- | --- |
| Row.gutter | Author --mui-grid-x-gap / --mui-grid-y-gap, or native Flex/Space column/row gaps. Source tuple order is horizontal, vertical. No number/string/tuple parser. |
| Col.span | Author --mui-grid-span with a positive CSS integer valid for the active track count. Use --mui-grid-cols:24 only when that actual layout is wanted. No span attribute/JS prop adapter. |
| Col.offset | Omit the automatic relative offset. A known empty spacer or carefully authored native placement can serve a specific composition, not the old wrapping algorithm. |
| Col.push / Col.pull | Omit physical visual displacement. Author the meaningful DOM order; do not visually swap focusable/meaningful content while retaining an incompatible tab/reading order. |
| Source Row.alignItems | For the row-flex use case, use --mui-flex-align with native align-items values. Grid's own cross-item alignment is separately documented. |
| Source Row.justifyContent | Use --mui-flex-justify for native flex main-axis distribution. It is not Grid's justify-items token. |
| Row/Col default slots | Actual original child nodes; author a semantic wrapper only when needed. No callback/VNode evaluation or gutter-dependent wrapper insertion. |

Gutters are deliberately **native gaps**, not the source's expanded row width,
negative half-gutter margins and Col half-padding. Box edges/available widths can
differ. The source converts scalar gutter through Number and splits arrays before
formatting; this recipe does not emulate those coercions or the docs/type differences.
Write valid CSS lengths explicitly, including px for a migrated numeric pixel value.

The responsive form starts with one track and default one-span children. At the
application's 48rem viewport threshold it uses 24 tracks, first/second spans 8/16,
12px column gap and 8px row gap. A nested grid independently uses two columns and
4px gaps; it does not inherit the enclosing item's span of 16.

With W container width, N equal tracks and gap g, a native s-track span has width
`s * (W - (N - 1) * g) / N + (s - 1) * g`, subject to native subpixel rounding.
Do not simply use s/N of W and then add gaps outside it. Do not promise identical
source outer/inner box geometry merely because visible content looks similar.

## Offset, absolute start and wrapping are different

After a two-track item in a four-track grid, **absolute start line 3 is adjacent**.
It is not a three-track relative gap. --mui-grid-start is a native absolute grid line,
not a renamed offset property.

The demo separately authors a known empty aria-hidden span: first item uses two
tracks, the spacer consumes the third, and the following item uses the fourth.
At compact sizes the spacer has display:none and both meaningful items stack.
The empty spacer has no text, control, tabindex or semantic content to hide.

This is a bounded authored composition. A spacer can wrap independently of its
neighbor; it does not implement atomic offset-plus-span row packing. If grouping
matters, restructure the actual group or explicitly place the known items while
preserving order. Do not claim a reusable relative-offset algorithm.

The pinned source sets column width/margin-left/relative left/right through generated
1..24 classes and computes push minus pull. Its RTL stylesheet swaps push/pull
left/right but still declares physical marginLeft for offset. None of those
physical-shift contracts is reproduced. Native grid line 1 follows inline-start;
the RTL example starts its first authored item on the right and keeps first-to-second
DOM/tab order. No dense packing, order property, reverse flex direction or explicit
row-placement shortcut is used to reorder meaning.

## Breakpoints: source inventory versus application choices

**The pinned Legacy Grid has no named xs/sm/md/lg/xl/xxl props, breakpoint table,
responsive object/string grammar or self/screen mode.** Its local Span type lists
1..24 as numbers and their string equivalents; source generated rules are fixed
24-way percentages. No missing breakpoint identities are invented. Modern Grid's
separate ResponsiveDescription reference is not inherited by Legacy Row/Col.

The old type excludes zero while offset/push/pull have runtime zero defaults;
this recipe does not recreate that type/API discrepancy. There is no supported
legacy span=0 hiding contract inferred here. Use native hidden or deliberate
responsive display:none, not invalid --mui-grid-span:0. Excessive/invalid native
spans are not clamped and can create implicit tracks or invalid CSS.

The demo's **48rem viewport** and **30rem container** thresholds are application
choices. The media rule updates the grid count and affected spans/starts together.
Compact defaults return children to one-span/auto-start and remove the spacer.

Container queries target descendant grids through independent
.mui-grid-container wrappers named migration; a container cannot query itself to
set its own column count. At 30rem, the descendant uses three tracks and a 2/1 split.
The compact wrapper is capped at 20rem, so it stays single-column on a wide screen.
The query is guarded with @supports; without container-query support the usable
one-column baseline remains. No observer or framework breakpoint engine is involved.

## Ownership, hidden content and forms

CSS never creates/reparents/replaces the original nodes, headings, labels, inputs,
attributes or listeners. Changing viewport/container size does not change current
form values or focus. Native details supplies optional content disclosure, not a
row-budget or overflow renderer.

The hidden grid item has no box/tab stop but its named field **still contributes
to FormData**. It is intentionally non-required in the demo. Hidden controls may
still validate/submit in applications; reveal invalid hidden fields before native
validation or explicitly own a different policy. Hiding does not mean disabling.
The actual disabled fieldset is excluded from FormData by native HTML behavior.

Reader, Notes and Project remain real labelled text inputs, followed in DOM/tab
order by native Reset. No submit button is authored; Enter caused no navigation/
request with these multiple text fields. This is not a universal form submission
guard. There is no proxy field, intercepted keyboard handler or controller lifecycle.

The application's CSS is scoped to #legacy-grid-example. Actual library CSS owns
Grid/Flex/Space mechanics; local rules choose spans/gaps/query thresholds and modest
presentation. Print and forced colors remain native. Very long/wide authored content,
arbitrary explicit placement and target-browser/AT behavior still need application review.

## Existing wrappers are not the deprecated source API

The old MarkupUI mui-grid still interprets its existing columns string through
native grid-template-columns; mui-row still has its existing flex behavior. They
are not Naive UI NRow/NCol implementations and are not automatically converted by
loading .mui-grid/.mui-flex/.mui-space CSS.

A separate browser coexistence check imported the unchanged legacy aggregate and
created existing wrappers. The native form/input identity and 992px native grid
width remained unchanged; legacy columns="1fr 2fr" resolved to two proportional
tracks and mui-row remained flex. That aggregate's automatic style installation
is not the no-JS/strict-CSP path. No core/plugin/legacy source was modified.

## Default-style audit

The [2026-09-11 default-style audit](../style-audit/components/legacy-grid.md)
rendered actual Naive UI 2.45.3 Row/Col beside the existing native replacement.
At a 480px stage, the default 24 tracks, 25th-item wrap, 8/16 spans, nested
8/16 then 12/12 spans, and the visible content boxes for a 12px/8px gutter
matched in light/dark and LTR/RTL.

No Legacy Grid source or stylesheet exists to correct, and the already audited
Grid/Flex/Space defaults remain unchanged. This does not restore source topology:
Naive still expands a guttered Row to 492×32px at (-6,-4) and pads generated Col
wrappers, while the native root stays 480×24px and uses actual gap. The matched
visible content boxes were 152/316px at x=0/164px; wrapper/outer box identity is
intentionally different. Relative offset/push/pull, generated containing blocks,
provider injection and coercion remain omitted.

## Evidence and accounting

The [tracker](../naive-ui/components/legacy-grid.md) retains all five original
Row/Col identities and adds three grouped type/export plus seven source supplements:
**15 rows = six verified native replacement capabilities + nine explicit omissions**.
All four replacement-resolution tasks are accepted, without deprecated constructor/
syntax, relative displacement, provider or responsive-parser compatibility.

The historical migration run
`pnpm test -- tests\legacy-grid.test.ts tests\grid.test.ts tests\native.test.ts`
passed **51 tests** (12 replacement, 12 unchanged modern Grid, 27 native/legacy).
After the default-style audit,
`node node_modules\vitest\vitest.mjs run tests\legacy-grid.test.ts`
passes **14 Legacy Grid tests**, including pinned-default/author-token and reused
asset-budget regressions.
`pnpm build` passed declarations and every existing ceiling. All **1,316 existing
distribution files byte-matched**. Modern Grid's source/reference/acceptance and
P0 foundation rows are unchanged.

Dedicated Chromium measurements verified actual replacement geometry:

- At 1280px viewport: a 992px grid, 24 tracks, 8/16 spans measuring approximately
  322.66/657.34px, 12px inter-item gap and 8px row gap. Nested grid stayed two tracks/4px.
- The native Flex navigation resolved align-items:center and justify-content:space-between,
  with first/last items at the container edges; small Space actions used 4px/8px gaps.
- Viewport 767→768px changed one→24 tracks at the authored 48rem threshold; the
  spacer disappeared in compact mode. A named wrapper at 479→480px changed one→three
  query tracks; the separate 320px wrapper stayed one-column.
- Four-track spacer example: 490px first item, 239px empty third track and 239px
  following fourth-track item. Absolute start line 3 was adjacent to the first item,
  not the same geometry as the spacer example.
- Native Tab visited Reader, Notes, Project, Reset; hidden/disabled controls were
  skipped. RTL first/second links appeared right/left and retained that DOM/tab order.
  Editing, Enter, reset, FormData, original node identity and outside source ownership held.
- At 360px/200% CSS zoom, page width stayed 345px without horizontal overflow;
  compact spans, nested inputs and hidden behavior remained usable. Print/forced
  colors retained native content/hidden state and FormData.
- Native AX retained labelled textboxes and fieldset groups, not grid/row/cell roles.
  A fresh JavaScript-disabled strict-CSP context loaded only HTML and the four real
  local stylesheets; spans/queries/reset/disclosure worked with zero CSP errors.

No all-browser/AT or old-framework layout parity is claimed.

Local example HTML/CSS: **7,347 / 2,457 raw**, **2,483 / 760 gzip** bytes.
Reused Grid/Flex/Space CSS: **527 / 390 / 423 gzip** under unchanged
**1,500 / 1,000 / 1,000** ceilings. Complete example transfer is **4,583 gzip bytes**
including those three existing assets; **3,243** is new demo-only HTML/CSS, no runtime.

**Legacy Transfer is next**, not started here. Main P6 remains complete for retained
scopes; broad P0 follow-through remains parent-owned and pending/partial.
