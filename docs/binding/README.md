# Binding and templates

**Status: scalar/models, Web templates, portable ListTemplate and If are implemented.**

The optional state entry supports safe paths, explicit property/attribute/text channels,
two-way model adapters, nonoverlapping root/store scopes, refresh and disposal.
Native `template` sources support Boolean `data-if` and stable-key `data-each`, nested
item/parent/root contexts, model writes through current keys, focus fallback and retained
instances on stop/rebind. Native templates are explicitly a Web adapter.
The [List demo](../../demo/components/list.html) provides portable `m-list-template`
authoring and an explicit list focus policy using the same binder.
Root-local ID references and an explicit template Map now support reusable Web sources.
Application-supplied [paired IDs](03-templates.md#paired-ids) have next-tree uniqueness
and root-local label/ARIA reference checks. [Scoped action arguments](06-actions.md)
read current data through an explicitly supplied binding; the optional root's App
wires that connection automatically. Box's `m-if` supplies generic
[portable conditions](03-templates.md#portable-conditions). Broader resource and human
interaction acceptance remain separate from implementation.

Binding is an optional layer over logical element properties and regions. It must not
change the meaning of an Element Contract or add runtime cost to unbound components.
The Web adapter uses explicit data directives and native templates; HTML is not the
cross-platform model.

## Reading order

1. [Binding language](01-language.md): direction, destinations and safe path syntax.
2. [Scopes](02-scopes.md): ownership, nested contexts and writable data routes.
3. [Templates](03-templates.md): creation, keys, reconciliation and disposal.
4. [Element integration](04-integration.md): metadata, composition and delivery gates.
5. [Structural delivery plan](05-delivery-plan.md): source-verified gaps, working
   decisions, advisory size measurements, implementation order and person-day estimates.
6. [Scoped actions](06-actions.md): typed arguments, explicit binding ownership,
   activation errors and async limits.

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
global document activation or private collection renderer per component. Explicit ID
preflight inspects IDs in the enclosing tree only to reject collisions.
The design does not require a List component or a new markup language.

## References

- [Previous binding proposals](../archive/binding/README.md)
- [Framework and syntax comparisons](../archive/binding/06-alternatives-and-plan.md)
