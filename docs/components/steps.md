# Steps and Step: native progress and selection intents

**🟢 Verified for the retained ordered-list, current/status and native-intent scope.**
This is not a wizard, tablist, validation pipeline or workflow engine. Authored content remains
visible; the helper does not create panels, fetch data, navigate or advance business state.
The legacy `mui-steps`/`mui-step` classes and registration remain unchanged.

## Loading and native baseline

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/steps` | `createSteps`, controller/options/request/status/item snapshot types |
| `dist/markup-ui-steps.js` | Standalone ESM |
| `dist/markup-ui-steps.global.js` | Classic `MarkupUISteps.createSteps`, refusing namespace replacement |
| `@dataengine/markup-ui/steps/style.css` | Independent external `dist/markup-ui-steps.css`, usable without JS |
| [Demo](../../demo/components/steps.html) | Separate local HTML/CSS/JS with explicit application acceptance |

```html
<ol class="mui-steps" data-steps id="progress" aria-label="Application progress">
  <li class="mui-step" data-step data-step-status="finish">
    <div class="mui-step__layout"><span class="mui-step__icon" aria-hidden="true">✓</span>
      <div class="mui-step__body">
        <h2 data-step-title>Details</h2>
        <span data-step-status-text>Completed</span>
        <p>Explicitly completed by the application.</p>
      </div>
    </div>
  </li>
  <li class="mui-step" data-step aria-current="step">
    <div class="mui-step__layout"><div class="mui-step__body">
      <h2 data-step-title>Review</h2>
      <span data-step-status-text>In progress</span>
      <p>Authored description and ordinary links remain native.</p>
      <button type="button" data-step-action id="review-action" hidden>Select review</button>
    </div></div>
  </li>
</ol>
```

```js
// External setup script after the classic entry and external stylesheet.
const list = document.querySelector("#progress")
const steps = MarkupUISteps.createSteps(list)
document.querySelector("#review-action").hidden = false
list.addEventListener("mui:steps-request", event => {
  // This example explicitly accepts a local presentation request.
  // An application may decline, validate or await work instead.
  steps.current = event.detail.current
})
steps.current = 0 // Silent before-first position.
```

Use connected same-document light-DOM `ol.mui-steps[data-steps]`, with direct `li.mui-step[data-step]` children and
optional inert templates. The helper neither flattens arbitrary wrappers nor clones templates.
Native list numbering stays one-based: custom start/reversed/li[value] configurations are
rejected for enhancement. A list label is optional; an authored heading can provide context.
No list/menu/tab roles are installed. Existing native list/listitem roles, if explicit, are
allowed; conflicting widget roles are rejected.

Every item needs one `[data-step-title]` with authored text and one readable
`[data-step-status-text]` containing exactly one nonempty Text node. Heading levels,
description HTML, links and icons remain authored. The helper changes only that status Text
node's data, retaining its identity. Decorative icons are optional, aria-hidden, and are not
the sole status indication. Author status words must remain visible or accessible through
ordinary visually-hidden styling, not hidden/aria-hidden content.

Optional `[data-step-action]` is a named `button[type=button]`, with no nested interaction,
other native command or conflicting role. It is not a click handler on the whole item.
Use native disabled/disabled fieldset for a blocked action. The helper never changes disabled,
name, type, href or application controls. **Links remain native links, without the action
marker or any helper navigation handler.** To disable a destination, author non-link text
instead of a live href; aria-disabled or dimming alone is not a disabled link.
Hide JS-only intent buttons initially and reveal them after connection, as in the demo.
The no-JS list, status words and ordinary destinations remain useful.

## Current, defaults and explicit statuses

| API | Contract |
| --- | --- |
| `current` option / mutable field | Null or a nonnegative safe integer, one-based among visible direct Steps |
| `defaultCurrent` | Target-only initial seed, not an upstream prop; explicit current wins |
| `status` option / mutable field | Current item's default status: process (default), wait, finish or error |
| `labels` option | Complete record of four nonempty literal strings; defaults Waiting / In progress / Completed / Error |
| `currentStep` | Last computed current li, or null |
| `steps` | Fresh snapshots `{ element, index, status, current, disabled }` for the last bound visible items |
| `refresh()` | Explicitly re-read children, hidden/status/disabled state and action anatomy |
| `connected`, `connect()`, `disconnect()` | Idempotent explicit lifetime |

With neither current nor defaultCurrent supplied, initialization adopts the single authored
`li[aria-current=step]`, or null. Multiple authored current markers are rejected. Per-item
descendant current markers are rejected for enhancement: **the li is the sole current-step
semantic owner**. Nested data-steps lists have their own independent ownership.

- Null means unset; zero means before-first. Neither selects an item.
- A nonempty list's count+1 is an after-last sentinel. Larger safe integers clamp to it.
- An empty list normalizes numeric current to zero; null remains null.
- Fractions, negatives, NaN, infinity and unsafe integers throw.
- Defaults are initialization-only. Reconnection retains accepted position/identity, not a
  reset to original markup. Disconnected setters can queue position/status for reconnection;
  item snapshots are last-computed data, not live disconnected DOM observation.

Status precedence is **item `data-step-status` > current status option > wait**. Current
position and completion are independent: **earlier items are not automatically finished**,
and after-last does not declare everything successful. Only explicit finish state says
Completed. An explicit wait/error item may still be the current position. No business
validation or permission result is inferred.

These are deliberate native adaptations. The pinned source gives every item process when
current is undefined, and otherwise derives earlier finish/later wait by index. This target
instead requires explicit completion and supplies a genuinely unset position. It retains
the source's four status names and explicit per-item override precedence, not its implicit
completion behavior or controlled Vue prop mechanics.

## Selection intents and native events

`mui:steps-request` is a **nonbubbling, noncancelable intent notification**, with
`{ current, previous, step, action }`. The number is the visible one-based ordinal; nodes are
the actual authored li/button. A request does **not** update current/status or imply success.
Applications accept by assigning current, or decline simply by not doing so. There is no
default transition to cancel, no synthesized accepted/change event and no async guard engine.
Even requesting the existing current item reports the actual native action once.

Only primary unmodified native button clicks are admitted; Enter/Space remain browser-owned.
No key-to-click synthesis or roving focus. Work runs in a later task so final synchronous
defaultPrevented from authored native listeners is respected. Native disabled/fieldset/hidden/
inert controls cannot produce a helper selection request. Ordinary links preserve href,
targets, modified/middle clicks, browser history/hash, focus and author cancellation.

Setters, refresh and connection never fabricate user requests. They invalidate queued work.
An unrefreshed reordered/replaced action is not silently reported with the wrong ordinal:
the queued action fails clearly, disconnects and emits `mui:steps-error` with `{ error }`.
Explicit invalid API/anatomy changes throw; automatic activation failures use the error event.
Application async work is application-owned; disconnect does not cancel external operations.

## Refresh, focus and restoration

Refresh preserves the selected **li identity** when it survives insertion/reordering. If that
item becomes hidden/removed, the same old ordinal chooses the successor or clamps to the
last remaining item; empty becomes zero. Reappearing items do not steal current back.
Before-first/unset persist, and after-last stays after the new last item when content grows.
Hidden/inert direct items and CSS display:none/hidden-visibility items are excluded from
visible indices. Call refresh after those changes; no layout polling or mutation observer.

Titles, controls, listeners, descriptions and inert templates are never replaced. Item
ownership tracks the current marker, computed status/connector/disabled-presentation attributes
and status Text node. A private per-item WeakMap prevents an old controller from restoring over
a receiving controller when an item is moved. Source baselines are restored before new claims.
Refresh both lists after transfers; use one helper copy per document and explicitly disconnect
before cross-document or independent-copy handoff.

Disconnect removes listeners/timers and conditionally restores only values still matching the
last owned write, including original text and current markers. Observable author text/ARIA
updates are preserved. Reserve managed attributes/text for the controller while connected;
edit data-step-status or use the label options for deliberate status changes.

Normal current/status updates do not focus anything. Explicit refresh recovers a formerly
owned focused control if it was removed, disabled or hidden (including a CSS-hidden ancestor):
current enabled intent button, first enabled intent button, then the list as a programmatic-only
focus fallback. Existing author tabindex is preserved; an owned fallback tabindex restores on
disconnect. Outside focus is never stolen. Tab order remains native, and no trap is introduced.
Call disconnect before removing a whole list; there is no automatic document removal observer.

## External CSS and acceptance — 2026-09-09

Native decimal list markers preserve ordered-list semantics. Small/medium presentation,
decorative icons, right/bottom icon-content layout and horizontal/vertical classes use logical
CSS. Bottom placement affects horizontal content flow, not DOM order or heading levels.
Vertical overrides that placement. Wide horizontal lists use native local overflow and wrap
text within items; at narrow widths they stack, without reporting a fictitious controlled
orientation callback.

Helper connector flags identify the last visible item, including CSS-hidden siblings.
No-JS connectors use optional :has support for siblings not marked hidden; without that support,
the ordered summary remains usable without connector decoration. Narrow and print layouts
omit connectors rather than draw misleading lines across wrapping rows. Nested roots reset
marker state tokens and keep independent orientation/current selectors. Forced colors retain
text/current/marker cues. Print keeps visible status words and authored hidden exclusions.
There is no animation, geometry write, CSS-in-JS, provider or mandatory Icon/Tooltip/Progress.

- **70 targeted tests:** 43 Steps + 27 native/legacy; build/declarations/ESM/classic/CSS and
  all old/new budget gates pass.
- Chromium verifies native list/heading semantics, status words/current ownership, pointer/
  Space/Enter once, native Tab/disabled/forms, application rejection, final cancellation,
  insertion/removal/sentinel state and CSS-hidden ancestor focus recovery.
- Read-only review found that CSS-hidden ancestors bypassed focus recovery; availability now
  checks ancestor display and has a targeted regression.
- Additional Chromium checks cover last-visible connectors, bottom/vertical precedence,
  nested marker scoping, RTL/360px stacking, 2x CSS zoom, reduced motion/forced colors/print,
  cross-root ownership, native modified links, no-JS summaries, reconnect/queued disposal,
  ESM/classic/legacy coexistence and unrelated namespace preservation.
- The inventory audit preserves **16 original owner/name/source identities**: **23 Steps rows,
  16 adapted targets and seven omissions**. The catalog has **96 routes, 3,309 rows and
  180/384 accepted tasks**, with **eight Planned P3 routes**. All **301 relative file links**
  in the changed documentation resolve; the master inventory heading link is current.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Steps ESM | 8,959 | 3,540 | 4,000 |
| Steps classic | 9,116 | 3,611 | 4,000 |
| Steps CSS | 3,626 | 1,081 | 1,250 |

One helper format + CSS: **4,621 ESM / 4,692 classic gzip bytes**. Previous optional/core/plugin
sources, outputs and ceilings are unchanged; core **14,611/15,000**, advanced **2,181/3,000**,
widgets **2,779/4,000**. No all-browser, physical-touch or screen-reader certification.
The declared P3 navigation workstream is accepted for retained native scopes; P3 overall
is still in progress. **Next: Loading Bar**, followed by the remaining overlay/feedback and
separate Collapse Transition/Discrete API scopes.
