# 8. ViewElement typed class and style design

This document specifies the universal `class` and `style` design for `ViewElement`.
It establishes concrete, platform-agnostic models that can be evaluated and rendered
identically on Web, native mobile/desktop platforms (such as SwiftUI and Flutter),
and terminal CLI renderers without requiring a CSS engine.

## 1. Design goals and principles

| Principle | Meaning |
| --- | --- |
| **No CSS engine dependency** | Native targets (SwiftUI, Flutter, CLI) must not parse raw CSS strings or run a CSS layout engine. |
| **Typed layout primitives** | Layout, geometry, and spacing are expressed as structured, typed properties with discrete values. |
| **Semantic tokens over ad-hoc names** | Class names represent structured design tokens (intent, surface, typography) rather than arbitrary stylesheets. |
| **Bidirectional synchronization** | On Web targets, markup attributes and DOM properties synchronize seamlessly with native inline styles and class lists. |
| **Graceful degradation** | Missing or unsupported properties on restricted platforms (such as CLI) degrade predictably without runtime errors. |

---

## 2. The `style` property model

`ViewElement.style` is modeled as a typed layout and appearance descriptor. Each sub-property
has strict typing, explicit valid values, and standard unit interpretation.

### 2.1 Layout properties

| Property | Allowed values | Description |
| --- | --- | --- |
| `display` | `block`, `inline`, `flex`, `grid`, `none` | Outer formatting context of the element container. |
| `direction` | `row`, `column`, `row-reverse`, `column-reverse` | Primary layout flow direction. |
| `align` | `start`, `center`, `end`, `stretch`, `baseline` | Alignment along the cross axis. |
| `justify` | `start`, `center`, `end`, `space-between`, `space-around`, `space-evenly` | Alignment and distribution along the main axis. |
| `wrap` | `nowrap`, `wrap`, `wrap-reverse` | Multi-line wrapping behavior for items. |
| `gap` | Non-negative number or tuple `[rowGap, columnGap]` | Spacing between adjacent child elements in logical points. |

### 2.2 Geometry properties

| Property | Allowed values | Description |
| --- | --- | --- |
| `width` | Non-negative number or `"auto"`, `"100%"`, `"fit-content"` | Explicit element width. Numbers represent logical points. |
| `height` | Non-negative number or `"auto"`, `"100%"`, `"fit-content"` | Explicit element height. Numbers represent logical points. |
| `minWidth`, `maxWidth` | Non-negative number or `"none"` | Minimum and maximum width boundaries. |
| `minHeight`, `maxHeight` | Non-negative number or `"none"` | Minimum and maximum height boundaries. |

### 2.3 Spacing properties

| Property | Allowed values | Description |
| --- | --- | --- |
| `padding` | Single number, 2-tuple `[V, H]`, or 4-tuple `[T, R, B, L]` | Internal edge insets in logical points. |
| `margin` | Single number, 2-tuple `[V, H]`, or 4-tuple `[T, R, B, L]` | External edge offsets in logical points. |

### 2.4 Appearance and border properties

| Property | Allowed values | Description |
| --- | --- | --- |
| `backgroundColor` | Semantic token name or 6/8-digit hex color string | Background surface fill. |
| `color` | Semantic token name or 6/8-digit hex color string | Foreground content and text fill. |
| `opacity` | Decimal number between `0.0` and `1.0` | Visual transparency multiplier. |
| `overflow` | `visible`, `hidden`, `scroll`, `auto` | Content clipping and scrolling policy. |
| `borderWidth` | Non-negative number | Uniform border stroke thickness. |
| `borderColor` | Semantic token name or hex color string | Uniform border stroke color. |
| `borderRadius` | Non-negative number | Uniform corner rounding radius. |
| `borderStyle` | `solid`, `dashed`, `dotted`, `none` | Pattern of the border stroke. |

---

## 3. The `class` semantic token model

Instead of unstructured CSS strings, `ViewElement.class` accepts a token or token list.
Renderers map each token against their platform theme dictionaries.

### 3.1 Token taxonomy

| Token domain | Example tokens | Purpose |
| --- | --- | --- |
| **Surface** | `surface-card`, `surface-elevated`, `surface-bordered` | Selects elevation, panel shading, and border treatment. |
| **Tone / Status** | `tone-primary`, `tone-success`, `tone-warning`, `tone-error`, `tone-muted` | Applies semantic color schemes to text and badges. |
| **Typography** | `text-title`, `text-body`, `text-caption`, `text-mono` | Selects standard typographic scale and font traits. |
| **Adaptive** | `hide-compact`, `hide-terminal`, `dense` | Instructs renderers to show, hide, or compact elements based on viewport. |

---

## 4. Platform renderer translation matrix

Each target renderer maps the universal `class` and `style` definitions to native layout stacks
and system primitives.

| Universal definition | Web (Custom Elements) | SwiftUI (iOS / macOS) | Flutter (Android / Desktop) | Terminal (CLI) |
| --- | --- | --- | --- | --- |
| `style.direction: "column"` | CSS `flex-direction: column` | `VStack(alignment:spacing:)` | `Column(children:)` | Sequential line output |
| `style.direction: "row"` | CSS `flex-direction: row` | `HStack(alignment:spacing:)` | `Row(children:)` | Horizontal column grid |
| `style.gap: 12` | CSS `gap: 12px` | Stack parameter `spacing: 12` | `SizedBox(height/width: 12)` | 1 blank line or 2 spaces |
| `style.padding: 16` | CSS `padding: 16px` | `.padding(16)` modifier | `Padding(padding: EdgeInsets.all(16))` | Left/top margin padding |
| `style.borderRadius: 8` | CSS `border-radius: 8px` | `.clipShape(RoundedRectangle(cornerRadius: 8))` | `ClipRRect(borderRadius: BorderRadius.circular(8))` | Rounded Unicode box characters |
| `style.backgroundColor: "card"` | CSS variable `var(--m-card-background)` | Color asset `Color("cardBackground")` | `Theme.of(context).cardColor` | ANSI background palette |
| `class: "tone-muted"` | CSS class `.tone-muted` | `.foregroundStyle(.secondary)` | `TextStyle(color: Theme.of(context).hintColor)` | ANSI Dim mode |

---

## 5. Lifecycle and synchronization rules

1. **Attribute reflection on Web**:
   Authored attributes (`<m-box direction="column" gap="16" padding="12">`) parse directly into
   the element's typed `style` object. Changes made directly via property assignment reflect back
   to corresponding attributes when appropriate.

2. **Zero runtime parsing overhead**:
   No CSS text tokenizer runs during view construction. Properties use direct primitives (integers,
   enumerations, tuples) that are trivial to deserialize from JSON, binary payloads, or markup attributes.

3. **Validation and bounds clamping**:
   - Numbers outside allowed ranges (e.g., negative padding or opacity outside 0–1) clamp to valid ranges.
   - Unknown enum values safely fall back to the property default without throwing exceptions.
   - Missing native capabilities degrade gracefully (e.g., terminal renderers ignore border radius while preserving content).
