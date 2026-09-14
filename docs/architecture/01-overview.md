# 1. System overview

MarkupUI is a platform-neutral, dependency-free UI markup system designed for universal cross-platform rendering.
It enables applications to author interfaces using canonical `m-*` elements that render natively on Web (Custom Elements),
mobile and desktop (SwiftUI, Flutter), and terminal environments (CLI) without requiring a browser engine or CSS parser.

---

## 1. Architectural pillars

| Pillar | Meaning | Implementation |
| --- | --- | --- |
| **`ViewElement` Foundation** | Every visual element extends a lightweight base class with direct typed property access and attribute reflection. | No virtual DOM, decorators, or runtime reflection engine. |
| **Self-Contained Primitives** | Standard HTML tags map to portable `m-*` primitives (`m-box`, `m-span`, `m-p`, `m-label`, `m-strong`, `m-details`). | Non-web platforms render these directly without HTML emulation. |
| **Declarative Layout** | Layout is specified via typed attributes (`direction`, `gap`, `padding`, `margin`, `align`, `justify`). | Native targets map these to native stacks (`VStack`, `Row`, CLI padding) without CSS. |
| **87 Component Families** | Comprehensive UI library covering Common, Data Input, Data Display, Navigation, Feedback, and Layout. | Unified contracts with strict per-component bundle budgets. |
| **Token-Based Theming** | Semantic design tokens (`color-primary`, `bg-page`, `text-primary`, `border`) drive visual presentation. | Built-in presets: `light`, `dark`, `slate`, and `slate-dark`. |

---

## 2. System layers and responsibilities

| Layer | Responsibility | What it does NOT do |
| --- | --- | --- |
| **Element Contract** | Defines public typed properties, named regions, and custom events (`m:change`, `m:close`). | Does not prescribe platform-specific DOM or toolkit internals. |
| **`ViewElement` Base** | Provides attribute reflection, property upgrading, layout attribute synchronization, and event emission. | Does not maintain an internal virtual DOM or property registry. |
| **Layout & Primitives** | Provides structural boxes (`m-box`, `m-div`) and phrasing (`m-span`, `m-p`, `m-label`, `m-heading`, `m-divider`). | Does not parse arbitrary CSS strings or run a CSS layout engine. |
| **Component Implementations** | Implements domain logic (e.g., selection in `Select`, paging in `Pagination`, calendar grid in `Calendar`). | Does not mutate external application state or create hidden listeners. |
| **Design Token Engine** | Manages color schemes, surface fills, borders, and typography scales across themes. | Does not hardcode hex colors inside component logic. |
| **Platform Renderers** | Maps logical elements to platform UI nodes (DOM on Web, views on SwiftUI/Flutter, cells on CLI). | Does not re-interpret or alter the logical element contract. |

---

## 3. Cross-platform rendering matrix

| Concept | Web (Custom Elements) | iOS / macOS (SwiftUI) | Android / Multiplatform (Flutter) | Terminal / CLI |
| --- | --- | --- | --- | --- |
| **Container (`<m-box>`)** | Custom Element with flex/grid CSS | `VStack` / `HStack` / `ZStack` | `Column` / `Row` / `Container` | Box-drawing character frame |
| **Layout (`direction="column"`)** | `flex-direction: column` | `VStack(spacing:)` | `Column(children:)` | Sequential line output |
| **Spacing (`gap="16" padding="12"`)** | Inline style `gap: 16px; padding: 12px` | `spacing: 16`, `.padding(12)` | `SizedBox(height: 16)`, `Padding(12)` | Blank lines and indent spaces |
| **Actions (`<m-button>`)** | Button element with native events | `Button(action:label:)` | `ElevatedButton` / `FilledButton` | Highlighted selectable menu item |
| **Inputs (`<m-input>`)** | Input with input/change events | `TextField` | `TextField` | Terminal text prompt |
| **Events (`m:change`, `m:close`)** | Bubbling CustomEvents on the element | State bindings and closures | Event callbacks and ValueNotifiers | Command loop action dispatch |
| **Theme (`data-m-theme="slate"`)** | CSS variables (`--m-color-primary`) | Asset catalog and environment values | `ThemeData` / `ColorScheme` | ANSI 256 / 24-bit color escapes |

---

## 4. Guidance for developers and AI agents

1. **Always use canonical `m-*` elements**:
   - Replace generic containers (`<div>`) with `<m-box>` (or `<m-space>` / `<m-flex>`).
   - Replace raw text blocks (`<p>`) with `<m-p>`, and inline phrasing (`<span>`) with `<m-span>`.
   - Replace form labels (`<label>`) with `<m-label for="...">`.
   - Replace buttons (`<button>`) with `<m-button>`.

2. **Prefer declarative layout attributes over inline styles**:
   - Use `direction="column"`, `gap="12"`, `padding="16"`, `width="240"` directly on `<m-box>` or components.
   - Non-web renderers parse these attributes directly; they cannot parse raw CSS strings.

3. **Direct property access over runtime reflection**:
   - Access properties directly (`element.value`, `element.open`, `element.disabled`).
   - Do not invent metadata queries, decorators, or generic property bags.

4. **Adhere to bundle size ceilings**:
   - Each component family has an isolated payload budget verified at build time.
   - Core must remain minimal so aggregate dependencies stay lightweight.

---

## 5. References

- [ViewElement Web renderer](02-web.md)
- [Native renderer mappings](03-native.md)
- [Typed style and class model](08-view-element-styles.md)
- [Complete element directory](../elements/05-element-index.md)
