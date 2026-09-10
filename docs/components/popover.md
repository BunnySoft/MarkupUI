# Popover: native nonmodal floating content

**🟢 Verified for the retained native scope; not Naive UI/Vue API parity.**
An optional, dependency-free helper supplies timing, local placement and teardown around
authored native Popover elements. The browser owns top-layer visibility, click commands,
light dismissal, Escape and focus navigation. No role, focus trap, provider, portal,
inert application state, renderer or positioning package is introduced.

**Default-style audit: 🟢 standalone surface fixed / 🟡 native layout and motion
boundaries remain.** The [2026-09-10 rendered report](../style-audit/components/popover.md)
records measured light/dark density, shadows, placements and composed-consumer isolation.

## Loading and native anatomy

| Distribution | Contract |
| --- | --- |
| `@dataengine/markup-ui/popover` | `createPopover`, `PopoverController`, `PopoverOptions`, `PopoverPlacement` |
| `dist/markup-ui-popover.js` | Standalone ESM |
| `dist/markup-ui-popover.global.js` | Classic `window.MarkupUIPopover.createPopover`; throws rather than overwriting an existing namespace |
| `@dataengine/markup-ui/popover/style.css` | External `dist/markup-ui-popover.css`; required for the retained geometry/surface contract |
| `demo/components/popover.*` | Authored HTML, separate application JS and external example CSS |

```html
<link rel="stylesheet" href="./vendor/markup-ui-popover.css">
<script defer src="./vendor/markup-ui-popover.global.js"></script>
<script defer src="./popover-setup.js"></script>

<button type="button" id="information-trigger" popovertarget="information">
  Information
</button>
<div class="mui-popover mui-popover--arrow" id="information" popover="auto"
  aria-labelledby="information-heading">
  <header><h2 id="information-heading">Authored information</h2></header>
  <p>Ordinary text, links and native controls stay in the document.</p>
  <footer>
    <button type="button" popovertarget="information" popovertargetaction="hide">Close</button>
  </footer>
</div>
```

```js
// popover-setup.js, or import { createPopover } from "@dataengine/markup-ui/popover"
const controller = window.MarkupUIPopover.createPopover(
  document.querySelector("#information-trigger"),
  document.querySelector("#information"),
  { placement: "bottom-start" }
)
// Application teardown, including closed components:
controller.disconnect()
```

There is **no custom-element registration** and no fake enhanced-before-core rule.
The optional helper and legacy aggregate may load in either order. Legacy `mui-popover`
retains its old behavior unchanged; do not bind this helper inside that legacy anatomy.
Setup rejects this conflict. Other optional registered components retain their own
registration-order rules. Use one helper entry per application rather than independently
binding the same nodes through duplicate ESM/classic module copies.

The panel must be a connected light-DOM HTMLElement in the trigger's document, with
`.mui-popover`, one unique whitespace-free ID, `popover="auto"` or `"manual"`, and no
`hidden` attribute. Connect while closed, then request opening explicitly. No default-show
configuration is applied. Missing/invalid nodes, duplicate active ownership, a fake
focusable span, competing trigger commands, and already-open setup throw.
Nodes are not moved, cloned, rewritten or created. Templates may be instantiated by the
application before setup; the helper does not interpret or replace templates.

Top-level trigger/panel siblings are allowed. **Nested panels must be DOM descendants of
the parent popover containing their trigger**, even though rendered in the top layer.
Out-of-tree/portalled nesting is rejected rather than pretending DOM containment covers
native source-linked ancestry. Each pair has its own ownership/lifecycle; separate
documents use their own window, observers, viewport and events. Cross-document pairs and
Shadow DOM are not supported. ID/anatomy changes require disconnect and a new controller.

## Triggers, state and events

`createPopover(trigger, panel, options?)` connects immediately.

| Option | Default / retained behavior |
| --- | --- |
| `trigger` | `"click"`; also `"hover"`, `"focus"`, `"manual"` |
| `placement` | `"bottom"`; top/bottom/left/right, each with optional `-start`/`-end` |
| `delay` | 100ms, hover opening only; focus opens immediately |
| `duration` | 100ms, hover/focus departure delay, **not** CSS animation duration |
| `gap`, `margin` | 8 CSS px each, trigger gap and visible-viewport padding |
| `flip` | true; try the opposite side when preferred space is inadequate and opposite space is greater |
| `disabled` | false; live controller property, closes immediately and prevents opening |
| `positioning` | `"auto"` uses independently detected CSS anchors when safe; `"fallback"` forces measured positioning |

Numbers must be finite and within 0–60,000; flags must be booleans. Options other than
disabled are an immutable setup snapshot: disconnect and create a replacement to rebind.
Defaults deliberately differ from upstream hover/top/animated/arrow defaults.

**Click:** a native `button` with effective `type="button"`, matching `popovertarget`, and
absent/`toggle` action is mandatory. The helper installs **no click or keydown activation
handler**. Native Enter/Space/modified clicks run exactly once. Additional authored hide
buttons need no binding. Submit/reset buttons are not appropriated as openers.

**Hover/focus:** use a native button, non-hidden input, select, textarea or `a[href]`,
without `popovertarget`. Native link navigation, modified clicks, submission and keyboard
semantics are untouched. Hover also opens on native focus; touch pointer-enter is ignored.
The whole trigger and panel are one retention boundary. Entering either cancels pending
departure; focus transfer within that boundary stays open. Hovered content remains open
when focus leaves it; focused content remains open when the pointer leaves it.
Default delays bridge the gap. Setting duration to zero deliberately removes that gap
grace period; choose a usable positive delay for interactive hover content.

**Manual trigger** installs no activation handlers. The application calls open/close.
Trigger mode and native popover mode are separate choices: `popover="auto"` always retains
native Escape/light-dismiss/peer arbitration; `popover="manual"` does **not** dismiss on
outside click or Escape and needs an explicit reachable close action. No fake modal
semantics are added to either. Related auto panels use native nesting; unrelated auto panels
may close each other. Manual panels can coexist.

| Controller API | Contract |
| --- | --- |
| `supported`, `connected` | Read capability and explicit lifecycle state |
| `show` | Read actual `:popover-open` state, not a controlled prop or queued desired value |
| `open()` | Returns actual open state; false when unavailable, disabled, cancelled, clipped, unsupported or disconnected |
| `close()` | Idempotent native hide plus active-work cleanup |
| `setShow(boolean)` | Request open/close; returns actual resulting state (false for close), **not** a silent Vue state setter |
| `disabled` | Boolean setter; disabling closes, re-enabling does not reopen |
| `syncPosition()` | Recompute an open panel; false if closed/unavailable. Fully clipped/invalid geometry closes |
| `connect()`, `disconnect()` | Idempotent explicit lifecycle; reconnect after reinsertion while closed |

Use the panel's native **`beforetoggle` and `toggle`** events. Opening beforetoggle is
cancelable; author cancellation is respected. Closing is not cancelable. Toggle is
asynchronous and may coalesce rapid transitions, including close/reopen in one task.
The helper reconciles actual state after the native event, not stale newState values.
No custom change event or Vue callback-array aliases are synthesized. Programmatic
show/hide still generates native events; there is no silent update parity.
Disabled openings are prevented. `toggle` does not identify an outside click versus
Escape/programmatic close: no fabricated `on-clickoutside` reason is reported.

Native source information is supplied when calling showPopover. Older Popover engines may
ignore that optional dictionary; Tab order/focus return remain browser-owned and have no
polyfill. Native click commands are the strongest no-JS activation path. The helper does
not prevent Escape, trap Tab, refocus after closure, add menu/tooltip/dialog roles, or
change authored `aria-describedby`, labels, tabindex, IDs or native form attributes.
Choose content semantics and accessible names explicitly.

While connected, the helper appends the panel ID to `aria-controls` if needed and manages
`aria-expanded`. Disconnect restores prior values only if still component-owned; author
tokens and unrelated changes survive. If the ID/target/anatomy becomes invalid while
pending/open, it disconnects and emits `mui:popover-error` on the panel with `{ error }`.
The ID cannot be changed even alongside a matching new popovertarget. Rebind instead.
Closed roots require explicit teardown; this is not an application mount observer.

## Positioning, styling and fallback boundaries

Top-layer coordinates are **viewport-relative**, never offset-parent-relative.
The helper measures the trigger/panel and visual viewport, constrains available width/height,
flips to the opposite side when useful, and clamps to the viewport margin. Horizontal
start/end follow trigger RTL; left/right side alignments start at the top. Vertical writing
modes are excluded. Partially clipped triggers may show a panel outside their scroll
ancestor; fully clipped triggers close. Native top-layer rendering escapes ancestor overflow;
the panel collision boundary is the visual viewport, **not** every ancestor clip box.
Overflow clipping is conservatively based on ancestor border rectangles, not arbitrary
clip-paths, rounded masks, transformed clipping polygons or iframe outer-page bounds.

The anchor path tests `anchor-name`, `position-anchor`, and both required top/left
`calc(anchor(...))` expressions separately. It appends a unique temporary anchor name and
uses CSS anchor expressions only for an unshifted placement at visual-viewport scale 1.
No position-try, anchor-size or unsupported collision feature is assumed. Collision-shifted,
zoomed, unsupported and explicitly forced paths use finite measured CSS px coordinates.
There is no positioning dependency, full polyfill, polling loop or hidden framework.

Active document-capture scroll, window resize, visual viewport scroll/resize, and
ResizeObserver on panel/trigger/trigger ancestors schedule at most one frame.
Pending/open instances observe removal, hidden/inert/disabled and anatomy changes; removing
either node disconnects automatically. Hide clears active observers, positioning listeners,
timers, frames and geometry; only connected trigger/native-toggle bindings remain so users
can reopen. Disconnect removes those too and invalidates queued microtasks.
If ResizeObserver is unavailable, scroll/viewport events and explicit syncPosition remain.
Call syncPosition after layout changes that only move the anchor without resizing any
observed ancestor, or after external style/class/transform changes. An invalid/collapsed
anchor closes; a style-hidden pending trigger cannot strand active geometry.

Geometry owns only `left`, `top`, `position-anchor`, available-size custom properties,
temporary anchor-name tokens, and `data-popover-placement/positioning/arrow`.
Each is restored on hide/dispose only if it still equals the last helper write. Authored
node listeners, unrelated attributes/styles and CSS priorities survive. Do not compete
with active geometry using author `!important` insets, fixed dimensions exceeding the
available box, transforms/zoom on the panel, CSS anchor names borrowed from helper output,
or a different positioning scheme.

CSS is external: panel/content/header/footer classes, `--mui-popover-max-width`, padding,
radius, border, color/background tokens and ordinary width declarations provide presentation.
The audited standalone panel defaults to **8px 14px padding, 3px radius and no visible
border**. Light foreground/surface are **#333639 / #fff**; an explicit dark theme uses
**white .82 / #48484e**, with the corresponding three-layer Popover shadow.
These defaults apply to ordinary Popover and Popconfirm panels: the pinned Popconfirm
uses the same Popover surface theme. Tooltip, Dropdown and panels within Popselect
retain their distinct skins. No shared preset, controller or positioning helper changed.

Public padding/radius/color/background tokens still take precedence over private defaults,
including inherited ancestor overrides. `--mui-popover-border` still controls border color,
but a standalone author must set a nonzero CSS `border-width` to display a custom border.
Font family/size/leading continue to inherit from the document; the comparison uses the
documented opt-in Global Style's 14px/1.6 baseline, not a new typography reset.
Private dark defaults apply on screen only; nested explicit light scopes reset them, and
print falls back to dark text on a light surface. Author-supplied colors remain author-owned.

`mui-popover--raw` removes the standard padding/border/shadow, not geometry or overflow safety.
It retains the native surface fill; it is intentionally not Naive's raw presentation.
Authored header/footer content also retains ordinary native flow rather than introducing
upstream slot wrappers or automatic full-width separators.
The outer panel is natively scrollable within its available height; use an authored inner
scroll region when a fixed header/footer is needed. Trigger-width matching is not automated.
`mui-popover--animated` opts into a short opacity entrance; reduced motion disables it.
There is no leave-animation scheduler. Forced colors use system colors; print exposes
closed content in normal flow.
An already-open top-layer popover can still compute as absolutely positioned during print,
despite CSS requesting static positioning; close it before printing when normal-flow
placement is required. The helper does not add a shared print lifecycle handler.

`mui-popover--arrow` opts into a small **inset decorative side indicator**, not an
interactive node or an exact center tether. It is suppressed after collision shifting;
it cannot claim arrow-point-to-center/overlap parity. Style it with the author's panel class
and `::before`, not a generated arrow/wrapper API.

Dynamic geometry uses element.style writes. No CSS-in-JS text, style element or HTML string
is generated, but a deployment's CSP must allow the required CSSOM geometry operations.
This is not a claim of universally strict style-policy compatibility. With no helper,
native click popovertarget remains usable (browser-default placement plus external surface
CSS); hover/focus/manual application triggers require JS. Use authored inline content or
native details/summary instead when those modes must be accessible without scripting.

When either native show/hide method is unavailable, `supported` is false, open returns
false, and the helper temporarily removes the popover attribute so content is readable
in static flow, even under partial feature detection. Disconnect restores that attribute.
No hidden/focusable pseudo-polyfill, fake expanded state or global fallback is installed.
With JS absent in a genuinely unsupported browser the unknown popover attribute is ignored,
also leaving static content.

## Retained scope and explicit omissions

The [reference tracker](../naive-ui/components/popover.md) keeps all **38 original named
rows** and adds **11 explicitly source-only supplements**: **28 Verified adapted targets,
21 explicit omissions**. Retained: native show/control events; click/hover/focus/manual
triggers; disable/delays and interactive retention; twelve placements/flip; local updates;
authored content/header/footer; ordinary external sizing/raw/scroll/animation/indicator styling.

Omitted: controlled/default-show framework state, renderer/display directives, teleport/to,
out-of-tree nesting, arbitrary x/y or virtual anchors, overlap, exact arrow-center/wrapper
APIs, trigger-width synchronization, z-index arbitration over native top-layer order,
outside-click reason callbacks, provider/theme injection, internal focus traps and runtime
hooks, deprecated prop/callback aliases. Those receive no implementation credit.

## Acceptance — 2026-09-08

- `npm exec vitest run -- tests\popover.test.ts`: targeted mocked-native contract and
  deterministic geometry tests; **52 passing** after review fixes. JSDOM is not a native
  Popover/anchor implementation.
- `npm exec vitest run -- tests\popover.test.ts tests\native.test.ts tests\float-button.test.ts`:
  **91 tests pass** (52 Popover + 27 native/core + 12 native popover-dock integration).
  This is targeted validation, not a claim that the entire test suite was rerun.
- `npm run build`: TypeScript, standalone ESM/classic/CSS exports and all bundle gates pass.
- Real Chromium, dedicated local-demo tab at `http://127.0.0.1:4188/demo/components/popover.html`:
  native click/Enter/Space/modified click; outside/Escape/reopen; child-first nested Escape;
  Tab into native fields and focus-panel actions; no trap; hover delay/rapid cancellation/
  trigger-to-panel gap; focus transfer and normal link navigation; manual explicit close;
  forms submit exactly once/reset; original node/listener and ARIA preservation.
- Chromium geometry: actual CSS-anchor path (8px measured gap), forced fallback, document
  and ancestor scroll, partial/full clipping, peer arbitration, RTL right-edge start,
  bottom-to-top flip, 320px viewport resize/clamp, reduced motion, forced colors and print.
- Chromium lifecycle/fallback/loading: native cancellation, restored ARIA/style/node ownership,
  pending-trigger removal/reconnect, partial API failure producing visible static content,
  no-JS native click/Escape, separate iframe documents, cross-document pair rejection,
  ESM in another realm, both classic/core load orders and preserved preexisting global APIs.
  CDP-emulated 2x visual viewport exercised bounded fallback (not physical pinch certification).
- Read-only review found portalled nested focus and live-ID ARIA risks. Portalled nesting
  is explicitly rejected; bound IDs are immutable. Regression tests cover both.
- Inventory audit confirms 38 original owner/name/source-line identities unchanged, all
  49 Popover rows resolved, 96 route documents and 140/384 accepted tasks; 253 local file
  links in changed documents resolve. The global inventory is 3,233 rows, not parity credit.

| Asset | Raw bytes | gzip bytes | Existing/new optional ceiling |
| --- | ---: | ---: | ---: |
| Popover ESM | 9,266 | 3,853 | 4,000 |
| Popover classic | 9,429 | 3,922 | 4,000 |
| Popover CSS | 2,634 | 904 | 1,000 |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 |

Load one JS format plus CSS: **4,757 gzip bytes ESM**, or **4,826 classic**.
No runtime dependency or legacy/core/plugin source was changed; old budgets were not raised.

### Shared Tooltip lifecycle update

The following Tooltip migration reuses the side-effect-free controller through a narrow
internal semantics adapter; public Popover options and expanded/controls behavior remain
unchanged. Ancestor native toggle listeners now close pending/open child panels when a
parent closes even without ResizeObserver. [Tooltip acceptance](tooltip.md) includes
52 Popover regression tests plus native and Tooltip cases. The table above records the
original `62435fa` payload; the current shared-controller ESM/classic measure
**3,923/3,994 gzip bytes**, still below their unchanged 4,000-byte ceilings. CSS stays 904.

### Deep Dropdown clipping correction

Dropdown's actual second submenu level exposed a top-layer boundary: clipping walks must
stop above the nearest open popover ancestor, rather than treating its outer DOM scrollers
as visual ancestors. That narrow positioner correction preserves the nearest panel's own
clip and all core semantics. [Dropdown acceptance](dropdown.md) includes the additional
Popover regression and real deep-menu geometry evidence. Current Popover ESM/classic are
**3,927/3,997 gzip bytes**, within the same 4,000-byte ceilings; core/plugins are unchanged.

Only exercised Chromium behavior is claimed. Firefox/Safari, screen readers and physical
touch-device/pinch-zoom behavior require separate acceptance; no all-browser/AT certification.
P3 remains in progress; **Tooltip is next**, not implemented by this component.
