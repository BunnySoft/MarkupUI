# Highlight

**Plan: 🟢 Verified for bounded literal matching; two full-row omissions plus an explicit raw-regexp-mode exclusion.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) still has no Highlight element.
The accepted implementation is an optional stateless helper, not a new custom-element controller.

- **HTML:** native text/mark nodes inside an explicitly owned HTML span.
- **JS:** bounded literal matching with case/overlap/UTF-16 rules, immutable input handling and explicit updates; no HTML parsing.
- **CSS:** independent mark colors, whitespace/wrapping, forced-color and print rules.
- **Placement:** [helper source](../../../src/components/highlight/highlight.ts), [CSS](../../../src/components/highlight/highlight.css), ESM/classic helpers and [native demo](../../../demo/components/highlight.html); not Code syntax highlighting.

## Acceptance and gaps

The historical [canonical acceptance record](../../components/highlight.md) reports 494 passing tests
(27 Highlight cases), build/budget gates and Chromium matching/selection/ownership/hidden/
RTL/narrow/zoom/print/forced-colors/module/classic/coexistence/no-JS evidence.
ESM/classic/CSS were 1,169/1,401/345 gzip bytes at that checkpoint; core and other bundles
were unchanged.
Arbitrary regex, locale/full case expansion, rich-child preservation and tag/style render
contracts are intentionally outside the retained scope.

The [new default-style audit](../../style-audit/components/highlight.md) verifies that the
pinned Highlight has no injected component stylesheet/theme. Native mark colors and zero
radius now replace the old pale-yellow/inherited-color/rounded defaults. Typography and
padding already matched. A bare helper target retains default whitespace; the optional
`mui-highlight` class still explicitly opts into preserved whitespace and long-text wrapping.
No matching, parsing, validation, DOM ownership or API scope was expanded.

## Migration steps

**Delivery phase:** P2 — text enhancement. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 safe text handling and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** Affix. Six P2-assigned catalog rows remain Planned; full P2 is not complete.

1. [x] **Preserve source text.** Original slices become native text/mark nodes, never parsed HTML; the dedicated span explicitly owns/replaces its children.
2. [x] **Define match updates.** Empty/duplicate patterns, order-based overlap, bounded work and explicit update/clear behavior; surrounding host/parent nodes remain intact.
3. [x] **Extract mark styling.** Independent CSS with native-mark/no-JS, wrapping, print and forced-color paths.
4. [x] **Test text boundaries.** Unicode/code-unit offsets, literal metacharacters/HTML, atomic errors, selection and module/classic/browser evidence accepted.

### Native primitives and fallback

- **Native path:** authored mark/text works alone. Automatic rendering uses fixed native mark creation and original text slices in a dedicated HTML span.
- **Small enhancement:** explicit stateless findHighlightRanges/highlightText helpers, with no attribute/pre-upgrade/reconnect protocol, listeners, observers, timers or global highlight registry to clean up. Successful calls replace owned children; selection/caret persistence across updates and unrelated rich-child/listener preservation are not promised.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/highlight)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 original local table rows + 0 supplementary declarations + 0 inherited rows = 7 tracker rows**.
All original identities remain: **5 Verified ADAPTED targets and 2 fully Intentionally
omitted rows**. The adapted auto-escape row additionally excludes raw-regexp false mode.
Reviewed source adds no separate public prop/slot/event surface: HighlightProps derives
these same fields, the splitting utility is internal, and there are no useTheme.props
declarations. Local helper APIs/limits are documented separately, not invented upstream rows.


### Highlight Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`auto-escape`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L22) | Prop | Always-literal safe-default behavior; no autoEscape switch. Raw-regexp false mode is intentionally excluded. | 🟢 Verified ADAPTED literal path | Metacharacters/HTML/regex-looking strings stay literal; unknown autoEscape option throws before DOM mutation. Bounded native matching, no user regex program. |
| [`case-sensitive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L23) | Prop | caseSensitive boolean option; default false, explicit helper update. | 🟢 Verified ADAPTED target | Unicode simple folding with original UTF-16 offsets; never lowercase the whole text. No locale/full-fold/normalization promise. |
| [`highlight-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L24) | Prop | highlightClass string option on native marks plus fixed mui-highlight-mark class. | 🟢 Verified ADAPTED target | Native class property, multiple classes, 256-unit bound and attribute-injection checks; no inline styles. |
| [`highlight-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L25) | Prop | External classes/color tokens instead of object/string forwarding. | ⏭️ Intentionally omitted | No style-object bridge or CSS-in-JS; unsupported helper option rejected. |
| [`highlight-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L26) | Prop | Rendering always uses native mark; arbitrary tags/components are not accepted. | ⏭️ Intentionally omitted | No interactive/raw-text tag constructor or render callback; unsupported option rejected atomically. |
| [`patterns`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L27) | Prop | Explicit readonly string array, default empty (also the source runtime default). | 🟢 Verified ADAPTED target | Empty entries ignored, exact duplicates removed, earliest/input-order/non-overlap rules; 64-pattern, length/work/output bounds. No mutation or attribute parser. |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md#L28) | Prop | Explicit owned string argument, default empty; native text nodes only. | 🟢 Verified ADAPTED target | Exact text/selection after rendering, HTML safety, 65,536-unit bound, clear/update and error atomicity. Child content/listeners are intentionally replaced; host/parent preserved. |

<!-- END PINNED API INVENTORY -->
