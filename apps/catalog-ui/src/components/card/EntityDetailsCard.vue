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
    class="entity-details-card"
    v-bind="uiCardProps"
  >
    <q-card-section class="text-subtitle1 entity-details-card--title">
      {{ t('EntityDetailsCard.title') }}
    </q-card-section>
    <q-card-section>
      <div class="flex entity-details-card--container">
        <information-card
          v-for="field in fieldNames"
          :key="field"
          :label="t(`attributes.${field}`)"
          :value="values[field]"
          :is-loading="isLoading"
          class="q-ma-sm"
          :ui-namespace="`${localUiNamespace}.${field}`"
          :data-cy="`information-card--${field}`"
        />
      </div>
    </q-card-section>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQCardProps } from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import InformationCard from './InformationCard.vue';
import type { EntityDetailsCardProps } from '../../types/entityDetailsCard';

const props = withDefaults(defineProps<EntityDetailsCardProps>(), {
  fieldOrder: () => [],
  showRemainingFields: false,
  isLoading: false,
});

const { ui } = useUiDesign();
const { t } = useScopedI18n(`${props.i18nScope}.EntityDetailsCard`);

const fieldNames = computed<string[]>(() => {
  const entityFieldNames = Object.keys(props.entity);

  const result = [...props.fieldOrder];

  if (props.showRemainingFields) {
    entityFieldNames
      .filter((name) => !result.includes(name))
      .forEach((name) => result.push(name));
  }

  return result;
});

const values = computed<Record<string, string>>(() => {
  return fieldNames.value.reduce<Record<string, string>>((acc, name) => {
    acc[name] = `${props.entity[name] ?? ''}`;
    return acc;
  }, {});
});

const localUiNamespace = `${props.uiNamespace}.entity-details-card`;

const uiCardProps: LinidQCardProps = ui<LinidQCardProps>(
  localUiNamespace,
  'q-card'
);
</script>

<style scoped></style>
