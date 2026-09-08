# Image, ImageGroup and ImagePreview

**Plan: 🟢 Verified for retained native image/fallback/dialog scope; advanced P6 viewer contracts explicitly omitted.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) retains its related legacy image usage.
The [native helper](../../../src/components/image/image.ts) and [external CSS](../../../src/components/image/image.css)
preserve authored img/picture/link nodes and add an optional owned-template native dialog.
No viewer, gesture, icon, modal framework or runtime dependency is imported.

- **HTML:** original responsive images, alt/dimensions/attributes, real original-image links,
  optional state regions and an authored native dialog template.
- **JS:** explicit createImagePreview helper lifecycle, bounded single-src fallback,
  current/show/group navigation and owned preview request cancellation.
- **CSS:** native image fitting, dialog viewport bounds, native overflow and controls; no
  geometry/style-object writes or animation engine.
- **Evidence:** [canonical implementation and acceptance](../../components/image.md) and
  [local demo](../../../demo/components/image.html).

## Migration steps

**Delivery phase:** P2 — native images; P6 — retained dialog/group preview.
**Task state:** 🟢 Verified retained scope, not full viewer parity.
**Prerequisites:** native images/links, explicit dialog ownership and bounded optional budgets.
**Next:** all P2-assigned retained scopes are now resolved; recommend the general Popover
foundation before Tooltip/Popconfirm. No P3 implementation is included here.

1. [x] Preserve native responsive image attributes, lazy-loading box, names and event ownership.
2. [x] Adopt linked group members and an owned named native dialog with reliable close/focus.
3. [x] Bound fallback/request lifecycle; exclude advanced gesture/renderer/permission tooling.
4. [x] Exercise failures, live changes, races, nested ownership, removal/reconnect and native fallback.

Native authored images/links remain useful without JavaScript or supported dialog enhancement.
The helper is explicit, not a custom-element/pre-upgrade prop adapter. Its connect/disconnect
contract, native event differences, single-src fallback restriction and advanced omissions
are detailed in the canonical record. No hidden/zero-sized lazy thumbnail workaround exists.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/image)
- [Pinned public API][api]
- [Image source][src-image] · [ImageGroup source][src-group] · [ImagePreview source][src-preview]
- [Shared declarations][src-shared] · [Public types][src-types]
- [Catalog and provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; historical
MarkupUI baseline **5dcb190 / 0.11.0**. All **44 original table rows + 33 original inline
rows** remain with the same owner/name/pinned source identity. Reference-style links only
reduce repetition. **13 explicitly grouped source supplements** give **90 tracker rows:
41 Verified ADAPTED targets and 49 Intentionally omitted contracts/groups**.
Native controls may retain a useful function even where the enclosing VNode renderer contract
is omitted. This is not gesture, download, fullscreen, framework callback or pixel parity.

### Image Props

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`alt`][p29] | Prop | Native thumbnail alt; preview uses thumbnail alt or explicit data-preview-alt. | 🟢 Verified ADAPTED target | No duplicate generated aria-label; original thumbnail attributes retained. |
| [`fallback-src`][p30] | Prop | data-image-fallback on a plain single-src img. | 🟢 Verified ADAPTED target | One bounded probe per source/configuration; success alone changes original src. Picture/srcset fallback mutation excluded. |
| [`height`][p31] | Prop | Native image height attribute or author CSS. | 🟢 Verified ADAPTED target | Original dimensions and nonzero lazy box preserved. |
| [`img-props`][p32] | Prop | Actual authored img/picture/source attributes and native listeners. | 🟢 Verified ADAPTED target | No object forwarding; srcset/sizes/decoding/referrer/crossorigin remain native. |
| [`lazy`][p33] | Prop | Native loading="lazy". | 🟢 Verified ADAPTED target | Browser threshold, original visible reserved box; no custom observer loading mode. |
| [`intersection-observer-options`][p34] | Prop | Custom lazy observer configuration excluded. | ⏭️ Intentionally omitted | Native loading instead; no selector/root observer adapter. |
| [`keep-drag-offset`][p35] | Prop | No preview drag/pinch state. | ⏭️ Intentionally omitted | Native page gestures are not intercepted. |
| [`object-fit`][p36] | Prop | Native CSS object-fit / --mui-image-fit, fill default. | 🟢 Verified ADAPTED target | Standard fill/contain/cover/none/scale-down values; no parser/measurement. |
| [`preview-src`][p37] | Prop | Explicit original/full-image anchor href. | 🟢 Verified ADAPTED target | Supported image URL schemes, native navigation fallback; no hidden source generator. |
| [`preview-disabled`][p38] | Prop | data-preview-disabled on the anchor excludes dialog interception. | 🟢 Verified ADAPTED target | Link still works natively; excluded from group navigation. |
| [`previewed-img-props`][p39] | Prop | Authored owned-template img attributes. | 🟢 Verified ADAPTED target | Helper controls src/alt; prototype src/srcset is rejected. Other template attributes retained; no object/style forwarding. |
| [`render-toolbar`][p40] | Prop | VNode/render callback contract excluded. | ⏭️ Intentionally omitted | Author trusted native dialog/control markup instead. |
| [`show-toolbar`][p41] | Prop | Group data-show-toolbar="false" hides optional toolbar. | 🟢 Verified ADAPTED target | Mandatory close remains outside; authored initially hidden toolbar stays hidden. |
| [`show-toolbar-tooltip`][p42] | Prop | Tooltip renderer/provider excluded. | ⏭️ Intentionally omitted | Native visible button names, no tooltip runtime. |
| [`src`][p43] | Prop | Original native img source, not regenerated thumbnails. | 🟢 Verified ADAPTED target | Live native source changes invalidate fallback work; no URI/HTML evaluator. |
| [`width`][p44] | Prop | Native width attribute or author CSS. | 🟢 Verified ADAPTED target | Original attributes/nodes and responsive fitting remain. |
| [`on-error`][p45] | Callback | Native error listener on original img. | 🟢 Verified ADAPTED target | No stopped/replaced author event; probe events are internal and not duplicate thumbnail callbacks. |
| [`on-load`][p46] | Callback | Native load listener on original img. | 🟢 Verified ADAPTED target | Author listener identity remains; loaded/fallback state does not replace thumbnails. |

### ImageGroup Props

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`current`][p52] | Prop | Validated controller.current index in current eligible DOM order. | 🟢 Verified ADAPTED target | Selected anchor identity retained across order changes; no controlled/uncontrolled bridge. |
| [`default-current`][p53] | Prop | Separate default-state prop excluded. | ⏭️ Intentionally omitted | Initialize current or call open(index) explicitly; initial ordinary selection starts at zero. |
| [`default-show`][p54] | Prop | Automatic initial modal display excluded. | ⏭️ Intentionally omitted | Explicit open/show after application setup. |
| [`keep-drag-offset`][p55] | Prop | No gesture offset model. | ⏭️ Intentionally omitted | Native browser gestures/open-original alternatives. |
| [`render-toolbar`][p56] | Prop | No VNode toolbar callback. | ⏭️ Intentionally omitted | Owned trusted template, not render-prop evaluation. |
| [`show`][p57] | Prop | Controller.show boolean / open/close methods. | 🟢 Verified ADAPTED target | Actual native modal state; unavailable true assignment errors rather than fake success. |
| [`show-toolbar`][p58] | Prop | Native toolbar hidden state from group data-show-toolbar. | 🟢 Verified ADAPTED target | Close remains visible; focus moved out before optional controls hide. |
| [`show-toolbar-tooltip`][p59] | Prop | Tooltip generation excluded. | ⏭️ Intentionally omitted | Explicit native action names. |
| [`src-list`][p60] | Prop | Array-only/invisible-gallery renderer excluded. | ⏭️ Intentionally omitted | Authored linked members are the source of truth; nested boundaries explicit. |
| [`on-preview-next`][p61] | Callback | mui:image-next helper event. | 🟢 Verified ADAPTED target | Circular eligible navigation; disabled/no-op single-image navigation returns false. |
| [`on-preview-prev`][p62] | Callback | mui:image-prev helper event. | 🟢 Verified ADAPTED target | Current DOM order, no global arrow-key handler. |
| [`on-update:current`][p63] | Callback | mui:image-change with current/src detail. | 🟢 Verified ADAPTED target | Actual helper display changes, not Vue boolean/index callback timing parity. |
| [`on-update:show`][p64] | Callback | mui:image-open / mui:image-close. | 🟢 Verified ADAPTED target | Native modal lifecycle and queued close/reopen race handled; no alias-array dispatch. |

### ImagePreview Props

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default-show`][p70] | Prop | Initial-show configuration excluded. | ⏭️ Intentionally omitted | Use explicit helper open/show, including a one-entry standalone root. |
| [`keep-drag-offset`][p71] | Prop | No drag/pinch/retained-offset viewer. | ⏭️ Intentionally omitted | No wheel/pointer interception or gesture dependency. |
| [`render-toolbar`][p72] | Prop | No VNode/render callback. | ⏭️ Intentionally omitted | Author native owned template/control anatomy. |
| [`show`][p73] | Prop | Native helper show/open/close for a one-entry or grouped root. | 🟢 Verified ADAPTED target | No separate virtual preview constructor/provider. |
| [`show-toolbar`][p74] | Prop | Optional owned toolbar hidden state. | 🟢 Verified ADAPTED target | Close is always a separate required native button. |
| [`show-toolbar-tooltip`][p75] | Prop | Tooltip runtime/locale wrapper excluded. | ⏭️ Intentionally omitted | Visible authored labels remain accessible. |
| [`src`][p76] | Prop | Full-image URL from selected native anchor href. | 🟢 Verified ADAPTED target | Live changes cancel old owned image; loading/error state and original link remain explicit. |
| [`on-close`][p77] | Callback | Native dialog close plus mui:image-close lifecycle notification. | 🟢 Verified ADAPTED target | Native cancel prevention respected; safe focus return and nested-modal ownership. |
| [`on-update:show`][p78] | Callback | Helper open/close events, not controlled callback aliases. | 🟢 Verified ADAPTED target | No fake success or synchronous framework timing guarantee. |

### Image Slots

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`error`][p84] | Slot | Direct authored data-image-error region in data-image-frame. | 🟢 Verified ADAPTED target | Hidden-state ownership only; original content/listeners remain. Native alt/link is no-JS fallback. |
| [`placeholder`][p85] | Slot | Direct authored data-image-placeholder region. | 🟢 Verified ADAPTED target | Original img remains nonzero/visible while loading; no hidden-lazy-image workaround. |

### ImageGroup Slots

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`][p91] | Slot | Native linked thumbnails/content and direct dialog template. | 🟢 Verified ADAPTED target | No thumbnail renderer/clone; explicit nested group and helper lifecycle ownership. |

### Image Methods

| Upstream item · source | Kind | Native mapping / disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`showPreview`][p97] | Method | controller.open(indexOrAnchor, optionalOpener). | 🟢 Verified ADAPTED target | True only after native modal opening succeeds; false leaves original navigation available. |

### Image Props: intersection-observer-options inline fields

| Upstream item · source | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`intersection-observer-options.root?`][p34] | Inline record field | Custom lazy root/selector omitted. | ⏭️ Intentionally omitted | Native image loading owns viewport policy. |
| [`intersection-observer-options.rootMargin?`][p34] | Inline record field | Custom lazy root margin omitted. | ⏭️ Intentionally omitted | No IntersectionObserver loading adapter. |
| [`intersection-observer-options.threshold?`][p34] | Inline record field | Custom lazy threshold omitted. | ⏭️ Intentionally omitted | Browser native lazy threshold is not a prop shim. |

### Image Props: render-toolbar inline fields

| Upstream item · source | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`][p40] | Inline record field | VNode node-record contract excluded. | ⏭️ Intentionally omitted | Trusted native template instead. |
| [`render-toolbar.nodes.prev`][p40] | Inline record field | Authored typed previous button. | 🟢 Verified ADAPTED target | Native click, disabled for fewer than two entries. |
| [`render-toolbar.nodes.next`][p40] | Inline record field | Authored typed next button. | 🟢 Verified ADAPTED target | Native group navigation; no menu role. |
| [`render-toolbar.nodes.rotateCounterclockwise`][p40] | Inline record field | Rotation tool excluded. | ⏭️ Intentionally omitted | No gesture/transform state machine. |
| [`render-toolbar.nodes.rotateClockwise`][p40] | Inline record field | Rotation tool excluded. | ⏭️ Intentionally omitted | Open original/browser controls alternative. |
| [`render-toolbar.nodes.resizeToOriginalSize`][p40] | Inline record field | Original-size transform tool excluded. | ⏭️ Intentionally omitted | CSS fits owned preview; original link remains. |
| [`render-toolbar.nodes.zoomOut`][p40] | Inline record field | Viewer zoom-out tool excluded. | ⏭️ Intentionally omitted | Native page zoom is not disabled. |
| [`render-toolbar.nodes.zoomIn`][p40] | Inline record field | Viewer zoom-in tool excluded. | ⏭️ Intentionally omitted | No zoom/gesture package or CSS-in-JS geometry. |
| [`render-toolbar.nodes.download`][p40] | Inline record field | Programmatic download excluded. | ⏭️ Intentionally omitted | Native original/save policy; no fetch/proxy or test download. |
| [`render-toolbar.nodes.close`][p40] | Inline record field | Required named native close button. | 🟢 Verified ADAPTED target | Outside optional toolbar; Escape/cancel/focus lifecycle retained. |

### ImageGroup Props: render-toolbar inline fields

| Upstream item · source | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`][p56] | Inline record field | VNode node record excluded. | ⏭️ Intentionally omitted | Native owned template. |
| [`render-toolbar.nodes.prev`][p56] | Inline record field | Native previous button. | 🟢 Verified ADAPTED target | Eligible ordered circular group navigation. |
| [`render-toolbar.nodes.next`][p56] | Inline record field | Native next button. | 🟢 Verified ADAPTED target | Original thumbnail identity preserved. |
| [`render-toolbar.nodes.rotateCounterclockwise`][p56] | Inline record field | Rotation excluded. | ⏭️ Intentionally omitted | No viewer transform state. |
| [`render-toolbar.nodes.rotateClockwise`][p56] | Inline record field | Rotation excluded. | ⏭️ Intentionally omitted | Ordinary original-image alternative. |
| [`render-toolbar.nodes.resizeToOriginalSize`][p56] | Inline record field | Original-size transform excluded. | ⏭️ Intentionally omitted | No size/offset engine. |
| [`render-toolbar.nodes.zoomOut`][p56] | Inline record field | Viewer zoom-out excluded. | ⏭️ Intentionally omitted | Native page zoom stays available. |
| [`render-toolbar.nodes.zoomIn`][p56] | Inline record field | Viewer zoom-in excluded. | ⏭️ Intentionally omitted | No pinch/wheel interception. |
| [`render-toolbar.nodes.download`][p56] | Inline record field | Programmatic download excluded. | ⏭️ Intentionally omitted | Native browser original/save rules remain. |
| [`render-toolbar.nodes.close`][p56] | Inline record field | Native close action. | 🟢 Verified ADAPTED target | Modal safety even with hidden optional toolbar. |

### ImagePreview Props: render-toolbar inline fields

| Upstream item · source | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`render-toolbar.nodes`][p72] | Inline record field | VNode node record excluded. | ⏭️ Intentionally omitted | Author native dialog markup. |
| [`render-toolbar.nodes.prev`][p72] | Inline record field | Native previous button when grouped. | 🟢 Verified ADAPTED target | Disabled/no movement for one entry. |
| [`render-toolbar.nodes.next`][p72] | Inline record field | Native next button when grouped. | 🟢 Verified ADAPTED target | No source callback renderer required. |
| [`render-toolbar.nodes.rotateCounterclockwise`][p72] | Inline record field | Rotation excluded. | ⏭️ Intentionally omitted | No transform/gesture controller. |
| [`render-toolbar.nodes.rotateClockwise`][p72] | Inline record field | Rotation excluded. | ⏭️ Intentionally omitted | Open original instead. |
| [`render-toolbar.nodes.resizeToOriginalSize`][p72] | Inline record field | Original-size transform excluded. | ⏭️ Intentionally omitted | Native fitted preview only. |
| [`render-toolbar.nodes.zoomOut`][p72] | Inline record field | Viewer zoom-out excluded. | ⏭️ Intentionally omitted | Page zoom remains browser-owned. |
| [`render-toolbar.nodes.zoomIn`][p72] | Inline record field | Viewer zoom-in excluded. | ⏭️ Intentionally omitted | No arbitrary geometry/style writes. |
| [`render-toolbar.nodes.download`][p72] | Inline record field | Programmatic download excluded. | ⏭️ Intentionally omitted | Native save/download permissions and cross-origin rules are not emulated. |
| [`render-toolbar.nodes.close`][p72] | Inline record field | Persistent native close control. | 🟢 Verified ADAPTED target | Native Escape/cancel and explicit helper cleanup/focus ownership. |

### Explicit source-only supplements

These grouped declarations were absent from the original 77 rows. They retain exact source
identities without expanding private gesture machinery into new public compatibility promises.

| Source item/group · identity | Kind | Native disposition | Status | Boundary |
| --- | --- | --- | --- | --- |
| [`Image.loadDescription`][src-image] | Source-only prop | Unused source prop/automatic loading text omitted. | ⏭️ Intentionally omitted | Author placeholder content explicitly. |
| [`Image/ImagePreview.onPreviewPrev / onPreviewNext`][src-shared] | Shared source callback group | Shared wrapper callback props not reproduced. | ⏭️ Intentionally omitted | Native helper events are explicit, not a prop forwarding layer. |
| [`ImageGroup update-show/update-current aliases and arrays`][src-group] | Source callback alias group | No dual Vue alias/array dispatch. | ⏭️ Intentionally omitted | Actual helper events and imperative current/show instead. |
| [`ImagePreview update-show aliases / onClose arrays`][src-preview] | Source callback alias group | No framework array/controlled-state bridge. | ⏭️ Intentionally omitted | Native close/cancel and helper lifecycle events differ in timing. |
| [`ImagePreview.onPrev / onNext`][src-preview] | Source-only navigation callbacks | Native previous/next controls and helper events. | 🟢 Verified ADAPTED target | Group movement is defined by current eligible anchors. |
| [`ImageInst.click`][src-types] | Deprecated source method alias | Wrapper click alias omitted. | ⏭️ Intentionally omitted | Use controller.open; actual native anchor clicks keep browser policy. |
| [`ImagePreviewInst.setThumbnailEl`][src-types] | Source instance method | Animation-origin thumbnail setter omitted. | ⏭️ Intentionally omitted | No thumbnail transform animation; opener is an explicit native focus target. |
| [`ImageRenderToolbarProps / ImageRenderToolbar / ImageGroupRenderToolbarProps / ImageGroupRenderToolbar`][src-types] | Source render-type alias group | VNode callback/type contracts omitted. | ⏭️ Intentionally omitted | Native template controls are not these framework types. |
| [`ImagePlaceholderSlot / ImageErrorSlot`][src-types] | Source slot-type alias group | VNode-returning type aliases omitted. | ⏭️ Intentionally omitted | Original slot functionality maps to authored native state regions above. |
| [`Image theme / themeOverrides / builtinThemeOverrides`][src-shared] | Source mixed-in owner group | Runtime/provider theme contracts omitted. | ⏭️ Intentionally omitted | External CSS; no geometry style-object bridge. |
| [`ImageGroup theme / themeOverrides / builtinThemeOverrides`][src-shared] | Source mixed-in owner group | Runtime/provider theme contracts omitted. | ⏭️ Intentionally omitted | No hidden app/group provider. |
| [`ImagePreview theme / themeOverrides / builtinThemeOverrides`][src-shared] | Source mixed-in owner group | Runtime/provider theme contracts omitted. | ⏭️ Intentionally omitted | No viewer/tooltip theme dependency. |
| [`ImagePreview.default`][src-preview] | Source-only slot | Original linked image/root content remains authored. | 🟢 Verified ADAPTED target | Owned dialog is additional native content, not replacement of the original source subtree. |

<!-- END PINNED API INVENTORY -->

[api]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md
[src-image]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/Image.tsx
[src-group]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/ImageGroup.tsx
[src-preview]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/ImagePreview.tsx
[src-shared]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/interface.ts
[src-types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/src/public-types.ts
[p29]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L29
[p30]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L30
[p31]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L31
[p32]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L32
[p33]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L33
[p34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L34
[p35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L35
[p36]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L36
[p37]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L37
[p38]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L38
[p39]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L39
[p40]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L40
[p41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L41
[p42]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L42
[p43]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L43
[p44]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L44
[p45]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L45
[p46]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L46
[p52]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L52
[p53]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L53
[p54]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L54
[p55]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L55
[p56]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L56
[p57]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L57
[p58]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L58
[p59]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L59
[p60]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L60
[p61]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L61
[p62]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L62
[p63]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L63
[p64]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L64
[p70]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L70
[p71]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L71
[p72]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L72
[p73]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L73
[p74]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L74
[p75]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L75
[p76]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L76
[p77]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L77
[p78]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L78
[p84]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L84
[p85]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L85
[p91]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L91
[p97]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/image/demos/enUS/index.demo-entry.md#L97
