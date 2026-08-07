# **GenericSortableListCard 📋**

The **GenericSortableListCard** component provides a complete UI for managing ordered collections:
a drag-and-drop sortable list embedded in a card layout, with a built-in add button, per-item edit
and delete actions, and a save button to persist every pending change (reordering, edits and
deletions) in a single batch.

It standardizes ordered list management so features do not need to implement their own drag-and-drop
list, action buttons, dialogs, and save flows.

---

## **🎯 Purpose**

- Displays a collection of items as a sortable list inside a card
- Lets users drag and drop items to reorder them, edit or delete them, all applied locally first
- Persists every pending change in one save action: only items that were actually reordered,
  edited or deleted generate a request
- Provides an add button opening a configuration-driven `FormDialog` (creation is not deferred)
- Provides per-item edit and delete buttons; delete removes the item immediately, with no
  confirmation step
- Provides a reset button reverting every pending change back to the last loaded state
- Resolves API endpoints from Nunjucks templates rendered with the entity owning the collection
- Renders configurable fields per item, as a column layout with a header row above the list
- Exposes plugin zones around the fields and inside the item actions for custom UI injection
- Can notify a hosting page after a save through `emitOnSave`, so it can react (e.g. reload its
  own entity)

---

## **⚙️ Props**

| Prop name            | Type                                                         | Default  | Description                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `formFields`         | `LinidAttributeConfiguration[]`                              | —        | Form fields rendered in the create and edit form dialogs (see `FormDialog`). Also drives the initial data of the create form                                                                                 |
| `endpoints`          | `GenericSortableListCardEndpoints`                           | —        | Nunjucks templates of the `find`, `create`, `update` and `delete` endpoints                                                                                                                                  |
| `orderKey`           | `string`                                                     | —        | Name of the item property that stores the sort order index (1-based integer)                                                                                                                                 |
| `fields`             | `GenericListField[]`                                         | —        | Fields rendered for each item and in the header row (see [Fields](#fields))                                                                                                                                  |
| `itemKey`            | `string`                                                     | `'id'`   | Name of the item property used as the unique key for the draggable list                                                                                                                                      |
| `itemsQuerySize`     | `number`                                                     | `50`     | Number of items fetched per page when paginating through the `find` endpoint                                                                                                                                 |
| `itemMapperFn`       | `(item: Record<string, unknown>) => Record<string, unknown>` | identity | Optional function applied to each item after fetching, used to transform or normalize data                                                                                                                   |
| `entity`             | `Record<string, unknown>`                                    | `{}`     | Entity owning the collection, provided to the Nunjucks context. Injected by the hosting zone                                                                                                                 |
| `instanceId`         | `string`                                                     | —        | Instance identifier passed to form dialog fields, and fallback prefix for the UI namespace and the i18n scope                                                                                                |
| `uiNamespace`        | `string`                                                     | —        | Base UI namespace used for design system customization **and as the plugin zone prefix**                                                                                                                     |
| `i18nScope`          | `string`                                                     | —        | Identifier used to scope translations. Falls back to `instanceId` when not provided                                                                                                                          |
| `listenToItemUpdate` | `string`                                                     | —        | When set, the card subscribes to `uiEventSubject` and applies local item updates for events matching this key. When absent, no subscription is created (see [Local item updates](#local-item-updates))       |
| `emitOnSave`         | `string`                                                     | —        | When set, the card emits an event with this key on `uiEventSubject` after a batch of pending changes has been saved, fully or partially. When absent, nothing is emitted (see [Save changes](#save-changes)) |

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

| Event     | Payload                     | Description                                                                                                                                                                                                                     |
| --------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `created` | `Record<string, unknown>`   | Emitted with the server response after a successful creation, transformed by `itemMapperFn` if provided                                                                                                                         |
| `updated` | `Record<string, unknown>[]` | Emitted with the full reloaded list once a batch of pending changes (edits, reordering, deletions) has been saved, fully or partially                                                                                           |
| `deleted` | `Record<string, unknown>[]` | Emitted with the items successfully removed once a batch of pending changes has been saved — not when the delete button is clicked (see [Delete item](#delete-item)). Not emitted when the save included no successful deletion |

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
- The form is pre-filled with `{ [orderKey]: items.length + 1 }`, so the new item lands at the end,
  then completed by walking `formFields`: a field is added **only when it declares an
  `inputSettings.defaultValue`**. Fields without one are left out, so the dialog renders them empty
- `orderKey` is always pre-filled, whether or not it appears in `formFields`. A field named after
  `orderKey` is skipped by the walk, so **its `defaultValue` never overrides the computed position**
- The presence test is `!== undefined`, so `false`, `0` and `""` are valid defaults and are kept
- On submit, the form data is posted to the rendered `create` endpoint
- On success: positive notification, `created` event with the server response (transformed by `itemMapperFn` if provided), items reload, dialog closes
- On failure: negative notification, the dialog stays open for correction

### Edit item

- The edit button opens the shared `FormDialog` pre-filled with the item's current values
- On submit, the form data is merged over the original item (`{ ...item, ...formData }`) and
  applied to the local list only — **nothing is sent to the server at this point**. The dialog
  always closes, since there is nothing that can fail locally
- The merged item is compared to the last loaded state to know whether local changes are still
  pending (same mechanism as [Local item updates](#local-item-updates))
- Server-side validation (e.g. a uniqueness constraint) is no longer checked at submit time — it
  only surfaces when the pending changes are saved (see [Save changes](#save-changes))

### Delete item

- The delete button removes the item from the local list **immediately** and queues it for
  deletion — **there is no confirmation step and nothing is sent to the server at this point**
- The queued deletion counts as a pending change, showing the unsaved-changes hint and enabling
  the save button, exactly like an edit or a reorder
- A mistaken deletion can only be undone with the reset button (see
  [Reset changes](#reset-changes)) before saving — there is no per-item undo

### Drag-and-drop reorder

- Items can be dragged using the handle icon (`.drag-handle` CSS class on the icon section)
- Dragging mutates the local list directly (`v-model` on the draggable container) — there is no
  dedicated reorder handler or reorder-specific state. A drag is detected exactly like any other
  edit: an item's effective position (its current index, as a 1-based `orderKey`) is just another
  property compared to the last loaded state (see [Save changes](#save-changes))
- Moving all items back to their original positions is automatically recognized as "nothing changed"

### Local item updates

- When `listenToItemUpdate` is set, the card subscribes to `uiEventSubject` on mount and unsubscribes on unmount. When the prop is absent, no subscription is created
- Events are filtered by key: only events whose `key` matches the value of `listenToItemUpdate` are processed
- A matching event replaces the item whose `itemKey` matches the event `data` in the local list only — nothing is persisted until the pending changes are saved
- The list is then compared to the last loaded state to know whether local changes are still pending

### Unsaved changes hint

A single hint (`unsavedChangesHint`) is displayed under the header as soon as the list diverges
from the last loaded state — whether because of a reorder, an edit, or a pending deletion. The
component does not distinguish between these: an item's position is just another property, so
there is no separate "order changed" state or hint to keep in sync with it.

### Save changes

- The save button is enabled as soon as there is a reorder, an edit or a pending deletion to
  persist, and disabled while items are loading or a save is already in progress
- On click, the card computes exactly what needs to be sent:
  - a `DELETE` for every item queued by [Delete item](#delete-item)
  - a `PUT` for every item whose stored value and/or effective position (its current index in the
    list, as a 1-based `orderKey`) differs from the last loaded state — items that were neither
    edited, reordered nor deleted generate **no request**
- All `DELETE`s and `PUT`s are sent in parallel. If there is nothing left to send (e.g. an item was
  dragged back to its original position), the save is a no-op — no request, no notification
- If at least one request succeeds, in order: `deleted` is emitted with the successfully removed
  items (skipped if none), items reload, `updated` is emitted with the full reloaded list, and the
  event configured through `emitOnSave` (if any) is published on `uiEventSubject`
  - If every request succeeded: positive notification
  - If some requests failed: partial-failure notification (the failed changes are lost — they are
    not automatically retried)
- If every request fails: error notification, **no reload**, no event emitted — the pending
  changes (including queued deletions) are left untouched so the user can retry

### Reset changes

- The reset button shares the save button's enabled condition: there must be a reorder, an edit or
  a pending deletion to revert, and it is disabled while items are loading or a save is in progress
- On click, the local list is restored to the last loaded state and the pending deletions are
  cleared — **nothing is sent to the server**
- This is currently the only way to undo a mistaken deletion or edit; there is no per-item undo

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.GenericSortableListCard`. For the full key reference and
a complete translation example, see [i18n.md](../../i18n.md#genericsortablelistcard).

Key highlights:

- `title` — optional card title (hidden when the key is absent)
- the `label` of each entry of the `fields` prop — header labels, resolved under this same scope
- `ButtonsCard.add` / `ButtonsCard.reset` / `ButtonsCard.save` — header action button labels
- `unsavedChangesHint` — hint shown under the header whenever there are unsaved changes (reorder, edit, or pending deletion)
- `editButton` / `deleteButton` — per-item button labels (optional, default to empty string)
- `CreateFormDialog.*` / `EditFormDialog.*` — scopes for the create and edit `FormDialog`

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
- `add-button` > `q-btn` / `reset-button` > `q-btn` / `save-button` > `q-btn` — header action buttons

---

## **🔌 Plugin Zones**

The component registers a set of plugin zones, all prefixed with the **UI namespace**
(`${uiNamespace}.generic-sortable-list-card`, falling back to `instanceId`) — not with `instanceId` alone. Five are
fixed; one more is registered **per configured field**:

| Zone name                                        | Rendered in | Description                                                       |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `${localUiNamespace}.field-labels.before`         | Header row  | Before the configured field labels                                 |
| `${localUiNamespace}.field-labels.after`          | Header row  | After the configured field labels                                  |
| `${localUiNamespace}.field-values.before`         | Item row    | Row counterpart of `field-labels.before`                           |
| `${localUiNamespace}.field-values.after`          | Item row    | Row counterpart of `field-labels.after`                            |
| `${localUiNamespace}.field-values.${field.name}`  | Item row    | Fallback of the `field-${name}` slot, inside an existing field's cell |
| `${localUiNamespace}.item.actions`                | Item row    | Before the edit and delete buttons of each item                    |

Every zone receives `entity`, `instanceId`, `uiNamespace` and `i18nScope` as props. **What `entity` holds depends on
where the zone is rendered:**

- **Header zones** receive the entity owning the collection — the `entity` prop of the card
- **Item zones** receive the **item of the row**, not the owning entity

A plugin adding a column should register in **both** the value zone and its label counterpart. Registering in only
one still reserves the section on both rows, so the alignment holds — but the header cell stays empty.

`field-values.${field.name}` is different: it does not add a column, and it is not rendered alongside the
`field-${name}` slot (see [Slots](#slots)) — it is nested **inside** that slot's fallback, as an intermediate
fallback of its own. The precedence for a field's value cell is: the `field-${name}` slot if the host provides
one; otherwise the zone, if a plugin has registered a component there; otherwise the default `TruncatedItemLabel`
value display. Only one of the three actually renders.

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
<GenericSortableListCard :entity="organization" :form-fields="formFields" :endpoints="endpoints" :fields="fields" order-key="priority" ui-namespace="organizations.details" i18n-scope="organizations.details" instance-id="organizations" @created="onRoleCreated" @updated="onRoleUpdated" @deleted="onRoleDeleted" />
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
- **Composable:** Built on top of `vuedraggable` and `FormDialog`
- **Configurable:** Fields, form fields and endpoints are driven by configuration; no component code needed
- **Tabular without a table:** Column layout and header row while remaining a drag-and-drop `q-list`
- **Auto-paginating:** Transparently fetches all pages before rendering
- **Zone-ready:** Designed to be rendered through a zone with the page entity injected
- **Extensible:** Per-field slots, before/after slots and plugin zones (fixed and per-field) cover custom UI needs
