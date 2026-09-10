# Typography

**Migration status: 🟢 Verified retained native HTML/CSS scope.**
**Architecture: CSS-only.** Typography has no Custom Element, JavaScript entry, registration
function, observer, renderer, lifecycle adapter or runtime dependency. Real native elements
are the implementation; a stylesheet must not manufacture semantics or a controller per tag.

## Default-style audit — 2026-09-10

The [isolated reference audit](../style-audit/components/typography.md) corrects the
default heading scale/weight, text depths, semantic/link colors, inline code, list,
blockquote, rule and boundary spacing. **39 specimens per theme** matched the measured
Naive light/dark style properties; individual native classes were checked separately
from the prose container. Author tokens, nested themes, RTL and native hidden code
were also verified.

**16 focused tests pass.** CSS source is **11,357 raw / 1,875 gzip bytes**, below the
unchanged **2,500-byte ceiling**. The coordinated full build, copied distribution and
manifest/budget gates pass. No shared palette/core/generated
files or the completed Global Style component were changed.

## Pinned owners and distribution

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Typography documentation](https://www.naiveui.com/en-US/os-theme/components/typography)
- [Public owner-group API and shared default slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md)
- [Text source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/text.tsx)
- [Heading factory](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/create-header.ts)
- [Anchor source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/a.tsx)
- [Paragraph source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/p.tsx)
- [Unordered](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ul.tsx)
  / [ordered list](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/ol.tsx)
  / [list item](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/li.tsx)
- [Blockquote](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/blockquote.tsx)
  / [thematic break](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/src/hr.tsx)

The public table's **15 rows** preserve Text, P, grouped H1–H6, grouped Ul/Ol, Blockquote,
and shared content ownership. A/Li/Hr source owners, deprecated Text `as`, and source theme
declarations are explicit supplements—not additional invented routes or runtime APIs.

| Asset | Purpose |
| --- | --- |
| `src/components/typography/typography.css` | Maintained scoped stylesheet. |
| `dist/markup-ui-typography.css` | Distributed CSS asset. |
| `@dataengine/markup-ui/typography/style.css` | Package CSS export. |
| `demo/components/typography.html`, `.css` | No-JavaScript native demonstration. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-typography.css">
```

Serve/copy the package CSS export through your asset mechanism, then use a normal browser
link. There is deliberately **no** `@dataengine/markup-ui/typography` JavaScript export,
classic global, type declaration for fictional element classes, or JS budget. No compiler
or script is needed to consume it.

The stylesheet can load before or after the legacy aggregate. No registration collision or
enhanced-before-legacy rule applies because it defines no custom elements. Existing
`mui-heading`, `mui-text`, `mui-strong`, `mui-code`, `mui-link` and other legacy aliases
retain their original registration/controller/style behavior and unchanged core output.

## Native scope and opt-in classes

Apply `.mui-typography` to a prose container:

```html
<article class="mui-typography" lang="en">
  <h1>Document title</h1>
  <p>Native text with <strong>importance</strong>, <em>emphasis</em>,
    <code>inlineCode()</code> and an <a href="./guide.html">ordinary link</a>.</p>
  <ul><li>Native list item</li></ul>
  <blockquote cite="./source.html"><p>Native quotation.</p></blockquote>
</article>
```

For individual elements outside a prose container, opt in with appropriate classes:

| Source/native owner | Individual native class |
| --- | --- |
| Text / span, strong, em, u, del, code | `.mui-text` on the chosen real element |
| P / paragraph | `p.mui-p` |
| H1–H6 / matching native heading | `h1.mui-h` through `h6.mui-h` |
| A / anchor | `a.mui-a` |
| Ul / Ol / Li | `ul.mui-ul`, `ol.mui-ol`, `li.mui-li` |
| Blockquote | `blockquote.mui-blockquote` |
| Hr | `hr.mui-hr` |

Rules are scoped to these opt-ins, use low-specificity selectors and do not globally restyle
unrelated text. A prose container intentionally supplies inherited typography to its content;
do not apply it to a whole application shell unless that is the desired CSS scope.
More specific author/component styles can override the defaults normally.

CSS does not change node identity, text, attributes, headings, language, direction, selection,
ARIA or interactive behavior. Newly inserted native content acquires styles through the
normal cascade; there are no “upgrade”, reconnect or synchronization APIs to pretend exist.

## Presentation and semantics

- Choose real `h1`–`h6` for hierarchy, not a div plus generated heading roles. The default
  scale is **30/22/18/16/16/16px**, weight **500**, with a default **1.6** line height;
  all can be changed with tokens.
- Use native `<strong>` and `<em>` when importance/emphasis is intended. For purely visual
  compatibility, `data-strong`, `data-italic` and `data-underline` style text without changing
  its tag or adding semantic roles.
- Use real `<del>` for deletion and `<code>` for inline code. For combined code/deletion,
  author `<code><del>...</del></code>`. CSS does not pretend that `data-delete`/`data-code`
  on a span creates those semantics.
- Native `<u>` or `data-underline` provides underline presentation. Underline plus native
  deletion retains both lines. Use underlining thoughtfully so it is not confused with links.
- `data-depth="1|2|3"` supplies text/paragraph shades. Semantic `data-type="success|info|
  warning|error"` takes precedence over depth; default leaves the normal color. Inline
  code uses its code-color token rather than semantic/depth color, matching the reference.
- Heading `data-type` colors its decorative bar, **not its heading text**, matching the
  pinned source. Use `--mui-typography-heading-color` to recolor the text. This corrects
  the earlier local adaptation that colored both.

Data attributes are presentation choices, not JS component properties. Unsupported values
have no special rule; CSS does not parse/evaluate them or fabricate validation callbacks.
There is no Text `tag`/deprecated `as` renderer. Select the actual native tag yourself.

### Alignment is not generic text-align

The upstream `align-text` options mean alignment with adjacent prose:

- Heading `data-prefix="bar"` adds a decorative logical-start bar and padding.
  Add `data-align-text` to remove that padding and let the bar hang in the start margin.
  H1/H2 use **16px** space and a **4px** bar; H3–H6 use **12px** and **3px**.
  Without a bar, this option does not invent a new alignment behavior.
- `ul`/`ol[data-align-text]` removes start indentation so text aligns with prose and markers
  hang outside. Native markers, `type`, `start`, `reversed` and `li[value]` are preserved.
- `blockquote[data-align-text]` hangs its start border/padding into the margin so quotation
  text aligns with the paragraph.

Use ordinary native CSS `text-align` for center/end/justification. Hanging decorations need
space in the surrounding layout; clipping ancestors or viewport edges can clip them.
Logical padding/margins/insets support RTL without rewriting `dir` or `lang`.

## Native navigation and content

Anchors remain real `<a>` elements with unchanged `href`, `target`, `rel`, `download`,
`hreflang`, text and inline SVG. Native Enter, Tab, new-tab behavior, context menus and
selection are not intercepted. `a[href]` has a discoverable underline and focus-visible
outline; an anchor without href is not made clickable or assigned a button/link role.

Routing remains application-owned. There is no router integration, click handler, disabled
link emulator, generated anchor wrapper or event dispatcher. If an application needs router
behavior it must explicitly supply it outside this stylesheet.

Native text/headings/lists/quotes/links keep their accessibility semantics. No live region,
progressbar, heading role/aria-level or accessible name is injected. Decorative prefix bars
are empty CSS pseudo-elements, not spoken text.

Inline code presentation is modest styling only. `pre code` is excluded from implicit
inline-code boxes; block-code markup retains native behavior. There is no syntax tokenizer,
language highlighter or Code-component import. Code remains a separate catalog component.
No animations/transitions are supplied, so no reduced-motion runtime or timer is needed.

## Explicit light/dark themes and shared-token ownership

```html
<article class="mui-typography" data-mui-theme="dark">
  <h2>Dark heading</h2>
  <p>Dark prose on an application-owned dark background.</p>
  <section class="mui-typography" data-mui-theme="light">
    <p>Light prose on an application-owned light background.</p>
  </section>
</article>
```

The nearest `data-mui-theme="light|dark"` boundary supplies **private Typography
fallbacks only**. No boundary means light, as in Naive without a dark provider.
There is no OS watcher, body/background styling, `color-scheme` override or theme
runtime. Authors must supply matching backgrounds. Theme attributes alone do not
paint the sections in the example.

Existing public `--mui-typography-*` tokens remain the first override. Semantic
colors then consume shared **normal** `--mui-color-info/success/warning/error`
tokens; links and untyped bars use `--mui-color-primary`. These are not the
supplementary colors used by some other components. Private fallback colors follow
when no shared token is present. A nested theme does not erase inherited public
author/shared overrides; scope those explicitly when different values are intended.

Prose typography consumes shared `--mui-font-family`, `--mui-font-size` and
`--mui-line-height` after its local tokens. Family otherwise inherits the application;
no font is loaded. Individual text/anchor elements retain ambient font sizing, while
paragraphs, lists and quotes supply the reference 14px size. Shared legacy
`--mui-text-primary`, `--mui-border` and surface colors are deliberately not substituted
for Naive's distinct text-depth, quote-border, code and rule roles.

## CSS tokens and defaults

`--mui-typography-font-family`, `--mui-typography-font-size`, `--mui-typography-line-height`,
`--mui-typography-color`, `--mui-typography-paragraph-margin`,
`--mui-typography-heading-margin`, `--mui-typography-heading-weight`,
`--mui-typography-heading-line-height`, `--mui-typography-heading-color`,
`--mui-typography-h1-size` through `--mui-typography-h6-size`,
`--mui-typography-depth-1` through `--mui-typography-depth-3`,
`--mui-typography-success`, `--mui-typography-info`, `--mui-typography-warning`,
`--mui-typography-error`, `--mui-typography-strong-weight`,
`--mui-typography-mono-font`, `--mui-typography-code-border`,
`--mui-typography-code-radius`, `--mui-typography-code-background`,
`--mui-typography-code-color`, `--mui-typography-prefix-space`,
`--mui-typography-bar-width`, `--mui-typography-bar-color`,
`--mui-typography-list-indent`, `--mui-typography-quote-padding`,
`--mui-typography-quote-border-width`, `--mui-typography-quote-border-color`,
`--mui-typography-link-color`, `--mui-typography-link-hover-color`,
`--mui-typography-focus-color` and `--mui-typography-rule-color` provide external customization.

Defaults use the measured reference values, not a runtime theme object:

| Role | Light | Dark |
| --- | --- | --- |
| Body text / depth 2 | `#333639` | white / `.82` |
| Heading / depth 1 | `#1f2225` | white / `.9` |
| Depth 3 | `#767c82` | white / `.52` |
| Inline-code background | `#f4f4f8` | white / `.12` |
| Quote border | `#e0e0e6` | white / `.24` |
| Rule | `#efeff5` | white / `.09` |

Paragraph block margins are 16px; quote/rule margins are 12px. Headings start with
28px and end with 20px (H1–H3) or 18px (H4–H6). First-child headings/paragraphs/lists/
quotes lose their start margin; last-child paragraphs/lists/quotes lose their end
margin. These boundary rules also apply to individual classes and nested prose,
not only a container's immediate first heading. Author native margin rules can
override them; margin tokens control the ordinary non-boundary spacing.

Applications remain responsible for contrast in their actual background/theme. Long prose
and inline links can wrap without JS measurements. Native preformatted content remains
preformatted; provide an appropriate overflow container for long block code.

## Owner/property/slot tracker

🟢 Verified native/CSS adaptation · ⏭️ Framework/runtime contract intentionally omitted.

| Documented owner/item | Native equivalent | Status / scope |
| --- | --- | --- |
| Text `type` | `data-type` on scoped text or `.mui-text`. | 🟢 Semantic CSS colors, no status inference. |
| Text `strong` | Native strong or presentation-only `data-strong`. | 🟢 No semantic tag rewriting. |
| Text `italic` | Native em/i or presentation-only `data-italic`. | 🟢 Native text retained. |
| Text `underline` | Native u / `data-underline`. | 🟢 Native decoration, including combined del/underline. |
| Text `delete` | Real `<del>`. | 🟢 Deleted-text semantics authored directly. |
| Text `code` | Real inline `<code>`. | 🟢 No highlighter or code renderer. |
| Text `depth` | `data-depth="1|2|3"`. | 🟢 Text shade; non-default semantic type wins. |
| Text `tag` | Choose native markup. | ⏭️ Runtime tag-selection/replacement prop omitted. |
| P `depth` | Native paragraph with data-depth. | 🟢 Paragraph shade/layout. |
| H1–H6 `align-text` | Native heading data-align-text with prefix bar. | 🟢 Logical hanging decoration, not generic text-align. |
| H1–H6 `type` | Heading data-type. | 🟢 Semantic bar color; heading text retains its own role. |
| H1–H6 `prefix` | `data-prefix="bar"` on native heading. | 🟢 Decorative empty pseudo-element. |
| Ul/Ol `align-text` | Native list data-align-text. | 🟢 Text/marker alignment; numbering attributes preserved. |
| Blockquote `align-text` | Native quotation data-align-text. | 🟢 Logical margin/padding/border. |
| All owners default content | Original native child nodes. | 🟢 No slot projection/rendering; void Hr remains void. |
| A / Li / Hr source owners | Native a/li/hr. | 🟢 Explicit source supplements, not extra catalog routes. |
| Text `as` source alias | Choose native markup. | ⏭️ Deprecated renderer/compatibility layer omitted. |
| Theme/themeOverrides/builtinThemeOverrides for Text, P, H1–H6, Ul/Ol, Blockquote, A and Hr | External scoped CSS/tokens. | ⏭️ Seven grouped source owners × three framework theme contracts; not instantiated per tag. |

The reference page preserves all 15 original rows and records 25 explicit source supplements:
three native owners, one deprecated Text alias and 21 grouped theme contracts.
That is **40 rows: 17 Verified adapted targets and 23 intentional omissions**. A stylesheet
does not receive parity credit for omitted framework APIs.

The retained local `data-type` set remains default/info/success/warning/error; source
Text's additional primary type is not added in this audit. Arbitrary prefix strings,
runtime tag/as replacement, providers/theme merging and routing are not implemented.
The native adaptation intentionally retains logical RTL decorations, `.12em` underline
offset, explicit focus-visible outline and no transitions. These differences prevent a
claim of complete API or pixel parity even where the measured defaults now match.

## Numbered migration steps and acceptance

1. [x] Inventory all grouped public owners/props/content plus actual A/Li/Hr/deprecated/theme sources.
2. [x] Choose CSS-only native HTML rather than artificial Custom Element or JS entries.
3. [x] Implement scoped scale, shades/types, decoration, lists/quotes, native links and logical alignment.
4. [x] Preserve markup, attributes, hierarchy, selection, language/direction and unaffected outside scope.
5. [x] Add a genuinely no-JS HTML/CSS demo and existing-runner CSS/native invariant tests.
6. [x] Validate CSS-only export/build budget, existing integration suite and Chromium behavior.
7. [x] Reconcile grouped reference rows/four tasks, source additions and master next Icon.

### Original migration evidence — 2026-09-08 (historical)

- `pnpm test -- tests\typography.test.ts`: **10 focused tests passed**.
- `pnpm build && pnpm test`: CSS copy/budget and all **300 tests** passed
  (10 Typography plus 290 previous tests). The test harness uses CSSOM for checks;
  the delivered component does not inject styles.
- Packaging tests verify the CSS export, absence of a Typography JS export/source/runtime,
  native owner nodes, untouched outside text, anchor metadata/SVG, numbering attributes,
  hidden/lang/dir preservation, semantic inline content and no routing/animation machinery.
- Chromium's demo loaded **zero scripts and zero injected style elements**. H1–H6 retained
  their real tags and 36/28/24/20/17.6/16px default scale. Strong/em/del/code, three depths,
  type precedence, native ordered-list attributes and unchanged outside text were verified.
- Native Space did not activate a link; Enter navigated, Tab produced a 2px focus-visible
  outline, target=_blank opened the same local example and rel metadata remained intact.
  Native text selection worked. The test popup was closed.
- Logical heading/list/blockquote alignment, RTL start-edge bars/borders and unbroken-link
  wrapping passed. At 200% CSS zoom, paragraph geometry scaled and wrapping remained usable.
- After awaiting stylesheet load, CSS-before/after-legacy checks preserved original native
  node/attribute identity, outside styles, late native styling and existing mui-heading roles.
  No `mui-typography` registration or runtime global appeared. Unrelated browser tabs were untouched.
- Reference validation preserved all 15 grouped public rows plus 25 explicit source
  supplements: **96 pages, 3,097 rows, 384 tasks (48 accepted), 701 valid relative file links**.
  Package/dist checks confirmed no Typography JS export or ESM/classic JS files.
- Core remains **14,611 / 15,000 gzip bytes**, with previous JS/CSS outputs unchanged.
  Typography is **CSS only: 1,423 gzip bytes / 2,500 ceiling**. No fake JS bundle budget exists;
  exact figures are in `dist/manifest.json`.

The figures above describe the original delivery, not the current integrated build.
This is native/CSS retained scope, not Vue tag/theme/router or complete pixel parity. Chromium and
CSS zoom were exercised, not every browser/screen-reader/page-zoom combination. Native CSS
support, custom themes and application document structure remain downstream responsibilities.
P2-01 and P2 remain in progress; Icon is next only through coordinator selection.
