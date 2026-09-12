# 6. Divider Element Contract

**Historical planning record.** Divider now uses a direct `ViewElement` API with
primary title content and an independent native rule owner. The authoritative reference
is the [Divider demo and API](../../../demo/components/divider.html).
The open decisions below record the original draft, not the implemented behavior.

Separate related content visually and, when requested, semantically.

**Draft.** Web `Divider : ViewElement`; element: `m-divider`.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `orientation` | `horizontal`, `vertical` / `horizontal` | `orientation` | Divider axis. |
| `dashed` | boolean / false | `dashed` | Dashed treatment. |
| `titlePlacement` | `start`, `center`, `end` / `center` | `title-placement` | Optional title placement. |
| `semantic` | boolean / true | `semantic` | Expose separator semantics. |
| `label` | string or null / null | `label` | Optional separator name. |

## 2. Content Model

Optional `title`: zero or one noninteractive text/heading fragment.
Web mapping remains open: primary content or `m-divider-title`.

## 3. Behavior

No actions, control events or interactive state.

| Condition | Result |
| --- | --- |
| Semantic | Expose one separator owner. |
| Decorative | Do not add separator accessibility noise. |
| Orientation changes | Update geometry and semantic orientation. |
| Meaningful heading title | Preserve independent heading semantics; decorative captions do not become headings. |

## 4. Rendering and accessibility

Web may use `hr` or another separator primitive; native targets use separators/borders.
No tab stop or splitter interaction. A heading must remain independently accessible rather
than being flattened into separator semantics.

Color, thickness, length, gaps and typography are theme/style values.

## 5. Decisions

Resolve title mapping, vertical-title behavior and label precedence before approval.
Register `Divider` as `m-divider` with its class-owned metadata.
The internal primitive remains inspectable, but is not the public contract.

## References

- [Previous separator implementation](../components/divider.md)
- [Default-style comparison](../styling/components/divider.md)
