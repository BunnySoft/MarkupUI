# 4. Element integration and delivery

The shared binder handles data paths, scopes and keyed instances. A `ViewElement` owns its
UI contract and uses those services only when its declared features need them.

## Responsibilities

| Owner | Responsibility |
| --- | --- |
| Element API/contract | Specify writable properties and content; access properties directly rather than requiring full metadata in every component. |
| Element | Own region placement, interactions, accessibility, focus policy and renderer cleanup. |
| Binder | Own path subscriptions, model listeners, scope association and reconciliation. |
| Application | Supply state and explicit composition; register host-resolved actions. |

Two-way model-event mapping needs an explicit contract before the binder can consume it.
Development metadata is not a mandatory dependency of runtime property access.

Public named regions use registered elements and preserve authored content. A private
Shadow Root may implement invariant internals, but it does not supply data scopes or
replace template reconciliation.

## Composition

A collection element must not import Tooltip or Dropdown merely to support customized
item content. Compose independent elements through their public contracts and lifecycle.
Existing helpers may remain internal implementation mechanisms, not a second public API.

AvatarGroup is a candidate proving consumer, not an approved `items`/template API today.
Its collection properties, item/rest roles, writable routes and focus policy need a
contract decision before implementation. Do not embed that earlier proposal into every
element or create a private AvatarGroup renderer.

## Delivery gates

| Stage | Required outcome |
| --- | --- |
| Scalar binding | Safe paths, explicit property/attribute/text channels, ownership and disposal. |
| Models | Declared event/value mappings and writable routes without feedback loops. |
| Scopes/templates | One-root instances, conditional/repeated structure, atomic key validation and cleanup. |
| Proving element | One approved collection consumer demonstrates real composition and focus behavior. |
| Expansion | Reuse the proven mechanism; add collection operations or adapters only when required. |

Before implementation, settle the binder entry/budget, text-property escape, model-update
metadata, key-path grammar, template lookup boundaries and generic focus policy.
This is a clean rewrite: do not preserve previous binding names as aliases.

The binder stays optional. Measure startup, updates, retained memory and payload instead
of assuming keyed templates are faster. Elements that do not use binding must not load it.

## References

- [Earlier composition examples](../archive/binding/05-component-composition.md)
- [Alternatives and previous delivery plan](../archive/binding/06-alternatives-and-plan.md)
