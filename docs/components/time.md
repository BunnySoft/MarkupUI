# Time: explicit instants, native text and bounded relative refresh

**🟢 Verified retained native formatting scope.** A pure formatter and an opt-in
time/Text-node binding. Intl.DateTimeFormat and Intl.RelativeTimeFormat supply actual
display behavior, not a token/date package, reactive provider, clock framework or
custom element registered merely for styling.

**2026-09-11 default-style audit:** [matched inherited text](../style-audit/components/time.md).
The optional stylesheet adds only tabular numerals, overflow safety and keyboard focus;
typography, paint and CSS motion remain application-owned.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/time` | formatTime, createTime and input/format/relative/result/binding/state/controller types |
| `dist/markup-ui-time.js` | Independent optional ESM |
| `dist/markup-ui-time.global.js` | MarkupUITime; refuses namespace replacement |
| `@dataengine/markup-ui/time/style.css` | Optional native tabular-number/wrapping/focus typography; no automatic import |
| [Local demo](../../demo/components/time.html) | Separate HTML/CSS/JS; instants, fixed/live relative text, safe markup/selection and native fields |
| [Complete reference](../naive-ui/components/time.md) | Six original identities and three explicit source additions |

```html
<time class="mui-time" data-time datetime="2024-03-10T07:30:00.000Z">
  <!-- Use an explicit target when preserving surrounding markup. -->
  <strong>Recorded: </strong><span data-time-text>March 10, 2024 at 07:30 UTC</span>
</time>
```

```js
import { createTime, formatTime } from "@dataengine/markup-ui/time"
const time = createTime(document.querySelector("time[data-time]"), {
  time: new Date("2024-03-10T07:30:00Z"), // Explicit global instant constructed by the caller.
  timeZone: "America/New_York"
})
const plain = formatTime(0, { type: "relative", to: 60000 }).text // "1 minute ago"
```

The binding requires a connected native HTMLTimeElement with data-time and an authored
nonempty datetime fallback. The whole time element may contain one readable Text node,
or it can preserve surrounding author markup using exactly one span[data-time-text]
containing one readable Text node. Nested time elements and ambiguous/multi-node text
targets reject. Other markup/listeners/ARIA remain untouched; the helper owns only
that Text.data and the root datetime as a **pair**.

Author a valid, meaningful native datetime/readable fallback. It is not parsed as
the API input, and no instant is inferred from an authored Calendar/date-only value.
Labels/prefixes outside the owned text target must not contain stale duplicate date/
zone text; the helper cannot synchronize arbitrary surrounding prose. No role,
aria-live, tabindex, hidden field, generated wrapper or form behavior is added.

No-JS retains the authored native pair and markup. Explicit inputs are validated and
formatted before ownership/DOM writes. Unsupported Date/Intl options leave the prior
pair unchanged, not a success-shaped empty/black/fallback result. No dependency or
locale/date polyfill is installed.

## Explicit instant and unit domain

`time` is required for both formatter and binding: **Date or number**, not string.
Pass Date.now() explicitly when a creation-time instant is wanted. Valid zero and
negative values are never mistaken for missing inputs.

| Input | Contract |
| --- | --- |
| Number, unit=milliseconds (default) | Finite safe integer epoch milliseconds |
| Number, unit=seconds | Finite safe integer epoch seconds, multiplied once by 1000 |
| Date object | Its actual native getTime() instant, regardless of numeric unit |
| Strings / parts objects / null | Rejected, including offset-bearing ISO strings passed directly |

The numeric unit applies to both numeric time and numeric to. Date objects are **never**
multiplied by Unix units (a deliberate correction to the reviewed source path).
Overridden Date.valueOf/getTime properties are not used for brand conversion.
Bound Date inputs are copied at set/bind time, not watched for later mutations.
Changing unit reinterprets stored numeric inputs, not the copied Date instants.

Supported UTC instants are **0001-01-01T00:00:00.000Z through
9999-12-31T23:59:59.999Z**, epoch milliseconds -62135596800000..253402300799999.
Invalid Dates, infinities, fractional numeric units, out-of-range values and implicit
coercions reject. Absolute formatting also rejects a zone projection crossing into
BCE/year 0 or year 10000, rather than ambiguously hiding the era/boundary.

This is **not** Calendar/Date Picker floating `YYYY-MM-DD`, `YYYY-MM`,
`datetime-local`, or Time Picker's floating clock string domain. Converting those to
an instant requires an explicit application timezone/DST policy. Do not pass them to
Time or infer that UTC ISO slicing describes an application-local day.

## Native absolute formatting

| Option | Default / meaning |
| --- | --- |
| type | datetime; date, time-only and relative are also supported |
| unit | milliseconds |
| locale | en-US; bounded native BCP47 string, supported locale required |
| timeZone | UTC; validated/canonicalized by native Intl |
| dateTime | Optional validated native Intl field/style options, not format tokens |

All absolute labels explicitly use **calendar:gregory** and the requested timezone.
A locale extension requesting Buddhist/Islamic/etc. cannot silently change the grid/
year convention. Native numbering, punctuation, locale fallbacks within supported
languages, hour-cycle conventions and timezone name data remain engine-owned.
The machine datetime is always a canonical UTC ISO string for the exact input instant.

Date/time-only modes are **display projections of an instant**, not floating dates or
clock values. Omitted display fields need not identify the instant uniquely; datetime
still does. The default datetime preset includes date, 24-hour clock with seconds and
timezone name. Date uses year/month/day; time-only uses clock/zone. DST folds can show
the same clock hour with distinct offsets/names and distinct datetime values.

dateTime accepts dateStyle/timeStyle, weekday, era, year, month, day, hour, minute,
second, fractionalSecondDigits, hourCycle, hour12 and timeZoneName, each with its native
bounded enum/boolean grammar. A nonempty bag replaces the preset rather than merging
in incompatible default fields. Undefined fields are omitted. Native style/field
mixing rules are validated before DOM changes; hour12's native precedence over
hourCycle is not reimplemented. Date mode rejects clock fields and time-only rejects
date fields. Relative mode rejects a nonempty absolute dateTime bag.

Calendar/timezone are not forwarded through that bag, nor are arbitrary native or
framework props. Null options are invalid; use omission/undefined. There is **no**
date-fns formatter-token parser (`format:"yyyy-MM-dd"`), token precedence or source
locale/dateLocale provider graph. Use explicit Intl options instead.

## Relative references, units and rounding

`formatTime(time, {type:"relative", to})` is deterministic and **requires to**.
Positive time-to means future (“in …”), negative means past (“… ago”).
The result includes canonical datetime, normalized millisecond time/to, native locale/
zone and relative unit/amount/nextChangeMs metadata. Result records are frozen.

The binding's omitted relative to captures the clock **once** by default, independently
of the explicit time instant. Static refresh keeps that captured reference; it does not
turn “one minute ago relative to epoch+60s” into “relative to now”. Supplying to makes
the reference explicit. `set({to:undefined})` requests a new static clock snapshot.

Relative units are elapsed quantities, never timezone calendar arithmetic:

| Unit | Fixed duration |
| --- | ---: |
| second | 1,000ms |
| minute | 60,000ms |
| hour | 3,600,000ms |
| day | 86,400,000ms |
| week | 7 elapsed days |
| month | 30 elapsed days |
| year | 365 elapsed days |

relativeUnit defaults to auto: choose the largest duration above not exceeding the
absolute difference, with second as the minimum. An explicit unit fixes that scale.
Quantities round to nearest integer with **signed halves away from zero**. Negative
zero is preserved for native past-zero wording. Auto unit changes and rounding can
produce “60 seconds” just before switching to “1 minute”; no date-fns distance parity
or calendar-month length is implied.

numeric defaults to always; auto enables native phrases such as “now”/“yesterday”.
Those phrases still describe the rounded **elapsed-unit amount**, not the timezone's
previous/next calendar date. relativeStyle is long/short/narrow. Relative timeZone is
validated but does not change elapsed arithmetic.

## Optional live reference and bounded scheduling

`live:true` is allowed only with type=relative and **omitted to**. The explicit time
stays fixed; only the reference samples the clock. Enabling live with an explicit to
or an absolute type rejects before changing a valid binding.

One one-shot timer follows the next rounding or automatic-unit boundary. Native
timer delays are clamped to **at least 1,000ms** and at most 2,147,483,647ms. Nearby
boundaries are coalesced (up to one-second scheduling granularity), and very long
waits are segmented at the native timeout ceiling. There is no per-frame/per-millisecond
loop or unconditional per-second interval for minute/year displays.

The optional clock function is synchronous and returns bounded integer **epoch
milliseconds**, never seconds, Date or Promise. Default is Date.now. Static absolute
formatting never calls it. The helper is not a clock synchronization service: timer
throttling/suspension and system clock changes can delay display; use refresh when
application policy requires a fresh sample.

Automatic work pauses for document.hidden, hidden/inert/CSS-hidden/closed details/
dialog ancestry, native selection intersecting the time, or focus on the time/its
descendants/a containing focused control. No focus is moved. A live binding cannot
start inside an announcing aria-live/alert/status/log region; an author adding one
later suspends it instead of producing repeated announcements.

Leaving a pause computes **one** current result and next boundary, never replays
missed ticks. A live-to-static update captures a reference at that operation. Updating
options/disconnect cancels stale timers with generation guards. Clock failure on an
automatic refresh keeps the last valid pair, reports mui:time-error and stops retries
until explicit/environment refresh; it is not a success-shaped relative label.

## Owned text, selection, state and lifecycle

`createTime(element, options)` exposes element, the original Text node, connected and
state; `set(partialOptions)`, `refresh()` and `disconnect()` are explicit operations.
State separates requested millisecond time/live from rendered (the last visible
FormattedTime), pending, pauseReasons and error.

Setters validate before installing settings or cancelling a healthy timer. When
selection/focus/visibility blocks paint, both new text and datetime are deferred;
the old semantic pair remains intact and state.pending is true. Initial rendered
can therefore be null while the authored fallback remains visible. Static pending
updates apply on release without acquiring a ticker; live release uses the current
clock. Explicit static refresh does not resample a captured default reference.

Text.data and datetime are only written when their values actually differ. Same text/
attributes are not rewritten, preserving original Text identity and avoiding needless
selection invalidation. No innerHTML/textContent renderer destroys the author prefix
or sibling controls/listeners/ARIA.

Actual paired changes emit mui:time-change with the frozen FormattedTime; metadata-only
refreshes do not. No role/live region is added. Reentrant change handlers may set/
disconnect; the older scheduled work is cancelled. Mutations from clock evaluation
are rejected; disconnect is allowed and prevents stale writes.

Teardown stops timer/observer/listeners and releases ownership. Root/text-target
removal/replacement automatically disconnects. The authored datetime/text pair restores
only while both still match the owned pair and no native selection is active. If the
author replaced either half or a user is selecting the displayed text, leave the
current pair rather than restoring just half or destroying selection. The author owns
consistency after external edits. No earlier value is forced into replaced markup.
Rebind explicitly when needed.

No storage, network, clipboard, screen capture, object URLs, global app store or native
form field is owned. Countdown/Number Animation can later reuse concrete proven text/
timing behavior if justified; this scope does not introduce a speculative shared clock
framework. Static native time is still useful without helper/CSS.

## Acceptance — 2026-09-10

1. Native semantic pair/original text/author markup/ARIA/focus and readable fallback verified.
2. Explicit instants/units/zero/negative/year bounds/native Gregorian/zone/DST and relative
   quantity semantics validated without floating-string or token/provider compatibility.
3. Boundary scheduling, fixed/live references, selection/focus/hidden pauses, error/
   reentrancy/disposal and no redundant writes covered deterministically.
4. All reference rows/source additions reconciled, native Chromium/ESM/classic/no-JS/
   coexistence and independent build budgets recorded.

Targeted command: `pnpm test -- tests\time.test.ts tests\native.test.ts`;
build/declarations/budgets: `pnpm build`. **93 tests pass (66 Time + 27 native/legacy).**
Level-nine gzip: **4,767 ESM / 4,892 classic / 139 CSS**, combined **4,906 / 5,031**;
ceilings **6,000 / 6,000 / 500**. Core/advanced/widgets remain
**14,611 / 2,181 / 2,779**. Full raw/catalog details are in the
[current index acceptance](../naive-ui/index.md#time-accepted).

Observed Chromium: epoch 0 rendered Jan 1 1970 with exact .000Z datetime; -1000 rendered
Dec 31 1969. The New York DST fold produced 01:30 **EDT** at 05:30Z and 01:30 **EST**
at 06:30Z. Year 0001 rendered year 1, not 1901. A floating date string rejected with
the previous pair unchanged. Original strong prefix/Text node remained identical;
two redundant static refreshes produced **zero** text/attribute mutation records.

A live reference emitted one change during a 1.15s observation. Focus held “3 seconds
ago” unchanged; a native text selection held “5 seconds ago” and its exact Text node,
then release caught up once to “6 seconds ago” without moving outside focus. Opening
the hidden details sample rendered its pending pair once. The independent native form
field was unchanged. Document-hidden/catch-up behavior is covered by deterministic
visibility tests; this headless browser did not report document.hidden when merely
switching tabs, so that tab experiment is not claimed as native hidden-state evidence.

Thai requesting a Buddhist calendar still displayed Gregorian **2024**, with
Date.parse(datetime) equal to the normalized input. Native TIME semantics and the
same pair remained through RTL, 2x zoom, print/forced-colors/reduced-motion. No-JS
retained all four authored datetime/text fallbacks and hid enhancement controls.
Strict self-hosted script/style CSP with connect-src:none ran without page errors.
Classic formatting preserved Date(1000) as 1000ms even with numeric seconds selected.
A deferred selected pair remained unchanged on disposal. The unchanged legacy native
Time Picker still emitted its floating “23:59” value once; Time deliberately rejected
that string as an instant, while the independent native display remained unchanged.
