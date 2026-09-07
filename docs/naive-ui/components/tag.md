# Tag

**Migration status: 🟢 Verified for the retained native scope in `6605d29`.**
Verified rows below are **ADAPTED native targets**, not promises of Vue prop-shape parity.
Every original pinned inventory row is retained; source-only additions are identified separately.

## Baseline and target

[A1: accepted contract and evidence](../../components/tag.md) records the standalone migration.
[S1: controller](../../../src/components/tag/tag.ts), [S2: external CSS](../../../src/components/tag/tag.css)
and [S3: registration](../../../src/components/tag/index.ts) implement it. The unchanged basic
Tag in [B1: content.ts](../../../src/components/content.ts) remains the historical baseline.

- **HTML:** text/icon content and native remove button.
- **JS:** native toggle/close controls, silent reflected checked assignment, Boolean change
  notifications and cancellable close intent without automatic removal.
- **CSS:** external semantic colors, sizes, shapes, checked/disabled states and icon/avatar presentation.
- **Placement:** standalone `src/components/tag/`; ESM/classic plus CSS, not aggregate core.

## Acceptance and gaps

A1 records a successful build, **118 tests** (26 Tag-focused) and Chromium native keyboard,
focus, form-safety, close propagation, lifecycle, CSS and load-order acceptance. Core remains
14,611/15,000 gzip bytes. Tag ESM/classic/CSS measure 2,246/2,455/1,386 gzip bytes.
Load enhanced Tag before the legacy aggregate; the reverse order reports an explicit conflict.
Checkable suppresses closable, as upstream does. Removal and subsequent focus restoration
belong to the application. No keyboard deletion shortcut or form-field association is claimed.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Button behavior and P0 child/event contracts in the [master plan](../migration-plan.md).
**Next task:** continue with Badge; expand omitted Tag contracts only through a separate scope decision.

1. [x] **Adopt content and close control.** S1 retains text/icon/avatar nodes and a named native close button; templates remain inert.
2. [x] **Define optional checking.** Native `aria-pressed` toggle, silent assignment and Boolean `mui:change` are verified independently of removal.
3. [x] **Extract visual variants.** S2 owns colors, sizes, shape, disabled/focus and prefix styling; no prop-object or inline-style adapter.
4. [x] **Verify event boundaries.** A1 records native Enter/Space, close bubbling policy, lifecycle and form safety. Keyboard deletion and post-removal focus policy are explicitly application-owned, not untested claimed features.

### Native primitives and fallback

- **Native path:** passive spans/text or one native checkable button; separate close control
  exists only outside checkable mode. Known interactive label descendants are rejected
  rather than wrapped into nested interactive roots.
- **Small enhancement:** lifecycle-owned listeners and external inline-flex/state styles;
  no generic renderer. The icon-over-avatar CSS enhancement uses `:has()`; without support,
  author only one prefix to obtain the same usable static result. Unenhanced authored text
  remains readable; no fake native slot or removal behavior is advertised.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/tag)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
original baseline **5dcb190 / 0.11.0**, accepted retained implementation **6605d29**.
Inventory: **16 original table rows + 3 original inline fields + 12 explicit source supplements
= 31 tracker rows: 24 Verified ADAPTED targets and 7 Intentionally omitted contracts**.
Native event/CSS/DOM equivalents do not imply matching upstream objects, overloads or defaults.
Verification is limited to the retained contract and A1's evidence, not all-browser/pixel parity.


### Tag Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED `bordered="false"` / `.bordered`; true default. | 🟢 Verified | A1/S2; passive border geometry retained, checkable treatment borderless. |
| [`checkable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED presence attribute / `.checkable`, native button. | 🟢 Verified | A1/S1; real Enter/Space/focus; suppresses type palette and close control. |
| [`checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED `.checked` / attribute plus `aria-pressed`. | 🟢 Verified | Silent assignment, Boolean change detail; not a form-associated field or controlled Vue prop. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L29) | Prop | ADAPTED native close button and close intent. | 🟢 Verified | A1/S1; no automatic removal; absent while checkable. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Prop | ADAPTED external background/border/text CSS tokens. | 🟢 Verified | Color appearance retained; upstream object shape/parser/inline-style adapter omitted. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L31) | Prop | ADAPTED attribute/property and native disabled controls. | 🟢 Verified | A1 native fieldsets, focus guard and suppressed check/close activation. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L32) | Prop | ADAPTED attribute/property and CSS corners. | 🟢 Verified | Pill Tag, round avatar wrapper and close shape; S2. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L33) | Prop | ADAPTED tiny/small/medium/large attribute/property. | 🟢 Verified | 20/22/28/34px; medium default; no pixel-parity claim. |
| [`strong`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L34) | Prop | ADAPTED presence attribute/property, font weight 600. | 🟢 Verified | S2; authored native formatting remains intact. |
| [`trigger-click-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L35) | Prop | ADAPTED `.triggerClickOnClose` / presence attribute. | 🟢 Verified | Original close click bubbles only by opt-in; never a synthesized second click. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L36) | Prop | ADAPTED default/primary/info/success/warning/error. | 🟢 Verified | S2 passive palettes; ignored by checkable palette. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L37) | Callback | ADAPTED cancellable bubbling `mui:close`, `detail.originalEvent`. | 🟢 Verified | A1/S1; callback-array adapter omitted; no default removal. |
| [`on-update:checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L38) | Callback | ADAPTED `mui:change` with Boolean `detail`. | 🟢 Verified | Emitted once after native activation/reflection, never by programmatic assignment. |

### Tag Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L44) | Slot | ADAPTED authored `[data-mui-tag-avatar]` native content. | 🟢 Verified | S1/S2 preserve image/children; no implicit Avatar import; icon takes precedence. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L45) | Slot | ADAPTED native phrasing nodes/content span. | 🟢 Verified | Preserved listeners; no VNode renderer or Shadow DOM slot projection. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L46) | Slot | ADAPTED authored `[data-mui-tag-icon]`. | 🟢 Verified | Native nodes, explicit decorative semantics and icon-only names; A1. |

### Tag Props: color inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color.color?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | ADAPTED `--mui-tag-background` in external CSS. | 🟢 Verified | Appearance equivalent only; no color record passed at runtime. |
| [`color.borderColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | ADAPTED `--mui-tag-border-color`. | 🟢 Verified | External CSS replaces the object field. |
| [`color.textColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | ADAPTED `--mui-tag-color`. | 🟢 Verified | Passive text-color token; separate checkable tokens documented in A1. |

### Explicit source-only supplements

These twelve additions come from the pinned source review recorded in A1, not the public
Markdown table. Private/deprecated/framework surfaces remain visible without parity credit.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`onMouseenter`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Source callback | ADAPTED native `mouseenter` listener. | 🟢 Verified | Ordinary DOM event; no callback prop adapter. |
| [`onMouseleave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Source callback | ADAPTED native `mouseleave` listener. | 🟢 Verified | Ordinary DOM event; no callback prop adapter. |
| [`onUpdateChecked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Source callback alias | ADAPTED Boolean `mui:change`. | 🟢 Verified | Same notification as the public checked-update row, not an extra event. |
| [`onUpdate:checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Source callback alias | ADAPTED Boolean `mui:change`. | 🟢 Verified | Native silent programmatic assignment; A1/S1. |
| [`setTextContent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Source public method | ADAPTED native `textContent` on an authored label node. | 🟢 Verified | Explicit destructive native operation; replacing `contentElement` text also removes prefix nodes. No library method clone. |
| [`onCheckedChange`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Deprecated callback | Use `mui:change`. | ⏭️ Intentionally omitted | Deprecated adapter/warning machinery not reproduced. |
| [`internalCloseFocusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Private source prop | Native close is keyboard-focusable when enabled. | ⏭️ Intentionally omitted | Private focus switch omitted. |
| [`internalCloseIsButtonTag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Private source prop | Close is always a native button. | ⏭️ Intentionally omitted | No non-native close impersonation. |
| [`$el`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Framework ref field | Query the actual Custom Element. | ⏭️ Intentionally omitted | No framework ref wrapper. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Inherited source prop | External CSS/custom properties. | ⏭️ Intentionally omitted | No framework theme object/provider. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Inherited source prop | External scoped CSS. | ⏭️ Intentionally omitted | No object-shape compatibility. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx) | Inherited source prop | External CSS source of truth. | ⏭️ Intentionally omitted | No internal framework override plumbing. |

<!-- END PINNED API INVENTORY -->
