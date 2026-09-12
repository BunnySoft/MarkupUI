# 7. Small core and selectable components

**Implemented for the shared core, all seven initial families, Icon, Typography, Space, Flex, Input, Checkbox, Radio and Switch, with explicit payload ceilings.
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
`@dataengine/markup-ui/icon`, `@dataengine/markup-ui/typography`, `@dataengine/markup-ui/space`, `@dataengine/markup-ui/flex`, `@dataengine/markup-ui/input`, `@dataengine/markup-ui/checkbox`, `@dataengine/markup-ui/radio` and `@dataengine/markup-ui/switch`.
ESM uses `markup-ui-core.js`; classic scripts load `markup-ui-core.global.js` before
`markup-ui-avatar.global.js`, `markup-ui-button.global.js`, `markup-ui-card.global.js`,
`markup-ui-carousel.global.js`, `markup-ui-collapse.global.js`, `markup-ui-divider.global.js`,
`markup-ui-dropdown.global.js`, `markup-ui-icon.global.js`, `markup-ui-typography.global.js`, `markup-ui-space.global.js` or `markup-ui-flex.global.js`.
See the [API guide](../api/README.md) for exact exports and usage.

Input additionally imports `markup-ui-native-input.js`, the internal native-field mechanics
also used by unmigrated control compositions. Classic loading is core, then
`markup-ui-native-input.global.js`, then `markup-ui-input.global.js`; the native dependency
uses a private symbol, not a second public Input helper API. It registers no elements and
includes no other component or core copy. Input's manifest accounts for all three files:
the Input ESM/classic ceilings remain 4,000 gzip bytes each, shared native mechanics have
4,000-byte ceilings, CSS retains 1,800 bytes, and the new combined-runtime ceiling is 7,500.
The retained `.m-input` CSS skin is also used by unmigrated native controls; do not import
Input registration just to access their internal helper. The aggregate no longer registers
legacy `m-input`/`m-textarea` or styles their native fields.

Checkbox imports only core. Classic loading is `markup-ui-core.global.js` then
`markup-ui-checkbox.global.js`, plus `markup-ui-checkbox.css`. The two own-tag classes
share one family entry and the existing native checkbox CSS hooks; there is no additional
native-control chunk, text-input engine or helper registration. Each JS ceiling remains
3,500 gzip bytes and CSS remains 1,000; combined core-plus-family runtime has a 4,750-byte
ceiling in either format. CSS distribution trims whitespace only. The manifest counts both
runtime files plus CSS. Radio/Switch are not selected by this entry.

Radio imports core and the internal `markup-ui-native-radio.js`. Classic loading is core,
`markup-ui-native-radio.global.js`, then `markup-ui-radio.global.js`, with Radio CSS.
Radio, RadioGroup and RadioButton are the only registered constructors. The existing native
group validator/controller is shared with unmigrated Rate; it registers nothing and the
former public group-helper API is removed. Rate imports only this internal dependency,
not Radio registration or core. Its classic demo loads native-radio before Rate.

Radio retains the 3,000-byte gzip ceiling for each JS file and the 1,250-byte CSS ceiling.
The shared native-radio files have measured 2,000-byte ceilings; combined core-plus-native
plus Radio runtime has a 5,500-byte ceiling in either format. Rate retains its 4,000-byte
per-file ceilings and has a new 5,000-byte dependency-inclusive ceiling. The manifest
counts every required runtime file and CSS. Radio CSS whitespace is trimmed; canonical
size/status attributes replace archived data-size/data-status configuration without changing
the native colors, dimensions or four-pixel button seams.

Switch imports only core. Classic loading is core then `markup-ui-switch.global.js`, with
Switch CSS. The entry registers only Switch, reusing its native loading mechanics rather
than importing Input/Radio or a second controller. Existing per-file gzip ceilings stay
3,500 bytes for each JS format and 1,250 for CSS. The manifest counts core plus Switch
runtime and CSS; combined runtime has a 4,500-byte ceiling in either format. CheckboxGroup
excludes Switch-owned native controls, and the aggregate no longer registers or styles the
legacy MSwitch. Select Switch explicitly in applications that previously used that entry.

## References

- [Plugin support source](../../src/core/plugin.ts)
- [Component registration entry](../../src/components/avatar/index.ts)
- [Build configuration](../../scripts/build.mjs)
