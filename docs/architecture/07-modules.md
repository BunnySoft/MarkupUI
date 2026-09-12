# 7. Small core and selectable components

**Implemented for the shared core, all seven initial families, Icon, Typography and Space, with explicit payload ceilings.
The rollout continues component-by-component.**
Follow the useful jQuery/plugin pattern: load one small core, then only the features the
application needs. This is a packaging and extension pattern, not a dependency on jQuery.

## Delivery units

| Unit | Includes | Must not include |
| --- | --- | --- |
| Shared core | Thin `ViewElement`, native conversion helpers and registration support. | Metadata engines, every component, optional binding/query engines or unrelated feature services. |
| Component/plugin | Direct properties/methods, companions and required local helpers. | A private copy of the shared core or the all-components bundle. |
| Component CSS | Styles needed by the selected component. | Unrelated component styles. |
| Optional subsystem | Binding, query or other features explicitly selected by the application. | Hidden automatic activation across the whole document. |
| Aggregate bundle | An optional convenience composition. | A prerequisite for using individual components. |

Source remains in the [existing areas](06-source.md). The build packages the common runtime
once instead of embedding its implementation into every component output.

## Loading behavior

| Format | Consumer experience |
| --- | --- |
| ESM | Import the chosen component entry; it imports the shared core and only declared dependencies. A consumer bundler is not required for served browser modules. |
| Classic scripts | Load core first, then selected component/plugin scripts in dependency order, plus their CSS. |
| Aggregate | Choose it deliberately when its included features are wanted; modular loading must remain available. |

Core alone must not register every UI component. A component entry registers only its own
family and extends the core through its public registration/plugin APIs where needed.
Do not require an optional query wrapper merely to use a Custom Element.

Dependencies must be explicit. For example, a menu component may need positioning behavior,
but that must not pull in an entire feedback/navigation catalog. Document the required
files and ordering in the component's API page.

## Shared identity and errors

Components in one application must share the same `ViewElement` implementation.
Do not ship independent runtime copies behind apparently identical imports.
An incompatible duplicate registration must fail rather than silently replace an element.

Classic modules report a missing required core/dependency clearly. They must not silently
load the aggregate bundle as a fallback. Do not mix incompatible aggregate/modular copies
or ESM/classic versions of the same component in one page.

## Payload accounting

| Measurement | Count |
| --- | --- |
| First selected component | Shared core, that component, required dependencies and selected CSS. |
| Additional component | Only files not already loaded, plus that component's CSS/dependencies. |
| Aggregate comparison | Its complete runtime and style cost, not only its entry file. |

Splitting files can make the first load slightly larger because separate files compress
less efficiently. The benefit is amortizing common runtime cost across components and
avoiding unused features. Do not claim a saving by excluding required dependency bytes.

The build manifest and API documentation must agree on dependency files and total costs.
Keep approved budgets unless a measured change is explicitly accepted.

The implemented entries are `@dataengine/markup-ui/core`, `@dataengine/markup-ui/avatar`,
`@dataengine/markup-ui/button`, `@dataengine/markup-ui/card`, `@dataengine/markup-ui/carousel`,
`@dataengine/markup-ui/collapse`, `@dataengine/markup-ui/divider`, `@dataengine/markup-ui/dropdown`,
`@dataengine/markup-ui/icon`, `@dataengine/markup-ui/typography` and `@dataengine/markup-ui/space`.
ESM uses `markup-ui-core.js`; classic scripts load `markup-ui-core.global.js` before
`markup-ui-avatar.global.js`, `markup-ui-button.global.js`, `markup-ui-card.global.js`,
`markup-ui-carousel.global.js`, `markup-ui-collapse.global.js`, `markup-ui-divider.global.js`,
`markup-ui-dropdown.global.js`, `markup-ui-icon.global.js`, `markup-ui-typography.global.js` or `markup-ui-space.global.js`.
See the [API guide](../api/README.md) for exact exports and usage.

## References

- [Plugin support source](../../src/core/plugin.ts)
- [Component registration entry](../../src/components/avatar/index.ts)
- [Build configuration](../../scripts/build.mjs)
