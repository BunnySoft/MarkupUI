# Highlight

**Plan: Planned. Current baseline: no text-match highlighter identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no highlight component.

- **HTML:** text nodes with native `mark` around matched ranges.
- **JS:** optional literal matching with explicit case/overlap rules; preserve text and never parse it as HTML.
- **CSS:** external mark color and contrast.
- **Placement:** proposed `src/optional/highlight/`; not a syntax-highlighting engine.

## Acceptance and gaps

Test repeated/overlapping patterns, Unicode, empty patterns, escaping and live updates. Regex or locale-sensitive expansion requires separate scope.

## Migration steps

**Delivery phase:** P2 — text enhancement. **Task state:** 🔵 Planned.
**Prerequisites:** P0 safe text handling and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** choose literal matching semantics for repeated, overlapping and case-sensitive patterns.

1. [ ] **Preserve source text.** Wrap only matched text ranges in native mark elements; never treat input text as HTML.
2. [ ] **Define match updates.** Resolve empty patterns, overlap precedence and changes without destroying unrelated authored nodes.
3. [ ] **Extract mark styling.** Use external contrast-safe highlights and keep plain text readable without CSS.
4. [ ] **Test text boundaries.** Cover Unicode, repeated patterns, literal regex characters, escaped markup and live updates; defer language parsing.

### Native primitives and fallback

- **Native path:** text nodes and native `mark` elements represent literal matches; use explicit DOM ranges/node splitting rather than evaluating a template or injecting HTML.
- **Small enhancement:** a small optional custom element updates matches and cleans owned listeners when needed. CSS styles marks, with readable unhighlighted text as fallback. Any advanced native text-highlighting capability must be feature-detected; lack of support reduces decoration rather than requiring a syntax/highlight polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/highlight)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Highlight Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`auto-escape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate presence attribute `auto-escape`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`case-sensitive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate presence attribute `case-sensitive`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`highlight-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate `highlight-class` attribute or JS `highlightClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`highlight-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L25) | Prop | External CSS class/custom property for `highlight-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`highlight-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `highlight-tag` attribute or JS `highlightTag`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`patterns`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate JS `patterns` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `text` attribute or JS `text`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
