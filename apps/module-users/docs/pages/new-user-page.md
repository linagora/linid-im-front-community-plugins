# NewUserPage.vue

## Overview

`NewUserPage.vue` is a page component responsible for creating a new user in the LinID Identity Manager. It provides a form interface for entering user details, handles the save and cancel actions, and displays notifications for success or error events. Upon successful creation, it redirects to the newly created user's detail page.

## Features

- Renders a form for new user creation using the `ButtonsCard` UI component (loaded asynchronously).
- Handles save and cancel actions with appropriate routing.
- Displays notifications for success and error cases using the notification system.
- Uses i18n for all user-facing text.

## Props and Data

- **user**: Reactive object holding the new user's data (initially empty).
- **isLoading**: Boolean indicating if the save operation is in progress.
- **buttonsCard**: Asynchronously loaded reference to the `ButtonsCard` component.
- **instanceId**: Computed from the route meta, used for configuration and i18n scope.
- **i18nScope**: Computed string for i18n translation keys.

## Methods

- **save()**: Saves the new user by calling `saveEntity`. On success, shows a positive notification and redirects to the new user's detail page. On error, shows a negative notification.
- **cancel()**: Cancels the creation and redirects back to the user list page.

## Notifications

- On successful creation: Shows a positive notification with a success message.
- On error: Shows a negative notification with an error message.

## Routing

- On save: Redirects to the detail page of the newly created user, using the user ID key from the module configuration.
- On cancel: Redirects to the user list page.

## Usage Example

This page is typically registered in the module's routes as follows:

```js
{
	path: 'new',
	component: 'moduleUsers/NewUserPage',
	meta: {
		instanceId: 'users',
	},
}
```

## Dependencies

- `@linagora/linid-im-front-corelib` for core utilities, notification, async component loading, and entity saving.
- `vue-router` for navigation and route information.
- `ButtonsCard` component from the catalog UI (loaded asynchronously).

## Internationalization

All user-facing text is translated using the i18n scope `${instanceId}.NewUserPage`.

## Example Workflow

1. User fills in the form and clicks "Save".
2. The page calls `saveEntity` to create the user.
3. On success, a notification is shown and the user is redirected to the new user's detail page.
4. On error, a notification is shown and the user remains on the page.
5. If the user clicks "Cancel", they are redirected back to the user list page.
