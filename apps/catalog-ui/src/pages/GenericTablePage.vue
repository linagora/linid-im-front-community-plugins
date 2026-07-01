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
  <q-page
    data-cy="generics-table-page"
    class="q-pa-md generics-table-page"
  >
    <div
      v-if="te('title')"
      class="generics-table-page--header"
    >
      <h1
        class="generics-table-page--title"
        data-cy="generics-table-page-title"
      >
        {{ t('title') }}
      </h1>
    </div>

    <ButtonsCard
      v-if="options.enableActions"
      class="generics-table-page--actions"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
      :show-confirm-button="false"
      :show-cancel-button="false"
    >
      <template #append-buttons>
        <!-- eslint-disable vue/attribute-hyphenation -->
        <LinidZoneRenderer
          :zone="`${instanceId}.extraButtons`"
          :uiNamespace="`${uiNamespace}.buttons-card`"
          :i18nScope="`${i18nScope}.ButtonsCard`"
          :instanceId
        />
        <!-- eslint-enable vue/attribute-hyphenation -->
        <q-btn
          v-bind="uiProps.createButton"
          :label="t('ButtonsCard.create')"
          class="buttons-card--create-button"
          data-cy="button_create"
          @click="goToCreate"
        />
      </template>
    </ButtonsCard>

    <LinidSmartFilter
      v-if="options.filters?.length"
      :filters="filters"
      :options="{ filters: options.filters }"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
      class="q-mb-md"
      @update:filters="onFiltersChange"
    />

    <GenericEntityTable
      v-model:pagination="pagination"
      :ui-namespace="uiNamespace"
      :rows="items"
      :columns="columns"
      :loading="isLoading"
      :row-key="options.idKey"
      @request="onRequest"
    >
      <template #body="props">
        <q-tr
          :props="props"
          data-cy="item-row"
        >
          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :data-cy="`cell-${col.name}_${props.row[options.idKey]}`"
          >
            <template v-if="col.name === 'table_actions'">
              <div class="flex justify-end">
                <q-btn
                  :label="t('seeButton')"
                  :data-cy="`see-button_${props.row[options.idKey]}`"
                  v-bind="uiProps.seeButton"
                  @click="goToDetailPage(props.row)"
                />
              </div>
            </template>
            <template v-else>
              {{ col.value }}
            </template>
          </q-td>
        </q-tr>
      </template>
    </GenericEntityTable>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import {
  getEntities,
  getModuleHostConfiguration,
  type LinidFilter,
  type LinidQBtnProps,
  LinidZoneRenderer,
  type QTableRequestEvent,
  type QueryFilter,
  type QuasarPagination,
  useLinidFilterUrl,
  useNotify,
  usePagination,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { ModuleGenericTablePageOptions } from '../types/ModuleGenericTablePageOptions';
import type { QTableColumn } from 'quasar';
import ButtonsCard from '../components/card/ButtonsCard.vue';
import GenericEntityTable from '../components/table/GenericEntityTable.vue';
import LinidSmartFilter from '../components/smart-filter/LinidSmartFilter.vue';

const router = useRouter();
const route = useRoute();
const instanceId = computed<string>(() => route.meta.instanceId as string);
const parentPath = computed(() => route.matched[0]?.path);
const i18nScope = computed<string>(() => `${instanceId.value}`);
const uiNamespace = computed(() => `${instanceId.value}`);
const options = computed(
  () =>
    getModuleHostConfiguration<ModuleGenericTablePageOptions>(instanceId.value)!
      .options
);

const { t, te } = useScopedI18n(i18nScope.value);
const items = ref<Record<string, unknown>[]>([]);
const isLoading = ref<boolean>(false);
const { Notify } = useNotify();
const { setFiltersInUrl, getFiltersFromUrl } = useLinidFilterUrl(router, route);
const filters = ref<LinidFilter[]>(
  getFiltersFromUrl(options.value.filters ?? [])
);

const { toPagination, toQuasarPagination } = usePagination();
const pagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: 0,
  sortBy: undefined,
  rowsPerPage: 10,
  descending: true,
});
const columns = computed<QTableColumn[]>(() =>
  options.value.columns.map((column) => ({
    ...column,
    label: t(column.label),
  }))
);
const { ui } = useUiDesign();
const uiProps = computed(() => ({
  seeButton: ui<LinidQBtnProps>(`${uiNamespace.value}.see-button`, 'q-btn'),
  createButton: ui<LinidQBtnProps>(
    `${uiNamespace.value}.buttons-card.create-button`,
    'q-btn'
  ),
}));

/**
 * Navigate to the new item creation page.
 * @returns A Promise that resolves when the navigation is complete.
 */
function goToCreate() {
  return router.push({
    path: options.value.creationPagePath,
  });
}

/**
 * Navigate to the detail page of a given item.
 * @param item - The item object. The property defined by `options.idKey` will be used to build the route.
 * @returns A Promise that resolves when the navigation is complete.
 */
function goToDetailPage(item: Record<string, unknown>) {
  return router.push({
    path: `${parentPath.value}/${item[options.value.idKey] as string}`,
  });
}

/**
 * Updates pagination state when the table page or rows-per-page change
 * and reloads the items data accordingly.
 * @param props - Event object containing the new pagination info.
 * @returns A promise that resolves when the data has been loaded and the loading state has been updated.
 */
async function onRequest(props: QTableRequestEvent) {
  pagination.value = props.pagination;
  return loadData();
}

/**
 * Handles filter changes emitted by the smart filter. Resets pagination to
 * the first page, reflects the new filters in the URL, and reloads data.
 * @param newFilters - The updated list of active filters.
 * @returns A promise that resolves when the data has been loaded.
 */
function onFiltersChange(newFilters: LinidFilter[]): Promise<void> {
  filters.value = newFilters;
  pagination.value.page = 1;
  setFiltersInUrl(newFilters, options.value.keepQueryParams ?? []);
  return loadData();
}

/**
 * Converts the active filters into a query filter object, ready to be sent
 * to the entities API.
 * @returns A query filter built from the active filters.
 */
function toQueryFilter(): QueryFilter {
  return Object.fromEntries(
    filters.value.map((filter) => [filter.name, filter.toString()])
  );
}

/**
 * Loads a paginated list of entities and updates the reactive items state.
 * @returns A promise that resolves when the data has been loaded and the loading state has been updated.
 */
function loadData(): Promise<void> {
  isLoading.value = true;

  return getEntities<Record<string, unknown>>(
    instanceId.value,
    toQueryFilter(),
    toPagination(pagination.value)
  )
    .then((data) => {
      items.value = data.content;
      pagination.value = toQuasarPagination(data);
    })
    .catch(() => {
      items.value = [];
      Notify({
        type: 'negative',
        message: t('error'),
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

onMounted(async () => {
  await loadData();
});
</script>
