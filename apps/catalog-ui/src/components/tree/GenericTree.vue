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
  <div class="generic-tree-container">
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
      :filter-method="props.filterMethod"
      v-bind="uiProps.tree"
      no-selection-unset
      :no-nodes-label="t('noNodesLabel')"
      :no-results-label="t('noResultsLabel')"
      data-cy="generic-tree"
    >
      <template #default-header="prop">
        <div
          :class="`row items-center full-width tree-header-type-${prop.node.type} tree-header-key-${prop.node.key}`"
          @click.stop="toggleNodeSelection(prop.node.key)"
        >
          <q-checkbox
            v-if="props.tickeable"
            :model-value="tickedNodes.includes(prop.node.key)"
            v-bind="uiProps.checkbox"
            class="tree-header-checkbox"
            :data-cy="`generic-tree-checkbox-${prop.node.key}`"
            @click="toggleNodeSelection(prop.node.key)"
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
 */
function toggleNodeSelection(nodeKey: string): void {
  if (!props.tickeable) {
    return;
  }
  const index = tickedNodes.value.indexOf(nodeKey);
  if (index > -1) {
    tickedNodes.value.splice(index, 1);
  } else {
    tickedNodes.value.push(nodeKey);
  }
  emit('update:ticked', [...tickedNodes.value]);
}

const quasarNodes = computed(() => toQTreeNodes(props.nodes));
const nodeTypesMap = computed(
  () => new Map(props.nodeTypes.map((nodeType) => [nodeType.type, nodeType]))
);

const resolvedActionsByNode: Ref<Record<string, string[]>> = ref({});
const resolvedActionsByType: Ref<Record<string, string[]>> = ref({});
const treeNodeRecord: Ref<Record<string, TreeNode<unknown>>> = ref({});
const selectedNode = ref<string>(props.selected || '');

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
  tree: ui<LinidQTreeProps>(`${props.uiNamespace}.GenericTree`, 'q-tree'),
  buttonActions: ui<LinidQBtnProps>(
    `${props.uiNamespace}.GenericTree.ButtonActions`,
    'q-btn'
  ),
  checkbox: ui<LinidQCheckboxProps>(
    `${props.uiNamespace}.GenericTree`,
    'q-checkbox'
  ),
  types: Object.entries(resolvedActionsByType.value).reduce<UiPropsTypes>(
    (acc, [type, actions]) => {
      acc[type] = {
        icon: ui<LinidQIconProps>(
          `${props.uiNamespace}.GenericTree.types.${type}`,
          'q-icon'
        ),
        actions: actions.reduce<UiPropsAction>((acc, action) => {
          acc[action] = {
            icon: ui<LinidQIconProps>(
              `${props.uiNamespace}.GenericTree.types.${type}.actions.${action}`,
              'q-icon'
            ),
          };
          return acc;
        }, {}),
      };
      return acc;
    },
    {}
  ),
}));
</script>

<style>
.generic-tree-container {
  padding: 1rem;
}
</style>
