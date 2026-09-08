# Modal: generic authored content in the native top layer

**🟢 Verified retained native scope, not framework/provider or pixel parity.**
Modal owns generic visibility, not a decision footer. It imports only the accepted
`dialog/native.ts` lifetime primitive and its owned attributes, never the Dialog action
helper. The shared native sources and previous Dialog assets are unchanged.

## Loading and authored anatomy

| Entry | Contract |
| --- | --- |
| `@dataengine/markup-ui/modal` | `createModal`, `createModalOwner`, controller/options types |
| `dist/markup-ui-modal.js` | Optional standalone ESM |
| `dist/markup-ui-modal.global.js` | Classic `MarkupUIModal`; refuses namespace replacement |
| `@dataengine/markup-ui/modal/style.css` | External composed `dist/markup-ui-modal.css`, including shared native CSS |
| [Local demo](../../demo/components/modal.html) | Separate HTML/CSS/JS, no remote/business operations |

```html
<a id="open-project" href="#project-inline">Open project information</a>
<section id="project-inline"><h2>Project information</h2><p>Usable inline alternative.</p></section>
<dialog id="project" class="mui-native-dialog mui-modal"
  aria-labelledby="project-title" aria-describedby="project-description">
  <header data-modal-header>
    <h2 id="project-title" data-modal-title tabindex="-1" autofocus>Project information</h2>
  </header>
  <p id="project-description" data-modal-content>Review the local project details.</p>
  <form method="dialog" data-modal-footer>
    <label>Reference <input name="reference" required></label>
    <button value="saved">Save</button>
    <button value="cancelled" formnovalidate>Cancel</button>
  </form>
</dialog>
```

```js
// External setup script. Preserve the native link if real modality is unavailable.
const modal = MarkupUIModal.createModal(document.querySelector("#project"), {
  backdropDismiss: true
})
openLink.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey
    || event.shiftKey || event.altKey || !modal.supportsModal) return
  if (modal.showModal(openLink) === "modal") event.preventDefault()
})
```

Use a connected **light-DOM HTMLDialogElement**, explicitly named by aria-label or valid
aria-labelledby references. Preserve authored headings, description references, input
labels and form controls. No generated IDs, duplicate wrappers or role overrides.
An authored valid role=dialog/alertdialog is retained; native semantics ordinarily suffice.
**Do not author aria-modal** because the same element can intentionally open modelessly.
No mui-* registration, provider app, portal renderer, runtime CSS or global state store.

## Strict native visibility and focus

| API | Actual contract |
| --- | --- |
| `dialog` | Original native element; children/values/listeners are preserved |
| `supportsModal` | Whether this element has a callable native showModal method |
| `connected`, `mode`, `generation` | Terminal owner status, actual closed/modal/modeless/inline mode and lifetime invalidation token |
| `showModal(opener?)` | **Requires native showModal**; never silently degrades to modeless |
| `show(opener?)` | Deliberately modeless via native show; explicit inline alternative if show is also absent |
| `close(returnValue?)` | Immediate native closure, bypassing cancel; does not invoke a business decision callback |
| `requestClose(returnValue?)` | Native cancelable request where supported; exactly one cancel-event fallback otherwise |
| `dispose()` | Terminal, idempotent close/release; an adopted author's dialog remains in DOM |
| `closeOnEsc` | Boolean setup snapshot, default true; guards native platform cancellation |
| `backdropDismiss` | Boolean setup snapshot, **default false**, unlike upstream maskClosable=true |

Close first before switching modal/modeless modes. A request to upgrade an already open
modeless surface or downgrade a modal throws. An initially open native baseline is adopted
without hiding or upgrading it. Native opening failures throw; an author-cancelled
beforetoggle returns closed rather than claiming success. Unsupported showModal throws
with an explicit alternative; the demo keeps its native inline link usable.

Native focus steps, authored autofocus and browser top-layer background blocking are
central, not emulated. No trapFocus=false or autoFocus=false compatibility option exists.
No custom focus trap, page-wide inert/aria-hidden manager, global Escape handler or stack
that controls other components. An explicit opener is only a fallback after browser focus
restoration when focus remains on body or inside the closing surface. Removed, disabled,
hidden or inert openers are not focused; another focused surface is not disturbed.

Native show/showModal/close, Escape/cancel, method=dialog and close returnValue remain
observable. New helper openings reset returnValue to empty; close without a value retains
the current value. Native cancel listeners may synchronously prevent closure. Explicit
controller requestClose remains usable with closeOnEsc=false; modeless keyboard Escape
follows browser policy rather than a custom global key handler.

Do not dismiss an active top-layer modal by directly removing its open attribute. Use
close(). There is no author-controlled z-index that reorders the browser top layer.
The native generation handles direct closure/reopening and stale pointer tasks. This
generic helper starts **no asynchronous business decisions** and cannot cancel external
work. If callers start work, they must check connected, mode and captured generation before
changing their own content. Do not treat generation as cancellation of external effects.

## Backdrop and scroll scope

Opt-in dismissal requires the same primary pointer to start and end **outside the border
rectangle**. Padding clicks, inside-to-outside drags, secondary/mismatched/cancelled
pointers and later pointer-event preventDefault do not dismiss. The nonbubbling
`mui:native-dialog-backdrop` event is cancelable and contains `{ event: PointerEvent }`.
It is emitted only for an eligible opt-in request, not for every click on a framework mask.
The resulting requestClose still respects native cancel listeners.

`closedby=any` is rejected to avoid mixing native automatic and helper light-dismiss.
Authored closedby=none remains author-owned. The helper does not install commandfor
handlers: ordinary native command/form controls are solely the author's/browser's lane.

**blockScroll is intentionally omitted.** Native modal background focus blocking is not
a promise to freeze page scrolling. The helper/CSS never writes body/html overflow,
padding, aria-hidden or inert, installs a document :has lock, measures scrollbar gaps or
restores another owner's styles. Surface overscroll containment helps prevent scrolling
its edge into the page; wheel/touch behavior beyond the surface remains browser-owned.
No layout-shift compensation or page scroll-position guarantee is claimed.

`data-modal-backdrop="transparent"` changes only backdrop painting. The surface remains
truly modal with blocked background focus. It is **not** upstream show-mask=false, which
also disables mask interactions and focus trapping in the pinned implementation. For that
nonmodal interaction intent, explicitly use show(); no falsely modal ARIA state is added.

## Native forms and preset composition

All controls are authored. `form method=dialog` uses native submit validation, submitter
return values and formnovalidate exactly as normal. There are no click/submit interceptors,
generated close/positive/negative buttons, type mutations, duplicate submit/requestSubmit
calls or automatic business actions. Ordinary form values survive close and reopen.

- **Generic content:** author header/content/footer/section/article/figure/form nodes.
  `data-modal-header/title/content/footer` supply small external layout conventions.
- **Card intent:** author the required native heading/body/cover/extra/footer/actions.
  `data-modal-segmented` adds a footer rule; CSS tokens own width, border and padding.
  This is not automatic CardProps forwarding, a tag switch, embedded/hover state or an
  inner body-scroll implementation. Whole-surface native scrolling remains reachable.
- **Dialog presentation:** load the separate Dialog CSS and author its decorative icon,
  title/content/action regions on the same native surface, as in the demo. This adds
  no decision runtime and no second dialog role.
- **Async confirmation:** choose the separately accepted [Dialog helper](dialog.md)
  instead of createModal on that element. Its false/Promise/onClose/positive/negative
  semantics are not imported or falsely promised by generic Modal. **Never bind both**
  helpers to one dialog: their shared per-node Symbol.for ownership guard rejects it.

Unknown option keys are rejected, including render, preset, style, blockScroll, trapFocus
and callbacks. Native event listeners are explicit; their normal platform error reporting
is not swallowed by this helper. There is no after-enter/after-leave transition Promise or
notification claiming Vue animation-hook parity. Use native beforetoggle/toggle/close with
their actual platform timing; toggle can coalesce and close is queued.

## Explicit template owner and teardown

```js
const owner = MarkupUIModal.createModalOwner(document.querySelector("#modal-host"))
const instance = owner.create(document.querySelector("#project-template"), {
  title: "Local project", content: "Literal text", mode: "modal"
})
instance.close()       // Keep this clone/handle for explicit reuse.
instance.showModal()
instance.dispose()     // Remove only this owned clone.
owner.destroyAll()     // Release this collection, preserving native focus-return order.
owner.dispose()        // Terminal collection teardown.
```

A trusted template contains exactly one closed, non-hidden native dialog. Script, style,
iframe, object and embed elements are rejected. This is not a sanitizer for untrusted
markup/URLs/event attributes. Text options title/content require one nonempty text-only
data-modal-title/content region; no rich authored controls are replaced or HTML evaluated.
There is no render function or implicit preset. mode defaults to modal; modeless must be
explicit. Failed modal creation releases the clone/owner before throwing.

Template and authored nodes are never moved; clones have their own lifetime. Listeners
must be attached explicitly to clones. IDs must be unique in a clone and document, not
silently renamed. For concurrent repeated clones use distinct IDs or an ID-free
aria-label template. `owner.modals` returns a new readonly snapshot of owned handles,
including closed reusable clones—not a reactive list of only visible surfaces.

The collection tracks **its own opening order** only to dispose overlapping surfaces in
a safe focus-return order. Focused owned surfaces close first, then most recently opened
ones; closed handles follow. Reopened handles are not destroyed in obsolete creation
order. Controller calls track openings before native focus runs; native beforetoggle also
tracks direct native openings when emitted. On engines without dialog beforetoggle,
prefer controller opening methods for reliable unattended bulk teardown; focused-native
surface selection remains a fallback. There is no document-global top-layer manager.

Collection teardown blocks reentrant creation/reopening through its handles; native
opening requests during teardown are vetoed where beforetoggle is emitted. Registering a
clone before native opening prevents a focus listener from letting it escape owner.dispose.
The underlying native observer watches open plus actual ancestor child lists, not the
document subtree; reparenting refreshes that chain. Removal releases clones and collections
drop disposed handles. Prefer dispose **before intentional removal/cross-document transfer**.
Disposed controllers cannot reconnect; bind a fresh one to a retained authored element.

## CSS, scope and migration steps

External CSS composes shared native viewport-percentage bounds/scrolling with Modal
width/border/radius/padding/header/footer rules. Center is default; authored
data-modal-placement=start/end selects logical block alignment, a native-target addition,
not a claimed upstream placement prop. Short and long content share the same native
surface; controls are never hidden for a transition. No numeric/style writes are made by
the helper. CSP needs approved external script/style sources, not unsafe-inline.

Motion is not required; reduced-motion rules are static. Forced colors retain borders
and visible words. Print removes fixed placement, maximum block sizing and shadow; an
open native top-layer dialog may compute as absolute rather than static in Chromium.
No physical-print pagination, all-browser or screen-reader certification is claimed.

The [reference tracker](../naive-ui/components/modal.md) gives a disposition for every
original direct/preset/inherited/instance identity, including the duplicated Provider
table, plus explicitly cited source-only and inherited additions.

### Property disposition summary

Green means the stated native target, **not acceptance of that framework option key**.
The same dispositions apply to original camelCase Options/Reactive repetitions.

| Original property/slot family | Status | Exact retained target or exclusion |
| --- | --- | --- |
| show, close-on-esc, mask-closable | 🟢 Verified | Strict methods/mode and explicit native cancellation/backdrop policies |
| on-esc, on-mask-click, on-update:show | 🟢 Verified | Native cancel, eligible backdrop request and native visibility events, not callback props |
| auto-focus, trap-focus | ⏭️ Intentionally omitted | No false-focus/trap override while claiming modality; native autofocus remains available |
| block-scroll, show-mask | ⏭️ Intentionally omitted | No page lock; upstream unmasked interaction differs from a transparent modal backdrop |
| preset, default/header/footer/action/cover/header-extra slots | 🟢 Verified | Explicit authored native composition; no preset selector or renderer |
| title, content, positive-text, negative-text | 🟢 Verified | Native headings/content/form labels; only title/content have text-only clone options |
| bordered, closable, close-focusable | 🟢 Verified | Author border CSS and native close controls; no generation/nonfocusable default |
| segmented | 🟢 Verified | Native footer rule only, not the Card per-region object |
| class and header/content/footer/action/title/extra classes | 🟢 Verified | Author classList, never forwarded option bags |
| icon, icon-placement, show-icon, type | 🟢 Verified | Optional explicitly loaded Dialog CSS and authored decoration |
| content-scrollable, embedded, hoverable, size, tag | ⏭️ Intentionally omitted | No Card body scrollbar, preset visual-state/sizing/tag engine |
| on-close/on-positive-click/on-negative-click, loading | ⏭️ Intentionally omitted | Generic Modal does not import the separate Dialog decision contract |
| positive-button-props, negative-button-props | ⏭️ Intentionally omitted | Direct native controls instead of prop forwarding |
| style and all region-style fields | ⏭️ Intentionally omitted | External CSS instead of runtime string/object styles |
| display-directive, draggable/bounds/draggableClass | ⏭️ Intentionally omitted | Explicit native lifetime; no framework rendering directive or drag context |
| transform-origin, z-index, transition hooks | ⏭️ Intentionally omitted | Native top-layer order; no animation geometry or completion parity |
| to, create/destroyAll, ModalProviderInst, Reactive.destroy | 🟢 Verified | Explicit root, native owner methods and close/dispose lifetime |
| useModalReactiveList, provider default | 🟢 Verified | Explicit snapshot and ordinary root children, not reactivity/injection |
| useModal, Reactive.key, render | ⏭️ Intentionally omitted | No injection, generated framework identity or render callbacks |
| source themes/private/deprecated flags, confirm/visibility aliases | ⏭️ Intentionally omitted | Explicitly source-cited exclusions, not undisclosed inherited support |

1. [x] Specify strict native top-layer modes, focus, cancel, returnValue and honest fallback.
2. [x] Map preset intent to authored native regions/CSS, with incompatible props omitted.
3. [x] Replace optional provider/render APIs with explicit trusted-template instances/owners.
4. [x] Verify overlapping/reopened lifetimes, native forms, teardown/focus, CSS and packaging.

### Acceptance — 2026-09-09

- **130 targeted tests passed:** 44 Modal, 59 Dialog and 27 native/legacy.
  `npm test -- --run tests\modal.test.ts tests\dialog.test.ts tests\native.test.ts`
  and `npm run build` pass, including declarations/exports and all existing/new budgets.
- Chromium verified native modal naming/autofocus, background focus blocking, valid/
  invalid/formnovalidate form behavior, returnValue, cancel veto, closeOnEsc policy,
  nested top layers and parent/opener restoration; modeless background access is distinct.
- Actual pointer tests retained padding/inside-to-outside drags and dismissed eligible
  backdrop requests. Transparent backdrop remained modal. Direct native and controller
  reopen paths, independent clone disposal/removal and shared ESM/classic/Dialog ownership
  were checked. Classic namespace collision preserved the original API; legacy MuiDialog
  still opened and closed independently.
- Read-only review found bulk destruction using obsolete creation order after handles
  reopened in the opposite order. Unit and Chromium regressions now preserve the original
  page focus return through the current opening chain, including direct native reopen.
- The page remained scrollable while modal; author body overflow/padding updates survived
  closure. This validates **noninterference**, not body-scroll-lock support.
- At **320×640, RTL and 2x CSS zoom**, long content stayed inside the viewport with a
  measured **241×561** surface, **32px** top inset, no horizontal content overflow and
  reachable scrolled form controls. Short-content start/center/end placements measured
  **16/150/284px** top insets at 1000×800. Reduced motion, forced colors and print were
  checked; Chromium print computed an open top-layer modal as absolute, not fixed.
- Capability-reduced testing rejected unsupported modality, preserved the native inline
  link and supported explicitly requested inline cancel/close/returnValue. Script-blocked
  reload kept inline/native baseline content usable with native form validation and closure.
- Inventory audit preserves **121 original identities** and reconciles **154 rows: 74
  adapted targets, 80 omissions**. Catalog totals: **3,366 rows, 192/384 tasks across 48
  accepted pages**, five Planned P3 routes. All **481 relative file links** in the four
  changed documentation files resolve; earlier master inventory anchors remain available.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Modal ESM | 9,082 | 3,533 | 4,000 |
| Modal classic | 9,339 | 3,661 | 4,000 |
| Modal composed CSS | 2,891 | 933 | 1,250 |

One format + CSS costs **4,466 ESM / 4,594 classic gzip bytes**. Dialog ESM/classic/CSS
remain **4,319/4,442/1,007**; its shared native sources and all prior ceilings are unchanged.
Core/advanced/widgets remain **14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings.
No runtime dependency, scroll/focus/animation framework or build/test tool was added.

Only the stated jsdom/Chromium evidence is claimed; not all-browser, physical-touch,
screen-reader, framework preset or transition parity. **Next: Drawer; P3 remains incomplete.**
