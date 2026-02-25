# **UserDetailsPage.vue**

## Overview

`UserDetailsPage.vue` is the page component responsible for **displaying detailed information about a specific user** in the LinID Identity Manager. It loads user data by ID, renders it using the `EntityDetailsCard` component, and provides navigation options to edit the user or return to the user list.

The page supports i18n, configurable field ordering, automatic UI styling through the design system, and reactive data loading.

---

## Features

- Loads **user data by ID** when the page mounts using `getEntityById`.
- Displays user attributes in a **structured card format** using the `EntityDetailsCard` component.
- Supports **configurable field ordering** via `fieldOrder` option.
- Supports **optional display of remaining fields** via `showRemainingFields` option.
- Provides **navigation controls** (back to list, edit user) via `ButtonsCard` component.
- Supports **plugin zones** for extending the page with relationship forms and data displays.
- Uses **i18n** for all user-facing text with scoped translations.
- Integrates with the **LinID design system** for consistent styling.
- Provides **loading states** for asynchronous data operations.
- **Error handling** with notifications and automatic redirect on load failure.

---

## Props and Data

| Name                | Type                                          | Description                                                                             |
| ------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `user`              | `Ref<Record<string, unknown> \| null>`        | Reactive object holding the user's data (null until loaded).                            |
| `isLoading`         | `Ref<boolean>`                                | Boolean indicating if a data load is in progress.                                       |
| `entityDetailsCard` | `Ref<Component \| null>`                      | Asynchronously loaded `EntityDetailsCard` component.                                    |
| `buttonsCard`       | `Ref<Component \| null>`                      | Asynchronously loaded `ButtonsCard` component.                                          |
| `pageName`          | `string`                                      | Constant page name (`UserDetailsPage`), used for zone names and i18n scope.             |
| `uiNamespace`       | `ComputedRef<string>`                         | Computed namespace for UI design props (`{instanceId}.user-details-page`).              |
| `i18nScope`         | `ComputedRef<string>`                         | Computed scope for i18n translations (`{instanceId}.UserDetailsPage`).                  |
| `uiProps`           | `ComputedRef<{ editButton: LinidQBtnProps }>` | Computed UI props for the edit button.                                                  |
| `instanceId`        | `ComputedRef<string>`                         | Computed from the route meta, used for i18n and module configuration.                   |
| `userId`            | `ComputedRef<string>`                         | Computed from route params, identifies which user to load.                              |
| `parentPath`        | `ComputedRef<string>`                         | Computed path for navigation (typically `/users`).                                      |
| `options`           | `ModuleUsersOptions`                          | Configuration options for the module, including `fieldOrder` and `showRemainingFields`. |

---

## Methods

### `loadData()`

Loads the user entity by ID from the backend using `getEntityById` and updates the `user` state.

- Sets `isLoading` to `true` while the request is in progress.
- Updates `user.value` with the fetched data.
- On error, shows a negative notification and redirects to the user list page by calling `goBack()`.
- Sets `isLoading` to `false` when done.

**Error handling:** If the user cannot be loaded, the user is redirected back to the user list.

---

### `goToEdit()`

Navigates to the edit page for the current user.

- Builds the route using `parentPath.value`, `userId.value`, and `/edit`.
- Called when the "Edit" button is clicked.

Example:

```ts
goToEdit(); // Navigates to /users/:id/edit
```

---

### `goBack()`

Navigates back to the user list page.

- Uses `parentPath.value` to build the route.
- Called when the "Cancel" button is clicked or when a load error occurs.

Example:

```ts
goBack(); // Navigates to /users
```

---

## Field Ordering

The `EntityDetailsCard` component displays user attributes in a specific order based on module configuration:

### Configuration Options

- **`fieldOrder`**: Array of field names defining the display order. Fields appear in the order specified.
- **`showRemainingFields`**: Boolean indicating whether fields not in `fieldOrder` should be displayed after ordered fields (default: `false`).

Example configuration:

```json
{
  "fieldOrder": ["username", "email", "firstName", "lastName", "status"],
  "showRemainingFields": true
}
```

**Behavior:**

- Fields in `fieldOrder` appear first, in the specified order.
- If `showRemainingFields` is `true`, remaining user attributes appear after ordered fields.
- If `showRemainingFields` is `false`, only fields in `fieldOrder` are displayed.

---

## Plugin Zones

The page provides two plugin zones that allow other modules to extend functionality:

### `{instanceId}.UserDetailsPage.relationshipForms`

Zone for rendering forms related to user relationships (e.g., group membership forms, role assignment forms).

- Rendered below the user details card.
- Plugins can register components in this zone to add relationship management UI.
- The `userId` of the current user is automatically forwarded to all registered components.

### `{instanceId}.UserDetailsPage.relationshipData`

Zone for displaying relationship data (e.g., list of groups, assigned roles).

- Rendered below the relationship forms zone.
- Plugins can register components in this zone to display related entities.
- The `userId` of the current user is automatically forwarded to all registered components.

### Props forwarded to zone components

| Prop     | Type     | Description                         |
| -------- | -------- | ----------------------------------- |
| `userId` | `string` | The ID of the currently viewed user |

**Example zone usage:**

```ts
const zoneStore = useLinidZoneStore();
zoneStore.registerOnce('users.UserDetailsPage.relationshipForms', {
  plugin: 'myModule/UserGroupsForm',
});

zoneStore.registerOnce('users.UserDetailsPage.relationshipData', {
  plugin: 'myModule/UserGroupsList',
});
```

**Example zone component receiving props:**

```ts
// myModule/UserGroupsForm.vue
const props = defineProps<{
  userId: string;
}>();
```

---

## Edit Button

The page includes an **Edit** button in the footer, displayed using the `ButtonsCard` component with only the confirm button hidden and an edit button in the `#append-buttons` slot.

### Features

- Located in the page header actions area, aligned with the title.
- Navigates to the user edit page (`/users/:id/edit`) when clicked.
- Styled via the UI design system using `{uiNamespace}.buttons-card.edit-button`.
- Labeled via i18n using the `ButtonsCard.edit` translation key.

### UI Customization

The edit button can be customized through the design system:

```json
{
  "user-details-page": {
    "buttons-card": {
      "edit-button": {
        "q-btn": {
          "color": "primary",
          "icon": "edit"
        }
      }
    }
  }
}
```

---

## Routing

- **Detail page URL:** `/:id` (e.g., `/users/123`)
- **On Edit button click:** Navigates to `{parentPath}/{userId}/edit` (edit page)
- **On Cancel/Back button click:** Navigates to `{parentPath}` (user list page)
- **On load error:** Redirects to `{parentPath}` (user list page)

The `id` route parameter determines which user to load and display.

---

## Internationalization

All user-facing text is translated using the i18n scope:

```ts
`${instanceId}.UserDetailsPage`;
```

### Required Translation Keys

```json
{
  "UserDetailsPage": {
    "title": "User Details",
    "error": "Failed to load user details",
    "ButtonsCard": {
      "cancel": "Back",
      "edit": "Edit"
    },
    "EntityDetailsCard": {
      "title": "User Information",
      "attributes": {
        "username": "Username",
        "email": "Email",
        "firstName": "First Name",
        "lastName": "Last Name",
        "status": "Status",
        "createdAt": "Created At",
        "updatedAt": "Updated At"
      }
    }
  }
}
```

**Note:** Add translation keys for each field that will be displayed based on your `fieldOrder` and user data structure.

---

## Example Workflow

1. User navigates to `/users/123`.
2. On mount, `loadData()` fetches user data by ID.
3. `user` is populated with the fetched data.
4. User data is displayed in the `EntityDetailsCard` with fields ordered according to `fieldOrder`.
5. Loading state is displayed while fetching data.
6. User can click "Edit" button to navigate to the edit page.
7. User can click "Back" button to return to the user list page.

Alternatively, if loading fails:

1. A negative notification is shown.
2. User is automatically redirected to the user list page.

---

## Dependencies

- `@linagora/linid-im-front-corelib` for:
  - `getEntityById` (fetching user data)
  - `loadAsyncComponent` (loading `EntityDetailsCard` and `ButtonsCard`)
  - `useScopedI18n` and `useUiDesign`
  - `useNotify` (user notifications)
  - `getModuleHostConfiguration` (module options)
  - `LinidZoneRenderer` (plugin zone rendering)

- `vue-router` for route and navigation handling.
- `EntityDetailsCard` (Catalog UI component).
- `ButtonsCard` (Catalog UI component).

---

## Usage Example

```js
{
  path: ':id',
  component: 'moduleUsers/UserDetailsPage',
  meta: {
    instanceId: 'users',
  },
}
```
