# Statistic

**Migration status: 🟢 Verified for the retained passive native scope below.**
Statistic presents a label, value and optional native prefix/suffix content. It performs no
numeric parsing, automatic formatting, value animation or implicit live announcement.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Statistic documentation](https://www.naiveui.com/en-US/os-theme/components/statistic)
- [Public API: three props and four slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/demos/enUS/index.demo-entry.md)
- [Source label/value precedence and theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/statistic/src/Statistic.tsx)

There are no formatting/locale/precision props, events, methods or companion APIs on the
pinned page. Number Animation is a separate catalog component and is not imported or
implemented by this migration.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-statistic.js` | ESM; exports `MuiStatistic`, `registerStatistic()`; registers on browser import. |
| `dist/markup-ui-statistic.global.js` | Classic script; registers and exposes `MarkupUIStatistic`. |
| `dist/markup-ui-statistic.css` | External component and native static-statistic CSS. |
| `dist/components/statistic/index.d.ts` | Type declarations. |
| `demo/components/statistic.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript example. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-statistic.css">
<script defer src="./vendor/markup-ui-statistic.global.js"></script>
<script defer src="./app.js"></script>

<mui-statistic label="Revenue" value="12345.60" prefix="$" suffix="USD" tabular-nums></mui-statistic>
```

Application ESM: `import "@dataengine/markup-ui/statistic";`. Serve/link the
`@dataengine/markup-ui/statistic/style.css` export with your asset mechanism. Plain browsers
import the served JS URL instead of the package specifier. Consumers need no compiler,
provider, formatter dependency or runtime library.

Load enhanced Statistic **before the legacy aggregate**, with ordered `defer` scripts or
ESM imports. Existing enhanced definitions are preserved. Legacy-first loading throws an
explicit conflict rather than pretending to upgrade the element. Do not load both enhanced
distributions together. Legacy implementation/styles and previous bundle sizes stay unchanged.

## Literal value semantics

`value` / `.value` accepts strings or finite numbers:

- Missing attribute or assignment of `null`/`undefined` means **no property override**.
  Authored default/value content is then used; if none exists, no value is manufactured.
- Numeric zero is a visible `0`, not an empty value.
- An explicit empty string is a present value override and stays empty; it does not become
  zero, “N/A” or a placeholder dash. Whitespace strings remain strings.
- Finite numbers are converted using ordinary `String(number)`, without rounding/grouping
  or locale inference. JavaScript's normal `-0` string conversion produces `0`.
- Arbitrary strings, including `0012`, `N/A`, `NaN` or already-localized numbers, are
  preserved verbatim. They are not parsed into numbers.
- Nonfinite numeric values throw `RangeError` before changing the previous attribute.
  Unsupported object/array/Boolean property inputs throw `TypeError`, rather than turning
  into misleading object/comma/Boolean display text.

The getter returns the attribute string or `undefined`, not a reparsed numeric model.
All text attributes are written through native text content, never parsed as HTML.
Property assignment is silent: no change/input or artificial “value updated” event.

## Authored regions and precedence

```html
<mui-statistic role="group" aria-labelledby="metric-label" tabular-nums>
  <h3 data-mui-statistic-label id="metric-label">Active users</h3>
  <span data-mui-statistic-prefix aria-hidden="true">≈</span>
  <strong data-mui-statistic-value>128</strong>
  <span data-mui-statistic-suffix><a href="./users.html">people</a></span>
</mui-statistic>
```

Direct `data-mui-statistic-label`, `data-mui-statistic-value`,
`data-mui-statistic-prefix` and `data-mui-statistic-suffix` regions become native content
in fixed label/prefix/value/suffix areas. Unmarked ordinary child nodes are default value
content. Native headings, links, SVGs and listeners are moved, not cloned or serialized.
Use direct regions; nested authored structure stays ordinary HTML, not a recursive renderer.

| Area | Precedence |
| --- | --- |
| Label | A nonempty `label` attribute/property wins; otherwise authored label content. Empty string falls back to the authored label; absent/empty with no authored label leaves no label row. Whitespace is literal text. |
| Value | A present `value` attribute wins, including `0` and `""`; otherwise authored default/value content. |
| Prefix/suffix | Authored native regions win; otherwise the corresponding legacy text attribute supplies a fallback. |

Overrides hide only a library-owned slot wrapper. They do not discard native author nodes,
their own hidden/ARIA settings or listeners. Removing a value/label override restores the
same authored nodes. Prefix/suffix region content is never overwritten by legacy text
fallbacks.

Generated areas/slot wrappers are library-owned structure. Whole-subtree replacement by
the application is deliberately destructive; discarded author nodes are not resurrected.
Late content and region-marker changes are adopted without a framework.

### Legacy names without breaking the native DOM

Legacy `label`, `value`, `prefix` and `suffix` **attributes** remain supported. Their text is
now represented in separate native regions rather than flattened into one concatenated span.

The JavaScript conveniences for legacy affixes are **`.valuePrefix` and `.valueSuffix`**.
`Element.prefix` is already a native readonly XML-namespace property; it is not shadowed.
This also makes pre-definition property assignment safe. Assign `null`/`undefined` to the
affix conveniences to remove the corresponding legacy attribute.

There is no new upstream prefix/suffix prop or renderer object; the pinned upstream surface
uses slots for those regions.

## Formatting and typography

The only documented numeric-formatting-related option is `tabular-nums` / `.tabularNums`.
It selects external CSS `font-variant-numeric: tabular-nums`, not a number formatter.
It defaults false. Presence booleans follow HTML: `tabular-nums="false"` is still present;
remove it or assign `.tabularNums = false`.

For locale-aware presentation, let application code use native Intl and pass its result:

```js
statistic.value = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(12345.6);
```

Statistic displays the resulting `12.345,60` without changing punctuation, units or meaning.
If formatting already includes a currency/unit, do not duplicate it through prefix/suffix.
No locale, currency, precision, animation or formatting callback API is invented here.

CSS tokens include `--mui-statistic-gap`, `--mui-statistic-unit-gap`,
`--mui-statistic-label-color`, `--mui-statistic-label-size`,
`--mui-statistic-label-weight`, `--mui-statistic-value-color`,
`--mui-statistic-value-size`, `--mui-statistic-value-weight`,
`--mui-statistic-line-height`, `--mui-statistic-prefix-color` and
`--mui-statistic-suffix-color`. Defaults retain a 14px label and 28px bold value hierarchy.
SVG/image affixes are sized through CSS. No inline styles, measurement or animation is added.

## Semantics and native actions

The host is not clickable and gains no group, heading, progressbar, output/status or live
role automatically. Author heading levels and group/naming/ARIA relationships explicitly.
Native `<output>` can have live semantics, so it is never generated just to display a value.

An authored `<output>`, heading or ARIA region remains the author's native content. If a
property override hides an authored label referenced by ARIA, maintain the intended naming
relationship yourself; Statistic does not rewrite author-owned references or infer names
from formatted values.

Native links/buttons in affix or value content retain their identity, keyboard behavior
and form type. Use `type="button"` for non-submit actions; deliberate submit buttons remain
submit buttons. No event delegation, disabled/busy state, focus trap or loading policy is
introduced. Hiding a property-overridden region uses native hidden behavior, not an
aria-hidden-but-focusable replacement.

Automatic announcements and Number Animation remain outside this component. If updates
must be announced, choose one application-owned live region and test the actual assistive
technology behavior.

## CSS-only native example and templates

```html
<dl class="mui-statistic" tabular-nums>
  <dt data-mui-statistic-label>Archived reports</dt>
  <dd data-mui-statistic-display>
    <span data-mui-statistic-value>42</span>
    <span data-mui-statistic-suffix>reports</span>
  </dd>
</dl>
```

This native definition list needs only CSS. It supplies semantic label/value structure
without a controller or implicit live output.

Templates remain inert, even with region markers. Statistic never clones/evaluates them;
applications can use ordinary native template cloning themselves when needed.

## Per-property and slot tracker

🟢 Verified retained native target · ⏭️ Framework-specific contract intentionally omitted.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `label` | Native string attribute/property or authored label region. | 🟢 Source-style nonempty-prop precedence; nodes restored when override removed. |
| `tabular-nums` | Boolean attribute / `.tabularNums` and external CSS. | 🟢 Numeric typography only; no parser/formatter. |
| `value` | String or finite number property/attribute; authored default fallback. | 🟢 Zero/blank/missing/text/nonfinite behavior explicit; no semantic numeric coercion. |
| Default slot | Authored ordinary nodes or `data-mui-statistic-value`. | 🟢 Native content/listeners retained under temporary property overrides. |
| Label slot | Native `data-mui-statistic-label`, including authored headings. | 🟢 Heading/ARIA ownership preserved, no inferred level. |
| Prefix slot | Native `data-mui-statistic-prefix`. | 🟢 Native SVG/text/control content, preferred over legacy glyph/text fallback. |
| Suffix slot | Native `data-mui-statistic-suffix`. | 🟢 Native units/links/actions remain real DOM. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS/custom properties. | ⏭️ Provider/theme objects and runtime style adapters omitted. |

## Lifecycle and acceptance

Attribute/property updates synchronize immediately. Late content, region markers and text
changes reconcile on a MutationObserver microtask. Valid pre-definition properties are
reapplied through the accessors. Disconnect releases observation; reconnect preserves native
nodes/listeners and updates current text. No user-event listeners, timers, measurements or
runtime dependencies are installed.

1. [x] Inventory all seven pinned rows and source theme declarations; inspect legacy attributes.
2. [x] Implement literal value/label precedence and native prefix/suffix/default regions.
3. [x] Preserve native namespace properties, headings/ARIA, nodes/listeners and inert templates.
4. [x] Implement external hierarchy/tabular typography with no formatter/animation runtime.
5. [x] Define blank/missing/zero/text/nonfinite behavior and native Intl application examples.
6. [x] Validate focused/integration/build/browser gates and quiet DOM updates.
7. [x] Reconcile four reference tasks, index counts and P2-03 retained-scope completion.

### Evidence — 2026-09-08

- `pnpm test -- tests\statistic.test.ts`: **20 focused tests passed**.
- `pnpm build && pnpm test`: declarations/budgets passed; **290 tests passed**
  (20 Statistic plus all 270 prior tests).
- Tests cover legacy attributes, literal zero/blank/missing/string/Intl output, nonfinite/
  unsupported types, safe text, authored precedence and restoration, headings/ARIA,
  native actions/forms/focus, late markers, inert templates, pre-upgrade and reconnect.
- Review replaced a conflicting `.prefix` convenience with `.valuePrefix`/`.valueSuffix`,
  preserving native `Element.prefix`, and avoided redundant visibility writes during updates.
- Chromium verified literal `0`, `0012`, `N/A` and missing values, 28px SVG affix/value
  styling, live tabular-nums toggling, native Enter/Space/Tab and intentional form submission.
  Property zero/empty overrides restored the original authored value, with suffix actions
  remaining usable; reconnect retained listeners.
- Application-owned Intl produced German and English formatted strings without any library
  reparsing. Explicit native group/heading names remained intact with no added progressbar,
  output/live semantics, stylesheet injection or inline styles.
- A native mutation observation saw only the intended value attribute update, not redundant
  visibility/ARIA writes. Classic-before-aggregate preserved rich registration/typography.
  Separate documents verified ESM pre-upgrade/native-node/namespace-prefix behavior and
  legacy-first collision. Test-only documents closed.
- Reference validation retained all seven original rows plus three source supplements:
  **96 pages, 3,072 rows, 384 tasks (44 accepted), 694 validated relative file links**.
  Retained P2-03 is Verified; whole P2 remains In progress.
- Core remains **14,611 / 15,000 gzip bytes**, previous outputs unchanged.
  Statistic ESM/classic/CSS are **1,540 / 1,745 / 577 gzip bytes**, under independent
  **2,000 / 2,000 / 1,500** ceilings; exact figures are in `dist/manifest.json`.

This is passive native scope, not theme/pixel or all-browser/assistive-technology certification.
Chromium was exercised. Formatting, Number Animation, application announcements and custom
semantics remain explicitly outside scope. Progress + Statistic closes retained P2-03, not
all P2. Typography is next, then Icon and remaining content/layout, only through coordinator
selection; none are started by this change.
