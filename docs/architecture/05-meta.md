# 5. Development metadata

Metadata is for documentation and development tooling, **not a production component API**.
Components do not expose `.meta` and do not read a schema to execute properties or methods.

## Runtime and tooling

| Concern | Owner |
| --- | --- |
| Property reads/writes | Direct typed accessors and small DOM conversion helpers. |
| Defaults and validation | The component's actual implementation. |
| Registration | A stable static `tag` and the shared registration helper. |
| Event behavior | Explicit native dispatch or direct event helper calls. |
| API tables | Build-generated JSON consumed only by demo code. |

No runtime decorators, metadata registry, generic property dispatcher or custom compiler
lowering is needed. Normal TypeScript compilation produces the production code.
Information needed to execute the component remains in its code; documentation-only data
does not enter `dist`.

## Source extraction

`scripts/component-api.mjs` reads the TypeScript program without importing UI modules,
constructing elements or executing getters.

| Information | Source |
| --- | --- |
| Class and tag | Named class and static `tag` literal. |
| Properties and access | Public getters and their paired setters. |
| Types, nullability and enum values | TypeScript's type checker. |
| Attribute mapping and default | Recognized direct DOM/helper calls in getters. |
| Numeric documentation constraints | `@min`, `@max`, `@minExclusive`, `@integer` source comments where inference is insufficient. |
| Content regions | `@region` JSON documentation comments on the class. |
| Events and payload fields | Direct `emit` calls, their explicit flags and TypeScript detail types. |
| State names | The read-only state type or a `@states` documentation comment. |

The extractor is deliberately bounded, not a general evaluator of TypeScript behavior.
Unknown defaults are not invented. Documentation hints describe implementation; they do
not control it and should be checked against behavior when changed.

## Output and delivery

The build writes `demo/api/<family>.json`. These generated files are ignored by Git and
are not package runtime assets. The component demo loads its production JS and this separate
documentation file; consumers need only core, the selected component JS and its CSS.

`demo/component-api.js` renders JSON as literal text and tables. Runtime behavior never
depends on that request succeeding. A failed documentation request is reported on the page.
Future tooling may consume the same development data without making it mandatory for every
application or binding implementation.

## References

- [API extraction](../../scripts/component-api.mjs)
- [Direct Web base](../../src/core/view-element.ts)
- [Previous runtime-metadata design](../archive/architecture/06-runtime-meta.md)
- [Metadata ownership discussion](../archive/architecture/05-meta-background.md)
