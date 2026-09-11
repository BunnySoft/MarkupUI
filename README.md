# `@dataengine/markup-ui`

Platform-neutral UI components with a dependency-free Web renderer for modern browsers.

The current package is the delivered Web renderer. The approved
[platform architecture](docs/platform-architecture/README.md) introduces `m-*` as the
public Web prefix. The canonical
future model contains components, regions, bindings, templates, actions, capabilities and
fallbacks rather than raw HTML.

The former longer public prefix has been removed; package and asset filenames are unchanged.

## Install

```powershell
pnpm add @dataengine/markup-ui
```

```html
<script type="module">
  import { m } from "@dataengine/markup-ui";

  m.theme.set("light");
</script>

<m-card>
  <m-heading level="2">Customer editor</m-heading>
  <m-field label="Name">
    <m-input m-bind="customer.name"></m-input>
  </m-field>
  <m-button type="primary" m-action="customer.save">Save</m-button>
</m-card>
```

## Direct browser usage

ES module:

```html
<script type="module">
  import { m } from "./dist/markup-ui.js";
</script>
```

Classic script:

```html
<script src="./dist/markup-ui.global.js"></script>
<script>
  m.theme.set("dark");
</script>
```

Both builds automatically install the core stylesheet and register the built-in elements.

## API

The callable `m` entry point organizes public services:

```js
m.actions.register("customer.save", saveCustomer);
m.state.create({ customer: {} });
m.theme.set("dark");
m.html.set(target, untrustedHtml);
m.elements.register("m-chart", ChartElement);
m.use(chartPlugin);
```

The chainable query helper is optional:

```js
m(".customer-card")
  .addClass("selected")
  .on("click", selectCustomer);
```

Web Components, state, actions, themes, security, and plugins do not depend on `MQuery`.

## Components

The component list below describes the current `m-*` Web surface. The first
new-architecture batch migrates Button through Dropdown sequentially to `m-*`.

- Structure: `m-app`, `m-header`, `m-main`, `m-section`
- Layout: `m-stack`, `m-row`, `m-wrap`, `m-center`, `m-spacer`, `m-grid`
- Content: `m-heading`, `m-text`, `m-strong`, `m-code`, `m-link`
- Surfaces: `m-card`, `m-card-cover`, `m-card-header`, `m-card-header-extra`, `m-card-content`, `m-card-footer`, `m-card-action`
- Carousel: `m-carousel`, `m-carousel-viewport`, `m-carousel-item`, `m-carousel-controls`, `m-carousel-readout`
- Feedback: `m-alert`, `m-badge`, `m-tag`, `m-progress`, `m-skeleton`, `m-spin`, `m-empty`
- Media and grouping: `m-avatar`, `m-divider`, `m-button-group`
- Forms: `m-form`, `m-form-item`, `m-field`, `m-input`, `m-textarea`
- Selection: `m-select`, `m-option`, `m-autocomplete`, `m-radio-group`, `m-radio`
- Value controls: `m-slider`, `m-checkbox`, `m-switch`
- Actions: `m-button`
- Navigation: `m-tabs`, `m-tab`, `m-accordion`, `m-accordion-item`
- Selection navigation: `m-menu`, `m-menu-item`, `m-pagination`, `m-steps`, `m-step`
- Data display: `m-list`, `m-list-item`, `m-descriptions`, `m-description-item`, `m-statistic`
- Hierarchy: `m-tree`, `m-tree-node`
- Overlay: `m-dialog`, `m-dialog-header`, `m-dialog-content`, `m-dialog-footer`
- Drawer: `m-drawer`, `m-drawer-header`, `m-drawer-content`, `m-drawer-footer`
- Floating content: `m-tooltip`, `m-popover`, `m-popover-trigger`, `m-popover-content`
- Managed feedback: `m-message`, `m-notification`
- Themes and loading: `m-theme`, `m-include`

## Buttons

```html
<m-button>Default</m-button>
<m-button type="primary">Primary</m-button>
<m-button type="info">Info</m-button>
<m-button type="success">Success</m-button>
<m-button type="warning">Warning</m-button>
<m-button type="error">Error</m-button>

<m-button secondary>Secondary</m-button>
<m-button tertiary>Tertiary</m-button>
<m-button quaternary>Quaternary</m-button>
<m-button dashed>Dashed</m-button>
<m-button type="primary" ghost>Ghost</m-button>
<m-button type="text">Text</m-button>
```

Sizes are `tiny`, `small`, medium by default, and `large`. Shape/state attributes include `round`,
`circle`, `block`, `strong`, `loading`, and `disabled`. The legacy `variant="primary"` form remains
supported.

## State and binding

```html
<m-app>
  <script type="application/json" data-m-state>
    {"customer":{"name":"Ada"},"form":{"busy":false}}
  </script>

  <m-input m-bind="customer.name"></m-input>
  <m-text m-text="customer.name"></m-text>
  <m-button m-disabled="form.busy">Save</m-button>
</m-app>
```

Bindings:

- `m-bind` — two-way `value` or `checked` binding
- `m-text` — one-way text binding
- `m-visible` — one-way visibility binding
- `m-disabled` — one-way disabled-state binding

The store uses explicit path updates and observer subscriptions rather than `Proxy`:

```js
const store = m.state.create({ customer: { name: "Ada" } });
const dispose = m.state.bind(document.body, store);

store.set("customer.name", "Grace");
dispose();
```

For collection binding and customizable item content, see the
[ordered data binding and templates guide](docs/data-binding/README.md). It covers the
web-platform primitives, proposed directive grammar, scopes, keyed native templates,
component composition and implementation plan. The guide does not describe an implemented
collection API.

## Form validation

```html
<m-form>
  <m-form-item label="Name" required minlength="3">
    <m-input m-bind="customer.name"></m-input>
  </m-form-item>
  <m-button m-action="validate">Validate</m-button>
</m-form>
```

`m-form-item` supports `required`, `minlength`, and `pattern` rules with accessible error state.
`m-form.validate()` emits `m:valid` or `m:invalid`.

## Named actions

```html
<m-button
  m-action="customer.save"
  m-param-mode="draft"
>
  Save
</m-button>
```

```js
m.actions.register("customer.save", async ({ store, parameters }) => {
  store?.set("form.busy", true);
  await saveCustomer(parameters.mode);
  store?.set("form.busy", false);
});
```

Markup names registered actions but cannot execute arbitrary JavaScript.

## Compound components

Structured components own their standard layout:

```html
<m-dialog id="editor">
  <m-dialog-header>
    <m-heading level="2">Editor</m-heading>
    <m-button m-action="close">Close</m-button>
  </m-dialog-header>
  <m-dialog-content>...</m-dialog-content>
  <m-dialog-footer>
    <m-button variant="primary">Save</m-button>
  </m-dialog-footer>
</m-dialog>
```

Free-form card and dialog children remain supported. The built-in `close` action targets the
closest `m-dialog` or `m-drawer` when no explicit target is supplied.

## Overlays and feedback

```html
<m-tooltip text="Helpful information">
  <m-button>Hover or focus</m-button>
</m-tooltip>

<m-popover>
  <m-popover-trigger><m-button>Open</m-button></m-popover-trigger>
  <m-popover-content>Popover body</m-popover-content>
</m-popover>
```

```js
m.message.show("Saved", { type: "success" });
m.notification.show({
  title: "Build complete",
  content: "All browser distributions were generated.",
});
```

## Themes

```js
m.theme.register("brand", {
  "color-primary": "#2563eb",
  "color-primary-hover": "#1d4ed8",
  "bg-surface": "#ffffff",
});

m.theme.set("brand");
```

```html
<m-theme name="dark">
  <m-card>Scoped dark content</m-card>
</m-theme>
```

The visual system includes semantic tokens for typography, density, surfaces, interaction states,
focus rings, elevation, and motion. Components share consistent hover, active, focus-visible,
disabled, and reduced-motion behavior.

MarkupUI respects `prefers-reduced-motion` by default. Add `motion="full"` to `m-app` only when
the application deliberately needs full transitions despite that operating-system preference.

## Dynamic and safe HTML

```html
<m-include src="/views/orders.html"></m-include>
```

```js
await m("#workspace").load("/views/orders.html");
m.html.set(target, untrustedHtml);
```

Dynamic HTML is same-origin by default and sanitized before insertion. Scripts, embedded documents,
inline event handlers, unsafe styles, and unsafe URLs are removed.

## Plugins

```js
m.use({
  name: "chart",
  install(api) {
    api.elements.register("m-chart", ChartElement);
    api.actions.register("chart.refresh", refreshChart);
  },
});
```

Plugins install once by name and interact only through public APIs.

## Optional advanced plugin

```js
import { m } from "@dataengine/markup-ui";
import { advancedPlugin } from "@dataengine/markup-ui/advanced";

m.use(advancedPlugin);
```

The advanced plugin provides:

- `m-data-grid` and `m-data-column`
- `m-date-picker` and `m-time-picker`
- `m-upload`
- `m-virtual-list`

```js
const grid = document.querySelector("m-data-grid");
grid.rows = [
  { name: "Ada", score: 98 },
  { name: "Grace", score: 94 },
];

document.querySelector("m-virtual-list").items =
  Array.from({ length: 10000 }, (_, index) => `Row ${index + 1}`);
```

The plugin is distributed separately and does not increase the core browser bundle.

## Optional widgets plugin

```js
import { m } from "@dataengine/markup-ui";
import { widgetsPlugin } from "@dataengine/markup-ui/widgets";

m.use(widgetsPlugin);
```

The widgets plugin provides:

- Breadcrumb and timeline
- Input number, color picker, and rating
- Carousel
- Transfer
- Cascader

These common application widgets remain outside the core bundle.

## Component roadmap

MarkupUI expands in independently testable stages:

1. Foundation and common display components — implemented in 0.3.
2. Overlay services — implemented in 0.4.
3. Forms and selection — implemented in 0.5.
4. Navigation and data display — implemented in 0.6.
5. Optional advanced plugin — implemented in 0.7.
6. Optional application widgets — implemented in 0.9.

Large components remain optional so normal pages do not download the entire catalog.

## Distributions

- `dist/markup-ui.js` — bundled ES module
- `dist/markup-ui.min.js` — minified ES module
- `dist/markup-ui.global.js` — classic script exposing `window.m`
- `dist/markup-ui-advanced.js` — optional advanced component plugin
- `dist/markup-ui-widgets.js` — optional application widgets plugin
- Modular JavaScript and TypeScript declarations
- `dist/manifest.json` — version and measured bundle sizes

The build enforces gzip budgets of 15 KB for core, 3 KB for advanced, and 4 KB for widgets.

## Compatibility

- Existing `m-*` markup remains supported across minor releases.
- Named exports and the namespaced `m` API follow semantic versioning.
- `builtInElementNames`, `m.elements.names`, and `advancedElementNames` expose stable manifests.
- Breaking attribute, property, event, or element changes require a major release.
- See [CHANGELOG.md](CHANGELOG.md) for release history.

## Development

Requires Node.js 20 or newer and pnpm.

```powershell
pnpm install
pnpm build
pnpm test
pnpm demo
```

Legacy CSS and built-in palettes are maintained in CSS/JSON sources. `pnpm build`
regenerates their checked-in compatibility adapters; do not hand-edit those generated files.
See the [foundation and loading guide](docs/naive-ui/foundations.md) for source locations,
external CSS/theme exports, native helper loading and retained legacy behavior.

Open `http://localhost:4173/demo/`. The plain HTML/CSS/JavaScript component browser has
searchable navigation and one independently addressable page per component, for example
`/demo/?component=avatar`. Each current standalone example loads in an isolated frame so
styles, registrations and demo state do not leak between components; its toolbar also
links to the standalone page. The shell itself needs no build step. Component examples
use the browser-ready JavaScript/CSS produced by `pnpm build`.

The older grouped showcase remains available at `/demo/legacy.html`.

## Documentation

The [migration plan](docs/naive-ui/migration-plan.md) organizes phases, tasks and status.
The [Naive UI component index](docs/naive-ui/index.md) tracks component and property-level
planning. Its [architecture](docs/naive-ui/architecture.md) keeps
MarkupUI dependency-free with separate HTML, JavaScript, and CSS. Proposed APIs in these
documents are not implemented APIs or a claim of full Naive UI compatibility.

All 96 catalog scopes have an explicit native implementation, composition or exclusion
resolution; this is not full Naive UI API parity. The [component index](docs/naive-ui/index.md)
links every property-level record. Example standalone usage records:
[Avatar and Avatar Group](docs/components/avatar.md),
[Button and Button Group](docs/components/button.md), and [Card](docs/components/card.md).

See the
[architecture and usage guide](https://github.com/BunnySoft/DataEngine/blob/v10.0/archived/docs/2026/09-%2001-pre-product-roadmap/13-markup-ui-architecture-and-usage.md)
for implementation details, complete API usage, plugin guidance, browser support, and limitations.

## Contributing

Issues and pull requests are welcome through the
[MarkupUI repository](https://github.com/BunnySoft/MarkupUI). Changes should preserve zero
runtime dependencies, include focused tests, and document public API changes.

## License

Licensed under the Apache License 2.0.
