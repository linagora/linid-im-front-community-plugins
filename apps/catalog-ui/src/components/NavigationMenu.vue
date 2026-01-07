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
  <q-tabs
    v-bind="uiProps.tabs"
    data-cy="navigationMenu"
  >
    <q-route-tab
      v-for="item in props.items"
      v-bind="uiProps.routes[item.id]"
      :key="item.id"
      :to="item.path"
      :label="item.label"
      :exact="true"
      :data-cy="`item_${item.id}`"
    />
  </q-tabs>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQRouteTabProps,
  LinidQTabsProps,
} from '@linagora/linid-im-front-corelib';
import { useUiDesign } from '@linagora/linid-im-front-corelib';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import type {
  NavigationMenuOutputs,
  NavigationMenuProps,
  NavigationMenuUIProps,
} from '../types/navigationMenu';

const props = defineProps<NavigationMenuProps>();

const emit = defineEmits<NavigationMenuOutputs>();

const { ui } = useUiDesign();
const route = useRoute();

const uiProps: NavigationMenuUIProps = {
  tabs: ui<LinidQTabsProps>(props.uiNamespace, 'q-tabs'),
  routes: props.items.reduce((acc, item) => {
    return {
      ...acc,
      [item.id]: ui<LinidQRouteTabProps>(
        `${props.uiNamespace}.navigationItems.route-${item.id}`,
        'q-route-tab'
      ),
    };
  }, {}),
};

/**
 * Watches for route changes and emits the active item.
 */
watch(
  () => route.path,
  (newPath) => {
    const selectedItem = props.items.find((item) => item.path === newPath);
    if (selectedItem) {
      emit('update:activeItem', selectedItem);
    }
  },
  { immediate: true }
);
</script>
