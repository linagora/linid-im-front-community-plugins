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
- Uses **i18n** for all user-facing text with scoped translations.
- Integrates with the **LinID design system** for consistent styling.
- Provides **loading states** for asynchronous data operations.
- **Error handling** with notifications and automatic redirect on load failure.

---

## Props and Data

| Name                | Type                                   | Description                                                                             |
| ------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `user`              | `Ref<Record<string, unknown> \| null>` | Reactive object holding the user's data (null until loaded).                            |
| `isLoading`         | `Ref<boolean>`                         | Boolean indicating if a data load is in progress.                                       |
| `entityDetailsCard` | `Ref<Component \| null>`               | Asynchronously loaded `EntityDetailsCard` component.                                    |
| `buttonsCard`       | `Ref<Component \| null>`               | Asynchronously loaded `ButtonsCard` component.                                          |
| `uiNamespace`       | `string`                               | Namespace for UI design props (`{instanceId}.user-details-page`).                       |
| `i18nScope`         | `string`                               | Scope for i18n translations (`{instanceId}.UserDetailsPage`).                           |
| `uiProps`           | `{ editButton: LinidQBtnProps }`       | UI props for the edit button.                                                           |
| `instanceId`        | `ComputedRef<string>`                  | Computed from the route meta, used for i18n and module configuration.                   |
| `userId`            | `ComputedRef<string>`                  | Computed from route params, identifies which user to load.                              |
| `parentPath`        | `ComputedRef<string>`                  | Computed path for navigation (typically `/users`).                                      |
| `options`           | `ModuleUsersOptions`                   | Configuration options for the module, including `fieldOrder` and `showRemainingFields`. |

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

## Edit Button

The page includes an **Edit** button in the footer, displayed using the `ButtonsCard` component with only the confirm button hidden and an edit button in the `#append-buttons` slot.

### Features

- Located in the page footer, aligned with the cancel/back button.
- Navigates to the user edit page (`/users/:id/edit`) when clicked.
- Styled via the UI design system using `{uiNamespace}.edit-button`.
- Labeled via i18n using the `edit` translation key.

### UI Customization

The edit button can be customized through the design system:

```json
{
  "user-details-page": {
    "edit-button": {
      "q-btn": {
        "color": "primary",
        "icon": "edit"
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
    "edit": "Edit",
    "error": "Failed to load user details",
    "ButtonsCard": {
      "cancel": "Back"
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
