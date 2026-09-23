# **MenuButton ☰**

The **MenuButton** component groups a few actions behind a single button opening a menu, typically
a round icon button standing on the edge of an image or in a card corner. Each row of the menu is a
`q-item` hosting a regular Catalog UI action button — `FormDialogButton`, `ConfirmDialogButton`,
`RedirectButton`… — so each action keeps its own behavior, dialogs and notifications. The rows are
named by the `items` prop and provided either through a named slot per item, or through a plugin
zone per item declared in the host configuration.

---

## **🎯 Purpose**

- Groups several actions behind one button, revealed in a menu
- Hosts any Catalog UI action button as a menu row, without re-implementing their behavior
- Lets the host configuration declare the rows through one plugin zone per item
- Lets the design system style the button, the menu, the list, the rows and each action independently
- Leaves its positioning to the hosting component or page

---

## **⚙️ Props**

| Prop name     | Type                              | Default | Description                                                                                                                 |
| ------------- | --------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `items`       | `string[]`                        | —       | Names of the menu rows, in display order: each is the named slot of the row and, with `zone`, the suffix of its plugin zone |
| `zone`        | `Boolean`                         | `false` | Renders each row from its plugin zone `${uiNamespace}.menu-button.${item}` instead of its named slot                        |
| `disable`     | `Boolean`                         | `false` | Disables the button, preventing the menu from opening                                                                       |
| `entity`      | `Record<string, unknown> \| null` | —       | Entity associated with the current context, forwarded to the item zones. Injected by the hosting zone                       |
| `parent`      | `Record<string, unknown> \| null` | —       | Parent of the entity (e.g. the application owning a role), forwarded to the item zones                                      |
| `instanceId`  | `String`                          | —       | Module instance identifier, forwarded to the item zones and used as i18n scope fallback                                     |
| `uiNamespace` | `String`                          | —       | Base UI namespace used for design system customization                                                                      |
| `i18nScope`   | `String`                          | —       | Identifier used to scope translations                                                                                       |

---

## **🎰 Slots**

One named slot per entry of `items`, holding the action button of that row. The slots are ignored when
`zone` is enabled.

---

## **🧩 Internal Behavior**

- The button opens a `q-menu` holding a `q-list` with one `q-item` per entry of `items`, in
  that order; each row renders the named slot of its item, or its plugin zone
  `${uiNamespace}.menu-button.${item}` when `zone` is enabled. The zone of an item receives `entity`,
  `parent`, `instanceId`, the UI namespace `${uiNamespace}.menu-button.${item}` and the i18n scope
  `${i18nScope}.MenuButton.${item}`, so each action is styled and translated on its own
- The menu closes when a row is clicked (`auto-close`, overridable from the design system), so an
  action button both closes the menu and runs its own behavior, such as opening its dialog
- Every hosted button fills its row (`width: 100%`) and carries its own hover, ripple and keyboard
  focus: the row itself is not clickable, so the button stays reachable with the keyboard. Style it
  as a flat, left-aligned button with an icon from the design system to get the menu look
- The component does not position itself: the host places it, for example with an absolute position
  on the edge of an image

> **Note:** the menu unmounts its rows when it closes, so an action button is already unmounted when
> its request completes: its `submitted` event is then emitted by a dead component and reaches no
> listener. React to the action through its `emitOnSubmit` key on `uiEventSubject` instead.

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.MenuButton`, the `i18nScope` prop falling back to the
`instanceId` prop. When neither is provided, the scope is `MenuButton` alone:

| Key     | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `title` | Optional label of the button, empty by default for an icon button |

When the rows come from zones, the action of an item resolves its keys under `MenuButton.${item}`, then
appends its component name (`MenuButton.editImage.FormDialogButton.*`,
`MenuButton.deleteImage.ConfirmDialogButton.*`…). When the rows come from slots, the host gives each
action its own sub-scope the same way, as `EntityProfilePanel` does with `MenuButton.editImageButton`
and `MenuButton.deleteImageButton`.

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.menu-button`:

| Namespace                           | Type     | Description                                                                                                                     |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `${uiNamespace}.menu-button`        | `q-btn`  | The button opening the menu (e.g. `round`, `icon`, `color`)                                                                     |
| `${uiNamespace}.menu-button`        | `q-menu` | The menu (e.g. `anchor`, `self`, `offset`, `autoClose`)                                                                         |
| `${uiNamespace}.menu-button`        | `q-list` | The list holding the rows (e.g. `dense`, `separator`)                                                                           |
| `${uiNamespace}.menu-button`        | `q-item` | Every row (e.g. `dense`)                                                                                                        |
| `${uiNamespace}.menu-button.[ITEM]` | —        | Namespace forwarded to the zone of an item; its action appends its own segment (`form-dialog-button`, `confirm-dialog-button`…) |

```json
{
  "[PARENT_NAMESPACE]": {
    "menu-button": {
      "q-btn": { "round": true, "icon": "edit", "outline": false },
      "q-menu": { "anchor": "bottom right" },
      "q-item": { "dense": true },
      "editImage": {
        "form-dialog-button": {
          "q-btn": { "flat": true, "align": "left", "icon": "photo_camera", "outline": false }
        }
      },
      "deleteImage": {
        "confirm-dialog-button": {
          "q-btn": { "flat": true, "align": "left", "icon": "delete", "color": "negative", "outline": false }
        }
      }
    }
  }
}
```

---

## **🧩 Usage Examples**

### Through a zone configuration

The component is declared in the `zones` property of the module host configuration (see
[Generic Pages](../../generic-pages.md)) with `zone` enabled, and each row is declared in the zone of
its item. A generic page passes its instance identifier as UI namespace to the zones it hosts, so the
item zones of a `MenuButton` placed in `moduleAccountDetailsPage.header.actions` are
`moduleAccountDetailsPage.menu-button.<item>`:

```json
[
  {
    "zone": "moduleAccountDetailsPage.header.actions",
    "plugin": "catalogUI/MenuButton",
    "props": { "items": ["editImage", "deleteImage"], "zone": true }
  },
  {
    "zone": "moduleAccountDetailsPage.menu-button.editImage",
    "plugin": "catalogUI/FormDialogButton",
    "props": {
      "url": "/avatars/accounts/{{ entity.id }}",
      "multipart": true,
      "formFields": [{ "name": "file", "type": "File", "input": "File", "required": true, "inputSettings": {} }],
      "emitOnSubmit": "account-avatar-updated"
    }
  },
  {
    "zone": "moduleAccountDetailsPage.menu-button.deleteImage",
    "plugin": "catalogUI/ConfirmDialogButton",
    "props": { "url": "/avatars/accounts/{{ entity.id }}", "method": "DELETE", "emitOnSubmit": "account-avatar-updated" }
  }
]
```

### Direct usage

```vue
<MenuButton :items="['editImage', 'deleteImage']" ui-namespace="profile.avatar" i18n-scope="profile.avatar" class="absolute-bottom-right">
  <template #editImage>
    <FormDialogButton :entity="entity" url="/avatars/accounts/{{ entity.id }}" multipart :form-fields="fields" emit-on-submit="avatar-updated" ui-namespace="profile.avatar.menu-button.editImage" i18n-scope="profile.avatar.MenuButton.editImage" />
  </template>
  <template #deleteImage>
    <ConfirmDialogButton :entity="entity" url="/avatars/accounts/{{ entity.id }}" method="DELETE" emit-on-submit="avatar-updated" ui-namespace="profile.avatar.menu-button.deleteImage" i18n-scope="profile.avatar.MenuButton.deleteImage" />
  </template>
</MenuButton>
```

---

## **Selectors**

| Selector                  | Element                        |
| ------------------------- | ------------------------------ |
| `menu-button`             | The button opening the menu    |
| `menu-button_menu`        | The menu, rendered in the body |
| `menu-button_item_[ITEM]` | The row of an item             |

---

## **✅ Advantages**

- **Compact:** A couple of actions behind one icon button, no permanent layout space
- **Composable:** Hosts the existing action buttons, nothing is re-implemented
- **Configurable:** Rows are declared through zones, styled through the design system
- **Zone-ready:** Designed to be rendered through a zone with the entity injected
