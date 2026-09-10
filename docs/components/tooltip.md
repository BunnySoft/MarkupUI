# Tooltip: a noninteractive description

**🟢 Verified for the retained native descriptive scope, not inherited Popover parity.**
Authored short text/markup is linked to a meaningful native trigger with aria-describedby.
Hover and keyboard focus reveal it; Escape dismisses it. It is not a menu, dialog,
expandable control or place for actions. Essential instructions must remain visible.

**Default-style audit: 🟢 skin and inherited overrides fixed / 🟡 native arrow/motion
boundaries retained.** See the [2026-09-10 rendered report](../style-audit/components/tooltip.md)
for light/dark, alternate-surface, typography and composed-order evidence.

## Loading and authored anatomy

| Asset / export | Purpose |
| --- | --- |
| `@dataengine/markup-ui/tooltip` | `createTooltip`, `TooltipController`, `TooltipOptions`, `TooltipPlacement` |
| `dist/markup-ui-tooltip.js` | Standalone ESM, includes the reused Popover implementation |
| `dist/markup-ui-tooltip.global.js` | Classic `window.MarkupUITooltip.createTooltip`; refuses to overwrite an existing namespace |
| `@dataengine/markup-ui/tooltip/style.css` | Complete `dist/markup-ui-tooltip.css`: maintained Popover CSS plus Tooltip presentation |
| `demo/components/tooltip.*` | Native HTML, separate application JS and external example CSS |

```html
<link rel="stylesheet" href="./vendor/markup-ui-tooltip.css">
<script defer src="./vendor/markup-ui-tooltip.global.js"></script>
<script defer src="./tooltip-setup.js"></script>

<p id="save-help">Save submits this form. Important help stays visible.</p>
<button type="submit" id="save" aria-describedby="save-help">Save draft</button>
<span id="save-description" role="tooltip" popover="manual"
  class="mui-popover mui-tooltip mui-popover--arrow">
  Only the current <strong>draft</strong> is saved.
</span>
```

```js
// tooltip-setup.js; ESM alternative:
// import { createTooltip } from "@dataengine/markup-ui/tooltip"
const tooltip = window.MarkupUITooltip.createTooltip(
  document.querySelector("#save"),
  document.querySelector("#save-description"),
  { placement: "top", delay: 100, duration: 150 }
)
// Dispose even when the tooltip is currently closed:
tooltip.disconnect()
```

The helper uses [Popover's shared controller](../../src/components/popover/popover.ts)
and [positioner](../../src/components/popover/position.ts), not duplicate timing,
focus/pointer retention, outside-click or geometry machinery. A narrow internal semantics
adapter replaces Popover's expanded/controls ownership, validates descriptive content and
cleans up description/Escape bindings during shared automatic disconnection.
It is not a public generic overlay/provider API.

There is no custom-element registration or enhanced-before-core rule. Standalone Tooltip
and legacy core may load in either order. Legacy mui-tooltip retains its old behavior:
do not bind this helper inside its ancestry, or inside legacy mui-popover anatomy.
No successful no-op upgrade is claimed. Bind one controller kind to each trigger/panel pair,
using one copy of that helper entry rather than duplicate ESM/classic copies.

Tooltip CSS is **composed at build time**, with no source-relative @import in dist and no
hand-maintained copy of shared rules. Loading Tooltip JS/CSS alone works; Popover JS/CSS
is not an undeclared runtime dependency. When also using Popover, Tooltip CSS already
contains its base styles, so a second Popover CSS request is unnecessary.
The separately bundled JS formats each contain their shared code; combined payloads below
do not pretend that duplication disappears without a different application build.

## Description and content ownership

Supply connected same-document light-DOM native HTML nodes. The panel requires both
`.mui-popover` and `.mui-tooltip`, a unique whitespace-free authored ID, exactly
`role="tooltip"` and **`popover="manual"`**, with no hidden attribute. It must be outside
its trigger, initially closed, nonempty and noninteractive. No automatic ID, tooltip name,
hidden duplicate text, cloned wrapper or trigger label is generated.
Templates may be instantiated by application code before binding. Existing inert templates
and all original text/markup/listeners remain unchanged; no template expressions are parsed.

The trigger must be a keyboard-reachable native button, input, select, textarea or href
link. A typed submit/reset button retains its native action. Do not add popovertarget:
Tooltip never uses click activation or implicit invoker semantics. Fake focusable spans,
negative-tabindex triggers and initially disabled native controls are rejected.
For disabled controls, supply an **explicit labelled native alternative**, such as a
separate “Why unavailable?” button, and keep the requirement visible. No wrapper/tab stop
is invented and no browser disabling or form behavior is changed.

Interactive descendants are rejected, including links, **labels that can forward activation
to external controls**, form controls, disclosure, controlled media, embedded browsing
content, tabindex/autofocus/contenteditable, widget roles, custom elements/shadow roots and
script/style/slot elements. Text formatting, images with authored alternatives and inert
templates are allowed; the description must contain text. Rich header/footer action regions
belong in Popover, not Tooltip.
This validation cannot inspect the purpose of arbitrary author-installed event listeners
or stylesheet tricks. Author markup must remain trusted and genuinely descriptive.
It is not an HTML sanitizer or a general proof that arbitrary custom behavior is safe.

aria-describedby is associated **while connected**, not only when visually open. Existing
tokens are retained. Disconnect removes only a token this helper added, preserving concurrent
author additions, an already-authored tooltip ID, and original formatting when unchanged.
No aria-expanded, aria-controls, aria-haspopup, tabindex, role, label or inert state is added
to the trigger. Existing authored attributes remain untouched.
The source dictionary is deliberately not passed to showPopover, avoiding implicit native
invoker/expanded/focus-navigation semantics for descriptive content.

Screen readers determine when/how descriptions are announced; no speech timing guarantee is
made. Explicit author aria-label/labelledby choices may affect the computed description and
are not rewritten. Essential help must not depend on tooltip visibility or announcement.

## Behavior and API

`createTooltip(trigger, panel, options?)` connects immediately. Retained options are
`placement` (top default; twelve Popover placements), `delay` (100ms hover opening),
`duration` (100ms departure delay), `gap`/`margin` (8px), `flip` (true),
`positioning` (`"auto"` or forced `"fallback"`), and initial `disabled` (false).
Timing/geometry numbers are finite within 0–60,000. All options are setup snapshots;
only controller.disabled is live. Recreate after teardown to change other options.

Hover **and** native focus are always enabled. A `trigger` option is rejected: click,
focus-only and manual-only trigger modes would weaken this description contract.
Imperative visibility requests are available without removing hover/focus discoverability:

| Controller API | Meaning |
| --- | --- |
| `supported`, `connected`, `show` | Read capability, lifecycle and actual native open state |
| `open()`, `setShow(true)` | Explicit opening request, resetting Escape suppression; boolean actual result |
| `close()`, `setShow(false)` | Dismiss and suppress until new trigger engagement; setShow(false) returns false |
| `disabled` | Closes/refuses opening, but does not disable the trigger's native action or remove its description |
| `syncPosition()` | Reuse current open placement; false when unavailable/closed; invalid or fully clipped geometry closes |
| `connect()`, `disconnect()` | Idempotent explicit lifecycle; connect while closed, reinsert before reconnecting |

Pointer entry starts the hover delay; keyboard focus opens immediately without moving focus.
Pointer travel between trigger and description cancels departure. Either pointer or focus
engagement retains visibility; leaving both starts duration. Touch pointer-enter is ignored,
but actual native focus can still reveal the description. There are no synthetic click,
Enter/Space, form, modifier, link-navigation or focus-transfer handlers.
Duration zero deliberately removes the gap grace period; use a positive duration for
pointer travel. Content is not a keyboard stop and Tab remains ordinary document navigation.

Native **manual** popovers keep Tooltip from closing unrelated auto popovers when it opens.
No silently unsupported `hint` mode is used. Outside clicks alone do not own dismissal:
focus/pointer departure and Escape do. Multiple tooltips can coexist and each owns only its
nodes. One document Escape dismisses connected visible tooltip peers and cancels pending
hover openings. It prevents the native Escape default **only if a tooltip was open**, so
the first Escape can dismiss a nested description while preserving its containing auto
Popover; a second Escape remains available to that native parent.
Events are not stopped or synthesized. Author propagation/default handlers remain relevant.

After Escape, unchanged focus or movement onto the description does not reopen it. A new
non-touch pointer entry on the **trigger**, a fresh trigger focusin, or an explicit open
request resets suppression. Even with focus retained, leaving/reentering the trigger by
pointer counts as deliberate reentry. There is no pointermove polling or global focus store.

Each connected Tooltip owns a removable document Escape listener, including while closed
so pending delays can be cancelled. This is an explicit per-instance listener, not a provider
or global overlay stack. Hidden/closed tooltips do not prevent Escape. Disconnect removes it.
Native beforetoggle opening remains cancelable; toggle is async/coalesced, not a Vue
controlled/default show callback. Programmatic requests still produce native events.
No outside-click reason callback, silent update alias or callback-array forwarding is added.

Use `mui:tooltip-error` on the panel for detected invalid live anatomy/content; detail is
`{ error }`. Pending/open mutations are validated by the shared lifecycle; direct native
opening is also checked before native autofocus could run. Detected live invalid content
disconnects and releases description/listener ownership. Public opening of invalid authored
content throws rather than claiming success. IDs remain immutable: disconnect and create a
new controller after ID/anatomy changes.

## Placement, fallback and limits

The [Popover geometry contract](popover.md#positioning-styling-and-fallback-boundaries)
applies: independently detected CSS anchors when fitting, otherwise finite viewport-relative
flip/clamp; visual viewport boundaries; RTL horizontal start/end; scroll/resize/ancestor
ResizeObserver updates; explicit syncPosition for layout-only changes. No cross-document
pair, Shadow DOM, arbitrary x/y/virtual anchor, vertical writing or transformed clipping
polygon support is claimed. Dynamic style writes and CSP limitations remain explicit:
external CSS is required and CSSOM geometry is not universally strict-style-policy compatible.

A Tooltip inside a Popover must stay inside that parent in the DOM; portalled nesting is
rejected. A tooltip cannot contain another tooltip's interactive trigger. Shared ancestor
native toggle listeners close pending/open descendants when an ancestor popover closes,
**even without ResizeObserver**. Hide releases geometry observers/listeners/timers/frames;
connected trigger/native toggle/description/Escape bindings remain for reentry. Removal
during pending/open disconnects automatically; closed application roots still need explicit
teardown. All component-owned geometry is restored without replacing authored style objects.

Use **short, supplemental descriptions**. Tooltip CSS clips overflow rather than exposing a
scroll container that browsers may add to Tab order. Scrollable/long content is outside this
retained scope; text must fit the available viewport at the application's supported text
sizes/zoom. Use visible wrapping help, details or Popover for long instructions rather than
depending on clipped visual text. There is no “show all” or exact arrow-center solver.

External CSS supplies size/color/background/padding tokens, `.mui-popover--raw`,
opt-in `.mui-popover--arrow` inset decorative side indicator, and optional
`.mui-popover--animated`. Indicators disappear after collision shifting. Reduced motion,
forced colors and print rules are included in the single compiled stylesheet.
There is no automatic trigger-width matching or separate arrow-wrapper/header/footer API.

### Audited skin and theme ownership

The ordinary skin now uses **8px 14px padding**, **3px radius**, no layout border and
**14px / 1.6** default typography. Light-theme Tooltip is intentionally a dark/inverted
surface: **#262626 with white text**. Dark theme uses **#48484e with white .82 text**.
Both use the pinned theme's three-layer overlay shadow.

Tooltip consumes the matching private dark overlay defaults already provided by its
composed Popover base; it does not edit or duplicate that palette. These private variables
are internal composition details, not application APIs. The complete Tooltip stylesheet
is still required; its source-only skin is not a substitute for the composed distribution.

Public `--mui-popover-max-width`, `--mui-popover-padding`, `--mui-popover-radius`,
`--mui-popover-color` and `--mui-popover-background` now work from **ancestors as well as
the panel itself**. Earlier Tooltip CSS assigned defaults to these public variables on
every panel, accidentally masking inherited author choices. The audited skin only consumes
them. A visible custom border can use `--mui-popover-border` plus authored CSS `border-width`.
Shared `--mui-font-size` and `--mui-line-height` are used for equivalent typography roles;
font family still inherits. Ordinary author CSS can override other presentation.

The selectors outrank the generic Popover base, so loading a separate base stylesheet
after Tooltip does not restore the old skin. Raw panels are excluded from ordinary
padding/radius/shadow declarations, preserving their documented native raw behavior.
Forced colors add an outline without making the description focusable. Print overrides
restore readable text, transparent background, visible overflow and unrestricted width.
Close an open manual popover before printing when normal-flow placement is required;
CSS alone cannot remove it from the native top layer.

The pinned Tooltip API has **no `inverted` prop**. Its light-theme default is already
dark. For an alternate light surface, author paired foreground/background values, for
example `--mui-popover-background: #fff; --mui-popover-color: #333639`; do not infer an
unimplemented inversion option. Ensure custom color pairs retain adequate contrast.

If native show/hide is missing, shared fallback temporarily removes popover so the original
description is visible static content; aria-describedby remains useful. Disconnect restores
only the owned native attribute/token changes. Without JS in unsupported browsers, unknown
popover attributes are ignored. Without JS in supporting browsers, manual tooltip activation
does not exist: meaningful native actions and visible essential help remain, not a claim of
no-JS hover disclosure. Use authored inline help/disclosure when that is required.

## Acceptance — 2026-09-08

- **121 targeted tests pass:** 42 Tooltip, 52 Popover, 27 native/core
  (`npm exec vitest run -- tests\tooltip.test.ts tests\popover.test.ts tests\native.test.ts`).
  JSDOM native API mocks test contracts, not browser certification.
- `npm run build` passes TypeScript/declarations, self-contained ESM/classic and composed CSS
  exports plus all old/new budget gates. Runtime dependencies remain zero.
- Chromium on the existing 4188 server: focus without transfer, hover/gap/delay cancellation,
  Escape suppression/reentry, native Tab, submit/reset/modified action and link navigation,
  multiple manual tooltips, description-before-parent Escape, and original DOM/ARIA ownership.
  Chromium's accessibility tree retains the trigger name and description references without
  implicit expanded/haspopup; this is not a screen-reader speech certification.
- Chromium geometry/presentation: actual native anchor gap, forced fallback, document and
  ancestor scrolling/full clipping, RTL start, edge flip, 320px resize, emulated 2x visual
  viewport, reduced motion, forced colors and static print content.
- Review found external-label activation and parent-closure leakage without ResizeObserver.
  Labels are now rejected; shared ancestor-toggle cleanup and regression tests cover both.
  Browser mutation/disposal tests confirm error notification and owned-description removal.

- Chromium standalone loading also verified Tooltip-only JS/CSS, both classic/core orders,
  ESM operating in separate iframe documents, cross-document pair rejection, preserved global
  namespace conflicts, visible partial-API fallback and restoration, native parent closure
  without ResizeObserver, real modified-link new-context behavior and no-JS essential help.
  Test-created browsing contexts/frames were removed; the existing demo server was reused.
- Deterministic audit preserves all 36 original inherited owner/name/source identities.
  All 43 Tooltip rows are resolved (21 adapted targets, 22 omissions); the 96-route inventory
  totals 3,240 rows and 144/384 accepted tasks. All 266 relative file links in changed
  documentation resolve; these are inventory counts, not claims of full source parity.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Tooltip ESM, includes shared controller | 12,686 | 4,877 | 5,000 |
| Tooltip classic, includes shared controller | 12,851 | 4,949 | 5,000 |
| Complete Tooltip CSS, includes shared CSS | 3,104 | 1,057 | 1,250 |
| Popover ESM after shared update | 9,443 | 3,923 | 4,000 unchanged |
| Popover classic after shared update | 9,608 | 3,994 | 4,000 unchanged |
| Popover CSS, unchanged | 2,634 | 904 | 1,000 unchanged |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One Tooltip JS format plus its complete CSS is **5,934 gzip bytes ESM**, or **6,006 classic**.
Using both Popover and Tooltip JS plus only the complete Tooltip CSS costs **9,857 ESM**
or **10,000 classic**; separately bundled shared JS is honestly counted twice.
No core/plugin source or old ceiling changed.

Only exercised Chromium behavior is claimed; Firefox/Safari, physical touch/pinch behavior,
screen readers and universal assistive-technology support require separate acceptance.
P2 remains complete for accepted adapted scopes; P3 remains in progress.
**Next: Popconfirm, in its own implementation/acceptance/commit.**
