# QR Code

**Plan: Intentionally omitted for built-in encoding. Current baseline: no QR encoder.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) contains no QR component.

- **HTML:** application-provided QR image plus an equivalent readable/clickable value.
- **JS:** no QR dependency or hidden remote rendering service.
- **CSS:** quiet-zone-preserving image layout.
- **Placement:** no core encoder; a future zero-dependency encoder would need an independent optional budget and standards tests.

## Acceptance and gaps

Check alternative links, contrast, quiet zones and decoding of supplied images. Error correction, capacity, encoding and icon-overlay safety are deliberately not promised.

## Migration steps

**Delivery lane:** deferred/exclusions — no built-in encoder. **Task state:** 🔵 Planned for alternatives; API disposition ⏭️ Intentionally omitted.
**Prerequisites:** P0 zero-dependency policy and native-image accessibility in the [master plan](../migration-plan.md).
**Next task:** document an application-provided QR image with an equivalent readable/clickable value.

1. [ ] **Record encoder exclusions.** Keep QR encoding, error-correction controls and remote QR services outside the component runtime.
2. [ ] **Define supplied-image markup.** Preserve quiet zones, meaningful alternatives and native image dimensions.
3. [ ] **Document future feasibility gates.** Require standards/capacity tests and an independent optional budget before reopening encoder scope.
4. [ ] **Check supplied assets.** Verify contrast, quiet zones, alternative links and actual decoding without counting rendering as encoding parity.

### Native primitives and fallback

- **Native path:** a supplied native image plus a readable equivalent link/value; optional templates repeat supplied markup only.
- **Small enhancement:** CSS preserves dimensions/quiet zones, and normal alternative text handles image failure. Browsers do not supply a general QR encoder; feature detection cannot manufacture one. Keep encoding out of scope instead of importing a QR library, remote rendering service or custom encoder disguised as a polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/qr-code)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **11 local table rows + 0 supplementary declarations + 0 inherited rows = 11 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### QR Code Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`background-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L25) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L26) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`error-correction-level`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L27) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`icon-border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L28) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`icon-background-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L29) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L30) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`icon-src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L31) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`padding`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L32) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L33) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L34) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/qr-code/demos/enUS/index.demo-entry.md#L35) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

<!-- END PINNED API INVENTORY -->
