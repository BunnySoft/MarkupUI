# Input default-style audit

## Shared wrapper media follow-up — 2026-09-11

The completed Input-owner follow-up resets a disabled wrapper's pseudo-border to
`GrayText` in forced colors. In print, a focused status wrapper now uses black text,
a transparent surface, a current-color border and no focus glow. This closes the two
shared wrapper gaps discovered by the Input OTP audit without adding OTP-owned selectors.

Chromium 152 confirmed that the disabled boundary equals a native `GrayText` probe and
that a dark-scheme focused error wrapper prints with black wrapper/affix text, transparent
background, black boundary and no shadow. Input **56**, Input print **5**, Input OTP
style **8** and Input OTP behavior **73** tests pass individually.

The two protected media selectors bring checked-out Input CSS to **7,485 raw / 1,795
gzip bytes**. The explicit CSS ceiling increases by 50 bytes, from **1,750 to 1,800**;
Input JavaScript and runtime dependencies are unchanged.

## Scope and provenance

Audited **2026-09-10**, starting from MarkupUI `468401e`. Only optional Input CSS,
Input-specific tests and documentation changed; native helper JavaScript and shared
theme/core/plugin files are untouched. No data-binding, template or omitted Vue feature
work is included.

Reference: installed **Naive UI 2.45.3 / Vue 3.5.30**, with source clone verified at
[`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input).
Relevant sources are `styles/light.ts`, `styles/dark.ts`, `styles/_common.ts`,
`src/styles/input.cssr.ts` and `_styles/common`. Reference packages are comparison-only,
never runtime dependencies.

Real Chromium **151.0.7922.174** used isolated browser contexts, a **1000×1100**
viewport and separate reference/native pages on private loopback port **65109**.
The fixture uses 360px fields, the same system font stack and meaningful authored
content: “Quarterly planning”, “Project name”, `$`/`USD`, 80/240-character maxima and
three-row textarea variants. No real credentials or customer data.

Private reproducibility artifacts are under session
`99fde562-4396-4c35-9601-b00d03e1c14e\files\input-audit-private`:
`fixture.mjs`, authored pages/cases, `before.css`, `measurements.json`, and
`budgets.mjs`/`budgets.json`. The fixture owns its server, bundles and pages; it does
not alter shared preview/release infrastructure. Measurements include real hover/focus
after reference transitions settle, not just extracted theme constants.

## Obtained geometry

All dimensions are CSS pixels in that browser environment. Before values include its
fractional native border rounding. Both schemes produced the same geometry.

| Case | Before | Reference = after |
| --- | ---: | ---: |
| Tiny height / font / left inset | 23.33 / 12 / 2.67 | 22 / 12 / 8 |
| Small height / font / left inset | 30.33 / 14 / 4.67 | 28 / 14 / 10 |
| Medium height / font / left inset | 41.33 / 16 / 8.67 | 34 / 14 / 12 |
| Large height / font / left inset | 52.33 / 18 / 12.67 | 40 / 15 / 14 |
| Medium radius | 6 | 3 |
| Medium ordinary native control width | 342.67 | 336 |
| Three-row textarea height | 89.33 | 80.1875 |
| Three-row textarea with count height | 120.33 | 80.1875 |
| Icon-only authored clear/reveal action box | Padded bordered button | 16 × 16 |

Textarea line-height is **22.4px**, vertical padding **6.5px**. The count is
**11.9px** type with a **17.84375px** line box. For the 360px counted textarea,
reference and after count offsets are **x=304.7917, y=55.84375**. Prefix/suffix
text now inherits field type size and uses 4px separation; `$` produces the matching
**23.5521px** control inset. Intrinsic authored text-button width is deliberately
not forced to 16px.

## Obtained paint and fixes

| Role/state | Before | After and reference |
| --- | --- | --- |
| Light text / border | `#17212b` / `#687787` | `#333639` / `#e0e0e6` |
| Light placeholder | `#596774` | `#c2c2c2` |
| Light disabled background / text | `#eef0f2` / `#64707a` | `#fafafc` / `#c2c2c2` |
| Light hover/focus border | No hover; blue focus | `#36ad6a` |
| Light focus ring | Inset native outline only | `0 0 0 2px` at primary 20% |
| Dark text / background | Light defaults | White 82% / white 10% |
| Dark disabled text / background | Light defaults | White 38% / white 6% |
| Dark hover/focus border | Blue focus | `#7fe7c4` |
| Dark focused background / glow | White / none | Primary 10% / `0 0 8px 0` primary 30% |
| Error focus border, light / dark | Blue / blue | `#de576d` / `#e98b8b` |

Warning and error focus retain their own tone, caret and ring rather than turning blue.
Dark and light neutral values are component-local because legacy shared neutral roles
are not equivalent to the reference. Correct shared semantic color roles are reused.
`color-mix()` computes the focus alpha; Chromium may serialize it as `color(srgb …)`
instead of the reference's `rgba(…)`, with the same color channels and alpha.

The visible border now overlays rather than consuming the native control's dimensions.
Public tokens are never assigned by size/status/theme selectors. A dark error field
with inherited authored tokens measured **44px** height, **18px** font, **19px**
padding and **11px** radius, with the exact authored text/background/border/focus colors.
Only disabled native fields suppress hover/focus paint; composition-disabled actions do not.

## Validation and retained differences

- `pnpm test -- tests\input.test.ts`: **56/56 passed**; original ownership/value/
  selection/composition/disabled/form/reset/password cases plus four CSS regressions.
- Real browser keyboard replacement produced “Release review”; CDP composition kept
  the native field focused and the green focus border while its clear action was disabled.
  Clear, changed-default reset/FormData, selection **[2,6]** across reveal and Escape
  masking passed. No helper/API changes.
- Forced colors retained a solid focus outline; print hid actions. The coordinated
  follow-up also protects disabled wrapper boundaries and removes focused status paint
  from print. At 360px viewport and 200% CSS zoom the responsive fixture had equal
  **345px scroll/client width**.
  This is CSS zoom, not a browser-chrome zoom certification.
- Native textarea edit width is **336px**, versus reference **332px**: Naive retains
  a suffix wrapper gap. We do not introduce that empty wrapper or custom scrollbar.
  Native resize handle, scrollbar, selection, IME and autofill paint remain browser-owned.
- Textarea counts overlay the lower inline end like the reference and may intersect long
  text. The overlay is pointer-transparent. Applications may omit counts or author extra
  spacing rather than expecting a hidden measurement mirror.
- Borderless retains the existing visible focus boundary; Naive's borderless reference
  suppresses it. This intentional keyboard-focus adaptation is not exact parity.
- Icon artwork remains authored: the fixture uses independent CSS strokes in 16px boxes,
  not copied Naive SVG paths. It measures action geometry, not vendor eye-glyph parity.
  The helper's nonempty editable clear button stays visible rather than mounting its
  content only on hover like Naive; this preserves the authored native-button contract.
  Action hover paint matches `#929292` in light and white 48% in dark.
  Intrinsic text buttons, wrapping groups, native scrollbars and autosize fallback are
  retained adaptations, not guarantees of identical screenshots.
- No managed loading spinner, Form state injection, tuple/pair renderer, custom grapheme
  limiter, binding or template API was added. No OS IME, password-manager, screen-reader
  or cross-engine certification is claimed.

## Initial isolated budgets

Exact existing esbuild recipe: bundled/minified ES2022, no legal comments, source maps
enabled, ESM `index.ts` and IIFE `global.ts`; CSS copied verbatim. Gzip uses level 9.

| Asset | Raw bytes | Gzip bytes | Initial ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-input.js` | 7,704 | 3,110 | 4,000 |
| `markup-ui-input.global.js` | 7,861 | 3,180 | 4,000 |
| `markup-ui-input.css` | 7,053 | 1,737 | 1,750 |

Source CSS was equivalently whitespace-compacted using the already installed esbuild
formatter (`minifyWhitespace: true`, `minifySyntax: false`). This initial pass had
**13 gzip bytes** of headroom before the later protected-media follow-up. ESM+CSS was
**4,847**, classic+CSS **4,917 gzip bytes**. This was an isolated asset check.

## Coordinated release integration

The coordinator's release build and all **61 Input/Input print tests** pass. The
checked-out release CSS is now **7,485 raw / 1,795 gzip bytes**, below the adjusted
**1,800-byte** ceiling. Native helper JavaScript is unchanged.
