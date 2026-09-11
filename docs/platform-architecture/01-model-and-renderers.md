# 1. Model and renderers

## Canonical model

The canonical component tree contains logical UI concepts rather than DOM tags:

```text
Card
├── Header
├── Content
├── Footer
└── Actions
```

```text
Divider
├── orientation
├── dashed
├── title
└── titlePlacement
```

A model node defines:

| Field | Purpose |
| --- | --- |
| type | Stable component identity such as Button or Card |
| id/key | Document or repeated-item identity |
| properties | Platform-neutral component values |
| regions | Named child content |
| bindings | One-way/two-way logical property bindings |
| templates | Scoped component subtrees |
| actions | Host-resolved intents |
| accessibility | Role/name/state intent |
| requires | Required renderer capabilities |
| fallback | Replacement/drop/error behavior |
| version | Schema compatibility |

## Runtime

The runtime owns:

- state and explicit notifications;
- path resolution;
- binding scopes;
- template instantiation;
- stable keyed identity;
- abstract actions;
- capability/fallback selection;
- logical lifecycle.

It does not own Web DOM/CSS details.

## Renderer contract

A renderer receives validated logical nodes and creates platform output. It must report
supported capabilities and preserve logical identity across updates.

Renderer responsibilities:

- create/update/remove platform nodes;
- map properties and regions;
- connect platform events to logical actions/models;
- implement accessibility intent;
- apply host configuration/theme;
- release platform resources;
- select declared fallbacks when capabilities are absent.

## Binding and templates

Bindings target logical component properties. `data-bind-*` is only the Web authoring
adapter for those descriptors.

```text
source path: profile.name
target property: value
mode: twoWay
update trigger: propertyChanged
```

Templates describe logical component subtrees. The Web adapter may author them with
native `template`; another renderer receives the same scoped logical template rather than
HTML.

## Actions

Portable documents use abstract actions:

| Action | Intent |
| --- | --- |
| Submit | Submit the current logical data scope |
| OpenUrl | Ask the host to navigate to an approved URL |
| ToggleVisibility | Change logical visibility |
| SetValue | Update bound state |
| Select | Select an item/key |
| Custom | Invoke a host-registered named action |

Portable payloads do not contain arbitrary executable callbacks.

## Host configuration

The host supplies typography, spacing, density, semantic colors, radii, elevation, motion,
capabilities and policy. Web maps these to CSS/custom properties; other platforms map them
to native theme resources.

## Performance model

The architecture has different costs by usage mode:

| Mode | Expected cost |
| --- | --- |
| Direct `m-*` Web authoring | Near the current Custom Element baseline; no serialized document tree is required. |
| Render a platform-neutral document | Additional schema validation, logical-node storage and renderer dispatch. |
| Static authored content | May be slightly slower/heavier than raw native HTML; architecture must not claim otherwise. |
| Keyed data/template updates | Can be faster and preserve more state than clearing/rebuilding DOM. |
| Native input, layout and paint | Remain browser-native after renderer creation. |

Requirements:

- no virtual DOM;
- no full-tree diff for scalar property updates;
- no duplicate model tree for direct Web-only authoring;
- incremental keyed collection reconciliation;
- batch store notifications into one renderer update;
- lazy-load optional binding/templates and component renderers;
- retain native controls and CSS layout;
- measure rather than infer improvements.

Shadow DOM is not a performance optimization by itself. Use it only for encapsulation or
invariant private structure.
