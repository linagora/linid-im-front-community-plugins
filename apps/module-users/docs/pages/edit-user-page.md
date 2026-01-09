# EditUserPage.vue

## Overview

`EditUserPage.vue` is a page component responsible for editing an existing user in the LinID Identity Manager. It loads the user data by ID, displays a form for editing, and handles save and cancel actions. The component provides notifications for success or error events and manages navigation accordingly.

## Features

- Loads user data by ID when the page is mounted.
- Renders a form for editing user details using the `ButtonsCard` UI component (loaded asynchronously).
- Handles save and cancel actions with appropriate routing.
- Displays notifications for success and error cases using the notification system.
- Uses i18n for all user-facing text.

## Props and Data

- **user**: Reactive object holding the user's data (populated on load).
- **isLoading**: Boolean indicating if a load or save operation is in progress.
- **buttonsCard**: Asynchronously loaded reference to the `ButtonsCard` component.
- **instanceId**: Computed from the route meta, used for configuration and i18n scope.
- **userId**: Computed from the route params, used to fetch and update the user.
- **i18nScope**: Computed string for i18n translation keys.

## Methods

- **loadData()**: Loads the user entity by ID and updates the `user` state. On error, shows a notification and redirects to the user list page.
- **save()**: Saves the edited user by calling `updateEntity`. On success, shows a positive notification and redirects to the user's detail page. On error, shows a negative notification.
- **cancel()**: Cancels the edit and redirects to the user's detail page.

## Notifications

- On load error: Shows a negative notification and redirects to the user list page.
- On successful edit: Shows a positive notification and redirects to the user's detail page.
- On edit error: Shows a negative notification and remains on the page.

## Routing

- On load error: Redirects to the user list page.
- On save: Redirects to the user's detail page.
- On cancel: Redirects to the user's detail page.

## Usage Example

This page is typically registered in the module's routes as follows:

```js
{
	path: ':id/edit',
	component: 'moduleUsers/EditUserPage',
	meta: {
		instanceId: 'users',
	},
}
```

## Dependencies

- `@linagora/linid-im-front-corelib` for core utilities, notification, async component loading, entity loading, and updating.
- `vue-router` for navigation and route information.
- `ButtonsCard` component from the catalog UI (loaded asynchronously).

## Internationalization

All user-facing text is translated using the i18n scope `${instanceId}.EditUserPage`.

## Example Workflow

1. On mount, the page loads the user data by ID.
2. User edits the form and clicks "Save".
3. The page calls `updateEntity` to update the user.
4. On success, a notification is shown and the user is redirected to the user's detail page.
5. On error, a notification is shown and the user remains on the page.
6. If the user clicks "Cancel", they are redirected to the user's detail page.
