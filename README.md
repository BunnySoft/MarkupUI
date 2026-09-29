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

## References

- [Previous package usage](docs/archive/overview.md) preserves earlier API examples.
- [Reference archive](docs/archive/README.md) contains prior implementations, discussions
  and comparisons. These are context, not the current design.
