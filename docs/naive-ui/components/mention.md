# Mention

**Plan: 🟢 Verified retained native editor/adjacent-choice scope.**

[Canonical token/API/focus/ownership contracts and evidence](../../components/mention.md).
[Default-style audit](../../style-audit/components/mention.md).
One original input/textarea, bounded contextual suggestions and explicit native button
activation replace only the prefix-to-caret fragment. No caret mirror, rich text, fake
combobox/listbox, portal/follower engine, VNode renderer or dependency.

## Migration steps

**Delivery phase:** P4 — native enhanced text entry; P5 renderer/geometry scope omitted.
**Task state:** 🟢 Verified retained scope.
**Prerequisites:** native Input/Form and accepted async snapshot/cancellation patterns.
**Next task:** Color Picker, then Date Picker/Time Picker; P4 overall remains In progress.

1. [x] **Retain the text control.** Original fields/labels/selection/defaults and a named adjacent region of real choice buttons.
2. [x] **Implement token search.** Bounded prefix/caret snapshots, Unicode code-unit rules, static/async data and stale cancellation.
3. [x] **Define insertion/focus.** Native setRangeText, exact range/maxlength checks, Tab/pointer activation and safe close/refocus.
4. [x] **Test caret cases.** Context/selection/IME/async/reset/focus review fixes, native forms/no-JS and bounded assets.

### Native primitives and fallback

Native input/textarea stays a normal named field without JS. The authored panel starts
hidden, in ordinary document flow, with an empty exclusive options list. No caret-relative
geometry claim or mirror layout exception is needed. Native button interaction is complete;
editor Enter/newline/Tab/arrows are not repurposed as listbox navigation.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/mention)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md)
- [Pinned implementation](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **35 original identities** remain: **33 local table rows + two inline declarations**,
no inherited rows. **Eleven explicit source supplements** give **46 total rows**.
Verified means an **ADAPTED** native target, not source popup/render/model compatibility.
Canonical tests/browser/build evidence applies to retained rows; omissions receive no credit.

Mention.tsx, interface/public-types and exports were reviewed. Its backward nearest-prefix
scan, partial-pattern end at caret and separator reuse informed the native contract.
Its mirror-position utility/follower/tree/menu/renderer machinery is deliberately omitted.

### Mention Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`autosize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Prop | Native textarea rows/resize and progressive field-sizing CSS. | 🟢 Verified | ADAPTED sizing; no JS row/caret measurement. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L28) | Prop | Strict bounded static/loader option records. | 🟢 Verified | Atomic safe button data, no object renderer. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L29) | Prop | Original native text/search input or textarea. | 🟢 Verified | No proxy/contenteditable editor. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L30) | Prop | One supported BMP unit, default space; reuse following separator. | 🟢 Verified | Prefix/CRLF conflicts rejected; no silent text normalization. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L31) | Prop | External native editor border CSS. | 🟢 Verified | No theme-object passthrough. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L32) | Prop | Native field/fieldset disabled eligibility. | 🟢 Verified | No insertion while barred; native FormData unchanged. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L33) | Prop | Native defaultValue/content/value attribute. | 🟢 Verified | Native reset; helper never rewrites defaults. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L34) | Prop | Boolean callback; static default startsWith on plain label/value. | 🟢 Verified | No mutation of original text/offsets. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L35) | Prop | Actual loader lifecycle and plain nonlive status. | 🟢 Verified | No selectable loading option or async focus. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L36) | Prop | One or 1–8 unique single BMP non-whitespace prefixes. | 🟢 Verified | Nearest prefix, no word boundary; multi-unit/invalid input rejected. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L37) | Prop | Authored native placeholder. | 🟢 Verified | Not a generated label. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L38) | Prop | Adjacent authored document flow instead. | ⏭️ Intentionally omitted | No caret/follower placement enum or geometry promise. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L39) | Prop | Plain native button labels. | ⏭️ Intentionally omitted | No VNode callback rendering. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L40) | Prop | Native overflow on authored list. | ⏭️ Intentionally omitted | No Scrollbar runtime/prop forwarding. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L41) | Prop | External small/medium/large CSS. | 🟢 Verified | No provider sizing graph. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L42) | Prop | Native/Form validation presentation, separate from search status. | 🟢 Verified | No custom-validity ownership or false success state. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L43) | Prop | Fixed authored adjacent panel. | ⏭️ Intentionally omitted | No portal target. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L44) | Prop | Original native string value, empty string rather than hidden null model. | 🟢 Verified | No rich-text/model store. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L45) | Callback | mui:mention-visibility for actual adjacent panel. | 🟢 Verified | Not source caret-popup visibility parity. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L46) | Callback | Native editing plus one insertion input notification. | 🟢 Verified | No duplicate synthetic change/value model. |
| [`on-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L47) | Callback | mui:mention-select with chosen option/prefix after actual insertion. | 🟢 Verified | Explicit button/command action, not inferred from text equality. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L48) | Callback | Original native focus event. | 🟢 Verified | No duplicate wrapper event or automatic async focus. |
| [`on-search`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L49) | Callback | Bounded loader/context and mui:mention-search. | 🟢 Verified | No requests without eligible prefix/query; no built-in HTTP. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L50) | Callback | Original native blur event. | 🟢 Verified | Candidate transitions preserved until activation, not prematurely dismissed. |

### MentionOption Properties

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L56) | Record field | Bounded native choice-button className. | 🟢 Verified | No unsafe selector/HTML interpolation. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L57) | Record field | Actual native button.disabled. | 🟢 Verified | Cannot insert disabled candidates. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L58) | Record field | Plain string textContent, distinct from inserted value. | 🟢 Verified | Function label branch omitted. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L59) | Record field | No custom option VNode renderer. | ⏭️ Intentionally omitted | Real native buttons only. |
| [`style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L60) | Record field | External CSS/classes instead. | ⏭️ Intentionally omitted | No inline style string/object forwarding. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L61) | Record field | Unique bounded single-token string, inserted via setRangeText. | 🟢 Verified | Well-formed Unicode, no prefix/separator/CRLF or implicit coercion. |

### Mention Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L67) | Method | Original control.focus(options). | 🟢 Verified | Explicit native action, not async response behavior. |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L68) | Method | Original control.blur(). | 🟢 Verified | No focus trap or duplicate editor. |

### Mention Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L74) | Slot | Authored plain status/region for empty results. | 🟢 Verified | No selectable empty sentinel or VNode engine. |

### Mention Props: autosize inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`autosize.maxRows?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Inline record field | Native/progressive CSS max-block-size. | 🟢 Verified | ADAPTED bound, not measured source row-count API. |
| [`autosize.minRows?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Inline record field | Native rows/min-block-size CSS. | 🟢 Verified | No hidden measuring textarea. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`onUpdateShow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx) | Source callback alias | Explicit adjacent visibility event instead. | ⏭️ Intentionally omitted | No callback-array alias ABI. |
| [`onUpdateValue`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx) | Source callback alias | Original native input/change alternative. | ⏭️ Intentionally omitted | No duplicate controlled-value callback prop. |
| [`internalDebug`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx) | Source private prop | No internal debug/display contract. | ⏭️ Intentionally omitted | No logging user text. |
| [`theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx) | Source theme group | External native CSS. | ⏭️ Intentionally omitted | No CSS-in-JS/provider. |
| [`MentionProps / mentionProps / NMention`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/index.ts) | Source public type/export group | Narrow MentionOptions and native editor/panel references. | ⏭️ Intentionally omitted | No framework prop/constructor aliases. |
| [`MentionOption`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/interface.ts) | Source generic public alias | Target MentionOption is an explicit four-field native subset. | ⏭️ Intentionally omitted | Source SelectBaseOption inheritance/render/style compatibility is not exported as an alias. |
| [`MentionInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/interface.ts) | Source public interface | Original native focus/blur, with separate MentionController. | ⏭️ Intentionally omitted | No source instance type ABI. |
| [`MentionSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/public-types.ts) | Source public type | Small/medium/large CSS vocabulary. | 🟢 Verified | ADAPTED styles, no TypeScript alias promise. |
| [`MentionSlots.default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/Mention.tsx) | Source slot declaration | Original authored editor instead of VNode[] injection. | ⏭️ Intentionally omitted | Kept distinct from the original public empty-slot row. |
| [`MentionSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/index.ts) | Source public slot type | Native panel/status anatomy. | ⏭️ Intentionally omitted | No VNode callback record compatibility. |
| [`getRelativePosition / Position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/src/utils.ts) | Source internal caret utility | Ordinary field-adjacent document flow. | ⏭️ Intentionally omitted | No textarea mirror/scroll/caret positioning algorithm or dependency. |

<!-- END PINNED API INVENTORY -->
