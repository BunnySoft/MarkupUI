# Dropdown: authored command menus

**🟢 Verified for the retained native command-menu scope.**
This is more than a floating list: enabled-item roving focus, directional navigation,
Home/End, typeahead, native activation, submenu intent, Escape and untrapped Tab are
implemented over the existing Popover controller. There is no option renderer or app store.

**Default-style audit: 🟢 surface, density and state colors fixed / 🟡 renderer-specific
column/artwork limits retained.** See the [rendered report](../style-audit/components/dropdown.md)
for the coordinated base reuse, light/dark/inverted comparisons and keyboard checks.

## Distribution and markup

| Asset / export | Purpose |
| --- | --- |
| `@dataengine/markup-ui/dropdown` | `createDropdown`, `DropdownController`, `DropdownOptions`, `DropdownSelection`, `DropdownPlacement` |
| `dist/markup-ui-dropdown.js` | Standalone ESM, including reused native Popover code |
| `dist/markup-ui-dropdown.global.js` | Classic `window.MarkupUIDropdown.createDropdown`; refuses namespace replacement |
| `@dataengine/markup-ui/dropdown/style.css` | Complete `dist/markup-ui-dropdown.css`, build-composed with maintained Popover CSS |
| `src/components/dropdown/keyboard.ts` | Internal scoped roving/typeahead primitive, prepared for the next real Menu consumer; no roles, activation or positioning engine |
| `demo/components/dropdown.*` | Separate authored HTML, application JS and external CSS |

```html
<link rel="stylesheet" href="./vendor/markup-ui-dropdown.css">
<script defer src="./vendor/markup-ui-dropdown.global.js"></script>
<script defer src="./dropdown-setup.js"></script>

<button type="button" id="actions" popovertarget="action-menu">Actions</button>
<ul class="mui-popover mui-dropdown" data-dropdown-menu id="action-menu"
  popover="auto" aria-label="Document actions">
  <li><button type="button" data-dropdown-item data-dropdown-key="edit">Edit</button></li>
  <li><button type="button" data-dropdown-item data-dropdown-key="locked" disabled>Unavailable</button></li>
  <li><a href="#preview" data-dropdown-item data-dropdown-key="preview">Preview</a></li>
  <li data-dropdown-divider></li>
  <li>
    <button type="button" data-dropdown-item data-dropdown-key="more" popovertarget="more-menu">
      More <span data-dropdown-suffix aria-hidden="true">›</span>
    </button>
    <ul class="mui-popover mui-dropdown" data-dropdown-menu id="more-menu"
      popover="auto" aria-label="More actions">
      <li><button type="button" data-dropdown-item data-dropdown-key="rename">Rename</button></li>
    </ul>
  </li>
</ul>
```

```js
// dropdown-setup.js; named ESM import is an alternative.
const dropdown = window.MarkupUIDropdown.createDropdown(
  document.querySelector("#actions"),
  document.querySelector("#action-menu"),
  { value: "edit" }
)
document.querySelector("#action-menu").addEventListener("mui:dropdown-select", event => {
  console.log(event.detail.key, event.detail.item, event.detail.path)
})
// During application teardown, including while closed:
dropdown.disconnect()
```

Authored baseline lists deliberately omit menu roles/tabindex/haspopup. With supported
enhancement, the helper adds role=menu to lists, menuitem to actions, group/separator/none
to structural wrappers, aria-haspopup=menu to invokers and owned roving tabindex. Menu
containers get tabindex=-1 so scroll containers cannot become unintended Tab stops.
Explicit existing compatible roles may be adopted, but **omit them for the promised no-JS
ordinary-list baseline**. Conflicting roles or popup semantics are rejected, not upgraded.

Each panel is a connected same-document light-DOM ul/ol with both classes,
data-dropdown-menu, unique authored ID, popover=auto and explicit nonempty aria-label or
valid aria-labelledby. Each submenu stays in its parent menu's DOM and has exactly one
owned native type=button popovertarget invoker. There are no portals or moved nodes.
Root and submenu commands use the existing Popover registration-free helper; no custom
element, provider, geometry dependency or framework is introduced.

## Items, groups, dividers and keys

- Actions are native type=button buttons or href anchors marked data-dropdown-item.
  Each needs a **nonempty, unique string data-dropdown-key across this root's entire
  hierarchy** and a nonempty label. Numeric keys are not coerced and option objects do not
  exist. Separate Dropdown roots may reuse strings.
- Labels come from data-dropdown-label when provided; otherwise referenced aria-labelledby
  text, aria-label or trimmed textContent. Use an explicit data-dropdown-label when icons,
  suffixes or decorative hidden text would contaminate textContent search. Actual accessible
  names remain authored; the helper does not synthesize labels or promise speech timing.
- Native disabled buttons are visible but skipped by roving/typeahead and cannot select/open
  children. Disabled links are not emulated by stripping href: aria-disabled=true on a live
  link/active control is rejected. Author a native disabled button when a destination/action
  is unavailable. Hidden/inert/CSS-hidden item ancestors are excluded from navigation.
- Menu/group lists have li wrappers. A group is an authored ul/ol[data-dropdown-group]
  with an explicit name, commonly aria-labelledby pointing to a visible
  `[data-dropdown-group-label]`. Group headers/icons are noninteractive, not roving targets.
  A divider is a noninteractive li[data-dropdown-divider], not an action.
- Optional ordinary IDs identify groups/dividers. They are not selectable data keys or
  generated option records. Native hidden governs presentation; authored icons/suffixes stay
  in place. Templates may be cloned by the application before binding; inert templates are
  not evaluated or counted as active items.

Nested interactive roots, input/select/textarea/label/disclosure/embedded controls, tabindex
descendants, editable menu content, widget roles and custom elements/shadow widgets are
rejected inside the retained menu structure. A menuitem is one native action, not a form
container. Check/radio/listbox roles, arbitrary render-option widgets and whole-option
VNode replacement are excluded. Ordinary native button/link handlers remain authored.

## Keyboard, pointer and native activation

| Input | Retained contract |
| --- | --- |
| Root invoker ArrowDown / ArrowUp | Open and focus first / last enabled root item |
| Root native click / Enter / Space | Browser popovertarget activation once; opening focuses first enabled item |
| Up / Down | Previous / next enabled item in this menu, wrapping; skip disabled, hidden, group labels and dividers |
| Home / End | First / last enabled item in this menu |
| Printable key | Case-insensitive NFKC prefix typeahead; repeated characters cycle matches |
| Logical forward arrow | Right in LTR, Left in RTL: open the focused item's submenu and focus first |
| Logical backward arrow | Close the focused submenu and return to its invoker; root horizontal arrows do not traverse an invented menubar |
| Escape | Close the deepest open descendant in this owned path first; keyboard focus inside that menu returns to its invoker |
| Tab / Shift+Tab | Allow native focus to leave; suspend menu tab stops and close the whole root after the native default, without a trap |
| Enter / Space on buttons | Native button activation; no synthesized duplicate click |
| Enter on links | Native anchor activation |
| Space on links | Prevent page scrolling, then issue exactly one native anchor.click on keyup in a subsequent task; anchors otherwise lack Space activation |

Keyboard handlers honor already-prevented events. Put interception in capture/earlier
handlers when overriding menu keys. Ctrl/Alt/Meta, IME/composing/229 events are not consumed;
Shift printable characters participate, Shift+Tab leaves, and modified navigation shortcuts
are not reinterpreted. Typeahead accepts single UTF-16 key values, stores at most 32 normalized
units and resets after typeaheadDuration (500ms default), navigation or hiding. This is not
a locale-specific collator, IME text-entry engine or full grapheme-search implementation.
Changing focus with a pointer click updates roving state; pointer hover alone does not move
keyboard focus. Empty/all-unavailable menus refuse opening rather than inventing an option.

Only submenu invokers have pointer intent: submenuDelay=100ms opens, submenuDuration=150ms
bridges departure. Entering the invoker/panel cancels departure; focus inside a submenu keeps
it open. A hover request does not replace a sibling submenu containing keyboard focus.
Touch hover is ignored. Closing by Escape does not reopen until another pointer entry or
explicit activation. Pointer-opened descendants close before parents on Escape without
stealing existing parent-menu focus. Duration zero removes the deliberate gap grace period.
There is no pointermove polling, triangular safe-area engine or focus-open-on-branch policy.

Root hover/focus triggers are intentionally excluded: the root is a native menu button,
with imperative open requests available. Keyboard support cannot be disabled while retaining
menu roles. Use ordinary authored navigation/disclosure lists without this helper when that
is the desired interaction model.

## Selection and controller

`createDropdown(trigger, menu, options?)` connects while closed. Allowed options are shared
placement/gap/margin/flip/positioning/disabled, submenuDelay/submenuDuration,
typeaheadDuration, and initial value. Root placement defaults bottom; submenus use logical
inline-end `right-start` / `left-start` at binding time, with shared flip/clamp.
Timing values must be finite within 0–60,000. Unknown options, including options arrays,
field aliases, render functions, raw, keyboard=false and trigger modes, throw.
Presentation uses authored CSS classes, not size/inverted prop forwarding.

| API | Contract |
| --- | --- |
| `supported`, `inline`, `connected`, `show` | Native capability, fallback and lifecycle; show is actual root :popover-open state |
| `open()`, `setShow(true)` | Request root opening and first enabled focus; actual boolean result |
| `close()`, `setShow(false)` | Close this owned hierarchy and clear pending work; no fake select event |
| `disabled` | Boolean, closes/refuses interaction without rewriting native item disabling |
| `value` | String leaf key or null; assignment validates membership and updates only a visual selected marker, silently |
| `refresh()` | Close, validate and rebuild bindings from current authored nodes; preserve surviving value/key and node identity |
| `syncPosition()` | Update open panels through shared Popover; false when root is closed/unavailable |
| `connect()`, `disconnect()` | Explicit idempotent lifecycle; reconnect after reinsertion while closed |

Value is a visual current-choice marker (`data-dropdown-selected`), **not** aria-selected,
aria-checked or a checkable command. Branch keys are not values. Hidden-but-existing leaf keys
remain valid; removing a selected leaf or changing it into a branch clears value silently
during refresh. No event is fabricated for property assignment or reconciliation.

Accepted unmodified primary leaf clicks notify `mui:dropdown-select` on the root menu,
with `{ key: string, item: HTMLElement, path: readonly string[], event: MouseEvent }`.
Path includes submenu invoker keys. This is not upstream's numeric-key/raw-option callback
shape or callback-array alias. Notification is noncancelable and occurs in a later task after
synchronous native click handlers finish; late/delegated preventDefault is honored.
Closing listeners run before notification; disposal/rebinding supersedes the notification.

Native href, target, download and native handlers are never replaced. Modified/middle clicks,
downloads and non-self targets are not treated as current-menu selections and are not
prevented. Navigation/dismissal/refresh may supersede a deferred selection notification;
do not use that notification to implement link navigation or assume it runs after a full
document departure. Submenu invoker clicks only toggle children, never select a branch.
Author actions can cancel selection by preventing the original click. The original event's
currentTarget has cleared after dispatch. There is no router or synthesized command event.

## Refresh, ownership and reentrant lifecycle

An observer handles structural/key/label/hidden/disabled/native-action changes within the
authored tree by **closing and refreshing**, rather than diffing a second option model.
Call refresh explicitly after ancestor CSS/direction/layout changes, or when mutating and
immediately issuing a new imperative request in the same task. Direction-dependent submenu
placement is recomputed at refresh; ordinary scroll/resize uses the shared positioner.
Refresh does not automatically reopen. Removed menu focus returns to a safe root invoker;
an unrelated focused control, including one chosen by a closing listener, is preserved.

Invalid explicit refresh throws after cleanup; invalid automatic refresh emits
`mui:dropdown-error` with `{ error }`. Existing shared Popover ownership errors retain
`mui:popover-error`. There are no successful-looking empty defaults for invalid structure.
Shared removal of any owned open panel/trigger disconnects the whole bound tree. Closed
application roots still need explicit disconnect. One Dropdown owns a complete submenu
hierarchy; do not independently bind a second controller to the same child pair.

Native lifecycle listeners can synchronously dispose or refresh. A scoped document capture
listener observes **only this tree's beforetoggle events** so teardown can cancel in-flight
opening. All post-native operations recheck binding identity before restoring tabindex,
moving focus or notifying. Refresh requested during a native transition is deferred until
that transition returns, with a pending opening canceled. This is lifecycle coordination,
not a global keyboard provider. Very early external capture interception that bypasses the
helper must also cancel its own native default when that is its intent.

Roles, haspopup, tabindex, selected markers and Popover-owned controls/expanded/geometry are
restored only while still component-owned. Original IDs, labels, href/target, native attributes,
nodes and listeners remain. Hiding clears typeahead, pointer timers, queued activation/focus
work and active shared geometry resources. Full disconnect also removes connected tree
listeners/observers and restores roles/tabindex. Reopen/refresh epochs prevent old queued
selection or anchor-Space work from acting on a newer submenu session.

## Positioning, styling and fallback

The [Popover geometry contract](popover.md#positioning-styling-and-fallback-boundaries)
is reused. A concrete deep-submenu bug was corrected narrowly: once an anchor's ancestor
is an **open top-layer popover**, outer DOM overflow ancestors no longer clip that anchor.
The nearest open popover's own scroll clip still applies. This allows second/deeper submenu
levels without portals or copied positioning machinery, and keeps all previous ceilings.
Core's older position helper is unchanged.

Native CSS anchors are independently detected; viewport-relative measured fallback handles
flip/clamp, visual viewport and clipping. Geometry CSSOM/CSP limits and explicit refresh for
layout-only changes remain. Arbitrary virtual x/y anchors, vertical writing, transformed
clip polygons, portals, global z-index and automatic outside-click reason callbacks are omitted.

The complete external CSS includes shared surface/arrow/animation/scroll/print/motion rules,
plus menu items/groups/dividers/focus/selected/disabled styling. Four sizes use
`.mui-dropdown--small`, default medium, `--large`, `--huge`; `.mui-dropdown--inverted`
styles the root and inherited submenu appearance. Item-padding/font/hover/selected custom properties cascade
into submenus. Icons and directional suffix artwork remain authored. Raw is not a Dropdown API.

### Audited skin

Normal menus reuse the approved Popover surface rather than duplicating its palette:
3px corners, no border and the corresponding light/dark overlay shadow. Menu padding is
4px vertically, zero horizontally. Item minimum heights are **28/34/40/46px** for
small/medium/large/huge; fonts are **14/14/15/16px**. Minimum height and ordinary inline
text flow preserve wrapping rather than forcing clipped single-line labels.

Native actions are inset 4px on each side, matching the reference's visible state
background bounds. Their actual hit boxes are therefore inset too; Naive uses a full-width
option wrapper with an inset paint layer. Keyboard focus retains a visible inset outline.
Group labels use one pixel smaller text and half the normal leading inset; dividers use
1px height and 4px vertical margins.

Hover/focus, selected and disabled-selected colors now match the pinned normal/inverted
themes. Disabled rows use .5 opacity in light and .38 in dark and do not receive the
ordinary selected fill. Public padding/font/hover/selected and Popover color/background/
radius/border tokens are consumed, not assigned defaults that mask ancestor overrides.
Semantic primary colors come from the existing theme tokens; load the theme stylesheet
or apply the registered theme for full dark semantic colors.

The skin uses `light-dark()` and `color-mix()` for state colors. The explicit theme
attribute selects the local color scheme; modern native-Popover browsers are the tested
target. Author hover/selected overrides can replace those colors. No theme preset or
runtime helper is added.

Icons and suffixes are still authored content, not generated prefix/suffix wrappers.
The library does not reserve empty icon columns or a submenu-arrow column across every
sibling. Complex menus may therefore be narrower than Naive. Its persistent ancestor
“child-active” coloring is also not synthesized from the native leaf-only value marker.
These presentation limits do not change menu ownership or keyboard navigation.

CSS is composed in the existing build, with no runtime relative @import or hand-copied base.
Loading Popover CSS again is unnecessary when complete Dropdown CSS is already loaded.

There is no tag registration or enhanced-before-legacy ordering rule; classic namespaces
reject collisions, and core/helper can load in either order. Standalone JS includes shared
code independently; combined payload accounting must count that duplication.

Without native Popover support, panels become readable native lists/disclosures: no injected
menu roles, roving tabindex, haspopup or custom keyboard behavior. Destinations and native
Tab remain usable; inline selection notification may still be used with JavaScript.
No JS means no enhancement: authored roles should be omitted, native popovertarget disclosure
works where supported, and otherwise lists are inline. Links remain native; arbitrary custom
button callbacks still require application scripting. No hidden dead option tree is created.

## Acceptance — 2026-09-08

- **210 targeted tests pass**: 48 Dropdown, 53 Popover, 42 Tooltip, 40 Popconfirm, 27 native/core.
  Native APIs are mocked in JSDOM, not certified there.
- `npm run build` passes TypeScript/declarations, standalone exports/composed CSS and every
  existing/new budget. No runtime dependency, core/plugin source or previous ceiling changed.
- Chromium: native button/Arrow first/last entry, Up/Down/Home/End, disabled/group/divider skip,
  typeahead/repeated characters, two nested submenu levels, logical close/deep Escape, root
  Tab to the next native form control, Enter once, anchor Space once with href navigation,
  native form safety and preserved authored label nodes.
- Read-only review found stale post-toggle operations after reentrant disposal. Opening
  cancellation, binding-identity checks, deferred transition refresh and notification guards
  were added with regressions. Deep submenu acceptance also found/fixed the real top-layer
  clipping boundary, without a positioning dependency or old-budget increase.

- Final Chromium checks also cover pointer-gap retention without focus theft, pointer-child
  Escape before parent, hidden/disabled focus recovery, opening/closing disposal and deferred
  reentrant refresh, delegated click cancellation and nested Tab departure. RTL logical
  arrows, clipping, edge flip, 320px resize, emulated 2x visual viewport, motion/forced colors/
  print, standalone CSS/JS, both legacy orders, separate realms, native modified-link
  contexts and no-JS ordinary-list destinations were exercised.
- Chromium's accessibility tree exposes a named menu and menu-popup invoker; classic
  namespace collision leaves the preexisting API untouched. Test-created frames/contexts
  were removed, and only the dedicated local-demo tab/server was used.
- Deterministic audit preserves all 69 original owner/name/source identities and resolves
  75 rows (42 adapted targets, 33 omissions). The 96-route catalog has 3,254 rows and
  152/384 accepted tasks, with 15 P3 routes still Planned. All 275 relative file links in
  changed documents resolve; these inventory counts are not full upstream parity.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Dropdown ESM, includes shared controller | 25,121 | 8,726 | 9,000 |
| Dropdown classic, includes shared controller | 25,290 | 8,801 | 9,000 |
| Complete composed Dropdown CSS | 4,969 | 1,465 | 1,750 |
| Popover ESM/classic after clipping fix | 9,461 / 9,626 | 3,927 / 3,997 | 4,000 each, unchanged |
| Tooltip ESM/classic after clipping fix | 12,704 / 12,869 | 4,882 / 4,953 | 5,000 each, unchanged |
| Popconfirm ESM/classic after clipping fix | 16,994 / 17,169 | 6,250 / 6,323 | 6,500 each, unchanged |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One Dropdown JS format plus complete CSS costs **10,191 gzip bytes ESM** or **10,266
classic**. Adding separate Popover JS with only complete Dropdown CSS costs **14,118 ESM**
or **14,263 classic**, honestly counting shared bundled code twice. Existing component CSS
remains unchanged; no old ceiling was increased.

No all-browser,
screen-reader, physical touch/pinch or universal AT certification is claimed.
P2 retained scopes remain complete; P3 remains in progress. **Menu is next, not implemented here.**

### Native Menu keyboard reuse

The subsequent Menu change adds a nonroving mode and native closed-details availability to
the existing keyboard primitive. Dropdown retains its default roving/command behavior and
passes 49 focused regressions. No Popover logic or old ceiling changes. Current Dropdown
ESM/classic are **8,767/8,840 gzip bytes** under the same 9,000-byte ceilings; CSS stays 1,465.
