# 1. Web-platform primitives

This page distinguishes the browser technologies used by the proposed design. These
concepts are independent: a Custom Element may use light DOM, Shadow DOM, both or neither.

## Custom Elements

A Custom Element supplies a named element type and lifecycle:

```html
<mui-avatar></mui-avatar>
<mui-card></mui-card>
```

Registration does not imply Shadow DOM. A class may coordinate existing children without
calling `attachShadow()`.

Use a Custom Element when the element has an independent API, state or lifecycle. Do not
register passive structural tags merely because their names contain a hyphen unless a
real registration benefit is required.

## Light DOM

Light DOM is the ordinary child tree authored under an element:

```html
<mui-card>
  <header data-mui-card-header>
    <h2>Profile</h2>
  </header>
  <section data-mui-card-content>Content</section>
</mui-card>
```

The header and section remain direct children of `mui-card`. They are available to normal
CSS, selectors, forms, labels, ARIA relationships, application listeners and developer
tools.

MarkupUI favors light DOM for public semantic content because it preserves native
relationships and external CSS customization.

## Shadow DOM

Shadow DOM creates a private internal tree:

```text
profile-card
├── #shadow-root
│   └── article
│       ├── header
│       └── section
├── authored heading
└── authored content
```

It is useful when internal structure is an invariant implementation detail that authors
must not reorder or style directly. Styling normally requires host custom properties,
`::part`, inherited values or explicitly supported slots.

Shadow DOM adds real costs:

- more complex external styling;
- form-associated Custom Element requirements for form controls;
- cross-boundary focus, selection and ARIA testing;
- weaker no-JavaScript generated content;
- explicit public `part`/slot contracts.

Do not add a Shadow Root only to rename header/content/footer regions or to obtain
framework-like slot syntax.

## Native slots

A native `slot` exists inside a Shadow Root and projects existing light-DOM children:

```html
<!-- Shadow DOM -->
<header><slot name="title"></slot></header>
<section><slot></slot></section>
```

```html
<!-- Light-DOM children -->
<profile-card>
  <h2 slot="title">Ada</h2>
  <p>Profile content</p>
</profile-card>
```

Slots do not clone nodes. They do not repeat collections and do not provide `item`,
`index`, `key`, `items` or `count`.

A `slot` element written inside a template becomes active only if the template is
instantiated inside a Shadow Root. A slot cloned into ordinary light DOM has no
assigned-node projection behavior. A data template may still create elements carrying
`slot="name"` for a nested Shadow DOM component.

## Native templates

`HTMLTemplateElement` stores inert content:

```html
<template id="person-row">
  <li>
    <mui-avatar></mui-avatar>
    <span></span>
  </li>
</template>
```

The content becomes active only when cloned/imported and inserted. Templates are the
correct substrate for:

- deferred fallback/placeholder content;
- conditional content;
- repeated collection items;
- component item/rest/empty/content templates;
- reusable application-defined presentation.

Unlike slots, templates create new nodes and therefore require data scopes, identity,
subscriptions and cleanup.

## Declarative Shadow DOM

`template[shadowrootmode]` is a browser facility for declaring a Shadow Root. It is not a
collection template and does not add item binding. The proposed binder does not depend on
Declarative Shadow DOM.

## Compound components

A compound component is one logical component made from cooperating parts. The term says
nothing about where the nodes live.

Possible implementations:

| Form | Example | Typical use |
| --- | --- | --- |
| Native light-DOM parts | `header[data-mui-card-header]` | Semantic authored regions |
| Passive custom-tag parts | `mui-card-header` | Concise component vocabulary |
| Independent custom child | `mui-avatar` in `mui-avatar-group` | Child with its own API/lifecycle |
| Shadow DOM plus slots | `slot[name=header]` | Encapsulated invariant layout |
| Generated Shadow internals | private spinner/track | Author should not manipulate it |

Recommended selection rule:

| Need | Mechanism |
| --- | --- |
| Public semantic content | Native light-DOM part |
| Concise passive component region | Light-DOM custom-tag part |
| Independently reusable behavior | Custom child element |
| Private invariant machinery | Shadow DOM |
| Data-created/deferred content | Native template |

## Slots versus data templates

| Capability | Native slot | Scoped data template |
| --- | ---: | ---: |
| Projects an existing node | Yes | No |
| Creates new nodes | No | Yes |
| Repeats an array | No | Yes |
| Receives item context | No | Yes |
| Requires stable keys | No | Yes |
| Requires instance cleanup | Usually no | Yes |
| Requires Shadow DOM | Yes | No |

## Standards references

- [Using custom elements](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements)
- [Using shadow DOM](https://developer.mozilla.org/docs/Web/API/Web_components/Using_shadow_DOM)
- [`slot` element](https://developer.mozilla.org/docs/Web/HTML/Element/slot)
- [`template` element](https://developer.mozilla.org/docs/Web/HTML/Element/template)
- [Using templates and slots](https://developer.mozilla.org/docs/Web/API/Web_components/Using_templates_and_slots)

