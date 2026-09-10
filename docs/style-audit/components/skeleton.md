# Skeleton default-style audit

**Status:** integrated defaults fixed; rendered in Chromium, 2026-09-10.
Scope is optional Skeleton and its static CSS equivalent, not bindings/templates or full
upstream Fragment/theme-runtime parity.

## Reference and reproducible evidence

- Pinned upstream commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Skeleton implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/Skeleton.tsx),
  [CSS and keyframes](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/styles/index.cssr.ts),
  [light theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/styles/light.ts),
  [dark theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/styles/dark.ts).
- Rendered reference: installed `naive-ui@2.45.3`, `vue@3.5.30`, `NConfigProvider` light/dark.
  Target: isolated compilation of current Skeleton source, not a stale distribution.
- Private session directory: `files\style-reference\skeleton-audit`; independent server
  on port **4197**. This directory contains fixture cases, source/build/server files,
  `before.json`, `after.json`, `boundaries.json`, and actual PNG captures named
  `{reference,before,after,legacy}-{light,dark}.png`. No artifacts were put in DataEngine.
- Isolated Chromium contexts were closed in `finally`. Viewport 800×2100, DPR 1,
  inherited 14px system font and 280px containing cells; one text case inherits 24px.
- 24 variants × two themes × reference/original/corrected/legacy-after = **192 rendered
  cases**. Animation timelines were paused and sampled deterministically through the
  browser's animation API, not simulated by replacing styles.

Variants cover default, three sizes, dimensions, sharp/soft/round precedence, three circle
sizes, width/height/default/percentage circles, text/font inheritance, percentage/math width,
repeat three/zero, animated/off, and authored color endpoints.

## Corrections and retained matches

| Area | Before | Pinned reference / corrected |
| --- | --- | --- |
| Light start color | `#e4e4e7` | **`#eee`** |
| Light animated endpoint | Same gray, opacity reduced | **`#ddd`** |
| Dark start / endpoint | Same opaque gray as light | **white at .12 / .18 alpha** |
| Animation timing | 2s `ease-in-out` | **2s `cubic-bezier(.36, 0, .64, 1)`** |
| Keyframe phases | Opacity 1 → .45 → 1 at 0/50/100% | **Background start → end → start at 0/40/80%, held through 100%** |
| Authored opacity | Animation could replace it | **Preserved throughout the color pulse** |
| Round radius | 999px | **4096px**, publicly overridable |
| Default bar | 280×14 in fixture | 280×14, retained |
| Small / medium / large height | 28 / 34 / 40 | 28 / 34 / 40, retained |
| Soft radius / sharp radius | 3px / 0 | 3px / 0, retained |
| Text baseline | `-.125em` | Retained and matched in an adjacent-text check |

The visible surface remains an owned decorative span, while the enhanced host remains
transparent and unanimated. Matching uses the painted span rather than incorrectly
comparing upstream's painted root to the target's neutral host.

**42 cases (21 variants in each theme)** matched corresponding visible bars for width,
height, radius, inherited font size, start fill, opacity, duration and timing function.
The three other variants are explicit existing boundaries listed below. The repeated
variant matches every row's geometry, not the spacing/envelope of upstream Fragment siblings.
All captured corrected measurements and phase samples were identical with later legacy
CSS and aggregate loading.

### Actual animation samples

Both upstream and corrected source produced these computed colors at paused timeline times:

| Time | Light | Dark |
| --- | --- | --- |
| 0ms | `rgb(238,238,238)` | `rgba(255,255,255,.12)` |
| 400ms | `rgb(230,230,230)` | `rgba(255,255,255,.153)` |
| 800ms | `rgb(221,221,221)` | `rgba(255,255,255,.18)` |
| 1200ms | `rgb(230,230,230)` | `rgba(255,255,255,.153)` |
| 1600ms | `rgb(238,238,238)` | `rgba(255,255,255,.12)` |
| 1900ms | `rgb(238,238,238)` | `rgba(255,255,255,.12)` |

Opacity remained 1 at every reference/corrected sample. Previously, the background stayed
`rgb(228,228,231)` in both themes and opacity fell to approximately .495 at 800ms.

## Author, static and native boundaries checked

- Authored endpoint pair `(80,100,120)` / `(120,140,160)` matched upstream theme overrides
  at every sampled time, including midpoint `(100,120,140)`.
- Separate external-token test: enhanced and static round placeholders both rendered
  135×27px with a 7px authored radius. Start/end colors `(50,60,70)` / `(100,110,120)`
  worked and authored opacity .6 remained .6 at both endpoints.
- Nested light scope inside dark restored `#eee` for both enhanced and static placeholders.
- A fresh page loading **only Skeleton CSS**, without shared themes or registered
  `mui-skeleton`, rendered a native static small/round bar at 28px, radius 4096px,
  dark .12/.18 endpoints, with authored `aria-hidden` and native inertness.
- Adjacent-text test: both upstream and enhanced text Skeleton rendered at y=3.75 with
  height 14px, next to the same text at y=1; computed alignment was -1.75px.
- `animated="false"` stops the pulse. Reduced motion stops animation and background
  transitions on enhanced and static surfaces, leaving the start color.
- Existing controller tests retain bounded/zero repeat, private dimension isolation,
  native validation, inert groups, authored nodes/templates/ARIA, lifecycle and registration
  conflicts. The controller source was not changed.

## Deliberate remaining differences

1. **Default circle:** with no size/dimensions, upstream rendered 280×14 (an oval) in this
   fixture. Existing native Skeleton renders 14×14, retaining its documented true-square
   circle policy.
2. **Percentage circle:** `width="25%"` in a 280px auto-height cell rendered upstream 70×0,
   versus the native 70×70 square. Native `aspect-ratio` is intentionally retained.
3. **Repeat zero:** upstream still renders one bar; native Skeleton renders none.
4. **Repeated-row layout:** upstream's three 16px Fragment rows occupy 48px without gaps;
   native grid rows occupy 64px with two default 8px gaps. Public `--mui-skeleton-gap: 0px`
   can remove the gaps, but no upstream Fragment renderer is introduced.
5. **Reduced motion:** pinned upstream continued `skeleton-loading` under the emulated
   preference. Native Skeleton intentionally stops it, preserving its existing policy.
6. Theme endpoint changes use ordinary CSS variables/background transitions, not upstream's
   Houdini property registration. No claim is made about exact theme-switch interpolation,
   every device's frame pacing, Firefox/Safari, or a zero-pixel screenshot diff.

## Validation and integration boundary

- `pnpm test -- tests\skeleton.test.ts tests\skeleton.styles.test.ts`: **26 passing tests**.
  Three new stylesheet tests cover keyframe endpoints/phases without opacity animation,
  shared static/generated timing, theme endpoints and reduced-motion rules.
- Existing exact build recipes exercised in memory: ESM **1,802**, classic **2,007**,
  raw external CSS **917 gzip bytes**, below unchanged **2,500 / 2,500 / 1,500** ceilings.
- No dependencies, controller changes, shared source/theme/index/generated changes,
  full build, commit or push. Tag files remained frozen.
- **No shared change is required** for these neutral Skeleton colors: theme scopes are
  local to the optional CSS. Parent retains integrated build/distribution acceptance.

The coordinator subsequently ran `pnpm build` and all **26 Skeleton tests** successfully.
Final manifest gzip is **1,802 ESM / 2,007 classic / 912 CSS bytes**, below unchanged
ceilings. These built values supersede isolated estimates; integration is complete.
