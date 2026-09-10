# QR Code: resolved exclusion, native destination handoff

**Resolved exclusion / verified native link-and-text alternative.** QR encoding,
generated canvas/SVG, error-correction controls, module colors and logo compositing
remain intentionally omitted. A browser can display an already generated image;
it does **not** provide a general native QR encoder. BarcodeDetector, where supported,
is a decoder, not an encoder, and is not used by this recipe.

There is **no QR helper, Custom Element, package export, source module, dependency,
font, scanner, distribution asset or new budget**. The local
[HTML](../../demo/components/qr-code.html), [CSS](../../demo/components/qr-code.css)
and [tests](../../tests/qr-code.test.ts) demonstrate a real readable destination and
opaque text. No JavaScript is needed. The [complete reference](../naive-ui/components/qr-code.md)
preserves all eleven original identities and adds eight explicit source/type/inherited
omissions; none receives encoder implementation credit.

## The working alternative is not a QR code

The demo includes one native link to the existing [Equation example](../../demo/components/equation.html),
with its exact local destination `equation.html` visible as text. Native mouse/keyboard
activation follows that authored link. It is deliberately a relative local demonstration,
not a portable cross-device QR payload or evidence that any image encodes that destination.

An independent multiline reference remains an original pre/code Text node:

```text
Reference: LOCAL-0042
Desk: North
Note: A & B
```

It is not a URL, href, form field, HTML fragment or instruction to a service. No
automatic linkification, navigation, upload, image generation, download, clipboard
or camera access occurs. Native selection preserves the line breaks and text.
An application must decide whether a payload is an approved destination before
offering a link; arbitrary encoded text is not necessarily a safe or meaningful URL.

The recipe uses a **fixed authored href**, not string concatenation or an unsafe URL
forwarder. Dynamic applications should put opaque values in textContent/Text nodes
and apply their own destination/protocol/origin policy before setting a real link.
This documentation does not introduce a URL validator, markup sanitizer or payload
parser, and does not process untrusted MathML/HTML/SVG strings.

There is **no verified QR image supplied for this scope**, so the demo intentionally
contains no img/canvas/SVG, dummy grid, broken asset reference or “scan me” control.
A plain link is useful without scanning, but it is not called a QR code. No scan,
decoded-payload, contrast, error-correction, logo-safety or quiet-zone measurement of
a QR image has been performed or claimed here.

## Conditional handoff for an application-supplied image

If the application later supplies an authentic asset, it owns both provenance and
correctness. Do not create an img until its approved source exists and has been
independently checked. No placeholder image path or unverified fixture is shipped.

| Application responsibility | Native presentation boundary |
| --- | --- |
| Trusted complete image | Use a native img with an approved source and actual intrinsic width/height, including its verified quiet zone. Loading pixels does not verify their encoded value. |
| Exact payload | Show the intended text separately; provide a link only when the destination is separately approved. Compare actual decoded data with the intended payload, not just a visually similar string. |
| Accessible purpose | Author appropriate alt text and visible explanatory text/link. Retain readable content when the image is absent or fails. Avoid misleading scan instructions; pronunciation/repetition is not universally guaranteed. |
| Quiet zone and module geometry | Preserve the full image and aspect ratio. Do not crop with object-fit:cover, clipping, rounded masks or overlays, or infer a sufficient module quiet zone from arbitrary CSS pixel padding. |
| Color and logo policy | Do not recolor, filter, invert or cover modules and assume the code still scans. Error-correction labels are not a generic allowance for logo area or damage. |
| Display and print sizes | Verify actual target sizes, raster scaling, contrast, device pixel ratios, print output and intended scanners. Native dimensions/CSS cannot promise scan compatibility. |
| Failure and changes | Keep the text/link available independently. If payload or image changes, recheck their agreement and applicable destination policy; this recipe has no automatic generation/update/error callback. |

These are handoff requirements, **not accepted image-generation or scanning features**.
The demo's native details/summary exposes the same responsibilities without JS.
No local/remote encoder, image upload, scanner library or QR rendering service is
silently introduced to make the alternative appear complete.

## Original content, semantics and local CSS

The page uses a real h1, named native sections, an ordinary anchor, code/pre text and
details/summary. No fake button/link/grid/image role, live-region tick, hidden form
value or activation shim is added. Browser Enter activates the link; Space operates
the native disclosure. The recipe has no controller to dispose, rebuild content,
move focus or replace author labels/listeners.

The original payload and Text-node identities stay intact through layout/zoom/
disclosure changes. The reference text has explicit LTR direction inside an RTL
container; this controls its native presentation without reversing stored data.
Source reading order remains unchanged. Native selection is not a QR clipboard
serializer, encoder or binary-payload round-trip guarantee.

Only the demo loads qr-code.css. Its selectors are scoped to #qr-code-example, using
system colors, underlined links, focus outlines, plain borders and wrapping text.
There is no QR-looking CSS pattern, image sizing API, global reset, injected stylesheet
or remote font. Print keeps the visible destination/payload; forced colors retain
native readable text and link differentiation. No motion or geometry script exists.

## Pinned source and omitted contracts

The pinned implementation imports its local qrcodegen.ts encoder, calls encodeText
with the selected correction level and `value ?? '-'`, then draws the resulting
modules on a 2x-size canvas or builds SVG path/image markup. Canvas icon loading and
redraw are reactive; the SVG path uses an innerHTML renderer. Inherited theme props
feed source CSS/theme classes. These are actual source behaviors, not native-browser
encoding facilities.

The bundled encoder has its own version/capacity/segmentation/error-correction
machinery. “No external runtime dependency” does not make copying that substantial
encoder an appropriate native fallback. No part of that implementation is adopted.
The public docs' empty-string default and source nullish `'-'` fallback are recorded,
not recreated as implicit payloads.

All generation/value/type/size/padding/colors/logo/error-correction props stay omitted.
Native text, link or img capabilities are not promoted under those source API names.
The public QrCodeProps/qrCodeProps/NQrCode group, four source behavior groups and three
inherited theme props also remain omissions: **19 rows, zero implemented/adapted QR
API rows, four accepted alternative-resolution tasks**.

Reopening encoding requires a separate approved scope: standards/version/mode/
capacity and invalid-input tests, independent payload decoding, correction/masking/
quiet-zone coverage, real render/scan/print checks, safe content/destination handling,
licensing/provenance, maintenance ownership and an explicit optional payload budget.
No future encoder or scanner is promised by this resolution.

## Acceptance and payload

`pnpm test -- tests\qr-code.test.ts tests\native.test.ts`: **36 tests passed**
(nine QR alternative + 27 native/legacy). `pnpm build` passed declarations and all
existing ceilings. **All 1,316 pre-existing distribution files byte-matched**.
No package, build script, legacy source or P0 foundation row changed.

Observed in a dedicated Chromium tab:

- Zero scripts/images/canvas/SVG; the only initial subresource was local qr-code.css.
  Native AX showed the real named link, headings/regions, code text and disclosure,
  not a fabricated QR image.
- Native Enter followed the link to the existing Equation page; native Space opened
  the handoff disclosure. No synthetic activation, generation or clipboard behavior.
- The exact multiline reference, ampersand, selection, element and Text-node identities
  survived layout changes. Its pre stayed LTR inside the RTL section.
- At a 360px viewport and CSS zoom 200%, page width was 345px including the browser's
  available scroll area, without horizontal page overflow. Text wrapped visibly
  without changing stored newlines or converting it into a link.
- Print retained the visible payload/destination; forced colors retained underlined
  native link text. This is not QR contrast/quiet-zone/scanning evidence.
- A fresh JavaScript-disabled context under default/script/img/font/connect/form
  'none' and style-src 'self' retained text, native disclosure and successful native
  link navigation. Only local HTML/CSS loaded before activation, with no CSP errors.

The local HTML is **2,783 raw / 1,272 gzip** bytes; CSS is **1,008 raw / 471 gzip**:
**1,743 gzip total**, with no JS or library asset. This is alternative usability
evidence only, not encoding, scan compatibility or all-browser/AT certification.

QR Code's exclusion/native handoff is resolved. **Legacy Grid is next**, then
Legacy Transfer separately. Neither is started here. Main P6 retained scopes remain
complete; broad P0 foundations remain parent-owned and pending/partial.
