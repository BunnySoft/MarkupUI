# 1. Core and ViewElement

## Loading

ESM applications import `ViewElement` from `@dataengine/markup-ui/core`.
Browser modules can import the served `markup-ui-core.js`. Classic scripts load
`markup-ui-core.global.js`, which exposes `MarkupUICore.ViewElement`.

Core registers no UI components and installs no stylesheet. Components share this one base;
there is no production metadata or decorator API.

## Registration

Each public element class declares an own static `tag` string in the `m-*` namespace.
`ViewElement.register(classes, registry?)` checks the complete list before registering it.
The registry defaults to the browser's `customElements`.

Classes must extend the shared base. Invalid or duplicate tags, inherited-only tags and
conflicting existing constructors fail without partial registration. Re-registering the
same constructor is idempotent. Class names are not used to infer tags.

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

## References

- [Source pattern](../architecture/06-source.md)
- [Development metadata](../architecture/05-meta.md)
- [Implementation](../../src/core/view-element.ts)
