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
    class="q-mb-md q-px-md generic-sortable-list-card"
    data-cy="generic-sortable-list-card"
  >
    <q-card-section class="row items-center justify-between">
      <h4
        v-if="te('title')"
        class="q-my-none text-subtitle1 generic-sortable-list-card--title"
        data-cy="generic-sortable-list-card_title"
      >
        {{ t('title') }}
      </h4>
      <q-space />
      <ButtonsCard
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
        :show-confirm-button="false"
        :show-cancel-button="false"
      >
        <template #append-buttons>
          <q-btn
            v-bind="uiProps.addButton"
            :label="t('ButtonsCard.add')"
            :disable="isLoading"
            class="buttons-card--add-button"
            data-cy="generic-sortable-list-card_add-button"
            @click="openCreateDialog"
          />
          <q-btn
            v-bind="uiProps.saveButton"
            :label="t('ButtonsCard.save')"
            :disable="isLoading || !hasUnsavedChanges"
            class="buttons-card--save-button"
            data-cy="generic-sortable-list-card_save-button"
            @click="saveChanges"
          />
        </template>
      </ButtonsCard>
    </q-card-section>
    <q-card-section
      v-if="hasUnsavedChanges"
      class="generic-sortable-list-card--unsaved-changes-hint"
      data-cy="generic-sortable-list-card_unsaved-changes-hint"
    >
      <span>{{ t('unsavedChangesHint') }}</span>
    </q-card-section>
    <q-card-section>
      <q-list
        v-bind="uiProps.list"
        class="full-width col-auto generic-sortable-list-card--list"
        data-cy="generic-sortable-list-card_list"
      >
        <q-item
          v-bind="uiProps.headerItem"
          class="generic-sortable-list-card--header"
          data-cy="generic-sortable-list-card_header"
        >
          <q-item-section
            v-if="uiProps.icon?.name"
            avatar
            v-bind="uiProps.iconSection"
          />
          <q-item-section v-if="hasBeforeFieldsSection">
            <slot name="before-field-labels" />
            <LinidZoneRenderer
              :zone="beforeFieldLabelsZoneName"
              :entity="entity || {}"
              :instance-id="instanceId"
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
            />
          </q-item-section>
          <q-item-section
            v-for="field in resolvedFields"
            :key="field.name"
            v-bind="uiProps.fieldLabelSection"
            :data-cy="`generic-sortable-list-card_header-field_${field.name}`"
          >
            <slot
              :name="`header-${field.name}`"
              :field="field"
            >
              <TruncatedItemLabel
                v-bind="uiProps.fieldLabel"
                :label="field.label"
              />
            </slot>
          </q-item-section>
          <q-item-section v-if="hasAfterFieldsSection">
            <slot name="after-field-labels" />
            <LinidZoneRenderer
              :zone="afterFieldLabelsZoneName"
              :entity="entity || {}"
              :instance-id="instanceId"
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
            />
          </q-item-section>
          <q-item-section
            v-bind="uiProps.itemActionsSection"
            class="items-end"
            :style="{ width: itemActionsWidth }"
          />
        </q-item>
        <q-scroll-area
          class="generic-sortable-list-card--scroll-area"
          v-bind="uiProps.scrollArea"
        >
          <draggable
            v-model="items"
            v-bind="uiProps.draggable"
            :item-key="itemKey"
          >
            <template #item="{ element: item, index }">
              <q-item
                v-bind="uiProps.item"
                :data-cy="`generic-sortable-list-card_item-${index}`"
              >
                <q-item-section
                  v-if="uiProps.icon?.name"
                  avatar
                  v-bind="uiProps.iconSection"
                  class="drag-handle cursor-pointer"
                >
                  <q-icon v-bind="uiProps.icon" />
                </q-item-section>
                <q-item-section v-if="hasBeforeFieldsSection">
                  <slot
                    name="before-field-values"
                    :item="item"
                    :index="index"
                  />
                  <LinidZoneRenderer
                    :zone="beforeFieldValuesZoneName"
                    :entity="item || {}"
                    :instance-id="instanceId"
                    :ui-namespace="uiNamespace"
                    :i18n-scope="i18nScope"
                  />
                </q-item-section>
                <q-item-section
                  v-for="field in resolvedFields"
                  :key="field.name"
                  v-bind="uiProps.fieldValueSection"
                  :data-cy="`generic-sortable-list-card_item-field_${field.name}_${index}`"
                >
                  <slot
                    :name="`field-${field.name}`"
                    :item="item"
                    :field="field"
                    :value="formattedItems[index][field.name]"
                    :index="index"
                  >
                    <TruncatedItemLabel
                      v-bind="uiProps.fieldValue"
                      :label="String(formattedItems[index][field.name])"
                    />
                  </slot>
                </q-item-section>
                <q-item-section v-if="hasAfterFieldsSection">
                  <slot
                    name="after-field-values"
                    :item="item"
                    :index="index"
                  />
                  <LinidZoneRenderer
                    :zone="afterFieldValuesZoneName"
                    :entity="item || {}"
                    :instance-id="instanceId"
                    :ui-namespace="uiNamespace"
                    :i18n-scope="i18nScope"
                  />
                </q-item-section>
                <q-item-section
                  ref="itemActionsSection"
                  v-bind="uiProps.itemActionsSection"
                  class="items-end"
                >
                  <div>
                    <slot
                      name="prepend-item-actions"
                      :item="item"
                      :index="index"
                    />
                    <LinidZoneRenderer
                      :zone="`${localUiNamespace}.item.actions`"
                      :entity="item || {}"
                      :instance-id="instanceId"
                      :ui-namespace="uiNamespace"
                      :i18n-scope="i18nScope"
                    />
                    <q-btn
                      v-bind="uiProps.editButton"
                      :label="translateOrDefault('', 'editButton')"
                      :disable="isLoading"
                      class="generic-sortable-list-card--edit-button"
                      :data-cy="`generic-sortable-list-card_button_edit_${index}`"
                      @click="openEditDialog(item)"
                    />
                    <q-btn
                      v-bind="uiProps.deleteButton"
                      :label="translateOrDefault('', 'deleteButton')"
                      :disable="isLoading"
                      class="generic-sortable-list-card--delete-button"
                      :data-cy="`generic-sortable-list-card_button_delete_${index}`"
                      @click="openDeleteDialog(item, index)"
                    />
                    <slot
                      name="append-item-actions"
                      :item="item"
                      :index="index"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </template>
          </draggable>

          <q-item
            v-if="items.length === 0"
            v-bind="uiProps.item"
          >
            <q-item-section
              v-if="uiProps.noDataIcon?.name"
              v-bind="uiProps.noDataIconSection"
              avatar
            >
              <q-icon v-bind="uiProps.noDataIcon" />
            </q-item-section>
            <q-item-section v-bind="uiProps.noDataLabelSection">
              {{ t('noData') }}
            </q-item-section>
          </q-item>
        </q-scroll-area>
      </q-list>
    </q-card-section>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidDraggableProps,
  LinidQBtnProps,
  LinidQCardProps,
  LinidQIconProps,
  LinidQItemLabelProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQScrollAreaProps,
  Page,
  UiEvent,
} from '@linagora/linid-im-front-corelib';
import {
  deepEqual,
  getHttpClient,
  LinidZoneRenderer,
  uiEventSubject,
  useLinidZoneStore,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
  useValueFormatter,
} from '@linagora/linid-im-front-corelib';
import type { ResizeObserverEntry } from '@vueuse/core';
import { useResizeObserver } from '@vueuse/core';
import type { HTMLElement } from 'happy-dom';
import type { Subscription } from 'rxjs';
import type { ComponentPublicInstance } from 'vue';
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  toRaw,
  useSlots,
  useTemplateRef,
  watch,
} from 'vue';
import draggable from 'vuedraggable';
import { DialogKey } from '../../types/dialog';
import type {
  ChangedItem,
  GenericListField,
  GenericSortableListCardOutputs,
  GenericSortableListCardProps,
  GenericSortableListCardUIProps,
} from '../../types/genericSortableListCard';
import TruncatedItemLabel from '../label/TruncatedItemLabel.vue';
import ButtonsCard from './ButtonsCard.vue';

const props = withDefaults(defineProps<GenericSortableListCardProps>(), {
  itemKey: 'id',
  itemsQuerySize: 50,
  itemMapperFn: (item: Record<string, unknown>) => item,
});
const emits = defineEmits<GenericSortableListCardOutputs>();

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix
    ? `${prefix}.GenericSortableListCard`
    : 'GenericSortableListCard';
});

const localUiNamespace = computed(() => {
  const prefix = props.uiNamespace || props.instanceId;
  return prefix
    ? `${prefix}.generic-sortable-list-card`
    : 'generic-sortable-list-card';
});

const items = ref<Record<string, unknown>[]>([]);
const isLoading = ref<boolean>(false);
let eventSubscription: Subscription;

const nunjucksContext = computed(() => ({
  entity: props.entity ?? {},
}));

const { t, te, translateOrDefault } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { render } = useNunjucks();
const { ui } = useUiDesign();
const { formatValue } = useValueFormatter();

const resolvedFields = computed<GenericListField[]>(() =>
  props.fields.map((field) => ({ ...field, label: t(field.label) }))
);

const formattedItems = computed(() =>
  items.value.map((item) =>
    Object.fromEntries(
      resolvedFields.value.map((field) => [
        field.name,
        formatValue(item[field.name], field.formatter, field.formatOptions) ??
          '',
      ])
    )
  )
);

let initialItems: Record<string, unknown>[] = [];

const uiProps = computed<GenericSortableListCardUIProps>(() => ({
  card: ui<LinidQCardProps>(localUiNamespace.value, 'q-card'),
  scrollArea: ui<LinidQScrollAreaProps>(
    localUiNamespace.value,
    'q-scroll-area'
  ),
  list: ui<LinidQListProps>(localUiNamespace.value, 'q-list'),
  item: ui<LinidQItemProps>(localUiNamespace.value, 'q-item'),
  draggable: ui<LinidDraggableProps>(localUiNamespace.value, 'draggable'),
  iconSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.icon-section`,
    'q-item-section'
  ),
  icon: ui<LinidQIconProps>(`${localUiNamespace.value}.icon-section`, 'q-icon'),
  headerItem: ui<LinidQItemProps>(
    `${localUiNamespace.value}.header-item`,
    'q-item'
  ),
  fieldLabelSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.field-label-section`,
    'q-item-section'
  ),
  fieldLabel: ui<LinidQItemLabelProps>(
    `${localUiNamespace.value}.field-label`,
    'q-item-label'
  ),
  fieldValueSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.field-value-section`,
    'q-item-section'
  ),
  fieldValue: ui<LinidQItemLabelProps>(
    `${localUiNamespace.value}.field-value`,
    'q-item-label'
  ),
  noDataIconSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.no-data-icon-section`,
    'q-item-section'
  ),
  noDataIcon: ui<LinidQIconProps>(
    `${localUiNamespace.value}.no-data-icon-section`,
    'q-icon'
  ),
  noDataLabelSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.no-data-label-section`,
    'q-item-section'
  ),
  itemActionsSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.item-actions-section`,
    'q-item-section'
  ),
  editButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.item-actions-section.edit-button`,
    'q-btn'
  ),
  deleteButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.item-actions-section.delete-button`,
    'q-btn'
  ),
  addButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.add-button`,
    'q-btn'
  ),
  saveButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.save-button`,
    'q-btn'
  ),
}));

/**
 * Items whose value and/or effective position (current index, as a 1-based `orderKey`) diverges
 * from the last loaded state — dragging is just another way that can happen, so it needs no
 * separate tracking. Both sides are compared at their effective position, not their raw stored
 * `orderKey`, so non-contiguous stored values (e.g. 5/10/15) don't flag every item as changed
 * right after load. Items missing from `initialItems`, such as one dragged in from another list
 * sharing the same `group`, are excluded: there is no baseline to diff them against.
 */
const pendingUpdates = computed<ChangedItem[]>(() =>
  items.value
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => {
      const initialIndex = initialItems.findIndex(
        (initial) => initial[props.itemKey] === item[props.itemKey]
      );

      if (initialIndex === -1) {
        return false;
      }

      return !deepEqual(
        { ...item, [props.orderKey]: index + 1 },
        { ...initialItems[initialIndex], [props.orderKey]: initialIndex + 1 }
      );
    })
);

const hasUnsavedChanges = computed<boolean>(
  () => pendingUpdates.value.length > 0
);

const isEntityResolved = computed(
  () => props.entity === undefined || Object.keys(props.entity).length > 0
);

watch(
  () =>
    isEntityResolved.value
      ? render(props.endpoints.find, nunjucksContext.value)
      : null,
  async (endpoint) => {
    if (endpoint === null) {
      return;
    }
    await loadData();
  },
  { immediate: true }
);

/**
 * Fetches all items from the find endpoint, sorts them by order key, and updates the local state.
 * The loaded items become the new baseline, so any pending local change is discarded.
 * On failure, resets the item list and notifies the user.
 */
async function loadData() {
  isLoading.value = true;
  try {
    const data: Record<string, unknown>[] = await getAllItems();

    items.value = data
      .map((item) => props.itemMapperFn(item))
      .sort(
        (a, b) => (a[props.orderKey] as number) - (b[props.orderKey] as number)
      );
    initialItems = items.value.map((item) => structuredClone(toRaw(item)));
  } catch {
    items.value = [];
    initialItems = [];
    Notify({ type: 'negative', message: t('loadError') });
  } finally {
    isLoading.value = false;
  }
}

/**
 * Fetches all items from the find endpoint by paginating through all available pages.
 * @returns A promise that resolves to an array of all items.
 */
async function getAllItems(): Promise<Record<string, unknown>[]> {
  const result: Record<string, unknown>[] = [];
  let page = 0;
  let isLast = false;

  while (!isLast) {
    const response = await getHttpClient().get<Page<Record<string, unknown>>>(
      render(props.endpoints.find, nunjucksContext.value),
      { params: { page, size: props.itemsQuerySize } }
    );

    const data = response?.data || { content: [], last: true };

    result.push(...data.content);
    isLast = data.last ?? true;
    page++;
  }

  return result;
}

/**
 * Opens the form dialog used to create a new item.
 */
function openCreateDialog(): void {
  const initialFormData = props.formFields.reduce<Record<string, unknown>>(
    (acc, field) => {
      if (
        field.name !== props.orderKey &&
        field.inputSettings?.defaultValue !== undefined
      ) {
        acc[field.name] = field.inputSettings.defaultValue;
      }
      return acc;
    },
    { [props.orderKey]: items.value.length + 1 }
  );

  uiEventSubject.next({
    key: DialogKey.Form,
    data: {
      type: 'open',
      title: t('CreateFormDialog.title'),
      content: translateOrDefault('', 'CreateFormDialog.content'),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.CreateFormDialog`,
      instanceId: props.instanceId,
      formFields: props.formFields,
      initialFormData,
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
    const { data } = await getHttpClient().post(
      render(props.endpoints.create, nunjucksContext.value),
      formData
    );

    Notify({ type: 'positive', message: t('createSuccess') });
    emits('created', props.itemMapperFn(data));
    await loadData();
  } catch (error) {
    Notify({ type: 'negative', message: t('createError') });
    throw error;
  }
}

/**
 * Opens a confirmation dialog before deleting an item. The item properties are available as
 * named parameters in the dialog title and content translations.
 * @param item - The item to delete.
 * @param index - The position of the item in the current list, used to remove it locally before reloading.
 */
function openDeleteDialog(item: Record<string, unknown>, index: number): void {
  uiEventSubject.next({
    key: DialogKey.Confirmation,
    data: {
      type: 'open',
      title: t('DeleteConfirmationDialog.title', item),
      content: t('DeleteConfirmationDialog.content', item),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.DeleteConfirmationDialog`,
      onConfirm: () => deleteItem(item, index),
    },
  });
}

/**
 * Deletes an item through the delete endpoint, then notifies the user, emits the `deleted`
 * event, reorders the remaining items and reloads the list. If the reorder requests partially
 * or fully fail, notifies the user. On deletion failure, notifies the user and keeps the items unchanged.
 * @param item - The item to delete, available as `item` in the endpoint template context.
 * @param index - The position of the item in the current list, used to remove it locally before reloading.
 * @returns A promise that resolves when the deletion handling is complete.
 */
async function deleteItem(
  item: Record<string, unknown>,
  index: number
): Promise<void> {
  try {
    await getHttpClient().delete(
      render(props.endpoints.delete, {
        ...nunjucksContext.value,
        item,
      })
    );

    Notify({ type: 'positive', message: t('deleteSuccess') });
    emits('deleted', item);
    items.value.splice(index, 1);
    const reorderResults = await submitPendingUpdates();
    if (!reorderResults.includes('fulfilled')) {
      Notify({ type: 'negative', message: t('saveChangesError') });
      return;
    } else if (reorderResults.includes('rejected')) {
      Notify({ type: 'negative', message: t('saveChangesPartially') });
    }
    await loadData();
  } catch {
    Notify({ type: 'negative', message: t('deleteError') });
  }
}

/**
 * Opens the form dialog used to edit an item, pre-filling the form with the item's current values.
 * @param item - The item to edit, whose properties are used as the initial form data.
 */
function openEditDialog(item: Record<string, unknown>): void {
  uiEventSubject.next({
    key: DialogKey.Form,
    data: {
      type: 'open',
      title: t('EditFormDialog.title', item),
      content: translateOrDefault('', 'EditFormDialog.content', item),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.EditFormDialog`,
      instanceId: props.instanceId,
      formFields: props.formFields,
      initialFormData: item,
      onSubmit: (formData: Record<string, unknown>) =>
        updateItemLocally({ ...item, ...formData }),
    },
  });
}

/**
 * Replaces the item matching `updatedItem` on `itemKey` in the local list, without persisting
 * anything — used by the edit dialog (pre-merged with the original item) and by
 * `listenToItemUpdate` events such as a toggle field.
 * @param updatedItem - The updated item, matched against the local list on the item key.
 */
function updateItemLocally(updatedItem: Record<string, unknown>): void {
  items.value = items.value.map((item) =>
    updatedItem[props.itemKey] === item[props.itemKey] ? updatedItem : item
  );
}

/**
 * Persists every pending change by sending a `PUT` per item in `pendingUpdates`, in parallel. If at
 * least one request succeeded, reloads the items and emits `updated`. Notifies the user of full or
 * partial failure when applicable.
 */
async function saveChanges() {
  if (!hasUnsavedChanges.value) {
    return;
  }

  const results = await submitPendingUpdates();

  if (!results.includes('fulfilled')) {
    Notify({ type: 'negative', message: t('saveChangesError') });
    return;
  }

  if (results.includes('rejected')) {
    Notify({ type: 'negative', message: t('saveChangesPartially') });
  } else {
    Notify({ type: 'positive', message: t('saveChangesSuccess') });
  }

  await loadData();
  emits('updated', items.value);
}

/**
 * Sends a `PUT` request for every item in `pendingUpdates`, in parallel, assigning each one its
 * current 1-based position as the `orderKey`.
 * @returns The settlement status of each request, in the same order as `pendingUpdates`.
 */
async function submitPendingUpdates(): Promise<('fulfilled' | 'rejected')[]> {
  const results = await Promise.allSettled(
    pendingUpdates.value.map(({ item, index }) =>
      getHttpClient().put(
        render(props.endpoints.update, {
          ...nunjucksContext.value,
          item,
        }),
        {
          ...item,
          [props.orderKey]: index + 1,
        }
      )
    )
  );

  return results.map((r) => r.status);
}

onMounted(() => {
  if (!props.listenToItemUpdate) {
    return;
  }

  eventSubscription = uiEventSubject.subscribe((event: UiEvent) => {
    if (
      event.key === props.listenToItemUpdate &&
      typeof event.data === 'object' &&
      event.data != null
    ) {
      updateItemLocally(event.data as Record<string, unknown>);
    }
  });
});

onUnmounted(() => {
  eventSubscription?.unsubscribe();
});

/********************************
 * Slots and LinidZoneRenderer.
 *******************************/

const beforeFieldLabelsZoneName = computed(
  () => `${localUiNamespace.value}.field-labels.before`
);

const afterFieldLabelsZoneName = computed(
  () => `${localUiNamespace.value}.field-labels.after`
);

const beforeFieldValuesZoneName = computed(
  () => `${localUiNamespace.value}.field-values.before`
);

const afterFieldValuesZoneName = computed(
  () => `${localUiNamespace.value}.field-values.after`
);

const slots = useSlots();
const { hasZoneEntries } = useLinidZoneStore();

const hasBeforeFieldsSection = computed<boolean>(
  () =>
    Boolean(slots['before-field-labels'] || slots['before-field-values']) ||
    hasZoneEntries(beforeFieldLabelsZoneName.value) ||
    hasZoneEntries(beforeFieldValuesZoneName.value)
);

const hasAfterFieldsSection = computed<boolean>(
  () =>
    Boolean(slots['after-field-labels'] || slots['after-field-values']) ||
    hasZoneEntries(afterFieldLabelsZoneName.value) ||
    hasZoneEntries(afterFieldValuesZoneName.value)
);

/******************************
 * Item actions section width.
 *****************************/

const defaultWidth = '100px';
const itemActionsWidth = ref(defaultWidth);

const itemActionsSection =
  useTemplateRef<ComponentPublicInstance>('itemActionsSection');

useResizeObserver(itemActionsSection, (entries: ResizeObserverEntry[]) => {
  const entry = entries[0];

  if (entry?.target == null) {
    itemActionsWidth.value = defaultWidth;
    return;
  }

  const { offsetWidth } = entry.target as HTMLElement;

  itemActionsWidth.value =
    offsetWidth != null ? `${offsetWidth}px` : defaultWidth;
});
</script>
