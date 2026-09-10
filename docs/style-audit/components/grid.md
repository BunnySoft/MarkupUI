# Grid default-style audit

**2026-09-10 — integrated; CSS unchanged, native limits documented.** Only Grid-specific tests and
its canonical/audit documentation changed. No shared source, other component,
generated asset, root demo, dependency, full build or commit was changed.

## Pinned source and isolated method

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected `src/grid/src/{Grid,GridItem}.tsx`, grid defaults, official offset/self/
screen-responsive examples and the actual configuration breakpoint dictionary.
Neither Grid owner declares the theme-prop mixin; no theme API is inferred.

The private `.grid-audit` fixture bundled existing **Naive UI 2.45.3 / Vue 3.5.30**
using existing esbuild. Reference pages mounted actual NConfigProvider/NGlobalStyle/
NGrid/NGridItem with the normal packing and responsive-observer paths. Candidate
pages used equivalent native items and unchanged Grid CSS.

Native responsiveness was implemented only in private **application fixture CSS**:
descendant container queries at 400/600px and viewport media queries at 640/1024px.
Those declarations mirror selected reference examples for measurement; they are
not a new package breakpoint dictionary or responsive-string parser.

Fresh private Chromium contexts isolated runs. Equal available frame widths,
24px-tall native samples and equivalent application typography controlled geometry.
Observer/query updates were allowed to settle before reading computed tracks and
item rectangles. The fixture and local server were cleaned up after verification.

## Retained geometry matrix

**10 retained cases × 5 viewport/frame pairs × light/dark × LTR/RTL = 200
comparisons, all matching exactly** in computed tracks, gaps, root dimensions and
visible item IDs/x/y/width/height:

- Default 24 columns; four columns; explicit 12px x / 8px y gaps.
- Mixed spans 2/1/1/3/1; a full-width span; source span-zero visibility translated
  to native hidden.
- Self-responsive columns/gaps and self-responsive item span/visibility.
- Screen-responsive columns/gaps and screen-responsive item span/visibility.

The four offset/oversized-span diagnostic cases below are **not included as
retained-algorithm parity**.

### Fixed geometry at 480px

| Case | Source = unchanged native |
| --- | --- |
| Default | **24 × 20px** tracks, zero gaps, one-column items |
| Four columns, x=12/y=8 | **111px** tracks; item x positions **0/123/246/369px** |
| Next row | y **32px** for a 24px row plus 8px gap |
| Span 2 | **234px** wide |
| Span 3 | **357px** wide |
| Full span 4 | **480px** wide |

Light/dark geometry was identical. Native RTL reversed inline track direction
without reversing DOM order; valid automatic spans matched the reference.

### Independent self/screen responsiveness

Source self descriptions: columns `2 400:4 600:6`, x-gap `0 400:12 600:20`,
y-gap `0 400:8 600:10`; first responsive item span `0 400:1 600:2`.
Screen descriptions used `2 s:3 m:4`, with the pinned **s=640, m=1024px**
breakpoints and first item span `0 s:1 m:2`.

| Viewport / actual frame | Self columns | Screen columns | First self item | First screen item |
| --- | ---: | ---: | --- | --- |
| 500 / 320px | 2 | 2 | hidden | hidden |
| 800 / 480px | 4 | 3 | span 1 | span 1 |
| 1100 / 640px | 6 | 4 | span 2 | span 2 |
| 1100 / 320px | 2 | 4 | hidden | span 2 |
| 500 / 480px | 4 | 2 | span 1 | hidden |

The last two rows deliberately decouple viewport and container width. A native
button in the hidden item rejected focus at 320px and the **same node** accepted
focus after the wrapper widened to 640px.

Only the visible layout footprint is compared for source span zero: Naive removes
the item from rendered children, while native hidden/display:none preserves DOM.
No source lifecycle or VNode filtering parity is claimed.

## Measured genuine native limitations

All examples here use a 480px/four-column grid with 12px gaps.

### Oversized spans are not clamped

For source span 7, Naive clamps to four columns. Native Grid creates implicit tracks.
The following one-column item measured **111px** in Naive versus **102px** natively;
native computed tracks were four 102px tracks plus three zero-width implicit tracks,
with the additional gaps consuming space. No JS span validator/clamp was added.

### Relative offsets are not absolute lines or atomic spacers

| LTR case | Source item x | Native alternative x |
| --- | --- | --- |
| Two simple `offset=1` items / explicit spacers | **123/369px** | **123/369px** |
| Span 3, then offset 1 + span 1 on next row | **123px** | **0px** with a separately wrapped spacer |
| Span 2, then offset 1 / absolute start line 3 | **369px** | **246px** |

Naive includes offset in packed span and then uses physical `margin-left` inside
that area. In RTL, the simple spacer case measured source x **369/123px**, versus
native logical spacer x **246/0px**. Some other RTL offset probes coincidentally
align because the physical margin and packing differences cancel; this is not a
general offset-equivalence contract.

The existing native absolute-start/spacer alternatives stay explicit. No relative
offset algorithm, atomic packing, suffix reservation or overflow signal is invented.

### Query wrapper maximum sizing is intentional

An initial oversized-frame probe assigned 640px inside a 500px parent. The native
query wrapper's max-inline-size:100% bounded it to **500px**; the unbounded source
stage stayed **640px**. That was not an equal-available-width comparison and is
excluded from the 200 matches. The corrected matrix uses widths that fit their
parents. Authors own any deliberate maximum-size override and overflow/scroll policy.

## Author and scope regressions

- Ancestor `--mui-grid-cols:7`, gap 19px and span 3 did not configure a descendant
  grid/item: root reset to **24/0px** and its direct item reset to **span 1/auto**.
- More-specific author CSS before a later package sheet retained **3 columns,
  7px x / 5px y gaps, center/end alignment**, and item **span 2/start 2**.
- A two-column-spanning nested grid measured **234px**, independently defaulted to
  **24 × 9.75px** tracks/zero gap, and reset its own children to span 1.
- Authoring the inner grid as two columns/4px gap gave **115/115px** tracks.
- Explicit custom tracks `80px minmax(0,1fr)` overrode an authored count of three:
  **80/393px** with a 7px gap in 480px.
- Author Georgia/purple typography inherited unchanged. Shared font/palette tokens
  and a dark marker did not introduce any Grid layout/theme behavior.
- Invalid negative gap computed to `normal`; a zero span token remained a visible
  native item, not a hidden source-span-zero emulation.
- Existing tests preserve native lists/forms/listeners, hidden/templates,
  details/summary, direct child identity and non-dense meaningful DOM order.

## Tests and budget

`node node_modules\vitest\vitest.mjs run tests\grid.test.ts`
→ **16 passed**: 12 existing plus four budget, native-track, author-placement and
bounded-query/offset-contract regressions.

The CSSOM test environment does not faithfully rank a preceding class rule against
later `:where()` custom-property defaults. Inline preservation is tested there;
ordinary external author-before-package precedence was verified in **Chromium**
above rather than claiming that environment proved it.

| Source CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,448 | 527 | 1,500 |
| After, unchanged | 1,448 | 527 | 1,500 |

**973 gzip bytes headroom; zero asset delta.** No source correction is required
for retained geometry. The coordinator's isolated release build and all **89
Code/Log/Grid tests** passed, including **16 Grid tests**. Built Grid CSS remains
**527 gzip bytes**. Unfinished Button motion was excluded from this release snapshot;
no budget was relaxed and no generated file was manually edited.

## Remaining API boundary

Responsive parsers/observers, private placement props, span/offset clamping,
collapsed-row budgets, reserved suffix packing, overflow slot values, framework
SSR/layout-shift flags and constructor aliases remain omitted. Native authored
queries/disclosure/spacers are deliberately narrower alternatives, not replacements
for those algorithms. Only Chromium was rendered; this is not all-browser,
all-content, hydration/zero-CLS or complete framework parity.
