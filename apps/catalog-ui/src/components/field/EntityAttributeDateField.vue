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
  LinidQBtnProps,
  LinidQDateProps,
  LinidQInputProps,
} from '@linagora/linid-im-front-corelib';
import {
  useQuasarRules,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref } from 'vue';
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

const { ui } = useUiDesign();

const localValue = ref(props.entity[props.definition.name] ?? null);

const uiProps = {
  input: ui<LinidQInputProps>(
    `${props.uiNamespace}.${props.definition.name}`,
    'q-input'
  ),
  icon: ui<LinidQInputProps>(
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

const { t, translateOrDefault } = useScopedI18n(
  `${props.instanceId}.fields.${props.definition.name}`
);

const rules = computed(() =>
  !props.ignoreRules && !props.definition.inputSettings?.ignoreRules
    ? useQuasarRules(props.instanceId, props.definition, [])
    : []
);

/**
 * Emits an 'update:entity' event with the updated entity object when the toggle changes.
 * Updates the value of the attribute in the entity using the local reactive value.
 */
function updateValue() {
  emits('update:entity', {
    ...props.entity,
    [props.definition.name]: localValue.value,
  });
}
</script>
