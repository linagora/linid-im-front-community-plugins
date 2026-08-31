# **EntityProfilePanel**

The **EntityProfilePanel** component displays an entity profile in a vertical layout: a navigation bar with a back button, a circular profile image with status badge, a title and subtitle, an actions bar, and the entity details. Every block is extensible through slots and plugin zones, and the navigation, avatar and titles blocks can be turned off individually.

---

## **Props**

The component uses the `EntityProfilePanelProps` interface, which extends `CommonComponentProps` from `@linagora/linid-im-front-corelib`.

| Prop               | Type                            | Required | Default | Description                                                                                                                                                        |
| ------------------ | ------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `entity`           | `Record<string, unknown>`       | No       | `{}`    | Entity whose profile is displayed                                                                                                                                  |
| `parentPath`       | `string`                        | No       | —       | Back-button route, passed through Nunjucks with an `entity` context (plain strings are also valid). When missing, the back button is not rendered                  |
| `instanceId`       | `string`                        | No       | —       | Forwarded to every plugin zone, and used as a fallback prefix for the namespace and the scope                                                                      |
| `statusKey`        | `string`                        | No       | —       | Entity key holding the status forwarded to `StatusBadge`. When absent, no badge is rendered. Requires `enableAvatar`                                               |
| `fieldOrder`       | `string[]`                      | No       | —       | **Exhaustive** list of the attributes displayed in the details card, in that order                                                                                 |
| `formatters`       | `FieldFormatter[]`              | No       | —       | Formatters applied to specific attributes before display                                                                                                           |
| `isLoading`        | `boolean`                       | No       | `false` | Replaces the title, the subtitle, the status badge and each attribute value with a loading placeholder, and disables the edit button                               |
| `enableNavigation` | `boolean`                       | No       | `true`  | Whether the navigation section is rendered                                                                                                                         |
| `enableAvatar`     | `boolean`                       | No       | `true`  | Whether the avatar section — and with it the status badge — is rendered                                                                                            |
| `avatarOptions`    | `AvatarOptions`                 | No       | —       | DiceBear avatar generation options. When provided, a deterministic SVG avatar is generated locally from the entity. When absent, the avatar section shows no image |
| `enableTitles`     | `boolean`                       | No       | `true`  | Whether the titles section is rendered                                                                                                                             |
| `formFields`       | `LinidAttributeConfiguration[]` | No       | `[]`    | Fields rendered in the [edition](#edition) dialog                                                                                                                  |
| `updateEndpoint`   | `string`                        | No       | —       | PUT endpoint. Nunjucks template rendered with an `entity` context. **When missing, the edit button is not rendered**                                               |
| `updateBody`       | `Record<string, unknown>`       | No       | `{}`    | JSON payload sent as the request body. Every nested string value is a Nunjucks template rendered with the same context                                             |
| `emitOnUpdate`     | `string`                        | No       | —       | Key published on `uiEventSubject` after a successful update                                                                                                        |
| `uiNamespace`      | `string`                        | Yes      | —       | Base UI design namespace, **and prefix of every plugin zone name**                                                                                                 |
| `i18nScope`        | `string`                        | No       | —       | Base i18n scope. The component appends `EntityProfilePanel` to it                                                                                                  |

`FieldFormatter` is defined in `apps/catalog-ui/src/types/ModuleGenericDetailsPageOptions.ts`; see the [Value Formatting Guide](../../value-formatting.md).

> **Note:** `showRemainingFields` is not forwarded to `EntityDetailsCard`, so an attribute missing from `fieldOrder` is never displayed — and an omitted `fieldOrder` displays nothing.
>
> Editing is opt-in: the edit button is rendered only when `updateEndpoint` is set, so a panel configured without it is read-only and `formFields` and `updateBody` are then ignored. Once an endpoint is configured, still set `updateBody`: the submitted form data is **never** sent on its own, so an endpoint left without a body PUTs `FormDialogButton`'s default empty body `{}` under a success notification.

### Namespace and scope resolution

Both the UI namespace and the i18n scope fall back to `instanceId` when their own prop is empty, then to a bare value:

| `uiNamespace`         | `instanceId`  | Effective UI namespace                     |
| --------------------- | ------------- | ------------------------------------------ |
| `moduleUsers.details` | any           | `moduleUsers.details.entity-profile-panel` |
| empty                 | `moduleUsers` | `moduleUsers.entity-profile-panel`         |
| empty                 | absent        | `entity-profile-panel`                     |

The same three cases apply to `i18nScope`, producing `[I18N_SCOPE].EntityProfilePanel`, `[INSTANCE_ID].EntityProfilePanel` or `EntityProfilePanel`.

> **Note:** the i18n scope is resolved **once**, at setup. Changing `i18nScope` or `instanceId` on a mounted panel does not re-resolve the translations, whereas the UI namespace and the zone names are reactive.

---

## **Events**

| Event           | Payload                   | Description                                                    |
| --------------- | ------------------------- | -------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | The updated entity returned by the API after a successful save |

Named after the `entity` prop, so the panel supports `v-model:entity` — see [Edition](#edition).

---

## **Slots**

All slots are unscoped, and each is rendered right after the plugin zone covering the same location.

| Slot name        | Location                                                |
| ---------------- | ------------------------------------------------------- |
| `before-header`  | Between the navigation section and the avatar section   |
| `after-header`   | Between the titles section and the actions section      |
| `before-details` | Inside the details section, before `EntityDetailsCard`  |
| `after-details`  | Inside the details section, after `EntityDetailsCard`   |
| `footer`         | After the details section, outside any `q-card-section` |

---

## **Layout Structure**

The panel renders vertically inside a `q-card`, each block wrapped in its own `q-card-section`. The outer padding is carried by the card (`q-pa-md`); every section then cancels Quasar's section padding with `q-pa-none` and adds only the bottom spacing it needs.

| #   | Section      | Rendered when      | Content                                                                                                     |
| --- | ------------ | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| 1   | `navigation` | `enableNavigation` | `ButtonsCard` with both built-in buttons hidden, hosting the back button                                    |
| 2   | `avatar`     | `enableAvatar`     | Circular `q-img` displaying the DiceBear-generated avatar when `avatarOptions` is set, and the status badge |
| 3   | `titles`     | `enableTitles`     | `h4` title and `p` subtitle, each rendered only when its key exists                                         |
| 4   | `actions`    | always             | `ButtonsCard` with both built-in buttons hidden, hosting the edit button                                    |
| 5   | `details`    | always             | `EntityDetailsCard`                                                                                         |

Each section carries an `entity-profile-panel--{name}-section` class — the BEM hook for styling or debugging that block.

The title and subtitle use the `te` + `t` pattern: rendered only when `te(key)` is true, with the text produced by `t(key, entity)`. Neither is centered by the component, and there is no special handling of unresolved placeholders — if the key exists, the interpolated string is shown as-is.

> **Note:** each bar gets its own sub-namespace, `navigation` or `actions`, before the nested `ButtonsCard` appends its own segment. The two bars, and the zones they host, are therefore configured independently.

---

## **Plugin Zones**

Zones are injection points rendered by `LinidZoneRenderer`, into which any module can register a federated plugin or a local component. The nine zone names are prefixed with the **UI namespace**, `${uiNamespace}.entity-profile-panel` falling back to `instanceId` — not with `instanceId` alone.

Every zone receives `entity`, `instanceId`, `uiNamespace` and `i18nScope` as props. The four zones hosted by a `ButtonsCard` receive the namespace and the scope of that card, so an injected component is configured as a sibling of the card's own buttons:

| Zone name                                                | Rendered in        | Position                        | `uiNamespace` / `i18nScope` forwarded                                                                                    |
| -------------------------------------------------------- | ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `${uiNamespace}.entity-profile-panel.navigation.prepend` | Navigation section | Before the back button          | `${uiNamespace}.entity-profile-panel.navigation.buttons-card` / `${i18nScope}.EntityProfilePanel.navigation.ButtonsCard` |
| `${uiNamespace}.entity-profile-panel.navigation.append`  | Navigation section | After the back button           | `${uiNamespace}.entity-profile-panel.navigation.buttons-card` / `${i18nScope}.EntityProfilePanel.navigation.ButtonsCard` |
| `${uiNamespace}.entity-profile-panel.header.before`      | Panel body         | Before the avatar section       | `${uiNamespace}.entity-profile-panel` / `${i18nScope}.EntityProfilePanel`                                                |
| `${uiNamespace}.entity-profile-panel.header.after`       | Panel body         | After the titles section        | `${uiNamespace}.entity-profile-panel` / `${i18nScope}.EntityProfilePanel`                                                |
| `${uiNamespace}.entity-profile-panel.actions.prepend`    | Actions section    | Before other action buttons     | `${uiNamespace}.entity-profile-panel.actions.buttons-card` / `${i18nScope}.EntityProfilePanel.actions.ButtonsCard`       |
| `${uiNamespace}.entity-profile-panel.actions.append`     | Actions section    | After other action buttons      | `${uiNamespace}.entity-profile-panel.actions.buttons-card` / `${i18nScope}.EntityProfilePanel.actions.ButtonsCard`       |
| `${uiNamespace}.entity-profile-panel.details.before`     | Details section    | Before `EntityDetailsCard`      | `${uiNamespace}.entity-profile-panel` / `${i18nScope}.EntityProfilePanel`                                                |
| `${uiNamespace}.entity-profile-panel.details.after`      | Details section    | After `EntityDetailsCard`       | `${uiNamespace}.entity-profile-panel` / `${i18nScope}.EntityProfilePanel`                                                |
| `${uiNamespace}.entity-profile-panel.footer`             | Panel body         | At the very bottom of the panel | `${uiNamespace}.entity-profile-panel` / `${i18nScope}.EntityProfilePanel`                                                |

---

## **DiceBear Avatar**

When `avatarOptions` is set, the component generates a deterministic SVG avatar client-side using `@dicebear/core` and a style from `@dicebear/styles`, then binds the resulting data URI to the `q-img` `src`. The three fields of `AvatarOptions` control the generation:

- **`seed`** _(required)_: array of Nunjucks templates rendered with `{ entity }` and joined — the concatenated string is the seed passed to DiceBear, so two entities with different attributes produce different avatars.
- **`style`** _(required)_: the DiceBear style name, e.g. `"adventurer"`, `"bottts"`, `"lorelei"` — must match a style exported by `@dicebear/styles`.
- **`styleOptions`** _(optional)_: additional options forwarded verbatim to DiceBear (e.g. `backgroundColor`, `radius`).

If the style is not recognised or avatar generation fails for any reason, `avatarSrc` is set to `undefined` and the avatar circle shows the fallback `q-icon` instead.

The `q-img` is bound to the UI namespace under the `q-img` target — its Quasar props (`fit`, `draggable`, `loading`, …) can be overridden from the design system. Its dimensions and shape come from the scoped styles (full-width circle with `aspect-ratio: 1`); the `src` attribute is always set by DiceBear from `avatarOptions` and cannot be overridden from the design system.

```json
{
  "avatarOptions": {
    "seed": ["{{ entity.uid }}"],
    "style": "adventurer",
    "styleOptions": { "backgroundColor": ["b6e3f4"] }
  }
}
```

---

## **Back Navigation**

When `parentPath` is set, the back button calls `router.push` with the result of passing the path through Nunjucks with a context containing `entity` (the current entity prop). The path may embed entity attributes using Nunjucks expressions:

```
/users/{{ entity.groupId }}/members
```

A static path such as `/users` is also valid — no template variables means the string is returned unchanged.

> **Note:** the back button is only rendered when `parentPath` is set. When it is absent, the navigation section can still host plugin zones and injected buttons.

---

## **Edition**

The edit button is rendered **only when `updateEndpoint` is set** — a panel without it is read-only, and its actions bar then holds nothing but its plugin zones. When rendered, it is a `FormDialogButton` with `method="PUT"`, pre-filling the form with a **spread copy** of the entity and forwarding the panel's i18n scope, UI namespace, and `updateBody` as the request body to it. The HTTP request, notifications, and dialog lifecycle are fully delegated to `FormDialogButton`. After a successful submit the panel:

- emits `update:entity` with the API response, **only when it is a JSON object** (guards against 204 No Content responses, and against a non-object body such as a gateway HTML page returned with a 200 status, which would blank the details card),
- publishes the `emitOnUpdate` key on `uiEventSubject` when configured — **including on an empty response**, precisely the case where the hosting page has to reload the entity itself.

> **Note:** the panel never mutates its `entity` prop. Bind `v-model:entity` to refresh it from the API response, or use `emitOnUpdate` with the `reloadDetailsOn` option of the hosting page to reload from the server. Without either, the profile keeps displaying stale values under a success notification.

The dialog and button resolve their translations under the `actions.ButtonsCard.editButton.FormDialogButton` sub-scope and their design keys under `actions.buttons-card.edit-button.form-dialog-button` — see [FormDialogButton](../button/FormDialogButton.md) and the [FormDialogButton i18n section](../../i18n.md#formdialogbutton).

---

## **Status Badge**

When `statusKey` is provided, a `StatusBadge` receives the entity, the configured `valueKey` and a fixed `default-value="UNKNOWN"`. Its labels and colors come from the global `StatusBadge` namespaces, not from the `EntityProfilePanel` scope — see the [StatusBadge documentation](../badge/StatusBadge.md).

The badge is rendered **inside the avatar section**, positioned over the circle: `statusKey` therefore has no effect when `enableAvatar` is `false`. The two props are not independent — a panel without avatar has no status badge.

The scoped `.entity-profile-panel--status-badge` rule pins it to the right edge, `15%` above the bottom of the avatar section, so it sits on the circle rather than below it.

---

## **Loading State**

While `isLoading` is `true`, every element derived from the entity is replaced with a [`BlurLoader`](../loader/BlurLoader.md) shimmer instead of being rendered from an entity that has not arrived yet:

| Element          | Placeholder                                                         |
| ---------------- | ------------------------------------------------------------------- |
| Title            | `BlurLoader` `width="xl" height="lg"`                               |
| Subtitle         | `BlurLoader` `width="lg" height="sm"`                               |
| Status badge     | `BlurLoader` `width="md" height="lg"`, pinned at the badge position |
| Attribute values | `BlurLoader` rendered by `InformationCard`                          |

The title and subtitle placeholders are nested **inside** the `h4` and the `p`, so the `te(key)` condition and the spacing of both elements are unchanged: a key that does not exist renders nothing, loading or not.

The status badge placeholder **replaces** the badge: without it, `StatusBadge` would resolve the missing status to its `UNKNOWN` default and display a definite status until the entity arrives.

Two elements are deliberately left out. The avatar image is not covered — `avatarSrc` holds the last successfully generated avatar from the current `entity` and `avatarOptions`; it has no distinct loading state of its own. The edit button is disabled rather than replaced, since it is an action and not a value.

---

## **Internationalization**

All keys are resolved under `${i18nScope}.EntityProfilePanel`:

| Key                                                                  | Description                              | Parameters        |
| -------------------------------------------------------------------- | ---------------------------------------- | ----------------- |
| `title`                                                              | Panel title                              | entity attributes |
| `subtitle`                                                           | Panel subtitle                           | entity attributes |
| `avatarAlt`                                                          | Avatar image alt text (`q-img` `alt`)    | -                 |
| `navigation.ButtonsCard.title`                                       | Navigation bar title                     | -                 |
| `navigation.ButtonsCard.backButton`                                  | Back button label                        | -                 |
| `actions.ButtonsCard.title`                                          | Actions bar title                        | -                 |
| `EntityDetailsCard.title`                                            | Details card title                       | -                 |
| `EntityDetailsCard.attributes.[FIELD]`                               | Label of an attribute                    | `[FIELD]` dynamic |
| `actions.ButtonsCard.editButton.FormDialogButton.title`              | Edit button label                        | -                 |
| `actions.ButtonsCard.editButton.FormDialogButton.submitSuccess`      | Update success notification              | -                 |
| `actions.ButtonsCard.editButton.FormDialogButton.submitError`        | Update error notification                | -                 |
| `actions.ButtonsCard.editButton.FormDialogButton.FormDialog.title`   | Edition dialog title                     | entity properties |
| `actions.ButtonsCard.editButton.FormDialogButton.FormDialog.content` | Edition dialog text                      | entity properties |
| `actions.ButtonsCard.editButton.FormDialogButton.FormDialog`         | Scope of the dialog's fields and buttons | -                 |

`title` and `subtitle` are resolved with `t(key, entity)`: **the entity is the interpolation context, and its attributes are referenced without a prefix** — write `{displayName}`, not `{entity.displayName}`. Both are displayed only when their key exists.

`avatarAlt` is resolved with `translateOrDefault('Avatar', 'avatarAlt')`: if the key is missing, the alt text falls back to `"Avatar"`. Provide this key to display a more meaningful description than the generic fallback.

`backButton` uses `translateOrDefault` and falls back to an **empty label** rather than the raw key, which makes an icon-only button possible. The two `ButtonsCard.title` keys are optional and independent; the `cancel`, `confirm` and `confirmLoading` keys of `ButtonsCard` are never resolved here, since the panel hides both built-in buttons.

The edit button delegates to `FormDialogButton`, which resolves its own keys under `actions.ButtonsCard.editButton.FormDialogButton.*`. `FormDialog.title` displays the raw key when missing and receives entity properties as interpolation context; `FormDialog.content` falls back to an empty body.

**Example:**

```json
{
  "[I18N_SCOPE]": {
    "EntityProfilePanel": {
      "title": "{displayName}",
      "subtitle": "{email}",
      "avatarAlt": "Profile picture",
      "navigation": {
        "ButtonsCard": {
          "title": "Navigation",
          "backButton": "Back"
        }
      },
      "actions": {
        "ButtonsCard": {
          "title": "Actions",
          "editButton": {
            "FormDialogButton": {
              "title": "Edit",
              "submitSuccess": "The user has been updated.",
              "submitError": "Unable to update the user.",
              "FormDialog": {
                "title": "Edit {displayName}",
                "fields": { "email": { "label": "Email" } },
                "ButtonsCard": { "confirm": "Save", "cancel": "Cancel", "confirmLoading": "Saving..." }
              }
            }
          }
        }
      },
      "EntityDetailsCard": {
        "title": "User Information",
        "attributes": { "email": "Email", "username": "Username" }
      }
    }
  }
}
```

---

## **UI Customization**

| Element              | Namespace path                                                                            | Target                                   | Notes                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel card           | `${uiNamespace}.entity-profile-panel`                                                     | `q-card`                                 | Outermost container                                                                                                                                                                           |
| Avatar image         | `${uiNamespace}.entity-profile-panel`                                                     | `q-img`                                  | DiceBear avatar image. `src` is always set by DiceBear and cannot be overridden; dimensions and shape come from scoped styles                                                                 |
| Avatar fallback icon | `${uiNamespace}.entity-profile-panel`                                                     | `q-icon`                                 | Shown inside the avatar circle when no avatar could be generated or the image fails to load. `font-size` is forced to `100cqmin` by scoped CSS — only `name` and `color` are useful overrides |
| Back button          | `${uiNamespace}.entity-profile-panel.navigation.buttons-card.back-button`                 | `q-btn`                                  | Rendered by the panel inside the navigation bar, only when `parentPath` is set                                                                                                                |
| Navigation bar       | `${uiNamespace}.entity-profile-panel.navigation.buttons-card`                             | `q-card` / `q-icon` / `q-card-actions`   | `ButtonsCard` hosting the back button                                                                                                                                                         |
| Edit button          | `${uiNamespace}.entity-profile-panel.actions.buttons-card.edit-button.form-dialog-button` | `q-btn`                                  | `FormDialogButton` rendered inside the actions bar                                                                                                                                            |
| Edition dialog       | `${uiNamespace}.entity-profile-panel.actions.buttons-card.edit-button.form-dialog-button` | `q-dialog` / `q-card` / `buttons-card`   | `FormDialog` opened by `FormDialogButton`                                                                                                                                                     |
| Actions bar          | `${uiNamespace}.entity-profile-panel.actions.buttons-card`                                | `q-card` / `q-icon` / `q-card-actions`   | `ButtonsCard` hosting injected action buttons                                                                                                                                                 |
| Entity details       | `${uiNamespace}.entity-profile-panel.entity-details-card`                                 | `q-card`                                 | `EntityDetailsCard` container                                                                                                                                                                 |
| Detail field         | `${uiNamespace}.entity-profile-panel.entity-details-card.[FIELD_NAME]`                    | `information-card` / `q-icon` / `q-card` | Per-field styling forwarded to `InformationCard`                                                                                                                                              |

> **Note:** the `confirm-button` and `cancel-button` sub-namespaces of both `ButtonsCard` have no effect: the panel hides those buttons and renders its own instead. The back button is nested in the navigation bar, under `navigation.buttons-card.back-button`; the edit button is nested in the actions bar, under `actions.buttons-card.edit-button`, to which `FormDialogButton` appends `form-dialog-button` itself.

**Example:**

```json
{
  "moduleUsers": {
    "user-details-page": {
      "entity-profile-panel": {
        "q-card": { "flat": true, "bordered": true },
        "q-img": { "draggable": false },
        "q-icon": { "name": "account_circle", "color": "grey-6" },
        "navigation": {
          "buttons-card": {
            "q-card-actions": { "align": "left" },
            "back-button": { "q-btn": { "color": "primary", "outline": true, "icon": "arrow_back" } }
          }
        },
        "actions": {
          "buttons-card": {
            "q-card-actions": { "align": "right" },
            "edit-button": { "form-dialog-button": { "q-btn": { "color": "primary", "icon": "edit" } } }
          }
        },
        "entity-details-card": {
          "q-card": { "flat": true, "bordered": true },
          "email": { "information-card": { "q-icon": { "name": "email", "color": "primary" } } }
        }
      }
    }
  }
}
```

The status badge is configured globally under the `status-badge` namespace. The avatar image `src` is always set by DiceBear from `avatarOptions` and cannot be overridden from the design system.

---

## **Usage**

### Direct import

```vue
<script setup lang="ts">
import EntityProfilePanel from '@/components/panel/EntityProfilePanel.vue';

const entity = { id: '1', username: 'john.doe', email: 'john.doe@example.com', status: 'ACTIVE' };
</script>

<template>
  <EntityProfilePanel
    v-model:entity="entity"
    ui-namespace="moduleUsers.user-details-page"
    i18n-scope="moduleUsers.UserDetailsPage"
    instance-id="moduleUsers"
    parent-path="/users"
    status-key="status"
    :field-order="['username', 'email']"
    :avatar-options="{ seed: ['{{ entity.uid }}'], style: 'adventurer' }"
    :form-fields="[{ name: 'email', type: 'text' }]"
    update-endpoint="api/users/{{ entity.id }}"
    :update-body="{ email: '{{ entity.email }}' }"
  >
    <template #after-header>
      <q-banner dense>Account pending validation</q-banner>
    </template>
  </EntityProfilePanel>
</template>
```

### Via Module Federation or a zone

Load the component with `loadAsyncComponent('catalogUI/EntityProfilePanel')` and bind it to a `<component :is>`, or register it in a zone from a module lifecycle and let `LinidZoneRenderer` render it — any prop declared on the renderer is forwarded to the panel:

```ts
zoneStore.registerPluginOnce(`${config.instanceId}.UserDetailsPage.profile`, 'catalogUI/EntityProfilePanel');
```

```vue
<LinidZoneRenderer zone="moduleUsers.UserDetailsPage.profile" :entity="entity" ui-namespace="moduleUsers.user-details-page" i18n-scope="moduleUsers.UserDetailsPage" parent-path="/users" status-key="status" :field-order="['username', 'email']" :form-fields="[{ name: 'email', type: 'text' }]" update-endpoint="api/users/{{ entity.id }}" :update-body="{ email: '{{ entity.email }}' }" />
```

### Via the host configuration file

When the panel is rendered inside a generic page exposing a zone, declare it in the module configuration. A hosting page should forward `entity`, `parentPath`, `uiNamespace`, `i18nScope` and `instanceId` to its zones leaving only the panel-specific props to declare here. A page that forwards none of them is still usable: declare the missing props alongside the others.

```json
{
  "zones": [
    {
      "zone": "moduleUsers.UserDetailsPage.side-left",
      "plugin": "catalogUI/EntityProfilePanel",
      "props": {
        "statusKey": "status",
        "fieldOrder": ["username", "email"],
        "enableNavigation": false,
        "formFields": [{ "name": "email", "type": "text" }],
        "updateEndpoint": "api/users/{{ entity.id }}",
        "updateBody": { "email": "{{ entity.email }}" },
        "emitOnUpdate": "reload-user"
      }
    }
  ]
}
```

The available zone names depend on the generic page — see the [Generic Pages documentation](../../generic-pages.md).

> **Tip:** beside a page that already provides its own navigation bar, set `enableNavigation` to `false` to avoid two back buttons.

---

## **Selectors**

Each element exposes a `data-cy` attribute for E2E testing and a BEM class for styling, built on the same suffix — `entity-profile-panel_{suffix}` and `.entity-profile-panel--{suffix}`:

| Suffix               | Element                        |
| -------------------- | ------------------------------ |
| _(root)_             | Panel root card                |
| `navigation-section` | Navigation section             |
| `back-button`        | Back button                    |
| `avatar-section`     | Avatar wrapper section         |
| `avatar-img`         | Profile image                  |
| `avatar-icon`        | Fallback icon inside the image |
| `status-badge`       | Status badge                   |
| `titles-section`     | Titles section                 |
| `title`              | Title text                     |
| `subtitle`           | Subtitle text                  |
| `actions-section`    | Actions section                |
| `edit-button`        | Edit button                    |
| `details-section`    | Details section                |

The scoped styles render the avatar as a circle (`border-radius: 50%`, `aspect-ratio: 1`), make the fallback icon fill it through a size container, and pin the status badge to its bottom-right. Override them through the design system rather than through CSS whenever possible.

> **Note:** to crop the image, use the `fit` prop of `q-img` rather than a CSS `object-fit` rule — `.entity-profile-panel--avatar-img` targets the `q-img` wrapper, not the inner `<img>`.

---

## **Dependencies**

`ButtonsCard`, `FormDialogButton`, `StatusBadge`, `BlurLoader` and `EntityDetailsCard` from this package; `LinidZoneRenderer`, `useUiDesign`, `useScopedI18n` and `uiEventSubject` from `@linagora/linid-im-front-corelib`; `@dicebear/core` and `@dicebear/styles` for client-side avatar generation; `vue-router` for the back navigation.
