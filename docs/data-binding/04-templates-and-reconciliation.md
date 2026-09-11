# 4. Templates and reconciliation

Native templates create data-bound nodes. Slots only project existing nodes. This page
defines proposed template forms, identity and lifecycle.

## Template categories

| Template | Purpose |
| --- | --- |
| Conditional | Create/remove one instance from a Boolean path |
| Repeated item | Create one instance per collection item |
| Component item/rest/empty/content | Customize a component-owned region |
| Reusable referenced | Share one template across consumers |
| Imperative factory | Explicit JavaScript escape hatch |

## Conditional template

```html
<template data-if="profile.showDetails">
  <section>
    <h2 data-bind-text="profile.name"></h2>
  </section>
</template>
```

True creates and binds one instance. False disposes and removes it. Use
`data-bind-hidden` when the same node must remain.

## Repeated template

```html
<ul>
  <template data-each="people" data-each-key="id">
    <li>
      <mui-avatar
        data-bind-src="item.src"
        data-bind-alt="item.name">
      </mui-avatar>
      <span data-bind-text="item.name"></span>
    </li>
  </template>
</ul>
```

The collection must be bounded. The complete next key set is validated before mutation.

## One instance root initially

Require exactly one root element:

```html
<template data-each="people" data-each-key="id">
  <li>...</li>
</template>
```

Do not initially allow unrelated multiple roots. Multiple roots require range anchors and
make movement, focus recovery and disposal substantially harder. A single wrapper may
contain any permitted internal structure.

## Keyed reconciliation

For:

```text
A, B, C → C, A, D
```

the binder:

1. validates all new keys;
2. retains C and moves its existing instance;
3. retains A and moves its existing instance;
4. disposes B;
5. creates D;
6. updates every retained index/scope.

It does not clear and rebuild the container. Stable instances preserve focus, native
input state, image loading, listeners and component controllers where the browser permits
node movement without restarting an internal resource.

## Reusable templates

Inline:

```html
<mui-avatar-group>
  <template data-avatar-template>...</template>
</mui-avatar-group>
```

Referenced:

```html
<template id="person-avatar">...</template>
<mui-avatar-group item-template="person-avatar"></mui-avatar-group>
```

Property:

```js
group.itemTemplate = document.querySelector("#person-avatar")
```

For the first version, more than one source should reject rather than rely on complicated
precedence.

## Instance creation

1. clone/import the inert template;
2. verify one valid root;
3. create and associate the scope;
4. apply initial bindings before insertion where possible;
5. subscribe paths and install model listeners;
6. insert the completed instance;
7. invoke the optional connection hook;
8. register cleanup.

Applying resource-bearing properties such as image `src` before insertion avoids literal
placeholder requests and unnecessary intermediate states.

## Lifecycle and helper composition

Every instance owns a cleanup registry:

```js
group.connectItem = ({ element, item, key, onCleanup }) => {
  const controller = connectChildBehavior(element, item)
  onCleanup(() => controller.disconnect())
}
```

Moving an unchanged key does not run cleanup. Removing a key:

1. resolves focus according to the owning component policy;
2. invokes registered cleanup;
3. removes subscriptions/listeners;
4. detaches helpers;
5. removes the instance;
6. releases scope tracking.

The binder does not automatically discover every component helper. Applications or owning
components connect behavior explicitly.

## Focus and native state

Before removing an instance containing focus, the owner must choose a destination such as:

- the next retained item;
- the previous retained item;
- the collection root;
- an explicit authored fallback.

Updates must not overwrite an actively edited native field unless the model binding owns
that write. Reordering a key should move its node instead of recreating it.

## IDs and references

Templates containing fixed IDs may create duplicates. The initial contract should prefer:

- wrapping labels;
- `aria-label`;
- component-generated stable IDs derived from bounded safe keys;
- explicit instance initialization hooks.

Reject invalid duplicate IDs when they would break required labels, controls or ARIA
relationships. The binder is not a general HTML ID rewriter.

## Store updates

The first implementation needs only explicit whole-array replacement:

```js
store.set("people", nextPeople)
```

A later list API may add keyed insert/update/move/remove operations, but every operation
must notify through the same collection subscription and produce the same reconciliation.
Direct array/object mutation remains nonreactive.

## Safety

- no `eval`, `Function` or JavaScript expression parser;
- no data-to-`innerHTML`;
- reject unsafe paths and unsupported target values;
- validate keys before mutation;
- keep templates inert until cloning;
- prevent overlapping binder ownership;
- define URL-bearing property policy separately;
- dispose every subscription/listener/observer/timer created for an instance.

