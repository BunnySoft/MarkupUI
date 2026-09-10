# Tree Select: full paths in a native select

**🟢 Verified retained native scope.** One labelled single/multiple select, a passive
authored hierarchy, full-path option labels, literal filtering and native defaults/forms.
No expandable picker, check cascade, indeterminate parents, tag renderer, provider,
popup/geometry engine or virtualized option list is implied.

The implementation composes **readTreeHierarchy/TreeNode** with **one createSelect owner**.
It does not initialize Tree on the same source or a second Select on the same field.
There was no dedicated legacy Tree Select to replace; all earlier components stay intact.

The style audit reuses Select's public CSS tokens where appropriate, but does not import
its stylesheet or edit its controller. Tree hierarchy, shared Select and shared Popover
sources remain separate ownership boundaries. No popup dependency is needed by this native UI.

## Loading and authored native fallback

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/tree-select` | createTreeSelect and native options/controller/state/value types |
| `dist/markup-ui-tree-select.js` | Independent ESM |
| `dist/markup-ui-tree-select.global.js` | Classic MarkupUITreeSelect; rejects namespace replacement |
| `@dataengine/markup-ui/tree-select/style.css` | External dist/markup-ui-tree-select.css |
| [Demo](../../demo/components/tree-select.html) | Separate local HTML/CSS/JS, single/multiple/filter and handoff examples |
| [Reference](../naive-ui/components/tree-select.md) | Original identities and explicit source supplements/dispositions |

```html
<fieldset class="mui-tree-select" data-tree-select>
  <legend>File</legend>
  <section class="mui-tree" data-tree data-tree-select-source aria-label="File hierarchy">
    <ul data-tree-list>
      <li data-tree-key="docs">
        <div data-tree-row><span data-tree-label>Documents</span></div>
        <details data-tree-branch>
          <summary>Documents</summary>
          <ul data-tree-list>
            <li data-tree-key="readme">
              <div data-tree-row><span data-tree-label>README</span></div>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </section>
  <div class="mui-select" data-select data-tree-select-field>
    <label>File
      <select data-select-control name="file" required>
        <option value="" data-select-placeholder>Choose file</option>
        <option value="docs">Documents</option>
        <option value="readme" selected>Documents / README</option>
      </select>
    </label>
  </div>
  <p data-tree-select-value></p>
  <p data-tree-select-status></p>
  <button type="button" data-tree-select-clear hidden>Clear file</button>
</fieldset>
```

```js
import { createTreeSelect } from "@dataengine/markup-ui/tree-select"
const picker = createTreeSelect(document.querySelector("[data-tree-select]"), {
  selection: "any",  // Or "leaf".
  separator: " / ",
  showPath: true,     // Controls readout; native option labels always include paths.
})
picker.setValue("readme")
```

The native fallback options are already usable without JS, including native required,
selection and form submission. The passive list/details source supplies context and
stays authored DOM, not a hidden form or a second selection owner. No custom element
registration or loading order is necessary.

Use a connected light-DOM div/section/fieldset root, a separate static source, and one
Native Select host/control. Single dropdowns need a first enabled empty placeholder;
multiple selects must not contain an empty-value choice. Single listboxes may contain
an empty placeholder, but enhancement never treats it as a selected data value.
Use direct plain-text options, not optgroups/rich option markup in this retained profile.

Source keys must be unique nonempty **strings** (<=256 characters). Source labels are
named spans; child lists live in native details. Bounds come from the unchanged hierarchy
index: **2,000 nodes / 64 levels**, with projected full-path labels additionally limited
to **2,048 characters**. Validation precedes projection. Native full paths disambiguate
identical leaf labels under different ancestors.

Source inputs, selects, textareas, buttons, custom/active content and competing Tree
owners are rejected. A live named checkbox tree must not be hidden and reused as data.
Source interaction is only passive native disclosure, not an alternate selectable tree.
The field, source and plain views have explicit ownership; rejected competing owners
are not allowed to rewrite another Native Select's option collection.

## Native selection and path policy

The actual select's **multiple attribute** determines the immutable binding mode:

- Single: `value` is a known string key or null; setters reject arrays/numbers/empty key.
- Multiple: `value` is an independent string-key array in native DOM order. Use `[]` to
  clear; scalar/null/numeric/duplicate keys are rejected.
- The source hierarchy is not a parallel value model. Native option selectedness remains
  authoritative. `state.keys` and `state.paths` describe the selected keys and each
  complete ancestor path, not one Cascader-style dependent prefix.
- `selection="any"` is default and admits ordinary branches and leaves.
  `selection="leaf"` admits only nodes without authored branch details.
  Empty/lazy branches remain branches, not automatically promoted leaves.
  Native data-tree-group source headings are not selectable values.
- Selecting parent and child in multiple mode selects two independent keys. It does not
  check descendants, infer a parent, collapse reports or produce indeterminate state.

Disabled source nodes/ancestors and authored option disabling make a choice unavailable.
Refresh **prunes** newly disabled, removed or policy-ineligible selected keys; it does
not retain a selected disabled option that satisfies native required while submitting
no successful value. Native select/fieldset disabling instead leaves valid choices
selected and applies the browser's normal validation/FormData exemption.

Existing option/control/label/listener identities are retained by key. Source label or
parent changes update the same option's full-path text. A moved stable key remains selected
when still eligible; its path updates. Do not reuse a key for unrelated data.
When a selected key disappears, selection clears to null/[] instead of selecting the
browser's first unrelated data option.

Direct native property assignments and application source updates require refresh where
they do not emit a native change. The scoped observer handles ordinary source/option
attribute and structure changes; it is not a global property interceptor.

## Filtering, native keyboard and native forms

Optional filtering reuses Native Select's authored anatomy inside the field host:

```html
<div data-select-search hidden>
  <label>Filter paths <input type="search" data-select-filter></label>
  <p data-select-empty hidden>No matches. Selected choices remain visible.</p>
</div>
<label>Files
  <select data-select-control name="files[]" multiple size="6" required>
    <option value="readme" selected>Documents / README</option>
  </select>
</label>
```

Filtering requires native multiple mode or a single listbox with size>=2. It is a
case-insensitive literal substring filter over full-path option text, not an in-popup
search engine or a custom predicate. Native composition/draft behavior is delegated to
Select; replacing an active composing filter draft is rejected.

Valid selected nonmatches remain mounted/selected and visible unless the author
independently hid them. Filtering never clears or serializes them differently.
**CSS-hidden selected options still submit natively.** A named filter input is also a
normal successful form control; the helper never silently removes its name. The demo's
filter has no name, so it does not add a query field.

Native arrows, typeahead, Tab, Enter/Space and platform multiple-selection gestures are
not reimplemented. These are native select/listbox semantics, not ARIA-tree navigation,
checkbox cascade or tree-specific range checking. No wheel, drag or hover interception.

Native FormData contains the original field name once per successful selected option.
Single empty selection is normalized to no selected data option; multiple empty is [].
A required single listbox's blank placeholder is explicitly deselected so it cannot
falsely satisfy required. There is no hidden CSV/key/path proxy and no duplicated
successful control. Direct FormData construction does not validate, and native
form.submit() bypasses native validation/events as usual.

The existing Form helper consumes the native field and native source-error gate directly.
Application custom-validity messages take precedence and survive conditional restoration.
Changing the select's form owner or single/multiple mode requires rebind; explicit
external form association is supported without changing names or moving controls.

## Native styling and renderer boundary

The stylesheet now supplies complete standalone native-control defaults rather than just
padding. The field fills the available width, with a 3px radius and a native border.
`data-tree-select-size` on the outer root selects:

| Size | Minimum control height | Font size |
| --- | ---: | ---: |
| tiny | 22px | 12px |
| small | 28px | 14px |
| medium / absent | 34px | 14px |
| large | 40px | 15px |

These match the rendered pinned trigger metrics. Native multiple/listbox `size` still
controls its visible option rows: no fixed trigger height is imposed on a listbox.
The native arrow, option rows, selection highlight and multiple gestures remain browser-owned.
The stylesheet never removes native select appearance or draws a checkbox/tree popup.

Light controls use `#333639`, white fill and `#e0e0e6` border; dark controls use white `.82`,
white `.1` fill and a transparent border. Disabled foreground/fill are `#c2c2c2`/`#fafafc`
in light and white `.38`/`.06` in dark. An explicit theme marker on a root/ancestor selects
a local field color scheme. Focus remains a visible native outline rather than a copied
framework focus-shadow renderer.

Author tokens include `--mui-tree-select-height`, `--mui-tree-select-font-size`,
`--mui-tree-select-padding`, `--mui-tree-select-radius`, `--mui-tree-select-border`,
`--mui-tree-select-background`, `--mui-tree-select-color`, `--mui-tree-select-disabled-color`,
`--mui-tree-select-focus-color`, and `--mui-tree-select-indent`. Matching `--mui-select-*`
color/border/padding/font/focus tokens are supported as fallbacks, without requiring that
stylesheet. The field-qualified rules retain their defaults/overrides when Select CSS loads
afterward. Use Tree Select's outer size marker for this composition.

The passive source remains authored and visible unless the author explicitly hides it.
Its first list starts at zero and nested lists default to 24px indentation; linking Tree's
separate stylesheet is still an author choice, not an automatic Tree controller binding.
Readout/status/clear content stays outside the field, with its original semantics.

The native representation deliberately differs from upstream: full-path options rather
than leaf-only trigger text, a blank native unselected state rather than a generated
placeholder, native listboxes rather than multiple-value tags, and no popup mixed/check
tree. Browser-native popup rendering is not controllable as upstream DOM rows. The
[rendered style audit](../style-audit/components/tree-select.md) records the actual
reference popup, row/check dimensions and these limits rather than claiming popup parity.

## Defaults, reset and source changes

Without options, default keys come from native defaultSelected flags. `defaultValue`
configures mode-specific defaults; `value` configures current selection separately.
`setDefaultValue` changes defaults without undoing current selection.
Coherent direct native defaultSelected changes are also recognized; single mode permits
at most one default data key.

All eligible choices are present in one flat native option collection, so this component
does not need Cascader's dependent-family reset reconstruction. Before native reset,
source/options/default flags are reconciled while current valid selection is preserved.
The browser then performs its native default action; post-reset synchronization refreshes
readout/filter state without emitting a user selection.

When source changes:

- Missing/disabled/policy-excluded default keys are reported in
  `state.unavailableDefaultKeys`; no replacement key is invented.
- Multiple reset restores **only the surviving eligible defaults**, not a linked partial
  tree/check state. Single missing default resets to null and remains invalid if required.
- Cancelled reset keeps current selections and filter text.
- Later explicit setters are not overwritten by queued post-reset synchronization.
- Reintroduced/moved keys retain their stable-key meaning; applications must not reuse
  identifiers for unrelated entities.

This implementation reads each native option's `selected` property directly. The installed
jsdom version can leave its selectedOptions collection stale after selectedIndex/reset;
the direct selectedness observation works in that harness and Chromium without patching
browser properties or keeping a second selection model.

## API, errors and lifecycle

| API | Contract |
| --- | --- |
| `control`, `filter` | Original native field and optional native filter |
| `connected`, `error` | Lifetime and last reported source/runtime error |
| `value`, `state` | Live native observations while connected; throw after disconnect |
| `state.keys`, `state.paths` | Selected keys and frozen complete ancestor-key paths |
| `state.defaultKeys`, `state.unavailableDefaultKeys` | Captured defaults and unavailable subset |
| `state.valid` | Native validity plus active source fault; native disabled exemption applies |
| `setValue(value)` | Validated silent known/enabled selection |
| `setDefaultValue(value)` | Validated silent defaults, preserving current values |
| `setFilter(string)` | Native Select literal filter, preserving selections |
| `clear()` | Explicit user-like clear; false when unavailable |
| `refresh()` | Revalidate source/options, prune invalid keys and synchronize silently |
| `disconnect()` | Reconcile, release enhancement ownership and hand off current native options |

One `mui:tree-select-change` is emitted for a native select change or explicit clear.
Detail includes state, `action: "select" | "clear"` and the originating event when present.
Programmatic value/default/filter updates, source refresh and native reset are silent.
Clear is an explicit component action; it does not counterfeit a second native change.
`mui:tree-select-error` carries `{error}`; direct failures also throw.

Corrupt/duplicate/unsupported source state applies a real custom-validity gate and blocks
ordinary active-field submission until repaired. Unknown setter keys reject before changing
a healthy field. The source remains application-owned: there is **no** on-load callback,
AbortSignal manager, fetch or implied async branch parity. Update related source nodes and
lazy markers atomically, then refresh. Application loaders own cancellation and stale-result
guards themselves.

Observation is scoped to source/field structure and shallow ancestors. No per-frame
layout polling or geometry engine is installed. Nested instances are independent with
normal inherited native disabling and consistent form ownership.

### Deliberate native handoff, not rollback

**Normal disconnect does not undo user selection or restore old source options.**
It reconciles current valid source data, stops listeners/observation/tasks, releases
the Native Select owner and retains the latest native option nodes, labels, selectedness
and surviving default flags. Filter-owned hidden state is restored and the optional
search/clear UI returns to its authored state. A focused disappearing filter/clear action
returns focus to the native select when available.

Removed data options are not resurrected; source nodes are never moved or deleted by
Tree Select. The handed-off select remains a usable native form control, including native
reset, without the helper. Later unbound source changes are application responsibility.
Use the native control/FormData after disconnect rather than the disposed controller.

If final reconciliation is impossible because the source/binding is corrupt, teardown
reports/throws after clearing owned projected data selections/options rather than handing
off known-invalid data. Unrelated author DOM is not restored from a stale original snapshot.
Original fallback rollback is reserved for a failed initial construction, never normal
teardown. Application callbacks/property overrides can still have effects outside this
component's ownership; those cannot be rolled back.

## Four completed steps and reuse boundary

1. [x] Pinned API/controller/interfaces/exports/live source reviewed; original identities
   and source supplements have explicit per-row dispositions.
2. [x] Native hierarchy-aware single/multiple selection, full paths, leaf/disabled policy.
3. [x] Selected-preserving Native Select filtering, native defaults/reset and non-resurrecting handoff.
4. [x] Targeted/native regressions, build/budgets and actual Chromium acceptance.

Reuse the real-node hierarchy and Native Select owner only where anatomy/ownership match.
This completes Tree/Tree Select/Cascader's **declared retained** hierarchy wave, not full
framework/check-popup parity or P5 as a whole. **Next: Transfer**, with a separate
source/target movement, selection/order and form acceptance contract.

## Initial measured acceptance — 2026-09-09 (historical styling)

`pnpm exec vitest run tests\tree-select.test.ts tests\tree.test.ts tests\cascader.test.ts
tests\select.test.ts tests\form.test.ts tests\native.test.ts`: **248 tests passed**
(36 Tree Select, 45 Tree, 47 Cascader, 40 Select, 53 Form, 27 existing native/legacy).
`pnpm build` passed TypeScript declarations, standalone assets and all budgets.
No dependencies were added/restored and no earlier helper source or ceiling changed.

Chromium **151.0.7922.174**, dedicated local Tree Select demo tab; live reference reviewed
separately. Other user/demo tabs were not changed. Initial demo requests were exactly two
local stylesheets and two local scripts; coexistence probes also used local assets only.

| Browser case | Actual result |
| --- | --- |
| Native roles/labels | Native File combobox and Files listbox, full-path options and disabled Archive path; no tree/popup role |
| Single keyboard | ArrowDown selected Notes from Documents / Guide through the native control |
| Independent multiple | Notes and Media / Guide selected and serialized as two files[] entries |
| Nonmatching filter | Query zzz hid unselected rows; selected Notes/Media Guide stayed visible and FormData unchanged |
| Native defaults | Reset restored Guide in each picker and reset the native filter; cancelled reset preserved Media Guide/Notes |
| Label/path refresh | Same Guide option node updated to Manuals / Guide |
| Disabled path | Disabling Documents cleared its selected key and made required invalid |
| Missing default | Removed Guide did not reappear; reset yielded null/required invalid with unavailableDefaultKeys=["docs-guide"] |
| Explicit new default | Setting Notes as default then resetting selected Notes |
| Notifications | Setters/refresh produced zero selection events; one native change produced one event; clear produced one more |
| Clear focus | Focus moved from disappearing action to native select; cleared required field became invalid |
| Native filter handoff | Focus returned from hidden filter to native listbox; selected Notes retained and filter-owned hidden rows restored |
| Nested instance | Parent Notes and nested Media Guide remained independent with the intended native form owner |
| Teardown preservation | Single Media Guide and multiple Notes/Media Guide remained selected; same option identity; removed Guide not restored |
| Native reset after handoff | Single reset to surviving Notes default, multiple to its own Guide default; native FormData remained correct |
| 320px / RTL / 200% CSS zoom | 305px document scroll width, no horizontal overflow; selected values unchanged |
| Forced colors / reduced motion | Native media matched and controllers remained connected; no custom animation |
| JavaScript disabled | Authored native single/multiple selections submitted Notes and Notes/Media Guide; valid form, filter hidden, zero source form controls |
| Classic/ESM/core coexistence | Namespace collision rejected; optional ESM registered nothing; old Tree/Select constructors unchanged |

These are native DOM/browser observations, not all-browser/assistive-technology or
framework-popup parity. Review corrected selectedness observation, rejected-owner
construction rollback and conditional restoration of plain views.

### Initial payload and prior-output preservation

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Tree Select ESM | 26,315 | 8,844 | 9,000 |
| Tree Select classic | 26,607 | 8,977 | 9,000 |
| Tree Select CSS | 970 | 379 | 1,250 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional payload: **9,223 gzip bytes ESM + CSS**, or **9,356 classic + CSS**.
All **181 prior top-level dist JS/CSS assets byte-match** the pre-Tree-Select build.
The sorted filename/content SHA-256 aggregate is unchanged:
`28832aa3b3a09183e36ec0e8140bf36a57b704769ac79b60c2faba1178ea35d6`.
Generated dist files follow the existing repository ignore policy.

Reference audit: **87 original identities + 33 explicit source supplements = 120 rows:
39 adapted and 81 intentionally omitted**. Current catalog **3,769 rows / 296 accepted
tasks / 74 accepted pages**. P5 remains active with six routes: **Transfer, Data Table,
Log, Infinite Scroll, Popselect, Split**.
All **487 scoped Tree Select/reference/index/master relative links** resolve. P4's
984 rows remain unchanged: 478 adapted and 506 omitted.

## Style audit — 2026-09-11

- `pnpm test -- tests\tree-select.test.ts`: **39 tests passed**.
- Trigger width changed **171.188→320px** in the 320px fixture. Tiny/small/medium/large
  controls now match **22/28/34/40px** and **12/14/14/15px** reference typography.
- Light/dark normal and disabled surfaces, author overrides, native keyboard selection,
  disabled-path skipping, filtering/FormData and original option/control/label identities
  were verified in a dedicated headless Chrome profile/context.
- Reference popup/row/check states were actually rendered and recorded. Native visible
  listboxes remained **102px** for the five-row fixture, not a 34px tag trigger or a 158px
  checkbox-tree popup. No renderer or cascade/check facade was introduced.
- Isolated ESM/classic/CSS measured **8,844 / 8,977 / 845 gzip bytes**, within unchanged
  **9,000 / 9,000 / 1,250** ceilings. Runtime/shared sources remain unchanged; parent owns
  the full isolated release build. No next component is implied by this audit.
