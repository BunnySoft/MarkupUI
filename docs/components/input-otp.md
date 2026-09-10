# Input OTP: one native code field

**🟢 Verified retained single-field scope.** One labelled text/password input holds the
whole code. Native editing, paste, selection, defaults, autofill hints and forms remain
browser-owned. The optional helper adds only bounded local completion detection and an
optional nonlive character count. No per-cell editor, secret mirror, auth/SMS/WebOTP client,
clipboard access, network request, storage API, logging or runtime dependency.

**Completion is not authentication, validation by a server, selection, or a submit intent.**
It is emitted once per uninterrupted locally complete stretch; replacing a full valid code
with a different full valid code does **not** infer a new completion intent. Deleting to an
incomplete/invalid value rearms it. Native input/change still report every normal edit.

## Loading and native anatomy

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/input-otp` | ESM `createInputOtp`, `InputOtpOptions`, `InputOtpController`, `InputOtpCharacters` |
| `dist/markup-ui-input-otp.js` | Optional independent ESM, no Input/Form imports |
| `dist/markup-ui-input-otp.global.js` | Classic `MarkupUIInputOtp.createInputOtp`; refuses namespace replacement |
| `@dataengine/markup-ui/input-otp/style.css` | External `dist/markup-ui-input-otp.css` |
| [Demo](../../demo/components/input-otp.html) | Separate HTML/CSS/JS; local dummy-only entry, count-only outcomes and no-network native fallback |
| [Reference](../naive-ui/components/input-otp.md) | Original properties, callbacks, methods, slots, inline identities and explicit source supplements |

```html
<label for="code">Six-digit code (required)</label>
<input class="mui-input-otp" id="code" name="code" type="password"
       autocomplete="one-time-code" inputmode="numeric"
       maxlength="6" pattern="[0-9]{6}" required aria-describedby="code-help">
<p id="code-help">Leading zeroes count. Do not share your code.</p>
<p class="mui-input-otp-status" id="code-count">Enter six ASCII digits.</p>
```

```js
const otp = MarkupUIInputOtp.createInputOtp(document.querySelector("#code"), {
  length: 6,
  characters: "digits",
  status: document.querySelector("#code-count")
})
```

The helper requires a connected light-DOM input of type text or password, matching native
maxlength and exact ASCII pattern, and a valid supported autocomplete token list.
Supported autocomplete is `one-time-code` or `section-NAME one-time-code`; token case and
whitespace are normalized **only for checking the attribute**, never written back.
Invalid lists such as `off one-time-code` are rejected rather than accepted by suffix alone.
Other autocomplete combinations are outside this narrow helper contract.

For eight ASCII letters/digits use `maxlength="8" pattern="[A-Za-z0-9]{8}"`,
`inputmode="text"` and `{ length: 8, characters: "alphanumeric" }`.
Inputmode is only a keyboard hint; it cannot enforce digits. Native pattern/required and
`validity` own constraints. The helper never installs/removes these attributes or
setCustomValidity messages. Native `required` is an author choice; optional empty input can
be form-valid without being a complete code.

**Codes are strings.** Leading zeroes are preserved. No type=number, separators stripped,
case conversion, trimming, appending or helper truncation. ASCII digit/alphanumeric scope
is intentional: native maxlength and JavaScript length count UTF-16 code units, not
graphemes. Full-width/Arabic-Indic digits, emoji and arbitrary Unicode codes are not retained
completion formats. Native single-line input sanitization (for example line breaks) and
user maxlength enforcement remain browser behavior; the helper does not replace either.
Scripted overlong/invalid strings remain unchanged and incomplete.

## Explicit API and native state

| Member/option | Contract |
| --- | --- |
| `length?` | Integer **1–12**, default 6; authored maxlength/pattern must match |
| `characters?` | `"digits"` default or `"alphanumeric"`; ASCII only, no normalization |
| `status?` | Optional distinct plain span/p/div outside interaction and effective live-region ancestry |
| `input`, `length`, `characters`, `connected` | Original native field, fixed policy and lifetime |
| `complete` | Live local shape **and native validity** check; false while composing/disconnected; never authentication |
| `refresh()` | Cancel pending notification and silently rebase completion/count after programmatic transactions |
| `disconnect()` | Idempotent listener/observer/task cleanup and conditional owned-status restoration |

There is no duplicate OTP value/default/mask/clear/focus setter. Read native input.value and
defaultValue; use actual type=text/password, disabled/readonly, labels, name/form, and
input.focus()/setSelectionRange() when the application explicitly wants those native actions.
The helper never moves focus or selection. Native fieldset disabled includes its first-legend
exception. `complete` may describe a full readonly/disabled value, but those controls never
emit completion while unavailable; native FormData still excludes disabled controls.

Length/character policy is fixed. Changing maxlength/pattern to another policy disconnects
the helper without rewriting author attributes; recreate with the new matching policy.
Mask changes between native text/password are allowed and silently rebase. Masking is
presentation, not encryption or protection from application scripts/browser extensions.
No custom role, expanded state or per-digit accessible names are added.

## Completion, deduplication and sensitive data

Listen on the original input for nonbubbling `mui:input-otp-complete`.
Its frozen detail is **only** `{ length, characters }`: no code, per-character array,
changed substring, index or clipboard contents. If an explicitly authorized application
action needs the code, read the original input at that action boundary; do not log it.

Completion is eligible only when:

1. The value has exactly the configured ASCII shape and native `validity.valid` is true.
2. Composition has ended and the native field is editable (not disabled, readonly,
   hidden or inert).
3. The previous settled stretch was incomplete/invalid, rather than already complete.
4. The deferred event check still matches its generation, native field boundary and value.

Input/change and composition-end/final-input duplicates coalesce in a deferred task.
An incomplete noncomposing input rearms immediately, so deletion/retyping in the same task
can produce one new completion. Complete→complete replacement is still the same complete
stretch; it produces native input/change, **not another completion notification**.
Unchanged completed composition does not re-complete. Mid-composition updates cannot notify.

Initial complete values, accepted reset defaults, mask/availability changes and explicit
refreshes are silently baselined. Existing Input's default setter is silent; deliberately
dispatching input/change is an explicit eventful signal, not an undetectable silent setter.
A transient value snapshot exists only until the deferred notification check; no complete
code cache, derived hash, persistent store, data attribute or status mirror is maintained.
Direct `.value` changes before that check invalidate the notification. A silent
write-and-revert between checks is not observable without polling—call refresh after every
relevant programmatic transaction.

External custom validity is checked **after ordinary input listeners have run**; an
application error installed by those listeners prevents completion. The helper never clears
that error, overrides native reporting or treats a barred fieldset as a validation anchor.
Changing external validity without an input event does not automatically complete a code;
use explicit refresh for coherent decoration/baselines. A completion event says nothing
about subsequent validity changes or business authentication.

## Reset, ownership and cleanup

Native reset success/cancellation is settled after the default action, using the event
boundary rather than blindly cancelling a pending notification at capture time.
Successful reset cancels pre-reset completion and silently establishes its native default
baseline. A new input event immediately after reset establishes a **new** stretch; old
cleanup cannot suppress it or overwrite new edits. Cancelled reset preserves values,
settled dedupe and a still-guarded pending completion. Silent-write guards still apply.
Reset composition bookkeeping is separate from new composition sessions and query-free
completion generations; Input's own reset/count refresh cannot leave OTP permanently composing.

Ownership is per input/optional status node and rejects competing OTP owners across module
copies. It does not claim existing Input/Form ownership. Original input listeners, label
associations, defaults, selection and form association are never replaced. Removal, invalid
native anatomy or invalid status ancestry disconnects enhancement; the native input remains.
No observers poll values and no provider/hidden model is created.

Optional status shows only counts/local state, never code characters. Its text and
`data-input-otp-state` are conditionally restored if still owned; external replacements
survive teardown. No roles/live regions or ARIA descriptions are injected. Status cannot be
under explicit live ancestry or implicit alert/status/log regions; moving it there stops
enhancement rather than announcing every count. This conservative guard is not a universal
assistive-technology speech guarantee.

## Input/Form composition and submission

Reuse [Input](input.md) when a programmatic editor/helper is useful:

```js
const entry = MarkupUIInput.createInput(document.querySelector("#code-input"))
entry.setValue("001234") // Local dummy example only; silent, string-only, IME-aware.
otp.refresh()
formController.refresh()
```

Do not feed code values into count/help/status templates. The OTP helper never changes
aria-describedby, so [Form](form.md) can add/remove its owned error token while preserving
author help/count references in either teardown order. It never calls reportValidity,
submit/requestSubmit/reset, prevents Enter, reads the clipboard, requests SMS permissions
or starts authentication. Native input/paste/navigation/selection are not reconstructed.

A real application owns secure server-side verification, deliberate submission and
native noValidate/formNoValidate/submitter policy. Client format completion is not a safe
trigger for automatically authenticating or submitting.

The demo deliberately uses an open nonmodal native dialog and `form method="dialog"`.
Without JavaScript, required/pattern still block invalid submission; a valid submit only
closes the dialog with the **submitter's nonsecret** return value, never a code-bearing GET
URL/request. With JS, an application listener prevents submit and displays only the number
of successful named code fields. Disconnect removes that listener to restore native
fallback. This is a local test recipe, not an authentication transport implementation.

## External CSS and single-field adaptation

The [rendered style audit](../style-audit/components/input-otp.md) compares the pinned
six-cell renderer against this deliberately single-field adaptation.
`.mui-input-otp` styles the real field using a monospace font, visible native selection and
focus outline, character spacing and logical sizing. It is **not six hidden/native cells**.
`--mui-input-otp-length` defaults to 6 for width geometry only; author a matching CSS override
for another length. It does not set maxlength or validation policy.
`--mui-input-otp-gap` defaults to **8px** and controls letter spacing, not inter-input
navigation. Width now includes that authored spacing instead of assuming a fixed .5ch
gap, so a larger gap does not silently clip a full code at the default content width.
Tokens are read on the field; no JS style/measurement writes or provider inheritance.
`data-block` uses full available width; small/medium/large fields have **28/34/40px**
heights and **14/14/15px** fonts. These match source cell heights/font sizes, not the
source group's width or per-cell glyph positions. Code direction stays **LTR** inside RTL layout because retained
codes are ordered ASCII strings; labels/layout remain authored RTL. No digit reversal.

Standalone defaults use 3px corners, themed light/dark text, surfaces and placeholders.
Enabled hover/focus use primary borders and source-style light ring/dark glow; the
additional visible system focus outline remains. Native disabled/fieldset-disabled
fields use disabled colors without fading. `aria-invalid="true"` retains its dashed
cue and gains the source error hue; it does not set native validity. Warning status
and per-cell success decoration are not introduced. A complete count is never painted
as authentication success.

| Public CSS tokens | Purpose / default |
| --- | --- |
| `--mui-input-otp-length`, `--mui-input-otp-gap` | Width length 6; character spacing 8px |
| `--mui-input-otp-height`, `--mui-input-otp-font-size` | Override the private size presets |
| `--mui-input-otp-padding`, `--mui-input-otp-radius` | Whole-field horizontal padding 12px; radius 3px |
| `--mui-input-otp-color`, `--mui-input-otp-background`, `--mui-input-otp-border` | Standalone field paint |
| `--mui-input-otp-focus`, `--mui-input-otp-placeholder` | Focus/caret paint; placeholder paint |
| `--mui-input-otp-disabled-color`, `--mui-input-otp-disabled-background` | Native disabled field paint |

Author tokens survive small/large presets. Font family can be changed with ordinary CSS;
the default remains monospace rather than replacing the existing native glyph policy.
At constrained widths the real input may scroll its content; no hidden per-digit layout
or full-code mirror is created.

When composed as Input's `[data-input-control]`, shared Input owns the wrapper face,
font and sizing. OTP does not add a second focused/disabled surface over that owner.
OTP supplies spacing/direction and its retained native selection/focus behavior.
Forced colors use unfaded GrayText disabled text/borders, including placeholders.
Print resets the actual field, placeholder and count to black on white.
The parent-owned Input wrapper still needs its own disabled forced-color border and
focused/status print reset; see the audit's explicit shared proposal. No shared Input
CSS or runtime was changed in this pass.

| Source surface | Retained mapping / explicit omission |
| --- | --- |
| block, gap, size | Native field width, letter spacing and external CSS; not per-cell gap/focus geometry |
| length | Fixed integer 1–12, exact authored maxlength/ASCII pattern; no generated fields |
| default-value, value | Whole native strings/defaults; source array normalization and hidden selected values omitted |
| disabled, readonly, placeholder, mask | Original native attributes/type; no value/selection replacement |
| status | Native/Form validation feedback and optional local count/state; no auth success claim |
| on-focus, on-blur, on-update:value | Original native focus/blur/input/change events, no cell index/array |
| on-finish | Metadata-only deduplicated local completion stretch, not source per-cell finish/value-array callback |
| default slot | One authored native input, not a per-cell InputProps/VNode renderer |
| allow-input | **Omitted** character veto/normalizer; native pattern constrains validity, not mutation |
| focusOnChar | **Omitted** per-cell focus engine; native selection APIs remain application tools |
| update diff/index/source; default index/ref | **Omitted** fabricated cell metadata/ref graph; native InputEvent fields are honest alternatives |
| theme objects, callback/type-array aliases, injected InputProps | **Omitted**, with explicit source identities retained in the tracker |

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/demos/enUS/index.demo-entry.md),
[InputOtp.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/InputOtp.tsx),
[public-types.ts](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/input-otp/index.ts).
The source creates NInput cells, pads/truncates arrays, redistributes/vetoes pasted text,
intercepts Backspace/arrows and emits array/diff/index/source callbacks. Those algorithms
are not ported. Public Markdown describes `value` as string/null, while the implementation
declares array/null; this discrepancy is retained explicitly rather than called parity.

## Four-step acceptance

1. [x] Bounded whole-string/ASCII/native-default/completion contract defined.
2. [x] Original autofill hints, labels, form fields and native editing preserved.
3. [x] Single-field CSS adaptation accepted; per-cell rendering/navigation omitted.
4. [x] Targeted tests, build/budgets, review fixes and browser evidence recorded.

### Style-pass source acceptance

**81 focused tests** (73 existing OTP + eight style regressions) pass with the current
source. Isolated level-nine gzip is **2,280 ESM / 2,352 classic / 994 CSS**; simulated
Windows checkout CSS is **997 bytes**, within unchanged **3,000 / 3,000 / 1,000**
ceilings. Existing esbuild formatting keeps all local focus/media safeguards in budget.
No controller, dependency, shared source or generated asset was changed.

Private actual Chromium evidence covers default/sizes/disabled/readonly/password/
placeholder/error/block/length/author/composed cases in both themes, source-only
warning/success, native input/selection, synthetic paste plus CDP insertion, IME,
completion metadata/deduplication, custom validity, reset, fieldset first-legend
behavior, RTL/zoom, forced-disabled and dark print. Native no-JS required validation
and local method=dialog submission remain. Actual OS clipboard/SMS autofill and
all-platform password artwork are not certified. Integrated release build/publication
and the shared Input wrapper proposal remain with the parent.

### Historical native-workflow evidence and limitations

- **178 tests passed**: OTP **73**, Input 52, Form 53.
  `pnpm exec vitest run tests\input-otp.test.ts tests\input.test.ts tests\form.test.ts`
  and `pnpm build` passed. No legacy/native Input/Form source or dependency changed.
- Read-only review found successful/immediate reset stretch handling, cancelled pending
  completion, invalid autocomplete token lists and inherited live-status ancestry defects.
  Fixes have regression coverage and Chromium probes.
- Dedicated local **4188** Chromium demo verified leading zeroes, password presentation,
  one successful named code field, metadata-only/deduplicated completion, deletion rearming,
  native selection, required reporting/focus, silent setters, defaults/reset/cancel,
  readonly/disabled/fieldset first-legend eligibility and external form-associated reset.
- Native paste-event default was not prevented. A **synthetic paste payload plus CDP
  multi-character insertion** preserved leading zeroes and exercised native maxlength.
  No system clipboard was read or written; trusted OS paste/autofill is not claimed tested.
  CDP IME in text presentation held editing state without notification and emitted exactly
  one signal after commit; this is not every OS IME/password-autofill implementation.
- Browser probes verified immediate post-reset re-completion, cancelled pending completion,
  external custom-error suppression/preservation, invalid hint rejection, inherited live
  guard, original help tokens and ESM/classic/Input/Form/legacy coexistence.
- LTR/RTL at **1280px/375px**, **200% CSS zoom**, dark/forced-colors/reduced-motion emulation
  preserved visible fields without page overflow; ASCII code direction remained LTR.
- Separate JS-disabled Chromium verified native invalid blocking/reset and valid local
  method=dialog close, nonsecret submitter return value, no URL query and one code control.
  Context closed afterward. No mobile SMS autofill/WebOTP permissions, live authentication,
  Safari/Firefox or universal AT behavior was tested or promised.
- Final dedicated-demo console/network checks had no errors/warnings or nonstatic requests.
  The prior Auto Complete demo tab was restored after review, and the OTP demo was reloaded
  to its original empty state.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| OTP ESM | 4,941 | 2,280 | 3,000 |
| OTP classic | 5,107 | 2,352 | 3,000 |
| External CSS | 1,054 | 507 | 1,000 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **149 prior top-level JS/CSS assets** were built in memory with the pre-OTP HEAD recipe
and byte-compared against current outputs; all match. No earlier optional budget was relaxed.
Reference audit: **23 original section/source/kind identities exactly preserved in order +
eleven explicit source supplements = 34 rows (17 adapted, 17 omitted)**. Catalog:
**3,593 rows, 256/384 tasks across 64 accepted pages**, 128 unchecked. P4 has **907 rows**,
six Planned routes and 337 unresolved rows. **397 scoped relative file links** and diff whitespace were checked.
**Next: Dynamic Input, then Dynamic Tags**; Mention, Color Picker, Date Picker and Time
Picker remain later routes. No full P4/P0/P5/P6 or source array/renderer parity is claimed.
