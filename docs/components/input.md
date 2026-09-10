# Input: authored native fields

**🟢 Verified for the retained native Input/textarea/InputGroup/InputGroupLabel scope.**
This is the first P4 control contract, not Form validation or Vue API parity.
The optional helper never creates, replaces, proxies or registers a control.
Legacy `MuiInput`/`MuiTextarea` in `src/components/forms.ts` are unchanged.

## Loading and anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/input` | ESM `createInput`, `InputControl`, `InputController`, `InputOptions`, `InputCount` |
| `dist/markup-ui-input.js` | Self-contained ESM; no runtime imports/dependencies |
| `dist/markup-ui-input.global.js` | Classic `MarkupUIInput.createInput`; refuses namespace replacement |
| `@dataengine/markup-ui/input/style.css` | External `dist/markup-ui-input.css`, also usable without JS |
| [Local demo](../../demo/components/input.html) | Separate HTML, CSS and JS; local dummy values, no backend/password logging |
| [Reference dispositions](../naive-ui/components/input.md) | Every original owner/property/slot/method/inline field, plus explicit source supplements |

Load **one helper format**, its external stylesheet, then an external setup script:

```html
<label for="subject">Subject</label>
<div class="mui-input" data-input id="subject-field">
  <span class="mui-input__affix" aria-hidden="true">✎</span>
  <input data-input-control id="subject" name="subject" value="Draft"
    required maxlength="80" aria-describedby="subject-count">
  <button type="button" data-input-clear hidden>Clear subject</button>
  <span data-input-count id="subject-count">Count available with JavaScript</span>
</div>
```

```js
const field = MarkupUIInput.createInput(document.querySelector("#subject-field"), {
  formatCount: ({ length, maxLength }) => `${length} of ${maxLength} code units`
})
field.control.value = "Assigned silently"
field.refresh()
field.setValue("Also silent")
// Native reset state is independent:
field.control.defaultValue = "Next reset"
```

ESM consumers import `createInput` from the optional export instead. There is **no**
`mui-*` registration-order requirement: native helpers coexist with either legacy loading
order. A root/control ownership symbol rejects duplicate owners, including ESM/classic
copies; it is not a global form registry. No mandatory bootstrap or automatic scanning.

`createInput` requires one connected light-DOM `.mui-input[data-input]` without a role or
tabindex, containing exactly one authored `[data-input-control]`. The native field needs a
real label or a nonempty `aria-label`/resolved `aria-labelledby`; labels should remain
visible where practical. The helper accepts **textarea or input text/password/search/email/
tel/url**. Number, range, file, hidden, date/time/color and selection inputs are deliberately
rejected, not coerced into text. These belong to native HTML or later P4 scopes.

Optional decorations are at most one `button[type=button][data-input-clear]`, one
`button[type=button][data-input-reveal]` (initially password only), and one text-only
`span[data-input-count]`. Buttons need names and no nested interaction, other native
commands or replacement roles. **Never put decoration buttons inside labels, links,
summaries or other buttons.** Hide enhancement buttons in authored HTML; connection reveals
them when appropriate and disconnect restores the baseline. CSS-only fields omit
`data-input` and require no helper. No generated templates or hidden duplicate inputs.

Anatomy is fixed for a controller lifetime. Disconnect before replacing children; create a
new controller afterwards. Removal, movement outside the document, loss of required
anatomy or an unsupported live input type disconnects rather than adopting replacements.
Supported same-document moves preserve the control and refresh ancestor disabling.

## Native ownership, updates and notifications

The **actual HTMLInputElement/HTMLTextAreaElement** owns `value`, `defaultValue`, selection,
composition, editing history, paste, labels, name, form association, disabled/readonly,
fieldset/first-legend disabling, required/pattern/length constraints, autocomplete,
inputmode, spellcheck, placeholder, autofocus, rows and validity. The helper does not
forward attributes, install property interceptors, normalize typed text or write the value
on ordinary input/composition events. Preexisting values, nodes, listeners and ARIA survive.

| Controller member | Exact behavior |
| --- | --- |
| `control`, `connected` | Original native field and current lifetime state |
| `refresh()` | Refresh count/actions after direct property writes; silent, idempotent, no anatomy re-adoption |
| `setValue(string, { emit?: boolean })` | Assigns native current value, refreshes decorations; silent by default; never changes defaultValue |
| `clear()` | Returns false for empty/noneditable/disconnected/composing fields; otherwise clears and returns true |
| `disconnect()` | Idempotent listener/observer/task cleanup, masks helper-revealed passwords, releases ownership; recreate to reconnect |

`.value` assignment does **not** emit input/change and is **not observable by
MutationObserver**. Call `refresh()` or `setValue()` after application writes or silent
autofill. Real browser input/change events refresh automatically; actual password-manager
autofill behavior is not certified. Programmatic writes remain allowed for disabled/
readonly native fields. `setValue` throws during tracked composition rather than clobbering
an IME draft. User clear/reveal is disabled during composition.

Native user input/change/focus/blur are left alone: there is no duplicate `mui:input`,
`mui:change`, form model or synthetic event on every keystroke.

- A successful **clear** sends one synthetic bubbling/composed native `input`, then one
  bubbling native `change`, then bubbling `mui:input-clear` on the control with
  `{ previous: string }`. These notifications are not trusted/cancelable browser editing.
  The default reset value stays unchanged. A no-op sends nothing.
- `setValue(value, { emit: true })` sends `input` then `change` only if the native resulting
  value changed. Ordinary `.value` and silent setters send neither.
- Button actions run in the next task so a later bubbling click listener may cancel them
  with `preventDefault()`. No button submits the enclosing form. A focused clear button
  returns focus to the native field before it hides. Clearing from elsewhere does not
  unconditionally steal focus. Native change caused by leaving a previously edited field
  is a separate native edit commit, not a duplicate clear notification.

Native reset is observed at the document in capture phase and refreshed **after the native
reset default action**, in a task. The listener checks the control's current `.form` on
each reset, so external `form=`, changed form IDs and changed ownership remain native.
Cancelled resets keep the value. Reset dispatches no fabricated user edit events. Native
FormData/submission contains the original named field once, respects disabled fieldsets,
includes readonly/hidden named fields and omits unnamed controls. No hidden proxy value.

The helper owns only action hidden/disabled/pressed attributes, temporary password type
and counter text. It observes outside writes before its own scoped writes; same-value
author hidden/disabled changes are retained as author intent. Disposal restores only
still-owned state, preserving newer author attributes and edited values. It does not
remove author `aria-invalid`, `aria-describedby`, labels, validation messages or constraints.

## Password and count

Password reveal is a **click/keyboard toggle**, with a stable authored button name and
`aria-pressed`. Hold/mousedown reveal is omitted. Value and selection are preserved where
the native type supports selection. Leaving the root, window blur, pagehide/beforeprint, hidden document,
Escape, pointer cancellation, readonly/disabled/hidden/inert state, reset, removal or
disconnect masks a helper-exposed value. Queued stale reveal clicks cannot re-expose it
after blur/disposal. A newer explicit author `type` write is not reversed.

Authored decorative children may use `.mui-input__password-invisible` and
`.mui-input__password-visible`; CSS switches them using pressed state. Decorative icons
should be `aria-hidden`, with a separate stable accessible button name. Clear icon
children and all affixes are author-owned, never arbitrary HTML returned by a callback.

Counts are **UTF-16 code units**, matching native maxlength/minlength units, not words or
graphemes. `InputCount` is `{ value: string, length: number, maxLength: number | null }`.
The default text is `length / maxLength`, or `length` with no native maximum.
`formatCount` is a per-controller plain-string localization hook; text is assigned through
`textContent`. It must return a string and should be pure/nonthrowing. No count renderer,
grapheme limiter or change to the native maxlength behavior is implied. Do not wrap the
count in an automatic live region; `aria-describedby` is optional author semantics.

## CSS, textarea, groups and pair fields

`.mui-input` supplies border, padding, focus, wrapped affixes/actions and native
control sizing. Only descendants marked `data-input-control` are styled. No global input
reset, inline styles, animation, theme provider or CSS-in-JS. Native `:disabled` drives
disabled color and helper availability, including fieldset inheritance.

| Presentation | Mapping |
| --- | --- |
| `data-size="tiny|small|medium|large"` | Heights 22/28/34/40px, fonts 12/14/14/15px, horizontal padding 8/10/12/14px; medium is the default |
| `data-round` | Optional round shape, intended for single-line fields |
| `data-borderless` | Transparent resting border; visible focus boundary remains |
| `data-status="success|warning|error"` | Border presentation only, never automatic validity/ARIA/live announcements |
| `.mui-input__affix` | Authored prefix/suffix; meaningful text should be associated appropriately |
| `.mui-input-group` | Wrapping flex composition, no invented group role or tuple renderer |
| `.mui-input-group-label` | Authored addon/label styling; explicit size/borderless also supported |
| CSS tokens | `--mui-input-color`, `-background`, `-border`, `-focus`, `-placeholder`, `-disabled`, `-disabled-background`, `-active`, `-addon-background`, `-pad`, `-font`, `-radius`, `-height` (all share `--mui-input` prefix) |

The [default-style audit](../style-audit/components/input.md) aligns the retained
field geometry and light/dark paint with the pinned Naive reference. An ancestor
`data-mui-theme="light|dark"` selects the scheme; standalone fields default to light.
Defaults use private variables: inherited public tokens still win over size, status
and theme defaults. `-pad` now controls horizontal padding, while `-height` and
`-font` determine vertical alignment. Use explicit lengths for these sizing tokens.
Neutral colors are local reference-matched fallbacks, not the legacy shared text roles.
Shared primary/warning/error roles remain usable without changing the shared palette.

The boundary is a pointer-transparent pseudo-element, not a second native control or
an inset editing outline. Clear/reveal buttons have borderless, intrinsic authored
content; use a named button with an independently authored 16px decorative icon for
reference-sized actions. Text labels remain supported and are not clipped to icon width.
No vendor eye/cross artwork is supplied. Textarea counts sit at the bottom inline end
without adding a row and do not intercept pointer input. Long text can reach this count
overlay; omit the optional count or provide application-owned spacing when needed.

For a pair, author two separately labelled and named fields with optional separator text.
`InputGroupLabel` styling **does not itself label an input**: use `<label for>`, a separate
native label, or an intentional description association. Do not nest the action buttons
inside that label. Group companions add no JS API, array value or submit semantics.

Textareas use `rows` (native default if absent), manual vertical resizing and scrollbars.
`.mui-input__fixed` disables manual resizing. `.mui-input__autosize` opts into
`@supports (field-sizing: content)` with line-height bounds: `--mui-input-min-rows: 2`
and `--mui-input-max-rows: 8` by default. Set sensible positive bounds with max ≥ min in
external CSS; they are not JS-parsed upstream row props. The demo uses 2–6 lines. With
field-sizing support, content and CSS bounds determine height, **not `rows`**. Without
support, rows/manual resize remain usable; there is no JS fallback, hidden measuring
mirror, per-frame polling or promise of upstream pixel/row parity.

Logical sizing/padding supports RTL and narrow wrapping. Forced colors retains native
boundaries; print hides action buttons. There are no animations to disable for reduced
motion. Native `:has()` adds disabled/focus presentation and textarea count layout, not behavior.
Only the native field's `:disabled` state dims the root; temporarily disabled enhancement
buttons during IME composition do not remove the field's focus indication.

## Complete upstream disposition

All mappings are adaptations, not property passthrough. The [71-row reference](../naive-ui/components/input.md)
preserves all 52 original identities and adds 19 source-only declarations.

| Input property / inline identity | Retained mapping or explicit omission |
| --- | --- |
| `autofocus`, `disabled`, `readonly`, `placeholder`, `maxlength`, `minlength`, `rows` | Corresponding authored native attributes/properties; no upstream placeholder/default translation |
| `type` | Authored text/password input or textarea; optional helper's additional native text types listed above; no tag morphing |
| `value`, `default-value` | Native current/default properties; strings only, no null/tuple model |
| `input-props` | Author the actual control attributes/properties/listeners; no object forwarding or reserved-prop overrides |
| `autosize`, `autosize.minRows?`, `autosize.maxRows?` | CSS field-sizing and min/max line tokens, with native rows/manual fallback |
| `clearable`, `on-clear` | Authored button/controller clear and the documented one clear notification |
| `show-count`, `count`, `count.value` | Authored count span and plain-string `formatCount({ value, length, maxLength })` |
| `show-password-on` | Click/keyboard toggle retained; `mousedown`/hold omitted |
| `size`, `round`, `status` | Explicit external CSS selectors above; not Form-provided state |
| `pair`, `separator` | Independently named fields and authored separator; no tuple renderer/state |
| `on-blur`, `on-focus`, `on-input`, `on-change`, `on-update:value` | Listen to native blur/focus/input/change and read the original control; no model binding/duplicate update event |
| `allow-input` | **Omitted veto/rollback**; use native constraints, `setCustomValidity`/validity UI or application-owned beforeinput handling with its own IME policy |
| `count-graphemes` | **Omitted** custom counting/constraint replacement; native UTF-16 constraints remain intact |
| `render-count`, `render-count.value` | **Omitted** renderer/VNode API; plain text localization is not renderer parity |
| `loading` | **Omitted** managed spinner/reserved-space prop; author suffix busy text or explicitly compose existing Spin if useful |
| `passively-activated` | **Omitted** wrapper activation/tabstop; focus the native field directly |

Slots `clear-icon`, `password-invisible-icon`, `password-visible-icon`, `prefix`, `suffix`,
`separator` and both companions' `default` content remain authored DOM. `count` is the
bounded text-only region above. No slot/VNode/template renderer exists.
Methods `focus`, `blur`, `select` and `scrollTo` (including `left?`, `top?`, `behavior?`)
are the native control methods with native support/semantics; controller `clear` is above.

Source supplements: Input `bordered` → CSS borderless; `resizable` → native textarea CSS;
`onMousedown`, `onKeydown`, `onKeyup`, `onClick` → corresponding native listeners;
`onUpdateValue` → native input observation without binding. InputGroupLabel `size` and
`bordered` → explicit CSS. `InputSize` → four CSS sizes; `InputInst`/`InputWrappedRef` →
explicit controller plus original control, not upstream refs/activate/deactivate.
`stateful`, deprecated `showPasswordToggle`, both owners' `theme`/`themeOverrides`/
`builtinThemeOverrides`, `OnUpdateValue`/`OnUpdateValueImpl` tuple/source metadata,
`inputInjectionKey` and private wrapper/Form hooks are **omitted**, not imported or emulated.
The exact private hook identities are preserved in the source-supplement reference row.
There are no formatter/parser properties in the pinned Input public table: neither
formatting nor allow-input rollback is invented as a new native helper feature.

## Acceptance and boundaries

### Original native-contract acceptance (historical)

Obtained on **2026-09-09** with local server **4188** and a dedicated Input demo tab.
The asset sizes and textarea sizing below describe that original revision, not the
subsequent style audit:

- **189 targeted Vitest tests passed**: 52 Input, 27 native, 24 Button, 53 Pagination
  and 33 Collapse; native state/selection/
  composition notifications, per-root ownership, UTF-16 counts, cancellation, author
  attributes, form reset/reassociation, disabled fieldset/first legend, password lifecycle
  and legacy preservation.
- Chromium **151.0.7922.174**: real keyboard typing/selection replacement, CDP IME
  composition/commit, real clipboard paste and native undo; clear input/change/clear order,
  focus recovery, required validity, silent writes, changed default/reset, cancelled reset,
  fieldset/readonly and external-form reset, native submission including hidden tokens
  but excluding unnamed dummy password. OS IME/predictive text and real credential
  autofill/password managers are not certified.
- Keyboard Tab/Space actions and Escape masking. CSS textarea grew **64 → 160px**
  at its six-line max, scrolled longer content, then shrank to 64px. RTL at 360px
  and 200% CSS zoom showed no horizontal page overflow; forced-color boundary,
  reduced-motion context and print-hidden action checks passed. This is not browser-UI
  zoom, all-engine screenshot parity or screen-reader certification.
- Separate JS-disabled Chromium context: hidden enhancement buttons, editable native
  fields, native reset and real local GET submission without password data.
- Standalone ESM and classic helpers worked; cross-format duplicate ownership was rejected.
  Both helper-before-legacy and legacy-before-helper preserved original native fields and
  pre-enhancement values. Native select/scrollTo/focus/blur and both authored reveal-icon
  CSS states were exercised. Review fixed cross-copy ownership and kept composition from
  changing a revealed field's type merely to disable actions.
- Trusted typing obeyed native maxlength and minlength, without automatic aria-invalid.
  Chromium first-legend exemption/reparenting and composition on a revealed password
  passed; dispatched beforeprint/pagehide lifecycle events remasked it. No physical
  printer or OS task-switch behavior is inferred from those lifecycle-event checks.

Validation commands: `pnpm test -- tests\input.test.ts tests\native.test.ts
tests\button.test.ts tests\pagination.test.ts tests\collapse.test.ts`, then `pnpm build`.
Build/typechecking and every existing/new budget passed. No dependencies were installed.

| New optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-input.js` | 7,704 | 3,110 | 4,000 |
| `markup-ui-input.global.js` | 7,861 | 3,180 | 4,000 |
| `markup-ui-input.css` | 4,734 | 1,267 | 1,750 |

One JS format plus CSS costs **4,377 ESM / 4,447 classic gzip bytes**. All **121 previous
top-level JS/CSS distribution assets were SHA-256 byte-identical** after the build.
Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**, under unchanged
**15,000/3,000/4,000** ceilings. `forms.ts` and aggregate entries were not changed.

The local audit found all **52 original Input identities preserved**, **71 Input rows
(58 adapted, 13 omitted)**, **3,475 colored catalog rows across 96 pages**, **216 accepted
tasks** and no missing relative file links in the four edited documentation files.
P4 remains In progress; Checkbox is next.

Only obtained evidence is claimed; no Form schema/async validation, Vue compatibility,
arbitrary renderers, synthetic grapheme constraints or universal browser/AT parity.

### Default-style audit, 2026-09-10

**56 Input-only tests passed**, including all 52 original native-contract cases.
Isolated Chromium comparison covered four sizes, ordinary/password/textarea, placeholder,
clear, prefix/suffix, count, disabled, hover/focus, error/warning, round and borderless
fields in both schemes. Native keyboard replacement, CDP composition, clear, reset/
FormData, selection-preserving reveal, Escape masking, forced colors, print and narrow
200% CSS zoom checks also passed. See the linked audit for exact measurements and
limitations; this is not OS IME, password-manager or all-engine certification.

Current isolated assets (existing esbuild recipe, gzip level 9): ESM **7,704 raw /
3,110 gzip**, classic **7,861 / 3,180**, CSS **7,053 / 1,737** bytes. Unchanged gzip
ceilings are **4,000 / 4,000 / 1,750**. One helper plus CSS is **4,847 ESM / 4,917
classic gzip bytes**. Source CSS is whitespace-compacted equivalently to remain within
its existing ceiling; no build-script or budget changes. JavaScript is unchanged.
No full release build, generated-asset updates, commit or push were performed here.
