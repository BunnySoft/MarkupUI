# Image

**Plan: Planned. Current baseline: avatar image creation only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) demonstrates native image creation; no gallery/preview controller exists.

- **HTML:** native `img`/`picture` with alt, sizes and dimensions; gallery uses real links.
- **JS:** optional preview dialog, navigation and zoom with cleanup; prefer native loading/decoding.
- **CSS:** external fitting and preview controls.
- **Placement:** proposed `src/components/image/` for native styling, `src/optional/image-preview/` for behavior.

## Acceptance and gaps

Test errors, lazy loading, responsive sources, caption/alt distinction, focus return and gallery navigation. ImageGroup and ImagePreview APIs are not implied by avatar support.

## Migration steps

**Delivery phase:** P2 — native image; P6 for preview/gallery. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Avatar image ownership, P3 dialog focus and optional media budgets in the [master plan](../migration-plan.md).
**Next task:** separate native img/picture behavior from ImageGroup/ImagePreview enhancement.

1. [ ] **Preserve responsive images.** Adopt alt, srcset/sizes, dimensions, loading and decoding rather than regenerating images.
2. [ ] **Define preview anatomy.** Use real links and native dialog with caption, close and gallery navigation controls.
3. [ ] **Scope zoom and grouping.** Specify identity/order, loading failures and resource cleanup independently from basic image rendering.
4. [ ] **Test media transitions.** Cover broken images, gallery replacement, lazy loading, keyboard zoom/navigation and restored trigger focus.

### Native primitives and fallback

- **Native path:** `img`/`picture`, srcset/sizes, loading/decoding and real links; optional gallery members can clone native templates without replacing existing images.
- **Small enhancement:** an independently loaded light-DOM controller feature-detects native dialog for preview and owns listeners/observers. Without preview support, links open the full image normally. CSS object-fit/logical sizes and responsive rules own presentation; no gallery/lightbox polyfill or Shadow DOM projection is necessary.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/image)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **44 local table rows + 33 supplementary declarations + 0 inherited rows = 77 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Image Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`alt`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L29) | Prop | Native img `alt` attribute/property; preserve authored image and document fallback behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`fallback-src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `fallback-src` attribute or JS `fallbackSrc`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L31) | Prop | Native img `height` attribute/property; preserve authored image and document fallback behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`img-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate explicit native-child configuration for `img-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`lazy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate explicit JS `lazy` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`intersection-observer-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate JS `intersectionObserverOptions` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keep-drag-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `keep-drag-offset`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`object-fit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L36) | Prop | External CSS token/class for `object-fit`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`preview-src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `preview-src` attribute or JS `previewSrc`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`preview-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate presence attribute `preview-disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`previewed-img-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate explicit native-child configuration for `previewed-img-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate authored `render-toolbar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate live JS `showToolbar` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar-tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate live JS `showToolbarTooltip` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L43) | Prop | Native img `src` attribute/property; preserve authored image and document fallback behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L44) | Prop | Native img `width` attribute/property; preserve authored image and document fallback behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`on-error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L45) | Callback | Candidate DOM `mui:error` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-load`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L46) | Callback | Candidate DOM `mui:load` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ImageGroup Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate `current` attribute or JS `current`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate native default/reset state for `default-current`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate native default/reset state for `default-show`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keep-drag-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate presence attribute `keep-drag-offset`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate authored `render-toolbar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L57) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L58) | Prop | Candidate live JS `showToolbar` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar-tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L59) | Prop | Candidate live JS `showToolbarTooltip` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`src-list`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L60) | Prop | Candidate JS `srcList` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-preview-next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L61) | Callback | Candidate DOM `mui:preview-next` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-preview-prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L62) | Callback | Candidate DOM `mui:preview-prev` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L63) | Callback | Candidate DOM `mui:change:current` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L64) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ImagePreview Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L70) | Prop | Candidate native default/reset state for `default-show`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`keep-drag-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L71) | Prop | Candidate presence attribute `keep-drag-offset`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Prop | Candidate authored `render-toolbar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L73) | Prop | Candidate live JS `show` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L74) | Prop | Candidate live JS `showToolbar` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-toolbar-tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L75) | Prop | Candidate live JS `showToolbarTooltip` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L76) | Prop | Native img `src` attribute/property; preserve authored image and document fallback behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L77) | Callback | Candidate DOM `mui:close` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L78) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Image Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L84) | Slot | Candidate authored `error` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L85) | Slot | Candidate authored `placeholder` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ImageGroup Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L91) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Image Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`showPreview`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L97) | Method | Candidate plain-JS `showPreview` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Image Props: intersection-observer-options inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`intersection-observer-options.root?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L34) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`intersection-observer-options.rootMargin?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L34) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`intersection-observer-options.threshold?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L34) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Image Props: render-toolbar inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.prev` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.next` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateCounterclockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.rotateCounterclockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateClockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.rotateClockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.resizeToOriginalSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.resizeToOriginalSize` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomOut`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.zoomOut` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomIn`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.zoomIn` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.download`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.download` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40) | Inline record field | Candidate authored `render-toolbar.nodes.close` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ImageGroup Props: render-toolbar inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.prev` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.next` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateCounterclockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.rotateCounterclockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateClockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.rotateClockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.resizeToOriginalSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.resizeToOriginalSize` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomOut`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.zoomOut` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomIn`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.zoomIn` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.download`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.download` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56) | Inline record field | Candidate authored `render-toolbar.nodes.close` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### ImagePreview Props: render-toolbar inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.prev`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.prev` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.next`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.next` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateCounterclockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.rotateCounterclockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.rotateClockwise`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.rotateClockwise` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.resizeToOriginalSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.resizeToOriginalSize` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomOut`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.zoomOut` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.zoomIn`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.zoomIn` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.download`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.download` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-toolbar.nodes.close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72) | Inline record field | Candidate authored `render-toolbar.nodes.close` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
