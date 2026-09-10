# Drawer and DrawerContent: native edge panels

**🟢 Verified retained native scope, not framework or pixel parity.** Drawer reuses the
accepted Modal strict-mode controller and current-opening-order owner, plus shared native
dialog lifetime/CSS. It imports no Modal presentation, Dialog decision footer, Scrollbar,
Icon, Button, provider, positioning or animation dependency. DrawerContent is authored
HTML and external CSS, not another custom element or renderer.

## Default-style audit — 2026-09-10

The [rendered audit](../style-audit/components/drawer.md) compares pinned Naive UI
2.45.3/Vue 3.5.30 Drawer and DrawerContent defaults against this retained native model.
The default side remains physical **right**; default side width and top/bottom height
are now **251px**, not 24rem. The outer border is removed, exposed-edge corners use
**3px** radii, and the measured three-layer shadow is supplied. Header/body/footer
padding is **16px 24px**, the header is **18px/500 with 18px leading**, and body leading
is **1.6**. Header/footer dividers use the reference divider colors.

Light/dark scopes use `data-mui-theme="light|dark"`. Surface/body/title colors are
**white / #333639 / #1f2225** and **#2c2c32 / white .82 / white .9**, not the legacy
neutral palette. Drawer-only mask paint is **black at .3 alpha**—different from Modal's
.4. Mask painting does not change native modality, cancellation or opt-in dismissal.

Existing width/height/padding/border/radius/color/background/focus variables remain
author-owned in all supported directions. The border variable sets color; an authored
border width is needed if a visible outer border is desired. Radius overrides win over
the physical/logical corner defaults. Internal corner state resets per surface so nested
Drawers do not inherit another edge's rounding.

Source DrawerContent is **not closable by default**. Omit the native close form for
that presentation; no button is generated. If authored, native close keeps the existing
**2.5rem minimum height**, native hover/disabled behavior and keyboard reachability.
It is not the source's small SVG close control. With no close, all eight physical-side/
theme comparisons matched header/body/footer heights, padding, typography, foreground/
background, shadow and corner paint. Document scrollbar differences remain intentional:
the native helper does not emulate source body locking or gap compensation.

**216 composed-order/theme/placement/mode cases passed**, including opening on an
already-scrolled page and further scrolling; **36 print cases passed** across modal,
modeless and fallback modes. Print explicitly clears every open Drawer's shadow and
edge sizing, including top/bottom variants. Existing body/header/footer scroll safeguards,
short-viewport whole-panel scrolling, reduced-motion resets and forced-color borders
remain intact. **41 Drawer tests pass**.

Private production-equivalent outputs: **3,956 ESM / 4,082 classic / 1,354 composed CSS
gzip bytes**, below unchanged **4,750 / 4,750 / 1,500** ceilings. No shared native file,
Modal/Dialog CSS, runtime, dependency, builder or generated entry changed. The historical
migration acceptance below predates this visual audit.

## Loading and authored structure

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/drawer` | `createDrawer`, `createDrawerOwner`, controller/options/placement types |
| `dist/markup-ui-drawer.js` | Self-contained optional ESM |
| `dist/markup-ui-drawer.global.js` | Classic `MarkupUIDrawer`; refuses namespace replacement |
| `@dataengine/markup-ui/drawer/style.css` | External composed `dist/markup-ui-drawer.css`, including native base CSS only |
| [Local demo](../../demo/components/drawer.html) | Separate HTML/CSS/JS; local simulated check, no remote business operations |

```html
<dialog class="mui-native-dialog mui-drawer" id="details"
  data-drawer-placement="right" aria-labelledby="details-title">
  <div class="mui-drawer-content">
    <header data-drawer-header>
      <h2 id="details-title" data-drawer-title tabindex="-1" autofocus>Details</h2>
      <form method="dialog"><button value="closed" aria-label="Close details">×</button></form>
    </header>
    <section data-drawer-body tabindex="0" aria-label="Details form">
      <form id="details-form" data-drawer-body-content method="dialog">
        <label>Reference <input name="reference" required></label>
      </form>
    </section>
    <footer data-drawer-footer>
      <button form="details-form" value="saved">Save</button>
      <button form="details-form" value="cancelled" formnovalidate>Cancel</button>
    </footer>
  </div>
</dialog>
```

```js
// External script. Without native modal support, retain an authored inline/link path.
const drawer = MarkupUIDrawer.createDrawer(document.querySelector("#details"), {
  backdropDismiss: true
})
if (drawer.supportsModal) drawer.showModal(openButton)
// drawer.show(openButton) deliberately chooses modeless/inline instead.
// drawer.close("done"); drawer.dispose()
```

The root is a connected, named light-DOM HTMLDialogElement with both classes. It contains
exactly one direct `.mui-drawer-content`, one direct `[data-drawer-body]` inside that
wrapper, and optional single direct header/footer regions. The wrapper may itself be a
valid native form when form associations/default submitter ordering permit it.
`data-drawer-body-content` is an optional authored padding region, not a generated wrapper.
The helper checks anatomy/placement on adoption and helper opening; close/dispose remain
available even after invalid author edits. Close/dispose before replacing structural
regions; ordinary body content and native form values remain author-owned.

Use real authored heading levels and explicit aria-label/aria-labelledby; optional
aria-describedby stays untouched. No generated heading level, duplicate dialog role,
complementary landmark or wrapper aria-modal. A named body section can intentionally form
a scroll region, as in the demo. Header/footer/close/body nodes and listeners are preserved.

## Native lifetime and ownership

| API | Actual behavior |
| --- | --- |
| `dialog`, `supportsModal`, `connected`, `mode`, `generation` | Original native element, exact callable capability, terminal status, actual mode and opening/lifetime generation |
| `showModal(opener?)` | Real native modality only; throws if unsupported or already modeless |
| `show(opener?)` | Explicit native modeless opening, or explicit inline fallback if show is absent; throws if currently modal |
| `close(returnValue?)` | Immediate native closure; no async business callback |
| `requestClose(returnValue?)` | Native cancelable request, or exactly one cancel-event fallback |
| `dispose()` | Terminal, idempotent release/closure; an adopted author's root stays in DOM |
| `closeOnEsc` | Boolean setup snapshot; true by default, guarding native platform cancel |
| `backdropDismiss` | Boolean setup snapshot; **false by default**, unlike upstream maskClosable=true |

Close before changing mode. Helper openings reset returnValue; native form values/nodes
survive reopening. Native show/showModal/close/cancel/returnValue and direct native closure
remain observable. Do not dismiss a top-layer modal by just removing its open attribute.
No transition-completion callback is invented; beforetoggle/toggle/close use native timing,
including coalesced toggle and queued close events.

Native autofocus, background blocking and top-layer order own focus. No trapFocus=false,
autoFocus=false, whole-document inert/aria-hidden manager or custom global focus trap.
After native restoration, a still-connected explicit opener is only a safe fallback while
focus remains on body/inside the closing surface. Other focused surfaces are not disturbed;
removed/hidden/inert/disabled openers are skipped. Native ancestor removal/reparenting
observation releases owners without polling or changing another surface's state.

The eligible backdrop path requires the same primary pointer to start/end outside the
border rectangle. Padding, inside-to-outside drags, secondary/cancelled pointers and later
pointer-event preventDefault do not dismiss. The cancelable nonbubbling
`mui:native-dialog-backdrop` event contains `{ event: PointerEvent }`; native cancel may
also veto requestClose. Do not combine helper dismissal with closedby=any, which is rejected.
closedby=none remains authored. Platform Escape and controller requestClose are distinct;
explicit requests remain available with closeOnEsc=false.

**No body-scroll lock is added.** Modal background focus blocking does not promise frozen
page scrolling. No body/html overflow, padding, cursor, style, aria-hidden or inert writes;
no :has-based document lock or scrollbar-gap compensation. Native body/root scroll
containment is local. Mask transparency changes painting only:
`data-drawer-mask="transparent"` remains modal and retains eligible dismissal. Upstream
showMask=false also disables focus trapping; deliberately use show(), or ordinary
aside/navigation content without the helper, rather than falsely claiming that equivalence.

## Physical placement, sizes and DrawerContent scrolling

`data-drawer-placement` defaults to **right**, matching the pinned source.

| Value | Native target |
| --- | --- |
| left / right | **Physical** edge, full available layout-viewport height |
| top / bottom | **Physical** edge, full available layout-viewport width |
| inline-start / inline-end | Explicit native-target additions, mapped through inherited LTR/RTL direction |

Physical left/right **do not flip in RTL**. Logical aliases are intended for horizontal
writing modes; vertical-writing behavior is not claimed. Placement is an authored
attribute, not a JS option or an automatic direction conversion.

- `--mui-drawer-width`: left/right and logical side extent; default **251px**.
- `--mui-drawer-height`: top/bottom extent; default **251px**.
- `--mui-drawer-padding/border/radius/color/background/focus`: external appearance tokens.
- Sizes are CSS lengths capped to **100% of the native fixed containing viewport**.
  Percentage bounds accommodate viewport changes and CSS zoom without multiplying dvh by
  the page zoom. This is layout-viewport sizing, not a visualViewport/soft-keyboard polyfill.
- No numeric/style writes occur. The demo's compact/wide selector changes an authored
  data attribute backed by external CSS; it is not a library resize control or event.

In a modal opening, the companion fills the surface with a native scrolling body and
separate header/footer. These stay stable while the body scrolls at ordinary heights.
Header/footer have their own overflow safety and the body keeps a usable minimum extent.
For viewports at most 20rem high, the **whole panel scrolls** instead, preventing fixed
regions from consuming the available height and hiding controls. Modeless/inline openings
remain ordinary flow, not docked overlays.

Drawer sizing selectors deliberately outrank shared native base rules reloaded by other
optional overlay stylesheets. No required stylesheet ordering with Modal/Dialog base CSS.
No slide animation hides active controls. Reduced motion is static; forced colors preserve
borders. Print removes fixed placement/max sizing and inner scrolling; Chromium may compute
an open top-layer dialog as absolute rather than static.

## Native forms and caller-owned asynchronous work

No submit/click interception, generated business controls, type mutation, duplicate
submission or bypass of native validation. A method=dialog form closes once with the
submitter's value after successful native constraint validation; explicit formnovalidate
retains its native meaning.

**The first associated submit button is the native default for Enter.** Do not accidentally
make a header Close or Cancel with formnovalidate the first submitter for a required Save
form. The demo gives header Close its own native form and associates the footer's
validated Save **before** Cancel with the body form using `form=...`. Both clicking Save
and pressing Enter in the reference field then validate correctly. No JS workaround or
hidden submitter is needed; custom commands are not double-handled.

Pinned DrawerContent's close action immediately requests show=false; it does **not**
offer Dialog's false/Promise onClose contract. Generic Drawer has no async close callback,
pending decision footer or promise-swallowing policy. Unknown onClose/resizable/size/style
options are rejected. Choose explicit native cancel listeners or a separate authored
type=button operation when application work must precede closure:

```js
const session = drawer.generation
const accepted = await applicationCheck() // caller owns errors, pending UI and cancellation
if (accepted && drawer.connected && drawer.mode !== "closed"
  && drawer.generation === session) drawer.close("checked")
```

This guard does not cancel external effects or automatically validate a native form.
Callers must surface rejection, prevent duplicate business work and release their own
timers/listeners. The demo's local timer has an operation token plus a native generation,
clears itself on native lifetime changes, and does not repaint detached status content.

## Explicit native template owners

`createDrawerOwner(root)` returns `drawers` (a new readonly owned-handle snapshot),
`create(template, { mode?, closeOnEsc?, backdropDismiss? })`, `destroyAll()` and terminal
`dispose()`. These are **native additions**, not an upstream Drawer provider/instance API.
Templates contain one closed, non-hidden, named native Drawer with authored content.
No text/render/preset/resize options; edit trusted template text with normal textContent.
Original nodes/listeners are not moved, and clone listeners must be attached explicitly.

Template IDs must be unique both locally and in the document. For repeated concurrent
clones use distinct IDs or an ID-free aria-label template. Script/style/iframe/object/embed
elements are rejected; this is not a sanitizer for untrusted URLs or inline event attributes.
Failed creation releases its clone. close retains a clone for reopen; dispose removes
only an owned clone. The owner retains Modal's **current opening/focus-return order** for
bulk destruction, not obsolete creation order, and blocks reentrant creation/opening during
teardown. Direct native openings are tracked by beforetoggle where emitted; on older
engines prefer controller opening methods for unattended bulk teardown.

Native per-node Symbol.for ownership rejects double adoption by Drawer/Modal/Dialog and
separately evaluated bundles. No mui-drawer or mui-drawer-content tags are registered;
legacy MuiDrawer remains unchanged. Prefer dispose before intentional removal or
cross-document transfer. Removed roots/clones are also released on observer delivery;
disposed handles cannot reconnect. Author attributes/classes/styles are not restored or
overwritten by Drawer because it never owns them; only the shared native inline-fallback
marker has conditional owned restoration.

## Per-property dispositions and migration

The [full reference tracker](../naive-ui/components/drawer.md) preserves every original
Drawer/DrawerContent prop/slot identity and explicitly cites added source contracts.

| Source family | Status | Native scope / exclusion |
| --- | --- | --- |
| placement, width/height, default-width/default-height | 🟢 Verified | Authored edge attribute and external CSS extents; defaults/snapshot mechanics differ |
| show, close-on-esc, mask-closable | 🟢 Verified | Strict native methods/mode and explicit native cancel/backdrop policies |
| show-mask | 🟢 Verified | True/transparent painting retained; false's nonmodal intent needs explicit show() |
| content/body/body-content/header/footer classes | 🟢 Verified | Native authored classList on documented regions |
| native-scrollbar on both components | 🟢 Verified | Native root/body scrolling only; custom false path omitted |
| title, closable, header/default/footer slots | 🟢 Verified | Authored heading/control/regions; no inferred level or render callback |
| on-esc, on-mask-click, on-update:show | 🟢 Verified | Native cancel, eligible backdrop request and native visibility events |
| auto-focus, trap-focus, block-scroll, z-index | ⏭️ Intentionally omitted | No disabling native modality, page lock or arbitrary top-layer ordering |
| resizable, min/max-width/height, width/height update callbacks | ⏭️ Intentionally omitted | No pointer-edge resizer/bounds manager or fabricated resize events |
| scrollbar-props and all style-object/string props | ⏭️ Intentionally omitted | Native scrolling and external stylesheets, no prop bag forwarding |
| display-directive, on-after-enter/on-after-leave | ⏭️ Intentionally omitted | Explicit native lifetime; no framework rendering or transition-hook parity |
| source theme/private/deprecated/resize aliases | ⏭️ Intentionally omitted | Source-cited exclusions, not undisclosed inherited support |

1. [x] Specify native DrawerContent anatomy and preserve names/headings/nodes/forms.
2. [x] Resolve strict native modes, focus/cancel/returnValue, owner lifetime and honest scroll/mask scope.
3. [x] Explicitly omit pointer resizing/bounds and callback parity; retain authored CSS sizing.
4. [x] Verify all edges, native forms/nesting/teardown, long/narrow content, media and packaging.

### Acceptance — 2026-09-09

- **197 targeted tests passed:** 36 Drawer, 44 Modal, 59 Dialog, 31 Image and 27 native/
  legacy. `npm test -- --run tests\drawer.test.ts tests\modal.test.ts tests\dialog.test.ts tests\image.test.ts tests\native.test.ts`
  and `npm run build` pass, including declarations/exports and all budgets.
- Chromium verified all four physical edges and both logical aliases in LTR/RTL, with
  Modal's composed stylesheet loaded after Drawer. At 1000×800, sides measured **384×800**
  and top/bottom **985×384** against a **985×800 available layout viewport**. Header/footer
  stayed fixed within the panel while the native body scrolled. Authored compact/wide CSS
  measured 288/576px side widths; no library resize notification was emitted or claimed.
- Native modal naming/autofocus, background focus blocking, required-field validation for
  **both Save click and implicit Enter**, valid Enter returnValue, separate header Close,
  formnovalidate Cancel, cancel veto, Escape and explicit modeless background access passed.
- Actual padding and inside-to-outside drags stayed open; eligible backdrop activation
  dismissed. Transparent painting retained native background blocking and dismissal.
  Nested Modal and the **actual Image preview helper** restored focus into the
  still-open Drawer. Reversed/direct-native owner reopening retained the page focus chain.
- ESM/classic/Modal ownership and namespace collision checks preserved existing APIs;
  legacy MuiDrawer still operated independently. Removal during the demo's local check,
  close/reopen before completion, body-style/cursor noninterference and explicit inline
  fallback were exercised. The page remained scrollable: this is **not scroll-lock support**.
- At **320×640, RTL and 2x CSS zoom**, all physical edges filled the **305×625 available
  layout viewport** without root/body horizontal overflow; the footer stayed within bounds
  and Save remained keyboard-activatable. At **320×200 and 2x zoom**, whole-panel scrolling
  made both footer actions fully reachable. Motion, forced colors and print media passed;
  print used visible body overflow and no fixed positioning (native top layer computed absolute).
- Script-blocked reload retained inline/native content and invalid/valid Enter form behavior.
  Capability reduction kept the authored inline link usable rather than falsely opening modal.
- Read-only review found and regressions fixed shared-base CSS order overriding full-edge
  bounds and header Close accidentally becoming the unvalidated default submitter. A
  short-height CSS fallback additionally prevents fixed regions consuming all useful space.
- **47 original identities preserved; 67 rows = 30 adapted targets + 37 omissions.**
  Catalog audit confirms **3,386 rows, 196/384 accepted tasks across 49 pages** and four
  remaining Planned P3 routes. All **393 relative file links** in the four changed docs
  resolve; previous master-inventory heading anchors are retained.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Drawer ESM | 10,510 | 3,956 | 4,750 |
| Drawer classic | 10,770 | 4,082 | 4,750 |
| Drawer composed CSS | 4,608 | 1,195 | 1,500 |

One format + CSS: **5,151 ESM / 5,277 classic gzip bytes**. Shared Dialog/Modal/Image
sources and prior outputs/ceilings remain unchanged. Modal ESM/classic/CSS stay
**3,533/3,661/933**, Dialog ESM stays **4,319**, and core/advanced/widgets remain
**14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings. No runtime dependency added.

This is stated jsdom/Chromium acceptance, not all-browser, physical-touch, visual-keyboard,
screen-reader, printed-pagination or framework/resizer certification.
**Next: Message, then Notification; Collapse Transition and Discrete API remain pending.**
