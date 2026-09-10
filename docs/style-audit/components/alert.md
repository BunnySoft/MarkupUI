# Alert visual-default audit

Date: 2026-09-10. Scope: optional enhanced Alert and its controller-free `.mui-alert`
stylesheet. No binding/template work, legacy controller rewrite or lifecycle expansion.

## Reference and method

- Pinned Naive UI source: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered reference: `naive-ui@2.45.3`, `vue@3.5.30`; `NAlert` inside
  `NConfigProvider`, with explicit default light or `darkTheme`.
- Source inspection: `src/alert/styles/{_common,light,dark}.ts`,
  `src/alert/src/styles/index.cssr.ts`, `Alert.tsx`, and internal semantic/close icons.
- Chromium private context, 900×1100 viewport, device scale 1, 360px notice width,
  matching system font and 14px/1.6 body typography. Reference and MarkupUI were
  rendered separately, with identical text and fixture geometry.
- Ten cases per theme: default/info/success/warning/error with title and close;
  body-only closable; no-icon warning; borderless error; title-only success;
  wrapping titled info. Measurements use bounding rectangles and computed styles.
- Before/after screenshots and `measurements.json` are retained in the coordinator's
  session `files/alert-style-audit` evidence directory, with the isolated fixture.
  No fixture dependency is shipped with MarkupUI.

The reference was actually rendered; the comparisons below are not source-only estimates.

## Measured geometry

Values in pixels. “After” equals the rendered reference for these LTR cases in both themes.

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Titled one-line notice height | 79.984 | 76.391 |
| Body-only closable height | 50 | 48.391 |
| Title-only height | 51.594 | 45 |
| Wrapped notice height | 147.156 | 121.172 |
| Radius | 6 | 3 |
| Title line height / weight | 25.594 / 600 | 19 / 500 |
| Titled content top | 44.594 | 41 |
| Icon-bearing title/content start | 51 | 44 |
| Default-type title/content start | 19 | 44 |
| No-icon title/content start | 19 | 13 |
| Titled closable content width | 256 | 303 |
| Body-only closable content width | 256 | 281 |
| Icon start / top / size | 19 / 13 / 20 | 12 / 11 / 24 |
| Close start / top / size | 319 / 13 / 24 | 326 / 13 / 20 |
| Border | 3px start accent, 1px other edges | Uniform 1px overlay |

The new border uses a noninteractive pseudo-element, matching upstream's overlay rather
than consuming layout space. Borderless mode removes it without shifting content.
Title/body gap is 9px; hidden authored headers neither leave that gap nor suppress
the close-space reservation. The 13px body padding and 44px icon inset also apply to
controller-free notices.

## Measured palette

Light values below are final rendered 8-bit RGB. CSS uses `color-mix` so the public
accent token can still drive semantic fills/borders; upstream rounds its composite
colors before emitting CSS. The fixture's rendered background/border pixels match.

| Type | Light background | Light border | Light icon | Dark icon |
| --- | --- | --- | --- | --- |
| default | `#fafafc` | `#efeff5` | No generated symbol | No generated symbol |
| info | `#edf5fe` | `#c7dffb` | `#2080f0` | `#3889c5` |
| success | `#edf7f2` | `#c5e7d5` | `#18a058` | `#2a947d` |
| warning | `#fef7ed` | `#fae0b5` | `#f0a020` | `#f08a00` |
| error | `#fbeef1` | `#f3cbd3` | `#d03050` | `#d03a52` |

- Previously, semantic backgrounds used 9% alpha over the page, instead of the
  reference's opaque light 8%-over-white composites. Default was `#f5f5f7`.
- Light title/body/close now match `#1f2225` / `#333639` / `#666`; title previously
  inherited the body color.
- Previously the explicit dark fixture still had light text/icons/default surface.
  Dark title/body/close now match white at `.9` / `.82` / `.52`.
- Dark default fill/border match white at `.1` / `.09`; dark semantic fill/border
  use their supplemental icon colors at `.25` / `.35`.
- Warning's light border correctly uses a 33% composite, rather than the other
  semantic types' 25%.
- Close hover/pressed backgrounds now match black `.09` / `.13` in light and
  white `.12` / `.08` in dark. Before: black `.05` / `.094` in both themes.
  Upstream paints these on its close pseudo-element; MarkupUI paints the native button.

## Icons and screenshot comparison

Font-dependent `ⓘ`, `✓`, `!`, `×` glyphs were replaced by decorative native SVGs.
The 24px semantic viewport contains the circular severity silhouette and transparent
symbol cutout. The native close button contains a 16px line SVG. All generated
graphics are nonfocusable and `aria-hidden`, use `currentColor`, and need no icon package.
Authored icon node identity, ARIA and listeners remain untouched.

| Full 900×1100 screenshot | Differing pixels before | Differing pixels after | After outside icon/close boxes |
| --- | ---: | ---: | ---: |
| Light | 325,008 | 934 | 0 |
| Dark | 325,038 | 943 | 0 |

Differences count any changed RGB channel, not a perceptual tolerance. Icon/close
exclusions use reference bounds with a 1px antialiasing allowance. Remaining differences
are the compact independently expressed SVG curves/strokes, not exact upstream path
data. Pixel identity of generated icons is **not** claimed. The fixed image dimensions,
font, device scale and case matrix are essential to interpreting these counts.

## Additional browser checks

- Loading the legacy core CSS **after** enhanced Alert CSS did not change measured
  geometry, text or palette. Legacy-only Alert still has its old implementation and
  appearance; this audit does not re-register or restyle it.
- RTL with upstream `unstableAlertRtl`: titled and no-icon geometry matches, including
  semantic icon x=324 and close x=14 at 360px width.
- Deliberate RTL safety difference: body-only closable MarkupUI retains a 35px logical
  trailing inset, producing 281px content width. The pinned upstream RTL rendering
  had x=13/303px content and did not reserve the close area. That overlap-prone
  upstream behavior was not copied.
- Native close click emitted one intent, preserved the host, and added no live role.
  Keyboard focus retained the existing 3px focus-visible outline.
- Hidden host, borderless, no-icon, hidden authored header, controller-free static
  notices, and nested dark→light theme reset were checked.
- Author token overrides produced 7px radius, 30px icon, 10px icon gap, 52px start
  inset, 26px close control, 18px close SVG, and authored RGB background/title/body/
  border colors. Wait for the existing transition to settle when measuring colors.
- Reduced-motion emulation produced a `0s` host transition.

## Shared theme and author contract

Reuse is limited to genuinely matching roles: `--mui-font-size`, `--mui-line-height`,
light `--mui-color-{info,success,warning,error}`, and the existing focus-ring fallback.
Local explicit light/dark defaults avoid incorrectly mapping legacy global text,
surface or border roles onto upstream Alert roles. Dark Alert uses supplemental
semantic colors, not the brighter normal dark Button colors.

All existing component appearance tokens remain author overrides, including
`--mui-alert-accent` (semantic fill/border/icon), background/border/content/title
colors, padding/radius/type size, content/icon/action gaps, and close colors.
Additional geometry tokens are documented in [Alert](../../components/alert.md).
`--mui-alert-padding` controls the host padding; icon and close offsets remain
independently tunable, as upstream has separate icon/close margins.
Use `show-icon="false"` when the default-type empty icon space is unwanted.

No shared theme/core/generated adapter files were changed for this component. A future
shared semantic-role layer could replace local palette duplication, but must distinguish
dark supplemental severity colors and leave component overrides authoritative.

## Validation and boundaries

- `pnpm test -- tests\alert.test.ts`: **27 tests passed**.
- Existing esbuild settings, isolated production-named outputs, gzip level 9:

  | Output | Measured gzip bytes | Unchanged ceiling |
  | --- | ---: | ---: |
  | Alert ESM | 2,243 | 2,500 |
  | Alert classic | 2,460 | 2,500 |
  | Alert CSS | 1,701 | 2,000 |

- Coordinated `pnpm build` subsequently passed, including declarations and aggregate
  budget gates. All **27 Alert tests** passed in the **135-test** ready-component/
  legacy/theme/browser batch. Final manifest gzip matches the isolated values above.
- No runtime packages, JS geometry/style injection, binding/template machinery,
  inferred announcement role, automatic dismissal or framework leave lifecycle.
- Default/unknown types keep an empty **layout reservation**, not an empty generated
  icon node. Authored icon art and arbitrary heading descendants remain caller-owned.
- Chromium is the tested renderer. Current CSS features include logical properties,
  `:has()` and `color-mix()`. Firefox/Safari, older engines, assistive-technology speech,
  zoom/font substitution and arbitrary author themes require downstream validation.
- Existing semantic/lifecycle differences from Vue remain documented; this is a
  visual-default correction, not a claim of full framework or all-browser parity.
