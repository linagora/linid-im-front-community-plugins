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
  <div
    class="column col-grow linid-filter-panel"
    data-cy="linid-filter-panel"
  >
    <div class="text-weight-bold q-pa-sm linid-filter-panel--title">
      <q-icon
        v-if="uiProps.titleIcon?.name"
        v-bind="uiProps.titleIcon"
      />
      {{ t('title') }}
    </div>

    <q-separator v-bind="uiProps.titleSeparator" />

    <div class="row col-grow no-wrap linid-filter-panel--content">
      <q-list
        v-bind="uiProps.list"
        class="col-auto linid-filter-panel--list"
        data-cy="linid-filter-panel_list"
      >
        <q-item
          v-for="filter in props.filters"
          :key="filter.name"
          v-bind="uiProps.item"
          clickable
          :active="filter.name === selectedFilterName"
          :data-cy="`linid-filter-panel_item-${filter.name}`"
          @click="selectFilter(filter.name)"
        >
          <q-item-section
            v-if="uiProps.types[filter.type]?.icon?.name"
            v-bind="uiProps.iconSection"
            avatar
          >
            <q-icon v-bind="uiProps.types[filter.type].icon" />
          </q-item-section>
          <q-item-section v-bind="uiProps.labelSection">
            {{ t(`columnFilter.${filter.name}`) }}
          </q-item-section>
        </q-item>
      </q-list>

      <q-separator
        v-bind="uiProps.contentSeparator"
        vertical
      />

      <div
        class="col-grow q-pa-md linid-filter-panel--editor"
        data-cy="linid-filter-panel_editor"
      >
        <slot
          v-if="selectedFilter"
          :name="`filter-${selectedFilter.type}`"
        />
      </div>
    </div>
  </div>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQIconProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQSeparatorProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import { computed, watch } from 'vue';
import type {
  LinidFilterPanelOutputs,
  LinidFilterPanelProps,
  LinidFilterPanelUIProps,
} from '../../types/linidFilterPanel';

const props = defineProps<LinidFilterPanelProps>();
const emit = defineEmits<LinidFilterPanelOutputs>();

const { t } = useScopedI18n(`${props.i18nScope}.LinidFilterPanel`);
const { ui } = useUiDesign();

const localUiNamespace = `${props.uiNamespace}.linid-filter-panel`;
const headerUiNamespace = `${localUiNamespace}.header`;
const contentUiNamespace = `${localUiNamespace}.content`;

const filterTypes = computed(() => [
  ...new Set(props.filters.map((filter) => filter.type)),
]);

const uiProps = computed<LinidFilterPanelUIProps>(() => ({
  titleIcon: ui<LinidQIconProps>(headerUiNamespace, 'q-icon'),
  titleSeparator: ui<LinidQSeparatorProps>(headerUiNamespace, 'q-separator'),
  list: ui<LinidQListProps>(contentUiNamespace, 'q-list'),
  item: ui<LinidQItemProps>(contentUiNamespace, 'q-item'),
  types: filterTypes.value.reduce<LinidFilterPanelUIProps['types']>(
    (acc, type) => {
      acc[type] = {
        icon: ui<LinidQIconProps>(
          `${contentUiNamespace}.types.${type}`,
          'q-icon'
        ),
      };
      return acc;
    },
    {}
  ),
  iconSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.icon-section`,
    'q-item-section'
  ),
  labelSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.label-section`,
    'q-item-section'
  ),
  contentSeparator: ui<LinidQSeparatorProps>(contentUiNamespace, 'q-separator'),
}));

/**
 * Identifier of the filter that should currently be active.
 * Falls back to the first available filter when `selected` does not match any filter.
 */
const selectedFilterName = computed<string>(() => {
  if (props.filters.some((filter) => filter.name === props.selected)) {
    return props.selected;
  }
  return props.filters[0]?.name ?? '';
});

/**
 * The currently selected filter object, or `undefined` if no filter is selected.
 * Used to determine which filter editor slot to render.
 */
const selectedFilter = computed(() =>
  props.filters.find((filter) => filter.name === selectedFilterName.value)
);

/**
 * Selects a filter by its identifier.
 * @param filterName The identifier of the filter to select.
 */
function selectFilter(filterName: string): void {
  emit('update:selected', filterName);
}

watch(
  selectedFilterName,
  (filterName) => {
    if (filterName !== props.selected) {
      emit('update:selected', filterName);
    }
  },
  { immediate: true }
);
</script>

<style>
.linid-filter-panel-list {
  min-width: 200px;
}
</style>
