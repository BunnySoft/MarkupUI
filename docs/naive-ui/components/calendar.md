# Calendar

**Plan: Planned. Current baseline: no calendar grid identified.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) has only native date input.

- **HTML:** captioned month table/grid and native navigation buttons.
- **JS:** date arithmetic, selected day and locale-aware week labels using native `Intl`.
- **CSS:** external month layout, current/selected/disabled day states.
- **Placement:** proposed `src/optional/calendar/`.

## Acceptance and gaps

Test leap years, month/year boundaries, locale week starts, roving focus and custom day content. Define date-only values independently of local timestamp offsets.

## Migration steps

**Delivery phase:** P6 — specialized dates. **Task state:** 🔵 Planned.
**Prerequisites:** P4 date-value decisions and P3 grid focus rules in the [master plan](../migration-plan.md).
**Next task:** choose date-only values and locale week-start behavior for the month grid.

1. [ ] **Author the month fallback.** Build a captioned calendar table and native month-navigation buttons with readable day labels.
2. [ ] **Define date transitions.** Specify selected/current/disabled days and movement across month/year boundaries.
3. [ ] **Add optional day content.** Resolve day/header slots into authored templates without replacing cell semantics.
4. [ ] **Verify calendar boundaries.** Test leap years, locale week starts, keyboard navigation and date-only serialization independently of timestamps.

### Native primitives and fallback

- **Native path:** captioned native table/grid markup, day buttons and an optional `template` cloned for a month's cells. A light-DOM controller updates only changed dates and focus.
- **Small enhancement:** use Intl for labels and explicit date-only arithmetic; CSS grid/logical properties handles presentation. Feature-detect retained Intl options and fall back to supplied labels/simple date entry. Preserve static calendar reading when scripting is absent instead of importing a calendar/date framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/calendar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **7 local table rows + 7 supplementary declarations + 0 inherited rows = 14 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Calendar Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate explicit JS `isDateDisabled` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-panel-change`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Callback | Candidate DOM `mui:panel-change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Calendar Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L29) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Calendar Props: on-panel-change inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-panel-change.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Inline record field | Candidate DOM `mui:panel-change.year` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-panel-change.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Inline record field | Candidate DOM `mui:panel-change.month` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Calendar Props: on-update:value inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-update:value.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate DOM `mui:change:value.year` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate DOM `mui:change:value.month` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline record field | Candidate DOM `mui:change:value.date` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Calendar Slots: header inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`header.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
