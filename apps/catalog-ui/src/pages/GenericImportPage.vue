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
    class="row justify-center q-pa-md generic-import-page"
    data-cy="generic-import-page"
  >
    <div class="col-12 col-md-10 col-lg-10">
      <LinidZoneRenderer
        :zone="`${instanceId}.header.before`"
        :instance-id="instanceId"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
      />
      <div
        class="row items-center justify-between q-mb-md generic-import-page--header"
      >
        <div class="row items-center q-gutter-x-md">
          <LinidZoneRenderer
            :zone="`${instanceId}.header.prefix`"
            :instance-id="instanceId"
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
          />
          <h1
            v-if="te('title')"
            class="q-ma-none text-h5 generic-import-page--title"
            data-cy="generic-import-page_title"
          >
            {{ t('title') }}
          </h1>
          <LinidZoneRenderer
            :zone="`${instanceId}.header.suffix`"
            :instance-id="instanceId"
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
          />
        </div>
        <div class="generic-import-page--actions">
          <ButtonsCard
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
            :show-confirm-button="false"
            :show-cancel-button="false"
          >
            <template #append-buttons>
              <LinidZoneRenderer
                :zone="`${instanceId}.header.actions`"
                :instance-id="instanceId"
                :ui-namespace="uiNamespace"
                :i18n-scope="i18nScope"
              />
            </template>
          </ButtonsCard>
        </div>
      </div>

      <LinidZoneRenderer
        :zone="`${instanceId}.header.after`"
        :instance-id="instanceId"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
      />

      <LinidZoneRenderer
        :zone="`${instanceId}.content.before`"
        :instance-id="instanceId"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        :is-loading="isLoading"
      />

      <q-card
        v-bind="uiProps.card"
        class="generic-import-page--card"
        data-cy="generic-import-page_card"
      >
        <q-card-section
          v-bind="uiProps.filesSection"
          class="row items-start generic-import-page--files-section"
        >
          <LoadFilesField
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
            :parsing-options="options"
            @update:data="updateData"
          />
        </q-card-section>
        <q-card-section
          v-bind="uiProps.tableSection"
          class="generic-import-page--table-section"
        >
          <ImportedDataTable
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
            :fields="fields"
            :is-loading="isLoading"
            :rows="fileItems"
            @delete:item="deleteRow"
          />
        </q-card-section>
      </q-card>

      <div class="generic-import-page--actions">
        <ButtonsCard
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
          :is-loading="isLoading"
          :is-disabled="isDisabled"
          @cancel="cancel"
          @confirm="importAllData"
        >
          <template #extra-buttons>
            <DropdownButton
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
              :items="clearItems"
              :disable="isDisabled"
              @item-click="onClearItemClick"
            />
          </template>
          <template #append-buttons>
            <LinidZoneRenderer
              :zone="`${instanceId}.content.actions`"
              :instance-id="instanceId"
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
              :is-loading="isLoading"
            />
          </template>
        </ButtonsCard>
      </div>

      <LinidZoneRenderer
        :zone="`${instanceId}.content.after`"
        :instance-id="instanceId"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        :is-loading="isLoading"
      />
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  DropdownClickPayload,
  LinidQCardProps,
  LinidQCardSectionProps,
  MenuItem,
} from '@linagora/linid-im-front-corelib';
import {
  getModuleHostConfiguration,
  LinidZoneRenderer,
  saveEntity,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import pLimit from 'p-limit';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DropdownButton from '../components/button/DropdownButton.vue';
import ButtonsCard from '../components/card/ButtonsCard.vue';
import LoadFilesField from '../components/field/LoadFilesField.vue';
import ImportedDataTable from '../components/table/ImportedDataTable.vue';
import type { ImportedData, ImportStatus } from '../types/importedDataTable';
import type {
  GenericImportPageUIProps,
  ModuleGenericImportPageOptions,
} from '../types/ModuleGenericImportPageOptions';

/**
 * Statuses removed by each entry of the clear dropdown.
 */
const CLEAR_STATUSES: Record<string, ImportStatus[]> = {
  clearAll: ['READY', 'IMPORTING', 'IMPORTED', 'ERROR'],
  clearError: ['ERROR'],
  clearImported: ['IMPORTED'],
};

const router = useRouter();
const route = useRoute();

const instanceId = computed<string>(() => route.meta.instanceId as string);
const i18nScope = computed<string>(() => `${instanceId.value}`);
const uiNamespace = computed<string>(() => `${instanceId.value}`);
const moduleConfig = computed(() =>
  getModuleHostConfiguration<ModuleGenericImportPageOptions>(instanceId.value)
);
const options = computed(() => moduleConfig.value.options);
const fields = computed(() => Object.keys(options.value.fieldMappingTemplates));

const fileItems = ref<ImportedData[]>([]);
const isLoading = ref(false);
const isDisabled = computed<boolean>(() => fileItems.value.length === 0);
const limit = pLimit(options.value.numberOfParallelImports);

const clearItems: MenuItem[] = Object.keys(CLEAR_STATUSES).map((key) => ({
  key,
  clickable: true,
}));

const { t, te } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();
const { ui } = useUiDesign();
const { renderString } = useNunjucks();

const uiProps: GenericImportPageUIProps = {
  card: ui<LinidQCardProps>(`${uiNamespace.value}.import-card`, 'q-card'),
  filesSection: ui<LinidQCardSectionProps>(
    `${uiNamespace.value}.import-card.files-section`,
    'q-card-section'
  ),
  tableSection: ui<LinidQCardSectionProps>(
    `${uiNamespace.value}.import-card.table-section`,
    'q-card-section'
  ),
};

/**
 * Cancel the import and navigate back to the parent route.
 *
 * `parentPath` is rendered as a Nunjucks template with the current query
 * string (`query`), and pushed as a string so a rendered query or fragment
 * is kept.
 */
function cancel() {
  router.push(
    renderString(options.value.parentPath, {
      entity: {},
      query: route.query,
    })
  );
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
 * Imports all rows ready to be imported, with a concurrency limited by
 * `numberOfParallelImports`, then notifies the aggregated result.
 * @returns A Promise that resolves once all import operations have finished.
 */
function importAllData(): Promise<void> {
  isLoading.value = true;

  return Promise.all(
    fileItems.value
      .filter((item) => item.__status === 'READY')
      .map((item) => limit(() => importData(item)))
  )
    .then((data) => {
      const errorLengths = data.filter((v) => !v).length;
      if (errorLengths === 0) {
        Notify({
          type: 'positive',
          message: t('importSuccess'),
          attrs: {
            'data-cy': 'notify_import_success',
          },
        });
      } else if (errorLengths !== data.length) {
        Notify({
          type: 'warning',
          message: t('importWarning'),
          attrs: {
            'data-cy': 'notify_import_warning',
          },
        });
      } else {
        Notify({
          type: 'negative',
          message: t('importError'),
          attrs: {
            'data-cy': 'notify_import_error',
          },
        });
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
}

/**
 * Imports a single row through the generic entity creation mechanism.
 *
 * Internal fields (`__status`, `__error`, `__file`, `__id`) are stripped
 * before sending.
 * @param data - The `ImportedData` row to import.
 * @returns A Promise resolving to `true` if the import succeeded, `false` otherwise.
 */
function importData(data: ImportedData): Promise<boolean> {
  data.__status = 'IMPORTING';
  const { __status, __error, __file, __id, ...dataToSend } = data;

  return saveEntity(instanceId.value, dataToSend)
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
function clear(allStatus: ImportStatus[]): void {
  const before = fileItems.value.length;
  fileItems.value = fileItems.value.filter(
    (item) => !allStatus.includes(item.__status)
  );

  if (before - fileItems.value.length > 0) {
    Notify({
      type: 'positive',
      message: t('clearSuccess'),
      attrs: {
        'data-cy': 'notify_clear_success',
      },
    });
  } else {
    Notify({
      type: 'warning',
      message: t('clearWarning'),
      attrs: {
        'data-cy': 'notify_clear_warning',
      },
    });
  }
}

/**
 * Clears the rows matching the selected entry of the clear dropdown.
 * @param payload - The payload emitted by the dropdown button.
 * @param payload.key - The key of the selected entry.
 */
function onClearItemClick({ key }: DropdownClickPayload) {
  clear(CLEAR_STATUSES[key]);
}
</script>

<style lang="scss" scoped>
// Reserve the height taken by header action buttons (36px button + 16px
// card padding + 16px top margin) so the title keeps the same vertical
// position whether or not header actions are configured.
.generic-import-page--header {
  min-height: 68px;
}
</style>
