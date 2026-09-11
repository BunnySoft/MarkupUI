# 6. Alternatives and implementation plan

This page records why the selected design combines explicit data directives with a keyed
native-template engine.

## Two proposal generations

The earlier investigation recommended native templates and path bindings but left syntax
undecided. The refined design resolves those open questions.

| Concern | Earlier proposal | Refined design | Comment |
| --- | --- | --- | --- |
| State | Existing explicit `MuiStore`. | Same. | Keep explicit updates; no Proxy required. |
| Collection declaration | `data-bind="users"` on a future list. | `data-bind-items="people"` or structural `data-each="people"`. | Separates property binding from repetition. |
| Item property | `mui-bind` plus `mui-bind-property`. | `data-bind-src="item.src"`. | Direction and destination are visible together. |
| Two-way | Existing `mui-bind`. | `data-model-value` / `data-model-checked`. | Removes ambiguity. |
| Text | `mui-text`. | `data-bind-text`. | Consistent one-way family. |
| Scope | `item`, `index` suggested. | `item`, `index`, `key`, `parent`, plus component contexts. | Makes nesting/rest templates explicit. |
| Identity | `item-key`, keyed native DOM. | Same, with validation/order/focus/cleanup rules. | Core runtime requirement. |
| Template reuse | Inline, ID or object. | Same; reject multiple simultaneous sources initially. | Avoid precedence complexity. |
| Component architecture | Future generic `mui-list` centered example. | Generic structural templates plus thin component adapters. | Do not require List for all binding. |
| Events | Open question. | Native input/change plus declared component model metadata. | Required before two-way claims. |
| Property/attribute | Open question. | Separate property and attribute channels. | Supports objects and ARIA safely. |

The proposals are not competing renderers. The refined directive language should drive
the earlier keyed native-template engine.

## Alternative approaches

| Approach | Useful lesson | Why not the initial MarkupUI runtime |
| --- | --- | --- |
| Native templates + explicit callbacks | Minimal imperative escape hatch. | Application must manually implement updates, identity and cleanup. |
| XAML DataContext/ItemsSource/DataTemplate | Clear separation of source, context and presentation. | Browser HTML has no markup-extension loader; braces become literal values. |
| Alpine | HTML-first templates, local scopes, explicit keys. | General JavaScript expressions/reactivity are broader than the desired path-only binder. |
| Knockout | Binding contexts, reusable templates, observables. | Different observable/identity model and expression grammar. |
| Lit | Keyed DOM-part updates without a React-style VDOM. | Moves primary templates into JavaScript and adds a rendering dependency. |
| Vue | Reactive lists and scoped slots. | Framework runtime/VDOM and expression/compiler model are not the native core target. |
| React | Keys and render callbacks. | JSX/element-tree rendering and VDOM are not the target architecture. |
| Svelte | Compiler-generated keyed DOM without VDOM. | Requires a consumer compiler workflow. |
| Angular | Rich template contexts and tracked collections. | Much broader compiled framework/change-detection system. |
| Handlebars | Reusable escaped string templates. | Produces strings and does not preserve live keyed native nodes by itself. |
| htmx | Server-authored fragment replacement. | Complementary server workflow, not local JSON collection binding. |

## Syntax alternatives

| Syntax | Decision |
| --- | --- |
| `data-bind-src="profile.src"` | Selected canonical one-way property form. |
| `data-model-value="profile.name"` | Selected canonical two-way property form. |
| `mui-bind-src` | Avoid for new grammar; `data-*` is the standard extension channel. |
| `:src="profile.src"` | Avoid as canonical standalone syntax due to tooling/XML ambiguity. |
| `src="{Binding profile.src}"` | Reject; browser/custom element may act on the literal value before binding. |
| `src="{{profile.src}}"` | Reject; same premature literal value and expression-language pressure. |
| Runtime text interpolation | Reject initially; use explicit bound text nodes. |

## Staged implementation

### Stage 1 — scalar directive foundation

- parse/validate safe paths;
- support `data-bind-*`, `data-bind-attr-*`, `data-bind-text`;
- support `data-model-*` on native controls;
- retain current attributes as aliases;
- detect overlapping property ownership;
- bind/dispose one explicit root.

### Stage 2 — scope and template foundation

- internal `BindingScope`;
- one-root native template instances;
- `data-if`;
- keyed `data-each`;
- nested parent scopes;
- per-instance cleanup;
- focus policy and duplicate-key atomic rejection.

### Stage 3 — AvatarGroup proving consumer

- `items`, `itemKey`, `size`, Naive-aligned `max`;
- item/rest templates;
- rest `items`/`count` scope;
- same-key update/reorder;
- explicit Tooltip/Dropdown connection hooks;
- no direct Tooltip/Dropdown dependencies.

### Stage 4 — reuse and collection operations

- referenced template ID/property;
- whole-array replacement acceptance first;
- optional keyed insert/update/move/remove API;
- writable repeated-item model route;
- consider reuse by other concrete consumers.

### Stage 5 — optional authoring/tooling

- diagnostics and source locations;
- optional build-time interpolation sugar, if demanded;
- optional framework adapters;
- no change to the explicit runtime grammar.

## Acceptance matrix

- scalar property/attribute/text bindings;
- native input and checkbox models;
- invalid/unsafe paths;
- initial and empty collections;
- duplicate/missing keys before mutation;
- insertion, deletion, reorder, same-key new objects;
- nested scopes and parent lookup;
- component item/rest contexts;
- active native input edits;
- focused item removal;
- template errors and ambiguous sources;
- helper cleanup and reentrant disposal;
- no-JavaScript authored fallback;
- CSP without eval/inline script requirements;
- measured optional payload and no cost to unbound components.

## Open decisions

1. Direct field name versus nested path for `data-each-key`.
2. Exact model-event metadata exposed by MarkupUI components.
3. Focus recovery defaults for generic repeated templates.
4. Whether the first release includes only whole-array replacement.
5. Legacy binding alias lifetime/deprecation.
6. Binder package/entry name and gzip ceiling.
7. Exact template-ID lookup scope.
8. Whether passive `mui-card-*` child tags become the preferred Card documentation form.

## References

- [Alpine `x-for`](https://alpinejs.dev/directives/for)
- [Knockout foreach](https://knockoutjs.com/documentation/foreach-binding.html)
- [Knockout template binding](https://knockoutjs.com/documentation/template-binding.html)
- [Lit lists and `repeat`](https://lit.dev/docs/templates/lists/)
- [Vue list rendering](https://vuejs.org/guide/essentials/list.html)
- [Vue scoped slots](https://vuejs.org/guide/components/slots.html#scoped-slots)
- [React rendering lists](https://react.dev/learn/rendering-lists)
- [Svelte each blocks](https://svelte.dev/docs/svelte/each)
- [Handlebars guide](https://handlebarsjs.com/guide/)
- [htmx documentation](https://htmx.org/docs/)

