# 2. Button Element Contract

**Historical planning record.** The Button/ButtonGroup implementation now uses class-owned
ViewElement metadata. The authoritative usage and API reference is the
[Button demo](../../../demo/components/button.html); the draft decisions below are not
the current API. See build acceptance results for payload status.

Request one application or platform action.

**Draft.** Web `Button` and companion `ButtonGroup` derive from `ViewElement`.
Web: `m-button`, `m-button-group`.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `type` | `default`, `primary`, `info`, `success`, `warning`, `error`, `tertiary` / `default` | `type` | Proposed semantic treatment; appearance grouping remains open. |
| `size` | `tiny`, `small`, `medium`, `large` / `medium` | `size` | Named size. |
| `disabled` | boolean / false | `disabled` | Prevent activation. |
| `loading` | boolean / false | `loading` | Pending work; prevent activation. |
| `block` | boolean / false | `block` | Fill available inline size. |
| `bordered` | boolean / true | `bordered` | Standard border. |
| `focusable` | boolean / true | `focusable` | Include in sequential focus navigation. |

## 2. Content Model

| Region | Content / count | Web mapping |
| --- | --- | --- |
| `content` | Label/phrasing content / one region. | Primary Light DOM. |
| `icon` | Decorative or named icon / zero or one. | Named child mapping pending. |
| ButtonGroup `items` | Ordered Buttons / zero or more. | Child `m-button` elements. |

## 3. Behavior

| Action / trigger | Result |
| --- | --- |
| `Activate(payload)` | Perform one native or host-resolved activation when enabled and not loading. |
| Activate while disabled/loading | Do not invoke the action. |
| `Focus(policy?)` | Request native focus when available; exact availability policy pending. |
| Loading starts | Expose busy state without replacing content. |
| Group orientation changes | Re-layout without changing child actions or order. |

Logical states are disabled/loading; normal, hover, press and focus presentation follows
renderer input. Web activation uses ordinary `click`, not a duplicate
MarkupUI event. Logical notification ordering remains open.

## 4. Rendering and accessibility

Use one native interactive owner, not a focusable wrapper around another focusable control.
Content supplies the name; icon-only buttons also need a naming path.
Web may use a button or anchor; native targets use their button primitive.
HTML form submission and native link mechanics belong in the Web profile.

Colors, radii, spinner paint, shadows and motion are theme/style values.

## 5. Decisions

| Resolve before approval | Detail |
| --- | --- |
| Appearance | Resolve semantic tone, appearance and shape as distinct finite choices without overlapping switches. |
| Content and naming | Icon placement/mapping, icon-only cardinality and explicit logical label. |
| Activation | Typed payload, event ordering/cancellation, native submission/navigation and disabled/loading focus policy. Sequential focus exclusion is not necessarily a ban on programmatic focus. |
| ButtonGroup | Define orientation property, default and mapping. |

Button and ButtonGroup expose class-owned `ElementMeta` through `.meta`.
Define the Web form mapping explicitly rather than adding it to the portable behavior.

## References

- [Previous implementation and API comparison](../components/button.md)
- [Default-style comparison](../styling/components/button.md)
