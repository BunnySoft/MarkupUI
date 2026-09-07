# Dialog

**Plan: Planned. Current baseline: partial native-dialog wrapper; not parity-verified.**

## Baseline and target

[B1: overlays.ts](../../../src/components/overlays.ts) moves children into native dialog and exposes open/close events/methods.

- **HTML:** native dialog, real heading and authored actions/content.
- **JS:** cancellation, return value, focus restoration and explicit optional service handles.
- **CSS:** external dialog, backdrop and action layout.
- **Placement:** proposed `src/components/dialog/`; managed dialog service independently selectable.

## Acceptance and gaps

Test Escape, nested dialogs, async confirmation failure, reconnect and return focus. Provider/options/reactive-handle tables are distinct from the existing wrapper; Vue reactive handles will not be adopted.

## Upstream implementation evidence

Research inspected related [Modal coordination](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/modal/src/Modal.tsx#L171-L260), not every Dialog service/action path. Return-value and Promise-based close decisions require explicit asynchronous contracts; ordinary notification events are insufficient. Treat this as shared-overlay evidence and keep Dialog-specific implementation verification separate.

## Migration steps

**Delivery phase:** P3 — modal interactions. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button/Card and P3 native-dialog/focus contracts in the [master plan](../migration-plan.md).
**Next task:** define authored dialog heading/content/actions and preserve native top-layer behavior.

1. [ ] **Reconcile open/close state.** Specify native dialog ownership, initial focus, Escape policy and return-focus target.
2. [ ] **Resolve action returns.** Define cancelable/async positive and negative actions, pending state and failure behavior without notification-only shortcuts.
3. [ ] **Separate managed services.** Map provider/options/reactive-handle APIs to optional explicit instances and disposal handles.
4. [ ] **Test nested dialogs.** Cover rejected actions, rapid reopening, disconnected triggers and focus restoration before closing companion API rows.

### Native primitives and fallback

- **Native path:** authored native `dialog`, heading, real buttons and optional `form method="dialog"` for simple synchronous outcomes. Repeated service dialogs may clone a native template without Vue-style providers.
- **Small enhancement:** feature-detect showModal; a small light-DOM controller owns approved async actions and lifecycle cleanup. Unsupported modal behavior falls back to an inline confirmation/full-page flow, not a focus-trap/dialog polyfill. CSS backdrop and reduced-motion rules own presentation; keep return-value handling separate from notification events.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/dialog)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **102 local table rows + 3 supplementary declarations + 0 inherited rows = 105 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Button](button.md). Opaque types without local member definitions remain unreviewed.


### useDialog API

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroyAll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L52) | Method | Candidate plain-JS `destroyAll` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L53) | Method | Candidate plain-JS `create` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L54) | Method | Candidate plain-JS `error` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`info`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L55) | Method | Candidate plain-JS `info` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`success`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L56) | Method | Candidate plain-JS `success` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`warning`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L57) | Method | Candidate plain-JS `warning` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DialogOptions Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L67) | Record field | Candidate authored `action` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`actionClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L68) | Record field | Candidate plain-JS `actionClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`actionStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L69) | Record field | External CSS class/custom property for `action-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`autoFocus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L70) | Record field | Candidate plain-JS `autoFocus` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`blockScroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L71) | Record field | Candidate plain-JS `blockScroll` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L72) | Record field | Candidate plain-JS `bordered` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L73) | Record field | Candidate plain-JS `class` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L74) | Record field | Candidate plain-JS `closable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closeFocusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L75) | Record field | Candidate plain-JS `closeFocusable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closeOnEsc`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L76) | Record field | Candidate plain-JS `closeOnEsc` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L77) | Record field | Candidate authored `content` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`contentClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L78) | Record field | Candidate plain-JS `contentClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`contentStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L79) | Record field | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`draggable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L80) | Record field | Candidate plain-JS `draggable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`iconPlacement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L81) | Record field | Candidate plain-JS `iconPlacement` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L82) | Record field | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L83) | Record field | Candidate plain-JS `loading` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`maskClosable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L84) | Record field | Candidate plain-JS `maskClosable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negativeButtonProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L85) | Record field | Candidate explicit native-child configuration for `negativeButtonProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negativeText`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L86) | Record field | Candidate plain-JS `negativeText` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positiveButtonProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L87) | Record field | Candidate explicit native-child configuration for `positiveButtonProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positiveText`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L88) | Record field | Candidate plain-JS `positiveText` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L89) | Record field | Candidate plain-JS `showIcon` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L90) | Record field | External CSS class/custom property for `style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L91) | Record field | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L92) | Record field | Candidate plain-JS `titleClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L93) | Record field | External CSS class/custom property for `title-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`transformOrigin`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L94) | Record field | Candidate plain-JS `transformOrigin` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L95) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`zIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L96) | Record field | Candidate plain-JS `zIndex` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L97) | Callback | Candidate DOM `mui:after-enter` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L98) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L99) | Callback | Explicit `onClose` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onNegativeClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L100) | Callback | Explicit `onNegativeClick` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onPositiveClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L101) | Callback | Explicit `onPositiveClick` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onMaskClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L102) | Callback | Candidate DOM `mui:mask-click` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DialogReactive Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`actionClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L112) | Record field | Candidate plain-JS `actionClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`actionStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L113) | Record field | External CSS class/custom property for `action-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L114) | Record field | Candidate plain-JS `bordered` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L115) | Record field | Candidate plain-JS `class` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L116) | Record field | Candidate plain-JS `closable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closeFocusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L117) | Record field | Candidate plain-JS `closeFocusable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closeOnEsc`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L118) | Record field | Candidate plain-JS `closeOnEsc` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L119) | Record field | Candidate authored `content` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`contentClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L120) | Record field | Candidate plain-JS `contentClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`contentStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L121) | Record field | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`iconPlacement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L122) | Record field | Candidate plain-JS `iconPlacement` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L123) | Record field | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L124) | Record field | Candidate plain-JS `loading` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`maskClosable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L125) | Record field | Candidate plain-JS `maskClosable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negativeButtonProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L126) | Record field | Candidate explicit native-child configuration for `negativeButtonProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negativeText`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L127) | Record field | Candidate plain-JS `negativeText` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positiveButtonProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L128) | Record field | Candidate explicit native-child configuration for `positiveButtonProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positiveText`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L129) | Record field | Candidate plain-JS `positiveText` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L130) | Record field | Candidate plain-JS `show-icon` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L131) | Record field | External CSS class/custom property for `style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L132) | Record field | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleClass`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L133) | Record field | Candidate plain-JS `titleClass` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`titleStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L134) | Record field | External CSS class/custom property for `title-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`transformOrigin`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L135) | Record field | Candidate plain-JS `transformOrigin` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L136) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L137) | Callback | Candidate DOM `mui:after-enter` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L138) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L139) | Callback | Explicit `onClose` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onEsc`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L140) | Callback | Candidate DOM `mui:esc` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onNegativeClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L141) | Callback | Explicit `onNegativeClick` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onPositiveClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L142) | Callback | Explicit `onPositiveClick` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DialogReactive Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L148) | Method | Candidate plain-JS `destroy` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Dialog Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L154) | Prop | Candidate `action-class` attribute or JS `actionClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`action-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L155) | Prop | External CSS class/custom property for `action-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L156) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L157) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`close-focusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L158) | Prop | Candidate presence attribute `close-focusable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L159) | Prop | Candidate authored `content` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L160) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L161) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`icon-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L162) | Prop | Candidate explicit JS `iconPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L163) | Prop | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L164) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negative-button-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L165) | Prop | Candidate explicit native-child configuration for `negative-button-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`negative-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L166) | Prop | Candidate `negative-text` attribute or JS `negativeText`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positive-button-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L167) | Prop | Candidate explicit native-child configuration for `positive-button-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`positive-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L168) | Prop | Candidate `positive-text` attribute or JS `positiveText`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L169) | Prop | Candidate live JS `showIcon` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L170) | Prop | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L171) | Prop | Candidate `title-class` attribute or JS `titleClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L172) | Prop | External CSS class/custom property for `title-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L173) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L174) | Callback | Candidate DOM `mui:close` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-negative-click`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L175) | Callback | Candidate DOM `mui:negative-click` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-positive-click`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L176) | Callback | Candidate DOM `mui:positive-click` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Dialog Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L182) | Slot | Candidate authored `action` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L183) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L184) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L185) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L186) | Slot | Candidate authored `close` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Provider composable

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useDialogReactiveList`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L59) | Method | Candidate plain-JS `useDialogReactiveList` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Documented service entry

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useDialog`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L6) | Framework API | Replace framework injection with an explicitly selected plain-JS service. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### DialogOptions Properties: draggable inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`draggable.bounds?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dialog/demos/enUS/index.demo-entry.md#L80) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
