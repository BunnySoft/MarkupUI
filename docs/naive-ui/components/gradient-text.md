# Gradient Text

**Plan: Planned. Current baseline: no dedicated component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no gradient-text component.

- **HTML:** ordinary text within a semantic element.
- **JS:** none.
- **CSS:** external gradient/background clipping with solid-color fallback and scoped tokens.
- **Placement:** proposed `src/components/gradient-text/gradient-text.css`.

## Acceptance and gaps

Check contrast, forced colors, printing, unsupported clipping and text selection. Gradient configuration maps to CSS rather than a runtime color/style engine.

## Migration steps

**Delivery phase:** P2 — text presentation. **Task state:** 🔵 Planned.
**Prerequisites:** P0 stylesheet/theme-token conventions in the [master plan](../migration-plan.md).
**Next task:** define a solid readable fallback before applying gradient clipping.

1. [ ] **Choose text anatomy.** Keep semantic text/heading markup; do not introduce a generated renderer for decorative text.
2. [ ] **Map gradient options.** Resolve color/type/size fields into scoped CSS tokens and classes with a bounded public vocabulary.
3. [ ] **Implement CSS fallbacks.** Restore solid text in forced colors, printing and unsupported background-clipping environments.
4. [ ] **Check readability.** Test contrast, selection, zoom and inherited typography without any JavaScript import.

### Native primitives and fallback

- **Native path:** an ordinary semantic text element and external CSS gradient/background clipping; no custom element, template cloning or controller is required.
- **Small enhancement:** guard clipping with `@supports`, keep a solid readable color, and restore it in forced-colors/print contexts. Native CSS inheritance supplies sizing and direction; lack of gradient support reduces decoration rather than triggering a renderer/polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/gradient-text)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **4 local table rows + 3 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### GradientText Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`gradient`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate JS `gradient` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L20) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### GradientText Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L27) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### GradientText Props: gradient inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`gradient.from`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`gradient.to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`gradient.deg`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/gradient-text/demos/enUS/index.demo-entry.md#L19) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
