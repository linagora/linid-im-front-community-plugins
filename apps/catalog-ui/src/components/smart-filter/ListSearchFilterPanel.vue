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
  <div class="list-search-filter-panel">
    <q-list v-bind="uiProps.list">
      <q-item
        v-for="item in props.items"
        :key="item.value"
        v-bind="uiProps.item"
      >
        <q-item-section v-bind="uiProps.itemSectionCheckbox">
          <q-checkbox
            v-model="tickedItems"
            :val="item.value"
          />
        </q-item-section>

        <q-item-section v-bind="uiProps.itemSectionLabel">
          {{ item.label }}
        </q-item-section>
      </q-item>
    </q-list>
    <q-btn
      v-bind="uiProps.filterButton"
      :label="t('searchButton')"
      data-cy="button_search"
      class="search-button"
      @click="onSearch"
    />
  </div>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQListProps,
  LinidQItemProps,
  LinidQItemSectionProps,
} from '@linagora/linid-im-front-corelib';
import { LinidFilterValue } from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import type { ListSearchFilterProps } from '../../types/ListSearchFilterPanel';
import { ref } from 'vue';
import type { LinidFilterPanelSearchOutputs } from '../../types/linidFilterPanel';

const props = defineProps<ListSearchFilterProps>();
const emit = defineEmits<LinidFilterPanelSearchOutputs>();

const { ui } = useUiDesign();
const localI18n = `${props.i18nScope}.ListSearchFilterPanel`;
const { t } = useScopedI18n(localI18n);
const localUiNamespace = `${props.uiNamespace}.list-search-filter-panel`;

const tickedItems = ref<string[]>([]);

const uiProps = {
  list: ui<LinidQListProps>(localUiNamespace, 'q-list'),
  item: ui<LinidQItemProps>(localUiNamespace, 'q-item'),
  itemSectionCheckbox: ui<LinidQItemSectionProps>(
    `${localUiNamespace}.checkboxSection`,
    'q-item-section'
  ),
  itemSectionLabel: ui<LinidQItemSectionProps>(
    `${localUiNamespace}.labelSection`,
    'q-item-section'
  ),
  filterButton: ui<LinidQBtnProps>(localUiNamespace, 'q-btn'),
};

/**
 * Emits a 'search' event with the ticked nodes.
 */
function onSearch() {
  const result: LinidFilterValue[] = tickedItems.value.map((item) => {
    return new LinidFilterValue(false, '', item);
  });
  emit('search', {
    field: props.fieldName,
    values: result,
  });
}
</script>

<style scoped></style>
