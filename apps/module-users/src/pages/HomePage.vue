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
  <q-page class="q-pa-md">
    <h4>{{ t('title') }}</h4>
    <component
      :is="tableComponent"
      v-if="tableComponent"
      v-model:pagination="pagination"
      :ui-namespace="uiNamespace"
      :rows="users"
      :columns="columns"
      :loading="loading"
      :row-key="options.userIdKey"
      @request="onRequest"
    >
      <template #body-cell-table_actions="props">
        <q-td :props="props">
          <div class="flex justify-center">
            <q-btn
              :label="t('seeUserButton')"
              :data-cy="`see-user-button_${props.row[options.userIdKey]}`"
              v-bind="uiProps"
              @click="goToUser(props.row)"
            />
          </div>
        </q-td>
      </template>
    </component>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  QTableRequestEvent,
} from '@linagora/linid-im-front-corelib';
import {
  getEntities,
  getModuleHostConfiguration,
  loadAsyncComponent,
  type QuasarPagination,
  usePagination,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';
import type { ModuleUsersOptions } from '../types/moduleUsers';

const router = useRouter();
const route = useRoute();
const instanceId = computed<string>(() => route.meta.instanceId as string);
const parentPath = computed(() => route.matched[0]?.path);
const options = getModuleHostConfiguration<ModuleUsersOptions>(
  instanceId.value
)!.options;

const { t } = useScopedI18n(`${instanceId.value}.HomePage`);
const users = ref<Record<string, unknown>[]>([]);
const loading = ref<boolean>(false);
const { toPagination, toQuasarPagination } = usePagination();
const pagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: 0,
  sortBy: undefined,
  rowsPerPage: 10,
  descending: true,
});
const columns = computed<QTableColumn[]>(() => [
  ...options.userTableColumns.map((column) => ({
    ...column,
    label: t(column.label),
  })),
]);

const { ui } = useUiDesign();
const uiNamespace = `${instanceId.value}.homepage`;
const uiProps = ui<LinidQBtnProps>(`${uiNamespace}.see-button`, 'q-btn');
const tableComponent = loadAsyncComponent('catalogUI/GenericEntityTable');

/**
 * Navigate to the detail page of a given user.
 * @param user - The user object. The property defined by `options.userIdKey` will be used to build the route.
 * @returns A Promise that resolves when the navigation is complete.
 */
function goToUser(user: Record<string, unknown>) {
  return router.push({
    path: `${parentPath.value}/${user[options.userIdKey] as string}`,
  });
}

/**
 * Updates pagination state when the table page or rows-per-page change
 * and reloads the users data accordingly.
 * @param props - Event object containing the new pagination info.
 * @returns A promise that resolves when the data has been loaded and the loading state has been updated.
 */
async function onRequest(props: QTableRequestEvent) {
  pagination.value = props.pagination;
  return loadData();
}

/**
 * Loads a paginated list of entities and updates the reactive users state.
 * @returns A promise that resolves when the data has been loaded and the loading state has been updated.
 */
function loadData(): Promise<void> {
  loading.value = true;

  return getEntities<Record<string, unknown>>(
    instanceId.value,
    {},
    toPagination(pagination.value)
  )
    .then((data) => {
      users.value = data.content;
      pagination.value = toQuasarPagination(data);
    })
    .catch(() => {
      users.value = [];
      // TODO: uncomment when Notify is working
      // Notify.create({
      //   message: t('HomePage.error'),
      // });
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped></style>
