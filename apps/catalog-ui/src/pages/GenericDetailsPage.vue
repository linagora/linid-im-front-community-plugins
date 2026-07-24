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
    class="justify-center q-pa-md generic-details-page"
    data-cy="generic-details-page"
  >
    <div class="col-12 col-md-10 col-lg-10">
      <div
        class="row items-center justify-between q-mb-md generic-details-page--header"
      >
        <div class="row items-center q-gutter-x-md">
          <h1
            v-if="te('title')"
            class="q-ma-none text-h5 generic-details-page--title"
            data-cy="generic-details-page_title"
          >
            {{ t('title') }}
          </h1>
          <!-- eslint-disable vue/attribute-hyphenation -->
          <LinidZoneRenderer
            :zone="`${instanceId}.titleAppend`"
            :entity="entity || {}"
            :instanceId
            :uiNamespace
            :i18nScope
          />
          <!-- eslint-enable vue/attribute-hyphenation -->
        </div>
        <div class="generic-details-page--actions">
          <ButtonsCard
            :ui-namespace="uiNamespace"
            :i18n-scope="i18nScope"
            :show-confirm-button="false"
            @cancel="goBack"
          >
            <template #append-buttons>
              <!-- eslint-disable vue/attribute-hyphenation -->
              <LinidZoneRenderer
                :zone="`${instanceId}.extraButtons`"
                :entity="entity || {}"
                :instanceId
                :uiNamespace
                :i18nScope
              />
              <!-- eslint-enable vue/attribute-hyphenation -->
              <q-btn
                v-if="options.editPath"
                v-bind="uiProps.editButton"
                class="buttons-card--edit-button"
                :label="t('ButtonsCard.edit')"
                data-cy="button_edit"
                @click="goToEdit"
              />
            </template>
          </ButtonsCard>
        </div>
      </div>

      <!-- eslint-disable vue/attribute-hyphenation -->
      <LinidZoneRenderer
        :zone="`${instanceId}.extraContent`"
        :entity="entity || {}"
        :entityId
        :instanceId
        :uiNamespace
        :i18nScope
        :isLoading
      />
      <!-- eslint-enable vue/attribute-hyphenation -->

      <EntityDetailsCard
        v-for="section in options.sections"
        :key="section.key"
        :entity="entity || {}"
        :field-order="section.fieldOrder"
        :show-remaining-fields="section.showRemainingFields || false"
        :is-loading="isLoading"
        :ui-namespace="`${uiNamespace}.sections.${section.key}`"
        :i18n-scope="`${i18nScope}.sections.${section.key}`"
        class="q-mb-md q-px-md generic-details-page--section"
        :data-cy="`details-section_${section.key}`"
      />
    </div>
  </q-page>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQBtnProps, UiEvent } from '@linagora/linid-im-front-corelib';
import {
  getEntityById,
  getModuleHostConfiguration,
  LinidZoneRenderer,
  uiEventSubject,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { Subscription } from 'rxjs';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ButtonsCard from '../components/card/ButtonsCard.vue';
import EntityDetailsCard from '../components/card/EntityDetailsCard.vue';
import type { ModuleGenericDetailsPageOptions } from '../types/ModuleGenericDetailsPageOptions';

const route = useRoute();
const router = useRouter();
const instanceId = computed<string>(() => route.meta.instanceId as string);
const parentPath = computed(() => route.matched[0]?.path);
const entityId = computed(() => route.params.id as string);
const i18nScope = computed<string>(() => `${instanceId.value}`);
const uiNamespace = computed(() => `${instanceId.value}`);
const options = computed(
  () =>
    getModuleHostConfiguration<ModuleGenericDetailsPageOptions>(
      instanceId.value
    )!.options
);

const { t, te } = useScopedI18n(i18nScope.value);
const { Notify } = useNotify();
const { ui } = useUiDesign();
const { render } = useNunjucks();

const entity = ref<Record<string, unknown> | null>(null);
const isLoading = ref<boolean>(false);
let eventSubscription: Subscription;

const uiProps = computed(() => ({
  editButton: ui<LinidQBtnProps>(
    `${uiNamespace.value}.buttons-card.edit-button`,
    'q-btn'
  ),
}));

/**
 * Loads the entity data based on the route identifier. On failure, notifies the user and navigates
 * back.
 */
async function loadData() {
  isLoading.value = true;
  try {
    entity.value = await getEntityById<Record<string, unknown>>(
      instanceId.value,
      entityId.value
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
 * Navigates to the edit page of the current entity, resolved by rendering the configured `editPath` template with the
 * loaded entity as context.
 */
function goToEdit() {
  router.push(render(options.value.editPath!, { entity: entity.value ?? {} }));
}

/**
 * Navigates back to the previous page, using the browser history when possible and falling back to
 * the parent route otherwise.
 */
function goBack() {
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.push(`${parentPath.value}`);
  }
}

onMounted(() => {
  eventSubscription = uiEventSubject.subscribe((event: UiEvent) => {
    if (options.value?.reloadDetailsOn?.includes(event.key)) {
      loadData();
    }
  });
  loadData();
});

onUnmounted(() => {
  eventSubscription?.unsubscribe();
});
</script>

<style scoped></style>
