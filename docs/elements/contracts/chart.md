# Chart

**Status: implemented Web baseline; required release acceptance remains open.**
The source and [demo/API](../../../demo/components/chart.html) now implement the first-batch
types and five source forms. Browser/accessibility/performance acceptance and approval of
the new renderer-inclusive payload ceiling remain release gates.

Logical identity: `Chart`. Web identity: `<m-chart>`, extending the shared `ViewElement`.
Apache ECharts is the selected Web renderer, not a dependency of the shared core or
unrelated components. Native renderer mappings are outside this first Web delivery.

## 1. Properties and configuration

Markup must closely follow ECharts option names and object nesting instead of introducing
a competing chart configuration vocabulary.

| Proposed Web surface | ECharts option mapping |
| --- | --- |
| `m-chart-title` | `title` |
| `m-chart-tooltip` | `tooltip` |
| `m-chart-legend` | `legend` |
| `m-chart-dataset` | `dataset` |
| `m-chart-x-axis`, `m-chart-y-axis` | `xAxis`, `yAxis` |
| `m-chart-series` | `series` |
| `m-chart-encode` within a series | That series' `encode` |
| `m-chart-label` within a series | That series' `label` |
| Kebab-case attributes such as `dataset-id` | Camel-case properties such as `datasetId` |

Configuration elements represent objects; scalar attributes represent their properties.
Repeated collection elements form arrays in document order. Nesting determines ownership.
Validate supported names, types and cardinalities explicitly. Similarity to ECharts does
not promise support for every ECharts option.

Required configuration modes:

- Declarative children, with direct typed properties and attributes.
- `chart.option = option` for existing ECharts configurations in trusted application code.
  This is a Web-specific direct-option mode, mutually exclusive with configuration children.
  No implicit merge or precedence between the two modes is permitted.

Do not implement a generic property engine, runtime metadata lookup or expression evaluator.
Use concrete component accessors and an explicit adapter to ECharts. Generated API metadata
remains demo-only.

## 2. Content model and example

The following markup uses the implemented declarative configuration:

```html
<m-chart aria-label="Monthly sales" style="height: 320px">
  <m-chart-title text="Monthly sales"></m-chart-title>
  <m-chart-tooltip trigger="axis"></m-chart-tooltip>
  <m-chart-legend></m-chart-legend>

  <m-chart-dataset id="sales-data">
    <script type="application/json">
      [
        {"month": "January", "sales": 120},
        {"month": "February", "sales": 180}
      ]
    </script>
  </m-chart-dataset>

  <m-chart-x-axis type="category"></m-chart-x-axis>
  <m-chart-y-axis type="value"></m-chart-y-axis>

  <m-chart-series type="bar" name="Sales" dataset-id="sales-data">
    <m-chart-encode x="month" y="sales"></m-chart-encode>
    <m-chart-label show position="top"></m-chart-label>
  </m-chart-series>
</m-chart>
```

The adapter must preserve the equivalent option structure:

```js
{
  title: { text: "Monthly sales" },
  tooltip: { trigger: "axis" },
  legend: {},
  dataset: {
    id: "sales-data",
    source: [
      { month: "January", sales: 120 },
      { month: "February", sales: 180 }
    ]
  },
  xAxis: { type: "category" },
  yAxis: { type: "value" },
  series: [{
    type: "bar",
    name: "Sales",
    datasetId: "sales-data",
    encode: { x: "month", y: "sales" },
    label: { show: true, position: "top" }
  }]
}
```

Configuration children and authored accessible content must survive chart updates.
Keep renderer-owned Canvas/SVG content separate from those children. Nested charts must
not contribute configuration to an ancestor chart.

## 3. Required first-batch chart types

| Base type | Required variants |
| --- | --- |
| Bar (`bar`) | Vertical columns, horizontal bars, grouped and stacked series |
| Line (`line`) | Single and multiple series; category and numeric axes |
| Area | Line variant using `areaStyle`, not a separate base chart type |
| Pie (`pie`) | Standard pie and doughnut via inner/outer radius |
| Scatter (`scatter`) | Basic numeric X/Y plots |

Shared features include multiple series, dataset field mappings, titles, axes where
applicable, legends, tooltips, labels, responsive sizing, themes and explicit loading,
empty and error states.

Defer radar, gauge, funnel, chart heatmaps, candlestick, treemap, sunburst, Sankey, graph,
maps and custom charts. Bubble sizing, percentage normalization and dual-axis combinations
also require later contracts. The existing calendar Heatmap family is not this chart adapter.
Direct-option mode does not imply that deferred ECharts modules are bundled or supported.

## 4. Required data sources

All five source forms are required in the first release:

| Form | Proposed authoring |
| --- | --- |
| JavaScript variable/property | `dataset.source = sales` |
| Scoped state binding | `<m-chart-dataset data-bind-source="report.sales">` |
| JSON attribute | `<m-chart-dataset source='[{"month":"January","sales":120}]'>` |
| Nested JSON | One child `<script type="application/json">` as illustrated above |
| Remote JSON file or API | `<m-chart-dataset src="/api/sales" source-path="data.rows">` |

Nested JSON remains supported; it is neither removed nor the only source format.
The `source` property receives actual values; the attribute and nested JSON are parsed
as data, never executed. Dataset inputs must cover object rows, two-dimensional arrays
and column-oriented objects, with explicit `dimensions`, `sourceHeader` and series
`encode` mappings where needed.

One active source is permitted per dataset. Reject conflicting declarations instead of
silently overriding them. Switching source kinds must be explicit; a normal update within
the active property/binding channel replaces that source's current value.
Use reassignment or explicit refresh for application updates, not hidden deep observation.

Scoped binding follows the [selected binding language](../../binding/01-language.md):
paths in an explicitly supplied scope, not JavaScript expressions or global variable lookup.
The optional scalar binder assigns actual values through `data-bind-source` within an
explicit store/root. Dataset tests and the live Chart demo verify reassignment through
this channel; an inert binding attribute does not satisfy this feature.

Remote loading is a MarkupUI responsibility, separate from ECharts options. `source-path`
selects response data through a restricted, safe property path; omit it when the response
itself is the dataset. Provide cancellation, stale-response protection, explicit error
reporting and `reload()`. Custom authentication or request logic stays in application code,
which assigns `.source`; do not put credentials or executable fetch logic into markup.
CSV, streaming transports, typed-array conveniences and dataset transforms are deferred
unless separately contracted.

## 5. Behavior, rendering and accessibility

- Validate data and configuration before committing an update. Specify how removed series,
  datasets and axes leave the renderer; do not let stale merged configuration survive.
- Initialize only when the host has usable dimensions. Support resizing, initially hidden
  containers becoming visible, data changes and theme changes without duplicate instances.
- Cancel requests and release renderer instances, observers, listeners and tasks on
  disconnect. Reconnect from current configuration without losing authored content.
- Define typed interaction and loading/error events, their payloads and flags. Programmatic
  updates must not fabricate user-intent events.
- Provide meaningful accessible names/descriptions and an accessible data-table alternative.
  Validate keyboard and screen-reader behavior rather than treating generated ARIA as proof.
- Do not evaluate expressions, callbacks or arbitrary HTML from markup or remote data.
  Review tooltip rendering, URLs, JSON parsing, response paths and remote requests as
  security boundaries. Direct-option mode is for trusted application configuration.
- Preserve selectable delivery: Chart, its ECharts adapter/modules and CSS must be optional.
  No aggregate dependency, copied core or mandatory ECharts import in unrelated families.
  Keep implementation under `src/components/chart`; extraction does not change ownership.

## 6. Implemented baseline decisions

- ECharts 6.1.0 is pinned and built into an optional renderer asset. No npm production
  dependency, core import or unrelated-family import makes Chart mandatory. License and
  notice files ship with the package. NodeNext development typechecking uses ECharts'
  own unbundled declarations because its rolled-up declarations omit ESM extensions.
- SVG is the default; Canvas is selectable. Light and dark are the initial themes.
  Chart height defaults to 320 pixels. A zero-size surface waits for ResizeObserver
  or explicit resize. Theme/renderer changes recreate the owned instance.
- Title, tooltip, legend and each Cartesian axis are singletons. Dataset and series
  are ordered collections, capped at 16 and 32. IDs are optional but unique within a
  chart. Series accepts one Encode and one Label. Unknown options fail explicitly.
- Source cells are strings, finite numbers or null. Array rows have equal widths;
  column arrays have equal lengths. Object rows may omit fields. Dimensions are unique
  string names; sourceHeader is true, false or auto. Dataset transforms, streaming and
  declarative series-local data are deferred. Direct option mode covers trusted series
  data but still requires a separate tableSource.
- Property and binding share one source channel. JSON attribute, JSON script and remote
  src are exclusive alternatives. Dispose an active binding before clearSource() and
  explicit switching. Reassignment or refresh is the update boundary, not deep watching.
- Remote requests accept only same-origin HTTP(S), omit credentials, reject redirects,
  require a JSON content type, enforce a streamed 1 MiB limit and time out at 15 seconds.
  Safe dot paths reject prototype members. Disconnect and switching abort the request;
  generations prevent stale results. No automatic retry is performed.
- Reload keeps the last successful data while loading. Errors are explicit; Chart clears
  its instance and table on validation/loading failure. reload() rejects and emits
  m:chart-data-error. Dataset changes emit m:chart-data-change. Chart emits m:chart-state,
  m:chart-error and m:chart-select (seriesIndex, dataIndex, name, value). These custom
  events bubble, are not cancelable and are not composed. Programmatic writes do not
  emit selection intent.
- Each dataset is bounded to 10,000 rows and 64 columns. The native data disclosure
  includes dataset selection and 50-row table pagination. Accessible naming is required.
  Direct options require tableSource, keeping the alternative independent of callbacks.
- Updates use notMerge=true and lazyUpdate=false. Declarative tooltips use rich-text
  rendering, not HTML. Direct callbacks/options are trusted application code. Animation
  defaults off and reduced-motion preferences override direct animation requests.
- New provisional ceilings are 12,000 gzip bytes per Chart wrapper, 235,000 per renderer,
  250,000 for core+wrapper+renderer, and 1,500 for CSS. These do not increase any existing
  ceiling and still require release approval. Startup/update/memory measurements and
  supported-browser acceptance remain mandatory, not inferred from these size caps.

## 7. Release acceptance

Chart blocks the production release until all of the following pass:

- [x] Settle the detailed contract and implement all first-batch types and five source forms.
- [x] Verify markup-to-option equivalence, property validation, source conflicts, collection
  updates/removals, optional binding and direct-option exclusivity.
- [x] Test remote success, malformed JSON/data, HTTP errors, cancellation, out-of-order
  responses, source changes and disconnect/reconnect.
- [x] Verify actual nonblank charts, resize/hidden-to-visible behavior, updates and
  interactions in supported desktop/mobile browser layouts.
- [ ] Validate accessibility, readable fallback data, theme changes and resource cleanup.
- [ ] Test selectable ESM/classic delivery and packed consumer exports, with one shared
  ViewElement and no ECharts cost for consumers that do not select Chart.
- [ ] Approve and enforce measured renderer-inclusive payload/performance budgets without
  increasing unrelated component ceilings.
- [x] Publish working examples for every first-batch type and source form, source-generated
  API documentation, loading requirements and supported-option limitations.

Implementation order: Bar establishes the data/adapter/lifecycle contract, followed by
Line/Area, Pie/Doughnut and Scatter. Partial type coverage or property assignment without
the other required data-source forms does not satisfy the release gate.

## 8. Recorded verification

September 23, 2026, Windows / Node 22.12.0: all 56 focused Chart tests passed, including
real ECharts SVG SSR, source cancellation/timeout, pre-upgrade values, reduced motion,
observer disposal and ESM/classic shared-core delivery. The full suite passed 4,694 tests
across 127 files, with no failures or skips.

`pnpm test:browser` passed Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.6 at
1280x900 and 375x812. Checks cover all six demos, binding/reload, actual selection,
nonblank SVG/Canvas, resize, theme changes, keyboard data disclosure and portable
label/disclosure primitives. Screenshots and machine-readable evidence are generated
under `.vite/browser`; these are headless desktop engines with mobile-sized layouts,
not real mobile-device or screen-reader acceptance.

The desktop 10,000-row line benchmark repeated mount/update/dispose 20 times per engine.
Mean mount/update durations were 30/28 ms (Chromium), 39/41 ms (Firefox), and 118/42 ms
(WebKit). Chromium's post-GC node/listener counts remained 2,275/155 before and after;
used JS heap increased by 432,328 bytes. These are local observations, not approved
performance ceilings or proof of no possible leaks.

The initial dependency audit identified an ECharts 6.0.0 advisory affecting the unbundled
Lines series. ECharts is now pinned to patched 6.1.0 and the three-engine Chart browser
regression passed again. Vitest is pinned to patched 4.1.11; the subsequent registry audit
reported zero advisories. The isolated package's Affix declaration conflict is also fixed.
These fixes do not waive the remaining release acceptance gates.

## References

- [Production release gates](../../architecture/09-production.md)
- [Source ownership](../../architecture/06-source.md)
- [Selected-file delivery](../../architecture/07-modules.md)
- [Element contract model](../01-contract.md)
- [Component development and acceptance](../04-development.md)
