# Equation

**Resolved exclusion / verified native alternative.** TeX/KaTeX conversion remains
intentionally omitted. Native authored MathML and visible explanations are accepted
as a zero-JS authoring recipe, not as a renamed parser or Equation component.

## Baseline and resolution

The unchanged [registry](../../../src/components/elements.ts) has no Equation or
KaTeX integration. The [canonical contract/evidence](../../components/equation.md),
[separate native HTML](../../../demo/components/equation.html),
[local CSS](../../../demo/components/equation.css) and
[tests](../../../tests/equation.test.ts) demonstrate inline powers, block fractions,
subscript/square root and a two-by-two matrix with plain explanations.
There is no new source directory, helper/export, runtime/distribution, font or dependency.

Reviewed the pinned [public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L40-L48),
[implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/src/Equation.tsx#L7-L43),
[public exports](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/index.ts#L1-L2)
and [referenced opaque KaTeX types](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/katex.ts#L5-L9).
Source supplied/provider KaTeX, renderToString/options/error behavior and extracted
HTML wrapper rendering are explicitly excluded. MathML is not raw-TeX compatibility.

## Migration steps

**Delivery lane:** deferred/exclusions — TeX renderer omitted.
**Task state:** resolved exclusion / 🟢 Verified native alternative.
**Prerequisites:** native authored content and zero-dependency policy; broader P0
foundation rows are unchanged and not completed by this recipe.
**Next task:** QR Code exclusion/native-alternative resolution, separately.

1. [x] **Confirm omitted scope.** TeX parsing, KaTeX options/provider/render/error
   contracts remain outside every runtime bundle and all API rows remain omissions.
2. [x] **Author an accessible alternative.** Real MathML namespace/structure, inline/
   block examples, semantic labels, native captions and visible mathematical prose.
3. [x] **Define minimal presentation.** Scoped external application CSS, system
   math font, native overflow/focus/RTL/media; no expression conversion or new asset.
4. [x] **Review alternative support.** Native Chromium geometry/AX/no-JS/CSP/
   selection/forms/zoom/print plus tests/build, with no all-browser/AT or TeX parity claim.

### Native primitives and fallback

Author actual math/mrow/mi/mn/mo/mfrac/msup/msub/msqrt/mtable/mtr/mtd elements.
Use display="inline"/"block" for native placement and explicit notation direction.
No JS is needed; programmatic authoring uses createElementNS and literal text, not
untrusted markup parsing or a sanitizer. Native captions/explanations remain readable
if math rendering or pronunciation is unsuitable. A separately authored labelled
local image plus equivalent text is another application choice, not an image renderer
shipped here. No script, external font, remote service, role=grid or hidden form value.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/equation)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **3 original public rows + 2 explicit grouped type/export supplements +
3 source-behavior supplements = 8 tracker rows; no inherited rows**.
All three original identities/source links remain one-for-one.
**Zero implemented/adapted API rows; eight intentional omissions.** Four accepted
alternative-guidance tasks are not TeX/KaTeX implementation credit.

### Equation Props

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`katex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L46) | Prop | No supplied typesetter object or automatic dependency/font import. Author native MathML or meaningful text/image content. | ⏭️ Intentionally omitted |
| [`katex-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L47) | Prop | No KaTeX options, macros, errors, trust or formatting contract. Native display="inline"/"block" is an authoring alternative, not an options adapter. | ⏭️ Intentionally omitted |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/demos/enUS/index.demo-entry.md#L48) | Prop | No TeX/LaTeX string conversion or reactive value renderer. Author structured MathML nodes; raw TeX stays literal text. | ⏭️ Intentionally omitted |

### Explicit grouped type/export supplements

These source identities were absent from the original public-row inventory. Referenced
KaTeX types are opaque composition contracts, not inherited component APIs or a promise
to inventory every external KaTeX option.

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`EquationProps / equationProps / NEquation`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/index.ts#L1-L2) | Source type/export group | No Vue prop extractor, component/factory export or native alias. Direct HTML needs no runtime registration. | ⏭️ Intentionally omitted |
| [`Katex / KatexOptions`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/config-provider/src/katex.ts#L5-L9) | Referenced source type group | No renderToString-compatible interface or Record<string, unknown> options forwarding; no fake native equivalent. | ⏭️ Intentionally omitted |

### Explicit source-behavior supplements

| Upstream item · source | Kind | Resolution / native alternative | Status |
| --- | --- | --- | --- |
| [`Config Provider KaTeX fallback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/src/Equation.tsx#L19-L24) | Source behavior | No provider injection or props-versus-provider typesetter precedence. Authored content has no configuration graph. | ⏭️ Intentionally omitted |
| [`renderToString / throwOnError / missing output`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/src/Equation.tsx#L24-L27) | Source behavior | No value-or-empty parsing, default throwOnError=false with later caller overrides, or "no katex provided" output. Invalid/source-error policy is not imitated. | ⏭️ Intentionally omitted |
| [`wrapper extraction / innerHTML renderer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/src/Equation.tsx#L28-L40) | Source behavior | No regex-derived tag/class, HTML string adoption or renderer slot. Original MathML/Text nodes remain application-owned. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

## Acceptance and remaining work

**39 tests passed** (12 Equation recipe + 27 native/legacy), declarations/build and
existing budgets. **1,316 existing distribution files byte-matched**; no source/
package/build/P0 foundation change. The complete local HTML+CSS example is **2,277**
gzip bytes; there is no new library bundle.

Chromium verified native MathML namespace, stacked fractions/superscripts/root/matrix,
MathML AX roles/names, original selection/order/forms, native disclosure/reset/scroll,
RTL notation policy, 200% zoom/narrow, forced-colors/print and JavaScript-disabled
strict-CSP rendering with only local HTML/CSS requests. Screen-reader pronunciation,
duplicate-free speech, arbitrary formula fitting and TeX parity are not promised.

Equation's exclusion/native alternative is resolved. **QR Code, Legacy Grid and
Legacy Transfer** still require their separate alternative-guidance acceptance;
broad P0 foundation work remains pending/partial and parent-owned. QR Code is next,
not implemented here.
