# Message

**Plan: Planned. Current baseline: partial timed message service; not parity-verified.**

## Baseline and target

[B1: overlay service](../../../src/overlay/index.ts) inserts safe text messages with type/duration and returns element/close handles.

- **HTML:** document/root-owned status host and authored message text/actions.
- **JS:** explicit show/close handles, bounded queues, timer cleanup and optional update/pause.
- **CSS:** external placement, transition and type presentation.
- **Placement:** proposed `src/components/message/`; no injected provider runtime.

## Acceptance and gaps

Test concurrent messages, persistent duration, removal, accessibility announcement and document ownership. Upstream mutable reactive fields/methods are not established by current close handles.

## Migration steps

**Delivery phase:** P3 — managed feedback. **Task state:** 🔵 Planned.
**Prerequisites:** P0 explicit service ownership and announcement/timer policy in the [master plan](../migration-plan.md).
**Next task:** document a root-owned message host and compatible show/close handles without provider injection.

1. [ ] **Resolve safe message content.** Keep text insertion safe and specify any authored action/icon region separately.
2. [ ] **Define service lifetime.** Bound concurrent messages, persistent durations, close-all behavior and host disposal.
3. [ ] **Scope updates and timing.** Resolve handle fields, optional pause/update, close callbacks and external placement/transitions.
4. [ ] **Test message queues.** Cover simultaneous messages, removed roots, persistent notices and appropriate polite/assertive announcements.

### Native primitives and fallback

- **Native path:** an explicit status host and safe text nodes, optionally cloning a native message template for repeated notices. Authored action buttons retain native semantics.
- **Small enhancement:** a small service/custom element owns queue timers and lifecycle disposal; CSS controls placement and reduced-motion transitions. Do not require popover/top-layer support for messages: ordinary in-flow/root-host notices are the fallback. No hidden application provider, native-slot claim or generic message renderer is needed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/message)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **36 local table rows + 11 supplementary declarations + 0 inherited rows = 47 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### MessageProvider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L67) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`container-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L68) | Prop | Candidate `container-class` attribute or JS `containerClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`container-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L69) | Prop | External CSS class/custom property for `container-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L70) | Prop | Candidate `duration` attribute or JS `duration`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keep-alive-on-hover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L71) | Prop | Candidate presence attribute `keep-alive-on-hover`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L72) | Prop | Candidate `max` attribute or JS `max`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L73) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L74) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MessageProvider Injection Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroyAll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L82) | Method | Candidate plain-JS `destroyAll` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L83) | Method | Candidate authored `create` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L84) | Method | Candidate authored `error` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`info`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L85) | Method | Candidate authored `info` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L86) | Method | Candidate authored `loading` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`success`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L87) | Method | Candidate authored `success` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`warning`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L88) | Method | Candidate authored `warning` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MessageOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L94) | Record field | Candidate plain-JS `closable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`duration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L95) | Record field | Candidate plain-JS `duration` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L96) | Record field | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L97) | Record field | Candidate plain-JS `keepAliveOnHover` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L98) | Record field | Candidate authored `render` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L99) | Record field | Candidate plain-JS `showIcon` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spinProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Record field | Candidate explicit native-child configuration for `spinProps`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L101) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L102) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onClose`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L103) | Callback | Candidate DOM `mui:close` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L104) | Callback | Candidate DOM `mui:leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MessageReactive Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L122) | Record field | Candidate plain-JS `closable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L123) | Record field | Candidate authored `content` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L124) | Record field | Candidate plain-JS `destroy` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L125) | Record field | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keepAliveOnHover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L126) | Record field | Candidate plain-JS `keepAliveOnHover` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`showIcon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L127) | Record field | Candidate plain-JS `showIcon` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L128) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L129) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L130) | Callback | Candidate DOM `mui:leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MessageReactive Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`destroy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L136) | Method | Candidate plain-JS `destroy` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MessageRenderMessage input

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L110) | Record field | Candidate plain-JS `content?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L111) | Record field | Candidate plain-JS `icon?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L112) | Record field | Candidate plain-JS `closable` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L113) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`onClose?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L114) | Record field | Candidate DOM `mui:close` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Render callback type

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`MessageRenderMessage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L109) | Render hook | Candidate authored `MessageRenderMessage` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Documented service entry

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`useMessage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L9) | Framework API | Replace framework injection with an explicitly selected plain-JS service. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### MessageOption Properties: spinProps inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spinProps.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spinProps.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spinProps.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spinProps.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/message/demos/enUS/index.demo-entry.md#L100) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
