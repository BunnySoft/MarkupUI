# 1. Core and ViewElement

## Loading

ESM applications import `ViewElement` from `@dataengine/markup-ui/core`.
Browser modules can import the served `markup-ui-core.js`. Classic scripts load
`markup-ui-core.global.js`, which exposes `MarkupUICore.ViewElement`.

Core registers no UI components and installs no stylesheet. Components share this one base;
there is no production metadata or decorator API.

The optional package root also exports this same `ViewElement`; `m.elements.Base`
references it. The replaced `MElement` export and implementation have been removed.
Use `/core` for extensions that do not need the root's query, state, theme or other services.
The root ESM entries import `markup-ui-core.js`; classic applications load
`markup-ui-core.global.js` and `markup-ui-state.global.js` before `markup-ui.global.js`,
then any selected component scripts. Selected components do not require state.

## Registration

Each public element class declares an own static `tag` string in the `m-*` namespace.
`ViewElement.register(classes, registry?)` checks the complete list before registering it.
The registry defaults to the browser's `customElements`.

Classes must extend the shared base. Invalid or duplicate tags, inherited-only tags and
conflicting existing constructors fail without partial registration. Re-registering the
same constructor is idempotent. Class names are not used to infer tags.

The root's `registerElement(name, constructor, registry?)` and `m.elements.register`
require `name` to match the constructor's own `tag` and delegate to these same checks.
`registerElements` preflights the complete foundation family before defining any element.
Root registration does not register the separately selected component catalog.

## Properties and methods

Write ordinary typed getters/setters. The component owns its `observedAttributes` list,
its defaults, validation and update behavior. Internal state remains ordinary fields.
There is no schema lookup or generic method dispatch on the execution path.

| Protected helper | Behavior |
| --- | --- |
| `upgradeProperties()` | Find own values shadowing class accessors and replay through setters. Reject read-only/nonconfigurable values and restore an own value if its setter throws. |
| `setStringAttribute(name, value)` | Accept string/null; null removes the attribute. |
| `booleanAttribute(name, defaultValue)` | Read absent/default, empty/`true`, or `false` Boolean text. |
| `setBooleanAttribute(name, value, presence = true)` | Validate Boolean, then toggle presence or write Boolean text. |
| `choiceAttribute(name, choices, defaultValue)` | Read a known string choice; an absent attribute returns the explicit default, which may be null. |
| `setChoiceAttribute(name, value, choices)` | Validate a non-null choice and write it. |
| `setNullableChoiceAttribute(name, value, choices)` | Remove for null, otherwise validate/write a choice. |
| `numberAttribute(name, defaultValue)` | Read a finite number, or return the explicit absent-value default. The component applies any further bounds. |
| `emit(name, detail, options?)` | Directly dispatch a CustomEvent; bubbling defaults to true. Return the native cancellation result. |

Upgrade inspects accessor descriptors once during initialization; it does not consult
metadata or execute prototype getters to discover rules. Call it before initial rendering.
Avoid setters causing partial rendering while pre-upgrade values are replayed.

Presence Boolean getters normally use `hasAttribute` directly. String getters normally
use `getAttribute`. Native operations such as focus remain ordinary method calls.
Invalid direct attribute changes follow browser Custom Element error reporting rather
than being silently converted to another value.

## Authoring example

```ts
import { ViewElement } from "@dataengine/markup-ui/core"

class ProfileLabel extends ViewElement {
  public static readonly tag = "m-profile-label"

  public static get observedAttributes(): string[] {
    return ["label"]
  }

  public get label(): string | null {
    return this.getAttribute("label")
  }

  public set label(value: string | null) {
    this.setStringAttribute("label", value)
  }

  public connectedCallback(): void {
    this.upgradeProperties()
    this.renderLabel()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.renderLabel()
  }

  private renderLabel(): void {
    this.textContent = this.label ?? ""
  }
}

ViewElement.register([ProfileLabel])
```

Compile normally. An independently distributed plugin must keep core external and use
the same core module as the application.

## Optional root lifecycle

The package root retains foundation/dynamic elements separately from the selectable
catalog. The following are implemented Web baselines, not approval of all retained root
contracts or non-Web renderers.

`m-app` accepts a store from the shared state entry, including assignment before element
upgrade. Acquiring its default `store` or assigning a store establishes its state owner;
supplying inline JSON as well is an error, not an implicit replacement. Disconnect before
replacing the store. Reconnection reinstalls bindings and actions against that same owner;
removed nodes and disconnected apps stop receiving updates. The optional inline
`script[type="application/json"][data-m-state]` is an explicit Web configuration adapter.
Load bound component definitions before App initializes, or keep the App disconnected
until those definitions are ready; unknown binding properties are errors.
App's action installation receives that same live binding for typed `m-arg-*`
arguments and reinstalls it on reconnect. Manual callers use
`installActions(root, binding)`; passing only a store retains literal-only parameters.
See [scoped actions](../binding/06-actions.md) for ownership, errors and async limits.

`m-field label="Name"` creates a native label for the first non-hidden input, textarea or
select owned by that field, excluding nested Fields. Author one logical control per Field;
use FormItem with native fieldset/legend semantics for groups. Field neither imports nor
registers control families. Late controls, replacement controls, ID/type changes and live
`label` writes are reconciled. Empty/null labels remove the generated label. Existing
control IDs and accessible names remain untouched; an unnamed native control receives a
root-unique ID, retained for stable relationships. Native labels provide focus and
activation, including disabled behavior, without synthetic click forwarding. Association
after asynchronous control creation settles through the field's local mutation observer.

```html
<m-field label="Account name"><m-input name="account"></m-input></m-field>
<m-accordion-item title="Preferences"><m-span>Account preferences</m-span></m-accordion-item>
```

Input and Box in this example are separate application selections with their own CSS.
Native labels, buttons and content containers are renderer-owned, not required authoring.

`m-accordion-item` exposes Boolean-presence `open` and string `title` properties/attributes.
Writes update its retained native button and content without replacing authored children.
Native button activation toggles `open`; Enter/Space use native keyboard behavior. There
is no synthetic model-update event or group exclusivity contract. Disconnect releases
activation listeners; reconnect synchronizes attributes and attaches one listener.

Removing or emptying a connected `m-theme`'s `name` releases its applied tokens and theme
marker. Switching names validates the new theme before releasing the previous one.
Earlier inline values and priorities are restored only while the renderer still owns
the current write; later application changes survive cleanup. Theme scopes are independent.
Disconnection retains presentation; reconnect reconciles the current name.

The root stylesheet owns these elements, shared tokens/layout utilities and its feedback
service. It no longer supplies migrated component-family styles; select each family's CSS.

### Other Retained Surfaces

`m-header` and `m-main` supply default banner/main roles only when the application has
not supplied `role` or a different `data-role`. Section applies an explicit `data-role`
on connection. Reconnection preserves application roles; these Web wrappers do not
create native header/main/section elements or enforce document landmark cardinality.
Changing `data-role` is not a live role-binding API; use the native `role` attribute.

Stack, Row, Wrap and Center retain their CSS layout defaults and authored children.
Spacer's default `flex: 1` now belongs to CSS rather than a reconnect-time inline write,
so application flex declarations survive. Option is inert configuration, not a native
option renderer. Accordion is a passive container, not an exclusivity controller.

Include accepts only application-trusted same-origin markup, subject to the shared
sanitizer and bounded HTML transport. Disconnect/source replacement abort requests;
stale responses cannot replace current content. It is not a remote untrusted-component
sandbox. Optional DataGrid and Rating remain the separately installed Web baselines
documented by the [plugin demo](../../demo/components/plugins.html).

## References

- [Source pattern](../architecture/06-source.md)
- [Development metadata](../architecture/05-meta.md)
- [Implementation](../../src/core/view-element.ts)
