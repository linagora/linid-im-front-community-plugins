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
- Renders configurable fields per item, as a column layout with a header row above the list
- Exposes plugin zones around the fields and inside the item actions for custom UI injection
- Emits events after every successful mutation (create, update, delete, order change)

---

## **⚙️ Props**

| Prop name        | Type                                                         | Default  | Description                                                                                                   |
| ---------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| `formFields`     | `LinidAttributeConfiguration[]`                              | —        | Form fields rendered in the create and edit form dialogs (see `FormDialog`)                                   |
| `endpoints`      | `GenericSortableListCardEndpoints`                           | —        | Nunjucks templates of the `find`, `create`, `update` and `delete` endpoints                                   |
| `orderKey`       | `string`                                                     | —        | Name of the item property that stores the sort order index (1-based integer)                                  |
| `fields`         | `GenericListField[]`                                         | —        | Fields rendered for each item and in the header row (see [Fields](#fields))                                   |
| `itemKey`        | `string`                                                     | `'id'`   | Name of the item property used as the unique key for the draggable list                                       |
| `itemsQuerySize` | `number`                                                     | `50`     | Number of items fetched per page when paginating through the `find` endpoint                                  |
| `itemMapperFn`   | `(item: Record<string, unknown>) => Record<string, unknown>` | identity | Optional function applied to each item after fetching, used to transform or normalize data                    |
| `entity`         | `Record<string, unknown>`                                    | `{}`     | Entity owning the collection, provided to the Nunjucks context. Injected by the hosting zone                  |
| `instanceId`     | `string`                                                     | —        | Instance identifier passed to form dialog fields, and fallback prefix for the UI namespace and the i18n scope |
| `uiNamespace`    | `string`                                                     | —        | Base UI namespace used for design system customization **and as the plugin zone prefix**                      |
| `i18nScope`      | `string`                                                     | —        | Identifier used to scope translations. Falls back to `instanceId` when not provided                           |

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

### Fields

```typescript
export interface GenericListField extends FormatterConfiguration {
  name: string; // item property key, also used for slot and data-cy names
  label: string; // i18n key resolved under the component scope, NOT a literal label
  formatter?: string; // optional declarative formatter
  formatOptions?: Record<string, unknown>;
}
```

```typescript
{
  name: 'createdAt',
  label: 'columns.createdAt',
  formatter: 'toDate',
  formatOptions: { formatKey: 'application.dateFormat' },
}
```

Points to keep in mind:

- **`label` is an i18n key**, resolved under `${i18nScope}.GenericSortableListCard` — never a literal string
- **`name` is the item property key**: the cell value is read as `item[field.name]`. There is no separate `field`
  property, and nested paths (`a.b.c`) are not resolved — flatten them upstream with `itemMapperFn`
- **Formatting** is delegated to corelib's `useValueFormatter`. See [Value Formatting](../../value-formatting.md)
- **A nullish formatted value becomes an empty string.** A missing property and an explicit `null` both render as
  an empty cell rather than as `"null"`. The test is nullish, so `0` and `false` are kept and displayed
- Values are rendered through `TruncatedItemLabel`, which shows a tooltip with the full text when the cell
  overflows its single line

---

## **🎰 Slots**

| Slot name              | Scope                           | Description                                                       |
| ---------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `header-${name}`       | `{ field }`                     | Custom rendering for the header cell of the field named `${name}` |
| `field-${name}`        | `{ item, field, value, index }` | Custom rendering for the value cell of the field named `${name}`  |
| `before-field-labels`  | —                               | Extra header section inserted before the configured fields        |
| `before-field-values`  | `{ item, index }`               | Row counterpart of `before-field-labels`                          |
| `after-field-labels`   | —                               | Extra header section inserted after the configured fields         |
| `after-field-values`   | `{ item, index }`               | Row counterpart of `after-field-labels`                           |
| `prepend-item-actions` | `{ item, index }`               | Content inserted before the edit and delete buttons of each item  |
| `append-item-actions`  | `{ item, index }`               | Content inserted after the edit and delete buttons of each item   |

The `before-*` and `after-*` sections are only rendered when their slot **or** their matching plugin zone provides
content. The label and value slots of a pair share the same condition, so providing only one of the two still
reserves the section on both rows — the header and the items never drift out of alignment.

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

### Fields rendering

- The list stays a Quasar `q-list`: each field is a `q-item-section` inside the item's `q-item`, never a `<table>`
  cell. Drag-and-drop is unaffected
- Field values are resolved **once per item and per field** by a computed that applies the configured formatter and
  normalizes a nullish result to an empty string.
- A header row is rendered as a `q-item` above the scroll area. It mirrors every section of an item row — drag
  handle, before/after sections, fields, actions — rendering the fixed ones empty so the columns line up
- The header actions cell has no content, so its width mirrors the item rows: a `ResizeObserver` watches the
  actions section of the rendered rows and reports its width to the header. Observing rather than measuring once
  is what makes the alignment hold when the `item.actions` zone renders a **federated** component — those resolve
  asynchronously and widen the section well after the row has been rendered
- The width falls back to `100px` until the first measure — while the list is still empty, or when the observed
  section reports no width. Once a row has been measured, emptying the list keeps the last measured width: the
  observer is simply disconnected, so the header column does not collapse back to the default

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
- the `label` of each entry of the `fields` prop — header labels, resolved under this same scope
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
- `header-item` > `q-item` — the header row, styled independently from the item rows
- `field-label-section` / `field-value-section` > `q-item-section` — the header and item cells of every field
- `field-label` / `field-value` > `q-item-label` — the labels inside those cells. `lines` is forced to `1` and
  cannot be overridden: the overflow tooltip only works on single-line truncation
- `item-actions-section` > `q-item-section`, with nested `edit-button` > `q-btn` and `delete-button` > `q-btn`
- `add-button` > `q-btn` / `save-button` > `q-btn` — header action buttons

---

## **🔌 Plugin Zones**

The component registers five plugin zones, all prefixed with the **UI namespace**
(`${uiNamespace}.generic-sortable-list-card`, falling back to `instanceId`) — not with `instanceId` alone:

| Zone name                                 | Rendered in | Description                                     |
| ----------------------------------------- | ----------- | ----------------------------------------------- |
| `${localUiNamespace}.field-labels.before` | Header row  | Before the configured field labels              |
| `${localUiNamespace}.field-labels.after`  | Header row  | After the configured field labels               |
| `${localUiNamespace}.field-values.before` | Item row    | Row counterpart of `field-labels.before`        |
| `${localUiNamespace}.field-values.after`  | Item row    | Row counterpart of `field-labels.after`         |
| `${localUiNamespace}.item.actions`        | Item row    | Before the edit and delete buttons of each item |

Every zone receives `entity`, `instanceId`, `uiNamespace` and `i18nScope` as props. **What `entity` holds depends on
where the zone is rendered:**

- **Header zones** receive the entity owning the collection — the `entity` prop of the card
- **Item zones** receive the **item of the row**, not the owning entity

A plugin adding a column should register in **both** the value zone and its label counterpart. Registering in only
one still reserves the section on both rows, so the alignment holds — but the header cell stays empty.

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
    "itemKey": "id",
    "fields": [
      { "name": "name", "label": "columns.name" },
      { "name": "priority", "label": "columns.priority" },
      {
        "name": "createdAt",
        "label": "columns.createdAt",
        "formatter": "toDate",
        "formatOptions": { "formatKey": "application.dateFormat" }
      }
    ],
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
<GenericSortableListCard :entity="organization" :form-fields="formFields" :endpoints="endpoints" :fields="fields" order-key="priority" ui-namespace="organizations.details" i18n-scope="organizations.details" instance-id="organizations" @created="onRoleCreated" @updated="onRoleUpdated" @deleted="onRoleDeleted" @order-updated="onRoleOrderUpdated" />
```

### Custom cell rendering via a field slot

Each field exposes a `field-${name}` slot falling back to the formatted value, and a `header-${name}` slot falling
back to the translated label:

```vue
<GenericSortableListCard v-bind="cardProps">
  <template #field-name="{ item, value }">
    <strong>{{ value }}</strong> — {{ item.description }}
  </template>

  <template #field-status="{ item }">
    <q-badge :color="item.active ? 'positive' : 'negative'" />
  </template>
</GenericSortableListCard>
```

### Extra column via slots

Adding a column to the rows requires adding its header too, otherwise the header cell stays empty:

```vue
<GenericSortableListCard v-bind="cardProps">
  <template #before-field-labels>{{ $t('columns.avatar') }}</template>

  <template #before-field-values="{ item }">
    <q-avatar size="sm" :icon="item.icon" />
  </template>
</GenericSortableListCard>
```

### Additional item actions via slot

```vue
<GenericSortableListCard v-bind="cardProps">
  <template #append-item-actions="{ item }">
    <q-btn flat round dense icon="visibility" @click="preview(item)" />
  </template>
</GenericSortableListCard>
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for managing sortable ordered collections
- **Composable:** Built on top of `vuedraggable`, `FormDialog` and `ConfirmationDialog`
- **Configurable:** Fields, form fields and endpoints are driven by configuration; no component code needed
- **Tabular without a table:** Column layout and header row while remaining a drag-and-drop `q-list`
- **Auto-paginating:** Transparently fetches all pages before rendering
- **Zone-ready:** Designed to be rendered through a zone with the page entity injected
- **Extensible:** Per-field slots, before/after slots and five plugin zones cover custom UI needs
