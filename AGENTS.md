# Working on MarkupUI

Before changing source or build packaging, read:

1. [Source layout and ownership](docs/architecture/06-source.md)
2. [Core and component delivery](docs/architecture/07-modules.md)
3. The relevant [Element Contract](docs/elements/README.md)
4. [Component development guide](docs/elements/04-development.md)

Keep implementation in the existing `src` areas. Shared runtime extraction changes build
packaging, not the ownership of component code. Consumers must be able to load the small
core and only the components/plugins they use; do not make the aggregate bundle mandatory.

Runtime TypeScript uses direct property access and ordinary method calls. Do not add runtime
metadata lookup, decorators or a generic property engine. API documentation is extracted by
`scripts/component-api.mjs` into demo-only JSON; it is not a production dependency.

The [active documentation](docs/README.md) describes the current design. Material under
`docs/archive` is historical reference, not an implementation pattern to copy.

Payload size budgets are recommendations, not hard limits. Report measured size and
warn when a recommendation is exceeded; adjust recommendations when justified by the
required behavior. Do not remove functionality or add artificial packaging boundaries
just to fit a byte target. Preserve accurate dependency accounting and the frozen S0
baseline. See [size policy](docs/architecture/07-modules.md#size-policy).
