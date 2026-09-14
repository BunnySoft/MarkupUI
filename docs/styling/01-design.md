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

## Accessibility and motion

Preserve visible focus, disabled and busy distinctions, readable contrast, forced-color
behavior and reduced-motion preferences. Avoid conveying state by color alone.
Logical direction, keyboard ownership and semantic orientation must agree with the paint.
Any CSSOM writes required for sizing or fitting must be documented for CSP-sensitive hosts.

## References

- [Web profile](../architecture/02-web.md)
- [Style-generation source](../../scripts/styles.mjs)
- [Theme source](../../src/theme/presets.json)
- [Previous default-style measurements](../archive/styling/index.md)
