# 6. Scoped actions

Named actions stay in the optional root facade, not in core, state or selected
components. Import `registerAction` and `installActions` from
`@dataengine/markup-ui`, or use the classic root's `m.actions.register/install`.
The root already depends on core and state; selecting actions does not require
the full-catalog aggregate. Account for that root cost alongside selected families.

## Arguments

| Authored channel | Action context | Meaning |
| --- | --- | --- |
| `m-action="task.remove"` | Registered action name | Literal name, activated by a bubbling Web click. |
| `m-param-mode="remove"` | `parameters.mode` | Literal string; not a path or expression. |
| `m-arg-key="$key"` | `arguments.key` | Plain data read from the explicit binding at activation time. |

Argument names use lower-case kebab-case, remain unchanged as object keys, and cannot
be `constructor` or `prototype`. Empty/malformed names and unsafe paths fail at
activation before invoking the action. Argument directives do not assign element
properties or create subscriptions; changing their attributes is read at the next
activation. This is not an expression evaluator or generic property engine.

```html
<m-list>
  <m-list-template data-each="tasks" data-each-key="id" label="Tasks" focus-on-remove>
    <m-list-item>
      <m-button m-action="task.remove" m-arg-key="$key">Remove task</m-button>
    </m-list-item>
  </m-list-template>
</m-list>
```

```js
import { bind, createStore } from "@dataengine/markup-ui/state"
import { installActions, registerAction } from "@dataengine/markup-ui"

const store = createStore({ tasks: [{ id: "a", name: "Review" }] })
const binding = bind(root, store)
registerAction("task.remove", ({ store, arguments: args }) => {
  store.set("tasks", store.get("tasks").filter(task => task.id !== args.key))
})
const stopActions = installActions(root, binding)
// Dispose both owners, then bind/install again when reusing the retained tree.
stopActions()
binding()
```

List and Button are separate selections. See the [List demo](../../demo/components/list.html#template-heading)
for the working composition. An `m-app` supplies its live binding to its action
installation automatically; do not install a second action owner on that same root.
If action installation fails during App initialization, App releases its newly
created binding; remove the conflict before reconnecting.

## Explicit Scope

`installActions(root, source?)` accepts either an `MStore` for literal-only actions or
a live `Binding` for scoped arguments. Without a binding, `m-arg-*` fails, even when a
store was supplied. No DOM ancestor/store lookup or implicit binding occurs.

The callable `Binding` exposes its read-only `store` identity and
`read(element, path): unknown`. Reads require an element discovered by the last
successful bind/refresh and still inside its owned tree. Newly added elements need
`binding.refresh()` first; App schedules that through its existing child observer.
Inert sources, another binding's elements and extracted/retiring instances cannot
silently become root-scoped reads. Reads during an update or after disposal fail.
An action installation is disposed separately; replacing a binding requires
reinstalling actions with the new binding, not keeping a disposed reference.

Inside templates, arguments use the existing `$item`, `$parent`, `$root`, `$key` and
`$index` rules. Conditions do not invent an item scope. Unprefixed paths still read
the root store, and dollar-prefixed root keys remain literal outside templates.
Every enclosing stable key is resolved against current data, including for root-only
arguments. Reorder and immutable replacement cannot leave a captured array index;
missing/ambiguous keys fail, including after a rejected render left old nodes visible.

Arguments preserve scalar types, null/undefined and actual plain array/object
references. Both outer `arguments` and `parameters` maps are frozen; nested data is
not cloned or frozen. Treat it as read-only and write through the owning store.
There is no new action-specific collection API or automatic model write.

## Events and Lifetime

Native Button activation supplies keyboard and disabled behavior. The action layer
does not synthesize clicks, intercept default navigation/submission, infer event
values or make arbitrary hosts keyboard-accessible.

The nearest installed action root owns a click, even when no action exists there;
an outer root cannot execute it a second time. Ownership is captured before bubbling,
so disposing an installation during its action cannot hand the same click to an outer
root. Duplicate installation on one root fails. The returned disposer is idempotent.
Independent action roots can be nested; **binding roots still cannot overlap**.

Unknown names, argument resolution failures and synchronous/asynchronous action
exceptions dispatch one bubbling `m:error` from the action element. Direct
`invokeAction(name, context)` returns a rejected Promise for unknown names and either
kind of exception. Its explicit context includes `arguments` and `parameters` maps.

Arguments are values read at invocation, not live routes after `await`. Numeric indices
can become stale during async work; retain a stable key and check current store data
before a later write. Action disposal does not cancel in-flight work or suppress its
eventual error. An error from an already detached element need not reach the old root;
applications own cancellation and error observation for their async actions.

These Web checks do not establish real-device, screen-reader, security or broad
performance acceptance. Generic portable conditions remain separate delivery work.
