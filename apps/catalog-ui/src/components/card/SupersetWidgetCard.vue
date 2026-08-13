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
  <q-card
    class="superset-widget-card"
    :data-cy="`superset-widget-card--${dashboardSlug}`"
    v-bind="uiCardProps"
  >
    <q-card-section
      v-if="te(`slug.${dashboardSlug}.title`)"
      class="superset-widget-card--title"
    >
      <h4
        class="text-subtitle1"
        :data-cy="`superset-widget-card-title--${dashboardSlug}`"
      >
        {{ t(`slug.${dashboardSlug}.title`) }}
      </h4>
    </q-card-section>
    <q-inner-loading :showing="loading" />
    <q-card-section :style="style">
      <div
        ref="mountPoint"
        class="superset-mount"
        :data-cy="`superset-widget-card-mount--${dashboardSlug}`"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import {
  getHttpClient,
  type LinidQCardProps,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { SupersetWidgetCardProps } from '../../types/supersetWidgetCard';

const props = defineProps<SupersetWidgetCardProps>();

const mountPoint = ref<HTMLElement | null>(null);
const loading = ref(true);
let dashboardId: string | undefined = props.dashboardId;

let unmountFn: (() => void) | null = null;

const { Notify } = useNotify();
const { render } = useNunjucks();
const nunjucksContext = computed(() => ({
  entity: props.entity ?? {},
}));
const { t, te } = useScopedI18n(`${props.i18nScope}.SupersetWidgetCard`);
const { ui } = useUiDesign();

const uiCardProps: LinidQCardProps = ui<LinidQCardProps>(
  `${props.uiNamespace}.superset-widget-card`,
  'q-card'
);

/**
 * Fetches a guest token for the Superset dashboard.
 *
 * The token request includes the dashboard slug, the optional dashboard ID,
 * and the rendered RLS identifier when configured.
 * @returns A promise resolving to the Superset guest token.
 */
async function fetchGuestToken(): Promise<string> {
  return getHttpClient()
    .post<{
      /**
       * Superset guest token used to authenticate access
       * to an embedded dashboard.
       */
      token: string;
    }>('/superset/token', {
      dashboardSlug: props.dashboardSlug,
      dashboardId,
      rlsId: render(props.rlsId, nunjucksContext.value),
    })
    .then(({ data }) => data.token);
}

/**
 * Retrieves the Superset dashboard ID associated with the configured dashboard slug.
 * @returns A promise resolving to the Superset dashboard ID.
 */
async function getDashboardId(): Promise<string> {
  return getHttpClient()
    .get<string>(`/superset/dashboard-id/${props.dashboardSlug}`)
    .then(({ data }) => data);
}

/**
 * Mounts the Superset dashboard into the widget mount point.
 *
 * If no dashboard ID was provided through the component props, the dashboard ID
 * is first resolved from its slug. The dashboard is then embedded using a
 * Superset guest token and the configured UI options.
 *
 * The widget displays a loading state while the dashboard is being initialized
 * and notifies the user if the embedding fails.
 * @returns A promise resolving when the dashboard mounting process is complete.
 */
async function mountWidget() {
  loading.value = true;

  try {
    if (!dashboardId) {
      dashboardId = await getDashboardId();
    }

    const { unmount } = await embedDashboard({
      id: dashboardId,
      supersetDomain: props.supersetDomain,
      mountPoint: mountPoint.value!,
      fetchGuestToken,
      dashboardUiConfig: {
        hideTitle: true,
        hideChartControls: true,
        hideTab: true,
        filters: {
          expanded: false,
          visible: false,
        },
        ...props.uiConfig,
      },
    });

    unmountFn = unmount;
  } catch (error) {
    Notify({
      type: 'negative',
      message: t('error'),
    });
    throw error;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  mountWidget();
});

onBeforeUnmount(() => {
  unmountFn?.();
});
</script>

<style scoped>
.superset-widget-card {
  position: relative;
  width: 100%;
}

.superset-mount {
  width: 100%;
  height: 100%;
  display: flex;
}

.superset-mount :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none;
  display: block;
}
</style>
