# 1. Presentation and resources

## Ownership

| Surface | Owner |
| --- | --- |
| Shape, size, semantic tone and logical state | Element properties and behavior. |
| Color, typography, density, radii, elevation and motion | Theme/style resources. |
| Native layout, clipping and paint | Web or native renderer. |
| Authored content and explicit overrides | Application. |

Elements must not overwrite unrelated author styles during property updates or reconnection.
When a supported convenience property temporarily owns a style token, removing it restores
the prior value without erasing later application changes.

## Shared presentation API

`ViewElement.viewStyle` is separate from each component's logical property/attribute
channel. In the Web renderer, assignment updates only the supplied inline CSS fields;
it never writes `direction`, `gap`, `width` or other same-named component attributes.
For example, Carousel's horizontal/vertical direction and slide gap do not change when
the host receives a row/column presentation direction or CSS gap.

Web getters return a detached complete snapshot of these inline declarations, as
CSS strings or `null` for absent values. They do not infer presentation from behavior
attributes, computed styles or theme resources. Numeric lengths map to pixels, including
fractional values. `wrap: true/false` maps to wrap/nowrap; `null` clears that individual
style. Assignment is a partial update, not replacement of unrelated author CSS.
Use the typed `borderRadius` spelling, not a second hyphenated object-key alias.
Unknown properties, invalid primitive values and nonfinite numbers fail before any
declaration is applied. There is no generic property engine or new attribute DSL.

Box/Div's existing layout attributes remain their own declared convenience surface.
An attribute change maps only that declaration, including while detached. Reconnection
does not replay all attributes over later application style writes. Presentation
assignment does not rewrite the Box configuration attributes: the most recent explicit
write to a CSS declaration controls its inline presentation. Shared properties are
replayed on pre-upgrade through the ordinary `ViewElement` accessors, never DOM-library
getters or documentation metadata.

The optional root's `m-theme` implements this ownership rule for its inline tokens and
theme marker: removing/emptying `name` releases owned writes, including restoration of
prior priorities, while later application writes survive. A new theme name is validated
before the current theme is released. Disconnect retains presentation; reconnect
reconciles the current name. See the [root lifecycle contract](../api/01-core.md#optional-root-lifecycle).

## Web conventions

| Surface | Convention |
| --- | --- |
| Public elements | `m-*` |
| Public CSS classes/tokens | `m-*` and `--m-*` |
| Private structure/state | Owner-scoped `data-part` and `data-state` |
| Named content | Public region elements, not authored internal markers |
| Shadow internals | Explicitly documented styling hooks where encapsulation is used |

Light DOM is the public-composition default. Its weaker isolation requires scoped selectors
and clear ownership. Shadow DOM may isolate private invariant structure, but is not a
concealment mechanism or a performance claim.

`data-part` is an internal marker, not automatically a public Shadow DOM `part` contract.
Native targets map semantic resources into their own theme systems; CSS tokens are Web-specific.

## Sources and delivery

Maintain component CSS and theme data as their sources of truth. Generated TypeScript
resource modules are build outputs, not independently maintained stylesheets.
The existing style-generation mechanism may support shipped bundles without becoming
a second component implementation.

Standalone component styles are explicit assets. A loading mode must document any style
installation instead of silently imposing global presentation.
Where required by an Element Contract, canonical tags have readable pre-upgrade/no-JavaScript
presentation.

The optional root stylesheet no longer includes migrated component-family rules.
It retains root elements, shared tokens/layout utilities and scoped feedback-service
presentation. Loading root does not replace a selected family's CSS; the optional full
catalog provides its own complete component stylesheet. See
[delivery and payload accounting](../architecture/07-modules.md#payload-accounting).

## Accessibility and motion

Preserve visible focus, disabled and busy distinctions, readable contrast, forced-color
behavior and reduced-motion preferences. Avoid conveying state by color alone.
Logical direction, keyboard ownership and semantic orientation must agree with the paint.
Any CSSOM writes required for sizing or fitting must be documented for CSP-sensitive hosts.

### Form focus presentation

Input, InputNumber, Select, TimePicker, ColorPicker, InputOTP and DynamicInput use a
1px themed focus boundary, not an outer shadow plus a second outline. Input owns its
wrapper boundary; InputNumber uses a single inset shadow as its border. Composed fields
must not add another indicator inside Input. Native arrows, menus and editing remain intact.

Buttons, native radio/switch controls and Upload keep a 1px themed keyboard outline;
borderless Select uses an inset outline so removing its resting border never hides focus.
Family focus overrides take precedence over theme primary/status colors. Forced-colors
mode retains a distinct 2px system indicator rather than removing keyboard feedback.
These rules belong to each selected family's stylesheet, not a mandatory global reset.

## References

- [Web profile](../architecture/02-web.md)
- [Style-generation source](../../scripts/styles.mjs)
- [Theme source](../../src/theme/presets.json)
- [Previous default-style measurements](../archive/styling/index.md)
