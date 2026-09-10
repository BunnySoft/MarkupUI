# Countdown: native elapsed duration and finish-once delivery

**🟢 Verified retained elapsed-duration scope.** Existing native text or explicit unit
targets display time derived from monotonic timestamps. No date/animation library,
VNode renderer, global timer provider, interval-decrement drift or alarm service.
Completion never causes library-owned sound, navigation, network, clipboard or focus.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/countdown` | createCountdown, formatCountdown and settings/state/display/finish/controller types |
| `dist/markup-ui-countdown.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-countdown.global.js` | MarkupUICountdown; rejects namespace replacement |
| `@dataengine/markup-ui/countdown/style.css` | Optional external tabular-number/unit/focus presentation |
| [Local demo](../../demo/components/countdown.html) | Separate HTML/CSS/JS; native controls, text/units, hidden display and application-owned completion notice |
| [Complete reference](../naive-ui/components/countdown.md) | Ten original identities plus four explicit source additions |

```html
<time class="mui-countdown" data-countdown datetime="PT10S"
      role="timer" aria-live="off" tabindex="0">
  <strong>Remaining: </strong><span data-countdown-text>00:00:10</span>
</time>
```

```js
import { createCountdown } from "@dataengine/markup-ui/countdown"
const countdown = createCountdown(document.querySelector("[data-countdown]"), {
  duration: 10000,
  active: false,
  onFinish: ({ runId }) => {
    // Application-owned completion notice, outside the changing timer text.
    completion.textContent = `Run ${runId} completed.`
  }
})
startButton.addEventListener("click", () => countdown.start())
pauseButton.addEventListener("click", () => countdown.pause())
resetButton.addEventListener("click", () => countdown.reset())
```

Use a connected native span/div/p/time[data-countdown], not a synthetic custom element.
The whole root can contain one readable Text node, or one span[data-countdown-text]
can own the text while author markup/prefixes/controls remain intact. No nested or
overlapping Countdown/Time instant ownership is allowed.

Alternatively author **all four** span text targets: data-countdown-hours,
data-countdown-minutes, data-countdown-seconds and data-countdown-fraction. They must
each contain one existing readable Text node. Unit labels/abbreviations belong outside
these targets and are never rewritten. Fraction text includes its decimal point and
becomes empty at precision 0. Custom format is text-mode only, not an arbitrary multi-node
renderer. No nodes or hidden fields are generated.

A time root must have an authored **duration** datetime fallback, such as PT10S,
not an instant. The helper writes PT…S for the **rounded displayed duration**, never
a wall-clock expiry timestamp. Generic roots receive no datetime attribute. All
targets update as one owned display; surrounding author content/listeners/attributes
remain. No-JS retains readable duration fallbacks and native controls explicitly wired
by the application; demo enhancement-only controls stay hidden.

The role=timer/live=off above are explicitly authored, **not injected**. Announcing
aria-live/alert/status/log ancestry is rejected initially. If it is added later, paint
is suppressed instead of spamming ticks. A separate completion announcement is the
application's responsibility. No live region, role, tabindex or form behavior is added.

## Duration, current value, active state and reset

| Setting | Default / meaning |
| --- | --- |
| duration | 0 milliseconds; finite 0..31,536,000,000 (365 days), future reset target |
| value | Initial duration when omitted; explicit replacement starts a **new run** |
| active | true; false explicitly freezes elapsed remaining duration |
| precision | 0; display 0/1/2/3 fractional second digits |
| refreshInterval | 100ms; integer 50..60000, minimum ordinary visible-update cadence |
| format | null; synchronous text formatter from frozen CountdownTimeInfo |
| onFinish | null; synchronous post-completion notification |
| monotonicNow | Constructor-only `() => performance.now()` equivalent; explicit elapsed-millisecond clock |

Durations/current values are finite nonnegative milliseconds, including fractional
values. Negative, NaN, infinite, Date, string, epoch-like oversized and unknown inputs
reject before changing a valid run/view. Precision and refresh bounds are validated.
No absolute deadline/expiry, date/timezone, generic clock or reactive prop/provider
configuration is accepted.

- Changing `duration` changes only the future reset target; it does not alter current
  remaining time or implicitly restart. This follows the useful nonreactive Markdown
  contract rather than copying the source's watcher-driven rewrite.
- `set({value})` explicitly replaces remaining time and creates a new run ID, even for
  the same value. It retains the active flag unless active is supplied too.
- `reset()` creates a new run from the current duration, preserves active, clears the
  old completion/error state and cancels its stale timer/notification authority.
- `pause()`/`set({active:false})` freezes the exact sampled remaining duration.
  `start()`/active=true resumes from that point; the paused gap does not count.
- Merely toggling active on an already completed run does not restart or finish it
  again. Reset or explicit value replacement is required.
- Active zero starts with readable zero and one deferred completion check; inactive
  zero does not finish until started. A repeated reset-to-zero hook creates explicit
  new runs, bounded by owned task delays rather than a recursive/1ms loop.
- Reset/value replacement cancels the old run even if its expiry was not yet observed.
  Pausing or reformatting an already elapsed active run observes its completion once.

`value` is a **fresh clock-derived remaining observation**, and can throw if a supplied
clock fails. It never emits completion from a getter. `state` is a safe last-observed
snapshot: runId, duration, value, sampledAt, active, status, pending, pauseReasons,
rendered, error and errorPhase. A logically elapsed value can briefly be zero before
the next delivery task marks status finished; no alarm-time delivery guarantee is made.

## Elapsed time, not an absolute alarm

While active, remaining is computed from a saved remaining amount and elapsed
`monotonicNow() - startedAt`, clamped at zero. It is **not** reduced by a presumed
interval on every callback. Late/throttled callbacks therefore catch up with one
calculation rather than accumulating drift or replaying missed ticks.

The optional constructor-only monotonicNow must synchronously return finite,
nonnegative elapsed milliseconds no greater than Number.MAX_SAFE_INTEGER, and never
move backwards. It is named to make its domain explicit; Date/Promise/string values
and changing clocks through set are rejected. Default performance.now avoids ordinary
wall-clock edits, but browser/OS sleep suspension and precision behavior vary. A custom
function must actually meet the monotonic contract; numeric magnitude alone cannot
prove that a caller supplied the correct kind of clock.

This is **not** “finish at a particular UTC/local wall-clock instant”. There is no
Date.now fallback or timezone inference. Computing an initial duration from an epoch
deadline in application code does not turn subsequent elapsed timing into an absolute
alarm. Browser throttling/freezing/sleep and task scheduling can delay notification;
do not rely on this display for alarms, security, reservation expiry or server authority.

## Display rounding and bounded updates

`formatCountdown(value, precision)` is pure and returns frozen hours/minutes/seconds/
milliseconds, actual remaining, displayed milliseconds, precision, text and duration
datetime. Hours are total hours, not modulo 24; other components are 0..59/0..999.

Display rounds **upward** at 1000/100/10/1ms quanta, including precision 3. Positive
remaining time therefore does not display zero early. For example 1001ms at precision
0 displays 00:00:02; 1234ms at precision 2 displays 00:00:01.24. Actual completion still
requires sampled remaining <=0, not a formatted string or rounded component.

The default text is HH:MM:SS with optional fractional digits. No date-fns format
tokens/locale provider or VNode renderer exists. A custom format receives frozen
display components **and actual remaining/displayed values**, and must return nonempty
literal text <=512 characters synchronously. It may use native Intl in application
code; HTML-looking strings remain text. For independent unit styling use the four
authored unit targets rather than returning elements.

At most one timeout is owned. Visible work is scheduled for the next displayed boundary
subject to refreshInterval, or for the final check. **Every owned timer has a hard
50ms floor**; the final check may be sooner than the chosen ordinary refreshInterval
but never becomes a 1ms retry loop, even when clock precision is coarse. Very long
waits are segmented at the native 2,147,483,647ms timeout ceiling.

Precision is formatting precision, not millisecond refresh or alarm accuracy. Explicit
operations and visibility/reading-resume can refresh immediately. Unrelated document
events do not bypass the ordinary cadence. Equal text/datetime values are not rewritten;
paused/completed displays do not repeatedly sample/format on unrelated focus changes.

## Hidden rendering, selection and focus

Document-hidden, hidden/inert/CSS-hidden/closed-details/dialog ancestry, selection
intersecting the countdown, focused display/targets or a containing focused control,
and announcing-live-region ancestry suppress **painting**, not elapsed time.
Application start/pause buttons elsewhere in an explicit root are not confused with
the text target's reading focus.

When painting is suppressed, the helper keeps the last meaningful native text/duration
pair and pending=true. It schedules the remaining completion check, not background
visual ticks. Completion can be observed/notified while hidden/selected; a late browser
delivery still computes from elapsed timestamps. On return, one current/final display
is painted; there is no hidden-tab catch-up storm or implicit elapsed pause.

Explicit pause is different: it freezes remaining time and releases the timer entirely.
The helper never moves focus. Original Text nodes, prefixes, unit labels, controls,
form values and selection survive; there is no hidden submission proxy or auto-submit.

## Completion, errors and reentrancy

Only a **successfully formatted current run** can commit completion. `mui:countdown-update`
fires for actual display changes. `mui:countdown-finish` then reports runId/initialValue/
value=0, followed by optional onFinish if the run/owner is still current. Completed is
marked before callbacks so reentrant reset/start cannot duplicate an old finish.
Newer reset/value/dispose invalidates older following callbacks and timers.

A formatter/clock failure sets status=error, keeps the previous display, emits
mui:countdown-error with phase/runId and stops timed retries. It is not fake finished
state. Elapsed time has not been frozen by a formatter failure; recovery with a valid
set/refresh samples the actual elapsed remainder and can then complete once.

onFinish exceptions or promise returns also report status=error/phase=finish. The
numeric duration really reached zero, but the callback did not succeed; that hook is
**not retried** for the same run, because it may already have side effects. An explicit
successful operation acknowledges the error; reset/value replacement permits a new
run. No library sound/network/navigation/focus behavior accompanies completion.
If a finish hook resets/replaces the run and then throws, its error is reported with
the old runId and stale=true without stopping or poisoning the new run. Removal or
disconnect during notifications prevents subsequent old completion/hook delivery.

Mutations from clock/formatter evaluation reject; disconnect is allowed and prevents
stale writes. Post-commit finish/update handlers may reset or replace the run; generation
checks suppress old work. Promises are not awaited as formatting or finish gates.
Public invalid settings reject before replacing a healthy configuration; runtime
refresh/timer failures remain inspectable through state.

## Ownership and disposal

Each controlled root/target must retain its existing text-only anatomy. Replacement/
removal automatically disconnects rather than treating arbitrary new children as a
renderer slot. Instance ownership cannot overlap Time's instant text or another
Countdown. Existing owned-attribute restoration is reused; no existing Time/core/plugin
source or speculative application scheduler is refactored.

Disconnect is idempotent: clear timer/listeners/observer, invalidate callbacks and
release ownership. Restore original text/unit/duration state only when all still match
the owned values and no active selection is being protected. If the author changes a
part or the user selects it, keep the current meaningful display rather than restore
half a value or destroy selection. Native fields/controls/ARIA remain author-owned.

External CSS only supplies numeric/unit/focus presentation. Native media/RTL/zoom
inherit normally; no style strings, layout engine, animation frames, storage or locale
framework exist. No-JS remains a static duration display. Number Animation may later
share concrete proven behavior, but this scope creates no generic application clock.

## Acceptance — 2026-09-10

1. Readable native text/unit fallback and semantic duration/selection/form ownership verified.
2. Elapsed timestamp math, pause/resume, current/default/reset, zero/late ticks and run IDs verified.
3. Finish once, hidden elapsed continuation, no live spam, error/reentrant/disposal and cadence gates verified.
4. All original/source-added rows, independent ESM/classic/CSS budgets and real Chromium acceptance recorded.

Targeted gate: `pnpm test -- tests\countdown.test.ts tests\native.test.ts`.
**92 tests pass (65 Countdown + 27 native/legacy).** Build/declarations/budgets:
`pnpm build`. Level-nine gzip: **4,588 ESM / 4,717 classic / 208 CSS**; combined
**4,796 / 4,925**, under **6,000 / 6,000 / 750** ceilings. Core/advanced/widgets stay
**14,611 / 2,181 / 2,779**. Full counts/raw bytes are recorded in the
[current catalog acceptance](../naive-ui/index.md#countdown-accepted).

Observed Chromium: a two-second run displayed rounded 00:00:02 at ~1384ms remaining.
Pause held the exact sampled ~1363.7ms through a further 700ms wait; resume completed
once. Main/unit/hidden instances each finished their own run once. The hidden instance
still displayed its static 10-second fallback while actual value was zero and status
finished; reveal painted zero without another finish. Original Text/strong nodes stayed
identical and focus remained on the user's control.

A selected “00:00:01”/PT1S pair remained intact through completion, with one finish.
Releasing selection painted 00:00:00/PT0S without another finish. A final formatter
failure produced error/format with actual value zero but no finish; explicit recovery
completed once. A thrown finish hook produced error/finish and a surfaced application
message, not silent success. These are native display observations, not alarm/AT/
all-browser sleep guarantees; deterministic tests cover document visibility and late clocks.

RTL/2x zoom and print/forced-colors/reduced-motion retained the authored timer/live=off
policy, unit text and independent native form value. No-JS kept three PT10S/static text
fallbacks with enhancement controls hidden. A strict self-hosted script/style CSP with
connect-src:none completed one 300ms run without page errors. Classic mode observed a
controlled monotonic jump from 0 to 5000ms against a 2000ms run and finished once, not
by replaying ticks. A finish hook reset produced exactly runs 1 and 2. The existing
Time instant helper and unchanged legacy Time Picker retained their distinct values;
no mui-countdown custom element was registered.
