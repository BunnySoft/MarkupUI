# 1. Avatar Element Contract

> **Design reference.** The implemented component's current API, usage and behavior are
> documented in the [Avatar demo](../../../demo/components/avatar.html).

Present a person, organization or object through an image, text or icon.

**Implemented with the shared core.** Web: `Avatar : ViewElement`, registered as
`m-avatar`. `Avatar.meta` exposes `ElementMeta` derived from the class's declarations under
the shared [metadata design](../../architecture/05-meta.md).
See the [Avatar demo](../../../demo/components/avatar.html) for the required files and actual exports.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `src` | URL string or null / null | `src` | Primary image; relative URLs resolve against the document. |
| `fallbackSrc` | URL string or null / null | `fallback-src` | Alternate after primary failure. |
| `label` | string or null / null | `label` | Accessible name. |
| `loading` | `eager`, `lazy` / `eager` | `loading` | Resource-loading hint. |
| `size` | `tiny`, `small`, `medium`, `large`, `huge` or positive finite number / `medium` | `size` | Content-box size in CSS pixels on Web. |
| `shape` | `rounded`, `circle`, `square` / `rounded` | `shape` | Clipping shape. |
| `imageFit` | `fill`, `contain`, `cover`, `none`, `scale-down` / `fill` | `image-fit` | Image fitting. |
| `bordered` | boolean / false | `bordered` | Standard border. |

## 2. Content Model

Each region allows zero or one noninteractive content fragment.

| Region | Content | Web mapping |
| --- | --- | --- |
| `content` | Text, image or icon used without a loaded source. | Primary Light DOM. |
| `placeholder` | Display content while loading. | `m-avatar-placeholder` |
| `fallback` | Display content after source failure. | `m-avatar-fallback` |

Each named region accepts static content or one native template, instantiated once per
region lifetime. Template edits are not live bindings; update rendered content or replace
the region. Duplicate regions/source images and interactive content are invalid.

## 3. Behavior

No application action; resource loading belongs to the renderer.

| Trigger | State / result |
| --- | --- |
| New `src` | Replace the previous presentation; enter `loading`. |
| Source loads | Enter `loaded`; hide placeholder, fallback and ordinary content. |
| Primary fails | Attempt `fallbackSrc` once if present; remain `loading`. |
| All sources fail | Enter `error`; show fallback, or ordinary content if absent. |
| Source removed | Enter `empty`; show ordinary content. |
| Shape changes | Update clipping without recreating content. |
| Size/content changes | Refit text without changing the accessible label. |

Error notification is per attempt:

| Logical event | Web event / detail | Ordering |
| --- | --- | --- |
| `Load` | `m:load`, `{ src }` | After successful presentation; once per active request. |
| `Error` | `m:error`, `{ src, fallback, state }` | After each failure; `src` is the failed URL and `fallback` indicates whether the alternate was attempted. State may still be `loading`. |

Both bubble, are noncancelable and not composed. Cached completion can notify on connection;
reconnection does not repeat a settled notification. Removed images and empty sources cannot
settle the current presentation.

## 4. Rendering and accessibility

Expose the four resource states. Declare lazy-loading support; unsupported lazy loading
uses eager loading with the same state semantics. Release resource listeners and fitting
observers on disconnect.

`label` names meaningful identity content. Decorative Avatars have no name, interactive role
or tab stop; generated images must not introduce duplicate names.
Colors, arbitrary radius, font size and shadow remain theme/style values (`--m-avatar-*`
on Web).

## 5. Decisions

| Decision | Required rule |
| --- | --- |
| Properties | Attribute-backed scalar inputs; pre-upgrade assignments replay once. Invalid enums/sizes throw. No two-way/user-input events; `state` is read-only. |
| Sizing | Named sizes are 22/28/34/40/46px; border adds 4px. Text fitting uses the smaller 90%-of-outer-box width/height ratio, capped at 1. |
| Resources | Host `src` overrides a direct image source; removal clears it. Otherwise native `img.src` owns the source. An identical primary does not retry; clear/change it to restart. |
| Fallback | Read `fallbackSrc` when the primary fails; never retry an already attempted alternate. Changing fallback alone does not restart a settled request. An identical primary/fallback URL is not retried. |
| Naming | Explicit host ARIA wins; otherwise use `label`, authored image alt, then ordinary text. Empty label is decorative; null releases the override. Generated image alt stays empty. |
| Loading | Explicit `loading` overrides the native image hint; removal restores its authored hint. |
| Packaging | One canonical Avatar registration across supported loading modes; no competing implementations selected by load order. |

Web `Avatar`, `AvatarGroup`, `AvatarPlaceholder` and `AvatarFallback` use `ViewElement`.
Public properties are `shape`, `loading`, `label` and `imageFit`; renderer markers are not
an alternative authoring API. AvatarGroup owns keyed-by-node overflow, `max`, `vertical`,
`label` and `rest-label`.
`max` is a nonnegative safe integer or null (unlimited); invalid counts are rejected.
Defer independent dimensions, `rectangle`/`ellipse`, collection rendering and native-target code.

## References

- [Previous implementation and acceptance](../../archive/components/avatar.md)
- [Default-style comparison](../../archive/styling/components/avatar.md)
