# Spin default-style audit

**Status:** integrated defaults fixed; rendered in Chromium, 2026-09-10.
Scope covers optional Spin, its native SVG/CSS motion and retained wrapping/delay behavior.
It does not transplant upstream's pointer blocking, live semantics or Vue transitions.

## Reference and evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Spin](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx),
  [Spin styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/styles/index.cssr.ts),
  [theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/styles/light.ts),
  [loading SVG](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/loading/src/Loading.tsx),
  [loading CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/loading/src/styles/index.cssr.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, `NConfigProvider` light/dark.
  Corrected target was compiled directly from current source with existing esbuild.
- Private session fixture: `files\style-reference\spin-audit`, port **4198**. Case,
  source/build/server files, `before.json`, `after.json`, `boundaries.json`, and
  `{reference,before,after,legacy}-{light,dark}.png` are all in this directory.
  No artifacts were written to DataEngine.
- Fresh isolated Chromium contexts, closed in `finally`; 850×2900 viewport, DPR 1,
  14px inherited system font / 1.6 line-height, 280×120px wrapped content.
- 20 cases × two themes × reference/original/corrected/legacy-after = **160 rendered cases**.
  CSS and upstream SMIL timelines were paused and sampled through browser APIs. PNGs capture
  the 800ms phase, not an invented static approximation.

Cases include 28/34/40/48px sizes, description prop/slot, explicit stroke, radius/stroke/scale,
default `rotate=false`, custom rotate/on/off, standalone show/delay distinction, wrapped
on/off/delay, and authored colors/content opacity.

## Observed corrections

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Default rotation | Fixed arc, one-second turn | **Three-second turn plus 1.6-second varying arc** |
| Arc geometry | `pathLength=100`, dash `72 28`, no changing offset | **Normalized radius-scaled dash cycle matching upstream 5.67r → 1.42r → 5.67r offsets** |
| Small / medium / large / numeric | 28 / 34 / 40 / 48px | Retained and matched |
| Default stroke widths | 20 / 18 / 16, numeric 18 | Retained and matched |
| Custom-icon rotation | Two seconds; `rotate=false` stops it | Retained and matched |
| Standalone description height | 21px | **22.390625px** with fixture's inherited 1.6 line-height |
| Description indicator height | 63px | **64.390625px** |
| Standalone description color | Forced legacy neutral token | **Inherited surrounding text color**, as actually rendered upstream |
| Wrapped description color | Forced legacy neutral token | **Primary theme color** |
| Active content opacity | .65 in both themes | **.5 light / .38 dark** |
| Inline alignment | Middle | **Baseline** |

All **40 corrected cases** matched the captured width/height/position, inherited text
metrics, colors and opacity of corresponding visible reference regions. Hidden wrapped
indicators remain DOM nodes in the target versus absent upstream nodes; those are not
claimed to be identical DOM structures. Captured corrected measurements and timeline
samples were identical after loading legacy CSS and the aggregate later.

### Pure-CSS reconstruction of the loading motion

Upstream combines an outer three-second rotation with two nested SVG rotations and a
dash-offset SMIL animation. The target uses one CSS outer rotation and one CSS circle
animation. The nested angle sums are 0° → 270° → 720° over 1.6 seconds, equivalent to the
source's combined rotations. The circle rotates around the viewBox center, including
scaled/cropped geometry.

For circle radius `radius - strokeWidth / 2`, native `pathLength` is:

```text
2 × π × (radius - strokeWidth / 2) / radius × 100
```

Fixed CSS dash array 567 and offsets 567 → 142 → 567 therefore scale to the source's
radius-based values. This avoids geometry-specific keyframes, new private inline CSS
variables, SMIL nodes, animation-frame code or a runtime animation library.

Measured default combined angles:

| Time | Reference angle | Corrected angle |
| --- | --- | --- |
| 0ms | 0° | 0° |
| 400ms | -177° | -177° |
| 800ms | 6° | 6° |
| 1200ms | -81° | -81° |
| 1599ms | approximately -168.683° | approximately -168.683° |

Five samples across default/small/large/radius-80/scaled geometry in both themes gave a
maximum angular difference of **.000550°**. Default offset samples were
567 / 354.5 / 142 / 354.5 / approximately 566.468. Radius-80 offsets are equivalent after
the .8 normalization factor. Browser path-length approximation and rasterization remain
possible subpixel differences; this is not a zero-pixel-diff claim.

## Retained native behavior and author checks

- Real delay check: requested 200ms, initially waiting; description/size edits at about
  70ms did not restart the deadline. At the approximately 236ms observation the indicator
  was visible. Explicit hide was immediate; cancelling a subsequent request at 50ms kept
  the indicator hidden beyond its original deadline.
- Authored `aria-busy="false"`, input value and non-inert content remained untouched.
  A real pointer click reached the active wrapped button once and the input accepted
  “Native edit”. No disabled or inert state was added.
- External overrides rendered 50px icon size, 16px description / 25.6px line-height,
  12px description gap, custom graphic/description colors and .7 content opacity.
- Adjacent-text check: both standalone reference and native Spin had y=0, height 34px,
  with the same text at y=19 and baseline alignment.
- `rotate=false` leaves default ring/arc motion running, but stops custom-icon rotation.
  Reduced motion stops outer rotation, arc motion and custom rotation; description/content
  transitions also stop. The stationary native arc keeps an explicit offset of 142.
- A fresh CSS-only native page, without a registered custom element, reproduced the dark
  34px ring, 800ms offset 142 and angle 6°. Both animation layers stopped under reduced
  motion. Full static markup, including normalized arc geometry, is in the component guide.
- Existing tests retain description precedence, native node identity, safe text, custom
  icon preservation, timers/cancellation, pre-upgrade state and registration conflicts.

## Remaining boundaries

- **No interaction blocking:** upstream content has `pointer-events:none` and disables
  selection while spinning; native content remains usable and the overlay ignores pointer
  hit-testing. The now-matching dimming values do not alter that deliberate contract.
- **No Vue fade lifecycle:** target show/hide retains immediate private visibility changes
  around its delay policy. It does not retain an exiting overlay for upstream's fade-out.
  Content opacity and description color use ordinary CSS transitions.
- **No SMIL or automatic image/status role:** decorative SVG and the existing readable
  description/fallback remain the native semantic policy. Screen-reader announcements
  and request/busy/blocking state remain application-owned.
- **Reduced motion is stronger:** CSS can fully stop both target motion layers; upstream's
  supplied SVG uses independent SMIL. In a fresh reduced-motion reference context, the
  outer `rotator` and custom `spin-rotate` animations remained enabled and SMIL was not
  paused. No claim of matching source motion under that accessibility preference is made.
- Standalone descriptions intentionally inherit rather than forcing primary color; the
  pinned source's description is outside the standalone icon's variable scope. Wrapped
  descriptions inherit the surrounding Spin theme scope and are primary by default.
- Existing arbitrary static/demo SVGs without the new normalized arc marker keep
  whole-graphic rotation only. The guide provides the complete native arc markup; no
  unrelated demo files were edited.
- Cross-browser SVG path/rasterization, RTL, custom theme contrast and every platform font
  remain downstream checks. All reported rendered checks are Chromium.

## Validation and integration gate

- `pnpm test -- tests\spin.test.ts tests\spin.styles.test.ts`: **32 passing tests**.
  New coverage checks stable native normalized geometry, no SMIL/style injection,
  CSS arc phases/scoping, default/custom timing, theme opacity and reduced motion.
- Isolated strict TypeScript checking of the Spin entry point passed.
- Exact existing build recipes, exercised in memory without distribution writes:
  ESM **3,117**, classic **3,325**, raw CSS **1,194 gzip bytes**, under unchanged
  **3,500 / 3,500 / 2,000** ceilings. These are isolated working-tree figures;
  the integrated manifest is authoritative after the parent's build.
- No dependency, shared CSS/theme/index/generated changes, full build, commit or push.
  **No common source change is needed**: dimming is local; primary hues continue to use
  existing shared semantic tokens. Parent owns integrated acceptance.

The coordinator subsequently ran `pnpm build` and **55 combined Spin/Statistic tests**
successfully, including all **32 Spin tests**. Final manifest gzip is **3,111 ESM /
3,319 classic / 1,190 CSS bytes**, below unchanged ceilings. Integration is complete.
