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
    class="q-mt-md buttons-card"
    data-cy="buttons-card"
  >
    <q-card-section
      v-if="te('title')"
      class="row justify-start items-center q-pa-sm"
    >
      <q-icon
        v-if="uiProps.icon.name"
        v-bind="uiProps.icon"
        class="q-mr-sm"
        size="sm"
      />
      <span class="text-italic buttons-card--title">
        {{ t('title') }}
      </span>
    </q-card-section>
    <q-card-actions
      v-bind="uiProps.cardActions"
      class="buttons-card--actions"
    >
      <slot name="prepend-buttons" />

      <slot>
        <q-btn
          v-if="showCancelButton"
          v-bind="uiProps.cancelButton"
          :label="t('cancel')"
          data-cy="button_cancel"
          class="buttons-card--cancel-button"
          @click="emit('cancel')"
        />

        <slot name="extra-buttons" />

        <q-btn
          v-if="showConfirmButton"
          v-bind="uiProps.confirmButton"
          :label="t('confirm')"
          :loading="isLoading"
          :type="confirmBtnType"
          :disabled="isDisabled"
          data-cy="button_confirm"
          class="buttons-card--confirm-button"
          @click="emit('confirm')"
        >
          <template #loading>
            <q-spinner-hourglass
              class="on-left buttons-card--confirm-button-loading"
            />
            {{ t('confirmLoading') }}
          </template>
        </q-btn>
      </slot>

      <slot name="append-buttons" />
    </q-card-actions>
  </q-card>
  <!-- v8 ignore stop -->
</template>

<script lang="ts" setup>
import type {
  LinidQBtnProps,
  LinidQCardActionsProps,
  LinidQCardProps,
  LinidQIconProps,
} from '@linagora/linid-im-front-corelib';
import { useScopedI18n, useUiDesign } from '@linagora/linid-im-front-corelib';
import type {
  ButtonsCardOutputs,
  ButtonsCardProps,
} from '../../types/buttonsCard';

const props = withDefaults(defineProps<ButtonsCardProps>(), {
  isLoading: false,
  showConfirmButton: true,
  showCancelButton: true,
  confirmBtnType: 'button',
  isDisabled: false,
});

const emit = defineEmits<ButtonsCardOutputs>();

const localUiNamespace = `${props.uiNamespace}.buttons-card`;
const { t, te } = useScopedI18n(`${props.i18nScope}.ButtonsCard`);
const { ui } = useUiDesign();

const uiProps = {
  card: ui<LinidQCardProps>(`${localUiNamespace}`, 'q-card'),
  icon: ui<LinidQIconProps>(`${localUiNamespace}`, 'q-icon'),
  cardActions: ui<LinidQCardActionsProps>(
    `${localUiNamespace}`,
    'q-card-actions'
  ),
  confirmButton: ui<LinidQBtnProps>(
    `${localUiNamespace}.confirm-button`,
    'q-btn'
  ),
  cancelButton: ui<LinidQBtnProps>(
    `${localUiNamespace}.cancel-button`,
    'q-btn'
  ),
};
</script>
