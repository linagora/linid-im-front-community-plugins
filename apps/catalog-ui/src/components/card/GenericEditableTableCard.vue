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
    class="q-mb-md q-px-md generic-editable-table-card"
    data-cy="generic-editable-table-card"
  >
    <q-card-section class="row items-center justify-between">
      <h4
        v-if="te('title')"
        class="q-my-none text-subtitle1 generic-editable-table-card--title"
        data-cy="generic-editable-table-card_title"
      >
        {{ t('title') }}
      </h4>
      <q-space />
      <q-btn
        v-bind="uiProps.addButton"
        :label="t('addButton')"
        class="generic-editable-table-card--add-button"
        data-cy="generic-editable-table-card_add-button"
        @click="openCreateDialog"
      />
    </q-card-section>
    <q-card-section>
      <GenericEntityTable
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
        :rows="items"
        :columns="columns"
        :loading="isLoading"
        :row-key="rowKey"
      >
        <template #actions="{ row, rowKey: key }">
          <q-btn
            v-bind="uiProps.deleteButton"
            :label="t('deleteButton')"
            class="generic-editable-table-card--delete-button"
            :data-cy="`delete-button_${key}`"
            @click="openDeleteDialog(row)"
          />
        </template>
      </GenericEntityTable>
    </q-card-section>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQCardProps,
} from '@linagora/linid-im-front-corelib';
import {
  getHttpClient,
  uiEventSubject,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { QTableColumn } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { DialogKey } from '../../types/dialog';
import type { GenericEditableTableCardProps } from '../../types/genericEditableTableCard';
import GenericEntityTable from '../table/GenericEntityTable.vue';

/**
 * Name of the column hosting the per-row delete button. It matches the action scope column
 * of the GenericEntityTable and is automatically appended when not declared in the columns prop.
 */
const ACTIONS_COLUMN_NAME = 'table_actions';

const props = withDefaults(defineProps<GenericEditableTableCardProps>(), {
  rowKey: 'id',
});

const emit = defineEmits<{
  /**
   * Emitted with the submitted form data after a successful creation.
   */
  created: [item: Record<string, unknown>];

  /**
   * Emitted with the removed row after a successful deletion.
   */
  deleted: [item: Record<string, unknown>];
}>();

const localI18nScope = computed(
  () => `${props.i18nScope || props.instanceId}.GenericEditableTableCard`
);
const localUiNamespace = computed(
  () => `${props.uiNamespace || props.instanceId}.generic-editable-table-card`
);

const { t, te } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { render } = useNunjucks();
const { ui } = useUiDesign();

const items = ref<Record<string, unknown>[]>([]);
const isLoading = ref<boolean>(false);

const nunjucksContext = computed(() => ({
  parentEntity: props.parentEntity ?? {},
}));

const columns = computed<QTableColumn[]>(() => {
  const translated: QTableColumn[] = props.columns.map((column) => ({
    ...column,
    label: t(column.label),
  }));

  if (!translated.some((column) => column.name === ACTIONS_COLUMN_NAME)) {
    translated.push({
      name: ACTIONS_COLUMN_NAME,
      label: '',
      field: '',
      align: 'right',
    });
  }

  return translated;
});

const uiProps = computed(() => ({
  card: ui<LinidQCardProps>(localUiNamespace.value, 'q-card'),
  addButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.add-button`,
    'q-btn'
  ),
  deleteButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.delete-button`,
    'q-btn'
  ),
}));

/**
 * Loads the items from the find endpoint and updates the reactive items state.
 * Supports both plain array responses and paginated responses exposing a `content` array.
 * On failure, clears the items and notifies the user.
 */
async function loadData(): Promise<void> {
  isLoading.value = true;
  try {
    const { data } = await getHttpClient().get(
      render(props.endpoints.find, nunjucksContext.value)
    );
    items.value = Array.isArray(data) ? data : (data?.content ?? []);
  } catch {
    items.value = [];
    Notify({ type: 'negative', message: t('loadError') });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Opens the form dialog used to create a new item.
 */
function openCreateDialog(): void {
  uiEventSubject.next({
    key: DialogKey.Form,
    data: {
      type: 'open',
      title: t('CreateFormDialog.title'),
      content: te('CreateFormDialog.content')
        ? t('CreateFormDialog.content')
        : '',
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.CreateFormDialog`,
      instanceId: props.instanceId,
      formFields: props.formFields,
      onSubmit: createItem,
    },
  });
}

/**
 * Creates a new item by posting the submitted form data to the create endpoint, then notifies
 * the user, emits the `created` event and reloads the items.
 * @param formData - The submitted form data, sent as the request body.
 * @returns A promise that resolves when the creation handling is complete. The promise rejects
 * when the creation fails, so the form dialog stays open for correction.
 */
async function createItem(formData: Record<string, unknown>): Promise<void> {
  try {
    await getHttpClient().post(
      render(props.endpoints.create, nunjucksContext.value),
      formData
    );
  } catch (error) {
    Notify({ type: 'negative', message: t('createError') });
    throw error;
  }

  Notify({ type: 'positive', message: t('createSuccess') });
  emit('created', formData);
  await loadData();
}

/**
 * Opens a confirmation dialog before deleting an item. The item properties are available as
 * named parameters in the dialog title and content translations.
 * @param item - The item to delete.
 */
function openDeleteDialog(item: Record<string, unknown>): void {
  uiEventSubject.next({
    key: DialogKey.Confirmation,
    data: {
      type: 'open',
      title: t('DeleteConfirmationDialog.title', item),
      content: t('DeleteConfirmationDialog.content', item),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.DeleteConfirmationDialog`,
      onConfirm: () => deleteItem(item),
    },
  });
}

/**
 * Deletes an item through the delete endpoint, then notifies the user, emits the `deleted`
 * event and reloads the items. On failure, notifies the user and keeps the items unchanged.
 * @param item - The item to delete, available as `entity` in the endpoint template context.
 * @returns A promise that resolves when the deletion handling is complete.
 */
async function deleteItem(item: Record<string, unknown>): Promise<void> {
  try {
    await getHttpClient().delete(
      render(props.endpoints.delete, {
        ...nunjucksContext.value,
        entity: item,
      })
    );
  } catch {
    Notify({ type: 'negative', message: t('deleteError') });
    return;
  }

  Notify({ type: 'positive', message: t('deleteSuccess') });
  emit('deleted', item);
  await loadData();
}

onMounted(() => {
  loadData();
});
</script>

<style scoped></style>
