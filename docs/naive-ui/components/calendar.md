# Calendar

**🟢 Verified retained Gregorian month/date scope.** A native captioned table and
type=button dates/navigation, separate focused/selected state, bounded date-only
arithmetic and synchronous literal annotations. No date library, timestamp model,
grid-role claim, provider, formatter-token engine or hidden form field.

## Baseline and implementation evidence

The unchanged [advanced baseline](../../../src/plugins/advanced.ts) has a native date
input, not a month table. The new [Calendar helper](../../../src/components/calendar/calendar.ts)
and [private Gregorian arithmetic](../../../src/components/calendar/date.ts) reuse
only Date Picker's [canonical native date validator](../../../src/components/date-picker/native.ts).
No Date Picker UI/controller dependency or existing source refactor is introduced.
[External CSS](../../../src/components/calendar/calendar.css) owns layout/focus/media.
The [2026-09-11 isolated style audit](../../style-audit/components/calendar.md)
records measured default typography, palette, state treatment and retained native
table/control differences.

See the [canonical loading/options/ownership/acceptance](../../components/calendar.md),
[tests](../../../tests/calendar.test.ts) and [local demo](../../../demo/components/calendar.html).
Pinned [props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L32-L43),
[navigation/today](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L67-L116),
[locale/week construction](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L178-L185),
[rendering/adjacent selection](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L292-L355)
and [parts/slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/interface.ts)
were reviewed. Source timestamp/date-fns/locale-provider/VNode conventions are explicitly
adapted, not advertised as compatibility.

## Migration steps

**Delivery phase:** P6 — specialized dates. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** accepted native P4 date-string validation and scoped P3 focus/ownership;
broader P0 foundation task IDs remain open/partial.
**Next task:** Time for native formatting, then Countdown/Number Animation in dependency
order. Heatmap and Marquee remain separate. None is implemented here.

1. [x] **Author the month fallback.** Original captioned readable table, preserved
   heading/ARIA and hidden native navigation; exact fallback nodes restore on teardown.
2. [x] **Define date transitions.** Canonical Gregorian values/parts, leap/bounds,
   month/year clamping, adjacent dates, explicit today/first weekday and roving focus.
3. [x] **Add optional day content.** Atomic synchronous disabled/content preparation,
   safe text in native cell templates, no actions inside day buttons or VNode renderer.
4. [x] **Verify boundaries.** Year 1/99/centuries/9999, locale Gregorian override,
   keyboard/forms/focus/all-disabled/lifetime, native Chromium and independent budgets.

### Native primitives and fallback

One generated six-week native table uses at most 42 day cells; no grid/gridcell roles.
All unavailable dates remain focusable with aria-disabled for bounded discovery;
activation is guarded, so there is no unbounded search for a selectable date. Native
buttons own Enter/Space, arrows/Page/Home/End only move the roving focus/panel, and
Tab leaves normally. Existing fallback head/body nodes are parked and restored, never
converted to hidden selected-date inputs. Missing native date/Intl capability leaves
the readable fallback before enhancement; no dependency/polyfill is installed.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/calendar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **7 original local table rows + 7 original supplementary declarations +
3 explicitly added default-slot inline fields + 3 source alias/behavior supplements +
3 source-inherited theme rows = 23 tracker rows**.
All original 14 identities/links remain one-for-one. **20 native adaptations + three
intentional omissions; zero unresolved.** Date-only strings and native table semantics
are not epoch ABI, date-fns, locale-provider, VNode or all-browser/AT parity.

### Calendar Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L19) | Prop | Nullable canonical defaultValue and explicit silent reset; independent of current value and native form reset. No epoch default. | 🟢 Verified |
| [`is-date-disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L20) | Prop | Synchronous isDateDisabled(YYYY-MM-DD, frozen parts) must return boolean; prepared atomically. Source undefined/timestamp callback conventions are not retained. | 🟢 Verified |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L21) | Prop | Nullable YYYY-MM-DD value; separate panel/focus/availability. Programmatic unavailable value is retained visibly, never coerced to an instant or hidden form field. | 🟢 Verified |
| [`on-panel-change`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Callback | mui:calendar-panel-change with canonical panel, year/month, previous panel and reason; silent set/refresh do not emit. | 🟢 Verified |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Callback | mui:calendar-change after successful selection/clear, canonical value and 1-based parts; same selection does not emit twice. No timestamp ABI. | 🟢 Verified |

### Calendar Slots

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L29) | Slot | Authored native td template plus getDayContent(date, parts) literal text, outside the day button. No arbitrary HTML/VNode/action renderer. | 🟢 Verified |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Slot | Original heading level/children/ARIA, caption span and native navigation; only declared caption text is owned. No header render callback. | 🟢 Verified |

### Calendar Props: on-panel-change inline fields

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`on-panel-change.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Inline field | Event/state Gregorian year 1..9999. | 🟢 Verified |
| [`on-panel-change.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L22) | Inline field | Event/state month 1..12, not zero-based Date month or locale-calendar month. | 🟢 Verified |

### Calendar Props: on-update:value inline fields

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`on-update:value.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline field | Selected Gregorian year; null on the native clear extension. | 🟢 Verified |
| [`on-update:value.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline field | Selected 1-based month; null when cleared. | 🟢 Verified |
| [`on-update:value.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L23) | Inline field | Actual day-of-month; null when cleared. No local-midnight/DST conversion. | 🟢 Verified |

### Calendar Slots: header inline fields

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`header.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Inline field | state.year and native caption formatted with explicit Gregorian/UTC semantics. | 🟢 Verified |
| [`header.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L30) | Inline field | state.month 1..12, available to application-owned header composition. | 🟢 Verified |

### Explicitly added default-slot inline fields

These three public Markdown fields were missing from the original 14-row expansion;
they are added explicitly, not silently included in the old denominator.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default.year`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L29) | Added inline field | Frozen annotation CalendarDate.year, including adjacent visible dates. | 🟢 Verified |
| [`default.month`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L29) | Added inline field | Frozen annotation CalendarDate.month, always 1-based. | 🟢 Verified |
| [`default.date`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/demos/enUS/index.demo-entry.md#L29) | Added inline field | Frozen annotation CalendarDate.date, actual Gregorian day. | 🟢 Verified |

### Explicit source alias and behavior supplements

These are source-only review additions, not extra top-level English props.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`onUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L42) | Source alias | One DOM selection event; no duplicate camel/colon callbacks or callback-array compatibility layer. | 🟢 Verified |
| [`locale.firstDayOfWeek`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L183) | Source behavior | Explicit firstDayOfWeek 0..6, default Monday; not an injected locale tree or inferred calendar switch. | 🟢 Verified |
| [`today`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L103-L116) | Source behavior | Optional caller-supplied today string and panel-only Today command. No internal Date.now/midnight timer or UTC ISO slicing. | 🟢 Verified |

### Explicit source-inherited theme props

The [source useTheme.props spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/calendar/src/Calendar.tsx#L33)
adds three inherited source rows.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No provider/theme/peer graph; explicit external native CSS. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No style-object merge or CSS-in-JS variables. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No private theme precedence; broad P0/legacy exceptions remain separate. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
