# Loading Bar: an explicit native progress surface

**🟢 Verified for the retained root-owned lifecycle, measured/unknown progress and CSS scope.**
No Vue provider, global singleton, network interception, request counting or operation
cancellation is included. Each bar belongs to an explicitly supplied native root.

## Loading and authored baseline

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/loading-bar` | `createLoadingBar`, controller/options/state types |
| `dist/markup-ui-loading-bar.js` | Self-contained ESM |
| `dist/markup-ui-loading-bar.global.js` | Classic `MarkupUILoadingBar.createLoadingBar`; refuses namespace replacement |
| `@dataengine/markup-ui/loading-bar/style.css` | Independent external `dist/markup-ui-loading-bar.css` |
| [Local demo](../../demo/components/loading-bar.html) | Separate HTML/CSS/JS; explicit local operations only |

```html
<div class="mui-loading-bar" data-loading-bar id="report-bar">
  <progress max="100" value="25" aria-label="Report preparation"
    aria-describedby="report-status">25%</progress>
  <span data-loading-bar-status id="report-status">25 of 100, supplied by the author.</span>
</div>
```

```js
// External setup script, after the classic entry and stylesheet.
const bar = MarkupUILoadingBar.createLoadingBar(document.querySelector("#report-bar"))
bar.start()          // Unknown work: no native value attribute.
bar.setProgress(40)  // Only an actual caller-supplied measurement.
bar.finish()         // Caller declares success; visible hold, then idle.
// bar.stop() resets only this UI. It never cancels external work.
```

The connected light-DOM root contains exactly one named native progress and one text-only
`[data-loading-bar-status]`, **outside the progress element**. The status has one nonempty Text
node, whose identity is preserved. Authored labels/aria-label/aria-labelledby name the progress;
unique authored IDs and aria-describedby can associate the independent words. No generated
IDs, duplicate wrapper progressbar role, live announcement or page-wide busy state.

This is a **passive status surface**: keep buttons, links, form controls, tabindex,
contenteditable and other interactive widgets outside it. Other explicit roles are limited
to group/status/note/none/presentation; native progress may retain an explicit progressbar role.
Do not override its native numeric semantics with aria-valuenow/min/max. Application content
is a sibling/ordinary document content, not provider-slot content rendered inside the bar.
Nested loading roots are rejected; independent sibling/local/fixed roots are supported.

Author root/progress hidden, class, style, max, name and label attributes remain author-owned.
The helper never removes authored hidden, disables other controls or moves focus. Error text
must remain readable, not hidden/aria-hidden or only embedded as progress fallback text.
An authored role=status may be retained, but delivery/timing of assistive-technology
announcements is not guaranteed.

## Lifecycle, outcome and measured values

| API | Actual contract |
| --- | --- |
| `connected` | Explicit lifetime |
| `state` | idle / loading / success / error presentation phase |
| `outcome` | null / success / error; terminal acceptance retained through auto-hide |
| `value` | Current native measured value, or null when value is absent; after disconnect this reads the restored authored progress |
| `start()` | Reset outcome/timer and start unknown, indeterminate work, including repeated starts |
| `setProgress(value)` | Loading-only measured amount in native max units; does not infer completion or finish automatically |
| `finish()` | First terminal result declares success and sets native value to max |
| `error()` | First terminal result declares failure, retains only any actual previous measurement and shows independent error text |
| `stop()` | Cancel internal hold/reset UI to idle and clear outcome; no external cancellation |
| `connect()`, `disconnect()` | Idempotent bind/release; reconnect starts idle, preserving native nodes |

Connection starts idle and emits no change notification. Either terminal method can report
an explicit outcome from initial idle as well as loading. **The first terminal result wins
until start or stop**, even after its surface auto-hides; repeated/opposite terminal calls
do not resurrect the bar or extend its hold. Disconnect clears outcome and internal phase.
Operations on a disconnected controller throw instead of silently succeeding.

The native max defaults to 1 when absent. Authored max must be positive and finite; value,
if present, must be a valid finite native number from zero to max. Fractional maxima/values
are supported. Malformed/negative/out-of-range values are rejected rather than treated as
successful measurements. setProgress requires loading and valid bounds; it changes native
value directly, without a tween or simulated percentage. At max, the phase remains loading
until the application explicitly calls finish.

Start removes value, preserving native indeterminate semantics. Loading/error/success words
use aria-valuetext as appropriate; measured loading removes that override so native value
semantics convey its actual amount. Error **does not fill to 100%**: CSS hides the progress
and leaves the independent error words and border visible. The retained numeric value, if
any, is only the last actual measurement. No estimate of remaining time is invented.

The pinned private implementation animates a cosmetic width from 0 toward 80 and fills
terminal widths. That simulation and its internal start parameters are deliberately omitted.
The public source documents start/error/finish only: **stop, setProgress and delay options
are explicit native-target additions**, not claims about upstream public API names.

## Holds, events and concurrent callers

Options are setup snapshots:

- `finishDelay`: **600 ms** default; null keeps success visible.
- `errorDelay`: **null** default, keeping the error readable until explicit reset.
- Each nonnull delay is an integer from **0–60,000 ms**. Zero schedules a later task, not a
  guaranteed visible frame. These are visibility holds, not scroll/CSS animation durations.
- `labels`: complete nonempty literal strings for idle/loading/success/error. Defaults are
  Not loading / Loading / Completed / Failed; no HTML parsing or locale/provider engine.

There is at most one terminal timer per controller. Restart/stop/disconnect/removal cancel
it, and a generation check protects already-stale callbacks. Timers are scheduled before
phase notifications, so a listener that restarts/disposes cannot be followed by a late timer
write from the previous phase. CSS transitionend is not used as a state machine.

`mui:loading-bar-change` is a nonbubbling `{ state, previous }` notification for actual phase
changes, including programmatic calls and automatic hiding. It is **not a user event** or a
network/animation completion promise. Repeated starts and measured updates in the same
loading phase do not fabricate another phase notification. Connect/disconnect are silent.
`mui:loading-bar-fault` reports automatic validation failures with `{ error }` after cleanup.
It is separate from the application's ordinary error() outcome. Explicit invalid calls throw.

**UI generations protect internal callbacks only.** If operation A finishes after operation B
calls start, an unguarded application finish from A can finish B's bar. Applications own
external operation identities, concurrent request policy, reference counting and cancellation.
No promises or request interceptors are hidden in this helper.

## Ownership and removal

Only the root's data-loading-bar-state, native progress value/aria-valuetext and the status
Text node are managed. External CSS implements idle/error visibility; install it with the
helper. Without CSS, a passive native progress/status remains usable but enhanced hiding and
error presentation are not supplied. No inline CSS, geometry writes or document styles are
injected. CSP needs the explicit script/stylesheet sources, not runtime style text.

A scoped MutationObserver records valid external writes as the newest author restoration
baseline, including observable same-value setAttribute/Text data writes. Removing an already
absent attribute produces no mutation and cannot be inferred as an ownership transfer.
Internal writes are excluded while observing is paused. Restoration is conditional on the
value still matching the last owned write; unrelated author updates survive.

Use the methods for coherent active-state updates. Valid direct author edits are preserved
for release, but a later explicit operation controls the managed fields again; this is not a
reactive application state store. The helper never rewrites max, hidden, names, styles, labels,
fallback text or surrounding document content. Repeated disposal cannot overwrite a new owner.

The observer watches the root subtree plus child lists of its actual ancestor chain, **not
the entire document subtree**. Same-document reparenting rebinds that chain. Root/ancestor
removal cancels timers and releases ownership on observer delivery; no polling is needed.
Replacing progress/status nodes or moving the status marker is a clear anatomy fault, not a
silent rebind to the wrong node. Reconnect explicitly to adopt new valid anatomy.
Prefer disconnect before intentional removal/cross-document handoff. Each root has one
active controller; separate roots have separate timers/state. No provider or global work store.

## CSS and acceptance — 2026-09-09

Inline flow is the default. The optional fixed class uses logical insets, safe-area minimums,
external height/color/track/z-index tokens and pointer-events:none, so this passive surface
does not block page actions. Native fixed-position containing blocks/transforms still apply;
there is no portal or universal viewport-following promise.

Indeterminate stripes are decoration without a numeric value. Reduced motion makes them
static; forced colors supplies a static outlined native progress cue plus words. Error is
not color-only. Print makes fixed bars static and stops stripe animation; authored/idle
hidden states remain hidden. Unsupported custom progress painting retains native progress
and status text, not an animation polyfill.

- **74 targeted tests:** 47 Loading Bar + 27 native/legacy; build/declarations/standalone
  ESM/classic/CSS and all prior/new budgets pass.
- Chromium: one named native progress owner, unknown/measured values, success/error/holds,
  first-outcome latch after auto-hide, rapid restart, independent roots, error words outside
  progress, native form/focus noninterference, ancestor removal and status-marker faults.
- Motion/forced-color/print, RTL/360px insets and 2x CSS zoom are verified. Review fixed
  terminal acceptance being lost on hide, status-marker reassignment and hidden error-text
  anatomy; regressions cover all three.
- Chromium also verifies the no-JS measured native example, ESM/classic/legacy coexistence,
  namespace collision preservation, observable same-value author updates and repeated
  disposal not altering a newer owner.
- Audit preserves **10 original owner/name/source identities**: **18 local rows, 10 adapted
  targets and eight omissions**. The catalog has **96 routes, 3,317 rows and 184/384 accepted
  tasks**, with **seven Planned P3 routes**. All **307 relative file links** in the changed
  documentation resolve; the master next-phase heading link is current.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Loading Bar ESM | 6,354 | 2,627 | 3,500 |
| Loading Bar classic | 6,526 | 2,700 | 3,500 |
| Loading Bar CSS | 3,356 | 826 | 1,250 |

One format + CSS: **3,453 ESM / 3,526 classic gzip bytes**. Previous optional/core/plugin
sources/outputs/ceilings are unchanged; core **14,611/15,000**, advanced **2,181/3,000**,
widgets **2,779/4,000**. No all-browser, physical-touch or screen-reader certification.
P3 remains incomplete. **Next: Dialog, then Modal/Drawer in prerequisite order.**
