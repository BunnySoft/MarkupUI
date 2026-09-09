# Rate

**🟢 Verified retained native integer/half-choice/clear/static-readonly scope.**

Native radios/labels/fieldset own scoring interaction. The
[helper](../../../src/components/rate/rate.ts) reuses [Radio](../../components/radio.md)
for name/form/tree boundaries, native exclusivity and aggregate events; it adds bounded
score validation, clear and non-live text. No star/control renderer or pointer hit zones.
[Legacy widgets Rating](../../../src/plugins/widgets.ts) is unchanged.
[Canonical contract/evidence](../../components/rate.md) · [Native demo](../../../demo/components/rate.html).

## Migration steps

**Delivery phase:** P4 — bounded selection. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Radio ownership/reset/keyboard and authored icon CSS.
**Next:** Form native validation, before remaining Auto Complete/OTP/dynamic/picker routes.

1. [x] **Specify scoring.** Bounded count, canonical integer/half strings, explicit zero versus null and static readonly versus native disabled are documented.
2. [x] **Implement labelled choices.** Real native radios expose all scores, with stable legend/labels, visible check state and no duplicated roving engine.
3. [x] **Scope fractional ratings.** Half scores are explicit keyboard choices with decorative half-fill; custom text/SVG is authored, not an icon/gesture/VNode dependency.
4. [x] **Validate score changes.** Native arrows/Space/labels/default/reset/forms, clear/readout/focus, half/disabled/static states and browser/media/no-JS/coexistence accepted.

### Native primitives and fallback

No hidden score, fake readonly radio, role-rating/slider proxy or reverse DOM star trick.
Native controls remain usable without JS; helper-only null clear and readout stay hidden.
Radio's complete native-peer contract and jsdom caveats still apply.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

[Official page](https://www.naiveui.com/en-US/os-theme/components/rate) · [API] ·
[Source] · [Types] · [Size]. Pinned Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
**12 original local rows + one original inline field + six explicit source supplements =
19 rows: 13 Verified adapted targets + six Intentionally omitted.** All 13 original
owner/prop/slot/inline identities remain. **T1** = [tests](../../../tests/rate.test.ts);
**T2** = [obtained acceptance](../../components/rate.md#acceptance). Green is native adaptation,
not exact source callback/renderer/pointer parity.

[API]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md
[Source]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/src/Rate.tsx
[Types]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/src/interface.ts
[Size]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/src/public-types.ts

### Rate Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `allow-half` · [API] L24 | Prop | Explicit labelled native half-step radio choices | 🟢 Verified | T1/T2 keyboard routes and native strings; no invisible pointer zones. |
| `clearable` · [API] L25 | Prop | Authored type=button clear | 🟢 Verified | T1/T2 no-rating null; clicking a selected native radio does not clear. |
| `color` · [API] L26 | Prop | External CSS active-color token | 🟢 Verified | No inline color prop or reliance on color alone. |
| `count` · [API] L27 | Prop | Bounded integer max score 1–10, authored full choices | 🟢 Verified | No unbounded allocation/renderList; half mode at most 20 nonzero radios. |
| `default-value` · [API] L28 | Prop | Native checked HTML/defaultChecked | 🟢 Verified | T1/T2 silent reset/default changes, no hidden score model. |
| `readonly` · [API] L29 | Prop | Static labelled score, no form controls | 🟢 Verified | T1/T2 distinct from disabled interactive radios; no hidden submission. |
| `size` · [API] L30 | Prop | CSS small/medium/large or explicit length token | 🟢 Verified | No renderer/numeric inline-style forwarding. |
| `value` · [API] L31 | Prop | Native selected numeric score/null; strict setter | 🟢 Verified | T1/T2 zero is an explicit `"0"` choice, null has no submitted field. |
| `on-clear` · [API] L32 | Callback | One root mui:rate-clear event | 🟢 Verified | No fake native radio input/change when clearing. |
| `on-update:hover-value` · [API] L33 | Callback | CSS hover emphasis only | ⏭️ Intentionally omitted | No numeric hover-preview callback or pointer geometry state. |
| `on-update:value` · [API] L34 | Callback | Native change/Radio commit and explicit clear | 🟢 Verified | No duplicate Rate change event or callback-prop model. |

### Rate Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default` · [API] L40 | Slot | Authored aria-hidden Unicode/SVG glyph content | 🟢 Verified | T1/T2 visible native score labels; no VNode/icon package dependency. |

### Rate Slots: default inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| `default.index` · [API] L40 | Inline record field | Authored DOM order rather than renderer context | ⏭️ Intentionally omitted | No index/VNode callback or implicit node generation. |

### Explicit source-only supplements

| Upstream owner/item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| Rate `onUpdateValue` · [Source] | Source alias | Native change/Radio commit and clear | 🟢 Verified | No duplicated alias notification. |
| Rate `onUpdateHoverValue`, `onUpdate:hoverValue` · [Source] | Source aliases | CSS hover only | ⏭️ Intentionally omitted | No hover value model/event. |
| Rate `theme`, `themeOverrides`, `builtinThemeOverrides` · [Source] | Source theme group | External CSS tokens | ⏭️ Intentionally omitted | No theme/provider/CSS-in-JS layer. |
| Rate `RateSize` · [Size] | Source type | Standard CSS sizes and explicit CSS length | 🟢 Verified | No programmatic style renderer. |
| Rate `RateOnUpdateValue`, `RateOnUpdateValueImpl` · [Types] | Source callback types | Native events/own numeric getter | ⏭️ Intentionally omitted | No intersection/union callback registration contract. |
| Rate `getDerivedValue` / pointer half-hit and hover calculations · [Source] | Source interaction implementation | Explicit native half choices | ⏭️ Intentionally omitted | No offsetX/width hit-zone or gesture engine. |

<!-- END PINNED API INVENTORY -->
