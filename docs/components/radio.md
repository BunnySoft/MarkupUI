# Radio, RadioGroup and RadioButton: native exclusivity

**🟢 Verified for the retained native scope, not Vue API parity.**
Individual Radio and button-like RadioButton are CSS-only labelled native radios.
An optional group helper validates the **actual native group**, provides silent string
selection operations and observes accepted native changes. It is not a second selection
engine. Legacy `MuiRadio`/`MuiRadioGroup` in `src/components/forms.ts` remain unchanged.

## Loading and anatomy

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/radio/style.css` | External `dist/markup-ui-radio.css`; standalone Radio/RadioButton need no JS |
| `@dataengine/markup-ui/radio` | ESM `createRadioGroup`, controller/state/change types |
| `dist/markup-ui-radio.js` | Self-contained optional ESM |
| `dist/markup-ui-radio.global.js` | Classic `MarkupUIRadio.createRadioGroup`; rejects namespace replacement |
| [Native demo](../../demo/components/radio.html) | Separate HTML/CSS/JS; local form submission and GET fallback |
| [Pinned dispositions](../naive-ui/components/radio.md) | Every original grouped owner/property/inline identity, plus explicit source supplements |

```html
<fieldset class="mui-radio-group" data-radio-group id="shipping">
  <legend>Shipping</legend>
  <div class="mui-radio-group__items">
    <label class="mui-radio">
      <input data-radio type="radio" name="shipping" value="standard" checked required>
      <span>Standard</span>
    </label>
    <label class="mui-radio">
      <input data-radio type="radio" name="shipping" value="express">
      <span>Express</span>
    </label>
  </div>
</fieldset>
```

After loading one helper format and CSS, use an external setup script:

```js
const shipping = MarkupUIRadio.createRadioGroup(document.querySelector("#shipping"))
shipping.setValue("express") // Silent; browser unchecks the native peer.
shipping.setValue(null)      // Silent clear, even if native required becomes invalid.
shipping.refresh()          // Explicit member/key/scope reconciliation.
```

ESM callers import `createRadioGroup`. It accepts only the authored root, not a framework
props/options object. There is no `createRadio`, `createRadioButton` or registration
function. No `mui-*` registration-order rule applies. One nonenumerable owner symbol on
the root and each member guards duplicate owners across ESM/classic copies.

An enhanced group is a connected light-DOM
`fieldset.mui-radio-group[data-radio-group]` with a nonempty **first direct legend**,
no replacement role and no wrapper tabindex. Members are original
`input[type=radio][data-radio]` controls with real native labels, one common nonempty
native `name`, one actual form owner, and explicit nonempty unique string `value`s.
Use wrapping labels or `for`; do not add unrelated interactive content inside labels.
The styles use `label > input + span`. Original controls, content, listeners, ARIA, names,
form attributes, hidden state and defaults are never rendered over or replaced.

## Native group boundaries are not component boundaries

Native radio grouping depends on **name + actual form owner + tree**, not a fieldset/div.
The helper therefore requires the marked members to be the complete native group:

- Same name and same `.form` in the light-DOM document means native peers, including
  unmarked, disabled or hidden radios **outside** the visual fieldset. Such a conflict
  rejects enhancement/explicit operations; the helper never silently renames controls.
- Same name with a **different actual form owner** is a different group and is allowed.
  All enhanced members may use the same external `form=` target, even inside another
  form. Targets must resolve. Mixed owners or unresolved explicit targets are errors.
  Setting `form=` on a fieldset does not forward it to inputs.
- No-form groups are allowed, with `.form === null`; other no-form same-name document
  radios are peers. A different shadow tree is not part of that native group. Enhancing
  a root *inside* a shadow tree is outside this light-DOM contract.
- Nested marked groups are excluded from one another's membership **only if their native
  names/form owners also differ**. A nested same-name/same-owner group still conflicts.
  Native outer fieldset disabling retains its usual effect on nested controls.
- Templates are not live radio members/peers until the application inserts their content.
  An empty group has `{ value: null, name: null, form: null }`; no name/value is invented.

Structural changes can make previously valid markup conflict. A document-tree
MutationObserver watches structural/name/form/type/ID changes because native peers can
appear anywhere; a local observation covers member keys/defaults/disabled/markers.
This is event-driven validation, not polling or a document-wide selection manager.
Each validation inspects native inputs in that tree; this is not a virtualized large-option
renderer. Changes in unrelated shadow trees are outside that tree boundary.

Explicit `refresh`, state reads and setters reject invalid keys/anatomy/scope. Automatic
errors populate `error` and emit a nonbubbling `mui:radio-group-error` with `{ message }`
when the message changes. The last valid ownership is held until reconciliation/disposal;
fixing the DOM and refreshing clears the error.

**Native behavior continues during a dynamic conflict.** The helper does not intercept
clicks or keys to manufacture isolation. A newly inserted checked outside peer may already
have unchecked an inside radio through the browser. No compensating write reverses that
native effect. Changes received with invalid group scope do not emit aggregate notifications, and setters throw
before changing checkedness. Remove/fix the peer to recover; no replacement selection is
auto-chosen. Structural errors are not automatic form validation or a submission firewall.

## Values, defaults, required and native events

| API / property | Exact behavior |
| --- | --- |
| Native `checked`, `defaultChecked` | Independent boolean current/reset state; HTML checked establishes a default |
| Native `value`, `name`, `form` | String submission value and browser grouping/association; no number/boolean model tokens |
| `state` | Fresh `{ value: string|null, name: string|null, form: HTMLFormElement|null }` from native controls |
| `connected`, `error` | Lifetime and latest automatic/refresh error message, or null |
| `setValue(existingString)` | Silently assigns only that original radio's checked property when necessary; **browser** unchecks peers |
| `setValue(null)` | Silently clears checked members; does not change defaults, required or disabled |
| `refresh()` | Validate/adopt/release authored members; no selection normalization, event or DOM rendering |
| `disconnect()` | Idempotent observer/listener/task/owner cleanup; no rollback of edited checked/default/value/name/ARIA |

Unknown, empty, numeric, boolean and undefined setter keys throw; unknown values are
not interpreted as clear. Author `value="1"`/`value="false"` if those exact native strings
are desired. Default native `"on"` remains available for unenhanced radios, but enhanced
members require explicit unique values (an explicit `value="on"` is fine).

Native `.checked` property writes emit no input/change and are not MutationObserver-
observable. Here there is **no helper-derived visual state**: native checks and CSS update
immediately, and `state` reads the live selection. Use refresh for explicit structural/key/
name/form reconciliation. Radio `.value` reflects its attribute, unlike text Input's
ordinary current `.value`. No prototype interception or custom checked property exists.

`defaultChecked` changes follow native dirty-state rules; the helper never rewrites defaults
or assigns every checked property on input/change. If HTML contains several checked
defaults, native reset/order semantics decide the selected radio; the defaults are not
normalized into a separate group model. A document capture reset listener refreshes after
the native default action in a task. Cancelled resets remain cancelled, and current `.form`
is reread so external associations and changed IDs work. Reset, refresh, setters and
removal produce no fabricated user change; removing selection does not auto-pick a peer.

Native radios own Arrow keys, Space, Tab, labels, pointer activation, focus, repeated-click
behavior, disabled/fieldset/first-legend behavior and constraint validation. There are
**no keydown/keyup/click handlers**, roving tabindex, role-radio proxies, focus redirection,
synthetic clicks, hidden proxy values or duplicate aria-checked in the helper.

- A repeated click/Space on the already checked radio does not toggle it off or emit a
  second selection notification. Unchecking the former peer through exclusivity does
  **not** emit a fabricated `change(false)` on that former radio.
- A real accepted selected member's bubbling native `change` yields one next-task,
  **nonbubbling** `mui:radio-group-change` on its root, with `{ value: string }` captured
  at that change. Original input/change events remain untouched. Author cancellation
  and native rollback happen entirely in the browser, without custom restoration.
- A manually dispatched bubbling change on a checked member is an explicit notification
  request, not silent assignment. Stopping its propagation prevents group observation.
  Disconnect cancels pending custom notifications. A subsequent silent write does not
  rewrite an already accepted event snapshot.
- `required` on a radio invokes **native radio-group** validity: one checked peer in the
  same native group satisfies it, unlike putting required on every checkbox. Use native
  input validity or `form.checkValidity()`/submission. The helper does not add required,
  custom validity, aria-invalid, automatic live errors or a schema validator.
- Disabled selected radios remain the selection returned by `state` but are excluded
  from native FormData. Programmatic checked writes are still allowed on disabled fields.
  Unchecked radios are absent, and a checked hidden authored option is still a real
  successful native value. Selection is not synonymous with successful submission.

Radio has no native readonly behavior; native disabled is the durable disabling mechanism.
The helper does not turn authored aria-disabled into a new interaction engine.

## RadioButton and CSS

Use the **same native radio** inside `.mui-radio-button` rather than an HTML button:

```html
<div class="mui-radio-group__buttons">
  <label class="mui-radio-button">
    <input data-radio type="radio" name="layout" value="grid" checked>
    <span>Grid</span>
  </label>
  <label class="mui-radio-button">
    <input data-radio type="radio" name="layout" value="list">
    <span>List</span>
  </label>
</div>
```

The labelled choices have button-like borders/padding and wrap as segments, but the
**native radio circle stays visible and focusable**. There is no display:none,
appearance:none or offscreen replacement. Baseline `input:checked + span` text treatment
and native focus outlines work without `:has()`. Optional `:has()` enhances the selected
label background/border/focus; losing those rules does not remove the radio or its state.
No source VNode child classifier, generated splitter or border-priority algorithm exists.

`data-size="small|medium|large"` on labels or group provides explicit inherited size,
including a medium override inside small/large groups. Optional group
`data-status="warning|error"` styles a border only; author any explanatory text and
semantics separately. Logical spacing/wrapping supports RTL, with native arrow policy
left to the browser. Forced colors retain native rendering; print retains real radios.
No animations are introduced, so reduced motion requires no runtime.

Tokens: `--mui-radio-color`, `-font`, `-size`, `-accent`, `-focus`, `-disabled`, `-border`,
`-background`, `-active`, `-pad` (all share the `--mui-radio` prefix).
There is no global control reset, theme provider, injected style or CSS-in-JS.

## Complete upstream disposition

| Upstream owner/item | Retained adaptation or explicit omission |
| --- | --- |
| Radio/RadioButton `checked`, `default-checked`, `disabled` | Native boolean properties/defaults/disabled fieldsets; no framework controlled state |
| Radio/RadioButton `label`, `name`, `value` | Real label and authored native name/string value; no label-prop/slot precedence or typed payload conversion |
| Radio/RadioButton `size` | Three external CSS sizes |
| Radio/RadioButton `on-update:checked`, source `onUpdateChecked` | Native selected-input change; read boolean checked, no extra false callback on unselected peer |
| RadioGroup `disabled`, `name` | Native fieldset disabled and explicit common names on members; names never forwarded/renamed |
| RadioGroup `default-value`, `value` | Per-member defaultChecked and live selected string/null; silent strict setValue; number/boolean model tokens omitted |
| RadioGroup `size` | Explicit CSS inheritance, not Form/provider state |
| RadioGroup `on-update:value`, source `onUpdateValue` | Root group-change with a string snapshot |
| RadioGroup `options`, `label-field`, `value-field` | **Omitted** options renderer and arbitrary object field lookup |
| `options.label?`, `options.value`, `options.disabled?` | Authored label, explicit native string and disabled; not an accepted options-array API |
| Source Radio, RadioButton and RadioGroup `default` slots | Authored DOM content, not a slot renderer |
| Source Radio/RadioButton `checkedValue` | **Omitted** deprecated checked alias |
| Source Radio/RadioGroup `theme`, `themeOverrides`, `builtinThemeOverrides` | **Omitted** theme/provider/CSS-in-JS objects; RadioButton has no own source theme props |
| Source `RadioSize` | Three explicit CSS sizes |
| Source `RadioGroupOption`, optional `value?` and index signature | **Omitted** object renderer fields; actual helper keys must be explicit |
| Source `RadioGroupInjection`, `radioGroupInjectionKey`, `UseRadio`, `OnUpdateValue`, `OnUpdateValueImpl` | **Omitted** injected refs, private wrapper/Form hooks and typed model callback protocol |
| Source RadioGroup `mapSlot`/splitter generation | **Omitted** VNode classification and border priority; native labelled segmented CSS instead |

## Acceptance

Local evidence is obtained on 2026-09-09 using server 4188 and a dedicated Radio tab.
This is not all-engine/AT/native-theme pixel parity or framework compatibility.

- **165 targeted tests passed**: 41 Radio, 52 Input, 45 Checkbox and 27 native regressions,
  using `pnpm test -- tests\radio.test.ts tests\input.test.ts tests\checkbox.test.ts
  tests\native.test.ts`. Coverage includes names/keys/form/tree boundaries, outside and
  nested peers, duplicate owners, current/default/dirty state, empty/all-disabled groups,
  native events, dynamic values/ordering, reset/cancellation and disposal.
- **Test-environment limitation:** native-only probes reproduced jsdom's incorrect
  explicit-form radio grouping and missing previous-radio restoration after a cancelled
  click, without importing this helper. Unit fixtures put the other-form example inside
  its actual form and compare cancellation against the unenhanced jsdom baseline.
  **Production code does not patch either behavior.** The original, unmodified demo's
  external placement and actual native rollback were verified in Chromium instead.
- Chromium **151.0.7922.174**: real native ArrowRight selection/focus/wrapping past hidden
  and disabled peers, Space/repeated checked clicks without extra events, native Tab
  group entry, label/pointer selection, required-group validity, original control identity,
  input/change plus one aggregate event and both label/input cancellation rollback.
- Browser form evidence: same-name groups with distinct actual owners stay independent;
  external reset and changed form IDs, changed defaults/cancelled reset, native fieldset
  disabling/first legend, FormData, selected-member removal and late template clones.
  Outside-peer conflicts were explicitly reported while native exclusivity and the real
  submitted outside value remained intact; invalid setters did not overwrite that peer.
- Segmented inputs stayed visible/native, with focus outlines. Explicit medium overrides
  inherited small (18px versus 16px boxes). Removing optional `:has()` rules in Chromium
  preserved visible circles and checked text; this simulates the CSS fallback, not another
  engine certification. RTL at 360px and 200% **CSS zoom** had no horizontal overflow.
  Forced colors/reduced-motion context and print/native-radio presence passed.
- A separate JS-disabled context exercised native arrows, independent external form
  ownership, segmented labels, reset and real local GET submission with one plan value.
  Standalone ESM, cross-format duplicate-owner rejection, both legacy loading orders and
  Input/Checkbox/Radio helper composition in one native form also passed.

`pnpm build` passed TypeScript and every existing/new budget. No dependencies were changed
or installed. Legacy forms.ts and Input/Checkbox/shared sources were not modified.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-radio.js` | 4,143 | 1,751 | 3,000 |
| `markup-ui-radio.global.js` | 4,300 | 1,819 | 3,000 |
| `markup-ui-radio.css` | 3,454 | 958 | 1,250 |

Individual Radio/RadioButton cost **958 gzip bytes CSS, no JS**. Enhanced groups load one
format plus CSS: **2,709 ESM / 2,777 classic gzip bytes**. All **127 previous top-level
JS/CSS assets are SHA-256 byte-identical**. Core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes**, with unchanged **15,000/3,000/4,000** ceilings.

All **20 original Radio identities** remain, plus 14 explicit source supplements:
**34 rows (23 adapted, 11 omitted)**. Catalog totals are **3,502 rows and 224/384 accepted
tasks across 56 pages**; local edited-document links pass. P4 remains In progress.
**Next Switch**, then Select/native controls before Form enhancements.
