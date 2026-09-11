# 2. Binding language

**Status: proposed syntax, not implemented.**

## Current runtime

MarkupUI currently provides:

| Current surface | Behavior | Gap |
| --- | --- | --- |
| `mui.state.create` | Explicit `get`, `set`, `subscribe`. | No collection operations/transactions. |
| `mui.state.bind` | Scans the current subtree once. | Does not bind later template instances. |
| `mui-bind` | Two-way `value`, or selected `checked` controls. | Name is ambiguous. |
| `mui-bind-property` | Selects the `mui-bind` property. | Verbose and separate from the path. |
| `mui-text` | One-way `textContent`. | Different naming pattern. |
| `mui-visible` | Inverse `hidden`. | Semantic inversion rather than a property binding. |
| `mui-disabled` | One-way disabled state. | Special case for an ordinary property. |
| Model events | `mui:input`, `mui:change`. | Native input/change are not consumed. |

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
<mui-avatar
  data-bind-src="profile.src"
  data-bind-size="profile.avatarSize"
  data-bind-alt="profile.name">
</mui-avatar>
```

Property names are derived from the suffix. Kebab case maps to camel case:
`data-bind-fallback-src` targets `fallbackSrc`.

This channel supports actual strings, numbers, booleans, arrays, records, elements and
functions. Arrays/records are not serialized into attributes.

```html
<mui-avatar-group data-bind-items="people"></mui-avatar-group>
<mui-button data-bind-disabled="form.busy">Save</mui-button>
<section data-bind-hidden="panel.hidden">Details</section>
```

## Attribute binding

```html
<mui-avatar
  data-bind-src="profile.src"
  data-bind-attr-aria-label="profile.name"
  data-bind-attr-data-profile-id="profile.id">
</mui-avatar>
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
<mui-select data-model-value="form.country"></mui-select>
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
<mui-avatar src="{Binding profile.src}"></mui-avatar>
<mui-avatar src="{{profile.src}}"></mui-avatar>
<mui-avatar :src="profile.src"></mui-avatar>
```

The first two give the browser/custom element a literal invalid `src` before binding and
encourage an expression language. Colon shorthand is valid HTML but less compatible with
XML, JSX, validators and CSS selectors.

Explicit metadata permits a valid fallback:

```html
<mui-avatar
  src="./fallback.png"
  data-bind-src="profile.src">
</mui-avatar>
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
const store = mui.state.create(initialState)
const dispose = mui.state.bind(document.querySelector("#app"), store)
```

No global document scan or automatic `data-*` activation occurs.

## Compatibility aliases

| Existing | Preferred |
| --- | --- |
| `mui-bind="profile.name"` | `data-model-value="profile.name"` |
| `mui-bind` + `mui-bind-property="checked"` | `data-model-checked="..."` |
| `mui-text="profile.name"` | `data-bind-text="profile.name"` |
| `mui-disabled="form.busy"` | `data-bind-disabled="form.busy"` |
| `mui-visible="panel.open"` | Prefer a real `data-bind-hidden` state |

Legacy aliases may reuse the new engine. Removing them requires an explicit compatibility
decision.

