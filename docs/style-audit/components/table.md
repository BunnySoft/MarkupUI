# Table default-style audit

**Status:** integrated CSS-only defaults fixed; Chromium comparison,
2026-09-10. This is the authored native **Table**, not Data Table. No row parser,
renderer, sorting/selection/pagination behavior, grid role or runtime was introduced.

Typography and plain-table palette defaults are corrected. **The existing collapsed,
square border model remains deliberate**, not a claimed match for upstream's rounded
separate-border frame.

## Reference and actual evidence

- Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Sources: [Table](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/Table.tsx),
  [styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/src/styles/index.cssr.ts),
  [theme](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/styles/light.ts),
  [size constants](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/styles/_common.ts).
- Actual reference: installed `naive-ui@2.45.3` / `vue@3.5.30`, light/dark `NConfigProvider`.
  Target pages contain literal native table HTML and external CSS, with no browser script.
- Private session fixture: `files\style-reference\table-audit`, port **4219**. It contains
  case/source/build/server files, `before.json`, `after.json`, `boundaries.json`, and
  `{reference,before,after,legacy}-{light,dark}.png`. No DataEngine artifacts.
- Fresh isolated Chromium contexts, closed in `finally`; viewport 700×1000, DPR 1,
  full-page screenshots, inherited system font and 440px containing sections.
- **25 cases × two themes × four render variants = 200 rendered tables.** Cases include
  all 16 border-flag combinations, three sizes, stripes, row headers, hidden rows, native
  width attributes and authored theme overrides.

## Measured corrections

| Area | Before | Reference / corrected |
| --- | --- | --- |
| Small / medium / large font | 14 / 16 / 18px at a 16px root | **14 / 14 / 15px** |
| Size padding | .375 / .75 / .75rem | **6 / 12 / 12px** |
| Line-height | 1.5 | **1.6** |
| Header weight | 600 | **500** |
| Light body text | `#18181b` | **`#333639`** |
| Light header text | Same as body | **`#1f2225`** |
| Light header / stripe | `#f3f4f6` / `#f4f4f5` | **`#fafafc` / `#fafafc`** |
| Light border | Legacy `#e4e4e7` | **`#efeff5`** |
| Dark body surface / text | `#1c1c1f` / `#fafafa` with themes CSS | **`#18181c` / white .82** |
| Dark header surface / text | `#27272a` / `#fafafa` | **`#26262a` / white .9** |
| Dark stripe / border | `#f4f4f5` / `#3f3f46` | **`#242427` / `#2d2d30`** |
| Default fixture table height | 197px | **190.5625px**, matching source |
| Large fixture table height | 209px | **197px**, matching source |

All **400 cell samples** matched source font size, line-height, font weight, padding and
foreground color. Header/body/default stripe colors match the plain-table theme; the
retained row-header and hidden-row stripe cases are listed below.

The target uses the measured precomposed dark colors rather than layering translucent
header/stripe colors twice. Scoped `data-mui-theme` values are private to Table styling,
so neither shared theme CSS nor a JavaScript provider is required for these neutral colors.
Public Table tokens still win over the local defaults.

Final captured target measurements were identical with later legacy CSS loading.

## Border model and retained differences

1. **Radius remains square:** source computes/renders a 3px frame with separate borders
   and clipped overflow; native Table retains `border-collapse:collapse` and a 0px radius.
   This pass does not add a cosmetic radius property that collapsed borders cannot render.
2. **Perimeter resolution stays native:** hidden-style perimeter suppression preserves
   spanning cells and borderless/bottom-only combinations. All 16 flag combinations remain
   exercised. Separate versus collapsed edge allocation can differ by half-pixel cell
   positions, column widths and source-specific last-row/header-cell lines.
3. **Body row headers:** native `th` participates in its body's row background and divider
   policy, including stripes. Upstream paints all th as headers and suppresses some td
   borders only; those quirks are not copied.
4. **Visible-row striping:** native filtered CSS counts visible body rows. A hidden first
   row therefore changes parity relative to upstream's physical `nth-of-type` positions.
   Native footer summaries remain outside stripes.
5. **Native width hints:** `width="360"` remains 360px; upstream's unconditional 100%
   stylesheet rendered 440px in the same fixture. Authored alignment hints also remain
   preserved instead of being overwritten by header CSS.
6. **No forced nowrap or clipping:** header wrapping, table/cell focus outlines and plain
   nested-table style isolation remain the documented native policy. Caption/colgroup/
   tfoot anatomy is native HTML, not an invented helper runtime.
7. Provider-specific modal/popover color variants, Data Table behavior, browser-specific
   layout/rasterization and screen-reader speech are not claimed by this plain-table pass.

These boundaries are not a claim that every table pixel or source border combination is
identical. Retaining collapsed conflict resolution avoids replacing an existing span/
perimeter contract with last-cell logic, structural parsing or a clipping wrapper.

## Native accessibility and author checks

`boundaries.json` records:

- Browser accessibility snapshot exposes native table “Task hours”, caption, rowgroups,
  columnheaders, rowheaders and cells. No table/grid role was synthesized.
- Authored `headers="alpha hours"` and `rowspan=2` were preserved; the rowheader measured
  94.78125px across two 47.390625px rows. Explicit scrolling remained native.
- No `mui-table` custom-element definition or runtime was present.
- With JavaScript disabled, native required validation blocked an empty submission,
  reset restored “Original”, the disabled button remained disabled, and a normal GET
  submission reached `/markup?note=NoJS`; the returned target document had zero scripts.
- External overrides rendered 17px text, 30.6px line-height, 9px padding, header weight
  700 and an independent `(10,20,30)` header color. At a 20px root font, unoverridden
  Table remained at the pinned 14px / 12px presets; relative public-token values remain
  available when an application wants root-relative sizing.
- Nested light scope inside dark restored body `#333639` on `#fff`.
- Reduced motion yielded `0s` transitions. Forced colors yielded system black text/
  borders on white, and print retained native `table-header-group` display.

Existing tests additionally retain native captions/IDs/colgroups/spans, all border-axis
contracts, hidden/template handling, plain nested-table isolation, node/listener identity,
form semantics and explicit scroll/print behavior. No Data Table test or source was edited.

## Validation and integration gate

- `pnpm test -- tests\table.test.ts`: **15 tests passed**.
  Added checks cover scoped palette defaults, independent header/line-height overrides
  and reduced-motion CSS; existing native contract tests remain intact.
- Source remains exactly one `table.css` file. **JavaScript: 0 bytes; dependencies: zero.**
- CSS measures **1,218 gzip bytes at level 9**, using the build script's accounting,
  below the unchanged **1,500-byte** ceiling.
- No shared/theme/index/generated edits, full build, commit or push. No common change is
  required for the local neutral palette. Parent's isolated release pipeline owns final
  distribution/build acceptance.

The coordinator's isolated release `pnpm build` and all **77 Table/Data Table tests**
passed (15 Table, 62 Data Table). Final CSS is **1,218/1,500** for Table and
**1,693/2,000 gzip bytes** for composed Data Table. That consumer intentionally inherits
the corrected base density/palette; its controller and overlay rules are unchanged.
This does not count Data Table as visually audited. Integration is complete.
