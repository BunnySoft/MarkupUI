# Time

**🟢 Verified retained native instant-formatting scope.** A pure Intl formatter plus
an opt-in binding for one authored native time/Text node pair. Explicit Date/epoch
units, Gregorian/timezone policy, static relative references and bounded opt-in live
refresh replace date-fns/token/provider/VNode assumptions.

## Baseline and implementation evidence

The unchanged [legacy registry](../../../src/components/elements.ts) has no display-time
formatter. [Pure formatting](../../../src/components/time/format.ts) and the
[native binding](../../../src/components/time/time.ts) are independent optional modules;
[external typography CSS](../../../src/components/time/time.css) is small and optional.
No custom element or default-entry registration/style installation is added.

See the [canonical contract/acceptance](../../components/time.md),
[default-style audit](../../style-audit/components/time.md),
[deterministic tests](../../../tests/time.test.ts) and [separate local demo](../../../demo/components/time.html).
Pinned [props/defaults](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L9-L26),
[now/locale/format precedence](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L34-L99)
and [text/time renderer](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L105-L108)
were reviewed. Source unix conversion of Date.valueOf, missing datetime metadata,
token precedence and locale-provider behavior are not silently copied.

## Migration steps

**Delivery phase:** P6 — date display. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** explicit native value/lifetime/ownership conventions; Calendar and
Date Picker floating date/local-clock values are not implicitly promoted to instants.
**Next task:** Countdown, then Number Animation; Heatmap/Marquee remain separate.
No next component is implemented here. Broad P0 foundation IDs remain open/partial.

1. [x] **Author native time markup.** Readable static datetime/text, one existing
   text-only target, preserved author markup/ARIA and paired semantic writes.
2. [x] **Resolve formatting modes.** Native absolute/relative Intl, exact bounded
   instants/units, Gregorian timezone policy and explicit token/provider omissions.
3. [x] **Bound relative updates.** One boundary timer, explicit static/live references,
   selection/focus/visibility pauses, catch-up without loops and owned resource cleanup.
4. [x] **Test temporal display.** Epoch zero/negative/year bounds/DST/units/locale,
   relative thresholds, callback errors, ownership and native browser/asset acceptance.

### Native primitives and fallback

Native time[datetime] carries the represented instant, with an original Text node
for visible formatting. A pure formatter also serves caller-owned plain text.
No Date/Intl polyfill, date library, clock provider, generated renderer, role or ARIA
live region is installed. Unsupported native options fail before replacing a valid
pair. CSS inherits native typography/media; static authored time remains usable
without JS. Live updates are optional, bounded and paused for native reading/visibility.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/time)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **6 original local table rows + 3 explicit source supplements = 9 tracker
rows**. Every original identity/link remains one-for-one.
**Seven native adaptations + two intentional omissions; zero unresolved.**
No inherited theme props are invented: this source uses locale configuration, not
useTheme.props. Verified means the declared native adaptation, not token/locale
provider, date-fns distance, VNode or all-browser/AT parity.

### Time Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L22) | Prop | No date-fns token string/parser/precedence. Use the separate validated dateTime Intl options for absolute display. | ⏭️ Intentionally omitted |
| [`time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L23) | Prop | Explicit required Date or integer epoch input, including zero/negative values; bound Date inputs are snapshotted. Caller passes Date.now when desired, not an implicit fallback. | 🟢 Verified |
| [`time-zone`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L24) | Prop | Validated native timeZone, UTC default, fixed Gregorian calendar. Relative arithmetic remains elapsed units, not local calendar boundaries. | 🟢 Verified |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L25) | Prop | Pure relative formatter requires explicit to. Binding captures omitted to once unless live is explicitly enabled. | 🟢 Verified |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L26) | Prop | date/datetime/relative retained; explicit time-only display is a MarkupUI addition. Absolute subsets still represent an instant. | 🟢 Verified |
| [`unix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L27) | Prop | Explicit unit=milliseconds/seconds for numeric time/to; integer units only. Date objects always stay milliseconds and are never multiplied as Unix seconds. | 🟢 Verified |

### Explicit source supplements

These source-only identities were not part of the original six-row public inventory.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L24) | Source prop | formatTime(...).text supports caller-owned plain text; the bound path requires actual time and datetime. No wrapperless VNode mode. | 🟢 Verified |
| [`setup now snapshot`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L34) | Source behavior | Static missing relative reference captures the clock once; live is a separate opt-in. Main time input stays explicit; no accidental source now fallback for zero. | 🟢 Verified |
| [`localeRef / dateLocaleRef`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/src/Time.ts#L35) | Source behavior | No injected locale/date-fns-locale/token graph. Explicit native BCP47/Intl options are the alternative. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->
