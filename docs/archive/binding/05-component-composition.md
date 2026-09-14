# 5. Component composition

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

The binding/template engine is shared infrastructure. Components define only their public
properties, named template roles, context values and placement/lifecycle rules.

## Card: light-DOM compound parts

Current Card supports both native marked regions and passive `m-card-*` spellings.
The proposed preferred concise form is:

```html
<m-card>
  <m-card-cover>...</m-card-cover>
  <m-card-header>
    <h2>Profile</h2>
    <m-card-header-extra>...</m-card-header-extra>
  </m-card-header>
  <m-card-content>...</m-card-content>
  <m-card-footer>...</m-card-footer>
  <m-card-action>...</m-card-action>
</m-card>
```

Recommended ownership:

```text
m-card                         active owner
├── m-card-cover               passive light-DOM part
├── m-card-header              passive light-DOM part
│   └── m-card-header-extra    passive light-DOM part
├── m-card-content             passive light-DOM part
├── m-card-footer              passive light-DOM part
└── m-card-action              passive light-DOM part
```

These parts do not need Shadow Roots. Native semantic alternatives remain supported:

```html
<m-card>
  <header data-m-card-header>...</header>
  <section data-m-card-content>...</section>
  <footer data-m-card-footer>...</footer>
</m-card>
```

Register a child tag only when it gains an independent API/lifecycle. Passive tags may
remain structural spellings recognized by Card and CSS.

## Why not Card Shadow DOM?

Shadow DOM could privately create header/content/footer wrappers and expose slots, but it
would make external styling, forms, arbitrary actions and authored structure less direct.
It also would not provide collection data contexts. Card’s public semantic content belongs
in light DOM.

## AvatarGroup: independent custom children

Avatar is independently useful and has loading/fallback/size/accessibility behavior, so
`m-avatar` is an appropriate custom child of `m-avatar-group`.

```html
<m-avatar-group
  data-bind-items="people"
  item-key="id"
  size="40"
  max="3">

  <template data-avatar-template>
    <div class="person-avatar">
      <m-avatar
        data-bind-src="item.src"
        data-bind-alt="item.name">
      </m-avatar>
    </div>
  </template>

  <template data-rest-template>
    <div class="remaining-people">
      <button type="button" class="rest-trigger">
        <m-avatar>
          +<span data-bind-text="count"></span>
        </m-avatar>
      </button>

      <ul>
        <template data-each="items" data-each-key="id">
          <li data-bind-text="item.name"></li>
        </template>
      </ul>
    </div>
  </template>
</m-avatar-group>
```

AvatarGroup owns:

- `items`, `itemKey`, `size`, `max`;
- visible/rest partitioning;
- ordering and instance placement;
- item/rest scope creation;
- focus policy for removed visible/rest instances.

The shared binder owns path subscriptions, models, keyed instance identity and disposal.

## Tooltip and Dropdown composition

AvatarGroup should not import Tooltip or Dropdown. A connection hook composes each
independent helper:

```js
group.connectItem = ({ element, onCleanup }) => {
  const tooltip = createTooltip(
    element.querySelector(".avatar-trigger"),
    element.querySelector('[role="tooltip"]')
  )
  onCleanup(() => tooltip.disconnect())
}
```

```js
group.connectRest = ({ element, onCleanup }) => {
  const dropdown = createDropdown(
    element.querySelector(".rest-trigger"),
    element.querySelector("[data-dropdown-menu]")
  )
  onCleanup(() => dropdown.disconnect())
}
```

The item/rest template contains the actual native trigger/panel markup. Each helper retains
its own validation, keyboard, focus and cleanup contract.

## Native slot use inside templates

A data template may instantiate a nested Shadow DOM component and provide its slots:

```html
<template data-each="people" data-each-key="id">
  <profile-card>
    <h2 slot="title" data-bind-text="item.name"></h2>
    <m-avatar data-bind-src="item.src"></m-avatar>
  </profile-card>
</template>
```

The binder creates the nodes and context. `profile-card` performs native slot projection.
The slot itself does not understand `item`.

## Component design rules

1. Components expose real properties for bound arrays/records.
2. Named template roles are documented with exact scope values.
3. Components reuse the shared binder instead of implementing private renderers.
4. Public semantic regions remain light DOM.
5. Independent child behavior remains an independent component/helper.
6. Shadow DOM is reserved for private invariant internals.
7. Components do not search ancestors for implicit data context.
8. No component duplicates application data in hidden fields/stores unless its native form
   contract explicitly requires a submitted control.


## Current documentation

[Read the current design](../../binding/README.md).
