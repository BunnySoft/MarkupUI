# Discrete API: resolve through explicit native composition

**🟢 Verified retained capability, with no new library runtime.** The existing Message,
Notification, Loading Bar, Dialog and Modal owners already work outside Vue/setup. A new
createDiscreteApi wrapper would add a redundant service container, conceal roots/lifetimes
and risk eagerly loading every service. This route therefore resolves as a documented,
tested **application composition recipe**, not a new factory or compatibility layer.

There is **no** `@dataengine/markup-ui/discrete` export, `createDiscreteApi` global,
`src/components/discrete` runtime, `markup-ui-discrete.*` distribution or new byte budget.
The [local demo](../../demo/components/discrete.html) has separate HTML/CSS/JS and imports
only existing selected JavaScript entries. Its exported `mountExample` function is local
demo application code, exposed for integration tests—not a public MarkupUI API.

The [2026-09-11 default-style review](../style-audit/components/discrete.md) is
**not applicable** to an aggregate skin. Each explicitly selected Message,
Notification, Loading Bar, Dialog or Modal owner retains its own stylesheet and audit;
Discrete adds no host, wrapper, placement layer or CSS.

## Select only the services you need

```js
// Normal application code; neither Vue nor a provider app is involved.
import { createMessageOwner } from "@dataengine/markup-ui/message"
import { createLoadingBar } from "@dataengine/markup-ui/loading-bar"

const messages = createMessageOwner(document.querySelector("#messages"), {
  max: 3, closable: true, keepAliveOnHover: true
})
const loading = createLoadingBar(document.querySelector("#loading"), {
  finishDelay: 600
})

loading.start()
messages.info("Local work started")
// Caller supplies real measurements/outcomes; no request interceptor is installed.
loading.finish()
// Before application removal:
messages.dispose()
loading.disconnect()
```

Load only the corresponding **external CSS** in the application's HTML. Nothing here
injects styles or chooses a theme automatically. The selectable demo explicitly links all
five existing stylesheets because any service can be enabled at runtime; its JS uses
literal conditional dynamic imports for the checked services. Applications with a fixed
selection should omit unused scripts **and** stylesheets.

| Capability | Shipped native entry / explicit lifetime |
| --- | --- |
| Message | `createMessageOwner(root)`; typed handles, bounded capacity, dispose/destroyAll |
| Notification | `createNotificationOwner(root)`; typed cards/async close veto, dispose/destroyAll |
| Loading Bar | `createLoadingBar(root)`; explicit start/finish/error, disconnect (not dispose) |
| Dialog content/decisions | `createDialog(root)` or `createDialogOwner(root)` with authored templates |
| Generic Modal | `createModal(root)` or `createModalOwner(root)` with authored templates |

See the authoritative per-service contracts:
[Message](message.md), [Notification](notification.md), [Loading Bar](loading-bar.md),
[Dialog](dialog.md), [Modal](modal.md). A composition recipe does not broaden their
supported properties, fallback policies, callbacks, ownership or byte ceilings.

## Native hosts, templates and practical context

Message and Notification use separate named roots, each with their own dedicated item
region and announcer. Loading Bar uses an authored, labelled progress/status surface.
Dialog/Modal use real named HTMLDialogElements or trusted authored templates and existing
owner handles. A selector string or provider props object is not a substitute for a valid
native root. Per-node/root ownership prevents accidental duplicate adoption.

- Select services through imports and explicit construction, not an injected `includes`
  registry. The demo supports five known choices only, with no arbitrary factory/plugin graph.
- Use normal CSS classes/custom properties for supported presentation and ordinary HTML
  `lang`/`dir` for language/direction. Native lang/dir do **not** translate stock labels or
  reproduce ConfigProvider's locale/theme graph.
- Use per-service supported labels/options where available (for example Loading Bar's four
  text labels), and authored headings, close/error words and native form labels in templates.
  Do not forward ConfigProvider/peer theme/locale/render objects or reactive refs.
- Options are explicit per-service setup snapshots or typed update calls. There is no
  shared reactive config bridge, hidden application context or automatic synchronization
  with a separate frontend framework.
- Feedback needed inside a native modal must have roots **inside that modal**. A body-fixed
  Message/Notification host does not cross native top layers through z-index.
- Dialog and Modal are different services: the former adds explicit decisions; generic
  Modal does not import that footer. Do not bind both to one native dialog.

The source Markdown includes signature omits `modal` while listing modal provider props
and a modal return field. Pinned implementation/interface **does include modal** as a
selection. This discrepancy is preserved in the [reference tracker](../naive-ui/components/discrete.md);
the native recipe simply imports the shipped Modal entry explicitly, not an invented
compatible includes signature.

## Application-owned setup and teardown

The short recipe above is intentionally sequential—not atomic and not a universal rollback
service. If later construction can fail, the application must dispose earlier successfully
created owners. Each service's own constructor/lifetime contract remains authoritative.

The full demo makes that responsibility executable:

1. It constructs only the selected known owners, with explicit roots and imports.
2. On setup failure it attempts cleanup of every successfully returned owner, reports
   the original failure plus cleanup failures through AggregateError, and attaches the
   application scope to the error so failed cleanup is retryable.
3. Explicit scope disposal is terminal for new operations. It closes owned child Dialog
   confirmations before the workspace Modal, disposes modal-local feedback before removing
   that modal, then disposes page feedback and disconnects Loading Bar.
4. It attempts all known cleanups rather than stopping at the first exception. Successful
   cleanups are remembered, failed ones remain retryable, and `cleanupComplete` is false
   until all succeed. The UI blocks remount while cleanup is incomplete.

This is **best-effort application cleanup, not atomic rollback**. A cleanup error does not
mean every owner disappeared; inspect the reported causes and retry. The demo tests both
partial construction rollback and an intentionally failing cleanup followed by retry.
No unowned owner, legacy global overlay collection, body style or unrelated native top
layer is cleared. Repeated disposal cannot invalidate a newer independently mounted scope.

The example's deferred local Dialog/Notification decisions are completed with false
**after** their UI owners are disposed, so stale completions cannot mutate a recreated
scope. That settles only this example's simulated work; it does not cancel arbitrary
external promises, HTTP requests, routers or application side effects.

An open workspace is reused rather than creating unbounded hidden modal clones. Its
optional feedback controls are selected explicitly; an always-visible authored h2 receives
native autofocus, so a Modal-only selection never focuses a button that is subsequently
hidden. When disposal restores focus to an operation button that the application is about
to disable, the demo moves focus to enabled Mount (or Dispose for retry) before disabling
that button. It does not steal unrelated outside focus or add a global focus manager.

## What is deliberately not provided

| Original contract | Status | Native resolution |
| --- | --- | --- |
| selected service capability / includes intent | 🟢 Verified | Explicit static or conditional native imports and roots |
| message/dialog/notification/loadingBar/modal return capabilities | 🟢 Verified | Existing independent owner variables/handles, not a factory result shape |
| createDiscreteApi | ⏭️ Intentionally omitted | No redundant native factory/export/global |
| options/provider-props objects | ⏭️ Intentionally omitted | Supported per-service options only, not key-compatible forwarding |
| ConfigProvider/reactive MaybeRef graph | ⏭️ Intentionally omitted | Ordinary CSS/lang/dir and explicit supported labels/updates |
| app/unmount | ⏭️ Intentionally omitted | No Vue app; explicit native dispose/disconnect application code |
| createDiscreteApp/provider constructors/injection extractor | ⏭️ Intentionally omitted | No hidden body host, provider tree, setup extractor or runtime dependency |

There is no new generic “services” object in the library. The demo's local object merely
holds the particular native owners its application created. There is no global singleton,
implicit body mount, generated renderer, OS notification, permission request, network,
clipboard or download side effect.

## Four migration tasks and acceptance

1. [x] Resolve selection through existing independent native entries; record the modal signature discrepancy.
2. [x] Map useful context to explicit roots/options/CSS/lang/dir, excluding provider/reactive forwarding.
3. [x] Exercise ordered, reported, retryable application-owned cleanup without Vue app/unmount.
4. [x] Verify selective services, independent scopes, pending lifetimes, native focus/hosts and build integration.

### Acceptance — 2026-09-09

- **307 targeted tests passed:** 14 application-composition tests plus 59 Message,
  57 Notification, 47 Loading Bar, 59 Dialog, 44 Modal and 27 native/legacy tests.
  `npm test -- --run tests\discrete.test.ts tests\message.test.ts tests\notification.test.ts tests\loading-bar.test.ts tests\dialog.test.ts tests\modal.test.ts tests\native.test.ts`
  and the unchanged `npm run build` pass.
- Chromium request observation verified that selecting only Message/Loading Bar requested
  only those two service JavaScript entries; Modal loaded only after it was separately
  selected. All stylesheets in the chooser are explicit HTML links, not runtime injection.
- The all-five composition produced real native progress, feedback, modal-local hosts and
  nested Dialog/Modal top layers. Disposing with Dialog and Notification decisions pending
  left **zero owned native modals/messages/notifications and zero local pending decisions**,
  restored the authored progress value 25 and moved application focus safely to Mount.
- Modal-only selection focused an always-visible authored heading. Native modal-local
  feedback, pending/close cleanup and controls remained usable at **320px, RTL and 2x CSS
  zoom**. Stale Loading Bar/Message handles reported their existing disposed-state errors.
- Real setup failure rolled back earlier selected owners without touching an unowned native
  modal or body styles. A deliberately failing cleanup was reported, other owners were
  cleaned, remount was blocked, and retry released the failed resource.
- Read-only review found two application-focus errors: initial focus on a subsequently hidden
  unselected control, and disabling the just-restored opener during in-modal disposal.
  Authored autofocus and explicit application focus handoff fixed both, with browser evidence.
- Script-blocked reload kept ordinary inline content, a native input and authored progress
  readable/usable. No OS notification, permission, backend, clipboard or download side effects.

No Discrete source/runtime/export/JS/CSS bundle or budget was created. Existing service
assets and ceilings are unchanged; core/advanced/widgets remain **14,611/2,181/2,779 gzip
bytes** under **15,000/3,000/4,000** ceilings. Per-service asset costs remain in their
canonical records rather than being disguised as a new aggregate.

### Complete retained P3 audit

The final audit selected **every P3-assigned catalog row**, including mixed P2/P3 Ellipsis,
Float Button and Layout—not just the nineteen-route sequential queue:

| Gate | Result |
| --- | --- |
| P3-assigned route pages | **22** |
| P3 tracker rows | **1,086** |
| Verified adapted rows | **631** |
| Explicit omissions | **455** |
| Unresolved retained rows | **0** |
| Accepted P3 page tasks | **88/88** |
| Planned P3 routes | **0** |

Discrete preserves **16 original owner/name/source identities** plus **12 explicit source
supplements**: **28 rows, seven native capabilities and 21 framework omissions**.
Global catalog totals are **3,456 rows and 212/384 accepted tasks across 53 pages**;
mixed-phase tasks are not counted twice. Thus P3 is **Verified for retained native scopes**,
not upstream framework, all-browser or AT parity. P0 and P4/P5/P6 remain independent.
All **378 relative file links** in the four changed documentation files resolve; prior
master inventory anchors remain available and the current P3 sign-off anchor is verified.

### P4 next recommendation — no P4 work started here

All **17 P4-assigned routes remain Planned**: Auto Complete, Color Picker, Checkbox, Date
Picker, Dynamic Input, Dynamic Tags, Form, Input, Input Number, Input OTP, Mention, Radio,
Rate, Select, Slider, Switch and Time Picker. Their 770 tracker rows contain 767 unresolved
entries and three explicit omissions; no P4 page checklist is accepted.

Start with **[Input](../naive-ui/components/input.md)**: native input/textarea adoption,
label/name/type/constraints, current/default values, IME/selection/autofill, reset/submission
and event semantics. Establish those dependable control contracts before
**[Form](../naive-ui/components/form.md)** enhancement/async validation. Relevant native P0
contracts still need deliberate attention; completing P3 does not mark all of P0 complete.
P3 popup/focus foundations are available for later selection variants, not automatic P4/P5
or P6 implementation credit.

This resolution stops at Discrete/P3 acceptance. The parent workflow can start the next
component separately, with its own retained scope, validation and commit.
