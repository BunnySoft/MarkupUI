# Collapse Transition motion audit

**Status:** integrated native motion correction; Chromium comparison, 2026-09-10.
The existing native API, one-owner lifecycle, authored nodes, hidden/inert policy and
bounded request-time measurement remain. No width/group engine or renderer was added.

## Reference and actual motion evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [public component](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx),
  [component CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/styles/index.cssr.ts),
  [expand hooks](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts),
  [height/fade CSS](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_styles/transitions/fade-in-height-expand.cssr.ts).
- Rendered reference: installed `naive-ui@2.45.3` / `vue@3.5.30`; default public
  display directive unless a test explicitly says otherwise. Target is compiled current
  source with the unchanged external clipping stylesheet.
- Private session fixture `files\style-reference\collapse-transition-audit`, port **4222**:
  case/source/build/server files, `before.json`, `after.json`, `boundaries.json` and
  `{reference,before,after,legacy}-{enter,leave}.png`.
- Fresh isolated Chromium contexts, closed in `finally`; primary fixture is a natural
  320px-wide wrapper around a 120px border-box inner panel.
- Browser Animation APIs sampled real CSS/native effects. Animation-local playheads were
  aligned for curve comparison. Chromium virtual time held source cleanup timers while
  capturing; a bounded frame advance allowed actual compositing, without changing source
  CSS durations or replacing DOM animation logic.
- Reference PNGs preserve measured relative property start times at 150ms after height
  start. Thus their opacity differs from the independently aligned curve table below.
  Native before/after PNGs use the single owned animation at 150ms.

## Corrected defaults

| Property | Before | Source / corrected native |
| --- | --- | --- |
| Duration | 300ms | 300ms, retained |
| Height easing | `ease-in-out` | **`cubic-bezier(.4,0,.2,1)`** |
| Entry opacity | Unchanged at 1 | **0 → authored endpoint, `cubic-bezier(.4,0,1,1)`** |
| Exit opacity | Unchanged at 1 | **Current opacity → 0, `cubic-bezier(0,0,.2,1)`** |
| Owned effects | One height Animation | **One height+opacity Animation** |
| Inline height/opacity writes | None | None, retained |

Two separate zero-offset keyframes carry the independent property easings, followed by one
shared endpoint. Native per-property keyframe processing supplies the curves without a
second Animation, custom easing evaluator, per-frame loop or new configuration surface.

### Animation-local samples, 120px default fixture

Corrected native values matched the source at every listed sample:

| Time | Entry height / opacity | Exit height / opacity |
| --- | --- | --- |
| 0ms | 0 / 0 | 120 / 1 |
| 75ms | 28.385418 / .0986266 | 91.604172 / .422427 |
| 150ms | 93.0625 / .324815 | 26.927084 / .160755 |
| 225ms | 115.114586 / .630085 | 4.875 / .0357836 |
| 299ms | 119.989586 / .994499 | 0 / approximately .000005794 |

Before, the native midpoint was 60px in both directions and opacity stayed 1 throughout.
Corrected samples were identical after later legacy CSS/aggregate loading.

## Concrete limits: this is not framework scheduling parity

1. **Property start timing:** source Vue class/frame orchestration did not start opacity
   with height. One observation recorded a 29.128ms lag; screenshot runs recorded roughly
   31.19ms on entry and 31.292ms on exit. Native properties deliberately co-start in one
   effect and use the existing configured request duration. No frame-staging adapter is added.
   Source PNG opacity at the common 150ms height point was .219413 / .248899, versus native
   .324815 / .160755. The aligned table compares curves, not identical wall-clock images.
2. **Height versus max-height:** source clamps intrinsic layout with max-height; native
   animates its measured height then releases to auto. A 123.5px panel has offsetHeight 124:
   at 299ms source was 123.5px, native 123.989586px, then native settled to 123.5px.
3. **Author opacity cascade:** source inline opacity .6 overrides its CSS fade; native
   fades toward the authored .6 endpoint and restores that declaration. At 299ms native
   was .596699 and settled to .6. This preserves author styling, not identical precedence
   between source CSS transition classes and native animation effects.
4. **No continuous retargeting:** content/width/font/style changes retain the request's
   sampled endpoints. An inner height change 120→180 and authored opacity .6→.35 during
   motion settled to 180px / .35 without retaining stale inline height or opacity.
5. **Retained native ownership:** active content remains inert and clipped in both
   directions; source samples were not inert. Source's default `if` can remove nodes;
   native `hidden` preserves them and their form/value/listener ownership.
6. **Not a horizontal/general engine:** the public native API still rejects width/
   horizontal/group/mode/reverse/directive options. Source's private width transition
   is not transplanted. Horizontal writing mode/RTL within the height model remains valid.
7. **Fallbacks:** reduced motion, print, unsupported capability, zero duration and
   zero-distance paths remain immediate. The fade does not create an opacity-only engine.
   Source continued two 300ms CSS transitions under the emulated reduced-motion preference.

## Lifecycle, styles and native alternatives checked

`boundaries.json` records:

- A close reversed to open at height 26.927084px / opacity .096453. Both values were
  identical before/after replacement. Same-target calls returned the same Promise;
  the cancelled close resolved false and the open resolved true.
- Focus moved to the explicit external toggle before clipping; inert blocked focus entry.
  Settlement restored non-inert content, its “Retained” input value and author opacity .6.
  Hooks were leave→cancel→enter→after-enter, with no stale after-leave.
- A later author opacity .35 survived finish/disposal. Native inline style held only the
  authored opacity, never a library height/opacity write. An unrelated color Animation
  was still running after the controller finished its own effect.
- RTL plus 2× CSS zoom retained 93.0625 layout pixels / 186.125 painted pixels at midpoint,
  with opacity .324815; settlement returned to 240 painted pixels without inline geometry.
- Initial appearance started at zero height/opacity with one enter hook and completed
  enter→after-enter ordering. Existing focused-appearance safety tests remain intact.
- Mid-animation reduced motion/print finished the requested target and released inert/
  clipping; closed content stayed hidden. Initial reduced-motion entry was immediate.
- With JavaScript disabled, native details opened/closed with content retained and an
  authored hidden wrapper stayed hidden. These are native alternatives, not hidden width
  support or a template/binding renderer.

No promises are made about arbitrary outer geometry, competing outer height/opacity
animations, every browser's frame scheduler, physical input hardware or screen-reader speech.

## Validation and integration gate

- `pnpm test -- tests\collapse-transition.test.ts`: **48 tests passed**.
  New coverage checks default phase curves, one owned effect, zero/custom authored opacity,
  later style restoration, dual-property reversal sampling and width-option rejection.
- Isolated strict TypeScript entry-point validation passed.
- Exact build options exercised in memory with gzip level 9:
  **3,810 ESM / 3,935 classic / 274 CSS bytes**, below unchanged
  **4,500 / 4,500 / 750** ceilings.
- No CSS asset, shared helper, existing Collapse, index/generated, template/binding,
  dependency, full-build, commit or push changes. Parent owns integrated release validation.

The coordinator subsequently ran the isolated release `pnpm build` and all **48
Collapse Transition tests** successfully. Final ESM/classic/CSS gzip remains
**3,810 / 3,935 / 274**, within unchanged ceilings. Integration preserves the stated
native scheduling and fractional-height limits; it does not claim wall-clock Vue parity.
