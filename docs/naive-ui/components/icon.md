# Icon

**Plan: Planned. Current baseline: no dedicated icon component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) supplies no icon package integration.

- **HTML:** authored inline SVG or an image with an explicit accessible name/decorative policy.
- **JS:** none; no icon-library import or framework component constructor.
- **CSS:** size, color and wrapper alignment using external rules.
- **Placement:** proposed `src/components/icon/icon.css`; optional wrapper markup only.

## Acceptance and gaps

Test icon-only buttons, decorative SVG, currentColor, forced colors and inherited size. Consumers provide licensed icon assets; MarkupUI does not fetch them.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P0 authored-content policy and P1 Button accessible naming in the [master plan](../migration-plan.md).
**Next task:** distinguish decorative SVG/image use from standalone icons requiring an accessible name.

1. [ ] **Define authored assets.** Accept native SVG/images already present in HTML; explicitly omit component constructors and icon-package imports.
2. [ ] **Map IconWrapper.** Specify wrapper spacing/background and size/color inheritance independently of the asset.
3. [ ] **Extract icon CSS.** Use currentColor and bounded sizing without injecting fixed SVG styles from JavaScript.
4. [ ] **Validate use contexts.** Test icon-only buttons, decorative duplicates, forced colors and inherited dimensions with no runtime controller.

### Native primitives and fallback

- **Native path:** authored inline SVG or `img`, explicit accessible naming and ordinary wrapper elements. Native template cloning is optional for repeated application-owned assets, not an icon-library loader.
- **Small enhancement:** CSS currentColor, inline-flex and logical sizes handle alignment. No controller or Shadow DOM is needed; preserve a text alternative when an asset cannot load. Optional styling selectors must degrade to classes rather than adding an icon rendering framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/icon)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **9 local table rows + 0 supplementary declarations + 0 inherited rows = 9 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Icon Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L20) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `depth` attribute or JS `depth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L22) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`component`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L23) | Prop | No framework component-prop bag for `component`; use scoped CSS or explicit component configuration. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

### IconWrapper Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`border-radius`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `border-radius`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`icon-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate `icon-color` attribute or JS `iconColor`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Icon Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/icon/demos/enUS/index.demo-entry.md#L38) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
