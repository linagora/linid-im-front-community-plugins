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
  <q-page class="justify-center q-pa-md">
    <div class="col-12 col-md-10 col-lg-10">
      <div class="homepage--header">
        <h1
          class="homepage--title"
          data-cy="module-import-title"
        >
          {{ t('title') }}
        </h1>
      </div>

      <q-card v-bind="uiProps.card">
        <q-card-section class="row items-start">
          <load-files-card
            outlined
            :instance-id="instanceId"
            :ui-namespace="`${instanceId}.ImportPage`"
            :i18n-scope="`${instanceId}.ImportPage`"
            @update:data="updateData"
          />
        </q-card-section>
        <q-card-section>
          <imported-data-table
            :instance-id="instanceId"
            :ui-namespace="`${instanceId}.ImportPage`"
            :i18n-scope="`${instanceId}.ImportPage`"
            :is-loading="isLoading"
            :rows="fileItems"
            @delete:item="deleteRow"
          />
        </q-card-section>
      </q-card>

      <component
        :is="buttonsCard"
        v-if="buttonsCard"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        :is-loading="isLoading"
        :is-disabled="isDisabled"
        confirm-btn-type="submit"
        @cancel="cancel"
        @confirm="importAllData"
      >
        <template #extra-buttons>
          <q-btn-dropdown
            type="none"
            v-bind="uiProps.clearButton"
            :disable="isDisabled"
            :label="t('ButtonsCard.clear')"
          >
            <q-list v-bind="uiProps.list">
              <q-item
                v-close-popup
                clickable
                v-bind="uiProps.item"
                @click.prevent="
                  clear(['READY', 'IMPORTING', 'IMPORTED', 'ERROR'])
                "
              >
                <q-item-section v-bind="uiProps.itemSection">
                  <q-item-label v-bind="uiProps.itemLabel">
                    {{ t('ButtonsCard.clearAll') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                v-bind="uiProps.item"
                @click.prevent="clear(['ERROR'])"
              >
                <q-item-section v-bind="uiProps.itemSection">
                  <q-item-label v-bind="uiProps.itemLabel">
                    {{ t('ButtonsCard.clearError') }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                v-bind="uiProps.item"
                @click.prevent="clear(['IMPORTED'])"
              >
                <q-item-section v-bind="uiProps.itemSection">
                  <q-item-label v-bind="uiProps.itemLabel">
                    {{
                      t('ButtonsCard.clearImported')
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </component>
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getHttpClient,
  getModuleHostConfiguration,
  LinidQBtnDropdownProps,
  type LinidQBtnProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQItemLabelProps,
  LinidQListProps,
  loadAsyncComponent,
  useNotify,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { ModuleImportOptions } from '../types/moduleImport';
import LoadFilesCard from '../components/field/LoadFilesField.vue';
import type { ImportedData } from '../types/File';
import ImportedDataTable from '../components/table/ImportedDataTable.vue';
import pLimit from 'p-limit';

const router = useRouter();
const route = useRoute();
const { Notify } = useNotify();
const { ui } = useUiDesign();

const instanceId = computed<string>(() => route.meta.instanceId as string);
const i18nScope = computed<string>(() => `${instanceId.value}.ImportPage`);
const uiNamespace = computed<string>(() => `${instanceId.value}.import-page`);
const moduleConfig = getModuleHostConfiguration<ModuleImportOptions>(
  instanceId.value
);
const isDisabled = computed<boolean>(() => fileItems.value.length === 0);
const limit = pLimit(moduleConfig.options.numberOfParallelImports);
const isLoading = ref(false);

const { t } = useScopedI18n(`${instanceId.value}.ImportPage`);

const localUiNamespace = `${instanceId.value}.import-page`;
const uiProps = {
  card: ui<LinidQBtnProps>(`${localUiNamespace}.import-card`, 'q-card'),
  clearButton: ui<LinidQBtnDropdownProps>(
    `${localUiNamespace}.buttons-card.clear-button`,
    'q-btn-dropdown'
  ),
  list: ui<LinidQListProps>(`${localUiNamespace}.clear-button`, 'q-list'),
  item: ui<LinidQItemProps>(`${localUiNamespace}.clear-button`, 'q-item'),
  itemSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace}.clear-button`,
    'q-item-section'
  ),
  itemLabel: ui<LinidQItemLabelProps>(
    `${localUiNamespace}.clear-button`,
    'q-item-label'
  ),
};

const fileItems = ref<ImportedData[]>([]);

const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');

/**
 * Cancel the import and redirect to previous page.
 */
function cancel() {
  router.push({ path: moduleConfig.options.previousPath });
}

/**
 * Removes a row from the current import dataset by its internal identifier.
 * @param id - The unique internal identifier (`__id`) of the row to remove.
 */
function deleteRow(id: number) {
  fileItems.value = fileItems.value.filter((item) => item.__id !== id);
}

/**
 * Replaces the current dataset with newly loaded items.
 * @param items - The array of parsed and normalized `ImportedData` rows.
 */
function updateData(items: ImportedData[]): void {
  fileItems.value = items;
}

/**
 * Imports all currently loaded rows to the configured API endpoint.
 * @returns A Promise that resolves once all import operations have finished.
 */
function importAllData(): Promise<void> {
  isLoading.value = true;

  return Promise.all(
    fileItems.value.map((item) => limit(() => importData(item)))
  )
    .then((data) => {
      const errorLengths = data.filter((v) => !v).length;
      if (errorLengths === 0) {
        Notify({
          type: 'positive',
          message: t(`importSuccess`),
        });
      } else if (errorLengths !== data.length) {
        Notify({
          type: 'warning',
          message: t(`importWarning`),
        });
      } else {
        Notify({
          type: 'error',
          message: t(`importError`),
        });
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
}

/**
 * Imports a single row to the configured backend endpoint.
 * @param data - The `ImportedData` row to import.
 * @returns A Promise resolving to:
 *          - `true` if the import succeeded
 *          - `false` if the import failed.
 */
function importData(data: ImportedData): Promise<boolean> {
  data.__status = 'IMPORTING';
  const { __status, __error, __file, __id, ...dataToSend } = data;

  return getHttpClient()
    .post(moduleConfig.apiEndpoint, dataToSend)
    .then(() => {
      data.__status = 'IMPORTED';
      return true;
    })
    .catch((error) => {
      data.__status = 'ERROR';
      data.__error = error.message;
      return false;
    });
}

/**
 * Removes rows whose status matches any of the provided statuses.
 * @param allStatus - An array of status values to remove
 *                    (e.g., ['ERROR', 'IMPORTED']).
 */
function clear(allStatus: string[]): void {
  fileItems.value = fileItems.value.filter(
    (item) => !allStatus.includes(item.__status)
  );

  Notify({
    type: 'positive',
    message: t(`clearSuccess`),
  });
}
</script>
