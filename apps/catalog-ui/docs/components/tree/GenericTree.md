# **GenericTree**

The **GenericTree** component is a minimal wrapper around Quasar's `QTree`.
It renders a hierarchical tree from provided nodes, with per-type icon support, customizable node headers, and a contextual action menu per node.

---

## **Purpose**

- Provide a reusable base tree for hierarchical entity structures
- Keep the first iteration minimal and easy to extend later
- Stay aligned with the LinID design system
- Support per-node-type styling (icons, labels) via the UI namespace
- Support per-node-type contextual actions with dynamic icon support
- Provide internationalized labels for empty states and actions

---

## **Props**

| Prop          | Type             | Required | Default | Description                                   |
| ------------- | ---------------- | -------- | ------- | --------------------------------------------- |
| `nodes`       | `TreeNode[]`     | Yes      | -       | Hierarchical node data                        |
| `nodeTypes`   | `TreeNodeType[]` | Yes      | -       | Node type definitions with associated actions |
| `uiNamespace` | `string`         | Yes      | -       | UI design namespace for custom styling        |
| `i18nScope`   | `string`         | Yes      | -       | i18n scope for translations                   |

---

## **Events**

The component emits dynamic events based on the action name:

| Event            | Payload     | Description                                                                                                                         |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `click:{action}` | `QTreeNode` | Emitted when the user clicks on an action in the context menu. `{action}` is the action name (e.g. `click:delete`, `click:rename`). |

Example:

```vue
<GenericTree @click:delete="handleDelete" @click:rename="handleRename" />
```

```typescript
function handleDelete(node: QTreeNode) {
  /* ... */
}

function handleRename(node: QTreeNode) {
  /* ... */
}
```

---

## **Types**

### `TreeNode`

Exported from `@linagora/linid-im-front-corelib`:

```typescript
type TreeNode = {
  type: string;
  key: string;
  value: string | number | Record<string, unknown>;
  nodes: TreeNode[];
  extraActions?: string[];
};
```

### `TreeNodeType`

Exported from `@linagora/linid-im-front-corelib`:

```typescript
type TreeNodeType = {
  type: string;
  actions?: string[]; // actions available for all nodes of this type
};
```

### `UiPropsTypes` / `UiPropsAction`

Internal types defined in `src/types/genericTree.ts`:

```typescript
/** Defines the UI properties for different actions in node types. */
type UiPropsAction = {
  /** The UI properties for the displayed icon. */
  icon: LinidQIconProps;
};

/** Defines the UI properties for different node types in the tree */
type UiPropsTypes = Record<
  string,
  {
    /** The UI properties for the displayed icon. */
    icon: LinidQIconProps;
    /** The UI properties for the action icon. */
    actions: Record<string, UiPropsAction>;
  }
>;
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

The component uses the LinID design system through `useUiDesign()` and applies props to several Quasar components:

| Namespace                                                 | Target   | Description                            |
| --------------------------------------------------------- | -------- | -------------------------------------- |
| `{uiNamespace}.GenericTree`                               | `q-tree` | Tree-level props                       |
| `{uiNamespace}.GenericTree.ButtonActions`                 | `q-btn`  | Context menu trigger button            |
| `{uiNamespace}.GenericTree.types.{type}`                  | `q-icon` | Icon for the node type label           |
| `{uiNamespace}.GenericTree.types.{type}.actions.{action}` | `q-icon` | Icon for a specific action in the menu |

Example:

```typescript
// For uiNamespace = 'Homepage', type = 'folder', action = 'delete'
// Tree:          ui('Homepage.GenericTree', 'q-tree')
// Button:        ui('Homepage.GenericTree.ButtonActions', 'q-btn')
// Folder icon:   ui('Homepage.GenericTree.types.folder', 'q-icon')
// Delete icon:   ui('Homepage.GenericTree.types.folder.actions.delete', 'q-icon')
```

---

## **Advantages**

- **Simple:** Minimal wrapper with sensible defaults
- **Type-safe:** Node structure typed via corelib `TreeNode` and `TreeNodeType`
- **Consistent:** UI props and icons come from the LinID design system
- **Extensible:** Per-node `extraActions` allow customization without changing node types
- **Reusable:** Designed as a base for future enhancements (lazy loading, drag-and-drop, etc.)

---

## **Usage Example**

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import { ref, type Component } from 'vue';
import type { TreeNode, TreeNodeType } from '@linagora/linid-im-front-corelib';
import type { QTreeNode } from 'quasar';

const remoteComponent = ref<Component | null>(null);

const nodes: TreeNode[] = [
  {
    type: 'folder',
    key: 'root',
    value: 'Root',
    extraActions: ['share'],
    nodes: [
      {
        type: 'file',
        key: 'child-1',
        value: 'Child 1',
        extraActions: [],
        nodes: [],
      },
    ],
  },
];

const nodeTypes: TreeNodeType[] = [
  { type: 'folder', actions: ['rename', 'delete'] },
  { type: 'file', actions: ['download'] },
];

function handleDelete(node: QTreeNode) {
  console.log('delete', node);
}

function handleRename(node: QTreeNode) {
  console.log('rename', node);
}

function handleShare(node: QTreeNode) {
  console.log('share', node);
}

remoteComponent.value = loadAsyncComponent('catalogUI/GenericTree');
</script>

<template>
  <component
    :is="remoteComponent"
    v-if="remoteComponent"
    ui-namespace="Homepage"
    i18n-scope="Homepage"
    :nodes="nodes"
    :node-types="nodeTypes"
    @click:delete="handleDelete"
    @click:rename="handleRename"
    @click:share="handleShare"
  />
</template>
```

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

| Key                                                     | Description                                   | Usage                   | Parameters |
| ------------------------------------------------------- | --------------------------------------------- | ----------------------- | ---------- |
| `{i18nScope}.GenericTree.noNodesLabel`                  | Message shown when the tree has no nodes      | Empty tree state        | -          |
| `{i18nScope}.GenericTree.noResultsLabel`                | Message shown when a filter yields no results | Filtered empty state    | -          |
| `{i18nScope}.GenericTree.types.{type}.label`            | Display label for a given node type           | Node header in the tree | `value`    |
| `{i18nScope}.GenericTree.types.{type}.actions.{action}` | Label for an action in the context menu       | Context menu item       | -          |

Example:

```json
{
  "[INSTANCE_ID].GenericTree": {
    "noNodesLabel": "No items to display",
    "noResultsLabel": "No results",
    "types": {
      "folder": {
        "label": "Folder: {value}",
        "actions": {
          "rename": "Rename",
          "delete": "Delete",
          "share": "Share"
        }
      },
      "file": {
        "label": "{value}",
        "actions": {
          "download": "Download"
        }
      }
    }
  }
}
```
