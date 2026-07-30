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
    class="flex column items-center q-pa-md generic-creation-page"
    data-cy="generic-creation-page"
  >
    <LinidZoneRenderer
      :zone="`${instanceId}.header.before`"
      :instance-id="instanceId"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
    />
    <div
      class="row items-center justify-between q-mb-md generic-creation-page--header"
    >
      <div class="row items-center q-gutter-x-md">
        <LinidZoneRenderer
          :zone="`${instanceId}.header.prefix`"
          :entity="entity || {}"
          :instance-id="instanceId"
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
        />
        <h1
          v-if="te('title')"
          class="q-ma-none text-h5 generic-creation-page--title"
          data-cy="generic-creation-page_title"
        >
          {{ t('title') }}
        </h1>
        <LinidZoneRenderer
          :zone="`${instanceId}.header.suffix`"
          :entity="entity || {}"
          :instance-id="instanceId"
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
        />
      </div>
      <div class="generic-creation-page--actions">
        <ButtonsCard
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
          :show-confirm-button="false"
          :show-cancel-button="false"
        >
          <template #append-buttons>
            <LinidZoneRenderer
              :zone="`${instanceId}.header.actions`"
              :entity="entity || {}"
              :instance-id="instanceId"
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
            />
          </template>
        </ButtonsCard>
      </div>
    </div>

    <LinidZoneRenderer
      :zone="`${instanceId}.header.after`"
      :instance-id="instanceId"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
    />

    <LinidZoneRenderer
      :zone="`${instanceId}.content.before`"
      :instance-id="instanceId"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
      :is-loading="isLoading"
    />

    <q-form
      class="generic-creation-page--form"
      @submit="save"
      @reset="cancel"
    >
      <q-card
        v-for="formSection in options.formSections"
        v-bind="uiProps.card[formSection.id]"
        :key="formSection.id"
        :data-cy="`form-section-card_${formSection.id}`"
        class="column justify-centerq-mb-md form-fields-grid generic-creation-page--form-section"
      >
        <q-card-section
          v-if="te(`formSections.${formSection.id}.title`)"
          class="generic-creation-page--form-section--header"
        >
          <h4
            :data-cy="`form-section-title_${formSection.id}`"
            class="full-width text-subtitle1 text-weight-medium q-mb-xs generic-creation-page--form-section--title"
          >
            {{ t(`formSections.${formSection.id}.title`) }}
          </h4>
          <p
            v-if="te(`formSections.${formSection.id}.description`)"
            :data-cy="`form-section-description_${formSection.id}`"
            class="text-caption text-grey-7 q-ma-none generic-creation-page--form-section--description"
          >
            {{ t(`formSections.${formSection.id}.description`) }}
          </p>
        </q-card-section>

        <q-card-section
          class="row justify-center q-col-gutter-md generic-creation-page--form-section--field"
          :data-cy="`field-container_${formSection.id}`"
        >
          <entity-attribute-field
            v-for="field in formSection.fields"
            :key="field.name"
            v-model:entity="entity"
            :instance-id="instanceId"
            :definition="field"
            :i18n-scope="i18nScope"
            class="col-12 col-sm-6 col-md-4"
            :ui-namespace="`${uiNamespace}.form-section-${formSection.id}`"
          />
        </q-card-section>
      </q-card>

      <div class="generic-creation-page--actions">
        <ButtonsCard
          :ui-namespace="uiNamespace"
          :i18n-scope="i18nScope"
          confirm-btn-type="submit"
          :is-loading="isLoading"
          @cancel="cancel"
        >
          <template #append-buttons>
            <LinidZoneRenderer
              :zone="`${instanceId}.content.actions`"
              :entity="entity || {}"
              :instance-id="instanceId"
              :ui-namespace="uiNamespace"
              :i18n-scope="i18nScope"
              :is-loading="isLoading"
            />
          </template>
        </ButtonsCard>
      </div>
    </q-form>

    <LinidZoneRenderer
      :zone="`${instanceId}.content.after`"
      :instance-id="instanceId"
      :ui-namespace="uiNamespace"
      :i18n-scope="i18nScope"
      :is-loading="isLoading"
    />
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQCardProps } from '@linagora/linid-im-front-corelib';
import {
  getModuleHostConfiguration,
  LinidZoneRenderer,
  saveEntity,
  useNotify,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { ModuleGenericCreationPageOptions } from '../types/ModuleGenericCreationPageOptions';
import ButtonsCard from '../components/card/ButtonsCard.vue';
import EntityAttributeField from '../components/field/EntityAttributeField.vue';

const router = useRouter();
const route = useRoute();

const instanceId = computed<string>(() => route.meta.instanceId as string);
const i18nScope = computed<string>(() => `${instanceId.value}`);
const uiNamespace = computed<string>(() => `${instanceId.value}`);
const moduleConfig = computed(() =>
  getModuleHostConfiguration<ModuleGenericCreationPageOptions>(instanceId.value)
);
const options = computed(() => moduleConfig.value.options);
const parentPath = computed(() => options.value.parentPath);

const entity = ref<Record<string, unknown>>({});
const isLoading = ref(false);

const { t, te } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  card: options.value.formSections.reduce<Record<string, LinidQCardProps>>(
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
 * Save the new entity and redirect to the entity list page.
 * @returns A promise that resolves when the entity creation process is complete.
 */
function save(): Promise<void> {
  isLoading.value = true;
  return saveEntity<Record<string, unknown>, Record<string, unknown>>(
    instanceId.value,
    entity.value
  )
    .then((data) => {
      Notify({
        type: 'positive',
        message: t(`success`),
      });
      router.push({
        path: `${parentPath.value}/${data[options.value.idKey] as string}`,
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
 * Cancel the entity creation and redirect to the entity list page.
 */
function cancel() {
  router.push({ path: parentPath.value });
}
</script>

<style lang="scss" scoped></style>
