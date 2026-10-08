<!--
  Copyright (C) 2026 Linagora

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
  Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
  any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
  LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
  which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
  of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
  Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
  sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
  as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
  and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
  intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
  <http://www.linagora.com/licenses/> for more details.

  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
  details.

  You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
  LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
  General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
  LinID Identity Manager software.
-->

<template>
  <div
    class="generic-tree-container"
    :class="{ 'generic-tree-container--selectable': props.selectedIcon }"
  >
    <q-input
      v-if="props.searchEnabled"
      v-model="filter"
      type="text"
      :data-cy="`organizational-unit-filter-input`"
      class="generic-tree-filter-input"
      :label="t('filterLabel')"
      :hint="t('filterHint')"
      v-bind="uiProps.filterInput"
    />

    <q-tree
      v-model:selected="selectedNode"
      class="tree"
      :nodes="quasarNodes"
      node-key="key"
      :filter="filter"
      :filter-method="filterMethod ?? defaultFilterMethod"
      :expanded="expandedNodes"
      v-bind="uiProps.tree"
      no-selection-unset
      :no-nodes-label="t('noNodesLabel')"
      :no-results-label="t('noResultsLabel')"
      data-cy="generic-tree"
      @update:expanded="onExpandedUpdate"
    >
      <template #default-header="prop">
        <div
          :class="`row items-center full-width tree-header-type-${prop.node.type} tree-header-key-${prop.node.key}`"
          @click="toggleNodeSelection(prop.node.key, $event)"
        >
          <q-checkbox
            v-if="props.tickeable"
            :model-value="tickedNodes.includes(prop.node.key)"
            v-bind="uiProps.checkbox"
            class="tree-header-checkbox"
            :data-cy="`generic-tree-checkbox-${prop.node.key}`"
            @click="toggleNodeSelection(prop.node.key, $event)"
          />
          <q-icon
            v-if="uiProps.types[prop.node.type]?.icon?.name"
            v-bind="uiProps.types[prop.node.type].icon"
            class="q-mr-sm tree-header-icon"
          />
          <div
            class="text-weight-bold col-grow tree-header-title"
            :data-cy="`generic-tree-node-${prop.node.key}`"
          >
            {{ t(`types.${prop.node.type}.label`, { ...prop.node.value }) }}
            <q-icon
              v-if="props.selectedIcon && prop.node.key === selectedNode"
              v-bind="uiProps.selectedIcon"
              class="q-ml-xs tree-header-selected-icon"
              :data-cy="`tree-selected-icon-${prop.node.key}`"
            />
          </div>
          <q-btn
            v-if="resolvedActionsByNode[prop.node.key]"
            v-bind="uiProps.buttonActions"
            class="tree-header-actions-btn"
            :data-cy="`tree-actions-btn-${prop.node.key}`"
            @click.stop
          >
            <q-menu>
              <q-list>
                <q-item
                  v-for="action in resolvedActionsByNode[prop.node.key]"
                  :key="action"
                  v-close-popup
                  clickable
                  :data-cy="`tree-actions-btn-${prop.node.key}-${action}`"
                  @click="emit(`click:${action}`, prop.node)"
                >
                  <q-item-section avatar>
                    <q-icon
                      v-if="
                        uiProps.types[prop.node.type]?.actions?.[action]?.icon
                          ?.name
                      "
                      v-bind="
                        uiProps.types[prop.node.type].actions[action].icon
                      "
                      class="q-mr-sm tree-header-action-icon"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ t(`types.${prop.node.type}.actions.${action}`) }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <!-- The actions open their own dialogs or menus, so their clicks must not select the
            node, which would navigate away from the tree. -->
          <div
            class="tree-header-node-actions"
            @click.stop
          >
            <slot
              name="node-actions"
              :node="prop.node"
            />
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQCheckboxProps,
  LinidQIconProps,
  LinidQInputProps,
  LinidQTreeProps,
  TreeNode,
} from '@linagora/linid-im-front-corelib';
import {
  useScopedI18n,
  useTree,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { QTreeNode } from 'quasar';
import type { Ref } from 'vue';
import { computed, ref, toRaw, watch, watchEffect } from 'vue';
import type {
  TreeOutputs,
  TreeProps,
  UiPropsAction,
  UiPropsTypes,
} from '../../types/genericTree';

const props = defineProps<TreeProps<unknown>>();
const filter = ref<string>('');
const tickedNodes = ref<string[]>([]);

const emit = defineEmits<TreeOutputs<unknown>>();

const { ui } = useUiDesign();
const { t } = useScopedI18n(`${props.i18nScope}.GenericTree`);
const { toQTreeNodes } = useTree();

/**
 * Toggles the selection state of a node.
 * @param nodeKey The key of the node to toggle.
 * @param event The mouse event on the checkbox or on the node.
 */
function toggleNodeSelection(nodeKey: string, event: PointerEvent): void {
  if (!props.tickeable) {
    return;
  }
  event.stopPropagation();
  const index = tickedNodes.value.indexOf(nodeKey);
  if (index > -1) {
    tickedNodes.value.splice(index, 1);
  } else {
    tickedNodes.value.push(nodeKey);
  }
  emit('update:ticked', [...tickedNodes.value]);
}

/**
 * Filters a node on its translated label, as the q-tree default method relies on a label property
 * the nodes do not carry: labels are rendered through the i18n system from the node type and value.
 * Used when no filter method is provided.
 * @param node - The filtered node.
 * @param filter - The filter input value.
 * @returns Whether the translated node label contains the filter, ignoring case.
 */
function defaultFilterMethod(node: TreeNode<unknown>, filter: string): boolean {
  return t(`types.${node.type}.label`, {
    ...(node.value as Record<string, unknown>),
  })
    .toLowerCase()
    .includes(filter.toLowerCase());
}

/** The node types declared non-selectable in the node-type definitions. */
const nonSelectableTypes = computed(
  () =>
    new Set(
      props.nodeTypes
        .filter((nodeType) => nodeType.selectable === false)
        .map((nodeType) => nodeType.type)
    )
);

/**
 * Marks the nodes of a non-selectable type, so q-tree renders them expandable but not selectable.
 * @param nodes - The Quasar nodes to mark.
 * @returns The nodes with the selectable flag set on the non-selectable types.
 */
function markSelectable(nodes: QTreeNode[]): QTreeNode[] {
  if (nonSelectableTypes.value.size === 0) {
    return nodes;
  }

  return nodes.map((node) => ({
    ...node,
    selectable: !nonSelectableTypes.value.has(String(node.type)),
    children: markSelectable(node.children ?? []),
  }));
}

const quasarNodes = computed(() => markSelectable(toQTreeNodes(props.nodes)));
const nodeTypesMap = computed(
  () => new Map(props.nodeTypes.map((nodeType) => [nodeType.type, nodeType]))
);

const resolvedActionsByNode: Ref<Record<string, string[]>> = ref({});
const resolvedActionsByType: Ref<Record<string, string[]>> = ref({});
const treeNodeRecord: Ref<Record<string, TreeNode<unknown>>> = ref({});
const selectedNode = ref<string>(props.selected || '');
const expandedNodes = ref<string[]>(props.expanded ? [...props.expanded] : []);

/**
 * Keeps the controlled expansion in sync with the user folding and unfolding nodes.
 * @param keys - The keys of the expanded nodes reported by the tree.
 */
function onExpandedUpdate(keys: readonly string[]) {
  expandedNodes.value = [...keys];
}

/**
 * Recursively builds indexes for quick lookup of actions by node key and type.
 * @param nodes The tree nodes to index.
 */
function buildIndexes(nodes: TreeNode<unknown>[]) {
  // toRaw prevents tracking the object's property reads, avoiding a reactive cycle in watchEffect.
  const rawResolvedActionsByType = toRaw(resolvedActionsByType.value);

  for (const node of nodes) {
    treeNodeRecord.value[node.key] = node;
    const nodeActions = [
      ...new Set([
        ...(nodeTypesMap.value.get(node.type)?.actions || []),
        ...(node.extraActions || []),
      ]),
    ];

    if (nodeActions.length > 0) {
      // Union of all actions ever seen for this type, used to build icon lookups in uiProps.types.
      const typeActions = [
        ...new Set([
          ...(rawResolvedActionsByType[node.type] || []),
          ...nodeActions,
        ]),
      ];

      resolvedActionsByType.value[node.type] = typeActions;
      resolvedActionsByNode.value[node.key] = nodeActions;
    }

    if (node.nodes.length > 0) {
      buildIndexes(node.nodes);
    }
  }
}

watchEffect(() => {
  resolvedActionsByType.value = {};
  resolvedActionsByNode.value = {};
  treeNodeRecord.value = {};
  buildIndexes(props.nodes);
});

/** The controlled expansion to restore when the filter is cleared. */
let preFilterExpansion: string[] | null = null;

// A filtered tree only shows the matching branches, but q-tree keeps the expansion state: the
// whole tree expands while a filter is typed so every match is visible, and the previous
// expansion comes back once the filter is cleared.
watch(filter, (value: string, previous: string) => {
  if (value) {
    preFilterExpansion ??= [...expandedNodes.value];
    expandedNodes.value = Object.keys(treeNodeRecord.value);
  } else if (previous) {
    expandedNodes.value = preFilterExpansion ?? [];
    preFilterExpansion = null;
  }
});

watch(selectedNode, (key: string) => {
  emit('update:selected', key);
});

watch(
  () => props.selected,
  (key: string | undefined) => {
    selectedNode.value = key || '';
  }
);

watch(
  () => props.expanded,
  (keys: string[] | undefined) => {
    const next = keys ? [...keys] : [];

    // While a filter is active, the tree stays fully expanded: the new expansion becomes the
    // state restored when the filter is cleared.
    if (preFilterExpansion !== null) {
      preFilterExpansion = next;
      return;
    }

    expandedNodes.value = next;
  }
);

watch(
  () => props.ticked,
  (newTicked: string[] | undefined) => {
    if (!newTicked || newTicked.length === 0) {
      tickedNodes.value = [];
      return;
    }

    const nodeKeys = Object.keys(treeNodeRecord.value);
    tickedNodes.value = newTicked.filter((str) => nodeKeys.includes(str));
  },
  { immediate: true }
);

const uiProps = computed(() => ({
  filterInput: ui<LinidQInputProps>(
    `${props.uiNamespace}.GenericTree`,
    'q-input'
  ),
  // A controlled expansion owns the expanded state: a defaultExpandAll coming from the design,
  // including a global default, would override it with every node on first render.
  tree: {
    ...ui<LinidQTreeProps>(`${props.uiNamespace}.GenericTree`, 'q-tree'),
    ...(props.expanded === undefined ? {} : { defaultExpandAll: false }),
  },
  selectedIcon: {
    name: 'check',
    color: 'positive',
    ...ui<LinidQIconProps>(
      `${props.uiNamespace}.GenericTree.selected-icon`,
      'q-icon'
    ),
  },
  buttonActions: ui<LinidQBtnProps>(
    `${props.uiNamespace}.GenericTree.ButtonActions`,
    'q-btn'
  ),
  checkbox: ui<LinidQCheckboxProps>(
    `${props.uiNamespace}.GenericTree`,
    'q-checkbox'
  ),
  // Every node type gets its icon lookup, whether it is declared, carried by a rendered node or
  // resolved from the actions, so every node displays the icon its type provides.
  types: [
    ...new Set([
      ...props.nodeTypes.map((nodeType) => nodeType.type),
      ...Object.values(treeNodeRecord.value).map((node) => node.type),
      ...Object.keys(resolvedActionsByType.value),
    ]),
  ].reduce<UiPropsTypes>((acc, type) => {
    acc[type] = {
      icon: ui<LinidQIconProps>(
        `${props.uiNamespace}.GenericTree.types.${type}`,
        'q-icon'
      ),
      actions: (resolvedActionsByType.value[type] || []).reduce<UiPropsAction>(
        (actionsAcc, action) => {
          actionsAcc[action] = {
            icon: ui<LinidQIconProps>(
              `${props.uiNamespace}.GenericTree.types.${type}.actions.${action}`,
              'q-icon'
            ),
          };
          return actionsAcc;
        },
        {}
      ),
    };
    return acc;
  }, {}),
}));
</script>

<style>
.generic-tree-container {
  padding: 1rem;
}

/* Mirrors the hover feedback on the selected node, with the selection color of the tree, in the
   trees where the selection is a value, such as the tree form field. */
.generic-tree-container--selectable
  .q-tree__node-header.q-tree__node--selected {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}
</style>
