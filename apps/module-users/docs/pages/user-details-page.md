# UserDetailsPage.vue

## Overview

`UserDetailsPage.vue` is a page component responsible for displaying detailed information about a specific user in the LinID Identity Manager. It loads user data by ID, renders it using the `EntityDetailsCard` component, and provides navigation options to edit the user or return to the user list. The component handles loading states, errors, and uses configurable field ordering from the module configuration.

## Features

- Loads user data by ID when the page is mounted.
- Displays user attributes in a structured card format using the `EntityDetailsCard` component (loaded asynchronously).
- Supports configurable field ordering via `fieldOrder` and `showRemainingFields` options from module configuration.
- Provides navigation controls (back to list, edit user).
- Displays notifications for success and error cases using the notification system.
- Uses i18n for all user-facing text.

## Props and Data

- **user**: Reactive object holding the user's data (populated on load).
- **isLoading**: Boolean indicating if a load operation is in progress.
- **entityDetailsCard**: Asynchronously loaded reference to the `EntityDetailsCard` component.
- **buttonsCard**: Asynchronously loaded reference to the `ButtonsCard` component.
- **instanceId**: Computed from the route meta, used for configuration and i18n scope.
- **userId**: Computed from the route params, used to fetch the user.
- **options**: Module configuration options including `userIdKey`, `fieldOrder`, and `showRemainingFields`.
- **uiNamespace**: String namespace for UI design props and i18n.

## Methods

- **loadData()**: Loads the user entity by ID and updates the `user` state. On error, shows a notification and redirects to the user list page.
- **goToEdit()**: Navigates to the edit page for the current user.
- **goBack()**: Navigates back to the user list page.

## Notifications

- On load error: Shows a negative notification with an error message and redirects to the user list page.

## Routing

- On load error: Redirects to the user list page.
- On edit button click: Navigates to `/users/:id/edit`.
- On back button click: Navigates to the user list page.

## Usage Example

This page is typically registered in the module's routes as follows:

```js
{
	path: ':id',
	component: 'moduleUsers/UserDetailsPage',
	meta: {
		instanceId: 'users',
	},
}
```

## Dependencies

- `@linagora/linid-im-front-corelib` for core utilities, notification, async component loading, and entity loading.
- `vue-router` for navigation and route information.
- `EntityDetailsCard` component from the catalog UI (loaded asynchronously).
- `ButtonsCard` component from the catalog UI (loaded asynchronously).

## Internationalization

All user-facing text is translated using the i18n scope `${instanceId}.UserDetailsPage`.

Required translation keys:

```json
{
  "UserDetailsPage": {
    "title": "User Details",
    "edit": "Edit",
    "error": "Failed to load user details",
    "EntityDetailsCard": {
      "title": "User informations",
      "attributes": {
        "email": "Email",
        "username": "Username",
        "createdAt": "Created At",
        "updatedAt": "Updated At",
        "status": "Status"
      }
    }
  }
}
```

**Note**: Add translation keys for each field that will be displayed based on your `fieldOrder` and user data structure.

## Example Workflow

1. On mount, the page loads the user data by ID using `getEntityById`.
2. User data is displayed in the `EntityDetailsCard` with fields ordered according to module configuration.
3. Loading state is displayed while fetching data.
4. On load error, a notification is shown and the user is redirected to the user list page.
5. If the user clicks "Edit", they are navigated to the edit page for that user.
6. If the user clicks the back button, they are navigated back to the user list page.
