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

The [List/ListItem consumer](../../demo/components/list.html#template-heading) now uses
one portable ListTemplate region, an explicit store route and stable key, and a
surviving-list focus policy. List owns native semantic chrome; state alone owns generated
instance placement. State recognizes this declared structural source and calls its
ordinary native accessor, without registering/importing the List runtime or consulting
metadata. Unbound List requires only core. The
[delivery plan](05-delivery-plan.md) records the bounded checkpoint and remaining work.

## Delivery gates

| Stage | Required outcome |
| --- | --- |
| Scalar binding | Safe paths, explicit property/attribute/text channels, ownership and disposal. |
| Models | Declared event/value mappings and writable routes without feedback loops. |
| Scopes/templates | One-root instances, conditional/repeated structure, atomic key validation and cleanup. |
| Proving element | One approved collection consumer demonstrates real composition and focus behavior. |
| Expansion | Reuse the proven mechanism; add collection operations or adapters only when required. |

The scalar/model and inline Web template binder ship through the optional state entry, with a 4,000-byte gzip
recommendation per runtime format. Size recommendations are adjustable, not hard gates;
see the [size policy](../architecture/07-modules.md#size-policy).
The language page defines the text-property escape and
explicit Web event-owner adapter; it uses no runtime metadata. Item scopes, current-key
model writes, explicit `focusFallback` and ListTemplate's portable focus policy are
implemented. Root-local ID references and explicit programmatic template Maps use that
same binder; native source objects remain a Web-only adapter. One-way paired IDs add
next-tree uniqueness and root-local label/ARIA relationship preflight without component
imports. [Scoped actions](06-actions.md) read data through an explicit live binding;
state does not import the action registry, and named actions remain an optional root
facade feature. Generic portable conditions use Box's `m-if` and the same optional
state runtime. Broader resource and human interaction acceptance remain pending.
This is a clean rewrite: previous binding names have no aliases.

The binder stays optional. Measure startup, updates, retained memory and payload instead
of assuming keyed templates are faster. Elements that do not use binding must not load it.

## References

- [Earlier composition examples](../archive/binding/05-component-composition.md)
- [Alternatives and previous delivery plan](../archive/binding/06-alternatives-and-plan.md)
