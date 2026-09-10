# Form, FormItem and FormItemGi

**🟢 Verified retained native scope:** optional `createForm`, explicit item/field/feedback mappings,
native Constraint Validation, small abortable custom checks and external item/grid CSS.
No custom element, provider, model store, schema language, network request or implicit submit
handler. Legacy `src/components/forms.ts`, aggregate registration and its synchronous API
remain unchanged; this module does not silently upgrade `mui-form`.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/form` | ESM `createForm` and exported `Form*` types from `src/components/form/index.ts` |
| `dist/markup-ui-form.js` | Independent optional ESM |
| `dist/markup-ui-form.global.js` | Classic `MarkupUIForm.createForm`; refuses namespace replacement |
| `@dataengine/markup-ui/form/style.css` | External `dist/markup-ui-form.css` |
| [Demo](../../demo/components/form.html) | Separate HTML/CSS/JS; local checks only; ordinary GET/reset fallback |
| [Reference dispositions](../naive-ui/components/form.md) | Original Form, item, inherited, slot, method and inline identities plus explicit source supplements |

```html
<form class="mui-form" id="account" action="/account" method="post">
  <div class="mui-form-item" id="email-item">
    <label class="mui-form-item__label" for="email">Email (required)</label>
    <div class="mui-form-item__content">
      <input id="email" name="contact[email]" type="email" required
             aria-describedby="email-help">
    </div>
    <p id="email-help">Use your contact address.</p>
    <p class="mui-form-item__feedback" id="email-error" hidden></p>
  </div>
  <button name="intent" value="save">Save</button>
  <button type="reset">Reset</button>
</form>
```

```js
const coordinator = MarkupUIForm.createForm(document.querySelector("#account"), {
  items: [{
    key: "contact[email]",
    controls: [document.querySelector("#email")],
    element: document.querySelector("#email-item"),
    feedback: document.querySelector("#email-error")
  }]
})
```

Keep native `label/for`, meaningful fieldset legends, required attributes, input types,
names, values and author-selected headings. A required mark is optional decorative
`<span class="mui-form-item__required" aria-hidden="true">*</span>` beside real label text;
it never installs a constraint. Native `fieldset disabled`, including the first-legend
exception, is the form-wide disabling primitive. A `disabled` attribute on `form` does
nothing. Barred/disabled/readonly controls remain browser-owned.

**No fields, labels, options, hidden values or reset defaults are generated.** Repeated
names and literal dots/brackets/quotes are normal HTML names. Exact `key` strings select
items; they are not selectors, JavaScript paths or automatic name lookup. Map native
elements explicitly, including all intended radio/group members and external
`form="account"` controls. Radio exclusivity and required semantics remain native.
Whole-form validation includes eligible unmapped native controls (including button custom
validity); field validation includes only the mapped item. `FormData(form, submitter)`
owns successful-control filtering, repeated names, disabled values and submitter entries.

## Explicit API and lifetime

`createForm(form, { items, validateOnBlur?: boolean })` requires a connected light-DOM native
form. Each initialization-only item has:

| Field | Meaning |
| --- | --- |
| `key` | Unique nonempty **literal** string; independent of native name |
| `controls` | Nonempty copied array of original input/select/textarea elements associated with that form |
| `element?` | Distinct connected authored item/fieldset/grid-item box receiving leased `data-form-status` |
| `feedback?` | Distinct connected plain span/p/div with stable unique whitespace-free id; see ownership below |
| `validator?` | One side-effect-free synchronous or asynchronous callback, never a rule/schema object |

Mappings cannot share controls, item boxes or feedback nodes. A symbol on owned nodes
rejects duplicate Form binding across ESM/classic copies, but does not claim Input/Checkbox/
Radio/Rate ownership. Native helpers may coexist on the same controls. A feedback id change,
mapped field removal/reassociation, root removal or invalid mapping disconnects Form.
Recreate mappings after structural changes. Adding/removing **unmapped** native controls
invalidates outstanding work without inventing item mappings.

| Controller member | Contract |
| --- | --- |
| `form`, `connected` | Original native form and coordinator lifetime |
| `validate({ keys?, reason? }?)` | Promise of whole-form or exact-item validation; reason is `manual`, `blur` or `submit`, not a submission action |
| `validateField(key)` | `validate({ keys: [key] })`; no implicit nested-prefix matching |
| `restoreValidation()` | Cancel work and restore owned presentation for all items; never reset values/defaults or application custom validity |
| `refresh()` | Explicit invalidation after silent programmatic setters, native property writes or external data changes; checks fixed mappings |
| `reportValidity()` | **Synchronous native** form reporting only, no custom checks; may focus/show browser UI because the application explicitly requested it |
| `disconnect()` | Idempotent abort/listener/observer/task/owned-presentation cleanup; native state persists |

Calling validation/reporting after disconnection rejects/throws. Unknown options, malformed
mappings and unknown keys produce explicit errors; no successful fallback is fabricated.
`validateOnBlur` defaults to false; when true, leaving an item validates that item, but
moving between its mapped controls does not. Input/change and captured nonbubbling
`mui:rate-clear` invalidate **all** items, including cross-field errors, without validating
or announcing on every keystroke. Silent Input/Select/Radio/Rate setters require
`coordinator.refresh()` too; Form does not patch their setters or synthesize events.

## Native constraints and small custom checks

Native `required`, `min`, `max`, `step`, `pattern`, `type`, `minlength`, `maxlength`,
`willValidate`, `validity` and `validationMessage` are authoritative. Browser differences,
including length constraints after user edits versus scripted value writes, are not
reimplemented. Native failures on an item prevent its optional custom callback.

```js
const matching = ({ fields, controls, signal }) => {
  // Snapshots include all input/select/textarea in form.elements, even external members.
  const current = fields.find(field => field.control === controls[0])
  const reference = fields.find(field => field.name === "reference.email")
  return current.value === reference.value ? null : { message: "Addresses must match." }
}
```

`FormValidatorContext` contains `form`, `key`, copied/frozen `controls`, `fields`,
`signal: AbortSignal`, and `reason`. Every field snapshot contains original `control`,
literal `name`, string `value`, boolean `checked`, frozen selected `values`, frozen `files`
and native `eligible` (`willValidate`). These are **observations**, not a second writable
model. The original element/form references are intentionally live; callbacks must not
mutate them, focus, submit or do business side effects. Use existing application data through
a closure and call `refresh()` whenever that data changes.

Return exactly `null`, `{ message: nonemptyString }`, or
`{ message: nonemptyString, level: "error" | "warning" }`, directly or in a Promise.
There is no callback completion convention, boolean/error-array overload, message template
language, rule ordering/filter engine or VNode renderer. Warning results do not invalidate
the form and do not set `aria-invalid`. The first mapped `willValidate` control is the
explicit **feedback/result anchor**. If none is eligible, custom validation is skipped.
For a checkbox minimum, count eligible checked snapshots in one group callback: do not
make every checkbox required, and do not set validity on a barred fieldset.

### Deliberately separate custom checks from native custom validity

**Form never calls `setCustomValidity`, even for its own custom callback errors.** This is
a manual-validation coordinator, not an opt-in automatic submission plugin. Custom errors
make the returned result invalid and produce owned feedback; they do **not** block an
otherwise valid native submission unless the application explicitly awaits/gates it.
`reportValidity()` therefore does not report callback errors.

This boundary avoids poisoning the next submit before its submit handler can retry an
asynchronous check, and avoids guessing ownership of externally changed custom messages
while a barred control exposes an empty `validationMessage`. All preexisting, subsequently
changed, disabled/readonly or identical-text application `setCustomValidity` messages remain
untouched on revalidation, refresh, reset and disposal. Clear **application-owned** errors in
application code if retrying requires it; native reset does not clear custom validity.
Applications needing native blocking custom validity must implement a separately explicit
eligible-control policy; this helper does not claim that capability or hide it on a fieldset.

### Results, cancellation and errors

`FormValidationResult` is frozen and has:

- `status`: `"valid"`, `"invalid"` or `"aborted"`; abort is never success.
- `issues`: frozen records `{ key: string|null, control, message, source }`, where source
  is `"native"`, `"custom"` or `"warning"`. Unmapped whole-form issues have `key: null`.
- `current`: a live freshness check. Read it **immediately** before using a result.

One latest validation run per coordinator is supported. Starting another run cancels the
previous run, even for a different item. Presentation commits atomically after all selected
checks settle. Whole-form snapshots cover field identity, values, files, selected options,
checked state, names/association, eligibility, constraints, external custom messages and
submitter/native validation attributes. Any form input/change/Rate clear, accepted reset,
refresh, removal or disposal cancels stale work. Snapshots also guard silent changes before
completion and when reading `result.current`; they cannot observe a silent write-and-revert
between snapshots—call `refresh()` for every relevant programmatic transaction.

Signal cancellation races the callback promise, so a callback ignoring AbortSignal cannot
hold the public validation promise pending forever **after cancellation**. There is no
timeout for an otherwise pending callback; applications can impose one inside their callback.
Expected aborted `DOMException("…", "AbortError")` is not success. Unexpected throws,
rejections (including uncancelled AbortError) and malformed results reject the public
validation promise and dispatch nonbubbling `mui:form-error` with `{ key, error }`. Unexpected
late rejections after abort/disposal still emit that error event; they cannot update feedback.
Listen on the original form and handle the public rejection. Blur-triggered validation has
no caller promise, so its already-reported callback failure is consumed by the event path.

## Feedback, touched state and accessibility ownership

Feedback is opt-in. A mapped feedback surface must be plain, noninteractive text, not a
label/button/link descendant; author a unique stable id and optional `hidden`.
It cannot have role/aria-live/tabindex or rich child markup. Messages are written with
`textContent`, not HTML. Persistent help/count nodes remain **separate**.

Validation or native invalid events present errors; untouched fields receive no error
attributes. Input/change clears presentation rather than announcing success on every edit.
The optional item box receives `pending`, `error`, `warning` or `success`. No spinner, live
“checking” message or `aria-busy` is automatically injected.

Form appends only its own feedback-id token to each eligible mapped control's
`aria-describedby`, preserving Input count/help and other tokens. Teardown removes only
the token it added; preexisting feedback tokens persist. `aria-invalid`, item status,
feedback hidden state and text use conditional leases: externally replaced values survive
restoration. As with DOM token ownership generally, an external writer reasserting an
identical owned token/value is indistinguishable; use independent ids/tokens and do not
co-own the same attribute value. Input/Form teardown works in either order.

There are **no per-field alert/live regions** and no default focus movement. The demo uses
one application-authored polite status summary for explicit validation/submit outcomes.
Native interactive validation can focus/show its own popup and expose inline feedback via
captured invalid events; the helper never cancels those events or forces duplicate native
reporting. This is an error association strategy, not a promise of universal screen-reader
speech. Author accessible labels and an appropriate summary/navigation policy for the form.

## Submission and reset are application/browser boundaries

The library installs **no submit listener**. It does not fetch, call `form.submit()`,
toggle `noValidate`, resume via `requestSubmit()`, generate hidden values or invoke business
callbacks. Native invalid controls can block submission **before** `submit` fires; capture
of native `invalid` provides feedback without bypassing this timing. No-JS native constraints
and normal server submission remain usable. Never assume optional client checks replace
server validation.

An application can own the single submit listener and make its own local/business decision:

```js
let intent = 0
form.addEventListener("submit", async event => {
  event.preventDefault() // This application, not Form, owns enhanced submission.
  const ticket = ++intent
  const submitter = event.submitter
  coordinator.restoreValidation() // Also cancels an older in-flight intent.
  if (form.noValidate || submitter?.formNoValidate) {
    inspectLocally(new FormData(form, submitter)) // Explicit application skip policy.
    return
  }
  try {
    const result = await coordinator.validate({ reason: "submit" })
    if (ticket !== intent || result.status !== "valid" || !result.current) return
    if (submitter && (!submitter.isConnected || submitter.form !== form || submitter.matches(":disabled"))) return
    inspectLocally(new FormData(form, submitter)) // One application action; no resubmission.
  } catch (error) {
    // Render/report this unexpected validation failure; do not submit.
  }
})
```

`inspectLocally` is application code, not a library export. The demo only displays native
entries. This recipe does not reproduce browser navigation, image-submit coordinates,
submitter action/method/enctype overrides or server transport. Native submission still owns
those when not prevented. A `formNoValidate`/`noValidate` bypass is deliberate application
policy, not a silent library mode; manual `validate()` still validates regardless of either.
Rapid submit attempts produce only the current run's action. No pending result steals
outside/modal focus or submits newly edited data. Application code must remove its own
submit listener when reverting to native fallback; the demo does so on disconnect.

On reset, pending checks are conservatively aborted immediately, even if reset will later
be cancelled. After the browser default action, an uncancelled reset restores only owned
feedback; actual values/defaults/external form-associated controls reset natively.
A cancelled reset preserves values and **settled** feedback; pending checking state is
cancelled rather than revived. Deferred reset cleanup is generation-guarded: a newer
validation started immediately after native reset is not cancelled or erased by the old
reset task. Form never calls `reset()` itself.

## FormItem and FormItemGi presentation

FormItem is authored `.mui-form-item` markup plus an optional item mapping, not a provider
consumer or mandatory controller. Use `validateField(key)` for item-level checks and
`restoreValidation()` for shared invalidation. Item-specific restore, measured-label
invalidation and deprecated positional method overloads are omitted.

`.mui-form` defaults to stacked grid layout with no invented gap between items.
`data-inline` uses wrapping flex with the pinned 18px item separation.
`data-size="small|medium|large"` selects Form-owned label, blank and feedback metrics;
missing or unknown values use medium. It does not resize native fields or composed controls.
`data-label-placement="left"` enables native two-column label/content layout at 40rem and
above for non-fieldset items; below that it stacks. The default width is 10rem. Top labels
align to logical start, while left labels align to logical end like the pinned source.
`--mui-form-label-width`, `--mui-form-label-align` and `--mui-form-gap` remain inherited,
author-owned overrides; the package never assigns them. External CSS may choose native
lengths/max-content, alignment, mark placement or visually hidden labels with a preserved
accessible name. There is no global width measurement, automatic source
`label-width="auto"` synchronization, or physical-LTR placement algorithm.

Pinned label heights are 24/26/28px for small/medium/large, with top-label type
13/14/14px, left-label type 14/14/15px, weight 400 and source padding. Feedback reserves
24/24/26px for a mapped hidden surface on non-fieldset items, then uses the same total
height when populated. Native fieldset feedback expands naturally rather than adding
package padding to the fieldset. Label, neutral feedback, required/error and warning paint
uses the pinned light/dark roles. Public `--mui-form-label-color`,
`--mui-form-feedback-color`, `--mui-form-feedback-height`, `--mui-form-required-color`,
`--mui-form-error-color` and `--mui-form-warning-color` remain authoritative.

`.mui-form-item__content` preserves authored flow. Its blank-height default excludes a
composed `.mui-input`, so Form cannot enlarge an independently sized Input root; Form also
never styles descendant input/select/textarea controls. Hidden content stays hidden,
forced colors use CanvasText and print selects the light color scheme. There is no
animation or transition.

FormItemGi is explicit grid composition: `.mui-form-grid` has two minmax tracks and stacks
below 40rem; `.mui-form-item-gi` accepts native `--mui-form-span` or
`data-form-span="full"`. The existing [Grid](grid.md) classes/tokens can instead be composed
with `.mui-form-item` and their separate CSS. Native span is retained; relative offset
packing and overflow-aware suffix behavior are omitted. No mandatory Grid renderer,
hidden-provider inheritance or form-item measurement observer is added. Label/control DOM
order is never reversed in RTL. CSS has no motion engine, and forced colors retain text.

## Reference review and deliberate reductions

Pinned Naive UI **2.45.3**, commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:

- [Public Form API and demos](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md)
- [Form provider, path filtering and submit default](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/Form.tsx)
- [FormItem native model-path lookup, Schema validation and label sizing](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/FormItem.tsx)
- [FormItemGi wrapper/forwarded methods](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/FormItemGridItem.ts)
- [Interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts), [public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/public-types.ts), [exports and aliases](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/index.ts)

### Complete property/companion disposition summary

These are native **adaptations**, not same-name JavaScript props. The linked reference
preserves every original owner/source/kind identity, including inherited repetitions.

| Owner / source names | Retained native mapping or explicit omission |
| --- | --- |
| Form `disabled` | Actual fieldset disabled; never a fake form disabled flag |
| Form `inline`, `size` | Wrapping flex and small/medium/large external CSS |
| Form `label-width`, `label-align`, `label-placement` | Native width/logical alignment/responsive layout; measured auto-label graph omitted |
| Form `show-feedback`, `show-label` | Optional feedback mapping and authored label visibility with preserved native accessible name |
| Form `show-require-mark`, `require-mark-placement` | Optional decorative mark, authored order/external CSS |
| Form `model`, `rules`, `validate-messages` | **Omitted** object store, recursive rule schema and external message schema; native properties/FormData/constraints and explicit callbacks instead |
| Rule `validator`, `asyncValidator`, `message`, `level` | One callback returning null or plain error/warning result, optionally a Promise; upstream callback/boolean/Error-array completion shapes omitted |
| Rule `required` | Native required constraint |
| Rule `key`, `trigger`, `renderMessage` | **Omitted** per-rule keys/trigger filtering/VNode messages; item keys and optional blur are not a rule engine |
| FormItem and inherited Gi `content-class`, `content-style`, `feedback-class`, `feedback-style`, `label-style` | Original authored elements and external CSS; no style-object forwarding |
| FormItem and inherited Gi `feedback`, `validation-status` | Leased plain feedback and item status presentation; no authoritative override of native constraints |
| FormItem and inherited Gi `label`, `label-props`, `label-width`, `label-align`, `label-placement` | Native label/legend/attributes and external responsive CSS; no generated label/proxy/provider |
| FormItem and inherited Gi `path` | Exact literal item key with explicit native control references; no object-path mutation |
| FormItem and inherited Gi `required`, `show-require-mark`, `require-mark-placement` | Decorative mark only; constraint is separate on actual input |
| FormItem and inherited Gi `show-feedback`, `show-label`, `size` | Optional feedback mapping, author-controlled label visibility, external item/form CSS |
| FormItem and inherited Gi `first`, `ignore-path-change`, `rule`, `rule-path` | **Omitted** first-rule mode, stale-path retention, merged rules and lookup paths |
| Gi inherited GridItem `span` | Native grid span/full span or existing Grid CSS composition |
| Gi inherited GridItem `offset`, `suffix` | **Omitted** relative-offset and overflow-aware suffix packing |
| Form `validate`, `restoreValidation` | Explicit asynchronous result and shared owned-feedback invalidation |
| Item/Gi `validate` | Coordinator `validateField(key)` instead of a mandatory item instance |
| Item/Gi `restoreValidation`; all `invalidateLabelWidth` | **Omitted** separate item restore/measurement APIs; shared restoration and native CSS instead |
| Form default slot; Item/Gi default/label/feedback slots | Original authored DOM; feedback is a plain mapped node, not a VNode renderer |
| Validate inline `paths`, `warnings` | Exact keys selection and warning issues; callback warning records/options/rule predicates/legacy overloads omitted |
| Source `onSubmit`, aliases, size/status/alignment types | Native event ownership and documented companion/CSS adaptations; no framework constructor/type alias claims |
| External rule/option/message types, provider/internal channels, deprecated Col/Row and framework prop/slot/callback type shapes | **Omitted**, individually identified in the reference supplements rather than imported as a dependency |

The source uses async-validator Schema, lodash object-path lookup, rule-level filtering,
VNode messages, injection and label measurements. Those are **not ported**. The inventory
disposes every original property/method/slot/inline/inherited identity separately, including
the erroneous historical `validate.boolean` inline row (not a target boolean return) and
the documented but unforwarded FormItemGi `invalidateLabelWidth`. Source-only declarations
are labelled supplements, not newly invented public table rows.

## Four-step acceptance

1. [x] Native form/field/label/fieldset anatomy and existing-control integration implemented.
2. [x] Explicit item/feedback ownership and native FormItemGi grid composition implemented.
3. [x] Bounded callback/result API, native validity, all-field generations/snapshots and cleanup verified.
4. [x] Targeted/build/browser/review and catalog reconciliation recorded below.

### Evidence

**2026-09-09, Windows, existing Vitest/jsdom and Chromium, dedicated Form demo tab on
`http://localhost:4188/demo/components/form.html`.** Other tabs were not altered.

- **378 targeted tests passed across nine files**, including **53 Form tests**, Input 52,
  Checkbox 45, Radio 41, Switch 39, Select 40, Input Number 37, Slider 37 and Rate 34.
  Command: `pnpm exec vitest run tests\form.test.ts tests\input.test.ts tests\checkbox.test.ts
  tests\radio.test.ts tests\switch.test.ts tests\select.test.ts tests\input-number.test.ts
  tests\slider.test.ts tests\rate.test.ts`.
- `pnpm build` passed TypeScript declarations, independent ESM/classic/CSS packaging and
  all existing budget gates. No dependency or legacy/core/native-control source changed.
- A read-only reviewer reproduced missing **unmapped Rate-clear** cancellation and stale
  **deferred-reset cleanup** cancelling newer checks. Both were corrected and covered:
  internal/external Rate without readout, unchanged reset values, pending and already
  completed post-reset validations. Chromium also verified the external/no-readout case
  returned aborted and immediate post-reset validation remained un-aborted.
- Chromium native constraints blocked submit **before any submit event**, focused the
  actual invalid input, and populated feedback. Explicit reportValidity focused the native
  invalid field; user typing exercised `minlength` and stopped at maxlength 32.
- Local async reserved-name failure preserved native validity and retried successfully.
  Rapid double-save produced **one** inspected latest submission. Submitter `intent=save`,
  external literal `notes[0].text`, checked topics and readonly reference were included;
  disabled fields were excluded. Draft `formNoValidate` explicitly skipped native/custom
  checks and preserved `intent=draft`.
- Reset/cancel preserved native values/defaults and field identity; cross-field edits
  aborted stale checks. Native required radio groups included externally associated peers;
  disabled fieldset eligibility respected the first-legend exception. External custom
  messages changed while disabled survived re-enable/disconnect untouched.
- Unexpected Promise rejection rejected the caller and emitted exactly one local
  `mui:form-error`; completion did not steal outside input focus or focus inside an open
  native modal dialog. Unit tests cover expected abort, late rejection and teardown order.
- At **1280px and 375px**, LTR/RTL layouts had no horizontal overflow; grid columns changed
  from two 456px tracks to one 328px track. **200% CSS zoom** had no page overflow. Forced
  colors, dark scheme and reduced-motion emulation matched; native fields remained visible.
  This is CSS zoom/media inspection, not an OS magnifier or screen-reader certification.
- A separate **JavaScript-disabled** Chromium context verified invalid native GET blocking,
  native reset and valid GET submission with `profile.name=Ada`, submitter `intent=save`,
  external note and no disabled entry. It was closed after acceptance.
- ESM and classic helper exports coexisted with Input and the legacy aggregate registration;
  no page errors/warnings or nonstatic requests were observed in the final demo checks.

| Built asset | Raw bytes | Gzip bytes (build level 9) | Ceiling |
| --- | ---: | ---: | ---: |
| Form ESM | 9,542 | 3,733 | 5,000 |
| Form classic | 9,696 | 3,804 | 5,000 |
| Form external CSS | 2,360 | 701 | 1,250 |
| Core minified | 62,558 | 14,611 | 15,000, unchanged |
| Advanced plugin | 6,554 | 2,181 | 3,000, unchanged |
| Widgets plugin | 10,858 | 2,779 | 4,000, unchanged |

All **143 prior top-level JS/CSS assets** were independently rebuilt in memory using the
pre-Form HEAD build recipe and compared byte-for-byte with current output; all matched.
Earlier component records retain their historical measurement counts. No prior optional
budget was relaxed.

### Default-style follow-up

**2026-09-11:** the [Form default-style audit](../style-audit/components/form.md)
source-reviewed pinned label/feedback constants and corrected only Form-owned CSS.
The existing Form fixture now has five stylesheet-contract checks; all **58 Form tests**
pass individually. Current source CSS is **4,656 raw / 1,199 gzip bytes** against the
unchanged **1,250-byte** ceiling. Form JavaScript, native label/fieldset behavior, Input
ownership, the demo, shared files and generated assets are unchanged. An isolated Chromium
152 computed-style fixture confirmed a 26px/14px medium label, stable 84px item height
before/after feedback, independently sized 28px small Input, dark roles, forced-color text
and light print scheme. The earlier table above remains the historical initial Form
acceptance measurement.

Inventory audit: **93 original identities exactly preserved in order + 18 explicit source
supplements = 111 Form rows (68 adapted, 43 omitted)**. All **96** reference documents now
contain **3,572 tracker rows**, **248/384 accepted tasks across 62 pages**, 136 unchecked.
P4 has 886 rows, with **eight Planned routes / 406 unresolved rows** remaining.
**386 relative file links** in the four scoped Form/index/master documents and diff whitespace
were checked. **Next: Auto Complete**; P0/full P4/P5/P6 and external-schema parity are not
claimed. No Safari/Firefox or assistive-technology speech acceptance was performed, no
server transport is implemented, and jsdom native limitations were not patched into production.
