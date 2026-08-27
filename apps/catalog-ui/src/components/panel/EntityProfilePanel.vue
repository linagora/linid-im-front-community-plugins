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
  <q-card
    v-bind="uiProps.card"
    class="q-pa-md column items-center full-width entity-profile-panel"
    data-cy="entity-profile-panel"
  >
    <q-card-section
      v-if="enableNavigation"
      class="q-pa-none q-pb-sm full-width entity-profile-panel--navigation-section"
      data-cy="entity-profile-panel_navigation-section"
    >
      <ButtonsCard
        :ui-namespace="computedUiNamespaces.navigation"
        :i18n-scope="computedI18nScopes.navigation"
        :show-confirm-button="false"
        :show-cancel-button="false"
      >
        <template #prepend-buttons>
          <LinidZoneRenderer
            :zone="zoneNames.prependNavigation"
            :entity="entity"
            :instance-id="instanceId"
            :ui-namespace="computedUiNamespaces.navigationZones"
            :i18n-scope="computedI18nScopes.navigationZones"
          />
        </template>

        <template #append-buttons>
          <q-btn
            v-if="parentPath"
            v-bind="uiProps.backButton"
            :label="translateOrDefault('', 'navigation.ButtonsCard.backButton')"
            class="entity-profile-panel--back-button"
            data-cy="entity-profile-panel_back-button"
            @click="goBack"
          />
          <LinidZoneRenderer
            :zone="zoneNames.appendNavigation"
            :entity="entity"
            :instance-id="instanceId"
            :ui-namespace="computedUiNamespaces.navigationZones"
            :i18n-scope="computedI18nScopes.navigationZones"
          />
        </template>
      </ButtonsCard>
    </q-card-section>

    <LinidZoneRenderer
      :zone="zoneNames.beforeHeader"
      :entity="entity"
      :instance-id="instanceId"
      :ui-namespace="localUiNamespace"
      :i18n-scope="localI18nScope"
    />
    <slot name="before-header" />

    <q-card-section
      v-if="enableAvatar"
      class="q-pa-none q-pb-lg full-width relative-position entity-profile-panel--avatar-section"
      data-cy="entity-profile-panel_avatar-section"
    >
      <q-img
        v-bind="uiProps.image"
        class="entity-profile-panel--avatar-img"
        data-cy="entity-profile-panel_avatar-img"
      >
        <template #default>
          <!-- Quasar renders this slot on top of the image once it is loaded, so the fallback
               icon is only displayed when no image source is configured. -->
          <q-icon
            v-if="!uiProps.image.src"
            name="question_mark"
            v-bind="uiProps.avatarIcon"
            class="entity-profile-panel--avatar-icon"
            data-cy="entity-profile-panel_avatar-icon"
          />
        </template>
        <template #error>
          <q-icon
            name="question_mark"
            v-bind="uiProps.avatarIcon"
            class="entity-profile-panel--avatar-icon"
            data-cy="entity-profile-panel_avatar-icon"
          />
        </template>
      </q-img>
      <BlurLoader
        v-if="statusKey && isLoading"
        width="md"
        height="lg"
        class="entity-profile-panel--status-badge-loader"
      />
      <StatusBadge
        v-else-if="statusKey"
        :entity="entity"
        :value-key="statusKey"
        default-value="UNKNOWN"
        class="q-pa-sm entity-profile-panel--status-badge"
        data-cy="entity-profile-panel_status-badge"
      />
    </q-card-section>

    <q-card-section
      v-if="enableTitles"
      class="q-pa-none full-width entity-profile-panel--titles-section"
      data-cy="entity-profile-panel_titles-section"
    >
      <h4
        v-if="te('title')"
        class="q-ma-none q-pb-sm entity-profile-panel--title"
        data-cy="entity-profile-panel_title"
      >
        <BlurLoader
          v-if="isLoading"
          width="xl"
          height="lg"
        />
        <template v-else>
          {{ t('title', entity) }}
        </template>
      </h4>

      <p
        v-if="te('subtitle')"
        class="q-ma-none entity-profile-panel--subtitle"
        data-cy="entity-profile-panel_subtitle"
      >
        <BlurLoader
          v-if="isLoading"
          width="lg"
          height="sm"
        />
        <template v-else>
          {{ t('subtitle', entity) }}
        </template>
      </p>
    </q-card-section>

    <LinidZoneRenderer
      :zone="zoneNames.afterHeader"
      :entity="entity"
      :instance-id="instanceId"
      :ui-namespace="localUiNamespace"
      :i18n-scope="localI18nScope"
    />
    <slot name="after-header" />

    <q-card-section
      class="q-pa-none q-pb-sm full-width entity-profile-panel--actions-section"
      data-cy="entity-profile-panel_actions-section"
    >
      <ButtonsCard
        :ui-namespace="computedUiNamespaces.actions"
        :i18n-scope="computedI18nScopes.actions"
        :show-confirm-button="false"
        :show-cancel-button="false"
      >
        <template #prepend-buttons>
          <LinidZoneRenderer
            :zone="zoneNames.prependActions"
            :entity="entity"
            :instance-id="instanceId"
            :ui-namespace="computedUiNamespaces.actionsZones"
            :i18n-scope="computedI18nScopes.actionsZones"
          />
        </template>

        <template #append-buttons>
          <FormDialogButton
            v-if="updateEndpoint"
            :url="updateEndpoint"
            :body="updateBody"
            method="PUT"
            :entity="entity"
            :form-fields="formFields"
            fill-form-with-entity
            :ui-namespace="computedUiNamespaces.editButton"
            :i18n-scope="computedI18nScopes.editButton"
            :instance-id="instanceId"
            :disable="isLoading"
            class="entity-profile-panel--edit-button"
            data-cy="entity-profile-panel_edit-button"
            @submitted="onSubmitted"
          />
          <LinidZoneRenderer
            :zone="zoneNames.appendActions"
            :entity="entity"
            :instance-id="instanceId"
            :ui-namespace="computedUiNamespaces.actionsZones"
            :i18n-scope="computedI18nScopes.actionsZones"
          />
        </template>
      </ButtonsCard>
    </q-card-section>

    <q-card-section
      class="q-pa-none full-width entity-profile-panel--details-section"
      data-cy="entity-profile-panel_details-section"
    >
      <LinidZoneRenderer
        :zone="zoneNames.beforeDetails"
        :entity="entity"
        :instance-id="instanceId"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
      />
      <slot name="before-details" />
      <EntityDetailsCard
        :entity="entity"
        :field-order="fieldOrder"
        :is-loading="isLoading"
        :formatters="formatters"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
      />
      <LinidZoneRenderer
        :zone="zoneNames.afterDetails"
        :entity="entity"
        :instance-id="instanceId"
        :ui-namespace="localUiNamespace"
        :i18n-scope="localI18nScope"
      />
      <slot name="after-details" />
    </q-card-section>

    <LinidZoneRenderer
      :zone="zoneNames.footer"
      :entity="entity"
      :instance-id="instanceId"
      :ui-namespace="localUiNamespace"
      :i18n-scope="localI18nScope"
    />
    <slot name="footer" />
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQBtnProps,
  LinidQCardProps,
  LinidQIconProps,
  LinidQImgProps,
} from '@linagora/linid-im-front-corelib';
import {
  LinidZoneRenderer,
  uiEventSubject,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type {
  EntityProfilePanelOutputs,
  EntityProfilePanelProps,
} from '../../types/entityProfilePanel';
import StatusBadge from '../badge/StatusBadge.vue';
import FormDialogButton from '../button/FormDialogButton.vue';
import ButtonsCard from '../card/ButtonsCard.vue';
import EntityDetailsCard from '../card/EntityDetailsCard.vue';
import BlurLoader from '../loader/BlurLoader.vue';

const props = withDefaults(defineProps<EntityProfilePanelProps>(), {
  entity: () => ({}),
  formFields: () => [],
  isLoading: false,
  enableNavigation: true,
  enableAvatar: true,
  enableTitles: true,
});

const emit = defineEmits<EntityProfilePanelOutputs>();

const router = useRouter();

const localUiNamespace = computed(() => {
  const prefix = props.uiNamespace || props.instanceId;
  return prefix ? `${prefix}.entity-profile-panel` : 'entity-profile-panel';
});

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix ? `${prefix}.EntityProfilePanel` : 'EntityProfilePanel';
});

const { ui } = useUiDesign();
const { te, t, translateOrDefault } = useScopedI18n(localI18nScope.value);
const { render } = useNunjucks();

const zoneNames = computed(() => ({
  prependNavigation: `${localUiNamespace.value}.navigation.prepend`,
  appendNavigation: `${localUiNamespace.value}.navigation.append`,
  beforeHeader: `${localUiNamespace.value}.header.before`,
  afterHeader: `${localUiNamespace.value}.header.after`,
  prependActions: `${localUiNamespace.value}.actions.prepend`,
  appendActions: `${localUiNamespace.value}.actions.append`,
  beforeDetails: `${localUiNamespace.value}.details.before`,
  afterDetails: `${localUiNamespace.value}.details.after`,
  footer: `${localUiNamespace.value}.footer`,
}));

const computedI18nScopes = computed(() => ({
  navigation: `${localI18nScope.value}.navigation`,
  navigationZones: `${localI18nScope.value}.navigation.ButtonsCard`,
  actions: `${localI18nScope.value}.actions`,
  actionsZones: `${localI18nScope.value}.actions.ButtonsCard`,
  editButton: `${localI18nScope.value}.actions.ButtonsCard.editButton`,
}));

const computedUiNamespaces = computed(() => ({
  navigation: `${localUiNamespace.value}.navigation`,
  navigationZones: `${localUiNamespace.value}.navigation.buttons-card`,
  actions: `${localUiNamespace.value}.actions`,
  actionsZones: `${localUiNamespace.value}.actions.buttons-card`,
  editButton: `${localUiNamespace.value}.actions.buttons-card.edit-button`,
}));

const uiProps = computed(() => ({
  card: ui<LinidQCardProps>(localUiNamespace.value, 'q-card'),
  backButton: ui<LinidQBtnProps>(
    `${computedUiNamespaces.value.navigationZones}.back-button`,
    'q-btn'
  ),
  image: ui<LinidQImgProps>(localUiNamespace.value, 'q-img'),
  avatarIcon: ui<LinidQIconProps>(localUiNamespace.value, 'q-icon'),
}));

/**
 * Navigates back to the configured parent path using vue-router.
 * The back button is only rendered when `parentPath` is set, so the path is always defined here.
 */
function goBack() {
  router.push(render(props.parentPath!, { entity: props.entity }));
}

/**
 * Handles the `submitted` event from FormDialogButton. Emits `update:entity` only when the response
 * body is a JSON object, and publishes the `emitOnUpdate` key on `uiEventSubject` whatever it is —
 * an empty body such as a 204 No Content is precisely when the hosting page has to reload itself.
 * @param data - The response body returned by the API.
 */
function onSubmitted(data: unknown): void {
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    emit('update:entity', data as Record<string, unknown>);
  }
  if (props.emitOnUpdate) {
    uiEventSubject.next({
      key: props.emitOnUpdate,
      data,
    });
  }
}
</script>

<style scoped>
.entity-profile-panel--avatar-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
}

.entity-profile-panel--avatar-img :deep(.q-img__content) {
  container-type: size;
}

.entity-profile-panel--status-badge,
.entity-profile-panel--status-badge-loader {
  position: absolute;
  right: 0;
  bottom: 15%;
  border-radius: 9999px;
}

.entity-profile-panel--avatar-icon {
  width: 100%;
  height: 100%;
  font-size: 100cqmin !important;
}
</style>
