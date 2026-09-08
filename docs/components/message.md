# Message: bounded, root-owned native feedback

**🟢 Verified retained native scope, not Vue/provider or pixel parity.**
`createMessageOwner(root, options)` is an explicit service, not a global singleton,
browser Notification API, request interceptor or renderer. It imports only small feedback
expiry/removal helpers—no Modal, Dialog, Popover, animation or runtime dependency.
Legacy `mui.message.show/clear`, elements, output and overlay cleanup are unchanged.

## Loading and authored baseline

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/message` | `createMessageOwner`, Message owner/handle/options/update/error types |
| `dist/markup-ui-message.js` | Self-contained optional ESM |
| `dist/markup-ui-message.global.js` | Classic `MarkupUIMessage`; refuses namespace replacement |
| `@dataengine/markup-ui/message/style.css` | External composed `dist/markup-ui-message.css`, including reusable feedback placement CSS |
| [Local demo](../../demo/components/message.html) | Separate HTML/CSS/JS; local actions and modal-local owner example |

```html
<div id="messages" class="mui-feedback-host mui-message-host">
  <ol class="mui-feedback-list" data-message-items aria-label="Messages"></ol>
  <p class="mui-feedback-announcer" data-message-announcer role="status"
    aria-atomic="true"></p>
</div>
```

```js
// External script; no provider or imported application runtime.
const messages = MarkupUIMessage.createMessageOwner(document.querySelector("#messages"), {
  max: 5, duration: 3000, closable: true, keepAliveOnHover: true,
  focusFallback: document.querySelector("#show-message")
})
const work = messages.loading("Preparing local results") // persistent by default
work.update({ type: "success", content: "Local results ready", duration: 3000 })
// work.destroy(); messages.destroyAll(); messages.dispose()
```

Use a connected light-DOM native div/section/aside `.mui-message-host`, with one direct
native ol and one direct atomic polite status announcer. They start empty (formatting
whitespace is preserved); keep authored/no-JS message baselines outside these dedicated
regions. A safe native li fallback is built with createElement/textContent if no template
is supplied. It generates only status words, decoration, a native close button and hidden
plain error text—never business actions or HTML from input strings.

## One announcement policy, not a modal

Only the dedicated **role=status, aria-atomic=true** region announces creates/updates
and current close failures. Host and message items have no live role/aria-live; errors
are not automatically assertive. Visible native list items retain explicit kind words:
Message, Information, Success, Warning, Error or Loading, plus literal content. Meaning
never relies on color, a spinner or an icon alone. Stock kind words are English; template
close/error text is authored. No locale/provider engine or copied icon assets.

The owner appends one owned span inside the announcer and changes only that span. Its last
announcement may remain after removal; it is not an unbounded announcement/history queue.
Rapid updates may coalesce in browsers/assistive technology. No exact speech timing,
delivery order or screen-reader certification is promised.

Do not nest the host in another live region, or put additional live regions/output elements
inside its items. The template must not add item-level status/alert/log announcements.
Application errors such as rejected capacity can use a separate error-only status region;
do not echo every message there as well. The demo scopes such operation errors inside
the modal when appropriate.

Creation and updates do not focus items, create dialogs, inert the page or disable outside
controls. Fixed CSS **cannot cross native top layers**; use an owner rooted inside the
active native modal for modal-local feedback. There is no portal/focus/overlay manager.

## Owner and handle API

| Member | Native contract |
| --- | --- |
| `create(content, options?)` | Default type unless options.type overrides it |
| `info/success/warning/error/loading(content, options?)` | Explicit type convenience methods; their type wins over options.type |
| `messages` | New readonly snapshot of this owner's live handles, in creation order |
| `max`, `connected` | Configured capacity and terminal owner status |
| `destroyAll()` | Explicitly remove only this owner's messages; owner remains reusable |
| `dispose()` | Terminal release of owned items/span/listeners/observers/timers |
| `handle.element`, `closed` | Original created li and live/closed lifetime |
| `content`, `type`, `duration`, `remaining`, `paused`, `lastError` | Readonly controlled state, clock state and surfaced callback failure |
| `update(patch)` | Validated typed updates, not Vue reactive property mutation |
| `destroy()` | Idempotent explicit removal, not the close-button callback |

Content is a nonempty **string**. No numeric/render/VNode content or callback evaluation.
Types are default/info/success/warning/error/loading. Supported per-item options/patches:
type, duration, closable, keepAliveOnHover, showIcon and onClose; update also accepts content.
onClose may be cleared with undefined. Unknown style/render/spin/prop-bag options throw.
Invalid updates are rejected before changing state or restarting time.

Provider-like defaults are constructor snapshots: duration=3000, closable=false and
keepAliveOnHover=false. **Loading defaults to duration=0** unless that call explicitly
supplies a duration, unlike the source provider's ordinary 3000ms default. Changing its
type to success retains zero until the caller supplies a duration; no automatic business
completion or external cancellation is inferred.

Durations are integers **0–3,600,000 ms**, with zero persistent; negative, nonfinite,
fractional, null and string values are rejected. Every successful update restarts a fresh
full configured duration, including content-only updates. This differs from the source
environment's mount/hover timer behavior. Old timers are invalidated by generations.

## Capacity, expiry and keyboard focus

**max defaults to 5 and must be an integer 1–50.** At capacity, creation throws RangeError
before insertion or announcement. There is **no eviction, hidden queue or success-shaped
drop**, even for an unfocused oldest item. Persistent/loading messages consume a slot.
The caller must catch/report overflow, update an existing handle, or explicitly destroy
one. In-progress template creations also reserve capacity so reentrant constructors cannot
exceed the bound; failed creations release reservations.

Expiry pauses for **focus anywhere inside an item**, regardless of keepAliveOnHover.
Optional hover protection adds an independent hold. Leaving one hold does not defeat the
other. The clock resumes **remaining time**, rather than the source's full-duration
restart on hover leave. An update while held resets remaining time but remains paused.
An expiring callback rechecks focus/connection and is one-shot unless explicitly restarted.

Auto expiry never removes a focused message. Updates do not replace action/form controls,
and hiding a focused close button through update({closable:false}) throws: move focus first.
Explicit close/destroy/destroyAll/dispose may remove focused content. Only then, and only
when removal leaves focus on body, an explicitly supplied available focusFallback is used.
Without one, ordinary browser focus behavior applies; the owner never guesses a global
destination or focuses a new message. Automatic removal/anatomy-fault cleanup **does not**
invoke fallback focus. Removed/disabled/hidden/inert fallbacks are not focused.

## Close notifications, errors and reentrancy

Only an enabled, visible, named **type=button** `[data-message-close]` invokes onClose().
Its action runs on the following task so later bubbling preventDefault is respected;
duplicate queued activation is ignored. Expiry, destroyAll and programmatic destroy do
not invoke onClose. Native action forms and constraint validation remain untouched.

The source callback is a **void notification**, not a confirmation:

- Void or false returns close normally; false is not a veto.
- A synchronous throw keeps the current item open, shows authored error text, announces
  the failure politely and stops auto expiry until update/retry.
- A returned Promise is **not awaited**; closure happens immediately. Any later rejection
  is observed/reported as stale, not repainted into another item or a newer owner.
- An update/destroy inside the callback supersedes that old close attempt. A later failure
  cannot mutate detached error content or a replacement message.

`mui:message-create`, `mui:message-update` and `mui:message-remove` are nonbubbling native
notifications; create/update have `{ handle }`, remove has `{ handle, reason }` where reason
is close/destroy/expired/dispose/detached. These are not enter/leave animation hooks.

The cancelable nonbubbling `mui:message-error` has typed
`{ handle, error, phase: "close" | "anatomy", stale }`; a null handle indicates an owner
anatomy fault. Current close failures have visible error text. Failures with no current
surface are also reported to console unless an error listener calls preventDefault to
acknowledge handling. Preventing this error notification does not veto closure. lastError
remains inspectable on an archived handle. No rejection is silently converted into success.

Bulk/terminal teardown blocks reentrant creation and updates. Owner generations also
invalidate an in-flight template creation if a constructor clears/disposes the owner.
No global application state, network work or OS notification operation is created.

## Trusted templates and ownership

The optional constructor `template` contains one native `li.mui-message` with exactly one
data-message-kind, data-message-content, data-message-close and data-message-error.
Kind/content/error are separate plain text-only regions; error begins hidden and nonempty.
The close control is a named type=button without command/popover-command attributes.
An optional data-message-icon is aria-hidden and decorative only; showIcon controls its
visibility. Authored icon nodes are preserved through type changes, unlike fallback glyphs.

Additional native form/action nodes may live in a `[data-message-actions]` region. Attach
their listeners to the returned element; template listeners are not cloned. Nodes are
imported into the owner's active document before constructing their clocks—template
contents themselves belong to an inert document. Original template nodes/listeners remain
untouched. Updates keep the same item, regions and controls; only supplied managed visual
fields are repainted, with error presentation reset. Unmanaged disabled/style/form states
are not overwritten. Use update for controlled text/type/options rather than a reactive
renderer or replacing marked anatomy.

IDs must be unique inside a clone and against the document. Use an ID-free template for
concurrent repeated messages. Script/style/iframe/object/embed/dialog, autofocus and
editable content are rejected. This is **not a sanitizer** for untrusted URLs, attributes
or custom-element behavior; trusted custom constructors can run during import/connection.
No innerHTML/VNode/style-object evaluation occurs in the service.

An owner uses a per-root Symbol.for claim shared by feedback consumers/formats. Root and
actual ancestor child-list observation handles removal and reparenting, not a document-wide
subtree observer. Prefer dispose before intentional removal/cross-document transfer.
Moving a managed item outside its list releases its clock/listener/handle without deleting
it from an author's new location. Replacing announcer content preserves that new author
content; only the owned span is removed. Old clocks/disposal cannot affect a recreated item
or subsequent owner. Disposed handles/owners cannot reconnect.

## External CSS and property dispositions

Flow is the baseline. Add `.mui-feedback-host--fixed` and authored
`data-feedback-placement=top/top-left/top-right/bottom/bottom-left/bottom-right` for fixed
placement; top is the CSS default. **Left/right are physical**, including RTL. Width,
z-index and theme colors are external tokens/classes, not constructor style/placement
objects. Native viewport-percentage bounds, wrapping and stack scrolling protect small/
zoomed viewports. Fixed positioning still follows normal containing-block rules; no universal
viewport/portal guarantee. External CSP-approved scripts/styles suffice; no inline styles.

Loading decoration is static, with visible Loading words; no Spin dependency or fake
numeric progress. Reduced motion is static, forced colors retain outlines/text and print
makes fixed hosts ordinary flow. Stock type words are not a localization/provider service.

The [full tracker](../naive-ui/components/message.md) preserves every original
provider/method/handle/render-type/inline-field identity and source-only additions.

| Source family | Status | Native disposition |
| --- | --- | --- |
| create/info/success/warning/error/loading, destroy/destroyAll | 🟢 Verified | Explicit owner/handle operations, no injection |
| content/type/closable/showIcon/keepAliveOnHover/duration | 🟢 Verified | Typed create/update state, with stated timer/focus differences |
| max | 🟢 Verified | Bounded admission/rejection, never the source's oldest-item eviction |
| placement/container-class/to | 🟢 Verified | Authored physical placement/classes and explicit root |
| icon | 🟢 Verified | Authored decorative template node; no render-function option |
| onClose | 🟢 Verified | Void close notification and surfaced errors, not async confirmation |
| container-style/render/MessageRenderMessage and its inputs | ⏭️ Intentionally omitted | External CSS/trusted templates, no renderer/prop bag |
| spinProps and four inline fields | ⏭️ Intentionally omitted | Static original decoration, no spinner/style forwarding |
| onLeave/onAfterLeave | ⏭️ Intentionally omitted | Explicit native remove events, not transition timing |
| useMessage, private keys/hide/deactivate, themes/deprecated hooks | ⏭️ Intentionally omitted | Explicit native ownership; no provider/reactive framework |

1. [x] Define safe text/native templates, visible status words and one polite live policy.
2. [x] Bound ownership/capacity, persistent lifetimes and cleanup without eviction/queues.
3. [x] Verify updates, remaining-time hover/focus holds and explicit callback/error semantics.
4. [x] Accept concurrent roots, reentrant/removal cases, native forms/focus, CSS and packaging.

### Acceptance — 2026-09-09

- **86 targeted tests passed:** 59 Message/feedback and 27 native/legacy.
  `npm test -- --run tests\message.test.ts tests\native.test.ts` and `npm run build` pass,
  including declarations, standalone assets and all existing/new budgets.
- Chromium verified literal text, no creation focus steal, actual hover pause/resume,
  keyboard focus protection beyond the expiry duration, native template form validation/
  listeners/value preservation, deferred close and explicit fallback focus.
- Capacity rejection retained the focused message and unchanged DOM. Actual registered
  custom-element construction could not exceed max; removal/ancestor teardown invalidated
  old timers. Announcer replacement preserved author text without an automatic fallback
  focus jump. Synchronous close failure stayed visible; non-veto async failure was reported.
- Independent fixed/local/modal-local owners, local overflow errors, native modal focus,
  duplicate owner/namespace guards and legacy `mui.message` output/clear coexistence passed.
  A body-fixed message did not cross the native modal top layer.
- The final accessibility tree contained a native named list/listitem with visible Error
  words and close button, plus **one status announcer**, not item alerts or duplicate
  host-level live regions. This verifies structure, not universal speech timing.
- All six physical placements passed in LTR and RTL. At 1000×800, 512px-wide fixed hosts
  used 16px edge insets; left/right stayed physical in RTL. At **320px and 2x CSS zoom**,
  long text and interactive template inputs stayed within the viewport without horizontal
  item overflow; keyboard close remained usable. Reduced motion, forced colors and print
  flow passed. Script-blocked reload retained readable authored native baseline content.
- Review and regressions cover active-document template imports, reentrant capacity
  reservations, in-flight clear invalidation, automatic teardown focus suppression and
  one-shot expiry. No dependency, testing framework or animation tool was added.
- **47 original identities remain; 67 rows = 35 adapted targets + 32 omissions.**
  Catalog audit confirms **3,406 rows, 200/384 tasks across 50 accepted pages**, with three
  Planned P3 routes. All **401 relative file links** in the four changed documentation
  files resolve, and prior master inventory anchors remain available.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Message ESM | 12,468 | 4,739 | 6,000 |
| Message classic | 12,740 | 4,860 | 6,000 |
| Message composed CSS | 3,616 | 1,136 | 1,750 |

One format + CSS: **5,875 ESM / 5,996 classic gzip bytes**. Legacy overlay/core and all
previous optional sources, outputs and ceilings remain unchanged. Core/advanced/widgets
stay **14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings.

For Notification, reuse `feedback/expiry.ts` (validated, one-shot, focus/hover-protected
remaining-time clock), `feedback/lifetime.ts` (per-root claim/scoped removal observation)
and `feedback.css` (native flow/fixed stack conventions). Import template nodes into the
active owner document before making clocks. Keep Notification's content/close contracts
separate instead of importing Message's consumer logic.

Only stated jsdom/Chromium evidence is claimed, not all-browser, physical-touch,
screen-reader, OS notification or framework/transition certification.
**Next: Notification; Collapse Transition and Discrete API remain pending.**
