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
    class="tree"
    :nodes="quasarNodes"
    node-key="key"
    v-bind="uiProps"
    :no-nodes-label="t('noNodesLabel')"
    :no-results-label="t('noResultsLabel')"
  >
    <template #default-header="prop">
      <div
        :class="`row items-center tree-header-type-${prop.node.type} tree-header-key-${prop.node.key}`"
      >
        <q-icon
          v-if="uiPropsTypes[prop.node.type]?.icon?.name"
          v-bind="uiPropsTypes[prop.node.type].icon"
          class="q-mr-sm tree-header-icon"
        />
        <div class="text-weight-bold text-primary tree-header-title">
          {{ t(`types.${prop.node.type}.label`, { value: prop.node.value }) }}
        </div>
      </div>
    </template>
  </q-tree>
</template>

<script setup lang="ts">
import type {
  LinidQIconProps,
  TreeNode,
  LinidQTreeProps,
} from '@linagora/linid-im-front-corelib';
import {
  useScopedI18n,
  useTree,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { TreeProps, UiPropsTypes } from '../../types/genericTree';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { QTreeNode } from 'quasar';

const props = defineProps<TreeProps>();

const { ui } = useUiDesign();
const { t } = useScopedI18n(`${props.i18nScope}.GenericTree`);
const { toQTreeNodes } = useTree();

const quasarNodes: ComputedRef<QTreeNode[]> = computed(() => {
  return toQTreeNodes(props.nodes);
});

const uiProps = ui<LinidQTreeProps>(
  `${props.uiNamespace}.GenericTree`,
  'q-tree'
);

/**
 * Warning there is no tests for this function because the function will be removed in the next PR.
 * Recursively collects all node types from a treeNode array.
 * @param nodes Tree nodes to traverse.
 * @returns An array with all the types names.
 */
function getTypes(nodes: TreeNode[]): string[] {
  const types: string[] = [];

  for (const node of nodes) {
    types.push(node.type);

    if (node.nodes.length === 0) {
      continue;
    }
    types.push(...getTypes(node.nodes));
  }
  return types;
}

const types = computed(() => [...new Set(getTypes(props.nodes))]);

const uiPropsTypes = computed(() =>
  types.value.reduce<UiPropsTypes>((acc, type) => {
    acc[type] = {
      icon: ui<LinidQIconProps>(
        `${props.uiNamespace}.GenericTree.types.${type}`,
        'q-icon'
      ),
    };

    return acc;
  }, {})
);
</script>
