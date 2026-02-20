# **ImportPage.vue**

## Overview

`ImportPage.vue` is the main page component responsible for handling **bulk data import** in the LinID Identity Manager.

It provides:

* A file loading interface (`LoadFilesCard`)
* A preview table of parsed rows (`ImportedDataTable`)
* Batch import execution with controlled concurrency
* Status tracking per row (`READY`, `IMPORTING`, `IMPORTED`, `ERROR`)
* Clear and cancel actions
* UI customization via the LinID design system
* Scoped i18n support

The page is designed to import structured data (e.g., CSV/JSON transformed into `ImportedData`) to a backend API endpoint defined in the module configuration.

---

## Features

* Upload and parse files via `LoadFilesCard`
* Preview normalized data in `ImportedDataTable`
* Parallel import with configurable concurrency
* Per-row status tracking
* Aggregated success/warning/error notifications
* Selective clearing of rows by status
* Fully integrated with LinID UI design and i18n
* Async loading of `ButtonsCard`

---

## Props and Data

| Name           | Type                                           | Description                                                              |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| `instanceId`   | `ComputedRef<string>`                          | Derived from route meta, used for configuration, i18n, and UI namespace. |
| `i18nScope`    | `ComputedRef<string>`                          | Translation scope: `${instanceId}.ImportPage`.                           |
| `uiNamespace`  | `ComputedRef<string>`                          | UI namespace: `${instanceId}.import-page`.                               |
| `moduleConfig` | `ModuleHostConfiguration<ModuleImportOptions>` | Module configuration retrieved via `getModuleHostConfiguration`.         |
| `fileItems`    | `Ref<ImportedData[]>`                          | Reactive list of parsed rows ready for import.                           |
| `isLoading`    | `Ref<boolean>`                                 | Indicates whether import operations are in progress.                     |
| `isDisabled`   | `ComputedRef<boolean>`                         | Disables confirm/clear actions when no rows are loaded.                  |
| `limit`        | `Function`                                     | Concurrency limiter from `p-limit`, based on `numberOfParallelImports`.  |
| `buttonsCard`  | `Component \| null`                            | Asynchronously loaded `ButtonsCard` component.                           |
| `uiProps`      | `{ exportButton, clearButton }`                | UI configuration for action buttons.                                     |

---

## Module Configuration

The page depends on `ModuleImportOptions` retrieved through:

```ts
getModuleHostConfiguration<ModuleImportOptions>(instanceId.value)
```

Expected options:

| Option                    | Type     | Description                            |
| ------------------------- | -------- | -------------------------------------- |
| `apiEndpoint`             | `string` | Backend endpoint used for row import.  |
| `previousPath`            | `string` | Route path to navigate back on cancel. |
| `numberOfParallelImports` | `number` | Maximum concurrent import requests.    |

---

## Import Lifecycle

Each row (`ImportedData`) contains internal metadata:

| Property   | Purpose                                                  |
| ---------- | -------------------------------------------------------- |
| `__id`     | Internal unique identifier                               |
| `__status` | Import state (`READY`, `IMPORTING`, `IMPORTED`, `ERROR`) |
| `__error`  | Error message (if failed)                                |
| `__file`   | Source file reference                                    |

Only business fields are sent to the backend; internal fields are stripped before POST.

---

## Methods

### `updateData(items: ImportedData[])`

Replaces the current dataset with parsed and normalized rows emitted by `LoadFilesCard`.

* Fully reactive update
* Enables import actions

---

### `deleteRow(id: number)`

Removes a row from the dataset by its internal `__id`.

Used by `ImportedDataTable` via `@delete:item`.

---

### `cancel()`

Redirects to the configured `previousPath`.

```ts
router.push({ path: moduleConfig.options.previousPath });
```

---

### `importAllData(): Promise<void>`

Imports all loaded rows with controlled concurrency.

Process:

1. Sets `isLoading = true`
2. Executes imports via `Promise.all`
3. Limits concurrency using `p-limit`
4. Aggregates results
5. Displays notification:

  * `positive` → all succeeded
  * `warning` → partial success
  * `error` → all failed
6. Resets loading state

---

### `importData(data: ImportedData): Promise<boolean>`

Imports a single row.

Steps:

1. Sets status to `IMPORTING`
2. Removes internal fields
3. Sends `POST` request to `apiEndpoint`
4. On success:

  * Sets `__status = IMPORTED`
5. On failure:

  * Sets `__status = ERROR`
  * Stores error message
6. Returns `true` or `false`

Backend call:

```ts
getHttpClient().post(moduleConfig.apiEndpoint, dataToSend);
```

---

### `clear(allStatus: string[])`

Removes rows whose `__status` matches provided values.

Example:

```ts
clear(['ERROR']);
clear(['IMPORTED']);
clear(['READY', 'IMPORTING', 'IMPORTED', 'ERROR']);
```

Displays success notification after cleanup.

---

## UI Structure

### Header

Displays page title:

```vue
<h1>{{ t('title') }}</h1>
```

---

### File Upload Section

Component: `LoadFilesCard`

Responsibilities:

* File selection
* Parsing
* Data normalization
* Emits `update:data`

Props passed:

* `instance-id`
* `ui-namespace`
* `i18n-scope`

---

### Preview Table

Component: `ImportedDataTable`

Responsibilities:

* Displays imported rows
* Shows per-row status
* Emits `delete:item`

Props:

* `rows`
* `is-loading`
* `instance-id`
* `ui-namespace`
* `i18n-scope`

---

### Action Buttons

Loaded dynamically:

```ts
const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');
```

Main actions:

| Action         | Behavior                |
| -------------- | ----------------------- |
| Confirm        | Calls `importAllData()` |
| Cancel         | Calls `cancel()`        |
| Clear Dropdown | Removes rows by status  |

---

## Clear Dropdown Options

Available actions:

* Clear All
* Clear Errors
* Clear Imported

Each option maps to a specific `clear()` call.

---

## Concurrency Control

Concurrency is controlled using:

```ts
pLimit(moduleConfig.options.numberOfParallelImports)
```

This prevents:

* Backend overload
* Rate limiting issues
* Performance bottlenecks

Example:

If `numberOfParallelImports = 3`, only 3 rows are imported simultaneously.

---

## Internationalization

Scoped using:

```ts
`${instanceId}.ImportPage`
```

Required keys include:

```json
{
  "ImportPage": {
    "title": "Import",
    "importSuccess": "All data imported successfully",
    "importWarning": "Some rows failed during import",
    "importError": "Import failed",
    "clearSuccess": "Rows cleared",
    "ButtonsCard": {
      "clear": "Clear",
      "clearAll": "Clear all",
      "clearError": "Clear errors",
      "clearImported": "Clear imported"
    }
  }
}
```

---

## UI Customization

Buttons are customizable via UI design configuration:

```json
{
  "import-page": {
    "export-button": {
      "q-btn": {
        "color": "primary",
        "icon": "delete"
      }
    }
  }
}
```

Namespace:

```
${instanceId}.import-page
```

---

## Routing

Route example:

```js
{
  path: '/import',
  component: 'moduleImport/ImportPage',
  meta: {
    instanceId: 'import',
  },
}
```

---

## Dependencies

From `@linagora/linid-im-front-corelib`:

* `getHttpClient`
* `getModuleHostConfiguration`
* `loadAsyncComponent`
* `useNotify`
* `useScopedI18n`
* `useUiDesign`

External:

* `vue-router`
* `p-limit`
* `LoadFilesCard`
* `ImportedDataTable`
* `ButtonsCard`

---

## Example Workflow

1. User loads file(s).
2. Files are parsed and normalized.
3. Rows appear in preview table.
4. User optionally deletes rows.
5. User clicks **Confirm**.
6. Imports run in parallel with controlled concurrency.
7. Each row updates status dynamically.
8. Final notification summarizes result.
9. User may clear rows or navigate back.
