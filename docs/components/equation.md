# Equation: resolved exclusion, native MathML alternative

**Resolved exclusion / verified native alternative, not a TeX implementation.**
TeX/LaTeX parsing, KaTeX integration/configuration, provider lookup and HTML
typesetting remain intentionally omitted. The useful alternative is original
application-authored MathML with plain mathematical explanations.

There is **no Equation helper, Custom Element, public export, package dependency,
generated stylesheet, distribution asset or new budget**. The separate
[HTML](../../demo/components/equation.html), [CSS](../../demo/components/equation.css)
and [tests](../../tests/equation.test.ts) are a native authoring recipe. It needs no
JavaScript. The [reference tracker](../naive-ui/components/equation.md) records all
three original identities and five explicit source/type supplements as omissions.

**2026-09-11 default-style audit:** [not applicable](../style-audit/components/equation.md).
The pinned component has no Equation-owned stylesheet or theme tokens: it recreates the
outer wrapper returned by an application-supplied KaTeX renderer, while KaTeX's external
CSS/fonts own the visible result. MarkupUI has no corresponding rendered component.
The local MathML recipe remains application presentation and is not promoted into a
package skin or a new `--mui-equation-*` override contract.

## Author mathematical structure, not source strings

```html
<p>One half is written
  <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline"
    dir="ltr" aria-label="one half">
    <mfrac><mn>1</mn><mn>2</mn></mfrac>
  </math>.
</p>
```

The HTML parser places descendants of a native math element in the MathML namespace.
`xmlns` makes that intent explicit and is useful for separately authored XML
documents, but does not turn arbitrary HTML divs into math. Use native math/mrow,
mi identifiers, mn numbers, mo operators, mfrac, msup/msub, msqrt and mtable/mtr/mtd.
The demo authors four original, simple expressions:

| Native example | Mathematical meaning |
| --- | --- |
| Inline superscripts | a squared + b squared = c squared for a right triangle |
| Block fractions | one half + one third = five sixths |
| Subscript and square root | x subscript zero = the principal square root of nine = three |
| Two-by-two matrix | identity matrix with rows [1, 0] and [0, 1] |

This is presentation MathML with explicit structure/labels and accompanying meaning,
not a symbolic algebra system, proof checker, Content MathML converter or arbitrary
notation grammar. Native display="inline"/"block" chooses placement. It does not
translate KaTeX's displayMode option or implement the rest of that options object.

`\frac{1}{2}` remains **literal text** in the demo's native code/disclosure example.
Neither a browser nor this recipe turns raw TeX strings into MathML. If an application
requires TeX input, this zero-dependency scope does not meet that requirement.
An independently approved typesetter or pre-authored content pipeline would require
its own dependency, trust, accessibility and error policy.

For explicit programmatic authoring, use the namespace for **every** math element:

```js
// Application-owned native nodes, not an Equation API or string converter.
const ns = "http://www.w3.org/1998/Math/MathML"
const math = document.createElementNS(ns, "math")
const number = document.createElementNS(ns, "mn")
number.textContent = "3"
math.append(number)
```

Do not use HTML createElement for MathML descendants, or insert untrusted strings
through innerHTML, a DOMParser, eval or a remote service. The example creates known
elements and literal Text content; it is **not a sanitizer or mathematical validator**.
Labels/explanations must be authored consistently if the application changes a value.
There is no watcher, parser callback, automatic error rendering or refresh lifecycle.

## Meaning, labels and native interaction

Each expression has a mathematical aria-label. Native figures have visible captions
and names; the inline expression remains in its original sentence. Explanatory
paragraphs describe the mathematical result without requiring fraction/radical
layout or a particular screen-reader pronunciation. They remain ordinary visible
prose, not a hidden second math renderer.

In the observed Chromium AX tree, MathMLMath, Fraction, Sup, Sub, SquareRoot,
Table/Row/Cell, Identifier, Number and Operator roles remained present. That is
evidence of native structure, **not** a guarantee of speech output, formula navigation,
Braille translation or identical behavior across browsers/assistive technologies.
An aria-label may affect structural navigation in some combinations. Labels and
nearby explanations can be announced separately; duplicate-free speech is not promised.
Test the particular target combination and expression rather than hiding content
or blindly assigning presentation roles.

If native MathML is unsuitable for the target environment, use clear mathematical
prose, or an application-authored local diagram with meaningful alt text and a
visible equivalent explanation. Do not silently substitute inaccessible raw TeX.
This recipe does not generate/export images or ship an image/font fallback.
Copy/selection remains native text selection; plain selected text may flatten
fractions, superscripts and matrix rows. It is not a TeX or structured-math clipboard
serializer, so the visible explanations matter when communicating a formula.

No role=grid, scripted keyboard navigation, focus changes, live region, hidden input
or generated field is added. The three named native figures are focusable scroll
containers for oversized notation; browser arrow keys own scrolling. Native
details/summary, text fields and Reset work without JS. The local form has two text
fields and no submit button, and native Enter caused no submission in the tested
anatomy; this is not an application-wide submission-prevention policy.

Original nodes, order, Text nodes, author labels/styles/listeners, form values and
selection stay native. There is no renderer to recreate them, controller to dispose,
timer to stop or ownership restoration to simulate.

## Local CSS, direction and limits

Only the demo links equation.css. Its selectors are scoped to #equation-example;
it is not a published library stylesheet or document reset. Native system colors and
the browser's generic math font are used, with **no downloaded font or external asset**.
Font choice, glyph coverage and operator stretching remain platform-dependent.

CSS supplies container spacing, focus outlines, local input sizing and horizontal
figure overflow. Block math has min-inline-size:max-content, keeping an oversized
centered expression inside a genuinely scrollable box rather than clipping its
leading operands. Prose may wrap anywhere; mathematical structures are not split
into arbitrary text lines. Long formulas need application-authored block/scroll
placement or reformulation; unlimited inline fitting is not promised.

The matrix is intentionally inside an RTL prose/container example while all algebra
has explicit dir="ltr". This preserves these formulas' conventional left-to-right
notation and actual matrix row/column order. It is not universal RTL mathematical
typesetting or automatic bidirectional translation.

At zoom/narrow widths native layout and scroll containers own geometry; no
JavaScript measures or scales the equation. Print removes clipping and keeps each
short figure together where possible; it cannot force an arbitrarily wide expression
onto paper. Forced colors use system colors. There is no motion to disable.

## Reference decision and evidence

The pinned component accepts an externally supplied KaTeX object, or reads one
from Config Provider. It calls renderToString with value-or-empty text, a default
throwOnError=false and caller options spread afterward. Missing/empty output becomes
"no katex provided"; regex extraction then forwards a wrapper class/tag and innerHTML.
None of that external-renderer, error-option or provider behavior is reproduced.
KatexOptions is an opaque Record<string, unknown> in the pinned local type; transitive
KaTeX options are not fabricated as native APIs.

The public EquationProps/equationProps/NEquation exports and referenced Katex/
KatexOptions type contracts remain omitted, not renamed as a fake native helper.
**Eight tracker rows, all intentionally omitted; four alternative-resolution tasks
accepted.** Completing those tasks does not award TeX implementation credit.

Acceptance in the dedicated Chromium demo tab:

- Four expressions and every descendant had the MathML namespace. Computed display
  was `math` for inline and `block math` for block expressions.
- Native numerator/denominator boxes were vertically separated by approximately
  23px, superscripts sat above their identifiers, and the matrix had two aligned
  rows of two cells. The fraction block was approximately 34px tall and matrix 41px.
  The AX tree exposed the expected MathML structure and authored names.
- Native selection and original equation/Text identities survived viewport/zoom
  changes. Native notes editing, Enter, reset and Space disclosure activation worked;
  the form contained only its two named fields and those actions made no requests.
- At a 360px viewport and CSS zoom 200%, page width stayed within the viewport.
  At 320px/200%, the RTL matrix figure exposed native horizontal scrolling:
  clientWidth=111, scrollWidth=126, ArrowLeft reached scrollLeft=-15.5 while focus stayed.
- Print and forced-colors media retained stacked fractions, labels and actual content.
  This is not a full pagination or all-font/all-browser guarantee.
- A fresh JavaScript-disabled context under script-src/default-src/font-src/img-src
  'none' and style-src 'self' still rendered all four expressions, with native disclosure/
  reset and no CSP errors. Only the local HTML and CSS were requested.

The original acceptance ran **39 tests** (12 Equation recipe + 27 native/legacy) and
`pnpm build`; all **1,316 pre-existing distribution files byte-matched** before/after.
The later default-style audit runs `pnpm exec vitest run tests\equation.test.ts`
individually: **13 Equation tests pass**, including the package-style boundary regression.
No source, package, build script, export, runtime dependency or budget changed.
The complete local example adds **4,642 raw / 1,729 gzip HTML** and
**1,361 raw / 548 gzip CSS**: **2,277 gzip bytes total**, not a library bundle.

This closes Equation's alternative-guidance acceptance. Main P6 retained scopes
remain complete independently. **QR Code is recommended next**, followed separately
by Legacy Grid and Legacy Transfer resolutions. None is started here; broad P0
foundation work remains separately pending and parent-owned.
