# Tag default-style audit

**Status:** corrected and rendered against the reference in Chromium, 2026-09-10.
This covers optional `mui-tag`, not legacy Tag, bindings/templates or complete Vue parity.

## Reference and method

- Upstream commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Pinned sources: [Tag](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx),
  [layout](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/styles/index.cssr.ts),
  [light theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/styles/light.ts),
  [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/styles/dark.ts),
  [size constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/styles/_common.ts),
  and [close layout](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/close/src/styles/index.cssr.ts).
- Actual reference render: installed `naive-ui@2.45.3` and `vue@3.5.30`, `NConfigProvider`
  with light/dark themes. MarkupUI renders directly compiled current Tag source.
- Private fixture: session `files\style-reference\tag-audit`, independent port **4196**;
  shared fixture/server/build and repository distributions were not modified.
- Fresh isolated Chromium contexts, 800×1420 viewport, device scale factor 1. Both Tag
  labels used the same inherited system font and the literal text “Topic”.
- 32 cases per theme: every size with/without close; every type bordered/borderless;
  round, strong, icon, avatar, round+icon/avatar+close; checked/unchecked; disabled
  passive/checked/unchecked; and authored background/text/border overrides.
- Captured reference, original source, corrected source and corrected source followed
  by legacy CSS/aggregate: **8 matrices / 256 rendered cases**. Browser measurements
  include bounding boxes, computed fonts, fills, borders, radii, opacity, close positions
  and SVG boxes. Hover/pressed sampling additionally covers eight controls per matrix.

## Observed differences and corrections

Measurements below are CSS pixels on this Windows/Chromium fixture; text widths depend
on the selected system font. “After” describes the source, not a published release.

| Surface | Before | Reference / after |
| --- | --- | --- |
| Tiny height | 20 | **16** |
| Small / medium / large height | 22 / 28 / 34 | 22 / 28 / 34, retained |
| Medium passive width | 48.265625 | **46.265625** |
| Medium closable width | 68.265625 | **64.265625** |
| Passive radius | 3 | **2** |
| Text line-height, medium | 18.2 | **14** (unitless 1) |
| Inline alignment | `middle` | **`baseline`**, matching adjacent text |
| Strong weight | 600 | **500** |
| Medium close layout box | 16×16 | **14×14**, with an 18×18 centered hover/focus background |
| Tiny/small close layout box | 16×16 | **12×12**, with a 16×16 background |
| Light default text | `#18181b` with themes CSS | **`#333639`** |
| Light default surface / border | `#f3f4f6` / `#e4e4e7` | **`#fafafc` / `#e0e0e6`** |
| Borderless default surface | Same as bordered | **`#eee` light / `#333` dark** |
| Dark default text / border | `#fafafa` / `#3f3f46` | **white at .82 / .24 opacity** |
| Dark bordered surface | Filled | **Transparent**, including semantic types |
| Disabled opacity | .5 in both themes | **.5 light / .38 dark** |
| Checked dark text | White | **Black** |
| Disabled hover/pressed | Could change the button fill | **No hover/pressed fill change** |

The host border is now a pointer-inert pseudo-element, matching upstream's non-layout
border rather than adding two pixels to the width. Round padding follows height/3,
height/4 for the plain closable right edge, and height/2 left padding with negative
icon/avatar offsets; adorned round right padding returns to height/3. Icon sizing and
avatar's additional 2px spacing match the reference.

Semantic colors retain shared `--mui-color-*` hues while correcting opacity:

| Light passive type | Bordered fill | Borderless fill | Border |
| --- | --- | --- | --- |
| Primary / info / success | .10 | .12 | .30 |
| Warning | .12 | .15 | .35 |
| Error | .08 | .10 | .23 |

Dark semantic borderless fills use .16 and borders .30. Close controls use independent
neutral/type colors, a centered background, semantic hover/pressed fills and the dark
warning .11 pressed exception. Their font-dependent “×” was replaced with a small
decorative rounded-stroke SVG. No image/font/runtime package was added.

## Verification

- All **64 corrected cases** matched reference width, height, font size, line-height,
  weight, radius and opacity. Medium close position also matched exactly:
  x=273.265625, y=244, 14×14. Shape/size/palette checks include authored overrides.
- All **64 legacy-after cases** retained identical captured corrected measurements
  and sampled interaction colors. Enhanced registration remains first; the old
  registration-conflict boundary is unchanged.
- Default close hover/pressed overlays matched `.09/.13` black in light and `.12/.08`
  white in dark. Checked and unchecked hover/pressed colors matched reference;
  disabled cases stayed unchanged. Semantic CSS uses `color-mix()` so computed
  serialization differs from upstream's `rgba()` despite equivalent channels/alpha.
  Numeric normalization checked 245 nontransparent color samples: none exceeded .5
  of one 8-bit channel or .001 alpha; the maximum channel difference was .300075.
- Additional authored stylesheet check: height 40px, padding 13px, radius 9px, font
  17px, close 20px, background extent 24px, custom close/text/background colors.
  These override defaults even on a round Tag with legacy styles loaded.
- Inline text comparison corrected a 1px vertical offset: both Tags now use baseline
  alignment and rendered at y=1 alongside the same text at y=3. A separate round-close
  radius override rendered at the authored 7px instead of forcing a circle.
- Nested light scope inside dark restored `#333639`, `#fafafc` and disabled opacity .5.
- Native Enter then Space yielded exactly `[true, false]`; native `aria-pressed`
  reflected false, keyboard focus retained a 3px ring. Reduced motion yielded `0s`
  transitions on host, native toggle and close background.
- `pnpm test -- tests\tag.test.ts`: **28 passing**. Existing tests cover native state,
  close propagation, disabled fieldsets, mutation/reconnect and registration conflicts.
  New SVG identity/descendant-click checks preserve that behavior after the glyph change.
- Isolated strict TypeScript checking of `src\components\tag\index.ts` passed.
- Exact existing build recipes were exercised **in memory**, without rebuilding `dist`:
  ESM/classic are **2,390 / 2,603 gzip bytes**, below their unchanged 3,500-byte ceilings;
  raw external Tag CSS is **2,291 gzip bytes**, below its unchanged 2,500-byte ceiling.
  Integrated build remains the
  coordinator's acceptance gate, not something this isolated check claims to replace.

### Coordinated integration

The coordinator ran `pnpm build` successfully and all **28 Tag tests** passed within
the **135-test** ready-component/legacy/theme/browser batch. Final distribution gzip
is **2,389 ESM / 2,602 classic / 2,282 CSS bytes**, within the unchanged
3,500/3,500/2,500-byte ceilings. These manifest values supersede the isolated estimates
above; the integrated build gate is complete.

## Evidence and remaining boundaries

Session evidence is intentionally outside the package:

- `files\style-reference\tag-audit\before.json`: original comparison.
- `files\style-reference\tag-audit\after.json`: final eight matrices and extra
  `boundaries` author/theme/keyboard/reduced-motion measurements.
- The same private directory contains reproducible case/build/server/measurement files.
- Browser screenshots: `D:\repos\DataEngine\.playwright-mcp\tag-{reference,before,after,legacy}-{light,dark}.png`.
  These are actual rendered captures, not image mockups or a claimed zero-pixel diff.

The rounded-stroke SVG is an independent geometric replacement, not upstream's exact
filled path; rasterization can differ. Dark primary close tint uses unrounded CSS
color mixing (69.3/158.2/128.1 versus upstream's integer 69/158/128). Native close font
inheritance differs from upstream's browser button font, but the visible glyph is SVG.
The 3px focus-visible outline is a deliberate retained accessibility affordance.
Avatar checks cover wrapper geometry, not all Avatar content/rendering behavior.
Firefox/Safari, RTL, platform font differences and custom theme contrast are not certified.

**Shared follow-up, not changed here:** core/themes neutral tokens remain different
from Naive's Tag defaults. Tag isolates its neutral defaults locally and retains public
`--mui-tag-*` overrides; semantic dark colors still come from the existing themes CSS.
A shared neutral-token migration would affect other components and must be coordinated
separately. No shared theme/core/generated adapter or style-audit index was edited.
