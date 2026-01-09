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

## **📌 Notes**

- Uses `row-key="id"` by default (override with `rowKey`)
- No custom cells, slots, actions, or events yet
