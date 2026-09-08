# Highlight

**Migration status: 🟢 Verified for retained literal-text matching.**
Highlight provides a bounded optional matching helper, native `mark` rendering and separate
CSS. It is **not Code syntax highlighting**, an arbitrary-regexp engine, or a rich-text editor.

## Distribution and why this is a helper

| Asset / export | Purpose |
| --- | --- |
| `@dataengine/markup-ui/highlight` | ESM functions/types; browser file `dist/markup-ui-highlight.js`. |
| `dist/markup-ui-highlight.global.js` | Classic-script `window.MarkupUIHighlight` helper namespace. |
| `@dataengine/markup-ui/highlight/style.css` | `dist/markup-ui-highlight.css`, also usable for authored marks alone. |
| `src/components/highlight/` | Maintained matching/rendering implementation and CSS. |
| `demo/components/highlight.html`, `.css`, `.js` | Static marks plus application-owned text/pattern controls. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-highlight.css">
<span id="result" class="mui-highlight">Atlas project</span>
<script src="./vendor/markup-ui-highlight.global.js"></script>
<script>
  MarkupUIHighlight.highlightText(
    document.querySelector("#result"), "Atlas project", ["atlas"]
  );
</script>
```

```js
import { findHighlightRanges, highlightText } from "@dataengine/markup-ui/highlight";
const ranges = findHighlightRanges("İx 😀 x", ["X", "😀"]);
// [{ start: 1, end: 2 }, { start: 3, end: 5 }, { start: 6, end: 7 }]
highlightText(document.querySelector("#result"), "Atlas atlas", ["Atlas"], {
  caseSensitive: true,
  highlightClass: "search-match"
});
```

The central automatic matching function is retained, not omitted to force CSS-only delivery.
A stateless helper is smaller and clearer than a custom element for an explicitly owned
text string: call it again for new text, patterns or options. There are **no live attributes,
pre-upgrade properties, registration or custom-element lifecycle contracts**. Detached
surfaces work through their owner document; reattachment requires no setup. No listeners,
timers, observers or pending work exist to dispose. No CSS Custom Highlight registry/range
ownership framework is introduced.

Core-first and helper-first loading both work; no `mui-highlight` definition exists.
Other enhanced components retain their own registration-order restrictions. This helper
does not add functionality or bytes to the aggregate, widgets or advanced bundles.

## Authority and retained property scope

References: [official page](https://www.naiveui.com/en-US/os-theme/components/highlight),
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/demos/enUS/index.demo-entry.md),
[Highlight source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/src/Highlight.tsx)
and its [internal splitting helper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/highlight/src/utils.ts),
pinned to `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/highlight.md) preserves all **seven original
rows: five Verified adapted targets and two fully omitted rows**. Raw-regexp mode is an
additional explicit exclusion within the adapted always-literal auto-escape row.
Source review found no additional public prop/slot/event surface to add: HighlightProps
derives these same props, the splitting utility is internal, and there are no mixed-in
theme props. Native helper names/types below are local APIs, not invented upstream rows.

| Upstream item | Native target / disposition |
| --- | --- |
| `auto-escape` | Always-literal matching retains the safe default behavior. There is no switch; `autoEscape` is not a helper option. Raw-regexp false mode is intentionally excluded. |
| `case-sensitive` | `caseSensitive` boolean option, default false. |
| `patterns` | Explicit readonly string array argument, default empty; no attribute/JSON/regexp parser. |
| `text` | Explicit string argument, default empty, rendered only as text. |
| `highlight-class` | `highlightClass` string option on generated marks, alongside the fixed `mui-highlight-mark` class. |
| `highlight-style` | ⏭️ Runtime object/string style forwarding omitted; external classes/tokens instead. |
| `highlight-tag` | ⏭️ Arbitrary tags/components omitted; rendering always creates native `mark`. No interactive/raw-text tag constructor. |

Unknown options, including `autoEscape`, `highlightTag` and `highlightStyle`, are rejected
instead of silently interpreted. No raw regex, HTML, executable expression, render callback,
locale library, tokenizer or syntax-highlighter dependency is accepted.

## Native APIs and matching rules

- `findHighlightRanges(text = "", patterns = [], { caseSensitive? } = {})` returns new
  `{ start, end }` objects with **half-open UTF-16 code-unit offsets into the original text**.
  It does not touch the DOM and can run without a browser document.
- `highlightText(target, text = "", patterns = [], { caseSensitive?, highlightClass? } = {})`
  returns those ranges and replaces the target's children with native text/mark nodes.
  The target must be a dedicated **HTML span**, not a script/style/input/textarea/div,
  arbitrary tag, or SVG element.
- `HIGHLIGHT_LIMITS` is a frozen object exposing the capacity limits below.
  Exported TypeScript types are `HighlightRange`, `HighlightMatchOptions` and `HighlightOptions`.

Rules:

1. Patterns are literal strings. Metacharacters such as `[a+b]`, `.*`, `\(` and `(a+)+$`
   have no regexp-language meaning. The implementation escapes literal alternatives before
   using the built-in regexp matcher; no regex package or untrusted regexp syntax is involved.
2. Empty strings are ignored; whitespace-only patterns remain meaningful literal whitespace.
   Exact duplicate patterns are removed without changing the first occurrence's order.
3. Matching chooses the earliest text position. At the same position, **the first listed
   matching pattern wins**, not necessarily the longest. Matches consume text without overlap.
   `["ab", "abc"]` matches `ab` in `abc`; reversing those patterns matches `abc`.
   Adjacent matches remain separate marks; `"aa"` in `"aaa"` matches only offsets `[0, 2)`.
4. Case-insensitive matching uses built-in Unicode-aware simple case folding (`giu`);
   sensitive matching uses `gu`. The source uses g/gi; adding Unicode mode is deliberate.
   Text is never lowercased or normalized, so expanding lowercase mappings such as `İ`
   cannot corrupt later offsets. Emoji/supplementary characters retain correct UTF-16 indices,
   and a lone-surrogate pattern does not split a paired surrogate.
5. This is not locale-aware/full case folding or grapheme segmentation. `straße` does not
   match `STRASSE`; composed `é` differs from `e` plus combining acute. A pattern can match
   a combining mark or part of a ZWJ grapheme. Supply whole grapheme strings when required.

## Explicit ownership and selection boundary

**The text argument intentionally owns the entire span's child content.** Successful calls
replace all existing children, including authored rich nodes, child listeners and prior marks.
Do not use this API on a span containing unrelated controls/media or as an in-place rich-text/
contenteditable highlighter. There is no promise to preserve a live selection/caret across an
update; DOM replacement can reset it.

The span itself, its attributes/listeners, surrounding link/button/heading and other nodes
are preserved. Put the owned span inside a native link/button if the action should survive
text changes. Rendering uses `createTextNode`, fixed-namespace `mark` creation and a fragment,
never innerHTML. HTML-looking text and class strings cannot become markup/event attributes.
No duplicate hidden full string, live region, role, tabindex or interactive mark is generated.
Rendered `textContent` is exactly the source. Native selection/copy crosses mark boundaries
without added replacement text; browser whitespace/control-character extraction is not overridden.

Call `highlightText(span, sourceText, [])` to clear decoration while retaining text;
call with empty text to empty the owned surface. No cleanup/dispose method is needed.
Matching and validation finish before DOM mutation, so rejected inputs/capacity failures
leave the previous child nodes intact.

## Bounded work and errors

| Limit | Value |
| --- | --- |
| Text length | 65,536 UTF-16 code units |
| Input array length, including empty/duplicate entries | 64 patterns |
| Combined distinct non-empty pattern length | 4,096 UTF-16 code units |
| Work estimate: text length × distinct pattern length | 16,777,216 maximum |
| Output | 4,096 matches maximum |
| Additional class string | 256 UTF-16 code units |

These are conservative synchronous UI limits, not a file-search engine. Literal alternatives
contain no user quantifiers/backtracking program, and both matching work and DOM output are
bounded. Results are never silently truncated. Invalid types/options/target kinds throw
`TypeError`; exceeded capacity throws `RangeError`. Library code has no broad fallback catch.
The demo handles only those expected input errors, leaves the last successful preview intact,
and rethrows unexpected failures.

## Native styling and fallback

Authored baseline:

```html
<p>A <mark class="mui-highlight-mark">native mark</mark> works without JavaScript.</p>
```

`--mui-highlight-background` and `--mui-highlight-color` customize external presentation.
The helper never writes inline styles. Optional `span.mui-highlight` preserves whitespace
and wraps long text; base mark CSS changes no font metrics and adds no padding. Forced colors use
system highlight/text colors, and print uses an underline when backgrounds are not printed.
Native hidden surfaces remain hidden even when their text is updated; standalone CSS does
not force `hidden="until-found"` to display:none. That reveal path is not separately certified.

The demo starts with seven authored fallback marks equivalent to its initial literal match
set. Matching controls are disabled until the optional application script enables them,
so no-JS use does not submit edited text as an unintended form request. Without enhancement,
the static marks/text/navigation remain useful; controls do not pretend to update matching.
Neither the helper nor demo adds automatic live announcements.

## Migration steps and acceptance

1. [x] Render only original text slices and native marks into an explicitly owned span.
2. [x] Define bounded literal/case/Unicode/overlap rules and explicit update/clear semantics.
3. [x] Ship independent mark CSS and optional ESM/classic helpers, without a registry/controller.
4. [x] Exercise HTML/metacharacters, Unicode offsets, limits, ownership, selection and browser fallback.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**494 tests**. All **27 Highlight tests** were rerun after refining the no-JS demo guard.
They cover metacharacters, HTML/class strings, empty/duplicate/overlapping patterns, case,
Unicode expansion/supplementary/combining boundaries, every limit, atomic failures, unsafe
targets, ownership, hidden/detached/cross-document surfaces and selection.
Chromium acceptance exercised:

- Seven initial matches, six with case sensitivity, custom classes, literal HTML/regex-looking
  strings with no injected elements, original UTF-16 ranges and whole-text selection.
- Clear/update/error behavior, hidden targets, non-interactive mark accessibility structure,
  surrounding link identity/listener preservation and real keyboard navigation.
- Detached helper rendering, equivalent ESM/classic results, helper-first and core-first
  loading, plus coexistence with aggregate/widgets/advanced without any mui-highlight definition.
- 280px/320px long-text wrapping, RTL Arabic match order, 200% CSS zoom, forced-color contrast
  and print underline rules.
- A JavaScript-disabled context with seven authored marks, identical visible source text and
  disabled matching controls. Screen-reader speech and selection persistence during updates
  are not certified.

Measured optional payloads: ESM **2,714 / 1,169 gzip bytes**, classic **3,202 / 1,401**,
CSS **725 / 345**. JS ceilings are **2,000 gzip bytes each**; CSS ceiling **750**.
Loading one helper mode plus CSS costs **1,514 gzip bytes (ESM)** or **1,746 (classic)**,
not both modes together. Demo-only JS is **1,493 / 619 gzip bytes**, CSS **1,052 / 521**.
Core remains **14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes.
All runtime dependencies remain zero. This is not all-browser, locale/full-regexp,
rich-text editor, browser-UI zoom or framework/pixel parity certification.
