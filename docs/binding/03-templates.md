# 3. Templates and reconciliation

Templates create instances; slots project existing nodes. Native `template` is the Web
adapter for a logical subtree and remains inert until the binder instantiates it.

## Initial scope

| Feature | Rule |
| --- | --- |
| Conditional template | Boolean only; missing/null/non-Boolean conditions fail. False removes and disposes the instance. |
| Repeated template | Dense plain arrays of at most 1,000 items, with required `data-each-key` own-data paths. Keys are unique nonempty strings or safe integers; number/string keys are distinct. |
| Instance root | One element root, with optional surrounding whitespace/comments; the root cannot itself be a native template. |
| Template source | Inline content, root-local `data-template="#id"`, or `data-template="name"` resolved from an explicit `BindingOptions.templates` Map. Native definitions are Web-only. |
| Element-owned region | One direct `m-list-template` inside List, containing one ListItem; optional state owns reconciliation, List owns native semantics. |
| Portable condition | Box's `m-if data-if="path"` contains one element root; optional state owns the same conditional reconciliation. |

This is an explicitly **Web-only** example, not portable `m-*` template authoring:

```html
<div id="editor">
  <button id="add-entry">Add entry</button>
  <template data-each="rows" data-each-key="id">
    <label>
      <span data-bind-text="$item.name"></span>
      <input data-model-value="$item.name" data-model-event="input">
    </label>
  </template>
</div>
```

```js
const store = createStore({ rows: [{ id: "a", name: "Alpha" }] })
const stop = bind(document.getElementById("editor"), store, {
  focusFallback: () => document.getElementById("add-entry"),
})
```

Import `bind`/`createStore` from the optional state entry. Load any selected component
families before binding. Use separate nested templates to combine conditions and
repetition; one source cannot own both directives or scalar/model directives.

Use a visibility property when a node must remain rather than be destroyed.
Do not infer a collection API or template role merely because a component contains children.

## Portable List Region

```html
<m-list>
  <m-list-template data-each="rows" data-each-key="id" label="Tasks" focus-on-remove>
    <m-list-item>
      <m-input data-model-value="$item.name" data-model-event="input"
        data-model-target="native" aria-label="Task name"></m-input>
    </m-list-item>
  </m-list-template>
</m-list>
```

Select List and any content families, then bind the containing root to the application
store. List does not import state or create a private store. `items` remains a computed
snapshot; collection changes use `store.set`. Authored items/containers and another
template cannot share this List. Header/footer regions remain outside the generated list.
The [List demo/API](../../demo/components/list.html#template-heading) owns the component contract.

ListTemplate captures source content inertly; the Web renderer supplies a stable `ul`
and a `li` around each ListItem before the binder owns that instance's placement.
Capture may create source chrome before data validation, but no rendered row is inserted
until preparation succeeds. Source descendants may briefly connect during HTML parsing
or upgrade; inert capture is not a promise that their constructors never run.
Incremental direct children are captured until first source preparation. After that,
adding children alongside native source chrome is an ownership error.

Nested ListTemplate regions reuse the current item/parent/root scopes. A ListTemplate
requires `data-each` and cannot also own `data-if` or scalar/model directives.
Generic portable conditions use the Box-owned If primitive below.

## Portable Conditions

```html
<m-box id="editor">
  <m-button id="edit-report">Edit report</m-button>
  <m-if data-if="editing" focus-target="edit-report">
    <m-input aria-label="Report title" data-model-value="title"
      data-model-event="input" data-model-target="native"></m-input>
  </m-if>
</m-box>
```

Select Box and optional state, plus the content families actually used. Box alone imports
only core and captures the source without binding any store. `If` / `m-if` belongs to the
existing Box family, not the optional root facade or a new distribution entry.
The [Box demo/API](../../demo/components/box.html#condition-heading) owns its element API.
State recognizes the declared element and reads its ordinary native accessor using a
type-only import, as it already does for ListTemplate.

`data-if` is a safe store path and must resolve to a Boolean when its containing instance
is active. False removes and disposes content; true creates a new instance after removal.
Use visibility binding for content that must remain mounted. One element root is required,
with surrounding whitespace/comments allowed. The source cannot own scalar/model
directives, `data-each` or `data-each-key`. Nest separate regions to combine conditions
and lists; conditions do not add an item level to `$item`, `$parent`, `$key` or `$index`.
Inactive source syntax is validated, without evaluating values in nonexistent item scopes.

`focus-target` / `focusTarget` is a literal nonempty exact ID, not a selector or expression.
On focused removal it must identify one connected, surviving owner inside the binding
root. Native controls and portable controls with an explicit `focus()` implementation
are supported; the target or its descendant must actually receive focus. Hidden, inert,
disabled, ambiguous, missing and retiring targets fail. An explicit Web `focusFallback`
callback takes precedence. Without an If target, the nearest applicable opted-in List
policy can apply; otherwise focused removal fails. Unused targets are not resolved.
The target resolves against current DOM IDs during preparation, not a future ID rename.
There is no per-item ID interpolation on the source; repeated regions can use List's policy.

Web mapping keeps a stable inert template anchor inside the layout-transparent host.
The binder owns rendered siblings within that host. Authored descendants may briefly
connect before capture; primitives adopt captured native chrome so instantiation does
not create nested labels/disclosures. Incremental source children are captured until the
first preparation; later unowned live children are rejected. Source capture is not a
sanitizer and does not promise constructor suppression for arbitrary components.

Inline, root-local and programmatic Web definitions reuse the existing source rules below.
Definitions remain Web-only. Refresh, stop/rebind, App reconnect, ID validation, current-key
model/action ownership and source replacement use the same template runtime and error
limits. No alternate renderer or non-Web platform implementation is added.

## Referenced and Programmatic Sources

Reusable definitions are inert native `HTMLTemplateElement` objects, an explicit
**Web-only** source adapter even when their content uses portable `m-*` elements.
They are authored application code, not HTML supplied by store data. The binder never
downloads, evaluates or sanitizes a source; do not supply untrusted template markup.

```html
<m-box id="workspace">
  <m-list>
    <m-list-template data-each="rows" data-each-key="id" data-template="#row"
      label="Tasks" focus-on-remove></m-list-template>
  </m-list>
  <template id="row">
    <m-list-item><m-input aria-label="Task name" data-model-value="$item.name"
      data-model-event="input" data-model-target="native"></m-input></m-list-item>
  </template>
</m-box>
```

`#row` means an exact ID, not a CSS selector. Lookup includes only the explicit binding
root and its ordinary descendants, excluding generated instances. It never crosses a
shadow boundary or searches inert template contents or the enclosing document.
Forward references work. Missing IDs, duplicate IDs (including non-template matches)
and non-template targets fail. Place definitions outside repeated source content.

For programmatic sources, use a name without `#`:

```js
// The placement has data-template="row".
const source = document.createElement("template")
const item = document.createElement("m-list-item")
item.setAttribute("data-bind-text", "$item.name")
source.content.append(item)
const templates = new Map([["row", source]])
const stop = bind(root, store, { templates })
```

Names and ID references are separate namespaces; neither falls back to the other.
Names/IDs must be nonempty and contain no whitespace. Map values must be same-realm
native templates, not strings, fragments, factories, promises or store paths.
Definitions cannot carry structural, reference, scalar or model directives on their
outer template element; nested structural placements may reference other definitions.
There is no implicit component registration or production metadata registry.

A placement must choose inline or referenced content; only whitespace/comments may
accompany a reference. Definitions still require one element root, and List references
require one `m-list-item`. The binder copies definitions without changing or moving
their content; each placement owns independent instances and uses its own data scope.
List retains an empty renderer-owned `li` source anchor for a reference, supplying
native list semantics around copied content without importing state.

The full source graph is validated even for false conditions and empty arrays.
Cycles, more than 32 reference hops, or more than 1,000 expanded reference uses in one
placement's source graph fail before rendered instances are inserted. These resource
bounds are distinct from advisory payload-byte recommendations.
Repeated-source ID restrictions, key/value checks and focus policies still apply.

Call `stop.refresh()` after changing a definition, Map entry or reference attribute.
The next store-triggered reconciliation also reads current definitions. Expanded
markup participates in the placement signature: unchanged content retains keyed
instances; changed content, including nested definitions, replaces the enclosing
placement's instances after validation. This can replace a larger outer subtree than
the edited nested definition. Focused replacement requires the usual fallback policy.
Invalid or missing definitions preserve the previous rendered instances; restore the
source and retry. Removing the placement instead removes its generated instances.
Stop/rebind on the same root retains instances when the resolved content is unchanged.

The optional App can use root-local IDs; it does not expose the Web template Map.
Use explicit `bind` for programmatic sources. Platform-neutral reusable definitions
and non-Web source adapters remain separate work.

## Reconciliation

Validate the entire next key set before changing the tree. Retain and move surviving
instances, dispose removed keys, create new keys, and update retained scopes and indices.
Never clear and rebuild the collection as the normal update path.

Stable nodes preserve application state and listeners; native resources and focus still
need browser-aware handling. Missing or duplicate keys must fail before partial mutation.
The first data-update mechanism can be explicit whole-array replacement; additional keyed
operations must use the same notification and reconciliation rules.
All next instance paths/values and source directives are prepared before changing
the region. Invalid inactive source syntax also fails. Arbitrary component setters
remain responsible for their own validation; their external effects are not rolled back.
Notification errors do not undo `MStore.state`; correct the data and retry.

## Instance lifecycle

1. Import the inert template and validate its root.
2. Associate its scope and apply initial values before insertion where possible.
3. Install subscriptions and declared model listeners.
4. Insert the instance and connect explicitly owned behavior.
5. Register cleanup for everything created by the instance.

Native model owners may become available during attachment. Unavailable owners fail
setup and newly attached instances/listeners are released. Model events are enabled
only after successful attachment. Store writes during rendering queue another pass;
non-settling updates fail after 100 synchronous passes instead of looping indefinitely.

`stop()` releases active scopes/listeners/subscriptions but preserves rendered DOM.
Rebinding the **same root** recognizes retained instances, including nested ones, and
reconciles current data without duplicates. It can use a new explicitly supplied store.
Changing source markup/directives replaces affected instances after validation.
`refresh()` after source removal removes its instances and releases their bindings.

The binder owns source/instance placement. Moving an instance/source to a different
parent, or extracting a scoped descendant, is not an ownership-transfer API: refresh
rejects it, and displaced models cannot write through stale routes. Restore the owned
placement before retrying. Same-parent instance reorder is reconciled by key. A stopped
instance cannot be rebound separately as an unrelated root. Consumers with independent
child-reordering controllers cannot share this region.

Moving an unchanged key does not dispose it. Removing an instance first resolves focus
under the owning element's policy, then releases bindings, helpers and native resources.
Cleanup must be reentrancy-safe and must not overwrite later application-owned state.

## Paired IDs

One-way `data-bind-id` or `data-bind-attr-id` assigns an application-provided ID.
Fixed authored IDs remain prohibited throughout repeated sources, including nested
inert content. The binder does not generate IDs, derive them from keys or rewrite
arbitrary HTML. Supply distinct strings for every simultaneous placement, including
mirrored instances of the same source. Renderer-generated IDs remain component-owned.

```html
<m-list-template data-each="rows" data-each-key="key" label="Tasks" focus-on-remove>
  <m-list-item>
    <m-label data-bind-html-for="$item.fieldId" data-bind-text="$item.title"></m-label>
    <m-input data-bind-id="$item.fieldId" data-bind-attr-aria-describedby="$item.helpId"
      data-model-value="$item.name" data-model-event="input" data-model-target="native"></m-input>
    <m-small data-bind-id="$item.helpId">Task description</m-small>
  </m-list-item>
</m-list-template>
```

For example, a record supplies `{ key: "a", fieldId: "task-a", helpId: "help-a",
title: "Report", name: "Quarterly report" }`. Select the List, Box and Input families
and their dependencies; place ListTemplate inside a List and bind the containing root.
Native Web labels can use `data-bind-html-for` or `data-bind-attr-for` too.
Do not bind both channels on one label. `data-model-id` and `data-model-html-for`
are unsupported: identifiers and label targets are one-way relationships.

| Channel | Value |
| --- | --- |
| `id` | Nonempty string with no whitespace; null, numbers and empty strings fail. |
| `htmlFor` / attribute `for` | One exact target ID on `label` or `m-label`, with no surrounding whitespace. |
| ARIA attributes `aria-activedescendant`, `aria-details`, `aria-errormessage` | One target ID, following the WAI-ARIA 1.2 value types. |
| ARIA attributes `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-owns`, `aria-flowto` | One or more HTML-whitespace-separated target IDs, without duplicate tokens. |

Single-target ARIA values also have no surrounding whitespace. Multi-target separators
are space, tab, LF, CR or form feed, not arbitrary Unicode whitespace.
ARIA relationships use the explicit `data-bind-attr-*` channel. Null/undefined removes
an attribute relationship; empty strings are invalid. Portable `htmlFor` accepts null
according to Label's setter; native property binding still requires a string, so use
the attribute channel for nullable native `for`.

Preflight indexes the next surviving tree before bound scalar writes or placement.
Each bound ID must be unique in its Document, ShadowRoot or detached tree, including
collisions outside the binding root. Every bound reference must resolve to exactly one
surviving target **inside** the binding root; static authored targets and other surviving
instances are allowed. Unrelated static duplicate IDs are not independently audited.
Retiring instances and descendants replaced by text binding do not count as targets.
Whole-array swaps and replacing an instance while reusing its retiring IDs are allowed.

Native label targets must be labelable controls. Portable Label may resolve a component's
direct native owner through its existing implementation. Binding does not add new
attribute forwarding or accessibility semantics to a selected component; the author
still owns valid roles, relationship meaning and any required visibility/error state.
Static, unbound relationships and other IDREF-bearing HTML attributes are not audited.

Root-level pairs use the same preflight even without structural regions; their root
scalar bindings are prepared together so a later text write cannot destroy a referenced
target without validation. Unchanged text retains its existing children. Adding or
removing ID directives rewires root subscriptions without overwriting unchanged drafts. `refresh()`
reasserts binder-owned IDs/references after external changes without overwriting
unchanged model drafts. External DOM writes are not monitored automatically.
Invalid preflight preserves the prior rendered pairs; store notification failures
still do not roll back store data. Correct the data and retry.

This is next-state validation, **not atomic DOM mutation**. Synchronous setters and
component callbacks can observe intermediate IDs during swaps or replacement, and
component-owned native associations may settle through their existing observers.
Arbitrary component effects are not rolled back. Cross-root coordinated updates,
cross-shadow references and automatic instance ID allocation are not provided.

Value-type reference: WAI-ARIA 1.2, `https://www.w3.org/TR/wai-aria-1.2/`.

## IDs, safety and focus

Use the paired-ID rules above, wrapping labels or explicit accessible names.

No expression execution or data-to-HTML insertion is allowed. URL-bearing properties follow
their element policy. Active native edits must not be overwritten unless the model binding
owns that write.

`BindingOptions.focusFallback({ active, removed })` must be side-effect-free and return
a connected, surviving, enabled focusable `HTMLElement`. The binder validates the target
before tree mutation, then verifies it actually receives focus. Missing/invalid policies
reject focused removal. Focus outside removed instances is not moved. Surviving native
controls retain focus, selection and uncommitted drafts on reorder; unchanged data is
not reassigned merely because the index changed.

`ListTemplate.focusOnRemove` / `focus-on-remove` opts into focusing its surviving
semantic list, including an empty list. An explicit binding callback takes precedence,
and an invalid callback is not replaced by the list policy. If an inner list is itself
removed, only an opted-in surviving outer list can receive fallback focus.

The optional App reconnect uses the same retained-instance mechanism. Its portable
ListTemplate regions can use `focus-on-remove`, and If regions can use `focus-target`;
App does not expose the Web callback. Other focused removals require explicitly moving
focus or a configured `bind` root.

## References

- [Previous template examples and reconciliation discussion](../archive/binding/04-templates-and-reconciliation.md)
- [Browser primitives and slot/template comparison](../archive/binding/01-web-platform-primitives.md)
