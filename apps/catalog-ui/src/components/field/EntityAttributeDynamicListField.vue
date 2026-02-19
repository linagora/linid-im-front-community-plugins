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
  <q-select
    v-model="localValue"
    :data-cy="`field_${definition.name}`"
    class="entity-attribute-dynamic-list-field"
    v-bind="uiProps"
    :label="translateOrDefault('', 'label')"
    :hint="translateOrDefault('', 'hint')"
    :prefix="translateOrDefault('', 'prefix')"
    :suffix="translateOrDefault('', 'suffix')"
    :options="allOptions"
    :rules="rules"
    :loading="isLoading"
    @virtual-scroll="onVirtualScroll"
    @update:model-value="updateValue"
  >
    <template
      v-if="error"
      #no-option
    >
      <q-item>
        <q-item-section class="text-negative">
          {{ error }}
        </q-item-section>
      </q-item>
    </template>
  </q-select>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import {
  type LinidQSelectProps,
  useQuasarRules,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onMounted, ref } from 'vue';
import { getDynamicListPage } from '../../services/dynamicListService';
import type {
  AttributeFieldProps,
  EntityAttributeFieldOutputs,
  FieldDynamicListSettings,
} from '../../types/field';

/** Payload received from the Quasar virtual scroll event. */
interface VirtualScrollPayload {
  /** The index of the last visible item. */
  to: number;
  /** Reference to the virtual scroll component. */
  ref: { /** Refreshes the virtual scroll. */ refresh: () => void } | null;
}

const props = withDefaults(
  defineProps<AttributeFieldProps<FieldDynamicListSettings>>(),
  {
    ignoreRules: false,
  }
);
const emits = defineEmits<EntityAttributeFieldOutputs>();

const { ui } = useUiDesign();
const { translateOrDefault, t } = useScopedI18n(
  `${props.i18nScope}.fields.${props.definition.name}`
);

const allOptions = ref<string[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
let currentPage = 0;
let hasMore = true;

const pageSize = computed(() => props.definition.inputSettings?.size ?? 20);

const localValue = ref(props.entity[props.definition.name] ?? null);

const uiProps = ui<LinidQSelectProps>(
  `${props.uiNamespace}.${props.definition.name}`,
  'q-select'
);

const rules = computed(() =>
  !props.ignoreRules && !props.definition.inputSettings?.ignoreRules
    ? useQuasarRules(props.instanceId, props.definition, [])
    : []
);

const route = computed(() => props.definition.inputSettings?.route);

onMounted(async () => {
  if (!route.value) {
    error.value = t('validation.dynamicList.missingRoute');
    return;
  }
  await fetchPage();
});

/**
 * Fetches the next page of options from the backend.
 */
async function fetchPage() {
  if (!route.value || isLoading.value || !hasMore) {
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const page = await getDynamicListPage(route.value, {
      page: currentPage,
      size: pageSize.value,
    });
    if (page.content.length > 0) {
      allOptions.value.push(...page.content);
    }
    hasMore = !page.last;
    currentPage++;
  } catch {
    error.value = t('validation.dynamicList.fetchError');
  } finally {
    isLoading.value = false;
  }
}

/**
 * Triggered when the virtual scroll reaches the end of the loaded options.
 * Loads the next page if more data is available.
 * @param payload - The virtual scroll event payload.
 */
function onVirtualScroll(payload: VirtualScrollPayload) {
  const lastIndex = allOptions.value.length - 1;
  if (payload.to < lastIndex) {
    return;
  }
  fetchPage();
}

/**
 * Emits an 'update:entity' event with the updated entity object when the selection changes.
 */
function updateValue() {
  emits('update:entity', {
    ...props.entity,
    [props.definition.name]: localValue.value,
  });
}
</script>
