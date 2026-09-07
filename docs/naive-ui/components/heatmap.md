# Heatmap

**Plan: Planned. Current baseline: no heatmap component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) contains no data visualization controller.

- **HTML:** accessible table/grid and text legend; cells retain actual values.
- **JS:** optional local date bucketing and keyboard exploration using native date/Intl APIs.
- **CSS:** external scale classes/tokens and responsive cell layout.
- **Placement:** proposed `src/optional/heatmap/`; no chart dependency.

## Acceptance and gaps

Test empty/missing/negative data, year boundaries, locale week starts, keyboard and non-color alternatives. Calendar layout and tooltip composition need explicit contracts before implementation.

## Migration steps

**Delivery phase:** P6 — visualization. **Task state:** 🔵 Planned.
**Prerequisites:** P6 Calendar/date rules, P3 optional Tooltip and an independent budget in the [master plan](../migration-plan.md).
**Next task:** define data buckets and an accessible table/grid fallback with actual readable values.

1. [ ] **Specify input semantics.** Resolve dates, missing/negative values, scale bounds and locale week starts without a chart library.
2. [ ] **Author cells and legend.** Preserve text alternatives so color is not the only representation of value.
3. [ ] **Add optional exploration.** Define keyboard focus and tooltip content without remounting the whole grid.
4. [ ] **Verify calendar/data edges.** Test empty years, boundary dates, invalid records, contrast and supplied fixtures rather than runtime mock-data generation.

### Native primitives and fallback

- **Native path:** a native table/grid with readable cell values and legend; clone an authored cell template for optional data generation while retaining stable date keys.
- **Small enhancement:** use Intl for date labels and a small light-DOM controller for keyboard exploration; CSS classes/tokens and logical grid layout encode values. Feature-detect optional popover/observer enhancements and fall back to the readable table. No chart library, canvas-only renderer or generic template engine is needed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/heatmap)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **20 local table rows + 7 supplementary declarations + 0 inherited rows = 27 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Tooltip](tooltip.md). Opaque types without local member definitions remain unreviewed.


### Heatmap Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`active-colors`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate JS `activeColors` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color-theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate explicit JS `colorTheme` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate JS `data` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`first-day-of-week`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate `first-day-of-week` attribute or JS `firstDayOfWeek`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`fill-calendar-leading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate presence attribute `fill-calendar-leading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading-data`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate JS `loadingData` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`minimum-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `minimum-color` attribute or JS `minimumColor`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-color-indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate live JS `showColorIndicator` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-month-labels`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate live JS `showMonthLabels` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-week-labels`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate live JS `showWeekLabels` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L47) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate `tooltip` attribute or JS `tooltip`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`x-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L49) | Prop | External CSS token/class for `x-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`y-gap`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L50) | Prop | External CSS token/class for `y-gap`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |

### Heatmap Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L58) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indicator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L59) | Slot | Candidate authored `indicator` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indicator-leading-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L60) | Slot | Candidate authored `indicator-leading-text` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indicator-trailing-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L61) | Slot | Candidate authored `indicator-trailing-text` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tooltip`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Slot | Candidate authored `tooltip` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Exported helper

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`heatmapMockData`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L66) | Method | Candidate plain-JS `heatmapMockData` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Heatmap Props: data inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`data.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`data.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L38) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Heatmap Props: loading-data inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`loading-data.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading-data.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L42) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Heatmap Slots: tooltip inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`tooltip.timestamp`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tooltip.value?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/heatmap/demos/enUS/index.demo-entry.md#L62) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
