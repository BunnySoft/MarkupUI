# Result visual-default audit

Date: 2026-09-10. Scope: stylesheet-only native Result. No constructor, generated
artwork/message, dependency, binding/template change or shared stylesheet edit.

## Reference and method

- Pinned Naive UI: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Actually rendered packages: `naive-ui@2.45.3`, `vue@3.5.30`, using `NResult`
  inside an explicit light/default or dark `NConfigProvider`.
- Inspected `src/result/src/Result.tsx`, its CSSR layout, and light/dark/common themes.
  No upstream illustration path data was copied into MarkupUI.
- Chromium private contexts; 900×3400 viewport, device scale 1, 360px results in a
  two-column fixture, matching system font and surrounding 14px/1.6 typography.
- Twenty cases per theme: all eight statuses; small/large/huge in addition to default
  medium; title-only, description-only, icon-only, no-icon, no-header, footer-only,
  explicit custom SVG, wrapped title/description, and wrapped footer.
- The reference uses its real built-in icons/illustrations. Native semantic examples
  use independently authored geometric SVGs; HTTP-like examples use authored code
  text. An additional fixed-fill SVG is identical in both custom-icon cases.
- Session `files/result-style-audit` retains fixture sources, CSS snapshots,
  `measurements.json`, and before/reference/after screenshots. Fixture dependencies
  are not part of the shipped component.

The comparison validates actual rendering, not source-only inferred values. All forty
LTR cases, and the twenty-case RTL matrix, match host/icon **box geometry** and the
captured non-icon text/region metrics after the changes. Illustration identity and
unused inherited SVG font properties are not included in that statement.

## Measured layout and typography

At default medium size, in pixels unless noted:

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Full result height | 267 | 266.359 |
| Title top | 104 | 96 |
| Title height | 48 | 51.188 |
| Title weight | 600 | 500 |
| Description top | 156 | 151.188 |
| Description height | 21 | 22.391 |
| Content top | 201 | 197.578 |
| Footer top | 246 | 243.969 |
| Title-only height | 152 | 147.188 |
| Description-only height | 125 | 106.391 |
| No-icon full-result height | 163 | 186.359 |
| No-header height | 170 | 172.781 |
| Footer-only height | 21 | 46.391 |
| Wrapped title/description height | 336 | 339.938 |

The blanket 24px grid gap was replaced by the actual upstream region margins:
16px above title, 4px above description, 24px above content/footer. Sparse composition
therefore retains the appropriate margin even without a preceding visible region.
Footer text now centers when wrapped, rather than merely centering a left-aligned
anonymous flex item. Main content remains start-aligned.

The correct icon/title/body size ladders are 64/26/14, 80/32/14, 100/40/15 and
125/48/16px. These were previously represented as root-relative rem values. At an
explicit 20px root font, before became 100/40/17.5px for medium and 333.75px total
height. Reference and after remain 80/32/14px and 266.359px. Browser zoom still scales
rendered CSS pixels; applications wanting root-relative sizing may supply rem tokens.

## Palette

| Role/status | Before standalone light and dark | Reference / after light | Reference / after dark |
| --- | --- | --- | --- |
| Body/content/footer | `#18181b` | `#333639` | white `.82` |
| Title | inherited body | `#1f2225` | white `.9` |
| info icon tint | `#0369a1` | `#2080f0` | `#70c0e8` |
| success icon tint | `#15803d` | `#18a058` | `#63e2b7` |
| warning icon tint | `#a16207` | `#f0a020` | `#f2c97d` |
| error icon tint | `#b91c1c` | `#d03050` | `#e88080` |
| 403/404/500/418 inherited artwork color | invented gray/red/purple tints | body color | body color |

Result uses **normal** dark severity colors, not Alert's supplemental dark colors.
Light semantic tokens are reused where correct; local text and dark defaults avoid
incorrect legacy role substitution. Nested light scopes reset explicit dark defaults.
No `color-scheme` is imposed on native recovery controls.

The HTTP-like row describes inherited `color`, **not the colors painted by upstream's
multicolor illustration paths**. Native code text is an authored alternative and
does not reproduce those assets. Unknown native statuses still use the info fallback;
no network semantics or artwork-selection engine is introduced.

## Screenshot evidence and artwork boundary

| 900×3400 screenshot | Differing RGB pixels before | Differing RGB pixels after | After outside icon boxes |
| --- | ---: | ---: | ---: |
| Light | 178,178 | 26,595 | 0 |
| Dark | 176,268 | 26,594 | 0 |

Any changed RGB channel counts, without perceptual tolerance. Icon exclusions use the
reference viewport bounds plus 1px antialiasing allowance. Remaining differences are
the independently authored semantic SVGs and text-code alternatives to HTTP artwork.
This demonstrates corrected surrounding layout/text/palette, **not default-icon or
full screenshot identity**.

Native Result remains passive CSS: a bare `.mui-result` does not generate the default
upstream info icon, title, description or actions. Artwork must be authored. Native
icon regions also retain their tint for custom `currentColor` graphics, whereas upstream
custom icon slots do not automatically acquire the built-in icon tint. The fixed-fill
custom SVG remained visually unchanged; its unused computed `color` can differ.
Explicit artwork colors or `--mui-result-icon-color` control that distinction.

## Author and native-behavior checks

- Loading legacy core CSS after Result left measured light/dark fields unchanged.
  No aggregate definition or shared source was changed.
- RTL geometry/text metrics matched the full twenty-case reference matrix.
- Author overrides produced a 90px icon, 28px/700 title, 18px body, line-height 2,
  30px title/content/footer margins, and start-aligned icon/header/actions.
  Title/content/footer y values were 120/246/312px, with 348px total height.
  Author body/title/icon RGB colors remained authoritative.
- Dark→light nesting restored `#333639` body and `#1f2225` title. Nested size/status/
  alignment reset contracts are retained in focused tests.
- Changing status/size preserved the original nodes and HTML. Hidden header height
  was zero, empty status-bearing roots stayed zero-height, and no live/interactive
  role was generated.
- Native Enter and Space submitted an authored form once each; reset restored the
  original input value; a disabled action remained disabled.
- Existing print, forced-color, hidden/inert-template and wrapping protections remain.
  Application form validity, routes/retries and announcement policy are not replaced.

`--mui-result-gap` now overrides title/content/footer margins together; default fallbacks
are intentionally 16px/24px. Description margin remains 4px and can be authored through
ordinary CSS. `--mui-result-line-height` is newly documented. See
[Result](../../components/result.md) for the full native author contract.

## Validation, budget and limits

- `pnpm test -- tests\result.test.ts`: **13 tests passed**.
- CSS-only payload: **996 gzip bytes / unchanged 1,000-byte ceiling**, gzip level 9.
  Component JS remains **0 bytes**; runtime dependencies remain **0**.
- The initial readable theme/layout correction measured 1,039 bytes. Compact equivalent
  formatting brought the correction inside the original ceiling; no feature was removed
  to relax a test and no build budget was increased. The ceiling has only 4 bytes spare.
- The coordinator subsequently ran `pnpm build` and **28 combined Flex/Result tests**
  successfully, including all **13 Result tests**. Final manifest CSS remains
  **996 gzip bytes**, with declarations and package budget gates passing.
- Immediate theme changes remain a native difference; upstream color transitions are
  not reproduced. The library generates no artwork or other DOM.
- Chromium is the tested renderer. Arbitrary authored artwork/layout, other browsers,
  forced-color artwork rendering, speech output and application-specific contrast/
  focus policies are not certified by this matrix.
