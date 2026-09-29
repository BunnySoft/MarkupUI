# Architecture

**Selected design and current Web implementation.** The thin shared core and 89 selectable
families use direct property/method execution, with an optional full-catalog bundle and
separate root/plugins. Scalar/model binding is implemented; structural templates and
item/parent scopes are not. See the [implemented API](../api/README.md).

The size optimization plan is complete through S6. Subsequent retained-root lifecycle
and stylesheet fixes have passed local verification; full contract and production
acceptance remain open. The [production task summary](09-production.md#task-summary)
separates delivered work from release blockers.

MarkupUI describes logical elements, properties, content, actions and data flow independently
of a platform toolkit. Public authoring uses `m-*`; Web implementations use `ViewElement`
and own the native HTML mapping. Non-Web mappings remain design contracts, not delivered
renderers; future native targets use their own platform bases.

## Reading order

| Page | Purpose |
| --- | --- |
| 1. [Overview](01-overview.md) | Understand the model, runtime boundaries and usage modes. |
| 2. [Web renderer](02-web.md) | Map contracts to Custom Elements, DOM, events and CSS. |
| 3. [Native renderer](03-native.md) | Understand the non-Web boundary and native mappings. |
| 4. [Full rewrite](04-rewrite.md) | Scope every retained component and follow the delivery gates. |
| 5. [Development metadata](05-meta.md) | Generate demo API data from source without adding it to the runtime. |
| 6. [Source layout](06-source.md) | Follow the existing code ownership and component-family pattern. |
| 7. [Core and selectable components](07-modules.md) | Load shared runtime once and only the features an application uses. |
| 8. [Typed class and style model](08-view-element-styles.md) | Universal typed class and style representation on ViewElement for cross-platform rendering. |
| 9. [Production readiness](09-production.md) | Release gates, known blockers and the hardening work order. |
| 10. [JavaScript size optimization](10-size-optimization.md) | Completed consolidation, measured sharing decisions, optional full bundle and local acceptance evidence. |

## Main decisions

| Concern | Decision |
| --- | --- |
| Web base | Small `ViewElement` adapter extending `HTMLElement`. |
| Public identity | Unprefixed classes and canonical `m-*` element names. |
| Metadata | Development-only source extraction; not part of runtime execution. |
| Content | Explicit regions and preserved native nodes; no virtual DOM. |
| Binding | Optional shared runtime, activated explicitly. |
| Styling | External CSS/resources and scoped private markers. |
| Scope | Every retained Web UI component; the initial seven are one milestone. |
| Delivery | Small shared core plus selectable components/plugins; the aggregate is optional. |

Read the [Element Contracts](../elements/README.md) for concrete properties and behavior.
The [Binding](../binding/README.md) and [Styling](../styling/README.md) guides own those
shared concerns rather than duplicating them across architecture pages.

## References

- [Previous migration record](../archive/architecture/01-first-batch.md)
- [Previous Web authoring discussion](../archive/architecture/02-web-authoring.md)
- [Metadata ownership discussion](../archive/architecture/05-meta-background.md)
