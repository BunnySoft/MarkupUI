# `@dataengine/markup-ui`

Dependency-free, HTML-first Web Components for modern browsers.

MarkupUI combines normal `mui-*` HTML, native browser behavior, optional state and actions, CSS
themes, safe dynamic HTML, and a small jQuery-inspired API organization. It has no runtime package
dependencies, virtual DOM, JSX, or required consumer framework.

## Install

```powershell
pnpm add @dataengine/markup-ui
```

```html
<script type="module">
  import { mui } from "@dataengine/markup-ui";

  mui.theme.set("light");
</script>

<mui-card>
  <mui-heading level="2">Customer editor</mui-heading>
  <mui-field label="Name">
    <mui-input mui-bind="customer.name"></mui-input>
  </mui-field>
  <mui-button type="primary" mui-action="customer.save">Save</mui-button>
</mui-card>
```

## Direct browser usage

ES module:

```html
<script type="module">
  import { mui } from "./dist/markup-ui.js";
</script>
```

Classic script:

```html
<script src="./dist/markup-ui.global.js"></script>
<script>
  mui.theme.set("dark");
</script>
```

Both builds automatically install the core stylesheet and register the built-in elements.

## API

The callable `mui` entry point organizes public services:

```js
mui.actions.register("customer.save", saveCustomer);
mui.state.create({ customer: {} });
mui.theme.set("dark");
mui.html.set(target, untrustedHtml);
mui.elements.register("mui-chart", ChartElement);
mui.use(chartPlugin);
```

The chainable query helper is optional:

```js
mui(".customer-card")
  .addClass("selected")
  .on("click", selectCustomer);
```

Web Components, state, actions, themes, security, and plugins do not depend on `MuiQuery`.

## Components

- Structure: `mui-app`, `mui-header`, `mui-main`, `mui-section`
- Layout: `mui-stack`, `mui-row`, `mui-wrap`, `mui-center`, `mui-spacer`, `mui-grid`
- Content: `mui-heading`, `mui-text`, `mui-strong`, `mui-code`, `mui-link`
- Surfaces: `mui-card`, `mui-card-header`, `mui-card-content`, `mui-card-footer`
- Feedback: `mui-alert`, `mui-badge`, `mui-tag`, `mui-progress`, `mui-skeleton`, `mui-spin`, `mui-empty`
- Media and grouping: `mui-avatar`, `mui-divider`, `mui-button-group`
- Forms: `mui-form`, `mui-form-item`, `mui-field`, `mui-input`, `mui-textarea`
- Selection: `mui-select`, `mui-option`, `mui-autocomplete`, `mui-radio-group`, `mui-radio`
- Value controls: `mui-slider`, `mui-checkbox`, `mui-switch`
- Actions: `mui-button`
- Navigation: `mui-tabs`, `mui-tab`, `mui-accordion`, `mui-accordion-item`
- Selection navigation: `mui-menu`, `mui-menu-item`, `mui-pagination`, `mui-steps`, `mui-step`
- Data display: `mui-list`, `mui-list-item`, `mui-descriptions`, `mui-description-item`, `mui-statistic`
- Hierarchy: `mui-tree`, `mui-tree-node`
- Overlay: `mui-dialog`, `mui-dialog-header`, `mui-dialog-content`, `mui-dialog-footer`
- Drawer: `mui-drawer`, `mui-drawer-header`, `mui-drawer-content`, `mui-drawer-footer`
- Floating content: `mui-tooltip`, `mui-popover`, `mui-popover-trigger`, `mui-popover-content`
- Managed feedback: `mui-message`, `mui-notification`
- Themes and loading: `mui-theme`, `mui-include`

## Buttons

```html
<mui-button>Default</mui-button>
<mui-button type="primary">Primary</mui-button>
<mui-button type="info">Info</mui-button>
<mui-button type="success">Success</mui-button>
<mui-button type="warning">Warning</mui-button>
<mui-button type="error">Error</mui-button>

<mui-button secondary>Secondary</mui-button>
<mui-button tertiary>Tertiary</mui-button>
<mui-button quaternary>Quaternary</mui-button>
<mui-button dashed>Dashed</mui-button>
<mui-button type="primary" ghost>Ghost</mui-button>
<mui-button type="text">Text</mui-button>
```

Sizes are `tiny`, `small`, medium by default, and `large`. Shape/state attributes include `round`,
`circle`, `block`, `strong`, `loading`, and `disabled`. The legacy `variant="primary"` form remains
supported.

## State and binding

```html
<mui-app>
  <script type="application/json" data-mui-state>
    {"customer":{"name":"Ada"},"form":{"busy":false}}
  </script>

  <mui-input mui-bind="customer.name"></mui-input>
  <mui-text mui-text="customer.name"></mui-text>
  <mui-button mui-disabled="form.busy">Save</mui-button>
</mui-app>
```

Bindings:

- `mui-bind` — two-way `value` or `checked` binding
- `mui-text` — one-way text binding
- `mui-visible` — one-way visibility binding
- `mui-disabled` — one-way disabled-state binding

The store uses explicit path updates and observer subscriptions rather than `Proxy`:

```js
const store = mui.state.create({ customer: { name: "Ada" } });
const dispose = mui.state.bind(document.body, store);

store.set("customer.name", "Grace");
dispose();
```

## Form validation

```html
<mui-form>
  <mui-form-item label="Name" required minlength="3">
    <mui-input mui-bind="customer.name"></mui-input>
  </mui-form-item>
  <mui-button mui-action="validate">Validate</mui-button>
</mui-form>
```

`mui-form-item` supports `required`, `minlength`, and `pattern` rules with accessible error state.
`mui-form.validate()` emits `mui:valid` or `mui:invalid`.

## Named actions

```html
<mui-button
  mui-action="customer.save"
  mui-param-mode="draft"
>
  Save
</mui-button>
```

```js
mui.actions.register("customer.save", async ({ store, parameters }) => {
  store?.set("form.busy", true);
  await saveCustomer(parameters.mode);
  store?.set("form.busy", false);
});
```

Markup names registered actions but cannot execute arbitrary JavaScript.

## Compound components

Structured components own their standard layout:

```html
<mui-dialog id="editor">
  <mui-dialog-header>
    <mui-heading level="2">Editor</mui-heading>
    <mui-button mui-action="close">Close</mui-button>
  </mui-dialog-header>
  <mui-dialog-content>...</mui-dialog-content>
  <mui-dialog-footer>
    <mui-button variant="primary">Save</mui-button>
  </mui-dialog-footer>
</mui-dialog>
```

Free-form card and dialog children remain supported. The built-in `close` action targets the
closest `mui-dialog` or `mui-drawer` when no explicit target is supplied.

## Overlays and feedback

```html
<mui-tooltip text="Helpful information">
  <mui-button>Hover or focus</mui-button>
</mui-tooltip>

<mui-popover>
  <mui-popover-trigger><mui-button>Open</mui-button></mui-popover-trigger>
  <mui-popover-content>Popover body</mui-popover-content>
</mui-popover>
```

```js
mui.message.show("Saved", { type: "success" });
mui.notification.show({
  title: "Build complete",
  content: "All browser distributions were generated.",
});
```

## Themes

```js
mui.theme.register("brand", {
  "color-primary": "#2563eb",
  "color-primary-hover": "#1d4ed8",
  "bg-surface": "#ffffff",
});

mui.theme.set("brand");
```

```html
<mui-theme name="dark">
  <mui-card>Scoped dark content</mui-card>
</mui-theme>
```

The visual system includes semantic tokens for typography, density, surfaces, interaction states,
focus rings, elevation, and motion. Components share consistent hover, active, focus-visible,
disabled, and reduced-motion behavior.

MarkupUI respects `prefers-reduced-motion` by default. Add `motion="full"` to `mui-app` only when
the application deliberately needs full transitions despite that operating-system preference.

## Dynamic and safe HTML

```html
<mui-include src="/views/orders.html"></mui-include>
```

```js
await mui("#workspace").load("/views/orders.html");
mui.html.set(target, untrustedHtml);
```

Dynamic HTML is same-origin by default and sanitized before insertion. Scripts, embedded documents,
inline event handlers, unsafe styles, and unsafe URLs are removed.

## Plugins

```js
mui.use({
  name: "chart",
  install(api) {
    api.elements.register("mui-chart", ChartElement);
    api.actions.register("chart.refresh", refreshChart);
  },
});
```

Plugins install once by name and interact only through public APIs.

## Optional advanced plugin

```js
import { mui } from "@dataengine/markup-ui";
import { advancedPlugin } from "@dataengine/markup-ui/advanced";

mui.use(advancedPlugin);
```

The advanced plugin provides:

- `mui-data-grid` and `mui-data-column`
- `mui-date-picker` and `mui-time-picker`
- `mui-upload`
- `mui-virtual-list`

```js
const grid = document.querySelector("mui-data-grid");
grid.rows = [
  { name: "Ada", score: 98 },
  { name: "Grace", score: 94 },
];

document.querySelector("mui-virtual-list").items =
  Array.from({ length: 10000 }, (_, index) => `Row ${index + 1}`);
```

The plugin is distributed separately and does not increase the core browser bundle.

## Optional widgets plugin

```js
import { mui } from "@dataengine/markup-ui";
import { widgetsPlugin } from "@dataengine/markup-ui/widgets";

mui.use(widgetsPlugin);
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
- `dist/markup-ui.global.js` — classic script exposing `window.mui`
- `dist/markup-ui-advanced.js` — optional advanced component plugin
- `dist/markup-ui-widgets.js` — optional application widgets plugin
- Modular JavaScript and TypeScript declarations
- `dist/manifest.json` — version and measured bundle sizes

The build enforces gzip budgets of 15 KB for core, 3 KB for advanced, and 4 KB for widgets.

## Compatibility

- Existing `mui-*` markup remains supported across minor releases.
- Named exports and the namespaced `mui` API follow semantic versioning.
- `builtInElementNames`, `mui.elements.names`, and `advancedElementNames` expose stable manifests.
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
