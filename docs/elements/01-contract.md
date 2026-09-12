# 1. Element Contract model

## Model and naming

| Surface | Responsibility / convention |
| --- | --- |
| Element Contract | Human-readable properties, content and behavior; the portable source of truth. |
| Development API data | Source-generated documentation, loaded by demos/tools only. |
| `ViewElement` | Web implementation base extending `HTMLElement`, not a shared cross-language runtime class. Native targets use their own platform bases. |
| Logical element | Unprefixed PascalCase: `Avatar`, `Button`, `Card`. |
| Web surface | `m-avatar` elements, `m-*` CSS, `--m-*` tokens and `m:*` events. Private markers use `data-part` / `data-state`, without library/control prefixes. |
| Native surface | Host-selected namespace, for example `m:Avatar`. |

Different-language implementations follow the same contract. Platform inheritance and
dispatch mechanics belong in the render profiles.

Keep one folder per element family: concrete TypeScript behavior, CSS, shared types and public
entry points. Add separate controllers only when needed. No `.mkl` runtime or extra provider/
renderer hierarchy is required for the Web migration.

## Page structure

The [development metadata design](../architecture/05-meta.md) describes source extraction.
The runtime does not consult this data when executing properties or methods.

Start each page with purpose, design status and logical/Web identity. Then use:

| Section | Required content |
| --- | --- |
| 1. Properties | Type, default, meaning and Web attribute mapping. |
| 2. Content Model | Named regions, accepted content, cardinality and ownership. |
| 3. Behavior | Actions, emitted events, states and transition rules. |
| 4. Rendering and accessibility | Control-specific semantics, input, styling and capability requirements. |
| 5. Decisions | Selected rules and genuine open decisions. |

Pages inherit the shared rules below; do not repeat them for every element.
Put links to prior implementations, discussions and comparisons in a separate
**References** section after the contract, not in the primary reading path.

## Shared rules

| Area | Rule |
| --- | --- |
| Properties | Typed and bindable unless marked otherwise. Define null/absence, units, ranges and invalid-value handling before approval. |
| Binding | "Bindable" means a binding can supply the property; it does not imply two-way support. Define initialization, application writes and user-driven updates for mutable values. |
| Notifications | Distinguish property/state changes from user intent. Specify event payload, ordering and cancelability, including what cancellation prevents. |
| Content Model | Use logical regions, not "slots" or raw platform tags as the canonical model. Define duplicate-region and invalid-child handling. |
| Identity | Preserve surviving children, keys and application state during incremental updates. |
| Actions | Check availability before transition. Portable action payloads are typed data and host-resolved intent, not executable callbacks. |
| State | Separate logical conditions from renderer-only hover, layout or pending-animation state. |
| Lifecycle | Release renderer-owned resources on disconnect; reconnect without duplicate generated content or loss of authored state. |
| Accessibility | Preserve logical names, roles, focus and relationships with one semantic owner per function. |
| Styling | Control properties express behavior and supported presentation choices; exact colors, arbitrary radii, shadows and margins use theme/style resources. |

Properties such as resource references and selection values are data, not finite visual
choices. Their portable representation must still be specified.

## Approval and authority

Authority runs from **approved individual contract > shared model > applicable render
profile > implementation and its generated API documentation**. Resolve conflicts
explicitly; existing code does not approve a draft.

| Status | Meaning |
| --- | --- |
| Draft | Decisions remain open; not ready to implement as a final contract. |
| Approved | Logical behavior accepted; implementation may still differ. |
| Implemented | Primary renderer implements the approved contract. |
| Validated | Implementation, documentation and acceptance gates agree. |

Classify capabilities as **Keep**, **Rename**, **Render-profile mapping**, **Theme/style**,
**Remove** or **Defer**. Public APIs use direct typed properties and methods;
do not introduce compatibility aliases or a parallel runtime metadata object.

## References

- [Metadata ownership discussion](../archive/architecture/05-meta-background.md)
- [Previous implementation inventory](../archive/architecture/03-inventory.md)
