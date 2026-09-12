# 4. Developing a component

Use this guide when creating or rewriting a MarkupUI component family. It describes the
current direct-access `ViewElement` pattern, not a metadata-driven runtime.

## 1. Set the contract and scope

Choose the family from the [inventory](03-inventory.md) and read its current contract or
demo/API page. Identify its companion elements, named regions, required dependencies and
native semantic/input owner.

Resolve defaults, invalid values, actions/events, content cardinality, focus and lifecycle
rules before implementation. Distinguish a logical feature from a Web-only mapping.
Do not preserve an obsolete API solely as an alias or copy an archived implementation
without checking the current design.

## 2. Put each responsibility in its existing source area

| File / area | Responsibility |
| --- | --- |
| `src/components/<family>/<component>.ts` | Direct properties, methods, behavior and renderer ownership. |
| `group.ts`, `regions.ts` or a local controller | Separate only real companion or complexity boundaries. |
| `<component>.css` | External styling, theme tokens and owner-scoped private selectors. |
| `model.ts` | Reused types and value constants, not a runtime metadata definition. |
| `index.ts` | Family exports and registration. |
| `global.ts` | Thin classic-script entry using the same implementation. |
| `src/core` | Only demonstrated shared Web mechanics; never a copied component implementation. |
| `demo/components/<component>.html/.css/.js` | End-user examples, behavior notes and API presentation. |

Follow existing formatting and `.js` import specifiers in TypeScript. Do not introduce a
parallel component tree, generic provider hierarchy or a new markup language.

## 3. Implement the public element

Import `ViewElement` from `../../core/index.js`. Declare an own static readonly `tag` with
the canonical `m-*` name. Define `observedAttributes` explicitly when attributes need
renderer updates; do not derive execution behavior from metadata.

| Surface | Pattern |
| --- | --- |
| String property | Direct attribute/native-property access; handle null explicitly. |
| Boolean presence property | `hasAttribute` and a validated toggle. |
| Boolean text property | Explicit absent default and `true`/`false` conversion. |
| Enum | Shared typed choices, an explicit default and direct validation. |
| Number | Parse, check finite/range/integer requirements and reject invalid input. |
| Read-only state | Ordinary computed getter or owned state field. |
| Method/action | Direct method call; no metadata lookup or generic dispatch. |
| Event | Native event or explicit `emit(name, detail, options)` with documented flags. |

Small helpers in the [core API](../api/01-core.md) are available for repeated conversions.
They do not replace the component's contract. Keep public setters type-safe, and validate
before mutating state or attributes. Do not silently substitute defaults for invalid input.

## 4. Make lifecycle and ownership explicit

Replay pre-upgrade properties before initial rendering. Guard initialization so setters
cannot trigger a partially initialized render.

Preserve authored nodes and surviving identity during updates. Create invariant private
chrome once where possible; do not clear/rebuild the component for scalar changes.
Record and restore only attributes/styles the renderer actually owns, without erasing
later application changes.

Disconnect listeners, observers, timers, animations and resources the component created.
Reconnect without duplicated controls or callbacks. Guard asynchronous completion so a
stale request cannot replace a newer presentation.

Prefer native controls for semantics and input. Do not create a focusable host around
another focusable owner. Test naming, disabled/loading behavior, focus recovery and
reduced motion as actual behavior, not only ARIA attributes.

## 5. Wire registration and selected-file delivery

The family entry calls `ViewElement.register` with its canonical classes. Registration must
not overwrite another constructor or partially register a conflicting family.
Remove competing basic/alternate implementations and update their consumers.

| Surface | Required change |
| --- | --- |
| `package.json` | Correct component and CSS exports. |
| `scripts/build.mjs` | Runtime/style classification, classic entry and shared-core component registration. |
| Combined-runtime budget | Account for core and component dependencies, not only the component file. |
| ESM | Import shared core; do not bundle another copy or import the aggregate entry. |
| Classic | Require core before component scripts and fail clearly if it is missing. |
| Consumers | Update demos, aggregate registration and other directly affected callers. |

A CSS-only starting point may need a new runtime entry; an existing runtime may already
have the necessary package surface. Inspect before adding files. Do not increase a budget
without explicit approval or remove required behavior merely to make a size check pass.

## 6. Make the demo the component reference

The component page must include minimum required JS/CSS, useful live examples, copyable
code, behavior, accessibility, styling and composition notes. Distinguish dependencies
needed by the component from extra components used only by a demonstration.

Use `demo/component-api.js` and `component-api.css` to present generated API data.
Load `../api/<family>.json` from the page module after the runtime is ready.
Do not maintain another Markdown API table or make the production component load that JSON.

Use `main[data-demo-page].component-docs` and an API container named `<family>-api`.
The shared documentation stylesheet owns page spacing and cards; keep family demo CSS
focused on its previews. Standard examples must not require layout-only helper classes on public
elements; scope demo layout through their preview containers. Identify class-based custom styling
as Web-specific rather than a portable component API.
Include `demo/component-outline.js` for the responsive "On this page"
navigation. It reads existing example/section heading IDs and generated API headings, so
do not maintain a second list of links. Keep only the family loading snippet and a link to the
[shared setup guide](../../demo/setup.html) in `details.component-setup`; do not repeat common
loading, registration or styling instructions on every component page.
`example-code.js` opens the snippet for documentation deep links.

`scripts/component-api.mjs` reads TypeScript types and recognized accessor/helper patterns.
Use its supported documentation hints for facts it cannot infer: `@region`, `@states`,
`@min`, `@max`, `@minExclusive` and `@integer`. A writable property-only array can use
`@default []` to document its empty initial value; nonempty defaults and attribute-backed
arrays are not supported by that hint. Hints document implementation; they do not
execute it. If extraction cannot determine a value, improve the supported pattern or
state the limitation—do not invent a value or restore runtime metadata.

Generated `demo/api` files are build output. Do not edit them manually.
When the family is complete, update catalog/inventory links to its demo and move its
planning contract to the archive with a link to the current page.

## 7. Validate and finish one family

Use the existing component and directly affected fixtures; do not add another test
framework or silently create a new test project.

| Check | Required evidence |
| --- | --- |
| Type/build | Type-check succeeds; assets and generated API data are produced correctly. |
| Properties | Defaults, live updates, invalid values and pre-upgrade assignment. |
| Content | Authored listeners, node identity, late content and nested ownership. |
| Lifecycle | Disconnect/reconnect and stale async work. |
| Input/accessibility | Native activation, forms where applicable, focus, disabled/loading and motion policy. |
| Distribution | ESM/classic share core; only required files load; conflicts fail explicitly. |
| Demo/API | Page initializes, examples work, generated data matches behavior, and failures are visible. |
| Cost | Measure component, core/dependencies and CSS; do not confuse raw, gzip and source-map sizes. |

Typical sequence is `pnpm exec tsc --noEmit`, `pnpm build`, then the relevant existing
fixtures individually, such as `pnpm exec vitest run tests\avatar.test.ts`.
Use the actual family's fixtures and perform browser checks for behavior JSDOM cannot prove.

A class rename, generated API table or passing build alone does not complete a family.
Update its status only when contract, implementation, delivery and demo agree, then start
the next family. Create commits only when requested.

## References

- [Source ownership](../architecture/06-source.md)
- [Core/module delivery](../architecture/07-modules.md)
- [Development metadata](../architecture/05-meta.md)
- [Core implementation](../../src/core/view-element.ts)
- [Avatar source](../../src/components/avatar/)
- [Avatar demo](../../demo/components/avatar.html)
