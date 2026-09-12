# 3. Card Element Contract

**Historical planning record.** Card and all six region classes now extend the thin
shared `ViewElement` with direct typed APIs. The authoritative usage and API reference
is the [Card demo](../../../demo/components/card.html). The unresolved decisions below
record the original draft, not the implemented finite contract.

Group related content and supporting regions on one surface.

**Draft.** Web `Card : ViewElement`; element: `m-card`.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `size` | `small`, `medium`, `large`, `huge` / `medium` | `size` | Region spacing/title scale. |
| `bordered` | boolean / true | `bordered` | Standard boundary. |
| `closable` | boolean / false | `closable` | Expose Close. |
| `closeFocusable` | boolean / true | `close-focusable` | Close affordance in sequential focus. |
| `closeLabel` | string / `Close card` | `close-label` | Accessible close name. |
| `hoverable` | boolean / false | `hoverable` | Noninteractive hover emphasis. |
| `embedded` | boolean / false | `embedded` | Embedded-surface treatment. |
| `segmented` | boolean or policy (unresolved) / false | `segmented` and region attributes (pending) | Separate regions. |
| `contentScrollable` | boolean / false | `content-scrollable` | Scroll constrained content independently. |

## 2. Content Model

Each named region allows zero or one content fragment.

| Region | Content | Web element |
| --- | --- | --- |
| `cover` | Display content. | `m-card-cover` |
| `header` | Heading and supporting content. | `m-card-header` |
| `headerExtra` | Supporting controls/content. | `m-card-header-extra` |
| `content` | Any allowed control content. | `m-card-content` |
| `footer` | Supporting content. | `m-card-footer` |
| `action` | Actions. | `m-card-action` |

## 3. Behavior

| Trigger | Result |
| --- | --- |
| `Close(reason/source)` while closable | Emit one cancelable `CloseRequested`; retain the Card. Dismissal belongs to the application. |
| Free-form children | Adopt into the content region without cloning. |
| Explicit header/content arrives | Replace generated region wrappers, preserving their surviving authored content. |
| Region visibility changes | Segment by visible logical region order. |
| Reconnect | Retain authored regions; do not duplicate close controls. |

No additional application state. Hover, focus and scrolling are renderer states.

## 4. Rendering and accessibility

Web uses registered Light-DOM regions; native targets use content properties/containers.
Card does not automatically become a landmark or heading. Authors supply context-appropriate
names, headings and roles; the close action is named.

Surface color, radius, elevation, spacing and separator paint are theme/style values.

## 5. Decisions

| Resolve before approval | Detail |
| --- | --- |
| Segmentation | Exact policy type, region flags and conflict rules. |
| Content | Region ordering/duplicate handling, `headerExtra` ownership and whether a concise title property belongs in the contract. |
| Close intent | Typed context, Web event mapping and what canceling an application-owned request prevents. Define label localization/empty-value handling. |

Card and its region classes use direct typed APIs; `Card` registers as `m-card`.

## References

- [Previous implementation and API comparison](../components/card.md)
- [Default-style comparison](../styling/components/card.md)
