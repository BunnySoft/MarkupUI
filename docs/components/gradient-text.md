# Gradient Text

**Migration status: 🟢 Verified retained native HTML/CSS scope.**
**Architecture: CSS-only.** Original authored text is decorated by one external stylesheet.
There is no Custom Element, JavaScript export, gradient-object adapter, renderer, measurement,
asset loader, animation dependency or registration lifecycle.

## Pinned reference and loading

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/gradient-text)
- [Public props, default slot and gradient fields](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md)
- [Implementation and source-only aliases/theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/GradientText.tsx)
- [Source presentation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/src/styles/index.cssr.ts)
- [Source theme defaults](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/styles/light.ts)

The public page has three props, one content slot and three gradient record fields.
Six explicit source supplements record `fontSize`, `color`, the `danger` compatibility
type value and three theme contracts. There is no public weight prop: weight is a theme
presentation value, mapped here to ordinary CSS.

| Asset | Purpose |
| --- | --- |
| `src/components/gradient-text/gradient-text.css` | Maintained opt-in stylesheet. |
| `dist/markup-ui-gradient-text.css` | CSS-only browser distribution. |
| `@dataengine/markup-ui/gradient-text/style.css` | Package stylesheet export. |
| `demo/components/gradient-text.html`, `.css` | Separate native demo files; no script. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-gradient-text.css">
<h1><span class="mui-gradient-text">Original native heading text</span></h1>
<p><span class="mui-gradient-text" data-type="info">Original native text</span></p>
```

Serve/copy the stylesheet through your normal asset mechanism. There is no `./gradient-text`
JavaScript export, classic global or fake JS budget. CSS may load before or after the unchanged
legacy aggregate; there is no custom-element registration or conflict rule for this passive feature.

## Presentation contract

Apply `.mui-gradient-text` to the actual native text element. `data-type` and existing
`data-mui-theme` scopes select CSS presets; native `font-size` sets size, including responsive
CSS expressions. Enhanced clipping now establishes an inline-block paint box, matching the
reference's text/gradient bounds. No default size, heading level, line height, document
language or direction is assigned. Native margins remain authored; use a span inside a
heading when the outer heading should retain its block box.
Upstream numeric sizes require explicit CSS units here; no JS converts numbers into pixels.

| Input | Retained CSS contract |
| --- | --- |
| `data-type` | `primary`/absence, `info`, `success`, `warning`, `error`; source `danger` aliases error. Unknown values leave the base primary palette. |
| `--mui-gradient-text-from` | Native CSS color for the first endpoint; defaults to the selected palette. |
| `--mui-gradient-text-to` | Native CSS color for the last endpoint; defaults to the selected palette. |
| `--mui-gradient-text-angle` | Native CSS angle, default `252deg`; use units, including `0deg`. |
| `--mui-gradient-text-image` | Complete native CSS background-image, such as a multi-stop linear gradient; overrides endpoint construction. |
| `--mui-gradient-text-surface` | Opaque canvas color for the default light fade, default `#fff`; see compositing below. Does not rewrite custom images/endpoints. |
| `--mui-gradient-text-fallback` | Solid foreground color; darker selected-palette color in light, readable normal severity color in dark. |
| `--mui-gradient-text-weight` | Native font weight, default `500`. |
| Author `font-size` / `color` | Normal CSS cascade; no runtime `size`, `fontSize` or `color` property adapter. |

```html
<span class="mui-gradient-text campaign-text">Selectable campaign text</span>
```

```css
.campaign-text {
  font-size: clamp(1.25rem, 3vw, 2rem);
  --mui-gradient-text-weight: 600;
  --mui-gradient-text-from: #2458a8;
  --mui-gradient-text-to: #8f276a;
  --mui-gradient-text-angle: 90deg;
  --mui-gradient-text-fallback: #243f76;
}
```

The upstream string gradient maps to a native CSS image declaration. Its object members map
to the endpoint/angle tokens, **not** a parsed object. Upstream object gradients default to
zero degrees; set `0deg` explicitly when translating that case. This stylesheet's general
theme default is 252deg. Native CSS grammar/cascade validates values; there is no broad
exception handler, coercion, formatter or unsupported-value success report.

Source `size || fontSize` and `color || gradient` precedence are not runtime APIs here:
choose one final CSS declaration rather than assigning either framework alias. Native CSS
can update dynamically through application-authored classes/styles without a controller.
Custom tokens inherit normally; override them on nested independently decorated text if needed.

### Theme stops and light-surface compositing

The angle remains `252deg`, with explicit 0%/100% stops. Light defaults fade from the
selected semantic color at 60% over an opaque canvas to its full color. Dark defaults
run from normal severity color to supplemental severity color:

| Type | Light full color | Dark start → end |
| --- | --- | --- |
| primary / success | `#18a058` | `#63e2b7` → `#2a947d` |
| info | `#2080f0` | `#70c0e8` → `#3889c5` |
| warning | `#f0a020` | `#f2c97d` → `#f08a00` |
| error / danger | `#d03050` | `#e88080` → `#d03a52` |

Use `data-mui-theme="dark"` on the text or an ancestor; nested light scopes reset defaults.
Correct shared light semantic colors are reused, but no shared theme file is required.

Upstream's light start is genuinely translucent. This native stylesheet deliberately
precomposites that default start with `--mui-gradient-text-surface` using `color-mix`,
and interpolates in sRGB. This preserves the solid safety underpaint below without
darkening the intended light fade. On a nonwhite **opaque** canvas, supply its color:

```css
.warm-canvas {
  background-color: #ead8c4;
  --mui-gradient-text-surface: #ead8c4;
}
```

No background sampling occurs. An omitted/mismatched surface, image backdrop or translucent
custom gradient is not automatically reproduced as upstream transparency. The rendered
default-white cases differed by at most 2 RGB channel levels from upstream; the tested
explicit colored surface by at most 3. Dark opaque defaults/custom opaque images matched
exactly in the audited cases.

For deliberately exact alpha compositing, author the actual translucent endpoints and
override only `background-color: transparent` on the gradient text. That explicit override
disables the in-enhancement missing-image underpaint safeguard, so use it only with a valid
gradient and verified contrast. Print/forced-color restoration still applies.

## Readable fallback and nested text

The base rule always supplies ordinary nontransparent `color` and
`-webkit-text-fill-color:currentColor`. Gradient clipping is enabled only inside an
`@supports` guard for text clipping and transparent text-fill support. Only enhanced glyph
fill becomes transparent; ordinary `color` never does.

Enhanced text has a **solid `background-color:currentColor` underpaint** beneath its gradient.
A missing/invalid gradient image or explicit `--mui-gradient-text-image:none` therefore leaves
solid clipped text instead of empty transparent glyphs. This does not repair an author-selected
transparent/low-contrast foreground, deliberate background override or malformed custom CSS.
Use native gradients rather than remote image assets; the library has no asset URLs or loader.

- **Unsupported enhancement:** normal solid foreground remains. No feature polyfill is loaded.
- **Forced colors:** remove backgrounds, restore system CanvasText/LinkText foreground and
  currentColor text fill; do not disable browser forced-color adjustment.
- **Print:** remove backgrounds and restore black foreground/text fill, even when background
  graphics are disabled. These scoped safety overrides intentionally use `!important`.
- **Selection:** use system Highlight/HighlightText rather than transparent selection glyphs.
- **Nested content:** nongradient descendants restore their own currentColor text fill.
  Native links/code/strong/em text therefore stays solid, not invisibly dependent on an
  ancestor's clipped painting context. Opt a child into `.mui-gradient-text` when it should
  own a separate gradient. Replaced content such as inline SVG keeps its own native paints;
  there is no shape/fill/stroke reset.

Normal wrapping is retained, unlike the source's nowrap presentation. `max-inline-size:100%`
and `overflow-wrap:anywhere` keep the enhanced paint box within a narrow container.
Box-decoration-break cloning remains available for fragmentation where supported. Gradient
continuity across wrapped lines/nested elements is browser painting behavior, not
pixel-identical upstream rendering.

No automatic contrast guarantee is made: test every gradient stop, solid fallback and actual
background at the text size/weight used. Essential status must not depend on gradient color
alone. Print/forced-color overrides preserve words, not brand appearance. Application CSS,
browser printing preferences and physical output can change results.

## Semantics, ownership and scope

Text is still original, selectable/searchable native content; no duplicated generated text,
HTML parsing or format engine exists. Use real h1–h6/p/a/em/strong semantics deliberately.
CSS adds no roles, heading hierarchy, `aria-hidden`, live region, tabindex or interaction.
Keep explicit native accessible names/ARIA and language/direction on the semantic owner.

Native links retain href/target/rel, underline, focus and browser activation. This stylesheet
does not remove focus outlines or intercept clicks; the demo adds an application focus-visible
rule. Maintain visible focus and sufficient contrast in your own composition.

Original nodes/listeners/attributes, later content and inert templates stay application-owned.
There is no lifecycle, pre-upgrade property, observer or reconnect cleanup to emulate.
Styles are opt-in; unrelated text is not reset. No motion is supplied, so there is no animation
runtime or reduced-motion override to configure. Code highlighting remains a separate component.

See the [rendered Gradient Text audit](../style-audit/components/gradient-text.md) for exact
measurements, the light compositing tradeoff, author checks and remaining differences.

## API and slot tracker

🟢 Verified **native/CSS adaptation**, not a shipped Vue prop/object API.
⏭️ Intentionally omitted framework/runtime contract.

| Upstream item | Native equivalent | Status / limits |
| --- | --- | --- |
| `gradient` | Native CSS gradient image or endpoint/angle tokens. | 🟢 No runtime string/object adapter. |
| `size` | Author `font-size` with native CSS units/expressions. | 🟢 Native heading size remains intact when absent. |
| `type` | `data-type` palette vocabulary. | 🟢 CSS only; contrast remains author-verified. |
| default slot | Original native text/inline nodes. | 🟢 No rendering, copying or semantic mutation. |
| `gradient.from` | `--mui-gradient-text-from`. | 🟢 Native CSS color. |
| `gradient.to` | `--mui-gradient-text-to`. | 🟢 Native CSS color. |
| `gradient.deg` | `--mui-gradient-text-angle`. | 🟢 Explicit angle units; object-default translation uses `0deg`. |
| Source `fontSize` | Same native `font-size` declaration. | 🟢 Presentation adaptation, not alias prop/precedence implementation. |
| Source `color` | Same native gradient-image/tokens. | 🟢 Presentation adaptation, not source alias or normal CSS color semantics. |
| Source `type: danger` | `data-type="danger"` aliases error palette. | 🟢 Compatibility value, not another prop. |
| Source `theme` | External scoped CSS/tokens. | ⏭️ No provider/theme object. |
| Source `themeOverrides` | External CSS cascade. | ⏭️ No object adapter. |
| Source `builtinThemeOverrides` | Maintained external stylesheet. | ⏭️ No framework/Houdini plumbing. |

All seven original rows remain individually traceable, with six explicit source supplements:
**13 rows, 10 Verified ADAPTED native targets and 3 intentional omissions**.

## Numbered migration steps and acceptance

1. [x] Inventory all public props/slot/inline fields and actual source aliases/theme contracts.
2. [x] Choose native CSS-only text composition with no runtime or synthetic semantic owner.
3. [x] Implement type/size/weight/gradient mapping and solid/unsupported/forced-color/print fallbacks.
4. [x] Preserve selection, native nested content/actions, heading size, wrapping and direction.
5. [x] Add separate no-JS examples and existing-runner CSS/native/export tests.
6. [x] Validate build/budgets and Chromium fallback, print, forced colors, links, zoom and coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Ellipsis.

### Initial migration evidence — 2026-09-08 (historical palette/display)

- `pnpm test -- tests\gradient-text.test.ts`: **8 focused tests passed**.
- `pnpm build && pnpm test`: stylesheet-only distribution/budget checks and **316 tests passed**
  (8 Gradient Text and all 308 previous tests).
- Tests cover CSS-only exports/no registration, native node/listener/attribute ownership,
  foreground/feature guards, print/forced-color restoration, preserved native font sizes,
  direction/links, nested fill safety and absence of animations/assets/generated text.
- Chromium loaded the demo with zero scripts/injected styles. Native h1 remained a 32px
  heading with no role added. Default 252deg/custom 90deg gradients, foreground underpaint
  and missing-image fallback matched the retained contract.
- Native nested strong/code/link text stayed solid. Enter navigated the link, Tab retained
  visible focus, selection returned exact original text, and RTL/narrow unbroken text wrapped.
- Forced-colors removed gradients and restored system colors. Print media restored black
  text. In-memory Chromium A4 PDF generation with `printBackground:false` returned a valid
  95,622-byte PDF; no PDF file was written. This is not physical-printer certification.
- Removing the stylesheet's CSSSupportsRule simulated an unsupported enhancement: ordinary
  foreground/text fill remained and image decoration disappeared. This was a simulated
  fallback in Chromium, not a claim of testing a browser without clipping support.
- 200% CSS zoom exercised wrapping/scaled geometry. Awaited CSS-before/after-legacy checks
  preserved original node/attribute identity and outside styles, with no Custom Element or
  runtime global. Other browser tabs were untouched.
- Reference validation preserved all seven original name/source rows plus six explicit
  source supplements: **96 pages, 3,111 rows, 384 tasks (56 accepted), 715 relative file links**.
  Package/dist checks confirmed the stylesheet export and absence of a Gradient Text JS bundle.
- Core remains **14,611 / 15,000 gzip bytes**, earlier outputs unchanged.
  **Gradient Text CSS: 2,175 raw / 596 gzip bytes, under its 1,500-byte ceiling**.
  No JavaScript bundle or new dependency exists.

### Visual-default audit — 2026-09-10

- `pnpm test -- tests\gradient-text.test.ts`: **9 tests passed**.
- Nineteen nonwrapping cases matched reference font/box metrics in both themes and RTL.
  Default weight changed **700→500**, width **87.219→83.344px**, and paint-box height
  **19→22.391px**, without setting a default font size.
- All six semantic values, inherited/numeric/rem/responsive sizes, heading text,
  252°/90°/0° and custom multi-stop images were actually rendered.
- Sixteen ordinary dark cases and three opaque custom light-gradient cases were
  pixel-identical. The safe light composites retain the small RGB differences above;
  no blanket transparency/pixel parity is claimed.
- Native text/selection/link activation, nested light reset, image-none/invalid safeguards,
  explicit raw-alpha override, legacy stylesheet order, print, forced colors and simulated
  unsupported clipping were verified.
- CSS is **961 / unchanged 1,500 gzip bytes**, with zero component JS/dependencies.
  The coordinator's isolated release build and all **9 Gradient Text tests** pass;
  no shared source or generated adapter was edited.

This is retained native/CSS scope, not all-browser/AT, automatic contrast or universal
pixel certification. No next component is introduced by this audit.
