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
    class="row justify-center q-pa-md"
    data-cy="new-user-page"
  >
    <div class="col-12 col-md-10 col-lg-8">
      <h3 data-cy="title">
        {{ t('title') }}
      </h3>

      <q-form
        class="new-user-page--form"
        @submit="save"
      >
        <q-card
          v-for="formSection in formSections"
          v-bind="uiProps.card[formSection.id]"
          :key="formSection.id"
          :data-cy="`form-section-card_${formSection.id}`"
          class="q-mb-md new-user-page--form-section"
        >
          <q-card-section
            v-if="te(`formSections.${formSection.id}.title`)"
            class="new-user-page--form-section--header"
          >
            <h4
              :data-cy="`form-section-title_${formSection.id}`"
              class="text-subtitle1 text-weight-medium q-mb-xs new-user-page--form-section--title"
            >
              {{ t(`formSections.${formSection.id}.title`) }}
            </h4>
            <p
              v-if="te(`formSections.${formSection.id}.description`)"
              :data-cy="`form-section-description_${formSection.id}`"
              class="text-caption text-grey-7 q-ma-none new-user-page--form-section--description"
            >
              {{ t(`formSections.${formSection.id}.description`) }}
            </p>
          </q-card-section>

          <q-card-section
            v-for="field in formSection.fields"
            :key="field.name"
            class="new-user-page--form-section--field"
            :data-cy="`field-container_${field.name}`"
          >
            <component
              :is="fieldComponent"
              v-if="fieldComponent"
              v-model:entity="user"
              :ui-namespace="`${uiNamespace}.form-section-${formSection.id}`"
              :instance-id="instanceId"
              :definition="field"
            />
          </q-card-section>
        </q-card>

        <component
          :is="buttonsCard"
          v-if="buttonsCard"
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
          :is-loading="isLoading"
          confirm-btn-type="submit"
          @cancel="cancel"
        />
      </q-form>
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>
<script setup lang="ts">
import type { LinidQCardProps } from '@linagora/linid-im-front-corelib';
import {
  getEntityConfiguration,
  getModuleHostConfiguration,
  loadAsyncComponent,
  saveEntity,
  useNotify,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computedAsync } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ModuleUsersOptions } from '../types/moduleUsers';

const router = useRouter();
const route = useRoute();

const parentPath = computed(() => route.matched[0]?.path);
const instanceId = computed<string>(() => route.meta.instanceId as string);
const i18nScope = computed<string>(() => `${instanceId.value}.NewUserPage`);
const uiNamespace = computed<string>(() => `${instanceId.value}.new-user-page`);
const moduleConfig = computed(() =>
  getModuleHostConfiguration<ModuleUsersOptions>(instanceId.value)
);
const options = computed(() => moduleConfig.value.options);
const attributes = computedAsync(
  async () =>
    (await getEntityConfiguration(moduleConfig.value.entity)).attributes,
  []
);

const formSections = computed(() =>
  [...options.value.formSections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      id: section.id,
      fields: section.fieldsOrder
        .map((fieldName) =>
          attributes.value.find((attr) => attr.name === fieldName)
        )
        .filter((field) => field != null),
    }))
);

const user = ref<Record<string, unknown>>({});
const isLoading = ref(false);
const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');
const fieldComponent = loadAsyncComponent('catalogUI/EntityAttributeField');

const { t, te } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  card: formSections.value.reduce<Record<string, LinidQCardProps>>(
    (acc, item) => {
      return {
        ...acc,
        [item.id]: ui<LinidQCardProps>(
          `${uiNamespace.value}.form-section-${item.id}`,
          'q-card'
        ),
      };
    },
    {}
  ),
}));

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
      Notify({
        type: 'positive',
        message: t(`success`),
      });
      router.push({
        path: `${parentPath.value}/${user[options.value.userIdKey] as string}`,
      });
    })
    .catch(() => {
      Notify({
        type: 'negative',
        message: t(`error`),
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
