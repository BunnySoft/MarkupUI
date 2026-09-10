# Breadcrumb default-style audit

**2026-09-10 — integrated defaults fixed; native limits documented.** Changes are limited to Breadcrumb
CSS, its tests and its canonical/audit documentation. No shared source, generated
asset, demo, dependency, full build or commit changed.

## Pinned reference and isolated method

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected Breadcrumb/BreadcrumbItem, their cssr stylesheet, light/dark/common
Breadcrumb themes and common text/button-fill/radius values.

The private `.breadcrumb-audit` fixture bundled existing **Naive UI 2.45.3 / Vue
3.5.30** using existing esbuild. Actual NConfigProvider/NGlobalStyle/NBreadcrumb/
NBreadcrumbItem were compared with native named nav/list/link markup and source
CSS, without demo or widgets styles. Private Chromium contexts were created and
closed without touching shared pages. Fixture files/server were cleaned up.

Final light/dark comparisons used the **same application font and body backgrounds
on both sides**: white light / `#101014` dark. Reference 300ms transitions settled
before measurements. Native theme selection used `data-mui-theme`; RTL used native
document direction on both sides.

## Measured corrected defaults

| Property | Before | After / reference |
| --- | --- | --- |
| Default font size | Inherited | 14px (local/shared override supported) |
| Line height at 14px | 21px | **17.5px** |
| Label padding | 2px 4px at the fixture root size | **4px all sides** |
| Label height | 25px | **25.5px** |
| Corners | 0px, 2px only on focus | **3px** |
| Idle link light | `#0369a1`, underlined | `#767c82`, no underline |
| Idle link dark | Same blue fallback | white `.52` |
| Current text light / dark | `#18181b` / same fallback | `#333639` / white `.82` |
| Current weight | 600 | **400** |
| Separator light / dark | `#71717a` / same fallback | `#767c82` / white `.52` |
| Passive unavailable light / dark | `#52525b` / same fallback | `#767c82` / white `.52` |
| Horizontal gaps | Permanent list/row gaps | **8px margins on each visible separator** |

Genuine non-current href links now have matching state colors:

| State | Light foreground / fill | Dark foreground / fill |
| --- | --- | --- |
| Hover | `#333639` / `rgb(46 51 56 / .09)` | white `.82` / white `.12` |
| Pressed | `#333639` / `rgb(46 51 56 / .13)` | white `.82` / white `.08` |

No transition or pointer-event suppression was introduced.

## Matched rendered scope

Five three-item paths × light/dark × LTR/RTL = **20 matching path comparisons**:
authored textual slash separators, a current-page anchor, a passive unavailable
ancestor, custom global/per-item text separators, and separator suppression.

Compared each label's font size/line height/color/weight/padding/radius/decoration,
relative x/y/width/height, and visible separator width/color. Idle link widths were
**45.53125px** (“Home”) and **56.78125px** (“Projects”); current width **54.328125px**.
With text `/`, label x positions were **0 / 67 / 145.25px** in LTR, matching Naive.
Genuine-link hover and pressed foreground/fill values also matched in both themes.

Separator suppression now removes its actual spacing. Previously an item still
left the list's fixed gap when its separator was absent. The native margin-on-
separator composition fixes that without changing visible-sibling/hidden ownership.

## Honest separator, last-item and disabled differences

### Empty shape versus text glyph

The retained default empty separator draws a non-text border slash. At 14px it
reserves **7px**, while Naive's `/` glyph measured **5.46875px** in the fixture font.
With two shapes, native label positions were **0 / 68.53125 / 148.3125px**, versus
reference **0 / 67 / 145.25px**. The final-label delta is **3.0625px**.

This shape case is not counted as text-glyph geometry parity. Authors can put `/`
in the existing decorative separator span for matched font-relative spacing; no
generated slash text or icon dependency is added.

### Last item is not inferred current

Native `aria-current="page"` remains the appearance/semantic owner. Without that
attribute, a final native item stayed idle `#767c82` / white `.52`; Naive's final
child became `#333639` / white `.82` by position. No last-child rule, URL comparison
or automatic current marker was added merely to hide this intentional difference.

Current-page anchors remain focusable/navigable, unlike a styling-only interpretation
of “current means disabled.” Native hover/pressed fills are excluded for explicitly
current anchors, not inferred final positions.

### “Disabled” is a native mapping, not an upstream prop

There is no reviewed disabled prop. Naive `clickable=false` does not remove href/
callbacks and still changes foreground on hover. A passive native unavailable
span with `aria-disabled=true` stays noninteractive and retains its muted foreground.
Measured hovered source/passive colors were **#333639 / #767c82** respectively.
Neither had a fill. This safer native state is deliberately not source-hover parity.
An `aria-disabled` attribute on a genuine href anchor alone still does not disable it.

## Public tokens and theme roles

Private light/dark defaults represent textColor3, textColor2 and the reference
buttonColor2 hover/pressed fills. Wrong-role legacy primary/secondary text fallbacks
are removed without modifying any shared palette.

Existing public link/current/disabled/separator/general color and gap overrides
remain available. New font/line-height/radius/current-weight and hover/pressed
foreground/background tokens expose the corrected defaults. Explicit state colors
win; otherwise an existing authored link-color token persists in hover/pressed
states. Font size can reuse shared `--mui-font-size`; family stays inherited.

No body background, color-scheme, font download, theme watcher, provider, routing
or registration behavior is added. The application must supply a readable backdrop
for its selected theme.

## Author and native regression measurements

- Shared font-size **18px** applied; local teal link color survived hover, while
  current color/weight overrides yielded **purple / 700**.
- Explicit hover tokens yielded navy/pink; pressed tokens yielded maroon/ivory.
- More-specific author CSS before a later package sheet kept green, underlined
  links, including during hover.
- Native Enter on a current-page href link navigated to **#current**, retained
  the anchor and authored `aria-current="page"`; passive unavailable text rejected focus.
- Hiding the final item removed the preceding trailing separator; hiding the
  first too left the sole visible item at x=0 with no separator or phantom gap.
- Nested dark/light current colors were white `.82` / `#333639`. A parent gap of
  12px did not leak into the nested nav's **8px** default.
- At a **280px** content width, a long destination wrapped to **60.5px** label
  height; the path was **94px** high, scroll/client width both 280px, with no page
  overflow. Long labels remain wrapping rather than source nowrap.
- Forced colors restored the current label to system black and preserved the
  explicit focus outline. Existing tests cover legal list structure, decorative
  text/SVG, native href/target/rel/listeners, hidden/templates and script-free delivery.

## Tests and strict budget

`node node_modules\vitest\vitest.mjs run tests\breadcrumb.test.ts`
→ **17 passed**: 12 existing native-contract tests updated for corrected defaults,
plus five style/state/spacing/author/budget regressions.

| Source CSS | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Before | 3,827 | 928 |
| After | 5,146 | 1,120 |

The **1,500 gzip-byte ceiling is unchanged**, leaving **380 bytes**. No JS or
dependency bytes. The coordinator's isolated release `pnpm build` and all **17
Breadcrumb tests** passed. Built CSS remains **1,120 gzip bytes**; integration
is complete without including unfinished unrelated work.

## Remaining scope limits

The non-text slash, wrapped list/labels, explicit current-page owner, passive
disabled semantics, 2px focus outline, visible-sibling `:has()` behavior and no
animation remain intentional adaptations. A no-`:has()` engine retains the
separator-free fallback. No URL state inference, string/slot renderer, disabled
link controller, overflow menu or router integration is implemented.

Only Chromium was rendered. This is the stated default/state/style scope, not
complete pixel, framework, all-browser or screen-reader speech parity.
