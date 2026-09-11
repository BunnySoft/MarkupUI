# 2. Binding language

**Status: proposed syntax, not implemented.**

## Current runtime

MarkupUI currently provides:

| Current surface | Behavior | Gap |
| --- | --- | --- |
| `m.state.create` | Explicit `get`, `set`, `subscribe`. | No collection operations/transactions. |
| `m.state.bind` | Scans the current subtree once. | Does not bind later template instances. |
| `m-bind` | Two-way `value`, or selected `checked` controls. | Name is ambiguous. |
| `m-bind-property` | Selects the `m-bind` property. | Verbose and separate from the path. |
| `m-text` | One-way `textContent`. | Different naming pattern. |
| `m-visible` | Inverse `hidden`. | Semantic inversion rather than a property binding. |
| `m-disabled` | One-way disabled state. | Special case for an ordinary property. |
| Model events | `m:input`, `m:change`. | Native input/change are not consumed. |

The proposed language replaces those inconsistencies while preserving compatibility
aliases initially.

## Grammar

```text
data-bind-<property>="<path>"
data-bind-attr-<attribute>="<path>"
data-bind-text="<path>"

data-model-<property>="<path>"

data-if="<path>"
data-each="<path>"
data-each-key="<field-or-path>"
```

Values are paths, not JavaScript expressions.

| Pattern | Direction | Destination |
| --- | --- | --- |
| `data-bind-*` | State → element | JavaScript property |
| `data-bind-attr-*` | State → element | HTML attribute |
| `data-bind-text` | State → element | Literal `textContent` |
| `data-model-*` | State ↔ element | JavaScript property |
| `data-if` | State → DOM | Conditional template |
| `data-each` | Collection → DOM | Repeated template |

## Property binding

```html
<m-avatar
  data-bind-src="profile.src"
  data-bind-size="profile.avatarSize"
  data-bind-alt="profile.name">
</m-avatar>
```

Property names are derived from the suffix. Kebab case maps to camel case:
`data-bind-fallback-src` targets `fallbackSrc`.

This channel supports actual strings, numbers, booleans, arrays, records, elements and
functions. Arrays/records are not serialized into attributes.

```html
<m-avatar-group data-bind-items="people"></m-avatar-group>
<m-button data-bind-disabled="form.busy">Save</m-button>
<section data-bind-hidden="panel.hidden">Details</section>
```

## Attribute binding

```html
<m-avatar
  data-bind-src="profile.src"
  data-bind-attr-aria-label="profile.name"
  data-bind-attr-data-profile-id="profile.id">
</m-avatar>
```

Null/undefined removes the attribute. Boolean attributes use presence/removal. Other
primitive values become strings. Arrays, records, elements and functions reject.

## Text binding

```html
<strong data-bind-text="profile.name"></strong>
```

`data-bind-text` always writes `textContent`. There is no runtime HTML binding. A rare
property actually named `text` may use an explicit escape such as `data-bind-prop-text`.

## Two-way model binding

```html
<input data-model-value="profile.name">
<input type="checkbox" data-model-checked="settings.enabled">
<m-select data-model-value="form.country"></m-select>
```

`bind` is always one-way; `model` is always two-way. No direction is inferred from the
element.

A model requires:

- a readable/writable property;
- a declared native/component user event;
- an explicit event-value extraction rule;
- programmatic assignment that does not emit a user change recursively.

Native controls use native `input` and/or `change`. MarkupUI components must expose model
metadata or a shared event/value convention. `data-model-attr-*` and `data-model-text` are
invalid.

## Why not binding expressions in real attributes?

Rejected canonical forms:

```html
<m-avatar src="{Binding profile.src}"></m-avatar>
<m-avatar src="{{profile.src}}"></m-avatar>
<m-avatar :src="profile.src"></m-avatar>
```

The first two give the browser/custom element a literal invalid `src` before binding and
encourage an expression language. Colon shorthand is valid HTML but less compatible with
XML, JSX, validators and CSS selectors.

Explicit metadata permits a valid fallback:

```html
<m-avatar
  src="./fallback.png"
  data-bind-src="profile.src">
</m-avatar>
```

Boolean interpolation is particularly incorrect because attribute presence means true:

```html
<!-- Incorrect even when form.busy resolves to false. -->
<button disabled="{{form.busy}}">Save</button>

<!-- Correct Boolean property assignment. -->
<button data-bind-disabled="form.busy">Save</button>
```

## WPF direction comparison

WPF:

```xml
Text="{Binding Profile.Name, Mode=OneWay}"
Text="{Binding Profile.Name, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}"
```

MarkupUI:

```html
<input data-bind-value="profile.name">
<input data-model-value="profile.name">
```

| WPF | MarkupUI |
| --- | --- |
| `Mode=OneWay` | `data-bind-*` |
| `Mode=TwoWay` | `data-model-*` |
| `PropertyChanged` | Native `input` |
| `LostFocus` | Native `change` |
| `Explicit` | Explicit store/controller update |

OneTime and OneWayToSource are not required initially.

## Explicit activation

Bindings are processed only under a root explicitly passed to the binder:

```js
const store = m.state.create(initialState)
const dispose = m.state.bind(document.querySelector("#app"), store)
```

No global document scan or automatic `data-*` activation occurs.

## Compatibility aliases

| Existing | Preferred |
| --- | --- |
| `m-bind="profile.name"` | `data-model-value="profile.name"` |
| `m-bind` + `m-bind-property="checked"` | `data-model-checked="..."` |
| `m-text="profile.name"` | `data-bind-text="profile.name"` |
| `m-disabled="form.busy"` | `data-bind-disabled="form.busy"` |
| `m-visible="panel.open"` | Prefer a real `data-bind-hidden` state |

Legacy aliases may reuse the new engine. Removing them requires an explicit compatibility
decision.

