# 1. System overview

MarkupUI separates an element's meaning from the platform primitives used to display it.
A logical Card has named content regions; it is not defined by a particular `div`, XAML
container or native view hierarchy.

## Responsibilities

| Layer | Owns | Does not own |
| --- | --- | --- |
| Element Contract | Public properties, content, actions, events and behavior. | Platform-specific DOM/toolkit details. |
| Element class | Direct typed properties, defaults, validation and concrete behavior. | Another component's private state or a duplicated binding engine. |
| Development metadata | Source-derived documentation for demos/tools. | Runtime property access or method dispatch. |
| Optional document/binding runtime | Logical nodes, scopes, explicit updates, templates and identity. | Native paint and platform event mechanics. |
| Renderer | Platform nodes, property/event mapping, accessibility, styling and cleanup. | A second interpretation of the logical contract. |
| Host | Configuration, actions, resources and policy. | Hidden data-context inference inside components. |

## Logical document

| Field | Meaning |
| --- | --- |
| Type and identity | Stable element type and document/item key. |
| Properties | Typed logical values. |
| Regions | Named child content. |
| Bindings and templates | Explicit data flow and scoped logical subtrees. |
| Actions | Typed, host-resolved intent. |
| Accessibility | Logical names, roles, states and relationships. |
| Capabilities and fallback | Required renderer features and declared alternatives. |
| Version | Document/schema compatibility where document mode is used. |

A document node holds one instance's values and children. Directly authored Web elements
do not maintain a serialized copy of their DOM or require a metadata object to execute.

## Data flow and actions

Bindings target declared logical properties; Web `data-*` syntax is an adapter.
Templates create logical subtrees with explicit scopes and stable identity.
Native templates do not turn HTML into the canonical cross-platform representation.

Portable actions express intent such as submit, navigate, select or update a value.
The host resolves them under its policy. Payloads do not contain arbitrary executable
callbacks, and markup does not become a JavaScript expression language.

## Usage modes

| Mode | Cost and boundary |
| --- | --- |
| Direct Web authoring | `m-*` elements coordinate native DOM; no required serialized tree or binder. |
| Bound Web authoring | Explicitly load/activate binding for selected roots. |
| Logical document rendering | Adds validation, logical-node storage and renderer dispatch. |
| Native rendering | Implements the same contracts using native property, view and input systems. |

Keep updates incremental, retain surviving keyed nodes and batch notifications where the
shared runtime requires it. Native input, layout and paint remain platform-owned.
Measure startup, updates, memory and payload rather than assuming abstraction or Shadow DOM
improves performance.

## References

- [Previous implementation overview](../archive/overview.md)
- [Browser primitives and composition comparison](../archive/binding/01-web-platform-primitives.md)
