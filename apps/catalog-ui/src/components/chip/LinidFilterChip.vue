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
  <q-chip
    removable
    v-bind="uiProps.chip"
    :class="['linid-filter-chip', `linid-filter-chip--${filter.name}`]"
    :data-cy="`linid-filter-chip_${filter.name}`"
    @remove="emits('remove', filter.id)"
  >
    <q-avatar
      v-bind="uiProps.avatar"
      class="q-px-md linid-filter-chip--avatar"
    >
      {{ translateOrDefault(filter.name, 'type') }}
    </q-avatar>
    <template
      v-for="(value, index) in filter.values"
      :key="`value_${index}`"
    >
      <em
        v-if="index > 0"
        class="q-mx-sm linid-filter-chip--separator"
      >
        {{ t('separator') }}
      </em>
      <span class="linid-filter-chip--value">
        {{ value.value }}
      </span>
    </template>
  </q-chip>
</template>

<script setup lang="ts">
import type {
  LinidFilterChipOutputs,
  LinidFilterChipProps,
} from '../../types/linidFilterChip';
import type {
  LinidQAvatarProps,
  LinidQChipProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';

const props = defineProps<LinidFilterChipProps>();
const emits = defineEmits<LinidFilterChipOutputs>();

const { t, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.LinidFilterChip.${props.filter.name}`
);
const { ui } = useUiDesign();

const localUiNamespace = `${props.uiNamespace}.linid-filter-chip.${props.filter.name}`;

const uiProps = {
  avatar: ui<LinidQAvatarProps>(localUiNamespace, 'q-avatar'),
  chip: ui<LinidQChipProps>(localUiNamespace, 'q-chip'),
};
</script>

<style scoped lang="scss">
em {
  font-style: italic;
  color: #888;
}
.q-avatar {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  width: auto;
}
</style>
