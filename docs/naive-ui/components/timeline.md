# Timeline

**Plan: 🟢 Verified for retained native Timeline/TimelineItem scope; three explicit theme omissions.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) registers legacy timeline/item and supplies
connector styling, not chronology logic. That optional plugin remains unchanged; the
accepted native composition neither requires nor redefines it.

- **HTML:** native ordered/unordered list with direct `li`, authored headings/time/body/footer and decorative marker regions.
- **JS:** none in the component; chronology and native action/form listeners stay author-owned.
- **CSS:** isolated markers/connectors, type colors, size, logical placement and native horizontal scrolling. No visual reversal.
- **Placement:** [timeline.css](../../../src/components/timeline/timeline.css), stylesheet package export and [native demo](../../../demo/components/timeline.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/timeline.md) reports 431 passing tests
(12 Timeline cases), build/budget gates and Chromium list/time/heading, native action/form,
connector/nesting/hidden, narrow/RTL/zoom/print/forced-colors, legacy and no-JS evidence.
CSS is 1,320 gzip bytes, component JS is zero, core remains 14,611/15,000 and widgets
2,779/4,000 gzip bytes. Visible text conveys statuses; no screen-reader speech, animation
or framework/pixel parity is certified.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P2 List/Typography and P0 decorative status policy in the [master plan](../migration-plan.md).
**Next task:** Breadcrumb; full P2 still needs residual-index review.

1. [x] **Resolve item regions.** Native heading/time/body/footer/icon regions preserve authorship without chronology inference.
2. [x] **Specify direction/reversal.** Meaningful DOM/Tab order in vertical/horizontal/end-side layouts; newest-first is authored order, not CSS reversal.
3. [x] **Extract connectors.** External dots/type colors and guarded visible-sibling connectors, with visible status text and safe marker-only fallback.
4. [x] **Test event layouts.** Long/missing-date/nested/hidden events, native controls and narrow/RTL/zoom/print layouts; Chromium accessibility-tree order, not screen-reader speech certification.

### Native primitives and fallback

- **Native path:** ordered/unordered list, original `li` nodes, authored heading/time/text and real links/buttons/forms. Templates remain inert until application code explicitly clones them.
- **Small enhancement:** external CSS/flex/logical borders and native overflow handle layout. Guarded `:has()` connects only items with later visible siblings; unsupported engines retain markers/list content without connecting lines. No runtime, reordering, date engine or implicit ARIA.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/timeline)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **15 original local table rows + 4 explicit source-only supplements + 0 inherited rows = 19 tracker rows**.
All original owner/row/pinned identities remain: **16 Verified ADAPTED native targets and
3 Intentionally omitted contracts**. Timeline/TimelineItem and presentation source were
reviewed for retained behavior, not every framework edge case. Defaults, constraints and
actual evidence are recorded in the canonical implementation document.


### Timeline Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`horizontal`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L21) | Prop | Presence `data-horizontal`; default vertical. Explicit named native scroll wrapper for overflowing lanes. | 🟢 Verified ADAPTED target | LTR/RTL keyboard scrolling and Tab visibility, no clipped hidden controls or order changes; print stacks items. |
| [`icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L22) | Prop | `--mui-timeline-icon-size` on actual list; positive CSS length, default .875rem. | 🟢 Verified ADAPTED target | 14px default / 24px authored override measured; no number-to-length runtime. |
| [`item-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L23) | Prop | Default left/start rail; `data-item-placement="right"` means logical end, ignored horizontally. | 🟢 Verified ADAPTED target | RTL position and original DOM/Tab order; not a physical reversal API. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L24) | Prop | Medium default; `data-size="large"` title/spacing preset. Unknown values use medium. | 🟢 Verified ADAPTED target | 16px/18px title presets at default root font; no invented small size or pixel-parity claim. |

### TimelineItem Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L30) | Prop | Per-item `--mui-timeline-item-color` controls marker border/icon color. | 🟢 Verified ADAPTED target | Custom color measured; explicit visible status words remain authoritative. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L31) | Prop | Authored body text/nodes; textContent for dynamic plain text. | 🟢 Verified ADAPTED target | Rich/long content, forms and listeners preserved; no string renderer. |
| [`line-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L32) | Prop | Solid default or `data-line-type="dashed"` native border. | 🟢 Verified ADAPTED target | Vertical/horizontal styles and hidden/last-visible boundaries; marker-only fallback without :has, no Houdini/animation. |
| [`time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L33) | Prop | Authored time[datetime] for known values, ordinary metadata span otherwise. | 🟢 Verified ADAPTED target | Native machine date/display text and missing-date example; no parsing, formatting or epoch inference. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L34) | Prop | Authored `.mui-timeline-title` heading/header region inside the item body. | 🟢 Verified ADAPTED target | Real heading levels/names; no native tooltip mapping or title renderer. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L35) | Prop | `data-type` default/success/info/warning/error; unknown falls back to neutral. | 🟢 Verified ADAPTED target | All five colors and explicit status words exercised; color is not the only information. |

### Timeline Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L41) | Slot | Native list and direct authored li/template children. | 🟢 Verified ADAPTED target | True lists/listitems and original chronology/nodes; explicit markerless-role caveat documented. |

### TimelineItem Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L47) | Slot | Native body children, including nested lists and actual controls. | 🟢 Verified ADAPTED target | Content/listeners/forms/order preserved; no VNode/slot or prop-fallback engine. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L48) | Slot | Authored `.mui-timeline-marker[data-icon]` with explicit decoration/naming. | 🟢 Verified ADAPTED target | Original SVG/currentColor; no Icon/widget/date dependency, controls stay outside marker. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L49) | Slot | Authored `.mui-timeline-footer` metadata/rich content. | 🟢 Verified ADAPTED target | Native time or plain text; no footer/time precedence logic or automatic date. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/demos/enUS/index.demo-entry.md#L50) | Slot | Authored `.mui-timeline-title` heading/header region. | 🟢 Verified ADAPTED target | Author controls heading level and text; no generated heading or header/title precedence. |

### Explicit source-only supplements

These four entries supplement the original public rows without replacing owner identities.
Reviewed source has no reverse prop or component-specific event/method API; reversal,
date parsing and synthetic row selection are not invented migration features.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`time` numeric source variant](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/timeline/src/TimelineItem.tsx) | Source-only TimelineItem prop expansion | Source permits string or number; author numeric display text explicitly, without generating datetime. | 🟢 Verified ADAPTED target | Native textContent retains numeric display; no epoch, timezone, duration or formatting inference. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Timeline prop | External CSS, not a framework theme/provider object. | ⏭️ Intentionally omitted | Timeline spreads useTheme.props and provides theme context; native CSS needs neither. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Timeline prop | CSS tokens instead of runtime override merging. | ⏭️ Intentionally omitted | No CSS-in-JS, provider or theme-object bridge. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Timeline prop | No built-in override object. | ⏭️ Intentionally omitted | External author styles, zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
