# Dynamic Tags: committed native fields and one draft

**🟢 Verified retained string-tag scope.** This helper **reuses Dynamic Input's bounded
row/template/action/focus/lifetime implementation**. It adds draft policy and explicit
commit coordination, not another collection renderer. No Tag/Input runtime, checkable Tag,
VNode, provider, hidden reactive array, clipboard parser, gesture engine or dependency.

## Canonical value ownership

Each committed tag is a **visible readonly named text input**, with a separate sibling
remove button inside a noninteractive row/list item. Its native `value` is the sole
canonical string; `defaultValue` owns reset. There is no separate label/value model or
hidden proxy field. This is deliberately a native readonly-field adaptation, not a fake
button/Tag role or text chip backed by invisible inputs.

The draft is one **unnamed** native text input. It is not a successful form value until
explicitly committed into a tag. Native FormData includes one value per successful named
tag field in actual DOM order, including duplicate strings. Disabled fields are excluded
natively. `values` includes all logical tags, even disabled ones; it is not FormData's
successful-control filtering.

```html
<fieldset class="mui-dynamic-tags" data-dynamic-tags data-dynamic-input>
  <legend>Topics</legend>
  <ul class="mui-dynamic-tags__list" data-dynamic-rows>
    <li class="mui-dynamic-tags__tag" data-dynamic-row data-dynamic-key="initial">
      <input class="mui-dynamic-tags__value" data-tags-value type="text"
             readonly name="tags[]" value="native" aria-label="Committed tag">
      <button type="button" data-dynamic-action="remove" hidden>Remove tag</button>
    </li>
  </ul>
  <template data-dynamic-template>
    <li class="mui-dynamic-tags__tag" data-dynamic-row>
      <input class="mui-dynamic-tags__value" data-tags-value type="text"
             readonly name="tags[]" aria-label="Committed tag">
      <button type="button" data-dynamic-action="remove" hidden>Remove tag</button>
    </li>
  </template>
  <div class="mui-dynamic-tags__entry" data-tags-entry hidden>
    <label>New tag <input data-tags-editor type="text" maxlength="64"></label>
    <button type="button" data-dynamic-add hidden>Add tag</button>
  </div>
  <p class="mui-dynamic-tags__status" data-tags-status>Authored tags.</p>
</fieldset>
```

Without JS, original tags remain visible, selectable/copyable and form-submittable.
Draft entry and dynamic actions stay hidden rather than appearing to work. Enhancement
reveals the persistent editor; it does not alternate a trigger with a generated input.
Native wrapping labels or authored for/id/ARIA associations remain intact.

## Loading and concrete reuse

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/dynamic-tags` | ESM `createDynamicTags` and five public tag/controller/options/result/rejection types |
| `dist/markup-ui-dynamic-tags.js` | Independent ESM **including the existing Dynamic Input implementation** |
| `dist/markup-ui-dynamic-tags.global.js` | Classic `MarkupUIDynamicTags.createDynamicTags`; refuses namespace replacement |
| `@dataengine/markup-ui/dynamic-tags/style.css` | Complete external `dist/markup-ui-dynamic-tags.css` for the authored tags anatomy |
| [Demo](../../demo/components/dynamic-tags.html) | Separate HTML/CSS/JS, local data, optional Form validation and no Input/Tag runtime |
| [Reference](../naive-ui/components/dynamic-tags.md) | Original identities plus explicit source supplements |

No separate Dynamic Input stylesheet is needed: its helper acts on data markers and native
button attributes, while the Tags stylesheet styles the actual list/fields/editor.
No Tag stylesheet, icon renderer or Input editing engine is imported. Loading the optional
Dynamic Input entry separately is possible, but do not bind the same root a second time:
its existing cross-module ownership symbols reject competing row owners.

## API and string policy

```js
const tags = MarkupUIDynamicTags.createDynamicTags(root, {
  max: 8,
  duplicates: "allow"
})
```

| Option/member | Contract |
| --- | --- |
| `max?` | Integer **1–100**, default 20; inherited finite row bound |
| `duplicates?` | `"allow"` default, or `"reject"` using exact case-sensitive string equality |
| `create?` | Optional synchronous `(draft: string) => string` derivation; default identity |
| `connect?` | Existing Dynamic Input attached-row resource hook/context, with onCleanup registration |
| `editor` | Original native draft input |
| `tags` | Frozen descriptors `{ key, element, control }`; stable original row/control references |
| `values` | Fresh frozen strings read from native tag controls; no stored array model or array setter |
| `max`, `connected`, `error` | Effective cap/lifetime and last reported unexpected failure |
| `commit()` | Explicit **eventful command** for the current draft; returns added or rejected result |
| `remove(key)` | Explicit **eventful command** removing one stable key, never removal by value |
| `setMax(max)` | Silent bound change; fails if it would trim current tags |
| `refresh()` | Silent validation/invalidation after native programmatic writes; never creates tags |
| `disconnect()` | Stop enhancement/resources, keep current tags and draft/default values |

The editor must have a fixed authored maxlength of **1–2048 UTF-16 code units**. Existing
and derived tag values must be nonblank, single-line strings within that length. Blank-only
text is **rejected**, not silently trimmed. Other leading/trailing spaces, case, Unicode
and commas are preserved exactly. Paste is native input: commas are not delimiters and
no clipboard contents are read by the library. Browser single-line sanitization and
maxlength behavior remain native; this is not a grapheme editor.

Objects, numeric values, null, arrays, multiline or oversized derived results are not
implicitly converted. The source's `{label,value}` option branch is intentionally omitted;
there is no separate displayed label backed by a concealed value. Values resembling HTML
are assigned to native input value/defaultValue properties, never innerHTML.

Duplicate strings have different inherited stable row keys. Removing one duplicate retains
the others and their original nodes/listeners. In reject mode, comparison happens against
the **derived** result. `"tag"` and `" tag "` remain distinct. Source-style silently
deduplicated arrays, normalization and object-value lookup are not provided.

`commit()` returns:

- `{ status: "added", tag }` after an actual row commit.
- `{ status: "rejected", reason }`, with reason `empty`, `duplicate`, `max`, `invalid`,
  `composing`, `unavailable` or `stale`.

Expected rejection never clears the draft or inserts partial data. Unexpected creator/
resource errors throw and emit an explicit error event. Initial invalid values/policy
violations fail before enhancement; invalid later native changes can withdraw ownership
without normalizing or deleting the application's fields. After such failure/disconnection,
descriptors are retained metadata, not automatic adoption of unowned DOM.

## Native editing and deliberate intent

**Plain nonrepeating Enter** and the authored Add button request one commit. Enter is
reserved only on this editor so it cannot accidentally submit the enclosing form.
Modified/repeated Enter is also prevented but does not create a tag. Other form fields'
Enter behavior remains native. There is no global keyboard/selection layer.

Tags owns the Add button's click intent: it prevents the event's default and uses Dynamic
Input's command API, so the base's delegated add handler does not create a second blank
row. Applications can intercept earlier/capture listeners; once Tags consumes the event,
later default prevention is not a separate veto contract. Native button type remains button.
Queued intent snapshots coalesce rapid requests and guard draft/revision/form changes.

Composition start, composing key events and the composition-end turn suppress commit.
Finishing IME **does not itself add a tag**; a subsequent deliberate Enter/Add is required.
CDP evidence below is not a claim about every OS IME.

- **Blur does nothing to the list or draft.** The source's blur-auto-commit is omitted.
- **Escape** cancels queued creation/owned feedback but preserves the draft and focus.
  It does not remove a tag or collapse the editor.
- **Backspace/Delete** remain native text edits. Empty-editor Backspace never removes a tag.
- Successful commit clears only the still-current draft, silently, leaving its reset
  default unchanged. A reset or newer callback/application edit invalidates that clearing.
- Creation from the Add button returns focus to the editor without stealing an application
  focus change elsewhere. Editor focus remains usable at max; the editor is not hidden or
  disabled merely because capacity is full. Rejected drafts remain available to edit/copy.
- Removal reuses the collection's adjacent-tag-field/add-button recovery and does not move
  focus from another row/outside field. Readonly value fields remain real native focusable
  controls, not selectable/checkable Tag widgets.

Native input/change/paste/selection remain on the original editor. Clearing after a commit
does not fabricate typing events. If an application separately adds Input decoration, refresh
it on the Tags change event; this module does not import unused Input behavior automatically.

## Events, callbacks and resource failures

Nonbubbling events are dispatched on the explicit Tags root:

| Event | Detail / meaning |
| --- | --- |
| `mui:dynamic-tags-change` | `{ type: "add"|"remove", tag, tags, values }`, after committed tag state and conditional draft clear |
| `mui:dynamic-tags-reject` | `{ reason, message }`, expected nonmutating rejection with a preserved draft |
| `mui:dynamic-tags-error` | `{ error, committed }`, unexpected creation/resource error, not successful fallback |

Arrays/descriptors are frozen snapshots/references, not a reactive store. Native property
writes plus refresh/reset do not emit change. Commit/remove are commands, **not silent value
setters**. The reused `mui:dynamic-input-*` structural events remain visible as lower-level
events; subscribe to Tags events for its finished editor/value contract, not both as two
business updates. Raw collection insertion or per-row add/up/down controls are not exposed
through Tags. Its template allows only optional remove actions.

`create` runs within the inherited creation transaction. It may explicitly transform a
string, but must not submit, mutate the draft/collection, return a Promise/object or perform
irreversible business side effects. Draft value/revision/form/eligibility/native validity
are rechecked across callbacks. A callback changing the draft cannot have that newer text
overwritten by the old commit.

The optional `connect(row, context)` reuses [Dynamic Input's onCleanup contract](dynamic-input.md).
Register cleanup while the synchronous hook runs. Original value controls and committed
value/default must remain intact; IDs/names/labels must preserve the inherited validated
anatomy. No automatic child-helper discovery or hidden Form provider registration occurs.
Native template contents remain ID-free; use wrapping labels/aria-label and stable external
references. Initial IDs are retained, and callback-authored IDs/references must remain valid.

Failed creation rolls back the inherited owned draft and attempts registered resource cleanup.
Removal cleanup errors remain **committed removal**, with change followed by explicit error.
All callbacks are attempted; arbitrary application side effects cannot be fully undone.
Unsupported asynchronous callback rejection is surfaced rather than silently treated as valid.

Reentrant structural/lifecycle operations are rejected. If the base refuses a teardown
during a removal callback, the wrapper remains intact and can disconnect later—it does not
abandon a live, unreachable row owner. Normal recursive teardown while already closing is
idempotent. If cleanup fails after the base has closed, wrapper cleanup still completes and
the failure propagates.

## Form, defaults, ARIA and teardown

Native readonly tag inputs are barred from constraint validation; making every readonly
tag required cannot enforce a nonempty list. The editor's native constraints/custom validity
are honored for creation and never cleared/overridden by Tags. A required editor becomes
empty after a successful commit and can still block form submission; do not use that attribute
as a substitute for list membership validation.

The [demo](../../demo/components/dynamic-tags.html) explicitly uses [Form](form.md) with the
eligible unnamed editor as a custom-validation anchor:

```js
root.addEventListener("mui:dynamic-tags-change", () => validation.refresh())
// Form configuration may check tags.values.length in a small manual validator.
```

There is no owned setCustomValidity message, aria-invalid, aria-describedby token or hidden
successful control. Existing Form/help/error associations survive either teardown order.
An optional plain status node reports outcomes without live regions; effective live ancestry
is rejected rather than making per-edit announcements. Messages use textContent. Authors must
not conceal the canonical readonly controls with custom CSS and call them hidden proxies.

Native form.reset affects the **current** tag fields and draft defaults. It does not remove
created tags or resurrect deleted ones. Successful reset invalidates older pending intent;
cancelled reset preserves a still-current queued intent and draft. A reset dispatched by a
lower-level collection change listener is settled before deciding whether to clear the draft,
even if its restored value equals the pre-commit text. Externally invalid reset defaults
report failure and withdraw enhancement, leaving native fields unchanged.

Disconnect keeps current tags/controls/draft/defaults, restores owned entry/action visibility
and releases only registered resources. External status/attribute replacements are preserved
conditionally. No initial array is secretly re-rendered. Nested roots keep independent
editors, keys, actions and event ownership.

The library does not submit or fetch. Real applications decide whether uncommitted drafts
should block submission; only committed named fields enter FormData. The demo prevents
submission solely for local inspection, awaits explicit Form validation and removes its
application listener on disconnect. Without JS, authored readonly tags still submit natively,
while hidden editor/actions make no claim of dynamic editing.

## External presentation and complete mapping summary

The Tags stylesheet independently styles `__list`, `__tag`, `__value`, `__entry` and
`__status`. Readonly values have a visible native text field width and can be selected/
scrolled normally; they are not duplicated into a rendered label. `data-round`, small/
medium/large sizing and default/primary/info/success/warning/error `data-type` are
presentation only. `--mui-tags-background`, `--mui-tags-border`, `--mui-tags-text` are
external CSS colors; no color/style object or checkable/selected state is installed.

| Source surface | Retained native adaptation / explicit omission |
| --- | --- |
| closable | Optional sibling native remove button; command removal remains explicit |
| color and color/borderColor/textColor inline members | External CSS variables, no JS style object |
| default-value/value | Current readonly named string fields and native defaults; no controlled array setter |
| disabled | Native fieldset/controls; editor readonly gates creation but is not whole-list immutability |
| input-props/input-class/input-style | Original native editor attributes/classes/external CSS, not InputProps forwarding |
| max | Inherited default 20, hard maximum 100 with draft-preserving rejection |
| round/size/type/tag-class/tag-style | Native field/chip styling and source vocabulary, not Tag runtime behavior |
| render-tag and its label/value inline context | **Omitted** VNode rendering; authored native template instead |
| on-create | Strict synchronous scalar string derivation; object label/value branch omitted |
| on-update:value | Explicit committed string-array snapshot event, not model/provider updates |
| input slot / input.submit | Authored persistent editor and commit-current-draft command, not any-value slot injection |
| input.deactivate | **Omitted** source blur/deactivate auto-commit/hide; Escape preserves drafts |
| trigger / trigger.activate / trigger.disabled | Authored Add/label/native focus and button bounds; no conditional renderer activation graph |
| DynamicTagsOption label/value; on-create label/value inline fields | **Omitted** object option mode and separate display/serialized values |
| Source callback/prop/slot/object-array aliases and theme mixins | Explicitly dispositioned supplements, no framework ABI compatibility |

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md),
[DynamicTags.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/DynamicTags.tsx),
[interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/interface.ts),
[public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/index.ts),
[shared common props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/common-props.ts).
Source implementation accepts mixed string/object arrays although public value/default-value
rows describe strings; it renders NTag/NInput/NSpace, indexes removal, and commits on blur.
Those wider behaviors are not inherited accidentally.

## Four-step acceptance

1. [x] Native committed fields, list, editor and action composition defined.
2. [x] Explicit string/duplicate/limit/IME/paste/commit policy verified.
3. [x] Stable-key removal, native defaults, focus and reversible lifetimes retained.
4. [x] Custom authored surfaces, callback errors, targeted tests/build/browser and reference reconciliation completed.

### Evidence and limitations

- **212 targeted tests passed:** Dynamic Tags **56**, Dynamic Input 51, Input 52, Form 53.
  `pnpm exec vitest run tests\dynamic-tags.test.ts tests\dynamic-input.test.ts tests\input.test.ts tests\form.test.ts --reporter=dot`
  and `pnpm build` passed. No prior helper/core/plugin source or dependency changed.
- Review found stranded base ownership after reentrant cleanup and draft clearing over an
  intervening native reset. Both fixed, with direct/delegated removal, later reinitialization
  and equal-value reset regression tests plus isolated Chromium probes.
- Dedicated Chromium **4188** demo verified whole-string spaces/case/comma preservation,
  Enter without form submit, exact duplicate-key removal, original readonly field identity,
  draft/focus preservation at max, Escape/blur safety, callback failure rollback,
  native readonly/fieldset behavior and required title validation before submit.
- Native FormData contained exactly committed `tags[]` values plus title/submitter, not
  the unsaved draft. Reset retained the current created list/defaults. Explicit Form
  integration did not claim readonly fields could block a group minimum natively.
- CDP IME kept two original tags during and after composition, then added “東京” only on
  subsequent deliberate Enter. This is browser CDP evidence, not every OS IME/clipboard.
- LTR/RTL **1280px/375px**, **200% CSS zoom**, dark/forced-colors/reduced-motion emulation
  retained visible readonly value fields without page overflow.
- A separate JS-disabled context verified visible readonly named values, hidden dynamic
  editor/actions, native required/reset and successful committed-tag GET submission without
  a draft field. Context closed. ESM/classic/Form/legacy coexistence verified; no native
  popup, checkable Tag, mobile autofill, Safari/Firefox or universal AT claim.
- Additional Chromium probes verified exact-duplicate rejection, silent-refresh caret
  preservation, external native validity, nested editor/action isolation and teardown
  retaining tags/draft/help references while hiding dynamic entry/actions. Final console
  checks had no errors/warnings or nonstatic requests; the demo was reloaded afterward.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Tags ESM, including Dynamic Input | 27,050 | 8,985 | 10,000 |
| Tags classic, including Dynamic Input | 27,228 | 9,052 | 10,000 |
| Complete Tags CSS | 2,199 | 685 | 1,500 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **155 prior top-level JS/CSS assets** were built in memory with the pre-Tags HEAD
recipe and byte-compared with current outputs; all match. No prior optional ceiling was
relaxed. Reference audit: **32 original section/source/kind identities exactly preserved
in order + ten source supplements = 42 rows (25 adapted, 17 omitted)**. Catalog:
**3,613 rows, 264/384 tasks across 66 accepted pages**, 120 unchecked. P4 has **927 rows**,
four Planned routes and 273 unresolved rows. **408 scoped relative file links** and diff whitespace were checked.
**Next: Mention**; Color Picker, Date Picker and Time Picker remain later P4 routes,
without implying full P4/P0/P5/P6 or source framework parity.
