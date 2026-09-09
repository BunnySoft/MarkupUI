# Select: native options, explicit clear and literal list filtering

**🟢 Verified for the retained P4 native Select scope. Rich P5 combobox surfaces are
explicitly omitted, not implemented by native typeahead.** The authored select, options
and optgroups remain the only selection controls and submitted values. Legacy `MuiSelect`
in `src/components/forms.ts` is unchanged.

## Loading and anatomy

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/select/style.css` | External `dist/markup-ui-select.css`; native fields work without JS |
| `@dataengine/markup-ui/select` | ESM `createSelect`, `SelectController`, `SelectValue` |
| `dist/markup-ui-select.js` | Self-contained optional helper ESM |
| `dist/markup-ui-select.global.js` | Classic `MarkupUISelect.createSelect`; rejects namespace replacement |
| [Local demo](../../demo/components/select.html) | Separate HTML/CSS/JS, native forms and local GET fallback |
| [Reference inventory](../naive-ui/components/select.md) | All original props, option/group records, slots, methods and inline fields |

```html
<label for="language">Language</label>
<div class="mui-select" data-select id="language-field">
  <select data-select-control id="language" name="language" required>
    <option data-select-placeholder value="" disabled selected>Choose a language</option>
    <optgroup label="Languages">
      <option value="typescript">TypeScript</option>
      <option value="rust">Rust</option>
    </optgroup>
  </select>
  <button data-select-clear type="button" hidden>Clear language</button>
</div>
```

In an external setup script after loading one helper format and the external stylesheet:

```js
const field = MarkupUISelect.createSelect(document.querySelector("#language-field"))
field.setValue("rust") // Silent; no defaultSelected changes.
field.setValue(null)   // Single mode: genuine no-selection, selectedIndex === -1.
```

There is no custom-element registration, hidden form proxy, renderer or `mui-*` load-order
rule. Per-root/control/filter symbols reject duplicate owners, including ESM/classic copies.
No mandatory Input, Dropdown, Tag, Popover or Scrollbar dependency is added.

The connected light-DOM `.mui-select[data-select]` root has no role/tabindex and is outside
labels, buttons, links and summaries. It contains one original labelled native
`select[data-select-control]`, optionally a named `button[type=button][data-select-clear]`,
an external search region and authored `[data-select-empty]` message. Controls are fixed
for a lifetime; disconnect/recreate for replacement controls. Options may change via refresh.
Do not put clear buttons or search controls inside the select's label or native options.

Every option needs an **explicit unique string `value`**, including an empty-string option.
Values are unique across optgroups. Options are direct select children or direct children
of one native optgroup level; groups need native nonempty `label`s. Native group DOM identity
is preserved; there is no group-key record model. Template content is inert until the
application inserts it. Native labels, names, ARIA, attributes and authored node/listener
identity stay intact.

## Value modes, empty values and defaults

| State/API | Meaning |
| --- | --- |
| `control`, `filter` | Original select and optional original native text/search input |
| `value` in single mode | Selected native string, **including `""`**, or null when selectedIndex is -1 |
| `value` in multiple mode | DOM-order array of all selected native strings; no selection is `[]` |
| `setValue(string|null)` | Single mode only; unknown/non-string keys throw, null clears actual selection |
| `setValue(strings[])` | Multiple mode only; unique existing strings required; scalar/null/numeric/object/unknown/duplicate keys throw |
| `setFilter(string)` | Silent literal filter input write; requires a filter, rejects writes during tracked composition |
| `clear()` | User-like clear, returning false on no-op/blocked state; notification behavior below |
| `refresh()` | Validate/reconcile option/group changes and owned visibility; no native value/default rewriting |
| `connected`, `error` | Lifetime and most recent validation error |
| `disconnect()` | Idempotent listener/observer/task/attribute/owner cleanup; native selections/defaults remain |

**Native select has no defaultValue property.** Reset defaults are option.defaultSelected
and authored selected attributes. Setting current value/option.selected does not alter
those defaults. No parallel default-value field, property interception or option model exists.
Native option insertion/removal/reordering and reset may reconcile single selectedness
(for example, selecting an available first option after removal). The helper reads the
browser's actual result; it never restores a missing key, generates fallback options or
fabricates a user change because markup changed.

Single placeholder semantics are explicit:

- `[data-select-placeholder]` marks the **first direct empty-value option of a single
  dropdown** (size absent/0/1). It may be disabled. Lists and multiple selects use external
  help text, not this marker. The browser owns required placeholder-label-option semantics.
- A selected placeholder has helper value **`""`**, not null. A disabled selected
  placeholder is not a successful form value. An enabled empty-value option submits `""`.
- `setValue(null)` always means no selected option, even if a placeholder exists. Native
  `.value` alone cannot distinguish these two empty states; helper `value` uses selectedIndex.
- A successful single clear selects the marked placeholder when present, otherwise sets
  selectedIndex to -1. Already-placeholder/already-empty is a no-op. Multiple clear selects
  nothing (`[]`). No unchecked/empty hidden input is generated.

Selection state includes disabled selected options, including descendants of a disabled
optgroup. Native FormData excludes disabled selected options/groups and disabled controls/
fieldsets; it includes enabled selected strings once each, including selected hidden
options. **Selection is not the same as successful submission.** Setters may select disabled
options explicitly, and clear clears the entire selection, including disabled selections,
when the select itself is editable. Neither operation changes native disabled attributes.

The `multiple` mode is captured per controller. Changing it invalidates/disconnects the old
controller and restores its owned visibility; create a new controller for the new mode.
Prefer disconnect → change multiple/size → create, as in the demo. Native mode changes can
already change selectedness; the helper does not reverse them. Filtered single controls
must remain lists with size ≥ 2. Changed values/groups/options require valid keys and refresh,
not a renderer/rebind of existing option nodes.

## Clear, native notifications and readonly policy

The original browser input/change events remain unchanged for keyboard/typeahead/menu/list
selection. There is no duplicated `mui:change` or framework model event. Programmatic
setters, direct property assignments, refresh and native reset are silent.

A successful clear sends one synthetic bubbling/composed native `input`, then one bubbling
native `change`, then bubbling `mui:select-clear` on the select with `{ previous }` (string,
null or an array snapshot). These are notification events, not trusted native editing.
The focused clear button returns focus to the real select **before hiding**. A no-op sends
nothing and does not steal focus. The button never submits a form. Its action runs in the
next task, allowing a later click listener to cancel it using preventDefault().

Native select has **no readonly attribute**; the helper rejects that fictitious state.
Clear is blocked by native disabled/fieldset, hidden/inert ancestors, and authored
aria-disabled=true or aria-readonly=true. These advisory ARIA attributes do not implement
readonly native menu editing: use native disabled or application-owned policy for that.
The filter input is an independent native text control; its own readonly/disabled does not
turn the select into a fake readonly combobox.

Native names/form association, required and disabled/optgroup/fieldset rules stay native.
A capture reset listener refreshes in a task **after the native default action**, including
cancelled resets and changed/external form ownership. The select and optional filter may
have different form owners; only the browser resets their respective state. A cancelled
reset does not terminate the helper's tracked filter composition. There is no schema,
async validator, global form model or automatic aria-live validity announcement.

## Optional external literal filter — not an in-popup combobox

Filtering requires a native **list**: multiple or single size ≥ 2.

```html
<div class="mui-select" data-select id="tools-field">
  <div data-select-search hidden>
    <label for="tools-filter">Filter tools</label>
    <input data-select-filter id="tools-filter" type="search" aria-controls="tools">
  </div>
  <label for="tools">Tools</label>
  <select data-select-control id="tools" name="tools" multiple size="6">
    <option value="html" selected>HTML</option>
    <option value="css">CSS</option>
  </select>
  <button data-select-clear type="button" hidden>Clear tools</button>
  <p data-select-empty hidden>No matching options. Selected choices stay visible.</p>
</div>
```

The real labelled text/search input lives in the separate `[data-select-search]` region;
that region cannot contain the select/clear action. It is hidden without JS and restored
on disconnect. No combobox role, keyboard transfer, hidden select or virtual list is added.
The query may have an authored name/form if it is intentionally another form field; the
helper never gives it the select's submission value.

The fixed matcher trims the query for matching and uses a **case-insensitive literal
substring** of native option label plus native group label (`toLowerCase`, no locale
collator, regex, accent normalization or callback). The actual input value/caret/case are
not rewritten. Composition drafts do not filter until compositionend. Selection does not
automatically clear the query; no clear-filter-after-select state engine is retained.

Only **unselected nonmatches** receive owned hidden attributes. Selected options remain
visible even when they do not match, unless the author already hid them. Groups hide only
when all their options are hidden; a pinned selection keeps its group visible. Options
are never detached, replaced, disabled, selected or deselected to implement filtering.
Filtering cannot silently alter the submitted selection by removing selected nodes.

The optional empty message appears when there are no literal matches (excluding the
placeholder/author-hidden content), even if selected nonmatching choices remain visible.
It is authored adjacent content, not a popup slot or live result-count renderer. Disabled
matches still count as matches, not enabled availability.

Direct `.value`, option.selected or filter.value assignments are not reliably observable
as property changes: call refresh after application writes. `setValue`/`setFilter` refresh
explicitly and remain silent. Attribute/default/structural mutations are observed.
Updates re-adopt valid option/group nodes without changing their identity or defaults.
Only owned hidden attributes and clear-button disabled/hidden are restored; newer author
mutations win, including originally hidden groups/options. A no-op removal of an already
absent attribute is not an observable ownership transfer.

Removing the root/control disconnects. Malformed keys/anatomy reject explicit operations
and set `error`; automatic failures emit nonbubbling `mui:select-error` with `{ message }`
when the error changes. Fix the markup and refresh, or rebind after mode/control changes.
Disposal of a focused hidden-on-disconnect query/clear action focuses the select if it is
still usable; otherwise the application's containing surface owns focus recovery.

## Native picker and presentation boundaries

Call native select.focus()/blur() directly. The external filter has its own focus()/blur()
when present; it is not a hidden input inside the picker. The helper exposes **no show/hide
model**. If `typeof select.showPicker === "function"`, an application may call it directly
from a valid user gesture. Browser permission/state/security errors must be handled or
propagated, not swallowed. The demo reports errors in text. There is no hidePicker API;
native selection, Escape and platform UI own closing.

CSS retains native arrow/checkmark/typeahead/menu/list interaction. `.mui-select__affix`
is authored surrounding content. `data-size="tiny|small|medium|large"`, data-borderless,
and data-status="success|warning|error" affect external control presentation only.
Tokens: `--mui-select-color`, `-font`, `-pad`, `-border`, `-background`, `-disabled`, `-focus`
(all use the `--mui-select` prefix). Logical dimensions/wrapping, focus, hidden safety,
forced colors and print are external. No animation or CSS-in-JS is introduced.

Native popup dimensions, placement, internal scroll/checkmarks/arrows and option rendering
are platform-owned. Authored option class/style remains in DOM, but styling support in
native popups differs by browser/OS. No universal popup pixel parity is claimed.

## Complete upstream mapping and P5 exclusions

| Upstream property/record/method | Retained adaptation or omission |
| --- | --- |
| clearable, on-clear | Authored clear button/controller clear and documented notification sequence |
| default-value, value, multiple | Native defaultSelected/current selectedness; strict string/null or string[] modes |
| disabled | Native select/option/optgroup/fieldset behavior, no forwarded control model |
| filterable, ignore-composition, input-props, on-search | Separate native list filter, deferred composition, authored input attrs and native query events; not in-popup filtering |
| keyboard | Native keyboard always retained; a keyboard=false override is omitted |
| options, placeholder | Authored options/optgroups and explicit dropdown placeholder marker; no options renderer/default translation |
| size, status; source bordered | External CSS only, not menu size, validation or provider state |
| on-blur, on-focus, on-update:value; source onUpdateValue | Native events, helper value/native selectedOptions, not object-model callbacks |
| SelectOption class/disabled/label/style/value | Native option attrs/string labels/values; label functions and style-object translation omitted; popup styling is platform-limited |
| SelectGroupOption children/label/type | Native optgroup/option hierarchy and string labels; nested group/render callbacks omitted |
| SelectGroupOption key | **Omitted** record-key model; use stable authored DOM/id if needed |
| empty slot | Authored adjacent empty/match text, not native picker content |
| focus/blur | Native select methods |
| focusInput/blurInput | Native external filter methods when present, not a trigger-input facade |
| consistent-menu-width, menu-props, menu-size, placement, to | **Omitted** popup geometry/portal/menu DOM API |
| show, show-on-focus, on-update:show; source onUpdateShow | **Omitted** controlled popup lifecycle; native showPicker is separate and has no hide counterpart |
| show-arrow, show-checkmark, arrow slot | **Omitted** custom popup indicator APIs; preserve native platform UI |
| filter, clear-filter-after-select | **Omitted** arbitrary predicates and automatic query rewrites; fixed literal filter is explicit |
| children-field, label-field, value-field, node-props | **Omitted** object-field/DOM-prop factories; author actual HTML |
| fallback-option, tag, on-create, clear-created-options-on-clear | **Omitted P5** generated/created options; unknown keys throw and no option is generated |
| remote, loading | **Omitted P5** remote/fetch/loading orchestration; application can edit native DOM/disabled/status explicitly |
| max-tag-count, render-tag (+ option/handleClose) | **Omitted P5** selected chips/tag rendering/responsive truncation |
| render-label, render-option (+ node/option/selected), SelectOption.render and SelectGroupOption.render (+ their node/option/selected fields) | **Omitted P5** VNode/custom option renderers |
| virtual-scroll, reset-menu-on-options-change, on-scroll | **Omitted P5** virtual/pending/scroll menu engine; browser owns its native view |
| ellipsis-tag-popover-props, scrollbar-props | **Omitted** composed Popover/Scrollbar APIs, not inherited or imported here |
| header/action slots | **Omitted** native popup slots; author external headings/actions instead |

Source supplements also explicitly omit widthMode/displayDirective, deprecated onChange/items,
theme objects, SelectSlots.default, option-record variants/ignored options, Value/ValueAtom and
typed model callback aliases, SelectTreeMate, fallback creators and SelectFilter callback types.
SelectSize and SelectInst are adapted to CSS/native controls. The reference preserves each
original render inline identity even where source group-render types differ from the public
table. No rich P5 module is shipped by this commit.

## Acceptance

Obtained locally with server 4188 and a dedicated Select tab on 2026-09-09.
No all-browser/AT or P5 parity is claimed.

- **164 targeted tests passed**: 40 Select, 52 Input, 45 Checkbox and 27 native regressions,
  using `pnpm test -- tests\select.test.ts tests\input.test.ts tests\checkbox.test.ts
  tests\native.test.ts`. Cases include strict single/multiple keys, placeholder/null,
  native defaults/reset, owner identity, clear/guards/cancellation, literal filtering,
  pinned selection, composition, author visibility, external forms, dynamic options/mode,
  empty controls and disposal.
- **jsdom limitation:** a native-only probe, without this helper, includes disabled
  selected options and disabled-optgroup selections in FormData. Unit tests compare that
  native baseline when testing preservation; production code does **not** patch FormData
  or change selected/disabled properties to satisfy jsdom. Actual omission was tested in
  Chromium, including the no-JS demo.
- Chromium **151.0.7922.174** exercised native ArrowDown/typeahead, multiple Ctrl-click,
  identity, required and placeholder/no-selection distinction, clear input/change/clear
  sequence and focus, disabled/optgroup/fieldset/native FormData, readonly-like clear
  guards, changed defaultSelected/reset/cancellation, external form IDs, option insertion,
  explicit mode rebind, disposal and visibility/focus recovery.
- Literal filter typing and CDP composition preserved current query drafts and selected
  option values. Initial selected state was `["html","server","legacy"]` while native
  submitted tools were only `["html"]`; filtering for CSS retained both sets exactly,
  kept selected nonmatches visible and preserved the author-hidden archive.
- Trusted `showPicker()` from the demo button succeeded, Escape closed the native picker,
  and a disabled-control request reported `InvalidStateError` in visible text. No hide API
  or open-state mirror was added.
- RTL at 360px and 200% **CSS zoom** had no horizontal overflow. Forced colors retained
  native appearance/boundaries; reduced-motion context and print/native-control presence
  passed. This is not browser-UI zoom or native popup pixel parity.
- JS-disabled Chromium verified hidden enhancement controls, native keyboard/reset and
  real local GET submission omitting disabled selected options/groups and the externally
  associated control. Standalone ESM, cross-format duplicate-owner rejection and both
  legacy loading orders preserved native state/defaults.

Review tightened native placeholder/list constraints, independent search-region ownership,
clear accessibility and cancelled/other-form composition reset handling. `pnpm build`
passed TypeScript and all existing/new budgets. No dependencies or prior helper/legacy
sources changed.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-select.js` | 8,913 | 3,440 | 4,000 |
| `markup-ui-select.global.js` | 9,073 | 3,515 | 4,000 |
| `markup-ui-select.css` | 2,615 | 780 | 1,000 |

CSS-only native Select needs **780 gzip bytes**, no JS. One helper format plus CSS costs
**4,220 ESM / 4,295 classic gzip bytes**. All **133 previous top-level JS/CSS outputs**
are SHA-256 byte-identical. Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**
under unchanged **15,000/3,000/4,000** ceilings.

All **79 original identities** remain with 19 source supplements: **98 rows = 35 adapted
targets + 63 omissions**, with zero inherited Select rows. Catalog totals are **3,529 rows
and 232/384 accepted tasks across 58 pages**. Edited local links pass. P4/P5 remain incomplete.
**Next Input Number**, then Slider/Rate/native controls before Form enhancements.
