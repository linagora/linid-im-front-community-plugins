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
  <q-input
    v-model="localValue"
    :data-cy="`field_${definition.name}`"
    class="entity-attribute-date-field"
    type="text"
    v-bind="uiProps.input"
    :disable="definition.inputSettings?.disable || false"
    :label="translateOrDefault('', 'label')"
    :hint="translateOrDefault('', 'hint')"
    :prefix="translateOrDefault('', 'prefix')"
    :suffix="translateOrDefault('', 'suffix')"
    :rules="rules"
    @update:model-value="updateValue"
  >
    <template #append>
      <q-icon
        name="event"
        class="cursor-pointer"
        v-bind="uiProps.icon"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="localValue"
            :data-cy="`field_${definition.name}_datepicker`"
            :mask
            :options
            v-bind="uiProps.date"
            @update:model-value="updateValue"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                :label="t('close')"
                v-bind="uiProps.btn"
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidAttributeConfiguration,
  LinidQBtnProps,
  LinidQDateProps,
  LinidQIconProps,
  LinidQInputProps,
} from '@linagora/linid-im-front-corelib';
import {
  getI18nInstance,
  QDATE_DEFAULT_MASK,
  useDayjs,
  useNunjucks,
  useQuasarDate,
  useQuasarFieldValidation,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { Dayjs } from 'dayjs';
import type { ValidationRule } from 'quasar';
import { computed, ref, watch } from 'vue';
import type {
  AttributeFieldProps,
  EntityAttributeFieldOutputs,
  FieldDateSettings,
} from '../../types/field';

const props = withDefaults(
  defineProps<AttributeFieldProps<FieldDateSettings>>(),
  {
    ignoreRules: false,
  }
);
const emits = defineEmits<EntityAttributeFieldOutputs>();

const localI18nScope = `${props.i18nScope}.fields.${props.definition.name}`;

const { t, translateOrDefault } = useScopedI18n(localI18nScope);
const { ui } = useUiDesign();
const { render } = useNunjucks();
const { minDate, maxDate } = useDayjs();
const { toQDateFormat, formatQDate } = useQuasarDate();
const {
  required,
  validDate,
  afterDate,
  beforeDate,
  fromDate,
  upToDate,
  validateFromApi,
} = useQuasarFieldValidation(localI18nScope);
const globalT = getI18nInstance().global.t;

const localValue = ref(props.entity[props.definition.name] ?? null);

const uiProps = {
  input: ui<LinidQInputProps>(
    `${props.uiNamespace}.${props.definition.name}`,
    'q-input'
  ),
  icon: ui<LinidQIconProps>(
    `${props.uiNamespace}.${props.definition.name}`,
    'q-icon'
  ),
  btn: ui<LinidQBtnProps>(
    `${props.uiNamespace}.${props.definition.name}`,
    'q-btn'
  ),
  date: ui<LinidQDateProps>(
    `${props.uiNamespace}.${props.definition.name}`,
    'q-date'
  ),
};

watch(
  () => props.entity[props.definition.name],
  (newValue) => {
    localValue.value = newValue ?? null;
  }
);

const mask = computed(() => {
  const maskI18NKey = props.definition.inputSettings?.maskI18NKey;
  if (getI18nInstance().global.te(maskI18NKey)) {
    return globalT(maskI18NKey);
  }
  return props.definition.inputSettings?.mask || QDATE_DEFAULT_MASK;
});

const renderedDefinition = computed(() => {
  const context = {
    entity: props.entity,
    t: (key: string) => globalT(key),
    today: formatQDate(new Date(), mask.value),
  };

  return render<LinidAttributeConfiguration<FieldDateSettings>>(
    props.definition,
    context
  );
});

/**
 * Computes a reference date from a date value and an aggregation function.
 * If the value is empty or nullish, returns null. Otherwise, applies the aggregation function
 * to the resolved array of dates and formats the result as a QDate string.
 * @param value - A date string, an array of date strings, or undefined.
 * @param aggregate - A function that takes an array of date strings and returns a single
 * Dayjs instance representing the aggregated value (e.g., minimum or maximum), or null if
 * the aggregation yields no result.
 * @returns A string representing the computed reference date in QDate format, or null if
 * the input is empty.
 */
function computeRef(
  value: string | string[] | undefined,
  aggregate: (d: string[], format?: string) => Dayjs | null
): string | null {
  if (value == null || value === '') {
    return null;
  }

  const dates = (Array.isArray(value) ? value : [value]).filter(
    (d) => d.trim() !== ''
  );
  if (dates.length === 0) {
    return null;
  }

  const result = aggregate(dates, mask.value);

  return result != null ? formatQDate(result.toISOString(), mask.value) : null;
}

const dateConstraints = computed(() => {
  const config = renderedDefinition.value.inputSettings?.options;
  if (!config) {
    return null;
  }

  return [
    {
      dateRef: computeRef(config.afterDate, maxDate),
      validator: afterDate,
      predicate: (ref: string) => (date: string) => date > ref,
    },
    {
      dateRef: computeRef(config.beforeDate, minDate),
      validator: beforeDate,
      predicate: (ref: string) => (date: string) => date < ref,
    },
    {
      dateRef: computeRef(config.fromDate, maxDate),
      validator: fromDate,
      predicate: (ref: string) => (date: string) => date >= ref,
    },
    {
      dateRef: computeRef(config.upToDate, minDate),
      validator: upToDate,
      predicate: (ref: string) => (date: string) => date <= ref,
    },
  ].filter((c) => c.dateRef != null);
});

const rules = computed(() => {
  if (props.ignoreRules || props.definition.inputSettings?.ignoreRules) {
    return [];
  }

  const rules = [validDate(mask.value)];

  if (props.definition.required) {
    rules.unshift(required);
  }

  const rulesFromConstraints: ValidationRule[] =
    dateConstraints.value?.map(({ dateRef, validator }) =>
      validator(dateRef as string, mask.value)
    ) ?? [];

  if (props.definition.hasValidations) {
    rulesFromConstraints.push(
      validateFromApi(props.instanceId, props.definition.name)
    );
  }

  return [...rules, ...rulesFromConstraints];
});

const options = computed(() => {
  const predicates =
    dateConstraints.value?.map(({ dateRef, predicate }) => {
      const ref = toQDateFormat(dateRef as string, mask.value);
      return predicate(ref);
    }) ?? [];

  return predicates.length > 0
    ? (date: string) => predicates.every((predicate) => predicate(date))
    : undefined;
});

/**
 * Emits an 'update:entity' event with the updated entity object when date value changes.
 * Updates the value of the attribute in the entity using the local reactive value.
 */
function updateValue() {
  emits('update:entity', {
    ...props.entity,
    [props.definition.name]: localValue.value,
  });
}
</script>
