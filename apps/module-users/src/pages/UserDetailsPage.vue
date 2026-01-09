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
    class="q-pa-md user-details-page"
    data-cy="userDetailsPage"
  >
    <h3 class="user-details-page--title">{{ t('title') }}</h3>
    <div v-if="user">
      <h4>{{ t('content') }}</h4>
      <q-card
        class="q-mt-md"
        flat
      >
        <q-card-actions>
          <q-btn
            :label="t('edit')"
            color="primary"
            data-cy="button_edit"
            dense
            @click="goToEdit"
          />
          <q-btn
            :label="t('back')"
            color="secondary"
            data-cy="button_back_to_users_list"
            dense
            @click="goToUsersList"
          >
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import { getEntityById, useScopedI18n } from '@linagora/linid-im-front-corelib';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const instanceId = computed<string>(() => route.meta.instanceId as string);
const userId = computed(() => route.query.id as string);
const { t } = useScopedI18n(`${instanceId.value}.UserDetailsPage`);

const user = ref<Record<string, unknown> | null>(null);

/**
 * Loads the user data based on the userId.
 */
async function loadData() {
  try {
    user.value = await getEntityById<Record<string, unknown>>(
      instanceId.value,
      userId.value
    );
  } catch {
    goBack();
    // TODO: uncomment when Notify is working
    // Notify.create({
    //   message: t('UserDetailsPage.error'),
    // });
  }
}

/**
 * Navigates to the edit page for the current user.
 */
function goToEdit() {
  router.push({ path: '/users/edit', query: { id: userId.value } });
}

/**
 * Navigates back to the home page.
 */
function goBack() {
  router.push({ path: '/users' });
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped></style>
