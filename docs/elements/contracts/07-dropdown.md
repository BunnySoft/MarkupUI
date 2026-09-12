# 7. Dropdown Element Contract

Present a temporary hierarchy of commands or navigation destinations.

**Draft.** Web `Dropdown : ViewElement`, with `DropdownItem`, `DropdownGroup`, `DropdownDivider`.
Proposed Web root: `m-dropdown`.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `value` | string or null / null | `value` | Selected leaf key, when selection is enabled. |
| `disabled` | boolean / false | `disabled` | Prevent opening and commands. |
| `placement` | Logical enum (pending) / `bottom` | `placement` | Preferred placement. |
| `submenuDelay` | duration / 100ms | `submenu-delay` | Pointer opening delay. |
| `submenuDuration` | duration / 150ms | `submenu-duration` | Pointer departure grace. |
| `typeaheadDuration` | duration / 500ms | `typeahead-duration` | Typeahead timeout. |

## 2. Content Model

| Region/control | Content / count | Proposed Web mapping |
| --- | --- | --- |
| `trigger` | Activatable control / exactly one. | `m-dropdown-trigger` or reference (pending). |
| `menu` | Items, groups, dividers / one root. | `m-dropdown-menu` |
| `item` | Label, icon, suffix, optional submenu / zero or more. | `m-dropdown-item` |
| `group` | Named items / zero or more. | `m-dropdown-group` |
| `divider` | Noninteractive separator / zero or more. | `m-dropdown-divider` |
| Item template | Scoped item content / zero or one. | Native template adapter. |

## 3. Behavior

Actions: `Open`, `Close`, `Toggle`, `Select`, `Refresh`, `SyncPosition`.
State is open/closed/disabled; items may be focused, selected, disabled or submenu-open.
Opening/closing transitions may be renderer state.

| Trigger | Result |
| --- | --- |
| Open | Validate, show root menu, focus an enabled item according to input reason. |
| Arrow/Home/End or printable input | Scoped roving focus or bounded typeahead among available items. |
| Submenu intent | Open the owned submenu without moving/cloning content. |
| Leaf activation | Preserve native action/navigation; selection, cancellation and closing order pending. |
| Tab / Escape | Allow native Tab departure; Escape closes the deepest menu first and restores safe focus. |
| Content changes | Revalidate, preserving surviving keyed identity. |

Events: `SelectionRequested` (key, item, path, source), `OpenChanged` (actual state, reason),
and `Error` (validation/positioning failure). Exact dispatch semantics remain open.

## 4. Rendering and accessibility

Use one semantic owner per menu, item and relationship. Disabled destinations must actually
block activation, not merely expose accessibility state. Web may use Popover and named
native actions; native targets use menus/flyouts.

Declare submenu, positioning, typeahead and virtual-anchor capabilities/fallbacks.
Paint, density, padding, icons, suffixes, shadows and motion are theme/style values.

## 5. Decisions

| Resolve before approval | Detail |
| --- | --- |
| Item/selection model | Keys, commands versus navigation, selection enablement, value writes and two-way notifications. |
| Events/actions | Typed parameters, cancellation and action/notification/close order; whether `SyncPosition` is Web-only. |
| Types/content | Placement tokens, duration units/ranges, trigger mapping and item/template ownership. |

Use logical element/item contracts and shared templates. Keep DOM-specific validation and
Popover mechanics in the Web renderer.

## References

- [Previous menu implementation](../../archive/components/dropdown.md)
- [Default-style comparison](../../archive/styling/components/dropdown.md)
