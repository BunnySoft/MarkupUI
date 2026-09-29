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

Template integration links scopes internally and retains instance ownership through
weak references.
Arrays and records remain references to owned data, not hidden JSON copies.
Resolve paths through the current scope, parent scopes and the root store; reject unsafe
segments such as `__proto__`, `prototype` and `constructor`.

The implemented store path primitive accepts nonempty dot-separated identifiers and
canonical numeric child indices, such as `report.rows.0.sales`. It reads own properties
only, rejects expressions, whitespace and empty segments, preserves existing arrays,
and rejects writes through scalar values. Explicit nonoverlapping root/store scopes are
implemented by the binder. Internal parent/item scopes in `src/state/scope.ts` now
connect to inline Web template instances and their model events; no public scope class
is exported. See the
[implementation checkpoint](05-delivery-plan.md#implementation-checkpoint).

Template paths recognize `$root`, `$item`, `$parent`, `$index` and `$key`.
Unprefixed paths retain root meaning; outside templates, dollar-prefixed keys are literal
store keys. `$parent` selects the nearest enclosing repeated item, not an intervening
condition; the remaining path reads that record's fields. Index/key contexts are read-only.
Writes resolve current nested keys before calling `store.set` and reject key/ancestor
replacement, missing or duplicate keys, accessor paths and disposed scopes.
Array `length` is also read-only for scope models; replace the collection explicitly.
Ordinary object fields named `length` remain writable.
Template roots observe store changes internally, so immutable replacement and nested
path writes resolve against current keys without retaining insertion-time indices.
Collection validation is cached only during synchronous read-only preparation; model
writes always validate current data. This is not a store transaction or a memory/
performance acceptance claim.

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

When a new record has an existing key, retain the instance root and resolve its live
route against the replacement data. Index changes do not change identity.

Two binders may not own the same property or repeated region. Disposing a root removes
subscriptions, model listeners and child scopes, invokes registered cleanup, and leaves
application state and later application-owned DOM changes intact.

## References

- [Previous scope examples and data-flow discussion](../archive/binding/03-scopes-and-data-flow.md)
