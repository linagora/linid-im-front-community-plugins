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
  <q-page
    class="row justify-center q-pa-md user-details-page"
    data-cy="user-details-page"
  >
    <div class="col-12 col-md-10 col-lg-8">
      <h3 class="user-details-page--title">{{ t('title') }}</h3>

      <component
        :is="entityDetailsCard"
        v-if="entityDetailsCard"
        :entity="user || {}"
        :field-order="options.fieldOrder"
        :show-remaining-fields="options.showRemainingFields || false"
        :is-loading="isLoading"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        class="q-mb-md"
        data-cy="user-details-card"
      />

      <component
        :is="buttonsCard"
        v-if="buttonsCard"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        :show-confirm-button="false"
        @cancel="goBack"
      >
        <template #append-buttons>
          <q-btn
            v-bind="uiProps.editButton"
            class="buttons-card--edit-button"
            :label="t('edit')"
            data-cy="button_edit"
            @click="goToEdit"
          />
        </template>
      </component>
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQBtnProps } from '@linagora/linid-im-front-corelib';
import {
  getEntityById,
  getModuleHostConfiguration,
  loadAsyncComponent,
  useNotify,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ModuleUsersOptions } from '../types/moduleUsers';

const route = useRoute();
const router = useRouter();
const parentPath = computed(() => route.matched[0]?.path);
const instanceId = computed<string>(() => route.meta.instanceId as string);
const userId = computed(() => route.params.id as string);
const i18nScope = computed<string>(() => `${instanceId.value}.UserDetailsPage`);
const uiNamespace = computed(() => `${instanceId.value}.user-details-page`);
const options = computed(
  () =>
    getModuleHostConfiguration<ModuleUsersOptions>(instanceId.value)!.options
);

const { t } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();
const { ui } = useUiDesign();

const user = ref<Record<string, unknown> | null>(null);
const isLoading = ref<boolean>(false);
const entityDetailsCard = loadAsyncComponent('catalogUI/EntityDetailsCard');
const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');

const uiProps = computed(() => ({
  editButton: ui<LinidQBtnProps>(`${uiNamespace.value}.edit-button`, 'q-btn'),
}));

/**
 * Loads the user data based on the userId.
 */
async function loadData() {
  isLoading.value = true;
  try {
    user.value = await getEntityById<Record<string, unknown>>(
      instanceId.value,
      userId.value
    );
  } catch {
    Notify({
      type: 'negative',
      message: t('error'),
    });
    goBack();
  } finally {
    isLoading.value = false;
  }
}

/**
 * Navigates to the edit page for the current user.
 */
function goToEdit() {
  router.push(`${parentPath.value}/${userId.value}/edit`);
}

/**
 * Navigates back to the users list.
 */
function goBack() {
  router.push(`${parentPath.value}`);
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped></style>
