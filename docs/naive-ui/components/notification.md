# Notification

**Plan: 🟢 Verified retained root-owned native scope.** Not a Vue/provider renderer,
browser OS Notification API, global singleton or framework/pixel/animation parity.

## Retained implementation and evidence

- [Canonical loading/API/ownership/acceptance](../../components/notification.md)
- [Default-style audit](../../style-audit/components/notification.md)
- [Optional consumer](../../../src/components/notification/) · [shared feedback primitives](../../../src/components/feedback/)
- [Targeted tests](../../../tests/notification.test.ts) · [local native demo](../../../demo/components/notification.html)
- Legacy [notification output](../../../src/overlay/index.ts) remains unchanged, as do Message behavior and existing budgets.

Pinned review inspected [Provider](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx), [Notification](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/Notification.tsx),
[Environment](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx), [Container](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationContainer.tsx) and public exports.
The live official route returned HTTP 404 to the fetch client; immutable Markdown is authoritative.
Unlike Message, source Notification close accepts false/Promise veto and rejection must
retain the card. The target retains that useful guard, with pending/expiry protection and
explicit error handling; it does not transplant provider leaving-key queues or animations.

## Migration steps

**Delivery phase:** P3 — managed feedback. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** Message's accepted feedback expiry/ownership/CSS foundation.
**Next task:** Collapse Transition, then Discrete API; global P3 remains incomplete.

1. [x] **Specify article anatomy.** Preserve authored headings/names/native actions and safe literal fields.
2. [x] **Resolve bounded lifetime.** Persistent defaults, hover/focus holds, admission rejection and owner cleanup.
3. [x] **Map mutable handles.** Typed updates and real async close veto, pending/error and stale/reentrant safety.
4. [x] **Verify interaction timing.** Native forms/focus, multiple/modal-local roots, semantic policy, media and packaging accepted.

### Native primitives and fallback

Use native articles/heading levels, plain content and explicit controls/templates; no whole-card
fake button, nested control link or unsafe render function. One authored polite/assertive/off
policy belongs to the owner, never duplicate host/item live roles. Native fallback content and
flow work without animation/top-layer support; modal-local hosts must be inside the actual modal.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/notification)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **38 original local rows + 21 supplementary declarations + 2 explicit source-inherited fields = 61 tracker rows**.
All **39 original owner/name/source identities** remain. Twenty source-only supplements and two source-inherited fields are added below. Green means a verified adapted native target, not framework/pixel parity. The [canonical contract](../../components/notification.md) defines exact close, focus, timer, capacity and announcement differences.

### NotificationProvider Props

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`container-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L61) | Prop | Authored native host classes; no provider class/prop forwarding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`container-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L62) | Prop | No string/object style passthrough; external CSS. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L63) | Prop | External six-position physical CSS; fixed default top-right, flow baseline and normal containing-block/top-layer limits. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L64) | Prop | Native bounded max 1–50, default 5; reject capacity without oldest/focused eviction or hidden queue. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`scrollable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L65) | Prop | Safe native overflow at every placement; no false/custom Scrollbar path or top/bottom exception. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L66) | Prop | Explicit createNotificationOwner(root), including roots inside native modals; no teleport. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### notification Injection Methods

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L72) | Method | Create an explicitly owned native article from typed options/trusted template. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`destroyAll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L73) | Method | Explicit owner-local destruction; bypasses close guard, no global OS/legacy clear. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L74) | Method | Error type with visible words and the owner's chosen announcement policy, not mandatory item alerts. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`info`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L75) | Method | Explicit information type on a native card. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`success`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L76) | Method | Explicit success type; no inferred business completion. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`warning`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L77) | Method | Explicit warning type and visible words. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationOption Properties

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L83) | Record field | Literal action-area text, distinct from authored native action links/buttons/forms; no render callback. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L84) | Record field | Authored native avatar/icon template region and semantics; no VNode function option or asset dependency. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L85) | Record field | Named native type=button close control, default true; typed updates with focus-safe hiding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L86) | Record field | Literal text in preserved native content region, including line breaks; no HTML/VNode evaluation. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L87) | Record field | Typed literal description text; preserve native region and labels. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L88) | Record field | Persistent default zero, bounded integer milliseconds; fresh update deadline and focus/hover protection. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L89) | Record field | Optional remaining-time hover hold; focus protection is mandatory. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`meta`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L90) | Record field | Typed literal metadata; no implicit date/parser/formatting service. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L91) | Record field | Typed text or authored heading at the author's level; preserve explicit article name/heading identity. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L92) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L93) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L94) | Callback | Real false/Promise veto with pending close-only disable, surfaced rejection and stale/reentrant protection. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L95) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationReactive Properties

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L105) | Record field | Literal action-area text, distinct from authored native action links/buttons/forms; no render callback. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L106) | Record field | Authored native avatar/icon template region and semantics; no VNode function option or asset dependency. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L107) | Record field | Named native type=button close control, default true; typed updates with focus-safe hiding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L108) | Record field | Literal text in preserved native content region, including line breaks; no HTML/VNode evaluation. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L109) | Record field | Typed literal description text; preserve native region and labels. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L110) | Record field | Persistent default zero, bounded integer milliseconds; fresh update deadline and focus/hover protection. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`meta`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L111) | Record field | Typed literal metadata; no implicit date/parser/formatting service. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L112) | Record field | Typed text or authored heading at the author's level; preserve explicit article name/heading identity. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L113) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L114) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L115) | Callback | Real false/Promise veto with pending close-only disable, surfaced rejection and stale/reentrant protection. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L116) | Callback | No framework enter/leave transition timing; native create/update/remove events are distinct. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationReactive Methods

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L122) | Method | Idempotent explicit handle.destroy(), distinct from guarded requestClose(). | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### Documented service entry

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useNotification`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/demos/enUS/index.demo-entry.md#L9) | Framework API | No injection/global singleton; explicitly pass native owner handles. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |


## Explicit source-only and inherited contracts

Source contracts below are additions, not silently credited to the Markdown. The source
provider includes oldest-item/leaving-key eviction and injected transition counters;
these are not copied. Mutable NotificationOptions inheritance is explicitly narrowed to
typed native updates. API aliases/private component refs are not public native handles.

### NotificationProvider source additions

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Explicit owner hover default, false; remaining time plus mandatory focus hold. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Ordinary authored surrounding content, not a provider render slot. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`NotificationProviderInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Explicit owner create/type/destroyAll methods; no injected component ref. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`NotificationApi.open`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Deprecated alias omitted; use explicit create. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationReactive source lifetime

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | No generated reactive key; native element/handle identity. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`hide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Deprecated alias omitted; explicit destroy() is available. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`deactivate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Deprecated alias omitted; no framework activation lifecycle. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationOptions source type

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | Source notificationProps permits default/info/success/warning/error; native create/update supports all five. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationReactive source-inherited fields

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Explicit inherited source field | Mutable NotificationOptions inheritance becomes explicit typed native update. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Explicit inherited source field | Inherited option retained via typed update, with mandatory focus protection. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### Notification exported source types

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`NotificationType`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Exported convenience-method union has four types; native create also supports source notificationProps default. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`NotificationPlacement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Six physical placement values retained through external CSS; left/right do not flip in RTL. | 🟢 Verified | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### NotificationEnvironment source exclusions

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`onHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | Deprecated transition alias omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | Deprecated transition alias omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`onAfterHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | Deprecated transition alias omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`hover restart`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | Source full-duration restart on mouseleave is not copied; native clock resumes remaining time. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`transition geometry`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationEnvironment.tsx) | Source-only contract | No nextTick/offsetHeight/maxHeight/transition inline writes or delayed removal animation. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

### Notification private coordination

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`wipTransitionCountRef`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationContainer.tsx) | Source-only contract | No injected transition count or Scrollbar peer container; native overflow only. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |
| [`NotificationRef.hide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/notification/src/NotificationProvider.tsx) | Source-only contract | Private component ref/hide API omitted; explicit native ownership replaces it. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/notification.md), Notification/Message/native tests and pinned source review. |

<!-- END PINNED API INVENTORY -->
