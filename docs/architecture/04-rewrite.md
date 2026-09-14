# 4. Full component rewrite on ViewElement

**Scope: all retained MarkupUI Web UI components, not only Avatar or metadata.**
The first seven-component batch is the initial milestone. Completion is measured against
the current Element Contract and acceptance gates.

## 1. Target architecture

Every retained public Web UI component is an unprefixed class based on `ViewElement`,
registered under its canonical `m-*` name. The class owns direct typed accessors, validation
and behavior. Development documentation is extracted separately from source.

| Surface | Required result |
| --- | --- |
| Implementation | Concrete `ViewElement`-based component and companion/region classes. |
| Properties | Typed accessors, explicit defaults and validation, consistent attribute mapping. |
| Content | Public named elements/regions, clear ownership, preserved authored node identity. |
| Behavior | Explicit actions, events and state transitions; native behavior where appropriate. |
| Lifecycle | Incremental updates, resource cleanup and safe reconnection. |
| Accessibility | One semantic/input owner per function, with correct naming, state and focus. |
| Styling | External component CSS and theme tokens; scoped `data-part` / `data-state` markers. |
| Metadata | Source-generated development data only; no runtime schema lookup or decorator engine. |
| Distribution | Small shared core plus selected component/plugin files; consistent ESM/classic registration and an optional aggregate. |

`ViewElement` remains a small Web base extending `HTMLElement`, not a universal rendering
engine. Keep component-specific behavior in the component. Reuse an existing controller
internally when useful rather than duplicating it or preserving a second public API.
The [development metadata design](05-meta.md) keeps documentation out of the runtime.
The [module delivery design](07-modules.md) ensures consumers do not need the whole library.

## 2. Complete coverage

The [retained element inventory](../elements/03-inventory.md) is the
coverage ledger. Review every retained UI component family, including companions and named
regions; one family may require several classes.

| Surface | Required treatment |
| --- | --- |
| Public Web UI component | Provide the canonical `ViewElement` base, direct API and lifecycle, even when the behavior is mostly CSS. |
| Companion or named region | Define its ownership and public class/region contract. |
| Native mechanics | Keep them inside the implementation rather than exposing a second DOM-anatomy API. |
| Registration | One explicit owner per public element, without competing implementations. |
| Pure service or style resource | Keep its appropriate non-element form; it is not a visual component. |

Do not invent UI classes for services, resources or native composition mechanisms.
The earlier upstream-route mapping is retained separately as reference, not a list of
additional current APIs.

## 3. Source organization and integration

Keep one folder per component family under `src/components`. Retain separate implementation,
CSS, shared types/constants and entry files. Add a separate controller only when its
complexity or reuse justifies it. Do not introduce provider layers or move implementations
to `.mkl`.
Follow the [source ownership pattern](06-source.md); shared output packaging is not a source
reorganization or a reason to duplicate the core in each family.

| Area | Rewrite responsibility |
| --- | --- |
| `src/core/view-element.ts` | Shared Web base, metadata access and proven common property mechanics. |
| Component family folder | Concrete classes, direct accessors, CSS and public entry points. |
| `scripts/component-api.mjs` | Build/demo-only API extraction from source. |
| `src/components/elements.ts` | Canonical registration ownership, not competing old/new implementations. |
| `src/core/api.ts`, `src/index.ts` | Public base and exports aligned with `ViewElement` as consumers migrate. |
| Build/distribution scripts | Correct component assets, generated resources and unchanged acceptance budgets. |

Public UI components use one canonical Web base and API. Remove superseded code
family-by-family after updating its consumers; do not break unrelated components merely
to remove a shared file early. Working style generation and other active services remain
necessary when their functions are still required.

## 4. Rollout

| Milestone | Scope and exit |
| --- | --- |
| Establish the pattern | Complete Avatar/AvatarGroup with direct runtime access, source-generated demo documentation, resources, content and lifecycle; measure actual delivery costs. |
| Complete the first batch | Button, Card, Carousel, Collapse, Divider, Dropdown, one family at a time. Each includes its companion/region classes and integration. |
| Rewrite the remaining components | Continue through every retained family in the inventory. Define contracts and choose dependency-aware order before each task; the first batch is not the endpoint. |
| Close the full rewrite | Reconcile inventory coverage, shared exports, registration, styles and docs; remove remaining superseded component implementations and compatibility paths. |

For each family: read current source and evidence, settle its contract, implement, update
consumers/examples, validate, and record completion before beginning the next family.
Contract, implementation and acceptance status must agree before the next task begins.

## 5. Acceptance and boundaries

Completion requires the approved contract, actual classes, generated documentation, exports,
registration, styles and documentation to agree. Exercise the existing focused fixtures,
browser behavior, lifecycle and accessibility; compare startup, updates, memory and payload
with the current baseline. A class rename or metadata-only change is insufficient.

Keep direct Web authoring free of a duplicate serialized tree or virtual DOM. Do not raise
payload ceilings without explicit approval. Remove superseded implementations and aliases
rather than maintaining backward-compatibility shims: MarkupUI is still in development.

Native-platform implementations, a `.mkl` language and a new full document/binding runtime
are not implied by this Web component rewrite. The native profile remains a contract for
future targets, which use their own platform bases rather than inheriting `ViewElement`.

## References

- [Previous first-batch implementation](../archive/architecture/01-first-batch.md)
- [Previous delivery sequence](../archive/architecture/04-sequence.md)
- [Previous implementation inventory](../archive/architecture/03-inventory.md)
