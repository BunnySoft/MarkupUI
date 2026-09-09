# Date Picker

**Plan: 🟢 Verified retained native date/month/week/local datetime and explicit endpoint-pair scope.**

[Canonical anatomy, temporal policy, complete mapping summary and evidence](../../components/date-picker.md).
Native calendar strings are not timestamp models. One or two original same-mode fields own
current/default values, constraints, labels, names and FormData. Detached native probes
validate setter grammar before real mutation. No timezone conversion, linked bounds,
calendar grid, formatter library, popup/provider or hidden tuple fields.

## Migration steps

**Delivery phase:** P4 — native date entry; P6 calendar/format/rule/portal modes omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native form/default/reset contracts and explicit temporal semantics.
**Next task:** Time Picker; P4 as a whole remains In progress.

1. [x] **Preserve native entry.** Supported date/month/week/datetime-local controls and named endpoint pairs.
2. [x] **Resolve mode contracts.** Exact native strings, empty/partial/order/clear/default semantics; year/quarter modes excluded.
3. [x] **Build only approved panels.** No custom calendar panels; only native controls, external CSS and bounded coordination.
4. [x] **Prove boundary behavior.** Leap/week/year/seconds, constraints/reset, timezone non-conversion, focus and no-JS evidence.

### Native primitives and fallback

Supported native fields remain usable without JS. Unsupported type/grammar capabilities
leave explicitly labelled native/text fallback, not a calendar or validation polyfill.
Readout/clear start hidden. Range ordering is an observation/manual Form policy; application
validation does not disable days inside a native popup.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/date-picker)
- [Pinned API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md)
- [Pinned implementation](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **179 original identities** remain: **134 local rows + 45 inline declarations**,
no inherited rows. **Twenty explicit source supplements** below give **199 tracker rows**.
Verified means an **ADAPTED retained native branch**, never framework/timestamp parity.
Grouped mode identities are preserved: a MonthRange/Date/Week mapping does not promote
the omitted Year/Quarter owners in that same source row. All verified rows use canonical
test/browser/build evidence; omitted rows receive no implementation credit.

DatePicker.tsx, props.ts, interface/public-types and exports were reviewed. Source date-fns
parsing/formatting, timestamp values, calendar panels, arbitrary disabled-date/time callbacks
and timezone assumptions are not copied. Placeholder rendering/locale week starts are
platform UI, not native equivalents of configurable source formatting.

### General Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`calendar-day-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L43) | Prop | No configurable calendar label formatter. | ⏭️ Intentionally omitted |
| [`calendar-header-year-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L44) | Prop | Native popup year labels are not controlled. | ⏭️ Intentionally omitted |
| [`calendar-header-month-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L45) | Prop | No month label token API. | ⏭️ Intentionally omitted |
| [`calendar-header-month-before-year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L46) | Prop | No header ordering; source boolean differs from Markdown string. | ⏭️ Intentionally omitted |
| [`calendar-header-month-year-separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L47) | Prop | No native header separator override. | ⏭️ Intentionally omitted |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L48) | Prop | Authored type=button clear, all endpoints editable. | 🟢 Verified |
| [`date-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L49) | Prop | Native strings, no formatter tokens. | ⏭️ Intentionally omitted |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L50) | Prop | Native string defaults; epoch/tuple timestamp ABI excluded. | 🟢 Verified |
| [`default-formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L51) | Prop | No second formatted default/model channel. | ⏭️ Intentionally omitted |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L52) | Prop | Actual native field/fieldset disabled. | 🟢 Verified |
| [`first-day-of-week`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L53) | Prop | Native locale UI not configured; ISO week value is separate. | ⏭️ Intentionally omitted |
| [`input-readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L54) | Prop | Actual native readonly, including its picker/validity eligibility. | 🟢 Verified |
| [`month-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L55) | Prop | No formatted calendar month items. | ⏭️ Intentionally omitted |
| [`panel`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L56) | Prop | No custom standalone calendar. | ⏭️ Intentionally omitted |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L57) | Prop | No native popup positioning API. | ⏭️ Intentionally omitted |
| [`quarter-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L58) | Prop | Quarter mode/grid/formatter excluded. | ⏭️ Intentionally omitted |
| [`shortcuts`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L59) | Prop | Explicit app local-string buttons are alternatives, not epoch shortcuts. | ⏭️ Intentionally omitted |
| [`show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L60) | Prop | No native open/hide state model. | ⏭️ Intentionally omitted |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L61) | Prop | External field/pair CSS sizing. | 🟢 Verified |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L62) | Prop | Native/Form validity and separate range observations. | 🟢 Verified |
| [`time-picker-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L63) | Prop | No nested TimePicker/formatter API. | ⏭️ Intentionally omitted |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L64) | Prop | No portalled calendar. | ⏭️ Intentionally omitted |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L65) | Prop | Native date/month/week/datetime-local, one/two endpoints; year/quarter excluded. | 🟢 Verified |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L66) | Prop | Validated native strings/tuples only; no automatic epoch conversion. | 🟢 Verified |
| [`value-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L67) | Prop | No arbitrary formatted binding/parser. | ⏭️ Intentionally omitted |
| [`year-format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L68) | Prop | No year grid/token format. | ⏭️ Intentionally omitted |
| [`year-range`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L69) | Prop | No calendar-year grid range; native min/max are independent bounds. | ⏭️ Intentionally omitted |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L70) | Callback | Native endpoint input/change plus explicit clear event. | 🟢 Verified |
| [`on-confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L71) | Callback | No source timestamp/formatted confirmation callback. | ⏭️ Intentionally omitted |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L72) | Callback | Original native blur. | 🟢 Verified |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L73) | Callback | Original native focus. | 🟢 Verified |
| [`on-next-month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L74) | Callback | No internal calendar navigation event. | ⏭️ Intentionally omitted |
| [`on-next-year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L75) | Callback | No internal calendar navigation event. | ⏭️ Intentionally omitted |
| [`on-prev-month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L76) | Callback | No internal calendar navigation event. | ⏭️ Intentionally omitted |
| [`on-prev-year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L77) | Callback | No internal calendar navigation event. | ⏭️ Intentionally omitted |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L78) | Callback | No inferred native picker visibility. | ⏭️ Intentionally omitted |

### Date Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L84) | Prop | No source clear/now toolbar array. | ⏭️ Intentionally omitted |
| [`default-calendar-start-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L85) | Prop | No panel timestamp/start month model. | ⏭️ Intentionally omitted |
| [`fast-year-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L86) | Prop | Native calendar UI not controlled. | ⏭️ Intentionally omitted |
| [`fast-month-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L87) | Prop | Native calendar UI not controlled. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L88) | Prop | Canonical date string, no configurable tokens. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Prop | Native bounds/manual validation are not blackout cells. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L90) | Prop | Use native labels/hints; platform placeholder not promised. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L91) | Callback | No dual formatted/timestamp channel. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L92) | Callback | Native input/change with YYYY-MM-DD, not milliseconds. | 🟢 Verified |

### DateTime Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L98) | Prop | No source clear/now/confirm toolbar. | ⏭️ Intentionally omitted |
| [`default-calendar-start-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L99) | Prop | No calendar start timestamp. | ⏭️ Intentionally omitted |
| [`default-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L100) | Prop | Author complete native local defaults, no timestamp callback. | ⏭️ Intentionally omitted |
| [`fast-year-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L101) | Prop | No native panel closing/navigation override. | ⏭️ Intentionally omitted |
| [`fast-month-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L102) | Prop | No native panel closing/navigation override. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L103) | Prop | Native local string, no formatter/instant conversion. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Prop | No arbitrary disabled calendar dates. | ⏭️ Intentionally omitted |
| [`is-time-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L105) | Prop | Native min/max/step are not disabled-hour callbacks. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L106) | Prop | Native labels/hints instead of locale placeholder control. | ⏭️ Intentionally omitted |
| [`time-picker-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L107) | Prop | No nested TimePicker renderer. | ⏭️ Intentionally omitted |
| [`update-value-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L108) | Prop | Native editing/commit timing only. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L109) | Callback | No formatted/timestamp model pair. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L110) | Callback | Native datetime-local input/change, no timezone or instant. | 🟢 Verified |

### DateRange Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L116) | Prop | No source clear/confirm panel toolbar. | ⏭️ Intentionally omitted |
| [`bind-calendar-months`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L117) | Prop | No linked calendar months or linked native bounds. | ⏭️ Intentionally omitted |
| [`default-calendar-start-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L118) | Prop | Native endpoint defaults, no panel timestamp. | ⏭️ Intentionally omitted |
| [`default-calendar-end-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L119) | Prop | No second panel timestamp. | ⏭️ Intentionally omitted |
| [`end-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L120) | Prop | Native End label/hint, no guaranteed placeholder UI. | ⏭️ Intentionally omitted |
| [`fast-year-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L121) | Prop | No panel navigation override. | ⏭️ Intentionally omitted |
| [`fast-month-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L122) | Prop | No panel navigation override. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L123) | Prop | Native endpoint strings, no token formatter. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L124) | Prop | No phase/timestamp blackout callback. | ⏭️ Intentionally omitted |
| [`is-time-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L125) | Prop | Preserve original row; no source time-cell validators. | ⏭️ Intentionally omitted |
| [`close-on-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L126) | Prop | No owned picker-close state. | ⏭️ Intentionally omitted |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L127) | Prop | Authored static separator between two real inputs. | 🟢 Verified |
| [`start-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L128) | Prop | Native Start label/hint, not placeholder UI control. | ⏭️ Intentionally omitted |
| [`update-value-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L129) | Prop | No commit-on-close model. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L130) | Callback | No dual formatted/epoch tuple emitter. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L131) | Callback | Actual endpoint input/change; partial/reversed strings retained. | 🟢 Verified |

### DateTimeRange Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L137) | Prop | No source panel toolbar. | ⏭️ Intentionally omitted |
| [`bind-calendar-months`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L138) | Prop | No linked calendar/bounds graph. | ⏭️ Intentionally omitted |
| [`default-calendar-start-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L139) | Prop | No panel timestamp/default navigation. | ⏭️ Intentionally omitted |
| [`default-calendar-end-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L140) | Prop | No second panel timestamp. | ⏭️ Intentionally omitted |
| [`default-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L141) | Prop | Complete native local defaults, no timestamp/phase function. | ⏭️ Intentionally omitted |
| [`end-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L142) | Prop | Native labels/hints instead. | ⏭️ Intentionally omitted |
| [`fast-year-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L143) | Prop | No native panel navigation control. | ⏭️ Intentionally omitted |
| [`fast-month-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L144) | Prop | No native panel navigation control. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L145) | Prop | Native wall-clock strings, no timezone/token engine. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L146) | Prop | No phase/epoch blackout callback. | ⏭️ Intentionally omitted |
| [`is-time-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L147) | Prop | No per-hour/minute/second disabling model. | ⏭️ Intentionally omitted |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L148) | Prop | Authored static separator between actual local endpoints. | 🟢 Verified |
| [`start-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L149) | Prop | Native labels/hints instead. | ⏭️ Intentionally omitted |
| [`time-picker-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L150) | Prop | No nested TimePicker renderer/prop pair. | ⏭️ Intentionally omitted |
| [`update-value-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L151) | Prop | Native fields update directly, no close commit. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L152) | Callback | No formatted/timestamp pair channel. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L153) | Callback | Native local endpoint input/change; no instant conversion. | 🟢 Verified |

### Month Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L159) | Prop | No clear/now/confirm panel toolbar. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L160) | Prop | Canonical YYYY-MM only, not token formatting. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Prop | Native bounds are not arbitrary disabled month cells. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L162) | Prop | Native label/hint; no popup placeholder promise. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L163) | Callback | No dual formatter/timestamp binding. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L164) | Callback | Native month string input/change. | 🟢 Verified |

### MonthRange, QuarterRange, YearRange Type Props

All original grouped owners stay in each row. **Only MonthRange has a native target.**
QuarterRange/YearRange are explicitly omitted even where a row is green for MonthRange.

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L170) | Prop | No toolbar for any grouped owner. | ⏭️ Intentionally omitted |
| [`end-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L171) | Prop | Native month labels; year/quarter and placeholder override excluded. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L172) | Prop | No source format tokens for any owner. | ⏭️ Intentionally omitted |
| [`close-on-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L173) | Prop | No owned native picker closing. | ⏭️ Intentionally omitted |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L174) | Prop | MonthRange only: authored separator; year/quarter omitted. | 🟢 Verified |
| [`start-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L175) | Prop | Native month labels; no year/quarter or placeholder override. | ⏭️ Intentionally omitted |
| [`update-value-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L176) | Prop | No source close-commit model. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L177) | Callback | No formatter/epoch callback for any owner. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L178) | Callback | MonthRange only: native pair events; year/quarter omitted. | 🟢 Verified |

### Year Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L184) | Prop | Year-only mode excluded. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L185) | Prop | Year-only mode/token formatting excluded. | ⏭️ Intentionally omitted |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Prop | No year grid/blackout callback. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L187) | Prop | No year-only native editor claimed. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L188) | Callback | No year-mode formatted event. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L189) | Callback | No year-only timestamp/native mode alias. | ⏭️ Intentionally omitted |

### Week Type Props

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`actions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L195) | Prop | No source clear/now toolbar. | ⏭️ Intentionally omitted |
| [`default-calendar-start-time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L196) | Prop | No panel start timestamp. | ⏭️ Intentionally omitted |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L197) | Prop | ISO YYYY-Www, not locale YYYY-w token formatting. | ⏭️ Intentionally omitted |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L198) | Prop | Native label/hint, no locale placeholder guarantee. | ⏭️ Intentionally omitted |
| [`on-update:formatted-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L199) | Callback | No formatted/timestamp week channel. | ⏭️ Intentionally omitted |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L200) | Callback | Native ISO week string input/change where supported. | 🟢 Verified |

### DatePicker Slots

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`date-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L206) | Slot | Optional authored decorative affix, not native-popup icon replacement. | 🟢 Verified |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L207) | Slot | Authored help/footer DOM outside the native picker. | 🟢 Verified |
| [`next-month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L208) | Slot | No native calendar icon override. | ⏭️ Intentionally omitted |
| [`next-year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L209) | Slot | No native calendar icon override. | ⏭️ Intentionally omitted |
| [`prev-month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L210) | Slot | No native calendar icon override. | ⏭️ Intentionally omitted |
| [`prev-year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L211) | Slot | No native calendar icon override. | ⏭️ Intentionally omitted |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L212) | Slot | Authored static pair separator; no extra input/value. | 🟢 Verified |

### Date, Year, QuarterRange, Week Slots

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L218) | Slot | Date/Week only: native clear button; Year/QuarterRange omitted. | 🟢 Verified |
| [`now`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L219) | Slot | No source onNow/timestamp slot for any grouped owner. | ⏭️ Intentionally omitted |

### DateRange, DateTimeRange, MonthRange, YearRange Slots

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L225) | Slot | Date/DateTime/Month ranges only: native clear; YearRange omitted. | 🟢 Verified |
| [`confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L226) | Slot | No calendar confirm/epoch tuple callback. | ⏭️ Intentionally omitted |

### DateTime, Month, Quarter Slots

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L232) | Slot | DateTime/Month only: native clear; Quarter omitted. | 🟢 Verified |
| [`confirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L233) | Slot | No owned picker confirmation. | ⏭️ Intentionally omitted |
| [`now`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L234) | Slot | Explicit local app strings are not this timestamp slot. | ⏭️ Intentionally omitted |

### DatePicker Methods

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L240) | Method | Focus the chosen original native endpoint explicitly. | 🟢 Verified |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L241) | Method | Native endpoint blur, no confirm/open inference. | 🟢 Verified |

### Date Type Props: is-date-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-date-disabled.type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Inline record field | No source disabled-cell detail discriminant. | ⏭️ Intentionally omitted |
| [`is-date-disabled.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Inline record field | No calendar callback year field. | ⏭️ Intentionally omitted |
| [`is-date-disabled.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Inline record field | No calendar callback month field. | ⏭️ Intentionally omitted |
| [`is-date-disabled.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Inline record field | No arbitrary disabled-day callback. | ⏭️ Intentionally omitted |
| [`is-date-disabled.quarter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L89) | Inline record field | No quarter/cell callback. | ⏭️ Intentionally omitted |

### DateTime Type Props: is-date-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-date-disabled.type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Inline record field | No source calendar detail discriminant. | ⏭️ Intentionally omitted |
| [`is-date-disabled.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Inline record field | No disabled-year detail callback. | ⏭️ Intentionally omitted |
| [`is-date-disabled.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Inline record field | No disabled-month detail callback. | ⏭️ Intentionally omitted |
| [`is-date-disabled.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Inline record field | No arbitrary blackout-day callback. | ⏭️ Intentionally omitted |
| [`is-date-disabled.quarter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L104) | Inline record field | No quarter-cell callback. | ⏭️ Intentionally omitted |

### DateTime Type Props: is-time-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-time-disabled.isHourDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L105) | Inline record field | No disabled-hour function. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isMinuteDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L105) | Inline record field | No disabled-minute function. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isSecondDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L105) | Inline record field | No disabled-second function. | ⏭️ Intentionally omitted |

### DateRange Type Props: is-time-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-time-disabled.isHourDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L125) | Inline record field | Original owner preserved; no time disabling. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isMinuteDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L125) | Inline record field | No phase/hour-aware minute predicate. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isSecondDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L125) | Inline record field | No phase/minute-aware second predicate. | ⏭️ Intentionally omitted |

### DateTimeRange Type Props: is-time-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-time-disabled.isHourDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L147) | Inline record field | No phase-based disabled-hour callback. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isMinuteDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L147) | Inline record field | No phase/hour-based disabled-minute callback. | ⏭️ Intentionally omitted |
| [`is-time-disabled.isSecondDisabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L147) | Inline record field | No phase/minute-based disabled-second callback. | ⏭️ Intentionally omitted |

### Month Type Props: is-date-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-date-disabled.type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Inline record field | No source calendar detail discriminant. | ⏭️ Intentionally omitted |
| [`is-date-disabled.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Inline record field | No year predicate detail. | ⏭️ Intentionally omitted |
| [`is-date-disabled.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Inline record field | No arbitrary month blacklist. | ⏭️ Intentionally omitted |
| [`is-date-disabled.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Inline record field | No date predicate detail. | ⏭️ Intentionally omitted |
| [`is-date-disabled.quarter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L161) | Inline record field | No quarter predicate detail. | ⏭️ Intentionally omitted |

### Year Type Props: is-date-disabled inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`is-date-disabled.type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Inline record field | Year mode and detail callback omitted. | ⏭️ Intentionally omitted |
| [`is-date-disabled.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Inline record field | No disabled-year predicate. | ⏭️ Intentionally omitted |
| [`is-date-disabled.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Inline record field | No year-panel month detail. | ⏭️ Intentionally omitted |
| [`is-date-disabled.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Inline record field | No year-panel date detail. | ⏭️ Intentionally omitted |
| [`is-date-disabled.quarter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L186) | Inline record field | No year/quarter detail renderer. | ⏭️ Intentionally omitted |

### Date, Year, QuarterRange, Week Slots: clear inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear.onClear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L218) | Inline record field | Date/Week only: native clear command; year/quarter omitted. | 🟢 Verified |
| [`clear.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L218) | Inline record field | Date/Week only: authored button text, no renderer injection. | 🟢 Verified |

### Date, Year, QuarterRange, Week Slots: now inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`now.onNow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L219) | Inline record field | No source timestamp/now callback. | ⏭️ Intentionally omitted |
| [`now.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L219) | Inline record field | No source now-slot text binding. | ⏭️ Intentionally omitted |

### DateRange, DateTimeRange, MonthRange, YearRange Slots: clear inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear.onClear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L225) | Inline record field | Date/DateTime/Month ranges only: clear; YearRange omitted. | 🟢 Verified |
| [`clear.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L225) | Inline record field | Retained native ranges: authored clear label; YearRange omitted. | 🟢 Verified |

### DateRange, DateTimeRange, MonthRange, YearRange Slots: confirm inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`confirm.onConfirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L226) | Inline record field | No owned calendar confirm action. | ⏭️ Intentionally omitted |
| [`confirm.disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L226) | Inline record field | No virtual confirm eligibility flag. | ⏭️ Intentionally omitted |
| [`confirm.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L226) | Inline record field | No confirm-slot locale text. | ⏭️ Intentionally omitted |

### DateTime, Month, Quarter Slots: clear inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`clear.onClear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L232) | Inline record field | DateTime/Month only: native clear; Quarter omitted. | 🟢 Verified |
| [`clear.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L232) | Inline record field | DateTime/Month only: native button text; Quarter omitted. | 🟢 Verified |

### DateTime, Month, Quarter Slots: confirm inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`confirm.onConfirm`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L233) | Inline record field | No source confirm callback. | ⏭️ Intentionally omitted |
| [`confirm.disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L233) | Inline record field | No native-popup confirm state. | ⏭️ Intentionally omitted |
| [`confirm.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L233) | Inline record field | No confirm-slot renderer text. | ⏭️ Intentionally omitted |

### DateTime, Month, Quarter Slots: now inline fields

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`now.onNow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L234) | Inline record field | No source timestamp-dependent now action. | ⏭️ Intentionally omitted |
| [`now.text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/demos/enUS/index.demo-entry.md#L234) | Inline record field | No source now-slot renderer text. | ⏭️ Intentionally omitted |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | Native disposition | Status |
| --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source prop | External native input border CSS. | 🟢 Verified |
| [`formattedValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source prop | No second formatted/epoch model. | ⏭️ Intentionally omitted |
| [`ranges`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source prop | No timestamp shortcut-range record. | ⏭️ Intentionally omitted |
| [`onUpdateValue / deprecated onChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source callback alias group | Native events instead of duplicate model callbacks. | ⏭️ Intentionally omitted |
| [`onUpdateFormattedValue / onUpdate:formattedValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source callback alias group | No source formatted-value channel/alias. | ⏭️ Intentionally omitted |
| [`onUpdateShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source callback alias | No native open/hide observer. | ⏭️ Intentionally omitted |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/props.ts) | Source theme group | External native CSS instead. | ⏭️ Intentionally omitted |
| [`DatePickerProps / datePickerProps / NDatePicker`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/index.ts) | Source public type/export group | Explicit native root/controller API, no framework aliases. | ⏭️ Intentionally omitted |
| [`DatePickerSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts) | Source public type | Small/medium/large native CSS vocabulary. | 🟢 Verified |
| [`DatePickerInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts) | Source public interface | Original input focus/blur; no source instance ABI. | ⏭️ Intentionally omitted |
| [`DatePickerClearSlotOnClear / DatePickerClearSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts) | Source public slot type group | Native clear alternatives above, no injected slot callback record. | ⏭️ Intentionally omitted |
| [`DatePickerNowSlotOnNow / DatePickerNowSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts) | Source public slot type group | Explicit local-string app recipe, no source now ABI. | ⏭️ Intentionally omitted |
| [`DatePickerConfirmSlotOnConfirm / DatePickerConfirmSlotProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/public-types.ts) | Source public slot type group | No source confirm/disabled/text record. | ⏭️ Intentionally omitted |
| [`DatePickerSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/DatePicker.tsx) | Source public slot type | Authored native anatomy, no VNode slot ABI. | ⏭️ Intentionally omitted |
| [`Value / FormattedValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source model type group | Native strings/explicit endpoints are not timestamp/formatted models. | ⏭️ Intentionally omitted |
| [`DefaultTime / DatePickerGetDefaultTime / DatePickerGetRangeDefaultTime`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source default-time type group | No timestamp-dependent default time callback. | ⏭️ Intentionally omitted |
| [`IsDateDisabled / IsSingleDateDisabled / IsSingleDateDisabledDetail / IsRangeDateDisabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source calendar validator type group | No blackout/cell-disabling API. | ⏭️ Intentionally omitted |
| [`IsTimeDisabled / TimeValidator / IsSingleTimeDisabled / IsRangeTimeDisabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source time validator type group | Native constraints/manual checks are not disabled time cells. | ⏭️ Intentionally omitted |
| [`OnUpdateValue / OnUpdateValueImpl / OnUpdateFormattedValue / OnUpdateFormattedValueImpl / OnConfirm / OnConfirmImpl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source callback type group | No timestamp/formatted callback ABI; native events only. | ⏭️ Intentionally omitted |
| [`DatePickerInjection / PanelRef / RangePanelChildComponentRefs / PanelChildComponentRefs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/date-picker/src/interface.ts) | Source internal provider/ref group | No calendar/provider/ref graph. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
