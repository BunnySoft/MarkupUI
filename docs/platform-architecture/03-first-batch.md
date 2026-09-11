# 3. First migration batch

**Order: Button → Card → Carousel → Collapse → Divider → Dropdown.**

Each task is complete only after model, Web renderer, tests,
demo parity and documentation pass.

## Shared first-batch foundation

Add only the minimum shared substrate required by Button:

- logical component node/type metadata;
- Web renderer registration helper;
- primary Custom Element registration;
- capability declaration;
- renderer-owned lifecycle/disposal;
- model-to-property update boundary.

Do not build the full template/binding runtime before a component requires it.

## Button

Primary syntax: `m-button`, `m-button-group`.

**Status: implemented and validated.** Platform definitions, primary registration,
shared native behavior, shared CSS ownership, demo syntax and payload gates
are complete. Direct Web mode creates no duplicate model tree. Registration remains
Button-local until another migrated component proves a smaller shared helper. Payloads:
ESM 3,717/4,000, classic 3,927/4,000 and CSS 2,476/2,500 gzip bytes. Card is next.

Prove:

- platform-neutral type/variant/size/state properties;
- native Web button/anchor ownership;
- abstract activation action;
- existing form, loading, disabled, icon and motion behavior.

## Card

Primary syntax:

```text
m-card
├── m-card-cover
├── m-card-header
│   └── m-card-header-extra
├── m-card-content
├── m-card-footer
└── m-card-action
```

Prove logical named regions and passive light-DOM Web parts. Keep semantic native marked
regions as a Web-specific alternative.

## Carousel

Primary syntax: `m-carousel`, `m-carousel-item`, named control/template regions.

Prove logical item identity, current index, actions and renderer capabilities. Existing
single-view scroll-snap remains the Web baseline; unsupported effects declare fallbacks.

## Collapse

Primary syntax: `m-collapse`, `m-collapse-item`.

Prove logical expanded keys, accordion, disabled state and header/content regions. Web may
render native details/summary internally while the public model remains platform-neutral.

## Divider

Primary syntax: `m-divider`.

Prove that one logical Divider maps to Web native separator primitives without exposing
`hr` as the canonical API.

## Dropdown

Primary syntax: `m-dropdown`, logical items/groups/dividers and item templates.

Prove authored/static items first. Data-driven options and templates must reuse the shared
binding/template design rather than adding a private Dropdown renderer.

## Per-component gate

1. model contract documented;
2. primary `m-*` Web syntax implemented;
3. no duplicated controller logic;
4. component tests pass;
5. Naive parity demo uses primary syntax;
6. capability/fallback differences documented;
7. build and payload ceilings pass;
8. startup/update/memory measurements show no unexplained regression from the current Web
   baseline;
9. record a validated checkpoint before starting the next component; commit only when
    explicitly requested.
