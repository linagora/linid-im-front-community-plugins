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
  <q-btn-dropdown
    v-bind="uiProps.dropdownBtn"
    :label="t('title')"
    class="dropdown-button"
    data-cy="dropdown-button"
  >
    <q-list
      v-bind="uiProps.list"
      class="dropdown-button--list"
    >
      <template
        v-for="{ item, ui: itemUI } in itemsWithUI"
        :key="item.key"
      >
        <q-item
          v-if="!item.children?.length"
          v-close-popup="item.clickable"
          v-bind="itemUI.item"
          :clickable="item.clickable"
          :data-cy="`dropdown-button_item_${item.key}`"
          class="dropdown-button--item"
          @click="emit('itemClick', { key: item.key })"
        >
          <q-item-section
            v-if="itemUI.iconSection.avatar"
            v-bind="itemUI.iconSection"
            class="dropdown-button--item--icon-section"
          >
            <q-icon v-bind="itemUI.icon" />
          </q-item-section>
          <q-item-section
            v-bind="itemUI.labelSection"
            class="dropdown-button--item--label-section"
          >
            <q-item-label
              v-bind="itemUI.label"
              class="dropdown-button--item--label"
              >{{ t(item.key) }}</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          v-else
          v-bind="itemUI.item"
          :clickable="item.clickable"
          :data-cy="`dropdown-button_item_${item.key}`"
          class="dropdown-button--item"
        >
          <q-item-section
            v-if="itemUI.iconSection.avatar"
            v-bind="itemUI.iconSection"
            class="dropdown-button--item--icon-section"
          >
            <q-icon v-bind="itemUI.icon" />
          </q-item-section>
          <q-item-section
            v-bind="itemUI.labelSection"
            class="dropdown-button--item--label-section"
          >
            <q-item-label
              v-bind="itemUI.label"
              class="dropdown-button--item--label"
              >{{ t(`${item.key}.title`) }}</q-item-label
            >
          </q-item-section>
          <q-item-section
            v-bind="uiProps.menuTrigger.iconSection"
            class="dropdown-button--sub-menu--trigger-section"
          >
            <q-icon v-bind="uiProps.menuTrigger.icon" />
          </q-item-section>
          <q-menu
            v-if="item.clickable"
            v-bind="uiProps.menu"
            class="dropdown-button--sub-menu"
          >
            <q-list
              v-bind="uiProps.list"
              class="dropdown-button--list"
            >
              <q-item
                v-for="(childUI, childKey) in itemUI.children"
                v-bind="childUI.item"
                :key="childKey"
                v-close-popup
                clickable
                :data-cy="`dropdown-button_item_${item.key}_${childKey}`"
                class="dropdown-button--item"
                @click="emit('itemClick', { key: `${item.key}.${childKey}` })"
              >
                <q-item-section
                  v-if="childUI.iconSection.avatar"
                  v-bind="childUI.iconSection"
                  class="dropdown-button--item--icon-section"
                >
                  <q-icon v-bind="childUI.icon" />
                </q-item-section>
                <q-item-section
                  v-bind="childUI.labelSection"
                  class="dropdown-button--item--label-section"
                >
                  <q-item-label
                    v-bind="childUI.label"
                    class="dropdown-button--item--label"
                  >
                    {{ t(`${item.key}.${childKey}`) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </template>
    </q-list>
  </q-btn-dropdown>
  <!-- v8 ignore stop -->
</template>

<script lang="ts" setup>
import type {
  LinidQBtnDropdownProps,
  LinidQIconProps,
  LinidQItemLabelProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQMenuProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import type {
  DropdownButtonOutputs,
  DropdownButtonProps,
  MenuItemUIProps,
  ParentMenuItemUIProps,
} from '../../types/dropdownButton';

const props = defineProps<DropdownButtonProps>();

const emit = defineEmits<DropdownButtonOutputs>();

const localUiNamespace = `${props.uiNamespace}.dropdown-button`;
const { t } = useScopedI18n(`${props.i18nScope}.DropdownButton`);
const { ui } = useUiDesign();

const uiProps = computed(() => {
  return {
    dropdownBtn: ui<LinidQBtnDropdownProps>(localUiNamespace, 'q-btn-dropdown'),
    list: ui<LinidQListProps>(localUiNamespace, 'q-list'),
    menu: ui<LinidQMenuProps>(localUiNamespace, 'q-menu'),
    menuTrigger: {
      iconSection: ui<LinidQItemSectionProps>(
        `${localUiNamespace}.menu-trigger`,
        'q-item-section'
      ),
      icon: ui<LinidQIconProps>(`${localUiNamespace}.menu-trigger`, 'q-icon'),
    },
    items: Object.fromEntries<ParentMenuItemUIProps>(
      props.items.map((item): [string, ParentMenuItemUIProps] => {
        const namespace = `${localUiNamespace}.items.${item.key}`;
        return [
          item.key,
          {
            ...buildMenuItemUIProps(namespace),
            children: item.children?.length
              ? Object.fromEntries(
                  item.children.map((childKey) => [
                    childKey,
                    buildMenuItemUIProps(`${namespace}.children.${childKey}`),
                  ])
                )
              : undefined,
          },
        ];
      })
    ),
  };
});

const itemsWithUI = computed(() =>
  props.items.map((item) => ({
    item,
    ui: uiProps.value.items[item.key],
  }))
);

/**
 * Builds the UI props for a menu item based on the provided namespace.
 * @param namespace - The namespace to use for the UI props.
 * @returns An object containing the UI props for the menu item.
 */
function buildMenuItemUIProps(namespace: string): MenuItemUIProps {
  return {
    item: ui<LinidQItemProps>(namespace, 'q-item'),
    iconSection: ui<LinidQItemSectionProps>(
      `${namespace}.icon`,
      'q-item-section'
    ),
    icon: ui<LinidQIconProps>(`${namespace}.icon`, 'q-icon'),
    labelSection: ui<LinidQItemSectionProps>(
      `${namespace}.label`,
      'q-item-section'
    ),
    label: ui<LinidQItemLabelProps>(`${namespace}.label`, 'q-item-label'),
  };
}
</script>
