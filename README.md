# MarkupUI

`@dataengine/markup-ui` defines platform-neutral UI elements with a dependency-free Web
implementation for modern browsers.

**Status: the full component rewrite is in progress.** The documentation describes the
latest design, not a claim that every API is implemented. The shared core, Avatar and
[Button/ButtonGroup](demo/components/button.html) use direct property access and native behavior.
Documentation data is generated separately for demos. The new binding/template runtime remains planned.

## Design

| Concern | Direction |
| --- | --- |
| Web components | Unprefixed classes based on `ViewElement`, registered as `m-*` elements. |
| Metadata | Development-only data extracted from source; no production metadata lookup. |
| Content | Explicit regions, preserved authored nodes and native browser semantics. |
| Binding | Optional, explicit, path-based data flow and keyed templates; no virtual DOM. |
| Styling | Component CSS and theme resources; short, scoped `data-part` / `data-state` markers. |
| Migration | One component family at a time, covering the full retained inventory. |
| Delivery | Small shared core plus independently selectable components/plugins, without a jQuery dependency. |

Every retained Web UI component is included. Pure services, style resources and intentional
replacements keep explicit dispositions rather than acquiring artificial element wrappers.
The first seven-component batch establishes the pattern; it is not the end of the rewrite.

## Documentation

Start with the [documentation guide](docs/README.md).

| Topic | Purpose |
| --- | --- |
| [Architecture](docs/architecture/README.md) | Understand the model, Web/native boundaries and full rewrite. |
| [API](docs/api/README.md) | Load the shared core and only the implemented components you use. |
| [Elements](docs/elements/README.md) | Read current contracts, decisions and coverage. |
| [Binding](docs/binding/README.md) | Understand the selected data-flow and template design. |
| [Styling](docs/styling/README.md) | Apply the presentation model and review visual behavior. |

## Development

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install development dependencies. |
| `pnpm build` | Generate distributions and enforce payload budgets. |
| `pnpm test` | Run the existing test suite; use focused fixtures while changing a component. |
| `pnpm demo` | Serve the development examples. |

Implementation remains in separate TypeScript, CSS, shared-type and entry files. No `.mkl`
language or consumer-side framework/compiler is required by this rewrite.
Read the [source pattern](docs/architecture/06-source.md) and
[module delivery design](docs/architecture/07-modules.md) before changing the code.

## References

- [Previous package usage](docs/archive/overview.md) preserves earlier API examples.
- [Reference archive](docs/archive/README.md) contains prior implementations, discussions
  and comparisons. These are context, not the current design.
