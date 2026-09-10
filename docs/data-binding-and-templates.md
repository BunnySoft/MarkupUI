# Data binding and content templates: investigation

**Status: design investigation, not an implemented collection-binding API.**

MarkupUI should support JSON-backed collections with customizable item content while
remaining dependency-free, HTML-first and free of a virtual DOM. This document compares
browser-native and XAML-inspired approaches. It records a recommendation, not a finalized
API or authorization to implement one.

## Current implementation

| Surface | Available today | Boundary |
| --- | --- | --- |
| State | `mui.state.create`, store `get/set/subscribe`, `mui.state.bind` | Explicit notifications, not automatic observation of object mutations |
| Element bindings | `mui-bind`, `mui-bind-property`, `mui-text`, `mui-visible`, `mui-disabled` | No collection repetition or per-row binding context |
| Native List | Authored `ul`/`ol`/`li` and external CSS | No list JavaScript export or JSON renderer |
| Legacy `mui-list` | Aggregate custom element | No general `ItemsSource`/`ItemTemplate` contract |
| Virtual List | Arrays, stable keys, native `render`/`update` callbacks, `setItems` | Fixed-height virtual collection, not a general template binder |
| Dynamic Input | Native row-template cloning | Component-specific behavior, not a shared collection-binding API |

The existing store supports whole-array replacement:

```js
const store = mui.state.create({ users: [] });
store.set("users", [{ id: "u1", name: "Alice" }]);
```

This does not currently create list items. Calling `push` or mutating an object directly
does not notify subscribers. Nested array-index writes are also not supported safely:
the current `set` implementation replaces intermediate arrays with objects. Do not use
`store.set("users.0.name", "Grace")` as a supported row-editing contract.

Existing two-way bindings listen for `mui:input` and `mui:change`, not native
`input`/`change`. Automatic `checked` inference recognizes legacy checkbox/switch/radio
elements, not ordinary native checkboxes. These limitations must be addressed explicitly
before promising generic editable item templates.

Sources: [state implementation](../src/state/index.ts),
[List](components/list.md), [Virtual List](components/virtual-list.md),
and [Dynamic Input](components/dynamic-input.md).

## Browser primitives and terminology

A custom element may implement a template-reference attribute or a JavaScript property
accepting an `HTMLTemplateElement`. The browser does not provide a universal
`item-template`, `content-template` or data-binding attribute that does this automatically.

Prefer an inert native template:

```html
<template data-item-template>
  <mui-avatar></mui-avatar>
</template>
```

An ordinary `<item-template>` container is not inert. Nested custom elements may upgrade
and initialize, and resource-bearing elements may load before the container is cloned.
Hiding it with CSS does not make it a native template. Template instances must be
imported/cloned and populated before insertion where resource attributes are involved.

In XAML terminology:

| Concept | Purpose |
| --- | --- |
| DataTemplate | Defines how a data object is presented |
| ItemTemplate | Applies a data template to each item in a collection |
| ContentTemplate | Applies a data template to one content object |
| ControlTemplate | Replaces a control's internal structure and visual parts |

Item and content templates can share a small data-presentation mechanism. Replacing
control internals is a different feature with accessibility, required-part and interaction
contracts; it should not be implied by support for item templates.

## Alternative 1: native template and explicit JavaScript

This example uses existing browser APIs only:

```html
<template id="user-row">
  <li>
    <img class="avatar" alt="">
    <span class="name"></span>
  </li>
</template>
<ul id="users"></ul>
```

```js
const users = [
  { id: "u1", name: "Alice", avatarUrl: "/images/alice.png" }
];
const template = document.querySelector("#user-row");
const list = document.querySelector("#users");

for (const user of users) {
  const fragment = document.importNode(template.content, true);
  fragment.querySelector(".avatar").src = user.avatarUrl;
  fragment.querySelector(".name").textContent = user.name;
  list.append(fragment);
}
```

**Comment:** Minimal machinery, explicit behavior, and excellent compatibility with
ordinary JavaScript. The example performs initial rendering only. Updates, removal,
reordering and disposal need additional logic; clearing and rebuilding the list loses
node identity and can disrupt focus and control state.

Keep this approach as an escape hatch. The existing Virtual List already offers a
related callback interface, including a required updater; see its documentation for the
exact detached native `li` factory contract.

## Alternative 2: native template and declarative path bindings

**Proposed, not currently supported:**

```html
<section id="app">
  <mui-list data-bind="users" item-key="id">
    <template data-item-template>
      <mui-avatar
        mui-bind="item.avatarUrl"
        mui-bind-property="src">
      </mui-avatar>
      <span mui-text="item.name"></span>
    </template>
  </mui-list>
</section>
```

```js
const store = mui.state.create({
  users: [
    { id: "u1", name: "Alice", avatarUrl: "/images/alice.png" }
  ]
});

// Proposed extension: bind would discover collections and create row scopes.
const dispose = mui.state.bind(document.querySelector("#app"), store);
```

The proposed collection contract:

- `data-bind` resolves a collection from the current context.
- `item-key` selects stable item identity; each instance receives `item` and `index`.
- The list owns real `ul`/`li` structure; the template supplies each item's interior.
- Explicit data updates reconcile keyed real DOM nodes rather than rebuilding all rows.
- Removed rows release their bindings, event handlers and helper instances.

**Comment:** Recommended default. Structure stays in HTML, presentation in CSS and
application behavior in JavaScript. Simple property paths need no expression evaluator.

The names remain undecided: `data-bind` is inconsistent with the existing `mui-*`
binding vocabulary. Collection binding should also be distinguishable from scalar
two-way binding. The avatar example expresses property assignment intent; a finalized
design should make one-way property binding explicit instead of implying every image
property needs a two-way listener.

## Alternative 3: reusable template references

**Proposed, not currently supported:**

```html
<template id="user-content">
  <mui-avatar
    mui-bind="item.avatarUrl"
    mui-bind-property="src">
  </mui-avatar>
  <span mui-text="item.name"></span>
</template>

<mui-list data-bind="members" item-key="id"
  item-template="user-content"></mui-list>

<mui-list data-bind="reviewers" item-key="id"
  item-template="user-content"></mui-list>
```

A corresponding proposed imperative interface:

```js
await customElements.whenDefined("mui-list");
const list = document.querySelector("mui-list");
list.itemTemplate = document.querySelector("#user-content");
list.items = [{ id: "u1", name: "Alice", avatarUrl: "/images/alice.png" }];
```

**Comment:** Useful for sharing presentation without duplicating markup. An attribute
contains an ID reference, while a property can receive the template object itself.
Treat these as alternative entry points into the same template engine, not separate
renderers. Define reference lookup scope, missing-template errors and precedence when
both inline and referenced templates are supplied.

## Alternative 4: XAML data-template concepts

WPF separates a collection source from its item presentation:

```xml
<ListBox ItemsSource="{Binding Users}">
    <ListBox.ItemTemplate>
        <DataTemplate>
            <StackPanel Orientation="Horizontal">
                <Image Source="{Binding AvatarUrl}" />
                <TextBlock Text="{Binding Name}" />
            </StackPanel>
        </DataTemplate>
    </ListBox.ItemTemplate>
</ListBox>
```

Each item's data context makes `Name` resolve against that item. Reusable templates
can be stored in resources and referenced with
`ItemTemplate="{StaticResource UserTemplate}"`.

| XAML concept | Candidate MarkupUI equivalent |
| --- | --- |
| DataContext | Explicit store/binding scope |
| ItemsSource | Collection path or `.items` property |
| DataTemplate / ItemTemplate | Native HTML template |
| `{Binding Name}` | Path binding such as `mui-text="item.name"` |
| Resource / StaticResource | Template ID or template object |
| Property/collection change notifications | Explicit store and collection updates |

**Comment:** Borrow these concepts, not the full dependency-property, markup-extension
and resource-resolution systems. The WPF `ListBox` also provides selection behavior;
borrowing its template model does not make a MarkupUI List an accessible listbox.

## Alternative 5: XAML-like expressions in HTML

**Illustrative alternative syntax, not a supported API:**

```html
<mui-list items-source="{Binding users}">
  <template>
    <mui-avatar src="{Binding avatarUrl}"></mui-avatar>
    <span text="{Binding name}"></span>
  </template>
</mui-list>
```

**Comment:** Familiar to XAML developers, but the browser treats these as literal
attribute values. MarkupUI would need a parser and rules for context, property targeting,
escaping, errors and binding modes. `text` on a native span has no built-in rendering
meaning. An image with a literal binding in `src` may request that URL if inserted before
the binder processes it.

Dedicated binding attributes are clearer and avoid premature resource-attribute effects.
Borrow XAML's semantics rather than its braces syntax.

WinUI's `{x:Bind}` is a distinct alternative: it generates binding code at build time.
Compile-time validation is attractive, but a required template compiler conflicts with
MarkupUI's no-required-consumer-build goal. It is not necessary for the initial design.

## Alternative 6: Vue-like loops and interpolation

**Illustrative alternative syntax, not a supported API:**

```html
<mui-list>
  <template mui-for="user in users" mui-key="user.id">
    <mui-avatar :src="user.avatarUrl"></mui-avatar>
    <span>{{ user.name }}</span>
  </template>
</mui-list>
```

**Comment:** Concise, and possible without a virtual DOM. However, loops, interpolation,
conditions, events and arbitrary expressions form a new template language. Its parser,
scope rules and debugging model gradually become a framework. Avoid that scope in the
initial implementation; derived values and actions can remain explicit JavaScript.

## Alternative 7: native slots and control customization

Inside a custom element's shadow root:

```html
<header><slot name="header"></slot></header>
<slot></slot>
```

Authored light-DOM content:

```html
<example-panel>
  <h2 slot="header">Members</h2>
  <p>Authored content, not repeated data.</p>
</example-panel>
```

**Comment:** Slots project existing nodes into a shadow tree; they do not repeat or bind
JSON data. An ordinary light-DOM `<slot>` has no shadow projection semantics.
`<template shadowrootmode="open">` is a separate declarative Shadow DOM facility,
not an item-template binding mechanism.

Use slots for authored regions when a component already uses Shadow DOM. Do not add
Shadow DOM merely to support collection templates or confuse slots with ControlTemplates.

## Comparison with other libraries and frameworks

The examples below illustrate the named solutions, **not MarkupUI syntax**. They assume
each solution's normal setup/imports and an array of users with stable `id` and `name`
fields. They are not standalone integration demos. No dependency is being adopted.

### At a glance

Here, "no required build" means application authors can use the described approach
without compiling their templates. It does not mean zero runtime code or dependencies.
These are architectural comparisons, not measured performance or bundle-size rankings.

| Solution | Template authoring | Update model | Required consumer template build? | Fit for MarkupUI |
| --- | --- | --- | --- | --- |
| Native template + proposed binder | Separate HTML | Explicit notifications and keyed DOM updates | No | Best match; binder remains to be implemented |
| Alpine.js | HTML directives and expressions | Reactive state and direct DOM updates | No | Close authoring model; broader expression/runtime scope |
| Knockout | HTML bindings and named templates | Observables and DOM bindings | No | Strong MVVM precedent; different data/identity contract |
| Lit | JavaScript tagged templates | Template parts; keyed `repeat` | No, with browser-resolvable modules | Strong DOM-update precedent; markup moves into JS |
| Handlebars | Text templates, helpers and partials | Produces strings; DOM updates are external | No with compiler runtime; precompilation optional | Good presentation reuse, not live binding |
| Vue | HTML templates or single-file components | Reactive rendering and virtual-DOM reconciliation | No with runtime compiler; SFCs need compilation | Familiar templates, but conflicts with no-VDOM goal |
| React | JavaScript, commonly JSX | State-driven element-tree reconciliation | JSX needs transformation; JS API does not | Useful key/composition lessons, not the target architecture |
| Svelte | Compiled component templates | Compiler-generated reactive DOM updates | Yes | No-VDOM precedent, but requires a compiler workflow |
| Angular | Component templates and template fragments | Compiled views and framework change detection | Yes in the normal production workflow | Rich template/context model, much broader framework scope |
| htmx | HTML request/swap attributes | Server-generated HTML fragment swaps | No | Complementary server workflow, not a local JSON repeater |

### Alpine.js: HTML-first reactive directives

```html
<ul x-data="{ users: [{ id: 'u1', name: 'Alice' }] }">
  <template x-for="user in users" :key="user.id">
    <li x-text="user.name"></li>
  </template>
</ul>
```

Alpine requires `x-for` on a native template with a single root element. Its key
expression identifies rows during reordering. Application state and handlers can be
registered in separate JavaScript rather than embedded in a large `x-data` expression.

**Comment:** One of the closest authoring comparisons. Borrow inert templates, explicit
keys and local scopes. Do not automatically copy its general JavaScript expressions or
reactivity model: MarkupUI currently uses explicit store notifications. A path-only binder
would intentionally be less expressive. Using Alpine itself would add a runtime dependency
to whichever application or library adopts it.

Source: [Alpine x-for](https://alpinejs.dev/directives/for).

### Knockout: observables, binding contexts and reusable templates

```html
<ul id="users" data-bind="foreach: users">
  <li>
    <span data-bind="text: name"></span>
  </li>
</ul>
```

```js
const model = {
  users: ko.observableArray([
    { id: "u1", name: ko.observable("Alice") }
  ])
};
ko.applyBindings(model, document.querySelector("#users"));
model.users()[0].name("Grace");
model.users.push({ id: "u2", name: ko.observable("Bob") });
```

Its template binding also supports named reusable templates:

```html
<script type="text/html" id="user-content">
  <li data-bind="text: name"></li>
</script>
<ul data-bind="template: { name: 'user-content', foreach: users }"></ul>
```

The named-template example is an alternative view, requiring its own binding root.
Knockout exposes contexts such as `$data`, `$index` and `$parent`. An observable array
tracks collection membership; ordinary fields do not become observable just because
their containing array is observable.

**Comment:** A useful web MVVM comparison to XAML. Borrow explicit context and cleanup
contracts, but do not treat its `foreach` identity handling as an explicit `item-key="id"`
API. Replacing objects with fresh JSON objects needs particular attention. MarkupUI also
need not adopt observable functions for every field or parse Knockout's binding expressions.
Its existing proposed `data-bind` name would be especially confusing on a page using
Knockout, strengthening the case for MarkupUI-specific binding attributes.

Sources: [foreach](https://knockoutjs.com/documentation/foreach-binding.html),
[template binding](https://knockoutjs.com/documentation/template-binding.html).

### Lit: tagged templates and keyed DOM parts

```js
import { html, render } from "lit";
import { repeat } from "lit/directives/repeat.js";

function showUsers(users, target) {
  render(html`
    <ul>
      ${repeat(users, user => user.id, user => html`
        <li>${user.name}</li>
      `)}
    </ul>
  `, target);
}
```

Lit updates template parts rather than performing a React-style virtual-DOM tree diff.
The keyed `repeat` directive moves existing row DOM to follow item identity. A plain
`map` has different identity semantics and is not an interchangeable choice for rows
with uncontrolled input state. Using these bare imports directly in a browser requires
an import map or equivalent module resolution.

**Comment:** A strong implementation reference for keyed updates without a virtual DOM.
The tradeoff is template markup inside JavaScript and a rendering dependency.
MarkupUI should borrow the distinction between positional and keyed updates, while keeping
its default templates in HTML. Adopting Lit solely to implement repetition is not required.

Source: [Lit lists and repeat](https://lit.dev/docs/templates/lists/).

### Handlebars: reusable string templates, not live DOM bindings

```html
<script type="text/x-handlebars-template" id="users-template">
  <ul>
    {{#each users}}
      <li>{{name}}</li>
    {{else}}
      <li>No users</li>
    {{/each}}
  </ul>
</script>
```

```js
const renderUsers = Handlebars.compile(
  document.querySelector("#users-template").textContent
);
const markup = renderUsers({ users: [{ id: "u1", name: "Alice" }] });
```

This produces an HTML string; it does not mount nodes, subscribe to changes or reconcile
keys. Partials provide reusable content templates. Templates may be compiled at runtime
or precompiled for use with the runtime-only distribution.

**Comment:** Suitable for initial or server-rendered presentation. Replacing a container's
HTML on every change loses node identity unless a separate DOM update mechanism is added.
Default interpolation escaping is not a complete URL/property safety policy; raw output
and any HTML insertion boundary need deliberate treatment. Prefer native node templates
for MarkupUI's live editable collections.

Sources: [Handlebars guide](https://handlebarsjs.com/guide/),
[built-in helpers](https://handlebarsjs.com/guide/builtin-helpers.html).

### Vue: reactive lists and scoped slots

```html
<ul>
  <li v-for="user in users" :key="user.id">
    {{ user.name }}
  </li>
</ul>
```

A custom Vue list can expose each item through a scoped slot:

```html
<UserList :items="users">
  <template #default="{ item }">
    <span>{{ item.name }}</span>
  </template>
</UserList>
```

`UserList` is an application-defined Vue component here, not a built-in or MarkupUI API.
It must provide the slot's `item` value. Vue scoped slots are template functions, not
native Shadow DOM slots.

**Comment:** The scoped-slot contract closely matches customizable item content, but
Vue's rendering architecture and runtime are not the desired foundation. Borrow the
explicit item context, not Vue compatibility. Vue can use an in-browser template compiler;
it is inaccurate to say every Vue application requires a build.

Sources: [Vue list rendering](https://vuejs.org/guide/essentials/list.html),
[scoped slots](https://vuejs.org/guide/components/slots.html#scoped-slots).

### React: render callbacks and keys

```jsx
function UserList({ users, renderItem }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{renderItem(user)}</li>
      ))}
    </ul>
  );
}

<UserList
  users={users}
  renderItem={user => <span>{user.name}</span>}
/>;
```

The callback returns React elements, not native DOM nodes. Stable keys help reconcile
item identity within the list; they are not HTML IDs. JSX is optional in React, but the
example requires JSX transformation.

**Comment:** A clear reusable rendering contract, but not a match for the user's
no-virtual-DOM and separate-HTML requirements. MarkupUI's imperative callback should
instead return native nodes, with an explicit updater and cleanup contract.

Source: [React rendering lists](https://react.dev/learn/rendering-lists).

### Svelte: compiled keyed each blocks

```svelte
<ul>
  {#each users as user (user.id)}
    <li>{user.name}</li>
  {:else}
    <li>No users</li>
  {/each}
</ul>
```

This is a component-template fragment; reactive data setup is omitted. The compiler
generates DOM-update behavior. A keyed each block follows identity during insertion,
movement and deletion. Reusable snippets provide another way to pass presentation.

**Comment:** Demonstrates that declarative rich templates do not require a virtual DOM.
However, compiling consumer templates introduces a toolchain MarkupUI deliberately
does not require. Borrow stable identity and explicit empty-state concepts, not a compiler.

Source: [Svelte each blocks](https://svelte.dev/docs/svelte/each).

### Angular: tracked collections and template contexts

```html
<ul>
  @for (user of users; track user.id) {
    <li>{{ user.name }}</li>
  } @empty {
    <li>No users</li>
  }
</ul>
```

Angular also offers `ng-template`, `TemplateRef` and `NgTemplateOutlet` for reusable
template fragments with explicit contexts. These are framework constructs, not native
HTML template cloning. Its compiled-view model should not be lumped together with
React-style virtual-DOM reconciliation.

**Comment:** A useful parallel to XAML's template-object and context concepts, but far
broader than a small optional binding layer. Borrow explicit tracking and context
contracts; avoid introducing framework compilation or dependency injection into MarkupUI.

Sources: [Angular control flow](https://angular.dev/guide/templates/control-flow),
[template fragments](https://angular.dev/guide/templates/ng-template).

### htmx: server-rendered fragments instead of client-side JSON templates

```html
<button type="button" hx-get="/users/list"
  hx-target="#users" hx-swap="innerHTML">
  Refresh users
</button>
<ul id="users"></ul>
```

The endpoint returns authored HTML such as `<li>Alice</li>`, not a JSON array. In this
example, the swap replaces the list contents; it does not perform the proposed stable-key
collection reconciliation.

**Comment:** A complementary option for server-driven applications using MarkupUI styles
and elements. It does not solve local JSON item-template binding by itself. Response trust,
enhancement initialization and cleanup after swaps remain integration concerns.
Do not add networking or server-fragment swapping to the collection binder merely to
cover this different workflow.

Source: [htmx documentation](https://htmx.org/docs/).

### Lessons for MarkupUI

The closest references are **Alpine for HTML authoring, Knockout for binding contexts,
Lit for keyed DOM updates, and XAML for the ItemsSource/ItemTemplate separation**.
None needs to become a runtime dependency.

There are three separate decisions: how a template is authored, how data changes are
announced, and how DOM instances are updated. HTML directives do not imply a virtual DOM;
no virtual DOM does not imply no compiler; string templating does not imply live binding.
Keep those distinctions explicit when evaluating any future design.

Applications may independently use another framework around MarkupUI. Interoperability
is not built-in integration: assign one owner to each rendered subtree, avoid having two
binders mutate the same rows, and define custom-element property/event and disposal
boundaries before claiming compatibility.

## Recommendation and implementation boundaries

| Approach | Recommended role |
| --- | --- |
| Native template + callbacks | Supported imperative escape hatch |
| Native template + path bindings | Proposed default authoring model |
| Template ID/object references | Proposed reuse mechanism |
| XAML DataContext / ItemsSource / DataTemplate | Conceptual model to borrow |
| XAML markup expressions or compiled x:Bind | Not required for the initial design |
| Vue-like expression language | Avoid initially |
| Slots / full ControlTemplates | Separate content-projection and control-customization concerns |

Build an optional, small keyed native-template binder rather than putting a second
renderer into each component. Keep ordinary authored HTML/CSS lists available without
the binder. A custom-element convenience layer should reuse the same mechanism.
Virtual List may share template-instance binding and cleanup, but must retain its
distinct virtualization, geometry, focus and row-factory contracts.

Before implementation, settle the following:

1. **API and scope:** consistent attribute names, one-way versus two-way properties,
   `item`/`index` contexts, parent-context access and template-source precedence.
2. **Data updates:** explicit collection replacement, safe path traversal, native
   input/change support, array-index behavior and notification ownership.
3. **Identity and lifecycle:** reject invalid/duplicate keys before mutation, reuse
   keyed nodes, update row contexts on reorder, and dispose removed instances.
4. **Focus and state:** define removal focus behavior, avoid overwriting active drafts,
   and account for custom-element lifecycle callbacks during DOM moves. Node reuse
   alone is not a guarantee that all browser-managed state survives a move.
5. **Safety:** no `eval`, arbitrary expression execution or data-to-`innerHTML` binding.
   Define allowed property targets and URL handling; path-only syntax by itself is
   not a complete safety policy.
6. **HTML and accessibility:** real list structure, unique instance IDs and label
   references, empty states, and no invented selection keyboard behavior.
7. **Acceptance:** exercise initial/empty data, replacement, insertion, deletion,
   reordering, same-key new objects, editable rows, template errors and disposal.
   Measure payload cost without adding a runtime dependency or required consumer build.

This investigation does not introduce `createListBinding`, collection `data-bind`,
`item-template`, `.items` or `.itemTemplate` as available MarkupUI APIs.
