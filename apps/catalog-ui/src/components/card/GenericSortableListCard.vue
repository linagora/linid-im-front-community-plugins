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
            :disable="isLoading || !isOrderHasChanged"
            class="buttons-card--save-button"
            data-cy="generic-sortable-list-card_save-button"
            @click="saveOrder"
          />
        </template>
      </ButtonsCard>
    </q-card-section>
    <q-card-section v-if="isOrderHasChanged">
      <span>{{ t('saveNewOrderHint') }}</span>
    </q-card-section>
    <q-card-section>
      <q-scroll-area
        class="generic-sortable-list-card--scroll-area"
        v-bind="uiProps.scrollArea"
      >
        <q-list
          v-bind="uiProps.list"
          class="full-width col-auto generic-sortable-list-card--list"
          data-cy="generic-sortable-list-card_list"
        >
          <draggable
            v-model="items"
            v-bind="uiProps.draggable"
            :item-key="itemKey"
            @change="onOrderChange($event)"
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
                <q-item-section
                  v-bind="uiProps.labelSection"
                  :data-cy="`generic-sortable-list-card_item-label_${index}`"
                >
                  <slot :item="item">
                    {{ item[labelKey] }}
                  </slot>
                </q-item-section>
                <slot
                  name="after-item-label"
                  :item="item"
                  :index="index"
                />
                <LinidZoneRenderer
                  :zone="afterItemLabelZoneName"
                  :entity="entity || {}"
                  :item="item"
                  :instance-id="instanceId"
                  :ui-namespace="uiNamespace"
                  :i18n-scope="i18nScope"
                />
                <q-item-section
                  v-bind="uiProps.editSection"
                  class="row items-end"
                >
                  <q-btn
                    v-bind="uiProps.editButton"
                    :label="translateOrDefault('', 'editButton')"
                    :disable="isLoading"
                    class="generic-sortable-list-card--edit-button"
                    :data-cy="`generic-sortable-list-card_button_edit_${index}`"
                    @click="openEditDialog(item)"
                  />
                </q-item-section>
                <q-item-section
                  v-bind="uiProps.deleteSection"
                  class="row items-end"
                >
                  <q-btn
                    v-bind="uiProps.deleteButton"
                    :label="translateOrDefault('', 'deleteButton')"
                    :disable="isLoading"
                    class="generic-sortable-list-card--delete-button"
                    :data-cy="`generic-sortable-list-card_button_delete_${index}`"
                    @click="openDeleteDialog(item, index)"
                  />
                </q-item-section>
                <slot
                  name="item-actions"
                  :item="item"
                  :index="index"
                />
                <LinidZoneRenderer
                  :zone="itemActionsZoneName"
                  :entity="entity || {}"
                  :item="item"
                  :instance-id="instanceId"
                  :ui-namespace="uiNamespace"
                  :i18n-scope="i18nScope"
                />
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
        </q-list>
      </q-scroll-area>
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
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQScrollAreaProps,
  Page,
} from '@linagora/linid-im-front-corelib';
import {
  getHttpClient,
  LinidZoneRenderer,
  uiEventSubject,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref, toRaw, watch } from 'vue';
import draggable from 'vuedraggable';
import { DialogKey } from '../../types/dialog';
import type {
  GenericSortableListCardOutputs,
  GenericSortableListCardProps,
  GenericSortableListCardUIProps,
} from '../../types/genericSortableListCard';
import type {
  DraggableChangeEvent,
  DraggableMoveEvent,
} from '../../types/vueDraggable';
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

const afterItemLabelZoneName = computed(() => {
  const suffix = 'item.label.after';
  return props.instanceId ? `${props.instanceId}.${suffix}` : suffix;
});

const itemActionsZoneName = computed(() => {
  const suffix = 'item.actions';
  return props.instanceId ? `${props.instanceId}.${suffix}` : suffix;
});

const items = ref<Record<string, unknown>[]>([]);
const isLoading = ref<boolean>(false);
const isOrderHasChanged = ref<boolean>(false);

const nunjucksContext = computed(() => ({
  entity: props.entity ?? {},
}));

const { t, te, translateOrDefault } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { render } = useNunjucks();
const { ui } = useUiDesign();
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
  labelSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.label-section`,
    'q-item-section'
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
  editSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.edit-section`,
    'q-item-section'
  ),
  editButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.edit-section`,
    'q-btn'
  ),
  deleteSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace.value}.delete-section`,
    'q-item-section'
  ),
  deleteButton: ui<LinidQBtnProps>(
    `${localUiNamespace.value}.delete-section`,
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

watch(
  () => render(props.endpoints.find, nunjucksContext.value),
  async () => {
    await loadData();
  },
  { immediate: true }
);

/**
 * Fetches all items from the find endpoint, sorts them by order key, and updates the local state.
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
      initialFormData: { [props.orderKey]: items.value.length + 1 },
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
 * event and reloads the items. On failure, notifies the user and keeps the items unchanged.
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
    await updateItemsOrder();
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
        updateItem(formData, item),
    },
  });
}

/**
 * Edit an item by posting the submitted form data to the update endpoint, then notifies
 * the user, emits the `updated` event and reloads the items.
 * @param formData - The submitted form data, sent as the request body.
 * @param item - The original item before edits, available as `item` in the endpoint template context.
 * @returns A promise that resolves when the update handling is complete. The promise rejects
 * when the update fails, so the form dialog stays open for correction.
 */
async function updateItem(
  formData: Record<string, unknown>,
  item: Record<string, unknown>
): Promise<void> {
  try {
    const { data } = await getHttpClient().put(
      render(props.endpoints.update, {
        ...nunjucksContext.value,
        item,
      }),
      formData
    );

    Notify({ type: 'positive', message: t('updateSuccess') });
    emits('updated', props.itemMapperFn(data));
    await loadData();
  } catch (error) {
    Notify({ type: 'negative', message: t('updateError') });
    throw error;
  }
}

/**
 * Handles a drag-and-drop change event from vuedraggable and marks the order as changed when an
 * item is added, removed, or moved to a position different from its original one.
 * @param event - The draggable change event describing what happened (added, removed, or moved).
 */
function onOrderChange(
  event: DraggableChangeEvent<Record<string, unknown>>
): void {
  if ('added' in event || 'removed' in event) {
    isOrderHasChanged.value = true;
    return;
  }

  const movedEvt = event as DraggableMoveEvent<Record<string, unknown>>;
  const originalIndex = initialItems.findIndex(
    (item) => item[props.itemKey] === movedEvt.moved.element[props.itemKey]
  );

  if (originalIndex !== -1 && movedEvt.moved.newIndex !== originalIndex) {
    isOrderHasChanged.value = true;
  } else if (
    items.value.every(
      (item, index) =>
        item[props.itemKey] === initialItems[index]?.[props.itemKey]
    )
  ) {
    isOrderHasChanged.value = false;
  }
}

/**
 * Saves the current item order by updating each item with its new index via the update endpoint,
 * then notifies the user and emits the `order-updated` event.
 */
async function saveOrder() {
  try {
    await updateItemsOrder();

    Notify({ type: 'positive', message: t('updateOrderSuccess') });
    emits('order-updated', items.value);
    isOrderHasChanged.value = false;
    await loadData();
  } catch {
    Notify({ type: 'negative', message: t('updateOrderError') });
  }
}

/**
 * Updates the order key of each item according to its current position in the list by sending
 * a PUT request for every item in parallel.
 */
async function updateItemsOrder(): Promise<void> {
  await Promise.all(
    items.value.map((item, index) =>
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
}
</script>
