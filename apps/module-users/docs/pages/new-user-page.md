# **NewUserPage.vue**

## Overview

`NewUserPage.vue` is the page component responsible for **creating a new user** in the LinID Identity Manager. It displays a configurable multi-section form for entering user details and handles save and cancel actions with proper validation.

The page supports i18n, dynamic form sections with ordered fields, automatic UI styling through the design system, and reactive form data collection.

---

## Features

- Renders a **multi-section form** based on the `formSections` configuration.
- Each section is displayed in a **separate card** with optional title and description.
- **Automatic sorting** of sections and fields by their `order` property.
- Dynamically renders **appropriate field components** based on `LinidAttributeConfiguration`.
- **Form validation** using native Quasar form submission.
- Uses **i18n** for all user-facing text with scoped translations.
- Integrates with the **LinID design system** for consistent styling per section.
- Provides **loading states** during save operations.
- **Notifications** for all operations (save success, save errors).
- **Smart navigation** - redirects to user detail page on success or user list on cancel.

---

## Props and Data

| Name             | Type                                        | Description                                                                             |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| `user`           | `Ref<Record<string, unknown>>`              | Reactive object holding the new user data being collected from the form (starts empty). |
| `isLoading`      | `Ref<boolean>`                              | Boolean indicating if a save operation is in progress.                                  |
| `formSections`   | `ComputedRef<FormSection[]>`                | Computed array of form sections, sorted by `order`, with fields also sorted by `order`. |
| `buttonsCard`    | `Ref<Component \| null>`                    | Asynchronously loaded `ButtonsCard` component.                                          |
| `fieldComponent` | `Ref<Component \| null>`                    | Asynchronously loaded `EntityAttributeField` component.                                 |
| `uiNamespace`    | `string`                                    | Namespace for UI design props (`{instanceId}.new-user-page`).                           |
| `i18nScope`      | `string`                                    | Scope for i18n translations (`{instanceId}.NewUserPage`).                               |
| `uiProps`        | `{ card: Record<string, LinidQCardProps> }` | UI props for each form section card, keyed by section ID.                               |
| `instanceId`     | `ComputedRef<string>`                       | Computed from the route meta, used for i18n and module configuration.                   |
| `parentPath`     | `ComputedRef<string>`                       | Computed path for navigation (typically `/users`).                                      |
| `options`        | `ModuleUsersOptions`                        | Configuration options for the module, including `formSections` and `userIdKey`.         |

---

## Methods

### `save()`

Saves the new user data and redirects to the user detail page.

- Sets `isLoading` to `true` while the request is in progress.
- Calls `saveEntity` with the current `user.value` data.
- On success, extracts the created user's ID using `userIdKey`, shows a positive notification, and redirects to the user detail page.
- On error, shows a negative notification and stays on the creation page.
- Sets `isLoading` to `false` when done.

Returns a Promise that resolves when the save process completes.

---

### `cancel()`

Cancels the user creation and redirects to the user list page without saving.

- Navigates to `parentPath` immediately.
- No data validation or saving occurs.

---

### `onFieldValueChange(updatedFields: Record<string, unknown>)`

Handles field value changes from the `EntityAttributeField` component.

- Updates `user.value` with the new field values.
- Builds up the user object as fields are filled in.

This method is called via the `@update:entity` event from each field component.

---

## Form Sections

The form structure is defined through the `formSections` option in the module configuration. Each section is a logical grouping of related fields.

### Configuration Structure

```typescript
export interface FormSection {
  id: string; // Unique identifier
  order: number; // Display order (lower = first)
  fields: EditableFieldConfiguration[]; // Array of field configs
}

export interface EditableFieldConfiguration<T = Record<string, unknown>> extends LinidAttributeConfiguration<T> {
  order: number; // Display order within section
}
```

### Section Rendering

- **Sections** are sorted by `order` before rendering (lower numbers appear first).
- **Fields** within each section are also sorted by `order`.
- Each section is rendered as a **Quasar card** (`q-card`).
- **Optional header** with title and description (only shown if i18n keys exist).
- Each field is rendered using the `EntityAttributeField` component.

### UI Customization Per Section

Each form section has its own UI namespace for granular styling:

```
{uiNamespace}.form-section-{sectionId}
```

Example: `users.new-user-page.form-section-main`

This allows different styling for each section's card and fields.

---

## Routing

- **Create page URL:** `/new` (e.g., `/users/new`)
- **On successful save:** Redirects to `{parentPath}/{userId}` (user detail page)
- **On cancel:** Redirects to `{parentPath}` (user list page)

The created user's ID is extracted from the API response using the `userIdKey` configuration.

---

## Internationalization

All user-facing text is translated using the i18n scope:

```ts
`${instanceId}.NewUserPage`;
```

### Required Translation Keys

```json
{
  "NewUserPage": {
    "title": "Create New User",
    "success": "User created successfully",
    "error": "Failed to create user",
    "formSections": {
      "main": {
        "title": "Basic Information",
        "description": "Essential user details"
      },
      "secondary": {
        "title": "Additional Settings"
      }
    },
    "ButtonsCard": {
      "confirm": "Create",
      "cancel": "Cancel",
      "confirmLoading": "Creating..."
    }
  }
}
```

**Note:** Section title and description are optional. If the translation key doesn't exist (checked via `te()`), the section header is not displayed.

---

## Example Workflow

1. User navigates to `/users/new`.
2. Component is mounted with an empty `user` object.
3. Form sections and fields are rendered based on `formSections` configuration.
4. User fills in field values through `EntityAttributeField` components.
5. Each change triggers `onFieldValueChange`, updating `user` with new values.
6. User clicks "Create" button (or presses Enter).
7. Form submission triggers `save()` method.
8. `saveEntity` API is called with current `user` data.
9. API returns the created user with its ID.
10. On success, positive notification is shown and user is redirected to the new user's detail page.
11. On error, negative notification is shown and user stays on creation page.

Alternatively, if user clicks "Cancel", they are immediately redirected to the user list page without saving.

---

## Dependencies

- `@linagora/linid-im-front-corelib` for:
  - `saveEntity` (creating new user)
  - `loadAsyncComponent` (loading `ButtonsCard` and `EntityAttributeField`)
  - `useScopedI18n` and `useUiDesign`
  - `useNotify` (user notifications)
  - `getModuleHostConfiguration` (module options)

- `vue-router` for route and navigation handling.
- `ButtonsCard` (Catalog UI component).
- `EntityAttributeField` (Catalog UI component).

---

## Usage Example

```js
{
  path: 'new',
  component: 'moduleUsers/NewUserPage',
  meta: {
    instanceId: 'users',
  },
}
```
