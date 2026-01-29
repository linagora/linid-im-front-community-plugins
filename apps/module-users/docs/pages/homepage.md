# **HomePage.vue**

## Overview

`HomePage.vue` is the main page component responsible for displaying a **list of users** in the LinID Identity Manager. It renders a paginated table of users using the `GenericEntityTable` component and provides a way to navigate to individual user detail pages.

The page supports i18n, dynamic table columns, row-level actions, and reactive pagination.

---

## Features

- Displays a **paginated table** of users using the `GenericEntityTable` wrapper around Quasar's `QTable`.
- Supports **customizable table columns** via the `userTableColumns` configuration.
- **Optional advanced search** with configurable filters via `AdvancedSearchCard`.
- Handles **row-level actions**, such as navigating to the user detail page.
- Reactive **pagination** with server-side data loading using `getEntities`.
- Uses **i18n** for all user-facing text.
- Integrates with the LinID design system for styling and UI props.
- Provides **loading states** for asynchronous data operations.

---

## Props and Data

| Name                      | Type                                         | Description                                                                                            |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --- |
| `users`                   | `Ref<Record<string, unknown>[]>`             | Reactive array holding the list of users loaded from the backend.                                      |
| `isLoading`               | `Ref<boolean>`                               | Boolean indicating if a data load is in progress.                                                      |
| `filters`                 | `Ref<Record<string, unknown>>`               | Reactive object holding the current search filters.                                                    |
| `columns`                 | `ComputedRef<QTableColumn[]>`                | Computed table columns, translated via i18n.                                                           |
| `pagination`              | `Ref<QuasarPagination>`                      | Reactive pagination object for the table (`page`, `rowsPerPage`, `sortBy`, `descending`).              |
| `tableComponent`          | `Ref<Component \| null>`                     | Asynchronously loaded `GenericEntityTable` component.                                                  |
| `advancedSearchComponent` | `Ref<Component \| null>`                     | Asynchronously loaded `AdvancedSearchCard` component.                                                  |     |
| `uiNamespace`             | `ComputedRef<string>`                        | Namespace for UI design props and i18n.                                                                |
| `uiProps`                 | `ComputedRef<{ seeButton: LinidQBtnProps }>` | UI props for row-level buttons.                                                                        |
| `instanceId`              | `ComputedRef<string>`                        | Computed from the route meta, used for i18n and module configuration.                                  |
| `parentPath`              | `ComputedRef<string>`                        | Computed path for routing to user detail pages.                                                        |
| `options`                 | `ComputedRef<ModuleUsersOptions>`            | Configuration options for the module, including `userIdKey`, `userTableColumns`, and `advancedSearch`. |

---

## Methods

### `loadData()`

Loads a paginated list of users from the backend using `getEntities` and updates the `users` state.

- Sets `isLoading` to `true` while the request is in progress.
- Updates `users.value` with the fetched data.
- Sets `isLoading` to `false` when done.
- On error, clears the user list and optionally shows a notification.

---

### `onRequest(props: QTableRequestEvent)`

Triggered when the table requests new data (pagination, sorting).

- Updates `pagination.value` with the new table pagination.
- Calls `loadData()` to fetch updated user data from the backend.

---

### `goToUser(user: Record<string, unknown>)`

Navigates to the detail page of the selected user.

- Uses `options.userIdKey` to determine which property in the user object identifies the user.
- Builds the route using `parentPath.value` and the user identifier.

Example:

```ts
goToUser(user); // Navigates to /users/:id
```

---

### `onFiltersChange(newFilters: Record<string, unknown>)`

Handles filter changes from the `AdvancedSearchCard` component.

- Updates `filters.value` with the new filters.
- Resets `pagination.value.page` to `1` to show results from the first page.
- Calls `loadData()` to fetch updated user data with the new filters.

---

### `buildQueryParams()`

Builds the query parameters from the current filters for the API request.

- Filters out empty values (`undefined`, `null`, `''`) to avoid sending unnecessary parameters.
- Returns a record of non-empty filter values.

---

## Advanced Search

When the `advancedSearch` option is configured in the module options, the page displays an `AdvancedSearchCard` component above the user table.

### Features

- **Default filters**: Always visible fields for common search criteria.
- **Advanced filters**: Expandable section for additional search fields.
- **Two-way binding**: Filter values are synchronized with the page state.
- **Automatic data refresh**: Changing filters triggers a new data fetch with updated query parameters.

### Configuration

The advanced search is configured via the `advancedSearch` option in `moduleUsers.json`. See [configuration.md](../configuration.md) for details.

### Required i18n Keys

When using advanced search, add the following translation keys:

```json
{
  "HomePage": {
    "AdvancedSearchCard": {
      "title": "Search",
      "moreFilters": "More filters",
      "lessFilters": "Less filters",
      "fields": {
        "email": "Email",
        "firstName": "First Name"
      }
    }
  }
}
```

> Add a translation key for each field defined in `advancedSearch.fields`.

---

## Table Columns

The table supports dynamic columns defined via the `userTableColumns` option in the module configuration.

### Standard Columns

Each column object allows customization of the table layout:

- `name`: internal column identifier
- `label`: displayed column header (can be translated via i18n)
- `field`: property in the user data to display
- `align`: alignment of the cell content (`left`, `right`, `center`)
- Other Quasar `QTableColumn` properties like `sortable` or `format` are also supported

> Note: Column rendering, sorting, and alignment are **handled by Quasar**; the `GenericEntityTable` passes these definitions directly to `QTable`. See [q-table](https://github.com/linagora/linid-im-front-corelib/blob/main/docs/ui-design.md#q-table) on ui-design documentation.

---

### Special Column: `table_actions`

The table can include a special **actions column** reserved for buttons or other row-level actions (e.g., “See User”).

#### Column Definition

```json
{
  "name": "table_actions",
  "field": "id",
  "label": "column-action",
  "style": "width: 200px",
  "headerStyle": "width: 200px"
}
```

#### Explanation

| Property      | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| `name`        | Internal column name, always `"table_actions"`                           |
| `field`       | Property from the row object to bind to (typically the user identifier)  |
| `label`       | Column header label. Can be translated using i18n (`t('column-action')`) |
| `style`       | CSS style applied to each cell in the actions column                     |
| `headerStyle` | CSS style applied to the column header                                   |

> Note: The **width and rendering** of this column are **managed by Quasar**. `GenericEntityTable` exposes the slot `#body-cell-table_actions` to customize content for each row.

---

## Routing

- Navigating to a user: `/users/:id` (via `goToUser`).
- Pagination and table requests do **not** change the route; they update the table data only.

---

## Internationalization

All user-facing text is translated using the i18n scope:

```ts
`${instanceId}.HomePage`;
```

Example:

```vue
<h4>{{ t('title') }}</h4>
<q-btn :label="t('seeUserButton')" />
```

---

## Example Workflow

1. On mount, `loadData()` fetches the first page of users.
2. Users are displayed in a paginated table.
3. Clicking a **See User** button in the `table_actions` column calls `goToUser()` and navigates to the user's detail page.
4. Changing pagination or sorting triggers `onRequest()` to fetch the updated page.
5. Loading state is displayed while fetching data.

---

## Dependencies

- `@linagora/linid-im-front-corelib` for:
  - `getEntities` (fetching user data)
  - `loadAsyncComponent` (loading `GenericEntityTable` and `AdvancedSearchCard`)
  - `usePagination` (table pagination)
  - `useScopedI18n` and `useUiDesign`

- `vue-router` for route and navigation handling.
- `GenericEntityTable` (Catalog UI component).
- `AdvancedSearchCard` (Catalog UI component, optional).

---

## Usage Example

```js
{
  path: '/users',
  component: 'moduleUsers/HomePage',
  meta: {
    instanceId: 'users',
  },
}
```
