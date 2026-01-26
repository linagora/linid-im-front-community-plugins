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
  <component
    :is="field"
    v-if="field"
    class="entity-attribute-field"
    :ui-namespace="`${uiNamespace}.EntityAttributeField`"
    :instance-id="instanceId"
    :definition="definition"
    :entity="entity"
    :ignore-rules="ignoreRules"
    @update:entity="updateEntity"
  />
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { computed, defineAsyncComponent } from 'vue';
import type {
  AttributeFieldProps,
  EntityAttributeFieldOutputs,
} from '../../types/field';

const props = withDefaults(defineProps<AttributeFieldProps>(), {
  ignoreRules: false,
});
const emits = defineEmits<EntityAttributeFieldOutputs>();

const fieldTypes: Record<string, Component> = {
  Boolean: defineAsyncComponent(
    () => import('./EntityAttributeBooleanField.vue')
  ),
  Number: defineAsyncComponent(
    () => import('./EntityAttributeNumberField.vue')
  ),
  Text: defineAsyncComponent(() => import('./EntityAttributeTextField.vue')),
  Date: defineAsyncComponent(() => import('./EntityAttributeDateField.vue')),
};

const field = computed<Component | undefined>(
  () => fieldTypes[props.definition.input]
);

/**
 * Emits an 'update:entity' event with the updated entity object when the toggle changes.
 * Updates the value of the attribute in the entity using the local reactive value.
 * @param entity - The updated entity object containing the new attribute values.
 */
function updateEntity(entity: Record<string, unknown>) {
  emits('update:entity', entity);
}
</script>

<style scoped></style>
