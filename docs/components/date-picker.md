# Date Picker: native calendar strings and explicit endpoint pairs

**🟢 Verified retained native scope.** Original date/month/week/datetime-local inputs, or
two same-mode endpoints, with a small clear/readout/ordering coordinator. Native grammar
is tested on detached inputs before setters touch real fields. No calendar grid, formatting
library, timezone conversion, linked calendars/bounds, popup engine or runtime dependency.

**Calendar values are not automatically instants.** The API accepts native strings, not
Naive epoch milliseconds, Date objects or a locale-formatted model. Datetime-local is a
wall-clock value with **no timezone**, including values that would be ambiguous or nonexistent
in a particular DST zone. Conversion/verification of a real instant is an application policy.

## Modes, loading and capability

| Native type | Retained value domain | Not implied |
| --- | --- | --- |
| date | `YYYY-MM-DD`, positive four-digit years 0001–9999 | Local midnight, epoch model or timezone-bearing date |
| month | `YYYY-MM` | First-of-month instant or source year/quarter grid |
| week | `YYYY-Www`, native ISO week-year/week validity | Locale week number, selected weekday or configurable calendar week start |
| datetime-local | `YYYY-MM-DDTHH:mm`, optional seconds and 1–3 fractional digits | Offset/Z/UTC conversion, DST validity or source timestamp ABI |

One or two controls of the same supported type are accepted. Native week pairs are an
explicit target composition, not an invented upstream `weekrange` prop. Source year,
yearrange, quarter and quarterrange modes are omitted. MonthRange adaptation does not
promote the YearRange/QuarterRange owners grouped with it in the source inventory.

| Asset/export | Contract |
| --- | --- |
| `@dataengine/markup-ui/date-picker` | `createDatePicker`, `isDatePickerTypeSupported` and native type/value/state/controller types |
| `dist/markup-ui-date-picker.js` | Optional independent ESM |
| `dist/markup-ui-date-picker.global.js` | Classic `MarkupUIDatePicker` namespace; refuses replacement |
| `@dataengine/markup-ui/date-picker/style.css` | External `dist/markup-ui-date-picker.css` |
| `src/components/temporal/native.ts` | Tiny detached type/sample/sanitization/numeric-coordinate probe, shared by the implemented date modes |
| [Demo](../../demo/components/date-picker.html) | Separate HTML/CSS/JS, all four native modes and explicit date/month/local-time pairs |
| [Reference](../naive-ui/components/date-picker.md) | Every original mode-specific identity and source supplement |

`isDatePickerTypeSupported(document, type)` tests native type preservation, a valid sample,
invalid-value sanitization and a finite native numeric coordinate **off DOM**. It does not
open a picker or promise its UI. A missing mode is not polyfilled; leave an honestly labelled
native/text fallback and validate in application/server code. Unsupported-mode demo helpers
and their custom actions are not activated. A text fallback is not equivalent calendar
validation merely because an HTML type attribute was authored.

## Original native anatomy

```html
<fieldset class="mui-date-picker" data-date-picker>
  <legend>Trip dates</legend>
  <div class="mui-date-picker__fields">
    <label>Start <input data-date-control type="date" name="trip.start"
                       value="2024-03-01" min="2024-01-01" max="2024-12-31" required></label>
    <span aria-hidden="true">→</span>
    <label>End <input data-date-control type="date" name="trip.end"
                     value="2024-03-10" min="2024-01-01" max="2024-12-31" required></label>
  </div>
  <p class="mui-date-picker__output" data-date-output hidden></p>
  <button type="button" data-date-clear hidden>Clear both endpoints</button>
</fieldset>
```

A single-field root uses the same structure with one input. The connected light-DOM root
owns exactly one or two original controls, optional hidden plain readout and optional hidden
labelled type=button clear action. Labels/legends/names/required/readonly/fieldset semantics
remain native. Endpoints retain original order, identity and common actual form owner;
explicit external `form` association works when both endpoints share it.

Names are literal, including dots/brackets or repeated names. Each enabled named endpoint
is one successful field. `""` is the native empty value and still appears in FormData under
its name; disabled/unnamed fields are omitted natively. There are no hidden tuple fields
or implicit null/unselected proxies.

## Validating strings without timezone conversion

```js
const picker = MarkupUIDatePicker.createDatePicker(root)
picker.setValue(["2024-03-01", ""]) // Partial pair retained, silent.
picker.setValue(["2024-03-10", "2024-03-01"]) // Reversed, not swapped/clamped.
picker.setValue(["2023-02-29", "2024-03-01"]) // Throws before either real field changes.
```

Setters first validate the complete incoming string or both tuple members using detached
native probes. Invalid nonempty values cannot become empty on the real field as a successful
fallback. Supported syntax is deliberately bounded: four-digit positive years, two-digit
month/day/week, uppercase W and T, no offsets/UTC Z or arbitrary format tokens, at most
millisecond precision for datetime-local. Empty string is allowed; null, numeric timestamps,
Date objects, wrong tuple lengths and sparse entries are explicit errors.

Native parsing handles actual leap dates/month/week validity, not a hand-written calendar.
The probe's normalized value is assigned to the actual input. Zero seconds may collapse
to minute precision; fractional trailing-zero serialization follows the browser. Chromium
normalized `...:45.500` to `...:45.5`, while the installed jsdom retained `.500`; no
production workaround forces one harness's serialization. Default attributes are validated
but never rewritten.

Native `valueAsNumber` is used **only as a same-mode ordering coordinate**. Date/week
coordinates use the HTML-defined numeric domain, month uses its native month coordinate,
and datetime-local uses its native local-field coordinate. This is not a claim that a
calendar string represents a local-midnight or UTC instant. No Date parsing, ISO UTC slicing,
local Date formatting or DST adjustment occurs in the helper.

The demo's Today action is explicitly application code:

```js
const now = new Date()
const localDay = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
picker.setValue(localDay)
```

This deliberately uses local calendar parts, not `toISOString().slice(...)`. It is not a
library timestamp/shortcut model or a guarantee of a particular business timezone.

Direct external native `.value = "invalid"` can already sanitize to empty before a helper
sees it. That lost intent is not recoverable without patching native properties; use the
validated setter and explicit refresh after native programmatic transactions. Native UI
partial segments may expose value `""` plus badInput; the helper preserves them until an
explicit clear rather than pretending to read an internal segmented editor.

## State, ranges and constraints

| Controller member | Contract |
| --- | --- |
| `inputs`, `type`, `connected`, `error` | Original frozen input-reference array, fixed native type, lifetime/error |
| `value` | Native string or frozen two-string tuple; not an epoch/formatter model |
| `state` | Frozen live observation described below |
| `setValue(value)` | Silent string/tuple setter; validates both endpoints before mutation |
| `clear()` | User-like clear of the whole single/range scope; false if nothing to clear or any endpoint is unavailable |
| `refresh()` | Silent anatomy/readout/action synchronization; no value/default/bound writes |
| `disconnect()` | Owned action/readout/lifetime cleanup; current native values/defaults remain |

State fields are intentionally separate:

- `empty`: all exposed values empty and no native badInput.
- `partial`: some but not all endpoints filled, or native badInput.
- `complete`: all endpoints populated and no badInput; **not a claim of constraint/order validity**.
- `ordered`: null for a single field or incomplete pair, otherwise start <= end; equal allowed.
- `nativeValid`: native validity for willValidate fields; barred/disabled/readonly eligibility
  is browser-owned.
- `badInput`: native incomplete/invalid UI entry flag.

A reversed pair remains exactly reversed. A partial pair remains partial. This coordinator
does not silently swap/clamp, invent a missing endpoint or clear a business date. **No dynamic
min/max cross-linking occurs**, so native reset defaults cannot be corrupted by synthetic
opposite-endpoint limits.

Native min/max/step/required remain unchanged and authoritative. Valid syntax setters may
produce native constraint failures; they do not clamp. Date step is days, month step is
months, week step is weeks, local datetime step is seconds (native default typically 60).
Malformed/ignored authored HTML constraint attributes remain browser behavior, not a
source rule/schema parser.

Ordering/partial observations do not setCustomValidity or automatically block submission.
The demo explicitly uses [Form](form.md) with the real endpoints and a small manual callback
for partial/reversed ranges. That is **application validation**, not disabling cells inside
a native calendar. Readonly/disabled handling, validation anchors and server policy remain
explicit. Native blackouts, disabled weekdays/hours and linked calendars are not claimed.

## Clear, reset, focus and events

Clear is all-or-nothing for endpoint availability: every endpoint must be enabled, not
readonly, visible and non-inert. If one endpoint is protected, the shared clear does
nothing; native individual editing remains browser-owned. Programmatic validated setters
can still explicitly update disabled/readonly controls.

Both endpoints become empty **before** any notification. Each field whose value/badInput
was cleared receives one bubbling/composed input followed by one change. No hidden tuple
event substitutes for the actual fields. `mui:date-picker-clear` then reports `{ value }`
on the root if the action was not superseded. Exact helper-generated events are ignored
by its internal synchronizer, while distinct reentrant native events remain observable.

Newer native/setter work can supersede remaining notifications; stale events are not sent.
A cancelled reset inside an input callback does **not** cancel the rest of the already-
completed clear sequence. Reset outcome is settled after dispatch before deciding whether
it actually invalidated the clear generation.

Native reset changes current fields to native defaults; it does not emit helper value events,
recreate endpoints or mutate bounds. Cancelled reset retains native values. Readout refresh
uses post-default tasks, without overwriting newer fields. Input/change, setters and reset
never create fake native popup confirmation/open/hide events.

A disappearing/unusable focused clear button recovers to an available local endpoint.
Clearing from an outside programmatic focus does not steal it. The shared temporal action
primitive moves focus **before** hiding/disabling the action while observation is active,
preserving application hidden/disabled overrides made by native blur/focus handlers.
No synthetic selection/keyboard engine is added to date segments.

`mui:date-picker-error` reports unsupported runtime anatomy/values; direct API errors throw.
Control identities/order/type/form-owner changes require explicit recreation. Owned action
hidden/disabled and readout text are restored conditionally, preserving external overrides.
The helper never changes labels, names, ARIA descriptions, native custom-error messages,
values or defaults during teardown.

## Source mode/property disposition summary

Every original mode-specific row remains distinct in the [reference](../naive-ui/components/date-picker.md).
Grouped source rows explicitly qualify retained MonthRange/Date/DateTime/Week branches;
they do not mark omitted year/quarter modes complete.

| Source surface | Retained native adaptation / explicit omission |
| --- | --- |
| General clearable/value/default-value/type | Real fields, validated native strings/tuples and explicit clear; no epoch conversion |
| disabled/input-readonly/size/status/focus/blur | Native field/fieldset semantics, external CSS and native/Form feedback |
| Date, DateTime, Month, Week | Native date, datetime-local, month and ISO week where capability probe passes |
| DateRange, DateTimeRange, MonthRange | Two labelled same-mode native endpoints; partial/reversed data preserved |
| Year, YearRange, Quarter, QuarterRange | **Omitted** non-native grid/mode contracts |
| format/value-format/date/month/year/quarter/time-picker/calendar header formats; formatted-value callbacks/defaults | **Omitted** arbitrary token/locale formatter and timestamp/formatted binding engines |
| first-day-of-week/year-range/fast month-year navigation/default-calendar times | **Omitted** native calendar UI customization claims |
| is-date-disabled/is-time-disabled and detail/hour/minute/second fields | **Omitted** blackout/calendar-cell policies; native bounds or application validation are not identical |
| default-time/time-picker-props | **Omitted** timestamp-dependent time defaults and nested TimePicker renderer |
| show/panel/placement/to/next-prev events/close-on-select/update-on-close | **Omitted** popup/provider/linked-calendar/commit-on-close machinery |
| shortcuts/now slots | **Omitted** source timestamp shortcut callbacks; explicit local-parts application example instead |
| source actions/confirm slots/on-confirm | **Omitted** calendar toolbar/confirmation APIs; native change timing is not that contract |
| native clear slots/text and range separator/footer/icon anatomy | Authored controls/text for retained native modes only; no VNode/popup renderer |
| source placeholders | Native labels/hints instead; platform date UI is not a guaranteed custom placeholder surface |

The tiny `src/components/temporal/native.ts` capability probe is real shared infrastructure
for the implemented modes and can support a future native Time Picker without a generic
date engine. Input's text-only editing machinery is not imported for temporal segments.
Legacy `mui-date-picker`/`MuiDateTimeInput` in `src/plugins/advanced.ts` remain unchanged.

Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:
[API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md),
[DatePicker.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/DatePicker.tsx),
[props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts),
[interface](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts),
[public types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts),
[exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/index.ts).
The source uses date-fns formatting/strict parsing, timestamp model values and calendar
panels. None of that is silently substituted with local Date parsing.

## Four-step acceptance

1. [x] Supported native fields, labels, no-JS paths and actual form identity retained.
2. [x] Calendar/week/local-wall-clock, empty/partial/order/default/clear contracts defined per native mode.
3. [x] Only the native coordination scope implemented; year/quarter/calendar/formatter features explicitly omitted.
4. [x] Native grammar, reset/bounds, timezone non-conversion and browser/targeted/build evidence recorded.

### Evidence and limitations

- **179 targeted tests passed:** Date Picker **74**, Form 53, Input 52.
  `pnpm exec vitest run tests\date-picker.test.ts tests\form.test.ts tests\input.test.ts --reporter=dot`
  and `pnpm build` passed. No prior helper/core/plugin source or dependency changed.
- Read-only review found cancelled resets suppressing the second endpoint's clear events
  and focus callbacks losing owned-attribute overrides. Both fixed with unit/browser
  regressions; observation now resumes before focus recovery.
- Dedicated **4188 Chromium** confirmed all four native parsing modes; valid leap/week/year
  strings and invalid leap/week/zero/extended-year/epoch/null rejection; native seconds
  canonicalization; preserved partial/reversed pairs; unchanged authored bounds across reset;
  one input/change pair per cleared endpoint; empty native FormData values; readonly/fieldset
  policy and actual submitter/endpoint names. Native chooser UI was not invoked.
- Isolated Chromium contexts in **America/Los_Angeles** and **Pacific/Kiritimati** retained
  `2024-03-10` and `2024-03-10T02:30` unchanged, with local wall-range ordering unchanged.
  This demonstrates **no conversion**, not validation of real zoned DST instants.
  At a fixed test clock, the explicit local Today recipe yielded 2023-12-31 versus
  2024-01-01 respectively, proving it did not use UTC ISO slicing.
- LTR/RTL **1280px/375px**, **200% CSS zoom**, dark/forced-colors/reduced-motion emulation
  had no page overflow. Separate JS-disabled Chromium verified ten actual native fields,
  hidden custom clear actions, required/reset and native GET strings/pairs/submitter; context
  closed afterward.
- Native popup layout/locale weekday ordering, real zoned scheduling, OS segmented editing,
  Safari/Firefox fallback validation and universal AT behavior are not certified. Native
  mode detection and fallback limitations are explicit, not calendar-library parity.
- Additional Chromium checks verified native min/max/step failures, external custom-error
  preservation, explicit advanced-plugin coexistence and cancelled reset. Teardown kept
  partial values/authored bounds while hiding owned actions/readouts. Final console/network
  checks had no errors/warnings or nonstatic requests; the demo was reloaded.

| Asset | Raw bytes | Gzip bytes, level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Date Picker ESM (shared Time follow-up) | 9,586 | 3,967 | 4,500 unchanged |
| Date Picker classic (shared Time follow-up) | 9,758 | 4,038 | 4,500 unchanged |
| External CSS | 974 | 421 | 1,000 |
| Core | 62,558 | 14,611 | 15,000 unchanged |
| Advanced | 6,554 | 2,181 | 3,000 unchanged |
| Widgets | 10,858 | 2,779 | 4,000 unchanged |

All **164 prior top-level JS/CSS assets** were built in memory with the pre-Date Picker
HEAD recipe and byte-compared against current outputs; all match. No prior optional ceiling
was relaxed. Reference audit: **179 original mode-specific section/source/kind identities
exactly preserved + twenty supplements = 199 rows (37 adapted, 162 omitted)**.
At original Date sign-off, catalog totals were **3,654 rows, 276/384 tasks across 69 accepted pages**,
108 unchecked. P4 then had **968 rows**, with **Time Picker's 34 unresolved rows** still Planned. **420 scoped relative
file links** and diff whitespace were checked. At Date sign-off, next was Time Picker, not a timezone-bearing date engine;
no full P4/P0/P5/P6 or source calendar/formatter parity is claimed.

### Coupled Time Picker follow-up

Time Picker review exposed a native blur path while a focused clear action was being hidden.
Date and Time now share the small temporal pre-transition focus primitive: focus moves while
attribute observation is active, and a callback that disconnects the owner stops further UI
writes. Two Date regressions and real Chromium probes preserve blur-handler hidden/disabled
overrides and teardown state. Date's four-mode public gate remains unchanged.

Date ESM/classic increased from **3,882/3,953** to **3,967/4,038 gzip bytes**, still within
the unchanged **4,500-byte** ceilings; CSS is unchanged. The shared follow-up passed
**245 targeted Time/Date/Form/Input tests** and **all 889 P4 tests**. Original Date sign-off
counts above remain historical; final retained P4 reconciliation is in the master plan.
