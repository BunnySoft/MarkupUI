# Mention: native text, caret snapshots and explicit choices

**🟢 Verified retained native scope.** One original text/search input or textarea plus an
adjacent named region of **native choice buttons**. No rich text/contenteditable, caret
mirror, fake textarea combobox/listbox, active-descendant keyboard engine, floating
dependency, VNode renderer, provider, HTTP client or text logging/storage.

**2026-09-11 default-style audit:** standalone controls and native options now follow the
source's 28/34/40px density, 3px corners and semantic light/dark palette. Composed
`data-input-control` fields remain Input-owned, and the demo explicitly loads Input CSS.
See the [measured audit](../style-audit/components/mention.md).

The panel is in **ordinary document flow below/beside its field**, wherever the author
places it. It is not caret-anchored, portalled or a claimed equivalent of source popup
geometry. There is a complete usable selection route: native Tab to a candidate button,
Enter/Space or pointer click to insert, Escape to close.

## Loading and anatomy

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/mention` | ESM `createMention`, control/context/option/search/loader/settings/result/controller types |
| `dist/markup-ui-mention.js` | Optional independent ESM |
| `dist/markup-ui-mention.global.js` | Classic `MarkupUIMention.createMention`; refuses namespace replacement |
| `@dataengine/markup-ui/mention/style.css` | External `dist/markup-ui-mention.css` |
| [Demo](../../demo/components/mention.html) | Separate native HTML/CSS/JS, local simulated loader and static subject examples |
| [Reference dispositions](../naive-ui/components/mention.md) | All original owner/source/kind identities plus explicit source supplements |

```html
<div class="mui-mention">
  <label for="message">Message</label>
  <textarea class="mui-mention__editor" id="message" name="message"
            rows="4" maxlength="256" aria-describedby="mention-help"></textarea>
  <p id="mention-help">Type @ followed by a query. Tab to a choice, then Enter/Space.</p>
  <section class="mui-mention__panel" id="choices" aria-label="Mention choices" hidden>
    <ul class="mui-mention__options" data-mention-options></ul>
    <p data-mention-status>No search yet.</p>
  </section>
</div>
```

The panel starts hidden and has exactly one empty native ul/ol/div options container and
optional plain nonlive status. It is separate from the editor and outside labels/other
interactive wrappers. Candidate buttons are generated safely into that exclusive empty
surface; static headings/instructions remain authored. No other interactive panel controls
or listbox/menu/combobox roles are accepted. Panel naming uses authored aria-label or
resolving aria-labelledby. Editor labels/help/count/Form tokens are not rewritten.

No-JS fallback is simply the original native editor; the panel remains hidden. Input
identity, listeners, current/default values, native names/form association and selection
remain browser-owned. Unsupported input types are rejected instead of emulating selection.

## Settings and API

```js
const mention = MarkupUIMention.createMention(editor, {
  panel: document.querySelector("#choices"),
  prefix: ["@", "#"],
  options: [{ value: "alice", label: "Alice Example" }, { value: "docs" }],
  filter: (query, option) => option.value.startsWith(query) // explicit alternative
})
```

| Setting/member | Contract |
| --- | --- |
| `panel` | Required authored connected named region; fixed identity |
| `options?` | Static bounded option records, copied/frozen; mutually exclusive with load |
| `load?` | `(context: MentionSearch) => options or Promise<options>`, no built-in transport |
| `filter?` | Synchronous `(query, option, prefix) => boolean`; malformed returns/errors are explicit |
| `prefix?` | One string or array of **1–8 unique single BMP, non-surrogate, non-whitespace units**, default `@` |
| `separator?` | One BMP unit, not CR/LF/surrogate or a configured prefix; default space |
| `maxResults?` | Integer **1–100**, default 20; oversized data reject, never silently truncate |
| `minQueryLength?` | Integer 0–maxQueryLength, default **1**; 0 explicitly enables prefix-only lookup |
| `maxQueryLength?` | Integer 1–256, default 64; bounds backward scan/query work |
| `debounce?` | Integer 0–1000ms, default 120, for event-driven queries |
| `control`, `panel`, `connected`, `error` | Original nodes, lifetime and unexpected error |
| `context` | Live eligible `{ prefix, query, start, end }` or null; positions are original UTF-16 code units |
| `query()` | Immediate query of the focused editor; Promise status updated/skipped/aborted |
| `select(value)` | Explicit current-candidate command; true only after a permitted native insertion |
| `setOptions(array)` | Static-source-only silent data replacement and close; no automatic requery |
| `refresh()` | Silent invalidation/close after programmatic transactions, not a value setter |
| `close()` | Cancel work, hide owned choices and recover focus only if it belonged to the panel |
| `disconnect()` | Idempotent cleanup and conditional panel/list/status restoration; native text/defaults remain |

Native `control.focus()/blur()` and Input's existing silent setters remain the imperative
editing tools. Manual query outside the editor/panel is skipped rather than stealing focus.
An explicit requery that replaces a focused candidate list first recovers the native editor.
There is no automatic lookup merely from focus; text/caret interaction or explicit query
starts lookup.

## Exact prefix and token-fragment semantics

The **nearest configured prefix before the collapsed caret** wins, scanning backward only
until the configured separator, CR or LF, within maxQueryLength. There is **no required
word boundary before the prefix**, matching the pinned source: `mail@al` can trigger and
`@@al` uses the second `@`. Ordinary punctuation does not terminate a query unless it is
the configured separator. With separator `;`, spaces can occur in a query/value.

Noncollapsed selection is not a mention context. A caret splitting a surrogate pair is
also rejected. BMP prefixes such as `＠` work; emoji/multi-unit prefixes are rejected rather
than silently ignored. Query and insertion values are well-formed Unicode, with code-unit
offsets; no lowercasing/reindexing or grapheme rewriting of the original text occurs.
Default minQueryLength 1 suppresses empty searches; missing prefixes/boundaries never
invoke a loader.

**Selection replaces only the active fragment after the prefix through the caret**,
not text to the right. This is the source's explicitly cached partial-pattern behavior:

| Before (`|` is caret, not text) | Choose `alice` | Retained behavior |
| --- | --- | --- |
| `Hi @al\| there` | `Hi @alice \|there` | Existing following separator reused, not duplicated |
| `@al\|TAIL` | `@alice \|TAIL` | Right-side text remains untouched |
| `@@al\|` | `@@alice \|` | Earlier prefix stays in original text |
| `😀 @al\| rest` | `😀 @alice \|rest` | Original Unicode offsets/text retained |

Insertion uses native `setRangeText` after revalidating context and **maxlength before
mutation**, then sets the collapsed caret beyond the inserted/reused separator. Overlong
insertion is rejected with unchanged text, never truncated. This helper does not make an
entire word/token to the right of the caret disappear.

## Bounded option and filtering contracts

`MentionOption` is a deliberately narrow record:
`{ value: string, label?: string, disabled?: boolean, class?: string }`.
Values must be unique, nonblank well-formed strings up to 256 code units, containing no
configured prefix, separator or CR/LF. Supply a bare identifier; the original prefix is
already present. Plain labels may be up to 1024 units; they are display names, **not inserted
values**. Class is a bounded native class string, not HTML/style/render configuration.
No function label, VNode, arbitrary record fields, object value or implicit numeric coercion.

Fields are read once before validation/freezing. Native button.textContent/className/
disabled receive safe normalized data; values are never placed into unsafe selectors or
HTML. Selection is an exact Map/record value lookup. Disabled candidates are actual disabled
buttons and cannot insert.

Static options default to the pinned case-sensitive startsWith behavior on plain label,
otherwise value. A loader's results are considered already filtered unless an explicit
filter is supplied. Filtering a copy of the query in application code does not alter native
text or offsets. No uncontrolled regex parser or external filtering/positioning package.

## Search results, cancellation and reentrancy

The loader receives frozen `MentionSearch`: context fields plus original `control` and
`AbortSignal`. `query()` returns frozen `{ status, context, count, current }`; current is
a live freshness check, not an assertion that old results remain usable indefinitely.
Aborted is never successful validation/insertion.

Native text, caret/selection, prefix range, form owner, maxlength and availability are
snapshotted. Moving the caret without changing the text invalidates old pending/published
choices, including a loader that ignores its AbortSignal. Input/select/selectionchange/
click/keyboard events update context without property polling. Readonly/disabled/fieldset,
hidden/inert, composition, reset, refresh, removal and disposal stop stale work.
Direct `.value`/selection writes are checked before publication/selection; explicitly
refresh every programmatic transaction for immediate coherent invalidation.

Transient text snapshots exist only for current work/choices. There is no persistent text
model, mirror element, logging or storage API, and the full native text is not put into
custom event payloads. A silent write-and-revert between checks is unobservable without
polling; refresh after such application transactions.

An idle caret baseline prevents Escape/refresh/reset from reopening the same context due
to delayed selection events. Reset cancels old work immediately, even if later cancelled,
but does not alter native value/default/reset cancellation. Post-default caret rebasing is
not cancellation of genuinely fresh work. Queries reentered during reset dispatch are
skipped without changing that reset generation. New composition sessions are not cleared
by an older reset.

Expected cancelled DOMException AbortError is consumed as aborted. Unexpected throws,
Promise rejections (including late rejection after cancellation), invalid results and
nonboolean filters reject the query and emit `mui:mention-error`. Event-driven queries
consume their already-reported failure. No loader timeout is imposed; applications can
implement one in their loader. There is no built-in HTTP client or business submission.

Closing/disposal clears old published choices before callback boundaries; ownership is
released before disposal's final abort notification. Reentrant focus/abort/filter callbacks
cannot use old snapshots to overwrite a new editor value or another owner. The editor is
rechecked after restoring focus and before setRangeText. Arbitrary application side effects
are not a rollback transaction.

## Native interaction, events and focus

- **Editor Enter/newlines/Tab/arrows stay native**. They never choose a pending option.
  Input Enter may submit its form; textarea Enter remains a newline.
- Use **Tab** to a real candidate, **Enter/Space** or pointer click to activate it. There
  is no listbox arrow mode or virtual active descendant. Native disabled buttons are skipped.
- Editor/panel blur into a known in-scope relatedTarget is preserved. Ambiguous focusout
  is checked after the native transition, with generation guards—not in a microtask while
  activeElement can temporarily be BODY. Pointer clicks are not dismissed before activation.
- Escape during suggestion interaction closes safely and restores editor focus when it
  belonged to the candidate panel. IME Escape is left native. No hidden focused candidates
  or asynchronous-result focus stealing.
- Explicit insertion dispatches **one** bubbling/composed native input notification with
  `inputType="insertReplacementText"`, then a selection event. No synthetic change event.
  Input/Form observers see the original field. Subsequent application handlers may of
  course perform their own edits; Mention does not undo them.

Nonbubbling events on the original editor:

| Event | Detail |
| --- | --- |
| `mui:mention-search` | Original prefix/query/start/end context, not full text |
| `mui:mention-results` | `{ context, options, result }` after safe publication |
| `mui:mention-visibility` | `{ shown }` for the actual adjacent panel, not source caret popup state |
| `mui:mention-select` | `{ option, prefix }` after actual explicit insertion |
| `mui:mention-reject` | `{ reason: "maxlength", option, prefix }`, text unchanged |
| `mui:mention-error` | `{ error, context }`, unexpected failure rather than empty successful results |

## Ownership, native Form/Input reuse and fallback

One owner per editor/panel/list/status is enforced across module copies. Panel/list/control
identities and semantic anatomy remain fixed. Helper-created candidate content is restored/
removed only when still owned. External replacements survive conditional teardown; invalid
ownership/anatomy withdraws enhancement rather than overwriting them. Status remains plain
noninteractive/nonlive text, never part of a mutable label or role-button proxy.

No editor ARIA tokens, custom validity, names, disabled/readOnly, defaultValue or field type
are set by Mention. Existing [Input](input.md) count/help and [Form](form.md) feedback coexist.
The single insertion input notification updates those existing native observers. Programmatic
Input setters remain silent; call Mention.refresh and Form.refresh as appropriate.
Native constraints other than the insertion length check are not rewritten: external custom
validity still belongs to the application and can block native form submission.

The async pattern follows the accepted [Auto Complete](auto-complete.md) generation/signal/
error contract, but does not import its datalist-only helper to emulate textarea selection.
There is no mandatory Dropdown, Tooltip or Popover runtime.

The demo uses a named nonmodal native dialog with method=dialog fallback. Native no-JS
required/reset/selection remain functional; valid submission only closes locally without
putting text into a URL/request. Enhanced inspection reports counts only. Real applications
own submission and server handling. Actual clipboard/OS IME and AT behavior are platform
dependent; no rich text or universal speech compatibility is claimed.

## CSS and source mapping summary

External CSS owns editor/panel/button layout, native overflow, focus, sizes and RTL.
Textarea rows/manual resize is baseline; optional data-autosize uses progressive native
field-sizing:content with CSS min/max block sizes (4lh/12lh in the stylesheet). It is not a
JS row-height/mirror algorithm. The panel remains normal-flow field-adjacent at all sizes.

| Source surface | Retained adaptation / explicit omission |
| --- | --- |
| autosize and maxRows/minRows fields | Native rows/resize and progressive CSS sizing limits, no JS measuring renderer |
| options/filter/loading | Bounded safe static/loader data, explicit filtering and nonlive status |
| type/disabled/default-value/value/placeholder | Original native input/textarea attributes and current/default state |
| prefix/separator | Single-unit bounded source-style partial-token scanning/insertion contract |
| bordered/size/status | External editor CSS and native/Form validation presentation |
| placement/to/scrollbar-props | **Omitted** caret/follower/portal/scrollbar APIs; adjacent native flow/overflow instead |
| render-label and option.render/style | **Omitted** VNode/style passthrough; plain text/native class hooks |
| option class/disabled/label/value | Explicit bounded native button data; label is not inserted value |
| on-update:show/value, on-select/search | Actual panel visibility, original input event and explicit contextual notifications |
| on-focus/on-blur; focus/blur methods | Original native events and control.focus()/blur() |
| empty slot | Authored nonlive status/region; no selectable empty placeholder |
| source aliases/theme/internalDebug/default-slot/generic types/caret utility | Explicit supplements; omitted framework/geometry contracts |

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md),
[Mention.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx),
[interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/interface.ts),
[public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/index.ts),
[caret utility](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/utils.ts).
The pinned source's partial-pattern cache and separator reuse informed insertion semantics;
its caret mirror, follower/tree/menu/VNode machinery was not ported.

## Four-step acceptance

1. [x] Native editor/named panel/button-list anatomy and original field state retained.
2. [x] Bounded prefix/query search, caret snapshots and explicit cancellation/errors verified.
3. [x] Usable native candidate insertion, maxlength preflight and focus/selection recovery implemented.
4. [x] Targeted tests/build/review and actual Chromium editing/choice/fallback evidence recorded.

### Evidence and limits

- **248 tests passed:** Mention **75**, Input 52, Auto Complete 68, Form 53.
  `pnpm exec vitest run tests\mention.test.ts tests\input.test.ts tests\auto-complete.test.ts tests\form.test.ts --reporter=dot`
  and `pnpm build` passed. No prior helper/core/plugin source or dependency changed.
- Review found native focusout's temporary BODY interval deleting candidate controls before
  Tab/click activation, and in-reset reentrant queries reopening default text. Both fixed
  with regressions and real Chromium confirmation; jsdom's synchronous focus was not treated
  as proof of browser focus-transition ordering.
- Dedicated **4188** Chromium confirmed native **Tab + Enter/Space and pointer** insertion,
  Unicode offsets/surrounding text, retained original/default field and help/count references,
  exactly one replacement input notification, ordinary textarea newline/input form Enter,
  Escape focus/close without reopening, and visible adjacent choices.
- Length rejection preserved the 255-unit example draft under maxlength 256 rather than
  truncating/inserting. Local loader failure and a caret-only move from @slow to #do retained
  only the fresh docs choice after the delayed response. Native reset restored defaults.
- A reset-default-length-change probe with a reentrant abort query made one loader call,
  returned aborted and kept the panel hidden. CDP IME hid choices during composition and
  queried after commit. A delayed result did not steal focus from another native modal.
- LTR/RTL **1280px/375px**, **200% CSS zoom**, dark/forced-colors/reduced-motion emulation
  had no page overflow. This does not certify OS magnifiers or caret-popup geometry.
- Separate JS-disabled Chromium verified normal native editors, required blocking, reset,
  and local dialog close without URL text or duplicate fields. No Safari/Firefox, actual
  OS clipboard/IME, rich-text or universal AT certification is claimed.
- Final Chromium Tab/Enter and Escape checks passed on the built assets. Disposal preserved
  both native values/help-count tokens, hid panels and removed owned candidate buttons.
  No console errors/warnings or nonstatic requests were observed; the demo was reloaded.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Mention ESM | 13,809 | 5,367 | 6,500 |
| Mention classic | 13,975 | 5,435 | 6,500 |
| External CSS | 1,457 | 558 | 1,250 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **158 prior top-level JS/CSS assets** were independently built in memory using the
pre-Mention HEAD recipe and byte-compared with current output; all match. No previous
optional budget was relaxed. Reference audit: **35 original section/source/kind identities
exactly preserved + eleven supplements = 46 rows (30 adapted, 16 omitted)**. Catalog:
**3,624 rows, 268/384 tasks across 67 accepted pages**, 116 unchecked. P4 has **938 rows**,
three Planned routes and 238 unresolved rows. **413 scoped relative file links** and diff whitespace were checked.
**Next: Color Picker, then Date Picker and Time Picker**; no full P4/P0/P5/P6 or source
renderer/geometry compatibility is claimed.
