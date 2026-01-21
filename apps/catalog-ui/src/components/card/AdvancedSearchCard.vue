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
    class="advanced-search-card"
    data-cy="advanced-search-card"
  >
    <q-card-section
      v-if="te('title')"
      class="row justify-start items-center q-pa-sm"
    >
      <q-icon
        v-if="uiProps.icon.name"
        v-bind="uiProps.icon"
        class="q-mr-sm"
        size="sm"
      />
      <span class="text-italic advanced-search-card--title">
        {{ t('title') }}
      </span>
    </q-card-section>

    <q-card-section class="advanced-search-card--default-filters q-pb-md">
      <div class="row q-gutter-md items-baseline">
        <div
          v-for="field in defaultFieldsDefinitions"
          :key="field.name"
          class="col-auto"
        >
          <component
            :is="fieldComponent"
            v-if="fieldComponent"
            :ui-namespace="`${localUiNamespace}.default-filters.fields.${field.name}`"
            :instance-id="instanceId"
            :definition="field"
            :entity="localFilters"
            @update:entity="onFilterChange"
          />
        </div>

        <div
          v-if="advancedFieldsDefinitions.length > 0"
          class="col-auto"
        >
          <q-btn
            v-bind="uiProps.toggleButton"
            :icon="isExpanded ? 'expand_less' : 'expand_more'"
            :label="isExpanded ? t('lessFilters') : t('moreFilters')"
            data-cy="advanced-search-card--toggle-button"
            @click="toggleExpanded"
          />
        </div>
      </div>
    </q-card-section>

    <q-slide-transition>
      <div v-show="isExpanded">
        <q-separator />
        <q-card-section
          class="advanced-search-card--advanced-filters q-pt-md"
          data-cy="advanced-search-card--advanced-section"
        >
          <div class="row q-gutter-md items-baseline">
            <div
              v-for="field in advancedFieldsDefinitions"
              :key="field.name"
              class="col-auto"
            >
              <component
                :is="fieldComponent"
                v-if="fieldComponent"
                :ui-namespace="`${localUiNamespace}.advanced-filters.fields.${field.name}`"
                :instance-id="instanceId"
                :definition="field"
                :entity="localFilters"
                @update:entity="onFilterChange"
              />
            </div>
          </div>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import { ref, watch, defineAsyncComponent, computed } from 'vue';
import type {
  LinidQCardProps,
  LinidQBtnProps,
  LinidQIconProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import type {
  AdvancedSearchCardProps,
  AdvancedSearchCardOutputs,
} from '../../types/advancedSearchCard';

const props = defineProps<AdvancedSearchCardProps>();
const emit = defineEmits<AdvancedSearchCardOutputs>();

const localUiNamespace = `${props.uiNamespace}.advanced-search-card`;
const { t, te } = useScopedI18n(`${props.i18nScope}.AdvancedSearchCard`);
const { ui } = useUiDesign();

const uiProps = {
  card: ui<LinidQCardProps>(localUiNamespace, 'q-card'),
  icon: ui<LinidQIconProps>(localUiNamespace, 'q-icon'),
  toggleButton: ui<LinidQBtnProps>(
    `${localUiNamespace}.toggle-button`,
    'q-btn'
  ),
};

const fieldComponent = defineAsyncComponent(
  () => import('../field/EntityAttributeField.vue')
);

const isExpanded = ref(false);
const localFilters = ref<Record<string, unknown>>({ ...props.filters });

const defaultFieldsDefinitions = computed(() =>
  props.fields.filter((field) => props.defaultFieldsNames.includes(field.name))
);

const advancedFieldsDefinitions = computed(() =>
  props.fields.filter((field) => props.advancedFieldsNames.includes(field.name))
);

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

/**
 * Toggle the expanded state of the advanced filters section.
 */
function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value;
}

/**
 * Handle filter changes from field components.
 * @param updatedFilters - The updated filters object from the field component.
 */
function onFilterChange(updatedFilters: Record<string, unknown>): void {
  localFilters.value = updatedFilters;
  emit('update:filters', updatedFilters);
}
</script>
