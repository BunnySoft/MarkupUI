# Binding and templates

**Status: selected design; the new runtime is not implemented.**

Binding is an optional layer over logical element properties and regions. It must not
change the meaning of an Element Contract or add runtime cost to unbound components.
The Web adapter uses explicit data directives and native templates; HTML is not the
cross-platform model.

## Reading order

1. [Binding language](01-language.md): direction, destinations and safe path syntax.
2. [Scopes](02-scopes.md): ownership, nested contexts and writable data routes.
3. [Templates](03-templates.md): creation, keys, reconciliation and disposal.
4. [Element integration](04-integration.md): metadata, composition and delivery gates.

## Selected model

| Concept | Responsibility |
| --- | --- |
| Store | Explicit reads, writes and subscriptions; no required Proxy observation. |
| Binding | Update an existing property, attribute or literal text destination. |
| Scope | Resolve data for one root or template instance. |
| Template | Create a logical subtree; native `template` is the Web authoring adapter. |
| Reconciliation | Preserve the instance associated with a stable key. |
| Element | Own its public contract, placement, interactions and renderer lifecycle. |

There is no expression evaluator, data-to-HTML binding, implicit ancestor data context,
global document scan or private collection renderer per component.
The design does not require a List component or a new markup language.

## References

- [Previous binding proposals](../archive/binding/README.md)
- [Framework and syntax comparisons](../archive/binding/06-alternatives-and-plan.md)
