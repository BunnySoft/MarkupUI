# Dynamic Input: bounded authored native rows

**🟢 Verified retained native collection scope.** An explicit helper clones an authored
HTML template, preserves existing rows and moves actual nodes. Native fields, labels,
names, values/defaults, validation and FormData remain authoritative. No preset/VNode
renderer, object-path model, drag engine, provider, string HTML rendering or dependency.
Legacy Input/Form/aggregate code is unchanged.

## Loading and native anatomy

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/dynamic-input` | ESM `createDynamicInput`, controller/options/row/context types |
| `dist/markup-ui-dynamic-input.js` | Independent optional ESM |
| `dist/markup-ui-dynamic-input.global.js` | Classic `MarkupUIDynamicInput.createDynamicInput`; refuses namespace replacement |
| `@dataengine/markup-ui/dynamic-input/style.css` | External `dist/markup-ui-dynamic-input.css` |
| [Demo](../../demo/components/dynamic-input.html) | Separate HTML/CSS/JS, native pair fields, bounds/actions/failure/reset and explicit Input/Form composition |
| [Reference](../naive-ui/components/dynamic-input.md) | All original owner/source/kind identities and explicit supplements |

## Default-style audit — 2026-09-11

The [isolated rendered audit](../style-audit/components/dynamic-input.md) aligns the
reference's **10px row spacing**, **20px action separation** and **34px** medium
fields/actions while preserving labelled native controls. Rows align actions with the
field bottoms, not label tops.

Dynamic Input styles only standalone native fields. Controls marked
`data-input-control` remain Input-owned; the demo now explicitly loads Input CSS instead
of relying on accidental Dynamic Input padding. Light/dark, hover, disabled, forced-
color and print behavior are component-scoped.

```html
<fieldset class="mui-dynamic-input" data-dynamic-input>
  <legend>Labels</legend>
  <div class="mui-dynamic-input__rows" data-dynamic-rows>
    <div class="mui-dynamic-input__row" data-dynamic-row data-dynamic-key="initial">
      <label>Label <input name="labels[]" value="Original" required></label>
      <button type="button" data-dynamic-action="remove" hidden>Remove label</button>
      <button type="button" data-dynamic-action="up" hidden>Move up</button>
      <button type="button" data-dynamic-action="down" hidden>Move down</button>
    </div>
  </div>
  <template data-dynamic-template>
    <div class="mui-dynamic-input__row" data-dynamic-row>
      <label>Label <input name="labels[]" required></label>
      <button type="button" data-dynamic-action="remove" hidden>Remove label</button>
      <button type="button" data-dynamic-action="up" hidden>Move up</button>
      <button type="button" data-dynamic-action="down" hidden>Move down</button>
    </div>
  </template>
  <button type="button" data-dynamic-add hidden>Add label</button>
</fieldset>
```

The connected light-DOM root owns exactly one separate row container, native template and
global add button. Every direct container child is a native `[data-dynamic-row]`, not
another root or an action. Initial keys are unique nonempty strings up to 128 characters.
Nested repeaters use their own **descendant** roots/containers/templates; their buttons
are not captured by the outer owner.

Templates have exactly one root row, no authored row key, and **no IDs anywhere in their
content**, including nested inert templates. Native controls/labels/affixes are authored;
there is no expression evaluation or inferred option/pair renderer. Use wrapping labels
when IDs are unnecessary. ID assignment is explicit, as described below.

All helper action buttons start **hidden**, have text or aria-label names, are `type=button`, and are outside
labels/links/other interaction. At most one each of `data-dynamic-action="add|remove|up|down"`
is allowed per row. Row add inserts after that row; the global add appends. Hidden actions
are revealed by enhancement, respecting subsequent application overrides. This keeps
no-JS rows editable without visible dead custom controls. Native submit/reset remain normal.

## Explicit bounded collection API

```js
const collection = MarkupUIDynamicInput.createDynamicInput(root, { min: 1, max: 8 })
const added = collection.add()             // Programmatic append, or null at max.
collection.move(added.key, 0)               // Absolute final index; same row/fields.
collection.remove(added.key)               // false at min; never resurrects data.
```

| Member/option | Contract |
| --- | --- |
| `min?`, `max?` | Initial integers, **0 <= min <= max <= 100**, max >= 1; defaults 0/20 |
| `rows` | Frozen last-validated owned metadata array of stable `{ key, element }` records; not field values |
| `min`, `max`, `connected`, `error` | Effective limits/lifetime and last reported error |
| `add(index = rows.length)` | Insert at a zero-based position; return row descriptor or null at max |
| `remove(key)` | Remove exact stable key; true when removed, false at min |
| `move(key, index)` | Move same node to absolute zero-based final position; false for same position |
| `setBounds(min, max)` | Validate both limits and current count before changing limits; no automatic rows |
| `refresh()` | Validate current ownership/anatomy, adopt reordering of the same owned row set, synchronize actions |
| `disconnect()` | Hide/restore owned actions, release observers/listeners/registered resources; **keep current edited rows** |
| `initialize?` | Synchronous detached-draft initialization for new rows only |
| `connect?` | Synchronous resource setup on attached initial/new rows |

An initial count outside the bounds fails; min does not create placeholder rows. New bounds
must contain the current count; they never allocate, trim or restore data. Unknown keys,
invalid indices, wrong options and unowned/removed rows are explicit errors.
The key allocator skips initial/current keys and does not reuse generated keys during an
owner's lifetime. Keys identify DOM rows, not indices or business database identities.
Existing keys survive disconnect/recreation; absent historical keys are not a persistent
global namespace or model store.
After invalid external edits, inspect `connected` and native DOM before continuing; retained
metadata is not an automatically adopted model of unowned or removed rows.

Programmatic transactions remain available while the native fieldset/buttons are disabled,
just as programmatic native value writes are explicit. **User actions** respect the actual
button's disabled/hidden/inert state, including native fieldset inheritance. Use native
fieldset disabling, not a fictional disabled property on a div. Ordinary readonly fields
remain native readonly; disable the collection's action buttons/fieldset separately if needed.

## Names, labels, IDs and native form semantics

The helper never rewrites input names into index paths. Dots, brackets, quotes and repeated
names are literal HTML names. Reordering actual nodes changes native FormData order;
current/default values, listeners and label/control references stay on those nodes.
Use actual `form` attributes for external associations. Disabled successful-control filtering,
checkbox/radio/select behavior and native constraints are not reimplemented.

An input-style row contains one authored native field; a pair-style row contains two.
The demo uses repeated `property.name[]` and `property.value[]` names. These are ordinary
controls, **not automatic Array<{key,value}> serialization**. Partial disabling can make
parallel FormData arrays differ in length; applications must choose their own serialization
using native row references/fields rather than assuming a schema. A pair's key field is
also distinct from the stable **row identity key**.

`initialize(row, context)` may assign unique IDs, corresponding label/list/ARIA/fragment
references, stable literal names and native reset defaults on its detached draft. It must
retain that draft root and generated data-dynamic-key. The helper validates each live row
ID for global document uniqueness and checks ID references resolve either within the
draft or to an existing external target. External references are **not remapped**.
Nested template contents remain ID-free. Original/external target uniqueness is an
application responsibility; no generic ID-remapping/interpolation engine is created.

```js
initialize(row, { key }) {
  const field = row.querySelector("input")
  field.id = `settings-${key}`              // Author-owned stable ID, validated before insertion.
  row.querySelector("label").htmlFor = field.id
  field.defaultValue = ""                  // Explicit reset default, not a second model.
}
```

New rows must not have autofocus or any **checked radio**, including a radio used as the
row root. This prevents an unsuccessful add from stealing focus or unchecking an unowned
native peer before rollback. Add unchecked radios, then explicitly choose native selection
after a committed add if needed. Names are not silently isolated per row. Existing checked
radios remain native; clicks/reset use their actual same-name/form group semantics.

## Lifecycle hooks and failure boundaries

Both hooks receive `(row, { key, index, onCleanup })`. Initialize runs detached on new
clones; connect runs after attachment and on adopted initial rows. Index is the insertion/
connection position **at that call**, not a live template expression after moves.
Hooks must return **undefined**, synchronously. They cannot return a preset object, vnode,
Promise, false veto or cleanup function as an overloaded result.

Register synchronous resource cleanup **while the hook runs**, immediately after acquiring
each resource:

```js
connect(row, { onCleanup }) {
  const input = MarkupUIInput.createInput(row.querySelector("[data-input]"))
  onCleanup(() => input.disconnect())
}
```

The controller owns only these registered resources. It never guesses child controllers,
globally registers Form items or disposes unrelated helpers. Moves do not reconnect resources.
Cleanup runs once, in reverse registration order, on removal, failed addition, initial setup
failure or disconnect; all callbacks are attempted. Parent hooks can explicitly connect
nested repeaters and register their disconnect methods the same way.

Define action anatomy in the template/initialize phase. Action identities are fixed once
leased: connect can adjust their native disabled/hidden availability, but must not replace
or remove the action nodes. Application attribute writes during lifecycle hooks, including
same-value writes, are tracked rather than overwritten by boundary synchronization.
Action leases belong to the row identity, not current containment, so cleanup that detaches
buttons still releases them completely. Cleanup should normally dispose resources, not delete
native field contents; destructive application cleanup remains the application's side effect.

Structural/lifecycle transactions reject reentrant collection calls—including synchronous
blur handlers triggered by fallback moves. Defer further mutations until a committed change
notification or later task. Direct native focus changes to another field are respected;
this is not a focus trap.

Failure semantics are explicit:

- Invalid configuration/anatomy/bounds fail before new row allocation or insertion.
- Failed initialize/connect removes the **owned draft**, restores its action leases and
  attempts registered cleanup. Initial connection failure releases previously registered
  resources. No successful add event is emitted.
- If a hook directly damages the existing collection, the owner withdraws rather than
  publishing stale metadata. It cannot undo arbitrary application network/global/DOM effects.
  Register cleanup and avoid unrelated side effects; rollback is not a database transaction.
- Removal is committed before disposing its row resources. Cleanup errors do not silently
  resurrect the row: all cleanup is attempted, a change event still reports the removal,
  then an AggregateError states that removal committed but cleanup failed.
- Disconnect keeps rows/edits and completes ownership release even if registered cleanup
  fails; failures are aggregated and thrown. Unsupported asynchronous hooks fail immediately;
  unexpected late rejection also reports explicitly, never as successful data.

Nonbubbling `mui:dynamic-input-change` on the root reports committed **structure**:
`{ type: "add"|"remove"|"move", row, index, previousIndex, rows }`.
Row descriptors/arrays are frozen; original elements remain live. Field editing is still
native input/change, not an extra aggregate value event. Listen on this explicit root.

`mui:dynamic-input-error` reports `{ error, operation, committed }`; event-driven actions
consume already-reported failures, while direct methods throw. A committed cleanup failure
is not presented as a rollback. Applications handling native change/focus events remain
responsible for their own handler exceptions and side effects.

## Reorder and focus policy

Actual row nodes move using native `Element.moveBefore` when available, preserving native
connected state. The fallback uses insertBefore on the same nodes, not clones, and restores
the previously focused input/textarea and its selection only when focus was lost to the
document body and the field value is unchanged. It does not steal focus from another row,
an outside field or a modal.

Fallback DOM detach/insert cannot promise iframe browsing-context, animation/custom-element
lifecycle or active IME preservation. Finish composition before application-driven fallback
moves; use state-preserving native moveBefore where such native state is essential.
No production jsdom workaround or synthetic keyboard/deletion engine is installed.

User add focuses a usable field in the new row when focus still belongs to its action;
programmatic add does not request new-row focus. If a previously focused helper action
becomes disabled/hidden at a bound, it recovers into its own/adjacent row or the add button.
This necessary unusable-action recovery also applies to explicit programmatic updates.
Removing a focused row chooses next row, then previous row, then add. Removing/moving
another row does not disturb the active field elsewhere. Disabled boundary move/remove
buttons are not left as the only focus target. There is no automatic roving tabstop,
row tabindex, announcement per keystroke or reordering of RTL DOM.

## Reset, Form integration and teardown

**Native form.reset resets fields in the current rows**, to each field's native defaults.
It does not restore an initial collection array, recreate deleted rows, discard added rows,
or invoke lifecycle hooks. Cancelled reset preserves native values as usual.
Current edited rows and generated stable key metadata remain after disconnect. Owned custom
actions return to their authored hidden/disabled state unless the application changed that
state. No deleted data is silently resurrected.

The demo explicitly composes existing [Input](input.md) resources through connect/onCleanup
and a native-only [Form](form.md) coordinator:

```js
const validation = MarkupUIForm.createForm(form, { items: [] })
root.addEventListener("mui:dynamic-input-change", () => validation.refresh())
```

Unmapped native fields participate in whole-form validity. If using custom fixed Form item
bindings, explicitly disconnect/recreate those mappings after structure changes, using
current stable row keys/controls and unique feedback IDs. There is no hidden provider
registration or model-path mutation. Silent programmatic value transactions require the
existing Input/Form refresh conventions; the collection does not rewrite those setters.

No submit listener, fetch, requestSubmit/form.submit loop or noValidate override is installed.
The demo's application listener only displays local non-sensitive FormData; native no-JS
GET/reset remains usable. Custom collection actions are unavailable without enhancement,
and remain hidden rather than pretending to work.

## External CSS and retained property summary

`.mui-dynamic-input`, `__rows`, `__row`, `__fields`, `__actions` provide wrapping native layout.
Fields use two minmax tracks for pairs, `data-single` for one track, and stack below 30rem.
Author classes, field types, placeholder text, label content and decorative button icons
directly; no inline style-object forwarding, measurement/provider graph or drag renderer.
Direction follows the surrounding document; source order is never reversed in RTL.

| Source surface | Retained adaptation / explicit omission |
| --- | --- |
| create-button-props, create-button-default/icon | Authored labelled type=button/attributes/text/decorative icon |
| default-value | Authored initial row set plus real native field defaults; no VM-row reset |
| disabled | Native fieldsets/buttons/fields; explicit programmatic transactions remain available |
| item-class/item-style | Original row classes and external CSS |
| key-field | Explicit immutable data-dynamic-key, not object-path lookup |
| min/max | Validated bounded counts, default 0/20 and hard maximum 100 |
| preset, generic controlled value | **Omitted** renderer/unknown[] model; authored input/pair templates and native fields instead |
| show-sort-button/action slot | Optional authored native up/down/add/remove buttons |
| on-create | Synchronous initialize/connect plus explicit cleanup, no return-value model overload |
| on-remove/on-update:value | Committed structural event and original native input/change, not duplicate array state |
| Input preset value/placeholder | Original native string input/value/default/placeholder |
| Pair preset value/key-placeholder/value-placeholder; value.key/value.value | Two actual native fields, not schema/object mutation |
| default slot | Authored HTMLTemplateElement row anatomy |
| action/default index and action create/remove/move | Current native order/metadata and explicit helper operations; insertion/absolute move semantics documented above |
| action.value/default.value | **Omitted** injected model values; read actual row controls explicitly |
| callback/slot/prop-array types, theme/injection and private preset paths | **Omitted**, individually identified in the reference supplements |

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/demos/enUS/index.demo-entry.md),
[DynamicInput.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/DynamicInput.tsx),
[InputPreset](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/InputPreset.tsx),
[PairPreset](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/PairPreset.tsx),
[interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/src/interface.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-input/index.ts).
The source uses controlled arrays, preset/VNode rendering, object/index key derivation and
injected paths/themes. Those are not ported; native adaptations are not source signature parity.

## Original four-step acceptance

1. [x] Native template/row/action anatomy and stable identity contract implemented.
2. [x] Bounded insertion/removal/reorder and lifecycle failure cleanup verified.
3. [x] Native names/values/defaults/FormData and explicit Form/resource integration retained.
4. [x] Targeted tests/build/review and Chromium focus/editing/fallback acceptance recorded.

### Original evidence and limitations

- At original delivery, **156 tests passed**: Dynamic Input **51**, Input 52, Form 53.
  `pnpm exec vitest run tests\dynamic-input.test.ts tests\input.test.ts tests\form.test.ts --reporter=dot`
  and `pnpm build` passed. No prior native/helper source or dependencies changed.
- Review found fallback-move blur reentrancy, root-level checked-radio validation,
  overwritten connect-hook action states and detached-action lease retention defects.
  All fixed with tests; action-node replacement is additionally rejected rather than
  leaving stale leases. All registered cleanup is attempted and commit/error state is explicit.
- Dedicated Chromium **4188** demo verified user/new-row focus versus programmatic outside
  focus; native required validation for added fields; original labels/current/default values;
  both native moveBefore and forced fallback caret preservation (selection 2–6); disabled
  move-boundary and remove-to-adjacent focus; Input resource counts and failed-add rollback.
- FormData reflected actual reordered name/value fields and submitter `intent=inspect`.
  Reset retained current added rows and did not resurrect removed initial data. Fieldset
  disabling excluded current fields from successful FormData.
  Cancelled reset preserved edits; disconnect left two current edited rows, hid custom
  actions and reduced explicitly owned Input resources to zero.
- Browser review probes confirmed fallback blur mutation was rejected without stale rows,
  checked radio row roots did not uncheck an outside peer, hook disabled/hidden states
  survived synchronization and detached action leases stopped receiving writes.
- LTR/RTL **1280px/375px**, **200% CSS zoom**, dark/forced-colors/reduced-motion emulation
  had visible fields and no page overflow; pair tracks stacked on the narrow viewport.
- A separate JS-disabled context verified one editable authored row, hidden custom actions,
  required submit blocking, native reset and local GET FormData/submitter. Context closed.
  ESM/classic/Input/Form and legacy registration coexisted. No Safari/Firefox, iframe/
  animation/active-IME fallback-state or universal AT certification is claimed.
- Final dedicated-demo checks showed no console errors/warnings or nonstatic requests.
  The demo was reloaded to its original authored state; other tabs were not changed.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Dynamic Input ESM | 15,282 | 5,567 | 6,500 |
| Dynamic Input classic | 15,463 | 5,634 | 6,500 |
| External CSS | 1,159 | 414 | 1,000 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **152 prior top-level JS/CSS assets** were independently built in memory with the
pre-component HEAD recipe and byte-compared against current outputs; all match. No earlier
optional budget was relaxed. Reference audit: **32 original section/source/kind identities
exactly preserved + ten supplements = 42 rows (28 adapted, 14 omitted)**. Catalog:
**3,603 rows, 260/384 tasks across 65 accepted pages**, 124 unchecked. P4 has **917 rows**,
five Planned routes and 305 unresolved rows. **402 scoped relative file links** and diff whitespace were checked at sign-off.
**Next: Dynamic Tags**, then Mention/Color Picker/Date Picker/Time Picker as dependency-ready
work; no full P4/P0/P5/P6 or source renderer/model parity is claimed.
