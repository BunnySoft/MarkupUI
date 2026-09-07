# Equation

**Plan: Intentionally omitted for TeX typesetting. Current baseline: no equation renderer.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no math component or KaTeX integration.

- **HTML:** application-authored MathML, a labelled image, or readable formula text.
- **JS:** no TeX parser, no automatic dependency import.
- **CSS:** optional external equation container styling.
- **Placement:** no core renderer; any future independent encoder requires a new scoped proposal.

## Acceptance and gaps

Check accessible alternatives and MathML browser support for chosen content. KaTeX options and expression-to-typesetting parity are deliberately excluded, not unfinished implementation.

## Migration steps

**Delivery lane:** deferred/exclusions — no TeX renderer. **Task state:** 🔵 Planned for alternative documentation; API disposition ⏭️ Intentionally omitted.
**Prerequisites:** P0 zero-dependency/content policy in the [master plan](../migration-plan.md).
**Next task:** record MathML, labelled-image and readable-text alternatives for each expression/typesetter API row.

1. [ ] **Confirm omitted scope.** Keep TeX parsing, KaTeX configuration and automatic typesetting outside every runtime bundle.
2. [ ] **Author an accessible alternative.** Demonstrate native MathML or a labelled image with equivalent readable formula content.
3. [ ] **Define minimal presentation.** Document optional external container CSS without implying expression conversion.
4. [ ] **Review alternative support.** Check browser/assistive behavior and ensure omitted rows receive no implementation-completion credit.

### Native primitives and fallback

- **Native path:** application-authored MathML, a labelled native image, or readable formula text. Optional native templates may repeat already-authored formulas; they do not parse TeX.
- **Small enhancement:** none is required. Assess MathML rendering/assistive support for the target browsers and keep equivalent text/image output when unsuitable. External CSS supplies spacing only. No custom element, Shadow DOM math renderer, KaTeX import or typesetting polyfill is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/equation)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **3 local table rows + 0 supplementary declarations + 0 inherited rows = 3 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Equation Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`katex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L46) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`katex-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L47) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L48) | Prop | Use application-authored accessible content; no built-in encoder/typesetter. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |

<!-- END PINNED API INVENTORY -->
