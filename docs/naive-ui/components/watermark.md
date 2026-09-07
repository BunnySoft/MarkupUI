# Watermark

**Plan: Planned. Current baseline: no dedicated component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no watermark component.

- **HTML:** content remains readable and interactive; watermark is decorative.
- **JS:** optional local SVG/canvas tile generation from text or a permitted image, never remote dependencies.
- **CSS:** overlay positioning, repetition and opacity.
- **Placement:** proposed `src/optional/watermark/`; not core.

## Acceptance and gaps

Test pointer transparency, resize, image failures, print behavior and content contrast. A watermark is not access control or tamper protection; persistence and image-origin handling need explicit scope.

## Migration steps

**Delivery phase:** P6 — specialized. **Task state:** 🔵 Planned.
**Prerequisites:** P0 safe-image/CSP policy and an independent optional budget in the [master plan](../migration-plan.md).
**Next task:** choose authored-image versus locally generated text tiles and document that watermarks are not access control.

1. [ ] **Define decorative ownership.** Keep the overlay outside reading/focus order and preserve underlying pointer interaction.
2. [ ] **Resolve tile inputs.** Specify text, image, repetition, rotation and image-origin handling without remote rendering services.
3. [ ] **Isolate generation.** If needed, implement local canvas/SVG tile creation separately from external overlay CSS and dispose generated URLs.
4. [ ] **Test robustness.** Cover resize, image failure, printing, content contrast and CSP restrictions before accepting generation-heavy rows.

### Native primitives and fallback

- **Native path:** an authored decorative image/background with readable underlying content is the baseline. Optional local SVG/canvas generation belongs to an independently loaded custom-element controller.
- **Small enhancement:** feature-detect the chosen drawing/observer capabilities; use a supplied static image or omit decoration when unsupported. CSS positioning/pointer-events own the overlay, while lifecycle cleanup releases observers and generated object URLs. No anti-tamper observer framework or remote rendering fallback is proposed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/watermark)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **27 local table rows + 0 supplementary declarations + 0 inherited rows = 27 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Watermark Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `content` attribute or JS `content`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`cross`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate presence attribute `cross`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`debug`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate presence attribute `debug`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`font-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS token/class for `font-size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`font-family`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `font-family` attribute or JS `fontFamily`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`font-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L28) | Prop | External CSS class/custom property for `font-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`font-variant`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `font-variant` attribute or JS `fontVariant`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`font-weight`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `font-weight`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`font-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `font-color` attribute or JS `fontColor`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`fullscreen`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `fullscreen`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`global-rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `global-rotate` attribute or JS `globalRotate`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`line-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `line-height` attribute or JS `lineHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS token/class for `height`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`image`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `image` attribute or JS `image`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`image-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `image-height` attribute or JS `imageHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`image-opacity`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `image-opacity` attribute or JS `imageOpacity`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`image-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate `image-width` attribute or JS `imageWidth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rotate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate `rotate` attribute or JS `rotate`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`selectable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate presence attribute `selectable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`text-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L42) | Prop | External CSS token/class for `text-align`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L43) | Prop | External CSS token/class for `width`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L44) | Prop | External CSS token/class for `x-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`x-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `x-offset` attribute or JS `xOffset`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L46) | Prop | External CSS token/class for `y-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`y-offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate `y-offset` attribute or JS `yOffset`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`z-index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate `z-index` attribute or JS `zIndex`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Watermark Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/watermark/demos/enUS/index.demo-entry.md#L54) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
