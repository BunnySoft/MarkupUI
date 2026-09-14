# Data binding and templates

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

**Status: proposed architecture, not implemented.**

This guide defines the proposed platform-neutral MarkupUI binding/template runtime and its
Web authoring adapter. Current MarkupUI still ships only the smaller scalar `MStore`
binder documented in the main README. Nothing in these pages makes collection binding,
scoped templates, `data-bind-*`, `data-model-*`, `data-if` or `data-each` available at
runtime.

The design remains dependency-free, HTML-first and based on real DOM nodes:

```text
explicit store
  → binding scope
  → native template instance
  → real keyed DOM
  → property, attribute, text and model bindings
```

## Reading order

1. [Web-platform primitives](01-web-platform-primitives.md) — Custom Elements, light DOM,
   Shadow DOM, slots, templates and compound components.
2. [Binding language](02-binding-language.md) — one-way/two-way syntax, properties,
   attributes, text and current compatibility.
3. [Scopes and data flow](03-scopes-and-data-flow.md) — how root, item, nested and rest
   contexts pass data.
4. [Templates and reconciliation](04-templates-and-reconciliation.md) — conditional and
   repeated templates, stable keys, lifecycle and focus.
5. [Component composition](05-component-composition.md) — Card child parts, AvatarGroup
   item/rest templates, Tooltip/Dropdown ownership.
6. [Alternatives and implementation plan](06-alternatives-and-plan.md) — comparison with
   XAML, Vue and other approaches, rejected syntax and staged delivery.

## Selected direction

| Concern | Decision |
| --- | --- |
| State | Explicit `MStore`; no automatic Proxy observation. |
| One-way property | `data-bind-<property>="path"` |
| One-way attribute | `data-bind-attr-<attribute>="path"` |
| One-way text | `data-bind-text="path"` |
| Two-way property | `data-model-<property>="path"` |
| Conditional structure | `data-if="path"` on an inert template |
| Repeated structure | `data-each="path"` plus `data-each-key` |
| Item identity | Validate all stable keys before mutation. |
| Template form | Native `HTMLTemplateElement`, initially one instance root. |
| Data context | Parent-linked internal scopes; no JSON in DOM attributes. |
| DOM updates | Keyed native-node reuse; no virtual DOM. |
| Component customization | Named native templates that reuse the same binder. |
| Canonical target | Logical component properties/regions, not DOM nodes. |
| Web public content | Prefer light DOM. |
| Private invariant internals | Shadow DOM only when it has a concrete benefit. |
| Expressions | Paths only; no runtime JavaScript expression language. |
| HTML insertion | Not supported; text uses `textContent`. |

## Important distinction

- **Binding** updates an existing node.
- **A template** creates nodes.
- **A scope** supplies data to one template instance.
- **Reconciliation** preserves the instance associated with a stable key.
- **Lifecycle** releases bindings and helper resources when an instance is removed.
- **A native slot** projects existing light-DOM nodes; it does not create data-bound
  instances or provide `item`/`index` context.

## First proving consumer

AvatarGroup remains the recommended first collection consumer after the first
[platform-architecture batch](../architecture/01-first-batch.md):

- bind an actual array to `items`;
- align `size` and `max`;
- instantiate one Avatar template per stable key;
- create a separate rest scope containing `items` and `count`;
- compose Tooltip and Dropdown through explicit lifecycle hooks;
- preserve authored children and useful no-JavaScript markup where applicable.

The binder must remain optional so components and applications that do not use data
binding do not pay its runtime or payload cost.

Keyed templates may improve collection updates by preserving existing nodes, but the
binding runtime adds startup and memory cost. Direct `m-*` Web usage must not load or
instantiate the binder unless binding/template features are used.

## Current documentation

[Read the current design](../../binding/README.md).
