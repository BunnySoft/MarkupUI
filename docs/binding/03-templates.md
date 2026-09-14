# 3. Templates and reconciliation

Templates create instances; slots project existing nodes. Native `template` is the Web
adapter for a logical subtree and remains inert until the binder instantiates it.

## Initial scope

| Feature | Rule |
| --- | --- |
| Conditional template | Create one instance for a Boolean condition; dispose it when false. |
| Repeated template | Create one instance per stable key in a bounded collection. |
| Instance root | Exactly one root initially; do not add multi-root range machinery without need. |
| Template source | Inline, referenced or supplied explicitly; reject conflicting sources. |
| Element-owned region | Available only when its Element Contract defines the template role and context. |

Use a visibility property when a node must remain rather than be destroyed.
Do not infer a collection API or template role merely because a component contains children.

## Reconciliation

Validate the entire next key set before changing the tree. Retain and move surviving
instances, dispose removed keys, create new keys, and update retained scopes and indices.
Never clear and rebuild the collection as the normal update path.

Stable nodes preserve application state and listeners; native resources and focus still
need browser-aware handling. Missing or duplicate keys must fail before partial mutation.
The first data-update mechanism can be explicit whole-array replacement; additional keyed
operations must use the same notification and reconciliation rules.

## Instance lifecycle

1. Import the inert template and validate its root.
2. Associate its scope and apply initial values before insertion where possible.
3. Install subscriptions and declared model listeners.
4. Insert the instance and connect explicitly owned behavior.
5. Register cleanup for everything created by the instance.

Moving an unchanged key does not dispose it. Removing an instance first resolves focus
under the owning element's policy, then releases bindings, helpers and native resources.
Cleanup must be reentrancy-safe and must not overwrite later application-owned state.

## IDs, safety and focus

Fixed IDs in repeated templates can break labels and relationships. Prefer wrapping labels,
explicit accessible names or an approved instance-ID policy; do not silently rewrite arbitrary
HTML IDs. Reject invalid references required by the element contract.

No expression execution or data-to-HTML insertion is allowed. URL-bearing properties follow
their element policy. Active native edits must not be overwritten unless the model binding
owns that write. Generic focus recovery and template-ID lookup scope remain decisions to
settle before implementation.

## References

- [Previous template examples and reconciliation discussion](../archive/binding/04-templates-and-reconciliation.md)
- [Browser primitives and slot/template comparison](../archive/binding/01-web-platform-primitives.md)
