# Architecture

**Selected design for the full Web component rewrite.** The thin shared core, Avatar and
Button use direct property/method execution. Other components and the new binding/template runtime
remain in progress or planned; see the [implemented API](../api/README.md).

MarkupUI describes logical elements, properties, content, actions and data flow independently
of a platform toolkit. Web implementations use `ViewElement`; native targets use their own
platform bases while following the same contracts.

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
