# Table

**Plan: Planned. Current baseline: data-grid-generated table is related only.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) generates a table for data grids; no dedicated simple table element is registered.

- **HTML:** authored native table, caption, column/row headings and body.
- **JS:** none for simple table presentation.
- **CSS:** external borders, striping, size and overflow wrapper.
- **Placement:** proposed `src/components/table/table.css`; independent of data-table JavaScript.

## Acceptance and gaps

Test heading associations, row/column spans, narrow viewports, print and high contrast. Sorting, selection and virtualization belong to Data Table, not this CSS-only scope.

## Migration steps

**Delivery phase:** P2 — semantic display. **Task state:** 🔵 Planned.
**Prerequisites:** P0 authored HTML and P2 CSS tokens in the [master plan](../migration-plan.md).
**Next task:** author a captioned native table and keep simple presentation independent of Data Table JavaScript.

1. [ ] **Define native anatomy.** Preserve caption, head/body/footer, row/column headings and cell spans.
2. [ ] **Extract table variants.** Implement borders, striping, sizes and hover styles in external CSS.
3. [ ] **Specify narrow-screen behavior.** Use an explicit overflow wrapper without changing table semantics or moving cells into div grids.
4. [ ] **Verify readable structure.** Test heading associations, spanning cells, print, forced colors and keyboard scrolling where applicable.

### Native primitives and fallback

- **Native path:** native table, caption, thead/tbody/tfoot and th/td preserve reading/heading semantics. Optional row templates only assist application-authored repeated rows.
- **Small enhancement:** none is required for presentation. External CSS borders, logical alignment and overflow wrappers work without a controller; sticky headers or container-query enhancements must fall back to normal scrolling/table layout. Do not require custom elements, virtualization or a table polyfill for simple tabular HTML.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/table)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 local table rows + 0 supplementary declarations + 0 inherited rows = 6 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Table Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bottom-bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate presence attribute `bottom-bordered`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`single-column`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate presence attribute `single-column`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`single-line`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `single-line`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`striped`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/table/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate presence attribute `striped`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
