# Typography

**Migration status: 🟢 Verified retained native HTML/CSS scope — CSS-only delivery.**
No Custom Element, ESM/classic runtime, observer, renderer or registration API is invented.
All original owner/prop/slot rows remain; source supplements are explicit and grouped.

## Baseline and target

[A1: retained contract and acceptance](../../components/typography.md) and
[S1: scoped native stylesheet](../../../src/components/typography/typography.css) implement
the new CSS-only path. [B1: legacy foundation.ts](../../../src/components/foundation.ts)
and [B2: legacy styles](../../../src/components/styles.ts) remain unchanged.

- **HTML:** native headings, paragraphs, lists, quotations, emphasis, code and links.
- **JS:** none. Existing legacy compatibility wrappers remain separate and untouched.
- **CSS:** scoped type scale, semantic colors/depth, native inline code/decoration, quotation/list alignment and link focus.
- **Placement:** `src/components/typography/typography.css`; exported only as `@dataengine/markup-ui/typography/style.css`.

## Acceptance and gaps

A1 records **300 passing tests** (10 focused CSS/native tests), a successful CSS-only build
and Chromium native hierarchy/content, links/focus/selection, RTL/alignment/wrapping, 200%
CSS zoom and before/after-legacy acceptance. Typography CSS is 1,423 gzip bytes under a
2,500-byte CSS-only ceiling; core remains 14,611/15,000 gzip bytes.
No registration order or collision protocol is needed for CSS alone. Shared heading/list
owners stay grouped, while A/Li/Hr and deprecated/theme source surfaces are identified below.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🟢 Verified retained CSS-only scope.
**Prerequisites:** P0 native semantics and theme stylesheet rules in the [master plan](../migration-plan.md).
**Next task:** coordinator selection of Icon; P2-01/P2 are not complete.

1. [x] **List semantic equivalents.** A1 maps native Text/P/H1–H6/Ul/Ol/Blockquote plus source A/Li/Hr, with no per-tag controllers or generated roles.
2. [x] **Extract typography rules.** S1 implements scoped scale/weight/depth/type, native decoration, quotations/lists and inline code; Code highlighting is excluded.
3. [x] **Preserve native navigation.** Native href/target/rel/download/selection/keyboard behavior remain untouched; no router or click interception.
4. [x] **Accept native structure.** A1 verifies no-JS content, hierarchy/numbering, focus, RTL/logical alignment, text zoom, scope isolation and unchanged legacy aliases.

### Native primitives and fallback

- **Native path:** actual headings, paragraphs, lists/items, blockquotes, emphasis, code,
  anchors and thematic breaks are the implementation. A stylesheet never changes their tags.
- **Small enhancement:** `.mui-typography` container or individual native opt-in classes,
  low-specificity CSS variables and logical properties only. Native HTML remains readable
  without CSS/JS; no fake ESM/classic bundle, lifecycle or framework-prop adapter is supplied.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/typography)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical baseline **5dcb190 / 0.11.0**, retained CSS-only implementation/evidence in A1/S1.
Inventory: **15 original public-document rows + 25 explicit source supplements = 40 rows**:
**17 Verified ADAPTED native targets and 23 Intentionally omitted runtime/framework contracts**.
Supplements are A/Li/Hr owners, deprecated Text `as`, and three theme contracts for each of
seven grouped source owners. Ul/Ol remain one documented owner group; their source is
verified in both [ul.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ul.tsx)
and [ol.tsx](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ol.tsx).
Verification means native/CSS adaptation, not source tag/theme/router API or pixel parity.


### Text Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L22) | Prop | ADAPTED scoped `data-type` semantic text colors. | 🟢 Verified | CSS only; non-default type takes precedence over depth. |
| [`strong`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L23) | Prop | ADAPTED native strong or presentation-only data-strong. | 🟢 Verified | Author chooses importance semantics; no tag rewriting. |
| [`italic`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L24) | Prop | ADAPTED native em/i or presentation-only data-italic. | 🟢 Verified | Native content/meaning retained. |
| [`underline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L25) | Prop | ADAPTED native u/data-underline and CSS decoration. | 🟢 Verified | Combined deletion/underline supported without JS. |
| [`delete`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L26) | Prop | ADAPTED real del markup. | 🟢 Verified | Semantic deletion is authored, not simulated on a span. |
| [`code`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L27) | Prop | ADAPTED real inline code markup. | 🟢 Verified | No syntax highlighting or Code-component import. |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L28) | Prop | ADAPTED data-depth 1/2/3 and external color tokens. | 🟢 Verified | Native CSS shades; no numeric prop controller. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L29) | Prop | Choose the actual native element. | ⏭️ Intentionally omitted | Runtime tag selection/replacement is not implemented by CSS. |

### P Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L35) | Prop | ADAPTED native p with data-depth. | 🟢 Verified | Paragraph shades and flow without generated roles or wrappers. |

### H1, H2, H3, H4, H5, H6 Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L41) | Prop | ADAPTED data-align-text with heading prefix bar. | 🟢 Verified | Logical hanging decoration aligns text with prose; not generic text-align. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L42) | Prop | ADAPTED heading data-type text/bar color. | 🟢 Verified | Public color intent retained; source primarily colors bar, so no pixel-parity claim. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L43) | Prop | ADAPTED data-prefix=bar on native h1–h6. | 🟢 Verified | Empty decorative pseudo-element; native hierarchy unchanged. |

### Ul, Ol Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L49) | Prop | ADAPTED data-align-text on native ul/ol. | 🟢 Verified | Logical indentation changes; markers/type/start/reversed/li value retained. |

### Blockquote Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L55) | Prop | ADAPTED native blockquote with logical hanging edge. | 🟢 Verified | Quote/cite/content stay native; RTL supported. |

### All Typography Components Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L61) | Slot | ADAPTED original native children for non-void owners. | 🟢 Verified | No renderer/projection/cloning; Hr remains a native void element as its source specifies. |

### Explicit source owner and deprecated supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`A`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/a.tsx) | Source owner | ADAPTED native a / a.mui-a. | 🟢 Verified | Native href/target/rel/download/SVG/selection/focus preserved; no router interception. |
| [`Li`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/li.tsx) | Source owner | ADAPTED native li / li.mui-li. | 🟢 Verified | Native list item and value/marker semantics; source has no custom props. |
| [`Hr`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/hr.tsx) | Source owner | ADAPTED native hr / hr.mui-hr. | 🟢 Verified | Native thematic break, not a generated role or content slot. |
| [`Text.as`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/text.tsx) | Deprecated source prop | Choose native HTML directly. | ⏭️ Intentionally omitted | No deprecated tag renderer/compatibility/warning layer. |

### Explicit grouped source theme supplements

These are framework contracts, not CSS-only implementations. Heading levels share one
factory; Ul/Ol share the documented owner grouping. Li declares no theme props.

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`Text.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/text.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`Text.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/text.tsx) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`Text.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/text.tsx) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`P.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/p.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`P.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/p.tsx) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`P.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/p.tsx) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`H1–H6.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/create-header.ts) | Grouped source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | One shared factory, no per-level controller. |
| [`H1–H6.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/create-header.ts) | Grouped source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`H1–H6.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/create-header.ts) | Grouped source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`Ul/Ol.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ul.tsx) | Grouped source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | Both list sources reviewed, no provider. |
| [`Ul/Ol.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ul.tsx) | Grouped source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`Ul/Ol.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ul.tsx) | Grouped source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`Blockquote.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/blockquote.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`Blockquote.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/blockquote.tsx) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`Blockquote.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/blockquote.tsx) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`A.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/a.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`A.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/a.tsx) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`A.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/a.tsx) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |
| [`Hr.theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/hr.tsx) | Source theme prop | External CSS/tokens. | ⏭️ Intentionally omitted | No provider/theme object. |
| [`Hr.themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/hr.tsx) | Source theme prop | External scoped CSS. | ⏭️ Intentionally omitted | No runtime object adapter. |
| [`Hr.builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/hr.tsx) | Source theme prop | External CSS source. | ⏭️ Intentionally omitted | No internal framework plumbing. |

<!-- END PINNED API INVENTORY -->
