# **EditUserPage.vue**

## Overview

`EditUserPage.vue` is the page component responsible for **editing an existing user** in the LinID Identity Manager. It loads user data by ID, renders a configurable multi-section form, and handles save and cancel actions with proper validation and change detection.

The page supports i18n, dynamic form sections with ordered fields, automatic UI styling through the design system, and reactive change tracking.

---

## Features

- Loads **user data by ID** when the page mounts using `getEntityById`.
- Renders a **multi-section form** based on the `formSections` configuration.
- Each section is displayed in a **separate card** with optional title and description.
- **Automatic sorting** of sections and fields by their `order` property.
- Dynamically renders **appropriate field components** based on `LinidAttributeConfiguration`.
- **Change detection** - disables save button when form data matches initial state.
- **Form validation** using native Quasar form submission.
- Uses **i18n** for all user-facing text with scoped translations.
- Integrates with the **LinID design system** for consistent styling per section.
- Provides **loading states** during data fetch and save operations.
- **Notifications** for all operations (load errors, save success, save errors).
- **Smart navigation** - redirects appropriately based on operation outcomes.

---

## Props and Data

| Name             | Type                                         | Description                                                                                                                       |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `user`           | `Ref<Record<string, unknown>>`               | Reactive object holding the current user data being edited.                                                                       |
| `initialUser`    | `Ref<Record<string, unknown>>`               | Reactive object holding the original user data loaded from the backend (for change detection).                                    |
| `isLoadingUser`  | `Ref<boolean>`                               | Boolean indicating if the initial user data load is in progress (shows linear progress bar).                                      |
| `isLoading`      | `Ref<boolean>`                               | Boolean indicating if a save operation is in progress.                                                                            |
| `moduleConfig`   | `ComputedRef<ModuleHostConfiguration>`       | Computed configuration object for the module, retrieved via `getModuleHostConfiguration`.                                         |
| `options`        | `ComputedRef<ModuleUsersOptions>`            | Computed module options extracted from `moduleConfig.value.options`, includes `formSections`.                                     |
| `attributes`     | `ComputedRef<LinidAttributeConfiguration[]>` | Asynchronously computed array of entity attribute configurations loaded from the entity specified in `moduleConfig.value.entity`. |
| `formSections`   | `ComputedRef<FormSection[]>`                 | Computed array of form sections, sorted by `order`, with fields dynamically resolved from `attributes`.                           |
| `isDisabled`     | `ComputedRef<boolean>`                       | Computed boolean that is `true` when current data matches initial data (no changes).                                              |
| `buttonsCard`    | `Ref<Component \| null>`                     | Asynchronously loaded `ButtonsCard` component.                                                                                    |
| `fieldComponent` | `Ref<Component \| null>`                     | Asynchronously loaded `EntityAttributeField` component.                                                                           |
| `uiNamespace`    | `string`                                     | Namespace for UI design props (`{instanceId}.edit-user-page`).                                                                    |
| `i18nScope`      | `string`                                     | Scope for i18n translations (`{instanceId}.EditUserPage`).                                                                        |
| `uiProps`        | `{ card: Record<string, LinidQCardProps> }`  | UI props for each form section card, keyed by section ID.                                                                         |
| `instanceId`     | `ComputedRef<string>`                        | Computed from the route meta, used for i18n and module configuration.                                                             |
| `userId`         | `ComputedRef<string>`                        | Computed from route params, identifies which user to load and edit.                                                               |
| `parentPath`     | `ComputedRef<string>`                        | Computed path for navigation (typically `/users`).                                                                                |
| `userDetailPath` | `ComputedRef<string>`                        | Computed path to redirect after save/cancel (`{parentPath}/{userId}`).                                                            |

---

## Methods

### `loadData()`

Loads the user entity by ID from the backend using `getEntityById` and updates the `user` and `initialUser` state.

- Sets `isLoadingUser` to `true` while the request is in progress.
- Updates both `user.value` and `initialUser.value` with the fetched data.
- On error, shows a negative notification and redirects to the parent path.
- Sets `isLoadingUser` to `false` when done.

**Error handling:** If the user cannot be loaded, the user is redirected back to the user list.

---

### `save()`

Saves the edited user data and redirects to the user detail page.

- Sets `isLoading` to `true` while the request is in progress.
- Calls `updateEntity` with the current `user.value` data.
- On success, shows a positive notification and redirects to `userDetailPath`.
- On error, shows a negative notification and stays on the edit page.
- Sets `isLoading` to `false` when done.

Returns a Promise that resolves when the save process completes.

---

### `cancel()`

Cancels the edit operation and redirects to the user detail page without saving.

- Navigates to `userDetailPath` immediately.
- No data validation or saving occurs.

---

## Form Sections

The form structure is defined through the `formSections` option in the module configuration. Each section is a logical grouping of related fields.

### Configuration Structure

```typescript
export interface FormSection {
  id: string; // Unique identifier
  order: number; // Display order (lower = first)
  fieldsOrder: string[]; // Ordered array of field names to display
}
```

### Section Rendering

- **Sections** are sorted by `order` before rendering (lower numbers appear first).
- **Fields** are dynamically resolved by matching field names from `fieldsOrder` against the `attributes` array loaded from `getEntityConfiguration`.
- Field order within each section follows the order specified in `fieldsOrder`.
- Each section is rendered as a **Quasar card** (`q-card`).
- **Optional header** with title and description (only shown if i18n keys exist).
- Each field is rendered using the `EntityAttributeField` component.

### UI Customization Per Section

Each form section has its own UI namespace for granular styling:

```
{uiNamespace}.form-section-{sectionId}
```

Example: `users.edit-user-page.form-section-main`

This allows different styling for each section's card and fields.

---

## Change Detection

The component tracks whether the user has made any changes to the form data:

```typescript
const isDisabled = computed<boolean>(() => deepEqual(user.value, initialUser.value));
```

**Behavior:**

- Save button is **disabled** when `isDisabled` is `true` (no changes).
- Save button is also **disabled** when `isLoading` is `true` (save in progress).
- This prevents unnecessary API calls and provides clear UX feedback.

---

## Routing

- **Edit page URL:** `/:id/edit` (e.g., `/users/123/edit`)
- **On successful save:** Redirects to `{parentPath}/{userId}` (user detail page)
- **On cancel:** Redirects to `{parentPath}/{userId}` (user detail page)
- **On load error:** Redirects to `{parentPath}` (user list page)

The `id` route parameter determines which user to load and edit.

---

## Internationalization

All user-facing text is translated using the i18n scope:

```ts
`${instanceId}.EditUserPage`;
```

### Required Translation Keys

```json
{
  "EditUserPage": {
    "title": "Edit User",
    "loadError": "Failed to load user data",
    "editSuccess": "User updated successfully",
    "editError": "Failed to update user",
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
      "confirm": "Save",
      "cancel": "Cancel",
      "confirmLoading": "Saving..."
    }
  }
}
```

**Note:** Section title and description are optional. If the translation key doesn't exist (checked via `te()`), the section header is not displayed.

---

## Example Workflow

1. User navigates to `/users/123/edit`.
2. Entity attributes are asynchronously loaded via `getEntityConfiguration`.
3. On mount, `loadData()` fetches user data by ID.
4. `user` and `initialUser` are populated with the fetched data.
5. Form sections and fields are rendered based on `formSections` configuration, with fields resolved from loaded attributes.
6. User edits field values through `EntityAttributeField` components.
7. Each change updates `user` via `v-model:entity` binding and automatically recalculates `isDisabled`.
8. User clicks "Save" button (or presses Enter).
9. Form submission triggers `save()` method.
10. `updateEntity` API is called with current `user` data.
11. On success, positive notification is shown and user is redirected to detail page.
12. On error, negative notification is shown and user stays on edit page.

Alternatively, if user clicks "Cancel", they are immediately redirected to the detail page without saving.

---

## Dependencies

- `@linagora/linid-im-front-corelib` for:
  - `getEntityById` (fetching user data)
  - `updateEntity` (saving user data)
  - `getEntityConfiguration` (loading entity attribute configurations from the entity specified in module configuration)
  - `loadAsyncComponent` (loading `ButtonsCard` and `EntityAttributeField`)
  - `useScopedI18n` and `useUiDesign`
  - `useNotify` (user notifications)
  - `getModuleHostConfiguration` (module configuration including options and entity reference)
  - `deepEqual` (change detection)

- `vue-router` for route and navigation handling.
- `@vueuse/core` for `computedAsync` (asynchronous computed properties).
- `ButtonsCard` (Catalog UI component).
- `EntityAttributeField` (Catalog UI component).

---

## Usage Example

```js
{
  path: ':id/edit',
  component: 'moduleUsers/EditUserPage',
  meta: {
    instanceId: 'users',
  },
}
```
