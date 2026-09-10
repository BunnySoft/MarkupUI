# Heatmap

**🟢 Verified retained calendar-by-week scope.** The pinned component is a calendar
heatmap, not an arbitrary matrix/chart. The native adaptation keeps real date/value
cells, bounded Gregorian range, explicit numeric domain/bands, text legend and
persistent keyboard/touch detail. No D3/ECharts/chart canvas/provider/renderer.

## Baseline and implementation evidence

The unchanged [registry](../../../src/components/elements.ts) has no heatmap.
The [native owner](../../../src/components/heatmap/heatmap.ts) and
[bounded model](../../../src/components/heatmap/model.ts) reuse existing
[Calendar date-only arithmetic/validation](../../../src/components/calendar/date.ts).
[External CSS](../../../src/components/heatmap/heatmap.css) owns geometry/palette/focus/media.
See [canonical contract/acceptance](../../components/heatmap.md),
[default-style audit](../../style-audit/components/heatmap.md),
[tests](../../../tests/heatmap.test.ts) and [local fixtures/demo](../../../demo/components/heatmap.html).

Pinned [props and normalization](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/Heatmap.tsx#L44-L225),
[month/week table](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/Heatmap.tsx#L227-L464),
[data/types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/public-types.ts#L3-L21),
[gap/color/loading utilities](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/utils/index.ts#L21-L158),
[Rect/Tooltip](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/Rect.tsx#L45-L89)
and [indicator](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/ColorIndicator.tsx#L22-L42)
were reviewed. Source local-midnight timestamps, gap-to-zero/last-duplicate-wins,
max-only color mapping and fabricated loading matrix are deliberately not copied.

## Migration steps

**Delivery phase:** P6 — visualization. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted native Calendar/date-only and owned native table/text/focus
conventions. Tooltip is not a mandatory dependency; persistent detail is explicit.
**Next task:** Marquee, separately. Broad P0 foundation task IDs stay open/partial.

1. [x] **Specify input semantics.** Canonical dates, bounded range/data, rejected
   duplicates, missing versus zero, signed finite domain and normalized thresholds.
2. [x] **Author cells and legend.** Native caption/table/headers, literal date/value/
   level text, safe external palettes, deterministic domain and non-color alternatives.
3. [x] **Add exploration.** One real roving button tab stop, complete scoped keys,
   persistent nonlive detail and stable visible date identity, not title-only Tooltip.
4. [x] **Verify edges.** Empty/missing/zero/negative/constant/clamped domains, leap/
   year bounds, bounded scale, callbacks/ownership/media/no-JS/build evidence.

### Native primitives and fallback

The application authors a readable native date/value table, legend and cell template.
Enhancement produces at most 7×54 padded calendar cells, with actual values/Missing
and five band codes, not thousands of tab stops. No grid role is assigned. Native
buttons/headers and a persistent text inspector serve keyboard/touch/reading users;
there is no mandatory popup, hover-only title or chart engine. Original fallback nodes
restore on disconnect. No data request, random mock generator or layout polling exists.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/heatmap)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **20 original table rows + 7 original supplements + 4 explicit grouped/type
supplements + 3 source-behavior supplements + 3 inherited theme rows = 37 tracker rows**.
Every original 27 identity/link remains one-for-one. **26 native adaptations +
11 intentional omissions; zero unresolved.** Referenced Tooltip types are composition,
not inherited APIs. Native date-only/domain/detail adaptations are not source timestamp,
loading/Tooltip/VNode/theme or all-browser/AT/chart parity.

### Heatmap Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`active-colors`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L36) | Prop | Exactly five #RRGGBB numeric-band colors overriding external theme colors. No arbitrary CSS/string-array renderer; includes numeric L0. | 🟢 Verified |
| [`color-theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L37) | Prop | Null default uses the pinned built-in light/dark palette; five explicit green/blue/orange/purple/red palettes replace the four active colors while retaining the scheme minimum. | 🟢 Verified |
| [`data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Prop | Bounded readonly date/value records; canonical Gregorian date strings replace ambiguous day timestamps. Duplicate dates reject. | 🟢 Verified |
| [`first-day-of-week`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L39) | Prop | Source-compatible 0 Monday..6 Sunday; explicitly converted to Calendar's Sunday-based weekday arithmetic. | 🟢 Verified |
| [`fill-calendar-leading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L40) | Prop | Shows supported leading calendar dates as Missing, never fabricated zero. Trailing padding stays blank. | 🟢 Verified |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L41) | Prop | Native aria-busy and explicit updating status while real supplied values remain visible/inspectable. No skeleton animation or request owner. | 🟢 Verified |
| [`loading-data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Prop | No second synthetic/loading data model or null-hidden placeholder renderer. | ⏭️ Intentionally omitted |
| [`minimum-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L43) | Prop | Validated #RRGGBB override for numeric L0, after activeColors. Missing remains separately hatched/labelled. | 🟢 Verified |
| [`show-color-indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L44) | Prop | Show/hide generated legend bands, preserving original legend introduction/suffix/controls. | 🟢 Verified |
| [`show-month-labels`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L45) | Prop | Optional native month column groups; exact week headers/caption remain. | 🟢 Verified |
| [`show-week-labels`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L46) | Prop | Visual weekday text toggle, never removal of native row-header semantics/alignment. | 🟢 Verified |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L47) | Prop | small/medium/large external control sizing, deliberately larger native targets than source tiny rectangles. | 🟢 Verified |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L48) | Prop | No TooltipProps forwarding, hover-only title or required popup. Use the persistent native inspector. | ⏭️ Intentionally omitted |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L49) | Prop | Author external --mui-heatmap-x-gap; no arbitrary inline geometry string API. | 🟢 Verified |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L50) | Prop | Author external --mui-heatmap-y-gap; native table spacing, not JS layout calculations. | 🟢 Verified |

### Heatmap Slots

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L58) | Slot | Original native footer/controls remain; no wrapping renderer. | 🟢 Verified |
| [`indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L59) | Slot | Original legend container plus owned native band list; values and ranges remain text. | 🟢 Verified |
| [`indicator-leading-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L60) | Slot | Original legend-leading markup, not generated locale/provider content. | 🟢 Verified |
| [`indicator-trailing-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L61) | Slot | Original legend-trailing markup remains. | 🟢 Verified |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Slot | Literal describe(cell) annotation in a persistent nonlive detail paragraph; no Tooltip/VNode slot compatibility. | 🟢 Verified |

### Exported helper

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`heatmapMockData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L66) | Method | No random/runtime mock-data export. Separate deterministic local fixtures are application data. | ⏭️ Intentionally omitted |

### Original data/loading/detail inline fields

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`data.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Inline field | date=YYYY-MM-DD; no local-midnight/UTC bucketing inferred from an instant. | 🟢 Verified |
| [`data.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Inline field | Finite Number in ±1e12 or null/undefined Missing; zero remains an actual numeric observation. | 🟢 Verified |
| [`loading-data.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Inline field | No separate loading timestamp/placeholder model. | ⏭️ Intentionally omitted |
| [`loading-data.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Inline field | No hidden-null versus animated-numeric loading cells. | ⏭️ Intentionally omitted |
| [`tooltip.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Inline field | Persistent detail/explore cell.date is canonical date-only text. | 🟢 Verified |
| [`tooltip.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Inline field | Actual numeric value or explicit Missing, plus supplied/band/clamping metadata; no opaque renderer. | 🟢 Verified |

### Explicit grouped/public type supplements

These four type identities/groups were absent from the original row expansion.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`HeatmapData / HeatmapDataItem`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/public-types.ts#L3-L7) | Source public type group | Readonly bounded native date/value records; timestamp ABI deliberately replaced. | 🟢 Verified |
| [`HeatmapFirstDayOfWeek`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/public-types.ts#L19) | Source public type | Validated 0 Monday..6 Sunday, distinct from Calendar's Sunday-based option. | 🟢 Verified |
| [`HeatmapColorTheme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/theme.ts#L9) | Source public type | Five named external palettes; no theme object ABI. | 🟢 Verified |
| [`HeatmapTooltipSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/public-types.ts#L9) | Source public type | Native readonly HeatmapCell/detail data instead of Tooltip slot injection. | 🟢 Verified |

### Explicit source behavior supplements

These are reviewed internal behaviors, not new public utility export promises.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`completeDataGaps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/utils/index.ts#L47-L86) | Source behavior | Source gap-to-zero/last-duplicate-wins logic omitted; native dates remain Missing and duplicates reject before mutation. | ⏭️ Intentionally omitted |
| [`calcColorByValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/utils/index.ts#L22-L35) | Source behavior | Source max-only/negative-to-min mapping omitted; explicit signed domain, normalized thresholds, constant-domain and clamping contract replaces it. | ⏭️ Intentionally omitted |
| [`createLoadingMatrix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/utils/index.ts#L142-L158) | Source behavior | No synthetic 7×53 Date.now/zero/black loading matrix. | ⏭️ Intentionally omitted |

### Explicit source-inherited theme props

The [source spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/src/Heatmap.tsx#L45)
adds three inherited source rows.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No provider/theme graph or chart stylesheet installer. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No CSS-in-JS object merge; explicit public `--mui-heatmap-*` overrides remain authoritative over built-in and named defaults. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal override precedence; broad P0/legacy exceptions stay independent. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
