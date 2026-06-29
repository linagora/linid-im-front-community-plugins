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
  <div
    class="linid-favorite-panel"
    data-cy="linid-favorite-panel"
  >
    <div class="text-weight-bold q-pa-sm linid-favorite-panel--title">
      <q-icon
        v-if="uiProps.titleIcon?.name"
        v-bind="uiProps.titleIcon"
      />
      {{ t('title') }}
    </div>

    <div class="q-gutter-sm q-pa-sm linid-favorite-panel--action-buttons">
      <q-btn
        v-bind="uiProps.createButton"
        :label="t('createFavorite')"
        :data-cy="`button_create`"
        @click="emit('create')"
      />
      <q-btn
        v-bind="uiProps.overrideButton"
        :label="t('overrideFavorite')"
        :disable="favorites.length === 0"
        :data-cy="`button_override`"
        @click="emit('override')"
      />
    </div>

    <q-separator v-bind="uiProps.titleSeparator" />

    <div class="row no-wrap linid-favorite-panel--content">
      <q-list
        v-bind="uiProps.list"
        class="col-auto linid-favorite-panel--list"
        data-cy="linid-favorite-panel_list"
      >
        <q-item
          v-for="(favorite, index) in favorites"
          :key="`fav_${index}`"
          v-bind="uiProps.item"
          clickable
          :data-cy="`linid-favorite-panel_item-${index}`"
          @click="emit('apply', favorite)"
        >
          <q-item-section
            v-if="uiProps.icon?.name"
            v-bind="uiProps.iconSection"
            avatar
          >
            <q-icon v-bind="uiProps.icon" />
          </q-item-section>
          <q-item-section v-bind="uiProps.labelSection">
            {{ favorite.label }}
          </q-item-section>
          <q-item-section v-bind="uiProps.deleteSection">
            <q-btn
              v-bind="uiProps.deleteButton"
              :label="translateOrDefault('', 'deleteButton')"
              class="delete-button"
              :data-cy="`button_delete_${index}`"
              @click.stop="emit('delete', favorite)"
            />
          </q-item-section>
        </q-item>

        <q-item
          v-if="favorites.length === 0"
          v-bind="uiProps.item"
        >
          <q-item-section
            v-if="uiProps.noDataIcon?.name"
            v-bind="uiProps.noDataIconSection"
            avatar
          >
            <q-icon v-bind="uiProps.noDataIcon" />
          </q-item-section>
          <q-item-section v-bind="uiProps.noDataLabelSection">
            {{ t('noData') }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQIconProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQSeparatorProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import type {
  LinidFavoritePanelOutputs,
  LinidFavoritePanelProps,
  LinidFavoritePanelUIProps,
} from '../../types/linidFavoritePanel';

const props = defineProps<LinidFavoritePanelProps>();
const emit = defineEmits<LinidFavoritePanelOutputs>();

const { t, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.LinidFavoritePanel`
);
const { ui } = useUiDesign();

const localUiNamespace = `${props.uiNamespace}.linid-favorite-panel`;
const headerUiNamespace = `${localUiNamespace}.header`;
const contentUiNamespace = `${localUiNamespace}.content`;

const uiProps = computed<LinidFavoritePanelUIProps>(() => ({
  titleIcon: ui<LinidQIconProps>(headerUiNamespace, 'q-icon'),
  titleSeparator: ui<LinidQSeparatorProps>(headerUiNamespace, 'q-separator'),
  list: ui<LinidQListProps>(contentUiNamespace, 'q-list'),
  item: ui<LinidQItemProps>(contentUiNamespace, 'q-item'),
  iconSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.icon-section`,
    'q-item-section'
  ),
  icon: ui<LinidQIconProps>(`${contentUiNamespace}.icon-section`, 'q-icon'),
  labelSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.label-section`,
    'q-item-section'
  ),
  noDataIconSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.no-data-icon-section`,
    'q-item-section'
  ),
  noDataIcon: ui<LinidQIconProps>(
    `${contentUiNamespace}.no-data-icon-section`,
    'q-icon'
  ),
  noDataLabelSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.no-data-label-section`,
    'q-item-section'
  ),
  deleteSection: ui<LinidQItemSectionProps>(
    `${contentUiNamespace}.delete-section`,
    'q-item-section'
  ),
  deleteButton: ui<LinidQBtnProps>(
    `${contentUiNamespace}.delete-section`,
    'q-btn'
  ),
  createButton: ui<LinidQBtnProps>(
    `${contentUiNamespace}.create-button`,
    'q-btn'
  ),
  overrideButton: ui<LinidQBtnProps>(
    `${contentUiNamespace}.override-button`,
    'q-btn'
  ),
}));
</script>

<style></style>
