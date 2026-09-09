# Form

**Plan: 🟢 Verified for retained native Form/FormItem/FormItemGi scope.**

[Canonical contract, anatomy, ownership, submission recipe and evidence](../../components/form.md).
Optional `createForm` coordinates original native fields and small abortable callbacks;
external CSS provides item/grid presentation. Legacy core `forms.ts` remains unchanged.
No schema engine, reactive model, VNode rendering, provider or automatic submission layer.
Custom callback errors invalidate the explicit result, **not native custom validity**:
the helper never calls `setCustomValidity` or disables native validation.

## Migration steps

**Delivery phase:** P4 — forms. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** adopted native P4 controls and native P0 form contracts.
**Next task:** Auto Complete, before remaining OTP/dynamic/picker routes; not full P4 completion.

1. [x] **Use native submission/reset.** Real labels, fields, fieldsets, names, constraints, defaults and form association.
2. [x] **Resolve item ownership.** Fixed DOM mappings, exact keys, owned feedback tokens and native grid composition.
3. [x] **Bound validation.** Native validity plus one callback per item, immutable snapshots, AbortSignal and explicit failure results.
4. [x] **Test failure navigation.** Native reporting is explicit; default validation never focuses or submits. See canonical acceptance.

### Native primitives and fallback

Native form/label/legend/input/select/textarea and Constraint Validation remain authoritative.
FormItem is authored markup, FormItemGi a native grid item. Templates are application-owned
repeated DOM, not a schema. No-JS native validation/submission/reset remain usable.
Client custom checks require an explicitly gated application submit action and never replace
server validation. Feedback uses textContent, independent help/count tokens and no automatic
live regions. No ElementInternals workaround, hidden model values or external validator package.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/form)
- [Pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md)
- [Pinned implementation](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form)
- [Catalog](../index.md) · [Master plan](../migration-plan.md)

Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
All **93 original tracker identities** remain: **54 local rows + 13 supplementary
declarations + 26 inherited rows**. **18 explicit source supplements** below add exported
types/aliases and implementation-only contracts; **111 total rows**.
Verified means the documented **ADAPTED** native target, not source signature or framework
parity. Every retained mapping cites the canonical contract, targeted tests and demo;
omissions receive no implementation credit. Form.tsx/FormItem.tsx/FormItemGridItem's actual
wrapper, interface/public-types and index exports were source-reviewed. The source lookup/
Schema/provider/measurement algorithms are deliberately not ported.

### Form Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L37) | Prop | Native fieldset disabled, not form disabled. | 🟢 Verified | ADAPTED; eligibility/first-legend tests. |
| [`inline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L38) | Prop | `.mui-form[data-inline]` wrapping flex. | 🟢 Verified | External CSS; native order. |
| [`label-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L39) | Prop | `--mui-form-label-width` native CSS width. | 🟢 Verified | ADAPTED; global auto measurement omitted. |
| [`label-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L40) | Prop | `--mui-form-label-align`, logical start/end/center. | 🟢 Verified | External CSS, RTL native order. |
| [`label-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L41) | Prop | Stacked default; data-label-placement=left above 40rem. | 🟢 Verified | ADAPTED responsive layout, not provider inheritance. |
| [`model`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L42) | Prop | No object model; native properties/FormData/snapshots. | ⏭️ Intentionally omitted | No deep-path mutation or second store. |
| [`rules`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L43) | Prop | No nested rule maps; native constraints and explicit callback. | ⏭️ Intentionally omitted | Schema API excluded. |
| [`show-feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L44) | Prop | Optional mapped feedback node; omit mapping to opt out. | 🟢 Verified | No provider flag or hidden replacement error. |
| [`show-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L45) | Prop | Authored label and external visibility CSS; preserve name. | 🟢 Verified | Native naming, no label renderer. |
| [`show-require-mark`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L46) | Prop | Optional decorative aria-hidden mark. | 🟢 Verified | Native required is independent. |
| [`require-mark-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L47) | Prop | Authored mark order/external logical CSS. | 🟢 Verified | ADAPTED, no placement enum engine. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L48) | Prop | data-size small/large; medium default. | 🟢 Verified | Gap/text CSS, not control provider sizing. |
| [`validate-messages`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L49) | Prop | Native validationMessage and plain callback messages. | ⏭️ Intentionally omitted | No async-validator message schema. |

### FormItemRule Type

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`asyncValidator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L59) | Record field | Promise-returning item validator with signal/snapshots. | 🟢 Verified | ADAPTED; callback completion overload omitted. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L60) | Record field | No per-rule key; explicit item key instead. | ⏭️ Intentionally omitted | No individual-rule selection. |
| [`level`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L61) | Record field | Result level error/warning. | 🟢 Verified | Warnings do not invalidate; native errors win. |
| [`message`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L62) | Record field | Plain nonempty result message. | 🟢 Verified | textContent; no message DSL. |
| [`renderMessage`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L63) | Record field | No VNode/rich-message renderer. | ⏭️ Intentionally omitted | Separate authored help may be rich. |
| [`required`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L64) | Record field | Actual native required attribute. | 🟢 Verified | Radio-group browser semantics, no all-required checkbox trick. |
| [`trigger`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L65) | Record field | No rule trigger lists; manual APIs and optional item blur. | ⏭️ Intentionally omitted | Edits invalidate rather than run rules. |
| [`validator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L66) | Record field | One side-effect-free item validator returning null/message. | 🟢 Verified | ADAPTED return/context signature, explicit errors. |

### FormItem Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L78) | Prop | Authored content element classes. | 🟢 Verified | Original DOM retained. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L79) | Prop | External content CSS. | 🟢 Verified | No inline style-object forwarding. |
| [`feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L80) | Prop | Optional plain feedback node and returned messages. | 🟢 Verified | ADAPTED ownership; does not override native validity. |
| [`feedback-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L81) | Prop | Authored feedback classes. | 🟢 Verified | Original node retained. |
| [`feedback-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L82) | Prop | External feedback CSS. | 🟢 Verified | No inline style object. |
| [`first`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L83) | Prop | No first-rule option. | ⏭️ Intentionally omitted | All native failures plus at most one callback result per item. |
| [`ignore-path-change`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L84) | Prop | Changed mapping requires recreation/invalidation. | ⏭️ Intentionally omitted | Never retain stale result across paths. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L85) | Prop | Actual label/for or fieldset legend. | 🟢 Verified | No generated id/label replacement. |
| [`label-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L86) | Prop | --mui-form-label-align logical CSS. | 🟢 Verified | Native RTL/layout. |
| [`label-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L87) | Prop | Item data-label-placement=left or stacked default. | 🟢 Verified | Responsive CSS, no provider. |
| [`label-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L88) | Prop | Author attributes on actual label. | 🟢 Verified | No unrestricted prop-forwarder. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L89) | Prop | External label CSS. | 🟢 Verified | No style-object API. |
| [`label-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L90) | Prop | --mui-form-label-width native width. | 🟢 Verified | Global measured auto sizing omitted. |
| [`path`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L91) | Prop | Exact item key and explicit controls array. | 🟢 Verified | ADAPTED literal identity, no model path. |
| [`required`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L92) | Prop | Decorative mark only; actual constraint on native field. | 🟢 Verified | Preserves source mark/constraint distinction. |
| [`rule`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L93) | Prop | No merged item rule arrays; explicit callback alternative. | ⏭️ Intentionally omitted | No schema engine. |
| [`rule-path`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L94) | Prop | No rule lookup/path merging. | ⏭️ Intentionally omitted | Literal keys are not object paths. |
| [`show-feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L95) | Prop | Omit optional feedback mapping to opt out. | 🟢 Verified | Returned issues still available. |
| [`show-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L96) | Prop | Authored visible/visually-hidden label, preserving name. | 🟢 Verified | No generated label hiding. |
| [`show-require-mark`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L97) | Prop | Optional authored aria-hidden mark. | 🟢 Verified | Does not change required. |
| [`require-mark-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L98) | Prop | Native mark order/external CSS. | 🟢 Verified | No source placement parser. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L99) | Prop | External item CSS/inherited form sizing. | 🟢 Verified | Original controls size themselves. |
| [`validation-status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L100) | Prop | Leased data-form-status error/warning/success/pending. | 🟢 Verified | Presentation only; external values conditionally restored. |

### Form Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`validate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L114) | Method | validate({ keys?, reason? }) returns status/issues/current. | 🟢 Verified | Native + guarded custom; no implicit focus/submit. |
| [`restoreValidation`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L115) | Method | restoreValidation cancels work and restores owned feedback. | 🟢 Verified | Values/defaults/external custom validity unchanged. |
| [`invalidateLabelWidth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L116) | Method | Native CSS layout only. | ⏭️ Intentionally omitted | No label measurement graph. |

### FormItem, FormItemGi Methods

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`validate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Method | Parent coordinator validateField(exactKey). | 🟢 Verified | ADAPTED, no mandatory item instance. |
| [`restoreValidation`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L123) | Method | Shared coordinator restoreValidation alternative. | ⏭️ Intentionally omitted | No separate item restore method; cross-field invalidation stays coherent. |
| [`invalidateLabelWidth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L124) | Method | No measurement method. | ⏭️ Intentionally omitted | Pinned Gi wrapper forwards validate/restore only, despite shared docs. |

### Form Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L132) | Slot | Authored native form children. | 🟢 Verified | No slot renderer/provider. |

### FormItem, FormItemGi Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L138) | Slot | Original authored controls/content. | 🟢 Verified | Node identity and native semantics retained. |
| [`feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L139) | Slot | Explicit plain feedback element; rich help remains separate. | 🟢 Verified | ADAPTED, no VNode callback rendering. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L140) | Slot | Original native label/legend content. | 🟢 Verified | No cloning or replacement. |

### External inherited contract

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`async-validator rule vocabulary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L54) | External contract | Native constraints and explicit local callbacks. | ⏭️ Intentionally omitted | No external schema API. |
| [`AsyncValidatorOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | External contract | No external options forwarding. | ⏭️ Intentionally omitted | No dependency. |
| [`validation message schema`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L71) | External contract | Native text and plain callback message. | ⏭️ Intentionally omitted | No schema overrides. |

### Form Methods: validate inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`validate.warnings`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L114) | Inline record field | issues filtered by source=warning. | 🟢 Verified | ADAPTED result shape. |
| [`validate.paths`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L114) | Inline record field | Exact keys array selects mapped items. | 🟢 Verified | No prefix/model path lookup. |
| [`validate.shouldRuleBeApplied`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L114) | Inline record field | No rule predicate/filter engine. | ⏭️ Intentionally omitted | One callback per item. |

### FormItem, FormItemGi Methods: validate inline fields

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`validate.trigger?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | Explicit reason/context, not rule triggers. | ⏭️ Intentionally omitted | No trigger-filter semantics. |
| [`validate.callback?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | Await returned Promise. | ⏭️ Intentionally omitted | No dual callback/promise completion. |
| [`validate.callback.warnings`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | Result warning issues instead. | ⏭️ Intentionally omitted | Callback record omitted. |
| [`validate.shouldRuleBeApplied?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | No rule filter. | ⏭️ Intentionally omitted | Native constraints are not arbitrarily skipped. |
| [`validate.boolean`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | Preserve historical inventory identity, not a result boolean. | ⏭️ Intentionally omitted | Pinned signature uses predicate boolean; no standalone boolean member. |
| [`validate.options?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | No async-validator option passthrough. | ⏭️ Intentionally omitted | Narrow native/callback API only. |
| [`validate.warnings`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L122) | Inline record field | validateField returns source=warning issues. | 🟢 Verified | No source error-array shape claim. |

### FormItemGi inherited FormItem Props

The original 23 inherited identities are kept individually. Native item/grid composition
has the same retained DOM/feedback contract, not source provider inheritance.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L78) | Prop | Authored grid-item content classes. | 🟢 Verified | Same native FormItem contract. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L79) | Prop | External content CSS. | 🟢 Verified | No style-object passthrough. |
| [`feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L80) | Prop | Explicit plain feedback node. | 🟢 Verified | Conditional text/ARIA ownership. |
| [`feedback-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L81) | Prop | Authored feedback classes. | 🟢 Verified | Original DOM retained. |
| [`feedback-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L82) | Prop | External feedback CSS. | 🟢 Verified | No inline style-object API. |
| [`first`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L83) | Prop | No first-rule option. | ⏭️ Intentionally omitted | One callback per item. |
| [`ignore-path-change`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L84) | Prop | Mapping changes invalidate/recreate. | ⏭️ Intentionally omitted | No stale path retention. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L85) | Prop | Native label/legend. | 🟢 Verified | Grid does not own names. |
| [`label-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L86) | Prop | External logical alignment CSS. | 🟢 Verified | RTL preserves DOM order. |
| [`label-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L87) | Prop | Item placement attribute/external CSS. | 🟢 Verified | No Grid/Form provider. |
| [`label-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L88) | Prop | Actual label attributes. | 🟢 Verified | Native semantics preserved. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L89) | Prop | External label CSS. | 🟢 Verified | No style-object API. |
| [`label-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L90) | Prop | Native --mui-form-label-width. | 🟢 Verified | No global measured auto labels. |
| [`path`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L91) | Prop | Exact key plus original controls. | 🟢 Verified | Literal names/keys; no nested object paths. |
| [`required`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L92) | Prop | Decorative mark; native required is independent. | 🟢 Verified | No automatic constraint on grid item. |
| [`rule`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L93) | Prop | No item rule arrays. | ⏭️ Intentionally omitted | Explicit callback alternative. |
| [`rule-path`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L94) | Prop | No rule lookup. | ⏭️ Intentionally omitted | No model/provider graph. |
| [`show-feedback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L95) | Prop | Optional feedback mapping. | 🟢 Verified | Result issues independent of presentation. |
| [`show-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L96) | Prop | Authored label visibility with accessible name. | 🟢 Verified | No hidden labelled control replacement. |
| [`show-require-mark`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L97) | Prop | Optional decorative mark. | 🟢 Verified | Not validation state. |
| [`require-mark-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L98) | Prop | Authored order/logical CSS. | 🟢 Verified | No source mark positioning engine. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L99) | Prop | External grid/item CSS and form font/gaps. | 🟢 Verified | Control sizes remain separate. |
| [`validation-status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/demos/enUS/index.demo-entry.md#L100) | Prop | Leased data-form-status. | 🟢 Verified | Same feedback lifecycle on grid items. |

### FormItemGi inherited GridItem Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`offset`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L42) | Prop | Native absolute grid lines are an author alternative. | ⏭️ Intentionally omitted | No relative-offset packing; same as accepted Grid boundary. |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L43) | Prop | --mui-form-span / full span, or existing Grid CSS. | 🟢 Verified | Native responsive grid composition. |
| [`suffix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/grid/demos/enUS/index.demo-entry.md#L44) | Prop | Authored trailing DOM is not overflow-aware suffix packing. | ⏭️ Intentionally omitted | No mandatory Grid renderer. |

### Explicit source supplements — not original public table rows

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`Form.onSubmit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/Form.tsx) | Source prop | Native submit event; application explicitly owns enhancement. | 🟢 Verified | Library never preventDefaults submit or changes noValidate. |
| [`Form.theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/Form.tsx) | Source theme group | External CSS alternative. | ⏭️ Intentionally omitted | No theme/provider object API. |
| [`FormItem.theme / themeOverrides / builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/FormItem.tsx) | Source theme group | External CSS alternative. | ⏭️ Intentionally omitted | No CSS-in-JS implementation. |
| [`NFormItemGi / NFormItemGridItem / formItemGiProps / formItemGridItemProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/index.ts) | Source alias group | Named native FormItemGi/GridItem composition documented. | 🟢 Verified | ADAPTED anatomy, no constructor/prop-object aliases. |
| [`NFormItemCol / NFormItemRow / FormItemColProps / FormItemRowProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/index.ts) | Source deprecated companions | Use native CSS grid/rows. | ⏭️ Intentionally omitted | Separate deprecated renderer types preserved as identities. |
| [`FormProps / FormItemProps / FormItemGiProps / FormItemGridItemProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/index.ts) | Source public type group | FormOptions/FormItemOptions and authored markup instead. | ⏭️ Intentionally omitted | No upstream prop-shape aliases. |
| [`FormInst / FormItemInst`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source public type group | Explicit FormController alternative. | ⏭️ Intentionally omitted | No item provider instance or source overload shape. |
| [`FormRules`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source public type | No recursive rule map. | ⏭️ Intentionally omitted | Native constraints/callbacks only. |
| [`FormItemRule / FormItemRuleValidator / FormItemRuleAsyncValidator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source type group | FormValidator/Result use a deliberately different narrow contract. | ⏭️ Intentionally omitted | RuleItem inheritance, Error arrays, undefined/callback return conventions excluded. |
| [`FormValidateFilter / FormValidateOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source public type group | Exact keys selection alternative. | ⏭️ Intentionally omitted | No shouldRuleBeApplied or source union compatibility. |
| [`FormValidationError`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source public type | FormIssue discriminated native/custom/warning records. | ⏭️ Intentionally omitted | No ValidateError array identity claim. |
| [`FormSize / FormItemSize / FormValidationStatus`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/public-types.ts) | Source public type group | Documented CSS size/status vocabulary. | 🟢 Verified | ADAPTED CSS states, no same-name TS aliases. |
| [`LabelAlign / LabelPlacement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source type group | Native logical alignment and responsive placement CSS. | 🟢 Verified | Center source supplement; physical position algorithm not copied. |
| [`FormItemValidateOptions / FormItemValidate / FormValidate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source type group | Narrow Promise status/issues/current alternatives. | ⏭️ Intentionally omitted | Deprecated positional/dual completion overloads excluded. |
| [`FormItemSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source slot type | Authored native children instead of VNode arrays. | ⏭️ Intentionally omitted | Original named slots retained above as adapted anatomy. |
| [`FormItemInternalValidateResult / internalValidate`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source internal contract | No public internal validator/provider channel. | ⏭️ Intentionally omitted | Native result API only. |
| [`FormValidateMessages`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source type | No external ValidateMessages inheritance. | ⏭️ Intentionally omitted | Plain callback messages/native browser text. |
| [`ValidateCallback / FormValidateCallback / ShouldRuleBeApplied`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/form/src/interface.ts) | Source callback type group | Explicit Promise result handling alternative. | ⏭️ Intentionally omitted | No callback or per-rule filtering engine. |

<!-- END PINNED API INVENTORY -->
