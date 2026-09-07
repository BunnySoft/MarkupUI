# Icon and IconWrapper

**Migration status: 🟢 Verified retained native HTML/CSS scope.**
**Architecture: CSS-only.** Icon composition needs no Custom Element, JavaScript entry,
component-constructor adapter, asset loader, observer or runtime icon dependency.
The original native SVG/image/text nodes are the implementation.

## Pinned API and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Icon documentation, including IconWrapper](https://www.naiveui.com/en-US/os-theme/components/icon)
- [Public props and Icon content slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md)
- [Icon source and Depth alias](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/Icon.ts)
- [Icon styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/src/styles/index.cssr.ts)
- [IconWrapper source and default content](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon-wrapper/src/IconWrapper.tsx)

The public page has four Icon props, four IconWrapper props and one Icon slot. Source
supplements explicitly record the string-capable Depth alias, IconWrapper's default content
and three theme contracts for each owner. No undocumented tag prop or extra catalog route
is invented; source `i`/`div` and automatic role defaults are replaced by author-selected
native markup, not a runtime tag renderer.

| Asset | Purpose |
| --- | --- |
| `src/components/icon/icon.css` | Maintained Icon/IconWrapper stylesheet. |
| `dist/markup-ui-icon.css` | CSS-only distribution. |
| `@dataengine/markup-ui/icon/style.css` | Package export for both native compositions. |
| `demo/components/icon.html`, `.css` | No-JavaScript demo with original minimal SVG/glyphs. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-icon.css">
```

Copy/serve the package CSS export using your asset mechanism. There is no `./icon` JS export,
ESM/classic runtime, runtime global, Custom Element registration rule or fake JS bundle
budget. CSS can load before or after the unchanged legacy aggregate and Typography stylesheet.
The library does not import, fetch, generate from a catalog, or license third-party icon assets
on the application's behalf.

## Native graphic sizing and color

Use `.mui-icon` on a neutral native span/i or directly on an authored SVG/image:

```html
<span class="mui-icon action-graphic" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 12h15M13 6l6 6-6 6"></path>
  </svg>
</span>
```

```css
.action-graphic {
  --mui-icon-size: 24px;
  --mui-icon-color: #175fbb;
}
```

Size is one em by default, inheriting the current font size. `--mui-icon-size` takes ordinary
CSS lengths such as `24px`, `1.5rem` or a valid CSS expression. Numeric upstream values map
to explicit CSS units; no JavaScript interprets a `size` attribute or coerces bare data values.

For predictable wrapper sizing, put a single SVG/image directly inside the neutral
`.mui-icon` span/i. Direct asset sizing is **not** a recursive SVG selector: nested SVG
viewports and shape dimensions are not reset. Direct SVG/image `.mui-icon` also works;
its descendant SVG viewports are untouched.

### Paint and aspect-ratio rules

- The stylesheet never assigns `fill`, `stroke`, stroke width or individual path styles.
  Multicolor and stroke-only assets retain their original paint instructions.
- `--mui-icon-color` controls inherited CSS `color`; an asset opts into recoloring by
  explicitly authoring `fill="currentColor"` or `stroke="currentColor"`. A fixed fill/stroke
  remains fixed. Direct SVG `color` attributes and author inline color styles are preserved.
- Unlike upstream's broad `fill:currentColor`/descendant SVG rules, no blanket paint reset
  is used. Assets with omitted fill retain native SVG defaults.
- Supply a correct `viewBox` for scalable SVG. The CSS does not invent one, rewrite path
  geometry, change `preserveAspectRatio` or repair malformed artwork.
- Square icon layout does not mean stretching artwork: SVG's authored preserveAspectRatio
  policy remains native, and images use `object-fit:contain`. An explicit SVG
  `preserveAspectRatio="none"` remains the author's stretching choice.
- Native `src`, alt, width/height metadata, SVG title/description nodes and IDs remain intact.
  CSS opt-in changes the rendered icon box, not the attributes. Missing-image behavior is
  native; provide alt/adjacent text and fallback policy as appropriate.

The demo's arrows, check, circles and rectangles are original small native examples, not
copied vendor assets. Consumers provide any other appropriately licensed assets themselves.

## Depth and IconWrapper

`data-depth="1|2|3|4|5"` on `.mui-icon` selects graphic opacity:
**1 / .8 / .6 / .4 / .2**. Tokens `--mui-icon-depth-1` through `--mui-icon-depth-5` customize
them. Absence does not reset an authored SVG opacity. This is a deliberate CSS adaptation:
depth affects the entire SVG/image/glyph graphic, not only upstream SVG descendants, and
does not force a base paint color.

Depth is visual de-emphasis, not meaning, disability or an accessible label. Avoid low
opacity for essential icon-only controls; verify contrast in the actual context.
Forced-colors mode restores depth opacity to one and gives wrappers a system-color edge,
without disabling the browser's forced-color adjustment or rewriting SVG paints.

IconWrapper is an ordinary `.mui-icon-wrapper` element:

```html
<span class="mui-icon-wrapper badge-graphic" aria-hidden="true">
  <span class="mui-icon">✓</span>
</span>
```

```css
.badge-graphic {
  --mui-icon-wrapper-size: 40px;
  --mui-icon-wrapper-radius: 50%;
  --mui-icon-wrapper-background: #edf0fa;
  --mui-icon-wrapper-color: #7040a0;
  --mui-icon-size: 24px;
}
```

Wrapper defaults are **24px** square, **6px** radius, primary-colored background and white
inherited icon color. Its tokens are `--mui-icon-wrapper-size`,
`--mui-icon-wrapper-radius`, `--mui-icon-wrapper-background` and `--mui-icon-wrapper-color`.
Icon size and wrapper size are independent, as in the source composition. A wrapper does
not recolor fixed-paint artwork.

## One accessible owner

CSS adds no role, name, live region, tabindex, click handler or keyboard behavior.
Unlike source Icon's automatic `role="img"`, meaningful/decorative semantics are explicit.

**Icon-only native action: name the action once and hide its graphic.**

```html
<button type="button" aria-label="Save">
  <span class="mui-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m5 13 4 4L20 5"></path>
    </svg>
  </span>
</button>
```

Do not put `aria-hidden` on a wrapper containing the actual button/link. Do not add a second
meaningful image name to a decorative graphic inside an already named action.
Use explicit `type="button"` for a nonsubmitting action; the library never rewrites form type.

**Meaningful standalone SVG: let the SVG own its name/description.**

```html
<svg class="mui-icon" role="img" aria-labelledby="icon-title" aria-describedby="icon-description"
     viewBox="0 0 24 24">
  <title id="icon-title">Two circles</title>
  <desc id="icon-description">Original overlapping colored shapes.</desc>
  <circle cx="8" cy="12" r="6" fill="#e85d4a"></circle>
  <circle cx="16" cy="12" r="6" fill="#3388cc"></circle>
</svg>
```

Use unique IDs in repeated application-owned artwork. Native images use alt text; a meaningful
text glyph may use one explicit native image role/name where needed. Do not duplicate that
name on both wrapper and asset.

Native button/link focus and activation remain native. When `.mui-icon-wrapper` is deliberately
applied to a native button or href-bearing anchor, CSS supplies a visible focus outline with
`--mui-icon-focus-color`; it still supplies no interaction. The default 24px wrapper is a
graphic size, not a recommended touch target—use an adequately sized native action around it.
No hover-only affordance, disabled emulation, focus trap or router integration is included.

## Content, CSS scope and lifecycle

Only opt-in classes and their direct neutral-wrapper assets are styled. Unrelated SVGs,
nested SVG geometry, text language/direction, native selection and arbitrary document
attributes are untouched. Normal CSS automatically handles later native content and zoom;
there are no fake pre-upgrade/reconnect or disposal APIs.

Native templates remain application-owned/inert. CSS performs no cloning, HTML evaluation,
asset lookup or fetching. No animation/transition is supplied; no reduced-motion controller
is necessary. Custom native animations remain the author's separate choice.

## API and slot tracker

🟢 Verified native/CSS adaptation · ⏭️ Runtime/framework contract intentionally omitted.

| Upstream item | Native equivalent | Status / limits |
| --- | --- | --- |
| Icon `color` | External `--mui-icon-color` / inherited currentColor. | 🟢 No fill/stroke reset; explicit native paints remain authoritative. |
| Icon `depth` | `.mui-icon[data-depth="1..5"]` and opacity tokens. | 🟢 Entire-graphic opacity adaptation, with forced-colors visibility fallback. |
| Icon `size` | External CSS length in `--mui-icon-size`; default inherited 1em. | 🟢 No JS number/unit parser or runtime attribute interface. |
| Icon `component` | Author native SVG/image/glyph content. | ⏭️ Component-constructor/render adapter and icon-package import omitted. |
| IconWrapper `border-radius` | `--mui-icon-wrapper-radius`, default 6px. | 🟢 Native wrapper shape. |
| IconWrapper `color` | `--mui-icon-wrapper-background`. | 🟢 Native wrapper background. |
| IconWrapper `icon-color` | `--mui-icon-wrapper-color`. | 🟢 Inherited color only, not overriding fixed SVG paint. |
| IconWrapper `size` | `--mui-icon-wrapper-size`, default 24px. | 🟢 Wrapper dimension independent of asset size. |
| Icon default slot | Original native asset/text child. | 🟢 No cloning or slot/render runtime. |
| Icon `Depth` source alias | CSS data values 1–5 naturally represented as strings. | 🟢 Source-only type clarified; no fictional JS type/runtime export. |
| IconWrapper default source slot | Original native wrapper children. | 🟢 Companion content supported by normal HTML. |
| Icon and IconWrapper theme/themeOverrides/builtinThemeOverrides | External CSS/custom properties. | ⏭️ Six explicit grouped source theme contracts omitted. |

The reference retains all nine public rows plus eight explicit source supplements:
**17 rows, 10 Verified adapted targets and 7 intentional omissions**. No nonexistent tag
prop or lifecycle API is counted as implemented.

## Numbered migration steps and acceptance

1. [x] Inventory all Icon/IconWrapper props/content and meaningful source-only declarations.
2. [x] Choose CSS-only native composition with no asset/runtime dependency or synthetic roles.
3. [x] Implement inherited sizing/color, five depths and independent wrapper geometry.
4. [x] Preserve viewBox/aspect/paint/nested SVG and explicit accessible owners/native actions.
5. [x] Add original no-JS HTML/CSS examples and existing-runner native/source/packaging tests.
6. [x] Verify build/budgets and Chromium geometry, semantics, forced colors, zoom and coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Gradient Text.

### Evidence — 2026-09-08

- `pnpm test -- tests\icon.test.ts`: **8 focused tests passed**.
- `pnpm build && pnpm test`: CSS-only export/copy/budget and **308 tests** passed
  (8 Icon plus all 300 previous tests).
- Tests cover absence of fake JS/export/registration, exact native SVG/title/desc/paint
  attribute preservation, direct/nested SVG scope, native actions/links, hidden states,
  language/direction and forced-color/no-animation rules.
- Chromium's example loaded no scripts or injected styles. CurrentColor strokes, explicit
  SVG color, fixed multicolor fills and authored opacity remained correct. Nested viewport
  attributes/base lengths/painted bounds stayed 20×10; no descendant sizing reset occurred.
- Native viewBox/preserveAspectRatio and a 40×20 intrinsic image with contain fitting were
  preserved. Wrapper 24px/6px defaults, custom 40px/circular wrapper and five opacity levels passed.
- A standalone SVG had one explicit image name; native icon-only Save/Next actions had their
  own names. Enter/Space activated the native button once each; Tab showed a 2px link focus
  outline and Enter navigated normally.
- Forced-colors mode restored opacity and a visible system-color wrapper edge. At 200% CSS
  zoom, a 40px icon rendered at 80px. RTL metadata remained native.
- Awaited CSS-before/after-legacy checks preserved original nodes/attributes, fixed paints,
  outside SVG size and late inherited 16px sizing. No Icon/IconWrapper Custom Element or
  runtime global appeared. Unrelated tabs were untouched.
- Reference validation retained nine original rows plus eight explicit source supplements:
  **96 pages, 3,105 rows, 384 tasks (52 accepted), 708 validated relative file links**.
  Package/dist checks confirmed CSS-only export and no Icon JS distribution.
- Core remains **14,611 / 15,000 gzip bytes**, earlier outputs unchanged.
  **Icon/IconWrapper CSS only: 609 gzip bytes / 1,000 ceiling**; no fake JS budget exists.

This is native/CSS retained scope, not vendor-asset/theme/pixel or all-browser/accessibility
certification. Chromium was exercised; actual asset quality, viewBoxes, contrast, names,
touch targets and platform forced-color rendering remain application responsibilities.
Gradient Text is next only through coordinator selection; it is not started here.
