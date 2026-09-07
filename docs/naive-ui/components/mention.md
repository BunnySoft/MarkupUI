# Mention

**Plan: Planned. Current baseline: text input primitive only.**

## Baseline and target

[B1: forms.ts](../../../src/components/forms.ts) has no caret-anchored mention controller.

- **HTML:** native textarea/input with accessible suggestion list.
- **JS:** token boundary/caret tracking, cancellable search and stable insertion preserving surrounding text.
- **CSS:** separate suggestion panel; caret measurement is a narrowly documented layout exception.
- **Placement:** proposed `src/optional/mention/`.

## Acceptance and gaps

Test multiple prefixes, punctuation, composition, selection ranges, async races and Escape behavior. Custom option rendering uses authored templates, not VNodes or a rich-text framework.

## Migration steps

**Delivery phase:** P4 — enhanced text entry; P5 for async options. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Input selection/IME, P3 floating lists and cancellable search in the [master plan](../migration-plan.md).
**Next task:** specify prefix/token boundaries and how selecting a suggestion changes the native text selection.

1. [ ] **Retain the text control.** Adopt input/textarea content and selection; define a labelled suggestion region without a rich-text engine.
2. [ ] **Implement token search.** Recognize prefixes around the caret, cancel stale results and avoid queries during incomplete composition.
3. [ ] **Define insertion/focus.** Replace only the matched token, preserve surrounding text and dismiss/refocus predictably.
4. [ ] **Test caret cases.** Cover punctuation, multiple prefixes, selected ranges, scrolling, Escape and failed async requests.

### Native primitives and fallback

- **Native path:** an adopted input/textarea uses selectionStart/selectionEnd and native text editing; suggestion options may clone a small authored template without becoming a rich-text renderer.
- **Small enhancement:** a lifecycle-managed controller owns caret measurement and cancellable search. Feature-detect popover/resize observation for suggestions; fall back to ordinary text entry or a simple adjacent list. CSS handles list layout, and missing caret-overlay capability does not justify a polyfill/editor framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/mention)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **33 local table rows + 2 supplementary declarations + 0 inherited rows = 35 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Scrollbar](scrollbar.md). Opaque types without local member definitions remain unreviewed.


### Mention Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`autosize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate JS `autosize` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `separator` attribute or JS `separator`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`filter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate explicit JS `filter` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate JS `prefix` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate `placeholder` attribute or JS `placeholder`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate explicit JS `placement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate authored `render-label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollbar-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit native-child configuration for `scrollbar-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L41) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate explicit JS `to` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:show`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L45) | Callback | Candidate DOM `mui:change:show` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L46) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-select`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L47) | Callback | Candidate DOM `mui:select` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L48) | Callback | Candidate DOM `mui:focus` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-search`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L49) | Callback | Candidate DOM `mui:search` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L50) | Callback | Candidate DOM `mui:blur` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MentionOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L56) | Record field | Candidate plain-JS `class` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L57) | Record field | Candidate plain-JS `disabled` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L58) | Record field | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L59) | Record field | Candidate authored `render` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L60) | Record field | External CSS class/custom property for `style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L61) | Record field | Candidate plain-JS `value` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Mention Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`focus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L67) | Method | Candidate plain-JS `focus` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`blur`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L68) | Method | Candidate plain-JS `blur` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Mention Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`empty`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L74) | Slot | Candidate authored `empty` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Mention Props: autosize inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`autosize.maxRows?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`autosize.minRows?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/mention/demos/enUS/index.demo-entry.md#L27) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
