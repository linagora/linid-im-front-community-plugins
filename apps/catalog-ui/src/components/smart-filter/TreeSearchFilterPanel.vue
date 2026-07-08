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
  <!-- v8 ignore start -->
  <div class="tree-search-filter-panel">
    <generic-tree
      v-if="items.length > 0"
      v-model:ticked="tickedNodeKeys"
      :tickeable="true"
      :ui-namespace="localUiNamespace"
      :i18n-scope="localI18n"
      :nodes="items"
      :node-types="[]"
    />

    <q-btn
      v-bind="uiProps.searchButton"
      :label="t('searchButton')"
      data-cy="tree-search-filter-panel_search"
      class="q-mt-sm float-right tree-search-filter-panel_search"
      @click="onSearch"
    />
  </div>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  Page,
  Pagination,
  TreeNode,
} from '@linagora/linid-im-front-corelib';
import {
  useNotify,
  getHttpClient,
  LinidFilterValue,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import GenericTree from '../tree/GenericTree.vue';
import type { TreeSearchFilterProps } from '../../types/TreeSearchFilterPanel';
import { onMounted, ref } from 'vue';
import type { LinidFilterPanelSearchOutputs } from '../../types/linidFilterPanel';

const props = defineProps<TreeSearchFilterProps>();
const emit = defineEmits<LinidFilterPanelSearchOutputs>();

const { ui } = useUiDesign();
const localI18n = `${props.i18nScope}.TreeSearchFilterPanel`;
const { t } = useScopedI18n(localI18n);
const localUiNamespace = `${props.uiNamespace}.tree-search-filter-panel`;

const tickedNodeKeys = ref<string[]>([]);
const items = ref<TreeNode<Record<string, unknown>>[]>([]);
const { Notify } = useNotify();

const uiProps = {
  searchButton: ui<LinidQBtnProps>(localUiNamespace, 'q-btn'),
};

/**
 * Emits a 'search' event with the ticked nodes.
 */
function onSearch() {
  const filterValues: LinidFilterValue[] = tickedNodeKeys.value.map(
    (key: string) => {
      return new LinidFilterValue(false, '', key);
    }
  );
  emit('search', {
    field: props.fieldName,
    values: filterValues,
  });
}

/**
 * Fetches nodes from the specified URL with pagination.
 * @param pagination - Pagination parameters for the request.
 * @returns A promise that resolves to a page of nodes.
 */
async function getNodes(pagination: Pagination) {
  const response = await getHttpClient().get<Page<Record<string, unknown>>>(
    props.url,
    { params: { ...pagination } }
  );
  if (!response || !response.data) {
    return { content: [], last: true };
  }
  const { data } = response;
  return data;
}

/**
 * Fetches all nodes from the specified URL by iterating through paginated results.
 * @returns A promise that resolves to an array of all nodes.
 */
async function getAllNodes(): Promise<Record<string, unknown>[]> {
  const result: Record<string, unknown>[] = [];
  let page = 0;
  let isLast = false;

  while (!isLast) {
    const response = await getNodes({ page, size: props.nodesQuerySize });

    if (!response || !response.content) {
      break;
    }

    result.push(...response.content);
    isLast = response.last ?? true;
    page++;
  }

  return result;
}

/**
 * Maps an array of nodes to an array of TreeNode objects.
 * @param nodes - The array of nodes to map.
 * @param idKey - The key used to identify each node.
 * @returns An array of TreeNode objects.
 */
function toTreeNode(
  nodes: Record<string, unknown>[],
  idKey: string
): TreeNode<Record<string, unknown>>[] {
  const childNodes = nodes.filter((item) => {
    const parentValue = item[props.parentsKey];
    return (
      Array.isArray(parentValue) &&
      parentValue.some((parent) => parent[props.parentIdKey] === idKey)
    );
  });
  if (childNodes && childNodes.length > 0) {
    const result: TreeNode<Record<string, unknown>>[] = [];
    childNodes.forEach((childNode: Record<string, unknown>) => {
      result.push({
        key: String(childNode[props.idKey]),
        value: childNode,
        nodes: toTreeNode(nodes, String(childNode[props.idKey])),
        type:
          (childNode[props.typeKey] as string) || props.defaultTypeValue || '',
      });
    });
    return result;
  }
  return [];
}

/**
 * Fetches all nodes, identifies the root node, and constructs the tree structure for the component.
 */
async function loadData() {
  try {
    const nodes: Record<string, unknown>[] = await getAllNodes();

    if (!nodes || nodes.length === 0) {
      return;
    }

    const root = nodes.find((item) => {
      const parentValue = item[props.parentsKey];
      return (
        Array.isArray(parentValue) &&
        parentValue.length > 0 &&
        parentValue[0][props.parentIdKey] === null
      );
    });

    if (root) {
      items.value.push({
        key: String(root[props.idKey]),
        value: root,
        nodes: toTreeNode(nodes, String(root[props.idKey])),
        type: 'root',
      });
    }
  } catch (error) {
    Notify({
      type: 'negative',
      message: t('errorLoadingData'),
    });
    throw error;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.generic-tree-container {
  padding: 0;
}
</style>
