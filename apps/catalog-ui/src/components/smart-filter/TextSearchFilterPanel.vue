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
    class="text-search-filter-panel"
    data-cy="text-search-filter-panel"
  >
    <q-input
      v-model="inputValue"
      v-bind="uiProps.input"
      :label="translateOrDefault('', 'inputLabel')"
      :hint="translateOrDefault('', 'inputHint')"
      :prefix="translateOrDefault('', 'inputPrefix')"
      :suffix="translateOrDefault('', 'inputSuffix')"
      data-cy="text-search-filter-panel_input"
      autofocus
      @keyup.enter="onSearch"
    />

    <q-checkbox
      v-model="isNegation"
      v-bind="uiProps.checkbox"
      :label="t('negateLabel')"
      data-cy="text-search-filter-panel_negate"
    />

    <q-option-group
      v-model="selectedOperatorKey"
      v-bind="uiProps.optionGroup"
      :options="operators"
      type="radio"
      data-cy="text-search-filter-panel_operators"
    />

    <q-btn
      v-bind="uiProps.searchButton"
      :label="t('searchButton')"
      data-cy="text-search-filter-panel_search"
      class="q-mt-sm float-right text-search-filter-panel_search"
      @click="onSearch"
    />
  </div>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQCheckboxProps,
  LinidQInputProps,
  LinidQOptionGroupProps,
} from '@linagora/linid-im-front-corelib';
import {
  LinidFilterValue,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref } from 'vue';
import type { LinidFilterPanelSearchOutputs } from '../../types/linidFilterPanel';
import type {
  TextFilterOperatorKey,
  TextSearchFilterPanelProps,
  TextSearchFilterPanelUIProps,
} from '../../types/textSearchFilterPanel';

const OPERATOR_KEYS: TextFilterOperatorKey[] = [
  'contains',
  'startsWith',
  'endsWith',
  'equals',
];

const props = defineProps<TextSearchFilterPanelProps>();
const emit = defineEmits<LinidFilterPanelSearchOutputs>();

const { t, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.TextSearchFilterPanel`
);
const { ui } = useUiDesign();

const localUiNamespace = `${props.uiNamespace}.text-search-filter-panel`;

const uiProps: TextSearchFilterPanelUIProps = {
  input: ui<LinidQInputProps>(localUiNamespace, 'q-input'),
  checkbox: ui<LinidQCheckboxProps>(localUiNamespace, 'q-checkbox'),
  optionGroup: ui<LinidQOptionGroupProps>(localUiNamespace, 'q-option-group'),
  searchButton: ui<LinidQBtnProps>(localUiNamespace, 'q-btn'),
};

const inputValue = ref('');
const isNegation = ref(false);
const selectedOperatorKey = ref<TextFilterOperatorKey>('contains');

const operators = computed(() =>
  OPERATOR_KEYS.map((key) => ({
    value: key,
    label: isNegation.value
      ? t(`operators.not${key.charAt(0).toUpperCase()}${key.slice(1)}`)
      : t(`operators.${key}`),
  }))
);

/**
 * Builds the LinidFilterValue for the current form state.
 * @returns The constructed filter value.
 */
function buildFilterValue(): LinidFilterValue {
  const key = selectedOperatorKey.value;
  const operator = key === 'equals' ? '' : 'lk_';

  let value = inputValue.value;
  if (key === 'contains') {
    value = `*${value}*`;
  } else if (key === 'startsWith') {
    value = `${value}*`;
  } else if (key === 'endsWith') {
    value = `*${value}`;
  }

  return new LinidFilterValue(isNegation.value, operator, value);
}

/**
 * Emits the search event with the constructed filter value.
 */
function onSearch(): void {
  emit('search', {
    field: props.fieldName,
    values: [buildFilterValue()],
  });
}
</script>
