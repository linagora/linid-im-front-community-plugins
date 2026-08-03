# **GenericEditableTableCard 🗃️**

The **GenericEditableTableCard** component provides a complete UI for managing simple collections:
a table embedded in a card layout, with a built-in add button opening a form dialog, an optional
per-row edit action reusing the same form, and a per-row delete action guarded by a confirmation
dialog.

It standardizes simple list management so features do not need to implement their own table,
action buttons, dialogs, and confirmation flows.

---

## **🎯 Purpose**

- Displays a collection of items inside a table embedded in a card
- Provides an add button opening a configuration-driven `FormDialog`
- Provides a per-row edit button reopening the same `FormDialog` pre-filled with the row values
- Provides a per-row delete button guarded by a `ConfirmationDialog`
- Resolves its API endpoints from Nunjucks templates rendered with the entity owning the collection
- Emits events after successful creation, update and deletion

---

## **⚙️ Props**

| Prop name     | Type                                | Default | Description                                                                                  |
| ------------- | ----------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `columns`     | `QTableColumn[]`                    | —       | Columns of the table. Labels are translated through the component i18n scope                 |
| `formFields`  | `LinidAttributeConfiguration[]`     | —       | Form fields rendered in the creation and edition form dialogs (see `FormDialog`)             |
| `endpoints`   | `GenericEditableTableCardEndpoints` | —       | Nunjucks templates of the `find`, `create`, `update` and `delete` endpoints                  |
| `entity`      | `Record<string, unknown>`           | `{}`    | Entity owning the collection, provided to the Nunjucks context. Injected by the hosting zone |
| `rowKey`      | `String`                            | `'id'`  | Name of the row property used as unique row key                                              |
| `instanceId`  | `String`                            | —       | Instance identifier passed to the form dialog fields (e.g. API validation rules)             |
| `uiNamespace` | `String`                            | —       | Base UI namespace used for design system customization                                       |
| `i18nScope`   | `String`                            | —       | Identifier used to scope translations                                                        |

### Endpoints

```typescript
export interface GenericEditableTableCardEndpoints {
  find: string; // GET — fetches the items
  create: string; // POST — submitted form data is sent as the request body
  update?: string; // PUT — optional; enables the per-row edit button
  delete: string; // DELETE — the removed row is available as `item` in the template context
}
```

Each endpoint is a Nunjucks template rendered with a context containing `entity`, the entity owning the
collection. The `update` and `delete` endpoint contexts additionally contain `item`, the row being
edited or removed:

```typescript
{
  find: '/api/organizations/{{ entity.id }}/members',
  create: '/api/organizations/{{ entity.id }}/members',
  update: '/api/organizations/{{ entity.id }}/members/{{ item.id }}',
  delete: '/api/organizations/{{ entity.id }}/members/{{ item.id }}',
}
```

The `update` endpoint is optional: the per-row edit button is only rendered when it is configured, so
read-only-plus-delete collections keep their previous behaviour.

### Column Formatting

See [Value Formatting](../../value-formatting.md) for details on supported formatters and configuration.

#### **Example Configuration**

```ts
{
  columns: [
    {
      name: 'name',
      label: 'columns.name',
      field: 'name',
      align: 'left',
    },
    {
      name: 'createdAt',
      label: 'columns.createdAt',
      field: 'createdAt',
      formatter: 'toDate',
      formatOptions: { formatKey: 'application.dateTimeFormat' },
    },
    {
      name: 'updatedAt',
      label: 'columns.updatedAt',
      field: 'updatedAt',
      formatter: 'toDate',
      formatOptions: { formatKey: 'application.dateFormat' },
    },
  ];
}
```

#### **Example i18n Configuration**

```json
{
  "application": {
    "dateTimeFormat": "DD/MM/YYYY HH:mm:ss",
    "dateFormat": "DD/MM/YYYY"
  }
}
```

---

## **📤 Events**

| Event     | Payload                   | Description                                                      |
| --------- | ------------------------- | ---------------------------------------------------------------- |
| `created` | `Record<string, unknown>` | Emitted with the submitted form data after a successful creation |
| `updated` | `Record<string, unknown>` | Emitted with the submitted form data after a successful update   |
| `deleted` | `Record<string, unknown>` | Emitted with the removed row after a successful deletion         |

---

## **🧩 Slots**

Extra actions can be added around the built-in buttons, without replacing them:

| Slot                     | Scope           | Description                                                   |
| ------------------------ | --------------- | ------------------------------------------------------------- |
| `prepend-header-actions` | —               | Before the add button, in the card header                     |
| `append-header-actions`  | —               | After the add button, in the card header                      |
| `prepend-row-actions`    | `row`, `rowKey` | Before the edit and delete buttons, in the row actions column |
| `append-row-actions`     | `row`, `rowKey` | After the delete button, in the row actions column            |

```vue
<GenericEditableTableCard :entity="application" :columns="columns" :form-fields="formFields" :endpoints="endpoints" ui-namespace="applications.details" i18n-scope="applications.details">
  <template #append-row-actions="{ row }">
    <q-btn label="Edit" @click="edit(row)" />
  </template>
</GenericEditableTableCard>
```

---

## **🧩 Zones**

The same extension points are also exposed as zones, so other modules can inject actions without owning the template.
Zone names are prefixed by `${uiNamespace}.generic-editable-table-card`:

| Zone                                                        | Props                                                               | Description                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| `${uiNamespace}.generic-editable-table-card.header-actions` | `entity`, `instanceId`, `uiNamespace`, `i18nScope`                  | Before the add button                      |
| `${uiNamespace}.generic-editable-table-card.row-actions`    | `entity`, `row`, `rowKey`, `instanceId`, `uiNamespace`, `i18nScope` | Before the per-row edit and delete buttons |

The `header-actions` zone receives a `uiNamespace` scoped to `.buttons-card` and an `i18nScope` scoped to
`.ButtonsCard`, so injected buttons share the design and translations of the card header actions.

See [Generic Pages](../../generic-pages.md) for how to register a component in a zone.

---

## **🧩 Internal Behavior**

### Data loading

- Items are loaded from the rendered `find` endpoint, and reloaded whenever the rendered endpoint changes.
  This lets the card be rendered by a zone before the hosting page has resolved its entity
- No request is sent while the `entity` prop is provided but empty, as the endpoints would render with
  a missing identifier. A card configured without an `entity` prop loads its static endpoint as usual
- Both plain array responses and paginated responses exposing a `content` array are supported
- On failure, the items are cleared and a negative notification is displayed

### Add item

- The add button opens the shared `FormDialog` with the configured `formFields`
- On submit, the form data is posted to the rendered `create` endpoint
- On success: positive notification, `created` event, items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Edit item

- Each row displays an edit button in the `table_actions` column, rendered only when the `update`
  endpoint is configured
- The edit button reopens the shared `FormDialog` with the same `formFields`, pre-filled with the row
  values through `initialFormData`; the row properties are available as named parameters in the dialog
  title and content translations
- On submit, the form data is sent with `PUT` to the rendered `update` endpoint
- On success: positive notification, `updated` event, items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Remove item

- Each row displays a delete button in the `table_actions` column
- The `table_actions` column is automatically appended when not declared in `columns` and hosts both
  the edit and delete buttons
- The delete button opens the shared `ConfirmationDialog`; the row properties are available as
  named parameters in the dialog title and content translations
- On confirm, the rendered `delete` endpoint is called
- On success: positive notification, `deleted` event, items reload
- On failure: negative notification, items unchanged

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.GenericEditableTableCard`:

| Key                                | Description                                                               |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `title`                            | Card title (optional — the title is hidden when the key is not defined)   |
| `ButtonsCard.add`                  | Label of the add button                                                   |
| `editButton`                       | Label of the per-row edit button                                          |
| `deleteButton`                     | Label of the per-row delete button                                        |
| `loadError`                        | Notification shown when loading the items fails                           |
| `createSuccess` / `createError`    | Notifications shown after the creation attempt                            |
| `updateSuccess` / `updateError`    | Notifications shown after the update attempt                              |
| `deleteSuccess` / `deleteError`    | Notifications shown after the deletion attempt                            |
| `CreateFormDialog.title`           | Title of the creation form dialog                                         |
| `CreateFormDialog.content`         | Optional content of the creation form dialog                              |
| `CreateFormDialog.*`               | Scope given to the `FormDialog` (buttons, field labels)                   |
| `EditFormDialog.title`             | Title of the edition form dialog (row properties interpolable)            |
| `EditFormDialog.content`           | Optional content of the edition form dialog (row properties interpolable) |
| `EditFormDialog.*`                 | Scope given to the `FormDialog` (buttons, field labels)                   |
| `DeleteConfirmationDialog.title`   | Title of the delete confirmation dialog (row properties interpolable)     |
| `DeleteConfirmationDialog.content` | Content of the delete confirmation dialog (row properties interpolable)   |
| `DeleteConfirmationDialog.*`       | Scope given to the `ConfirmationDialog` (buttons)                         |
| `columns.<label>`                  | Column labels, resolved from each column `label` value                    |
| `GenericEntityTable.*`             | Scope given to the embedded `GenericEntityTable` (e.g. `noData`)          |

Example of a delete confirmation content using row interpolation:

```json
{
  "DeleteConfirmationDialog": {
    "content": "Do you really want to remove {name}?"
  }
}
```

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.generic-editable-table-card`:

| Namespace                                                            | Type      | Description                              |
| -------------------------------------------------------------------- | --------- | ---------------------------------------- |
| `${uiNamespace}.generic-editable-table-card`                         | `q-card`  | Card container                           |
| `${uiNamespace}.generic-editable-table-card.buttons-card`            | `q-card`  | Container of the add button              |
| `${uiNamespace}.generic-editable-table-card.buttons-card.add-button` | `q-btn`   | Add button (e.g. custom `icon`, `color`) |
| `${uiNamespace}.generic-editable-table-card.edit-button`             | `q-btn`   | Per-row edit button                      |
| `${uiNamespace}.generic-editable-table-card.delete-button`           | `q-btn`   | Per-row delete button                    |
| `${uiNamespace}.generic-editable-table-card.generic-entity-table`    | `q-table` | Embedded table                           |

The add button is rendered through the shared `ButtonsCard` component, with its default confirm and
cancel buttons not visible. Its label comes from i18n (`ButtonsCard.add`) while its icon and appearance
are customized through the design system (`buttons-card.add-button` namespace).

---

## **🧩 Usage Examples**

### Through a zone configuration

The card is declared in the `zones` property of the module host configuration (see
[Generic Pages](../../generic-pages.md)). The hosting zone injects the page `entity`, which the card uses as the owner of the collection, along
with `instanceId`, `uiNamespace` and `i18nScope`:

```json
{
  "zone": "moduleOrganizationDetailsPage.content.after",
  "plugin": "catalogUI/GenericEditableTableCard",
  "props": {
    "columns": [{ "name": "name", "label": "columns.name", "field": "name", "align": "left" }],
    "formFields": [
      {
        "name": "name",
        "type": "String",
        "input": "Text",
        "required": true,
        "inputSettings": {}
      }
    ],
    "endpoints": {
      "find": "/api/organizations/{{ entity.id }}/members",
      "create": "/api/organizations/{{ entity.id }}/members",
      "update": "/api/organizations/{{ entity.id }}/members/{{ item.id }}",
      "delete": "/api/organizations/{{ entity.id }}/members/{{ item.id }}"
    }
  }
}
```

### Direct usage

```vue
<GenericEditableTableCard :entity="organization" :columns="columns" :form-fields="formFields" :endpoints="endpoints" ui-namespace="organizations.details" i18n-scope="organizations.details" instance-id="organizations" @created="onMemberCreated" @updated="onMemberUpdated" @deleted="onMemberDeleted" />
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for managing simple collections
- **Progressive:** The edit action is opt-in through the `update` endpoint
- **Composable:** Built on top of `GenericEntityTable`, `FormDialog` and `ConfirmationDialog`
- **Configurable:** Columns, form fields and endpoints are driven by configuration
- **Zone-ready:** Designed to be rendered through a zone with the page entity injected
