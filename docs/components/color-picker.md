# Color Picker: classic native RGB with optional hex drafts

**🟢 Verified retained native RGB scope.** The original `input[type=color]` owns its chooser,
preview, current/default value and successful form value. A small optional helper validates
six-digit hex setters and synchronizes a readable value/optional literal hex draft.
No HSV plane, color parser library, popup/portal engine, injected style, dependency,
EyeDropper/screen capture, clipboard access or permission side effect.

**Black is a color, never “cleared”.** Empty/null, alpha, alternate formats and extended
gamut are outside this helper. Native controls with those capabilities may be authored
separately; this module refuses to flatten them into RGB.

## Loading and native anatomy

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/color-picker` | ESM `createColorPicker`, `ColorPickerController` |
| `dist/markup-ui-color-picker.js` | Independent optional ESM |
| `dist/markup-ui-color-picker.global.js` | Classic `MarkupUIColorPicker.createColorPicker`; refuses namespace replacement |
| `@dataengine/markup-ui/color-picker/style.css` | External `dist/markup-ui-color-picker.css` |
| [Demo](../../demo/components/color-picker.html) | Separate native HTML/CSS/JS, optional Form/local inspection and literal datalist palette |
| [Reference](../naive-ui/components/color-picker.md) | Original properties/slots/inline identities and explicit source supplements |

```html
<fieldset class="mui-color-picker" data-color-picker>
  <legend>Accent</legend>
  <label for="accent">Choose color</label>
  <input class="mui-color-picker__control" data-color-control id="accent"
         type="color" name="accent" value="#336699">
  <span class="mui-color-picker__output" data-color-output hidden></span>
</fieldset>
```

The root/field must be connected light DOM and retain their original mapping. Native
labels/name/form association stay authored. No replacement roles or hidden color field
are introduced. The optional readout is plain nonlive text, outside label/interactive/live
regions, and starts hidden so no-JS content does not falsely claim a changing current hex value.

A native datalist may supply swatches:

```html
<input type="color" list="palette" value="#336699">
<datalist id="palette">
  <option value="#336699" label="Blue"></option>
  <option value="#008844" label="Green"></option>
</datalist>
```

Retained datalist values must themselves be six-digit hex. Original options are preserved,
not rendered by a palette helper. Whether/how a native chooser presents the palette is
browser-dependent; no custom swatch click/selection event or popup styling is claimed.

## Strict value, null and advanced-mode boundaries

Supported setter grammar is **exactly seven characters**: `#[0-9a-fA-F]{6}`.
Uppercase hex is accepted and canonicalized to lowercase, matching classic native RGB
serialization. Whitespace, trailing newlines, shorthand, names, rgb()/hsl()/hsv(), alpha
hex, transparent, CSS color() and null/undefined are rejected **before mutation**.

```js
const picker = MarkupUIColorPicker.createColorPicker(root)
picker.setValue("#AABBCC") // Silent canonical #aabbcc; defaults unchanged.
picker.setValue(null)      // Throws; does not become black.
```

No clear/nullable mode is supplied. A real `#000000` remains a successful black color value.
An absent native value attribute may use the browser's default black. An explicitly invalid
default attribute, including value="", is rejected, rather than treating native black
normalization as evidence that the requested value was valid.

The helper rejects **any** alpha/colorspace attributes, even if a browser currently ignores
them, and requires native current/default RGB serialization. It does not change those
attributes or convert existing advanced data. It also rejects readonly and required on the
native color field: color has no text-style readonly or required-empty semantics here.
Use actual disabled/fieldset semantics and an application-owned opt-out design separately
if a product needs an optional color; do not invent an empty native color or hidden proxy.

**Native API limit:** a direct external `control.value = "invalid"` may already be normalized
to black by the browser before any observer can see the attempted value. No helper can
recover that discarded intent from the resulting valid black string without patching the
native setter. Use the validated helper setter; this module does not poll/monkey-patch
properties or claim to detect every bypass of its API.

## Optional hex editor

The auxiliary editor is an **unnamed** real text input with matching native pattern,
maxlength=7 and required. It shares the native color field's actual form owner. It starts
explicitly disabled inside a hidden entry region so it cannot block or duplicate no-JS
form submission:

```html
<div class="mui-color-picker__entry" data-color-entry hidden>
  <label for="hex">Hex draft — Apply before submitting
    <input class="mui-color-picker__hex" data-color-hex id="hex" type="text"
           value="#336699" required pattern="#[0-9a-fA-F]{6}"
           maxlength="7" autocomplete="off" disabled>
  </label>
  <button type="button" data-color-apply hidden>Apply hex draft</button>
  <button type="button" data-color-revert hidden>Revert draft to current color</button>
</div>
```

Apply is required when a hex editor is present; Revert is optional. Both are named native
type=button controls outside the label/other interaction. All mappings are distinct and
stable. No hidden successful field is added: **only the actual color input is named**.

Draft policy:

- Native typing/paste/selection/IME remain native. Incomplete/invalid text is kept.
- Initial text matching its native default is treated as pristine and synchronized to the
  actual current color; a pre-enhancement value differing from its default is retained as
  a draft. Text defaults themselves are never rewritten.
- A clean editor follows native color changes/silent setters. A dirty or composing editor
  does not: the native preview/readout shows the current color while the draft remains
  available to finish or explicitly discard.
- Apply/Enter commits only a valid full hex draft satisfying its own native validity.
  Valid uppercase text canonicalizes to lowercase. Invalid drafts never normalize to black.
- Native required/pattern validity supplies feedback. A user Apply/Enter rejection can use
  native reportValidity; direct `commit()` returns false without forcing focus/reporting.
  The helper never calls setCustomValidity or replaces application errors.
- Revert discards **only the draft** in favor of current color; it is not “clear color”.
  Blur does not commit or discard. There is no destructive Escape/Backspace shortcut.
- Hex Enter is reserved against accidental form submission; modified/repeated/IME Enter
  does not apply. An ending composition turn is fenced; a later deliberate action can apply.
- Queued Apply/Revert check their captured draft/revision/current color before acting;
  newer edits or resets cannot be silently discarded by an older click.

The editor remains native-validatable while enhanced, despite being unnamed. An invalid
visible draft can therefore block form submission, even though only the committed color
is serialized. Apply/Revert/reset deliberately resolves that state. When the entry is
hidden, the auxiliary field is disabled rather than leaving an invisible invalid control.
Application disabled overrides remain authoritative.

## Controller API, events and synchronization

| Member | Contract |
| --- | --- |
| `control`, `hex` | Original color input and optional native draft field |
| `value` | Current canonical RGB string; validates retained native anatomy |
| `dirty` | Unapplied native text state, including silent field changes |
| `connected`, `error` | Lifetime and reported unexpected anatomy/value error |
| `setValue(hex)` | Validated **silent** current color setter, no default mutation; preserves dirty drafts |
| `commit()` | Explicit user-like valid draft apply; boolean acceptance, not dialog confirmation |
| `restoreDraft()` | Explicit silent discard to current color; does not change color or defaults |
| `refresh()` | Silent synchronization/validation; preserves dirty drafts and clean-field caret ranges |
| `disconnect()` | Idempotent cleanup, restore owned attributes/readout, retain edited color/draft/defaults |

Native picker input/change events retain their original listeners and are **not duplicated**.
A changed explicit draft Apply emits one color input followed by one change, unless a
reentrant input handler supersedes the value/action. An unchanged valid Apply emits neither.
Only the exact events generated by the helper are ignored by its synchronizer; distinct
reentrant native input events still update the clean draft/readout and supersede stale change.

These are not guaranteed equivalents of framework on-complete/on-confirm. Native chooser
live/commit timing varies by browser/OS. There is no universal open state/hide-picker API,
no automatic showPicker call and no inferred on-update:show.

Unrelated DOM/status updates and no-op refreshes do not invalidate a still-valid queued
Apply. Semantic edits, explicit setters/discard, native input and reset boundaries are
tracked separately. There is no input-event loop, text caret churn from identical writes,
global value polling or style injection.

`mui:color-picker-error` on the root reports unexpected unsupported anatomy/value changes.
Direct invalid setters throw immediately; invalid user drafts use native validity/false
commit results. Changing to unsupported advanced attributes withdraws enhancement without
flattening current native data. To reconfigure, disconnect and author the new supported
native anatomy instead of treating this as a generic color-format state machine.

## Reset, disabled state and ownership

Native form.reset owns current/default values. Tracked post-default **tasks**, not an
assumption about reset microtask timing, reconcile readout and clean hex state. Refresh
inside reset dispatch cannot preserve an obsolete dirty flag. Immediate post-reset edits/
commits are recognized before old cleanup runs; cancelled reset leaves drafts/current values
alone. A newly started composition session is not cleared by an older reset.

Paired inputs must share the same actual form owner, including explicitly external form
association. Native fieldset disabling/first-legend behavior is unchanged. Programmatic
setValue remains available while disabled; user Apply respects native availability and
readonly/composition of the auxiliary editor.

Attribute leases own only enhanced output/entry/action visibility and auxiliary/action
disabled state. Outside changes are preserved conditionally. Current color and dirty draft
are retained on disconnect, while the unnamed auxiliary field returns to disabled/hidden
fallback. A focused action/editor that becomes hidden/unusable recovers to an available
local field, never an unrelated outside control. The helper never focuses or opens an OS
picker as part of async/background work.

[Input](input.md) can independently decorate the native hex field; [Form](form.md) can
coordinate native constraints. Original labels/ARIA/help/error tokens are not taken over.
Tests cover both Input-first and Color-first reset ordering; no prior helper was modified.
The demo explicitly composes native Form inspection and removes its own submit listener
on disconnect. The library itself neither submits nor fetches.

## External CSS and full source disposition summary

Native color input is the chooser/preview. CSS styles its outer size/border, plain hex
readout, optional entry/actions, focus and wrapping. Small/medium/large classes do not
claim control over native dialog UI. Native datalist swatches are authored data, not injected
background-color nodes. No RGB/HSL/HSV parser, alpha slider, eye dropper or undo plane.

| Source surface | Retained native adaptation / explicit omission |
| --- | --- |
| default-value/value | Validated six-digit native RGB strings/defaults; null/clear and advanced formats excluded |
| show-preview | Existing native color swatch and optional readable hex, not a separate source preview panel |
| disabled/size | Actual disabled/fieldset semantics and external control sizing |
| swatches | Literal native datalist options, browser-dependent chooser presentation |
| on-update:value | Original native input/change plus documented explicit draft Apply events |
| action/label slots | Authored native draft actions/labels/plain readout, not VNodes inside a custom popup |
| default-show/show/placement/to/on-update:show | **Omitted** owned popup/open/close/portal interfaces |
| modes/show-alpha | **Omitted** format/alpha/gamut editing; no silent flattening |
| render-label | **Omitted** VNode label callback; text stays text |
| on-complete/on-confirm/on-clear/actions | **Omitted** framework toolbar callbacks and nullable clear; native change is not universal confirmation |
| trigger slot and value/onClick/ref fields | **Omitted** custom trigger/ref graph; use the actual native color control's user activation |
| source aliases/internalActions/theme/type/slot/render interfaces | Explicit source supplements, not framework compatibility exports |

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/demos/enUS/index.demo-entry.md),
[ColorPicker.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/ColorPicker.tsx),
[interfaces](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/interface.ts),
[public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/color-picker/index.ts).
Source HSV/alpha/palette conversion and toolbar/history machinery is not ported.
The source public callback intersection `string & null` differs from its implementation's
string/null union; those identities are recorded, not claimed as native event ABI.

Legacy `mui-color-picker` in `src/plugins/widgets.ts` remains unchanged. It creates its own
color input and has a looser raw string setter; the new optional module does not silently
upgrade that widget. Browser coexistence used explicit `mui.use(widgetsPlugin)`.

## Four-step acceptance

1. [x] Original labelled native picker/field/default/reset contract retained.
2. [x] Plain readout and optional validatable dirty hex draft synchronization implemented.
3. [x] Advanced formats/nullability/popup/toolbar contracts explicitly reduced rather than imported.
4. [x] Targeted tests/build/review and Chromium native value/form/focus/media/fallback evidence recorded.

### Evidence and limitations

- **153 tests passed:** Color Picker **48**, Input 52, Form 53.
  `pnpm exec vitest run tests\color-picker.test.ts tests\input.test.ts tests\form.test.ts --reporter=dot`
  and `pnpm build` passed. No previous helper/core/plugin source or dependency changed.
- Read-only review found native reset-click timing, irrelevant-mutation Apply cancellation,
  pre-default refresh dirty-state retention and reentrant input synchronization defects.
  All fixed with regressions and actual Chromium reset/Apply probes.
- Dedicated **4188** Chromium verified uppercase canonicalization, invalid/empty/null/
  shorthand/alpha/name/gamut rejection before mutation, dirty-draft preservation on a
  silent primary change, native pattern feedback/focus, one explicit input/change pair,
  native reset clicks/cancellation, reentrant replacement input and one named FormData value
  plus submitter.
- Native type=color and showPicker method availability were inspected; datalist association/
  literals were checked. **No native chooser, EyeDropper/screen picker or clipboard operation
  was invoked. Native dialog/palette UI, all-browser color space/alpha or confirm timing are
  not claimed verified.**
- Advanced alpha/display-p3 markup was rejected while preserving the browser's existing
  value/attributes. Explicit widgets plugin installation coexisted with ESM/classic/native
  enhancement without changing old registration behavior.
- CDP text composition did not auto-apply; a later explicit Enter committed. Clean-field
  caret 2–5 survived refresh. LTR/RTL **1280px/375px**, **200% CSS zoom** and dark/forced-
  colors/reduced-motion emulation retained visible native controls without page overflow.
- A separate JS-disabled context verified native color value/default reset and GET
  FormData/submitter. Auxiliary entry remained hidden/disabled and submitted no duplicate
  field. Context closed. No Safari/Firefox/OS dialog/AT certification is implied.
- Final teardown preserved the edited native color, invalid draft and help reference while
  hiding/disabling auxiliary UI; only the native color field remained successful. Console/
  network checks had no errors/warnings or nonstatic requests. The demo was reloaded.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Color Picker ESM | 9,693 | 3,892 | 4,500 |
| Color Picker classic | 9,871 | 3,964 | 4,500 |
| External CSS | 1,258 | 458 | 1,000 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **161 prior top-level JS/CSS assets** were built in memory with the pre-component HEAD
recipe and byte-compared with current output; all match. No earlier optional budget was
relaxed. Reference audit: **25 original section/source/kind identities exactly preserved
in order + ten supplements = 35 rows (10 adapted, 25 omitted)**. Catalog: **3,634 rows,
272/384 tasks across 68 accepted pages**, 112 unchecked. P4 has **948 rows**, two Planned
routes and 213 unresolved rows. **416 scoped relative file links** and diff whitespace were checked.
**Next: Date Picker, then Time Picker**; no full P4/P0/P5/P6 or source advanced color/UI
parity is claimed.
