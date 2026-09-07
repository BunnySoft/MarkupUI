# Discrete API

**Plan: Planned for explicit services; Vue application creation intentionally omitted. Current baseline: message/notification functions.**

## Baseline and target

[B1: overlay service](../../../src/overlay/index.ts) exposes message/notification creation and handles without a framework provider.

- **HTML:** explicit document/root-owned service hosts.
- **JS:** choose services independently, pass scoped configuration and return disposal handles.
- **CSS:** load each service stylesheet explicitly.
- **Placement:** proposed optional service entries; no hidden Vue app, provider injection or mandatory store.

## Acceptance and gaps

Test multiple roots/documents, repeated creation/disposal and independent configuration. The upstream signature omits modal from `includes` while describing modal output; preserve that documentation discrepancy rather than guessing compatibility.

## Migration steps

**Delivery phase:** P3 — explicit services; hidden framework apps remain excluded. **Task state:** 🔵 Planned.
**Prerequisites:** P0 root ownership and P3 Message/Notification/Dialog contracts in the [master plan](../migration-plan.md).
**Next task:** replace createDiscreteApi's hidden app/provider model with explicitly selected plain-JS services.

1. [ ] **Resolve service selection.** Define independent message/dialog/notification/loading/modal entry points and note the upstream includes-signature discrepancy.
2. [ ] **Specify scoped options.** Pass explicit document/root configuration instead of provider-prop objects or inherited framework context.
3. [ ] **Define disposal handles.** Release hosts, listeners and timers through ordinary service disposal; omit Vue app/unmount compatibility.
4. [ ] **Test independent roots.** Cover repeated creation, multiple documents and disposal order without installing hidden global state.

### Native primitives and fallback

- **Native path:** explicit plain-JS services adopt authored document/root hosts or clone native templates for message/dialog instances. Real dialog/progress/status elements provide the browser behavior.
- **Small enhancement:** each service owns disposal; no hidden app, injection runtime or generic template framework exists. Feature-detect native dialog/popover only for the selected service and use inline notices/confirmation when unsupported. Custom-element lifecycle may manage individual hosts, but services do not require Shadow DOM/native slots.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/discrete)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **0 local table rows + 16 supplementary declarations + 0 inherited rows = 16 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [LoadingBar](loading-bar.md), [Dialog](dialog.md), [Message](message.md), [Modal](modal.md), [Notification](notification.md), [ConfigProvider](config-provider.md). Opaque types without local member definitions remain unreviewed.


### Discrete API

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`createDiscreteApi`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L20) | Method | Candidate plain-JS `createDiscreteApi` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### createDiscreteApi input

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`includes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L21) | Parameter | Candidate plain-JS `includes` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L22) | Parameter | Candidate plain-JS `options` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### createDiscreteApi options

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`configProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L23) | Configuration field | Candidate explicit scoped service options replacing `configProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`messageProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L24) | Configuration field | Candidate explicit scoped service options replacing `messageProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dialogProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L25) | Configuration field | Candidate explicit scoped service options replacing `dialogProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`notificationProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L26) | Configuration field | Candidate explicit scoped service options replacing `notificationProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`modalProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L29) | Configuration field | Candidate explicit scoped service options replacing `modalProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loadingBarProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L30) | Configuration field | Candidate explicit scoped service options replacing `loadingBarProviderProps`; no provider-prop object passthrough. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### createDiscreteApi result

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`message`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L36) | Service field | Explicit optional plain-JS `message` service; scope, handles and disposal contract need review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dialog`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L37) | Service field | Explicit optional plain-JS `dialog` service; scope, handles and disposal contract need review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`notification`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L38) | Service field | Explicit optional plain-JS `notification` service; scope, handles and disposal contract need review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loadingBar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L39) | Service field | Explicit optional plain-JS `loadingBar` service; scope, handles and disposal contract need review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`modal`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L40) | Service field | Explicit optional plain-JS `modal` service; scope, handles and disposal contract need review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`app`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L42) | Service field | No framework app or injection; explicit plain-JS service instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`unmount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L43) | Service field | Candidate dispose() handle for hosts/listeners/timers; no Vue unmount dependency. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
