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
  <q-dialog
    :model-value="show"
    v-bind="uiProps.dialog"
    data-cy="confirmation_dialog"
  >
    <q-card data-cy="confirmation_dialog_card_title">
      <q-card-section>
        <h3
          class="q-my-none confirmation-dialog-title"
          data-cy="confirmation_dialog_title"
        >
          {{ title }}
        </h3>
      </q-card-section>

      <!-- eslint-disable vue/no-v-text-v-html-on-component vue/no-v-html -->
      <q-card-section
        data-cy="confirmation_dialog_content"
        v-html="content"
      />
      <!-- eslint-enable vue/no-v-text-v-html-on-component vue/no-v-html -->

      <component
        :is="buttonsCard"
        v-if="buttonsCard"
        :ui-namespace="uiNamespace"
        :i18n-scope="i18nScope"
        @cancel="onClose"
        @confirm="handleConfirm"
      />
    </q-card>
  </q-dialog>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQDialogProps } from '@linagora/linid-im-front-corelib';
import {
  loadAsyncComponent,
  useDialog,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed, ref } from 'vue';
import type { ConfirmationDialogEvent } from '../../types/dialog';
import { DialogKey } from '../../types/dialog';

const { show } = useDialog(DialogKey.Confirmation, onOpen);
const title = ref<string>('');
const content = ref<string>('');
const uiNamespace = ref<string>('');
const i18nScope = ref<string>('');
let onConfirm: () => Promise<void>;

const { ui } = useUiDesign();
const uiProps = computed(() => ({
  dialog: ui<LinidQDialogProps>(
    `${uiNamespace.value}.dialog-cancel-button`,
    'q-dialog'
  ),
}));

const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');

/**
 * Handles the confirm action.
 * Emits the confirm event and closes the dialog.
 */
async function handleConfirm() {
  await onConfirm();
  show.value = false;
}

/**
 * Handles the close event. Closes the dialog.
 */
function onClose() {
  show.value = false;
}

/**
 * Handles the open event.
 * Opens the dialog and sets the title and content based on the event data.
 * @param dialogData - The data for the confirmation dialog.
 */
function onOpen(dialogData: ConfirmationDialogEvent) {
  uiNamespace.value = dialogData.uiNamespace || '';
  i18nScope.value = dialogData.i18nScope || '';
  title.value = dialogData.title || '';
  content.value = dialogData.content || '';
  onConfirm = dialogData.onConfirm || (() => Promise.resolve());
}
</script>
