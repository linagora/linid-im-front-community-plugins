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
  <div class="linid-smart-filter">
    <q-field
      v-bind="uiProps.field"
      class="linid-smart-filter--field"
      data-cy="linid-smart-filter-field"
      :label="translateOrDefault('', 'label')"
      :hint="translateOrDefault('', 'hint')"
      :prefix="translateOrDefault('', 'prefix')"
      :suffix="translateOrDefault('', 'suffix')"
    >
      <template #prepend>
        <q-icon
          name="search"
          v-bind="uiProps.iconSearch"
        />
      </template>

      <template #append>
        <q-icon
          v-if="!isFilterMenuOpen"
          name="arrow_drop_down"
          v-bind="uiProps.iconMenuOpen"
        />
        <q-icon
          v-else
          name="arrow_drop_up"
          v-bind="uiProps.iconMenuClose"
        />
      </template>
      <q-menu
        v-model="isFilterMenuOpen"
        class="linid-smart-filter--menu"
        data-cy="linid-smart-filter-menu"
        v-bind="uiProps.menu"
      >
        <span>Work in progress</span>
      </q-menu>
    </q-field>
  </div>
  <!-- v8 ignore stop -->
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { LinidSmartFilterProps } from '../../types/smartFilter';
import type {
  LinidQFieldProps,
  LinidQIconProps,
  LinidQMenuProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';

const props = defineProps<LinidSmartFilterProps>();

const localUiNamespace = `${props.uiNamespace}.linid-smart-filter`;
const { ui } = useUiDesign();
const localI18nScope = `${props.i18nScope}.LinidSmartFilter`;
const { translateOrDefault } = useScopedI18n(localI18nScope);
const isFilterMenuOpen = ref(false);

const uiProps = {
  field: ui<LinidQFieldProps>(`${localUiNamespace}`, 'q-field'),
  menu: ui<LinidQMenuProps>(`${localUiNamespace}`, 'q-menu'),
  iconSearch: ui<LinidQIconProps>(`${localUiNamespace}.iconSearch`, 'q-icon'),
  iconMenuClose: ui<LinidQIconProps>(
    `${localUiNamespace}.iconMenuClose`,
    'q-icon'
  ),
  iconMenuOpen: ui<LinidQIconProps>(
    `${localUiNamespace}.iconMenuOpen`,
    'q-icon'
  ),
};
</script>

<style lang="scss" scoped></style>
