# **GenericSortableListCard 📋**

The **GenericSortableListCard** component provides a complete UI for managing ordered collections:
a drag-and-drop sortable list embedded in a card layout, with a built-in add button, per-item edit
and delete actions, and a save button to persist the new sort order.

It standardizes ordered list management so features do not need to implement their own drag-and-drop
list, action buttons, dialogs, and order-save flows.

---

## **🎯 Purpose**

- Displays a collection of items as a sortable list inside a card
- Lets users drag and drop items to reorder them, then save the new order
- Provides an add button opening a configuration-driven `FormDialog`
- Provides per-item edit and delete buttons with their own `FormDialog` and `ConfirmationDialog`
- Resolves API endpoints from Nunjucks templates rendered with the entity owning the collection
- Exposes two plugin zones per item for custom UI injection
- Emits events after every successful mutation (create, update, delete, order change)

---

## **⚙️ Props**

| Prop name        | Type                                                         | Default  | Description                                                                                            |
| ---------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `formFields`     | `LinidAttributeConfiguration[]`                              | —        | Form fields rendered in the create and edit form dialogs (see `FormDialog`)                            |
| `endpoints`      | `GenericSortableListCardEndpoints`                           | —        | Nunjucks templates of the `find`, `create`, `update` and `delete` endpoints                            |
| `orderKey`       | `string`                                                     | —        | Name of the item property that stores the sort order index (1-based integer)                           |
| `labelKey`       | `string`                                                     | —        | Name of the item property displayed as the label when no default slot content is provided              |
| `itemKey`        | `string`                                                     | `'id'`   | Name of the item property used as the unique key for the draggable list                                |
| `itemsQuerySize` | `number`                                                     | `50`     | Number of items fetched per page when paginating through the `find` endpoint                           |
| `itemMapperFn`   | `(item: Record<string, unknown>) => Record<string, unknown>` | identity | Optional function applied to each item after fetching, used to transform or normalize data             |
| `entity`         | `Record<string, unknown>`                                    | `{}`     | Entity owning the collection, provided to the Nunjucks context. Injected by the hosting zone           |
| `instanceId`     | `string`                                                     | —        | Instance identifier passed to form dialog fields and used as plugin zone prefix                        |
| `uiNamespace`    | `string`                                                     | —        | Base UI namespace used for design system customization                                                 |
| `i18nScope`      | `string`                                                     | —        | Identifier used to scope translations. Falls back to `uiNamespace` then `instanceId` when not provided |

### Endpoints

```typescript
export interface GenericSortableListCardEndpoints {
  find: string; // GET    — fetches paginated items
  create: string; // POST   — submitted form data is sent as the request body
  update: string; // PUT    — used for both item edits and order saves; `item` is available in context
  delete: string; // DELETE — the removed item is available as `item` in the template context
}
```

Each endpoint is a Nunjucks template rendered with a context containing `entity`, the entity owning
the collection. The `update` and `delete` endpoint contexts additionally contain `item`, the item
being updated or removed:

```typescript
{
  find:   '/api/organizations/{{ entity.id }}/roles',
  create: '/api/organizations/{{ entity.id }}/roles',
  update: '/api/organizations/{{ entity.id }}/roles/{{ item.id }}',
  delete: '/api/organizations/{{ entity.id }}/roles/{{ item.id }}',
}
```

---

## **🎰 Slots**

| Slot name      | Scope             | Description                                                                         |
| -------------- | ----------------- | ----------------------------------------------------------------------------------- |
| _(default)_    | `{ item }`        | Custom content for the item label section. Defaults to `item[labelKey]` when absent |
| `item-actions` | `{ item, index }` | Additional action buttons inserted after the edit and delete buttons for each item  |

---

## **📤 Events**

| Event           | Payload                     | Description                                                                                             |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `created`       | `Record<string, unknown>`   | Emitted with the server response after a successful creation, transformed by `itemMapperFn` if provided |
| `updated`       | `Record<string, unknown>`   | Emitted with the server response after a successful update, transformed by `itemMapperFn` if provided   |
| `deleted`       | `Record<string, unknown>`   | Emitted with the removed item after a successful deletion                                               |
| `order-updated` | `Record<string, unknown>[]` | Emitted with the full reordered item list after the sort order has been saved                           |

---

## **🧩 Internal Behavior**

### Data loading

- Items are fetched from the rendered `find` endpoint using paginated `GET` requests with
  `{ page, size }` query parameters. All pages are collected before rendering — the component
  paginates automatically until `last: true`
- Items are sorted ascending by `orderKey` after fetching
- `itemMapperFn` is applied to each item before storing, allowing normalization before display
- The endpoint is re-rendered whenever `entity` or `endpoints.find` changes. This lets the card be
  rendered by a zone before the hosting page has resolved its entity
- On failure, items are cleared and a negative notification is displayed

### Add item

- The add button opens the shared `FormDialog` with the configured `formFields`
- The form is pre-filled with `{ [orderKey]: items.length + 1 }` so the new item lands at the end
- On submit, the form data is posted to the rendered `create` endpoint
- On success: positive notification, `created` event with the server response (transformed by `itemMapperFn` if provided), items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Edit item

- The edit button opens the shared `FormDialog` pre-filled with the item's current values
- On submit, the form data is sent as a `PUT` to the rendered `update` endpoint, with `item`
  (the original item before edits) available in the template context
- On success: positive notification, `updated` event with the server response (transformed by `itemMapperFn` if provided), items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Delete item

- The delete button opens the shared `ConfirmationDialog`; the item properties are available as
  named parameters in the dialog title and content translations
- On confirm, the rendered `delete` endpoint is called; the item is immediately removed from the
  local list and a `PUT` is sent for every remaining item to keep the `orderKey` values contiguous
- On success: positive notification, `deleted` event, items reload
- On failure: negative notification, items unchanged

### Drag-and-drop reorder

- Items can be dragged using the handle icon (`.drag-handle` CSS class on the icon section)
- Moving an item to a position different from its original position in the loaded list marks the
  order as changed, showing a hint message and enabling the save button. This comparison is
  index-based, so items with non-contiguous `orderKey` values (e.g. created outside the UI) are
  handled correctly
- Moving all items back to their original positions automatically clears the changed state

### Save order

- The save button (enabled only when the order has changed) sends a `PUT` for every item in
  parallel, assigning each item a new `orderKey` equal to its 1-based position in the current list
- On success: positive notification, `order-updated` event with the full reordered list,
  the order-changed flag is reset, items reload
- On failure: negative notification, the order-changed flag and local list are unchanged

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.GenericSortableListCard`. For the full key reference and
a complete translation example, see [i18n.md](../../i18n.md#genericsortablelistcard).

Key highlights:

- `title` — optional card title (hidden when the key is absent)
- `ButtonsCard.add` / `ButtonsCard.save` — header action button labels
- `saveNewOrderHint` — hint shown when the order has changed but has not been saved yet
- `editButton` / `deleteButton` — per-item button labels (optional, default to empty string)
- `CreateFormDialog.*` / `EditFormDialog.*` — scopes for the create and edit `FormDialog`
- `DeleteConfirmationDialog.*` — scope for the delete `ConfirmationDialog` (item properties interpolable)

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.generic-sortable-list-card`. For the full namespace
reference and a complete design example, see [design.md](../../design.md#genericsortablelistcard).

Key highlights:

- `q-scroll-area` — controls the list height (use `style: "height: Xpx"`)
- `draggable` — vuedraggable options (e.g. `handle: ".drag-handle"`, `animation: 150`)
- `icon-section` > `q-icon` — drag handle icon (e.g. `name: "drag_indicator"`)
- `edit-section` > `q-btn` / `delete-section` > `q-btn` — per-item action buttons
- `add-button` > `q-btn` / `save-button` > `q-btn` — header action buttons

---

## **🔌 Plugin Zones**

The component registers two plugin zones per item, prefixed with `instanceId`:

| Zone name                        | Description                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `${instanceId}.item.label.after` | Rendered after the label section and before the edit/delete sections for each item |
| `${instanceId}.item.actions`     | Rendered after the edit and delete sections for each item                          |

Zones receive `entity`, `item`, `instanceId`, `uiNamespace` and `i18nScope` as props.

---

## **🧩 Usage Examples**

### Through a zone configuration

The card is declared in the `zones` property of the module host configuration. The hosting zone
injects `entity`, `instanceId`, `uiNamespace` and `i18nScope`:

```json
{
  "zone": "moduleOrganizationDetailsPage.content.after",
  "plugin": "catalogUI/GenericSortableListCard",
  "props": {
    "orderKey": "priority",
    "labelKey": "name",
    "itemKey": "id",
    "formFields": [
      { "name": "name", "type": "String", "input": "Text", "required": true, "inputSettings": {} },
      { "name": "priority", "type": "Number", "input": "Number", "required": true, "inputSettings": {} }
    ],
    "endpoints": {
      "find": "/api/organizations/{{ entity.id }}/roles",
      "create": "/api/organizations/{{ entity.id }}/roles",
      "update": "/api/organizations/{{ entity.id }}/roles/{{ item.id }}",
      "delete": "/api/organizations/{{ entity.id }}/roles/{{ item.id }}"
    }
  }
}
```

### Direct usage

```vue
<GenericSortableListCard :entity="organization" :form-fields="formFields" :endpoints="endpoints" order-key="priority" label-key="name" ui-namespace="organizations.details" i18n-scope="organizations.details" instance-id="organizations" @created="onRoleCreated" @updated="onRoleUpdated" @deleted="onRoleDeleted" @order-updated="onRoleOrderUpdated" />
```

### Custom item label via default slot

```vue
<GenericSortableListCard v-bind="cardProps">
  <template #default="{ item }">
    <strong>{{ item.code }}</strong> — {{ item.description }}
  </template>
</GenericSortableListCard>
```

### Additional item actions via slot

```vue
<GenericSortableListCard v-bind="cardProps">
  <template #item-actions="{ item }">
    <q-item-section side>
      <q-btn flat round dense icon="visibility" @click="preview(item)" />
    </q-item-section>
  </template>
</GenericSortableListCard>
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for managing sortable ordered collections
- **Composable:** Built on top of `vuedraggable`, `FormDialog` and `ConfirmationDialog`
- **Configurable:** Form fields and endpoints are driven by configuration; no component code needed
- **Auto-paginating:** Transparently fetches all pages before rendering
- **Zone-ready:** Designed to be rendered through a zone with the page entity injected
- **Extensible:** Default slot, `item-actions` slot and two plugin zones cover custom UI needs
