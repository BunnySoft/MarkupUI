# Security boundaries

MarkupUI does not evaluate binding expressions, compile event-handler strings or bind
data as HTML. Prefer direct properties and literal text for application data. Selected
component renderers still require review of their own URL, interaction and lifecycle
contracts; an HTML filter does not authorize application actions.

## Restricted HTML

`sanitizeHtml(html, document, policy)` returns a DOM fragment containing a restricted
HTML subset. It limits input to 1,048,576 characters, filters nested template contents,
rejects SVG/MathML and other namespaces, executable/unknown elements, customized
built-ins, event attributes, URL-list attributes and declarative shadow-root attributes.
URI attributes accept only HTTP(S) URLs from allowed origins, without URL credentials.
Names that collide with native document/form properties are removed.

The default policy rejects custom elements, including `m-*`. Application-authored
portable markup requires explicit `{ allowMarkupUI: true }`; this enables only `m-*`,
not arbitrary third-party custom elements. Such markup must come from a trusted source:
instantiating a component can invoke its resource-loading or application behavior.
`allowStyle: true` is likewise an explicit trust decision; CSS is not sanitized.
Neither option should be enabled for arbitrary user-submitted HTML.

This restricted filter is not a general-purpose rich-text sanitizer. Applications that
accept third-party HTML should use an independently reviewed sanitizer appropriate to
their content and threat model before integrating that content.

Under CSP Trusted Types enforcement, the string parsing sink fails closed. MarkupUI
does not create a permissive policy or bypass the enforcement. DOM-based component
construction and literal text remain the supported alternative in that environment.

## Remote markup

`m-include` loads application-authored portable markup from the destination document's
origin. Query `load(url, policy)` defaults to the same origin and the restricted HTML
policy; any additional origins or portable markup require explicit policy options.

Both loaders omit credentials, reject redirects, accept HTML/plain-text responses,
limit streamed bodies to 1,048,576 bytes and abort after 15 seconds. Authenticated
endpoints requiring ambient cookies are not supported by these loaders. Application
code can perform its own authorized transport and construct elements explicitly.

Include cancels previous loads when its source changes, clears or disconnects. Late
responses cannot replace current content or clear a newer loading state. Query loads
are latest-request-owned per query instance and expose `cancelLoad()` for explicit
disposal. Failed loads retain the previous content.

## Release verification

Unit tests cover policy bypass attempts, nested templates, origin resolution, streaming
limits, cancellation, timeouts and stale response ownership. Browser checks exercise
the filtering boundary and Chromium's Trusted Types rejection. These checks do not
constitute an independent security audit or complete CSP/accessibility certification.
