# Thing

**Plan: 🟢 Verified for retained native Thing scope; five explicit style/theme omissions.**

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) supplies legacy cards, not a Thing
controller. Card/List/PageHeader conventions informed the native composition, but their
runtimes/styles are not dependencies and the aggregate remains unchanged.

- **HTML:** author-selected article/div, avatar, lead/header/header-extra/description, content, footer and native action regions.
- **JS:** none in the component; optional application listeners own submit/follow behavior.
- **CSS:** isolated native grid indentation, media/header/action alignment and logical wrapping.
- **Placement:** [thing.css](../../../src/components/thing/thing.css), stylesheet export and [native demo](../../../demo/components/thing.html); no component constructor.

## Acceptance and gaps

The [canonical acceptance record](../../components/thing.md) reports 455 passing tests
(12 Thing cases), build/budget gates and Chromium anatomy/names/forms/focus/indent/hidden/
nested/narrow/RTL/zoom/print/forced-colors/legacy/no-JS evidence. CSS is 841 gzip bytes;
component JS is zero, core remains 14,611/15,000 and widgets 2,779/4,000 gzip bytes.
Framework prop/slot shapes become explicit native anatomy, not constructor/renderer parity.

## Migration steps

**Delivery phase:** P2 — compound content. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P1 Card and P2 List/Typography in the [master plan](../migration-plan.md).
**Next task:** Table. Eight residual P2-assigned catalog rows remain Planned; full P2 is not complete.

1. [x] **Name authored regions.** Seven native regions with author-selected headings, media names and content.
2. [x] **Keep interactions native.** Passive host, independent native links/buttons and real form association.
3. [x] **Implement media-object CSS.** Native grid indentation and wrapping header/actions without moving nodes or changing reading order.
4. [x] **Exercise sparse content.** Missing/hidden/template/nested regions, long text, native controls and no-JS forms accepted without a controller.

### Native primitives and fallback

- **Native path:** an authored article/div containing native headings/media/text/actions; place it inside a real li for list composition. Templates may be cloned explicitly by the application.
- **Small enhancement:** grid/flex/logical gaps align regions and indent content; normal authored flow is the fallback. No dedicated custom element, runtime renderer, style-object bridge, provider or Shadow DOM slot projection.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/thing)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **16 original local table rows + 3 explicit source-only supplements + 0 inherited rows = 19 tracker rows**.
Every original owner/row/pinned identity remains: **14 Verified ADAPTED native targets and
5 Intentionally omitted contracts**. Thing and presentation source were reviewed for this
retained scope, not every framework edge case. Defaults, anatomy, omissions and actual
evidence are recorded in the canonical implementation document.


### Thing Props

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`content-indented`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L20) | Prop | Presence data-content-indented; default absent spans content/footer/actions full-width. Visible avatar enables their lead-column alignment. | 🟢 Verified ADAPTED target | Live 60px alignment change preserved nodes/focus; hidden/template avatars do not create a phantom indent. |
| [`content`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L21) | Prop | Authored .mui-thing-content text/nodes; textContent for plain dynamic strings. | 🟢 Verified ADAPTED target | Rich forms/lists/long content and original nodes retained; no string renderer. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L22) | Prop | Native classes/classList on the actual content region. | 🟢 Verified ADAPTED target | Authored content class and listener identity preserved; no host forwarding. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L23) | Prop | External CSS on actual content rather than runtime string/object forwarding. | ⏭️ Intentionally omitted | No CSS-in-JS/style-object adapter or prop evaluator. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L24) | Prop | Native .mui-thing-description inside lead; independent of whether a header is present. | 🟢 Verified ADAPTED target | Description-only/avatar case remains visible; no source conditional suppression or generated heading. |
| [`description-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L25) | Prop | Native classes/classList on the description node. | 🟢 Verified ADAPTED target | Original class and authored content retained without runtime forwarding. |
| [`description-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS on the native description region. | ⏭️ Intentionally omitted | Runtime string/object style contract is not reproduced. |
| [`title-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L27) | Prop | Authored .mui-thing-header-extra text or native controls beside the title. | 🟢 Verified ADAPTED target | Logical wrapping/alignment and native action names; no string/slot precedence engine. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L28) | Prop | Actual .mui-thing-title heading/header content, with author-selected level. | 🟢 Verified ADAPTED target | Native names/headings/links; no tooltip mapping or generated heading. |

### Thing Slots

| Upstream item · source | Kind | Retained MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`action`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L34) | Slot | Authored .mui-thing-action region with independent links/buttons. | 🟢 Verified ADAPTED target | Native keyboard, disabled/fieldset, external form association, validation/reset/submission and no-JS GET behavior. |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L35) | Slot | Actual .mui-thing-avatar media/glyph region before lead. | 🟢 Verified ADAPTED target | Image alt/src/dimensions and SVG name preserved; no Avatar/Icon dependency or node move. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L36) | Slot | Native rich content children in .mui-thing-content. | 🟢 Verified ADAPTED target | Long/nested/list/form content retains ownership and order; no VNode projection. |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L37) | Slot | Authored description nodes inside lead. | 🟢 Verified ADAPTED target | Sparse and hidden regions handled without truthiness rendering or placeholders. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L38) | Slot | Optional authored .mui-thing-footer; native footer semantics only when appropriate. | 🟢 Verified ADAPTED target | Original metadata/time content, indentation and hidden behavior preserved. |
| [`header-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L39) | Slot | Authored .mui-thing-header-extra alongside title. | 🟢 Verified ADAPTED target | Native named follow button and wrapping/RTL alignment; no generated action root. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md#L40) | Slot | Authored title/header nodes inside native header region. | 🟢 Verified ADAPTED target | Author-selected heading/landmark semantics; no title/slot fallback evaluation. |

### Explicit source-only supplements

These three mixed-in declarations supplement, rather than replace, the 16 public rows.
Reviewed source has no size/alignment/prefix props or slots, render callbacks, or
component-specific event/method API. Native CSS customization and leading-avatar content
are not credited as invented upstream features.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Thing prop | External CSS instead of a framework theme/provider object. | ⏭️ Intentionally omitted | Thing spreads useTheme.props; no native runtime/provider is needed. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Thing prop | CSS tokens rather than runtime override merging. | ⏭️ Intentionally omitted | No style-object bridge, theme execution or animation dependency. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts) | Source-only mixed-in Thing prop | No built-in override object. | ⏭️ Intentionally omitted | Author-owned external styles; zero runtime dependencies. |

<!-- END PINNED API INVENTORY -->
