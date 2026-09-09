# Slider: native ranges and an honest two-track pair

**🟢 Verified for the retained native scope.** A native range input owns pointer/keyboard
movement, bounds, step, current/default value, labels and forms. Optional helpers update
non-live readouts/accessibility text and expose strict scalar/pair setters. There is no
hidden input, synthetic slider-role handle, drag geometry engine or tooltip dependency.
Legacy `MuiSlider` in `src/components/forms.ts` is unchanged.

## Loading and anatomy

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/slider/style.css` | External `dist/markup-ui-slider.css`; native ranges need no JS |
| `@dataengine/markup-ui/slider` | ESM `createSlider`, `createSliderPair`, options/controller/change types |
| `dist/markup-ui-slider.js` | Self-contained optional ESM |
| `dist/markup-ui-slider.global.js` | Classic `MarkupUISlider.createSlider/createSliderPair`; refuses namespace replacement |
| [Native demo](../../demo/components/slider.html) | Separate HTML/CSS/JS, two native tracks and local form/GET fallback |
| [Pinned dispositions](../naive-ui/components/slider.md) | All original identities plus explicit source supplements/omissions |

```html
<label for="volume">Volume</label>
<div class="mui-slider" data-slider id="volume-field">
  <input data-slider-control id="volume" type="range" name="volume"
    min="0" max="100" step="5" list="volume-ticks">
  <output data-slider-output for="volume" aria-live="off" hidden>50</output>
  <datalist id="volume-ticks">
    <option value="0" label="Low"></option>
    <option value="50" label="Middle"></option>
    <option value="100" label="High"></option>
  </datalist>
</div>
```

After loading one helper format and CSS, an external setup script may use:

```js
const volume = MarkupUISlider.createSlider(document.querySelector("#volume-field"), {
  formatValue: value => `${value} percent`
})
volume.setValue(75) // Silent native assignment; not a pointer/keyboard event.
```

No Custom Element is registered, so no legacy registration-order rule applies. Root/member
owner symbols reject duplicate bindings across ESM/classic copies without a global store.
No mandatory InputNumber, Input, Tooltip, Popover or gesture dependency is imported.

Single roots are connected light-DOM `.mui-slider[data-slider]` elements with exactly one
original labelled `input[type=range][data-slider-control]`. Pair roots are
`fieldset.mui-slider-pair[data-slider-pair]` with a nonempty first legend and exactly two
such controls. Roots have no replacement role/tabindex and are outside labels, buttons,
links and summaries. Labels may use `for`; avoid placing changing readout text in the
control's accessible name. Native name/form/labels/ARIA/hidden/default attributes and
listeners remain authored. A range has no native readonly behavior; the helper rejects
readonly rather than inventing it. Use actual disabled/fieldset for disabling.

The native controls/order are fixed for a binding. Disconnect and recreate after changing
control nodes/order; moving the whole root within the same document can retain ownership.
Removing a root/control disconnects. Native ranges remain focusable; CSS never substitutes
an offscreen/display:none input with a fake handle.

## Native values, defaults and constraints

Ranges are **not nullable InputNumber fields**. With no authored value, a native range
defaults to its midpoint, subject to native bounds/step sanitization: ordinary 0–100/step 1
is **50**, not framework zero or null. The native defaultValue string may still be `""`
when the value attribute is absent. Explicit empty/invalid string assignments also use
native range sanitization; no private last-valid-value model is stored.

| API | Contract |
| --- | --- |
| Single `control`, `value` | Original input and fresh native valueAsNumber |
| Single `setValue(number)` | Finite number only, delegated as its numeric string to native `.value`; native clamp/grid rules decide the result |
| Pair `controls`, `value` | Two original inputs and a fresh two-number tuple in binding-time endpoint order |
| Pair `setValue([number, number])` | Exactly two finite numbers; both validated before native writes; independent native sanitization |
| Pair `ordered` | Whether first value ≤ second value; a report, not a validator or sorting operation |
| `connected`, `error` | Lifetime and latest validation/formatter error |
| `refresh()` | Update readouts/accessibility text and validate unchanged anatomy; silent |
| `disconnect()` | Idempotent listener/observer/task/owned annotation cleanup; never restores old input values or constraints |

Null, NaN, infinity, numeric strings and arbitrary-length arrays are rejected by setters.
Native min/max/step/defaultValue remain the authority. Out-of-bounds setter values clamp
through the browser, off-grid values use native sanitization and step="any" retains native
continuous values. Degenerate min=max and contradictory/invalid bounds follow native
behavior, not manual arithmetic. Malformed native step values (including `"mark"`) are
not mark-only snapping: the browser's invalid-step fallback applies. No decimal engine,
per-key step calculation, precision formatter or numeric empty-state shim is added.

Native `.value`/valueAsNumber writes emit no input/change and are not property-observable.
The actual slider and `value` getter update immediately; call refresh for readouts after
direct application writes. Setters already refresh. Attribute/default/bound changes are
observed, but the helper never modifies those attributes to implement selection.

DefaultValue/value HTML and native form.reset own reset. A capture reset listener refreshes
after the native default action; cancelled resets keep current values. This includes each
input/output's actual form owner and changed external form IDs. Setters, refresh, bounds
changes and reset emit no fabricated user changes.

## Pair policy: two independent tracks, crossing allowed

```html
<fieldset class="mui-slider-pair" data-slider-pair id="window">
  <legend>Window endpoints</legend>
  <div class="mui-slider-pair__fields">
    <div class="mui-slider">
      <label for="start">Start</label>
      <input data-slider-control id="start" type="range" name="start"
        min="0" max="100" value="20">
      <output data-slider-output for="start" aria-live="off" hidden>20</output>
    </div>
    <div class="mui-slider">
      <label for="end">End</label>
      <input data-slider-control id="end" type="range" name="end"
        min="0" max="100" value="80">
      <output data-slider-output for="end" aria-live="off" hidden>80</output>
    </div>
  </div>
</fieldset>
```

Use `createSliderPair(fieldset, { formatValue: value => String(value) })`.
The child styling wrappers deliberately have **no data-slider marker**: one pair owner
owns both controls, not three overlapping services.

**This is not a one-track dual-thumb slider.** It never derives one endpoint's min/max
from the other. Crossing is allowed, the tuple is not sorted, and `ordered` becomes false.
Authors may interpret/validate the interval themselves. Common authored bounds are useful,
but each field retains its own domain/step/form; no shared numeric model is imposed.

For example, set [65,75], then reset: original default [20,80] is restored by the browser
**before** helper refresh, because no dynamic endpoint min/max has constrained the reset.
Set [90,10]: getters and FormData preserve that order, not a hidden sorted interval.
Each named native field submits its own string; use separate names or intentional repeated
names with FormData.getAll. No JSON/tuple hidden field is added. Disabled fields/fieldsets
are excluded from submission normally; programmatic updates remain allowed. Different
form owners reset/submit their respective endpoint only.

Native pointer, Arrow keys, Home/End, Tab and key repeat control each range. The helper
has no pointer/drag/key/wheel listeners and never hijacks browser zoom.
Single input/change events are untouched. A pair emits one deferred, **nonbubbling**
`mui:slider-pair-change` on its fieldset for each member's native committed change:
`{ value: [first, second], ordered: boolean, index: 0|1 }`. Continuous native input can be
observed directly for live previews; it is not duplicated into a second aggregate stream.
Setters/reset do not emit pair commits. Disconnect cancels pending custom notifications.

## Readouts and accessible value text are not tooltips

Each optional readout is one text-only `output[data-slider-output]` whose `for` references
exactly one owned input ID. Use `aria-live="off"` and no replacement role or tabindex.
Hide it initially: without JS the native slider remains usable, but a stale numeric text
readout must not masquerade as an automatically updated value.

`formatValue(value, index)` is an optional **plain-string** readout formatter, captured
at initialization. The default readout uses native input.value. The helper writes
output.value (not HTML) and, only when a formatter is supplied, temporarily writes the
same string to the real input's aria-valuetext. It never changes the numeric form value.
The output is not submitted, and output.defaultValue is not explicitly rewritten.
Readout current text/hidden state is managed while bound and restored if still owned.

There is no tooltip popup, placement, show/hide lifecycle or Tooltip/Popover dependency.
The non-live readout avoids a separate constant live announcement alongside native slider
value feedback. Do not additionally describe the input with the same readout when
aria-valuetext is intended to convey it. Actual AT behavior is not universally certified;
the Chromium accessibility-tree limitation observed below is not hidden by a proxy role.
Formatters should be pure and return text; invalid returns/errors are reported rather than
inserting markup. Recreate to change the formatter.

Outside mutations to owned annotation/hidden attributes are tracked before helper writes;
disposal restores only still-owned values and preserves later author changes and input
defaults/values. No-op removal of an absent attribute is not an observable ownership
transfer. Invalid anatomy/formatting throws on explicit operations and emits nonbubbling
`mui:slider-error` for changed automatic error messages. Native controls are not replaced
or forced into old values to repair an application error.

## Marks, direction, vertical layout and CSS

Use native `list`/datalist numeric options for ticks, with optional authored visible scale
labels. Native tick-label painting varies by platform; the demo also supplies static
scale text. Datalist ticks **do not implement source step="mark"**, custom mark rendering
or a restricted selectable-value set. Native numeric step is independent.

CSS keeps native range rendering and accent-color, full inline sizing, focus outlines,
wrapping, disabled behavior and hidden safety. Tokens are `--mui-slider-color`,
`--mui-slider-accent`, `--mui-slider-focus`, `--mui-slider-border`, `--mui-slider-length`.
No custom track/thumb geometry, CSS-in-JS or body-wide form reset.

For reverse direction, author `dir` on the actual input; choose ltr/rtl deliberately
relative to page direction. There is no boolean reverse algorithm. For vertical layout,
`.mui-slider[data-vertical]` uses native writing-mode:vertical-lr; the demo's input dir=rtl
places the high end at the top. The @supports test checks the CSS property, not every
engine's native range orientation. Use horizontal presentation where native vertical
range support is unavailable; no geometry/orientation polyfill is supplied.
Forced colors keep native controls; print retains them. There is no animation to suppress
under reduced motion.

## Complete upstream disposition

| Upstream item | Retained adaptation or explicit omission |
| --- | --- |
| default-value, value | Native defaults/finite scalar or exactly two finite fields; no null/zero seed model |
| disabled, min, max, step | Native attributes/sanitization; numeric step or native any, not step=mark |
| keyboard | Native keyboard always retained; false/suppression override omitted |
| marks | Authored datalist ticks/scale text; object/VNode mark rendering and mark-only snapping omitted |
| range | Two independently labelled tracks, crossing allowed; no coupled one-track dual-thumb behavior |
| reverse, vertical | Native direction/writing-mode and explicit HTML/CSS, no geometry engine |
| on-update:value; source onUpdateValue | Native events/current value; optional pair committed snapshot |
| format-tooltip, placement, show-tooltip, tooltip | **Omitted** popup format/geometry/lifecycle; native output/aria-valuetext is a separate alternative |
| on-dragstart, on-dragend | **Omitted** custom drag lifecycle; native events can be observed by applications without claiming drag-engine parity |
| thumb slot | **Omitted** custom handle rendering; keep real native thumb/control |
| Source to, theme/themeOverrides/builtinThemeOverrides | **Omitted** portal/provider/theme objects |
| Source defaultValue=0 and arbitrary number[] expansion | **Omitted** framework seed/more-than-two handles; native midpoint and explicit pair policy instead |
| Source ClosestMark, OnUpdateValueImpl, SliderSlots/default | **Omitted** snapping geometry, callback model and VNode slots |

## Acceptance

Local server 4188 and a dedicated Slider tab were used on 2026-09-09. This is not
one-track multi-thumb, native-theme pixel, all-browser/AT or upstream framework parity.

- **101 targeted tests passed**: 37 Slider, 37 InputNumber and 27 native/legacy regressions
  with `pnpm test -- tests\slider.test.ts tests\input-number.test.ts tests\native.test.ts`.
  They cover native midpoint/state, strict shapes, clamping/bounds, fixed pair constraints,
  crossing, immediate/cancelled/reset defaults, output/annotation ownership, native forms,
  duplicate binding and disposal.
- A native-only jsdom probe showed its valueAsNumber setter bypassing range bounds and
  missing off-grid snapping. The helper uses the standard native string `.value` setter,
  not custom clamping/rounding. Tests compare native behavior where jsdom differs; real
  sanitization was verified in Chromium. No browser prototype/polyfill was installed.
- Chromium **151.0.7922.174**: native default midpoint 50, ArrowRight 50 → 55 (not
  mark-only), Home/End, off-grid setter 53 → 55, native mouse drag to 80, corresponding
  output text and DOM aria-valuetext, native vertical ArrowUp 0.5 → 0.6, and reversed
  horizontal ArrowLeft 0 → 0.5. The native vertical input measured **32 × 192px**.
- Narrowed pair [65,75] retained min/max/default attributes and reset immediately to
  [20,80] **before helper refresh**. Crossed [90,10] stayed in that order and submitted
  two real fields. One keyboard change emitted one pair commit. Cancelled resets and
  changed defaults [15,85], disabled fieldsets, programmatic updates and external form
  IDs/reset passed. Native upper clamp, step=any and min=max were checked in Chromium.
- **Accessibility evidence/limit:** the native tree reported slider roles and vertical/
  horizontal orientation, and the output had no active live-region property with authored
  aria-live=off. However CDP still reported raw numeric valuetext for both an enhanced and
  an unenhanced native range despite DOM aria-valuetext. Formatted spoken-value behavior
  is therefore **not certified**. No duplicate slider role/hidden proxy was added as a workaround.
- 360px RTL and 200% **CSS zoom** had no page overflow. Forced colors retained native
  appearance/accent; reduced-motion context and print/native-range visibility passed.
  JS-disabled Chromium retained native keys, independent crossing, defaults and real
  local GET submission without readout/tuple/external duplicate values.
- Standalone ESM, cross-format duplicate ownership, both legacy load orders and an actual
  legacy mui-slider alongside the new native control passed. Disposal restored owned
  output/annotation state and left native keyboard operation intact.

`pnpm build` passed TypeScript and all existing/new budgets. No dependencies or prior
native helpers/core/plugins/legacy sources changed.

| Optional asset | Raw bytes | Gzip bytes | Gzip ceiling |
| --- | ---: | ---: | ---: |
| `markup-ui-slider.js` | 6,493 | 2,612 | 3,500 |
| `markup-ui-slider.global.js` | 6,650 | 2,680 | 3,500 |
| `markup-ui-slider.css` | 1,848 | 676 | 1,000 |

CSS-only Slider costs **676 gzip bytes**, no JS. One helper format plus CSS is
**3,288 ESM / 3,356 classic gzip bytes**. All **139 previous top-level JS/CSS assets**
are SHA-256 byte-identical. Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**
under unchanged **15,000/3,000/4,000** ceilings.

All **19 original identities** and source lines remain with nine source supplements:
**28 rows = 13 adapted targets + 15 omissions**. Catalog totals are **3,548 rows and
240/384 accepted tasks across 60 pages**. Edited local links pass. P4 remains In progress.
**Next Rate.**
