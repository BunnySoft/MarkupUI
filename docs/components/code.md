# Code: native plain display

**Migration status: 🟢 Verified for retained plain Code scope.**
Use native `pre`/`code`, literal text and optional author-supplied physical-line/token spans.
There is no syntax engine, URI parser, code execution, renderer or clipboard feature.

## Loading and source boundary

| Asset | Purpose |
| --- | --- |
| `src/components/code/code.css` | Maintained scoped CSS. |
| `dist/markup-ui-code.css` | Browser stylesheet. |
| `@dataengine/markup-ui/code/style.css` | Stylesheet-only export. |
| `demo/components/code.html`, `.css` | Script-free plain/inline/wrapped/numbered/token examples. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-code.css">
<pre class="mui-code-block"><code class="mui-code">const value = "&lt;b&gt;literal&lt;/b&gt;";</code></pre>
<p>Inline <code class="mui-code">a  &lt; b</code> stays in the paragraph.</p>
```

No `./code` JS entry or new `mui-code` definition exists. Legacy `mui-code` remains unchanged.
The font fallbacks reuse Typography's optional `--mui-typography-mono-font` and the common
`--mui-font-size` roles, but no Typography stylesheet/runtime import is required.
The mono stack is `v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace`.
Explicit Code classes retain their
font/whitespace rules when composed with that generic typography stylesheet.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/code),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/demos/enUS/index.demo-entry.md),
[Code source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/Code.tsx)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/code/src/styles/index.cssr.ts)
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/code.md) retains seven original rows and
seven explicit source-only entries: **14 rows, 6 Verified adapted targets and 8 omissions**.
The external hljs object remains an opaque exclusion, not a promise to migrate its methods,
grammars, plugins or third-party types.

## Text ownership and exact source

The stylesheet never changes DOM nodes or text. Author escaped HTML source, or use native
`codeElement.textContent = source` for dynamic plain text. That native assignment intentionally
replaces the code element's children; it is not a library helper preserving rich token
spans/listeners. No helper is added merely to wrap textContent.

Do not put untrusted code into innerHTML. In HTML documents, escape `<` and `&` appropriately.
Application/server-tokenized spans must be safely constructed or reviewed/escaped markup;
their boundaries and trust policy belong to the application, not to Code.

No trim/decode/normalization is performed. Literal HTML-looking strings, `%3C...`, Unicode,
tabs and leading/trailing whitespace remain data. `pre` preserves whitespace and scrolls
by default; inline Code uses pre-wrap so authored spacing stays visible while long text can wrap.
This native inline whitespace policy is an explicit adaptation of upstream plain inline text.

HTML parsing itself normalizes literal CRLF in a file to LF and may remove an initial
newline immediately following a pre start tag. Keep the pre/code opening tags together.
Use native textContent assignment or `&#13;&#10;` character references when exact CRLF DOM
text is required; the numbered demo uses those references. Selection behavior and platform
clipboard newline conversion remain browser behavior, not a byte-copy service.

## Property dispositions

| Upstream surface | Native target / exclusion |
| --- | --- |
| `code` | Actual authored code text, or an explicit native textContent assignment. No code-string attribute renderer. |
| `inline` | Choose `code.mui-code` in inline content, or `pre.mui-code-block > code.mui-code` for a block. No inline attribute parser. |
| `word-wrap` | Presence `data-word-wrap` on the pre selects pre-wrap/break-all wrapping, matching the rendered reference. Absent keeps preformatted horizontal scrolling. |
| `show-line-numbers` | Presence `data-line-numbers` on an unwrapped pre enables decorative counters for **authored physical-line markup**, described below. Suppressed when word-wrap is present; unavailable for inline code. |
| `trim` | ⏭️ Automatic trimming omitted. Plain text stays verbatim; applications can intentionally transform their source before authoring it. |
| `hljs` | ⏭️ External syntax-engine object/configuration omitted. No highlight.js/Prism/parser dependency or adapter. |
| `language` | ⏭️ Runtime grammar selection/detection omitted. Optional author metadata such as data-language is inert and does not prove highlighting. |
| Source `uri` | ⏭️ Automatic decodeURIComponent mode omitted; encoded strings remain literal unless the application explicitly decodes them and handles errors. |
| Source `internalFontSize` | Valid external CSS `--mui-code-font-size`, e.g. `15px`; not a JS number-to-style bridge. |
| Source `internalNoHighlight` | ⏭️ Private Log/style-mount switch omitted; this module is always plain display and has no Log integration mode. |
| Source default slot | Authored code/line/token nodes; no VNode projection or markup injection. |
| Source theme props | ⏭️ `theme`, `themeOverrides`, `builtinThemeOverrides` object/provider contracts omitted. |

The pinned source only applies `trim` through its successful highlighted-language path;
its plain fallback writes the code unchanged. It optionally URI-decodes before writing,
and its default slot bypasses setCode entirely. Those distinctions are preserved as explicit
scope decisions rather than implying a nonexistent trim/URI/highlighter pipeline here.
The source has no Copy API/button or named public size presets, so neither is invented.

## Authored physical-line numbers

The `data-line-numbers` switch **does not split a string or generate line wrappers**.
Authors or a server may supply one `.mui-code-line` per physical source line:

```html
<pre class="mui-code-block" data-line-numbers><code class="mui-code"><span class="mui-code-line"><span class="mui-code-number" aria-hidden="true"></span>const value = 1;&#10;</span><span class="mui-code-line"><span class="mui-code-number" aria-hidden="true"></span></span></code></pre>
```

Important rules:

1. Keep the original line terminator **inside** its line span. Do not add indentation or
   formatting whitespace between line wrappers unless it belongs to the source.
2. Preserve blank lines. A trailing LF/CRLF is followed by a final empty physical-line span;
   empty lines get a full line-height box. This deliberately differs from the upstream
   counter generator, which does not append a final number after a terminal LF.
3. Number nodes must be **empty** and `aria-hidden="true"`. CSS counters render digits via
   pseudo-elements, so DOM/source text and selected source do not contain number characters.
   Do not insert literal numeric text into those nodes.
4. Do not add `user-select:none` to these empty number nodes. Chromium otherwise drops a
   trailing selected newline. The retained CSS keeps normal selection; generated digits
   are not source text. The CRLF/trailing-empty-line demo was checked with both Range and
   Selection text, without touching the real clipboard.
5. Modern CSS sizes the gutter from the authored line count: `1ch` for 1–9 lines,
   `2ch` for 10–99, `3ch` for 100–999 and `4ch` for 1,000–9,999, followed by a fixed
   12px gap. No text splitting or JS measurement occurs. Set `--mui-code-gutter`
   explicitly for larger files or custom font requirements. Engines lacking the
   structural-selector support retain a `3ch` fallback; author a sufficient width there.
6. Inline and word-wrapped code do not show numbers, matching the documented restriction.
   The same authored physical-line spans may soft-wrap, but each still represents one
   original source line; visual wraps are not renumbered.

The native pre/code order intentionally corrects the source implementation's outer code/
inner pre wrapper shape. No separate text-filled number column or hidden duplicate full
source string is introduced. Repeated blocks reset their counters independently.

The rendered pinned plain `code`-prop fallback removes its initial number column during
mount when no highlighter is supplied. The audit therefore also renders upstream's
authored default-slot `pre` path, which retains its actual counter column, to compare
gutter geometry/colors without installing a syntax engine. Native authored counters are
not disabled merely to reproduce that fallback behavior.

## Typography, authored tokens and native interaction

Tokens: `--mui-code-font-family`, `--mui-code-font-size` (shared font-size fallback, then
`14px`), `--mui-code-line-height` (unitless multiplier override; otherwise inherited),
`--mui-code-tab-size` (default `8`), `--mui-code-padding`, `--mui-code-gutter`, `--mui-code-color`,
`--mui-code-background`, `--mui-code-border-color` and `--mui-code-number-color`.
Use external CSS with valid values. No numeric/preset prop parser is provided.

Defaults no longer add an inline chip or block panel: padding/radius/border width are zero,
and the background is transparent. `--mui-code-padding` still provides optional block
padding; background and border-color tokens remain opt-in decoration. Border color now
paints a 1px inset frame without consuming content space. Author ordinary CSS for custom
radius/inline padding. The nested code does not paint a duplicate background/frame.

Plain text color inherits from the surrounding page, as the reference's unhighlighted
path does. A dark theme marker is **not** a background or plain-text renderer: author the
page foreground/background appropriately, or use the explicit Code color tokens.
Line height also inherits; modern `1lh` keeps blank physical lines as tall as actual text.
Older engines retain the previous unitless-token/1.6 minimum-height fallback.

Optional `.mui-code-token[data-code-token="keyword|string|number|comment"]` conventions
are a small **author-markup palette**, not a grammar or highlighter interface.
Token boundaries are supplied by the application. Their colors can use
`--mui-code-keyword-color`, `--mui-code-string-color`, `--mui-code-number-token-color`,
and `--mui-code-comment-color`. These four roles now match the rendered pinned token colors.
Set `data-mui-theme="dark"` on a host or ancestor for dark token/number colors; nested light
scopes reset them. Ordinary source text still inherits the page color. No other syntax
classes, language metadata, engine methods or grammar are interpreted. The demo remains
static safe author markup rather than a tokenizer.

See the [rendered Code visual audit](../style-audit/components/code.md) for exact colors,
before/after measurements, authored overrides and retained differences.

For a standalone scrolling block, authors can put `tabindex="0"`, a meaningful region
name and instructions on the actual pre. Native Arrow keys scroll it; no keyboard
interception, copy button or clipboard permission flow exists. Inline code does not gain
a focus stop. Surrounding links remain normal navigation.

Direction is authored. An RTL page may explicitly use `dir="ltr"` for source, or use RTL
source with a logical-start (right-side) gutter. CSS never reverses DOM order. Hidden
roots/lines/templates stay hidden/inert; hiding an individual source line intentionally
changes what is visible/selectable and is not a source-preserving filtering API.
Standalone CSS does not force hidden-until-found to display:none; that path is not certified.

Print expands overflow, wraps long text and suppresses numbers because print wrapping
would otherwise suggest misleading source-line correspondence. Forced colors keep
source/token/gutter text readable without relying on token color. No runtime, observer,
animation or parser cleanup is necessary.

## Migration steps and acceptance

1. [x] Keep literal source and native pre/code structure; no parsing, execution, trim or decoding.
2. [x] Provide wrapping/scrolling/fonts and decorative authored physical-line presentation.
3. [x] Keep token markup application-owned and omit undocumented copy/clipboard actions.
4. [x] Verify whitespace/selection/safety, line geometry, no-JS behavior and explicit engine exclusions.

### Initial migration acceptance — 2026-09-08 (historical appearance)

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**528 tests**, including **12 Code cases**. Chromium acceptance exercised:

- Literal tags/Unicode/tabs, leading/trailing newlines and CRLF DOM text; five physical
  lines including the final empty line had 22.4px line boxes at default font settings.
- Native Range/Selection text exactly matched the numbered CRLF source without digits,
  and accessibility output omitted decorative numbers. No real clipboard was read/written.
- Live number/wrap switches preserved nodes/text; soft wrapping expanded physical-line
  height while numbers were hidden. Inline text stayed inline and a native 15px font override worked.
- Named focusable scrolling, ArrowRight, native navigation, 280px/320px widths, logical RTL
  gutter placement and explicit LTR source, 200% CSS zoom, print and forced colors.
- Later Typography/core/widgets/advanced loading preserved code nodes, font and whitespace;
  legacy mui-code retained inline styling. No grammar or language detection ran.
- JavaScript-disabled numbered selection/CRLF fidelity and native navigation; the demo loads
  no scripts. Browser/OS clipboard newline conversion and screen-reader speech are not certified.

CSS is **3,698 bytes / 1,087 gzip bytes**, below the new **1,500-byte** ceiling.
Component/demo JS is **0 bytes**; demo CSS is **473 / 279 gzip bytes**.
Core remains **14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes,
with unchanged outputs/budgets and zero runtime dependencies. This is not syntax-engine,
all-browser, browser-UI zoom or framework/pixel parity certification.

### Visual-default audit — 2026-09-10

- `pnpm test -- tests\code.test.ts`: **14 tests passed**.
- Real Naive Code was rendered without a highlighter in both themes. Plain, wrapped,
  authored-slot numbered and authored-token panels produced **zero differing RGB pixels**
  in eight fixed-origin Chromium comparisons.
- Plain block height changed **78.781→44.781px** and wrapped example **123.563→67.172px**.
  One-/two-digit source starts are within 1/64px of reference; line-number and all four
  token colors match. Inline preserved whitespace and final empty physical lines remain
  explicit native differences.
- Verified inherited line height/color, root-font independence, automatic gutter thresholds,
  author font/padding/frame/colors, nested theme reset, later Typography/core styles,
  exact CRLF Range/Selection text, native keyboard scrolling, print and forced colors.
- CSS measures **1,325 / 1,500 gzip bytes**, with zero component/demo JS or dependencies.
  An isolated check of the existing derived Log CSS measured **1,563 / 1,750 bytes**;
  the coordinator's isolated release build confirms both budgets. All **14 Code**,
  **59 Log** and **16 Grid tests** pass together against that release snapshot.
