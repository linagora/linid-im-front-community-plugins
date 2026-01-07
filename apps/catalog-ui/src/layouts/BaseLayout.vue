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
  <q-layout view="hHh LpR fFf">
    <q-header
      v-bind="uiProps.header"
      data-cy="header"
    >
      <q-toolbar
        v-bind="uiProps.toolbar"
        data-cy="toolbar"
      >
        <q-avatar
          v-bind="uiProps.avatar"
          data-cy="application_logo"
        />
        <q-toolbar-title
          v-bind="uiProps.toolbarTitle"
          data-cy="application_title"
        >
          {{ t('title') }}
        </q-toolbar-title>
        <q-badge
          v-bind="uiProps.badge"
          :label="t('version')"
          data-cy="application_version"
        />
      </q-toolbar>
      <q-toolbar
        v-bind="uiProps.toolbar"
        class="block"
        data-cy="navigation_toolbar"
      >
        <NavigationMenu
          :items="uiStore.mainNavigationItems"
          :ui-namespace="toolbarUiNamespace"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- zone dialog -->

    <!-- zone footer -->
  </q-layout>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidQAvatarProps,
  LinidQBadgeProps,
  LinidQHeaderProps,
  LinidQToolbarProps,
  LinidQToolbarTitleProps,
} from '@linagora/linid-im-front-corelib';
import {
  useLinidUiStore,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import NavigationMenu from '../components/NavigationMenu.vue';

const { ui } = useUiDesign();
const { t } = useScopedI18n('application');
const uiStore = useLinidUiStore();

const uiNamespace = 'base-layout';
const headerUiNamespace = `${uiNamespace}.header`;
const toolbarUiNamespace = `${headerUiNamespace}.toolbar`;
const badgeUiNamespace = `${toolbarUiNamespace}.badge`;
const avatarUiNamespace = `${toolbarUiNamespace}.avatar`;
const titleUiNamespace = `${toolbarUiNamespace}.title`;

const uiProps = {
  header: ui<LinidQHeaderProps>(headerUiNamespace, 'q-header'),
  toolbar: ui<LinidQToolbarProps>(toolbarUiNamespace, 'q-toolbar'),
  avatar: ui<LinidQAvatarProps>(avatarUiNamespace, 'q-avatar'),
  toolbarTitle: ui<LinidQToolbarTitleProps>(
    titleUiNamespace,
    'q-toolbar-title'
  ),
  badge: ui<LinidQBadgeProps>(badgeUiNamespace, 'q-badge'),
};
</script>
