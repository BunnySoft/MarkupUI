# Flex

**Migration status: 🟢 Verified retained native CSS scope.**
**Architecture: CSS-only.** A normal native container owns its children/semantics; external
flexbox/gap rules own layout. There is no Custom Element, child traversal/wrapping, observer,
gap-support probe, size parser, renderer or runtime dependency.

## Pinned reference and loading

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/flex)
- [Six public props and default slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/demos/enUS/index.demo-entry.md)
- [Implementation, reverse and theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/Flex.tsx)
- [Actual spacing presets](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/styles/_common.ts)
- [Native CSS alignment type aliases](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/flex/src/type.ts)

The source renders inline layout styles and flattens slot nodes; the target does neither.
Six explicit source supplements record reverse, two CSS type aliases and three theme contracts.
No tag prop or callback is invented. Source reverse ordering is intentionally omitted.

| Asset | Purpose |
| --- | --- |
| `src/components/flex/flex.css` | Maintained native Flex stylesheet. |
| `dist/markup-ui-flex.css` | Browser CSS distribution. |
| `@dataengine/markup-ui/flex/style.css` | Stylesheet-only package export. |
| `demo/components/flex.html`, `.css` | Native layout/list/form examples with no script. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-flex.css">
<div class="mui-flex">
  <a href="./first.html">First</a>
  <button type="button">Second native action</button>
</div>
```

Serve/copy the stylesheet normally. There is no `./flex` JavaScript export, ESM/classic
runtime/global, registration order rule or fake JS budget. CSS may load before or after the
unchanged legacy aggregate. Existing mui-row/mui-stack/mui-wrap wrappers keep their own
direction/wrap/gap behavior; this is not an automatic upgrade or alias/attribute adapter.

## Native children and order

Use a valid native container for the content: div/section, a real nav, ul/ol with li children,
or a form with proper controls. No role, tabindex, keyboard behavior or interaction is
inferred from the layout class. In particular, the source's automatic `role="none"` is
not transplanted onto semantic lists, navigation or forms.

Original nodes, text, comments, native attributes, listeners and DOM order stay unchanged.
The library never creates item wrappers, filters children or flattens arrays/VNodes.
Normal CSS determines which text/element boxes become flex items; whitespace/comments/
templates behave as native HTML, not through a slot renderer.
Unlike the source's empty-render branch, an authored empty container is not removed. It
can remain a flex item in its parent; omit or hide it explicitly if no item/gap is wanted.

The source-only reverse prop is **intentionally omitted**. No row-reverse, column-reverse,
wrap-reverse or order convenience is supplied. Author the meaningful reading/focus order
in the DOM. Aligning a group to the end with justify-content does not require reversing it.
Native dir=rtl makes a row begin at the right/inline-start while preserving the actual RTL
reading order; a column remains top-to-bottom. CSS does not overwrite dir/lang or infer RTL
from a provider.

Native list markers/margins/padding and li display are not reset. Native links keep href/
target/rel and activation; buttons retain type/disabled/form behavior. Use type=button for
a non-submitting action. The stylesheet is not a form controller and does not intercept
clicks or submissions. The demo submits a normal GET form to its own static example URL.

## Defaults, direction and wrapping

| Native input | Retained contract |
| --- | --- |
| `.mui-flex` | display:flex, row direction, wrap enabled, justify-content:start, align-items:normal. |
| `data-inline` | Presence selects inline-flex; absent is block-level flex. |
| `data-vertical` | Presence selects column and forces nowrap, matching the source. |
| `data-wrap="false"` | Turns off row wrapping. Other values/absence keep the base wrap behavior, unless vertical. |
| `data-size="small|medium|large"` | Chooses the pinned spacing preset; absence/medium use medium. |
| `--mui-flex-align` | Native align-items CSS value; default normal, which normally stretches flex items. |
| `--mui-flex-justify` | Native justify-content CSS value; default start. |

The inline/vertical data flags are presence-only CSS switches: `data-vertical="false"` is
still present. Remove the flag to turn it off. Wrap is an explicit string opt-out exception.
There are no corresponding JavaScript properties, Boolean parsers or attribute setters.
Even `data-wrap="true"` does not make the source-compatible vertical mode wrap into columns.

Native alignment vocabulary is available through CSS, including baseline/center/stretch
and start/end/space-between/space-around/space-evenly where the browser supports them:

```css
.toolbar {
  --mui-flex-align: center;
  --mui-flex-justify: space-between;
}
```

Distributed justification can make the actual space between items larger than the configured
gap. Flex direction determines main/cross axes; these are native CSS behaviors, not copied
numeric calculations.

## Size presets and tuple axes

The source preset strings are native CSS row-gap/column-gap order:

| Preset | Row gap (vertical spacing) | Column gap (horizontal spacing) |
| --- | --- | --- |
| small | 4px | 8px |
| medium / absent | 8px | 12px |
| large | 12px | 16px |

An unknown data-size value simply has the base medium CSS style; it is not a validated
runtime size. Numeric/tuple source values map to **explicit external CSS**, not a data-size
number or JSON string.

```css
.uniform {
  gap: 10px; /* Native scalar size equivalent: both gaps. */
}
.tuple {
  --mui-flex-column-gap: 20px;
  --mui-flex-row-gap: 6px;
}
```

The source tuple **[horizontalGap, verticalGap] = [20, 6]** therefore maps to
**column-gap:20px; row-gap:6px**, or native shorthand `gap:6px 20px`.
Do not copy tuple order directly into a CSS gap shorthand. The tokens do not swap when
vertical is present: column layout uses row-gap between successive items, so the main gap
in this example remains 6px.

`--mui-flex-row-gap` and `--mui-flex-column-gap` accept native nonnegative CSS lengths/
percentages or normal. Write CSS units (or valid zero), not arbitrary unitless size numbers.
Relative lengths/percentages obey native sizing rules; percentage gaps on indefinite axes
may resolve differently than expected. No JS normalizes them into pixels.

An absent token falls back to the preset. A **present but invalid** token does not magically
fall through the var fallback: native gap becomes its initial normal value (zero used gap
in flex), rather than silently becoming a valid preset. Zero intentionally removes the gap.
The browser handles invalid alignment/justification values likewise; no exception-catching
parser or false validation success is provided.

Each `.mui-flex` sets its own internal preset defaults, so a large outer preset does not
silently turn a nested unspecified container into large. Public custom properties still
inherit normally: explicitly override them, or set them to `initial` to use a nested preset,
when an inherited custom gap/alignment is not desired. Native gap shorthands and application
selectors participate in the ordinary CSS cascade.

## Narrow containers, hidden state and fallbacks

The container has min-inline-size:0/max-inline-size:100%, and **direct element children**
have min-inline-size:0 so native flex shrinking can work. Overflow-wrap:anywhere lets
long text wrap without a measurement routine. No child display, order, font or paint reset
is applied, and no global selector styles unrelated content.

Actual ancestor tracks/items still matter: use minmax(0,1fr) for a constrained grid track,
and appropriate sizing for fixed-width native widgets/images. Wrap=false can overflow by
design; the library does not clip or hide focusable controls. Choose an explicit application
overflow/scroll policy when needed. The demo's nowrap region uses native scrolling and an
application print rule to show its full row on paper.

Hidden roots and direct hidden children stay display:none despite flex/inline-flex styling,
so they do not produce gap slots. The stylesheet does not treat aria-hidden as display:none.
Native templates remain inert until the application clones them. Until-found is not converted
to ordinary hidden by the new CSS. Later children, native property/attribute updates and
reconnects need no component lifecycle, cleanup or pre-upgrade property shim.

Modern native flex-gap is the retained layout baseline. No runtime support detection,
gap polyfill, negative-margin wrapper or generic container-query system is supplied.
An older browser without flex-gap retains native content but may lose spacing; lack of
flexbox falls back to normal native flow. A generic CSS gap-support check is not claimed
to prove flex-gap support. Applications needing older-browser spacing should choose and
test a separate authored fallback, not assume a hidden library detector exists.

No animation/transition, focus reset or forced-color opt-out is provided. Native controls,
list markers and text remain usable for print/forced colors/reduced motion. Custom overflow,
dimensions and print styles are application-owned, not all-browser layout certification.

## API tracker and numbered acceptance

🟢 Verified **native/CSS adaptation**, not a compatible Vue prop/slot/type export.
⏭️ Intentionally omitted framework/order contract.

| Upstream item | Native target | Status / limits |
| --- | --- | --- |
| align | --mui-flex-align / native align-items. | 🟢 Browser CSS vocabulary, no JS string adapter. |
| inline | Presence of data-inline. | 🟢 Native inline-flex, no semantic change. |
| justify | --mui-flex-justify / native justify-content. | 🟢 Default start; native distribution/axes. |
| size | Pinned presets or explicit native row/column gaps. | 🟢 Correct [horizontal, vertical] mapping, no numeric/tuple parser. |
| vertical | Presence of data-vertical. | 🟢 Column with nowrap, including when wrap=true is authored. |
| wrap | data-wrap=false opt-out for a row. | 🟢 No reverse-wrap or measurement/controller. |
| default slot | Original native children. | 🟢 No traversal/wrapping/flattening or empty-container removal. |
| Source reverse | Meaningful DOM order remains authoritative. | ⏭️ Visual reversal conveniences omitted to avoid reading/focus divergence. |
| Source FlexAlign | Native align-items values. | 🟢 Source CSS type alias clarified; no library type/runtime export. |
| Source FlexJustify | Native justify-content values. | 🟢 Source CSS type alias clarified; no csstype dependency. |
| Source theme/themeOverrides/builtinThemeOverrides | External CSS/tokens. | ⏭️ Three framework/provider/internal contracts omitted. |

The reference preserves seven original rows plus six explicit source supplements:
**13 rows, 9 Verified ADAPTED native targets and 4 intentional omissions**.

1. [x] Inventory the pinned props/slot, spacing constants, CSS aliases and source-only reverse/themes.
2. [x] Implement a genuinely CSS-only native layout without child or semantic mutation.
3. [x] Map presets/scalar/tuple gaps, vertical/inline/wrap and native alignment/justification.
4. [x] Preserve native lists/controls/order, narrow nesting, hidden roots/items and inert templates.
5. [x] Add no-JS demo and existing-runner source/structure/native/export tests.
6. [x] Validate build/budgets and Chromium dimensions/markers/forms/RTL/zoom/print/coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Space.

### Evidence — 2026-09-08

- `pnpm test -- tests\flex.test.ts`: **11 focused tests passed**.
- `pnpm build && pnpm test`: CSS-only build/budgets and **362 tests passed**
  (11 Flex plus all 351 earlier tests).
- Tests cover original DOM/attributes/order, independent nested presets, axis mapping,
  vertical nowrap/inline mode, native list/link/form/reset/disabled behavior, empty/late/
  reconnected nodes, hidden/templates, no reverse styling and scoped sizing without resets.
- Chromium loaded no scripts/injected styles. Preset row/column gaps were 4/8, 8/12 and
  12/16px. Tuple [20,6] measured 20px between row items and 6px between wrapped rows;
  column items also had a 6px gap, with vertical wrap disabled.
- Inline-flex shrink-wrapped to about 61px. Center alignment and space-between reached
  the native cross-axis center/row edges. Nested small/default gaps remained independent.
  A hidden item contributed no extra gap; a hidden inline root stayed display:none.
- Chromium AX retained the ordered list/listitems and native C./D. markers from type=A,
  start=3. Native Tab followed DOM order and skipped the disabled button. Reset restored the
  input; real submit navigated through GET to `flex.html?name=Accepted#destination`.
- At 960/480/320/280px, grid-nested long text wrapped without document overflow or clipping.
  RTL placed the first DOM item at the right with the expected 16px gap. At 200% CSS zoom
  in a wide viewport, tuple gaps scaled from 20/6px to 40/12px; narrower layouts naturally rewrapped.
- Live CSS values 0px/-1px/invalid/1.5rem produced used gaps 0/0/0/24px, with invalid values
  computing to normal rather than a preset. A native scalar gap:10px set both axes to 10px.
- Forced colors retained native focus; no animation/transition ran. Print retained tuple
  gaps, list markers and hidden roots; the demo's scroll row printed completely. In-memory
  A4 PDF generation without backgrounds returned a valid 38,688-byte PDF; no file was written.
- Late actions and reconnects retained original nodes/listeners. CSS-before/after-legacy
  checks preserved exact markup, outside styles and tuple gaps; legacy row/stack/wrap kept
  their original flex directions/wrapping and 8px small gap. No Flex registration/global
  appeared. Only the task browser tab was used.
- **CSS: 1,006 raw / 390 gzip bytes, under its 1,000-byte ceiling.**
  Core remains **14,611 / 15,000 gzip bytes**, without a dependency or JS bundle added.
- Reference validation preserved all seven original name/source rows plus six explicit
  source supplements: **96 pages, 3,128 rows, 384 tasks (72 accepted), 743 relative file links**.

This is retained native/CSS scope, not older-browser gap, reverse-order, arbitrary widget
sizing or all-browser/AT certification. Space is next through coordinator selection, then
Grid and Layout; P2-04/P2 and remaining content/cross-phase work are not complete.
