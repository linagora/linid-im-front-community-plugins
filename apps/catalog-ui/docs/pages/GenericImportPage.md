# **GenericImportPage**

The **GenericImportPage** component provides a reusable, federated page template for importing entities in bulk from CSV files.

It follows the same generic and configurable approach as `GenericCreationPage`: the page is fully driven by the module host configuration and can be integrated into different modules without requiring a custom implementation.

---

## **Purpose**

- Provide a reusable CSV import page for any entity
- Load one or more CSV files and map each row to an entity through Nunjucks templates
- Preview the loaded rows in a table, with a per-row import status
- Import the rows through the generic entity creation mechanism, with a controlled concurrency
- Clear rows by status (all, in error, imported) and retry the remaining ones

---

## **Configuration**

The page resolves its options from the module host configuration (`getModuleHostConfiguration(instanceId).options`), typed by `ModuleGenericImportPageOptions`.

| Option                    | Type                     | Required | Description                                                                                                                                                |
| ------------------------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parentPath`              | `string`                 | Yes      | Route path used for the cancel redirect. Supports Nunjucks template interpolation with the `query` variable (e.g. `"/groups/{{ query.groupId }}/members"`) |
| `fieldMappingTemplates`   | `Record<string, string>` | Yes      | Maps each entity field to a Nunjucks template rendered with the CSV row as context. Its keys are also the business columns of the preview table            |
| `useColumnIndexParsing`   | `boolean`                | Yes      | When enabled, CSV header names are ignored and values are mapped by column index through `expectedCsvHeaders`                                              |
| `expectedCsvHeaders`      | `string[]`               | No       | Names given to the CSV columns, by index. Used only when `useColumnIndexParsing` is `true`                                                                 |
| `skipFirstCsvNLines`      | `number`                 | Yes      | Number of lines to skip at the beginning of the file. With header parsing, the header row is counted in this number                                        |
| `numberOfParallelImports` | `number`                 | Yes      | Maximum number of rows imported concurrently                                                                                                               |

```ts
export interface CsvParsingOptions {
  fieldMappingTemplates: Record<string, string>;
  useColumnIndexParsing: boolean;
  expectedCsvHeaders?: string[];
  skipFirstCsvNLines: number;
}

export interface ModuleGenericImportPageOptions extends ModulePageOptions, CsvParsingOptions {
  numberOfParallelImports: number;
}
```

Example module configuration:

```json
{
  "instanceId": "moduleUserImportPage",
  "remoteName": "catalogUI",
  "lifecycleRemote": "catalogUI/PageLifecycle",
  "routesRemote": "catalogUI/PageRoutes",
  "apiEndpoint": "api/users",
  "basePath": "/users",
  "options": {
    "layout": "catalogUI/BaseLayout",
    "page": "catalogUI/GenericImportPage",
    "pagePath": "import",
    "parentPath": "/users",
    "fieldMappingTemplates": {
      "firstName": "{{ firstName }}",
      "lastName": "{{ lastName }}",
      "email": "{{ email | lower }}",
      "active": "{{ true if active == 'yes' else false }}"
    },
    "useColumnIndexParsing": true,
    "expectedCsvHeaders": ["firstName", "lastName", "email", "active"],
    "skipFirstCsvNLines": 1,
    "numberOfParallelImports": 5
  }
}
```

### Entry point

The page provides no dedicated button: a link towards it is placed in a zone of another page with a
[RedirectButton](../components/button/RedirectButton.md), for example in the header actions of a table page:

```json
{
  "zones": [
    {
      "zone": "moduleUserTablePage.header.actions",
      "plugin": "catalogUI/RedirectButton",
      "props": {
        "to": "/users/import"
      }
    }
  ]
}
```

---

## **File Loading**

Files are selected through the internal `LoadFilesField` component, a multiple `q-file` picker.

1. Every selected file is parsed with PapaParse, empty lines being skipped.
2. Rows are read:
   - by header name when `useColumnIndexParsing` is `false` (the first row not skipped is the header);
   - by column index otherwise, each column being named after the `expectedCsvHeaders` entry at the same index.
3. Each row is mapped by rendering every template of `fieldMappingTemplates` with the row as context.
4. Each mapped row receives the internal fields `__id`, `__file` and `__status = 'READY'`.
5. The rows of all files replace the current dataset, and a notification is displayed:
   - `positive` (`LoadFilesField.loadSuccess`) when rows were loaded;
   - `warning` (`LoadFilesField.loadEmpty`) when the files hold no row;
   - `negative` (`LoadFilesField.loadError`) when a file cannot be parsed.

---

## **Preview Table**

Loaded rows are displayed by the internal `ImportedDataTable` component, a `q-table` with the following columns:

| Column     | Content                                                      |
| ---------- | ------------------------------------------------------------ |
| `__error`  | Button expanding the error message of a failed row           |
| `__delete` | Button removing the row from the dataset                     |
| `__file`   | Name of the source file                                      |
| `__status` | Import status badge (a spinner is shown while importing)     |
| `{field}`  | One column per key of `fieldMappingTemplates`, in that order |

Rows in `ERROR` receive the `row-error` CSS class.

---

## **Import Lifecycle**

Each row carries an import status:

| Status      | Meaning                         |
| ----------- | ------------------------------- |
| `READY`     | Loaded, waiting to be imported  |
| `IMPORTING` | Import request in progress      |
| `IMPORTED`  | Successfully imported           |
| `ERROR`     | Import failed, `__error` is set |

When the confirm button is clicked:

1. The page enters a loading state.
2. Every `READY` row is saved with `saveEntity(instanceId, row)`, at most `numberOfParallelImports` at a time. Internal fields (`__id`, `__file`, `__status`, `__error`) are stripped before sending.
3. Each row status is updated as its request settles.
4. A notification summarizes the result:
   - `positive` (`importSuccess`) — every row was imported;
   - `warning` (`importWarning`) — some rows failed;
   - `negative` (`importError`) — every row failed.

Rows already imported or in error are not sent again: clear them, fix the file and load it again to retry.

---

## **Clearing Rows**

The footer `ButtonsCard` holds a `DropdownButton` removing rows by status. It is disabled while the dataset is empty.

| Item key        | Removed statuses                          |
| --------------- | ----------------------------------------- |
| `clearAll`      | `READY`, `IMPORTING`, `IMPORTED`, `ERROR` |
| `clearError`    | `ERROR`                                   |
| `clearImported` | `IMPORTED`                                |

A `positive` notification (`clearSuccess`) is displayed when rows were removed, a `warning` one (`clearWarning`) otherwise.

---

## **Navigation Behavior**

- The footer `ButtonsCard` provides the cancel action.
- Cancel redirects to the path produced by rendering `parentPath` as a Nunjucks template, with the query string (`query`) as context. `entity` is always empty on this page.
- The import page should generally not be exposed in the main navigation menu (`addNavigationMenu` disabled).

---

## **Layout Structure**

The page is composed of:

- Optional page title, displayed when the `{instanceId}.title` translation exists
- Header `ButtonsCard` containing only the custom actions injected through the `header.actions` zone
- A card holding two sections:
  - the file picker (`LoadFilesField`)
  - the preview table (`ImportedDataTable`)
- Footer `ButtonsCard` containing:
  - Cancel and confirm (import) actions, the confirm button being disabled while the dataset is empty
  - The clear `DropdownButton`
  - Optional custom actions through the `content.actions` zone

---

## **Zones**

This page exposes all default generic page zones described in the main **Zones** documentation, plus the footer actions zone:

| Zone                           | Location                      | Typical Use                            |
| ------------------------------ | ----------------------------- | -------------------------------------- |
| `{instanceId}.content.actions` | Footer actions, after confirm | Template download, extra import action |

No zone receives an `entity`. `content.before`, `content.after` and `content.actions` receive `isLoading`.

---

## **Internationalization**

| Key                                                | Description                                      |
| -------------------------------------------------- | ------------------------------------------------ |
| `{instanceId}.title`                               | Optional page title                              |
| `{instanceId}.ButtonsCard.cancel`                  | Cancel button label                              |
| `{instanceId}.ButtonsCard.confirm`                 | Import button label                              |
| `{instanceId}.ButtonsCard.confirmLoading`          | Import button loading label                      |
| `{instanceId}.DropdownButton.title`                | Clear dropdown label                             |
| `{instanceId}.DropdownButton.clearAll`             | Clear all rows item                              |
| `{instanceId}.DropdownButton.clearError`           | Clear rows in error item                         |
| `{instanceId}.DropdownButton.clearImported`        | Clear imported rows item                         |
| `{instanceId}.LoadFilesField.label`                | File picker label                                |
| `{instanceId}.LoadFilesField.hint`                 | File picker hint (optional)                      |
| `{instanceId}.LoadFilesField.counter-label`        | File picker counter label (optional)             |
| `{instanceId}.LoadFilesField.prefix`               | File picker prefix (optional)                    |
| `{instanceId}.LoadFilesField.suffix`               | File picker suffix (optional)                    |
| `{instanceId}.LoadFilesField.loadSuccess`          | Files loaded notification                        |
| `{instanceId}.LoadFilesField.loadEmpty`            | No row loaded notification                       |
| `{instanceId}.LoadFilesField.loadError`            | File parsing error notification                  |
| `{instanceId}.ImportedDataTable.expandButtonOpen`  | Label of the button showing a row error          |
| `{instanceId}.ImportedDataTable.expandButtonClose` | Label of the button hiding a row error           |
| `{instanceId}.ImportedDataTable.deleteButton`      | Label of the button removing a row               |
| `{instanceId}.ImportedDataTable.headers.{column}`  | Column header, for internal and business columns |
| `{instanceId}.ImportedDataTable.status.{STATUS}`   | Status badge label, defaults to the raw status   |
| `{instanceId}.importSuccess`                       | Every row imported notification                  |
| `{instanceId}.importWarning`                       | Partial import notification                      |
| `{instanceId}.importError`                         | No row imported notification                     |
| `{instanceId}.clearSuccess`                        | Rows removed notification                        |
| `{instanceId}.clearWarning`                        | No row removed notification                      |

---

## **UI Customization**

The page uses the LinID design system through `useUiDesign()`, with the `instanceId` as namespace.

| Namespace                                              | Type             | Description                                                  |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------ |
| `{instanceId}.import-card`                             | `q-card`         | Card holding both sections                                   |
| `{instanceId}.import-card.files-section`               | `q-card-section` | Section holding the file picker                              |
| `{instanceId}.import-card.table-section`               | `q-card-section` | Section holding the preview table                            |
| `{instanceId}.load-files-field`                        | `q-file`         | File picker                                                  |
| `{instanceId}.imported-data-table`                     | `q-table`        | Preview table                                                |
| `{instanceId}.imported-data-table`                     | `q-spinner`      | Spinner of the `IMPORTING` badge                             |
| `{instanceId}.imported-data-table.expand-button-open`  | `q-btn`          | Button showing a row error                                   |
| `{instanceId}.imported-data-table.expand-button-close` | `q-btn`          | Button hiding a row error                                    |
| `{instanceId}.imported-data-table.delete-button`       | `q-btn`          | Button removing a row                                        |
| `{instanceId}.imported-data-table.{STATUS}`            | `q-badge`        | Status badge, per status                                     |
| `{instanceId}.buttons-card`                            | —                | See [ButtonsCard](../components/card/ButtonsCard.md)         |
| `{instanceId}.dropdown-button`                         | —                | See [DropdownButton](../components/button/DropdownButton.md) |

---

## **Dependencies**

- `LinidZoneRenderer` (zone injection points)
- `ButtonsCard` (navigation and import actions)
- `DropdownButton` (clear actions)
- `LoadFilesField` (internal, file loading and mapping)
- `ImportedDataTable` (internal, rows preview)
- `saveEntity` / `getModuleHostConfiguration` from `@linagora/linid-im-front-corelib`
- `useNunjucks` (row mapping and `parentPath` rendering)
- `useScopedI18n` (translations)
- `useUiDesign` (UI customization)
- `papaparse` (CSV parsing) and `p-limit` (import concurrency)
