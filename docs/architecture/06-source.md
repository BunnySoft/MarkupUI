# 6. Source layout and ownership

**Implementation rule for contributors and AI agents:** follow the existing source layout.
Do not create a parallel component tree or move working logic merely to change bundle output.
Use the [component development guide](../elements/04-development.md) for the end-to-end workflow.

## Source areas

| Location | Responsibility |
| --- | --- |
| `src/core` | Public facade, `ViewElement`, plugin support and genuinely shared Web utilities. |
| `src/platform` | Platform-neutral types and contracts; not an execution engine for element properties. |
| `src/components` | Component families, their public elements, styling and local implementation details. |
| `src/actions` | Named action registration and invocation. |
| `src/state` | Explicit state and binding services; not private stores copied into each component. |
| `src/theme` | Theme data and resource application. |
| `src/security` | Shared HTML/URI policy and sanitization. |
| `src/overlay` | Shared overlay/feedback services. |
| `src/query` | Optional query helpers and their extensions; components must not require them. |
| `src/plugins` | Optional feature/plugin entries. |
| `src/index.ts`, `src/global.ts` | Package entry/facade code, not a home for component implementations. |

Keep TypeScript source in `src` and generated JavaScript/declarations/assets in `dist`.
Relative TypeScript imports use `.js` specifiers, following the existing NodeNext setup.
Follow surrounding formatting and reuse existing owners/helpers before adding another layer.

## Component-family pattern

Avatar is the first proving family. The same responsibilities apply to later components:

| File | Owns |
| --- | --- |
| `avatar.ts` | `Avatar`, direct accessors, resource behavior, rendering and lifecycle. Small named region classes may stay here. |
| `group.ts` | AvatarGroup's direct properties and grouping behavior. |
| `avatar.css` | Component presentation and private-part/state selectors. |
| `model.ts` | Reused types and value constants; no handwritten parallel element definition. |
| `index.ts` | Public exports and registration for this family only. |
| `global.ts` | Thin classic-script entry using the same implementation. |

The corresponding `demo/components` HTML/CSS/JS files own component examples and end-user
documentation. `scripts/component-api.mjs` extracts source information into generated
`demo/api` JSON; `demo/component-api.js` renders it. Neither is part of the library bundles.
Do not duplicate this information in component Markdown APIs.

Add files for real boundaries, not to satisfy a template. A complex reusable controller
may remain separate; a small region does not automatically need its own file.
Do not create provider, source, adapter and manager layers around every element.

Input's four public classes live in `src/components/input/input.ts`. The internal
`src/components/native-input.ts` owns shared clear/reveal/count, native-event and cleanup
mechanics used by Input and unmigrated native-control compositions. It has no registration
or public package helper export; selected builds account for its shared dependency explicitly.
Input's source-declared native-field base shares real editing mechanics and direct accessors.
The documentation extractor follows that source inheritance up to (but not through)
`ViewElement`, so each concrete class documents its complete API without runtime reflection.

Checkbox's direct native checkbox API lives in `src/components/checkbox/checkbox.ts`;
`group.ts` owns the native fieldset's computed selection, constraints and lifecycle.
The former public group helper is replaced, not wrapped or duplicated. Its native ownership
symbol remains a concrete boundary with DataTable and Tree selection. Checkbox does not import the
text-specific `native-input.ts` engine; no hypothetical Radio/Switch sharing chunk is emitted.

Radio and RadioButton's direct native accessors live in `src/components/radio/radio.ts`;
`group.ts` owns the canonical fieldset wrapper and lifecycle. The internal
`src/components/native-radio.ts` retains actual native group validation/ownership also used
by unmigrated Rate. It has no registration constructors, text-input code or public helper
package export. Selected Radio and Rate entries share this dependency explicitly.

## Shared-runtime boundary

`src/core/view-element.ts` owns common Web mechanics. Component files own direct typed
properties and ordinary method calls. They use small native conversion helpers where useful,
not a metadata lookup or generic property dispatcher.

Documentation tooling reads types, recognized accessor patterns and documentation comments.
It does not import UI modules, construct elements or execute getters. Keep defaults and
validation in the implementation; tooling must not invent values it cannot infer.

DOM operations belong in the Web base or component implementation, not documentation
tooling. Keep component-specific resources, focus, accessibility and cleanup with the
component. A shared helper needs a demonstrated common responsibility.

## Entry and packaging rules

Follow the [small-core/plugin delivery model](07-modules.md).
Thin core entry files may be added within the existing core area when shared distribution
requires them. They re-export shared code; they do not duplicate it or relocate component logic.

The shared runtime's thin entries are `src/core/index.ts` and `src/core/global.ts`.
Component entries must not import the all-components entry to obtain the base class.
Registration uses the shared runtime and only the component's own family. Classic entries
must not define a separate copy of the core or replace an already loaded core.

Shared source files do not automatically produce shared bundles. Implement that boundary
in `scripts/build.mjs` and the package exports, then account for the actual dependency files.
The first shared-core outputs are implemented for Avatar. Apply the same boundary when
migrating later families; do not infer that every existing component already uses it.

## Change checklist

1. Read the current contract and identify the existing source owner.
2. Keep the family structure and implement one canonical API.
3. Update the entry points, assets, examples and API documentation together.
4. Extend the existing focused fixtures and validate the affected build outputs.
5. Confirm that selecting this component does not pull in unrelated components.

## References

- [ViewElement source](../../src/core/view-element.ts)
- [Documentation extractor](../../scripts/component-api.mjs)
- [Avatar source family](../../src/components/avatar/)
- [Build configuration](../../scripts/build.mjs)
