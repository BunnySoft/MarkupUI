# Divider

**Migration status: 🟢 Verified retained native HTML/CSS scope.**
**Architecture: CSS-only.** Native hr or explicitly authored separator/decorative markup
owns meaning; external borders/flex layout supply presentation. There is no new Custom
Element, runtime, observer, theme renderer or focus/keyboard handler.

## Pinned reference and loading

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/divider)
- [Public three props and default slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/demos/enUS/index.demo-entry.md)
- [Implementation and source theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/src/Divider.tsx)
- [Source presentation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/src/styles/index.cssr.ts)
- [Source theme values](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/divider/styles/light.ts)

There is no public size, thickness or color prop in this pinned API. Such dimensions and
presentation values are native CSS tokens in the target, not invented framework props.
The four public rows are preserved, with three explicit source theme supplements.

| Asset | Purpose |
| --- | --- |
| `src/components/divider/divider.css` | Maintained native Divider stylesheet. |
| `dist/markup-ui-divider.css` | Browser CSS distribution. |
| `@dataengine/markup-ui/divider/style.css` | Stylesheet-only package export. |
| `demo/components/divider.html`, `.css` | Separate native semantic/decorative/layout examples; no script. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-divider.css">
```

Copy/serve the stylesheet normally. There is no `./divider` JS export, ESM/classic runtime,
`MarkupUIDivider` global or fake JS budget. CSS can load before or after the legacy aggregate.
It does not register or upgrade the existing `mui-divider` custom element.

The unchanged legacy registry still sets separator role and initial orientation from its
`vertical` attribute; legacy styles still use their existing border-top/border-left rules.
Use the new native class-based anatomy deliberately, rather than layering it onto the old tag
and assuming an enhanced controller or alias adapter. Legacy bytes/behavior are preserved,
not promoted to complete dynamic/native parity by this migration.

## Semantic or decorative: the author chooses

**Horizontal thematic break: use native hr.**

```html
<hr class="mui-divider">
<hr class="mui-divider" data-dashed aria-label="End of introduction">
```

Native hr supplies separator semantics without a generated role. An optional explicit name
belongs to that same owner. An hr is void: never put caption text, headings, links or other
children inside it. CSS does not repair invalid HTML or manufacture a heading from attributes.

**Purely decorative rule: use a hidden-from-AX native span/div.**

```html
<span class="mui-divider" aria-hidden="true"></span>
```

This hides decoration from accessibility APIs, not from sight. CSS itself never adds
aria-hidden, role or an accessible label. You may use a native hr with an explicit decorative
policy if appropriate; no extra announced separator is necessary for a purely visual flourish.

These are static separators, not draggable splitters. No tabindex, aria-valuenow,
pointer handler, observer or synthetic keyboard behavior is supplied. Keep real native
links/buttons outside separator descendants; their tab order and activation remain native.

## Orientation has one source of truth

**Semantic vertical separator: the authored ARIA orientation drives the geometry.**

```html
<span class="mui-divider" role="separator" aria-orientation="vertical"
      aria-label="Action groups"></span>
```

Absence of aria-orientation, or an explicit horizontal value, uses the horizontal rule.
CSS does not set ARIA from a separate visual flag, so the semantic/native owner is unambiguous.
The vertical rule defaults to one em tall, one CSS pixel thick, centered in a flex row or
aligned to the middle in inline text. It is not automatically stretched to arbitrary siblings.

**Decorative vertical separator:**

```html
<span class="mui-divider" data-orientation="vertical" aria-hidden="true"></span>
```

The data-orientation form only applies when aria-hidden is explicitly true and no
aria-orientation is authored. Visible semantic separators ignore this decorative-only flag.
An explicit ARIA orientation wins even on a decorative element. The target has no interpreted
`vertical` Boolean attribute/property; that syntax remains only in the unchanged legacy tag.

The retained layout uses logical borders with ordinary horizontal writing mode and native
LTR/RTL direction. Alternate vertical writing modes need their own deliberate CSS/ARIA
orientation policy; no writing-mode reset or automatic physical-axis measurement is introduced.

## Captioned separators versus actual headings

### One named separator with one original visible caption

```html
<div class="mui-divider mui-divider-captioned" role="separator"
     aria-labelledby="settings-caption">
  <span class="mui-divider-label" id="settings-caption" aria-hidden="true">Settings</span>
</div>
```

The caption's original text is referenced as the separator's accessible name. Explicitly
excluding that plain caption from the accessibility tree avoids a second text owner; it
does **not** visually hide it. The accessible-name algorithm follows the referenced node
even though it is aria-hidden. There is no duplicate string in an aria-label/hidden mirror.
Chromium AX acceptance verified the separator name and ignored caption node; this is not
certification of every screen reader's spoken output.

Only noninteractive phrasing content belongs in this named-separator pattern. Do not put
a meaningful heading, link or button inside a separator's presentational descendants or
inside an aria-hidden caption. Give repeated captions unique IDs when authored/cloned.

### A real heading with decorative rules

```html
<div class="mui-divider mui-divider-captioned" data-placement="start">
  <h2 class="mui-divider-label">A real section heading</h2>
</div>
```

Here the wrapper has **no separator/presentation role and no aria-hidden**. The h2 remains
a real author-selected heading. Empty CSS pseudo-elements draw the decorative rules;
they do not insert text or extra semantic separators. Choose the actual heading level
from document context rather than copying a visual size as a hierarchy.

### Caption layout and source differences

Horizontal captions use flex layout, a gap and two border pseudo-elements. Long labels wrap
instead of adopting the source's nowrap clipping risk. Native text, selection, nodes and
explicit ARIA remain intact. No line text is copied, parsed or generated.

Upstream does not render its default slot when vertical. This CSS-only composition cannot
silently discard authored DOM: if a captioned divider is switched to vertical, its original
caption stays beside the single vertical border, with no horizontal pseudo-rules. Its height
is at least the length token and grows with content. This is an explicit native preservation
adaptation, not a claim of upstream vertical-slot parity. Prefer an uncaptioned vertical
separator and a separate heading when those are the actual semantics.

The dashed flag applies to native borders in both orientations. Upstream's vertical branch
uses a solid background rather than its horizontal dashed-line children; native vertical
dashing is a deliberate consistent border composition, not pixel-identical source rendering.

## Placement, spacing and dimensions

`data-placement="center"` or absence centers a caption. The documented left/right vocabulary
is retained as **physical** placement in LTR and RTL; target-only `start`/`end` are logical
alternatives. Left/right use native `:dir()` matching; without that selector support their
decoration falls back to centered placement, while text and logical start/end remain usable.
Unknown placement values retain the base centered style; no runtime parser claims validation.

`data-dashed` is a presence-only CSS switch. Remove it for a solid rule; a present
`data-dashed="false"` is still present, not a parsed framework Boolean.

| CSS token | Default / purpose |
| --- | --- |
| `--mui-divider-color` | `#b8b8c3`, rule color |
| `--mui-divider-text-color` | `inherit`, native caption color |
| `--mui-divider-thickness` | `1px`, positive native border width |
| `--mui-divider-space` | `1.5rem`, horizontal block spacing |
| `--mui-divider-inline-space` | `.5rem`, vertical inline spacing |
| `--mui-divider-length` | `1em`, vertical length; minimum for captioned vertical composition |
| `--mui-divider-label-gap` | `.75rem`, label/rule gap |
| `--mui-divider-label-size`, `--mui-divider-label-weight` | `1rem`, `600`; presentation only, not a heading role |
| `--mui-divider-edge` | `28px`, preferred short rule at an edge placement |
| `--mui-divider-rule-min` | `1rem`, minimum horizontal caption rule length |

Use valid native CSS values and sensible positive geometry. Invalid/zero widths or colors
can remove a visible rule; the library does not silently coerce them into a valid separator.
Minimum rule lengths and label gaps need physical space: reduce those tokens for unusually
tiny containers rather than relying on clipping. Container dimensions/grid placement are
application CSS; horizontal width is 100%, with border-box sizing and min-inline-size zero.
The demo's grid separator explicitly spans both native grid columns; no Grid module is needed.

Borders print without background graphics. Forced-colors uses CanvasText rules and does not
disable browser color adjustment. There is no animation/transition, so reduced motion requires
no runtime or extra motion rule. Actual contrast, printer behavior and custom CSS remain
application responsibilities; this is not automatic theme/contrast certification.

Ordinary hidden dividers/templates remain hidden/inert despite block/flex styling.
Until-found is not converted into ordinary hidden by this stylesheet. Author-selected
ARIA is never rewritten. Later native text/attribute/token changes and reconnects follow
normal DOM/CSS behavior; there is no upgrade, observer, lifecycle or disposal API.

## API tracker and numbered acceptance

🟢 Verified **native/CSS adaptation**, not a Vue-compatible prop/slot runtime.
⏭️ Intentionally omitted framework contract.

| Upstream item | Native equivalent | Status / limits |
| --- | --- | --- |
| `dashed` | Presence of data-dashed; native border style. | 🟢 Both orientations; vertical composition difference is explicit. |
| `title-placement` | data-placement left/right/center; logical start/end additions. | 🟢 Physical versus logical RTL behavior defined; no JS state. |
| `vertical` | Semantic aria-orientation or guarded decorative data-orientation. | 🟢 One orientation owner; no automatic ARIA/role synthesis. |
| default slot | Original horizontal caption or real heading in a neutral decorative wrapper. | 🟢 No hr children or hidden duplicate string; vertical DOM is preserved rather than discarded. |
| Source theme/themeOverrides/builtinThemeOverrides | External CSS/tokens. | ⏭️ Three provider/object/internal contracts omitted. |

All four original public rows plus three explicit source supplements remain:
**7 rows, 4 Verified ADAPTED native targets and 3 intentional omissions**.

1. [x] Review pinned props/content, source-only themes and unchanged legacy registry/styles.
2. [x] Define semantic/decorative and named-separator/real-heading anatomy with explicit owners.
3. [x] Implement external horizontal/vertical/dashed/caption/placement/size-token CSS.
4. [x] Preserve text/selection/ARIA/hidden state and authoritative orientation without a runtime.
5. [x] Add separate no-JS demo and existing-runner native/source/packaging tests.
6. [x] Validate build/budgets and Chromium geometry/naming/RTL/zoom/print/coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Flex.

### Evidence — 2026-09-08

- Focused Divider tests passed; final `pnpm build && pnpm test` passed **351 tests**,
  including **11 Divider tests** and all 340 earlier tests.
- Tests cover CSS-only exports/source, void hr, original caption/name ownership, native
  heading context, explicit semantic/decorative orientation, no added focusability,
  native adjacent actions, hidden/templates, reconnects, RTL scope and print/motion policy.
- Review fixed caption-selector specificity so explicit vertical orientation remains
  authoritative. Unit and Chromium regression checks preserve original caption nodes/text
  while removing horizontal pseudo-rules; switching back restores horizontal geometry.
- Chromium loaded no scripts/injected styles before the explicit legacy check. Horizontal
  rules were 1px, custom thickness 3px; vertical rules were 1×16px and dashed custom 1×32px.
  Center rules matched within subpixel rounding; physical edges were 28px. RTL logical start
  used the inline-start edge while physical left remained on the left.
- Chromium AX found native horizontal separators, the authored named separator, and a
  vertical separator with matching orientation. Decorative nodes and the referenced plain
  caption were ignored independently; the separate real h2 retained its heading role/level.
- Native Tab skipped separators and Enter followed the adjacent link. Selecting the original
  long caption returned its exact text without a generated duplicate.
- At 960/480/320/280px there was no horizontal document overflow or clipped caption. At
  280px the long label was 185px wide/96px tall with 16px visible rules; the grid hr matched
  the full grid width. At 200% CSS zoom the vertical 16px length became 32px.
- Forced colors gave matching system-color horizontal/vertical/caption rules, preserving
  dashed style. No animation/transition ran. Print preserved borders and all label text;
  in-memory A4 PDF generation without backgrounds returned a valid 50,056-byte PDF.
  No PDF file was written; physical printer/all-AT certification is not claimed.
- Isolated CSS-before/after-legacy checks preserved exact native markup/nodes and outside hr
  styling. Legacy mui-divider still received its original initial horizontal/vertical role/
  orientation and border rules. No new Divider runtime/global was introduced; only the task
  browser tab was used.
- **CSS: 2,923 raw / 765 gzip bytes, under its 1,500-byte ceiling.**
  Core remains **14,611 / 15,000 gzip bytes**, without a dependency or JavaScript bundle added.
- Reference validation preserved all four original name/source rows plus three explicit
  source supplements: **96 pages, 3,122 rows, 384 tasks (68 accepted), 736 relative file links**.

This closes retained Divider scope, not all P2 layout or cross-phase work. Flex is next
through coordinator selection, then Space, Grid and Layout; later content remains on the plan.
