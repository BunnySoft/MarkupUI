# MarkupUI

`@dataengine/markup-ui` defines platform-neutral UI elements with selectable Web
implementations for modern browsers. The optional Chart family uses application-supplied
Apache ECharts via `configureChartEngine(echarts)`; MarkupUI does not bundle or download it.
The application owns ECharts loading, module registration and licenses. Unrelated components
require no chart engine. See the [Chart setup examples](demo/components/chart.html#required-files).

**Status: development staging; production release is blocked.** The Web implementation
includes 89 selectable component families, an optional all-components bundle, the
separate root facade and plugins.
Components use the shared `ViewElement` base and direct properties; API data is generated
separately for demos. Chart and explicit scalar/model binding are implemented, as are
inline Web conditional/keyed templates with nested item scopes, portable
ListTemplate and If regions, paired IDs and scoped action arguments. Root-local
references and explicit programmatic Web template sources are implemented. Native-target mappings are
design contracts, not delivered SwiftUI, Flutter or CLI renderers.
See the [release evidence and remaining gates](docs/architecture/09-production.md).

## Design

| Concern | Direction |
| --- | --- |
| Web components | Unprefixed classes based on `ViewElement`, registered as `m-*` elements. |
| Metadata | Development-only data extracted from source; no production metadata lookup. |
| Content | Explicit regions, preserved authored nodes and native browser semantics. |
| Binding | Optional scalar/model data flow, keyed templates, portable ListTemplate/If, paired IDs and explicit scoped action arguments. |
| Styling | Component CSS and theme resources; short, scoped `data-part` / `data-state` markers. |
| Development | One canonical API; no compatibility aliases or migration layer. |
| Delivery | Small shared core plus independently selectable components/plugins, without a jQuery dependency. |
| JavaScript authoring | Optional fluent builders over real elements; plain JS, no consumer compiler. |
| Agent UI | Standalone optional A2UI v1.0 minimal-catalog renderer; not full protocol conformance. |

The [element directory](docs/elements/05-element-index.md) lists current family tags
separately from root/plugin elements. Presence in the directory does not establish
production acceptance. Services and style resources do not acquire artificial wrappers.

## Documentation

For applications that deliberately need the complete catalog, use
`@dataengine/markup-ui/all` and `@dataengine/markup-ui/all/style.css`.
Exports stay in family namespaces, for example `all.button.Button` and
`all.dataTable.DataTable`. Do not mix this entry with selected component entries
or a second full runtime. It shares core and the Chart adapter; ECharts remains
application supplied. See [loading and costs](docs/architecture/07-modules.md#optional-full-catalog).

Start with the [documentation guide](docs/README.md).

Try the [JavaScript UI / A2UI playground](http://localhost:4173/demo/ui-api.html).
The [builder API](docs/api/02-ui-builders.md) and [A2UI API](docs/api/03-a2ui.md) explain
the optional ESM entries, their dependencies and the deliberately limited A2UI catalog.

| Topic | Purpose |
| --- | --- |
| [Architecture](docs/architecture/README.md) | Understand the model, Web/native boundaries and full rewrite. |
| [API](docs/api/README.md) | Load the shared core and only the implemented components you use. |
| [Elements](docs/elements/README.md) | Read current contracts, decisions and coverage. |
| [Binding](docs/binding/README.md) | Understand the selected data-flow and template design. |
| [Styling](docs/styling/README.md) | Apply the presentation model and review visual behavior. |

## Development

Use Node 22.12 or later in the 22.x line, or Node 24+, and the pinned pnpm 10.28.0.
CI is configured for Windows, Linux and macOS on Node 22/24; browser acceptance runs separately.

| Command | Purpose |
| --- | --- |
| `pnpm install --frozen-lockfile` | Install the locked development dependencies. |
| `pnpm build` | Generate distributions and warn on exceeded size recommendations. |
| `pnpm test` | Run the existing test suite; use focused fixtures while changing a component. |
| `pnpm test:package` | Pack the built files and verify exports, types and imports in an isolated consumer. |
| `pnpm test:browser` | Verify Chart, primitive, Form, aggregate ESM/classic and HTML-policy workflows in installed Playwright browser engines. |
| `pnpm test:catalog` | Also check every catalog page and Virtual List scrolling in all three browser engines. |
| `pnpm demo` | Serve the development examples. |

Implementation remains in separate TypeScript, CSS, shared-type and entry files. No `.mkl`
language or consumer-side framework/compiler is required by this rewrite.
Read the [source pattern](docs/architecture/06-source.md) and
[module delivery design](docs/architecture/07-modules.md) before changing the code.

### Fieldnotes example website

After `pnpm install --frozen-lockfile` and `pnpm build`, run `pnpm demo` and open
[Fieldnotes](http://localhost:4173/demo/site/). Its six linked pages cover a workspace
overview, projects, team, insights, resource library, and settings. The Library page
includes a component coverage map. The original component reference remains at `/demo/`.

The website under `demo/site` is **HTML-first, with ordinary deferred script tags**,
like a traditional jQuery/Bootstrap site, with **AJAX-style page navigation**. Internal
navigation replaces only the contents of `#main`; the header, sidebar, footer and shared
overlays keep their actual DOM nodes. There are no application module imports, JSX,
routing framework or website build. Edit and refresh.
The library's TypeScript needs rebuilding only when library source changes or `dist`
is missing. Serve over HTTP rather than opening `file://`, because shared HTML
fragments are fetched from the same origin.

| Edit | Responsibility |
| --- | --- |
| `index.html`, `projects.html`, etc. | Page structure, controls, footer and explicit CSS/script tags. |
| `partials/*.html` | Shared header, sidebar, navigation and notification/drawer markup. Links are relative to the hosting page. |
| `site.css`, `icons.svg` | Shared application styling and an authored SVG icon sheet. |
| `site.js` | Load shared fragments with MarkupUI's `m(...).load()`, navigate between pages, and provide page lifecycle/local helpers. |
| `overview.js`, `projects.js`, etc. | Page-specific sample data and event handlers using `m(...)` and direct component APIs. |
| `catalog.js` | Coverage-map data, loaded by Library only; not an asset loader. |

This all-controls demo **deliberately selects the optional full catalog** for simple,
consistent loading. The head loads core, state, the root facade (`m` / `MarkupUI`),
the Chart adapter, and `MarkupUIAll`, followed by `site.js` and the page's script.
Keep that dependency order. The `m-styles` stylesheet link marks the root styles as
already installed, leaving `site.css` last for application overrides.
Other applications can still load only their selected families; the aggregate is
not a new library requirement. Do not mix the full catalog with selected component
scripts or ESM factories in the same page.

Start with `demo/site/index.html` and `demo/site/overview.js`. A page script follows
this ordinary JavaScript pattern:

```js
Fieldnotes.page("overview", function () {
  m("#refresh-overview").on("click", () => {
    document.getElementById("site-loading").start()
  })
})
```

`Fieldnotes.page(id, initialize)` registers a page initializer. It runs after the
shared shell on a direct visit, and again whenever that page's content is loaded.
Keep page data and helpers inside that callback so classic scripts do not share
top-level declarations. Return a cleanup function for application-owned timers and
controllers; it runs before leaving the page. Components handle their own disconnect
lifecycles. This is a demo helper, not another UI framework or a new core dependency.

Ordinary same-site links, menu items and `Fieldnotes.navigate("./projects.html")` use
the same navigation path. URLs/titles/selected menus update, Back/Forward work, and
every HTML file still supports direct loading and refresh. Same-page anchors, external
links and modified native link clicks retain browser behavior. New page visits focus
the main region and scroll to the top or requested anchor. Transient page state resets
on each visit; browser-stored projects/preferences persist.

Only the six authored same-origin documents are eligible for partial navigation.
The helper parses their HTML and imports `#main` content, upgrading the detached
component tree before connecting it and preserving authored SVG and
native forms; it is **not an arbitrary-HTML loader or sanitizer**. Response scripts
and document heads are never copied. Only known page scripts/dependencies are loaded,
once per document, with ECharts first loaded when Insights is visited. Shared shell
fragments still use the existing sanitized `.load()` API.
Failed requests leave the current content usable with a visible error; newer
navigation cancels older requests. A failed Back/Forward request restores the visible
page's URL. No full-page reload is used as a silent fallback.

Projects authors its native `<form>` explicitly so controls retain form ownership.
Insights similarly authors the Popselect's native button and choice panel so ownership
survives container reconnection, and creates its chart with options before connecting it. Its engine remains
the local `demo/vendor/echarts.global.js` build.

The shared classic library assets measure **349,142 JavaScript + 66,816 CSS gzip bytes**
(415,958 combined), excluding page assets and ECharts. Insights adds 203,838 gzip bytes
for ECharts. These are individual-file gzip level-9 sums, not dev-server transfer sizes.
The existing full-catalog classic runtime remains above its advisory recommendation
(331,554 vs. 315,000 bytes); no limits or frozen S0 baseline were changed.
This is the explicit convenience-versus-payload tradeoff for this demo.
Data Table's themed native pager adds 314 gzip bytes to its selected stylesheet:
2,502 bytes versus the 2,500-byte advisory recommendation. Its JavaScript and
dependencies are unchanged; the 2-byte CSS overage is reported rather than removing
control states or changing the frozen baseline.

The separate `/demo/ui-api.html` playground continues to demonstrate optional fluent
builders and A2UI using their ESM entries. Those are alternative authoring examples,
not dependencies of the HTML-first Fieldnotes pages.

All data is illustrative. Projects and preferences persist in this browser's local
storage; other interactions are page-local previews. File selection never uploads,
the sample verification code does not authenticate, and no backend is required.
`pnpm test:showcase` checks the six pages, actual component coverage, local workflows,
persistent shell identity, repeated page visits, Back/Forward, navigation errors/races,
the JavaScript/A2UI playground, and desktop/mobile layouts in installed Playwright
Chromium (`pnpm exec playwright install chromium`).

## References

- [Previous package usage](docs/archive/overview.md) preserves earlier API examples.
- [Reference archive](docs/archive/README.md) contains prior implementations, discussions
  and comparisons. These are context, not the current design.
