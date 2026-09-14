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
