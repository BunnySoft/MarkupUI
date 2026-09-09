# Cascader: native dependent selects and precise path state

**🟢 Verified retained single-path scope.** Real labelled selects, a separate passive
authored hierarchy, explicit defaults and guarded native-node loading. No popup, checkbox
tree, multi-tag input, VNode/data renderer, provider, portal, geometry engine or dependency.
Native controls own keyboard, focus, validation and successful-control behavior.

## Loading and anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/cascader` | ESM createCascader and controller/options/state types |
| `dist/markup-ui-cascader.js` | Standalone ESM |
| `dist/markup-ui-cascader.global.js` | Classic MarkupUICascader; rejects namespace replacement |
| `@dataengine/markup-ui/cascader/style.css` | External dist/markup-ui-cascader.css |
| [Demo](../../demo/components/cascader.html) | Separate local HTML/CSS/JS, leaf/any policies and reset/loading cases |
| [Reference inventory](../naive-ui/components/cascader.md) | Every original identity and explicit source supplements |

The optional helper registers **no custom element**. Legacy widgets-plugin MuiCascader
keeps its original path-array/automatic-first-child contract. Neither Tree nor Select is
automatically initialized on the source or projected fields.

```html
<form>
  <fieldset class="mui-cascader" data-cascader>
    <legend>Destination</legend>
    <section class="mui-tree" data-tree data-cascader-source aria-label="Available places">
      <ul data-tree-list>
        <li data-tree-key="eu">
          <div data-tree-row><span data-tree-label>Europe</span></div>
          <details data-tree-branch>
            <summary>Europe choices</summary>
            <ul data-tree-list>
              <li data-tree-key="paris">
                <div data-tree-row><span data-tree-label>Paris</span></div>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </section>
    <div data-cascader-columns>
      <label data-cascader-column>Region
        <select data-cascader-control name="place[]" required>
          <option value="" selected>Choose region</option>
        </select>
      </label>
      <label data-cascader-column>City
        <select data-cascader-control name="place[]">
          <option value="" selected>Choose city</option>
        </select>
      </label>
    </div>
    <p data-cascader-path></p>
    <p data-cascader-status></p>
    <button type="button" data-cascader-clear hidden>Clear destination</button>
  </fieldset>
</form>
```

```js
import { createCascader } from "@dataengine/markup-ui/cascader"
const cascader = createCascader(document.querySelector("[data-cascader]"), {
  defaultValue: "paris",
  selection: "leaf",
})
cascader.setValue("paris") // One terminal key, not ["eu", "paris"].
cascader.setPath(["eu"])  // Explicit incomplete prefix, no automatic first child.
```

Use a connected light-DOM div/section/fieldset root. Author **one to eight** column
wrappers, each with one native labelled single dropdown select and a first enabled
empty-value option. Direct plain-text options are supported; optgroups, multiple/listbox
mode, fabricated roles, readonly selects and rich option markup are not this profile.
All fields must keep the same native form owner for the binding lifetime, including
explicit external `form` association. Column/control identities and order are fixed;
disconnect/rebind to change them.

Existing data options must have explicit unique values at their correct hierarchy level.
The helper reuses original options by key and caches projected option nodes, preserving
selects, labels, names, ID associations and option listeners. It replaces a select's child
collection only when its applicable sibling family/order changes. Source labels/disabled
state/default projections are owned during the binding; no schema/render callback is used.
Do not insert unowned options or edit projected option values; change the source and refresh.

### Dedicated source ownership and no-JS

The source uses the existing **readTreeHierarchy/TreeNode** implementation unchanged.
It is an iterative index of actual nodes, not a duplicate VNode tree. Each key is a
globally unique nonempty **string** (<=256 chars), each label a named passive span
(<=1,024 chars), and children are native lists inside details. Numeric keys are not
coerced. A branch stays a branch even when its list becomes empty; strict leaf mode
does not silently promote it to a selected terminal.

Use a dedicated **unbound passive source**. Source inputs, selects, textareas, buttons,
active/custom content and nested Tree owners are rejected. Another Tree's owned nodes
cannot be stolen. Cascader never hides a named live Tree and accidentally submits its
checkboxes. The source itself is never hidden/reparented by the helper; applications may
put the passive outline in a native details disclosure.

The demo starts the dependent fieldsets **disabled**, then explicitly enables them before
binding. Without JS, readable native outlines/disclosures remain, while static selects
cannot submit an inconsistent dependency path. There is no claim that bare HTML
automatically recomputes dependent options. On demo teardown, it disables the restored
fallback fieldsets again. General applications must choose their own post-disconnect
fallback/gating policy.

## Values, prefixes, leaves and disabled choices

`state` is a frozen observation:

| Field | Meaning |
| --- | --- |
| `path` | Selected contiguous prefix of native string keys |
| `value` | One complete terminal key, or null; never an array or an incomplete prefix |
| `complete` | Selected endpoint is allowed by the declared policy, with no active fault/reset transition |
| `pending` | A selected lazy branch or a native reset transaction is settling |
| `valid` | Connected path/native-control validity; wholly native-disabled fields are exempt |
| `defaultPath` | Captured default key path, separate from currently displayed option families |
| `defaultValid` | The captured path still exists with the correct parent links and enabled choices |

`selection="leaf"` is the native default: a leaf has **no authored branch details**.
This is deliberately stricter than the source's default check-strategy=all.
`selection="any"` accepts a selected branch as the terminal value and may still offer
optional descendant choices. A pending optional child load does not invalidate an
already accepted branch in any mode. No multiple/check-strategy/indeterminate model exists.

Changing a parent discards all descendants beyond the changed column. No unrelated sibling
or first child is chosen automatically. `setValue(key|null)` resolves the known full path
and enforces terminal policy; `setPath(keys)` permits a known contiguous partial prefix.
Unknown/disabled/noncontiguous/duplicate/numeric/object/array-as-value arguments reject
before changing a healthy selection.

Disabled source nodes and their ancestors are unavailable. Authored native option disabled
state and select/fieldset disabling remain respected. Programmatic setters may update
otherwise disabled fields, as native properties can, but cannot select disabled source
choices. Full-path clear requires an available **root select**: it cannot clear a locked
root and strand the user with no enabled next control. Enabled child placeholders can
still clear an editable suffix without changing that locked ancestor.

When source nodes move/disappear/disable, refresh retains only the valid prefix. It does
not relocate a selected/default leaf to a new ancestor silently. Direct native `.value`
assignments need refresh to synchronize dependent columns; pending loaders additionally
compare actual native values so an omitted change event cannot let stale work overwrite them.

## Native forms: no hidden terminal field

Every name, form attribute, native required flag, label and field identity is authored.
Inactive columns are disabled and hidden under conditional ownership; active pending/
empty child columns retain their blank placeholder rather than silently submitting a
guessed child. **A nonempty incomplete leaf path is invalid even when the root is optional.**
An empty path is allowed only when native constraints permit it; root required uses real
native valueMissing.

The helper applies a conditional custom-validity gate to an enabled active select. If the
root field is author-disabled, another enabled active field carries the gate. Fully disabled
fieldsets retain native validation/FormData exemption, including the first-legend exception.
Existing application custom-error messages take precedence and are not erased; external
changes to those messages survive restoration. The existing Form helper reads these real
native errors without a special provider or proxy validator.

Native FormData is **not** rewritten:

- Complete three-level leaf path: `place[]=eu`, `place[]=fr`, `place[]=paris`.
- Partial US prefix: real fields may be `place[]=us`, `place[]=""`; native validation
  blocks ordinary submission, but constructing FormData itself never validates.
- Any-node Category selection may legitimately include a blank optional child field.
- Disabled/unnamed fields are omitted natively, even if their selected keys remain part
  of the logical path. Do not assume the returned fields always equal the entire path.
- No terminal-value hidden input, name removal or moved-name trick is used.

Applications needing a different wire format must explicitly serialize `state.value/path`
after validation themselves. Native `form.submit()` bypasses validation/events by design;
this helper does not patch browser methods. A scoped submit guard also prevents a
success-shaped submission while an active structural fault exists. Explicitly disabling
all fields excludes the component natively rather than submitting hidden values.

## The dependent-reset trap and its resolution

Native reset alone cannot restore a descendant whose options currently belong to another
ancestor. The helper therefore captures the original **full default key path** from
authored defaultSelected flags, or from defaultValue. `value` changes current state only.

1. On native reset dispatch, the transaction installs a real validity gate immediately.
   The interval before dependent options are reconstructed cannot pass native validation.
2. After native default actions settle, the captured path is revalidated against current
   source keys and parent links, then the correct sibling families/default selections
   are restored from root to leaf. Controls and cached option identities survive.
3. Cancelled resets keep current path/options and do not abort a valid pending load.
   Their temporary transaction gate is cleared at settlement. Observe post-reset validity
   after settlement; reset is not a synchronous dependent-option completion promise.
4. Missing/disabled/relocated defaults clear the current selection and remain gated, with
   defaultValid=false. No first sibling or unrelated branch is substituted. An optional
   failed reset stays gated through refresh until an explicit current/default action;
   Clear may acknowledge an empty optional selection without pretending to fix its default.

`setDefaultValue(key|null)` changes the captured default without changing the current path.
Native defaultSelected edits are also recognized when they form a coherent path; at most
one default option per column is allowed. A cross-branch default edit that leaves foreign
descendant defaults is **invalid**, not an invitation to guess their meaning. Prefer
setDefaultValue for cross-branch defaults.

Uncancelled reset blocks/aborts old loads before they can commit during the settlement gap.
Multiple resets coalesce. A later explicit setter supersedes queued reset settlement.
Mutation APIs during reset dispatch are rejected; queue them afterward instead of
competing with the browser's default action. Refresh after reset can settle the transaction
explicitly. Programmatic setters, refresh and reset do not emit user selection events.

## Safe optional loading

```js
const cascader = createCascader(root, {
  load(node, { signal }) {
    return applicationLoad(node.key, signal).then(items => ({
      nodes: items.map(item => {
        const li = document.importNode(template.content.firstElementChild, true)
        li.dataset.treeKey = item.key
        li.querySelector("[data-tree-label]").textContent = item.label
        return li
      }),
      dispose() { /* Release resources associated with this returned batch. */ },
    }))
  },
})
```

A `data-tree-lazy` branch has an empty child list and another authored column available
for its future children. User selection invokes its loader; programmatic setPath/setValue
remain silent and require explicit `load()` when desired. No built-in HTTP, recursive
expand-all fetching or arbitrary option-object renderer exists.

Limits: **2,000 source nodes**, **one to eight columns**, source depth within those
columns; one selected-branch request per instance. Each result adds at most **200 nodes /
200 root li / 4,000 passive native elements**. All keys, parent structure, depth, labels,
ownership and returned IDs are validated before insertion. Results require fresh,
parentless, same-document native li nodes; connected/fragment-owned/foreign-owned nodes
and active/custom content are rejected. Use native importNode templates, not HTML strings.

Accepted arrays and cleanup functions are snapshotted. Later mutation of the caller's
array cannot redirect disposal toward foreign DOM. Generation, branch element/key identity,
root connection and actual native select values protect ancestor changes, clear, reset,
refresh, removal/reused keys and disconnect. Cancellation settles false promptly; a late
ignored-signal result is disposed without insertion or selection overwrite.

`load()` resolves true for accepted/no-needed loading and false for cancellation; failures
reject and emit an error. Neither return value means the path itself is complete.
An empty successful branch stays a **known empty branch** in leaf mode: value remains
null and status explains that another ancestor is needed. No implicit promotion/selection.
A successful nonempty batch offers a blank next-level choice; the user still selects it.

Loading errors/duplicates leave the existing hierarchy and consistent prefix intact, clear
pending state and keep incomplete native forms invalid. Retry is explicit. Loader,
disposal and abort hooks must not reenter mutation APIs; disconnect may interrupt them.
Disposal must be synchronous. Arbitrary callback effects on unrelated data/DOM, unreturned
resources or uncancellable external work cannot be rolled back. This passive-DOM profile
is not a general HTML sanitizer.

## Events, focus and lifecycle

| API/event | Contract |
| --- | --- |
| `controls` | Frozen array of original native selects; use their native focus/blur APIs |
| `connected`, `error`, `state` | Lifetime, last reported error and explicit path/default state |
| `setValue`, `setPath`, `setDefaultValue` | Validated silent operations |
| `clear()` | Explicit user-like full-path clear; returns false when unavailable |
| `load()` | Explicit selected-branch load; invalid binding/arguments may throw synchronously |
| `refresh()` | Revalidate source/native values/default changes and resynchronize silently |
| `disconnect()` | Cancel work, release ownership and restore author fallback |
| `mui:cascader-change` | One native selection/clear notification, with state + action/event |
| `mui:cascader-load` | Accepted batch with current state/node/nodes, not a second user selection |
| `mui:cascader-error` | `{error}`; direct failures also throw/reject |

Native real change events stay native; derived columns get no counterfeit input/change.
Clear honors cancellation of its button click. No wheel, arrow-key, hover, drag or popup
keyboard handler is installed. Native focus/blur, Tab and select keyboard editing are not
reimplemented.

If a focused column becomes inactive, focus moves to a surviving enabled earlier field
before hiding it. Clear moves focus off its action before the action disappears. If the
whole component is hidden/inert/disabled, the application must choose an outside focus
target; the helper does not add invisible focusable padding or a fake focus proxy.

Scoped mutation observation watches the binding and shallow ancestors; no per-frame
layout polling. Call refresh after direct native property/external-label changes. Source/
control/order/view corruption is reported and keeps an active native form gated until
repaired; setters cannot bypass a known source fault. New author content in an invalid
plain readout is not deleted. Nested roots remain independent with consistent native form
ownership; inherited native fieldset disabling still applies normally.

Disconnect cancels queued work and restores original option nodes and binding-time
selection, not a magical independently working dependent-select model. Original native
field identities, names, label/form associations and conditionally owned attributes/messages
are restored. External overrides survive where ownership can be distinguished. Loaded
source batches and projected options are released, while authored source nodes remain.
Focus inside a retiring source batch moves to a surviving native source summary/field first.
Capture domain state before disposal if needed. The demo explicitly disables its restored
fallback fields. No helper continues validating after disconnect.

CSS alone owns columns, gaps, native sizes, text wrapping, RTL and focus/media presentation.
No inline presentation/geometry styles, popup runtime or scrollbar dependency are added.

## Four accepted steps and next reuse

1. [x] Pinned API/controller/option/interface/utilities/public exports and live reference
   reviewed; original identities retained with explicit adaptations/omissions.
2. [x] Native hierarchy projection, strict values/paths, disabled boundaries and real forms.
3. [x] Safe lazy batches, reset reconstruction/gating, precise ownership and stale-work guards.
4. [x] Targeted regressions, production budgets and actual Chromium acceptance.

**Next: Tree Select.** Reuse the real-node index, strict key/path rules and explicit
default/cancellation lessons where its anatomy matches. Do not bind competing Tree/Select
controllers on this source or these fields. Tree Select needs its own chooser/native value
and reset acceptance; it is not implemented in this Cascader-only change.

## Measured acceptance — 2026-09-09

`pnpm exec vitest run tests\cascader.test.ts tests\tree.test.ts tests\select.test.ts
tests\form.test.ts tests\native.test.ts`: **212 tests passed** (47 Cascader, 45 Tree,
40 Select, 53 Form, 27 existing native/legacy). `pnpm build` passed declarations,
standalone assets and every unchanged prior budget. No dependencies were added/restored.

Chromium **151.0.7922.174**, dedicated local Cascader demo tab; the live Naive UI
reference was reviewed separately. Other user/demo tabs were left alone. Initial
demo requests were its two local stylesheets and two local scripts; coexistence probes
loaded only additional local built assets.

| Actual browser case | Result |
| --- | --- |
| Native roles/labels | Native Region/Country-or-city comboboxes and selected/disabled options; no fabricated roles |
| Initial default | path eu/fr/paris, scalar value paris, three native place[] entries, valid |
| Parent change | US prefix only, value null, raw native fields us/empty, native form invalid |
| Native keyboard | Root ArrowDown chose US; Tab + ArrowDown chose New York in the child select |
| Complete shorter path | us/nyc, two successful fields; third field disabled/inactive, not renamed |
| Reset settlement gap | pending=true and native checkValidity=false before descendant reconstruction |
| Reset after switching branch | Returned eu/fr/paris, valid; same select, label and cached Paris option identities |
| Cancelled reset | Preserved us/nyc and valid current state after settlement |
| Missing Paris default | Existing New York value survived refresh; reset cleared/gated without selecting Lyon; explicit new Lyon default then reset succeeded |
| Pending strict-leaf load | remote prefix, value null, pending=true, native form invalid |
| Duplicate result/retry | One error, no partial children; retry emitted one load event, left next choice blank and emitted no second selection |
| Direct native value race | Parent `.value="us"` without change event survived; old load settled false, inserted zero source children |
| Clear/column focus | Clearing or selecting Island moved focus to the surviving root select before descendants disappeared |
| Any-node policy | Category remained the scalar value; native FormData truthfully included category and the blank optional child field |
| Native fieldset disabled | Form valid by native exemption, zero submitted fields, component state valid; no hidden substitute |
| Nested instance | Parent stayed Paris, nested instance selected Island; shared native form association remained explicit |
| Loaded-source teardown | Focus moved to surviving source summary; zero loaded rows, cleanup once, lazy marker restored, custom gate removed |
| Original fallback restoration | One original placeholder per field, empty binding-time values, all original place[] names preserved |
| Narrow RTL / 200% CSS zoom | 320px viewport / 305px document scroll width; no horizontal document overflow |
| Forced colors / reduced motion | Native media matched; helper remained connected without a motion engine |
| JavaScript disabled | Nine source nodes, native disclosure worked, source had zero form controls; dependent fieldset disabled and FormData empty |
| Classic/ESM/legacy coexistence | Namespace replacement rejected; optional ESM registered nothing; legacy constructor unchanged and still returned ["old","leaf"] |

Unit regressions additionally cover optional failed-default persistence, real Form-helper
integration, disabled-root validation transfer, defaultSelected changes, repeated reset/
setter races, unowned views/options, depth/ownership validation and cleanup errors.
Native popup appearance, assistive-technology interaction and other browser engines are
not certified by these tests.

### Payload and preservation

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Cascader ESM | 25,601 | 8,832 | 10,000 |
| Cascader classic | 25,887 | 8,970 | 10,000 |
| Cascader CSS | 1,093 | 452 | 1,250 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional payload: **9,284 gzip bytes ESM + CSS**, or **9,422 classic + CSS**.
All **178 previous top-level dist JS/CSS assets byte-match** the pre-Cascader build:
sorted filename/content SHA-256 aggregate
`9e68882614a2fa2b1527061e118aae2e489e9c8d337344124bd0f4d7a72ab4c1`
before and after. Tree, Select, Form, Virtual List and core/plugin sources were unchanged.
Generated dist files follow the repository's existing ignore policy.

Review fixed the reset-validity gap, direct native-value stale-load race, persistence of
failed optional resets, view/option ownership, locked-root clear focus and retiring source
focus. No shared helper changes or earlier payload increases were needed.

Reference audit: **69 original identities preserved + 26 explicit source supplements =
95 rows: 40 adapted, 55 omitted**. Catalog **3,736 rows / 292 accepted tasks / 73 accepted
pages**. P5 remains active with seven unfinished routes; **Tree Select is next**.
All **483 scoped Cascader/reference/index/master relative links** resolve. P4 remains
unchanged at 984 rows: 478 adapted and 506 omitted.
