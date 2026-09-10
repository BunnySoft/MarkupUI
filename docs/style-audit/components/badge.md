# Badge default-style audit

**2026-09-10 — corrected and rendered-verified for the enhanced/native Badge scope.**
This is a default-style audit, not a claim of complete Vue API, animation-renderer or
all-browser parity. No runtime dependency, shared stylesheet change or budget increase.

## Reference and reproducibility

- [Official Badge documentation](https://www.naiveui.com/en-US/os-theme/components/badge).
- Pinned Naive UI **2.45.3**, source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `src/badge/src/Badge.tsx`, `src/badge/src/styles/index.cssr.ts`,
  Badge light/dark themes, common light/dark themes, and the internal SlotMachine
  controller/CSS. The integer cell width comes from that internal CSS, not a guessed font.
- Rendered the existing isolated **naive-ui@2.45.3 / vue@3.5.30** dependencies, not copied
  website styles. `NConfigProvider` selects default light or actual `darkTheme`;
  `NGlobalStyle` supplies reference document typography.
- Before source: MarkupUI `880767cfc4ede8a7fd6331ebdf30e611720a2e66`, Badge files only.
  Before and after controllers are separate bundles; the before screenshot does not
  accidentally combine old CSS with the corrected numeric renderer.
- Private fixture/evidence directory:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\badge`.
  `build.mjs` uses MarkupUI's existing esbuild, without writing `dist`; `node server.mjs`
  serves an explicit asset allowlist at `http://127.0.0.1:4197`. Server is stopped after
  the audit. No shared reference server or build file was edited.
- Routes: `reference.html`, `reference.html?dark`, `markup.html`, `markup.html?dark`.
  Markup modifiers `before`, `core`, and `core&reverse` select the original Badge or
  add captured canonical core/themes CSS in either order. These are independent
  documents in a **private browser context**, never the shared active browser page.
- Chromium **151.0.7922.174**, Windows system fonts, viewport **900×680**, DPR **1**.
  Both documents use the same fixture-owned 24px inset, 60×30 native target, labels,
  and light/dark canvas. Canvas colors are explicitly controlled to isolate Badge;
  these screenshots do not audit the separate Global Style component.
- Cases: numeric `5`, numeric `12`, `105` capped at `99`, dot, numeric `[6,3]` offset,
  success/info/warning, string `New`, standalone numeric, and processing dot.
  Required values/targets and labeled variants are the only Badge props supplied.
- `browser-measurements.json` records ten document runs, actual bounding boxes and
  relative offsets, computed paint/type/padding/radius/stacking/transitions.
  Six PNGs retain `reference`, `before`, and `after`, each in `light` and `dark`.
  For screenshots, processing animations are paused at **1500ms** (including 1s delay).

## Before / after measurements

Coordinates below are indicator top-left relative to the native **60×30** target wrapper.
All dimensions are CSS pixels. After values match the reference in both light and dark.

| Case / property | Before enhanced Badge | Pinned reference and after | Result |
| --- | --- | --- | --- |
| `5` pill | 18.46875×18; x=50.765625, y=-9 | 19.1875×18; x=50.40625, y=-9 | Fixed `.6em` passive integer cell |
| `12` pill | 24.9375×18; x=47.53125, y=-9 | 26.375×18; x=46.8125, y=-9 | Fixed |
| `99+` overflow | 33.15625×18; x=43.421875, y=-9 | 33.5625×18; x=43.21875, y=-9 | Fixed suffix cell; source value remains 105 |
| `[6,3]` offset on `12` | x=53.53125, y=-6 | x=52.8125, y=-6 | Width correction; physical offset direction retained |
| Dot | 8×8; x=56, y=-4 | Same | Already correct dimensions/anchor |
| String `New` | 35.9375×18; x=42.03125, y=-9 | Same | Natural text width retained |
| Standalone `5` | 18.46875×18; x=0, y=0 | 19.1875×18; x=0, y=0 | Fixed; remains in native inline flow |
| Pill leading / height | 14.4px leading; 18px minimum height | 18px leading and height | Fixed |
| Pill radius / z-index | 999px / 1 (standalone auto) | 9px / 2 | Fixed |
| Weight / family | Forced 400; inherited document family | Inherited weight; shared reference system stack | Fixed, with authored Badge font tokens |
| Background/text transition | None | 0.3s cubic-bezier(.4,0,.2,1) | Fixed; reduced-motion adaptation |
| Processing | Scaled 1px border, ease-out, immediate start | 0→4.5px shadow spread, 0.5px blur, opacity .6→0; 2s, 1s delay, cubic-bezier(0,0,.2,1) | Fixed without JS timers |
| Subpixel edge paint | Opposite horizontal translation origin | `inline-start:100%`, centered back by -50% in LTR | Fixed actual raster mismatch despite equal bounding boxes |
| Generated number clipping | Natural text wrapper, overflow visible | 18px-high clipped wrapper containing `.6em` cells | Fixed the remaining eight glyph-edge pixels |

The measured glyph Range for `5` is **6.46875×16**, at **(6.359375,1)** inside
the pill in both implementations. Two-digit glyphs start at x=6.359375 and 13.546875.
Text content remains ordinary DOM text; no old/new duplicate digits or VNode renderer.

### Light and dark paint

Text is white in every default badge. The default and explicit error type share a role.

| Role | Before light | After/reference light | Before dark, standalone stylesheet | After/reference dark |
| --- | --- | --- | --- | --- |
| Default/error | `#d03050` | `#d03050` | `#d03050` | `#d03a52` |
| Success | `#18a058` | `#18a058` | `#18a058` | `#2a947d` |
| Info | `#2080f0` | `#2080f0` | `#2080f0` | `#3889c5` |
| Warning | `#f0a020` | `#f0a020` | `#f0a020` | `#f08a00` |

Dark uses Naive's **supplementary** semantic fills, not its brighter primary semantic
text colors. Badge-local theme-boundary defaults consume shared `--mui-color-*-suppl`
when present, otherwise the pinned dark fallbacks above. Light reuses existing
`--mui-color-error/success/info/warning`. A nested explicit light boundary resets both
enhanced and CSS-only static Badge to `rgb(208,48,80)`, measured inside dark.

**Shared changes requested:** none required for correctness. A future shared-theme
consolidation may define `color-error-suppl`, `color-success-suppl`, `color-info-suppl`,
and `color-warning-suppl` with the exact dark values above. Do not replace the ordinary
semantic colors with these values. No shared token/core/generated adapter was edited here.

### Rendered verification, not just matching tokens

The after/reference computed measurement comparisons return **zero differences** for all
11 cases in both themes, including canonical CSS/themes in both orders. Native target
wrapper remains 60×30, transparent, with zero padding.

After fixing the translation origin and numeric clipping, the **complete controlled
fixture PNGs are byte-identical** to reference:

| Theme | SHA-256, identical reference and after PNG |
| --- | --- |
| Light | `f9ba99f4b3fa426d6af2e880f9645257e5da0b5321886cbf6f8c40a62ea2d3d0` |
| Dark | `dfa21f69a32b38f24aa25087f1c26589d23edf208e044c164d4054288e96a7c7` |

This equality is bounded to the stated fixtures/font/browser/animation time, not an
all-props or all-environments pixel-parity promise.

At paused 1500ms the processing shadow is `0 0 .5px 2.59908px`, opacity `0.253456`,
in both implementations. The reference uses a wave element; native uses `::after`.

## Authored tokens and retained native extensions

- External tokens survived value=105/max=99, dot toggles and reconnection, without
  any controller-written style. A 28px-size, 16px monospace/600, 8px-padding, 4px-radius,
  z-index=7, `[6,3]` offset override produced **44.78125×28**, offset
  **(43.609375,-11)**. Fill/text were exactly `rgb(1,2,3)` / `rgb(4,5,6)`;
  leading was 28px. These size/font conveniences are labeled extensions.
- All four logical dot anchors remain correct: LTR top-end `(56,-4)`, top-start
  `(-4,-4)`, bottom-end `(56,26)`, bottom-start `(-4,26)`; RTL reverses the X anchors.
  Positive custom X/Y offsets remain physical right/down.
- Reduced-motion emulation reports animation `none`, pseudo-content `none`,
  transition duration `0s`. This is an intentional accessibility adaptation.
- Static `.mui-badge-value` shares type, pill geometry and default light/dark roles;
  it remains ordinary authored text, not an integer-formatting controller.
- Native targets, listeners, focus, form semantics, custom value nodes, inert templates,
  decorative ARIA and hidden/show rules remain owned/preserved as documented in the
  [component guide](../../components/badge.md).

## Validation and integration boundary

- `pnpm exec vitest run tests\badge.test.ts`: **27/27 passed**.
  Added integer-cell/text fallback, node stability, authored-token preservation and
  external CSS regression coverage. Existing value/max, visibility, native action,
  custom content, registration and lifecycle tests still pass.
  A same-display regression covers capped numeric `99+` → literal `99+` → capped
  numeric `99+`: formatting mode changes rebuild the owned content even when the text
  is unchanged, while unchanged mode/text preserves the exact text node or digit cells.
- Isolated production-equivalent esbuild options: minified ES2022 ESM/IIFE,
  legal comments removed, source map reference retained; CSS is copied unminified.
  Level-9 gzip: **ESM 1,532 / 2,500**, **classic 1,743 / 2,500**,
  **CSS 1,279 / 2,000 bytes**. No ceilings changed.
- `git diff --check` passes for owned files. No full build, generated adapter rewrite
  or commit was run by this audit. Final declarations, `dist/manifest.json`, aggregate
  budgets and integrated suite remain the coordinator's build gate.

### Coordinated integration

After the same-display numeric/literal formatting correction, the coordinator ran
`pnpm build` and all **27 Badge tests** successfully. Final manifest gzip is
**1,532 ESM / 1,743 classic / 1,279 CSS bytes**, within unchanged ceilings.
Declaration/distribution and aggregate budget gates pass; the isolated audit's pending
integration requirement above is resolved.

## Explicit remaining limits

- **Legacy aggregate Badge is unchanged**: its text-pill definition/DOM and styling do
  not acquire enhanced Badge defaults or numeric cells. Load the enhanced Badge before
  the legacy aggregate as documented; this audit does not change registration ownership.
- No odometer, Vue enter/leave transition renderer, tooltip synthesis, locale number
  parser, binding or template renderer. Those are not needed for the verified defaults.
- HTML integer values and integer numeric strings share the passive fixed-cell path;
  Vue distinguishes numeric props from strings. Signed, decimal and exponent text remains
  literal rather than reproducing the upstream animated-integer internal's behavior.
- Custom authored value regions can contain different geometry/content; signed/decimal
  values, arbitrary fonts, CSS sizing, forced colors, every custom theme and every clipping
  ancestor are not covered by the screenshot equality claim.
- Pointer-passive indicators, native semantics, explicit accessible naming/announcements
  and reduced-motion handling remain intentional native adaptations. No cross-browser,
  assistive-technology or all-device certification is claimed.
