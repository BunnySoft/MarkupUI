# Menu: native navigation and disclosure

**🟢 Verified for the retained native navigation scope, not an ARIA command menubar.**
This Menu is a named nav containing authored links/buttons and details/summary branches.
Selection/current-choice, expanded keys, accordion, collapse and vertical/horizontal shortcuts
are useful behavior, but normal native Tab order and navigation semantics are preserved.
For a popup command menu with menuitem roles/roving Tab, use [Dropdown](dropdown.md).

## Loading and authored hierarchy

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/menu` | `createMenu`, `MenuController`, `MenuOptions`, `MenuMode`, `MenuSelection` |
| `dist/markup-ui-menu.js` | Standalone ESM |
| `dist/markup-ui-menu.global.js` | Classic `window.MarkupUIMenu.createMenu`; refuses to overwrite an existing namespace |
| `@dataengine/markup-ui/menu/style.css` | Independent `dist/markup-ui-menu.css` |
| `src/components/menu/` | Native controller and external CSS |
| `demo/components/menu.*` | Separate native HTML/CSS/JS examples |

```html
<link rel="stylesheet" href="./vendor/markup-ui-menu.css">
<script defer src="./vendor/markup-ui-menu.global.js"></script>
<script defer src="./menu-setup.js"></script>

<nav class="mui-menu" data-menu data-menu-mode="vertical" id="documentation"
  aria-label="Documentation">
  <details data-menu-collapse open>
    <summary>Browse documentation</summary>
    <ul data-menu-list>
      <li><a data-menu-item data-menu-key="home" href="./index.html" aria-current="page">Home</a></li>
      <li><details data-menu-branch data-menu-key="guide">
        <summary>Guide</summary>
        <ul data-menu-list>
          <li><a data-menu-item data-menu-key="install" href="./install.html">Installation</a></li>
          <li><button type="button" data-menu-item data-menu-key="preview">Preview locally</button></li>
        </ul>
      </details></li>
      <li data-menu-divider data-menu-key="divider"></li>
      <li><button type="button" data-menu-item data-menu-key="unavailable" disabled>Unavailable</button></li>
    </ul>
  </details>
</nav>
```

```js
// menu-setup.js; alternatively import { createMenu } from "@dataengine/markup-ui/menu".
const menu = window.MarkupUIMenu.createMenu(document.querySelector("#documentation"), {
  defaultValue: "home",
  defaultExpandedKeys: ["guide"],
  accordion: true
})
menu.showOption("install") // Reveal native ancestors; no router or target focus.
// During application teardown:
menu.disconnect()
```

The helper registers no tags and has no enhanced-before-core requirement. Legacy mui-menu
retains its old flat behavior unchanged; binding this native helper inside legacy mui-menu
is rejected. Other registered components keep their own registration rules.
Classic and ESM are alternative entries, not two controllers for the same root.

The root must be connected same-document light-DOM `nav.mui-menu[data-menu]`, with an explicit
nonempty aria-label or valid aria-labelledby. Menu/menubar/widget roles are rejected: the
helper does **not** invent menuitem, aria-selected, checked state, a trap or reduced Tab order.
A nested independent nav[data-menu] is an explicit ownership boundary.

There is exactly one root ul/ol[data-menu-list], directly in nav or its optional direct
details[data-menu-collapse]. Each details[data-menu-branch] has its first native summary
and one direct child data-menu-list. Group ul/ol[data-menu-group] contains native li children
and an explicit name; a visible data-menu-group-label can provide aria-labelledby.
Dividers are noninteractive li[data-menu-divider].
Every item/branch/group/divider has a unique nonempty **string** data-menu-key in this root.
Group/divider keys identify structure, not selectable controls.

Leaves are real href anchors or type=button buttons. Branch controls are real summaries,
not spans with synthetic tab stops. Native disabled buttons are skipped; native inert
branches make their whole subtree unavailable with the browser's own semantics (including
removal from the accessibility tree). Do not fake a disabled live link/summary using
aria-disabled alone; use a native disabled alternative or explicit inert/hidden structure.
The helper does not strip href or disable arbitrary browser actions.

Items/summaries require nonempty labels and cannot contain nested controls, forwarding
labels, editors or custom/shadow widgets. Existing trusted text, icons, extras, listeners
and inert templates stay authored. Templates may be instantiated before binding; there is
no parser/renderer, generated option tree, mandatory Icon/Tooltip or unsafe HTML assignment.
For icon/extra-rich labels, provide data-menu-label with plain typeahead text. Otherwise
label lookup uses referenced ARIA text, aria-label, then trimmed textContent.

## Selection, expansion and defaults

Allowed setup options are mode, value/defaultValue, expandedKeys/defaultExpandedKeys,
defaultExpandAll, collapsed, accordion and typeaheadDuration (500ms default, finite 0–60,000).
Unknown options and wrong scalar/key types throw. Native string DOM keys are not numeric/
object options or framework-prop aliases.

| API | Contract |
| --- | --- |
| `connected` | Explicit helper lifecycle |
| `value` | String leaf key or null; assignment validates membership and silently updates a visual data-menu-selected marker |
| `expandedKeys` | Snapshot of actual open branch keys; assignment validates unique existing keys and updates native open state |
| `collapsible`, `collapsed` | Whether an authored overall disclosure exists, and its actual closed state; setter requires that anatomy and a boolean |
| `mode` | Live `"vertical"` / `"horizontal"` data-menu-mode CSS and shortcut policy; no node reordering |
| `accordion` | Live boolean, root-level branch exclusivity |
| `showOption(key = value)` | Expand a valid item's native ancestors/overall disclosure; boolean availability result, no route/selection change |
| `refresh()` | Revalidate/rebind current authored structure while preserving surviving native state, key value, nodes and focus |
| `connect()`, `disconnect()` | Idempotent explicit lifecycle; reinsert before reconnecting |

Initial value takes precedence over defaultValue; absent both, value is null. Initial
expandedKeys takes precedence over defaultExpandAll, then defaultExpandedKeys. When no
expansion option is supplied, authored native open attributes are the initial state.
Selection alone does **not** automatically expand ancestors; showOption is the explicit
reveal operation. Defaults are consumed once, never watched or replayed by refresh/reconnect.

Exactly one root branch may be requested under accordion. Contradictory default-expand-all/
multiple-root-key requests throw rather than silently claiming all are expanded.
Nested branch flags remain independent, even when latent beneath a closed ancestor.
defaultExpandAll includes eligible branches; explicitly expanding hidden/inert branches is
rejected. Unknown showOption keys throw; no current key or hidden/inert target yields false.
Showing a branch key reveals its summary, not implicitly all its children.

Accordion uses a per-root generated native details name when supported, with a small
open-mutation fallback that honors the latest actual opening. Managed branches must be
unnamed initially; there is no cross-application name/provider service. Only root-level
branches compete, matching the inspected source boundary; nested expansion is not erased.
Temporary generated names are restored on teardown.

**Native open state persists on disconnect.** It is browser/application disclosure state,
like a native control value, not temporary styling to roll back. Existing expanded branches
and overall collapsed state remain usable after the helper leaves. This is intentional,
not a claim that each native state change is a component-owned attribute to restore.

## Native notifications and activation

`mui:menu-select` is a noncancelable notification on the root after an accepted unmodified
primary leaf click. Detail is `{ key: string, item: HTMLElement, path: readonly string[],
event: MouseEvent }`; path contains ancestor branch keys. It is not the upstream raw option
object/numeric callback shape. Programmatic value/expansion changes never fabricate this event.

Selection processing waits for a subsequent task so synchronous target/delegated
preventDefault is honored. Normal native href/target/download/modifier behavior remains.
Modified/middle clicks, downloads and non-self targets do not change current selection.
Routine successful refresh preserves an accepted click only when the same leaf node/key
survives and remains eligible, rechecking current target/download and deriving its current
path. Disconnect, invalid structure, changed key/node or canceled/unavailable action cancels it.
Full navigation may end the old document before notification; native href is the navigation
mechanism, not a callback/router substitute.

`value` is only a visual selected-choice marker. **aria-current remains author/navigation
state**, never a generic selected/checked marker. Selecting another item does not claim that
the current page changed, update history, follow an extra URL or duplicate an action.
Native button actions retain type=button and do not submit enclosing forms.

For expansion observe the disclosures' native **toggle** events and read expandedKeys.
Native events are asynchronous/coalesced and also occur for programmatic open changes.
No custom “user expansion” callback is synthesized, and no silent-Vue-event equivalence
is claimed. Native defaultPrevented summary clicks remain native; no click/keydown
activation handler double-toggles a summary or button.

## Keyboard, orientation and native collapse

The existing [Dropdown keyboard primitive](../../src/components/dropdown/keyboard.ts) is
reused in **nonroving mode**. It gains only a concrete native-details availability check
and the ability not to write tabindex. Dropdown's existing roving default stays unchanged.
No positioning, popup controller or global keyboard listener is imported for this Menu.

| Input | Native-navigation shortcut |
| --- | --- |
| Tab / Shift+Tab | Ordinary native focus order through summaries, links and buttons, including expanded children; no trap or automatic closure |
| Enter | Native link/button/summary activation once |
| Space | Native button/summary activation; on ordinary links it remains browser scrolling, unlike an ARIA menuitem |
| Up / Down in a vertical level | Previous/next available control in that level, wrapping; group labels/dividers/disabled entries skipped |
| Home / End | First/last available control in the current level |
| Printable key | Shared NFKC case-insensitive prefix/repeated-character typeahead, explicit plain label metadata where needed |
| Logical forward in a vertical level | Right in LTR/Left in RTL: open a branch and enter its first child |
| Logical backward | Close the focused open branch or its parent, returning to the corresponding summary |
| Horizontal root Left / Right | Logical previous/next root control, including groups, without moving DOM order |
| Horizontal branch Down / Up | Open/enter first/last child; descendants use vertical shortcuts |
| Escape | Close the current open branch/parent and return to its summary; at root, close an authored overall disclosure if present |
| Overall summary Down / Up | Open the whole navigation and enter first/last root control |

Already-prevented events, Ctrl/Alt/Meta and composing/229 input are not consumed. Shift
printable keys remain typeahead; Tab is never prevented. Search is a bounded single-UTF-16
keydown prefix facility, not a locale-specific collator or IME/grapheme input engine.
For levels without an applicable branch shortcut, normal browser behavior remains.

Both modes are **in-flow navigation**. Horizontal mode wraps with CSS; expanded native
disclosures may increase row height. This is not a popup menubar, icon-only collapsed rail,
automatic overflow packing or a hidden “more” menu. Those Dropdown/provider/renderer
capabilities are explicitly omitted rather than pulling a framework into native navigation.

Overall collapse closes a real details element and leaves its meaningful summary visible.
It can be used in either retained layout, deliberately differing from upstream's
vertical-only icon-rail collapse. Compact CSS reduces spacing; it never hides labels while
leaving invisible targets focusable. Programmatic collapse that hides current focus repairs
it to the appropriate visible summary, not to a new selected destination. showOption does
not deliberately focus the requested leaf, though accordion may require repairing focus
hidden by a competing closure.

## Refresh, ownership and CSS

Authored structural/key/label/hidden/disabled changes revalidate and rebind automatically.
Native open mutations update actual state/accordion without rebuilding the hierarchy.
Explicit refresh also adopts changed data-menu-mode; use the mode property for immediate
live changes and refresh after external CSS/direction changes.
Open state is not reset, surviving value is retained, and removed values clear silently.
After refresh, keyboard memory follows a still-focused node; lost focused items fall back
to a surviving ancestor summary or a usable root control.

An outside pointer/focus interaction clears this menu's focus-repair claim; unrelated
controls are not refocused. Each root owns its own listeners, queued selections and
observers. Root removal disconnects automatically; normal application teardown should still
call disconnect. Nested independent nav roots remain isolated; an external surrounding
disclosure/application owns its own visibility/focus policy.

Invalid explicit refresh throws after cleanup. Invalid automatic refresh emits
`mui:menu-error` with `{ error }`. Duplicate active root ownership is rejected; disposing an
old controller cannot release a replacement owner's claim. Failed/disposed bindings do not
later deliver queued selection or rewrite detached nodes.

Teardown restores only still-owned data-menu-mode, selected markers and generated accordion
names. It never changes author aria-current, href/target, roles, native tabindex, label nodes,
templates or listeners. Native open persists as documented; no pre-upgrade/renderer bridge exists.

External CSS supplies logical root/branch indentation, item/icon/extra sizing, selected/current
styling, inverted/compact presentation and wrapping. Tokens include --mui-menu-indent,
--mui-menu-root-indent, --mui-menu-icon-size, --mui-menu-collapsed-width, item padding and
surface/hover/selected colors. Hidden and inert states retain native behavior; supplied
display rules do not override hidden. Reduced motion/forced-colors/print are included.
Print keeps browser-owned disclosure state and uses ink-friendly styling; no JS print hook
opens branches or promises all-browser disclosure expansion.

There are no geometry or style-text writes, CSS-in-JS, third-party runtime dependencies,
provider/router state or mandatory Icon/Tooltip/Dropdown assets. Menu CSS is self-contained;
shared keyboard code is bundled, not a broken runtime source import.
No-JS keeps native nav, href, Tab and details/summary destinations usable. Accordion options,
selected marker and extra arrow/typeahead shortcuts require the helper; CSS reflow is not
reported as a controlled state callback.

## Acceptance — 2026-09-08

- **113 targeted tests pass:** 37 Menu, 49 Dropdown/shared keyboard, 27 native/core.
  `npm exec vitest run -- tests\menu.test.ts tests\dropdown.test.ts tests\native.test.ts`.
- `npm run build` passes TypeScript/declarations, standalone/classic/CSS exports and all
  existing/new budgets; Popover, core and plugins are unchanged.
- Chromium primary acceptance: native navigation roles/Tab, branch/deep expansion, logical
  arrows/Escape, typeahead, native button once/forms, current-route preservation, showOption,
  root accordion, native collapse, horizontal in-flow navigation and retained node identity.
- Review found lost keyboard memory and canceled selections on routine refresh; both were
  corrected with regressions. Native state coalescing, disabled/removed focus, open persistence,
  replacement ownership and structural errors are covered.

- Additional Chromium acceptance covers label-changing native actions retaining selection,
  current keyboard position after explicit/automatic refresh, programmatic hidden-focus repair,
  native open/route persistence across reconnect, RTL, 320px wrapping, CSS 2x zoom, reduced
  motion/forced colors/print, standalone/classic/ESM in separate realms, both legacy load
  orders, the native-name fallback, Ctrl-click new contexts and no-JS details/href access.
- Chromium's accessibility tree identifies named navigation, not a fake menu. Namespace
  collisions preserve the original API; removed roots disconnect while native open state
  persists. Test-created frames/contexts were removed and the existing 4188 server reused.
- Audit preserves all 48 original owner/name/source identities and resolves 56 rows
  (36 adapted targets, 20 omissions). The 96-route inventory has 3,262 rows and 156/384
  accepted tasks, with 14 Planned P3 routes. All 279 relative file links in changed
  documentation resolve; inventory totals do not claim full upstream parity.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Menu ESM | 16,523 | 5,815 | 6,000 |
| Menu classic | 16,680 | 5,883 | 6,000 |
| Menu CSS | 3,057 | 993 | 1,250 |
| Dropdown ESM/classic after keyboard reuse | 25,256 / 25,425 | 8,767 / 8,840 | 9,000 each, unchanged |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One Menu JS format plus CSS costs **6,808 gzip bytes ESM** or **6,876 classic**.
Dropdown CSS remains 1,465 gzip bytes; Popover/Tooltip/Popconfirm assets and ceilings stay
unchanged. Menu imports only the concrete keyboard/attribute primitives, not a popup engine.

No all-browser, screen-reader,
physical touch/zoom or universal AT certification is claimed. P3 remains in progress.
**Next: Tabs, then Collapse and the remaining P3 inventory.**
