# Legacy Grid default-style audit

**2026-09-11 — complete; no CSS correction required.** Legacy Grid remains an
explicit native migration, not a deprecated Row/Col compatibility layer. There is
no `src/components/legacy-grid`, package export, runtime or distributed stylesheet.
The existing Grid/Flex/Space assets, Legacy Grid test and its two component-owned
documentation pages are the complete audited boundary.

## Pinned source and rendering method

Reference: Naive UI **2.45.3**, commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Inspected and rendered
`src/legacy-grid/src/{Row,Col}.tsx`, `interface.ts`, `styles/{index,rtl}.cssr.ts`,
the public exports and official basic/gutter/offset/push-pull demos.

The source defaults are:

- Row: width 100%, flex row with wrapping, gutter 0, no explicit align/justify.
- Col: span 1 of 24, offset/push/pull 0, border-box inline-block flex item,
  relative positioning and no gutter wrapper at zero gutter.
- Nonzero gutter: expanded Row width, negative half-gutter margins, half-gutter
  Col padding and an inserted content wrapper.
- No palette, typography, radius, motion or light/dark theme values.

A private fixture bundled actual `naive-ui@2.45.3` and `vue@3.5.30` with the
repository's existing esbuild. Chromium 152 on Windows rendered equal 480px stages
at DPR 1. Candidate pages used original native children and the unchanged Grid CSS.
Fresh light/dark and LTR/RTL routes produced **4 retained cases × 4 modes = 16
exact geometry comparisons**. The private server was stopped after measurement;
no fixture or dependency was added to the repository.

## Retained default geometry

The default case used 25 original items so both wrapping and unequal row height
were exercised. Source and native roots were **480×60px**. Tracks were **20px**;
items 1–24 occupied x=0…460px in LTR (460…0px in RTL), and item 25 began at
x=0/y=36px in LTR or x=460/y=36px in RTL. Light and dark were identical.

| Retained case at 480px | Pinned source = unchanged native |
| --- | --- |
| Default span 1 | 24 × 20px tracks, zero gutter |
| Explicit spans 8/16 | x/width **0/160** and **160/320px** |
| Nested 8/16, then 12/12 | nested root **320×36px**; children **160px** each |
| Gutter 12px/8px visible boxes | x/width **0/152** and **164/316px** |

RTL mirrored inline placement while preserving DOM order: the 8-track item was
x=320px and the 16-track item x=0. Nested roots and items remained independent.
The source has no theme variables, so provider light/dark made no geometry change
and no Legacy Grid color or font defaults were invented.

## Deliberately retained topology and layout differences

Visible boxes matching does not mean the algorithms or DOM are equivalent.

- With gutter `[12,8]`, source Row measured **492×32px at (-6,-4)**. Its generated
  Col outer boxes were 164/328px and carried 6px/4px half-gutter padding. The
  native root stayed **480×24px at (0,0)** and its original direct items occupied
  the source inner-content boxes through actual 12px/8px gap.
- Native Grid is CSS Grid, not the source flex Row plus generated Col wrappers.
  It does not add `position:relative`, z-index/vertical-align defaults, a containing
  block or a gutter-dependent wrapper around author content.
- Native `min-inline-size:0`, `max-inline-size:100%` and `overflow-wrap:anywhere`
  remain intentional narrow-container protections, not source intrinsic-sizing
  parity.
- Offset/push/pull physical displacement, margin-left RTL behavior, 1–24 class
  generation, provider injection/error handling, Number/string coercion and
  gutter formatting remain omitted.
- Grid absolute start lines and authored spacers remain narrower alternatives;
  they do not recreate source relative offset packing or push/pull overlap.

These differences preserve native topology, semantic nodes, form ownership,
listeners, focus and public author tokens rather than manufacturing old Vue boxes.

## Author and regression checks

The existing fixture now checks the pinned zero-gutter defaults directly:
24 columns, zero x/y gaps, normal alignment/justification, span 1 and auto start.
It also verifies inline public tokens remain authoritative for columns, tracks,
gaps, alignment, justification, span and start.

Existing regressions continue to cover semantic containers, labels/fieldsets,
native reset and FormData, hidden/disabled behavior, RTL DOM order, nested defaults,
viewport/container rules, native disclosure, no script/runtime/export and the
absence of legacy attributes or physical reorder CSS.

## Validation and accounting

`node node_modules\vitest\vitest.mjs run tests\legacy-grid.test.ts`
→ **14/14 passed**.

| Reused source CSS | Raw bytes | Gzip level 9 | Existing ceiling | Headroom |
| --- | ---: | ---: | ---: | ---: |
| Grid | 1,448 | 527 | 1,500 | 973 |
| Flex | 1,006 | 390 | 1,000 | 610 |
| Space | 1,122 | 423 | 1,000 | 577 |

All three assets are unchanged: **3,576 raw / 1,340 gzip bytes**, zero delta.
There is no Legacy Grid asset or budget. The unchanged application recipe remains
**7,347 raw / 2,483 gzip HTML** and **2,457 raw / 760 gzip CSS**.
No ceiling was relaxed, generated distribution was edited, full build was needed,
or commit was created.

## Bounded result

The pinned default 24-way placement and selected visible span/gutter/nesting
geometry are retained by the existing native replacement. Source wrapper geometry,
relative displacement and framework lifecycle are intentionally not retained.
Only Chromium was rendered; this is not all-browser/AT, arbitrary-content,
old-framework or full algorithm parity. See the
[canonical migration guide](../../components/legacy-grid.md) and
[pinned inventory tracker](../../naive-ui/components/legacy-grid.md).
