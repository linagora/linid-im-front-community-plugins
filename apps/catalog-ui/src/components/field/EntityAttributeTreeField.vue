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
  <q-field
    :model-value="localValue"
    :data-cy="`field_${definition.name}`"
    class="entity-attribute-tree-field"
    stack-label
    v-bind="uiProps"
    :disable="isDisabled"
    :label="translateOrDefault('', 'label')"
    :hint="translateOrDefault('', 'hint')"
    :rules="rules"
    :loading="isLoading"
    :error="displayedError ? true : undefined"
    :error-message="displayedError ?? undefined"
    no-error-icon
    @clear="clearSelection"
  >
    <template #control>
      <!-- The tree only renders once the nodes are loaded, so its first render holds them. -->
      <GenericTree
        v-if="!displayedError && !isLoading"
        class="full-width"
        :inert="isDisabled"
        :nodes="nodes"
        :node-types="settings.nodeTypes"
        :selected="selectedKey"
        :expanded="expandedKeys"
        selected-icon
        :search-enabled="settings.searchEnabled"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
        @update:selected="updateValue"
      />
      <q-btn
        v-else-if="error && !isLoading"
        v-bind="uiRetryProps"
        :label="t('validation.tree.retry')"
        :data-cy="`field_${definition.name}_retry`"
        @click="retry"
      />
    </template>
  </q-field>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import {
  getNestedValue,
  type LinidQBtnProps,
  type LinidQFieldProps,
  setNestedValue,
  type TreeNode,
  useNunjucks,
  useQuasarRules,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { fetchAllPages } from '../../services/paginationService';
import { toTreeNodes } from '../../services/treeService';
import type {
  AttributeFieldProps,
  EntityAttributeFieldOutputs,
  FieldTreeSettings,
} from '../../types/field';
import GenericTree from '../tree/GenericTree.vue';

const props = withDefaults(
  defineProps<AttributeFieldProps<FieldTreeSettings>>(),
  {
    ignoreRules: false,
  }
);
const emits = defineEmits<EntityAttributeFieldOutputs>();
const localI18nScope = `${props.i18nScope}.fields.${props.definition.name}`;
const localUiNamespace = `${props.uiNamespace}.${props.definition.name}`;

const { ui } = useUiDesign();
const { translateOrDefault, t } = useScopedI18n(localI18nScope);
const { renderString } = useNunjucks();

const nodes = ref<TreeNode<Record<string, unknown>>[]>([]);
const isLoading = ref(false);
/** The failure of the last load, cleared by the next one. */
const error = ref<string | null>(null);
/** The last route a load was opened on, so entity edits do not reload an unchanged route. */
let requestedRoute: string | null = null;
let abortController: AbortController | undefined;
/** The parent key of every loaded node, walked to expand the path to the selected node. */
let parentByKey = new Map<string, string | null>();

/** The keys of the initially expanded nodes, handed to the tree. */
const expandedKeys = ref<string[]>([]);

const localValue = ref(
  getNestedValue(props.entity, props.definition.name) ?? null
);

const uiProps = ui<LinidQFieldProps>(localUiNamespace, 'q-field');
const uiRetryProps = ui<LinidQBtnProps>(
  `${localUiNamespace}.retry-button`,
  'q-btn'
);

/** The input settings with their default values applied. */
const settings = computed(() => ({
  route: props.definition.inputSettings?.route ?? '',
  nodeTypes: props.definition.inputSettings?.nodeTypes ?? [],
  idKey: props.definition.inputSettings?.idKey ?? 'id',
  parentIdKey: props.definition.inputSettings?.parentIdKey ?? 'parentId',
  typeKey: props.definition.inputSettings?.typeKey ?? 'type',
  searchEnabled: props.definition.inputSettings?.searchEnabled ?? false,
  nodesQuerySize: props.definition.inputSettings?.nodesQuerySize ?? 50,
  routeDependencies: props.definition.inputSettings?.routeDependencies ?? [],
  disable: props.definition.inputSettings?.disable ?? false,
  ignoreRules: props.definition.inputSettings?.ignoreRules ?? false,
}));

/** The selected node key handed to the tree, which expects a string key. */
const selectedKey = computed(() =>
  localValue.value == null ? '' : String(localValue.value)
);

const rules = computed(() =>
  !props.ignoreRules && !settings.value.ignoreRules
    ? useQuasarRules(props.instanceId, props.definition, [], localI18nScope)
    : []
);

/** The context the route template and the dependency paths are both resolved against. */
const renderContext = computed(() => ({ entity: props.entity }));

/** Whether every declared dependency holds a non-empty value. */
const areDependenciesSatisfied = computed(() =>
  settings.value.routeDependencies
    .map((dependency) => getNestedValue(renderContext.value, dependency))
    .every(hasValue)
);

const renderedRoute = computed(() =>
  renderString(settings.value.route, renderContext.value)
);

/** No `route` in the configuration: read from the setting, not from what it rendered to. */
const configurationError = computed(() =>
  settings.value.route ? null : t('validation.tree.missingRoute')
);

/** What the field displays in place of the tree: a broken configuration outranks a failed load. */
const displayedError = computed(() => configurationError.value ?? error.value);

/** Whether the field is non-interactive: either explicitly disabled, or missing a dependency. */
const isDisabled = computed(
  () => settings.value.disable || !areDependenciesSatisfied.value
);

watch(
  () => getNestedValue(props.entity, props.definition.name),
  (newValue) => {
    const value = newValue ?? null;
    if (value === localValue.value) {
      return;
    }

    // An external value, such as the entity an edition page finishes loading: select it and
    // expand its path. Selections made in the tree echo back unchanged and land in the guard.
    localValue.value = value;
    expandedKeys.value = initialExpansion();
  }
);

watch(
  [areDependenciesSatisfied, renderedRoute],
  async ([areSatisfied, nextRoute]) => {
    if (!areSatisfied || !nextRoute || requestedRoute === nextRoute) {
      return;
    }

    // The selection belongs to the previous route: a node of a tree that no longer applies.
    if (requestedRoute !== null) {
      clearSelection();
    }

    requestedRoute = nextRoute;
    await loadNodes(nextRoute);
  },
  { immediate: true }
);

onBeforeUnmount(() => abortController?.abort());

/**
 * Tells whether a dependency value allows the route to be requested.
 * @param value - The value read at the dependency path.
 * @returns True when the dependency holds a non-empty value.
 */
function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Loads the complete flat node list from the route and builds the tree. A load still in flight
 * is aborted when a new one starts, so only the latest one is applied.
 * @param route - The rendered route to load the nodes from.
 */
async function loadNodes(route: string): Promise<void> {
  abortController?.abort();
  const controller = new AbortController();
  abortController = controller;
  isLoading.value = true;
  error.value = null;

  try {
    const built = toTreeNodes(
      await fetchAllPages(
        route,
        settings.value.nodesQuerySize,
        controller.signal
      ),
      {
        idKey: settings.value.idKey,
        parentIdKey: settings.value.parentIdKey,
        typeKey: settings.value.typeKey,
      }
    );
    nodes.value = built.roots;
    parentByKey = built.parentByKey;
    expandedKeys.value = initialExpansion();
  } catch {
    if (controller.signal.aborted) {
      return;
    }

    // The failed route is forgotten, so the next trigger of the route watcher retries it.
    requestedRoute = null;
    nodes.value = [];
    error.value = t('validation.tree.fetchError');
  } finally {
    if (abortController === controller) {
      isLoading.value = false;
    }
  }
}

/** Retries the failed load of the current route, which a static route cannot retrigger itself. */
function retry() {
  requestedRoute = renderedRoute.value;
  loadNodes(renderedRoute.value);
}

/**
 * Computes the nodes initially expanded: the path to the selected node when the field holds a
 * value, as on an edition form, otherwise the root nodes alone, so the first level is visible.
 * @returns The keys of the nodes to expand.
 */
function initialExpansion(): string[] {
  const keys: string[] = [];
  let key: string | null = selectedKey.value || null;

  while (key !== null && parentByKey.has(key) && !keys.includes(key)) {
    keys.push(key);
    key = parentByKey.get(key) ?? null;
  }

  return keys.length > 0 ? keys : nodes.value.map((root) => root.key);
}

/**
 * Drops the selected value and the entity's: on clear when the design enables the q-field
 * `clearable` button, and when the route changes, since the value belongs to a tree that no
 * longer applies.
 */
function clearSelection() {
  if (localValue.value === null) {
    return;
  }

  localValue.value = null;
  emits(
    'update:entity',
    setNestedValue(props.entity, props.definition.name, null)
  );
}

/**
 * Stores the selected node key on the entity and emits the 'update:entity' event.
 * @param key - The key of the selected node.
 */
function updateValue(key: string) {
  if (!key || key === selectedKey.value) {
    return;
  }

  localValue.value = key;
  emits(
    'update:entity',
    setNestedValue(props.entity, props.definition.name, key)
  );
}
</script>

<style lang="scss">
// The required error belongs to the field, not to the embedded filter input, which only filters
// the loaded tree: keep its hint out of the error color cascade of the wrapping q-field.
.entity-attribute-tree-field.q-field--error .generic-tree-filter-input {
  .q-field__bottom {
    color: rgba(0, 0, 0, 0.54);
  }

  &.q-field--dark .q-field__bottom {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
