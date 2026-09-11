# 5. Component composition

The binding/template engine is shared infrastructure. Components define only their public
properties, named template roles, context values and placement/lifecycle rules.

## Card: light-DOM compound parts

Current Card supports both native marked regions and passive `mui-card-*` spellings.
The proposed preferred concise form is:

```html
<mui-card>
  <mui-card-cover>...</mui-card-cover>
  <mui-card-header>
    <h2>Profile</h2>
    <mui-card-header-extra>...</mui-card-header-extra>
  </mui-card-header>
  <mui-card-content>...</mui-card-content>
  <mui-card-footer>...</mui-card-footer>
  <mui-card-action>...</mui-card-action>
</mui-card>
```

Recommended ownership:

```text
mui-card                         active owner
├── mui-card-cover               passive light-DOM part
├── mui-card-header              passive light-DOM part
│   └── mui-card-header-extra    passive light-DOM part
├── mui-card-content             passive light-DOM part
├── mui-card-footer              passive light-DOM part
└── mui-card-action              passive light-DOM part
```

These parts do not need Shadow Roots. Native semantic alternatives remain supported:

```html
<mui-card>
  <header data-mui-card-header>...</header>
  <section data-mui-card-content>...</section>
  <footer data-mui-card-footer>...</footer>
</mui-card>
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
`mui-avatar` is an appropriate custom child of `mui-avatar-group`.

```html
<mui-avatar-group
  data-bind-items="people"
  item-key="id"
  size="40"
  max="3">

  <template data-avatar-template>
    <div class="person-avatar">
      <mui-avatar
        data-bind-src="item.src"
        data-bind-alt="item.name">
      </mui-avatar>
    </div>
  </template>

  <template data-rest-template>
    <div class="remaining-people">
      <button type="button" class="rest-trigger">
        <mui-avatar>
          +<span data-bind-text="count"></span>
        </mui-avatar>
      </button>

      <ul>
        <template data-each="items" data-each-key="id">
          <li data-bind-text="item.name"></li>
        </template>
      </ul>
    </div>
  </template>
</mui-avatar-group>
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
    <mui-avatar data-bind-src="item.src"></mui-avatar>
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

