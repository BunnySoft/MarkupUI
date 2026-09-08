# Affix

**Plan: 🟢 Verified for retained native sticky scope; seven explicit target/trigger/position/alias omissions.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) retains its basic layout attributes.
The new CSS-only native sticky composition does not redefine the aggregate or add a controller.

- **HTML:** original content, controls and normal-flow space remain in their authored container.
- **JS:** none in the component; optional demo scroll/form actions are application-owned.
- **CSS:** native sticky with logical auto/start/end offsets and explicit local layer; no fixed-position polyfill.
- **Placement:** [affix.css](../../../src/components/affix/affix.css), stylesheet export and [native demo](../../../demo/components/affix.html).

## Acceptance and gaps

The [canonical acceptance record](../../components/affix.md) reports 504 passing tests
(10 Affix cases), build/budget gates and Chromium window/nested/bottom/ancestor/flow/focus/
form/anchor/narrow/RTL/zoom/print/coexistence/no-JS evidence. CSS is 270 gzip bytes and
component JS is zero. Fixed/absolute target/trigger semantics are not silently claimed as
native sticky parity; core/plugins and their budgets remain unchanged.

## Migration steps

**Delivery phase:** P2 — native/CSS positioning. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P0 external CSS and explicit scroll-container ownership in the [master plan](../migration-plan.md).
**Next task:** Result. Five P2-assigned catalog rows remain Planned; full P2 is not complete.

1. [x] **Keep content in flow.** Original nodes, semantics and layout space remain; no placeholder or relocation.
2. [x] **Map offsets to CSS.** Explicit logical start/end insets and local layers, with no numeric/selector parser.
3. [x] **Scope non-sticky cases.** Fixed/absolute/custom-target/independent-trigger contracts and deprecated aliases deliberately omitted; no fake observer/callback.
4. [x] **Test containing blocks.** Window/nested/transformed/overflow/short/bottom cases, simultaneous insets, native focus/forms/anchors and print checked.

### Native primitives and fallback

- **Native path:** ordinary authored HTML with position:sticky and logical insets; natural scroll/containing-block constraints and form/focus behavior remain.
- **Small enhancement:** none beyond CSS. Unsupported/mis-constrained layouts remain native flow rather than receiving a scroll-driven polyfill. No registration, observer, listener lifecycle, teleport or affixed-state notification is offered.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/affix)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 original local table rows + 4 explicit source-only supplements + 0 inherited rows = 10 tracker rows**.
Every original pinned identity remains: **3 Verified ADAPTED native targets and 7
Intentionally omitted contracts**. Affix, its styles and scroll-target utilities were
reviewed for this scope. The source switches its own div to fixed/absolute; it does not
teleport or create a placeholder. No on-change callback or imperative update method is
declared in the reviewed public table/props/exports, and none is invented here.


### Affix Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L18) | Prop | --mui-affix-block-end CSS length/auto; native sticky end constraint, default auto. | 🟢 Verified ADAPTED target | Late-flow 10px end sticking and early-position counterexample verified; not a post-trigger fixed coordinate or arbitrary bottom docking. |
| [`listen-to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L19) | Prop | Native scroll ancestry only; selector/element/document/window/function target API not implemented. | ⏭️ Intentionally omitted | No custom listener target, observer or polling controller. Overflow/transformed ancestry constraints documented. |
| [`trigger-bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L20) | Prop | No separate bottom activation threshold/state machine. | ⏭️ Intentionally omitted | Sticky inset and containing-block constraints are not equivalent to independently configured trigger/position offsets. |
| [`trigger-top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L21) | Prop | No separate top activation threshold or stored trigger scroll position. | ⏭️ Intentionally omitted | No fake CSS trigger attribute, event or no-op update method. |
| [`position`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L22) | Prop | Fixed/absolute modes omitted; only native sticky is retained. | ⏭️ Intentionally omitted | Normal-flow width/space and boundary release intentionally differ from source out-of-flow positioning. |
| [`top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/demos/enUS/index.demo-entry.md#L23) | Prop | --mui-affix-block-start CSS length/auto; default auto, no numeric attribute conversion. | 🟢 Verified ADAPTED target | Window 8px/nested 12px sticking with preserved width/flow/focus; no independent fixed-position trigger semantics. |

### Explicit source-only supplements

These four source entries supplement the original six property rows. AffixProps derives
the same prop set; affixPropKeys and setup state are internal details, not newly invented
public imperative APIs. There are no mixed-in theme props in this component.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`offsetTop`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/Affix.tsx) | Source-only deprecated prop / offset-top | Deprecated trigger-top alias omitted. | ⏭️ Intentionally omitted | Source merges trigger/offset/top fallbacks; native CSS has no equivalent independent activation model. |
| [`offsetBottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/Affix.tsx) | Source-only deprecated prop / offset-bottom | Deprecated trigger-bottom alias omitted. | ⏭️ Intentionally omitted | Not falsely mapped to an always-active sticky end inset. |
| [`target`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/Affix.tsx) | Source-only deprecated prop | Function-selected scroll target alias omitted. | ⏭️ Intentionally omitted | Native ancestor selection only, with no listener target lifecycle or selector parser. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/affix/src/Affix.tsx) | Source-only slot | Original native authored wrapper/content/controls. | 🟢 Verified ADAPTED target | Nodes/listeners/order, normal-flow space, native anchors/forms/hidden/templates and print preserved. |

<!-- END PINNED API INVENTORY -->
