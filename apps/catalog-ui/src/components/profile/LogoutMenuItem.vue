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
  <q-separator v-bind="uiProps.separator" />
  <q-item
    v-close-popup
    v-bind="uiProps.item"
    clickable
    class="logout-menu-item"
    data-cy="header_profile_logout"
    @click="openConfirmationDialog"
  >
    <q-item-section
      v-bind="uiProps.iconSection"
      class="logout-menu-item--icon-section"
    >
      <q-icon v-bind="uiProps.icon" />
    </q-item-section>
    <q-item-section
      v-bind="uiProps.labelSection"
      class="logout-menu-item--label-section"
    >
      <q-item-label
        v-bind="uiProps.label"
        class="text-no-wrap"
        data-cy="header_profile_logout_label"
      >
        {{ t('label') }}
      </q-item-label>
    </q-item-section>
  </q-item>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQIconProps,
  LinidQItemLabelProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQSeparatorProps,
} from '@linagora/linid-im-front-corelib';
import {
  uiEventSubject,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { useRouter } from 'vue-router';
import { DialogKey } from '../../types/dialog';
import type { LogoutMenuItemProps } from '../../types/logoutMenuItem';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<LogoutMenuItemProps>(), {
  i18nScope: 'application.logout',
});

const router = useRouter();
const { ui } = useUiDesign();
const { t } = useScopedI18n(props.i18nScope);

const localUiNamespace = `${props.uiNamespace}.logout-menu-item`;

const uiProps = {
  separator: ui<LinidQSeparatorProps>(localUiNamespace, 'q-separator'),
  item: ui<LinidQItemProps>(localUiNamespace, 'q-item'),
  iconSection: {
    avatar: true,
    ...ui<LinidQItemSectionProps>(`${localUiNamespace}.icon`, 'q-item-section'),
  },
  icon: {
    name: 'logout',
    ...ui<LinidQIconProps>(`${localUiNamespace}.icon`, 'q-icon'),
  },
  labelSection: ui<LinidQItemSectionProps>(
    `${localUiNamespace}.label`,
    'q-item-section'
  ),
  label: ui<LinidQItemLabelProps>(`${localUiNamespace}.label`, 'q-item-label'),
};

/**
 * Opens the logout confirmation dialog. Once confirmed, the user is sent to the configured logout route; on cancel,
 * nothing happens and the user stays on the current page.
 */
function openConfirmationDialog(): void {
  uiEventSubject.next({
    key: DialogKey.Confirmation,
    data: {
      type: 'open',
      title: t('ConfirmationDialog.title'),
      content: t('ConfirmationDialog.content'),
      uiNamespace: localUiNamespace,
      i18nScope: `${props.i18nScope}.ConfirmationDialog`,
      onConfirm: logout,
    },
  });
}

/**
 * Navigates to the configured logout route.
 * @returns A promise that resolves once the navigation has been triggered.
 */
async function logout(): Promise<void> {
  await router.push(props.path);
}
</script>
