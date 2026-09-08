# Scrollbar

**Plan: 🟢 Verified for native-only scrolling; 15 explicit custom-chrome/style/type/internal exclusion groups.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) retains basic overflow support.
The new native-only stylesheet adds no custom controller, rails or registration.

- **HTML:** actual named/focusable scroll regions when needed, original content and optional real content wrapper.
- **JS:** none in the component; native Element APIs/events and optional application commands only.
- **CSS:** native overflow and guarded opt-in width/color/gutter hints.
- **Placement:** [scrollbar.css](../../../src/components/scrollbar/scrollbar.css), stylesheet export and [native demo](../../../demo/components/scrollbar.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/scrollbar.md) reports 540 passing tests
(12 Scrollbar cases), build/budget gates and Chromium wheel/keyboard/native API/RTL/nested/
focus/form/resize/style/print/coexistence/no-JS evidence. CSS is 468 gzip bytes and JS is
zero; core/plugins are unchanged. Native appearance remains OS-dependent; actual touch
hardware, all browser scrollbar policies and screen-reader speech are not certified.

## Migration steps

**Delivery phase:** P2 — native scrolling; custom scrollbar emulation remains excluded. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 scroll-container ownership and external CSS in the [master plan](../migration-plan.md).
**Next task:** Float Button (P2/P3), then Image (P2/P6); these are the only remaining Planned P2-assigned routes.

1. [x] **Preserve browser scrolling.** Actual overflow regions, native input policy, names/focus and unchanged content.
2. [x] **Extract optional styling.** Guarded standards hints; default/native/forced-color appearance retained.
3. [x] **Resolve imperative methods.** Native scrollTo/scrollBy/properties/events; no fake sync, refs or resize notifications.
4. [x] **Test platform behavior.** Wheel/keyboard/RTL/focus/forms/nested chaining/resize/print/no-JS accepted within documented platform limits.

### Native primitives and fallback

- **Native path:** actual Element overflow, scrollTo/scrollBy/scrollTop/scrollLeft and ordinary input/events. No sign normalization, wrapper/ref adapter or generated content tree.
- **Small enhancement:** guarded external standards styling only. App ResizeObserver/chaining/smooth-scroll policies are independent native composition, not library callbacks or sync machinery.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/scrollbar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 original local table rows + 6 original inline declarations + 11 explicit source-only declaration/exclusion groups + 0 inherited rows = 27 tracker rows**.
All original 16 owner/row identities remain: **12 Verified ADAPTED native targets and
15 Intentionally omitted contracts/groups**. The public wrapper and relevant internal
props/methods/refs/rendering were reviewed. Internal groups below are explicitly not
promoted into public-wrapper promises; the wrapper's exposed instance type has only
scrollTo/scrollBy. No source field is falsely mapped to a CSS notification or no-op method.


### Scrollbar Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L23) | Prop | Native class/classList on actual content or an optional authored wrapper. | 🟢 Verified ADAPTED target | Original classes/nodes/listeners; no generated wrapper or forwarding layer. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS rather than runtime string/object forwarding. | ⏭️ Intentionally omitted | Native dimensions/wrapping belong to authored content. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L25) | Prop | No hover/always-visible custom rail state. | ⏭️ Intentionally omitted | OS/browser preferences govern native chrome; no visibility timers or default hiding. |
| [`x-scrollable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L26) | Prop | Native horizontal overflow eligibility and author content width; both axes auto by default. | 🟢 Verified ADAPTED target | No false-default clipping or automatic fit-content wrapper; native horizontal/focus/RTL verified. |
| [`x-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L27) | Prop | No custom horizontal rail placement. | ⏭️ Intentionally omitted | Native platform placement; no top-rail emulation. |
| [`y-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L28) | Prop | No custom vertical rail placement. | ⏭️ Intentionally omitted | Native direction/preferences, not a layout/sign hack. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L29) | Callback | Native scroll listener on the actual region. | 🟢 Verified ADAPTED target | Original Event/target/timing; no mui:scroll alias or cached state. |

### Scrollbar Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L35) | Slot | Original native content/controls and inert templates. | 🟢 Verified ADAPTED target | Optional authored wrapper; no renderer, clone or reactive ref. |

### Scrollbar Methods

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollBy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Method | Existing Element.scrollBy numeric/options overloads. | 🟢 Verified ADAPTED target | Native deltas/clamping/events; no installed wrapper. |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Method | Existing Element.scrollTo numeric/options overloads. | 🟢 Verified ADAPTED target | Native omitted-axis preservation, not source internal zero-fill or extended overloads. |

### Scrollbar Methods: scrollBy inline fields

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollBy.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Native horizontal delta. | 🟢 Verified ADAPTED target | Numeric/options movement, no RTL normalization. |
| [`scrollBy.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Native vertical delta. | 🟢 Verified ADAPTED target | 120px command and native delta APIs verified. |
| [`scrollBy.behavior?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L41) | Inline record field | Native ScrollBehavior option. | 🟢 Verified ADAPTED target | No animation engine; application honors reduced motion. |

### Scrollbar Methods: scrollTo inline fields

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollTo.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Native horizontal coordinate. | 🟢 Verified ADAPTED target | Omitted axis retained; negative RTL remains browser-owned. |
| [`scrollTo.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Native vertical coordinate. | 🟢 Verified ADAPTED target | Numeric reset/options position verified without cached refs. |
| [`scrollTo.behavior?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/demos/enUS/index.demo-entry.md#L42) | Inline record field | Native ScrollBehavior option. | 🟢 Verified ADAPTED target | Browser/CSS behavior and explicit reduced-motion application policy. |

### Explicit source-only declaration and exclusion groups

Public-wrapper supplements and the separately reviewed internal implementation are
distinguished below. Grouped private families are bounded exclusion records, not an
assertion that the public NScrollbar type declares all internal features.

| Source item/group · identity | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only public mixed-in prop | External native CSS only. | ⏭️ Intentionally omitted | Public wrapper spreads useTheme.props; no provider object. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only public mixed-in prop | Native CSS cascade, no override merging. | ⏭️ Intentionally omitted | No style-object/theme adapter. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only public mixed-in prop | No built-in override object. | ⏭️ Intentionally omitted | Zero runtime dependencies. |
| [`ScrollbarInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/scrollbar/src/Scrollbar.tsx) | Source-only exported instance type | Use an actual Element reference, not a Vue instance/type alias. | ⏭️ Intentionally omitted | Public interface only exposes scrollTo/scrollBy, already accounted for above. |
| [`sync / syncUnifiedContainer / handleMouseEnterWrapper / handleMouseLeaveWrapper`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal method group | No synchronization or manual-hover API. | ⏭️ Intentionally omitted | Native scrolling needs no fake no-op sync or rail visibility controller. |
| [`$el / wrapperRef / containerRef / contentRef / xRailRef / yRailRef / containerScrollTop`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal refs/state group | Real author element references and native scroll properties only. | ⏭️ Intentionally omitted | No reactive-ref/cache/rail adapter; native RTL coordinates remain unchanged. |
| [`onResize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal callback | No CSS-generated resize notification. | ⏭️ Intentionally omitted | Application ResizeObserver is independent and owns disconnect; no automatic resize sync. |
| [`scrollTo.el / position / index / elSize / debounce`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal overload-field group | Native coordinates or independent scrollIntoView, not an overload shim. | ⏭️ Intentionally omitted | No index measurement, debounce or source zero-fill alignment algorithm. |
| [`container / content / useUnifiedContainer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal container getter/mode group | Author the actual scroll element/content directly. | ⏭️ Intentionally omitted | No callback-selected container/ref resolution or unified-container lifecycle. |
| [`onWheel / internalOnUpdateScrollLeft`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal input/update hook group | No component hook adapter or normalized scroll-left event. | ⏭️ Intentionally omitted | Native wheel input/listeners remain independent; no interception or sign conversion. |
| [`duration / scrollable / triggerDisplayManually / rail and private layout configuration`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/scrollbar/src/Scrollbar.tsx) | Internal custom-chrome/configuration group | Native overflow and optional standards appearance only. | ⏭️ Intentionally omitted | Includes horizontalRailStyle, verticalRailStyle, containerClass/containerStyle forwarding, internal contentClass array form, internalHoistYRail and internalExposeWidthCssVar. No timers, rail hoisting, generated width cache or custom drag geometry. |

<!-- END PINNED API INVENTORY -->
