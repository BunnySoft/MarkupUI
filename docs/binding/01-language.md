# 1. Binding language

**Scalar and explicit model binding implemented; templates remain design work.**
Directive values are safe data paths, not JavaScript expressions. Import `bind` and
`createStore` from `@dataengine/markup-ui/state`. The binder operates only under an
explicitly supplied root; separate nonoverlapping roots have independent stores.

## Channels

| Web syntax | Direction | Meaning |
| --- | --- | --- |
| `data-bind-<property>="path"` | State to element | Assign a declared logical property. |
| `data-bind-attr-<attribute>="path"` | State to Web attribute | Explicit Web-only attribute channel. |
| `data-bind-text="path"` | State to text | Write literal text, never HTML. |
| `data-bind-prop-text="path"` | State to element | Explicit escape for a component property named `text`. |
| `data-model-<property>="path"` | State and element | Two-way property binding with a declared update contract. |
| `data-if="path"` | Planned | Create/remove one conditional template instance. |
| `data-each="path"` with `data-each-key` | Planned | Maintain keyed template instances. |

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

The first Web adapter declares the event list using `data-model-event="input change"`
and the owner using `data-model-target="native"` or `"host"` (default). Events must
originate at that exact owner, not an unrelated descendant. The adapter reads the
current bound property, never arbitrary event detail. Each declared model property
uses this event contract; use separate elements for different owner/event contracts.

```html
<m-input data-model-value="customer.name"
  data-model-event="input change" data-model-target="native"></m-input>
<m-radio-group data-model-value="customer.plan"
  data-model-event="m:radio-group-change"></m-radio-group>
<m-chart-dataset data-bind-source="report.sales"></m-chart-dataset>
```

The Chart line is implemented by the optional Chart family and explicit scalar binder.
One-way object assignments preserve the actual array/record reference. Values must be
plain data without functions, accessors, DOM objects, cycles or prototype keys.
Equal scalar or shallow-array writes are skipped to preserve active native drafts.
Reassign collections or call the component's explicit refresh after in-place changes.

## Activation and limits

One root has one binding owner; overlapping roots and duplicate destinations fail.
`const stop = bind(root, store)` installs initial values, subscriptions and listeners.
`stop.refresh()` discovers added/removed nodes and changed directives. `stop()` releases
ownership without reverting DOM or state. Failed initial setup cleans up subscriptions.
The optional `m-app` explicitly owns its subtree and refreshes on child changes; reconnect
uses the retained store. Pre-upgrade `store` assignment survives registration. A store
acquired or supplied through the property cannot be combined with inline JSON state;
disconnect before replacing an active store. Bindings and actions share that same store
owner. No automatic activation occurs across the document.

Text binding cannot own a bound subtree or an executable text container. The attribute
channel accepts naming/ARIA/data attributes and the documented Boolean presence
attributes, not URL, style or event-handler sinks. Native property binding is limited to
ordinary field state and naming properties; component setters own their value validation.
Old development binding names are removed, without aliases or a compatibility parser.

## References

- [Earlier grammar and rejected syntax](../archive/binding/02-binding-language.md)
- [Cross-framework comparisons](../archive/binding/06-alternatives-and-plan.md)
