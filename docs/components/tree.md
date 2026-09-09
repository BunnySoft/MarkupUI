# Tree: a native outline and hierarchy foundation

**🟢 Verified retained native scope.** Authored lists, details/summary, separate selection
buttons and native checkboxes. DOM is the hierarchy source; a bounded iterative index
references actual elements. No Vue/JSX/VDOM, treemate, provider, drag framework, renderer,
HTTP client or compulsory virtualization. P5 remains active, not complete.

**This is not an ARIA tree.** All native controls retain their own Tab stops and roles.
Optional hierarchy shortcuts enhance primary labels; they do not introduce roving tabindex,
treeitem/grid/listbox roles or selection/checking on the same fabricated control.

## Loading, native anatomy and no-JS

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/tree` | `createTree`, native controller/options/node/result types, `readTreeHierarchy`, `treeLabel`, node/depth limits |
| `dist/markup-ui-tree.js` | Independent ESM |
| `dist/markup-ui-tree.global.js` | Classic `MarkupUITree`; rejects namespace replacement |
| `@dataengine/markup-ui/tree/style.css` | External `dist/markup-ui-tree.css` |
| [Demo](../../demo/components/tree.html) | Separate local HTML/CSS/JS, native forms and cancellable local loading |
| [Reference](../naive-ui/components/tree.md) | 119 preserved original identities plus explicit supplements/dispositions |

No custom element is registered. Legacy `MuiTree`/`MuiTreeNode` and aggregate/plugin
behavior are untouched. There is no fake native-helper registration order.

```html
<section class="mui-tree" data-tree aria-label="Files">
  <ul data-tree-list role="list">
    <li data-tree-key="project">
      <div data-tree-row>
        <button type="button" data-tree-label data-tree-select>Project</button>
        <label><input type="checkbox" data-tree-check name="files" value="project">
          Include Project</label>
      </div>
      <details data-tree-branch open>
        <summary>Project contents</summary>
        <ul data-tree-list role="list">
          <li data-tree-key="readme">
            <div data-tree-row>
              <button type="button" data-tree-label data-tree-select>README</button>
              <label><input type="checkbox" data-tree-check name="files" value="readme">
                Include README</label>
              <a href="/help">Help</a>
            </div>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</section>
```

```js
import { createTree } from "@dataengine/markup-ui/tree"
const tree = createTree(document.querySelector("[data-tree]"), {
  cascade: true,
  multiple: true,
  checkStrategy: "all",
})
tree.setSelectedKeys(["readme"]) // Silent selection, not checkedness or form data.
tree.setCheckedKeys(["project"]) // Real native checks, including known eligible descendants.
```

Use a named, connected, light-DOM section/nav/div root with exactly one direct native
ul/ol[data-tree-list]. Each li has a **unique nonempty string** data-tree-key (<=256 chars),
one direct div[data-tree-row] and one named data-tree-label. Numeric API keys are rejected,
not silently stringified. Treat keys as stable identities; explicit DOM refresh is required
after structural changes. Nested roots are independently scoped.

Labels are native type=button, a[href], or static span. Only a button marked data-tree-select
participates in selection. A data-tree-group uses a static label and a branch; its summary
is the primary keyboard target. A native link label navigates normally, including modified
clicks. Extra row links, form buttons and controls are not converted into tree actions.
Labels/ID references and checkbox names/values are authored, never generated proxies.

A branch is a direct details[data-tree-branch] with exactly one first summary and one
direct child list. Keep interactive controls **outside summary** and do not share a native
details name: accordion/exclusive sibling expansion is not this scope. Leaves omit details.
Unloaded branches have data-tree-lazy and an empty child list. Empty loaded branches may
retain authored details/explanation; the helper does not rebuild them as leaf renderers.

Native nested lists, links, details and checkboxes remain useful without JS. The demo
starts custom selection buttons disabled and explicitly enables them before binding;
native disclosure/check fields still work. A no-JS message explains unknown lazy branches.
An empty-state paragraph belongs outside the list, with caller-owned visibility.

## Selection, expansion and defaults

Selection and checking are separate:

- Native selection buttons expose current `aria-pressed`; `selectedKeys` observes them.
  `multiple=false` is default; `cancelable=true` permits unselecting an already selected
  button. No range selection or Ctrl/Shift multi-selection model is invented.
- `defaultSelectedKeys` and `defaultExpandedKeys` initialize once. Corresponding current
  `selectedKeys`/`expandedKeys` options take precedence. Without these options, authored
  `aria-pressed` and native details.open remain the initial state.
- `defaultExpandAll` opens only known enabled branches once. It never fetches unknown
  branches and is not a reactive “expand every future descendant” instruction.
- `setExpandedKeys` is silent and **does not load**. `expand(key)` explicitly opens an
  enabled branch and optionally loads it; its promise resolves true on accepted content,
  false on cancellation/disconnect, and rejects loader/result errors.
- Programmatic selected/open setters may explicitly address disabled nodes, like native
  property assignment; user activation remains blocked. Explicit `expand` loading does
  not bypass a disabled branch. Defaults do not become a native details form-reset model.

Native `[checked]`/defaultChecked remain form-reset defaults. `defaultCheckedKeys`, when
provided, explicitly configures the mutable native fields' defaults after cascade
normalization; current `checkedKeys` then overrides current state only. Ordinary setters,
refresh and user interaction never rewrite defaults. Native reset resets native fields,
then silently re-derives cascade; cancelled reset preserves current checks. Form reset
does not reset selection or expand/collapse state.

## Checking, disabled boundaries and reports

Every participating field is one real labelled input[type=checkbox][data-tree-check].
Tree shares the existing native CheckboxGroup **ownership guard**, not its state engine:
the same field cannot have both owners, including across module copies. No fake checked
proxy, hidden input, duplicate role or automatic CheckboxGroup initialization.

With `cascade=false`, fields are independent; authored `.indeterminate` is allowed.
With `cascade=true`:

1. A source checkbox's native change propagates to eligible known descendants.
2. Bottom-up aggregation updates real parent `.checked` and `.indeterminate`.
3. Disabled nodes/checkboxes form **barriers**: ancestor operations neither cross nor
   aggregate that subtree. Enabled descendants behind a barrier can be used independently.
   Groups without checkboxes transparently aggregate their eligible children.
4. A reachable unknown lazy branch blocks the ancestor's cascade action with aria-disabled.
   Attempted native activation is cancelled so the browser restores checked/mixed state.
   Already-known siblings remain independently checkable; a parent can be mixed, but never
   claims all unknown descendants are checked. `allow-checking-not-loaded` is omitted.

Native checkbox disabled, disabled fieldsets (including the first-legend exception),
authored aria-disabled, and data-tree-disabled barriers are respected. Node/root
data-tree-disabled blocks tree interaction; it does **not** set native form disabling on
every field. Use native disabled/fieldset if fields must be omitted from FormData.
Node-local disabling does not automatically disable every descendant's independent action.

`setCheckedKeys` replaces only the mutable eligible check set; disabled native values
are preserved and may still appear in the all report. Explicit keys that are disabled,
unknown or blocked by unloaded cascade content reject before mutation. Direct native
property writes are possible; call refresh to derive parent state afterward.

| Report | Meaning in cascade mode |
| --- | --- |
| `all` | Every actual checked native field in DOM order, including retained disabled values |
| `parent` | Highest checked field in each eligible cascade segment |
| `child` | Terminal checkable fields within each eligible cascade segment |

Without cascade, reports return independent checked fields. Strategies change **reporting
only**, not checkedness, field names, form ownership or successful-control rules.
`getCheckedData(strategy?)` and `getIndeterminateData()` return frozen `{keys,nodes}` with
real node references, not TreeOption/null objects.

**Unlike Virtual List, closed descendants remain mounted.** Named, enabled, checked
descendant fields still participate in native FormData even when details are closed.
Disabled/unnamed/unchecked fields follow native rules. No selected key is serialized
automatically. Loading adds real fields; unloaded data has no native field representation.

## Native keyboard and focus

On a primary button/link label, or its branch summary:

- Up/Down: previous/next visible enabled primary target; Home/End: first/last.
- Right: open a branch (load only when explicitly activated), otherwise first visible
  eligible child. Left: close the branch, otherwise nearest available parent.
- Printable non-space keys: prefix typeahead, 700ms buffer, repeated-character cycling.
  Current label text/ARIA is used; no per-node layout scan is done for each keypress.
- Tab/Shift+Tab, Enter/Space, modified/composing keys and checkbox/native editor keyboard
  behavior stay native. No synthetic click is added to Enter/Space.

Direction remains hierarchy-oriented Left=parent/close and Right=child/open in RTL;
CSS indentation/lines are logical. No optional keymap claims an ARIA tree.
Visibility is refreshed from native open/hidden/inert and scoped style/structure changes;
call refresh after stylesheet/media changes not represented by observed DOM mutations.

Closing a branch moves focus from its descendants to the branch's primary target first.
Removed/hidden focused nodes recover to a surviving visible ancestor, then the first
available target/root. Unrelated outside focus is not stolen. Before hiding/inerting the
entire outline, the application must choose an outside focus target: an invisible root
cannot receive safe fallback focus. A leased root tabindex=-1 is only a recovery target,
not a new Tab stop. Reordering preserves actual elements/listeners; the caller owns the
native move and browser state-preservation limitations.

## Lazy native-node loading and failure

```js
const tree = createTree(root, {
  load(node, { signal }) {
    // Application owns transport or local work and signal handling.
    return obtainChildren(node.key, signal).then(children => ({
      nodes: children.map(child => {
        const li = document.importNode(template.content.firstElementChild, true)
        li.dataset.treeKey = child.key
        li.querySelector("[data-tree-label]").textContent = child.label
        return li
      }),
      dispose() { /* Release application resources for this returned batch. */ },
    }))
  },
})
```

The helper performs no HTTP. Load results are `{nodes: native li[], dispose?}`; not strings,
VNode objects, source Promise<void> data mutation, or a schema. Each root must be fresh,
parentless, same-document and unowned. Native template **importNode** creates eligible
active-document nodes. Connected/fragment-owned/reused nodes are rejected, never stolen.
Returned scripts/styles/links/iframes/objects/embeds/customized/custom elements are rejected.
Caller code still owns arbitrary hook side effects and security of its own native content.

Limits: **2,000 total tree nodes, 64 levels, eight pending loads**, and per-result at most
**200 tree nodes / 200 root li / 4,000 native elements**. Full hierarchy/duplicate-key/
anatomy/ID/ownership validation precedes insertion. Accepted result arrays and disposal
functions are snapshotted: later caller array mutation cannot redirect cleanup.

AbortSignal plus actual node/branch identity and a generation guard prevent stale
insertion after collapse, ancestor hiding, removal, reused keys, refresh or disconnect.
Cancellation settles false promptly even when a loader ignores its signal; any eventual
result's resource cleanup still runs, but stale nodes are never inserted or auto-expanded.
Independent branches may load concurrently; successful insertion does not cancel siblings.
Explicit refresh conservatively cancels all pending loads for that root. Nested instances
have separate owners and signals; parent disposal must explicitly dispose nested helpers.

Invalid results/rejections report `mui:tree-error`, reject the load promise, clear busy
state, and leave the existing healthy outline intact. Repeated activation may retry.
An empty successful batch is a known empty branch, not perpetual loading. A successful
batch emits mui:tree-load once. Source false/void result conventions are not emulated.

Mutation APIs cannot be reentered from loader/cleanup/abort hooks; disconnect can interrupt.
Generation/lifetime checks stop old work, including abort listeners that disconnect.
Cleanup hooks must be synchronous. Arbitrary callback mutations to unrelated DOM/data,
unreturned resources or other owners cannot be rolled back; normal DOM listener exception
reporting still applies. Do not directly mutate a loading branch's list: return nodes
through the validated result or abort and explicitly refresh instead.

## Lifecycle, notifications and CSS

| API | Contract |
| --- | --- |
| `nodes`, `selectedKeys`, `expandedKeys`, `loadingKeys` | Native-index/current-state observations |
| `connected`, `error` | Lifetime and last reported error, not automatic error-clear-on-success |
| `setSelectedKeys`, `setCheckedKeys`, `setExpandedKeys` | Validated silent operations |
| `expand(key)` | Explicit bounded load/open operation; invalid keys may throw synchronously |
| `reveal(key)` | Opens known native ancestors and scrolls the label into view, without focus or virtual/smooth promise |
| `refresh()` | Validate/reindex native DOM/labels/check state; cancel pending work; silent |
| `disconnect()` | Idempotent cleanup; first disposal failure is reported/thrown after attempting all batches |

One scoped set of click/change/toggle/keydown/focus listeners and a MutationObserver
observe the root; shallow ancestor observation catches root removal/visibility changes.
No per-frame layout polling or per-node listeners are installed. Pending notification/reset
tasks are cancelled on refresh/disconnect. Setter-induced native toggle events are suppressed
as user notifications. Cancelled selection clicks do not select; cancelled checkbox clicks
use native checked/mixed rollback. Derived descendants do not emit counterfeit input/change.

User notifications: `mui:tree-select` includes selectedKeys/key/node/event;
`mui:tree-check` includes keys/nodes/indeterminateKeys/key/node/event;
`mui:tree-expand` includes expandedKeys/key/node/event. Each source action emits one
notification, not one per callback alias or derived descendant. Callback errors and invalid
asynchronous results use `mui:tree-error` with `{error}`.

Invalid external anatomy fails closed: abort work, release owned loaded rows/resources,
restore leased attributes/mixed state, and report/throw rather than retain stale indexes.
The helper never deletes arbitrary author-added nodes. Loaded batches are removed before
their cleanup callback. Authored nodes/listeners/native current checked/default values
remain. Original helper-owned ARIA/tabindex/lazy markers and mixed state are conditionally
restored; external overrides survive where ownership can be distinguished. Disconnect
moves focus out of removed loaded content to a surviving native parent/summary first,
not a root whose leased tabindex is about to disappear. Native open/current checked state remains
browser/application state, not a rendered-data snapshot.
After cleanup, controller node/key observations are empty and internal node/lease indexes
are released; retain an authored native reference yourself if it is needed after disconnect.

CSS owns logical indent/lines, native disclosure marker, selected button appearance,
wrapping/ellipsis, block labels, focus and media. No geometry or presentation stylesheet
is generated by JavaScript. A tiny aria-busy marker is not a Spin dependency.

## Four accepted steps and reusable guidance

1. [x] Pinned/source/live review; **119 original identities + 28 explicit supplements =
   147 rows: 60 adapted, 87 omitted**, with all original section/kind/line identities retained.
2. [x] Native hierarchy, selection/check/expand/default/focus contracts; no duplicate DOM renderer.
3. [x] Bounded atomic loading, lifecycle/error/cancellation ownership and targeted regressions.
4. [x] Build/budgets plus actual Chromium keyboard/check/form/race/media/no-JS/coexistence evidence.

`readTreeHierarchy`/`TreeNode` are real-node indexing primitives useful for upcoming
Cascader and Tree Select. Reuse them only when those consumers adopt this authored
anatomy and ownership, or extract the genuinely common native traversal then. Do not
instantiate a second checkbox owner, import an implicit provider, or pass a duplicate
TreeOption rendering graph around. The consumers need their own popup/chooser, value/path,
keyboard and reset contracts. **Recommended next: Cascader**, then Tree Select; neither
is implemented in this Tree-only commit.

## Measured acceptance — 2026-09-09

`pnpm exec vitest run tests\tree.test.ts tests\checkbox.test.ts tests\native.test.ts`:
**117 passed** (45 Tree, 45 existing Checkbox, 27 existing native/legacy tests).
`pnpm build` passed TypeScript declarations, ESM/classic assets and every budget.
No dependencies were added/restored; existing core/plugin/component ceilings were not changed.

Chromium **151.0.7922.174**, dedicated local `localhost:4188/demo/components/tree.html`
tab, with the live reference in a separate tab. Other demo/user tabs were not altered.
Initial demo requests were exactly its two local stylesheets and two local scripts.
Coexistence probes also imported only local built assets.

| Browser acceptance | Actual result |
| --- | --- |
| Native roles/labels | Snapshot exposed lists, selection buttons and `Include Project` as a native mixed checkbox; no ARIA-tree role |
| Keyboard | Project Right → README, Down → Notes, Enter selected Notes once; Tab reached its checkbox, Space checked once |
| Cascade/reports/forms | all=`project,readme,notes`; parent=`project`; child=`readme,notes`; FormData contained the three real fields |
| Selection/check separation | Selection alone did not change checks or serialize a selected-key proxy |
| Native collapse | One expand notification; child focus recovered to Project |
| Rename/hidden/removal | Typeahead found renamed Zulu notes (12 computed-style reads); hidden/removed focus recovered to surviving Project; original removed node was not recreated |
| 500-node fixture | 500 native rows, 70.2ms initial binding locally; End reached row 500 in 0.4ms with seven computed-style reads |
| Stale/duplicate demo results | Immediate API collapse prevented late insertion; duplicate key raised one error and left the healthy outline; retry added two native rows |
| Controlled native summary race | Native open began one pending load; native close aborted signal, cleared loading, emitted two total expand transitions; late result added zero rows and disposed once |
| Nested ancestor collapse | Inner signal aborted, promise settled false, zero late nodes, cleanup once; both independently bound roots remained healthy |
| Loaded teardown | Focus ended on the surviving native parent, not the removed leased root tabindex; zero loaded rows; original lazy marker restored; busy/tabindex removed |
| 320px / RTL / 200% CSS zoom | 305px layout/scroll width including native scrollbar allowance; no horizontal document overflow after wrapping fix |
| Forced colors / reduced motion | Native media matched and helper remained connected; no custom motion engine |
| JavaScript disabled | Seven authored nodes remained; native summary closed; selection enhancements stayed disabled; closed README still submitted natively |
| Classic/ESM/legacy coexistence | Namespace collision rejected without replacement; optional ESM registered nothing; legacy Tree constructor unchanged and selected value `old` |

Timings are machine-local observations, not an SLA or all-browser/assistive-technology
certification. Native events and DOM were measured; no virtualization proxy is claimed.

Review and browser verification corrected cancellation reentrancy, immutable accepted
batch ownership, scope-marker mutation detection, narrow/zoom wrapping and native focus
after loaded-row teardown. Disconnect releases internal indexes rather than retaining
removed loaded controls. These fixes have targeted regression coverage.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Tree ESM | 22,608 | 7,710 | 9,000 |
| Tree classic | 22,886 | 7,860 | 9,000 |
| Tree CSS | 1,590 | 606 | 1,250 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined optional payload: **8,316 gzip bytes ESM + CSS**, or **8,466 classic + CSS**.
The existing Virtual List ESM remains **4,149 gzip bytes**. Core/plugins and earlier
component sources were not edited. Built dist files follow the repository's existing
ignore policy; package exports and the build manifest include the new optional assets.

Reference/catalog audit: **119 original identities preserved; 147 Tree dispositions =
60 adapted + 87 omitted**. Current full catalog **3,710 rows / 288 accepted tasks /
72 accepted pages**. P5 is **In progress**, with eight routes remaining; Cascader is next.
All **478 scoped Tree/reference/index/master relative links** resolve; P4's 984 rows and
478 adapted / 506 omitted dispositions remain unchanged.
