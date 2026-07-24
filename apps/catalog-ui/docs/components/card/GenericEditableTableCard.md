# **GenericEditableTableCard 🗃️**

The **GenericEditableTableCard** component provides a complete UI for managing simple collections:
a table embedded in a card layout, with a built-in add button opening a form dialog and a per-row
delete action guarded by a confirmation dialog.

It standardizes simple list management so features do not need to implement their own table,
action buttons, dialogs, and confirmation flows.

---

## **🎯 Purpose**

- Displays a collection of items inside a table embedded in a card
- Provides an add button opening a configuration-driven `FormDialog`
- Provides a per-row delete button guarded by a `ConfirmationDialog`
- Resolves its API endpoints from Nunjucks templates rendered with the parent entity
- Emits events after successful creation and deletion

---

## **⚙️ Props**

| Prop name      | Type                                | Default | Description                                                                                     |
| -------------- | ----------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `columns`      | `QTableColumn[]`                    | —       | Columns of the table. Labels are translated through the component i18n scope                    |
| `formFields`   | `LinidAttributeConfiguration[]`     | —       | Form fields rendered in the creation form dialog (see `FormDialog`)                             |
| `endpoints`    | `GenericEditableTableCardEndpoints` | —       | Nunjucks templates of the `find`, `create` and `delete` endpoints                               |
| `parentEntity` | `Record<string, unknown>`           | `{}`    | Parent entity provided to the Nunjucks context. Typically injected by the zone hosting the card |
| `rowKey`       | `String`                            | `'id'`  | Name of the row property used as unique row key                                                 |
| `instanceId`   | `String`                            | —       | Instance identifier passed to the creation form dialog fields (e.g. API validation rules)       |
| `uiNamespace`  | `String`                            | —       | Base UI namespace used for design system customization                                          |
| `i18nScope`    | `String`                            | —       | Identifier used to scope translations. Falls back to `instanceId` when not provided             |

### Endpoints

```typescript
export interface GenericEditableTableCardEndpoints {
  find: string; // GET — fetches the items
  create: string; // POST — submitted form data is sent as the request body
  delete: string; // DELETE — the removed row is available as `entity` in the template context
}
```

Each endpoint is a Nunjucks template rendered with a context containing `parentEntity`.
The `delete` endpoint context additionally contains `entity`, the row being removed:

```typescript
{
  find: '/api/organizations/{{ parentEntity.id }}/members',
  create: '/api/organizations/{{ parentEntity.id }}/members',
  delete: '/api/organizations/{{ parentEntity.id }}/members/{{ entity.id }}',
}
```

---

## **📤 Events**

| Event     | Payload                   | Description                                                      |
| --------- | ------------------------- | ---------------------------------------------------------------- |
| `created` | `Record<string, unknown>` | Emitted with the submitted form data after a successful creation |
| `deleted` | `Record<string, unknown>` | Emitted with the removed row after a successful deletion         |

---

## **🧩 Internal Behavior**

### Data loading

- Items are loaded on mount from the rendered `find` endpoint
- Both plain array responses and paginated responses exposing a `content` array are supported
- On failure, the items are cleared and a negative notification is displayed

### Add item

- The add button opens the shared `FormDialog` with the configured `formFields`
- On submit, the form data is posted to the rendered `create` endpoint
- On success: positive notification, `created` event, items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Remove item

- Each row displays a delete button in the `table_actions` column
- The `table_actions` column is automatically appended when not declared in `columns`
- The delete button opens the shared `ConfirmationDialog`; the row properties are available as
  named parameters in the dialog title and content translations
- On confirm, the rendered `delete` endpoint is called
- On success: positive notification, `deleted` event, items reload
- On failure: negative notification, items unchanged

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.GenericEditableTableCard`:

| Key                                | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| `title`                            | Card title (optional — the title is hidden when the key is not defined) |
| `addButton`                        | Label of the add button                                                 |
| `deleteButton`                     | Label of the per-row delete button                                      |
| `loadError`                        | Notification shown when loading the items fails                         |
| `createSuccess` / `createError`    | Notifications shown after the creation attempt                          |
| `deleteSuccess` / `deleteError`    | Notifications shown after the deletion attempt                          |
| `CreateFormDialog.title`           | Title of the creation form dialog                                       |
| `CreateFormDialog.content`         | Optional content of the creation form dialog                            |
| `CreateFormDialog.*`               | Scope given to the `FormDialog` (buttons, field labels)                 |
| `DeleteConfirmationDialog.title`   | Title of the delete confirmation dialog (row properties interpolable)   |
| `DeleteConfirmationDialog.content` | Content of the delete confirmation dialog (row properties interpolable) |
| `DeleteConfirmationDialog.*`       | Scope given to the `ConfirmationDialog` (buttons)                       |
| `columns.<label>`                  | Column labels, resolved from each column `label` value                  |
| `GenericEntityTable.*`             | Scope given to the embedded `GenericEntityTable` (e.g. `noData`)        |

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

| Namespace                                                         | Type      | Description                              |
| ----------------------------------------------------------------- | --------- | ---------------------------------------- |
| `${uiNamespace}.generic-editable-table-card`                      | `q-card`  | Card container                           |
| `${uiNamespace}.generic-editable-table-card.add-button`           | `q-btn`   | Add button (e.g. custom `icon`, `color`) |
| `${uiNamespace}.generic-editable-table-card.delete-button`        | `q-btn`   | Per-row delete button                    |
| `${uiNamespace}.generic-editable-table-card.generic-entity-table` | `q-table` | Embedded table                           |

The add button label comes from i18n (`addButton`) while its icon and appearance are customized
through the design system (`add-button` namespace).

---

## **🧩 Usage Examples**

### Through a zone configuration

The hosting zone provides `parentEntity` (and usually `instanceId`, `uiNamespace`, `i18nScope`):

```json
{
  "type": "federated",
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
      "find": "/api/organizations/{{ parentEntity.id }}/members",
      "create": "/api/organizations/{{ parentEntity.id }}/members",
      "delete": "/api/organizations/{{ parentEntity.id }}/members/{{ entity.id }}"
    }
  }
}
```

### Direct usage

```vue
<GenericEditableTableCard :parent-entity="organization" :columns="columns" :form-fields="formFields" :endpoints="endpoints" ui-namespace="organizations.details" i18n-scope="organizations.details" instance-id="organizations" @created="onMemberCreated" @deleted="onMemberDeleted" />
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for managing simple collections
- **Composable:** Built on top of `GenericEntityTable`, `FormDialog` and `ConfirmationDialog`
- **Configurable:** Columns, form fields and endpoints are driven by configuration
- **Zone-ready:** Designed to be rendered through a zone with the parent entity injected
