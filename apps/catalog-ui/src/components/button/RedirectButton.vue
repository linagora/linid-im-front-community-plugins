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
  <q-btn
    v-bind="uiProps.button"
    :label="t('title')"
    :disable="isDisabled"
    class="redirect-button"
    data-cy="redirect-button"
    :to="targetRoute"
  />
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQBtnProps } from '@linagora/linid-im-front-corelib';
import {
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import type { RedirectButtonProps } from '../../types/redirectButton';

const props = withDefaults(defineProps<RedirectButtonProps>(), {
  disable: false,
});

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix ? `${prefix}.RedirectButton` : 'RedirectButton';
});
const localUiNamespace = computed(() => `${props.uiNamespace}.redirect-button`);

const { t } = useScopedI18n(localI18nScope.value);
const { renderString } = useNunjucks();
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  button: ui<LinidQBtnProps>(localUiNamespace.value, 'q-btn'),
}));

/** Nunjucks context shared by the `to` and `disable` templates. */
const templateContext = computed(() => ({
  entity: props.entity ?? {},
  parent: props.parent ?? {},
}));

/**
 * Whether the button is disabled: directly when `disable` is a boolean, or when it is a Nunjucks
 * template rendering to `true` with the template context.
 */
const isDisabled = computed(() =>
  typeof props.disable === 'string'
    ? renderString(props.disable, templateContext.value).trim() === 'true'
    : props.disable
);

/**
 * Route the button links to, rendered from the `to` template with the template context. Bound to
 * the button link so that the router handles a click while the browser keeps its link controls,
 * such as opening the route in a new tab.
 */
const targetRoute = computed(() =>
  renderString(props.to, templateContext.value).trim()
);
</script>

<style scoped></style>
