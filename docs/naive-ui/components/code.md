# Code

**Plan: Planned for plain code; syntax-highlighting engine intentionally omitted. Current baseline: code styling only.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) styles `mui-code`; no language parser exists.

- **HTML:** native `pre`/`code`; untrusted source inserted as text.
- **JS:** none for display; optional copy action must report permission failures.
- **CSS:** external wrapping, scrolling and line-number presentation.
- **Placement:** proposed `src/components/code/`; no highlight.js import.

## Acceptance and gaps

Test literal HTML, long lines, copying and selectable text. Language grammar/highlighter configuration is outside the zero-dependency contract; consumers may supply already-authored highlighted markup safely.

## Migration steps

**Delivery phase:** P2 — plain code; highlighters stay in the exclusions lane. **Task state:** 🔵 Planned for retained display.
**Prerequisites:** P0 safe text/external CSS in the [master plan](../migration-plan.md).
**Next task:** define native pre/code display and explicitly exclude language-engine configuration.

1. [ ] **Keep code as text.** Preserve literal source, whitespace and selection without parsing code strings as HTML.
2. [ ] **Extract code presentation.** Resolve wrapping, overflow, typography and optional line-number styling in CSS.
3. [ ] **Bound optional actions.** Add a copy action only with permission/failure feedback; accept pre-authored marks without loading a highlighter.
4. [ ] **Verify exclusion and safety.** Test literal tags, long lines, copy fidelity and no-JS rendering; leave grammar/highlighter rows intentionally omitted.

### Native primitives and fallback

- **Native path:** authored `pre`/`code`, textContent for dynamic source, and ordinary overflow/wrapping CSS. No custom element or template parser is required to display code.
- **Small enhancement:** an optional copy button feature-detects Clipboard API/permission and otherwise leaves selectable text with manual-copy guidance. Cleanup belongs to the button controller. CSS-only line treatment remains usable without scripting; missing highlighting is an intentional scope reduction, not a highlighter dependency fallback.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/code)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Code Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`code`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate `code` attribute or JS `code`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`hljs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L51) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L52) | Prop | External CSS token/class for `inline`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`language`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L53) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`show-line-numbers`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate live JS `showLineNumbers` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trim`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate presence attribute `trim`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`word-wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate presence attribute `word-wrap`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
