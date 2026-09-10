# Input Number: native numeric editing and stepping

**🟢 Verified for the retained native scope.** An authored `input[type=number]` owns
editing, exposed string/numeric value, defaults, constraints, keyboard/wheel and forms.
The optional helper supplies labelled custom step/clear actions and derived availability,
not a numeric parser, decimal library or second spinbutton engine. The legacy widgets
plugin's `MuiInputNumber` and its bundle are unchanged.

## Loading and native anatomy

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/input-number` | ESM `createInputNumber`, `InputNumberController`, `InputNumberState` |
| `dist/markup-ui-input-number.js` | Self-contained optional ESM |
| `dist/markup-ui-input-number.global.js` | Classic `MarkupUIInputNumber.createInputNumber`; rejects namespace replacement |
| `@dataengine/markup-ui/input-number/style.css` | External `dist/markup-ui-input-number.css`; native-only use needs no JS |
| [Demo](../../demo/components/input-number.html) | Separate HTML/CSS/JS, local native forms and GET fallback |
| [Pinned dispositions](../naive-ui/components/input-number.md) | Every original owner/prop/slot/method/inline identity and explicit supplements |

```html
<label for="quantity">Quantity</label>
<div class="mui-input-number" data-input-number id="quantity-field">
  <input data-number-control id="quantity" type="number" name="quantity"
    value="0.1" min="0" max="1" step="0.1" required>
  <button data-number-decrement type="button" hidden aria-label="Decrease quantity">−</button>
  <button data-number-increment type="button" hidden aria-label="Increase quantity">+</button>
  <button data-number-clear type="button" hidden>Clear quantity</button>
</div>
```

After one helper format and the external stylesheet, an external setup script may call:

```js
const quantity = MarkupUIInputNumber.createInputNumber(document.querySelector("#quantity-field"))
quantity.setValue(0.15) // Silent, remains a native stepMismatch; no clamp.
quantity.step(1)        // User-like native stepUp and one input/change pair if numeric value changes.
quantity.setValue(null) // Silent true empty, not zero.
quantity.control.defaultValue = "0.4" // Independent next reset default.
```

There is no registration/load-order rule for `mui-input-number`: this helper operates the
authored native control and does not upgrade legacy elements. No mandatory Input/Button,
provider or external runtime dependency. Nonenumerable root/control owner symbols reject
duplicate ownership across ESM/classic copies.

The root is a connected light-DOM `.mui-input-number[data-input-number]`, without a role
or tabindex and outside labels, buttons, links and summaries. It has one original labelled
`input[data-number-control][type=number]`, with no replacement spinbutton role.
Optional decrement/increment/clear buttons are named `type=button`, without nested
interactive content or unrelated commands. A minus/add icon is authored decorative
button content; keep a real accessible button name.

Labels, name, ARIA descriptions, default/current values, listeners and prefix/suffix nodes
remain intact. Do not wrap action buttons in the input's label. Anatomy is fixed for one
controller lifetime; disconnect/recreate for control replacements. Hide JS-only buttons
in authored HTML. Native input steppers are **never suppressed** by the stylesheet, so
no-JS fields retain their keyboard/native stepper path while custom buttons remain hidden.

## Nullable numbers, bad input and defaults

`state` is a fresh snapshot:

| Field | Meaning |
| --- | --- |
| `value` | Finite native valueAsNumber, otherwise null |
| `text` | Exposed native `.value` string, not a reconstructed locale/invalid UI draft |
| `empty` | Exposed string empty **and** badInput false |
| `badInput` | Native invalid numeric editing state |
| `valid`, `valueMissing`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch` | Native validity flags, not a schema or automatic live message |
| `canIncrement`, `canDecrement` | Custom-action editability plus whether native stepping can change the numeric value |
| `stepError` | Native stepping error text, or a nonfinite-result guard error; null if no error |

Empty, invalid editing and zero are different. For example Chrome can display `-` while
exposing `.value === ""`, valueAsNumber NaN and badInput=true. This is `{ value:null,
empty:false, badInput:true }`, not zero and not a fabricated last-valid-value model.
The browser's private invalid/localized draft is not reproduced in JavaScript.

Out-of-range or off-grid **numeric** input still has its finite numeric value, accompanied
by native invalid flags. Ordinary input/change/blur does not rewrite it. Required empty
input stays invalid. Application custom validity remains on the original control; no
validator callback, default coercion, rounding-on-blur or automatic aria-invalid is added.

`setValue(number|null)` accepts only finite JS numbers or null; string, NaN, infinity,
boolean and other types are rejected without coercion. Numbers assign native valueAsNumber;
null clears native value. Setters remain silent and may intentionally write out-of-range
values or disabled/readonly controls. They never modify native defaultValue.
During tracked composition setters throw rather than replace a native draft.

Native `defaultValue`/the value attribute supplies reset state and can also supply the
native **step base** when min is absent. Current `.value`/valueAsNumber are separate.
Direct property writes emit no user events and are not MutationObserver-observable;
call refresh after application writes when derived buttons need updating. Attribute
changes to constraints/defaults/disabled/readonly are observed. No prototype interception.

## Native stepping, not decimal arithmetic

| Controller operation | Contract |
| --- | --- |
| `control`, `connected`, `error` | Original input, lifetime and latest structural/action error |
| `state` | Native snapshot above; may inspect without changing the real field |
| `setValue(number|null)` | Silent programmatic native assignment; no clamp/default update |
| `step(1|-1)` | One native stepUp/stepDown action, respecting UI editability; returns false at a numeric no-op |
| `clear()` | User-like clear, false for empty/noneditable/composing; also clears a native badInput draft |
| `refresh()` | Silent state/derived-control refresh without rewriting the input |
| `disconnect()` | Idempotent observer/listener/task/owner cleanup; preserves edited numeric/default state |

A strictly private **off-DOM native input probe** is used to determine available steps.
It is never inserted, named, form-associated, labelled, styled or submitted. It copies
only min/max/step and the **value attribute**, then current value. Native stepUp/stepDown
performs the probe operation. The accepted action invokes the corresponding method on the
original control; no arithmetic result is copied from the probe into the form field.

This preserves native grid alignment, decimal/bound handling and value-attribute step base:
for example default value 0.15, step 0.2 and current 0.3 steps upward to **0.35**, not naive
0.5. The helper does not add floating-point values, parse formatted strings, round to a
requested precision or implement arbitrary-precision money arithmetic.

- Empty remains null on read. An **explicit native step** may use the browser's zero/grid/
  bound starting rule; that does not turn every empty state into zero.
- Off-grid and out-of-range values remain unchanged until an explicit native step or
  application write. That step may align/clamp according to the browser's native rules.
- `step="any"` has no stepUp/stepDown API grid. Its native InvalidStateError appears in
  state.stepError, custom buttons are unavailable, and explicit controller.step throws.
  Native keyboard/wheel UI policy is still browser-owned; no handler suppresses it.
- Malformed min/max are interpreted/ignored by the native input. Nonpositive or invalid
  step uses native fallback rules, not the upstream custom absolute-step parser.
  Contradictory bounds and no representable next number yield unavailable/no-op actions.
- If a native probe does not produce a finite number, the helper disables that step and
  explicit stepping surfaces a RangeError instead of silently clearing a number.
- Huge finite JS/native values are allowed, but no safe-integer/arbitrary-precision
  guarantee is added. If native stepping cannot change the represented number, no user
  event is emitted. A same-number serialization change alone is not a reason to step;
  boundary text such as `"1.00"` is not normalized just by an unavailable custom action.

Custom steps/clear are blocked by actual readonly, disabled/fieldset, hidden/inert,
advisory aria-disabled/aria-readonly and composition. Custom steps additionally refuse
badInput drafts rather than treating their empty exposed value as zero. Explicit clear
can discard such a draft. Native arrow keys, key repeat, wheel behavior, editing and
selection stay browser-owned; there are no key/wheel/drag or hold-repeat handlers.
Native number selection APIs have their own support limits; no caret/range shim is added.

## Events, focus, reset and ownership

A successful **custom numeric step** emits exactly one synthetic bubbling/composed native
input, then one bubbling native change, only when the numeric value actually changes.
At a no-op boundary it emits nothing; native stepping errors are not successful changes.
Ordinary native input/change is neither replaced nor duplicated.

A successful clear emits input, change, then bubbling `mui:input-number-clear` with
`{ previous: { value, text, badInput } }`. Clearing badInput is an actual editing-state
change even if its exposed `.value` was already empty. Native change from leaving the
previously edited field may occur **before** the separate clear/step sequence; that
browser edit-commit event is not a duplicate helper notification.

Button actions run in the next task so later click preventDefault is honored. Buttons do
not submit. When a focused boundary button becomes disabled, focus returns to the native
number before disabling it. A focused clear button returns focus before hiding. Existing
native disabled fields cannot be focus targets; the containing application owns focus
recovery when it disables/removes an entire surface.

Native form submission sends the actual input string once. Readonly values remain
successful; disabled/fieldset controls are excluded. A document capture reset listener
refreshes after the native reset default action, follows the control's current form owner/
changed IDs, and preserves cancelled resets. Reset/setters/refresh emit no fabricated
user edit events. Defaults are not rerun on reconnection.

Only helper-owned button hidden/disabled attributes and root/control owner symbols are
temporary. Outside mutations are consumed before helper writes; disposal restores only
still-owned attributes, not whole author attribute sets, field values, constraints or
ARIA. No-op removal of an already absent attribute cannot signal an ownership transfer.
Root/control removal disconnects; recreate to reconnect. Invalid anatomy is rejected by
explicit operations and reported by nonbubbling `mui:input-number-error` for automatic/
action failures. Native step errors can also be inspected through state.stepError.

## CSS and complete upstream mapping

CSS supplies a shared field background/inset boundary, flex/wrapping, native input
sizing/focus, action shapes and affixes. The real input is neither hidden nor replaced.
The root uses border-box sizing so explicit widths include its padding; the original
native control retains `max-inline-size:100%`, including for authored nonshrinking widths.
For button-placement right, author decrement/increment after the input; for both, author
decrement before and increment after it. There is no CSS reordering that changes visual
order independently of native Tab order. No show-button renderer: omit/hide optional
custom buttons, retaining native steppers.

`data-size="tiny|small|medium|large"`, data-round, data-borderless and
data-status="success|warning|error" are external presentation. Status is not native
validity or a live announcement. Logical dimensions preserve RTL/wrapping. Forced colors
retain native controls; print hides custom actions. No animations need motion overrides.
Tokens share `--mui-number`: `-color`, `-font`, `-pad`, `-border`, `-radius`, `-background`,
`-focus`, `-disabled`. No Input/Button/theme-provider/CSS-in-JS dependency.

The [default-style audit](../style-audit/components/input-number.md) records measured
geometry, paint and retained differences. Field heights are **22/28/34/40px**, fonts
**12/14/14/15px**, and leading insets **8/10/12/14px**, with an 8px trailing inset.
`-pad` controls the leading field inset; background, border and radius tokens now paint
the combined field rather than separate boxes around the input and every action.
An ancestor `data-mui-theme="light|dark"` selects the local preset; standalone fields
default to light. Private size/status defaults never overwrite public author tokens.
Neutral defaults do not use the legacy shared text roles.

Custom actions are borderless, intrinsic authored buttons. An authored 18px decorative
icon produces an 18px action box; text labels remain supported and are not clipped to
icon width. No plus/minus/clear artwork is generated or copied. Button order and native
Tab order remain authored; adjacent decrement/increment icons have no extra internal gap.
All other authored siblings use a 4px gap. Naive's extra 10px prefix/suffix slot margins
are not inferred from arbitrary child content; authors can add external spacing where
their intended prefix/suffix anatomy requires it.

Ordinary focus uses the light primary ring or dark primary glow and field tint. Explicit
status remains the retained **border-only** presentation; it does not import Input's
separate status-specific hover/caret/focus palette. Borderless retains a visible keyboard
focus ring. Native number spinners, editing/selection support, caret and locale grammar
remain browser-owned rather than replaced by Naive's text-field/parser machinery.
Forced colors supplies explicit field/action focus outlines and system disabled colors,
without compounded button opacity. Print retains the native field and hides custom actions.

| Upstream item | Retained adaptation or explicit omission |
| --- | --- |
| autofocus, input-props, placeholder | Authored native attributes/properties; type fixed to number, no prop object forwarding |
| value, default-value | Native number/null snapshot and defaultValue attribute/reset; no controlled text buffer |
| disabled, readonly, min, max, step | Native control attributes/constraints and stepping rules |
| bordered, round, size, status | External CSS tokens/classes, not Form/provider state |
| button-placement, show-button | Authored native button presence/order; no reorder/render engine |
| clearable, on-clear | Explicit native-button clear and the documented sequence |
| keyboard | Native keyboard retained; configurable suppression is omitted |
| keyboard.ArrowUp?, keyboard.ArrowDown? | **Omitted** per-key disabling flags; no duplicate native key handlers |
| on-blur, on-focus, on-update:value; source onUpdateValue | Native events and state.value/badInput/validity, not numeric callback registration |
| format, parse, precision | **Omitted** arbitrary strings/parsers/precision/locale round-trip; native browser rendering/grammar only |
| update-value-on-input | **Omitted** last-valid/model-timing policy; observe native input versus change explicitly |
| validator | **Omitted** callback validator; native constraints or application-owned setCustomValidity |
| loading | **Omitted** spinner/reserved-width prop; author external status/readOnly/disabled where desired |
| add-icon, minus-icon, prefix, suffix slots | Authored safe button content/affixes with actual labels, not VNodes |
| focus, blur; source InputNumberInst/select | Native control methods, with native number-selection support limits |
| Source min/max/step string variants, InputNumberSize/Size | Native raw attributes and four CSS sizes, no custom parseNumber normalization |
| Source deprecated onChange, OnUpdateValue, InputNumberSlots, theme/themeOverrides/builtinThemeOverrides, hold-repeat constants | **Omitted** callback/slot/provider/pressed-repeat framework contracts |

## Acceptance

### Original native-contract acceptance (historical)

Local evidence is obtained on 2026-09-09 with server 4188 and a dedicated Input Number tab.
No universal browser/AT/native-formatting, arbitrary-precision or upstream framework parity
is claimed. The dimensions and asset bytes below describe that original revision.

- **116 targeted tests passed**: 37 InputNumber, 52 Input and 27 native/legacy regressions,
  using `pnpm test -- tests\input-number.test.ts tests\input.test.ts tests\native.test.ts`.
  Coverage includes original control/default/listener identity, detached-probe absence from
  document/form controls, strict setters, decimal/grid bases, no-op/error cases, nullable
  state, composition protection, readonly/fieldset, focus/events/reset, author attributes,
  duplicate ownership/anatomy and disposal.
- Chromium **151.0.7922.174** exercised custom 0.1 → 0.2 stepping, off-grid native
  ArrowUp alignment, value-attribute base 0.15/step 0.2/current 0.3 → **0.35**, and
  boundary focus recovery. A second increment at max was a no-op with no event.
  step=any reported native InvalidStateError and disabled custom steppers.
- Real native typing of `-` exposed `{ value:null, text:"", empty:false, badInput:true }`;
  custom steppers were disabled without overwriting the draft. Continuing to `-1` preserved
  the typed out-of-range number. Explicit clear restored actual empty/badInput=false.
  The observed blur emitted one original native change for the bad draft, followed by the
  helper's single input/change/clear sequence. Native select/edit and ordinary typing undo
  were also exercised; no caret/range engine was added.
- Changed defaults/cancelled reset, readonly UI blocking with allowed silent assignments,
  readonly FormData, disabled-fieldset/first-legend, external form ownership and renamed
  form IDs passed. `1e308` stayed finite and unchanged when increment was not representable.
  Malformed constraints used native fallback and contradictory bounds disabled both actions.
- 360px RTL and 200% **CSS zoom** had no page overflow. Forced colors retained the native
  input; reduced-motion context and print/native-field/custom-action visibility passed.
  This is not browser-UI zoom, OS locale round-trip or native-theme pixel parity.
- JS-disabled Chromium used native ArrowUp, reset and real local GET submission with no
  probe/external duplicate field. Standalone ESM/cross-format ownership passed. Both
  helper-before-core/widgets and core/widgets-before-helper worked, including an actual
  legacy mui-input-number changing 2 → 3 without affecting the new native field.

`pnpm build` passed TypeScript and all existing/new budgets. No dependencies, prior control
helpers, core/plugin source or legacy widget behavior were modified.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-input-number.js` | 7,320 | 2,859 | 3,500 |
| `markup-ui-input-number.global.js` | 7,495 | 2,932 | 3,500 |
| `markup-ui-input-number.css` | 2,483 | 770 | 1,000 |

CSS-only native number input costs **770 gzip bytes**, no JS. One helper format plus CSS
costs **3,629 ESM / 3,702 classic gzip bytes**. All **136 prior top-level JS/CSS assets**
are SHA-256 byte-identical; core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**
under unchanged **15,000/3,000/4,000** ceilings.

All **36 original identities** remain plus ten source supplements: **46 rows = 33 adapted
targets + 13 omissions**. Catalog totals are **3,539 rows and 236/384 accepted tasks across
59 pages**, with edited local file links validated. P4 remains In progress.
**Next Slider**, then Rate/native controls before Form enhancements.

### Default-style audit, 2026-09-10

**42 Input Number-only tests passed**: all 37 original native cases plus five CSS
regressions. Private Chromium comparisons covered four sizes, empty/disabled/readonly,
min/max availability, both action placements, prefix/suffix, clear, round/borderless,
status presentation, hover/focus and both schemes. The linked audit explicitly separates
matched geometry from authored-affix, native-spinner and peer-theme differences.

Browser probes passed for a real native-spinner click (2→2.5), custom boundary stepping
and focus recovery (9.5→10), no-op event suppression, native value-attribute step base
(0.3→0.35), bad-input drafts, out-of-range values, clear event order and focus, step=any,
native selection API limits, reset and readonly/disabled FormData. No stepping probe
appeared in the DOM. All eight public tokens were verified.

Forced colors preserved native number appearance, explicit field/action focus, and full
disabled-button opacity with system colors. First-legend disabling, print, reduced motion,
RTL at 360px/200% CSS zoom, and no-JS ArrowUp/reset/FormData passed. These are Chromium
observations, not all-engine, physical high-contrast, OS locale or IME certification.

The sizing follow-up used no global box-sizing reset: explicit 360px and full-width
360px roots both remained 360px, rather than the prior 380px. A 160px container with
28px public leading padding and 18px font bounded an authored nonshrinking 1000px input
to the available 124px. Narrow/RTL/200% CSS zoom had no container or page overflow;
native appearance and forced-color focus remained intact.

| Isolated asset | Raw bytes | Gzip level 9 | Unchanged ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-input-number.js` | 7,320 | 2,859 | 3,500 |
| `markup-ui-input-number.global.js` | 7,495 | 2,932 | 3,500 |
| `markup-ui-input-number.css` | 3,064 | 999 | 1,000 |

The equivalently compacted CSS is one line without a trailing line ending, so a CRLF
checkout has the same bytes. Enhanced totals are **3,858 ESM / 3,931 classic gzip bytes**.
JavaScript, Input/shared helpers, dependencies, build scripts and generated files are
unchanged. No full build, commit or push was performed.
