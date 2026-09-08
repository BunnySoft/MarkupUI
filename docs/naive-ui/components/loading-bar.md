# Loading Bar

**Plan: 🟢 Verified retained root-owned native lifecycle/progress scope; eight explicit omissions.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) and [B2: overlay service](../../../src/overlay/index.ts)
remain the historical progress/timed-feedback concepts. The new
[optional helper](../../../src/components/loading-bar/loading-bar.ts) owns one explicit passive
native progress/status root, not a provider or global request service.
[External CSS](../../../src/components/loading-bar/loading-bar.css) owns presentation.
See the [canonical API and acceptance](../../components/loading-bar.md).

## Acceptance and gaps

74 targeted tests, build/budgets and Chromium cover unknown/measured work, terminal outcomes,
restart/holds, independent roots, observer/timer cleanup, author restoration and native
semantics. Cosmetic 0→80 width simulation is deliberately replaced by native indeterminate
progress. External request concurrency/cancellation remains application-owned.

## Migration steps

**Delivery phase:** P3 — managed feedback. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P2 native Progress concepts and P0 explicit timer ownership in the [master plan](../migration-plan.md).
**Next task:** Dialog, then Modal/Drawer in prerequisite order; P3 is not complete.

1. [x] **Author the service host.** Explicit passive root, one named native progress and separate readable status text.
2. [x] **Specify operation state.** Indeterminate start, real measured units, first terminal outcome, guarded holds and explicit UI stop.
3. [x] **Separate animation/CSS.** External native progress/stripe/height/color/position styles; reduced-motion and disposal.
4. [x] **Test concurrent work.** Independent bars, rapid restart, terminal latch, removal, error text, author state and focus noninterference.

### Native primitives and fallback

- **Native path:** named native progress and independent status text, with a usable author-supplied
  measured example before JavaScript. Application controls remain outside the passive surface.
- **Small enhancement:** a root-bound controller updates owned attributes/text and one timer.
  A scoped root/ancestor observer handles restoration and removal; no provider, polling,
  global busy state or implicit network hooks. CSS remains independent and required for enhanced hiding.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/loading-bar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar)
- [Pinned public exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/index.ts)
- [Catalog and provenance](../index.md) · [Architecture and statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **seven original local table rows + three original supplementary declarations +
eight explicit source supplements + zero inherited rows = 18 tracker rows**.
All **10 original owner/name/source identities** remain: **10 Verified adapted targets,
eight intentionally omitted targets**.

Pinned Markdown, provider/instance API, private LoadingBar implementation and public index
were reviewed. Source provider methods forward start/error/finish around mount timing;
the target requires an explicit connected root. Source width/transition/teleport machinery is
not reproduced. Target stop/setProgress/delay/outcome operations are explicit additions,
not newly discovered upstream public methods.

### LoadingBarProvider Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`container-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L50) | Prop | Author classes directly on the explicit root. | 🟢 Verified | Classes/identity preserved; no provider prop forwarding. |
| [`container-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L51) | Prop | External root CSS/tokens, optional logical fixed presentation. | 🟢 Verified | No style objects, portal geometry or injected styles. |
| [`loading-bar-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Prop | External native-progress/state selectors. | 🟢 Verified | Loading/error states, height/color/track tokens and native fallback. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L53) | Prop | Author a suitable connected root at its intended location. | ⏭️ Intentionally omitted | No teleport/mount-target selector, hidden app or provider. |

### loadingBar Injection Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L59) | Method | Explicit error outcome with independent Failed text. | 🟢 Verified | No fake 100%; default persists; first-terminal latch survives hiding. |
| [`finish`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L60) | Method | Caller-declared success, native max value and guarded hold. | 🟢 Verified | Idempotent until start/stop; no stale timer hides a restarted bar. |
| [`start`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L61) | Method | Reset UI generation/outcome, remove value for unknown native progress. | 🟢 Verified | Repeated starts safe; no cosmetic percent estimate or request ref-counting. |

### Documented service entry

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`useLoadingBar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L19) | Framework API | Explicit createLoadingBar(root) instead. | ⏭️ Intentionally omitted | No framework injection or provider compatibility credit. |

### LoadingBarProvider Props: loading-bar-style inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`loading-bar-style.loading?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Inline record field | External loading/native-indeterminate/measurement selectors. | 🟢 Verified | Static reduced-motion alternative; no runtime CSS-object field. |
| [`loading-bar-style.error?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/demos/enUS/index.demo-entry.md#L52) | Inline record field | External error border/text state, independent of progress. | 🟢 Verified | Error words remain accessible, not color alone. |

### Loading Bar explicit source-only supplements

These additions identify provider/public-instance types, an implicit slot and the private
simulation boundary without changing any original owner or row.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`LoadingBarInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L22-L26) | Source method interface | Returned native controller includes start/error/finish void operations. | 🟢 Verified | Root-owned lifecycle additions; no injected singleton. |
| [`LoadingBarProviderInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L28) | Public source alias | Native LoadingBarController instead. | ⏭️ Intentionally omitted | No Vue provider instance/ref compatibility. |
| [`LoadingBarApiInjection` / `LoadingBarApi`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L29) | Public source injection alias | Explicit controller, not dependency injection. | ⏭️ Intentionally omitted | Public index renames the injection type; no provider contract. |
| [`LoadingBarProviderProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L47-L49) | Public source type | Native options plus authored CSS/HTML. | ⏭️ Intentionally omitted | No Vue extracted prop type or style-object passthrough. |
| [`LoadingBarProviderSetupProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L51-L53) | Internal setup type boundary | Explicit connected-root lifecycle. | ⏭️ Intentionally omitted | Internal provider setup is not a native public API. |
| [`useTheme.props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L32) | Source theme group | Independent external CSS. | ⏭️ Intentionally omitted | No provider/theme/CSS-in-JS dependency. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBarProvider.tsx#L114) | Source provider slot | Application content stays authored outside the passive root. | 🟢 Verified | No app wrapper generation, rendering or node relocation. |
| [`start(fromProgress, toProgress, status)`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/loading-bar/src/LoadingBar.tsx#L58-L62) | Private simulation boundary | Native indeterminate start; explicit real measurements only. | ⏭️ Intentionally omitted | Private 0→80 width simulation is not a public measured-progress API. |

<!-- END PINNED API INVENTORY -->
