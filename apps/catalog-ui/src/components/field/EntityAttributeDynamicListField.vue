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
    :disable="isDisabled"
    :label="translateOrDefault('', 'label')"
    :hint="translateOrDefault('', 'hint')"
    :prefix="translateOrDefault('', 'prefix')"
    :suffix="translateOrDefault('', 'suffix')"
    :options="allOptions"
    option-label="label"
    option-value="value"
    emit-value
    map-options
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
  getNestedValue,
  type LinidQSelectProps,
  type Page,
  setNestedValue,
  useNunjucks,
  useQuasarRules,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref, watch } from 'vue';
import { getDynamicListPage } from '../../services/dynamicListService';
import type {
  AttributeFieldProps,
  DynamicListElement,
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
const localI18nScope = `${props.i18nScope}.fields.${props.definition.name}`;

const { ui } = useUiDesign();
const { translateOrDefault, t } = useScopedI18n(localI18nScope);
const { renderString } = useNunjucks();

const allOptions = ref<DynamicListElement[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
let currentPage = 0;
let hasMore = true;
let loadedRoute: string | null = null;
/** Identifies the load in progress, so that responses of the ones it replaced can be dropped. */
let currentLoadId = 0;

const pageSize = computed(() => props.definition.inputSettings?.size ?? 20);

const localValue = ref(
  getNestedValue(props.entity, props.definition.name) ?? null
);

const uiProps = ui<LinidQSelectProps>(
  `${props.uiNamespace}.${props.definition.name}`,
  'q-select'
);

const rules = computed(() =>
  !props.ignoreRules && !props.definition.inputSettings?.ignoreRules
    ? useQuasarRules(
        props.instanceId,
        props.definition,
        ['unique'],
        localI18nScope
      )
    : []
);

/** The context the route template and the dependency paths are both resolved against. */
const renderContext = computed(() => ({ entity: props.entity }));

/** Whether every declared dependency holds a non-empty value. */
const areDependenciesSatisfied = computed(() => {
  const routeDependencies =
    props.definition.inputSettings?.routeDependencies ?? [];

  const dependencyValues = routeDependencies.map((dependency) =>
    getNestedValue(renderContext.value, dependency)
  );

  return dependencyValues.every(hasValue);
});

const route = computed(() =>
  renderString(props.definition.inputSettings?.route ?? '', renderContext.value)
);

/** Whether the select is non-interactive: either explicitly disabled, or missing a dependency. */
const isDisabled = computed(
  () =>
    props.definition.inputSettings?.disable === true ||
    !areDependenciesSatisfied.value
);

watch(
  () => getNestedValue(props.entity, props.definition.name),
  (newValue) => {
    localValue.value = newValue ?? null;
  }
);

watch(
  [areDependenciesSatisfied, route],
  async ([areSatisfied, renderedRoute]) => {
    if (!areSatisfied) {
      reset();
      return;
    }
    if (!renderedRoute) {
      error.value = t('validation.dynamicList.missingRoute');
      return;
    }
    if (loadedRoute !== null && loadedRoute !== renderedRoute) {
      clearSelection();
    }
    loadedRoute = renderedRoute;
    reset();
    await fetchPage();
    ensurePresetValueInOptions();
  },
  { immediate: true }
);

/**
 * Whether a dependency value is usable to build the route. `null`, `undefined`, blank strings and
 * empty arrays count as missing; every other value, including `0` and `false`, is a value.
 * @param value - The value read at the dependency path.
 * @returns True when the dependency holds a non-empty value.
 */
function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

/**
 * Drops the selected value when the route it was picked from is replaced: a unit chosen under one
 * organization is not a unit of the next one. The entity is updated too, so the form stops carrying
 * a value the field no longer offers, and no placeholder is rebuilt for it.
 */
function clearSelection() {
  if (localValue.value === null) {
    return;
  }
  localValue.value = null;
  updateValue();
}

/**
 * Discards everything that belongs to the previously loaded route: its options, its pagination
 * cursor, and the loading and error states it owns. Starting a new load leaves every request still
 * in flight behind, so their responses are dropped instead of landing in the new list.
 */
function reset() {
  currentLoadId++;
  allOptions.value = [];
  currentPage = 0;
  hasMore = true;
  isLoading.value = false;
  error.value = null;
}

/**
 * Fetches the next page of elements from the backend.
 */
async function fetchPage() {
  const requestedRoute = route.value;
  if (
    !requestedRoute ||
    !areDependenciesSatisfied.value ||
    isLoading.value ||
    !hasMore
  ) {
    return;
  }

  const loadId = currentLoadId;
  isLoading.value = true;
  error.value = null;

  let page: Page<DynamicListElement> | undefined;
  try {
    page = await getDynamicListPage(requestedRoute, {
      page: currentPage,
      size: pageSize.value,
    });
  } catch {
    // An absent page reports the failure, once the load is known to still be the current one.
  }

  if (loadId !== currentLoadId) {
    return;
  }

  isLoading.value = false;

  if (!page?.content) {
    error.value = t('validation.dynamicList.fetchError');
    return;
  }

  if (page.content.length > 0) {
    allOptions.value.push(...page.content.map(toOption));
    removePlaceholderIfResolved();
  }
  hasMore = !page.last;
  currentPage++;
}

/**
 * Maps a fetched element to a dropdown option. When the `optionLabel` or `optionValue` settings
 * are configured, they are rendered as Nunjucks templates with the element as context, allowing
 * the field to consume any paginated entity endpoint. Otherwise the element is used as-is.
 * @param element - The element fetched from the backend.
 * @returns The dropdown option.
 */
function toOption(element: DynamicListElement): DynamicListElement {
  const { optionLabel, optionValue } = props.definition.inputSettings ?? {};

  if (!optionLabel && !optionValue) {
    return element;
  }

  const context = element as unknown as Record<string, unknown>;

  return {
    label: optionLabel ? renderString(optionLabel, context) : element.label,
    value: optionValue ? renderString(optionValue, context) : element.value,
  };
}

/**
 * Ensures the entity's preset value is represented in the options list.
 * If the value is not found among loaded options, a placeholder entry is
 * prepended so that q-select can display the value instead of showing
 * an empty or raw string.
 */
function ensurePresetValueInOptions() {
  if (localValue.value == null) {
    return;
  }
  const found = allOptions.value.some(
    (option) => option.value === localValue.value
  );
  if (!found) {
    allOptions.value.unshift({
      label: String(localValue.value),
      value: String(localValue.value),
    });
  }
}

/**
 * Removes the placeholder entry once the real option has been loaded.
 * A placeholder is identified as a duplicate entry where label equals value.
 */
function removePlaceholderIfResolved() {
  if (localValue.value == null) {
    return;
  }
  const matchingEntries = allOptions.value.filter(
    (option) => option.value === localValue.value
  );
  if (matchingEntries.length > 1) {
    const placeholderIndex = allOptions.value.findIndex(
      (option) =>
        option.value === localValue.value &&
        option.label === String(localValue.value)
    );
    if (placeholderIndex !== -1) {
      allOptions.value.splice(placeholderIndex, 1);
    }
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
  emits(
    'update:entity',
    setNestedValue(props.entity, props.definition.name, localValue.value)
  );
}
</script>
