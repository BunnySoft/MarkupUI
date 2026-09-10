# Flex default-style audit

**2026-09-10 — integrated; CSS unchanged, native limits documented.** Scope: Flex-specific tests
and its two documentation files. No shared sources, other components, generated
assets, root demos, dependencies, full build or commit changed.

## Pinned source and isolated method

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected `src/flex/src/Flex.tsx`, `src/flex/src/type.ts`, the light/dark/common/RTL
theme files and `src/flex/src/styles/rtl.cssr.ts`.

Private `.flex-audit` pages rendered actual **Naive UI 2.45.3 / Vue 3.5.30**, bundled
with existing esbuild. Reference pages mounted NConfigProvider/NGlobalStyle/NFlex;
candidate pages used equivalent native direct children and unchanged Flex source
CSS. Both used the same 14px/1.6 application typography and explicit stage sizing,
with no showcase or other component styles.

Fresh private Chromium contexts isolated every browser run. Relative root/item
rectangles avoided page-position/provider-wrapper artifacts. Dark used `darkTheme`;
the retained RTL comparison used native `dir="rtl"` on **both** documents rather
than assuming the pinned provider's RTL class actually worked. A separate provider
probe is recorded below. The private fixture/server were cleaned up afterward.

## Measured cases and result

**30 cases × two themes × two directions = 120 comparisons**:

- Default/small/medium/large; scalar 10px, tuple `[20,6]`, zero.
- Inline, vertical, vertical with wrap requested, narrow row wrap/nowrap.
- Align start/end/center/stretch/baseline/flex-start/flex-end.
- Justify end/center/space-between/space-around/space-evenly/flex-start/flex-end.
- Vertical center alignment and vertical tuple spacing.
- Grouped intrinsic nowrap and its authored intrinsic-minimum counterpart.

Measured root display/direction/flex-direction/wrap, align/justify, row/column gaps,
root width/height, and all direct-item x/y/width/height rectangles.
**116 comparisons matched exactly**. One deliberately retained native intrinsic
minimum difference accounts for the remaining four theme/direction cases.

### Reference = current native defaults

Three ordinary direct children measured **60×20, 80×40 and 50×30px**.

| Case | Measured result |
| --- | --- |
| Default at 280px | row/column **8/12px**, justify **start**, align **normal**, root **280×40px** |
| Default item x positions | **0/72/164px** |
| Small / large gaps | **4/8px** / **12/16px** |
| Inline default | **214×40px**, with the same item offsets |
| Wrap at 150px | **150×68px**, item positions **(0,0), (0,28), (92,28)** |
| Vertical | **280×106px**, y positions **0/28/76px**, nowrap even with wrap requested |
| Vertical tuple `[20,6]` | row/column **6/20px**, height **102px**, y positions **0/26/72px** |
| Align center at 80px high | y positions **30/20/25px** |
| Space-between at 280px | x positions **0/105/230px**, configured column-gap still 12px |
| Native RTL default | x positions **220/128/66px**, original DOM order unchanged |

Explicitly sized direct children retained their authored sizes; no synthetic
stretching wrapper was assumed. Source Flex uses native `justify-content:start`
directly, unlike Space's default conversion to `flex-start`. Existing native Flex
already retains that distinction correctly.

Light/dark geometry was identical. Both source themes return only the same gap
constants, so no palette, shared font token, marker or global theme change is needed.

## Intrinsic-content difference and author opt-in

The oversized-group probe put fixed inner boxes inside three original native group
nodes in a 150px nowrap root. Naive's automatic child minima kept group widths
**60/80/50px**, LTR starts **0/72/164px**, and overflowed by 64px.

Native `.mui-flex > * { min-inline-size:0 }` allowed group widths
**39.796875/53.046875/33.15625px**, starts **0/51.796875/116.84375px**. Fixed inner
boxes were not automatically resized and can overlap. Ordinary ungrouped nowrap
sample items matched; this difference depends on intrinsic content, not gap math.

The [application-owned intrinsic-minimum recipe](../../components/flex.md#narrow-containers-hidden-state-and-fallbacks)
sets `min-inline-size:auto` on those actual groups. Its separate fixture matched
reference geometry in every theme/direction. The native narrow-layout policy is
therefore preserved instead of globally changed merely to match one overflowing
specimen. Root max-inline-size:100% and overflow wrapping remain intentional
adaptations too, not universal source-equivalence promises.

## Pinned RTL provider caveat

With an LTR document and `rtl:[unstableFlexRtl]`, actual Naive output had classes
**`n-flex n-flex--rtl`** but computed **`direction:ltr`**. The pinned and installed
Flex RTL style targets **`.n-space--rtl`**, not `.n-flex--rtl`.

This upstream mismatch was not changed or copied. The retained native contract is
author-owned `dir`, not provider synchronization. All 120 main comparisons used
the explicit native direction on both sides; the provider-only result is not
misrepresented as successful source RTL behavior.

## Author-token and native regressions

- Outer large **12/16px** and nested default **8/12px** remained independent.
- Public row/column **19/23px**, align center and justify space-between overrode
  small presets and inherited into nested roots.
- Resetting nested gap tokens to `initial` restored **8/12px** locally.
- More-specific author CSS before a later package stylesheet retained **5/7px**
  gaps, flex-end alignment and center justification.
- Author Georgia/purple typography inherited; unrelated shared palette/font
  tokens and adding a dark marker did not alter Flex layout.
- `0px` used zero gap; `-1px` and invalid text computed `normal`/used zero;
  `1.5rem` computed and used **24px**. No coercion or size parser is implied.
- Hiding the second direct child removed its unit; the third began at **72px**.
  At 2× CSS zoom its physical start was **144px**.
- Existing tests preserve original lists/links/forms/attributes/listeners,
  meaningful order, native hidden/templates, empty roots and late content.

## Validation and accounting

`node node_modules\vitest\vitest.mjs run tests\flex.test.ts`
→ **15 passed**, including four new budget/default-token/author-sizing regressions.

| CSS source | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,006 | 390 | 1,000 |
| After, unchanged | 1,006 | 390 | 1,000 |

**610 gzip bytes headroom, zero asset delta.** No CSS correction was needed for
retained defaults. The coordinator subsequently ran `pnpm build` and **28 combined
Flex/Result tests** successfully, including all **15 Flex tests**. Built Flex CSS
remains **390 gzip bytes**; integration is complete.

## Remaining contract limits

No reverse/order helpers, slot flattening, automatic role, empty-container removal,
theme/provider object merging, old-browser gap polyfill, size parser or runtime
RTL synchronization is added. Native child boxes, intrinsic sizing and overflow
remain application-owned. No font, color, focus or interaction reset is introduced.

Only Chromium was rendered. Results establish the measured retained layout, not
all-browser/AT, all-content intrinsic geometry or complete framework parity.
