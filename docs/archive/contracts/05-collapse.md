# 5. Collapse Element Contract

**Historical planning record.** Collapse, CollapseItem and the three named region
classes now use direct `ViewElement` APIs over a native disclosure renderer.
The [Collapse demo and API](../../../demo/components/collapse.html) documents current
behavior and pending payload acceptance. The decisions below record the original draft.

Present keyed sections that expand and collapse.

**Draft.** Web `Collapse` and `CollapseItem` use `ViewElement`.
Proposed Web root: `m-collapse`.

## 1. Properties

| Property | Type / default | Web mapping | Meaning |
| --- | --- | --- | --- |
| `expandedKeys` | readonly string collection / authored defaults | Property/binding | Expanded item keys. |
| `defaultExpandedKeys` | readonly string collection / empty | Property/binding | Initial/reset expansion; precedence pending. |
| `accordion` | boolean / false | `accordion` | At most one expanded item. |
| Item `key` | string / required, not bindable | `key` | Stable identity. |
| Item `disabled` | boolean / false | `disabled` | Prevent user header activation. |

## 2. Content Model

| Region | Content / count | Proposed Web element |
| --- | --- | --- |
| `items` | `CollapseItem` / zero or more. | `m-collapse-item` |
| Item `header` | Noninteractive label / exactly one. | `m-collapse-header` |
| Item `headerExtra` | Independent actions/content / zero or one. | `m-collapse-header-extra` |
| Item `content` | Any allowed content / exactly one region. | `m-collapse-content` |

## 3. Behavior

Actions: `Expand`, `Collapse`, `Toggle`, `SetExpandedKeys`, `Refresh`.
Proposed events: `HeaderActivated`, `ExpandedChanged`, `Error`.
The group owns expansion; each item is expanded/collapsed and optionally disabled.

| Trigger | Result |
| --- | --- |
| Header activation | Toggle its item unless disabled. |
| Accordion expansion | Collapse the previously expanded sibling. |
| Content closes with focus inside | Move focus to a safe visible header. |
| Items change | Preserve keyed expansion and surviving children. |

## 4. Rendering and accessibility

Web may use details/summary internally; native targets may use disclosure controls.
One header owner provides activation and expanded/controls relationships. Extra actions
remain outside that activation owner. Spacing, separators, arrows and motion are theme values.

## 5. Decisions

| Resolve before approval | Detail |
| --- | --- |
| Expansion writes | Initialization/default precedence, two-way updates, unknown/duplicate keys and accordion conflict policy. |
| Actions/events | Parameters, disabled-item application actions, event detail/order/cancellation and error policy. |
| Reset/authoring | Whether to expose Reset for `defaultExpandedKeys`; scalar markup convenience and authored defaults. |

Use named `m-*` regions and class-owned metadata; native disclosure mechanics remain
inside the Web renderer.

## References

- [Previous disclosure implementation](../components/collapse.md)
- [Default-style comparison](../styling/components/collapse.md)
