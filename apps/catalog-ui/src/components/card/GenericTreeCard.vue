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
  <q-card
    v-bind="uiProps.card"
    class="q-mb-md q-px-md generic-tree-card"
    data-cy="generic-tree-card"
  >
    <q-card-section
      v-bind="uiProps.headerSection"
      class="row items-center justify-between"
    >
      <h4
        v-if="te('title')"
        class="q-my-none text-subtitle1 generic-tree-card--title"
        data-cy="generic-tree-card_title"
      >
        {{ t('title') }}
      </h4>
      <q-space />
      <ButtonsCard
        v-if="enableActions"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
        :show-confirm-button="false"
        :show-cancel-button="false"
      >
        <template #append-buttons>
          <slot name="prepend-header-actions" />
          <LinidZoneRenderer
            :zone="`${localUiNamespace}.header-actions`"
            :entity="entity || {}"
            :instance-id="instanceId"
            :ui-namespace="`${localUiNamespace}.buttons-card`"
            :i18n-scope="`${localI18nScope}.ButtonsCard`"
          />
          <slot name="append-header-actions" />
        </template>
      </ButtonsCard>
    </q-card-section>
    <q-card-section v-bind="uiProps.treeSection">
      <div
        v-if="isLoading && nodes.length === 0"
        class="column q-gutter-sm"
        data-cy="generic-tree-card_loader"
      >
        <BlurLoader
          width="xl"
          height="sm"
        />
        <BlurLoader
          width="lg"
          height="sm"
        />
        <BlurLoader
          width="lg"
          height="sm"
        />
      </div>
      <GenericTree
        v-else
        :nodes="nodes"
        :node-types="nodeTypes"
        :search-enabled="searchEnabled"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
        @update:selected="onNodeSelected"
      >
        <template #node-actions="{ node }">
          <LinidZoneRenderer
            :zone="`${localUiNamespace}.node-actions.${node.type}`"
            :entity="node.value as Record<string, unknown>"
            :instance-id="instanceId"
            :ui-namespace="`${localUiNamespace}.node-actions`"
            :i18n-scope="`${localI18nScope}.NodeActions`"
          />
        </template>
      </GenericTree>
    </q-card-section>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQCardProps,
  LinidQCardSectionProps,
  TreeNode,
  UiEvent,
} from '@linagora/linid-im-front-corelib';
import {
  LinidZoneRenderer,
  uiEventSubject,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { Subscription } from 'rxjs';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAllPages } from '../../services/paginationService';
import type { GenericTreeCardProps } from '../../types/genericTreeCard';
import ButtonsCard from './ButtonsCard.vue';
import BlurLoader from '../loader/BlurLoader.vue';
import GenericTree from '../tree/GenericTree.vue';

const props = withDefaults(defineProps<GenericTreeCardProps>(), {
  idKey: 'id',
  parentIdKey: 'parentId',
  typeKey: 'type',
  nodesQuerySize: 50,
  searchEnabled: false,
  enableActions: true,
});

const localI18nScope = computed(() => `${props.i18nScope}.GenericTreeCard`);
const localUiNamespace = computed(
  () => `${props.uiNamespace}.generic-tree-card`
);

const { t, te } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { renderString } = useNunjucks();
const { ui } = useUiDesign();
const router = useRouter();

const nodes = ref<TreeNode<Record<string, unknown>>[]>([]);
const isLoading = ref<boolean>(false);

/**
 * Tree nodes indexed by their key, rebuilt on every load and used to resolve the node selected
 * in the tree.
 */
const nodesByKey = new Map<string, TreeNode<Record<string, unknown>>>();

let eventSubscription: Subscription;
let abortController: AbortController | undefined;

const nunjucksContext = computed(() => ({
  entity: props.entity ?? {},
}));

/**
 * Whether the entity owning the tree is resolved. A card hosted by a details page is rendered
 * before the page has loaded its entity, and receives an empty object in the meantime: rendering
 * the endpoint at that point would produce a malformed URL. Cards configured without a parent
 * entity are always considered resolved, so that their static endpoint is loaded as usual.
 */
const isEntityResolved = computed(
  () => props.entity === undefined || Object.keys(props.entity).length > 0
);

const uiProps = computed(() => ({
  card: ui<LinidQCardProps>(localUiNamespace.value, 'q-card'),
  headerSection: ui<LinidQCardSectionProps>(
    `${localUiNamespace.value}.header-section`,
    'q-card-section'
  ),
  treeSection: ui<LinidQCardSectionProps>(
    `${localUiNamespace.value}.tree-section`,
    'q-card-section'
  ),
}));

/**
 * Builds the tree from the flat nodes using their identifier and parent identifier properties,
 * and rebuilds the key index. Nodes without a parent, or whose parent is not part of the flat
 * nodes, become roots. The nodes keep the order returned by the API.
 * @param flatNodes - The flat nodes fetched from the find endpoint.
 * @returns The root nodes of the built tree.
 */
function toTreeNodes(
  flatNodes: Record<string, unknown>[]
): TreeNode<Record<string, unknown>>[] {
  const index: Record<string, TreeNode<Record<string, unknown>>> = {};

  for (const flatNode of flatNodes) {
    const key = String(flatNode[props.idKey]);
    index[key] = {
      key,
      type: String(flatNode[props.typeKey] ?? ''),
      value: flatNode,
      nodes: [],
    };
  }

  const roots: TreeNode<Record<string, unknown>>[] = [];

  for (const flatNode of flatNodes) {
    const node = index[String(flatNode[props.idKey])];
    const parentId = flatNode[props.parentIdKey];
    const parent = parentId == null ? undefined : index[String(parentId)];

    if (parent && parent !== node) {
      parent.nodes.push(node);
    } else {
      roots.push(node);
    }
  }

  nodesByKey.clear();
  for (const node of Object.values(index)) {
    nodesByKey.set(node.key, node);
  }

  return roots;
}

/**
 * Loads the complete tree from the rendered find endpoint and updates the reactive nodes state.
 * A load still in flight is aborted when a new one starts, so only the latest one is applied.
 * On failure, clears the nodes and notifies the user.
 */
async function loadData(): Promise<void> {
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;
  isLoading.value = true;

  try {
    nodes.value = toTreeNodes(
      await fetchAllPages(
        renderString(props.url, nunjucksContext.value),
        props.nodesQuerySize,
        controller.signal
      )
    );
  } catch {
    if (controller.signal.aborted) {
      return;
    }

    nodes.value = [];
    nodesByKey.clear();
    Notify({ type: 'negative', message: t('loadError') });
  } finally {
    if (abortController === controller) {
      isLoading.value = false;
    }
  }
}

/**
 * Navigates to the route configured for the type of the selected node, rendered with `entity` and
 * `item` (the selected node). Does nothing when no route is configured for the type.
 * @param key - The key of the selected node.
 */
function onNodeSelected(key: string): void {
  const node = nodesByKey.get(key);
  const route = node ? props.navigationRoutes?.[node.type] : undefined;

  if (!node || !route) {
    return;
  }

  router.push(
    renderString(route, { ...nunjucksContext.value, item: node.value })
  );
}

watch(
  () =>
    isEntityResolved.value
      ? renderString(props.url, nunjucksContext.value)
      : null,
  (endpoint) => {
    if (endpoint === null) {
      return;
    }

    loadData();
  },
  { immediate: true }
);

onMounted(() => {
  eventSubscription = uiEventSubject.subscribe((event: UiEvent) => {
    if (props.reloadOn?.includes(event.key)) {
      loadData();
    }
  });
});

onUnmounted(() => {
  eventSubscription?.unsubscribe();
});
</script>

<style scoped></style>
