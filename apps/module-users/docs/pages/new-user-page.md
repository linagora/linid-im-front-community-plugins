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

| Name             | Type                                         | Description                                                                                                                       |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `user`           | `Ref<Record<string, unknown>>`               | Reactive object holding the new user data being collected from the form (starts empty).                                           |
| `isLoading`      | `Ref<boolean>`                               | Boolean indicating if a save operation is in progress.                                                                            |
| `moduleConfig`   | `ComputedRef<ModuleHostConfiguration>`       | Computed configuration object for the module, retrieved via `getModuleHostConfiguration`.                                         |
| `options`        | `ComputedRef<ModuleUsersOptions>`            | Computed module options extracted from `moduleConfig.value.options`, includes `formSections` and `userIdKey`.                     |
| `attributes`     | `ComputedRef<LinidAttributeConfiguration[]>` | Asynchronously computed array of entity attribute configurations loaded from the entity specified in `moduleConfig.value.entity`. |
| `formSections`   | `ComputedRef<FormSection[]>`                 | Computed array of form sections, sorted by `order`, with fields dynamically resolved from `attributes`.                           |
| `buttonsCard`    | `Ref<Component \| null>`                     | Asynchronously loaded `ButtonsCard` component.                                                                                    |
| `fieldComponent` | `Ref<Component \| null>`                     | Asynchronously loaded `EntityAttributeField` component.                                                                           |
| `uiNamespace`    | `string`                                     | Namespace for UI design props (`{instanceId}.new-user-page`).                                                                     |
| `i18nScope`      | `string`                                     | Scope for i18n translations (`{instanceId}.NewUserPage`).                                                                         |
| `uiProps`        | `{ card: Record<string, LinidQCardProps> }`  | UI props for each form section card, keyed by section ID.                                                                         |
| `instanceId`     | `ComputedRef<string>`                        | Computed from the route meta, used for i18n and module configuration.                                                             |
| `parentPath`     | `ComputedRef<string>`                        | Computed path for navigation (typically `/users`).                                                                                |

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
3. Entity attributes are asynchronously loaded via `getEntityConfiguration`.
4. Form sections and fields are rendered based on `formSections` configuration, with fields resolved from loaded attributes.
5. User fills in field values through `EntityAttributeField` components.
6. Each change updates `user` via `v-model:entity` binding.
7. User clicks "Create" button (or presses Enter).
8. Form submission triggers `save()` method.
9. `saveEntity` API is called with current `user` data.
10. API returns the created user with its ID.
11. On success, positive notification is shown and user is redirected to the new user's detail page.
12. On error, negative notification is shown and user stays on creation page.

Alternatively, if user clicks "Cancel", they are immediately redirected to the user list page without saving.

---

## Dependencies

- `@linagora/linid-im-front-corelib` for:
  - `saveEntity` (creating new user)
  - `getEntityConfiguration` (loading entity attribute configurations from the entity specified in module configuration)
  - `loadAsyncComponent` (loading `ButtonsCard` and `EntityAttributeField`)
  - `useScopedI18n` and `useUiDesign`
  - `useNotify` (user notifications)
  - `getModuleHostConfiguration` (module configuration including options and entity reference)

- `vue-router` for route and navigation handling.
- `@vueuse/core` for `computedAsync` (asynchronous computed properties).
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
