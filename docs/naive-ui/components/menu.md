# Menu

**Plan: Planned. Current baseline: partial flat core menu; not parity-verified.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) tracks value, item selection and arrow/Home/End movement for direct children.

- **HTML:** real links for site navigation; native buttons for command menus.
- **JS:** distinguish navigation/menu semantics, stable keys, roving focus, typeahead and optional nested expansion.
- **CSS:** external horizontal/vertical, collapsed and selected states.
- **Placement:** proposed `src/components/menu/`; complex nested menu stays optional.

## Acceptance and gaps

Test disabled items, nested groups, focus after collapse/reorder and RTL. The existing all-enabled-items tab stops and fixed role choices need review before verification.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🔵 Planned.
**Prerequisites:** P1 native actions and P3 roving-focus/typeahead contracts in the [master plan](../migration-plan.md).
**Next task:** distinguish site navigation from command-menu semantics before extending the flat menu.

1. [ ] **Define keyed item anatomy.** Preserve links/buttons and map group/divider/disabled records to authored structure.
2. [ ] **Complete keyboard behavior.** Specify one tab entry, typeahead, direction-aware movement and focus after collapse.
3. [ ] **Stage nested display.** Resolve expanded/default keys, collapsed labels and optional submenu floating without router props.
4. [ ] **Verify item mutations.** Test removal/reorder, nested disabled groups, horizontal/vertical layouts and programmatic selection without duplicate events.

### Native primitives and fallback

- **Native path:** normal links/buttons in authored lists; native templates optionally repeat keyed items. Navigation stays native unless a true command-menu interaction contract is approved.
- **Small enhancement:** a light-DOM custom element owns roving focus/typeahead only where needed and releases listeners on disconnect. CSS flex/grid/logical properties handles orientation. Feature-detect optional popover submenus; visible nested lists or details/summary remain the fallback rather than a menu/router framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/menu)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **48 local table rows + 0 supplementary declarations + 0 inherited rows = 48 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

Referenced public component types (composition, not automatic API inheritance): [Dropdown](dropdown.md). Opaque types without local member definitions remain unreviewed.


### Menu Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`accordion`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `accordion`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`children-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `children-field` attribute or JS `childrenField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L33) | Prop | Candidate `collapsed-icon-size` attribute or JS `collapsedIconSize`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed-width`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `collapsed-width` attribute or JS `collapsedWidth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `collapsed`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-expand-all`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate native default/reset state for `default-expand-all`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-expanded-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate native default/reset state for `default-expanded-keys`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate `disabled-field` attribute or JS `disabledField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dropdown-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate explicit JS `dropdownPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`dropdown-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate explicit native-child configuration for `dropdown-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`expanded-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate JS `expandedKeys` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`expand-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate authored `expand-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L44) | Prop | Candidate `icon-size` attribute or JS `iconSize`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`indent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `indent` attribute or JS `indent`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`inverted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L46) | Prop | Candidate presence attribute `inverted`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`key-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L47) | Prop | Candidate `key-field` attribute or JS `keyField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-field`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L48) | Prop | Candidate `label-field` attribute or JS `labelField`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate JS `options` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`node-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L50) | Prop | Candidate explicit native-child configuration for `node-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`mode`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L51) | Prop | Candidate `mode` attribute or JS `mode`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L52) | Prop | Candidate authored `render-extra` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L53) | Prop | Candidate authored `render-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`render-label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L54) | Prop | Candidate authored `render-label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`responsive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate presence attribute `responsive`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`root-indent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L56) | Prop | Candidate `root-indent` attribute or JS `rootIndent`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L57) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 flat selected string value; partial only, verify this row. |
| [`watch-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L58) | Prop | Candidate explicit native-child configuration for `watch-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:expanded-keys`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L59) | Callback | Candidate DOM `mui:change:expanded-keys` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L60) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MenuOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`children?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L66) | Record field | Candidate plain-JS `children?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L67) | Record field | Candidate plain-JS `disabled?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`extra?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L68) | Record field | Candidate authored `extra?` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L69) | Record field | Candidate authored `icon?` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L70) | Record field | Candidate plain-JS `key` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L71) | Record field | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L72) | Record field | Candidate plain-JS `show?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MenuGroupOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`children`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L78) | Record field | Candidate plain-JS `children` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L79) | Record field | Candidate plain-JS `key` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L80) | Record field | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L81) | Record field | Candidate plain-JS `show?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L82) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### MenuDividerOption Properties

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`key`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L88) | Record field | Candidate plain-JS `key` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L89) | Record field | Candidate explicit native-child configuration for `props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L90) | Record field | Candidate plain-JS `show?` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L91) | Record field | Candidate plain-JS `type` field; value shape/ownership not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Menu Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`deriveResponsiveState`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L97) | Method | Candidate plain-JS `deriveResponsiveState` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`showOption`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/menu/demos/enUS/index.demo-entry.md#L98) | Method | Candidate plain-JS `showOption` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
