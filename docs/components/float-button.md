# FloatButton and FloatButtonGroup

**Migration status: 🟢 Verified for retained native actions, placement and popover disclosure.**
The implementation is CSS plus authored native buttons/links/groups and browser popover
commands. It adds no custom element, menu engine, focus trap or positioning runtime.

## Distribution and authority

| Asset | Purpose |
| --- | --- |
| `src/components/float-button/float-button.css` | Maintained action/group/panel CSS. |
| `dist/markup-ui-float-button.css` | Browser stylesheet. |
| `@dataengine/markup-ui/float-button/style.css` | Stylesheet-only export. |
| `demo/components/float-button.html`, `.css`, `.js` | Native form/actions, fixed dock and optional application feedback. |

No `./float-button` JS export, registration, provider or mandatory Button/Icon/Badge/Tooltip
dependency exists. Core and plugins are unchanged. Other enhanced components retain their
own loading rules; this native composition has no registration conflict.

References: [official page](https://www.naiveui.com/en-US/os-theme/components/float-button),
[public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/demos/enUS/index.demo-entry.md),
[FloatButton source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/FloatButton.tsx),
[separate FloatButtonGroup source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/FloatButtonGroup.tsx),
[button styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button/src/styles/index.cssr.ts)
and [group styles](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/float-button-group/src/styles/index.cssr.ts),
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/float-button.md) retains **20 original rows**
plus **nine explicit source-only slots/callback-alias/theme entries**: **22 Verified adapted
targets and 7 Intentionally omitted entries**. Hover-only opening and framework controlled/
callback timing are additional declared exclusions within the adapted disclosure rows.

## Native actions and groups

```html
<link rel="stylesheet" href="./vendor/markup-ui-float-button.css">
<button type="button" class="mui-float-button" data-position="relative"
  aria-label="Create project">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2"></path>
  </svg>
</button>
<div class="mui-float-group" data-position="relative" data-shape="square"
  role="group" aria-label="Project actions">
  <button type="submit" form="project-form" class="mui-float-button"
    data-type="primary"><span class="mui-float-description">Save</span></button>
  <button type="reset" form="project-form" class="mui-float-button">
    <span class="mui-float-description">Reset</span>
  </button>
</div>
```

Use real `button`/`a[href]` roots, explicit button types, useful names and decorative SVG
where redundant. Native `type="submit"` is distinct from visual `data-type="primary"`;
never use `type="primary"` on a native button. Untyped buttons keep browser submit defaults.
Links remain links and visibly underline textual labels. Do not nest controls inside an
action root or turn a passive div into a focusable pseudo-button.

Native disabled/fieldset/form/focus/Enter/Space behavior remains authoritative. Group
labels/roles are authored; a group is not itself an action. Direct grouped actions keep DOM
order, use relative positioning and the group's circle/square treatment rather than
individual placement/shape. Square groups use a shared shadowed surface and visible-sibling
separators without clipping focus; templates/hidden controls do not create a leading divider.
This adapts, rather than pixel-reproduces, the source's injected shape and joined surfaces.

## Properties and authored regions

| Upstream surface | Native mapping / limits |
| --- | --- |
| Both owners' `top`, `bottom`, `left`, `right` | `--mui-float-block-start`, `--mui-float-block-end`, `--mui-float-inline-start`, `--mui-float-inline-end` CSS lengths/auto. Left/right adapt to logical start/end in RTL. |
| Both owners' `position` | Default fixed; `data-position="relative"` / `"absolute"` select native CSS modes. Unknown values use fixed. No sticky preset is invented. |
| FloatButton `width`, `height` | `--mui-float-width` / `--mui-float-height`, defaults 40px. Height is a **minimum**, so descriptions can grow without clipping. |
| Both owners' `shape` | Circle default or `data-shape="square"`; group shape owns direct children. |
| FloatButton `type` | Default appearance or `data-type="primary"`; never the native form type attribute. |
| FloatButton `menu-trigger` | Native click/keyboard `popovertarget` command. No hover-only open mode or trigger-attribute parser. |
| FloatButton `show-menu` | Native popover methods/state, not a controlled/uncontrolled framework prop bridge. Default native popover is closed. |
| `on-update:show-menu` | Native `toggle` on the **panel**, with oldState/newState and native timing, not a synchronous boolean callback. |
| FloatButton `description` slot | Authored `.mui-float-description` phrasing content within the native action. |
| FloatButton `menu` slot | Separate authored popover/static action group, not content nested inside the trigger button. |
| Source FloatButton/Group default slots | Native action/icon/group children. No VNode projection or automatic icon/close-button generation. |
| Source callback aliases/arrays and both owners' theme props | ⏭️ Framework alias-array dispatch and theme/provider objects omitted. |

The public table lists FloatButton bottom=40 and width=undefined, but pinned props actually
declare **width=40, height=40 and no bottom default**. Source height is applied as minHeight.
This target follows the source dimensions, with all position insets auto until authored.
Always choose usable coordinates for a fixed control; absent insets follow CSS static-position
rules, not an automatic safe corner. Group inset defaults are also auto.

No size/placement/tooltip/badge props are declared in the reviewed component sources.
The upstream Badge and Tooltip demos compose separate components. The native demo instead
authors a badge count with an explicit accessible name and visible descriptive help.
It does not provide a hover-tooltip engine, hidden count model or mandatory peer module.
Do not rely on a native title tooltip as the sole name or touch/keyboard explanation.

### Default style and native group boundaries

Defaults now match the pinned source's 40px dimensions, 18px icon size, 12px/14px
description typography, 2px content gap, borderless action surface, 4096px circle radius
and 3px square radius. The native action carries the 2px/4px content padding itself,
instead of generating the source's body wrapper. Public width/height/icon/radius tokens
still override these defaults; use relative units explicitly for root-font-relative sizing.

Light defaults use white / `#333639`; dark uses `#48484e` / white .82. Primary uses the
shared `--mui-color-primary` palette, with white text in light and black in dark. Load the
existing themes stylesheet for semantic dark colors; the component's neutral colors,
contrast and shadows follow `data-mui-theme="light|dark"` scopes. Public
`--mui-float-background`, `--mui-float-color` and `--mui-float-shadow` now remain above
the primary fallback rather than being reassigned by the primary selector.

Standalone shadows are 0 2px 8px at black .16/.12 in light/dark, and 0 2px 12px at
.24/.18 on hover/press. The measured pinned standalone hover-fill element has zero area;
the target matches its visible shadow change without adding a hover-fill renderer.

Circle groups use a 16px gap. Square groups have no extra padding/outer border and use a
shared .12 shadow. Two default actions occupy 40×81px, including one separator. Native
visible-sibling separators belong to the following action, preserving hidden/template
behavior and each action's minimum height. Grouped primary actions deliberately retain
their filled, legible surface; upstream clears their background in square groups.
Native joined-group hover still uses whole-control brightness rather than upstream's
inset fill layer. These group details remain explicit adaptations.

Native focus uses a 2px info-color outline, rather than inheriting black primary text in
dark mode. Forced colors suppress the group brightness filter. Action borders are now
absent by default; `--mui-float-border-color` continues to style separators/panels, and
ordinary authored CSS can add an action border when desired.

See the [rendered FloatButton audit](../style-audit/components/float-button.md) for actual
geometry/palette comparisons, RTL, native interaction evidence and remaining differences.

## Native popover composition and fallback

```html
<div class="quick-dock">
  <button type="button" class="mui-float-button mui-float-trigger"
    popovertarget="quick-actions" aria-label="Quick actions">+</button>
  <div class="mui-float-panel" id="quick-actions" popover="auto"
    role="group" aria-label="Quick action controls">
    <div class="mui-float-group" data-position="relative" data-shape="square">
      <button type="button" class="mui-float-button">Application action</button>
      <button type="button" class="mui-float-button mui-float-popover-command"
        popovertarget="quick-actions" popovertargetaction="hide">Close</button>
    </div>
  </div>
</div>
```

Popover opening, light dismissal, Escape, invocation relationships and Tab traversal are
browser behavior. These are ordinary grouped actions, **not** an ARIA menu: no menuitem
roles or missing arrow-key/typeahead model is implied. The trigger's native popover
relationship replaces manually maintained aria-expanded. Escape focus return was verified
from inside the panel; other focus/dismissal cases remain native, not a custom restoration policy.

Use `panel.showPopover()`, `hidePopover()` or `togglePopover()` for explicit application
state changes, and `panel.matches(":popover-open")` to inspect state in supporting browsers.
Listen to native `toggle` on the panel. It is asynchronous and may coalesce rapid changes,
including an old/new pair with the same state. Do not treat event counts/timing or dual
callback aliases as upstream framework parity. No library listener or state store exists.

`@supports selector(:popover-open)` enables native-only disclosure commands and fixed panel
geometry. The CSS does **not** set display:block/flex on a closed `[popover]`; native hidden
state remains authoritative. In an unsupported browser, the attribute is ignored, the action
panel stays in normal flow and disclosure-only trigger/close commands remain hidden. This is
a usable static fallback, not a broken clickable trigger. `details/summary` can be authored
separately when that disclosure model is preferred.

## Placement constraints, safe areas and obstruction

The provided popover presentation is specifically an **authored fixed-corner dock**, not a
general trigger-positioning engine. Trigger and panel share concrete end/bottom offsets;
the icon-only trigger has an explicit `--mui-float-trigger-size` (default 40px), and the
panel is placed .75rem above it. CSS Anchor Positioning is **not used or required**. No
unconditional anchor rules or JS measurements are injected.

```css
.quick-dock {
  --mui-float-inline-end: max(1rem, env(safe-area-inset-right, 0px));
  --mui-float-opposite-clearance: max(1rem, env(safe-area-inset-left, 0px));
  --mui-float-block-end: max(1rem, env(safe-area-inset-bottom, 0px));
  --mui-float-trigger-size: 2.5rem;
}
.quick-dock:dir(rtl) {
  --mui-float-inline-end: max(1rem, env(safe-area-inset-left, 0px));
  --mui-float-opposite-clearance: max(1rem, env(safe-area-inset-right, 0px));
}
```

Panel width/height are capped by viewport space, the end/opposite clearances and top safe
area; short panels scroll natively so Tab can reveal lower actions. Do not add a wrapping
description to the fixed-size icon trigger or change its size without keeping the shared
trigger token consistent. Use nonnegative, fitting concrete dock offsets; arbitrary offsets
can still place any CSS element outside a viewport.

Place fixed docks near the document root without transformed/filtered/containing ancestors.
Such ancestors can change a fixed trigger's containing block, while a native top-layer
panel uses viewport positioning; that is outside this fixed-dock contract. Relative/absolute
static actions/groups are supported separately; establish a positioned containing block
for absolute placement. No promise of a popup anchored to every relative/transformed trigger
or collision/flip algorithm is made.

Reserve real content space for fixed controls. The demo uses an inline-end gutter and bottom
padding, then verifies form controls stay clear at narrow widths and zoom. A top-layer panel
temporarily covers content by design and remains dismissible. Applications must check
actual responsive text, overlays, safe areas and software-keyboard geometry; there is no
giant global layer escalation. `--mui-float-z-index` defaults to 10 for ordinary placement;
native popovers use the browser top layer.

Additional CSS tokens include action width/min-height, icon size, square radius, group gap,
panel width/background/color, border, foreground/background and shadow. They are native CSS
values, not style-object props. Hidden roots/actions/templates remain hidden/inert.
Standalone hidden-until-found is not forcibly replaced, and is not separately certified.
Print returns static actions/groups to flow and omits popover-only controls/panels.
There is no animation or CSS transition; state styling changes immediately. Reduced-motion
transition emulation is unnecessary. This intentionally omits source transition timing.

## Migration steps and acceptance

1. [x] Preserve real buttons/links, names, disabled/form defaults and description/icon content.
2. [x] Keep group order/labels and native popover disclosure separate from action roots.
3. [x] Provide scoped fixed/relative/absolute, logical/safe-area dock CSS with static fallback.
4. [x] Validate focus/dismiss/reopen, obstruction, hidden state, native forms and viewport limits.

### Default-style acceptance — 2026-09-10

- 13 reference/native cases in light/dark and LTR/RTL matched **52 outer action/group
  boxes** and **68 icon boxes** within .02px. The original LTR baseline was captured too.
- Corrected standalone surfaces, type colors, dimensions, descriptions, radii and shadows
  matched the reference; later legacy CSS retained all captured target measurements.
- Enter/Space activated a native action once each; native validation/submission/reset and
  disabled behavior remained. Native popovers opened, scrolled, skipped disabled actions
  and returned focus on Escape at a 320×240 viewport, without menu roles or a controller.
- JavaScript-disabled LTR/RTL popover operation, reset and GET submission passed. Author
  size/color tokens, dark-primary focus contrast and forced-color filter suppression were
  verified separately.
- `pnpm test -- tests\float-button.test.ts`: **15 tests passed**. Rule-oriented compact
  CSS keeps the complete retained fallback within **1,484 / 1,500 gzip bytes** at level 9;
  runtime JS remains **0**. The coordinator's isolated release build and all
  **15 Float Button tests** pass with that same manifest size.

### Historical acceptance — 2026-09-08

The original typography, outlining and byte-count observations below predate the corrections.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed **552 tests**, including
**12 FloatButton cases**. A targeted rebuild/test then verified the final tighter budget
and safe-area bound refinement. Chromium acceptance covered:

- Native Enter/Space activation once per key, names, visual/form type separation, required
  validation, one native form submission, reset and disabled exclusion.
- Closed panels hidden with no focusable hidden actions; click/Space open, Tab order through
  ordinary actions, skipped disabled action, Escape return, outside dismissal, native hide
  command, reopen and imperative show/hide with asynchronous native toggle events.
- Preserved panel nodes/listeners and square/circle/group positioning behavior; no menu roles.
- 40px trigger/minimum sizing, 12px panel gap, fixed scrolling stability, RTL absolute/end
  placement, 280px/320px widths, a 240px-high viewport and 200% CSS zoom.
- Native panel scrolling revealed the close action; simulated 44px safe-area clearances
  stayed in bounds. Actual mobile keyboard/notch hardware is not certified.
- Static fallback simulation (conditional rules disabled and unrecognized popover attribute
  modeled), print/forced colors, core/plugins coexistence and JavaScript-disabled native
  popover/keyboard/reset/GET form behavior.

CSS is **5,342 bytes / 1,340 gzip bytes**, under its new **1,500-byte** ceiling. Component
JS is **0 bytes**; demo JS is **762 / 387 gzip bytes**, demo CSS **1,622 / 640**.
Core/widgets/advanced remain **14,611/2,779/2,181** gzip bytes within unchanged ceilings.
Runtime dependencies remain zero. This accepts one native P2/P3 component, not global P3,
all-browser, screen-reader speech, framework state or pixel parity.
