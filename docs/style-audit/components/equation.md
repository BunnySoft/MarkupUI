# Equation default-style audit

**2026-09-11 — not applicable: neither library owns a comparable Equation skin.**
No component source, stylesheet, package entry, generated asset, dependency or budget
was added or changed.

## Pinned source and rendering boundary

Naive UI **2.45.3** at commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` defines props and rendering in
[`Equation.tsx`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/equation/src/Equation.tsx).
It has no Equation CSS module or light/dark theme. The renderer:

1. obtains an application-supplied KaTeX object directly or from Config Provider;
2. calls `renderToString(value || "", { throwOnError: false, ...katexOptions })`;
3. extracts the returned outer tag and class; and
4. recreates that wrapper while inserting the returned inner HTML.

The basic demo therefore adopts KaTeX's `.katex` output. `displayMode: true` adopts
KaTeX's `.katex-display` wrapper, and `fleqn: true` is likewise an external KaTeX
presentation option. KaTeX's separately imported stylesheet and font assets own the
typography, fraction/radical geometry, display margins and alignment. Foreground
normally follows `currentColor`; Naive UI adds no Equation-specific light, dark,
forced-colors or print rule.

## MarkupUI classification

MarkupUI intentionally has no Equation runtime, source directory, stylesheet, export,
manifest bundle or `--mui-equation-*` public custom properties. Its accepted alternative
is application-authored native MathML plus visible prose. The demo's scoped
`equation.css` is local recipe presentation, not a distributed component default.

The result is **⏭️ Not applicable**, not Matched. Comparing the local MathML example's
pixels with KaTeX would compare two different renderers and would incorrectly turn
application CSS into a library contract. No default correction is justified.

## Preserved boundaries and retained differences

- TeX parsing, KaTeX provider lookup/options/errors, wrapper extraction and HTML
  adoption remain omitted.
- KaTeX HTML classes, downloaded fonts and exact fraction/radical/display geometry are
  not reproduced by CSS over authored MathML.
- Native MathML layout, glyph coverage, accessibility and printing remain browser/font
  dependent; the local recipe supplies scoped print and forced-color safeguards only.
- Light/dark paint remains inherited/application-owned. No component media override or
  private palette is introduced.
- There is no public Equation custom-property contract to change or shadow. Existing
  global/native author styling remains untouched.

## Validation and size

`pnpm exec vitest run tests\equation.test.ts`: **13 tests passed**, including the
regression that Equation remains absent from package exports, build entries/budgets and
the public custom-property surface.

No component JS/CSS payload or `scripts/build.mjs` gzip ceiling applies. The unchanged
local recipe remains **4,642 raw / 1,729 gzip bytes HTML** plus
**1,361 raw / 548 gzip bytes CSS** (**6,003 raw / 2,277 gzip total**). A full build was
not needed for this documentation/test-only classification and no generated `dist`
file was touched.
