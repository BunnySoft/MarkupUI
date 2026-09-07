# Progress

**Migration status: 🟢 Verified for the retained native scope below.**
Progress uses native `<progress>` for each semantic measure. Linear bars retain native range
semantics and styling; circle/dashboard/multiple-circle visuals are small decorative SVGs,
not a charting or animation runtime.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Progress documentation](https://www.naiveui.com/en-US/os-theme/components/progress)
- [Public API: nineteen properties, default slot and gradient stops](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/demos/enUS/index.demo-entry.md)
- [Progress source and source-only aliases/geometry](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Progress.tsx)
- [Circle source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/Circle.tsx)
- [Multiple-circle source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/progress/src/MultipleCircle.tsx)

The pinned Markdown misspells `offset-degress`; that row and spelling are retained as an
alias, alongside the source's `offsetDegree`. Source-only `viewBoxWidth`, `indicatorPosition`
and theme declarations are tracked separately. There are no documented events or companion
components.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-progress.js` | ESM; exports `MuiProgress`, `registerProgress()`; registers on browser import. |
| `dist/markup-ui-progress.global.js` | Classic script; registers and exposes `MarkupUIProgress`. |
| `dist/markup-ui-progress.css` | External native-track/SVG/indicator/motion CSS. |
| `dist/components/progress/index.d.ts` | Declarations including bounded color/gradient data types. |
| `demo/components/progress.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript demo. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-progress.css">
<script defer src="./vendor/markup-ui-progress.global.js"></script>
<script defer src="./app.js"></script>

<mui-progress percentage="40" label="Upload"></mui-progress>
<mui-progress value="25" max="50" label="Processed files"></mui-progress>
```

Application ESM: `import "@dataengine/markup-ui/progress";`. Serve/link the
`@dataengine/markup-ui/progress/style.css` export through your asset mechanism; plain browsers
import the served JS URL rather than the package specifier. There are zero runtime dependencies.

Load enhanced Progress **before the legacy aggregate** using ordered `defer` scripts or ESM
imports. Existing enhanced definitions are preserved; legacy-first loading reports an explicit
conflict. Do not load both enhanced distributions in one document. The original aggregate
and all prior output sizes remain unchanged.

The classic entry uses an explicit small native-global assignment instead of an unnecessary
bundle export-adapter layer. This keeps both distributions under the original independent
limits without removing features or increasing the core budget.

## Value sources and native ownership

Exactly one native `<progress>` owns each measure's range and accessible name:

1. If `percentage` is supplied, it is authoritative and uses native max 100.
2. Otherwise, host `value`/`max` preserve the legacy ratio contract. Value defaults to 0
   and max to 100; native owners retain those units while the visual indicator shows percent.
3. Otherwise, direct authored native `<progress>` children provide their own values/maxima.
   An absent native max means 1, as HTML specifies; an absent native value is indeterminate.
4. Without an explicit source or authored native measure, the default is determinate 0%.

```html
<mui-progress>
  <label data-mui-progress-label for="file-progress">Processed files</label>
  <progress id="file-progress" value="2" max="4"></progress>
</mui-progress>
```

Native controls move into a managed native group without cloning. Their IDs, labels,
fallback children and listeners are preserved. A native HTML label can be external, or use
`data-mui-progress-label` inside the host to stay outside the custom indicator and occupy its
own row. Ordinary other child content replaces the default visual indicator.

### Bounds, invalid values and indeterminate state

- Percentage and value inputs must be finite numbers. Finite out-of-range values are
  **explicitly clamped** to 0–100 or 0–max, with `data-mui-progress-clamped` marking the
  normalization. Raw host input remains unchanged; status is never inferred as success.
- `max` must be positive and finite. A legacy max of zero is an error, not a silent
  native-max-one fallback or a claim of completed progress. Inactive value/max aliases
  are ignored when an explicit percentage source is supplied.
- Invalid scalar property assignments throw `RangeError` before changing the attribute.
  Invalid declarative/configuration inputs set `data-mui-progress-invalid`, appear in
  readonly `validationErrors`, make `valid` false and hide generated range/graphic output.
  Custom authored indicator content is preserved; no error announcer is invented.
- `indeterminate` / `.indeterminate` is an explicit native target extension: it removes
  value from native owners, so their native `position` is -1. It does not mean zero or
  success. Native authored value absence is also respected.
- `processing` is only a visual linear-fill effect and does not change determinate values,
  infer indeterminate state or mutate application busy state.
- Assignments are silent; no synthetic change/input/ready events or timers are added.

Readonly `controls` exposes the current native owners, and `normalizedPercentages` exposes
bounded percentages or `null` for indeterminate measures. Host value/max getters describe
their alias attributes/defaults, not necessarily an authored native control's source.
Generated owners' values are controlled by the host API; author a native progress element
when native value/max editing and original-state restoration are needed.

## One semantic owner and accessible names

The wrapper does not acquire `role="progressbar"` or range ARIA. A redundant host progressbar
role is diagnosed, not combined with a second generated owner. Do not put another progressbar
inside custom indicator content or interactive controls inside a native `<progress>` fallback.
Actions belong adjacent to the progress component, outside decorative/range descendants.

`label` is a target convenience, with a generic “Progress” fallback; supply a meaningful
task name. Multiple generated owners append their 1-based measure number. For real multi-task
names, author native controls with distinct labels:

```html
<mui-progress type="multiple-circle" percentage="[25,65,90]">
  <progress max="100" value="25" aria-label="Files"></progress>
  <progress max="100" value="65" aria-label="Network"></progress>
  <progress max="100" value="90" aria-label="Index"></progress>
</mui-progress>
```

Native `aria-label`, `aria-labelledby` and HTML label associations take precedence over host
naming shortcuts. Host `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-valuetext`
are fallback conveniences only when the relevant native author values are absent.
Use individual native labels for multiple measures rather than a shared ambiguous name.

Native max/value are the range source of truth. Redundant native `aria-valuenow/min/max`
overrides are temporarily removed to avoid contradictory ranges and restored when the
native control is released/disconnected. Native author values, tab order and managed naming
overrides are also restored then. Different native edits made during a host override become
the restoration baseline; identical writes to an applied override cannot express a new
baseline, so remove the host override first in that case.

For radial types the native owners remain in the accessibility tree but are visually clipped;
their sequential Tab stop is suppressed while clipped and restored in linear/released mode.
The SVG is separately `aria-hidden` and inert. Generated numeric/status indicator content is
decorative to avoid announcing a second value; authored indicator text/ARIA stays author-owned.

No role/live region/busy state or completion announcement is fabricated. A success/error/
warning/info status is explicit appearance, not validation of real application results.
Supply native `aria-valuetext` or adjacent readable status wording when needed.

## Linear, circle, dashboard and multiple geometry

`type` accepts `line`, `circle`, `dashboard`, `multiple-circle`.

- **Line:** a real native `<progress>` track/fill, styled through standard browser progress
  pseudo-elements. Height defaults to 8px, or 24px for an inside indicator; explicit height
  overrides that. Browser-native progress is the fallback when fine styling differs.
- **Circle:** native SVG circles with normalized `pathLength`, not a chart renderer.
  `view-box-width` / `.viewBoxWidth` defaults 100; stroke width defaults 7.
- **Dashboard:** defaults to a 75-degree gap. Circle defaults to zero gap. `gap-degree`
  accepts 0–360; this target uses actual angular degrees rather than copying source
  path-length quirks. A 360-degree gap produces no visible arc.
- `gap-offset-degree` rotates the gap/rail orientation. `offset-degree` / `.offsetDegree`
  rotates circular fill; the pinned `offset-degress` / `.offsetDegress` spelling is also
  accepted. Current spelling wins when both are present. Finite angles are normalized
  modulo 360 for bounded native transforms.
- Zero-valued fill is hidden, preventing a round-linecap dot from looking like nonzero
  progress. Indeterminate radial fill uses a small pulsing arc plus an unknown indicator,
  not a fabricated numeric completion percentage.

Multiple-circle uses independent measures, not a sum. `percentage` must be an array for
this mode, while single-measure modes require a scalar. Empty arrays deliberately represent
zero measures. Arrays are bounded to **16**; geometry must still fit every ring:

`radius(i) = viewBoxWidth / 2 - strokeWidth / 2 - i * (strokeWidth + circleGap)`.

`circle-gap` defaults to 1 and is nonnegative. Nonpositive resulting radii are diagnosed,
not silently dropped or rendered as negative shapes. Each ring has its own native range
owner. Multiple authored native controls can provide ratios and individual indeterminate
states when the host percentage source is absent.

Gap/offset options apply to circle/dashboard, not multiple-circle. Multiple indicator values
are shown below the rings rather than squeezed into a tiny center. Other radial indicators
are centered; `indicator-placement` applies to line. These are explicit native-layout
adaptations, not pixel/Fragment parity.

## Colors, gradients, rails and indicators

Color data is narrowly typed, not an arbitrary render/style object:

```js
progress.color = { stops: ["#2080f0", "#18a058"] };
multiple.color = ["red", { stops: ["green", "blue"] }, "purple"];
multiple.railColor = ["#eee", "#ddd", "#ccc"];
```

- Scalar color applies to all measures. A two-stop gradient requires exactly two valid
  CSS color strings. Arrays are for multiple-circle and must be empty or match its count.
- `rail-color` supports a scalar or per-ring color array, not gradient/style objects.
- HTML uses ordinary color strings or bounded JSON arrays/gradient objects. JSON inputs
  are limited to 8,192 characters; no expressions or callback renderer are evaluated.
- Native linear gradients are declared in external CSS using isolated color variables.
  Radial gradients use native SVG defs/stops with unique per-instance/ring IDs, avoiding
  cross-component gradient collisions.
- `rail-style` string/object forwarding is intentionally omitted; author external CSS
  against native controls/rails instead.

`border-radius` and `fill-border-radius` accept nonnegative numeric pixels or validated
native CSS radius forms (up to four values per axis, with optional slash). The fill follows
the rail radius when unspecified. `indicator-text-color` accepts a validated CSS color.
CSS-wide cascade keywords are excluded from attribute-style adapters; use external CSS
for those operations.

`show-indicator="false"` hides only the visual/custom indicator, not native semantics or
labels. `indicator-placement="inside|outside"` defaults outside; source-only
`indicator-position` / `.indicatorPosition` is a fallback alias. Inside linear text is
centered over the track with a readable backing, not clipped into a zero-width fill.

The default indicator shows bounded values with `unit` (default `%`); unit changes the
suffix, never the range basis. Non-default status adds a small decorative CSS glyph while
retaining numeric context. Custom default child content replaces generated indicator text
without cloning and is outside both native progress and decorative SVG descendants.
Templates remain inert and unconsumed.

## Styling, CSP and lifecycle

Public CSS tokens include `--mui-progress-color`, `--mui-progress-rail-color`,
`--mui-progress-height`, `--mui-progress-size` (120px radial default),
`--mui-progress-border-radius`, `--mui-progress-fill-border-radius`,
`--mui-progress-text-color`, `--mui-progress-font-size`, `--mui-progress-gap` and
`--mui-progress-indicator-background`.

For retained attribute/data APIs, validated dimensions/radii/colors and numeric processing
widths are written only to isolated private custom properties; SVG geometry/paints use
native attributes. No stylesheet strings, CSS-in-JS engine, canvas/chart package, runtime
animation scheduler or measurements are introduced. This is an explicit inline-style/CSP
boundary; prefer external CSS/native markup when such attribute writes are disallowed.

Processing/indeterminate effects are CSS-only. Reduced motion disables those animations.
Computed CSS variables, browser progress-pseudo styling and actual theme contrast remain
application/browser responsibilities; syntax validation does not certify computed appearance.

Live host attributes synchronize immediately; authored native range/name changes and
late/replaced content reconcile on a MutationObserver microtask. Pre-definition properties
are upgraded. Disconnect releases observation and restores managed author attributes/styles.
Reconnect reapplies current host configuration without duplicate native owners.
Generated-part replacement preserves still-owned authored controls/indicator nodes.

## Per-property migration tracker

🟢 Verified retained native target · 🟡 Deliberate representation/boundary difference ·
⏭️ Framework/style-object contract intentionally omitted.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `border-radius` | Validated attribute / `.borderRadius` or external CSS. | 🟢 Native rail radius; numeric/string forms, explicit CSP boundary. |
| `circle-gap` | Numeric attribute / `.circleGap`. | 🟢 Nonnegative per-ring spacing; geometry must fit. |
| `color` | String, two-stop gradient, or bounded per-ring array. | 🟢 Native CSS/SVG paints, not a renderer object. |
| `fill-border-radius` | Validated attribute / `.fillBorderRadius`. | 🟢 Independent native fill radius; rail fallback. |
| `gap-degree` | 0–360 attribute / `.gapDegree`. | 🟢 Actual angular gap; circle 0/dashboard 75 defaults. |
| `gap-offset-degree` | Finite attribute / `.gapOffsetDegree`. | 🟢 Native SVG orientation, modulo normalization. |
| `height` | Nonnegative numeric pixel attribute / `.height`; CSS token alternative. | 🟢 Linear track geometry, including explicit zero. |
| `indicator-placement` | Inside/outside attribute / `.indicatorPlacement`. | 🟢 Linear placement; native center/backing adaptation. |
| `indicator-text-color` | Validated attribute / `.indicatorTextColor` or CSS. | 🟢 Native text color. |
| `offset-degress` | Pinned typo alias to `offset-degree` / `.offsetDegree`. | 🟢 Original row retained; current spelling wins. |
| `percentage` | Finite scalar or bounded array; legacy/native source alternatives. | 🟢 Explicit clamping/diagnosis, no status inference. |
| `processing` | Boolean attribute/property. | 🟢 CSS linear-fill effect, not indeterminate/busy-state inference. |
| `rail-color` | Validated scalar or per-ring colors. | 🟢 Native track/SVG rail colors. |
| `rail-style` | External authored CSS instead. | ⏭️ String/object/array style passthrough omitted. |
| `show-indicator` | `show-indicator="false"` / `.showIndicator`, true default. | 🟢 Visual-only visibility; labels/range owners remain. |
| `status` | Default/success/error/warning/info attribute/property. | 🟢 Explicit color/glyph; no inferred success or live announcement. |
| `stroke-width` | Nonnegative numeric attribute / `.strokeWidth`, default 7. | 🟢 SVG thickness and ring-fit validation. |
| `type` | Line/circle/dashboard/multiple-circle attribute/property. | 🟢 Native range owners plus CSS/SVG visuals. |
| `unit` | Safe text attribute/property, default `%`. | 🟢 Display suffix only. |
| Default slot | Authored custom indicator content. | 🟢 Original nodes/listeners preserved outside presentational descendants. |
| `color.stops` | Exactly two validated native color values. | 🟢 Data-only gradient contract. |
| `viewBoxWidth` (source-only) | `view-box-width` / `.viewBoxWidth`, default 100. | 🟢 Positive native SVG viewBox geometry. |
| `offsetDegree` (source spelling) | `offset-degree` / `.offsetDegree`. | 🟢 Native circular fill orientation. |
| `indicatorPosition` (source alias) | `indicator-position` / `.indicatorPosition`. | 🟢 Fallback only when current placement is absent. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS/custom properties. | ⏭️ Framework provider/theme objects omitted. |

`indeterminate`, label/native accessors, validation diagnostics and value/max are explicit
native/legacy target contracts, not new upstream inventory rows. Presence booleans follow
HTML; only `show-indicator` uses explicit `"false"` to opt out of its true default.

## Numbered migration steps and acceptance

1. [x] Preserve all pinned rows and inspect line/circle/multiple source plus legacy ratios.
2. [x] Choose native semantic owners and explicit scalar/array/indeterminate/name contracts.
3. [x] Implement bounded normalization/validation, aliases and native attribute restoration.
4. [x] Implement native tracks/SVG arcs, actual gaps, offsets, multiple rings and gradients.
5. [x] Preserve author labels/indicator/control nodes and inert templates without a renderer.
6. [x] Implement external status/rail/radius/indicator/motion CSS and CSP boundaries.
7. [x] Validate focused/integration/build/browser gates and fix ownership/naming/radius issues.
8. [x] Keep measured optional budgets by deduplication and a lean classic entry, not relaxed ceilings.
9. [x] Reconcile retained reference rows/four tasks, index totals and master next Statistic.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\progress.test.ts`: **29 focused tests passed**.
- `pnpm build && pnpm test`: declarations and unchanged budget gates passed;
  **270 tests passed** (29 Progress plus all 241 previous tests).
- Coverage includes zero/clamping/nonfinite/max-zero, scalar/array validation and ring fit,
  aliases/source precedence, native ratio/indeterminate semantics, naming/restoration,
  multiple owners, unique gradients, native radius/angle geometry, safe text/paints, templates,
  author identity, pre-upgrade state and disconnect/reconnect.
- Review fixed native member-name collision, radius validation, preservation during owned-part
  replacement, native-control order and native-name precedence. SVG color attrs are not
  overridden by fallback CSS. Shared data parsing and CSS status glyphs reduced payload;
  an explicit classic entry met its original ceiling without dropping features.
- Chromium on the existing port-4187 demo verified one native range owner per measure,
  native labels/max/value/unknown state, separate Files/Network/Index names, 120px radial
  geometry, actual dashboard gaps, independent paints/rails and collision-free gradient IDs.
- Live percentages, indicator-only hiding, invalid-max diagnosis/recovery, reconnect,
  processing/indeterminate CSS and reduced-motion behavior passed. Labelled inside layout
  aligned correctly while native author names beat host shortcuts.
- Classic-before-aggregate preserved rich registration, unclipped native/SVG layout and
  legacy ratio behavior. Separate documents verified ESM pre-upgrade gradients/geometry,
  native control/label identity and explicit legacy-first conflicts. Test-only documents closed.
- Final browser checks covered invalid/intrinsic radius rejection, multi-axis radius syntax,
  explicit out-of-range clamping and unchanged status/one-owner semantics.
- Reference validation retained all 21 original rows plus six source supplements:
  **96 pages, 3,069 rows, 384 tasks (40 accepted), 685 validated relative file links**.
- Core remains **14,611 / 15,000 gzip bytes**, previous outputs unchanged.
  Progress ESM/classic/CSS are **5,936 / 5,968 / 1,497 gzip bytes**, under separate
  **6,000 / 6,000 / 2,500** ceilings; exact values are in `dist/manifest.json`.

This is retained native scope, not all-source behavior/pixel/theme parity or screen-reader/
all-browser certification. Chromium was exercised; browser pseudo-element differences,
computed CSS, theme contrast, naming and announcements require downstream verification.
Statistic is next only through coordinator selection; it is not started by this change.
