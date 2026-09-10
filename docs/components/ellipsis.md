# Ellipsis

**Migration status: 🟢 Verified retained native CSS/disclosure scope.**
**Architecture: CSS-only.** Native text-overflow/line-clamp and optional
`<details>/<summary>` deliver useful truncation and keyboard/pointer expansion.
There is no Custom Element, JavaScript entry, observer, tooltip dependency or renderer.

## Pinned reference and distribution

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/ellipsis)
- [Public grouped Ellipsis/PerformantEllipsis props and Ellipsis slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/demos/enUS/index.demo-entry.md)
- [Ellipsis implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/Ellipsis.tsx)
- [PerformantEllipsis source and forwarded slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/PerformantEllipsis.tsx)
- [Upstream presentation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/ellipsis/src/styles/index.cssr.ts)
- [Shared theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts)

All five public rows remain: three grouped props and two Ellipsis slots. Five explicit
source supplements record PerformantEllipsis's two forwarded slots and three theme
contracts shared through `ellipsisProps`. No public methods or expand callback are documented;
internal measurement/tooltip functions are not invented as target methods.

| Asset | Purpose |
| --- | --- |
| `src/components/ellipsis/ellipsis.css` | Maintained external CSS. |
| `dist/markup-ui-ellipsis.css` | Browser stylesheet distribution. |
| `@dataengine/markup-ui/ellipsis/style.css` | Stylesheet-only package export. |
| `demo/components/ellipsis.html`, `.css` | Native examples with no application/library JS. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-ellipsis.css">
```

Copy/serve the stylesheet through your normal asset mechanism. There is no `./ellipsis`
JavaScript export, ESM/classic runtime/global, fake registration order or JS budget.
It can load before or after the unchanged legacy aggregate. This is one CSS composition
for both upstream owners, not a separate PerformantEllipsis framework wrapper.

## Single-line and multiline text

Use `.mui-ellipsis` on a native text container containing **noninteractive phrasing content**:
text, span, strong, em or code without interactive/focusable descendants. It becomes a
single-line inline-block with native overflow ellipsis when the safety-selector enhancement is
supported. The original full text remains in the DOM; no abbreviation is substituted.

```html
<span class="mui-ellipsis result-summary">Original complete descriptive text…</span>
<a href="./complete-result.html">Read complete result</a>
```

The ellipsis character above is ordinary authored example punctuation, not a second generated
summary. Supply a meaningful visible full-content route for passive truncation of important
information. Native `title` is not an accessible overlay or a touch/keyboard disclosure.
For inline phrasing within a paragraph, use a span; the opt-in now establishes an inline-level
box, with `vertical-align: bottom`, matching the rendered reference. Short text shrink-wraps
rather than occupying the entire row. Supply an appropriate width when surrounding text
must fit on that same row. Native/authored margins are not reset.

`data-multiline` is a **presence-only styling switch**. Even `data-multiline="false"` is
present; remove the attribute to return to one line. Multiline defaults to two lines:

```html
<span class="mui-ellipsis three-lines" data-multiline>Original long description…</span>
```

```css
.three-lines {
  --mui-ellipsis-lines: 3;
  max-inline-size: 32rem;
}
```

`--mui-ellipsis-lines` takes a native positive CSS integer; use modest whole numbers.
It is not a numeric-string/number property adapter, measurement result or automatically
bounded application input. Zero, negative, fractional or malformed values are invalid for
native line-clamp; they remove clamping rather than being silently changed to a valid count.
`none` deliberately shows all lines. The token has no effect in single-line mode.
CSS custom properties inherit normally; set a value explicitly for independent nested cases.

Clamped passive text uses `-webkit-inline-box` with baseline alignment, also matching the
reference. Its surrounding line box can include baseline space beneath the clipped box.
Authors who need the earlier full-width block presentation can explicitly use block display
for single-line text, or `-webkit-box` for clamped multiline text, with a suitable width.
Native disclosure previews retain their existing block layout rather than adopting the
passive inline behavior.

There is no fixed height/max-height, pixel measurement or polling loop. Width, font and content
changes are handled by native layout. Long unbroken words wrap in multiline/expanded mode.
That wrapping is a retained safe native difference from upstream's horizontal clipping of
an unbreakable word; it is not exact unbroken-word clipping parity.
The text box has `min-inline-size:0` and `max-inline-size:100%`; set a usable available width.
If an outer wrapper is the actual flex/grid item, it also needs `min-inline-size:0`;
use `minmax(0,1fr)` where a grid track would otherwise retain its min-content width.
The stylesheet cannot shrink arbitrary ancestors or repair an author-fixed container height.
Use `box-sizing:border-box` on a width-constrained author box with padding/borders, as the
demo does, so its decorations do not exceed the available inline space.

## Native expansion: one copy of the text

```html
<details class="mui-ellipsis-disclosure">
  <summary>
    <span class="mui-ellipsis" data-multiline>
      The complete original content, including native emphasis if needed.
    </span>
    <span class="mui-ellipsis-hint">Expand or collapse full text</span>
  </summary>
</details>
```

Keep the preview and visible hint as **direct children of the first native summary**.
The text stays in that same summary both closed and open. Opening removes truncation;
closing restores the selected single/multiline form. No hidden duplicate, generated label,
template cloning or content move is needed. Additional details-body content is ordinary
author-owned HTML and is not automatically opened for print.

The native marker, visible hint and block preview deliberately give this disclosure a
different layout from an upstream clickable text span. Upstream multiline click expansion
and the native alternative both expose the full text. The pinned single-line click path
removes the ellipsis marker but retains nowrap/hidden overflow; native disclosure instead
fully wraps that text. This useful native behavior is not represented as click-handler parity.

- The real summary owns native disclosure semantics, focus, keyboard and activation.
  Enter/Space and pointer activation use browser defaults; there are no duplicate handlers.
  Its native marker remains visible and `:focus-visible` has a 2px outline.
- Keep a visible hint even when text appears short. It is always available on keyboard/touch;
  no hover or overflow measurement determines whether the control exists.
- The default summary accessible name includes the full original text plus the visible hint.
  No automatic role, short `aria-label`, `aria-hidden`, live region or duplicate full-text
  label is added. Author-selected ARIA remains author-owned; do not overwrite the full name
  with an abbreviated hidden label.
- Native `open` and `details.open` are the state interface. Applications may listen to native
  `toggle` when useful; browser toggle-event coalescing is not replaced by a component callback.
  Native disclosure toggles in both directions, not an upstream click interceptor.
- Summary text selection follows browser behavior; the summary remains the disclosure control
  even when expanded. Use the visible full-content link route when long reading/selection
  should be entirely separate from activation.

No overflow-only affordance, Tooltip object, portal, positioning, hover promotion or
automatic announcement is promised. PerformantEllipsis's source swaps to Ellipsis on first
mouseenter; the target never remounts or trades keyboard/touch behavior for that lifecycle.

## Content boundary, safety and fallbacks

Do not put a nested link/button/input or custom interactive widget inside truncated text or
inside this summary. Place native actions **outside** the clipping/disclosure control. Their
href/target/rel, explicit button type, focus and form semantics then remain native.

As a defensive native-CSS measure, truncation turns off when a standard native action,
editable/focusable node, media/embed, details/summary or image map is the text element or
its descendant. It also turns off inside anchors/buttons or tabindex/contenteditable
ancestors. Late native controls receive the same full-text treatment automatically.
This is a fail-open guard, not DOM validation: it does not inspect arbitrary custom elements,
shadow roots, author-made role widgets without native focus attributes or external clipping.
Those are outside the supported noninteractive-content contract.

An ordinary native summary ancestor is the deliberate exception for the supported disclosure above;
do not put `.mui-ellipsis` directly on summary or truncate the hint. Author `hidden` content
and native templates stay hidden/inert, including in open disclosures and print.
Scoped hidden/template display preservation uses `!important` to defeat the open-state selector;
it does not remove attributes or claim to control arbitrary descendant content.

- **Without `:has` selector support:** all text remains normally wrapped. The clipping
  enhancement requires that support so its native-control guard is not silently lost.
- **Without line-clamp support:** multiline content remains fully wrapped/visible;
  single-line truncation may still work. No max-height approximation clips an unknown line.
- **Print:** full original text in the preview/summary is shown, even when details is closed;
  the optional disclosure hint is hidden. Unrelated details, explicit hidden content and
  templates are not opened/revealed. Author CSS must not impose a conflicting fixed height.
- **RTL:** native direction/language and ellipsis placement remain browser-owned; logical
  sizing and normal wrapping avoid an LTR-only layout.
- **Motion/forced colors:** no animations or transitions exist. Focus uses currentColor by
  default (`--mui-ellipsis-focus-color` can override it) and does not disable system colors.

CSS does not parse/evaluate HTML, duplicate strings or intercept clicks. Original nodes,
listeners, attributes, late authored content and templates remain application-owned.
No pre-upgrade properties, observer cleanup, disconnect/reconnect hooks or disposal API
are necessary. The source introduces no global styles or runtime/CSS-in-JS declarations.

Ellipsis has no independent typography or text palette: font family/size, line height and
foreground color inherit from the surrounding page in both light and dark contexts.
No font/color theme object or token parser is added. See the
[rendered visual-default audit](../style-audit/components/ellipsis.md) for measurements,
fixed-origin screenshots and explicit retained differences.

## API and slot tracker

🟢 Verified **native adaptation**, not a Vue-compatible prop/slot runtime.
⏭️ Intentionally omitted overlay/framework contract.

| Upstream item | Native target | Status / limits |
| --- | --- | --- |
| Both owners: `expand-trigger` | Explicit native details/summary; native open/toggle. | 🟢 Keyboard/pointer disclosure, not click interception on arbitrary text or overflow-only triggering. |
| Both owners: `line-clamp` | data-multiline and --mui-ellipsis-lines; native single-line default. | 🟢 CSS integer grammar and full-text unsupported/invalid fallback; no runtime parser. |
| Both owners: `tooltip` | No automatic tooltip. Use a visible native full-content route. | ⏭️ Boolean/TooltipProps overlay, hover measurement and default-on tooltip omitted. |
| Ellipsis default slot | Original native noninteractive phrasing content. | 🟢 Stable nodes/selection/name with explicit content boundary. |
| Ellipsis tooltip slot | Application-owned distinct content/overlay if separately implemented. | ⏭️ No tooltip slot/renderer or title-as-tooltip parity claim. |
| Source PerformantEllipsis default slot | Same original native content. | 🟢 No hover-triggered remount. |
| Source PerformantEllipsis tooltip slot | No forwarded tooltip rendering. | ⏭️ Explicit companion-slot omission. |
| Both owners: source theme/themeOverrides/builtinThemeOverrides | External CSS/tokens. | ⏭️ Three shared grouped framework contracts omitted. |

The reference retains all five public rows plus five explicit source supplements:
**10 rows, 4 Verified ADAPTED native targets and 6 intentional omissions**.
P3 tooltip/overlay work remains separate; native details does not make all P3 complete.

## Numbered migration steps and acceptance

1. [x] Review both pinned owners, all public rows and actual source-only forwarded/theme contracts.
2. [x] Implement CSS-first single/multiline layout and full-text fallback without measurement.
3. [x] Provide visible native keyboard/pointer disclosure with one original text/name owner.
4. [x] Define noninteractive content, defensive unclipping, print/RTL/motion and hidden-state policies.
5. [x] Add no-JS demo plus native/source/packaging tests using the existing runner.
6. [x] Validate build/budgets and Chromium geometry, selection, names, activation and coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Page Header.

### Initial migration evidence — 2026-09-08 (historical block appearance)

- Focused Ellipsis tests and final `pnpm build && pnpm test` passed:
  **327 tests**, including **11 Ellipsis tests** and all 316 earlier tests.
- Tests cover stylesheet-only export, complete native content/ARIA, native click/open/toggle,
  reconnect/node/listener identity, source guards, late content/templates/hidden states,
  language/direction, no-runtime/no-motion policy and print restoration.
- Review fixed open-disclosure selector specificity that could reveal an explicitly hidden
  preview; an open/hidden/template regression test and Chromium check now pass.
- Chromium: no demo scripts/injected styles before the explicit legacy test. Single-line
  content was 24px high with true horizontal overflow; two-line text was 48px with 264px
  full content; the custom three-line grid was 72px. Native details expanded the original
  text to full height. Long words and flex/grid min-content constraints behaved correctly.
- Enter/Space produced one open/close transition and native toggle event each; Tab reached
  the next summary with a visible 2px outline. Pointer expansion worked. Chromium's AX
  tree reported a focusable native DisclosureTriangle with full original text plus hint
  as its name and native expanded state, without hidden duplicate text or fabricated roles.
- Expanded selection exactly matched original content; adjacent native-link Enter navigation
  worked. A late nested native button disabled truncation until removed; no clipped native
  focus target remained in that supported defensive case.
- Invalid 0/-1/2.5/NaN/none line values showed all text; live value 4 produced 96px.
  Native width changes preserved two lines; changing line height to 30px produced 60px.
  At 200% CSS zoom, the single line scaled from 24px to 48px; RTL stayed native.
  Final 320px/280px viewport checks had no horizontal document overflow; the demo's padded
  disclosure uses border-box sizing rather than exceeding its width constraint.
- Print media showed all preview text, including closed summaries, with no clamp. In-memory
  Chromium A4 PDF generation with background graphics disabled returned a valid 57,362-byte
  PDF; no PDF file was written. Forced colors retained focus, and reduced motion had no
  animation/transition to suppress.
- Removing CSSSupportsRules simulated unsupported clamp and unsupported safety selectors;
  text became fully visible. These are Chromium simulations, not other-engine certification.
- Isolated CSS-before/after-legacy checks preserved exact native nodes/markup, outside
  styles and two-line geometry. No Ellipsis Custom Element/global appeared. Browser tests
  used only the task tab, leaving other tabs untouched.
- **CSS: 2,474 raw / 676 gzip bytes under a 1,500-byte ceiling.**
  Core remains **14,611 / 15,000 gzip bytes**, with no new dependency or JS bundle.
- Reference validation preserved all five original name/source rows plus five explicit source
  supplements: **96 pages, 3,116 rows, 384 tasks (60 accepted), 722 relative file links**.

### Visual-default audit — 2026-09-10

- `pnpm test -- tests\ellipsis.test.ts`: **12 tests passed**.
- Thirteen ordinary passive cases matched pinned reference clipping/layout/text metrics in
  both themes and RTL, including initial PerformantEllipsis rendering. Unbroken-word
  safety and native disclosure were measured separately as deliberate differences.
- Short width changed **260→105.734px**; an inline-limited row changed **67.172→22.391px**
  high. Inline multiline composition changed **89.563→51.172px**, matching the reference.
- Twelve fixed-origin light/dark screenshot comparisons had **zero differing RGB pixels**.
- Native Enter/Space/pointer toggled once each, preserving one original preview and exact
  expanded selection. Author overrides, invalid clamp values, nested-control guards,
  hidden/templates, print/system modes and unsupported-feature simulations were verified.
- CSS is **788 / unchanged 1,500 gzip bytes**, with zero component JS/dependencies.
  The coordinator's isolated release build and all **12 Ellipsis tests** pass;
  no shared source or generated adapter was edited.

This is retained native/CSS scope, not all-browser/AT, arbitrary interactive-content or
vendor-tooltip/pixel parity certification. No tooltip runtime, binder or next component is
introduced by this audit.
