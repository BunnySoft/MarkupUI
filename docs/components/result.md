# Result

**Migration status: 🟢 Verified for retained native outcome composition.**
Result is authored outcome text, optional artwork/content and native recovery actions with
external CSS. It performs no HTTP handling, navigation, retries or automatic announcements.

## Loading and source boundary

| Asset | Purpose |
| --- | --- |
| `src/components/result/result.css` | Maintained isolated stylesheet. |
| `dist/markup-ui-result.css` | Browser stylesheet. |
| `@dataengine/markup-ui/result/style.css` | Stylesheet-only package export. |
| `demo/components/result.html`, `.css`, `.js` | Native variants/artwork and optional application retry-intent feedback. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-result.css">
```

There is no `./result` JS export, constructor, registration or loading-order requirement.
Empty/Thing conventions informed the layout, but no Empty, Thing, Button or Icon stylesheet/
runtime is imported. The unchanged aggregate/plugins do not acquire a Result definition.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/result),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md),
[Result source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/src/Result.tsx),
[presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/src/styles/index.cssr.ts)
and [size constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/styles/_common.ts),
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/result.md) preserves **seven original rows**
and adds **four explicit source-only type/theme entries**: **7 Verified adapted targets and
4 Intentionally omitted contracts**. Built-in vendor illustration selection is also
deliberately replaced by authored icon content, not claimed as asset/pixel parity.

## Native anatomy and meaning

```html
<section class="mui-result" data-status="success" aria-labelledby="saved-title">
  <div class="mui-result-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 12 5 5 11-12" fill="none" stroke="currentColor" stroke-width="2"></path>
    </svg>
  </div>
  <div class="mui-result-header">
    <h2 class="mui-result-title" id="saved-title">Success — settings saved</h2>
    <p class="mui-result-description">Your changes are ready.</p>
  </div>
  <div class="mui-result-content">Optional authored details.</div>
  <div class="mui-result-footer">
    <a href="./home.html">Return home</a>
    <button type="button">Review changes</button>
  </div>
</section>
```

Choose a native section/article only when its semantics fit; generic `div.mui-result`
works equally well. Authors choose actual heading levels and any contextual landmark name.
The stylesheet adds no roles, ARIA labels, live regions or generated heading. Use clear
visible status words and a useful message: color or an illustration must not carry the
outcome alone.

The four direct layout regions are icon, header, content and footer; header contains
title/description nodes. These are authored anatomy, not additional slot APIs. Public
slots are only default, footer and icon—there is no separate action/header/description
slot or alignment prop. Footer can hold independent actions or ordinary footer information.

Decorative artwork should be `aria-hidden="true"` and non-focusable. For meaningful custom
artwork, provide its own image alt or SVG name rather than duplicating the outcome heading
as another ARIA label. Preserve native SVG namespace when creating replacements manually.
The demo uses original simple geometric SVGs and authored code text, not upstream/vendor
assets or a status-illustration package.

## Properties, defaults and explicit omissions

| Upstream surface | Native target and boundary |
| --- | --- |
| `description` | Authored `.mui-result-description` text/nodes. No description attribute renderer. |
| `title` | Authored `.mui-result-title` heading/text. No tooltip mapping or inferred heading level. |
| `status` | `data-status` selects info/success/warning/error icon colors. 404/403/500/418 inherit the neutral text color for authored artwork/code symbols. Absent/unknown values use the native info palette. |
| `size` | `data-size` small/medium/large/huge; absent/unknown values use medium. |
| Default slot | Actual `.mui-result-content` children, including rich text, nested results or native forms. |
| Footer slot | Actual `.mui-result-footer` children; no generated retry/home actions or route/history policy. |
| Icon slot | Authored `.mui-result-icon` SVG/image/symbol content. No automatic icon selection or component callback. |
| Source `ResultSize` | ⏭️ Exported framework TypeScript alias omitted; CSS size vocabulary is covered by `size`. |
| Source `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ Runtime/provider theme object contracts omitted; external CSS tokens instead. |

Upstream defaults status to info and merged size to medium; it has no automatic title or
description text defaults. It does generate a status-specific icon/illustration when no
icon slot is supplied. **This native target generates none of those nodes**: author the
message and icon explicitly, or omit the icon. The palette does not choose an SVG, replace
text or inspect an HTTP response. Changing only `data-status` does not turn an error message
into a success message; application code must keep content and presentation consistent.

The four HTTP-like status strings are visual variants, not network status handlers.
Their authored neutral code symbols remain deliberate alternatives to upstream multi-color
illustrations. The previous invented red-500/purple-418 tints are no longer defaults.
No vendor asset, router, timer, fetch, observer or
VDOM dependency is hidden behind them.

Strings map to authored native text; dynamic plain strings can use `textContent`.
No render/prop schema is interpreted. Omitted or hidden regions create no placeholder.
An empty root stays empty, including when given a status attribute. Deliberately authored
empty regions remain nodes and can still contribute their region margins.

## Size, alignment and styling

The native pixel dimensions now follow the pinned size constants independently of the
root font size. Explicit author tokens may still use rem units if preferred:

| Size | Icon box | Title text | Body text |
| --- | --- | --- | --- |
| small | 64px | 26px | 14px |
| medium | 80px | 32px | 14px |
| large | 100px | 40px | 15px |
| huge | 125px | 48px | 16px |

Spacing now follows rendered upstream defaults: 16px above an authored title, 4px above
an authored description, and 24px above authored content/footer regions. These margins
also apply when earlier regions are omitted. There is no blanket grid gap. The title
defaults to weight 500 and Result text to line-height 1.6. Header text, icon and footer
content are centered by default, including wrapped footer text; main content uses logical start alignment.
Native CSS—not an invented `align` prop—can select start/end alignment.

Tokens: `--mui-result-gap`, `--mui-result-align`, `--mui-result-footer-justify`,
`--mui-result-action-gap`, `--mui-result-icon-size`, `--mui-result-icon-color`,
`--mui-result-title-size`, `--mui-result-title-weight`, `--mui-result-title-color`,
`--mui-result-font-size`, `--mui-result-line-height` and `--mui-result-color`.
`--mui-result-gap` overrides title/content/footer margins together; without it, the
16px/24px defaults differ intentionally. Description margin remains 4px and can be
customized through ordinary authored CSS. Supply valid external CSS values.
Private `--_mui-result-*` presets are not API. Nested Results reset status/size/alignment
presets; intentional public color/gap overrides and native direction may inherit.

Set `data-mui-theme="dark"` on the root or an ancestor for explicit dark defaults;
nested `data-mui-theme="light"` resets them. Light body/title colors are `#333639` /
`#1f2225`; dark colors are white at `.82` / `.9`. Semantic icons use normal severity
colors (light `#2080f0/#18a058/#f0a020/#d03050`, dark
`#70c0e8/#63e2b7/#f2c97d/#e88080`), not Alert's dark supplemental colors.
Legacy global text roles are not substituted for these different Result roles.
This stylesheet does not change native form controls' `color-scheme`.

Direct icon media scale into the icon box with contained fitting; authored src/alt/namespace/
width attributes and nodes are not rewritten. `.mui-result-symbol` is a local helper for
authored code/glyph text, not a generated status label. Long text and footer controls wrap
in DOM order with logical RTL behavior; no overflow menu or clipping controller is added.
The stylesheet adds no panel borders/backgrounds; demo panel decoration is application CSS.
Authored icon content is still required. Result's icon-region color can tint a custom
`currentColor` SVG; upstream's custom icon slot does not automatically receive its built-in
icon tint. Use `--mui-result-icon-color` or explicit artwork colors for your desired result.

See the [rendered Result visual audit](../style-audit/components/result.md) for the
measured geometry, palette, authored-artwork boundary, budget and remaining limitations.

## Native actions, hidden content and fallback

Use actual hrefs and typed buttons. Do not make the whole Result a clickable-looking host,
nest interactive controls inside another action root, or simulate disabled links with
pointer-only styling. Native labels, focus, disabled/fieldset state, validity, form
association and reset/submission remain unchanged.

The demo places a native form in content with submit/reset controls associated from the
footer. Application JS only reports that retry intent was received; it sends no request,
changes no outcome automatically and adds no live announcement. With JS disabled, native
GET submission/reset and home navigation still work. Real retry/back/home policy belongs
to the application, not Result.

Hidden roots/regions/templates remain hidden/inert. Standalone CSS does not force
`hidden="until-found"` to display:none; that reveal behavior is not separately certified.
Print requests unbroken result groups where possible, and forced colors retain readable
text/icons while visible status messages remain authoritative. No animation, lifecycle
cleanup or observer is necessary for this passive composition.

## Migration steps and acceptance

1. [x] Author native heading/description/icon/content/footer regions without generated semantics.
2. [x] Retain the eight status values and four sizes with explicit text and artwork ownership.
3. [x] Ship independent scoped palettes, dimensions, logical alignment and wrapping CSS.
4. [x] Verify native recovery controls/forms, sparse/hidden/nested content and browser fallback.

### Initial migration acceptance — 2026-09-08 (historical appearance)

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**516 tests**, including **12 Result cases**. Chromium acceptance exercised:

- Native heading/region/control names, visible status text and decorative icon exclusion;
  meaningful custom SVG/image names and author icon replacement kept native namespaces.
- All eight palettes; 64/80/100/125px icon boxes, 26/32/40/48px headings and 14/14/15/16px
  body sizes; native center/start/RTL alignment and independent nested defaults.
- Live presentation changes preserved original nodes/listeners and did not rewrite messages.
- Native Tab order, focus, email validity, one associated form submission, reset, disabled
  exclusion and real home-anchor navigation. No automatic HTTP/retry behavior occurred.
- Missing icons/regions, empty roots, hidden content/templates, 280px/320px widths and
  200% CSS zoom without root/footer/document horizontal overflow; print/forced colors.
- Aggregate/widgets/advanced coexistence without any Result definition or node replacement.
- JavaScript-disabled native reset/GET submission and home navigation, with the authored
  error message still intact rather than a fabricated success outcome.

CSS is **3,632 bytes / 879 gzip bytes**, below its new **1,000-byte** ceiling.
Component JS is **0 bytes**. Demo JS is **302 / 228 gzip bytes**, demo CSS **1,154 / 548**.
Core remains **14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes,
with unchanged outputs/ceilings and zero runtime dependencies. This is not all-browser,
screen-reader speech, browser-UI zoom, vendor illustration or framework/pixel parity.

### Visual-default audit — 2026-09-10

- `pnpm test -- tests\result.test.ts`: **13 tests passed**.
- Twenty cases in each light/dark theme matched reference host and icon-box geometry,
  title/description/content/footer typography and spacing. The same geometry checks
  passed in RTL; original authored artwork remains intentionally different.
- Title top changed **104→96px**, weight **600→500**, description-only height
  **125→106.391px**, and footer-only height **21→46.391px**.
- At a 20px root font, the old default icon/title/body sizes became 100/40/17.5px;
  corrected sizes stay **80/32/14px**, matching upstream.
- Author overrides, nested theme reset, legacy CSS loaded afterward, node identity,
  hidden/empty roots and native keyboard submit/reset behavior were verified.
- Result remains CSS-only, **996 gzip bytes under the unchanged 1,000-byte ceiling**,
  with zero component JS and zero dependencies. Compact source formatting keeps the
  actual fixes within that ceiling; no build gate was relaxed. The coordinated
  full build and all **13 Result tests** pass.
