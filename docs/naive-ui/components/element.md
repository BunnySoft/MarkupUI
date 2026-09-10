# Element

**🟢 Verified native authoring composition; no new Element runtime, wrapper or export.**

## Baseline and target

[Canonical contract and acceptance](../../components/element.md) resolves this scope
through actual native tags/children and explicit CSS-variable consumption.
[Default-style audit](../../style-audit/components/element.md) classifies the visual
comparison as not applicable because no MarkupUI Element component or stylesheet exists.
The unchanged [MuiElement base](../../../src/core/element.ts) and
[registry](../../../src/components/elements.ts) are existing controller infrastructure,
**not** a new NElement/NEl wrapper or automatic theme-variable producer.

- **HTML:** author the needed semantic native element directly.
- **JS:** ordinary application click/submit listeners; no renderer or arbitrary prop forwarding.
- **CSS:** supported inherited/custom properties and author styles; no automatic common-theme aliases.
- **Placement:** separate [demo HTML](../../../demo/components/element.html),
  [CSS](../../../demo/components/element.css), [JS](../../../demo/components/element.js)
  and [tests](../../../tests/element.test.ts). No new source/export/distribution/budget.

## Acceptance and gaps

51 targeted tests, unchanged build/declarations/budgets and Chromium semantic role,
native action/form, nested/outside token, media/RTL/hidden, CSP/no-JS and legacy evidence
pass. All 1,142 previous distribution files byte-match. Source's automatic `role="none"`
is deliberately not copied. No all-browser/AT, global reset or complete theme-variable
compatibility is claimed.

## Upstream implementation evidence

Reviewed pinned English API, Element.ts, public index, light/dark/style type sources,
basic.demo.vue and the explicitly spread useTheme.props. Source uses Vue's tag renderer,
reads provider/theme configuration, derives unprefixed kebab-case variables from common
theme keys, and writes inline variables or render-time theme classes. It does not establish
MarkupUI `--mui-*` names. None of that machinery is transplanted; the retained capability
is native CSS consumption under actual author-controlled DOM ancestry.

## Migration steps

**Delivery phase:** P0 — native authoring conventions. **Task state:** 🟢 Verified.
**Prerequisites:** architecture's semantic HTML/light-DOM rules in the [master plan](../migration-plan.md).
**Next task:** Global Style, separately; P0 remains incomplete.

1. [x] **Map the tag surface.** Real native semantics; no dynamic tag factory or forced presentation role.
2. [x] **Define content preservation.** Native nodes, values, listeners and ARIA relationships remain authored.
3. [x] **Specify styling hooks.** Reuse accepted configuration example palettes with explicit supported tokens/local CSS.
4. [x] **Verify authoring examples.** Native heading/link/button/fieldset/form, no-JS, scope/media/CSP and legacy evidence; no upgrade required.

### Native primitives and fallback

- **Native path:** choose actual semantic tags, author real children, and use external CSS/native attributes/events. CSS inheritance follows DOM ancestry.
- **Small enhancement:** optional local listeners count native button activation and preview validated FormData without submission requests. No-JS links/fields/reset/disclosure remain usable. No template/slot evaluator, Shadow DOM, custom-element registration or polyfill is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/element)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **2 local table rows + 10 source supplements + 3 source-inherited rows = 15 tracker rows**.
Both original owner/name/kind/source identities remain, with **three adapted native
capabilities + twelve explicit omissions, zero unresolved rows**. Verified describes
the narrowed native capability, not upstream prop/type/export compatibility.


### Element Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md#L17) | Prop | ADAPTED: author the actual native tag; no dynamic prop, generic tag factory or subtree replacement. | 🟢 Verified | Native heading/link/button/fieldset/label/form behavior and stable authored nodes accepted. |

### Element Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/demos/enUS/index.demo-entry.md#L23) | Slot | ADAPTED: real authored child nodes, not a Vue slot callback, VNode construction or Shadow DOM projection. | 🟢 Verified | Native children/text/listeners/current values/ARIA survive local changes and listener disposal. |

### Element Props — explicitly source-inherited from useTheme.props

The spread is explicit in [Element.ts lines 10–11](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L10-L11).
These three source-inherited props are not extra English API table rows. Their ThemeProps
declaration is at [use-theme.ts lines 19–23](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L19-L23).

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | No ElementTheme provider/object input; use actual scoped author CSS. | ⏭️ Intentionally omitted | No theme graph or runtime stylesheet injection. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No extracted common/peer override object; native cascade and supported tokens instead. | ⏭️ Intentionally omitted | Local/inline precedence accepted under its native contract. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal built-in theme override bag or merge precedence. | ⏭️ Intentionally omitted | Do not expose a framework compatibility option. |

### Element — explicit source supplements

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`ElementProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L18) | Source type alias | No ExtractPublicPropTypes wrapper/type export; native HTML attributes belong to their elements. | ⏭️ Intentionally omitted | Existing MuiElement base is not this contract. |
| [`NEl`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/index.ts#L2) | Source export alias | No NEl/NElement factory or wrapper export; author native tags. | ⏭️ Intentionally omitted | No Element package entry or registered tag. |
| [`El`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L22) | Source component alias | No Vue component alias/registry; native elements require no upgrade. | ⏭️ Intentionally omitted | No new custom-element runtime. |
| [`role`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L61) | Source renderer attribute | Do not assign role none/presentation universally; preserve the chosen native semantics. | ⏭️ Intentionally omitted | Real browser heading/link/button/group behavior, not fake roles. |
| [`class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L62) | Source generated attribute | No merged class-prefix/theme-class generation; author ordinary classes directly. | ⏭️ Intentionally omitted | Native class cascade and per-element overrides remain author-owned. |
| [`cssVars`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L34-L42) | Source CSS-variable capability | ADAPTED: consume explicit supported --mui-* custom properties in external CSS; omit automatic common-theme/kebab-case alias generation and inline style-object writes. | 🟢 Verified | Actual heading/button/surface appearances, nested/outside scopes, media and overrides accepted. |
| [`themeClass / onRender`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/src/Element.ts#L43-L52) | Source theme-handle boundary | No render-time theme-class/style mounting or inlineThemeDisabled bridge. | ⏭️ Intentionally omitted | Strict external-CSS path adds no style nodes or inline attributes. |

### Element style types — explicit source supplements

The pinned [light](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/styles/light.ts)
and [dark](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/styles/dark.ts)
bindings refer to upstream common themes. Neither full palette nor their automatically
derived variables is supplied by this native recipe; existing Config Provider demo CSS
is reused unchanged for its independently authored token subset.

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`ElementThemeVars`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/styles/light.ts#L4) | Source interface | No upstream empty theme-vars extension/type alias. | ⏭️ Intentionally omitted | No complete common-variable compatibility promise. |
| [`ElementTheme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/styles/light.ts#L11) | Source interface | No Theme-based light/dark/common object graph; inherited author CSS instead. | ⏭️ Intentionally omitted | MarkupUI tokens are not upstream unprefixed or --n-* aliases. |
| [`ElementThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/element/styles/light.ts#L13) | Source interface | No extracted theme/peer/common override type. | ⏭️ Intentionally omitted | Native local declarations retain normal cascade behavior. |

<!-- END PINNED API INVENTORY -->
