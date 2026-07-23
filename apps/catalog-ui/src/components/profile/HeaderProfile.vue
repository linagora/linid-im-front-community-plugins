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
    v-bind="uiProps.btn"
    icon="account_circle"
    :label="name"
    data-cy="header_profile_button"
  >
    <q-menu
      ref="profileMenu"
      data-cy="header_profile_menu"
    >
      <q-list>
        <q-item data-cy="header_profile_info">
          <q-item-section v-bind="uiProps.itemSection">
            <q-icon name="account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label data-cy="header_profile_name">{{
              name
            }}</q-item-label>
            <q-item-label
              v-bind="uiProps.itemLabel"
              data-cy="header_profile_email"
              >{{ email }}</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item data-cy="header_profile_language">
          <q-item-section>
            <q-item-label>{{ t('language.title') }}</q-item-label>
          </q-item-section>
          <q-item-section class="col-auto">
            <q-select
              v-model="selectedLanguage"
              :options="availableLocales"
              :option-disable="(code) => code === selectedLanguage"
              dense
              borderless
              emit-value
              map-options
              data-cy="header_profile_language_select"
            >
              <template #selected>
                <div class="row items-center no-wrap">
                  <q-img
                    v-bind="uiProps.flag"
                    :src="`/icons/${selectedLanguage}.svg`"
                    class="q-mr-sm"
                  />
                  <span>{{ t(`languages.${selectedLanguage}`) }}</span>
                </div>
              </template>
              <template #option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  :data-cy="`header_profile_language_option_${scope.opt}`"
                >
                  <q-item-section avatar>
                    <q-img
                      v-bind="uiProps.flag"
                      :src="`/icons/${scope.opt}.svg`"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ t(`languages.${scope.opt}`) }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <LinidZoneRenderer :zone="`${localUiNamespace}.menu-items`" />
      </q-list>
    </q-menu>
  </q-btn>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQImgProps,
  LinidQItemLabelProps,
  LinidQItemSectionProps,
} from '@linagora/linid-im-front-corelib';
import {
  LinidZoneRenderer,
  useLinidUserStore,
  useLinidUiStore,
  useUiDesign,
  useScopedI18n,
  changeLocale,
} from '@linagora/linid-im-front-corelib';
import { computed, ref, watch } from 'vue';
import type { CommonComponentProps } from '../../types/common';
import type { QMenu } from 'quasar';

const props = defineProps<CommonComponentProps>();

const { ui } = useUiDesign();
const { t } = useScopedI18n('application');
const userStore = useLinidUserStore();
const uiStore = useLinidUiStore();
const name = computed(() => userStore.user.fullName);
const email = computed(() => userStore.user.email);
const availableLocales = computed(() => uiStore.i18n.languages);

const localUiNamespace = `${props.uiNamespace}.header-profile`;

const uiProps = {
  btn: ui<LinidQBtnProps>(localUiNamespace, 'q-btn'),
  itemSection: ui<LinidQItemSectionProps>(localUiNamespace, 'q-item-section'),
  itemLabel: ui<LinidQItemLabelProps>(localUiNamespace, 'q-item-label'),
  flag: ui<LinidQImgProps>(localUiNamespace, 'q-img'),
};

const selectedLanguage = ref(uiStore.i18n.locale);
const profileMenu = ref<QMenu>();

/**
 * Applies the selected locale and closes the profile menu when the selection changes.
 */
watch(selectedLanguage, (code) => {
  profileMenu.value?.hide();
  changeLocale(code).catch((e) => console.error('changeLocale failed', e));
});
</script>
