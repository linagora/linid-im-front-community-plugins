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
  <div class="linid-smart-filter">
    <q-field
      :stack-label="(filters?.length || 0) > 0"
      v-bind="uiProps.field"
      class="linid-smart-filter--field"
      data-cy="linid-smart-filter-field"
      :label="translateOrDefault('', 'label')"
      :hint="translateOrDefault('', 'hint')"
      :prefix="translateOrDefault('', 'prefix')"
      :suffix="translateOrDefault('', 'suffix')"
    >
      <template #prepend>
        <q-icon
          name="search"
          v-bind="uiProps.iconSearch"
        />
      </template>

      <template
        v-if="filters?.length"
        #control
      >
        <div
          class="row justify-center q-gutter-sm q-pt-sm linid-smart-filter--chips"
          data-cy="linid-smart-filter-chips"
        >
          <linid-filter-chip
            v-for="filter in filters"
            :key="filter.id"
            :filter="filter"
            :ui-namespace="localUiNamespace"
            :i18n-scope="localI18nScope"
            @remove="onChipRemove"
          />
        </div>
      </template>

      <template #append>
        <q-icon
          v-if="!isFilterMenuOpen"
          name="arrow_drop_down"
          v-bind="uiProps.iconMenuOpen"
        />
        <q-icon
          v-else
          name="arrow_drop_up"
          v-bind="uiProps.iconMenuClose"
        />
      </template>

      <q-menu
        v-model="isFilterMenuOpen"
        class="row linid-smart-filter--menu"
        data-cy="linid-smart-filter-menu"
        v-bind="uiProps.menu"
      >
        <linid-filter-panel
          v-model:selected="selectedFilterName"
          :filters="options?.filters ?? []"
          :ui-namespace="localUiNamespace"
          :i18n-scope="localI18nScope"
          data-cy="linid-smart-filter-panel"
        >
          <template
            v-for="(panelComponent, type) in PANEL_COMPONENTS"
            :key="type"
            #[`filter-${type}`]
          >
            <component
              :is="panelComponent"
              v-if="panelComponent"
              :key="selectedFilterName"
              v-bind="currentPanelProps"
              @search="onSearch"
            />
          </template>
        </linid-filter-panel>

        <q-separator
          v-bind="uiProps.separator"
          vertical
        />

        <linid-favorite-panel
          :favorites="options?.filterSets ?? []"
          :ui-namespace="localUiNamespace"
          :i18n-scope="localI18nScope"
          data-cy="linid-smart-favorite-panel"
          @apply="(data) => emit('apply:favorite', data)"
          @delete="(data) => emit('delete:favorite', data)"
          @create="emit('create:favorite')"
          @override="emit('override:favorite')"
        />
      </q-menu>
    </q-field>
  </div>
  <!-- v8 ignore stop -->
</template>

<script lang="ts" setup>
import type {
  LinidFilterType,
  LinidQFieldProps,
  LinidQIconProps,
  LinidQMenuProps,
} from '@linagora/linid-im-front-corelib';
import {
  LinidFilter,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { Component } from 'vue';
import { computed, ref, watch } from 'vue';
import type { LinidFilterPanelSearchPayload } from '../../types/linidFilterPanel';
import type {
  LinidSmartFilterOutputs,
  LinidSmartFilterProps,
} from '../../types/smartFilter';
import LinidFilterChip from '../chip/LinidFilterChip.vue';
import DateSearchFilterPanel from './DateSearchFilterPanel.vue';
import LinidFavoritePanel from './LinidFavoritePanel.vue';
import LinidFilterPanel from './LinidFilterPanel.vue';
import ListSearchFilterPanel from './ListSearchFilterPanel.vue';
import NumberSearchFilterPanel from './NumberSearchFilterPanel.vue';
import TextSearchFilterPanel from './TextSearchFilterPanel.vue';
import TreeSearchFilterPanel from './TreeSearchFilterPanel.vue';

const PANEL_COMPONENTS: Record<LinidFilterType, Component> = {
  text: TextSearchFilterPanel,
  number: NumberSearchFilterPanel,
  date: DateSearchFilterPanel,
  list: ListSearchFilterPanel,
  tree: TreeSearchFilterPanel,
};

const props = defineProps<LinidSmartFilterProps>();
const emit = defineEmits<LinidSmartFilterOutputs>();

const localUiNamespace = `${props.uiNamespace}.linid-smart-filter`;
const { ui } = useUiDesign();
const localI18nScope = `${props.i18nScope}.LinidSmartFilter`;
const { translateOrDefault } = useScopedI18n(localI18nScope);

const isFilterMenuOpen = ref(false);
const selectedFilterName = ref('');

let activeFilters: LinidFilter[] = [];

watch(
  () => props.filters,
  (newFilters) => {
    activeFilters = (newFilters ?? []).map((f) =>
      Object.assign(Object.create(Object.getPrototypeOf(f)), f)
    );
  },
  { immediate: true }
);

const uiProps = {
  field: ui<LinidQFieldProps>(`${localUiNamespace}`, 'q-field'),
  menu: ui<LinidQMenuProps>(`${localUiNamespace}`, 'q-menu'),
  iconSearch: ui<LinidQIconProps>(`${localUiNamespace}.iconSearch`, 'q-icon'),
  separator: ui<LinidQIconProps>(`${localUiNamespace}`, 'q-separator'),
  iconMenuClose: ui<LinidQIconProps>(
    `${localUiNamespace}.iconMenuClose`,
    'q-icon'
  ),
  iconMenuOpen: ui<LinidQIconProps>(
    `${localUiNamespace}.iconMenuOpen`,
    'q-icon'
  ),
};

/** The filter object corresponding to the currently selected name in the panel. */
const selectedFilter = computed<LinidFilter | undefined>(() =>
  (props.options?.filters ?? []).find(
    (f) => f.name === selectedFilterName.value
  )
);

/** Props forwarded to the active search panel, derived from the selected filter's options. */
const currentPanelProps = computed(() => ({
  ...(selectedFilter.value?.options as Record<string, unknown>),
  fieldName: selectedFilter.value?.name,
  uiNamespace: localUiNamespace,
  i18nScope: localI18nScope,
}));

/**
 * Called when a search panel emits a `search` event.
 * Always pushes a new `LinidFilter` entry to `activeFilters`, even if one with the same field name
 * already exists — each search produces its own chip with its own values. No-ops when no filter is
 * selected or values is empty.
 * @param payload - The search payload carrying the target field and new values.
 */
function onSearch(payload: LinidFilterPanelSearchPayload): void {
  if (!selectedFilter.value || payload.values.length === 0) {
    return;
  }

  activeFilters.push(
    new LinidFilter(
      payload.field,
      selectedFilter.value?.type,
      selectedFilter.value?.options,
      payload.values
    )
  );
  emitFilters();
  isFilterMenuOpen.value = false;
}

/**
 * Called when the user removes a filter chip.
 * Clears all values for the corresponding filter.
 * @param filterId - The id of the filter whose values should be cleared.
 */
function onChipRemove(filterId: string): void {
  activeFilters = activeFilters.filter((filter) => filter.id !== filterId);
  emitFilters();
}

/**
 * Emits `update:filters` with all filters that currently have applied values.
 */
function emitFilters(): void {
  emit(
    'update:filters',
    activeFilters.filter((f) => f.values.length > 0)
  );
}
</script>

<style lang="scss" scoped></style>
