# Time Picker: one native time-of-day field

**🟢 Verified retained native scope.** Original `input[type=time]`, canonical time-only
strings, native bounds/step/defaults/forms, optional clear and plain readout. No date anchor,
instant/epoch/timezone conversion, format library, custom hour/minute columns, popup
renderer, provider, hidden proxy or dependency.

**2026-09-11 default-style audit:** native triggers and labelled clear actions now use
the source's 28/34/40px Input scale, 3px corners and semantic light/dark roles while the
platform time picker remains untouched. See the [measured audit](../style-audit/components/time-picker.md).

**Midnight is `00:00`, not empty/null.** A clock string has no date, offset or DST semantics.
Native `valueAsNumber` can describe its within-day coordinate, not an actual instant.
The source's timestamp/time-zone/formatter models are deliberately not emulated.

## Native anatomy and loading

```html
<fieldset class="mui-time-picker" data-time-picker>
  <legend>Night slot</legend>
  <label for="night">Time of day
    <input data-time-control id="night" type="time" name="night"
           value="23:00" min="22:00" max="02:00" step="900">
  </label>
  <p class="mui-time-picker__output" data-time-output hidden></p>
  <button type="button" data-time-clear hidden>Clear night slot</button>
</fieldset>
```

The root adopts **exactly one** labelled native time input. Optional clear/readout start
hidden, so no-JS shows no dead custom action. The field stays normal HTML, including native
keyboard editing, label associations, form ownership and successful-control filtering.
There is no Time Picker range API. Applications may compose ordinary time fields, but must
explicitly decide same-day/overnight/duration policy themselves.

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/time-picker` | ESM `createTimePicker`, `isTimePickerSupported`, controller/state types |
| `dist/markup-ui-time-picker.js` | Independent optional ESM |
| `dist/markup-ui-time-picker.global.js` | Classic `MarkupUITimePicker`; refuses namespace replacement |
| `@dataengine/markup-ui/time-picker/style.css` | External `dist/markup-ui-time-picker.css` |
| [Demo](../../demo/components/time-picker.html) | Separate native HTML/CSS/JS with daytime/overnight/precision examples |
| [Reference](../naive-ui/components/time-picker.md) | Every original identity and explicit source supplements |

`isTimePickerSupported(document)` checks the native type, a valid minute sample, rejection
of invalid data, and a faithful three-digit millisecond sample on a detached input.
Each setter separately validates its exact precision. This is not proof of native popup
appearance, twelve-hour locale UI, virtual keyboard or universal browser support. Missing
capability leaves an honestly labelled native/text fallback, not a parser/calendar polyfill.

## Time-only grammar and precision

Supported setter syntax:

- `HH:mm`, with hours 00–23 and minutes 00–59.
- Optional `:ss`, seconds 00–59.
- Optional fraction after seconds, one to three decimal digits.
- `""` is the native empty value.

```js
const clock = MarkupUITimePicker.createTimePicker(root)
clock.setValue("00:00")          // A real midnight value; silent.
clock.setValue("12:34:56.789")   // Native millisecond precision, if supported.
clock.setValue("")              // Empty native field; not an absent hidden value.
```

Null, numeric epochs, Date objects, arrays/ranges, dates, UTC Z/offset suffixes, AM/PM
strings, leading/trailing whitespace, 24:00, leap seconds and over-precision are rejected
**before** touching the real field. No invalid nonempty input becomes successful empty
normalization.

The unchanged detached [temporal probe](../../src/components/temporal/native.ts) from
[Date Picker](date-picker.md) provides the native grammar substrate. Bounded integer
hour/minute/second/fraction arithmetic checks that the native coordinate preserves the
requested precision; it does not construct or format a date. The returned native string
follows the host's serialization. Zero seconds/fraction widths are not a locale token API.

The installed jsdom interprets `.1`/`.01` time fractions as 1ms. The helper explicitly rejects
that unsupported per-value precision in that harness rather than silently accepting a
different clock value. Chromium correctly represented `.1` as 100ms and `.01` as 10ms.
Tests distinguish the native capability; **no jsdom-specific production workaround** was
added. Three-digit fractions work in both tested environments.

Direct external native `.value = "bad"` may already sanitize to empty before an observer
can see the attempted value. Use the validated setter and explicit refresh. No property
patching/polling or hidden model is used to recover discarded native input intent.
Opaque partial native segments may expose empty value plus badInput; the helper preserves
that editing state until an explicit clear, without pretending to read native internal UI.

## Native periodic constraints are not date ranges

**For native time, min greater than max is a midnight-wrapping interval.** With min=22:00
and max=02:00, 23:00, 00:00 and 01:30 are in range; noon is outside. This helper never rejects,
swaps or relinks those attributes based on a date-style min <= max rule.

Native step is in **seconds**, including fractions where supported; HTML min/value/default
step-base rules remain authoritative. Valid grammar setters may leave stepMismatch,
rangeUnderflow/rangeOverflow or required failure. They do not clamp. Arbitrary selectable
hour/minute lists and disabled-hour callbacks cannot be claimed from native step/bounds.

`state` is a frozen observation:

| Field | Meaning |
| --- | --- |
| `value` | Original native time string |
| `empty` | No native value and no badInput |
| `badInput` | Browser-reported incomplete/invalid segmented entry |
| `nativeValid` | Native validity when willValidate; barred/disabled/readonly behavior remains native |

Readonly and native fieldset disabling are honored, including the first-legend exception.
Native empty named controls still contribute `name=""` to FormData when successful;
disabled/unnamed fields are omitted. Midnight contributes `00:00`, not null.
The helper does not own setCustomValidity messages or imply time-zone/DST validity.

## API, events, reset and ownership

| Member | Contract |
| --- | --- |
| `control`, `value`, `state`, `connected`, `error` | Original field, live native observations and lifetime/error |
| `setValue(string)` | Probe-validated silent setter; current value only, no default/bound mutation |
| `clear()` | Explicit user-like clear, false when unavailable or no entry |
| `refresh()` | Silent validation/readout/action synchronization |
| `disconnect()` | Idempotent cleanup; edited native value/defaults/bounds remain |

Programmatic setters may explicitly update readonly/disabled controls, as native properties
can. User clear requires an enabled, visible, non-inert, non-readonly field.
Clear sets native empty before dispatching one input/change pair. Only exact helper-generated
events are ignored internally; distinct reentrant input is synchronized and can supersede
the rest of the clear sequence. `mui:time-picker-clear` reports `{ value: "" }` only if not
superseded. There is no synthetic native change for ordinary setters/reset/refresh.

Native reset resets the current field to its native default, not a timestamp model.
Cancelled reset preserves values and does not suppress clear notifications if invoked
inside an input handler. Reset settlement occurs after dispatch and readout tasks use
post-default state; unrelated refreshes never rewrite native values or bounds.

The Date and Time helpers now share
[`prepareTemporalActionFocus`](../../src/components/temporal/focus.ts): move focus away
**before** hiding/disabling a focused clear action, while application attribute writes are
still observed. This fixes both native blur callbacks that change action state and callbacks
that disconnect the owner. An interrupted update stops before continuing UI writes.
Focus outside the component is not stolen. Neither focus nor clear opens a chooser.

Native labels/name/form/ARIA/custom validity and field identity are retained. Clear/readout
visibility, action disabled state and plain readout text use conditional ownership; external
overrides survive teardown. The readout is noninteractive/nonlive, not a mutable label or
automatic announcement. No invisible proxy values or duplicated successful fields.

Unexpected unsupported anatomy/serialization reports `mui:time-picker-error`; direct
invalid APIs throw. One owner per root/field/readout/action is enforced across module copies.
The Date Picker public gate still accepts only its original four native date modes:
**Time support was not added to Date Picker**, and no time-range API was invented.

The helper never calls showPicker/hidePicker, emits open/confirm state, or intercepts ordinary
field keyboard input. Applications may use the native chooser through actual user activation;
availability/gesture restrictions and any platform errors remain native. No popup renderer,
locale provider or fixed-duration/formatting guarantee is inferred from a method's presence.

## Explicit application clock strings and Form use

The demo's local Now action is ordinary application code:

```js
const local = new Date()
const time = [local.getHours(), local.getMinutes(), local.getSeconds()]
  .map(part => String(part).padStart(2, "0")).join(":")
clock.setValue(time)
```

It deliberately uses local clock parts, not ISO UTC slicing or a hidden date anchor in the
library. A scheduling application must choose its date/timezone/overnight policy separately.
Legacy advanced `mui-time-picker` remains unchanged and is not silently upgraded.

[Form](form.md) can validate the actual native field. No hidden provider registration or
external custom-error clearing occurs. The demo's application submit listener only inspects
local FormData and is removed on disconnect; the library does not fetch or submit.
Native no-JS required/reset/FormData still work where type=time is supported. Unsupported
native modes remain a declared fallback requiring application/server validation.

## Source property/type reductions and external CSS

| Source surface | Retained native adaptation / explicit omission |
| --- | --- |
| clearable/default-value/value | Native strings/current/defaults and explicit clear, not number/null epoch models |
| disabled/input-readonly/size/status | Actual field/fieldset semantics, external CSS and native/Form feedback |
| on-blur/on-focus/focus/blur | Original native events and control methods |
| on-clear/on-update:value | Explicit clear/native string events, not timestamp/formatted callbacks |
| icon | Authored decorative affix, not a configurable native popup icon |
| format/formatted-value/default-formatted-value/value-format/time-zone | **Omitted** date anchoring, token parsing and timezone formatting |
| hours/minutes/seconds and is-hour/minute/second-disabled | **Omitted** custom selectable lists/cell disabling; native constraints are not the same contract |
| actions/on-confirm/show/placement/to/on-update:show/use-12-hours | **Omitted** panel, confirmation, portal and locale UI control |
| source callback/prop/slot/provider/column types | Explicit supplements, no framework model ABI |

CSS styles the original field, readout, clear action, sizing/wrapping/focus/RTL/media. It
does not style native popup cells, force twelve-hour display or create a scrolling-column
picker. No CSS-in-JS or per-frame layout work is added.

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/demos/enUS/index.demo-entry.md),
[TimePicker.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/TimePicker.tsx),
[interface](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/interface.ts),
[public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time-picker/index.ts).
The source uses date-fns/date-fns-tz and strictParse anchored to new Date; those semantics
are not reproduced for time-of-day strings. Its default-formatted-value Markdown number
type differs from the source String property and is retained as an explicit omission.

## Four-step acceptance

1. [x] Original native time field, label/name/defaults/seconds/form contract adopted.
2. [x] Empty/midnight/precision/periodic bounds and native validity defined.
3. [x] Native clear/readout retained; format/column/zone/popup interfaces omitted.
4. [x] Targeted and P4-wide tests, review fix, browser proof and inventory reconciliation recorded.

### Evidence and limits

- **245 targeted tests passed**: Time Picker 64, Date Picker 76, Form 53, Input 52.
  Existing `pnpm build` passed all declarations/asset budgets.
- **All 889 tests across the 17 P4 component test files passed**. This covers declared
  native scopes, not every omitted source feature or every browser/platform.
- Review found native clear-button blur running while attribute observation was paused.
  The shared temporal focus primitive fixes Date and Time; dedicated unit/Chromium probes
  confirm external hidden/disabled overrides survive and disposal during blur leaves no
  visible/restamped stale readout. Date's type=time rejection remains intact.
- Chromium verified 00:00 versus empty, strict invalid setters, `.1`/`.01`/`.001` precision,
  midnight-wrapping 22:00–02:00 bounds, native step failure, readonly/fieldset, clear
  input/change sequence/focus, native defaults/FormData and explicit advanced-plugin coexistence.
- Two timezone contexts retained `02:30` unchanged; the explicit local Now recipe at a fixed
  clock produced **16:30:45 in America/Los_Angeles** and **14:30:45 in Pacific/Kiritimati**.
  No conversion or instant meaning was introduced.
- LTR/RTL 1280px/375px, 200% CSS zoom and dark/forced-colors/reduced-motion emulation had
  no page overflow. Separate no-JS Chromium verified hidden custom actions, required/reset,
  seconds/milliseconds and one successful field per time plus submitter.
- Final demo reload had no console warnings/errors and all observed asset requests returned
  HTTP 200. All **474 scoped relative documentation links** and diff whitespace passed.
- Native type/showPicker availability was inspected, **not the native chooser UI**.
  OS 12/24-hour presentation, segmented editing/IME, timezone scheduling and universal
  browser/AT behavior are not certified.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Time Picker ESM | 8,016 | 3,425 | 4,000 |
| Time Picker classic | 8,187 | 3,497 | 4,000 |
| Time Picker CSS | 861 | 388 | 1,000 |
| Date ESM after shared focus fix | 9,586 | 3,967 | 4,500 unchanged |
| Date classic after shared focus fix | 9,758 | 4,038 | 4,500 unchanged |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

The coupled Date outputs changed only for the temporal focus correction; no ceiling was
relaxed. Actual HEAD-source comparison found **165 of 167 prior top-level JS/CSS assets
byte-identical**, with only Date ESM/classic changing. The full audit found **17 P4 routes,
984 rows (478 adapted + 506 omitted), zero unresolved rows and 68/68 accepted tasks**.
Catalog totals are **3,670 rows and 280/384 accepted tasks across 70 pages**, 104 unchecked.
All remaining route groups and the recommended fixed-height Virtual List foundation are
recorded in the [master plan](../naive-ui/migration-plan.md); no next collection was started.
