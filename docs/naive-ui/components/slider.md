# Slider

**🟢 Verified retained native scalar/two-track-pair scope, with explicit omissions.**

Original native range controls own movement/defaults/bounds/form values. Optional
[helpers](../../../src/components/slider/slider.ts) update non-live readouts and expose
strict scalar/pair setters plus pair committed changes. The pair allows crossing and never
rewrites endpoint min/max. [Legacy forms.ts](../../../src/components/forms.ts) is unchanged.
[Canonical contract/evidence](../../components/slider.md) · [Native demo](../../../demo/components/slider.html).

## Migration steps

**Delivery phase:** P4 — bounded entry. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native InputNumber/control ownership/reset conventions, not a numeric or
gesture framework. **Next:** Rate, then remaining native controls before Form enhancements.

1. [x] **Adopt range input.** Preserve labelled native controls/names/bounds/defaults and midpoint sanitization; no nullable number or proxy-slider model.
2. [x] **Map presentation.** Native accent/focus, datalist ticks/static labels and writing-mode/direction CSS; readouts are not tooltip parity.
3. [x] **Separate multiple handles.** Explicit two-track pair allows crossing, keeps tuple order and never derives bounds that corrupt reset; complex multi-thumb source behavior omitted.
4. [x] **Verify movement.** Native drag/keys/step/bounds, immediate pair defaults/reset, native FormData, non-live output/formatting, vertical/RTL/media/no-JS/coexistence acceptance recorded.

### Native primitives and fallback

No hidden field, synthetic slider handle, pointer geometry or keyboard engine. The CSS-only
native range remains usable without JS; live readouts are initially hidden. Pair controls
remain independently labelled and submitted, not a fake shared track or hidden sorted tuple.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/slider) · [API] ·
[Source] · [Types]. Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**19 original local rows + nine explicit source supplements = 28 rows:
13 Verified adapted targets + 15 Intentionally omitted.** Original owner/prop/slot identities
are preserved. Green means native adaptation, not exact source geometry/model behavior.
**L1** = [tests](../../../tests/slider.test.ts); **L2** =
[obtained acceptance](../../components/slider.md#acceptance).

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/demos/enUS/index.demo-entry.md
[Source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/src/Slider.tsx
[Types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/slider/src/interface.ts

### Slider Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default-value` · [API] L29 | Prop | Native defaultValue/value HTML per field | 🟢 Verified | L1/L2 midpoint when absent; no framework null/zero seed or dynamic reset bounds. |
| `disabled` · [API] L30 | Prop | Native disabled/fieldset | 🟢 Verified | Native pointer/keyboard/submission behavior. |
| `format-tooltip` · [API] L31 | Prop | Separate plain-text native readout formatter instead | ⏭️ Intentionally omitted | No popup or tooltip-format parity. |
| `keyboard` · [API] L32 | Prop | Native keyboard always retained | 🟢 Verified | L2 no second Arrow/Home/End engine; false override omitted. |
| `marks` · [API] L33 | Prop | Authored datalist ticks and scale labels | 🟢 Verified | Native tick support varies; no object/VNode marks or mark-only snapping. |
| `max` · [API] L34 | Prop | Native max and sanitization | 🟢 Verified | L1/L2 no manual clamping arithmetic. |
| `min` · [API] L35 | Prop | Native min and sanitization | 🟢 Verified | Native range defaults/degenerate bounds preserved. |
| `placement` · [API] L36 | Prop | No tooltip popup | ⏭️ Intentionally omitted | No anchored geometry/portal. |
| `range` · [API] L37 | Prop | Explicit two labelled native tracks | 🟢 Verified | Crossing allowed, tuple order preserved; not one-track dual-thumb parity. |
| `reverse` · [API] L38 | Prop | Authored native input dir | 🟢 Verified | L2 browser-owned reversed direction/keys. |
| `show-tooltip` · [API] L39 | Prop | No controlled popup visibility | ⏭️ Intentionally omitted | Non-live output is not a tooltip. |
| `step` · [API] L40 | Prop | Native step/grid rules | 🟢 Verified | Numeric/any native behavior; source 'mark' contract omitted. |
| `tooltip` · [API] L41 | Prop | No tooltip service | ⏭️ Intentionally omitted | No mandatory Tooltip/Popover dependency. |
| `vertical` · [API] L42 | Prop | Native writing-mode CSS | 🟢 Verified | L2 vertical range geometry/keys; horizontal fallback where unsupported. |
| `value` · [API] L43 | Prop | Finite native scalar or two-number tuple | 🟢 Verified | L1/L2 setters silent; null/arbitrary handle arrays omitted. |
| `on-update:value` · [API] L44 | Callback | Native events/current values; pair committed snapshot | 🟢 Verified | No duplicate per-input event/model updates. |
| `on-dragstart` · [API] L45 | Callback | Application may observe native pointer events | ⏭️ Intentionally omitted | No drag lifecycle engine/proxy. |
| `on-dragend` · [API] L46 | Callback | Native commit/pointer behavior | ⏭️ Intentionally omitted | No synthetic drag-end contract. |

### Slider Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `thumb` · [API] L52 | Slot | Real native range thumb | ⏭️ Intentionally omitted | No custom handle/rendered role-slider. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Slider `to` · [Source] | Source portal prop | None | ⏭️ Intentionally omitted | No tooltip portal/container API. |
| Slider `theme`, `themeOverrides`, `builtinThemeOverrides` · [Source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No provider/theme-object/CSS-in-JS translation. |
| Slider `onUpdateValue` · [Source] | Source alias | Native change/input observation | 🟢 Verified | No duplicate alias callback. |
| Slider source `defaultValue: 0` versus public null default · [Source] | Source default supplement | Native midpoint/defaultValue only | ⏭️ Intentionally omitted | Source default differs from public table; neither overrides native absent-value sanitization. |
| Slider `value`/`defaultValue` arbitrary number[] and more-than-two handles · [Source] | Source value extension | Exactly two independent native fields maximum | ⏭️ Intentionally omitted | No complex coupled/multi-thumb layout, sorted fill or handle engine. |
| Slider `ClosestMark` · [Source] | Source geometry type | Native datalist/step only | ⏭️ Intentionally omitted | No distance/index snapping algorithm. |
| Slider `OnUpdateValueImpl` · [Types] | Source callback type | Native events and own tuple snapshot | ⏭️ Intentionally omitted | No source number/arbitrary-array callback registration. |
| Slider `SliderSlots.default` · [Source] | Source slot declaration | Authored native DOM only | ⏭️ Intentionally omitted | No VNode default-slot API. |
| Slider `SliderSlots` · [Source] | Source VNode slot type | None | ⏭️ Intentionally omitted | No thumb/default renderer map. |

<!-- END PINNED API INVENTORY -->
