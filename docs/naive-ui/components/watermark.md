# Watermark

**🟢 Verified retained native decorative tile scope.** One bounded Canvas PNG and one
authored pointer-transparent overlay; no per-stamp DOM grid, remote renderer, watermark
package, provider, anti-tamper observer or security/DRM claim.

## Baseline, target and evidence

The [legacy registry](../../../src/components/elements.ts) has no dedicated watermark.
Its existing behavior remains unchanged; the new helper is separately opt-in.

- **HTML:** original content/controls/labels plus one empty decorative hidden overlay.
  Important classifications are separately available in ordinary text.
- **JS:** [controller](../../../src/components/watermark/watermark.ts) validates native
  inputs and bounds, generates a Canvas tile and guards asynchronous image/PNG jobs.
- **CSS:** [external stylesheet](../../../src/components/watermark/watermark.css) owns
  placement, repetition, pointer transparency and media policy. The application must
  already position a local wrapper; no existing containing block is silently changed.
- **Evidence:** [canonical contract/acceptance](../../components/watermark.md),
  [tests](../../../tests/watermark.test.ts), [local demo](../../../demo/components/watermark.html).

The pinned [props and defaults](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/src/Watermark.tsx#L27-L112),
[generation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/src/Watermark.tsx#L129-L249)
and [overlay renderer](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/src/Watermark.tsx#L250-L304)
were reviewed. Native image URL/CORS choices remain caller-owned rather than silently
creating source-style image requests. Source whole-layer rotation, selection suppression
and theme/provider behavior are deliberately omitted. Native pixels are not automatically
themed and do not guarantee coverage of scrollHeight, top-layer content or printed pages.

## Migration steps

**Delivery phase:** P6 — specialized. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** explicit optional assets, native decorative ownership, bounded Canvas/
image/CSP contracts; broader P0 foundation tasks remain independently open/partial.
**Next task:** Upload (P6-02), separately; no Upload implementation is included here.

1. [x] **Define decorative ownership.** Preserve content/nodes/ARIA/forms/listeners,
   pointer selection and focus; require an authored positioned local wrapper.
2. [x] **Resolve tile inputs.** Literal multiline text, native images, font/rotation/
   spacing/phase/cross/opacity/debug, validation and explicit origin/CORS limitations.
3. [x] **Isolate generation.** Bounded Canvas PNG/Blob URL, generation/abort guards,
   previous-valid loading/error behavior, native ratio events and owned resource release.
4. [x] **Test robustness.** Native pixels/repeat/races/error/coverage/HiDPI/media/CSP/
   no-JS/legacy acceptance, exact property dispositions and independent asset budgets.

### Native primitives and fallback

Native Canvas generates a bounded off-DOM tile; external CSS repeats it on one empty
`div[data-watermark-overlay][aria-hidden=true]`. No custom-element registration or
application renderer is installed. Missing Canvas/Blob facilities produce a reported
error and leave decoration hidden (or retain a previous valid tile), never fake success.
No-JS keeps the overlay hidden and content intact. A child-list observer only disconnects
removed owners; it never recreates a removed watermark. Native resize/resolution events
update automatic DPR; normal container resizing only repeats the existing CSS background.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/watermark)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark)
- [Catalog and provenance](../index.md) · [Architecture and statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **27 original local table rows + one explicit source supplement + three
source-inherited theme rows = 31 tracker rows**. All original identities and links
remain one-for-one. **26 native adaptations + five intentional omissions; zero unresolved.**
Verified means the documented bounded target, not unbounded renderer/framework parity
or all-browser/AT/native-font/print guarantees.

### Watermark Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / explicit scope |
| --- | --- | --- | --- | --- |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L23) | Prop | Literal content option; native multiline Canvas fillText. | 🟢 Verified | At most 2048 UTF-16 units/16 LF lines; no HTML/SVG interpolation. Empty text without image clears explicitly. |
| [`cross`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L24) | Prop | Second periodic stamp at half tile pitch on each axis. | 🟢 Verified | Deliberately half pitch, not source half mark width/height; constant Canvas calls, one DOM overlay. |
| [`debug`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L25) | Prop | Native tile/mark border strokes. | 🟢 Verified | Same tile and bounded memory, not a per-cell DOM debug grid. |
| [`font-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L26) | Prop | fontSize in layout CSS px, 14 default. | 🟢 Verified | 1..256; native metrics and rotated-fit checks before encoding. |
| [`font-family`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L27) | Prop | One simple named/generic family, sans-serif default. | 🟢 Verified | No arbitrary shorthand/quoted list/URL injection or font fetching; browser fallback fonts remain native. |
| [`font-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L28) | Prop | normal/italic/oblique Canvas font style. | 🟢 Verified | Source numeric oblique-angle syntax is outside the retained subset. |
| [`font-variant`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L29) | Prop | normal/small-caps native font shorthand. | 🟢 Verified | Arbitrary variant grammar and renderer passthrough omitted. |
| [`font-weight`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L30) | Prop | 100..900 in 100-step weights, 400 default. | 🟢 Verified | Actual native font availability/weight synthesis is browser-owned. |
| [`font-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L31) | Prop | Validated bounded hex/basic named/rgb/rgba grammar; source RGBA default retained. | 🟢 Verified | Native setter rejection surfaces; no currentColor/var/wide-gamut or automatic theme sampling. |
| [`fullscreen`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L32) | Prop | External fixed overlay on a direct-body native root. | 🟢 Verified | Rejects transformed/filtered/contained ancestors; no portal, top-layer or browser-chrome coverage claim. |
| [`global-rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L33) | Prop | No rotated whole-layer/oversized viewport wrapper. | ⏭️ Intentionally omitted | rotate changes each mark, not the repeating lattice; no false universal rotated coverage. |
| [`line-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L34) | Prop | lineHeight baseline advance in CSS px; 20 default. | 🟢 Verified | Deliberately roomier than source 14; bounded 1..512, actual multiline metrics. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L35) | Prop | Mark height, 80 default; pitch adds yGap. | 🟢 Verified | 1..1024 CSS px; not the root/content height; rotated overflow reports error. |
| [`image`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L36) | Prop | Caller-owned native HTMLImageElement or explicit loadImage callback. | 🟢 Verified | URL-string API omitted; no helper fetch/credential mutation. Decode/taint/security failures surface and retain the prior valid tile. |
| [`image-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L37) | Prop | Explicit imageHeight; one dimension preserves intrinsic aspect. | 🟢 Verified | Missing both fits down into the mark; both dimensions explicitly permit stretching. |
| [`image-opacity`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L38) | Prop | imageOpacity 0..1; native Canvas alpha. | 🟢 Verified | Additional overall opacity option applies to the completed overlay. |
| [`image-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L39) | Prop | Explicit imageWidth in CSS px. | 🟢 Verified | Image dimension/area and rotated mark fit are independently bounded. |
| [`rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L40) | Prop | Static native rotation around each mark's center, -360..360 degrees. | 🟢 Verified | Deliberate centered rotation/fit contract, not source origin-clipped drawing or an animation. |
| [`selectable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L41) | Prop | No selection/copy suppression switch. | ⏭️ Intentionally omitted | Selection always remains native; decoration is not access control. |
| [`text-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L42) | Prop | left/center/right multiline alignment within the measured text block. | 🟢 Verified | Literal measured block is centered in the mark; physical alignment independent of root RTL. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L43) | Prop | Mark width, 160 default; pitch adds xGap. | 🟢 Verified | 1..1024 CSS px; roomier than source 32; not a content wrapper dimension. |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L44) | Prop | xGap 0..1024 CSS px; 40 default. | 🟢 Verified | Explicit tile pitch, repeated by CSS rather than DOM stamps. |
| [`x-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L45) | Prop | Physical horizontal repeat-phase offset, -100000..100000px. | 🟢 Verified | Deliberate CSS background phase, not clipping text inside its canvas. |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L46) | Prop | yGap 0..1024 CSS px; 40 default. | 🟢 Verified | Both pitch axes are explicit; automatic DPR does not change CSS spacing. |
| [`y-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L47) | Prop | Physical vertical repeat-phase offset. | 🟢 Verified | Same bounded safe geometry policy as xOffset. |
| [`z-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L48) | Prop | Bounded integer zIndex, 10 default; external CSS consumes a numeric property. | 🟢 Verified | Native stacking contexts and top-layer limits remain, no always-on-top guarantee. |

### Watermark Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / explicit scope |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L54) | Slot | Original authored native content. | 🟢 Verified | No reconstruction, wrapper insertion, field proxies or altered content ARIA/listeners. |

### Explicit source supplement

This one prop exists in source, not the pinned English API table.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / explicit scope |
| --- | --- | --- | --- | --- |
| [`fontStretch`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/src/Watermark.tsx#L100-L103) | Source prop | Native Canvas fontStretch keyword subset, normal default. | 🟢 Verified | Non-normal stretch errors if the Canvas property is unavailable; no arbitrary shorthand. |

### Explicit source-inherited theme props

These three source-inherited rows come from the
[useTheme.props spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/src/Watermark.tsx#L28).

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / explicit scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No injected theme graph/provider. | ⏭️ Intentionally omitted | Explicit pixel font/color settings; external overlay CSS. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No theme override object or runtime style rules. | ⏭️ Intentionally omitted | Native generated pixels require an explicit new generation to change colors/fonts. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No private theme merge/precedence bag. | ⏭️ Intentionally omitted | Legacy theme APIs and P0 exceptions remain separate. |

<!-- END PINNED API INVENTORY -->
