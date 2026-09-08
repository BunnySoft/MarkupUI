# Dialog: authored content and optional native decisions

**🟢 Verified for the retained native target, not Vue/service or pixel parity.**
Naive's `NDialog` is presentational content: its action handlers notify; it does not
itself own modal visibility. Its `DialogEnvironment`/provider adds modal lifetime and
false/Promise decisions. MarkupUI keeps these responsibilities separate:

- CSS-only `.mui-dialog` content works in a native section/article or dialog.
- `createNativeDialog(dialog, options)` owns only a real `HTMLDialogElement` lifetime.
- `createDialog(dialog, options)` adds explicit optional positive/negative/close decisions.
- `createDialogOwner(root)` owns a collection of authored template clones, not injection.

## Loading and native structure

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/dialog` | ESM helpers and TypeScript interfaces |
| `dist/markup-ui-dialog.js` | Self-contained optional ESM; no runtime dependencies |
| `dist/markup-ui-dialog.global.js` | Classic `MarkupUIDialog`; refuses namespace replacement |
| `@dataengine/markup-ui/dialog/style.css` | External `dist/markup-ui-dialog.css`, including shared native CSS |
| [Local demo](../../demo/components/dialog.html) | Separate HTML/CSS/JS and local simulated decisions |

```html
<dialog class="mui-native-dialog mui-dialog" id="review"
  aria-labelledby="review-title" aria-describedby="review-description">
  <header data-dialog-header>
    <span data-dialog-icon aria-hidden="true">!</span>
    <h2 data-dialog-title id="review-title" tabindex="-1" autofocus>Review change</h2>
    <button type="button" data-dialog-action="close" aria-label="Close review">×</button>
  </header>
  <p data-dialog-content id="review-description">Review the local change before confirming.</p>
  <p data-dialog-error role="alert" hidden>The action failed. Try again.</p>
  <p data-dialog-pending role="status" hidden>Waiting for the decision…</p>
  <footer data-dialog-actions>
    <button type="button" data-dialog-action="negative">Not now</button>
    <button type="button" data-dialog-action="positive">Confirm</button>
  </footer>
</dialog>
```

```js
// External script; explicit application ownership.
const review = MarkupUIDialog.createDialog(document.querySelector("#review"), {
  backdropDismiss: true,
  onPositiveClick: () => validateLocalDecision() // false, void or Promise
})
openButton.addEventListener("click", () => review.showModal(openButton))
// review.show(openButton) is modeless. Close first to change native opening mode.
// Before intentional removal: review.dispose(); dialog.remove()
```

The native dialog must be connected and named using `aria-label` or valid
`aria-labelledby` references. Preserve explicit headings, description associations,
form labels and authored nodes. Native role is sufficient; authored `role=dialog` or
`role=alertdialog` is retained. **Do not add `aria-modal`**: the same dialog can open
modelessly. No duplicate wrapper role, custom focus trap, manually inert document,
global key listener, scroll lock, portal or injected CSS.

`data-dialog-header/title/content/actions/icon` are authored layout regions, not slots
or render callbacks. Add/omit/hide the icon or close button explicitly. Decorations are
original text/CSS, aria-hidden, not a copy of upstream icon assets. Title/content and
labels remain author-editable DOM. Keep decision/status anatomy stable; disconnect by
disposing before replacing marked nodes. Invalid marked anatomy disposes and emits a
fault rather than binding to unexpected form controls.

## Native lifetime API

| Member | Exact native-target behavior |
| --- | --- |
| `dialog`, `connected` | Original native element and terminal ownership status |
| `mode` | `closed`, `modal`, `modeless` or `inline`; not a framework show prop |
| `generation` | Opening/lifetime invalidation token; also changes on native transitions |
| `showModal(opener?)` | Native modal opening where available; returns actual mode |
| `show(opener?)` | Native modeless opening; returns actual mode |
| `close(returnValue?)` | Immediate explicit closure; bypasses decision callbacks and cancel |
| `requestClose(returnValue?)` | Cancelable request, using exact native method capability or one cancel-event fallback |
| `dispose()` | Terminal, idempotent close/release; adopted authored element remains in DOM |
| `closeOnEsc` | Boolean setup snapshot, true by default; guards platform cancel, not a global Escape trap |
| `backdropDismiss` | Boolean setup snapshot, **false by default**, unlike upstream maskClosable |

An already open dialog retains its native mode; `showModal()` does not upgrade an
existing modeless opening. Close and reopen deliberately. Each helper opening resets
native `returnValue` to the empty string. `close()` without a value retains its current
value; native form outcomes remain observable via `close` and `dialog.returnValue`.
Direct native `show`, `showModal`, `close`, `cancel` and form closure are supported.
Do not toggle the `open` attribute to dismiss a top-layer modal: use native `close()`.

Opening uses native focus steps and authored `autofocus`, including a heading with
tabindex=-1. No opt-out from required modal focus semantics. Browser focus restoration
runs first; an explicit connected opener is a fallback only while focus remains inside
the closing surface or on body. Removed/disabled/hidden/inert triggers are not focused.
Other focused surfaces are not disturbed. Browser top-layer nesting owns interaction
blocking; multiple independently owned native dialogs are supported. There is no
document-overflow modification, and **body-scroll blocking is not promised**.

Platform Escape/cancel is separate from the close-button callback. Modeless Escape uses
the browser's policy; there is no synthetic modeless Escape behavior. Author cancel
listeners may prevent closure. Explicit `requestClose()` remains usable with
closeOnEsc=false. Native `closedby=none` remains author-owned; don't combine
`closedby=any` with this controller, which rejects it to avoid duplicate light-dismiss.
No commandfor/click double handling: enhanced action buttons reject native command and
popover-command attributes; ordinary native controls stay unmarked.

Backdrop dismissal requires the **same primary pointer** to start and end outside the
dialog's border rectangle. Padding clicks, inside-to-outside drags, cancelled pointers,
secondary buttons and later preventDefault do not dismiss. A nonbubbling cancelable
`mui:native-dialog-backdrop` event has `{ event: PointerEvent }`; prevent it to veto
that request. It is emitted only for the opt-in eligible backdrop path. This is not a
general mask-click callback or a touch-gesture/animation library.

If showModal is absent, the helper uses genuine native show; if both are absent, it
sets an explicit inline open baseline. Neither fallback claims modal semantics or traps
focus. Inline mode gets one synthetic native-shaped close/cancel event where methods
are absent. Unexpected native opening errors throw rather than silently claim success.
For entirely missing HTMLDialogElement implementations or no JavaScript, author visible
inline content/native links, as in the demo; no hidden dead-content polyfill is supplied.
An author-cancelled native beforetoggle leaves the surface closed.

## Decision and native form contracts

`onPositiveClick(event)`, `onNegativeClick(event)` and `onClose()` are setup callbacks.
Only marked, named native **type=button** controls invoke them. No positive, negative,
close or business action is generated. There is at most one marked button per action.
Any decisions require separate, initially hidden, nonempty error alert and pending
status regions. No loading spinner, live success announcement or application busy state
is fabricated.

- No callback, `void`, or any result other than exactly `false`: close with returnValue
  `positive`, `negative` or `close`.
- `false` or Promise resolving false: keep this opening, restore owned pending state.
- Throw/reject: keep this opening, restore pending state and reveal authored error text.
- Pending: disable only enabled marked action buttons, set native-root aria-busy and
  reveal pending words. Native form inputs and unmarked controls remain untouched.
- `pending` exposes the active action; `lastAction` exposes its Promise<boolean>.
  `lastAction` **rejects on failure**. An internal rejection observer prevents an
  accidental unhandled-rejection while separately surfacing failure; consumers may
  still await/catch the Promise.
- `mui:dialog-error` is nonbubbling `{ action, error, stale }`. `action=null` denotes an
  anatomy fault. Stale failures are still reported but never repaint a new/disposed UI.

Clicks start on a following task, so later bubbling preventDefault is respected.
Duplicate queued and pending activation is ignored. Native cancel/form/explicit closure
can still close during pending and invalidate the action. Generation and identity checks
run again **after focus restoration**, preventing reentrant author handlers from making
old completion close/repaint another opening. External side effects are not cancelled.

**Native form lane:** leave `form method=dialog` submit controls unmarked. The helper
does not intercept clicks or submit, call submit/requestSubmit, mutate button type,
prevent submission, or bypass constraint validation. Valid forms close natively exactly
once with the submitter's value; invalid forms remain open. Native formnovalidate is the
author's explicit escape from validation. This lane intentionally bypasses asynchronous
decision callbacks. To validate a business decision asynchronously, use an explicit
type=button action and own that validation in the callback; don't label a native submit
control as an async decision.

Only owned aria-busy, disabled, hidden and fallback-marker writes are restored. Scoped
attribute observers preserve even identical subsequent author writes. No style/numeric
geometry writes occur. Direct author updates remain author-owned; do not rely on an
attribute already absent generating an observable ownership transfer. No arbitrary
HTML/string evaluation, router, HTTP or untrusted rich-content insertion.

## Explicit template ownership

```js
const owner = MarkupUIDialog.createDialogOwner(document.querySelector("#dialog-host"))
const instance = owner.create(document.querySelector("#review-template"), {
  title: "Local review", content: "Literal text", positiveText: "Proceed",
  type: "warning", modal: true, onPositiveClick: validateLocalDecision
})
instance.close()       // Retain the owned clone for explicit reopen.
instance.showModal()
instance.dispose()     // Release and remove this clone only.
owner.destroyAll()     // Dispose only this owner's clones, reverse creation order.
owner.dispose()        // Terminal collection teardown; reentrant creation is rejected.
```

One trusted native template must contain one closed, non-hidden dialog. Templates are
cloned; original nodes/listeners are not moved. Clone listeners must be added explicitly.
Script/style/iframe/object/embed elements are rejected. This is not a sanitizer for
untrusted templates, URLs or inline event attributes; the author still owns markup safety.
Template options title/content/positiveText/negativeText replace only one text-only
marked region and must be nonempty strings. No controls or rich authored children are
replaced. `type` accepts default/info/success/warning/error; modal defaults true.
Missing button labels do **not** create buttons. Use independently authored templates.

IDs must be unique, both inside a clone and against the document. Concurrent clones of
the same ID-bearing template are rejected, not silently renamed; use an aria-label
template without IDs or distinct authored IDs. `owner.dialogs` is a new readonly
snapshot of owned handles, including closed clones, not a reactive show list. No
info/success/warning/error shorthand methods, provider injection or global singleton.

The per-native-node Symbol.for ownership guard also rejects double adoption across
separately evaluated ESM/classic/companion bundles. No mui-* tags are registered and the
legacy MuiDialog is unchanged. Each native observer watches open and child lists on its
actual ancestor chain, not the document subtree. Reparenting refreshes that chain.
Root/ancestor removal disposes on observer delivery; action anatomy is locally observed.
Prefer `dispose()` **before intentional removal or cross-document transfer**; never reuse
a disposed controller. An externally removed template clone is released from its owner.
Repeated disposal cannot close a subsequent owner's surface.

## Per-property migration scope

The [reference tracker](../naive-ui/components/dialog.md) retains every original
owner/name/source identity and explicit source-only/inherited additions.

| Original family | Retained native target / deliberate difference |
| --- | --- |
| title/content/header/default/action/close/icon | Authored regions; factory text only; no VNode/render functions |
| titleClass/contentClass/actionClass/class | Authored native classList and external CSS, no reactive option forwarding |
| titleStyle/contentStyle/actionStyle/style | **Omitted** object/string passthrough; use external stylesheets |
| bordered/type/iconPlacement/showIcon/closable | data-dialog-bordered/type/icon-placement, authored hidden/omitted icon/close |
| closeFocusable/autoFocus | Native reachable close button and autofocus; no framework false-focus defaults |
| positiveText/negativeText | Authored labels or text-only clone options; absence never invents controls |
| positiveButtonProps/negativeButtonProps | **Omitted** prop bags; directly author native controls |
| loading | Owned action pending state, not a mutable framework loading prop |
| closeOnEsc/maskClosable/onEsc/onMaskClick | Explicit native policies/events with different default/backdrop timing above |
| onClose/onPositiveClick/onNegativeClick | Optional environment-like guarded decisions; CSS-only content has only native events |
| create/destroy/destroyAll/useDialogReactiveList | Explicit owner create, instance close/dispose, scoped destroyAll, snapshot list |
| error/info/success/warning shortcuts/useDialog/injectionKey/key | **Omitted** service sugar/injection/reactive key; explicit instance/node identity |
| to/provider default | Explicit owner root and its ordinary children, no teleport |
| blockScroll/draggable/bounds/zIndex/transformOrigin | **Omitted** document locking, dragging, positioning and animation geometry |
| onAfterEnter/onAfterLeave/themes/aliases | **Omitted** transition timing, CSS-in-JS theme forwarding and deprecated tags |

Class/style and responsive width belong to external CSS. Native top-layer order is not
an arbitrary z-index API. Reusable CSS supplies safe viewport bounds and whole-surface
scrolling so long content/footer remain reachable; action wrapping uses logical layout.
No motion is required, reduced motion is static, forced colors retain borders/words and
print removes modal sizing/backdrop effects. Supply approved script/style sources under
CSP; no unsafe-inline or runtime styles are required by the helper.

## Four migration steps and acceptance

1. [x] Reconcile native opening modes, cancellation, returnValue, focus and teardown.
2. [x] Retain guarded false/Promise decisions, pending/error and validated native form lane.
3. [x] Replace injected services with explicit authored-instance/template ownership.
4. [x] Verify nested surfaces, async/reentrant lifetimes, fallback, CSS and packaging.

### Acceptance — 2026-09-09

- **157 targeted tests passed:** 59 Dialog, 31 Image, 40 Popconfirm and 27 native/legacy.
  `npm test -- --run tests\dialog.test.ts tests\image.test.ts tests\popconfirm.test.ts tests\native.test.ts`
  and `npm run build` pass, including declarations, standalone packaging and all budgets.
- Chromium verifies real modal/modeless behavior, named autofocus heading, native
  invalid/valid/formnovalidate forms and returnValue without decision callbacks, platform
  Escape/cancel, nested top layers and parent/opener restoration.
- False/rejection, disabled/busy duplicate prevention, Escape/reopen stale completion,
  ancestor removal, independent template clones, scoped destroyAll, ESM/classic per-node
  ownership and unchanged legacy MuiDialog coexistence were exercised.
- Real pointer padding and inside-to-outside drags stayed open; outside-to-outside
  activation dismissed through native requestClose. Runtime capability reduction verified
  the inline cancel/close fallback. Script-blocked reload verified visible inline/native
  content and native form validation/closure without enhancement.
- RTL at **320×640 and 2x CSS zoom** kept the modal inside the viewport (241×561 measured
  border rectangle, 32px top inset), with no internal horizontal overflow and reachable
  scrolling/footer controls. Reduced motion, forced colors and print were checked.
  Native keyboard routing may temporarily enter browser chrome/body between cycles;
  background controls remained blocked by the browser, without a custom focus trap.
- Read-only review found and regression tests fixed focus/close/disposal reentrancy and
  lost ancestor observation after synchronous reparent/close. Final Chromium verification
  additionally exercised focus-triggered reopen and owner disposal during clone opening.
  Viewport-percentage height replaced a dvb bound after real 2x zoom exposed overflow.
- **105 original identities remain; 121 rows = 80 adapted targets + 41 omissions.**
  Catalog audit confirms **3,333 rows, 188/384 accepted tasks across 47 pages** and six
  remaining Planned P3 routes. All **436 relative file links** in the four changed
  documentation files resolve; the previous master heading anchor is retained.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Dialog ESM | 12,062 | 4,319 | 5,500 |
| Dialog classic | 12,323 | 4,442 | 5,500 |
| Dialog composed CSS | 3,121 | 1,007 | 1,500 |

One format + CSS costs **5,326 ESM / 5,449 classic gzip bytes**. Previous optional
component inputs and budgets are unchanged. Core remains **14,611/15,000**, advanced
**2,181/3,000**, widgets **2,779/4,000 gzip bytes**. No runtime dependencies were added.

Only Chromium and the existing jsdom test runner are claimed; not all-browser, physical
touch, screen-reader or upstream framework certification. **Next: Modal, then Drawer.**
