# JavaScript UI builders

The optional `@dataengine/markup-ui/ui` entry provides small, chainable builders over
the existing Web components. Application code is ordinary JavaScript: no JSX, compiler,
virtual DOM or new component/property engine. Library TypeScript is built once into
browser-loadable JavaScript.

Try the [working example](../../demo/ui-api.html) and read its
[JavaScript](../../demo/ui-api.js). [Fieldnotes](../../demo/site/index.html) separately
demonstrates HTML-first pages with classic scripts; builders are an optional
alternative when programmatic construction is useful, not a requirement for pages.

## Loading

The first delivery is **ES modules only**. Existing component classic scripts remain
available, but do not mix them with these ESM factories in one document.

```html
<link rel="stylesheet" href="./dist/markup-ui-box.css">
<link rel="stylesheet" href="./dist/markup-ui-typography.css">
<link rel="stylesheet" href="./dist/markup-ui-button.css">
<link rel="stylesheet" href="./dist/markup-ui-flex.css">
<main id="workspace"></main>
<script type="module">
  import * as ui from "./dist/markup-ui-ui.js"

  ui.box(
    ui.heading("Workspace").level(2),
    ui.button("Open projects")
      .type("primary")
      .on("click", () => location.assign("./projects.html")),
  ).display("flex").direction("column").gap(8).padding(16).mount("#workspace")
</script>
```

Keep the generated distribution files together; ESM resolves the declared dependencies.
Optional theme styles may be added normally. The `ui` convenience entry selects Box,
Typography, Button and Flex, not the full catalog. For finer selection:

```js
import { span } from "@dataengine/markup-ui/ui/box"
import { link } from "@dataengine/markup-ui/ui/typography"

span(
  "Thoughtfully composed with ",
  link("MarkupUI").href("./index.html"),
  ".",
).mount("#footer")
```

With direct browser URLs, those two imports are `markup-ui-ui-box.js` and
`markup-ui-ui-typography.js`. Load only Box and Typography CSS for this example.
Each family entry reuses the canonical component bundle and shared builder helper;
it does not embed another constructor or core. No optional root facade is required.
Do not mix builders with the separately bundled full-catalog entry.

## Construction and operation

| API | Behavior |
| --- | --- |
| `box(...children)`, `span(...children)` | Construct Box and Span. Span additionally has `color()` and `weight()`. |
| `heading(...children)` | Construct Heading; `level(1..6)` forwards to its validated property. |
| `link(...children)` | Construct Link; `href()`, `target()` and `rel()` forward to its properties. |
| `button(...children)` | Construct Button; `type()`, `appearance()`, `size()`, `disabled()` and `loading()` forward to its properties. |
| `flex(...children)` | Construct Flex; `vertical()` and `wrap()` forward to its properties. |
| `id()`, `className()`, `on(type, listener, options?)` | Ordinary DOM identity, classes and event listeners. Listener options include `signal` for host-owned cleanup. |
| `style(descriptor)` | Apply the existing typed `viewStyle` presentation API. |
| `display()`, `direction()`, `align()`, `justify()`, `gap()`, `padding()`, `width()` | Short forms of `style()`, not component behavior-attribute setters. Numeric lengths are pixels. |
| `build()` | Return the same real element, without mounting or cloning it. |
| `mount(elementOrSelector)` | Append that element and return it. Missing targets throw; existing siblings are preserved. |

Children may be builders, DOM nodes, literal strings or finite numbers. Strings are
text, never parsed HTML. Reusing an element/builder moves the same node, just like
ordinary DOM; there is no clone or reactive rerender. Each wrapper exists to avoid
colliding with element properties such as `button.type`.

Presentation modifiers intentionally use `viewStyle`: `.direction("column")` sets
inline CSS, not Box's `direction` attribute. This preserves the existing separation
between presentation and component behavior. Use the actual element properties when
an attribute-backed operation is wanted.

After construction, operate on the real component:

```js
import { button } from "@dataengine/markup-ui/ui/button"

const label = document.createTextNode("Save")
const save = button(label).type("primary").mount("#actions")
save.disabled = true
label.data = "Saved"
```

Keep a text-node reference for later content changes, or use documented component
regions/properties. Do not replace a connected component's renderer-owned children
with `innerHTML`, `textContent` or `replaceChildren()`. The builders do not add a generic
property dispatcher, arbitrary HTML constructor, expression evaluator, state binding
or a SwiftUI/Compose reconciliation engine. Existing direct APIs remain authoritative.
