# Progress default-style audit

**Status:** integrated defaults fixed; rendered in Chromium, 2026-09-10.
The native range/name/value policy is retained. This pass corrects default rendering,
not framework bindings, application completion policy or every upstream geometry quirk.

## Reference and evidence

- Pinned upstream: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Progress](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx),
  [line](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Line.tsx),
  [circle](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Circle.tsx),
  [multiple-circle](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/MultipleCircle.tsx),
  [CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/styles/index.cssr.ts),
  [theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/styles/light.ts).
- Rendered reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, configured light/dark.
  Target: directly compiled current source using existing esbuild; no stale distribution.
- Private session directory `files\style-reference\progress-audit`, independent port **4199**.
  It contains case/source/build/server files, `before.json`, `after.json`, `boundaries.json`,
  and `{reference,before,after,legacy}-{light,dark}.png`. No DataEngine artifacts.
- Isolated Chromium contexts closed in `finally`; viewport 850×1000, DPR 1, full-page
  captures; 14px inherited system font / 1.6 line-height and 320px fixture cells.
- **36 cases × two themes × four render variants = 288 rendered cases**. Cases cover
  0/25/50/100%, statuses, hidden/inside/custom indicators, explicit height/caps, linear
  and radial gradients, strokes/offsets, multiple colors/gaps, dashboard and processing.

Computed styles alone cannot reliably expose native progress-pseudo paint. The audit also
sampled actual PNG pixels through a same-origin canvas, so dark rail correctness is based
on rendered compositing rather than token-string comparisons.

## Before/after corrections

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Default light fill | Primary `#18a058` | **Info `#2080f0`** |
| Default dark fill | Primary `#63e2b7` | **Info `#70c0e8`** |
| Light rail | `#e7e7ed` | **`#ebebeb`** |
| Dark rail | Same opaque pale rail as light | **White at .12 alpha** |
| Generated text | Legacy neutral tokens | **`#333639` light / white .82 dark** |
| Default 320px line | 22.390625px tall, 281.4375px rail | **18px tall, 276px rail + 44px indicator** |
| Status indicator | Number plus font-dependent glyph | **18px line / 36px circle decorative vector mask** |
| Line radius | 999px | **5px**, explicit-height fallback to half height |
| Inside track | 24px tall, 312px wide | **16px tall, full 320px width** |
| Circle number | 14px | **28px** |
| Circle fill origin | Top | **Bottom for nongapped single rings** |
| Default 120px circle stroke | 8.4 screen pixels | **Approximately 7.85047px**, matching upstream |
| Multiple-circle width | 120px | **200px** |
| Custom multiple indicator | Below rings | **Centered**, including with an authored heading |
| Processing | 1.5s sliding shine | **2s growing/fading sweep** |

Circle stroke is normalized within the retained native viewBox:

```text
renderedStroke = strokeWidth / (1 + strokeWidth / viewBoxWidth)
radius = viewBoxWidth / 2 - renderedStroke / 2
```

At the defaults this is geometrically equivalent to upstream's `107×107` viewBox with
radius 50 and stroke 7, while the native SVG keeps its public `100×100` coordinate space.
The public stroke-width property and native numeric range do not change. Multiple rings
retain their original viewBox/stroke units and top-start orientation.

### Actual comparison outcomes

- **58 of 62 reference indicator boxes** matched target width/height/position within .02px.
  The only four mismatches are inside/inside-zero in each theme, retained deliberately.
  Hidden indicators and source-absent multiple summaries are not counted as matching DOM.
- Circle number “25%” measured 53.109375×44.796875px in both implementations. Radial
  inline-grid baseline alignment was corrected after observing a 3.203125px vertical shift.
- All **24 sampled line fill/rail pixel values** matched exactly across default, four
  statuses and author overrides in both themes. Dark default rail sampled `(45,45,48,255)`
  on the fixture's `#101014` background; light sampled `(235,235,235,255)`.
- Gradient endpoints were corrected to compensate the default ring rotations. Two sampled
  circle-gradient pixels per theme matched exactly: `(31,133,218,255)` and
  `(28,144,164,255)`, including after legacy loading.
- The initial dark correction exposed **double alpha compositing**: painting the same
  .12 rail on both native `<progress>` and `::-webkit-progress-bar` produced `(70,70,73)`.
  The WebKit bar is now transparent; the native element paints the rail once.
- Final captured corrected measurements and pixel samples were identical after later
  legacy CSS/aggregate loading.
- Status mask dimensions/colors match the reference treatment, but the independently
  drawn SVG silhouettes are not copied upstream icon paths or a zero-pixel glyph match.

## Motion and native/author verification

For a 50% fill on a 276px rail, processing samples were:

| Time | Source width / opacity | Corrected width / opacity |
| --- | --- | --- |
| 0ms | 0px / 1 | 0px / 1 |
| 660ms | 107.031px / .224439 | 107.016px / .224439 |
| 1320ms | 138px / 0 | 138px / 0 |
| 1800ms | 138px / 0 | 138px / 0 |

Both use `cubic-bezier(.4,0,.2,1)` over two seconds. The sub-.02px intermediate difference
comes from native width versus upstream opposing-inset rounding. Radial stroke/dash changes
use CSS transitions. Native line value interpolation remains browser-owned, not a JS shim.

Additional `boundaries.json` checks:

- `percentage=150` clamps native value to 100/100, retains explicit `status="info"`,
  preserves the “Upload” name and does not add a host progressbar role.
- Indeterminate removes native `value`, retains visible `…` rather than a status mask,
  and remains unknown under reduced motion. Multiple owners retain 25/65/90 values,
  100 maxima and independent names; the SVG stays `aria-hidden`.
- Author tokens rendered an 18px-high / 264px-wide rail with 4px radius, 16px text,
  custom fill/rail colors and gap; circle size 160px / text 32px overrides worked.
- Hiding a custom outside indicator restores all 320px to the track. Moving custom content
  inside retains a 320×16px track instead of an empty extra grid-column gap.
- A separate authored multiple heading stays above the graphic with an 8px gap; custom
  indicator center matched graphic center within .008px and all three owners remained.
- Reduced motion removes the determinate processing wash and stops radial/unknown motion
  without altering values. The pinned reference continues its processing animation.

## Deliberate remaining differences

1. **Inside presentation:** native text remains centered with a readable backing and
   neutral text color, including at zero. Upstream puts white/light-theme or black/dark-theme
   text inside the fill, so position, clipping and backing deliberately differ.
2. **Generated multiple summary:** native values remain below the rings. In this fixture
   the 200px graphic plus gap/summary yields 230.390625px total height; upstream's default
   has no summary and remains 200px. Authored custom content now centers like the source.
   `show-indicator="false"` hides the summary without removing native semantic owners.
3. **Dashboard/gap policy:** actual angular degrees are retained. Upstream's `gapDegree`
   subtracts SVG path-length units; its default 75 corresponds to roughly 85.94°, not the
   native 75° gap. Explicit viewBox behavior also remains the documented native geometry,
   rather than copying source fields that have little effect on single-circle drawing.
4. **Status assets/CSP:** four compact SVG data-image masks live in external CSS, keeping
   JS under its original ceiling. They are decorative and font-independent but require
   mask support and a CSP permitting data images. Strict no-data-image applications should
   supply custom indicator content. Native values/names remain available independently.
5. **Native ownership and validation:** no host range role, automatic status inference,
   busy/live state or value-policy changes. Bounded arrays, clamping, unknown values, label
   precedence, native restoration and custom node identity remain the existing contract.
6. Browser-native progress paint/interpolation, independent icon contours, rounding, RTL,
   multiple-gradient direction, platform fonts, custom contrast and Firefox/Safari are not
   certified as complete source/pixel parity.

## Validation and integration gate

- `pnpm test -- tests\progress.test.ts tests\progress.styles.test.ts`: **33 tests passed**.
  Added checks cover native value/owner retention under visual statuses, info/neutral
  defaults, single-layer WebKit rails, status mask scope and processing/reduced motion.
- Isolated strict TypeScript entry-point validation passed.
- Exact optional build options were exercised in memory, using `scripts/build.mjs`'
  **gzip level 9**, including its lean `global.ts` entry:
  **5,951 ESM / 5,982 classic / 2,348 CSS bytes**, under unchanged **6,000 / 6,000 / 2,500**.
  Classic headroom is only **18 bytes**; the parent's integrated build is still required.
  Earlier fixture/default-compression estimates are not substituted for level-9 accounting.
- No dependencies, shared/theme/index/generated edits, full build, commit or push.
  No common source change is needed: local neutral defaults coexist with existing shared
  semantic color tokens. Parent owns final integrated manifest and acceptance.

The coordinator subsequently ran the isolated release `pnpm build` and all **33
Progress tests** successfully. Final manifest gzip matches **5,951 / 5,982 / 2,348**
for ESM/classic/CSS. The release snapshot excludes unfinished unrelated work;
no budget was relaxed. Integration is complete.
