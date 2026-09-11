# 3. Scopes and data flow

Templates receive data through internal parent-linked binding scopes. Data is not
serialized into DOM attributes and components do not search arbitrary ancestors for
hidden context.

## Scope model

```text
BindingScope
├── values
│   ├── item
│   ├── index
│   ├── key
│   ├── items
│   ├── count
│   └── content
├── parent
├── source/store adapter
├── get(path)
├── set(path, value)
├── subscribe(path, callback)
└── dispose()
```

Scopes are associated with template instance roots through internal weak references.
Actual arrays and records remain object references; they are not copied into `dataset`.

## Root scope

```js
const store = mui.state.create({
  profile: { name: "Ada", src: "./ada.png" }
})

mui.state.bind(document.querySelector("#app"), store)
```

```html
<section id="app">
  <mui-avatar
    data-bind-src="profile.src"
    data-bind-alt="profile.name">
  </mui-avatar>
</section>
```

Root paths resolve against the store.

## Item scope

```html
<template data-each="people" data-each-key="id">
  <article>
    <mui-avatar
      data-bind-src="item.src"
      data-bind-alt="item.name">
    </mui-avatar>
    <span data-bind-text="item.name"></span>
  </article>
</template>
```

Each instance receives:

| Name | Value |
| --- | --- |
| `item` | Current record |
| `index` | Current array index |
| `key` | Stable key |
| `parent` | Parent binding scope |

## Nested scope

```html
<template data-each="departments" data-each-key="id">
  <section>
    <h2 data-bind-text="item.name"></h2>

    <template data-each="item.people" data-each-key="id">
      <p>
        <span data-bind-text="item.name"></span>
        <small data-bind-text="parent.item.name"></small>
      </p>
    </template>
  </section>
</template>
```

The inner `item` is the person; `parent.item` is the department.

Resolution order:

1. current scope;
2. parent scopes;
3. root store.

Reserved unsafe keys such as `__proto__`, `prototype` and `constructor` must reject during
path parsing.

## Passing data to a child component

Data enters a child through an explicit property:

```html
<mui-avatar-group
  data-bind-items="item.people"
  item-key="id">
</mui-avatar-group>
```

The outer scope assigns the actual array to `avatarGroup.items`. AvatarGroup then creates
its own item/rest scopes. The child does not inherit the parent’s private context
implicitly.

```text
department scope
  → data-bind-items
  → AvatarGroup.items
  → AvatarGroup item/rest scopes
```

## Named component scope

Avatar item template:

```text
item, index, key, parent
```

Avatar rest template:

```text
items, count, parent
```

An empty/content template may define `items`, `empty` or `content` only when the owning
component documents those names. The generic binder must not invent component context.

## One-way data

```html
<mui-avatar data-bind-src="item.src"></mui-avatar>
```

Direction:

```text
scope.item.src → avatar.src
```

Changing `avatar.src` directly does not update the item.

## Writable item scopes

```html
<input data-model-value="item.name">
```

This requires a writable collection route. The scope must know:

```text
collection owner
collection path or adapter
stable key
current item
field path
```

A model write should update the item through the collection owner/key and notify
subscribers. It must not silently mutate an arbitrary plain object.

If a component receives a plain array through `.items`, item templates are one-way unless
the caller also supplies a store-backed adapter or explicit item updater.

## Same-key replacement

When a new record has the same key:

```text
old { id: "ada", name: "Ada" }
new { id: "ada", name: "Ada Lovelace" }
```

retain the instance root, replace the scope’s `item` reference, update subscriptions and
preserve the existing Avatar/input/helper instances.

## Root ownership and disposal

Two binders may not own the same element/property or repeated region. Disposing a root:

- removes store subscriptions;
- removes model event listeners;
- disposes all owned child scopes;
- invokes template cleanup;
- leaves application state intact;
- does not revert later application-owned DOM changes.

