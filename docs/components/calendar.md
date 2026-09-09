# Calendar: a native Gregorian month table

**🟢 Verified retained date-only scope.** One bounded six-week native table with native
day/navigation buttons, separate selected/focused dates and safe literal annotations.
No date-fns/date-picker UI/chart/locale dependency, VNode renderer, provider, hidden form
field, polling, midnight timer or timestamp/formatter-token compatibility layer.

## Loading and native fallback

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/calendar` | createCalendar and settings/labels/date-parts/state/change/controller types |
| `dist/markup-ui-calendar.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-calendar.global.js` | MarkupUICalendar namespace; refuses replacement |
| `@dataengine/markup-ui/calendar/style.css` | Explicit external native table/control/focus/adjacent/status/media CSS |
| [Local demo](../../demo/components/calendar.html) | Separate HTML/CSS/JS, actual leap-month fallback and visible native date field |
| [Full reference](../naive-ui/components/calendar.md) | Every original identity and explicit source/inline/inherited addition |

```html
<section class="mui-calendar" data-calendar data-calendar-month="2024-02"
         tabindex="-1" aria-labelledby="schedule-heading">
  <h2 id="schedule-heading">Team schedule</h2>
  <div data-calendar-controls hidden>
    <button type="button" data-calendar-action="prev-month">Previous month</button>
    <button type="button" data-calendar-action="next-month">Next month</button>
  </div>
  <div data-calendar-scroll>
    <table data-calendar-table>
      <caption>Gregorian month: <span data-calendar-caption>February 2024</span></caption>
      <thead data-calendar-weekdays><!-- Authored native weekday row --></thead>
      <tbody data-calendar-body><!-- Authored readable static month rows --></tbody>
    </table>
  </div>
  <template data-calendar-cell>
    <td>
      <button type="button" data-calendar-day><span data-calendar-number></span></button>
      <span data-calendar-marks aria-hidden="true"></span>
      <span data-calendar-note></span>
    </td>
  </template>
  <p data-calendar-value>No date selected</p>
  <p data-calendar-status></p>
</section>
```

```js
import { createCalendar } from "@dataengine/markup-ui/calendar"
const calendar = createCalendar(document.querySelector("[data-calendar]"), {
  value: null,
  defaultValue: "2024-02-15",
  firstDayOfWeek: 1,
  isDateDisabled: (_value, parts) => parts.date === 12,
  getDayContent: (_value, parts) => parts.date === 14 ? "Planning notes" : ""
})
calendar.show("2024-03")
// calendar.disconnect() when the owner is removed.
```

Use a named connected native div/section with author-supplied tabindex=-1 as a safe
focus fallback. Original heading level/children/title/ARIA remain intact. The actual
captioned **table has no grid role**. There is one native thead/tbody, one plain
caption span, hidden control container, native td template and two plain readouts.
Keep fallback rows readable and noninteractive: binding parks those original nodes,
not named fields, buttons or links that would otherwise lose form/focus semantics.
The demo supplies all 35 cells of the authored February 2024 reading fallback.

The cell template has one visible enabled type=button day control with its number,
plus separate plain marks/note fields. No IDs, extra actions/form fields, custom elements,
disclosures or scripts belong in a cell template. Annotations do not go inside day
buttons. Controls use distinct labelled type=button actions: prev-month, next-month,
prev-year, next-year, today, clear. Author whichever top actions are useful.

No-JS keeps authored caption/week/month rows and hides enhancement-only actions.
Original native fields outside the calendar remain usable. Missing native canonical
date/Intl support rejects binding before exposing controls, not an imported polyfill
or success-shaped text fallback. Load CSS explicitly; Calendar installs no stylesheet.

## Date-only model and bounded Gregorian arithmetic

`value`, `defaultValue`, `today`, `min` and `max` use positive four-digit **YYYY-MM-DD**
dates in years 0001..9999. Value/default/today can be null; min/max cannot.
Panel is **YYYY-MM**. Empty strings, Date objects, epoch numbers, ISO instants/offsets,
locale text and invalid leap/month dates reject before changing the view.

Calendar reuses only [Date Picker's native canonical validator](../../src/components/date-picker/native.ts),
which probes detached input type=date. Its numeric coordinate is **not** the Calendar's
model or a conversion to local midnight. Calendar's private arithmetic uses Gregorian
year/month/day parts and integer day ordinals, not local Date setters or DST-sized days.
Leap rules include divisible-by-4, century exclusion and divisible-by-400 restoration.
Day zero is Gregorian 0001-01-01 (Monday); the last supported day is 9999-12-31.

Month/year moves clamp the current focused day into the destination month:
2024-01-31 → 2024-02-29; another month step → 2024-03-29, not a remembered 31.
A year step from leap February 29 becomes February 28 when needed. Years/months
never wrap beyond 0001/9999. Invalid/reversed min/max intervals throw; there is no
silent swap. All-disabled or empty selection states remain useful without searching
an unbounded range for a valid date.

Intl labels use an explicitly **Gregorian calendar and UTC timezone**. A temporary
Date carrier is constructed with setUTCFullYear, not Date.UTC(year,...) and its 0–99
remapping. It exists only to format names/labels, not to define an instant-valued API.
Locale calendar extensions/defaults cannot silently turn the grid Buddhist/Persian/
Islamic. Cell numbers and canonical values remain ASCII; locale changes names/full
date labels. Native font, numbering and assistive-technology presentation remain native.
There are no date-fns tokens, timezone conversion, alternate calendars or week-number APIs.

## Options, current/default/panel/focus

| Setting | Default / meaning |
| --- | --- |
| value | null, or initial defaultValue if value is omitted |
| defaultValue | null; future explicit reset target, separate from live value |
| panel | Explicit option, otherwise authored data-calendar-month, otherwise value/default/today month |
| today | null; no internal clock read or implicit UTC date |
| min / max | 0001-01-01 / 9999-12-31, inclusive canonical bounds |
| firstDayOfWeek | 1 (Monday); integer 0 Sunday through 6 Saturday, not inferred from locale |
| locale | en-US; bounded native locale string, explicit Gregorian formatting |
| disabled | false; gates Calendar user interaction, not other native form fields |
| isDateDisabled | null or synchronous `(dateString, frozenParts) => boolean` |
| getDayContent | null or synchronous `(dateString, frozenParts) => string` |
| labels | Optional today/selected/unavailable/none/failed strings; nonempty, <=100 characters each |

At least an authored/explicit panel or a value/default/today anchor is required. There
is no implicit current-month decision. The demo computes its initial Today snapshot
**in application code**, using local getFullYear/getMonth/getDate:

```js
const now = new Date()
const today = `${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
calendar.set({ today })
```

That snapshot does not update at midnight. Refresh it explicitly according to the
application/business timezone policy. Do not slice toISOString() for a local Today.
The Today action only navigates to the supplied day's panel/focus point; it does not
select the date. It is unavailable when no snapshot exists or it lies outside min/max.

Current selection, visible panel and roving focus are independent. `state` reports value,
defaultValue, panel, focusedDate, today, firstDayOfWeek, year/month, disabled and nullable
selectionAvailable. Initial focus prefers supplied value/today; if it is off-panel,
its day-of-month is clamped into the shown month (otherwise day 1).

Programmatic value assignment can retain an unavailable/out-of-bounds canonical date
for editing, with selectionAvailable=false and visible unavailable readout. Policy
refresh never silently clears the selection. User activation/select() refuses unavailable
dates. An unavailable current value is **not** a promise of form validity or server policy.

`set(settings)` is atomic and silent. A supplied nonnull value follows its month unless
panel is explicitly supplied in the same transaction. Panel is clamped to min/max month
bounds; value itself is not silently clamped. Changing only defaultValue does not change
current selection. There is no reactive attribute/prop watcher or framework provider.

## Commands and native keyboard contract

| Operation | Behavior |
| --- | --- |
| select(date or null) | Guarded user-style selection/clear; false when unavailable/disabled; emits only actual changes |
| show(YYYY-MM) | Explicit panel navigation; no automatic external focus movement |
| moveMonths(integer) / moveYears(integer) | Bounded relative navigation, clamped day and month/year limits |
| today() | Panel-only navigation to explicit Today snapshot; boolean success |
| reset() | Silent reset to current defaultValue; not native form reset |
| refresh() | Re-evaluate callbacks/labels/availability atomically, preserving valid focus and selected value |
| disconnect() | Restore owned native fallback/state and release listeners/observer |

The **native table of buttons is not an ARIA grid**. One date button has tabindex=0;
others have -1. Native table/caption/row/columnheader semantics remain. Roving focus is
not selection: arrows do not emit a selected value.

- Left/Right move one physical column: LTR -1/+1 date, RTL +1/-1.
- Up/Down move -7/+7 dates.
- Home/End move to logical week start/end according to firstDayOfWeek.
- PageUp/PageDown move one month; Shift+PageUp/PageDown move one year.
- Other Shift combinations, Ctrl/Alt/Meta, composition and keys from other controls
  are not captured.
- Enter/Space are **native button activation**; no extra keydown selection handler.
  Re-activating the selected date does not emit another change.
- Tab/Shift+Tab leave normally. There is no trap, fake tablist or injected key model.

Crossing months moves the panel where permitted. At min/max month boundaries, visible
adjacent dates can still be inspected but navigation stops at the displayed six-week
frame instead of browsing outside allowed months. Physical out-of-domain cells before
0001 or after 9999 are plain em dashes, not fake dates/buttons.

Unavailable dates are deliberately **focusable aria-disabled buttons**, so all-disabled
months are discoverable with exactly one roving tab stop and no valid-date search.
Activation is guarded. Native fieldset disabling still disables buttons natively;
the helper does not overwrite fieldset/form semantics.

Month/year controls remain focused when navigation changes the table. At a boundary,
the focused action uses aria-disabled/guarded activation until blur, then native
disabled; no hidden focused control. Day focus moves only for requested keyboard
navigation or to preserve Calendar-owned focus through a replaced view. Existing
external focus is never stolen. Dates/rows are retained for same-month focus/selection
updates; common date cells are reused across month changes while visible.

## Native labels, annotations and events

Day buttons have one full localized date name. aria-pressed conveys selection,
aria-current=date marks explicit Today, and aria-disabled conveys unavailability.
Visible words Today/Selected/Unavailable are separate from the day number and
aria-hidden because those states are already present on the button; status is not
color alone or duplicated in its accessible name.

Literal annotations live outside the button and are associated through a stable owned
aria-describedby ID when nonempty. getDayContent is bounded to 512 characters per date,
never HTML, DOM nodes, actions or VNodes. Static native decorative cell markup may be
authored in the template. Keep the template anatomy stable while bound.

All callback results for the next visible month (at most 42 physical dates plus an
off-panel selected date's availability) are validated **before month/selection DOM
mutation**. isDateDisabled must return actual boolean, not undefined or Promise.
Bounds make dates unavailable without calling that predicate. Annotation callbacks
receive every supported visible date, including adjacent/unavailable dates. Parts
are frozen `{year, month, date}` with 1-based month/day.

Thrown/invalid/async callback results keep the previous complete view. Synchronous
API calls throw; native action errors also populate error and emit mui:calendar-error.
Promises are not awaited as a veto/rendering pipeline. Callback-driven mutations during
preparation/commit reject; disconnect is allowed and prevents stale writes.
Mutating captured policy data requires refresh; there is no automatic data watcher.

`mui:calendar-panel-change` supplies panel/previousPanel/year/month/reason.
`mui:calendar-change` supplies value/previousValue/year/month/date/reason, with null
parts on clear. Panel notification precedes selection when both change. Reentrant
event handlers may set/disconnect; a newer transaction suppresses the old following
value notification. set/reset/refresh are silent; selection or panel no-ops do not
emit duplicate value/panel changes.

The selected-date readout is nonlive. A separate polite/atomic status announces the
month only for panel navigation when focus stays outside date buttons. Keyboard focus
already names the full date, so its panel changes do not add a duplicate live message.
Successful commits clear stale status/errors. No actual screen-reader speech parity
is claimed from DOM/AX inspection.

## Ownership, forms, fallback and limits

Calendar owns only generated date/week rows, declared caption/readout text, control
state and its own data attributes. It never rewrites the author heading level, root
ARIA or surrounding form controls. Original fallback head/body nodes remain intact
off DOM and return on disconnect, preserving their own identity/listeners. Generated
cells are bounded to the current month view; revisiting a removed date can create a
new native cell, not an unbounded historical cache.

External replacement of owned rows/anatomy rejects refresh and disconnects instead of
claiming a stale view. Teardown removes only owned rows; foreign replacement nodes
are not overwritten or merged with old fallback. Only still-owned text/attributes
restore. Removed owners disconnect automatically; explicit rebind gets a fresh owner.
No global timer, animation frame, resize/layout engine or backend/resource URL exists.

Calendar has no name/value hidden field and does not submit or intercept forms.
Native type=button controls never accidentally submit. The demo's visible date field
is synchronized by explicit application event listeners; native fields/required/
min/max/disabled/reset remain their own contracts. Native form reset does **not** reset
Calendar. An application wanting business disabled-date validation or a shared reset
must implement that policy explicitly; Calendar does not imply those files/fields
stop submitting merely because a date is unavailable.

External CSS provides one native scroll container, table layout, adjacent styling,
status words, focus, controls and media. Narrow/zoomed layouts may scroll horizontally
instead of squeezing away date/action meaning. RTL remains native logical table order;
keyboard horizontal deltas adapt physically. Print hides navigation/status announcements,
not the table. No alternate calendars, timestamp ABI, week-number/date-picker modes,
provider/formatter-token graph, arbitrary header/day renderer or all-browser/AT/print
guarantee is shipped. Broader P0 compatibility exceptions remain independent.

## Acceptance — 2026-09-10

1. Authored fallback, caption/heading/ARIA, native controls and exact restoration verified.
2. Gregorian year 1/99/centuries/9999, leap dates, bounds/clamping, explicit Today/week
   start, adjacent selection and separate focused/current/default state verified.
3. Literal notes, atomic disabled/content callbacks, all-disabled discovery, reentrant
   events/disconnect and form/focus ownership verified.
4. Exact reference dispositions, ESM/classic/CSS build budgets, real Chromium keyboard/
   native activation/table AX/RTL/narrow/zoom/media/no-JS/legacy acceptance recorded.

Targeted gate: `pnpm test -- tests\calendar.test.ts tests\date-picker.test.ts tests\native.test.ts`.
**157 tests pass (54 Calendar, 76 shared Date Picker, 27 native/legacy).**
Build/declarations/budgets: `pnpm build`. Level-nine gzip: **7,438 ESM / 7,570 classic /
640 CSS**, combined **8,078 / 8,210**; ceilings **8,000 / 8,000 / 1,250**.
Core/advanced/widgets remain **14,611 / 2,181 / 2,779**. Final raw/count details are recorded in
the [current catalog acceptance](../naive-ui/index.md#calendar-accepted).

Observed Chromium: 42 cells/six rows/one tab stop and a native table with caption,
rowgroups, columnheaders, cells and buttons in the accessibility snapshot—not grid.
ArrowRight from February 28, 2024 focused February 29 without selection; Enter emitted
one value change and Space on that same selection emitted none. PageDown focused
March 29 without changing selected February 29; Shift+PageUp moved to March 2023.
Tab left for the visible native date field.

January 31 month navigation clamped focus to leap February 29 while retaining selected
January 31 and focus on the Next control. RTL ArrowLeft moved forward one date. Thai's
requested Buddhist locale still rendered Gregorian February **2024**, not 2567.
Year 0001 labelled Monday January 1, year 1 (not 1901); 9999 ended Friday December 31
and disabled Next. A one-day interval exposed only February 29 for selection; making
all dates unavailable kept a focusable aria-disabled date and no selection.

A failing annotation preserved the previous six-row view. Native fieldset/form and
outside focus tests did not create a hidden value or auto-submit. The visible native
field's FormData value was explicitly updated by the demo, not the helper.
No-JS retained the authored five-row/35-cell leap-month calendar, no day buttons or dead
navigation, and an editable native date field. A strict self-hosted script/style CSP
with connect-src:none worked in America/New_York: the app's explicit Today was
2026-09-09 while the original +08:00 demo snapshot was 2026-09-10; Gregorian grid dates
and UTC-labelled weekdays did not shift.

RTL/2x zoom retained six rows and one date tab stop (432px client scope/868px visual
outer width including borders); native overflow owns narrow presentation. Print hid
controls but retained the table, and forced-colors/reduced-motion retained the date
structure. Disconnect restored the exact five-row/35-cell fallback, original heading
and caption and focused the named native scope rather than a now-hidden control.
Classic Calendar and the existing Date Picker both retained **0001-01-01** and
**2024-02-29**; loading the unchanged advanced plugin still produced its one native
date change event and did not alter Calendar.
