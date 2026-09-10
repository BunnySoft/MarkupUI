# QR Code default-style audit

**2026-09-11 — not applicable: the encoder/rendered component is intentionally absent.**
No source, stylesheet, package entry, generated asset, dependency or budget was added or
changed. This audit records the existing exclusion and native handoff boundary.

## Reference and classification

Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` owns generated canvas/SVG geometry,
module/background colors, padding, sizing, logo composition and theme integration.

MarkupUI intentionally has no QR encoder or rendered QR component. Its documented
alternative is readable opaque text plus a fixed approved native link, and a conditional
handoff for an independently verified application-supplied image. The demo's local CSS
styles that explanatory native content; it is not a QR component stylesheet.

The default-style result is therefore **⏭️ Not applicable**, not Matched: no MarkupUI
QR symbol exists whose module geometry, quiet zone, colors or dimensions can be compared.

## Preserved boundary

- No `@dataengine/markup-ui/qr-code` export or `mui-qr-code` registration exists.
- No encoder, scanner, canvas/SVG renderer, generated image or QR CSS bundle exists.
- No visual approximation, fake module grid or unverified asset is introduced.
- Readable text/link presentation remains application-owned and is not promoted as QR
  compatibility.
- Future supplied images retain application responsibility for payload, quiet zone,
  intrinsic dimensions, contrast, print and scanner verification.

Creating default QR-looking CSS without a verified encoded symbol would be misleading
and would not implement the source's visual contract.

## Validation

All **9 QR Code tests** pass, covering the honest native alternative and absence of
generation/rendering surfaces. No component CSS size measurement applies. Full native
integration remains part of the parent final pass.
