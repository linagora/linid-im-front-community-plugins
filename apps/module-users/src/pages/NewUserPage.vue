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
    class="column items-start justify-start q-pa-md"
    data-cy="newUserPage"
  >
    <h3 data-cy="title">
      {{ t('title') }}
    </h3>
    <component
      :is="buttonsCard"
      v-if="buttonsCard"
      :ui-namespace="`${instanceId}.new-user-page`"
      :i18n-scope="i18nScope"
      :is-loading="isLoading"
      @confirm="save"
      @cancel="cancel"
    />
  </q-page>
  <!-- v8 ignore stop -->
</template>
<script setup lang="ts">
import {
  getModuleHostConfiguration,
  loadAsyncComponent,
  saveEntity,
  useNotify,
  useScopedI18n,
} from '@linagora/linid-im-front-corelib';
import type { Component } from 'vue';
import { computed, ref, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ModuleUsersOptions } from '../types/moduleUsers';

const router = useRouter();
const route = useRoute();

const parentPath = computed(() => route.matched[0]?.path);
const instanceId = computed<string>(() => route.meta.instanceId as string);
const i18nScope = computed<string>(() => `${instanceId.value}.NewUserPage`);

const user = ref<Record<string, unknown>>({});
const isLoading = ref(false);
const buttonsCard = shallowRef<Component | null>(null);

const { t } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();

buttonsCard.value = loadAsyncComponent('catalogUI/ButtonsCard');

/**
 * Save the new user and redirect to the user list page.
 * @returns A promise that resolves when the user creation process is complete.
 */
function save(): Promise<void> {
  isLoading.value = true;
  return saveEntity<Record<string, unknown>, Record<string, unknown>>(
    instanceId.value,
    user.value
  )
    .then((user) => {
      const userIdKey = getModuleHostConfiguration<ModuleUsersOptions>(
        instanceId.value
      )!.options!.userIdKey;
      Notify({
        type: 'positive',
        message: t(`${i18nScope.value}.success`),
      });
      router.push({ path: `${parentPath.value}/${user[userIdKey] as string}` });
    })
    .catch(() => {
      Notify({
        type: 'negative',
        message: t(`${i18nScope.value}.error`),
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

/**
 * Cancel the user creation and redirect to the user list page.
 */
function cancel() {
  router.push({ path: parentPath.value });
}
</script>
