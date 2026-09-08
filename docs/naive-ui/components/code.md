# Code

**Plan: 🟢 Verified for retained native plain Code; eight explicit engine/transform/private/theme omissions.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) retains legacy mui-code styling.
The native stylesheet is separate, reuses the optional Typography mono-font convention,
and does not import a parser or either component's runtime/styles.

- **HTML:** actual pre/code or inline code, with literal source and optional authored physical-line/token spans.
- **JS:** none in the component or demo; no copy button or clipboard access.
- **CSS:** scoped wrapping, native overflow, fonts and decorative line counters.
- **Placement:** [code.css](../../../src/components/code/code.css), stylesheet export and [native demo](../../../demo/components/code.html); no highlighter import.

## Acceptance and gaps

The [canonical acceptance record](../../components/code.md) reports 528 passing tests
(12 Code cases), build/budget gates and Chromium exact text/selection/CRLF/line geometry/
inline/scroll/RTL/zoom/print/legacy/no-JS evidence. CSS is 1,087 gzip bytes, JS is zero,
and core/plugins remain unchanged. External grammar/highlighter interfaces stay explicitly
excluded; optional token spans are safely authored by the application, never parsed by Code.

## Migration steps

**Delivery phase:** P2 — plain code; highlighters stay in the exclusions lane. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 safe text/external CSS in the [master plan](../migration-plan.md).
**Next task:** Scrollbar (native only), before Float Button/Image interaction scopes. Full P2 is not complete.

1. [x] **Keep code as text.** Native literal source/whitespace, no HTML parsing, execution, trim or URI decoding.
2. [x] **Extract code presentation.** Native scrolling/wrapping/fonts and authored physical-line counters, preserving trailing empty lines.
3. [x] **Bound optional actions.** No undocumented copy/clipboard feature; token markup remains application-owned.
4. [x] **Verify exclusion and safety.** Literal tags, Unicode/CRLF/selection, line geometry and no-JS checked without touching the clipboard; grammar interfaces excluded.

### Native primitives and fallback

- **Native path:** authored pre/code, ordinary textContent for explicit dynamic replacement, and CSS. No helper is added merely to wrap textContent.
- **Small enhancement:** author/server-supplied physical-line spans with empty aria-hidden number nodes and CSS counters. Native selection, scrolling and plain-flow/no-JS behavior remain; no parser, controller, clipboard side effect or lifecycle is needed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/code)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 original local table rows + 7 explicit source-only supplements + 0 inherited rows = 14 tracker rows**.
Every original identity remains: **6 Verified ADAPTED native targets and 8 Intentionally
omitted contracts**. Code and its stylesheet were reviewed. The external hljs interface
is an opaque exclusion, not recursively expanded into a third-party API migration.
Source plain fallback does not apply trim; line counts originate from the untransformed
prop and omit a final number after terminal LF. Native differences are explicit below.


### Code Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`code`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L50) | Prop | Authored native code text or explicit textContent assignment; no attribute renderer. | 🟢 Verified ADAPTED target | Literal tags/Unicode/tabs/CRLF preserved; native assignment intentionally replaces children, not a rich-node-preserving helper. |
| [`hljs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L51) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L52) | Prop | Native inline code versus pre > code block anatomy. | 🟢 Verified ADAPTED target | No inline attribute parser or invalid code > pre structure; no numbers/focus stop on inline text. |
| [`language`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L53) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`show-line-numbers`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L54) | Prop | data-line-numbers decorates authored physical-line spans; off for inline or data-word-wrap. | 🟢 Verified ADAPTED target | Empty aria-hidden counter nodes do not contaminate source; CRLF, final blank line and native selected text verified. No automatic line splitter. |
| [`trim`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L55) | Prop | No automatic transformation; author source explicitly. | ⏭️ Intentionally omitted | Plain text stays verbatim. Source trim only participates in successful highlighted output, which is excluded. |
| [`word-wrap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md#L56) | Prop | Presence data-word-wrap on pre; otherwise native preformatted horizontal scrolling. | 🟢 Verified ADAPTED target | Long text wraps without changing physical-line markup; numbers are suppressed rather than misnumbering soft wraps. |

### Explicit source-only supplements

These seven entries supplement the original public table. Source has no Copy API/button
or public size presets. Private Log/URI/theme behavior is not silently reproduced.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`uri`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/Code.tsx) | Source-only prop | No automatic URI decoding. | ⏭️ Intentionally omitted | Encoded text remains literal; application decoding/error policy is explicit. |
| [`internalFontSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/Code.tsx) | Source-only internal numeric prop | External --mui-code-font-size CSS length, not a numeric JS setter. | 🟢 Verified ADAPTED target | Native 15px override and optional Typography mono token checked; no invented size presets. |
| [`internalNoHighlight`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/Code.tsx) | Source-only internal mode | No private Log/style-mount integration switch. | ⏭️ Intentionally omitted | This entry always provides plain/native display, not another framework execution mode. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/Code.tsx) | Source-only slot | Safely authored code/line/token nodes. | 🟢 Verified ADAPTED target | Source slot bypasses setCode; native nodes/listeners remain untouched by CSS. Application token markup is not generated from untrusted HTML. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Code prop | External CSS instead of a theme/provider object. | ⏭️ Intentionally omitted | No theme evaluator or generated CSS-in-JS. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Code prop | CSS tokens, not object merging. | ⏭️ Intentionally omitted | Native cascade; no external highlighter theme contract. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Code prop | No built-in override object. | ⏭️ Intentionally omitted | Scoped native presentation; zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
