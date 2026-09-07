# Dynamic Tags

**Plan: Planned. Current baseline: tag/input primitives only.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) provides closeable tags; [B2: forms.ts](../../../src/components/forms.ts) provides text input. Collection editing is absent.

- **HTML:** tag list, labelled input and native remove buttons.
- **JS:** insertion/removal, duplicate policy, IME-safe commit and value events.
- **CSS:** wrapping layout and editing/focus states.
- **Placement:** proposed `src/optional/dynamic-tags/`.

## Acceptance and gaps

Test empty/duplicate tags, max limits, focus after deletion, paste and composition. Input/tag customization must be explicitly scoped, not arbitrary framework-prop bags.

## Migration steps

**Delivery phase:** P4 — enhanced entry; P5 for collection behavior. **Task state:** 🔵 Planned.
**Prerequisites:** P2 Tag, P4 Input and explicit list identity in the [master plan](../migration-plan.md).
**Next task:** define tag value/label uniqueness and the exact user action that commits entered text.

1. [ ] **Compose native editing.** Retain a labelled input, tag list and real remove buttons with predictable keyboard order.
2. [ ] **Specify insertion policy.** Resolve whitespace, duplicates, limits, paste and composition without committing incomplete IME text.
3. [ ] **Define removal/defaults.** Keep external value changes silent and restore sensible focus when selected tags disappear.
4. [ ] **Exercise customized tags.** Test record labels, authored templates, rejected insertion and reset without input/tag prop passthrough.

### Native primitives and fallback

- **Native path:** a real text input, authored list and native remove buttons; optional tag templates clone DOM rather than interpret expressions. Stable tag keys retain existing nodes.
- **Small enhancement:** a custom element handles composition-aware insertion/removal and disposes listeners; CSS flex/gap wraps tags. Native form/text-list output is the fallback when enhancement is absent. Feature-detect optional suggestion popovers and reduce to plain entry instead of installing a token-input framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/dynamic-tags)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **19 local table rows + 13 supplementary declarations + 0 inherited rows = 32 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Input](input.md). Opaque types without local member definitions remain unreviewed.


### DynamicTags Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate explicit native-child configuration for `input-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `input-class` attribute or JS `inputClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS class/custom property for `input-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `max` attribute or JS `max`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS token/class for `round`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`render-tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate authored `render-tag` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`tag-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `tag-class` attribute or JS `tagClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tag-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L35) | Prop | External CSS class/custom property for `tag-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate JS `value` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-create`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Callback | Explicit `on-create` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L39) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`input`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Slot | Candidate authored `input` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Slot | Candidate authored `trigger` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTagsOption

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L45) | Record field | Candidate plain-JS `label` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L46) | Record field | Candidate plain-JS `value` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Props: color inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color.color?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color.borderColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color.textColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L24) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Props: render-tag inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`render-tag.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Inline record field | Candidate authored `render-tag.label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-tag.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L32) | Inline record field | Candidate authored `render-tag.value` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Props: on-create inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-create.label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Inline record field | Candidate DOM `mui:create.label` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-create.value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L38) | Inline record field | Candidate DOM `mui:create.value` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Slots: input inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`input.submit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`input.deactivate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L54) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DynamicTags Slots: trigger inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`trigger.activate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger.disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/dynamic-tags/demos/enUS/index.demo-entry.md#L55) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
