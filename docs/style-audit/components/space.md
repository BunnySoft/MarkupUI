# Space default-style audit

**2026-09-10 — integrated; CSS unchanged, native limits documented.** This audit adds focused
regression tests and documentation. It does not modify shared sources, another
component, generated assets, demo files, dependencies or budgets, and runs no full
build or commit.

## Pinned source and isolated rendering

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected `src/space/src/Space.tsx`, `src/utils.ts` within that Space directory,
`src/styles/rtl.cssr.ts`, and `styles/{_common,light,dark,rtl}.ts`.

The private `.space-audit` fixture used existing **Naive UI 2.45.3 / Vue 3.5.30**,
bundled using existing esbuild. Naive pages mounted NConfigProvider/NGlobalStyle/
NSpace, with its actual default wrapper/gap-detection path. Native pages used
author-written equivalent wrapper or direct-child markup and the unchanged Space
source CSS. No showcase/demo CSS or another component's stylesheet participated.
Private Chromium contexts were created and closed without touching a shared page.
The fixture/server were cleaned up afterward.

Both sides used equivalent application typography, explicit stage widths, and
three native sample boxes sized **60×20, 80×40 and 50×30px**. Geometry was measured
relative to each root so page position and provider wrappers could not skew results.
Dark used Naive `darkTheme`; RTL used its actual `unstableSpaceRtl` provider entry
versus native `dir="rtl"`.

## Coverage and results

**28 cases × light/dark × LTR/RTL = 112 comparisons**:

- Default, small, medium, large, scalar 10px, tuple `[20,6]`, zero.
- Inline, vertical, vertical with wrap requested, narrow wrapping and nowrap.
- Align start/end/center/stretch/baseline.
- Justify end/center/space-between/space-around/space-evenly.
- Vertical center alignment and tuple gaps in a column.
- Authored nonshrinking nowrap items.
- Direct-child (source `wrapItem:false`) row, column and narrow wrapping.

Compared root display, direction, flex direction/wrap, align/justify, both gap
values, root width/height, and every item's x/y/width/height.

**108 comparisons matched all measured properties exactly.** The remaining four
are one intentionally retained native minimum-size difference, repeated in each
theme/direction. No missing default gap, alignment or theme change was found, so
there is **no gratuitous CSS edit**.

### Representative measured geometry

| Case | Reference = unchanged native |
| --- | --- |
| Default, 280px row | row/column gaps **8/12px**, root **280×40px**, x starts **0/72/164px** |
| Small | **4/8px**, x starts **0/68/156px** |
| Large | **12/16px**, x starts **0/76/172px** |
| Inline default | **214×40px**, same item offsets as default |
| Wrapped, 150px | Root **150×68px**; item positions **(0,0), (0,28), (92,28)** |
| Vertical default | Root **280×106px**; item y starts **0/28/76px**; nowrap |
| Vertical tuple `[20,6]` | row/column **6/20px**, height **102px**, y starts **0/26/72px** |
| Align center, 80px high | y starts **30/20/25px** for heights 20/40/30px |
| Space-between, 280px | x starts **0/105/230px**; configured column-gap still 12px |
| RTL default | Item x starts **220/128/66px**, original DOM order unchanged |

Light and dark results were geometrically identical. Pinned Space themes return the
same gap constants and consume no common color/font tokens. Native Space therefore
needs no new shared palette tokens or component light/dark rules.

## Honest nowrap difference and opt-in

At 150px with nowrap and fixed inner boxes, Naive generated wrappers kept widths
**60/80/50px**, with LTR starts **0/72/164px**, overflowing the root by 64px.
Native direct-child `min-inline-size:0` allowed the authored wrappers to shrink:
widths **39.796875/53.046875/33.15625px**, starts **0/51.796875/116.84375px**.
The inner fixed boxes do not automatically shrink and may overlap.

This is the pre-existing documented narrow-layout policy, not a new regression.
Automatically replacing it with source-style intrinsic minima would change native
responsive behavior beyond a default-gap correction. Instead the canonical
[intrinsic-item recipe](../../components/space.md#intrinsic-sizing-in-narrow-nowrap-rows)
lets authors select `min-inline-size:auto` for the actual grouping boxes.

That author override restored **exact reference geometry in all four
theme/direction runs**. A separate fixed-group `flex:none` case also matched on
both sides. The application still owns scrolling/overflow. No generated wrapper,
item traversal or special nowrap runtime is added.

Other native sizing adaptations remain explicit: the root has a 100% inline maximum;
authored items use border-box/max-inline-size while source wrappers use content-box
max-width. These affect extreme intrinsic sizes or authored padding and are not
claimed to be universally equivalent.

## Author-token and native regressions

- Outer large preset **12/16px** did not leak into nested default **8/12px**.
- Public row/column tokens **19/23px**, align center and justify space-between
  overrode a small preset and inherited into a nested root.
- Setting nested public gap tokens to `initial` restored that root's **8/12px**
  private defaults without rewriting any ancestor.
- More-specific author CSS before a later package stylesheet retained **5/7px**
  gaps, flex-end alignment and centered justification.
- Author Georgia/purple typography inherited unchanged. Space did not interpret
  unrelated shared font/palette tokens or a newly applied dark theme marker.
- Column-gap `0px` used 0px; `-1px` and invalid text computed to `normal` and used
  0px; `1.5rem` computed/used **24px**. This is native CSS behavior, not validation.
- Hiding the middle item removed its layout unit; the next item's x start became
  **72px**. At 2× CSS zoom it became **144px**, with a 24px physical gap.
- Existing tests retain actual nodes/classes/styles, lists/forms/listeners, empty
  versus hidden item distinctions, templates, bare text, explicit separators and
  native DOM order. No role or wrapper generator is implied.

## Validation and accounting

`node node_modules\vitest\vitest.mjs run tests\space.test.ts`
→ **15 passed**: 11 existing tests plus four theme-neutrality, default-layout,
author-ownership and strict-budget regressions.

| Source CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,122 | 423 | 1,000 |
| After, unchanged | 1,122 | 423 | 1,000 |

**577 gzip bytes headroom; zero source/asset-byte delta.** No shared-source, core,
generated-source or budget change. The coordinator subsequently ran `pnpm build`
and all **15 Space tests** successfully; integration is complete.

## Retained API omissions

The audit does not add reverse helpers, generated item wrappers/classes/styles,
VNode flattening, empty-root removal, provider prop/theme merging, internalUseGap,
old-browser flex-gap measurement/polyfills or a separator API. Native explicit
items, meaningful DOM order and authored gap CSS remain the retained contract.

Only Chromium's modern native-gap path was rendered. This is bounded measured
layout parity, not wrapper-runtime, all-browser, all-intrinsic-content or complete
framework API parity.
