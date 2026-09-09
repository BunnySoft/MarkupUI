# Split: native panes and an accessible separator

**🟢 Verified retained two-pane scope.** Original named native regions in CSS grid, one
pointer/keyboard separator, explicit ratio/pixel values and safe lifecycle. No drag/layout
framework, hidden application layout store, global cursor/selection override or renderer.

## Loading and native anatomy

| Asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/split` | createSplit, SplitSize/options/state/change/drag/controller types |
| `dist/markup-ui-split.js` | Optional ESM; no custom-element registration |
| `dist/markup-ui-split.global.js` | MarkupUISplit namespace; rejects replacement |
| `@dataengine/markup-ui/split/style.css` | Native grid/pane/handle/overflow/RTL/media presentation |
| [Local demo](../../demo/components/split.html) | Separate HTML/CSS/JS; nested panes, forms, bounds and native input |
| [Complete reference](../naive-ui/components/split.md) | Every original identity and explicit source supplement |

```html
<p id="split-help">Arrows resize; Shift uses coarse steps; Home/End choose bounds.
  Escape cancels an active drag.</p>
<section class="mui-split" data-split>
  <section id="editor" data-split-pane="1" aria-labelledby="editor-heading">
    <div class="pane-content"><h2 id="editor-heading">Editor</h2>
      <label>Title <input name="title" required></label>
    </div>
  </section>
  <div data-split-handle hidden aria-label="Resize editor" aria-describedby="split-help"></div>
  <section id="preview" data-split-pane="2" aria-label="Preview">
    <div class="pane-content">Original content remains here.</div>
  </section>
</section>
```

```js
import { createSplit } from "@dataengine/markup-ui/split"
const split = createSplit(document.querySelector("[data-split]"), {
  defaultSize: .5,
  min: "100px",
  max: .9
})
split.set({ size: "240px" }) // Silent requested pixel preference.
```

The connected light-DOM host is a div/section with exactly three native element children:
pane 1, handle, pane 2. Whitespace/comments are not data. Panes are named native sections
or named div[role=region], with distinct fixed IDs. The handle is a native div/section
with a meaningful aria-label/labelledby and noninteractive decorative content only.
No controls, links or editable widgets belong inside the separator.

The handle starts **hidden**, without a visible promise of keyboard resizing. Binding
adds role=separator, tabindex=0, orientation, primary-pane aria-controls and value bounds.
No-JS retains both native panes in static layout and keeps the fake handle out of the
focus/accessibility path. Existing pane subtrees, fields, defaults, labels, listeners,
text selection and templates remain application-owned; no cloning/reconstruction occurs.

## Size units, defaults and actual layout

`SplitSize` is a number in **0..1** or a nonnegative **decimal lowercase px string**.
Examples: .5, `"240px"`, `"0px"`, `".5px"` (normalized to `"0.5px"`).
No percentage strings, whitespace, calc/em/rem/vh, exponent strings, negative values,
object coercion or implicit unit inference. Pixel preferences/bounds are capped at
1,000,000px; effective usable geometry is also bounded to 1,000,000 CSS pixels.

| Setting | Default / meaning |
| --- | --- |
| defaultSize | .5; future reset target |
| size | defaultSize initially; current **requested** ratio or pixel preference |
| min / max | 0 / 1, independently ratio or decimal px |
| direction | horizontal unless authored data-split-direction or options says vertical |
| disabled | false; disables resizing, not fields or the reserved handle track |
| resizeTriggerSize | 12 CSS px, configurable 1..64; deliberate larger default than source 3 |
| step / coarseStep | 10 / 100 CSS px; positive <=10,000, coarseStep >= step |

`setDefaultSize` changes only the future default. `reset()` silently applies that default
as the current preference; it is not a native form reset. Native form.reset restores
field values but does not reset layout. The source watch-props reactive behavior is omitted.

**Requested and effective sizes are separate.** size retains its ratio/pixel mode and
preference through clamping, hidden/zero geometry and viewport changes. state.pixels and
state.ratio describe the effective first-pane allocation. A requested 300px can be
temporarily clamped to a smaller available maximum and return to 300px when space grows.
User pointer/keyboard changes produce a clamped size in the current mode; reset can switch
mode when its default uses a different unit.

The ratio basis is the real root client axis, excluding both root padding edges, the
handle track and **both grid gaps**. Borders/scrollbars are excluded through native client
metrics; clientLeft/clientTop and bounding rectangles locate the content edge. Root
padding/borders and resolved nonnegative pixel gaps are supported.

Keep outer pane/handle boxes borderless, unpadded, zero-margin and untransformed; put pane
decoration in original inner content. Handle border appearance uses non-geometric inset
paint. Do not override owned grid tracks/data attributes or geometry tokens. Use a
definite externally sized root (default --mui-split-height:20rem), not an auto-height
feedback layout for vertical splitting.

## Bounds and suspended layouts

Same-unit min > max rejects before changing a healthy gesture/configuration. Mixed units
are resolved against actual current usable space. Max is clipped to available space;
if min then exceeds max, the range is **infeasible**, not silently swapped.

When hidden, zero/too small (less than 2 usable CSS px), or infeasible, resizing suspends:
effective pixels/ratio/ARIA range are unavailable, the handle hides, and desired/default
values remain. Visible infeasible layouts expose **uncollapsed stacked max-content rows**
with native root scrolling rather than overlapping or clipping both panes into impossible
tracks. Restored feasible geometry reapplies the retained preference.

Only root/owned-node/ancestor changes and native resize events schedule geometry work.
There is no layout polling loop. State reason distinguishes hidden, space, bounds and print.
`mui:split-layout` reports observed layout synchronization; it is not a user size update.

## Arrangement, separator orientation and keyboard

| Direction | Physical panes | Separator ARIA | Keys |
| --- | --- | --- | --- |
| horizontal, LTR | First left, second right | vertical | Right grows first; Left shrinks |
| horizontal, RTL | First right, second left | vertical | Right shrinks first; Left grows |
| vertical | First top, second bottom in horizontal writing mode | horizontal | Down grows first; Up shrinks |

Arrows always move the physical separator in the named direction. Shift uses coarseStep.
Home chooses the minimum first-pane allocation, End the maximum, regardless of RTL.
Perpendicular keys, Ctrl/Alt/Meta combinations, composing input and already-prevented
keyboard events are not appropriated. Native repeated arrows remain usable.

aria-controls names **pane 1**, whose size is controlled; pane 2 receives the remaining
space. aria-valuemin/max/now report effective percentages of usable space, not raw pixel
strings or stale desired values. aria-valuetext also supplies effective pixels. Fixed
min=max disables the separator; disabled remains focusable with aria-disabled and retains
current geometry. The helper does not apply native disabled to arbitrary pane fields.

Without Pointer Events/capture, the same named separator remains keyboard-resizable,
with a normal cursor and no touch-action drag claim. No pointer polyfill is installed.
There is no additional Enter/double-click collapse model.

## Pointer capture, final movement and cancellation

Only the original handle can start/capture a primary left/tip pointer. Other pointer IDs,
nonprimary/right/modified/prevented starts are ignored. There is one active pointer per
owner; nested handles cannot start their ancestor's listener.

Pointer start focuses the owned handle, validates current geometry and captures its ID.
The exact grab offset within the handle is retained. Current native root position is used
for each processed sample, so normal ancestor translation/scroll does not become a jump.
One animation frame coalesces movement to the newest sample. **Pointerup processes its own
final coordinates synchronously before ending**, even if a pending move frame never ran.

Pointercancel, lost capture, Escape and focus departure restore the gesture's start
preference, release capture and end the gesture. Escape is handled only in the active
handle context; moving focus elsewhere cancels without stealing that new focus.
Geometry/bounds/scale/direction invalidation cancels instead of continuing with stale
coordinates. A changed size supplied by a programmatic set wins; otherwise an interrupted
gesture returns to its start preference.

No body cursor/user-select/touch hacks or document-wide move listeners are installed.
Only the handle has drag touch-action/user-select/cursor rules. Pane text/controls keep
native interaction, and pointer capture does not create a modal interaction boundary.

| Event | Contract |
| --- | --- |
| mui:split-drag-start | After successful capture; pointer ID, current state and original event |
| mui:split-drag-move | Each processed/coalesced sample, including clamped movement |
| mui:split-change | User pointer/keyboard size change, or user cancellation rollback; source and actual state included |
| mui:split-drag-end | Final state, cancelled flag/reason and terminal event (or null for programmatic/layout teardown) |

Programmatic set/default/reset/reveal do not fabricate user size-change events. They can
end an active gesture with an explicit cancelled lifecycle event. Automatic geometry
changes similarly report layout/cancel state, not user edits.

Callbacks are native custom-event listeners, not prop-array forwarding. Reentrant
settings/disconnect during start/change invalidate the old gesture before stale
move/up work can run. Layout-write reentry is rejected; disconnect may interrupt focus
handoff. No old pointerup restores a newer explicitly assigned size. Normal DOM listener
exceptions retain browser semantics.

## Collapsed pane focus, native forms and reveal

Zero and subpixel slices **below 1 CSS px** are treated as collapsed interaction surfaces.
The pane gets owned hidden and inert attributes while its grid allocation remains explicit.
Invisible fields are not left tabbable. This is not native disabled: names, values,
default/reset state and validation remain unchanged.

If a focused control would become hidden, focus moves to the available separator before
hiding that pane. A disappearing suspended handle falls back to the root. Outside focus
is never taken by ordinary size changes. Whole-application hidden/inert/disclosure changes
still require an application focus policy.

**Hidden/inert named fields still submit and can remain natively invalid.** The helper
does not delete names/required, disable fields, create hidden proxies or serialize layout
as a form field. Quiet checkValidity does not expand panes.

`revealPane(1|2)` is an explicit application request: it makes an allowed collapsed pane
noncollapsed using an interior allocation, without violating bounds. It returns false if
hidden/zero/print geometry or fixed constraints prevent a reveal. It does not promise
enough width for every application's field design or open unrelated hidden ancestors.
Adjust bounds/layout or disconnect to static panes when needed.

The demo's novalidate submit handler prevents default, finds the first native invalid
control, explicitly reveals its owners outer-to-inner, then focuses/reports that field.
Only a valid form produces the demo FormData readout. Native field reset is a separate
button and leaves layout unchanged.

```js
const invalid = [...form.elements].find(field => field.willValidate && !field.validity.valid)
if (invalid && split.pane1.contains(invalid)) {
  if (!split.revealPane(1)) return showApplicationLayoutError()
  invalid.focus()
  invalid.reportValidity()
}
```

## Zoom, transforms, print and ownership limits

Geometry uses native CSS client/offset dimensions and the axis ratio between bounding
rectangles and the CSS border box. This normalizes CSS zoom and positive axis-aligned
2D scale/translation instead of assuming visual client coordinates equal CSS lengths.
Subpixel/native offset rounding is possible; no sub-device-pixel accuracy guarantee.

Rotations, skew, negative/reflected scale, perspective, 3D transforms and vertical writing
modes are explicitly rejected. Native DOMMatrixReadOnly validates transforms where needed;
without it use untransformed layout. Do not transform the owned pane/handle outer boxes;
transform inner application content instead. Unsupported geometry reports mui:split-error
and releases to native static layout rather than pretending ratio math remains valid.

Native print layout is a supported temporary suspension, not a malformed-grid error.
It cancels an active drag, disables interaction, preserves requested size and resumes
screen geometry after print. Existing collapsed panes stay hidden in print; call reveal
before printing all content. Print does not automatically change native form visibility.

A scoped ResizeObserver and attribute/ancestor observation schedule frames only for real
events. Without ResizeObserver, call refresh after sizing. Separate owners remain separate;
parent pane resizing naturally updates an observed nested root. No global layout model,
renderer, animation dependency or focus trap is introduced.

The only JS style writes are --mui-split-first and --mui-split-handle-size numeric geometry
tokens, through the existing owned-write utility. External CSS owns tracks, outer boxes,
inner pane overflow, handle paint/focus, direction, hidden safety, forced colors and print.
Source theme/style-object/provider machinery is omitted.

## API and handoff

| API | Contract |
| --- | --- |
| element, pane1, pane2, handle | Original native nodes |
| connected, error, state, size | Lifetime/error, effective geometry/state and current requested value |
| set(values) | Validated silent size/bounds/direction/disabled/handle/step settings |
| setDefaultSize(value) | Future reset target only |
| reset() | Silent current-size reset, separate from form reset |
| refresh() | Native geometry/ownership synchronization; no new item/content model |
| revealPane(1|2) | Explicit noncollapsed request within current constraints |
| disconnect() | Release capture/tasks/observers/owned styles/attributes and restore static layout |

Disconnect retains pane DOM/listeners/data, never resurrects removed content, and restores
only attributes/styles still owned by the helper. It restores original **static layout**,
not a hidden permanent application sizing model. An unfinished gesture's requested value
returns to its start; current/default snapshots remain available for explicit application
handoff. Handle role/tabstop/range and helper collapse flags are released, and the authored
hidden handle returns. Caller styling overrides remain when no longer helper-owned.

Bind a new owner explicitly after teardown if needed. Pane IDs/anatomy stay fixed for a
lifetime. Unsupported changes/errors do not silently overwrite application content.

## Complete mapping and accepted steps

[Reference inventory](../naive-ui/components/split.md): **19 original identities +
10 explicit source supplements = 29 rows: 19 adapted native capabilities + 10 omissions**.
Every original section/member/kind/pinned-line identity remains in order.

Retained adaptations cover size/default/min/max units, physical direction, disabled
resizing, native pane classes/CSS, handle size, pointer lifecycle/user size events and
all three authored pane/handle slots. Explicit omissions are watch-props, Vue prop/type/
slot-function aliases, source onUpdateSize callback alias, unused default-slot declaration,
the source string & number callback type and theme/themeOverrides/builtinThemeOverrides.
No inherited source identity is silently discarded or promoted as full framework parity.

1. [x] Preserve pinned original identity and native pane/control ownership.
2. [x] Implement pointer and keyboard parity, bounds and safe collapse/reveal.
3. [x] Validate actual native geometry/scale, suspension and lifecycle.
4. [x] Targeted + complete P5 regressions, browser acceptance, build/budgets and phase audit.

## Measured acceptance — 2026-09-10

Split/layout targeted coverage: **98 tests** (48 Split, 12 Grid, 11 Layout, 27 native).
The final retained P5 gate ran the ten P5 component test files plus Grid/Layout/native:
**526 tests passed across 13 files**, including **476 P5 tests**. `pnpm build` passed
declarations, independent assets and every old/new budget. No dependency was installed.

Chromium **151.0.7922.174**, dedicated local Split tab, with original other tabs untouched.

| Actual browser acceptance | Result |
| --- | --- |
| Native content-box geometry | 1,152px root minus 4px borders, 24px padding, 12px handle and 8px gaps = 1,104 usable; first/second panes exactly 552px |
| Keyboard | ArrowRight grew 552 -> 562px; Shift+ArrowRight -> 662px; separator controlled the named first pane |
| Real drag | 240px preference + 70px pointer movement = actual/requested 310px; original pane/input/edit retained; capture released |
| Escape/lost capture/disable | Restored gesture-start size, ended once and released capture; disabling did not disable native fields |
| RTL | First pane on right; ArrowRight reduced 240 -> 230px |
| Vertical | Horizontal separator, 12px handle; first pane actual 240px height with 352px usable block space |
| CSS zoom 2 | 40 visual px movement became 20 CSS px: 150 -> 170px; pane rect 340px with CSS width 170 |
| Positive 2D scale | scale(1.1,1.2) retained ratio .5; measured ratio .49999993 |
| Unsupported rotation | rotate(5deg) explicitly failed closed to static panes, with hidden noninteractive handle |
| Collapse/forms | Pane hidden/inert, required title not disabled; real FormData still contained empty title and native validity stayed false |
| Explicit validation reveal | Revealed the first invalid pane, focused title-field and reported native invalidity |
| Infeasible mixed bounds | Native stacked rows measured 383.391/340.781px; 4px separation, no overlapping visible content |
| Hidden/narrow | Desired 240px survived hidden state; at 320px viewport, 305px document, effective 225px clamp with second pane collapsed |
| Print round-trip | Connected owner suspended for print/block layout, retained 240px preference, resumed exact 240px screen pane afterward |
| Media | Forced-colors/reduced-motion matched; no custom drag animation/global cursor override |
| Keyboard-only fallback | Missing capture API: pointerSupported=false, normal cursor, ArrowRight still moved 10px |
| No JavaScript | Both panes/fields visible, handles hidden with no role/tabindex; native FormData and field reset worked; 305px document |
| Handoff | Original pane/input/value remained; hidden/inert/range/geometry tokens released; no removed data restored |
| Coexistence | Original native nodes survived later core/advanced/widgets; legacy code remained usable; no mui-split registration; classic ownership/namespace replacement rejected |

The final pointerup/coalesced sample, invalid settings, reentrant cancellation, failed
capture, observer removal, IDs and canceled queued work also have deterministic regressions.
Review fixed max-content suspension (preventing overlap), native print lifecycle and
honest keyboard-only cursor behavior. Measurements are not performance/AT/all-browser
or arbitrary transform/layout parity claims.

### Payload and previous assets

gzip uses build level 9.

| Asset | Bytes | gzip bytes | gzip ceiling |
| --- | ---: | ---: | ---: |
| Split ESM | 16,278 | 6,169 | 8,000 |
| Split classic | 16,555 | 6,311 | 8,000 |
| Split CSS | 3,198 | 773 | 1,500 |
| Existing core | 62,558 | 14,611 | 15,000 |
| Existing advanced | 6,554 | 2,181 | 3,000 |
| Existing widgets | 10,858 | 2,779 | 4,000 |

Combined ESM + CSS: **6,942 gzip bytes**; classic + CSS: **7,084**.
All **199 prior top-level JS/CSS assets byte-match**. Sorted filename + NUL + content
SHA-256: `94ec441bda85571958c1608b64cc73452c05ed446c61101b4f69b5d2080b4cfb`.
No prior component/helper source or ceiling changed; generated dist follows existing policy.
All **519 scoped Split/reference/index/master relative file links** resolve.

## P5 retained-scope closure

The [master audit](../naive-ui/migration-plan.md) checked every row in all ten P5-assigned
inventories: **827 rows = 349 adapted + 478 omitted + zero unresolved**, with **40/40**
component tasks accepted. All ten retained scopes are complete, not full upstream parity.
Catalog: **3,915 rows / 320 of 384 tasks / 80 accepted pages / 64 unchecked**.

Remaining: P0 Config Provider, Element, Global Style; P6 Carousel, Watermark, Upload,
Calendar, Countdown, Number Animation, Time, Heatmap, Marquee; explicit Equation, QR Code,
Legacy Grid and Legacy Transfer exclusions. Resolve the narrow native CSS theme/context
and element/global-style contracts before P6 where useful, without recreating a provider
framework. No next component is implemented in this commit.
