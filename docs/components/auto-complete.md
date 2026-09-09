# Auto Complete: native datalist with optional bounded loading

**🟢 Verified retained native scope.** Original input/datalist, free text, native defaults,
forms and browser-owned suggestions; an optional small controller coordinates typed local/
application-supplied loaders. No custom combobox, popup renderer, property polling, provider,
HTTP client or runtime dependency. Legacy `mui-autocomplete`/`forms.ts` remain unchanged.

## Native anatomy and loading

```html
<label for="city">City (required)</label>
<div class="mui-auto-complete__field">
  <input id="city" name="address.city" list="cities" value="London" required>
</div>
<datalist id="cities">
  <option value="London" label="United Kingdom"></option>
  <option value="Tokyo" label="Japan"></option>
</datalist>
<p class="mui-auto-complete__status" id="suggestion-status">Authored suggestions.</p>
```

`name` is literal, including dots/brackets/quotes. A datalist supplies **suggestions**, not
allowed values: a required input can contain any nonempty valid free text. Native type,
required/pattern/length constraints, autocomplete, paste, selection, name/form association,
defaultValue and reset remain authoritative. Labels/legends/headings are author-owned.
No hidden submitted values, option membership validator, value coercion or input replacement.

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/auto-complete` | ESM `createAutoComplete` and seven exported controller/loader/context/options/result/state/suggestion types |
| `dist/markup-ui-auto-complete.js` | Independent optional ESM; no Input/Form imports |
| `dist/markup-ui-auto-complete.global.js` | Classic `MarkupUIAutoComplete.createAutoComplete`; refuses namespace replacement |
| `@dataengine/markup-ui/auto-complete/style.css` | External `dist/markup-ui-auto-complete.css` |
| [Demo](../../demo/components/auto-complete.html) | Separate HTML/CSS/JS, authored fallback/shared lists, local simulated loads, native forms and Input/Form composition |
| [Reference dispositions](../naive-ui/components/auto-complete.md) | All 46 original identities and explicit source supplements |

Static authored datalists need **no helper**, and may be shared by multiple native inputs.
Unsupported native suggestion UI falls back to normal text entry, not a picker polyfill.
The optional controller is a datalist **writer** and therefore requires exactly one connected
light-DOM input consumer and a unique, stable whitespace-free datalist id.

```js
const suggestions = MarkupUIAutoComplete.createAutoComplete(city, {
  maxResults: 20,
  minLength: 1,
  debounce: 150,
  status: document.querySelector("#suggestion-status"),
  load: (query, { signal }) => localChoices
    .filter(choice => choice.value.toLowerCase().includes(query.toLowerCase()))
})
```

The filter above is application code, not a library matching algorithm. Browser popup
matching may filter supplied results again and differs between browsers. No automatic query
runs at construction or focus: authored fallback remains until input or explicit `query()`.

## Controller and bounded result contracts

| Member/option | Contract |
| --- | --- |
| `input`, `list`, `connected` | Original native nodes and ownership lifetime |
| `load?` | Initialization-only `(query: string, { input, signal }) => suggestions or Promise<suggestions>` |
| `maxResults?` | Integer 1–100, default 20; oversize results reject, never truncate silently |
| `minLength?` | Integer 0–1000, default 1; JavaScript string length of complete native value |
| `debounce?` | Integer 0–1000ms, default 150; input-driven queries only |
| `status?` | Optional distinct connected plain span/p/div, noninteractive/nonlive and outside label/button/link/datalist |
| `query()` | Immediate Promise query, bypassing debounce; returns updated/skipped/aborted result |
| `setSuggestions(array)` | Explicit **silent** bounded option update; validates entire array before DOM mutation |
| `refresh()` | Cancel work and restore authored fallback/status after silent values, native attributes or relevant external application state change; no automatic requery |
| `disconnect()` | Idempotent cancellation, listener/observer/task cleanup and conditional original-node/status restoration |
| `state`, `error` | idle/waiting/loading/ready/empty/error and current unexpected error or null; not popup visibility |

Inputs may be text/search/email/url/tel. Password, number, custom role/expanded/controls/
active-descendant proxies and broken list associations are rejected rather than pretending
to be a native datalist. Ordinary authored accessibility references are not rewritten.
Unknown options and invalid bounds throw; methods on a disconnected owner throw/reject.

Suggestions are strings or explicit `{ value: string, label?: string, disabled?: boolean }`
records. Values are unique, nonempty and at most 2048 characters; optional labels are
strings up to 2048 characters, disabled is boolean. Sparse arrays, numeric values, nested
groups, extra record properties, invalid labels and oversized results fail atomically.
Whitespace is not trimmed or mapped to a model. The entire native input value is the query,
including email/multiple text; no token extraction or append-to-current-value engine.

Values, labels and disabled attributes are set through native option properties, never
HTML/VNodes. **An option label is display metadata; its native value remains the offered
input value**, unlike upstream paths that can write a separate label when selecting.
Disabled datalist options follow browser behavior, not a styled disabled-row promise.
The helper never inserts selectable “Loading”, “Empty” or “Error” pseudo-options.

`AutoCompleteQueryResult` is frozen: `{ status, query, count, current }`.
`status` is `"updated"`, `"skipped"` or `"aborted"`; `count` is the supplied count on success,
zero otherwise, not the number of popup matches. `current` is a live freshness check;
read it before acting on the result. Query is skipped without a loader, below minLength,
during composition, or when disabled/readonly/hidden/inert. Native fieldset eligibility
includes the first-legend exception. Explicit `setSuggestions` remains a programmatic write
even when input editing is barred; it never enables or edits that input.

## Honest events, composition and native keyboard

- Native input/change/focus/blur stay on the original input, with their original listeners.
  No synthetic events are generated by option updates or queries.
- Input bursts debounce; same-value change after input does not duplicate the query.
  A change-only native value update can query. There is no typing-versus-selection inference.
- `mui:auto-complete-results` is a nonbubbling **query-result** event on the input:
  `{ query, suggestions, result }`, with frozen normalized suggestions and result.
  Silent `setSuggestions` does not emit it.
- **No on-select equivalent is fabricated.** Typing a string equal to an option and choosing
  that native suggestion cannot be universally distinguished. Consequently append,
  blur-after-select and clear-after-select are intentionally omitted.
- No keydown/keyup handler, Enter prevention, focus/blur side effect, aria-expanded,
  aria-controls, active-descendant state, popup positioning or native picker invocation.
  Native Enter may accept a browser suggestion or submit the form; modified native actions
  remain untouched. Native input.focus()/blur() are the explicit imperative methods.
- Composition start and composing input invalidate current work but do not query.
  Composition end plus the final input coalesce through debounce. Reset bookkeeping tracks
  composition separately from query generations, so a post-reset refresh/query cannot
  leave IME suppression stuck, nor clear a genuinely newer composition session.

Autofill/paste/editing are native; eventful updates are observed normally. For silent
browser/application property writes, explicitly call refresh (and query if desired).
There is no polling and no setter monkey-patching.

## Cancellation, errors and ownership

Only one query can be current. Input/composition, reset, refresh, newer query/manual results,
availability/association changes, removal and disposal cancel pending work using AbortSignal.
The public query races cancellation, so an ignoring loader cannot keep it pending **after
cancellation**. An otherwise never-settling loader has no built-in timeout; implement any
timeout within the application loader.

Generation, native value/form/name/type/availability and datalist identity/content snapshots
are checked before installing results and by `result.current`. A direct `.value` write
without an event therefore cannot install stale results when they settle. It does not
synchronously change the loading state: call refresh for immediate cancellation. A silent
write-and-revert between checks is not observable without polling; refresh every relevant
programmatic transaction and external loader-dependency change.

Expected cancelled `DOMException("…", "AbortError")` produces aborted, not success.
Unexpected throws/rejections, uncancelled AbortError, malformed or oversized results reject
the public query and dispatch `mui:auto-complete-error` on the input with `{ error, query }`.
Event-driven queries consume their already-reported rejection. Unexpected late failures
after cancellation/disposal still emit this error event but cannot replace current results.
Manual invalid setter/configuration calls throw directly. No swallowed success-shaped fallback.

Original datalist child nodes, including options and templates, are retained by identity.
They are temporarily detached only for a successful option replacement and restored on
invalidation/reset/disposal if the installed options are still helper-owned. Authored
fallback edits are adopted. An external edit to generated content relinquishes ownership
instead of overwriting that edit—even before observer delivery or when refresh/input occurs
in the same task. Changed list id/association, duplicate consumers/id, invalid status markup
or disconnected nodes disconnect the helper without rewriting native attributes.

Per-input/list/status symbols prevent competing writers across ESM/classic copies;
they are not a provider or global model. Abort dispatch is a reentrant boundary: a cancellation
callback may dispose/transfer ownership, and the old operation must not keep writing.
Cleanup restores owned content and releases symbols before its final abort notification;
generation/owner checks protect setters/query continuations.

Optional status text and `data-auto-complete-state` use conditional leases: externally
replaced text/attribute values survive teardown. There are no input ARIA writes or automatic
live regions. Status says “suggestions supplied”, not “popup shown”. Authors may separately
summarize deliberate query results if needed; universal AT speech is not claimed.

Reset aborts pending work immediately. An accepted native reset restores fallback after its
default action; cancellation preserves settled options/status and values. Deferred cleanup
cannot erase newer post-reset results. Composition cleanup is independently guarded as
described above. The helper never writes current/default values or calls reset itself.

## Concrete Input/Form reuse and submission

The helper intentionally has no second clear/setValue/editing implementation. Compose the
existing [Input](input.md) helper when enhancement actions/counts are needed:

```js
const input = MarkupUIInput.createInput(document.querySelector("#city-input"))
input.setValue("Unlisted town") // Silent; preserves defaultValue and IME rules.
suggestions.refresh()
formController.refresh()        // Existing Form's explicit silent-change contract.
await suggestions.query()       // Optional, deliberate.
```

Input's clear button uses its existing native input/change events and focus/IME checks.
Those events invalidate/query suggestions and clear [Form](form.md) feedback coherently.
Auto Complete never touches Form error/help/count description tokens; teardown is safe in
either Input/Auto Complete order. Native required is still independent of suggestion membership.

There is no submit interception, noValidate override, hidden payload, backend request or
automatic submission/resubmission. The demo's application listener prevents submission
only to inspect `new FormData(form, event.submitter)` locally, and removes itself on
disconnect. Without JS, native required blocks invalid submission and ordinary free-text
GET/reset remains usable. Optional suggestions are neither business validation nor transport.

## Retained and omitted property mappings

| Upstream surface | Retained native adaptation / explicit omission |
| --- | --- |
| clearable | Existing Input clear action, not a duplicate editing engine |
| default-value, value | Native defaultValue/value, original name/form/reset semantics |
| disabled, placeholder, input-props | Actual input attributes; no arbitrary prop-forwarder |
| options; option value/label/disabled | Authored native options or strict bounded native option data; label is display-only |
| loading | Optional nonlive status/state from actual loader lifecycle, never a selectable option |
| size, status | External field CSS and optional Form/native validation presentation; not popup styling |
| on-blur, on-focus, on-update:value | Original native focus/blur/input/change events |
| focus, blur | Original input.focus()/blur(), no wrapper focus engine |
| default, prefix, suffix slots | Authored native input/affix DOM; no VNode callback slot |
| append, blur-after-select, clear-after-select, on-select | **Omitted**: native selection cannot honestly be inferred from string equality |
| get-show, placement, to, menu-props, scrollbar-props, show-empty, empty slot | **Omitted** popup control/rendering/portal interfaces; native browser owns UI |
| render-label, render-option and node/option/selected inline fields | **Omitted** VNode/rich rendering |
| GroupOption children/label/key/type | **Omitted** grouped/recursive suggestion renderer |
| default.handleInput/handleFocus/handleBlur/value | Native input events and original property adaptation; no injected slot callbacks |
| default.theme, theme overrides, zIndex | **Omitted** provider/theme/popup contracts |
| Source bordered and size | External field CSS adaptations; no hidden source prop forwarding |
| Source prop/slot/group/option/callback type aliases | Explicitly dispositioned in reference; no upstream TypeScript shape compatibility |

Source: Naive UI **2.45.3**, pinned `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/demos/enUS/index.demo-entry.md),
[AutoComplete.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/AutoComplete.tsx),
[interface.ts](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/interface.ts),
[public-types.ts](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/src/public-types.ts),
[index exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/auto-complete/index.ts).
The source uses tree/menu/pending-option/provider/follower machinery, select-label updates
and conditional Enter prevention. None of that machinery is ported. Source `default.theme`
appears in public Markdown but not the reviewed slot-prop interface/render injection;
source callback intersections also differ from implementation signatures. These identities
are retained and explicitly omitted rather than represented as equivalent native APIs.

## Four-step acceptance

1. [x] Original input/datalist association, options and free-text/native defaults retained.
2. [x] Native events and IME-safe bounded query/result lifecycle verified.
3. [x] Optional loader scoped; rich combobox, grouping, popup and selection inference omitted.
4. [x] Targeted tests/build/review and Chromium acceptance recorded below.

### Evidence and limits

- **213 tests passed**: Auto Complete **68**, Input 52, Form 53, Select 40.
  `pnpm exec vitest run tests\auto-complete.test.ts tests\input.test.ts tests\form.test.ts tests\select.test.ts`
  and `pnpm build` passed. No legacy/Input/Form/Select source or dependencies changed.
- Read-only review found same-task external edits, reentrant abort ownership transfer and
  reset/composition generation defects. All three were fixed with regression coverage;
  browser probes also verified direct-write staleness, ownership transfer, external option
  edits and successful post-reset querying.
- Chromium on local **4188**, dedicated Auto Complete tab: native datalist association and
  actual supplied option values, free-text Enter submission with literal name/submitter,
  required Form feedback, Input's deferred native clear/focus, help/count preservation,
  reset/default identity, cancelled reset and disabled/readonly skip/fallback verified.
- Local error and slow→newer query paths exercised explicit failure and stale-result guards.
  **CDP IME** held state idle during “東” composition and queried once after committing “東京”.
  This is browser CDP composition evidence, not every OS IME/autofill implementation.
- ArrowDown/Enter in this automation **did not select the browser suggestion**: input
  remained “Lo” and native form submission proceeded. No fake select event/expanded state
  was emitted. Browser popup geometry, native matching, option selection UI, zoom behavior
  inside the OS popup and AT announcements are **not claimed verified**.
- LTR/RTL at **1280px and 375px**, **200% CSS zoom**, forced colors/dark/reduced-motion
  emulation retained visible fields without page overflow. No popup styling is promised.
- Separate JS-disabled Chromium context verified authored London/Paris/Tokyo suggestions
  and shared list associations, invalid required blocking, native reset and free-text GET
  submission with `address.city=Unlisted place` and `intent=save`; context closed afterward.
- ESM/classic/Input/Form and legacy `mui-autocomplete` registration coexisted. No Safari/
  Firefox, native popup selection, universal AT speech or backend transport acceptance.
  Final dedicated-demo console check had no errors/warnings; no nonstatic requests were
  observed. The demo tab was reloaded to its authored starting state afterward.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Auto Complete ESM | 7,532 | 3,183 | 4,500 |
| Auto Complete classic | 7,714 | 3,252 | 4,500 |
| External CSS | 1,253 | 494 | 1,000 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **146 prior top-level JS/CSS outputs** were independently built in memory using the
pre-Auto Complete HEAD recipe and byte-compared with current output; all match. No previous
optional budget was relaxed. Reference audit preserved **46 original section/source/kind
identities in exact order + ten explicit source supplements = 56 rows: 27 adapted, 29 omitted**.
Catalog: **3,582 rows, 252/384 accepted tasks across 63 pages**, 132 unchecked. P4 has
**896 rows**, with **seven Planned routes and 360 unresolved rows**. **392 relative file links**
across the four scoped documents and diff whitespace were checked at sign-off. **Next: Input OTP**, not a second Auto
Complete/rich-picker engine; Dynamic Input, Dynamic Tags, Mention, Color Picker, Date
Picker and Time Picker remain separate later routes.
