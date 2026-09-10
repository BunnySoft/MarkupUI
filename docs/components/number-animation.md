# Number Animation: native frames and exact finite endpoints

**🟢 Verified retained native numeric/text scope.** Monotonic elapsed interpolation,
one requestAnimationFrame, cached Intl.NumberFormat and existing text/data ownership.
No countup/animation/formatting dependency, global scheduler/provider, arbitrary child
renderer, financial-decimal model or completion sound/network/navigation/focus effect.

**2026-09-11 default-style audit:** [matched inherited text](../style-audit/components/number-animation.md).
The optional stylesheet adds only tabular numerals, overflow safety and keyboard focus;
typography, paint and CSS motion remain application-owned.

## Loading and native text

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/number-animation` | createNumberAnimation, formatAnimatedNumber, interpolateNumber and settings/info/state/controller types |
| `dist/markup-ui-number-animation.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-number-animation.global.js` | MarkupUINumberAnimation; refuses namespace replacement |
| `@dataengine/markup-ui/number-animation/style.css` | Optional external numeric/wrapping/focus typography |
| [Local demo](../../demo/components/number-animation.html) | Separate HTML/CSS/JS with finite extremes, retarget, error and media cases |
| [Complete reference](../naive-ui/components/number-animation.md) | Nine original identities and three explicit source additions |

```html
<data class="mui-number-animation" data-number-animation value="2500.5" tabindex="0">
  <strong>Total: </strong><span data-number-text>2,500.50</span>
</data>
```

```js
import { createNumberAnimation } from "@dataengine/markup-ui/number-animation"
const animation = createNumberAnimation(document.querySelector("[data-number-animation]"), {
  from: 0, to: 2500.5, duration: 1500, precision: 2,
  showSeparator: true, active: false
})
playButton.addEventListener("click", () => animation.play())
// Later: animation.retarget(3000, 1000), animation.pause(), animation.disconnect()
```

Use a connected native span/div/p/data[data-number-animation]. The root can contain
one readable Text node, or a single span[data-number-text] can preserve surrounding
author markup. Existing Text, prefix, listeners, ARIA and other native controls remain;
arbitrary children are not magically a renderer slot. No input values are mutated.

A native data root requires an authored value fallback; its generated value contains
the actual unrounded Number as a round-trippable string, including -0. That attribute
is **not** a successful form control or hidden submission field. Generic roots receive
no extra value attribute. Display text may round the same number according to precision.
No-JS keeps the meaningful author final-value fallback and no dead enhancement controls.

The implementation uses the same owned-attribute primitive and explicit original
Text-node lease protocol established by Time/Countdown. It does not import their
date/duration formatting or refactor prior assets into a scheduler framework.
Overlapping Time/Countdown/nested number ownership is rejected.

## Numeric and native formatting contract

| Setting | Default / meaning |
| --- | --- |
| from / to | 0 / 0; finite JavaScript Numbers, including negatives/fractions/-0/extremes |
| duration | 2000ms; finite 0..3,600,000ms |
| active | true; false pauses an unfinished run |
| precision | 0; integer 0..20 fixed fraction digits |
| showSeparator | false; native Intl grouping |
| locale | en-US; bounded supported native locale |
| easing | ease-out quint; linear or a bounded synchronous function also supported |
| format | null; optional literal text callback, not a renderer |
| onFinish | null; optional synchronous notification after the finish event |
| monotonicNow | Constructor-only synchronous elapsed-millisecond clock; native performance.now default |

Pinned source defaults differ from Markdown: source duration is 2000 rather than 3000,
and to is 0 rather than undefined. These choices are explicit, not guessed compatibility.
Unknown keys, nonfinite endpoints, strings, BigInt, decimal-money objects, invalid
duration/precision/locale/grouping and invalid callback types reject before replacing
a valid run or text.

`formatAnimatedNumber(value, {precision, locale, showSeparator})` uses native
Intl.NumberFormat with equal minimum/maximum fraction digits. All digits, signs,
grouping and decimal marks are formatted together, including locales using non-Latin
digits. This deliberately differs from source integer/fraction fragment splicing.
Native binary Number/Intl rounding and locale data are not financial decimal arithmetic,
lodash round/toFixed or all-locale byte-for-byte parity.

Each visible update uses a cached native formatter. Optional format receives a frozen
`{value, from, to, progress, runId, precision}` and must synchronously return nonempty
literal text <=2048 UTF-16 units. Native markup/URLs/Promises are not render results.
HTML-looking text stays literal. Formatting precision never alters the stored target.

## Overflow-safe interpolation and exact endpoints

Naive `from + (to - from) * t` overflows for opposite-sign extreme finite endpoints.
This helper uses a convex weighted combination for opposite signs and an endpoint-
anchored difference for same-sign values. Every intermediate result remains finite and
within the endpoint interval; unsupported/nonfinite progress fails, never renders
NaN/Infinity as success.

At progress 0 and 1 the exact requested Number is returned directly, preserving
fractional values and negative zero. No repeated float increment accumulates into the
final value. The displayed text can be rounded or grouped while controller.value and
data[value] retain the actual Number. Large numbers still have JavaScript Number
precision/underflow limits; the API is not arbitrary-precision mathematics.

The built-in ease-out is `1 - (1 - t)^5`. Custom easing is synchronous, finite 0..1,
and must preserve 0→0 and 1→1; overshoot/bounce outside that interval is excluded.
Skipped-motion cases do not invoke unused easing. Actual easing/formatter failures
stop safely at the last successful sample and surface an error rather than complete.

## Runs, updates, retargeting and cancellation

The animation uses accumulated **active** elapsed time plus native monotonic timestamp
differences, not a counter increment per frame. The injected monotonicNow must return
finite nonnegative nondecreasing elapsed milliseconds, not Date/string/Promise values.
Clock changes through set are not supported. Wall-clock timezone/date inference and
global clock providers are absent.

| Command / change | Contract |
| --- | --- |
| play() | No-op while playing; starts idle, resumes paused, replays finished/cancelled work from configured from |
| pause() or active=false | Freezes the sampled elapsed progress; paused wall time does not count |
| active=true | Starts/resumes unfinished work; does not implicitly replay an already finished run |
| cancel() | Stops at the last successful sampled value, active=false, no finish; later play is a new baseline run |
| reset() | New run ID/from baseline, preserves current active flag |
| retarget(to, duration?) | Samples the current unrounded logical value as new configured from, sets target/duration and starts a new active run |
| set from/to/duration/easing | Explicit replacement run from the new configured baseline, cancelling old authority |
| set precision/locale/grouping/format/onFinish | Does not restart; validates and reformats the current sample atomically |
| refresh() | Re-observes/presents current or held state without inventing a new run |
| disconnect() | Stops work, releases ownership and restores only still-owned text/data |

Structural settings are explicit replacement requests even if the supplied value
equals the old value. Retarget is the distinct operation that follows current
interpolation, not merely the last rounded text. It updates configured from as well,
so later replay uses that last retarget baseline.

`value` is a fresh logical observation while playing, and may throw if an application
clock/easing fails. `state` is a safe last-sampled snapshot: from/to/duration/value/
progress/runId/active/status, pending, pauseReasons, media/support information, rendered,
error and errorPhase. During hidden rendering, logical value can reach the target
before a visible sample and finish notification. There is no alarm-time promise.

Runtime clock/easing/formatter failure freezes the last good sample, clears active
permission and reports status=error with phase. Correct settings explicitly, then
play/resume or reset as appropriate. A finish-hook failure also reports error but
does not repeat an already completed hook automatically.

## Reduced motion, zero duration and visibility

Same endpoints, zero duration, prefers-reduced-motion or unavailable RAF/motion-
preference support present a useful **exact final value without intermediate animation**.
An active skipped run delivers finish on one guarded 16ms task so creation is not a
synchronous callback trap. Inactive prepared runs show from normally, or final when
motion is skipped, and do not finish until explicitly played.

Changing to reduced motion settles a playing run at its target. A paused prepared
run receives useful final text but does not notify until resumed. Skipping is latched
for that run; returning to no-preference does not unexpectedly reverse/restart it.
Create a new run/reset/replay when motion is wanted again. Cancelled values do not
restart or jump merely because the preference later changes.

Hidden/inert/CSS-hidden/closed details/dialog/document-hidden scopes, native selection
and focused display/containing controls cancel pending frames and defer painting/
completion. They do **not** freeze elapsed active time. On release, one elapsed sample
catches up, possibly finishing, without replaying a frame burst. Explicit active=false
is the separate elapsed pause.

Only one RAF is outstanding (including ID zero safely). Frame callbacks do no layout/
rectangle/style reads: visibility/media/selection state is cached through events and
scope-related mutation checks. Frames compute one clock/easing/value/format sample and
write only changed text/data. Browser refresh rate/throttling/sleep behavior remains
native; no global scheduler, physics engine or wall-clock correction is promised.

## Native ownership, completion and errors

No role or aria-live region is added. Announcing ancestry is rejected initially and
suspends updates if added later. If a meaningful completion notice is needed, author
one outside the animation and update it only on completion. Never announce every frame.

Reading focus/selection preserves the whole Text/data pair. Requested updates can be
pending while the last visible value remains; release presents the current/final value.
The helper never focuses a node or modifies other controls/form fields.

`mui:number-animation-update` reports actual visible pair changes. Finish is emitted
once for a current successful run as `mui:number-animation-finish`, followed by
onFinish if the owner/run remains current. The detail includes runId/from/to/exact value.
Same endpoints/zero/reduced-motion paths also finish once when active.

Newer set/retarget/reset/disconnect cancels old frames/completion tasks. Stale callbacks
cannot clear a newer frame handle or overwrite a new run. Clock/easing/format evaluation
rejects reentrant mutations; disconnect is allowed. Post-commit update/finish listeners
may replace/reset/dispose, suppressing older following hooks. If a finish hook starts
a new run and then throws, the old error is reported with stale=true without poisoning
the new run.

`mui:number-animation-error` supplies phase/error/runId, also reflected in state for
current errors. Callback promise returns are not awaited as a renderer/effect pipeline.
Unknown output is never accepted as successful NaN/Infinity/blank markup. Completion
performs no sound, network, navigation, storage, clipboard or focus action.

Removal/replacement of the owned text target disconnects rather than adopting arbitrary
children. Teardown restores the original text and optional data value only while both
still equal owned values and no active selection is being protected. Author edits or
active selection retain the current meaningful pair. Existing markup/listeners/ARIA
and native fields are untouched. No object URLs or file resources are created.

## Acceptance — 2026-09-10

1. Finite inputs/native formatting, overflow-safe interpolation and exact endpoint
   versus rounded display contracts verified.
2. Native RAF/monotonic pause/replay/retarget/cancel/reset, zero/reduced/hidden and
   bounded no-layout frame behavior verified.
3. Original Text/data/selection/focus/ARIA/forms, no tick announcements and guarded
   completion/errors/reentrancy/restoration verified.
4. Exact reference dispositions, native browser/ESM/classic/no-JS/coexistence and
   independent build budgets recorded.

Targeted gate: `pnpm test -- tests\number-animation.test.ts tests\native.test.ts`.
**89 tests pass (62 Number Animation + 27 native/legacy).** Build/declarations/budgets:
`pnpm build`. Level-nine gzip: **5,224 ESM / 5,359 classic / 147 CSS**, combined
**5,371 / 5,506**, under **6,000 / 6,000 / 500** ceilings. Core/advanced/widgets stay
**14,611 / 2,181 / 2,779**. Full raw/catalog details are in the
[current index acceptance](../naive-ui/index.md#number-animation-accepted).

Observed Chromium: an ease-out run produced 2010.369… while displaying 2,010.37,
paused at exactly 2156.129… through a 500ms wait, then retargeted from that value to
**-25.125**, displayed **-25.13**, and stored data[value] **-25.125** with one finish.
The original Text/strong nodes and native form value were unchanged. Opposite
±Number.MAX_VALUE endpoints completed at the exact finite target without NaN/Infinity
text; equal and zero-duration cases settled once.

Native selection retained an “8.75” text/data pair while fresh logical value reached
100; release rendered 100 and delivered one deferred finish. A hidden run similarly
deferred its finish until reveal. Reduced motion presented 333.5 immediately, even
before the browser's delayed media-change event; formatter failure retained a finite
last sample and status=error. German grouping produced “1.234,50”; Arabic ungrouped
formatting produced “١٢٣٤٫٥٠” while data[value] remained “1234.5”.

RTL/2x zoom/print/forced-colors preserved native text/form values. No-JS retained the
author's “2,500.50” final fallback. A 375px strict script/style CSP with connect-src:none
and reduced motion completed once without page errors. Classic mode, Time instant
formatting, Countdown duration formatting and unchanged native Time Picker behavior
coexisted; no mui-number-animation registration or implicit side effect was added.
