# Notification: authored native cards with guarded close

**🟢 Verified retained native scope, not framework or pixel parity.**
`createNotificationOwner(root, options)` owns a bounded collection of native articles.
It reuses the accepted feedback expiry/root/CSS primitives, with a small pending-attribute
ledger. It does not import Message's consumer logic, a modal/Popover, provider, renderer,
animation framework or browser OS Notification API. Legacy `mui.notification` is unchanged.

**2026-09-11 default-style audit:** cards now follow the source's 365px width, 14px/1.6
type, 16px padding, 3px corners, shadow and semantic light/dark roles. Visible type words,
the accent edge and labelled native close action remain intentional differences. See the
[measured audit](../style-audit/components/notification.md).

## Loading and native baseline

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/notification` | Owner/handle/options/error/type interfaces and `createNotificationOwner` |
| `dist/markup-ui-notification.js` | Self-contained optional ESM |
| `dist/markup-ui-notification.global.js` | Classic `MarkupUINotification`; rejects namespace replacement |
| `@dataengine/markup-ui/notification/style.css` | Composed external `dist/markup-ui-notification.css`, including feedback stack CSS |
| [Local demo](../../demo/components/notification.html) | Separate native HTML/CSS/JS and local simulated decisions only |

```html
<div id="notifications" class="mui-feedback-host mui-notification-host">
  <div class="mui-feedback-list" data-notification-items></div>
  <p class="mui-feedback-announcer" data-notification-announcer
    role="status" aria-atomic="true"></p>
</div>
```

```js
// External script. No injected/global application or permissions prompt.
const notifications = MarkupUINotification.createNotificationOwner(
  document.querySelector("#notifications"), {
    max: 5, keepAliveOnHover: true,
    focusFallback: document.querySelector("#create-notification")
  }
)
const notice = notifications.info({
  title: "Project updated", description: "Local information",
  content: "Literal text\nwith preserved line breaks.", meta: "Local operation",
  action: "Use the separately authored controls for further actions.",
  onClose: () => canCloseLocalCard() // false / void / Promise; errors remain surfaced
})
notice.update({ content: "Explicitly updated text", duration: 3000 })
// await notice.requestClose(); notice.destroy(); notifications.destroyAll()
```

The owner is a connected light-DOM native div/section/aside. Its direct items div and
direct announcer start empty (formatting whitespace is allowed). Keep static/no-JS
baselines outside those dedicated regions. Hosts must not be wrapped in links/buttons or
another live region. A safe fallback article is constructed with createElement/textContent;
no input string becomes HTML, a URL, a click handler or a business action.

## Authored cards, title levels and actions

Fallback titles are **paragraphs**, not inferred headings. Fallback article names use the
literal title, or a stock type/Notification label. A trusted constructor template can
supply real h1–h6 headings, article aria-label/aria-labelledby, native avatar/image content,
links, buttons and forms. Template article labels and heading levels are not rewritten.
Referenced headings cannot be cleared if that would leave the article unnamed.

Required marked regions in one `article.mui-notification`:

- `data-notification-kind`: visible stock type words.
- `data-notification-title/description/content/meta`: separate text-only regions.
- `data-notification-action-text`: plain action-area text, not native controls.
- `data-notification-close`: one named **type=button**, without native command attributes.
- `data-notification-pending/error`: separate, initially hidden, nonempty **non-live** text.
- Optional `data-notification-header`, `data-notification-avatar/icon` and
  `data-notification-actions` own authored presentation/controls.

Title/description/content/meta/action options are strings, never render functions. Empty
strings hide optional fields, but at least title, description or content must remain
readable. Provided templates retain their existing text when a corresponding option is
omitted. Supplied action text never replaces an action button/form region or creates a
router, link, download or network operation. Native action listeners are attached by the
caller after creation and survive text updates; constraint validation is untouched.
The whole article is not a button/link, and nested controls/card-wide links are rejected.

Avatar/render functions are not accepted as options. Use an authored native avatar node
with appropriate alt/name/decorative semantics. Custom icons remain authored, not swapped
by type updates. Fallback glyphs are original simple text decoration with visible type
words—Notification, Information, Success, Warning or Error—not copied upstream assets.
Stock words are English; no global localization or theme provider is implied.

## One deliberate announcement policy

The default authored announcer is `role=status`, `aria-atomic=true` (polite). Authors may
explicitly use `role=alert` for an **assertive owner**, or `aria-live=off` on either role for
a silent owner. If aria-live is explicitly present, it must match the role or be off.
The chosen policy is stable for the owner's lifetime; dispose/rebind to change it.

Only one owned text span in that announcer is updated. Neither host nor articles add live
roles, and templates cannot nest live regions, output elements or dialogs. Creates/updates,
pending close, veto and current failure have deliberate announcements unless off. Actions
remain ordinary native controls, not echoed as a generated interactive speech transcript.
Rapid changes may coalesce; the last announcement can remain after a card disappears.
This is not an unbounded speech/history queue or a universal speech-timing guarantee.

Notifications never focus themselves or inert the document. A fixed host outside a native
modal cannot cross its top layer by z-index; put the owner **inside** that modal when
appropriate, including any operation-error status. The demo demonstrates a modal-local
owner rather than creating a portal or choosing a global "current modal".

## Owner, update and expiry contract

| Member | Native behavior |
| --- | --- |
| `create(options)` | Default type unless options.type specifies another |
| `info/success/warning/error(options)` | Explicit type methods; convenience type wins |
| `notifications`, `max`, `connected`, `announcement` | Readonly collection snapshot, configured capacity, owner lifetime and policy |
| `destroyAll()`, `dispose()` | Explicit owner-local removal; dispose is terminal |
| `element`, `closed`, `pending`, `lastClose`, `lastError` | Original article, lifetime/close state and surfaced close Promise/error |
| `title`, `content`, `type`, `duration`, `remaining`, `paused` | Readonly controlled text/type and expiry state |
| `update(patch)` | Typed text/type/duration/closable/hover/onClose update, not reactive field mutation |
| `requestClose()` | Guarded close request; duplicate pending requests return the same Promise |
| `destroy()` | Idempotent explicit removal, **bypassing** the close guard |

Types are default/info/success/warning/error. Closable defaults true. Duration defaults to
**0, persistent**, matching the source's absent-duration behavior. Explicit durations are
integer **0–3,600,000 ms**; negative, nonfinite, fractional, null and string values are
rejected. Every valid update restarts a fresh full configured duration and invalidates the
older close attempt. Invalid updates do not change text or clocks.

Focus anywhere inside a card always protects automatic expiry. keepAliveOnHover is an
optional additional hold (owner/item default false), using **remaining time**, not the
source's full-duration hover restart. Native form controls stay enabled and keep their
values/listeners. No pointer/focus polling, global key handlers or animation clocks.

Max defaults to **5**, bounded to integers **1–50**. Capacity rejects with RangeError
before insertion/announcement; no focused eviction, animated leaving queue or hidden
backlog. In-flight template construction also reserves capacity, including synchronous
custom-element reentrancy. Persistent/pending/vetoed cards consume slots. Callers must
report overflow, update an existing card or explicitly remove one.

## False/Promise close veto and surfaced errors

Unlike Message, pinned Notification onClose supports cancellation. The native target
retains that important distinction:

- Button activation waits a following task to respect later bubbling preventDefault.
  Programmatic requestClose starts one guarded operation; the callback runs on a microtask.
- Pending sets article aria-busy, disables **only the close button**, reveals authored
  pending text and suspends expiry. Native links/forms/action buttons remain native.
- Void/anything other than exactly false accepts removal; requestClose resolves true.
- False/Promise resolving false keeps the article; requestClose resolves false.
- Throw/rejection keeps the article, restores pending state, reveals authored error text,
  announces according to owner policy and leaves a rejecting `lastClose` Promise.
- A denied or failed close **suspends auto expiry until update/retry/destruction**, rather
  than allowing the old deadline to immediately undo the veto.
- Update/destroy/removal/disposal invalidate an older pending result. Stale acceptance
  resolves false, and stale rejection is reported but cannot repaint, close, restart expiry,
  change the newer lastError or restore stale focus. External work is **not cancelled**.

The helper observes rejections internally to avoid accidental unhandled rejection while
still returning the rejecting Promise. A callback returning its own requestClose Promise
is rejected rather than hanging in a cycle. Returning false is not confused with Message's
void notification semantics.

Pending state restoration is conditional: later author writes, including identical
disabled/aria-busy writes, survive. Attribute changes and focus can synchronously reenter
the owner; the ledger and painting versions prevent an older restoration/update from
overwriting a newer pending operation or restarting its suspended expiry.

Update refuses to hide a focused text region/close control; move focus first. On veto/
failure it repairs only focus lost to body by its own pending disable, not focus deliberately
moved to another action. Accepted explicit close/destroy may remove focused content and
use the author's available **focusFallback outside the collection**, only when focus is on
body after removal. Auto expiry/automatic teardown never use that fallback. No guessed
global focus destination, and no custom focus trap.

Nonbubbling `mui:notification-create/update` have `{ handle }`.
`mui:notification-remove` has `{ handle, reason }` (close/destroy/expired/dispose/detached).
These native lifecycle events are not Vue enter/leave transition hooks.
The cancelable `mui:notification-error` has typed
`{ handle, error, phase: "close" | "anatomy", stale }`; handle is null for owner faults.
Current close failures have visible text. Errors without a current surface also report
to console unless a listener calls preventDefault to acknowledge handling. Cancelling
that error notification does not change the close result.

## Template/root ownership and CSS

Templates are imported into the active owner document before clocks are built. Their
original nodes/listeners are not moved; clone listeners must be attached explicitly.
Managed text regions keep their element identity and cannot contain replaced controls.
Unmanaged native form values, listeners, classes and style states survive updates.
Pending borrowed attributes are restored only while still owned.

IDs must be unique inside each clone and against the document. For repeated concurrent
cards use ID-free aria-label templates, or distinct heading IDs. Executable/embedded/modal/
autofocus/editable content is rejected. Templates are still trusted author markup, not a
sanitizer for URLs, inline attributes or custom-element side effects; constructors and
attribute reactions may run. Capacity and operation generations guard those boundaries.

The per-root feedback Symbol.for claim also prevents Message/Notification/ESM/classic
double ownership. Actual ancestor/root child-list observation handles removal/reparenting;
it is not a document-subtree observer. Moved cards are released without deletion from a
new author's location. New author announcer content is preserved. Prefer explicit dispose
before intentional DOM removal/cross-document handoff. Bulk teardown blocks reentrant
creation/updates; disposed owners/handles cannot reconnect.

Flow is baseline. `.mui-feedback-host--fixed` selects fixed stacking, with
data-feedback-placement top/top-right/top-left/bottom/bottom-left/bottom-right. Notification's
absent-attribute fixed default is **top-right**. Left/right are physical in RTL. Shared
viewport-percentage bounds and native overflow keep every placement scrollable, unlike the
source's top/bottom scrollbar exception. There is no scrollable=false/custom Scrollbar
renderer or unsafe overflowing queue.

External CSS owns the richer native regions, wrapping, content line breaks, avatar/icon,
close controls, colors and safe stack geometry. No runtime numeric/style-object writes or
CSS-in-JS. Fixed elements retain normal containing-block/top-layer limits. Reduced motion
is static; forced colors retain words/borders and print returns hosts to flow.

## Property dispositions and migration

The [reference tracker](../naive-ui/components/notification.md) retains every original
owner/name/source identity and explicitly added source/inherited contracts.

| Source family | Status | Native target / exclusion |
| --- | --- | --- |
| create/info/success/warning/error, destroy/destroyAll | 🟢 Verified | Explicit owner/handle operations, not injection |
| title/content/description/meta/action | 🟢 Verified | Typed literal text; action text separate from authored controls |
| avatar | 🟢 Verified | Authored native template region; no render-function option |
| duration/closable/keepAliveOnHover/type | 🟢 Verified | Typed native state and protected expiry, with stated differences |
| onClose | 🟢 Verified | False/Promise/throw/rejection and stale-safe pending lifecycle |
| placement/max/scrollable/container-class/to | 🟢 Verified | Physical CSS placement, bounded rejection, native scrolling and explicit root/classes |
| container-style and VNode/render functions | ⏭️ Intentionally omitted | External CSS/trusted templates, not prop evaluation |
| onAfterEnter/onLeave/onAfterLeave | ⏭️ Intentionally omitted | No animation timing/render transition parity |
| useNotification, private refs/keys, deprecated aliases, themes/transition counters | ⏭️ Intentionally omitted | No injected app/provider or transition engine |

1. [x] Specify authored native article/heading/text/action/close anatomy and clear semantics.
2. [x] Bound ownership/capacity and persistent/hover/focus-protected expiry.
3. [x] Retain typed updates and real async close veto with surfaced failure/stale protection.
4. [x] Verify native interactions, reentrant restoration/painting, multiple roots and packaging.

### Acceptance — 2026-09-09

- **143 targeted tests passed:** 57 Notification/pending-attribute, 59 Message and 27 native/
  legacy. `npm test -- --run tests\notification.test.ts tests\message.test.ts tests\native.test.ts`
  and `npm run build` pass, including declarations, composed styles and all budgets.
- Chromium verified authored level-three headings, literal title/description/content/meta/
  action text, native form validation/listeners/input preservation, independent links and
  controls, and no creation focus steal.
- False/rejected/successful close, pending aria-busy/close-only disabling, duplicate
  activation, update superseding delayed success and explicit fallback focus passed.
  Actual hover/focus protected expiry; leaving focus resumed time without moving focus.
- Real customized native paragraph/heading reactions verified both review fixes: an older
  restoration could not enable a newer pending close, and superseded painting could not
  restart expiry while that close remained unresolved. Stale rejection after removal did
  not repaint detached or replacement content.
- Bounded capacity retained focused cards. Separate polite/assertive/off owners had no
  per-card live roles. The final accessibility tree showed a named native article, authored
  h3, native form/link/close controls and one owner status—not inferred headings or repeated
  item alerts. No universal speech delivery/timing or AT certification is claimed.
- Modal-local notifications stayed inside the native top layer; body-fixed cards did not
  cross it. ESM/classic duplicate-owner/namespace guards and legacy mui.notification
  output/clear coexistence passed, with no OS permissions or notification side effects.
- Default top-right and all six physical placements passed in LTR/RTL. At 1000×800, fixed
  hosts measured **448px** wide with **16px** edge insets. At **320px and 2x CSS zoom**,
  rich cards/inputs stayed within bounds (card right **273px**, input right **233px**),
  without horizontal item overflow, and keyboard close stayed usable. Reduced motion,
  forced colors and print flow passed. Script-blocked native article/link fallback remained
  usable.
- **39 original identities preserved; 61 rows = 39 adapted targets + 22 omissions.**
  Global audit confirms **3,428 rows, 204/384 tasks across 51 accepted pages**, with two
  remaining Planned P3 routes. All **400 relative file links** in the four changed docs
  resolve; earlier master-inventory anchors remain available.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Notification ESM | 16,974 | 6,291 | 6,500 |
| Notification classic | 17,261 | 6,423 | 6,500 |
| Notification composed CSS | 4,958 | 1,339 | 2,000 |

One format + CSS: **7,630 ESM / 7,762 classic gzip bytes**. Existing feedback expiry/root/
CSS files and Message sources remain unchanged; Message ESM/classic/CSS stay
**4,739/4,860/1,136**. Core/advanced/widgets stay **14,611/2,181/2,779** under
**15,000/3,000/4,000** ceilings. No previous ceiling or runtime dependency changed.

Only stated jsdom/Chromium evidence is claimed—not all-browser, physical-touch,
screen-reader, OS notification, renderer or framework-transition certification.
**Next: Collapse Transition, then Discrete API.**
