# MarkupUI platform architecture

**Status: approved requirement; first-batch implementation pending.**

MarkupUI is no longer defined only as a browser-native Web Component library. The
canonical product is a platform-neutral UI component model with binding, templates,
actions, capabilities and renderer adapters. The existing browser implementation becomes
the initial Web renderer.

## Reading order

1. [Model and renderers](01-model-and-renderers.md)
2. [Web renderer and prefixes](02-web-renderer-and-prefixes.md)
3. [First migration batch](03-first-batch.md)

## Required architecture

```text
MarkupUI document/model
├── component nodes
├── properties and regions
├── bindings and scoped templates
├── actions and events
├── accessibility intent
└── capabilities and fallbacks
        ↓
MarkupUI runtime
        ↓
renderer contract
        ├── Web renderer
        └── future platform renderers
```

Raw HTML is not the canonical model. A Web renderer may use native HTML, light DOM,
Shadow DOM, ARIA, forms and CSS internally. Another renderer maps the same logical node
to its platform primitives.

## Prefix decision

`m-*` is the only public component prefix. The former longer prefix is removed across
Custom Elements, CSS classes/variables, events, data attributes, JavaScript names, demos,
tests and documentation. The npm package and `markup-ui-*` distribution filenames keep
their existing names.

## First batch

Migration order is fixed:

1. Button
2. Card
3. Carousel
4. Collapse
5. Divider
6. Dropdown

Each component must complete model, renderer, tests, demo and documentation
before the next component begins.

## Performance requirement

Cross-platform separation must not force every direct Web Component instance to maintain a
second serialized component tree. Direct `m-*` Web authoring uses thin shared
model/controller logic and native DOM. Full document-model parsing, binding and template
runtime are optional modes loaded only when requested.

Performance is an acceptance gate, not an assumed benefit. The first batch must compare
startup, memory, update and payload costs with the existing `m-*` Web baseline.
