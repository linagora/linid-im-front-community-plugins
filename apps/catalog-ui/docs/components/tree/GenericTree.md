# **GenericTree**

The **GenericTree** component is a minimal wrapper around Quasar's `QTree`.
It renders a hierarchical tree from provided nodes, with per-type icon support and customizable node headers.

---

## **Purpose**

- Provide a reusable base tree for hierarchical entity structures
- Keep the first iteration minimal and easy to extend later
- Stay aligned with the LinID design system
- Support per-node-type styling (icons, labels) via the UI namespace
- Provide internationalized labels for empty states

---

## **Props**

| Prop          | Type         | Required | Default | Description                            |
| ------------- | ------------ | -------- | ------- | -------------------------------------- |
| `nodes`       | `TreeNode[]` | Yes      | -       | Hierarchical node data                 |
| `uiNamespace` | `string`     | Yes      | -       | UI design namespace for custom styling |
| `i18nScope`   | `string`     | Yes      | -       | i18n scope for translations            |

---

## **Types**

The type `TreeNode` is exported from `@linagora/linid-im-front-corelib`:

```typescript
type TreeNode = {
  type: string;
  key: string;
  value: string | number | Record<string, unknown>;
  nodes: TreeNode[];
};
```

This type is imported from `@linagora/linid-im-front-corelib`.

---

## **useTree Composable**

The `useTree` composable (from corelib) exposes a `toQTreeNodes` mapper that converts `TreeNode[]` into the format expected by Quasar's `QTree`:

```typescript
import { useTree } from '@linagora/linid-im-front-corelib';

const { toQTreeNodes } = useTree();
const quasarNodes = computed(() => toQTreeNodes(props.nodes));
```

This conversion is handled internally by `GenericTree` — consumers simply pass `TreeNode[]`.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()` and applies props to Quasar's `QTree` and `QIcon`:

- **Tree props**: `{uiNamespace}.GenericTree` → applies to `q-tree`
- **Icon props per type**: `{uiNamespace}.GenericTree.types.{type}` → applies to `q-icon`

Example:

```typescript
// For uiNamespace = 'Homepage' and type = 'folder'
// Tree:        ui('Homepage.GenericTree', 'q-tree')
// Folder icon: ui('Homepage.GenericTree.types.folder', 'q-icon')
```

---

## **Advantages**

- **Simple:** Minimal wrapper with sensible defaults
- **Type-safe:** Node structure typed via corelib `TreeNode`
- **Consistent:** UI props and icons come from the LinID design system
- **Reusable:** Designed as a base for future enhancements (lazy loading, drag-and-drop, etc.)

---

## **Usage Example**

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import { ref, type Component } from 'vue';
import type { TreeNode } from '@linagora/linid-im-front-corelib';

const remoteComponent = ref<Component | null>(null);

const nodes: TreeNode[] = [
  {
    type: 'folder',
    key: 'root',
    value: 'Root',
    nodes: [
      {
        type: 'file',
        key: 'child-1',
        value: 'Child 1',
        nodes: [],
      },
    ],
  },
];

remoteComponent.value = loadAsyncComponent('catalogUI/GenericTree');
</script>

<template>
  <component
    :is="remoteComponent"
    v-if="remoteComponent"
    ui-namespace="Homepage"
    i18n-scope="Homepage"
    :nodes="nodes"
  />
</template>
```

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

| Key                                          | Description                                   | Usage                   | Parameters |
| -------------------------------------------- | --------------------------------------------- | ----------------------- | ---------- |
| `{i18nScope}.GenericTree.noNodesLabel`       | Message shown when the tree has no nodes      | Empty tree state        | -          |
| `{i18nScope}.GenericTree.noResultsLabel`     | Message shown when a filter yields no results | Filtered empty state    | -          |
| `{i18nScope}.GenericTree.types.{type}.label` | Display label for a given node type           | Node header in the tree | `value`    |

Example:

```json
{
  "[INSTANCE_ID].GenericTree": {
    "noNodesLabel": "No items to display",
    "noResultsLabel": "No results",
    "types": {
      "folder": {
        "label": "Folder: {value}"
      },
      "file": {
        "label": "{value}"
      }
    }
  }
}
```
