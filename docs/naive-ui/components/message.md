# Message

**Plan: 🟢 Verified retained root-owned native scope.** No Vue provider/reactive renderer,
global singleton, OS Notification API or upstream pixel/transition parity is claimed.

## Retained implementation and evidence

- [Canonical loading/API/ownership/acceptance](../../components/message.md)
- [Optional Message service](../../../src/components/message/) · [feedback primitives](../../../src/components/feedback/)
- [Targeted tests](../../../tests/message.test.ts) · [separate local demo](../../../demo/components/message.html)
- Legacy [overlay output](../../../src/overlay/index.ts) and [mui.message API](../../../src/core/api.ts) remain unchanged.
- One polite owner announcer, non-live native list items with visible kind words, safe
  string/default DOM or trusted templates, bounded admission and focus-protected expiry.

Pinned review inspected [Provider](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx), [Message](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/Message.tsx),
[Environment](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx), [message-props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/message-props.ts), types and public exports.
The live official route returned HTTP 404 to the fetch client; pinned Markdown is authoritative.
Source onClose is void and invoked before hide; false is not a veto. Target synchronous
failure stays visible, while returned promises are not awaited and late failures are surfaced.
No async confirmation service is invented.

## Migration steps

**Delivery phase:** P3 — managed feedback. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native root ownership, safe text and explicit announcement/timer policy.
**Next task:** Notification, then the separate Collapse Transition/Discrete inventories.

1. [x] **Resolve safe content.** Native text/templates, preserved actions and one polite live-region policy.
2. [x] **Define bounded lifetime.** Explicit owners, persistent/loading messages, capacity rejection and disposal.
3. [x] **Scope updates/timing.** Typed updates, remaining-time hover/focus holds and surfaced close failures.
4. [x] **Test concurrency.** Reentrant creation, updates/expiry/removal/focus/capacity and browser/CSS/package gates.

### Native primitives and fallback

Native authored lists/status text remain readable without JavaScript. Optional helpers
create only safe native status/close anatomy and use explicit roots, including roots inside
native modals. No popover/top-layer support, focus trap, global document lock, portal or
runtime style injection is needed. Shared feedback expiry/removal helpers are ready for
Notification without turning either consumer into an application framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/message)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **36 original local rows + 31 supplementary declarations + 0 inherited rows = 67 tracker rows**.
All **47 original owner/name/source identities** remain, including duplicate destroy property/method, render inputs and spin inline fields. Twenty source-only contracts are added below. Green means an adapted native target, not framework/pixel parity. See the [canonical native contract](../../components/message.md) for strict capacity, announcement, focus and callback differences.

### MessageProvider Props

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L67) | Prop | Explicit native type=button close control; constructor default false or typed update, with focus-safe hiding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`container-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L68) | Prop | Authored native root classes; no framework class forwarding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`container-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L69) | Prop | No style string/object forwarding; external CSS. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L70) | Prop | Integer 0–3600000ms, zero persistent; fresh configured deadline on update, focus/optional hover holds. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`keep-alive-on-hover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L71) | Prop | Opt-in remaining-time hover pause; keyboard focus always protects expiry. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L72) | Prop | Bounded max 1–50, default 5; RangeError rejects overflow without eviction or hidden queue. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L73) | Prop | Authored data-feedback-placement plus optional fixed class; six physical positions, flow baseline. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L74) | Prop | Explicit createMessageOwner(root), including a root inside native modal when needed; no teleport. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageProvider Injection Methods

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroyAll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L82) | Method | Remove only this owner's items; no global legacy overlay clear. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L83) | Method | Create literal string content with default or specified type; return native handle. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L84) | Method | Explicit error type with visible Error words and polite owner announcement, not per-item assertive alerts. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`info`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L85) | Method | Explicit info type and visible Information words. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L86) | Method | Explicit Loading words/static decoration; persistent default zero unless this call supplies a duration. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`success`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L87) | Method | Explicit success type and visible Success words; no inferred external completion. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`warning`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L88) | Method | Explicit warning type and visible Warning words. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageOption Properties

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L94) | Record field | Explicit native type=button close control; constructor default false or typed update, with focus-safe hiding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L95) | Record field | Integer 0–3600000ms, zero persistent; fresh configured deadline on update, focus/optional hover holds. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L96) | Record field | Authored decorative template region, preserved through updates; no function/VNode evaluation. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L97) | Record field | Typed update/option for remaining-time hover hold; focus hold is unconditional. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L98) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L99) | Record field | Typed native hidden toggle for the optional decorative icon only. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`spinProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Record field | No Spin/loading geometry prop forwarding; static original decoration and visible Loading text. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L101) | Record field | default/info/success/warning/error/loading; typed updates, visible words and external CSS. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L102) | Callback | No framework leave/after-leave transition callback; native remove notifications have different timing. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L103) | Callback | Close-button-only void notification. False ignored; sync failure stays visible, async notification rejection reported without waiting. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L104) | Callback | No framework leave/after-leave transition callback; native remove notifications have different timing. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageReactive Properties

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L122) | Record field | Explicit native type=button close control; constructor default false or typed update, with focus-safe hiding. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L123) | Record field | Nonempty literal string through create/update; native action/form nodes retain identity. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L124) | Record field | Idempotent handle.destroy() releases only this item and its clock/listener. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L125) | Record field | Authored decorative template region, preserved through updates; no function/VNode evaluation. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L126) | Record field | Typed update/option for remaining-time hover hold; focus hold is unconditional. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L127) | Record field | Typed native hidden toggle for the optional decorative icon only. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L128) | Record field | default/info/success/warning/error/loading; typed updates, visible words and external CSS. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L129) | Callback | No framework leave/after-leave transition callback; native remove notifications have different timing. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L130) | Callback | No framework leave/after-leave transition callback; native remove notifications have different timing. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageReactive Methods

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L136) | Method | Idempotent handle.destroy() releases only this item and its clock/listener. | 🟢 Verified | ADAPTED native target; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageRenderMessage input

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L110) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`icon?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L111) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L112) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L113) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onClose?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L114) | Record field | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### Render callback type

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`MessageRenderMessage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L109) | Render hook | No MessageRenderMessage/VNode/render-input contract; trusted native templates and literal text instead. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### Documented service entry

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useMessage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L9) | Framework API | No framework injection/global singleton; explicitly pass an owner. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageOption Properties: spinProps inline fields

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spinProps.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | No Spin/loading geometry prop forwarding; static original decoration and visible Loading text. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`spinProps.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | No Spin/loading geometry prop forwarding; static original decoration and visible Loading text. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`spinProps.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | No Spin/loading geometry prop forwarding; static original decoration and visible Loading text. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`spinProps.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | No Spin/loading geometry prop forwarding; static original decoration and visible Loading text. | ⏭️ Intentionally omitted | Explicit exclusion; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |


## Explicit source-only contracts

These additions are not silently attributed to the public Markdown tables. Source provider
capacity shifts out the oldest item, while the target rejects admission. Source hover leave
restarts the full duration; the target resumes remaining time. Private render/component
defaults are not confused with the public service defaults.

### MessageProvider source additions

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS prop forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS prop forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | No runtime theme/CSS-in-JS prop forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | Ordinary authored surrounding content; no provider render slot or implicit application. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`MessageProviderInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | Explicit owner methods replace injected component instance methods. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageReactive source members

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | Explicit handle.update({duration}) and readonly duration; no reactive timer assumption. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | Explicit updateable void callback with documented synchronous/late failure handling. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`PrivateMessageReactive.key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | No generated reactive key; native element/handle identity. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`PrivateMessageRef.hide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageProvider.tsx) | Source-only contract | Private ref/hide contract omitted; explicit destroy() | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### MessageEnvironment source behavior

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`deactivate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx) | Source-only contract | Deprecated/private framework hide/transition contract omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx) | Source-only contract | Deprecated/private framework hide/transition contract omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onAfterHide`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx) | Source-only contract | Deprecated/private framework hide/transition contract omitted. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`mouseenter/mouseleave timer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx) | Source-only contract | Source full-duration hover restart is not copied; native remaining-time hover/focus pause is explicit. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`duration-zero`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/MessageEnvironment.tsx) | Source-only contract | Zero skips source timeout; retained as explicit persistent native duration. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### Private message-props distinctions

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-number`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/message-props.ts) | Source-only contract | Private inner component accepts numbers; native service deliberately requires strings. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`type-default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/message-props.ts) | Source-only contract | Inner component defaults info, provider create defaults default; target follows public create, not private inner default. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onMouseenter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/message-props.ts) | Source-only contract | Private listener prop omitted; native owned mouse/focus events drive the expiry clock. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`onMouseleave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/message-props.ts) | Source-only contract | Private listener prop omitted; no exposed renderer event forwarding. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

### Message source exported types

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`MessageType`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/types.ts) | Source-only contract | Six public type names retained with literal text and CSS. | 🟢 Verified | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |
| [`MessageSpinProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/src/public-types.ts) | Source-only contract | Alias to SharedSpinProps is not expanded into a spinner dependency or style-object API. | ⏭️ Intentionally omitted | Explicit source review; [native acceptance](../../components/message.md), Message/feedback/native tests and pinned source review. |

<!-- END PINNED API INVENTORY -->
