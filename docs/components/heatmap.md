# Heatmap: bounded native calendar data and non-color meaning

**🟢 Verified retained calendar-by-week scope.** Seven weekday rows and bounded week
columns, real date/value text, five deterministic numeric bands, a native legend and
persistent keyboard/touch detail. No D3/ECharts/canvas-only chart, provider, random-data
generator, generic matrix renderer or mandatory Tooltip.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/heatmap` | createHeatmap, buildHeatmap, heatmapLevel and data/cell/model/settings/controller types |
| `dist/markup-ui-heatmap.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-heatmap.global.js` | MarkupUIHeatmap namespace; refuses replacement |
| `@dataengine/markup-ui/heatmap/style.css` | Explicit native table/palette/legend/focus/scroll/media CSS |
| [Local demo](../../demo/components/heatmap.html) | Separate HTML/CSS/JS and deterministic local data cases |
| [Complete reference](../naive-ui/components/heatmap.md) | All 27 original identities plus explicit type/source/inherited additions |

```html
<section class="mui-heatmap" data-heatmap tabindex="-1" aria-labelledby="activity-title">
  <h2 id="activity-title">Daily measurements</h2>
  <div data-heatmap-scroll>
    <table data-heatmap-table>
      <caption>Daily measurements: <span data-heatmap-caption>February 2024</span></caption>
      <thead data-heatmap-head><!-- Authored Date/Value headers --></thead>
      <tbody data-heatmap-body><!-- Authored readable date/value rows --></tbody>
    </table>
  </div>
  <template data-heatmap-cell>
    <td><button type="button" data-heatmap-day>
      <span data-heatmap-swatch aria-hidden="true"></span>
      <time data-heatmap-date></time>
      <span data-heatmap-value></span><span data-heatmap-code></span>
    </button></td>
  </template>
  <div data-heatmap-legend>
    <strong>Value bands</strong>
    <ul data-heatmap-bands><!-- Authored fallback legend --></ul>
    <span>Original explanatory text remains.</span>
  </div>
  <p data-heatmap-status>Static date/value data.</p>
  <p data-heatmap-detail>Inspect a date.</p>
</section>
```

```js
import { createHeatmap } from "@dataengine/markup-ui/heatmap"
const heatmap = createHeatmap(document.querySelector("[data-heatmap]"), {
  data: [
    { date: "2024-02-01", value: -4 },
    { date: "2024-02-05", value: 0 },
    { date: "2024-02-29", value: 20 }
  ],
  firstDayOfWeek: 0 // Heatmap uses source numbering: Monday=0, Sunday=6.
})
// heatmap.set(...), heatmap.explore("2024-02-05"), heatmap.disconnect()
```

Use a named native div/section[data-heatmap] with tabindex=-1 for focus fallback.
The original heading level/content/ARIA, caption prefix, footer/controls and native form
fields remain. One captioned **table, not role=grid**, has native thead/tbody; one legend
container holds a native ul/ol band list and optional original leading/trailing content.
Detail/status are separate plain nonlive p/div/span nodes.

The application authors readable, noninteractive fallback head/body/band nodes.
Enhancement parks those exact nodes and restores them on disconnect. The cell template
is one native td with one labelled-by-enhancement type=button, native time, value/code
text and decorative swatch. No IDs, autofocus, nested actions/forms/custom elements or
scripts are accepted. Labels are written as text/attributes, not HTML.

No-JS keeps the original actual data table and legend, not visible dead cell buttons.
Load external CSS explicitly. Missing date/Intl support or invalid configuration fails
before replacing a healthy view; no chart/date/Tooltip polyfill or external fetch occurs.

## Date-only calendar model and scale bounds

The pinned source is a weekday-row/week-column calendar. This adaptation does not
invent a generic chart matrix. It reuses Calendar's native canonical validation,
Gregorian ordinal/weekday arithmetic and explicit UTC formatting carrier, without
importing Calendar UI or changing its existing assets.

Records are `{date:"YYYY-MM-DD", value?: number | null}` in positive four-digit
Gregorian years **0001..9999**. No Date object, timestamp, datetime-local, timezone or
UTC/local-midnight bucketing is inferred. Convert/aggregate instants to the intended
business date explicitly in application code first.

- `data` defaults to []; at most **366 records** before processing.
- `range` is null (derive earliest/latest record dates) or an explicit inclusive
  `[startDate,endDate]`. It must be ordered and contain at most **366 days**.
- Every record must lie inside an explicit range. Duplicate dates reject atomically;
  no last-wins or implicit sum/average guesses are made.
- Week padding is at most **7×54 = 378 cells**. Oversized sparse ranges reject before
  array/DOM expansion. A leap year can legitimately require 54 columns.
- Empty data with no range yields a clearly empty table, not a guessed current year.
  An explicit range with no numeric records yields Missing dates.

`firstDayOfWeek` retains **Heatmap source numbering: 0 Monday..6 Sunday**, default 0.
This differs from Calendar's Sunday-based option and is converted explicitly.
Labels use native Intl with calendar=gregory and timeZone=UTC; locale cannot silently
change the calendar, and no local DST arithmetic occurs. Locale affects date names,
while canonical date/value text stays machine-readable and exact to JavaScript Number.

`fillCalendarLeading=false` leaves leading calendar padding blank. True exposes valid
leading dates as **Missing**, never fabricated zero. Trailing padding is blank. Dates
beyond 0001/9999 stay blank. Requested range and visible leading-date extent are distinct
in cell.inRange/state; data records themselves still must be within the requested range.

Month column groups use the first in-range date in each week. A week may contain dates
from adjacent months, especially with leading fill; exact week headers/full date names
disambiguate it. DOM order is native weekday rows across chronological week columns.
It is not a chronological list reordered with CSS.

## Missing, zero, signed values, domain and thresholds

Values are finite JavaScript Numbers within **-1e12..1e12**. Strings/NaN/Infinity/
out-of-bound values reject; this explicit range keeps normalization subtraction finite.
No decimal-money or arbitrary-precision claim is made. Actual values use round-trippable
String(Number) text (including -0), not a formatter that silently displays tiny values as zero.

**Missing is not zero.** An absent record and an explicit null/undefined value both
have no numeric level, but supplied/detail metadata distinguishes them. A supplied 0
is a real numeric observation. Source gap-to-zero and hidden-null semantics are not used.

`domain` is null (infer min/max from actual numeric records only) or an explicit ordered
bounded `[min,max]`. No numeric data means inferred domain=null; an explicit domain can
still describe future data. An out-of-domain value keeps its actual visible number but
clamps its band position to 0/1, with low/high metadata and a visible `*` beside its level.

For a nonconstant domain:

`p = (clamp(value,min,max) - min) / (max-min)`

Clamping happens **before division**, including tiny/subnormal domains. Equal domain
values map to p=0.5; below/above a constant domain map to 0/1. Thus all-zero data uses
the middle band with the default thresholds, not the Missing hatch.

`thresholds` is exactly four strictly increasing finite **normalized positions** inside
(0,1), default `[.2,.4,.6,.8]`. They are not raw value thresholds. Values exactly at a
threshold enter the higher band. Five level intervals are lower-inclusive/upper-exclusive,
except L4 includes p=1. Explicit thresholds also apply to constant-domain p=0.5.

The legend states these position intervals; the status states the exact domain, formula,
constant-domain policy and outlier clamping. This avoids falsely rounded/duplicate numeric
threshold labels for very close floating-point bounds. No data/threshold failure silently
becomes black, NaN, zero or an accepted partial dataset.

## Palette and non-color meaning

| Option | Default / contract |
| --- | --- |
| colorTheme | green; green/blue/orange/purple/red external CSS palettes |
| activeColors | null, or exactly five #RRGGBB colors for numeric L0..L4 |
| minimumColor | null, or #RRGGBB override for numeric L0 after activeColors |
| showColorIndicator | true; hides/shows owned band list, not author legend prefix/suffix/controls |
| showMonthLabels | true; toggles month group row, not exact caption/week semantics |
| showWeekLabels | true; visually hides row-header text when false, never its semantic cell |
| size | medium; small/medium/large native target sizes |
| loading | false; aria-busy and updating text, keeping actual data inspectable |
| locale | en-US; bounded supported native date-label locale |
| describe | null or synchronous literal annotation callback, <=512 characters per visible date |

Numeric colors are five CSS levels, not source's arbitrary active-array length plus
minimum color. Custom colors override the theme; minimumColor overrides only L0.
Missing has a separate native CSS hatch and explicit “Missing/No value” text.
Color is applied to a swatch, not as unreadable text over arbitrary dark backgrounds.
Actual value, date and L0..L4/`*` text remain visible outside the swatch. The legend uses
the same levels. Native title-only hover is not substituted for accessible detail.

Only validated hex color custom properties are written by JS. No arbitrary CSS colors,
URLs, variables, style strings or injected rules are forwarded. External CSS owns
geometry, palette, focus and responsiveness, including --mui-heatmap-x-gap/y-gap.
Native targets are deliberately larger than source tiny rectangles; full-year views
can scroll horizontally rather than shrink to inaccessible hit areas.

Loading is observation, not a request or second dataset. There is no loadingData,
Date.now/zero/black placeholder matrix, random heatmapMockData export, loading animation,
server request, chart renderer or implicit data generator.

## Keyboard/touch inspection and native semantics

Every supported visible date, including Missing, has a **real labelled type=button**.
One date is the tab stop; others have tabindex=-1. There are at most 378 padded cells,
not thousands of fake focusable elements. Native caption, rowheaders, columnheaders and
cell semantics remain; no grid/gridcell/tab roles or fake grid keyboard parity.

- Up/Down move one weekday row within the same week, stopping at blanks/edges.
- Left/Right move one week in the physical direction; RTL reverses horizontal deltas.
- Home/End choose the first/last supported week in the current weekday row.
- Ctrl+Home/End choose the first/last supported date in the entire shown calendar.
- Tab leaves normally. Shift/Alt/Meta/composition and unrelated control keys are not handled.
- Enter/Space use native button click exactly once. No duplicate keyboard activation.

Focus updates the persistent detail/readout and current marker without a selection/form
value. Click or explicit `explore(date)` emits one mui:heatmap-explore record, even if
already current; merely moving focus does not emit an activation. Detail is nonlive
because the focused button already has the full date/value/level label. It is usable
by touch and reading users, not an inaccessible hover-only Tooltip.

Current-date state is inspection, not a selected business date or `aria-current=date`
“today” claim. No field is hidden or submitted. Focus is retained on the same native
date button when still visible; if an updated range removes it, the named tabindex=-1
scope is the fallback. Outside focus is not stolen. Missing a record within a retained
range changes that cell to Missing rather than destroying its identity.

## Model, updates, callbacks and restoration

`buildHeatmap(document, options)` returns frozen cells/model metadata without rendering.
It uses native date validation, hence the explicit Document argument. `heatmapLevel`
is the small bounded numeric classifier shared by the model/legend contract.

`createHeatmap` exposes model/state/error and `set(settings)`, `refresh()`, `explore(date)`,
`disconnect()`. set merges explicit settings; refresh re-evaluates the captured data/
callback state. Data/range/domain/palette arrays and records are copied/frozen, not
watched for external mutations. Replace data explicitly when it changes.

Model cells expose date, actual value/null, supplied, inRange, row/column, level/
normalized position/clamping, full label and literal detail. State exposes requested
start/end, weeks, actual date-cell count, numeric/missing counts, domain, currentDate
and loading. Source timestamps and opaque TooltipProps are not compatibility fields.

All dates/data/bounds/thresholds/colors and every describe result are prepared before
committing. describe receives a frozen cell record and must return a synchronous string,
not Promise/HTML/DOM/VNode. Throwing/invalid callbacks leave the previous complete view.
Reentrant set/refresh/explore during prepare/commit rejects; disconnect is allowed and
prevents stale writes. Native action failures emit mui:heatmap-error; explicit invalid
API changes throw. Valid set/refresh emits mui:heatmap-change after commit.

Original native head/body/legend nodes are parked and restored by identity on teardown.
Owned generated rows/cell values replace only declared regions, not root headings,
caption prefixes, author legend/footer controls or form inputs. Same-range updates
retain cell nodes/listeners. External replacement of owned anatomy rejects and
disconnects rather than overwriting the author replacement. Only still-owned styles/
attributes/text restore. Removed owners disconnect automatically; rebind explicitly.

No timer, animation frame, geometry measurement loop, storage/network, sound, clipboard
or arbitrary renderer is owned. No input-value mutation or auto-submit occurs.
Time/Countdown/Number Animation and other earlier assets are unchanged.

## Scale, media and acceptance limits

The supported maximum is a 366-day range with at most 378 padded cells / 54 weeks.
The actual leading-date count can be up to 372 plus blank trailing cells. This is
bounded calendar exploration, not general matrix/chart or unlimited history parity.
Native horizontal scrolling handles narrow/zoomed/year views. Print/forced-colors
retain actual values/date labels/level codes; background graphics and fitting a wide
year onto paper are not guaranteed. Use application print layout/export policy when
needed. No universal AT/browser/Tooltip/theme promise is made.

## Acceptance — 2026-09-10

1. Actual calendar date/value model, missing/duplicate/range/domain/threshold rules verified.
2. Native table/legend/value text, external safe palette and non-color meaning verified.
3. Roving native inspection, persistent details, callbacks/focus/identity/forms/lifetime verified.
4. Source dispositions, actual native browser data/color/scale/media/fallback and build budgets recorded.

Targeted gate: `pnpm test -- tests\heatmap.test.ts tests\calendar.test.ts tests\native.test.ts`.
**133 tests pass (52 Heatmap, 54 shared Calendar, 27 native/legacy).**
Build/declarations/budgets: `pnpm build`. Level-nine gzip: **7,822 ESM / 7,956 classic /
1,126 CSS**, combined **8,948 / 9,082**, under **8,000 / 8,000 / 2,000** ceilings.
Core/advanced/widgets stay **14,611 / 2,181 / 2,779**. Full raw/catalog details are in the
[current index acceptance](../naive-ui/index.md#heatmap-accepted).

Observed Chromium: the local signed dataset produced domain [-4,20], four numeric/
35 missing date cells. Actual 0 remained numeric L0 while Missing had no level and a
distinct hatch; -4 used rgb(227,243,230) and 20 used rgb(20,83,45). Explicit colors
plus minimumColor produced rgb(255,236,179) for L0 and rgb(30,58,138) for L4. All-zero
data had domain [0,0] and levels [2,2,2]. Missing-only data had no numeric domain.

ArrowRight moved one week, Ctrl+End reached the last date, Enter emitted one inspection
and Tab left to the original footer action. Native AX showed a table, caption, row/
column headers and date buttons, not a grid. The 2028 leap-year boundary case had
54 columns, 378 padded slots, 372 real date buttons and **one** date tab stop; actual
scroll width was 3010px in a 1086px viewport. Year 0001 was Monday, not 1901;
9999 ended Friday. Duplicate/oversized updates kept the previous view and Thai's
Buddhist locale preference still labelled Gregorian 2024.

RTL/2x zoom retained seven semantic row headers even with visual labels hidden.
Forced-colors removed swatch color/pattern while literal Missing and 0 remained;
print exposed full ISO dates from native time metadata. No-JS retained all five
authored date/value rows and no dead day buttons. At 375px, strict self-hosted CSP with
connect-src:none kept the real dark-green max swatch and literal `<b>` detail text,
using a 318px native scrollport for 418px content. Teardown restored original rows/
legend/heading and focused the named scope. Classic Heatmap, native Date Picker year
0001 and unchanged legacy date behavior coexisted without mui-heatmap registration.
