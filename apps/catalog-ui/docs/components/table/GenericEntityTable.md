# **GenericEntityTable 🧾**

The **GenericEntityTable** component is a minimal wrapper around Quasar's `QTable`.
It renders a simple table from provided columns and rows, without slots, actions, or events.

---

## **🎯 Purpose**

- Provide a reusable base table for entity lists
- Keep the first iteration minimal and easy to extend later
- Stay aligned with the LinID design system

---

## **⚙️ Props**

| Prop          | Type                        | Required | Default | Description                            |
| ------------- | --------------------------- | -------- | ------- | -------------------------------------- |
| `columns`     | `QTableColumn[]`            | Yes      | -       | Column definitions for Quasar QTable   |
| `rows`        | `Record<string, unknown>[]` | Yes      | -       | Table row data                         |
| `rowKey`      | `QTableProps['rowKey']`     | No       | `id`    | Row key for Quasar QTable              |
| `uiNamespace` | `string`                    | Yes      | -       | UI design namespace for custom styling |

---

## **🎨 UI Customization**

The component uses the LinID design system through `useUiDesign()` and applies
props to Quasar's `QTable`:

- **Table props**: `{uiNamespace}.generic-entity-table` → applies to `q-table`

Example:

```typescript
// For uiNamespace = 'catalogUI'
// Table: ui('catalogUI.generic-entity-table', 'q-table')
```

---

## **✅ Advantages**

- **Simple:** No slots, actions, or event handling in this iteration
- **Type-safe:** Columns and rows are typed with Quasar definitions
- **Consistent:** UI props come from the LinID design system
- **Reusable:** Designed as a base for future enhancements

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import { ref, type Component } from 'vue';
import type { QTableColumn } from 'quasar';

const remoteComponent = ref<Component | null>(null);

const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
];

const rows = [{ id: 1, name: 'John Doe' }];

remoteComponent.value = loadAsyncComponent('catalogUI/GenericEntityTable');
</script>

<template>
  <component
    :is="remoteComponent"
    v-if="remoteComponent"
    ui-namespace="catalogUI"
    :columns
    :rows="rows"
  />
</template>
```

---

## **📄 Pagination & Server-Side Data Handling**

`GenericEntityTable` fully supports **Quasar pagination** by transparently forwarding pagination-related props and events to the underlying `QTable`.

This allows the component to be used in **controlled pagination mode**, including server-side pagination, sorting, and filtering.

---

### **🔁 Controlled Pagination**

Pagination is managed externally using Quasar’s `pagination` object and the `@request` event.

Example:

```vue
<component v-model:pagination="pagination" v-if="table" :is="table" :columns="columns" :rows="rows" @request="onRequest" />
```

---

### **🧠 Pagination State**

```ts
const pagination = ref<QuasarPagination>({
  page: 1,
  rowsPerPage: 1,
  sortBy: 'id',
  descending: false,
  rowsNumber: 2,
});
```

Key fields:

- `page`: current page (1-based)
- `rowsPerPage`: number of rows per page
- `rowsNumber`: **total number of rows** (required for server-side pagination)
- `sortBy` / `descending`: current sorting state

---

### **📡 Handling Data Requests**

When pagination, sorting, or filtering changes, `QTable` emits a `request` event.
This event is forwarded unchanged by `GenericEntityTable`.

```ts
function onRequest(props: QTableRequestEvent) {
  console.log(props);
}
```

`props` contains:

- `pagination`: updated pagination state
- `filter`: active filter (if any)
- `getCellValue`: helper function from Quasar

This is typically where you:

1. Fetch new data from the backend
2. Update `rows`
3. Update `pagination.rowsNumber` with the total count from the API

---

### **📌 Important Notes**

- `GenericEntityTable` does **not** manage pagination internally
- All pagination logic (state, API calls, synchronization) is owned by the parent
- This design keeps the component:
  - predictable
  - easy to test
  - compatible with server-side data sources

---

### **✅ Recommended Use Cases**

- Large datasets
- Backend-driven pagination
- Consistent pagination behavior across multiple entity tables

## **📌 Notes**

- Uses `row-key="id"` by default (override with `rowKey`)
- No custom cells, slots, actions, or events yet
