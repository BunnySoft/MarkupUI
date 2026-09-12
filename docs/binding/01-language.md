# 1. Binding language

**Design, not a delivered API.** Directive values are paths, not JavaScript expressions.
The binder operates only under an explicitly supplied root.

## Channels

| Web syntax | Direction | Meaning |
| --- | --- | --- |
| `data-bind-<property>="path"` | State to element | Assign a declared logical property. |
| `data-bind-attr-<attribute>="path"` | State to Web attribute | Explicit Web-only attribute channel. |
| `data-bind-text="path"` | State to text | Write literal text, never HTML. |
| `data-model-<property>="path"` | State and element | Two-way property binding with a declared update contract. |
| `data-if="path"` | State to structure | Create/remove one conditional template instance. |
| `data-each="path"` with `data-each-key` | Collection to structure | Maintain keyed template instances. |

Kebab-case property suffixes map to logical camel-case names: `data-bind-fallback-src`
targets `fallbackSrc`. Avatar's accessible name is `label`, so its binding is
`data-bind-label`, not a native image attribute.

## Values and validation

| Destination | Rule |
| --- | --- |
| Element property | Use its public getter/setter and contract; validation belongs to the element, not a mandatory runtime metadata engine. |
| Collection/object property | Pass the actual value when the element contract supports it; do not serialize it into an attribute. |
| Web attribute | Null/undefined removes it; supported primitive values use the declared encoding. Reject object/collection values. |
| Boolean presence attribute | Presence/removal, not the strings `"true"` and `"false"`. |
| Text | Literal text; no `innerHTML`, interpolation or executable content. |

Portable values are data, not executable callbacks or DOM objects. Any platform-only
value channel needs an explicit adapter contract.
Unknown targets, unsafe paths, conflicting ownership and unsupported values must report
errors rather than silently select another binding mode.

## Two-way updates

A writable property alone is insufficient. A model binding also needs a declared user
event, an event-to-value extraction rule and a writable route back to the owning store.
Programmatic assignment must not recursively fabricate that user event.

Native input/change events belong to an explicit Web adapter. MarkupUI elements expose
their logical model-update contract; the binder does not guess it from tag names.
Attribute and text channels are not two-way model destinations.

## Activation and limits

One root has one binding owner. Initial values, subscriptions and cleanup are installed
explicitly; no automatic `data-*` activation occurs across the document.
The reserved text channel and any escape for a property literally named `text` must be
settled before implementation. Keep direction explicit instead of introducing shorthand
that changes meaning by element type.

## References

- [Earlier grammar and rejected syntax](../archive/binding/02-binding-language.md)
- [Cross-framework comparisons](../archive/binding/06-alternatives-and-plan.md)
