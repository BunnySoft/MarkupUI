# 5. Class-owned ElementMeta

> **Superseded design reference.** Runtime property access no longer depends on metadata.
> See [development metadata](../../architecture/05-meta.md) for the current separation.

**Implemented by the shared core and Avatar family.** The class owns its declarations and
behavior; `.meta` exposes the resulting immutable description. The [core API](../../api/01-core.md)
documents the supported declarations, helpers and validation.

This is a supporting design within the [full ViewElement component rewrite](../../architecture/04-rewrite.md),
not the overall scope of the branch.

## 1. Names and ownership

| Name | Responsibility |
| --- | --- |
| `ViewElement` | Web base extending `HTMLElement`; shared property handling and metadata access. |
| `Avatar` | Concrete element class: declarations and executable behavior. |
| `Avatar.meta` | Static, getter-only access to a cached, immutable metadata snapshot. |
| `ElementMeta` | Plain-data description of a MarkupUI element type, without DOM dependencies. |
| Element Contract | Human-readable requirements against which the implementation is reviewed. |

The element class is the sole maintained source of its runtime declarations.
Do not maintain a separate handwritten definition or another metadata API beside `.meta`.
Current instance values, such as an Avatar's loading state, are not class metadata.

## 2. What is declared and what is reflected

JavaScript reflection exposes member descriptors, not erased TypeScript types or the
meaning of method bodies. Use small standard TypeScript decorators to associate explicit
contract data with the real class and property accessors.

| Information | Source |
| --- | --- |
| Property name | Annotated accessor's actual name. |
| Read-only/writable | Presence of a getter and setter in its property descriptor. |
| Type, nullability, default, enum choices, bounds | One declaration beside that accessor. |
| Web attribute and encoding | The same property declaration. |
| Logical identity and Web tag | Explicit class declaration; never infer identity from minifiable `constructor.name`. |
| Regions, events, capabilities and supported states | Explicit class-level declarations. |
| Public actions | Explicitly declared operations, not every method found on the prototype. |
| Resource handling and state transitions | Ordinary element methods; neither generated nor inferred. |

Defaults for writable inputs belong in the declaration, not a second getter fallback or
field initializer. Computed read-only properties do not require a manufactured default.
Enum lists remain single constants, with TypeScript unions derived from them.
Shared constants may live in `model.ts`; they are not a second element definition.

The initial collector handles class and accessor declarations, not arbitrary field
initializers, source-code strings or getter execution. TypeScript event payload interfaces
remain compile-time contracts. A full runtime payload schema would require an explicit
declaration; the initial reflected event data covers identity and dispatch flags only.

## 3. Collection and validation

| Step | Required behavior |
| --- | --- |
| Declare | Property decorators associate data with getter functions; the class decorator associates identity and non-property declarations with the constructor. |
| Inspect | Read property descriptors without calling accessors. Include only annotated members; implementation methods remain private to the element. |
| Inherit | Collect inherited declarations without modifying them. An explicit override replaces a complete descriptor; incompatible types/mappings and ambiguous duplicates are errors. |
| Validate | Reject missing identity, invalid defaults, duplicate attribute/region names and invalid encodings before registration. Read-only properties are not writable inputs. |
| Cache | Copy declaration data into a deeply immutable snapshot, cached once per constructor. Do not freeze caller-owned input objects in place. |
| Expose | `Avatar.meta` returns that snapshot. Reading it performs no DOM creation, resource loading or lifecycle work. |

Use a small private `WeakMap`-based store keyed by constructors/accessor functions.
Decorators record associations; the collector performs reflection. They need not wrap
constructors or replace accessors. No external reflection package, `reflect-metadata`,
instance-scoped metadata registry or global `Symbol.metadata` polyfill is required.
The compiler emits ordinary JavaScript for the decorators.

Unannotated subclasses may inherit their parent's contract for inspection. A distinct
public element registration must declare its own stable identity/tag. Registration
validates every participating class before defining any of its Custom Elements.
Do not silently merge conflicting declarations or allow later mutation of a cached contract.

## 4. One declaration drives Web behavior

Metadata must remove duplication rather than merely describe a second implementation.

| Surface | Target source |
| --- | --- |
| `observedAttributes` | Declared input attribute mappings. |
| Pre-upgrade property replay | Declared writable property names. |
| Getter defaults | Property declarations. |
| Parsing and validation | Declared kind, nullability, enum/range rules and encoding. |
| Property-to-attribute writes | The same mappings and rules. |
| Event names and flags | Event declarations. |
| Element registration | Class identity and Web tag. |

Keep typed accessors and attribute-backed scalar values. Adapt the existing typed helpers
to read their declaration data; do not introduce untyped property bags, generated public
properties, auto-accessor backing storage or a second per-instance value model.
Changing a value validates first, reflects its supported representation, then invokes the
element's existing incremental update behavior. Invalid values fail explicitly.

Renderer-owned observations, such as live ARIA changes, remain separate from logical input
properties. Property assignment does not fabricate user-intent events. Resource listeners,
content precedence, accessibility, text fitting and disposal stay in Avatar.
Private markers remain scoped `data-part` / `data-state`; public tags and events remain
`m-*` / `m:*`. This refactor does not change the content model or introduce `.mkl`.

## 5. Metadata shape and platform boundary

`ElementMeta` contains stable identity, property descriptions, regions, actions, events,
supported states, capabilities and explicit Web mappings. Property descriptions include
readability/writability and declarative constraints. Region descriptions record ownership
and cardinality; event descriptions record logical/Web names and dispatch flags.

Only plain serializable data belongs in the exposed snapshot: no constructors, DOM nodes,
listeners or validation callbacks. Keep renderer-specific conversion code in the renderer.
Do not serialize `Infinity` as a JSON number: existing unbounded conventions need an explicit
portable representation and a documented Web mapping.

Runtime reflection still requires loading the Web class, which depends on `HTMLElement`.
Metadata inspection does not require constructing that class. Native implementations use
their own platform bases and follow the same element contracts, not the Web base.

If a non-Web consumer later needs metadata without importing Web code, add a build-time
data export from the declarations. That exporter is deferred; do not introduce a browser
or DOM emulator into the normal build merely to read metadata.

## 6. File responsibilities

Keep the existing element-family folders. Avoid a new provider, registry or renderer hierarchy.

| File | Target responsibility |
| --- | --- |
| `src/platform/component.ts` | `ElementMeta`, property descriptions, declaration helpers and collector. |
| `src/core/view-element.ts` | Inherited static `meta` accessor and shared Web property handling. |
| `src/components/avatar/avatar.ts` | Avatar declarations, typed accessors and concrete behavior. |
| `src/components/avatar/group.ts` | AvatarGroup declarations and behavior. |
| `src/components/avatar/model.ts` | Reused types and value constants only; no handwritten element definitions. |
| `src/components/avatar/index.ts` | Public exports and atomic registration using class metadata. |
| `src/components/avatar/global.ts` | Classic entry, with the same public classes and metadata access. |
| `src/components/avatar/avatar.css` | Existing Web presentation; unaffected by metadata ownership. |

Avatar's declarations, exports and registration use this API. Further component families
must migrate their source and public entries together rather than copying the shared runtime.

## 7. Migration and acceptance

| Stage | Exit condition |
| --- | --- |
| 1. Prototype Avatar | Class/accessor declarations produce `Avatar.meta` without creating an instance. Establish compiler output and payload cost first. |
| 2. Remove duplication | Getters, setters, observed attributes, upgrade replay and registration consume the declarations; delete the handwritten Avatar definition. |
| 3. Complete the family | Apply the same mechanism to AvatarGroup and named region classes; remove old definition exports and align classic/ESM entries. |
| 4. Validate | Extend existing fixtures to cover metadata isolation, immutability, invalid/duplicate declarations, inheritance, property behavior, lifecycle and registration. Check browser behavior and payloads. |
| 5. Update status | Record the new acceptance results, then continue the catalog one element at a time. |

Decorator support is not free: compare emitted code and per-instance cost with the
implementation being replaced. Retain the build's payload ceilings unless an increase is
explicitly approved. Do not claim an improvement or relax a ceiling merely to pass.

## References

- [Metadata ownership discussion](05-meta-background.md)
- [Previous Avatar implementation and measurements](../components/avatar.md)
