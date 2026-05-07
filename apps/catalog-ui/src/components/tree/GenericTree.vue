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
  <q-tree
    v-model:selected="selected"
    class="tree"
    :nodes="quasarNodes"
    node-key="key"
    v-bind="uiProps.tree"
    no-selection-unset
    :no-nodes-label="t('noNodesLabel')"
    :no-results-label="t('noResultsLabel')"
  >
    <template #default-header="prop">
      <div
        :class="`row items-center full-width tree-header-type-${prop.node.type} tree-header-key-${prop.node.key}`"
      >
        <q-icon
          v-if="uiProps.types[prop.node.type]?.icon?.name"
          v-bind="uiProps.types[prop.node.type].icon"
          class="q-mr-sm tree-header-icon"
        />
        <div class="text-weight-bold text-primary col-grow tree-header-title">
          {{ t(`types.${prop.node.type}.label`, { value: prop.node.value }) }}
        </div>
        <q-btn
          v-if="resolvedActionsIndex.nodes[prop.node.key].length"
          icon="more_vert"
          v-bind="uiProps.buttonActions"
          class="tree-header-actions-btn"
          @click.stop
        >
          <q-menu>
            <q-list>
              <q-item
                v-for="action in resolvedActionsIndex.nodes[prop.node.key]"
                :key="action"
                v-close-popup
                clickable
                @click="emit(`click:${action}`, treeNodeRecord[prop.node.key])"
              >
                <q-item-section avatar>
                  <q-icon
                    v-if="
                      uiProps.types[prop.node.type]?.actions?.[action]?.icon
                        ?.name
                    "
                    v-bind="uiProps.types[prop.node.type].actions[action].icon"
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
</template>

<script setup lang="ts">
import type {
  LinidQIconProps,
  LinidQTreeProps,
  TreeNode,
} from '@linagora/linid-im-front-corelib';
import {
  useScopedI18n,
  useTree,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onMounted, ref, watch } from 'vue';
import type {
  ResolvedActionsIndex,
  TreeOutputs,
  TreeProps,
  UiPropsAction,
  UiPropsTypes,
} from '../../types/genericTree';

const props = defineProps<TreeProps>();
const emit = defineEmits<TreeOutputs>();

const { ui } = useUiDesign();
const { t } = useScopedI18n(`${props.i18nScope}.GenericTree`);
const { toQTreeNodes } = useTree();
const quasarNodes = computed(() => toQTreeNodes(props.nodes));
const selected = ref<string>('');

onMounted(() => {
  if (!props.selectedNode && props.nodes.length > 0) {
    selected.value = props.nodes[0]?.key;
  } else if (props.selectedNode) {
    selected.value = props.selectedNode.key;
  }
});

watch(
  () => props.selectedNode,
  (node) => {
    if (node && selected.value !== node.key) {
      selected.value = node.key;
    }
  }
);

/**
 * Recursively flatten a treeNodes array.
 * @param nodes The tree nodes to search in.
 * @returns A record mapping node keys to their corresponding TreeNode objects.
 */
function flattenTreeNode(nodes: TreeNode[]): Record<string, TreeNode> {
  const map: Record<string, TreeNode> = {};
  for (const node of nodes) {
    map[node.key] = node;
    if (node.nodes.length > 0) {
      Object.assign(map, flattenTreeNode(node.nodes));
    }
  }
  return map;
}

const treeNodeRecord = computed<Record<string, TreeNode>>(() =>
  flattenTreeNode(props.nodes)
);

watch(selected, (key) => {
  emit('update:selectedNode', treeNodeRecord.value[key]);
});

const actionsByNodeType = computed(() =>
  props.nodeTypes.reduce<Record<string, string[]>>((acc, nodeType) => {
    acc[nodeType.type] = nodeType.actions || [];
    return acc;
  }, {})
);

const resolvedActionsIndex = computed(() =>
  buildResolvedActionsIndex(props.nodes)
);

/**
 * Recursively builds a resolved actions index from the tree nodes.
 * For each node, merges the actions defined on its type with its own extraActions.
 * Also accumulates all actions per type, used to build UI props for action icons.
 * @param nodes Tree nodes to traverse.
 * @param actionsIndex Accumulator holding actions indexed by node key and by node type.
 * @returns The populated ResolvedActionsIndex.
 */
function buildResolvedActionsIndex(
  nodes: TreeNode[],
  actionsIndex: ResolvedActionsIndex = { nodes: {}, types: {} }
): ResolvedActionsIndex {
  for (const node of nodes) {
    const nodeActions = [
      ...new Set([
        ...(actionsByNodeType.value[node.type] || []),
        ...(node.extraActions || []),
      ]),
    ];

    // Union of all actions ever seen for this type, used to build icon lookups in uiProps.types.
    const typeActions = [
      ...new Set([...(actionsIndex.types[node.type] || []), ...nodeActions]),
    ];

    actionsIndex.types[node.type] = typeActions;
    actionsIndex.nodes[node.key] = nodeActions;

    if (node.nodes.length > 0) {
      buildResolvedActionsIndex(node.nodes, actionsIndex);
    }
  }
  return actionsIndex;
}

const uiProps = computed(() => ({
  tree: ui<LinidQTreeProps>(`${props.uiNamespace}.GenericTree`, 'q-tree'),
  buttonActions: ui<LinidQTreeProps>(
    `${props.uiNamespace}.GenericTree.ButtonActions`,
    'q-btn'
  ),
  types: Object.entries(resolvedActionsIndex.value.types).reduce<UiPropsTypes>(
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
