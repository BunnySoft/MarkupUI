# Popconfirm: native nonmodal confirmation

**🟢 Verified for the retained native confirmation scope, not framework API parity.**
Authored buttons and content remain in light DOM. The existing Popover helper owns native
activation, top-layer visibility, dismissal and positioning; this optional adapter owns only
confirmation admission, callback results, pending/error UI and per-opening/action identity.
No confirmation feature was added to the shared Popover or Tooltip bundles.

## Loading and native anatomy

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/popconfirm` | `createPopconfirm`, native controller/options/action/callback/error types and `PopconfirmPlacement` |
| `dist/markup-ui-popconfirm.js` | Standalone ESM, including the reused Popover implementation |
| `dist/markup-ui-popconfirm.global.js` | Classic `window.MarkupUIPopconfirm.createPopconfirm`; throws instead of replacing an existing namespace |
| `@dataengine/markup-ui/popconfirm/style.css` | Complete `dist/markup-ui-popconfirm.css`, composed from maintained Popover CSS and confirmation-specific rules |
| `demo/components/popconfirm.*` | Separate HTML/CSS/JS; local Promise simulations only |

```html
<link rel="stylesheet" href="./vendor/markup-ui-popconfirm.css">
<script defer src="./vendor/markup-ui-popconfirm.global.js"></script>
<script defer src="./confirmation-setup.js"></script>

<button type="button" id="review" popovertarget="confirmation">Review local choice</button>
<div class="mui-popover mui-popconfirm" id="confirmation" popover="auto"
  role="dialog" aria-labelledby="confirmation-heading" aria-describedby="confirmation-content">
  <h2 id="confirmation-heading">Apply this local preference?</h2>
  <p id="confirmation-content" data-popconfirm-content>The original preference remains until you confirm.</p>
  <div data-popconfirm-actions>
    <button type="button" data-popconfirm-negative>Keep unchanged</button>
    <button type="button" data-popconfirm-positive>Apply locally</button>
  </div>
  <p data-popconfirm-pending role="status" hidden>Working locally.</p>
  <p data-popconfirm-error role="alert" hidden>The action could not complete. Try again.</p>
  <p data-popconfirm-complete role="status" hidden>The inline decision completed.</p>
</div>
```

```js
// confirmation-setup.js; alternatively import createPopconfirm from the ESM named export.
const confirmation = window.MarkupUIPopconfirm.createPopconfirm(
  document.querySelector("#review"),
  document.querySelector("#confirmation"),
  {
    onPositive(event) {
      // Application-owned local work; no implicit request or destructive operation.
      return Promise.resolve(true)
    },
    onNegative() { return true }
  }
)
// Always dispose during application teardown, even while closed:
confirmation.disconnect()
```

No elements are registered, moved, replaced or generated. Templates may be instantiated by
the application before setup; existing inert templates and original node listeners are
preserved, not interpreted as a renderer. Labels, icons and action wrappers are authored:
there is no VNode/Button dependency, default locale service or injected warning artwork.
An optional `[data-popconfirm-icon]` can carry a decorative author glyph/image with explicit
aria-hidden; omit/hide it using ordinary HTML/CSS. No null-text button-removal API is exposed.

Use a native `button` trigger with effective `type="button"`. The panel is a native div,
section, article, aside or span with both classes, unique immutable ID, `popover="auto"`
and exactly `role="dialog"`. It needs an explicit nonempty aria-label or valid aria-labelledby,
and aria-describedby must reference its uniquely resolved `[data-popconfirm-content]`.
It is **nonmodal**: aria-modal must be absent or `"false"`, never `"true"`. No focus trap,
application inertness or fake menu/tooltip semantics is added.

Exactly one owned positive button, negative button, content, error, pending and completion
region are required. These six nodes must be distinct; decision buttons cannot contain each
other. Both decisions need effective type=button and meaningful authored text/name; submit,
reset, popovertarget/action and command/commandfor on decisions are rejected. Error is a
nonempty role=alert; pending/completion are nonempty role=status, all initially hidden.
Completion text provides feedback for the inline fallback rather than pretending it closed.
Custom wrappers and additional author actions are allowed; only the two marked decisions
invoke these hooks. Native attributes/classes on those buttons remain author-owned except
the narrowly tracked temporary pending disabled state.

Each `.mui-popconfirm` is an ownership boundary. Nested confirmations remain inside their
native parent in the DOM, matching Popover's no-portal rule. Out-of-tree nested panels,
Shadow DOM, cross-document pairs and legacy mui-popover ancestry are rejected.
Each document uses its own window/observers/native state; no provider or shared app store
arbitrates confirmations.

## Native interaction and controller

`createPopconfirm(trigger, panel, options?)` connects immediately, while the native panel is
closed. Supported options:

- `trigger`: `"click"` default, or `"manual"` with no declarative popovertarget.
  Hover/focus triggers and delay/duration options are deliberately rejected: confirmation
  requires an explicit opening request, not a transient descriptive hover surface.
- `onPositive(event)`, `onNegative(event)`: optional callback snapshots, described below.
- Shared `placement` (bottom default; twelve positions), `flip` (true), `gap`/`margin` (8px),
  `positioning` (`"auto"` or `"fallback"`) and initial `disabled` (false). Shared finite-number
  validation applies. Recreate after disposal to change options; disabled is live.

Click mode requires the native matching popovertarget and absent/toggle action. Popconfirm
installs **no trigger click/keydown handler**. Native click, Enter, Space and modifier behavior
run once, and native defaultPrevented policy owns whether the panel opens.
Manual mode uses explicit open/setShow requests; it still opens a native **auto** popover,
retaining outside/Escape dismissal. Native auto peers and DOM-nested ancestors keep their
existing arbitration; no new outside-click or Escape engine is introduced.

| API | Meaning |
| --- | --- |
| `supported`, `inline` | Native capability and explicit visible-inline fallback flag |
| `connected`, `show` | Lifecycle and actual native `:popover-open` state; show is false in inline fallback |
| `open()`, `setShow(true)` | Request native opening; actual boolean result, false when unavailable/cancelled/unsupported |
| `close()`, `setShow(false)` | Invalidate queued/pending UI and request native hide; setShow(false) returns false |
| `disabled` | Boolean; disabling invalidates pending UI and closes/refuses opening, without disabling the trigger's native action |
| `pending` | `"positive"`, `"negative"` or null for the currently running accepted hook |
| `lastAction` | Most recent accepted action's `Promise<boolean>` or null; rejects with the original callback failure |
| `syncPosition()` | Existing Popover update/boolean result, with its viewport and clipping constraints |
| `connect()`, `disconnect()` | Explicit idempotent lifecycle; reconnect closed after reinsertion, or recreate to change anatomy/options |

Programmatic visibility never invokes a decision callback or synthesizes positive/negative
events. Observe the panel's native beforetoggle/toggle events: opening is cancelable, closing
is not, and asynchronous toggle events may coalesce. A visible native panel and default Vue
show state are not interchangeable. No silent setter or callback-array forwarding is claimed.

## Decision timing, results and failure reporting

An action click is admitted in a **subsequent task**, not a microtask. Real browser event
dispatch may checkpoint microtasks between listeners; waiting for a task lets later button
listeners and delegated ancestors finish calling preventDefault first. Canceled clicks,
closed/replaced sessions, disabled/unavailable decisions and duplicate queued/pending
requests do not invoke a hook. This is an action-admission lock, not a permanent double-click
debouncer after a completed false result. Deliberate later retries remain available.

The original MouseEvent is supplied after dispatch; `event.currentTarget` has consequently
cleared. Use the known authored button or event.target as appropriate. Hooks run once after
admission, with busy/disabled UI already set. Authors must not change native button type or
commands during dispatch and then expect the helper to undo those native actions.
No actual external request, form submission, click synthesis or backend operation is added.

| Hook outcome | Retained behavior |
| --- | --- |
| Exactly `false`, directly or through a Promise/thenable | Unlock owned pending UI and keep the same native confirmation open |
| `undefined`/void, true, null, zero, string, object or any other fulfilled value | Accepted decision; close the native panel only if the same opening/action still owns it |
| Throw or Promise rejection | Keep the current panel open, restore pending controls, reveal authored error text; never auto-confirm |
| No callback supplied | Void/accepted behavior; native panel closes without an application side effect |

`lastAction` normalizes the decision result to true/false, **not** whether a current panel
was closed. A stale fulfilled true still resolves true but cannot alter a new UI session.
Capture the promise if you need to await that particular attempt. It is set when the
admitted hook is invoked, not at native click dispatch.

Failures emit `mui:popconfirm-error` on the original panel with
`{ action: "positive" | "negative" | null, error, stale }`. Current hook failures also reveal
the required error region without copying arbitrary Error.message/HTML into the document.
The original error remains observable by awaiting lastAction; the internal rejection handler
reports explicitly rather than leaving unhandled/rejected work silently ignored.
Action null identifies a confirmation anatomy failure. Shared Popover ownership failures can
also emit its existing `mui:popover-error`; its contract is not replaced.

**Stale rejections remain diagnostic:** an error event can arrive on the original, even
detached, panel after dismissal/disconnect, with stale=true. The helper performs no stale UI
writes, focus changes or disabled restoration. Application error listeners should inspect
stale before updating application UI. Existing author listeners are never deleted.

## Pending ownership, cancellation and focus

Each opening and admitted action has its own identity. Native hide, close/disable,
disconnect, parent dismissal and detected removal invalidate that identity and cancel
queued admission tasks. Resolving/rejecting earlier work cannot close a reopened confirmation,
unlock a newer action, resurrect an old error or mutate detached node attributes.
**UI dismissal does not cancel external side effects or abort a Promise.** Application work
needs its own cancellation/idempotency policy; this helper does not invent a transport,
AbortSignal framework or automatic reconfirmation.

While pending, both originally enabled decision buttons receive disabled, the panel receives
aria-busy=true, the authored pending region is shown and data-popconfirm-state is pending.
Initially disabled controls are not rewritten. No extra button, spinner node or animation
engine is created. Native outside/Escape/Tab remain available while the decision controls
are temporarily disabled; other authored controls are not frozen.

An action-local MutationObserver records **observable author attribute changes**, including
reapplying an already-present disabled=true or aria-busy=true value. Restoration drains
queued records before restoring only untouched helper writes. Foreign re-enabling, disabled
states and message visibility survive. Removing an already-absent attribute produces no
mutation and cannot be distinguished from doing nothing; that no-op is not an ownership
override. No DOM prototype interception or polling is used.

False/error completion restores the decision's focus only when focus is still inside the
panel or fell to body after disabling its focused control. Accepted native completion can
return to a safe invoker under that same condition, **rechecked after native closing
listeners run**. An unrelated focused control, including one chosen by an authored
beforetoggle closing listener, is not overwritten. No autofocus is assigned by the helper;
authors may deliberately put native autofocus on a suitable control, preferably a safe
negative action. Dismissal otherwise keeps native Popover focus behavior.

Confirmation action tasks, attribute-ownership observers and pending UI release on hide/
disable/disconnect. Connected button/native-toggle bindings and the panel-scoped anatomy
observer remain for reopening; full disconnect removes these too. The adapter wraps the
same public Popover disconnect method used by shared automatic removal cleanup, without
changing any shared implementation. Closed or idle inline application roots still require
explicit teardown. Replacing required nodes/IDs while connected is rejected; rebind instead.

## Styling, placement, loading order and fallback

The [Popover geometry contract](popover.md#positioning-styling-and-fallback-boundaries)
is reused unchanged: independently detected native CSS anchors, finite viewport-relative
fallback, flip/clamp, visual viewport, RTL, scroll/resize/ancestor cleanup and explicit update
for layout-only changes. No new positioning dependency, arbitrary x/y/virtual anchor,
transformed clipping solver, portal target or top-layer z-index service is introduced.
Geometry CSSOM writes retain the existing CSP caveat; external CSS is not a blanket claim
that every strict style policy permits runtime placement.

External CSS supplies action layout, optional icon/error colors and pending cursor, together
with composed Popover surface/raw/arrow/animation/scrolling rules. Arrow is an opt-in inset
decorative side indicator, not exact trigger-center parity. Reduced motion, forced colors
and print remain included. Width/header/footer/content styling is ordinary authored CSS,
not a Button/theme/style-object passthrough.

CSS composition happens in the existing build, with no dist-relative source @import and
no hand-maintained duplicate base stylesheet. Popconfirm JS/CSS alone works. If also loading
Popover JS, this complete CSS already includes its styles; a second Popover CSS request is
unnecessary. Standalone JS bundles include their shared code independently; combined costs
below count that duplication honestly.

No custom element is registered and legacy/core loading order has no replacement conflict.
The classic namespace refuses to overwrite unrelated APIs. Use one controller kind/copy per
pair, rather than binding duplicate ESM/classic bundles to the same nodes.

When native show/hide is unavailable, Popover temporarily removes the popover attribute and
the original panel is readable **inline**. `inline=true`, `supported=false`, show=false and
open returns false rather than claiming native visibility. The already-visible decision
buttons still run the same hooks and pending/error policy. Accepted inline results reveal
the completion region instead of faking popup dismissal; deliberate later activations remain
possible. Close clears owned transient UI but does not hide author-owned static content.
The invoker is unnecessary when the confirmation is already inline. Disconnect restores the
owned native attribute and transient state.

Without scripting, callbacks cannot run. The demo explicitly says so and performs no real
operation; meaningful native form controls and, where supported, native disclosure remain.
Applications needing no-JS business confirmation should author a normal server/native form
flow instead of relying on these type=button callback controls.

## Acceptance — 2026-09-08

- **161 targeted tests pass**: 40 Popconfirm, 52 Popover, 42 Tooltip, 27 native/core:
  `npm exec vitest run -- tests\popconfirm.test.ts tests\popover.test.ts tests\tooltip.test.ts tests\native.test.ts`.
  Native APIs are mocked in JSDOM; this is not browser certification.
- `npm run build`: TypeScript/declarations, standalone exports and composed CSS, zero runtime
  dependencies and all existing/new budgets pass.
- Real Chromium on the reused 4188 server: native click/Enter/modified click/Tab, no accidental
  enclosing form submit, ordinary submit/reset, negative/false/success/rejection, busy/error
  visibility, Escape/outside pending dismissal, nested child-first Escape and preserved nodes.
- Chromium review regressions: genuine later-button/delegated preventDefault cancellation,
  same-value author disabled writes, duplicate admission after re-enable, stale first result
  while a second action remains pending, stale rejection diagnostics, and closing-listener
  focus preservation. Both concrete review findings were fixed.
- Chromium placement/presentation/loading: actual CSS-anchor gap, forced fallback, scroll/full
  clipping, RTL start, edge flip, 320px resize, emulated 2x visual viewport, reduced motion,
  forced colors, print, self-contained helper-only CSS/JS, both legacy orders, separate realms
  and usable inline fallback callbacks/completion.
- Final Chromium checks also cover native trigger cancellation/Space, a named/described
  nonmodal accessibility-tree dialog, removal during a pending action with no detached-DOM
  mutation on late success, preserved classic namespace conflicts and explicit no-JS notice/
  native disclosure. Test-created frames/contexts were removed; no other tabs/server changed.
- Inventory audit preserves all 44 original owner/name/source identities, resolves 52 rows
  (30 adapted targets, 22 omissions), and confirms 96 routes, 3,248 tracker rows, 148/384
  accepted tasks and 16 still-Planned P3 routes. All 268 relative file links in changed
  documentation resolve. Inventory counts are not full upstream parity.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Popconfirm ESM, includes shared implementation | 16,976 | 6,247 | 6,500 |
| Popconfirm classic, includes shared implementation | 17,151 | 6,320 | 6,500 |
| Complete composed Popconfirm CSS | 3,681 | 1,162 | 1,250 |
| Popover ESM/classic, unchanged | 9,443 / 9,608 | 3,923 / 3,994 | 4,000 each, unchanged |
| Tooltip ESM/classic, unchanged | 12,686 / 12,851 | 4,877 / 4,949 | 5,000 each, unchanged |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One Popconfirm JS format plus complete CSS costs **7,409 gzip bytes ESM**, or **7,482
classic**. Popconfirm plus separate Popover JS and only complete Popconfirm CSS costs
**11,332 ESM** or **11,476 classic**, counting duplicated bundled implementation honestly.
Popover/Tooltip CSS remain 904/1,057 gzip bytes; no existing source/asset ceiling was raised.

No all-browser, screen-reader,
physical pinch/touch or universal assistive-technology certification is claimed.
P2 retained adapted scopes remain complete; P3 remains in progress.
**Next: Dropdown, in its own component implementation/acceptance/commit.**
