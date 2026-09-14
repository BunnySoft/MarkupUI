# 2. Scopes and data ownership

A scope supplies values and writable routes for one binding root or template instance.
It is not another application store and is not serialized into DOM attributes.

## Scope contents

| Scope | Available context |
| --- | --- |
| Root | Explicit store and root paths. |
| Repeated item | `item`, `index`, stable `key` and `parent`. |
| Nested item | Its own item context, with explicit access to the parent scope. |
| Named element region | Only the context names declared by the owning Element Contract. |

Scopes are linked internally and associated with instance roots through weak references.
Arrays and records remain references to owned data, not hidden JSON copies.
Resolve paths through the current scope, parent scopes and the root store; reject unsafe
segments such as `__proto__`, `prototype` and `constructor`.

## Passing data between elements

Data enters a child through an explicit declared property. A parent scope does not become
the child's private context merely because its node is an ancestor.
If the child supports collection templates, it creates the documented item/region scopes
through the shared binder.

One-way assignment never writes back. A two-way item update must identify the collection
owner, stable key and field path, then notify through that owner's update route.
It must not silently mutate an arbitrary record or infer writability from an array reference.
Plain collection data is one-way unless an explicit writable route is supplied.

## Identity and ownership

When a new record has an existing key, retain the instance root, replace the scope's item
reference and update its subscriptions. Index changes do not change identity.

Two binders may not own the same property or repeated region. Disposing a root removes
subscriptions, model listeners and child scopes, invokes registered cleanup, and leaves
application state and later application-owned DOM changes intact.

## References

- [Previous scope examples and data-flow discussion](../archive/binding/03-scopes-and-data-flow.md)
