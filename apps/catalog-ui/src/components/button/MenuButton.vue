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
  <q-btn
    v-bind="uiProps.button"
    :label="translateOrDefault('', 'title')"
    :disable="disable"
    class="menu-button"
    data-cy="menu-button"
  >
    <q-menu
      auto-close
      v-bind="uiProps.menu"
      class="menu-button--menu"
      data-cy="menu-button_menu"
    >
      <q-list
        v-bind="uiProps.list"
        class="menu-button--list"
      >
        <q-item
          v-for="item in items"
          :key="item"
          v-bind="uiProps.item"
          :clickable="false"
          class="q-pa-none menu-button--item"
          :data-cy="`menu-button_item_${item}`"
        >
          <slot
            v-if="!zone"
            :name="item"
          />
          <LinidZoneRenderer
            v-else
            :zone="`${localUiNamespace}.${item}`"
            :entity="entity"
            :parent="parent"
            :instance-id="instanceId"
            :ui-namespace="`${localUiNamespace}.${item}`"
            :i18n-scope="`${localI18nScope}.${item}`"
          />
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQItemProps,
  LinidQListProps,
  LinidQMenuProps,
} from '@linagora/linid-im-front-corelib';
import {
  LinidZoneRenderer,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import type { MenuButtonProps } from '../../types/menuButton';

const props = withDefaults(defineProps<MenuButtonProps>(), {
  zone: false,
  disable: false,
});

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix ? `${prefix}.MenuButton` : 'MenuButton';
});
const localUiNamespace = computed(() => `${props.uiNamespace}.menu-button`);

const { translateOrDefault } = useScopedI18n(localI18nScope.value);
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  button: ui<LinidQBtnProps>(localUiNamespace.value, 'q-btn'),
  menu: ui<LinidQMenuProps>(localUiNamespace.value, 'q-menu'),
  list: ui<LinidQListProps>(localUiNamespace.value, 'q-list'),
  item: ui<LinidQItemProps>(localUiNamespace.value, 'q-item'),
}));
</script>

<style scoped>
/* Every hosted action button fills its row, its content aligned by its own design. */
.menu-button--item :deep(.q-btn) {
  display: flex;
  width: 100%;
}
</style>
