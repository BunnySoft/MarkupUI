# Result

**Plan: 🟢 Verified for retained native Result scope; four explicit type/theme omissions and authored artwork instead of vendor defaults.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) retains basic empty content, not a
Result controller. Empty/Thing conventions informed the native composition without creating
a stylesheet/runtime dependency or altering the aggregate.

- **HTML:** authored heading/description/icon/content/footer, readable outcome text and real recovery actions.
- **JS:** none in the component; optional application retry-intent feedback only.
- **CSS:** isolated status palettes, four sizes, native alignment and wrapping.
- **Placement:** [result.css](../../../src/components/result/result.css), stylesheet export and [native demo](../../../demo/components/result.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/result.md) reports 516 passing tests
(12 Result cases), build/budget gates and Chromium headings/status-text/actions/forms/focus/
hidden/nested/narrow/RTL/zoom/print/forced-colors/coexistence/no-JS evidence. CSS is 879
gzip bytes and component JS is zero. Core/plugins remain unchanged. No default text/icon
generator, vendor asset package, automatic HTTP/retry/navigation or live announcement is claimed.

## Migration steps

**Delivery phase:** P2 — outcome composition. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Button and P2 Empty/Typography in the [master plan](../migration-plan.md).
**Next task:** Code, then Scrollbar, before the remaining Float Button/Image interaction scopes.
Four P2-assigned catalog rows remain Planned; full P2 is not complete.

1. [x] **Author semantic regions.** Native heading/description/icon/content/footer with author-selected semantics and real actions.
2. [x] **Resolve outcome variants.** Eight actual status variants and four sizes; visible messages and authored artwork, not color-only meaning or an invented empty status.
3. [x] **Extract page layout.** Scoped palettes/dimensions/spacing and native logical wrapping/alignment, with no runtime renderer.
4. [x] **Test recovery paths.** Native focus/forms/home links, missing/hidden/nested content, no-JS and browser presentation accepted without automatic announcements.

### Native primitives and fallback

- **Native path:** author-selected section/div, actual headings/text, optional named or decorative media, native controls and inert templates.
- **Small enhancement:** none beyond CSS grid/flex/logical spacing. No result controller, observer, icon dependency, HTTP/router handling, template schema, live region or Shadow DOM is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/result)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 original local table rows + 4 explicit source-only supplements + 0 inherited rows = 11 tracker rows**.
All original identities remain: **7 Verified ADAPTED native targets and 4 Intentionally
omitted contracts**. Result, its styles and size constants were reviewed. Built-in icon/
vendor illustration selection is replaced by authored content within the retained status/
icon mappings; it is not claimed as asset parity. Source has no automatic title/description
message defaults, alignment prop, action/header/description slot or component event API.


### Result Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L28) | Prop | Authored .mui-result-description text/nodes. | 🟢 Verified ADAPTED target | No generated message or attribute renderer; safe native text, hidden/long content and ownership preserved. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L29) | Prop | data-size small/medium/large/huge, default/unknown medium. | 🟢 Verified ADAPTED target | 64/80/100/125px icon and 26/32/40/48px title presets at a 16px root, with native rem scaling and wrapping. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L30) | Prop | data-status info/success/warning/error/404/403/500/418 icon-region palette; missing/unknown info. | 🟢 Verified ADAPTED target | Explicit visible status text and authored icons/code symbols. No HTTP handling, auto message/action or vendor illustration selection. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L31) | Prop | Actual .mui-result-title heading/text chosen by the author. | 🟢 Verified ADAPTED target | Native heading/name, no tooltip mapping, generated heading level or status-derived text default. |

### Result Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L37) | Slot | Native .mui-result-content children. | 🟢 Verified ADAPTED target | Rich form/nested content and original nodes/listeners/order remain; no VNode/schema renderer. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L38) | Slot | Authored .mui-result-footer information and independent native controls. | 🟢 Verified ADAPTED target | Form association, validity/reset/disabled/focus, home navigation and no-JS GET behavior verified; no generated action/router policy. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/demos/enUS/index.demo-entry.md#L39) | Slot | Authored .mui-result-icon SVG/image/symbol content, or omit the region. | 🟢 Verified ADAPTED target | Native namespaces/alt/names and replacements preserved; original simple demo artwork, no vendor assets or fallback icon generator. |

### Explicit source-only supplements

These four source declarations supplement rather than replace the seven public rows.
ResultProps/ResultSlots mirror the original owner surfaces. Private status render maps
are not promoted into public native render callbacks.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`ResultSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/result/src/public-types.ts) | Source-only exported type | No exported TypeScript alias; native size vocabulary is already accounted for above. | ⏭️ Intentionally omitted | CSS-only distribution, not a framework prop/type constructor. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Result prop | External CSS rather than a theme/provider object. | ⏭️ Intentionally omitted | Result spreads useTheme.props; native composition needs no runtime theme evaluator. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Result prop | CSS tokens instead of override-object merging. | ⏭️ Intentionally omitted | No CSS-in-JS or provider dependency. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Result prop | No built-in override object. | ⏭️ Intentionally omitted | Author-owned external styles; zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
