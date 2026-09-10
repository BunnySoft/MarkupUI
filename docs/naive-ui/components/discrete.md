# Discrete API

**Plan: 🟢 Verified native composition capability; framework factory intentionally omitted.**
There is no new src runtime, package export, distribution or budget for this route.

## Chosen minimal resolution and evidence

- [Canonical design/selection/lifetime/acceptance](../../components/discrete.md)
- [Real composition demo](../../../demo/components/discrete.html), with separate HTML/CSS/JS
- [Integration tests](../../../tests/discrete.test.ts)
- Existing Message, Notification, Loading Bar, Dialog and Modal owners already work outside
  any framework/setup. Their roots, templates, typed options and disposal remain authoritative.
- No provider tree, app, singleton, reactive config bridge, generic plugin graph or eager
  service bundle is introduced. The demo startup helper is application code, not a library API.
- [2026-09-11 style review](../../style-audit/components/discrete.md): no aggregate
  visual component exists; selected services keep independent style ownership.

Pinned review inspected [selection](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discrete.ts), [types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/interface.ts), [hidden app creation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts)
and [injection extraction](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/InjectionExtractor.tsx). The live official route returned HTTP 404 to the
fetch client. Markdown omits modal from includes but documents modal options/output; pinned
source includes modal. Both identities/discrepancy are preserved below, not silently normalized.

## Migration steps

**Delivery phase:** P3 — explicit services; hidden framework apps remain excluded.
**Task state:** 🟢 Verified native composition.
**Prerequisites:** accepted native Message/Notification/Dialog/Modal/Loading Bar owners.
**Next task:** after the full P3 retained-scope audit, native Input/control contracts in P4
before Form enhancements; P0/P4+ remain independent.

1. [x] **Resolve selection.** Explicit imports/roots retain useful service selection without a redundant factory.
2. [x] **Specify scoped context.** Per-service options and normal CSS/lang/dir replace practical context, not provider props.
3. [x] **Define cleanup responsibility.** Test ordered application cleanup, partial-failure reporting and retry; no atomicity claim.
4. [x] **Verify composition.** Selected/all-five services, independent/modal-local roots, pending cleanup and native focus accepted.

### Native primitives and fallback

Use the already shipped native services and authored roots/templates directly. Static content,
native progress, form controls and inline alternatives remain available without an app runtime.
No automatic CSS injection or top-layer positioning promise is added. Scope feedback inside
the native modal where needed and tear down only owned resources in explicit dependency order.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/discrete)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **0 local rows + 28 supplementary declarations + 0 inherited rows = 28 tracker rows**.
All **16 original owner/name/source identities** remain. Twelve source-only declarations/implementation contracts are added below. Green is an existing native composition capability, not a new createDiscreteApi factory or compatible return object. No source runtime/export/bundle/budget is added for this route. See the [canonical resolution](../../components/discrete.md).

### Discrete API

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`createDiscreteApi`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L20) | Method | No new factory/export/global; existing native owners already work outside setup/frameworks. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |

### createDiscreteApi input

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`includes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L21) | Parameter | Application selects only needed static/conditional imports and explicit native owners; not a library includes argument. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L22) | Parameter | No combined options bag; use each selected owner's documented options and authored roots. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |

### createDiscreteApi options

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`configProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L23) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`messageProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L24) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`dialogProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L25) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`notificationProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L26) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`modalProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L29) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`loadingBarProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L30) | Configuration field | No provider-props/ref forwarding. Use supported native per-service options, CSS/lang/dir and authored labels explicitly. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |

### createDiscreteApi result

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`message`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L36) | Service field | Use the existing message native entry/owner directly with its own root, API and disposal contract. No discrete result field is generated. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`dialog`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L37) | Service field | Use the existing dialog native entry/owner directly with its own root, API and disposal contract. No discrete result field is generated. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`notification`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L38) | Service field | Use the existing notification native entry/owner directly with its own root, API and disposal contract. No discrete result field is generated. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`loadingBar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L39) | Service field | Use the existing loadingBar native entry/owner directly with its own root, API and disposal contract. No discrete result field is generated. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`modal`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L40) | Service field | Use the existing modal native entry/owner directly with its own root, API and disposal contract. No discrete result field is generated. | 🟢 Verified | ADAPTED existing capability; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`app`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L42) | Service field | No hidden Vue app, body host or provider graph. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`unmount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/demos/enUS/index.demo-entry.md#L43) | Service field | No Vue unmount compatibility method. Application invokes native dispose/disconnect in explicit ownership order. | ⏭️ Intentionally omitted | Explicit framework exclusion; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |


## Explicit pinned source supplements

The native result is application composition, not a library implementation of these Vue
interfaces. The source includes modal even though the Markdown includes parameter omits it.

### Source selection and type contracts

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`DiscreteApiType.modal`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/interface.ts) | Source-only contract | Pinned union/switch includes modal; explicitly importing the shipped Modal owner retains the useful capability. | 🟢 Verified | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`MaybeRef`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/interface.ts) | Source-only contract | No Vue Ref/unref/reactive config bridge. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`DiscreteApiOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/interface.ts) | Source-only contract | No combined provider-props configuration interface. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`DiscreteApi<T>`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/interface.ts) | Source-only contract | No conditional Vue app/service return type; existing native types remain authoritative. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |

### Hidden application implementation contracts

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`createDiscreteApp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No hidden application factory or generated body host. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`DiscreteApp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No app/unmount container interface; explicit application resources instead. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`Provider<P>`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No component-constructor/provider abstraction. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`ProviderProps<C>`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No framework prop extraction/forwarding. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`providersAndProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discrete.ts) | Source-only contract | No provider/plugin registry; literal application imports and construction. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`injectionFactoryMap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No injected composable extraction map. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`NInjectionExtractor.onSetup`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/InjectionExtractor.tsx) | Source-only contract | No setup extraction component or slot renderer. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |
| [`browser host mount/unmount`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/discrete/src/discreteApp.ts) | Source-only contract | No automatic body mount/unmount; native roots stay authored and owners are disposed explicitly. | ⏭️ Intentionally omitted | Source inspected; [native composition acceptance](../../components/discrete.md), tests/discrete.test.ts and pinned source review. |

<!-- END PINNED API INVENTORY -->
