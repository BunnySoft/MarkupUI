# Heatmap default-style audit

**2026-09-11 — pinned palette and compact visual roles aligned; native data-button
topology retained.** Only Heatmap-owned model defaults, CSS, the existing Heatmap test
fixture and Heatmap documentation changed. No shared index, demo, dependency, generated
distribution file or commit was touched.

## Reference and correction

Compared MarkupUI with Naive UI **2.45.3** at
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`: `Heatmap.tsx`, `Rect.tsx`,
`ColorIndicator.tsx`, component CSSR, light/dark theme files and common theme values.
The pinned medium rendering owns 12px/400 text, 11px rectangles, 2px radius, 3px gaps,
`#333639`/white `.82` text and a fit-content column layout.

The previous native CSS used unrelated five-step colors, inherited typography, roughly
13.6×24px bordered swatches, 4px gaps and 600/650 header weights. It also treated
`green` as the implicit theme even though upstream's unset `colorTheme` uses separate
built-in light/dark active colors.

After the pass:

| Role | Pinned/default result |
| --- | --- |
| Built-in light levels | `rgba(46,51,56,.09)`, `#9be9a8`, `#40c463`, `#30a14e`, `#216e39` |
| Built-in dark levels | white `.1`, `#0d4429`, `#006d32`, `#26a641`, `#39d353` |
| Medium type/rect/gap/radius | 12px / 11px / 3px / 2px |
| Small | 12px / 10px / 2px |
| Large | 14px / 12px / 3px |
| Text | `#333639` light; white `.82` dark |
| Layout | flex column, fit-content inline size capped at 100% |

The model default is now `colorTheme: null`, so the built-in scheme palette is used.
Explicit green/blue/orange/purple/red themes use the pinned four active colors and keep
the scheme-specific minimum, matching upstream precedence. Validated `activeColors`,
`minimumColor` and authored public `--mui-heatmap-*` values still win. A Chromium probe
confirmed the light/dark L0 and L4 colors and an authored `#123456` L4 override.

## Retained native differences

- MarkupUI keeps a captioned native table, seven row headers, exact date/value/band
  text and real labelled buttons. It does not replace these with 10–12px hover-only
  rectangles or a div matrix.
- Medium buttons remain 48×48px minimum (small 44px, large 56px), while only the
  decorative swatch matches the pinned rectangle size. Full-year views scroll.
- All seven weekday names remain available; upstream visually renders alternating
  weekday labels. Native month/week headers and exact week semantics remain.
- Public x/y gaps retain their logical horizontal/vertical meaning rather than copying
  the pinned CSSR's reversed `border-spacing` variable order.
- Missing remains a labelled hatch, zero remains numeric, and focus/current outlines
  remain visible. No Tooltip, fabricated loading matrix, provider graph or animation
  owner was added.
- Reduced motion removes the new color transition. Forced colors use Canvas/CanvasText
  and Highlight; print uses a light black-on-white surface, visible borders and full
  ISO dates. These are native readability policies, not source media parity claims.

## Validation and budget

`pnpm exec vitest run tests\heatmap.test.ts --reporter=dot` passes **57 tests**
(52 existing plus 5 regressions). `pnpm exec tsc --noEmit -p tsconfig.json` passes.
The component was measured in memory with the same esbuild settings as
`scripts/build.mjs`, without writing `dist`.

| Asset | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Heatmap CSS before | 4,106 | 1,126 | 2,000 |
| Heatmap CSS after | 7,423 | **1,680** | **2,000** |
| ESM helper after | 20,413 | **7,824** | **8,000** |
| Classic helper after | 20,698 | **7,956** | **8,000** |

No blockers. Full repository build and shared audit/status aggregation remain outside
this component-owned pass.
