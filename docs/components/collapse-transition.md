# Collapse Transition: optional native height motion

**🟢 Verified retained native scope, not Vue transition or pixel parity.**
This opt-in controller adopts an authored outer/inner pair. It does not render/unmount
content or make the existing Collapse component depend on animation. Native hidden state,
inert and Web Animations are used without a transition framework or per-frame layout loop.

## Loading and authored wrapper

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/collapse-transition` | `createCollapseTransition` and controller/options/hook/error types |
| `dist/markup-ui-collapse-transition.js` | Optional standalone ESM |
| `dist/markup-ui-collapse-transition.global.js` | Classic `MarkupUICollapseTransition`; refuses namespace replacement |
| `@dataengine/markup-ui/collapse-transition/style.css` | External `dist/markup-ui-collapse-transition.css` |
| [Local demo](../../demo/components/collapse-transition.html) | Separate native HTML/CSS/JS; existing details/Collapse remains independent |

```html
<button type="button" id="toggle" aria-controls="content" aria-expanded="true">Toggle</button>
<div id="content" class="mui-collapse-transition">
  <div data-collapse-transition-content class="authored-panel">
    <h2>Authored heading</h2>
    <label>Reference <input name="reference" required></label>
  </div>
</div>
```

```js
// External setup script; .authored-panel presentation belongs in an external stylesheet.
const transition = MarkupUICollapseTransition.createCollapseTransition(
  document.querySelector("#content"), { duration: 300, focusTarget: toggle }
)
toggle.addEventListener("click", async () => {
  try { await transition.setShow(!transition.show) }
  finally { toggle.setAttribute("aria-expanded", String(transition.show)) }
})
```

Use one connected light-DOM `div.mui-collapse-transition` with exactly one direct native
`div[data-collapse-transition-content]`. Keep that pair stable; the inner div can contain
ordinary authored content, native controls and listeners. No synthetic role, generated
heading, aria-level, tabindex, aria-expanded or trigger discovery is performed.

The outer wrapper is a **natural-height ordinary block**: zero vertical padding/border/
margin, no min/max-height constraint, no explicit inline height other than auto, no own
transform and horizontal writing mode. Put padding, borders and content presentation on
the inner **flow-root**, whose outer margin is zero. Its flow-root prevents child margins
escaping the measurement box. This is not arbitrary table/inline, flex/grid stretch,
positioned/overflowing children, 3D transform or vertical-writing support.

CSS owns display and transient clipping through an owned marker. Script owns only hidden/
inert/marker attributes and its own Animation. It never writes inline height/overflow,
uses commitStyles, clones/moves nodes, installs a stylesheet or forces unrelated animations
to finish. Do not mix another outer-wrapper animation/geometry controller with this one.

## State, appearance and completion

| API | Native contract |
| --- | --- |
| `element`, `connected` | Original wrapper and terminal ownership status |
| `show` | Requested target while active; actual native visibility after a failed request |
| `state` | open / closed / opening / closing |
| `animation` | Current owned native Animation, or null |
| `finished` | Latest request Promise<boolean>; true for completed target, false for cancellation/reversal/disposal |
| `lastError` | Last surfaced diagnostic |
| `setShow(boolean)` | Request native visibility; same in-flight target returns the same Promise without restarting hooks |
| `finish()` | Finish the current request now, including ordered hooks for queued appearance |
| `cancel()` | Cancel motion and settle the requested target safely; emits cancel hook, not successful after hooks |
| `dispose()` | Terminal cancellation/release, restoring still-owned author hidden/inert/marker state |

Options are setup snapshots: show, appear, duration, focusTarget and the hooks below.
**Default show honors the authored hidden attribute**, rather than overriding an HTML
baseline with the source's true default. Explicit show selects the initial state without
mounting/unmounting. Default appear=false does not animate or notify initial setup.
appear=true requests initial opening motion on a microtask so the controller exists for
callbacks. If authored content already has focus, initial appearance is immediate rather
than making it clipped/inert. Initial hidden content stays hidden unless explicitly shown.

Duration is an integer **0–10,000 ms**, default **300 ms**. Zero is immediate. Easing is a
native ease-in-out curve, not a forwarded theme/style object. Missing Element.animate,
native inert or motion-preference detection, missing effective clipping CSS, reduced motion
or print uses an immediate safe target. A motion/print preference change during animation
finishes the current target immediately. Print preserves settled hidden content as hidden.

Motion samples the current computed height and the inner native offsetHeight **once per
request**, in layout CSS pixels. The inner measurement includes its padding/border and
can round by a layout pixel. These measured heights exist only in native animation
keyframes, with fill=both while active. Cancellation/settlement releases the effect back
to ordinary intrinsic auto height. CSS zoom does not get multiplied into pixel keyframes.

Rapid reversal samples the currently displayed height before cancelling the old effect;
old expected completions cannot hide/reopen the newer state. Same-target requests do not
re-measure or restart. Content/width/image/font changes during motion are **not continuously
retargeted**: the animation retains its sampled endpoint, then releases to the latest
intrinsic size at settlement. This may produce a final size adjustment, but never retains
a stale fixed height. No ResizeObserver height engine, animation-frame loop or resize polling.

## Focus and attribute ownership

Clipped content is inert during both opening and closing. Opening removes hidden only
after establishing inert/clipping; the effect and clipping are released before inert is
restored. Settled close uses native hidden, with original author inert restored rather than
unconditionally removed. Unsupported inert means **no clipping animation**, not a custom
focus trap. Native controls/values/listeners remain intact; hidden/inert do not disable form
serialization. Applications own any fieldset/validation policy for hidden form sections.

When hiding affects focused descendants, the controller must move focus to the explicitly
supplied, available same-document focusTarget outside the wrapper. If none works, the
request rejects and leaves content visible, not invisibly interactive. It never invents an
unrelated tab stop or moves already-outside focus. If disposal could restore an originally
hidden wrapper while focus is inside, disposal conservatively requires the same evacuation;
it throws without disposing when no safe target exists. Move focus first and retry.
Disposal enters its terminal guard before any focus callback can reenter.

The existing reentrant attribute ledger restores only owned writes, including preserving
identical later author writes. Direct author hidden/inert/clipping changes can interrupt an
active animation; the effect is cancelled and owned motion state released without undoing
the author change. Removing the clipping marker or losing clipping after a start hook is
not allowed to leave an unclipped but inert moving wrapper. Do not directly mutate reserved
visibility/motion attributes while using the controller; dispose/rebind when changing owners.

Outer inline colors/styles are never rewritten. Authored geometry changes are not normalized
into a universal animation model. The external CSS marker temporarily overrides overflow
for clipping; restoring the marker restores ordinary author overflow. CSP must permit the
explicit script/stylesheet and browser Web Animations use. No unsafe-inline style injection
is performed, but transient measured CSS geometry is still supplied through the native
animation API; it is not a strict “CSS declarations only” implementation.

## Hooks, cancellation and errors

Native options `onEnter`, `onLeave`, `onAfterEnter`, `onAfterLeave`, `onCancel` receive
`{ element, show, controller }`. They are explicit native hooks, **not automatically inherited
Vue/$attrs transition props**:

- Enter/leave run for a real target request after safe preparation, including immediate
  fallback paths. No hook is repeated by a same-target request.
- After-enter/after-leave run only after successful native visibility settlement and release
  of owned motion state. A reentrant finish during focus evacuation still runs the start
  hook first; finishing from inside a start hook cannot resurrect old motion.
- Reversal/cancel calls onCancel for the cancelled request. A direct native Animation.cancel
  also settles safely as cancellation. Dispose cancels without running lifecycle callbacks.
- Hook reentrancy may start a new request; no old completion writes visibility/styles into
  the new request. Synchronous start-hook failure releases motion and rejects the request.
  After-hook failure rejects its request without rolling back an already-settled/new state.
- Hook Promises are **not awaited** as animation gates. Rejections are observed/reported,
  never applied as a later visibility update. There is no Vue done-callback or async veto.

Expected cancellation is narrowly recognized: a native DOMException named AbortError
after an owned cancellation, or an idle native Animation cancelled directly. Other
Animation.finished errors—including a plain Error merely named AbortError—are surfaced.
Unexpected failures cancel owned motion, release inert/clipping and leave the current
native visibility safely exposed; they do not fabricate successful after hooks.

The cancelable nonbubbling `mui:collapse-transition-error` carries
`{ error, phase: "animation" | "hook" | "ownership", stale }`. Failures are also reported to
console unless a listener acknowledges them with preventDefault. The latest Promise and
lastError remain inspectable. Stale failures may be diagnostic but do not change a newer
visibility request. Child or wrapper transitionend events **never** complete this controller:
only its native Animation.finished or explicit finish/cancel path does.

## Removal, fallback and exact scope

One per-node Symbol.for claim rejects duplicate ownership across ESM/classic evaluations.
Scoped root/ancestor child-list observation detects removal/reparenting and immutable-inner
faults; a root attribute observer checks motion safety. Neither performs per-frame layout
work. Removal wins over queued attribute-observer checks, so a same-task detached root is
disposed rather than misreported as a clipping failure.

Prefer dispose before intentional removal/cross-document transfer. Disposed controllers
cannot reconnect; bind a new one to retained authored nodes. Original hidden/inert state
and later author styles survive release, and an old finished Promise cannot reapply them.
No renderer, template cloning, provider or mutation of the existing Collapse component.
Native details/summary or authored visible/hidden content remains the no-script baseline.

The [reference tracker](../naive-ui/components/collapse-transition.md) retains all original
show/appear/display-directive/default-slot identities and explicitly cites internal hook,
theme and transition-style supplements.

| Source family | Status | Native disposition |
| --- | --- | --- |
| show, appear | 🟢 Verified | Explicit native visibility/appearance, with authored baseline and safe fallback |
| default slot / wrapper | 🟢 Verified | Stable authored outer/inner content, no remount or renderer |
| enter/leave/after-enter/after-leave hooks | 🟢 Verified | Explicit native timing above, not Vue attribute forwarding |
| display-directive | ⏭️ Intentionally omitted | No if/show rendering directive; native hidden retains nodes |
| collapsed | ⏭️ Intentionally omitted | Deprecated inverted source alias is not reproduced |
| theme objects/bezier forwarding | ⏭️ Intentionally omitted | External presentation and one native easing curve |
| group/mode/width/reverse | ⏭️ Intentionally omitted | No transition-group orchestration, width/reverse mode or keyed VNodes |
| private max-height/reflow and margin/padding/opacity options | ⏭️ Intentionally omitted | Sampled native height on the constrained wrapper only |

1. [x] Define native wrapper/visibility/focus ownership and preserve content.
2. [x] Implement optional native motion with immediate reduced/unsupported fallback.
3. [x] Bound measurement/cancellation/hooks without a rendering or resize framework.
4. [x] Verify reversals, content changes, removal, styles, focus and browser/package gates.

### Acceptance — 2026-09-09

- **160 targeted tests passed:** 43 Collapse Transition, 33 Collapse, 57 Notification/
  shared ownership and 27 native/legacy.
  `npm test -- --run tests\collapse-transition.test.ts tests\collapse.test.ts tests\notification.test.ts tests\native.test.ts`
  and `npm run build` pass, including declarations/exports and all optional/core budgets.
- Chromium verified real native height interpolation: an initial **207.90625px** wrapper
  measured **171.265625px** during closing and **35.296875px** during opening, with inert
  and clipping active. Focus could not enter clipped controls. After authored content was
  added during motion, both wrapper and inner settled to **263.90625px**, without an inline
  height/style write.
- Mid-motion reversal preserved the sampled height (**198.59375px** immediately before/
  after reversal). Same-target requests reused the pending Promise; old requests resolved
  false without stale hide/hooks. Direct native cancellation, explicit finish and clipping
  ownership loss settled safely, and synchronous hook errors were surfaced.
- Explicit focus evacuation, queued-appear/reentrant-finish hook ordering, input values/
  native form validation/listeners, original hidden/inert state and later author styles
  were checked. Same-task removal before attribute-observer delivery now disposes cleanly
  rather than misreporting an animation failure.
- **320px, RTL and 2x CSS zoom** retained real interpolation, native body scrolling and
  no horizontal wrapper overflow. Final height returned to the current intrinsic inner
  height. Mid-animation reduced-motion/print changes settled the target; print kept closed
  content hidden. Forced-color content borders remained available.
- ESM/classic per-node ownership, namespace collision preservation, native unsupported-WAAPI
  fallback and legacy/core coexistence passed. Script-blocked reload kept the authored
  content and independent native details/summary usable.
- Read-only review led to regressions for start-hook order when focus evacuation calls
  finish, and marker/clipping loss while an animation owns inert. No animation or resize
  framework, new test tool or runtime dependency was added.
- **Four original identities preserved; 20 rows = eight adapted targets + 12 omissions.**
  Catalog audit confirms **3,444 rows, 208/384 tasks across 52 accepted pages** and one
  remaining Planned P3 route. All **362 relative file links** in the four changed docs
  resolve; prior master inventory heading anchors are retained.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Collapse Transition ESM | 9,400 | 3,715 | 4,500 |
| Collapse Transition classic | 9,703 | 3,837 | 4,500 |
| Collapse Transition CSS | 693 | 274 | 750 |

One format + CSS: **3,989 ESM / 4,111 classic gzip bytes**. Existing Collapse, shared
attribute/removal helpers, all prior optional sources/outputs and ceilings are unchanged.
Core/advanced/widgets stay **14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings.

Only stated jsdom/Chromium evidence is claimed—not all-browser, physical-touch, screen-reader,
arbitrary transformed/inline/table geometry or Vue transition certification.
**Next: Discrete API; global P3 remains incomplete until that route is resolved.**
