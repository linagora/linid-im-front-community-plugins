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
    class="entity-attribute-list-field"
    v-bind="uiProps"
    :disable="definition.inputSettings?.disable || false"
    :label="translateOrDefault('', 'label')"
    :hint="translateOrDefault('', 'hint')"
    :prefix="translateOrDefault('', 'prefix')"
    :suffix="translateOrDefault('', 'suffix')"
    :options="options"
    option-value="value"
    option-label="value"
    emit-value
    map-options
    :rules="rules"
    @update:model-value="updateValue"
  />
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import {
  type LinidQSelectProps,
  useQuasarRules,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onMounted, ref, watch } from 'vue';
import type {
  AttributeFieldProps,
  EntityAttributeFieldOutputs,
  FieldListSettings,
  FieldListValue,
} from '../../types/field';

const props = withDefaults(
  defineProps<AttributeFieldProps<FieldListSettings>>(),
  {
    ignoreRules: false,
  }
);
const emits = defineEmits<EntityAttributeFieldOutputs>();
const localI18nScope = `${props.i18nScope}.fields.${props.definition.name}`;

const { ui } = useUiDesign();

const normalizedValues: FieldListValue[] = (() => {
  const values = props.definition.inputSettings?.values;
  if (!values?.length) {
    return [];
  }
  if (typeof values[0] === 'string') {
    return (values as string[]).map((v) => ({ value: v }));
  }
  return values as FieldListValue[];
})();

const defaultValue =
  props.definition.inputSettings?.defaultValue &&
  normalizedValues.some(
    (opt) => opt.value === props.definition.inputSettings?.defaultValue
  )
    ? props.definition.inputSettings.defaultValue
    : null;

const localValue = ref(
  props.entity[props.definition.name] ?? defaultValue ?? null
);

const options = computed((): FieldListValue[] => {
  if (!normalizedValues.length) {
    return normalizedValues;
  }
  return normalizedValues.filter((entry) => {
    if (!entry.filterContext) {
      return true;
    }
    return Object.entries(entry.filterContext).every(
      ([fieldName, accepted]) => {
        const currentValue = props.entity[fieldName];
        if (currentValue == null) {
          return true;
        }
        const acceptedArray: string[] = Array.isArray(accepted)
          ? accepted
          : [accepted];
        return acceptedArray.includes(currentValue as string);
      }
    );
  });
});

const uiProps = ui<LinidQSelectProps>(
  `${props.uiNamespace}.${props.definition.name}`,
  'q-select'
);
const { translateOrDefault } = useScopedI18n(localI18nScope);

const rules = computed(() =>
  !props.ignoreRules && !props.definition.inputSettings?.ignoreRules
    ? useQuasarRules(props.instanceId, props.definition, [], localI18nScope)
    : []
);

watch(
  () => props.entity[props.definition.name],
  (newValue) => {
    localValue.value = newValue ?? defaultValue ?? null;
  }
);

watch(options, (newOptions) => {
  if (
    localValue.value !== null &&
    !newOptions.some((opt) => opt.value === (localValue.value as string))
  ) {
    localValue.value = null;
    updateValue();
  }
});

/**
 * Emits an 'update:entity' event with the updated entity object.
 * Called on user selection and when the current value becomes invalid after filtering.
 */
function updateValue() {
  emits('update:entity', {
    ...props.entity,
    [props.definition.name]: localValue.value,
  });
}

onMounted(() => {
  if (localValue.value != null && props.entity[props.definition.name] == null) {
    updateValue();
  }
});
</script>
