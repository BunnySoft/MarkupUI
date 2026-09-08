# Collapse Transition

**Plan: 🟢 Verified retained optional native-motion scope.** Existing Collapse stays independent;
no renderer, unmount directive, animation framework or universal height engine is introduced.

## Retained implementation and evidence

- [Canonical loading/API/focus/ownership/acceptance](../../components/collapse-transition.md)
- [Optional native helper/CSS](../../../src/components/collapse-transition/) · [tests](../../../tests/collapse-transition.test.ts)
- [Separate local demo](../../../demo/components/collapse-transition.html)
- Stable native outer/inner wrapper, native hidden/inert and Element.animate height keyframes.
- Reduced/print/unsupported paths are immediate, never fake focus or modal semantics.

Pinned review inspected [CollapseTransition](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx), its [internal transition helper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts)
and [height-expand styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_styles/transitions/fade-in-height-expand.cssr.ts). The live official route returned HTTP 404 to the fetch
client; pinned Markdown remains authoritative. Source uses Vue render directives, max-height
style/reflow choreography and internal hooks; those are not transplanted or called public parity.

## Migration steps

**Delivery phase:** P3 — optional interaction motion. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native disclosure ownership and accepted reentrant attribute/removal primitives.
**Next task:** Discrete API; global P3 remains incomplete.

1. [x] **Define ownership.** Authored wrapper/content, native visibility, explicit focus target and release.
2. [x] **Implement optional motion.** Native WAAPI with immediate safe reduced/unsupported fallback.
3. [x] **Bound measurement/hooks.** Current/target height snapshots, interruption and explicit native hook policy.
4. [x] **Verify interruptions.** Real reversal/geometry, dynamic content, removal/focus/ownership/media and budgets.

### Native primitives and fallback

No new role, trigger discovery or aria-expanded mutation. Existing native details/summary
and authored hidden/visible content are the baseline. The optional controller requires a
plain native block wrapper and flow-root inner div, and uses inert only while clipping.
No per-frame layout/ResizeObserver engine. Unexpected errors are surfaced; expected
Animation.finished AbortError cancellation is handled narrowly and cannot affect a new request.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/collapse-transition)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **4 original local rows + 16 explicit source supplements + 0 inherited rows = 20 tracker rows**.
All **four original owner/name/source identities** remain. Sixteen explicitly cited source/internal-hook/style contracts are added below; they are not silently promoted to public wrapper props. Green means an adapted native target, not Vue/pixel/transition parity. See the [canonical contract](../../components/collapse-transition.md).

### CollapseTransition Props

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`appear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L17) | Prop | Explicit initial native opening motion, deferred until the controller exists; focused content/reduced/unsupported paths settle immediately. | 🟢 Verified | Explicit native scope; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L18) | Prop | No framework if/show remount directive; native hidden retains authored nodes and controls. | ⏭️ Intentionally omitted | Explicit native scope; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L19) | Prop | setShow(boolean), actual native hidden state and guarded motion. Default honors authored hidden rather than overriding it. | 🟢 Verified | Explicit native scope; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |

### CollapseTransition Slots

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/demos/enUS/index.demo-entry.md#L25) | Slot | One stable authored inner flow-root inside the owned native block wrapper; no VNode/slot renderer. | 🟢 Verified | Explicit native scope; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |


## Explicit source-only and internal-hook contracts

The wrapper source supplies appear to NFadeInExpandTransition and forwards attrs to its
rendered div. Internal helper props/phases below are therefore not claimed as inherited
public CollapseTransition hook props. The native API exposes explicitly documented hooks.

### CollapseTransition source supplements

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | Deprecated inverted alias (true shows content) omitted; use explicit show. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | No theme/CSS-in-JS object forwarding. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | No theme/CSS-in-JS object forwarding. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | No theme/CSS-in-JS object forwarding. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`wrapper/attrs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | Authored constrained native wrapper/inner content replaces generated div/attrs merging. | 🟢 Verified | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`bezier`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse-transition/src/CollapseTransition.tsx) | Source-only contract | No theme bezier forwarding; native ease-in-out and validated duration. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |

### Internal transition helper props

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`group`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Internal transition-group/keyed/width/reverse orchestration omitted. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`mode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Internal transition-group/keyed/width/reverse orchestration omitted. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Internal transition-group/keyed/width/reverse orchestration omitted. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`reverse`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Internal transition-group/keyed/width/reverse orchestration omitted. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`onLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Explicit native onLeave at safe start of hide, including instant fallback; not a forwarded Vue prop. | 🟢 Verified | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`onAfterLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Explicit native hook after successful settled hidden state; cancelled/failed operations do not claim completion. | 🟢 Verified | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`onAfterEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Explicit native hook after successful intrinsic-height visibility and inert/clipping release. | 🟢 Verified | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |

### Internal geometry and style phases

| Upstream item · source | Kind | Native target / disposition | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`onEnter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Explicit native onEnter hook plus sampled WAAPI height; no forced-reflow style choreography. | 🟢 Verified | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`onBeforeLeave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/fade-in-expand-transition/src/FadeInExpandTransition.ts) | Source-only contract | Private max-height measurement/reflow phase is not exposed as a separate Vue-compatible hook. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |
| [`fadeInHeightExpandTransition options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_styles/transitions/fade-in-height-expand.cssr.ts) | Source-only contract | No opacity/margin/padding/foldPadding/originalTransition/delay/style-object engine; vertical native height only. | ⏭️ Intentionally omitted | Source reviewed; [native acceptance](../../components/collapse-transition.md), transition/Collapse/ownership tests and pinned source review. |

<!-- END PINNED API INVENTORY -->
