# Layout

**Migration status: 🟢 Verified for the retained native CSS/disclosure scope.**
All 42 original inventory rows remain: 32 adapted native targets and 10 explicit omissions.

## Baseline and target

[A1: accepted contract and evidence](../../components/layout.md) defines the retained scope.
[S1: stylesheet](../../../src/components/layout/layout.css) styles native regions without
a controller. [D1: demonstration](../../../demo/components/layout.html) separates markup,
application CSS and ordinary action handlers. The legacy structural elements remain unchanged.

- **HTML:** native header/main/footer/aside/nav and optional details/summary; semantic ownership is explicit.
- **JS:** none in the component. Native toggle/scroll/scrollTo APIs remain application-owned.
- **CSS:** external flex shells, borders, dimensions, positioning, overflow and author-defined responsive composition.
- **Placement:** stylesheet-only `src/components/layout/`; no Custom Element or hidden provider.

## Acceptance and gaps

A1 records build/396-test and Chromium geometry, focus, forms, nested scrolling, sticky/
absolute placement, RTL/zoom, print, forced-color and legacy-coexistence evidence.
Native details hides closed navigation rather than implementing width/transform transitions.
Custom scrollbars, clipped visible closed content, runtime style-object forwarding and
transition callbacks are omitted. Native toggle is asynchronous/coalescing, not a Vue update
callback. Responsive visual reflow does not change the disclosure's open state.

## Migration steps

**Delivery phase:** P2 — structural layout; P3 framework-style sider behavior deliberately replaced/omitted. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 native semantics/external CSS and native disclosure focus rules in the [master plan](../migration-plan.md).
**Next task:** List, then Descriptions/Timeline/Breadcrumb; reopen omitted Layout behavior only through a separate decision.

1. [x] **Reconcile companion regions.** A1 maps all five owners to native authored regions without duplicate landmarks or node replacement.
2. [x] **Separate shell layout.** S1 provides scoped external CSS; application styles supply container constraints and responsive rules.
3. [x] **Adapt sider behavior.** Native details/summary owns open/closed state, trigger keyboard behavior and hidden descendants; omissions are explicit.
4. [x] **Accept nested shells.** A1 records layout/scroll/focus/native-form, print/forced-color, browser and payload evidence.

### Native primitives and fallback

- **Native path:** header/main/footer/aside landmarks with CSS grid/flex, logical sizing and authored content. Ordinary shells do not need a lifecycle controller.
- **Native interaction:** details/summary and Element.scrollTo supply the retained behavior without custom elements, observers or lifecycle code. Applications own programmatic focus policy and responsive stacking. No framework, native-slot projection claim or generic shell template runtime is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/layout)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **39 local table rows + 3 supplementary declarations + 0 inherited rows = 42 tracker rows**.
Retained implementation is defined by A1, not by the historical baseline. Source review covered
the public contract and Header/source positioning; undocumented internals remain unreviewed.
Rows below verify adapted native targets, not full framework, animation or all-browser parity.
CSS-only means there are no runtime wrapper methods or synthetic callback aliases.

Referenced public component types (composition, not automatic API inheritance): [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Layout, Layout Content Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L33) | Prop | Native class/classList on the actual content or scroll region. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L34) | Prop | External scoped CSS instead of runtime style-string/object forwarding. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`embedded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L35) | Prop | data-embedded and the embedded-background CSS token; no provider mode detection. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`has-sider`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L36) | Prop | Explicit data-has-sider row shell, with native children. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L37) | Prop | Native overflow and browser scrollbars only; false/custom mode is not supplied. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L38) | Prop | Normal flow or data-position=absolute with explicit author containing block/offset constraints. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L39) | Prop | Native scroll-container CSS/attributes instead of a custom Scrollbar component. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`sider-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L40) | Prop | Authored DOM order and logical data-side=end, not a visual-reordering algorithm. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L41) | Callback | Native scroll listener on the actual scrolling element; no mui:scroll alias. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout Footer Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L47) | Prop | Presence data-bordered and logical header/footer/sider border CSS. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L48) | Prop | Presence data-inverted on Header/Footer/Sider and external color tokens. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L49) | Prop | Normal flow or data-position=absolute with explicit author containing block/offset constraints. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout Header Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L55) | Prop | Presence data-bordered and logical header/footer/sider border CSS. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L56) | Prop | Presence data-inverted on Header/Footer/Sider and external color tokens. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L57) | Prop | Normal flow or data-position=absolute with explicit author containing block/offset constraints. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout Sider Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L63) | Prop | Presence data-bordered and logical header/footer/sider border CSS. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`collapse-mode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L64) | Prop | Native disclosure hides content; transform/width transition engines are not provided. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L65) | Prop | Native details.open with inverse meaning; no controlled-prop adapter. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`collapsed-trigger-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L66) | Prop | Native summary class/classList and details:not([open]) selectors. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`collapsed-trigger-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L67) | Prop | External summary CSS instead of a runtime style-object adapter. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`collapsed-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L68) | Prop | --mui-layout-sider-collapsed-width CSS length; 48px default on closed details. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L69) | Prop | Native class/classList on the actual content or scroll region. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L70) | Prop | External scoped CSS instead of runtime style-string/object forwarding. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`default-collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L71) | Prop | Author initial details open attribute; omit open for collapsed state. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L72) | Prop | Presence data-inverted on Header/Footer/Sider and external color tokens. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`native-scrollbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L73) | Prop | Native overflow and browser scrollbars only; false/custom mode is not supplied. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L74) | Prop | Normal flow or data-position=absolute with explicit author containing block/offset constraints. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L75) | Prop | Native scroll-container CSS/attributes instead of a custom Scrollbar component. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`show-collapsed-content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L76) | Prop | Closed native disclosure hides navigation; compressed visible-content mode omitted. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`show-trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L77) | Prop | Author details/summary or a plain aside; no generated bar/arrow-circle triggers. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`trigger-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L78) | Prop | Native summary class/classList. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`trigger-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L79) | Prop | External summary CSS, not host style-string/object forwarding. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L80) | Prop | --mui-layout-sider-width native CSS length; 272px default. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`on-after-enter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L81) | Callback | No automatic enter transition or synthetic completion hook. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`on-after-leave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L82) | Callback | No automatic leave transition or synthetic completion hook. | ⏭️ Intentionally omitted | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`on-scroll`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L83) | Callback | Native scroll listener on the actual scrolling element; no mui:scroll alias. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`on-update:collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L84) | Callback | Native toggle event; inspect !details.open. Native asynchronous/coalescing timing. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout, Layout Content, Layout Sider, Layout Header, Layout Footer Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L90) | Slot | Author native children in each region; no rendering, moving or slot projection. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout, Layout Content, Layout Sider Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Method | Existing Element.scrollTo(x, y) or native options object on the chosen scroll element. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

### Layout, Layout Content, Layout Sider Methods: scrollTo inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo.left?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Native ScrollToOptions.left; no wrapper coordinate conversion. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`scrollTo.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Native ScrollToOptions.top; no wrapper coordinate conversion. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |
| [`scrollTo.behavior`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md#L96) | Inline record field | Native auto/smooth scroll behavior; application honors reduced-motion preference. | 🟢 Verified | [A1: accepted native scope and evidence](../../components/layout.md); no blanket upstream parity. |

<!-- END PINNED API INVENTORY -->
