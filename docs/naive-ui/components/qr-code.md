# QR Code

**Resolved exclusion / verified native handoff alternative.** QR encoding and all
generation/rendering controls remain intentionally omitted. A real plain link and
opaque text are accepted alternatives, not QR symbols or scan verification.

## Baseline and resolution

The unchanged [registry](../../../src/components/elements.ts) has no QR encoder.
The [canonical contract/evidence](../../components/qr-code.md),
[default-style audit](../../style-audit/components/qr-code.md),
[local HTML](../../../demo/components/qr-code.html), [local CSS](../../../demo/components/qr-code.css)
and [tests](../../../tests/qr-code.test.ts) preserve a fixed native destination and
original multiline text, without JS or a new runtime/export/bundle.
No verified QR fixture is supplied for this scope: no image, fake grid, broken
reference, canvas/SVG, camera/upload flow or scan claim appears in the demo.

Reviewed the pinned [public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L21-L35),
[component](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx),
[public exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/index.ts#L1-L2)
and the [local encoder boundary](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/qrcodegen.ts#L27-L60).
Native image display is not that encoder. BarcodeDetector is a decoder where
available, never a substitute native encoding API.

## Migration steps

**Delivery lane:** deferred/exclusions — built-in encoding omitted.
**Task state:** resolved exclusion / 🟢 Verified native alternative.
**Prerequisites:** native authored content/links and zero-dependency policy; broader
P0 foundation rows remain parent-owned, unchanged and pending/partial.
**Next task:** Legacy Grid exclusion/replacement resolution, separately.

1. [x] **Record encoder exclusions.** Encoding, correction/masking, generated
   canvas/SVG, colors/logo composition and remote QR services remain out of scope.
2. [x] **Define honest native handoff.** Working fixed native link/text fallback;
   conditional trusted-image dimensions/alt/quiet-zone/payload responsibilities.
3. [x] **Document future feasibility gates.** Reopening requires independent
   standards/capacity/decoding/rendering checks, provenance and an approved budget.
4. [x] **Verify the actual alternative.** Native text/link/disclosure/selection/
   no-JS/CSP/media plus tests/build; no supplied-image scan or encoder credit claimed.

### Native primitives and fallback

Use original readable text and a native anchor only for an approved destination.
Opaque values stay Text nodes, not automatic hrefs/HTML. An authentic application-
supplied image is optional future handoff: the application must verify decoded data,
preserve its full quiet zone and verify target sizes/scanners. No img is authored
without an existing trusted asset. No helper, Custom Element, encoder/scanner,
polyfill, font, upload or rendering service is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/qr-code)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **11 original public rows + one grouped type/export supplement +
four source-behavior supplements + three inherited theme rows = 19 tracker rows**.
All eleven original identities/source links remain one-for-one.
**Zero implemented/adapted QR API rows; 19 intentional omissions.** Four accepted
alternative tasks do not imply generation, error-correction or scanning parity.

### QR Code Props

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`background-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L25) | Prop | No generated QR background/color transform. A future supplied asset keeps its independently verified colors. | ⏭️ Intentionally omitted |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L26) | Prop | No module coloring or contrast/scan certification. Native text CSS is not QR rendering. | ⏭️ Intentionally omitted |
| [`error-correction-level`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L27) | Prop | No L/M/Q/H encoding control, correction engine or damage/logo tolerance promise. | ⏭️ Intentionally omitted |
| [`icon-border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L28) | Prop | No QR logo mask/background geometry. Do not clip verified image data to imitate this option. | ⏭️ Intentionally omitted |
| [`icon-background-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L29) | Prop | No color panel covering generated modules. | ⏭️ Intentionally omitted |
| [`icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L30) | Prop | No logo compositing or safe-overlay-size guarantee. | ⏭️ Intentionally omitted |
| [`icon-src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L31) | Prop | No image loading/embedding into a QR symbol or arbitrary URL forwarding. A supplied complete QR asset is a different application handoff. | ⏭️ Intentionally omitted |
| [`padding`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L32) | Prop | No QR padding API; arbitrary CSS pixels are not proof of a module quiet zone. Preserve a future asset's full verified extent. | ⏭️ Intentionally omitted |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L33) | Prop | No text-to-QR conversion. Native readable text/fixed approved link remains an alternative, not an encoded value. | ⏭️ Intentionally omitted |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L34) | Prop | No generated-symbol sizing/module rasterization. Future intrinsic image dimensions do not establish scan compatibility. | ⏭️ Intentionally omitted |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L35) | Prop | No canvas/SVG renderer choice, path generator or serialization API. | ⏭️ Intentionally omitted |

### Explicit grouped public type/export supplement

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`QrCodeProps / qrCodeProps / NQrCode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/index.ts#L1-L2) | Source type/export group | No Vue prop extractor, factory/type export or fake native alias. | ⏭️ Intentionally omitted |

### Explicit source-behavior supplements

These four groups are implementation observations, not additional public APIs.

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`encodeText / correction lookup / nullish value fallback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx#L94-L101) | Source behavior | No bundled qrcodegen call, correction lookup or value ?? '-' coercion. Source docs' empty default is not silently mapped to a native payload. | ⏭️ Intentionally omitted |
| [`drawCanvas / 2x raster / logo composition`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx#L147-L206) | Source behavior | No module drawing, retina-size raster or centered image/background overlay. Existing canvas APIs are not an encoder. | ⏭️ Intentionally omitted |
| [`generatePath / svgInfo / innerHTML`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx#L208-L356) | Source behavior | No module-to-path/embedded-image strings, generated SVG or HTML renderer. | ⏭️ Intentionally omitted |
| [`icon loading watchEffect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx#L126-L144) | Source behavior | No reactive image loading, cancellation/redraw lifecycle or image upload/scanner flow. | ⏭️ Intentionally omitted |

### Explicit source-inherited theme props

The [source spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/src/QrCode.tsx#L21)
adds three inherited identities.

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No theme/provider graph or generated QR stylesheet. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No CSS-in-JS theme merge or encoded-image recoloring. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal override precedence; broad P0/legacy exceptions stay separate. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

## Acceptance and remaining work

**36 tests passed** (nine QR alternative + 27 native/legacy), declarations/build and
all budgets. **1,316 existing distribution files byte-matched**; no source/package/
build/P0 foundation change. Complete local HTML+CSS is **1,743 gzip bytes**, no JS.

Chromium verified native link activation to a real local page, exact text/selection/
identity, native AX names/disclosure, RTL/200% zoom/narrow/forced-colors/print and
JavaScript-disabled strict CSP with only local HTML/CSS. No QR image was supplied,
rendered, encoded or decoded; no scan, error-correction, logo or all-browser/AT claim.

QR Code's native handoff alternative is resolved. **Legacy Grid is next**, followed
separately by Legacy Transfer. Both acceptance lanes and broad parent-owned P0
foundation work remain pending; no next component is implemented here.
