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

| Prop            | Type                                           | Required | Default | Description                                                                |
| --------------- | ---------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------- |
| `nodes`         | `TreeNode<T>[]`                                | Yes      | -       | Hierarchical node data                                                     |
| `nodeTypes`     | `TreeNodeType[]`                               | Yes      | -       | Node type definitions with associated actions                              |
| `uiNamespace`   | `string`                                       | Yes      | -       | UI design namespace for custom styling                                     |
| `i18nScope`     | `string`                                       | Yes      | -       | i18n scope for translations                                                |
| `selected`      | `string`                                       | Yes      | -       | The key of the selected node (v-model).                                    |
| `searchEnabled` | `boolean`                                      | No       | -       | Displays the built-in filter input field when `true`.                      |
| `filterMethod`  | `(node: QTreeNode, filter: string) => boolean` | No       | -       | Custom filter function applied to the tree when `searchEnabled` is `true`. |
| `tickeable`     | `boolean`                                      | No       | -       | Enables checkbox selection mode for multi-node selection.                  |
| `ticked`        | `string[]`                                     | No       | -       | Array of selected node keys for checkbox mode (v-model:ticked).            |

---

## **Events**

| Event             | Payload     | Description                                                                                                                         |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `update:selected` | `string`    | Emitted when the selected node changes. Used for `v-model:selected` two-way binding.                                                |
| `update:ticked`   | `string[]`  | Emitted when checkbox selection changes. Used for `v-model:ticked`.                                                                 |
| `click:{action}`  | `QTreeNode` | Emitted when the user clicks on an action in the context menu. `{action}` is the action name (e.g. `click:delete`, `click:rename`). |

Example:

```vue
<GenericTree v-model:selected="currentNodeKey" @click:delete="handleDelete" @click:rename="handleRename" />
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

## **Checkbox Selection Mode**

### Overview

When `tickeable` is set to `true`, the component enables a checkbox-based multi-node selection system.

### How it works

- **Checkboxes:** Each tree node displays a checkbox when `tickeable` is enabled.
- **Node click:** Clicking anywhere on a node (label, icon, or row) toggles the checkbox state.
- **Controlled component:** The `ticked` prop controls the checked state and must follow Vue's v-model pattern.
- **Events:** The `update:ticked` event emits the updated array of selected node keys.

### Props for tickeable mode

```typescript
// Enable tickeable mode
:tickeable = "true"

// Control ticked nodes (v-model:ticked)
v-model:ticked = "tickedNodeKeys"
```

### Example: Basic Selectable Tree

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { TreeNode, TreeNodeType } from '@linagora/linid-im-front-corelib';

const tickedNodes = ref<string[]>([]);

const nodes: TreeNode<{ name: string }>[] = [
  {
    type: 'folder',
    key: 'folder-1',
    value: { name: 'Documents' },
    nodes: [
      {
        type: 'file',
        key: 'file-1',
        value: { name: 'Report.pdf' },
        nodes: [],
      },
    ],
  },
];

const nodeTypes: TreeNodeType[] = [
  { type: 'folder', actions: [] },
  { type: 'file', actions: [] },
];
</script>

<template>
  <GenericTree
    v-model:ticked="tickedNodes"
    :nodes="nodes"
    :node-types="nodeTypes"
    :tickeable="true"
    ui-namespace="FilterPanel"
    i18n-scope="FilterPanel"
  />

  <div>{{ tickedNodes }}</div>
</template>
```

### Interaction Rules

1. **Checkbox click:** Clicking the checkbox toggles selection.
2. **Node row click:** Clicking anywhere else on the node row also toggles selection.
3. **No implicit selection:** Only the clicked node's state changes; parent/child nodes are not automatically selected or deselected.
4. **Controlled updates:** The parent component controls all ticked state via the `ticked` prop and receives updates via `update:ticked` event.

### Styling Notes

- Checkboxes appear in the left padding of each node when `tickeable` is true.
- When `tickeable` is false, the tree renders without checkboxes and maintains its default appearance.
- Checkbox styling follows Quasar's `QCheckbox` defaults unless customized via the UI namespace.

---

## **Node Selection Behavior**

### Non-null constraint

The component enforces that a node is **always** selected:

- Quasar's `no-selection-unset` prop prevents the user from deselecting a node by clicking the currently selected one.

### Two-way binding

Use `v-model:selected` to keep the parent in sync with the currently selected node:

```vue
<GenericTree v-model:selected="currentNodeKey" :nodes="nodes" ... />
```

When the user clicks a node in the tree, the component emits `update:selected` with the corresponding key.

---

## **Filtering**

When `searchEnabled` is `true`, the component renders a built-in `q-input` above the tree. The text typed in that input is used as the filter string passed to Quasar's `QTree`.

```vue
<GenericTree v-model:selected-node="selectedNode" :nodes="nodes" :node-types="nodeTypes" :search-enabled="true" :filter-method="customFilter" ui-namespace="Homepage" i18n-scope="Homepage" />
```

```typescript
function customFilter(node: QTreeNode, filter: string): boolean {
  return node.label?.toLowerCase().includes(filter.toLowerCase()) ?? false;
}
```

---

## **Types**

### `TreeNode<T>`

Exported from `@linagora/linid-im-front-corelib`:

```typescript
type TreeNode<T> = {
  type: string;
  key: string;
  value: T;
  nodes: TreeNode<T>[];
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
export type UiPropsAction = Record<
  string,
  {
    /**
     * The UI properties for the displayed icon.
     */
    icon: LinidQIconProps;
  }
>;

/** Defines the UI properties for different node types in the tree */
export type UiPropsTypes = Record<
  string,
  {
    /** The UI properties for the displayed icon. */
    icon: LinidQIconProps;
    /** The UI properties for the action icon. */
    actions: UiPropsAction;
  }
>;
```

This type is imported from `@linagora/linid-im-front-corelib`.

---

## **useTree Composable**

The `useTree` composable (from corelib) exposes a `toQTreeNodes` mapper that converts `TreeNode<T>[]` into the format expected by Quasar's `QTree`:

```typescript
import { useTree } from '@linagora/linid-im-front-corelib';

const { toQTreeNodes } = useTree();
const quasarNodes = computed(() => toQTreeNodes(props.nodes));
```

This conversion is handled internally by `GenericTree` — consumers simply pass `TreeNode<T>[]`.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()` and applies props to several Quasar components:

| Namespace                                                 | Target    | Description                            |
| --------------------------------------------------------- | --------- | -------------------------------------- |
| `{uiNamespace}.GenericTree`                               | `q-input` | Filter input field props               |
| `{uiNamespace}.GenericTree`                               | `q-tree`  | Tree-level props                       |
| `{uiNamespace}.GenericTree.ButtonActions`                 | `q-btn`   | Context menu trigger button            |
| `{uiNamespace}.GenericTree.types.{type}`                  | `q-icon`  | Icon for the node type label           |
| `{uiNamespace}.GenericTree.types.{type}.actions.{action}` | `q-icon`  | Icon for a specific action in the menu |

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
- **Type-safe:** Node structure typed via corelib `TreeNode<T>` and `TreeNodeType`
- **Consistent:** UI props and icons come from the LinID design system
- **Extensible:** Per-node `extraActions` allow customization without changing node types
- **Reusable:** Designed as a base for future enhancements (lazy loading, drag-and-drop, etc.)

---

## **Usage Example**

### Standard Mode (Single Node Selection)

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import { ref, type Component } from 'vue';
import type { TreeNode, TreeNodeType } from '@linagora/linid-im-front-corelib';
import type { QTreeNode } from 'quasar';

const remoteComponent = ref<Component | null>(null);

type NodeValue = { name: string };

const nodes: TreeNode<NodeValue>[] = [
  {
    type: 'folder',
    key: 'root',
    value: { name: 'Root' },
    extraActions: ['share'],
    nodes: [
      {
        type: 'file',
        key: 'child-1',
        value: { name: 'Child 1' },
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

const selectedNode = ref<string>('child-1');

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
    v-model:selected="selectedNode"
    ui-namespace="Homepage"
    i18n-scope="Homepage"
    :nodes="nodes"
    :node-types="nodeTypes"
    :search-enabled="true"
    @click:delete="handleDelete"
    @click:rename="handleRename"
    @click:share="handleShare"
  />
</template>
```

### Selectable Mode (Multi-Node Selection)

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import { ref, type Component } from 'vue';
import type { TreeNode, TreeNodeType } from '@linagora/linid-im-front-corelib';

const remoteComponent = ref<Component | null>(null);

type NodeValue = { name: string };

const nodes: TreeNode<NodeValue>[] = [
  {
    type: 'department',
    key: 'eng',
    value: { name: 'Engineering' },
    nodes: [
      {
        type: 'team',
        key: 'eng-backend',
        value: { name: 'Backend' },
        nodes: [],
      },
      {
        type: 'team',
        key: 'eng-frontend',
        value: { name: 'Frontend' },
        nodes: [],
      },
    ],
  },
  {
    type: 'department',
    key: 'sales',
    value: { name: 'Sales' },
    nodes: [
      {
        type: 'team',
        key: 'sales-emea',
        value: { name: 'EMEA' },
        nodes: [],
      },
    ],
  },
];

const nodeTypes: TreeNodeType[] = [
  { type: 'department', actions: [] },
  { type: 'team', actions: [] },
];

const tickedNodes = ref<string[]>([]);

remoteComponent.value = loadAsyncComponent('catalogUI/GenericTree');
</script>

<template>
  <div class="filter-container">
    <component
      :is="remoteComponent"
      v-if="remoteComponent"
      v-model:ticked="tickedNodes"
      ui-namespace="FilterPanel"
      i18n-scope="FilterPanel"
      :nodes="nodes"
      :node-types="nodeTypes"
      :tickeable="true"
    />

    <div>Selected: {{ tickedNodes }}</div>
  </div>
</template>
```

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

| Key                                                     | Description                                   | Usage                   | Parameters |
| ------------------------------------------------------- | --------------------------------------------- | ----------------------- | ---------- |
| `{i18nScope}.GenericTree.filterLabel`                   | Label for the filter input field              | Filter input            | -          |
| `{i18nScope}.GenericTree.filterHint`                    | Hint text below the filter input field        | Filter input            | -          |
| `{i18nScope}.GenericTree.noNodesLabel`                  | Message shown when the tree has no nodes      | Empty tree state        | -          |
| `{i18nScope}.GenericTree.noResultsLabel`                | Message shown when a filter yields no results | Filtered empty state    | -          |
| `{i18nScope}.GenericTree.types.{type}.label`            | Display label for a given node type           | Node header in the tree | `value`    |
| `{i18nScope}.GenericTree.types.{type}.actions.{action}` | Label for an action in the context menu       | Context menu item       | -          |

Example:

```json
{
  "[INSTANCE_ID].GenericTree": {
    "filterLabel": "Search",
    "filterHint": "Filter nodes by name",
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
