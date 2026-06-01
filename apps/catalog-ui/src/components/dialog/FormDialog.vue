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
    data-cy="form-dialog"
    @hide="onClose"
  >
    <q-card
      v-bind="uiProps.card"
      data-cy="form-dialog_card"
    >
      <q-card-section>
        <h3
          class="q-my-none form-dialog--title"
          data-cy="form-dialog_title"
        >
          {{ title }}
        </h3>
      </q-card-section>

      <!-- eslint-disable vue/no-v-text-v-html-on-component vue/no-v-html -->
      <q-card-section
        data-cy="form-dialog_content"
        v-html="content"
      />
      <!-- eslint-enable vue/no-v-text-v-html-on-component vue/no-v-html -->

      <q-form
        ref="form"
        class="form-dialog--form"
        @submit.prevent="handleSubmit"
      >
        <q-card-section
          v-for="field in formFields"
          :key="field.name"
          class="form-dialog--form-section--field"
          :data-cy="`form-dialog_field-container_${field.name}`"
        >
          <component
            :is="fieldComponent"
            v-if="fieldComponent"
            v-model:entity="formData"
            :i18n-scope="i18nScope"
            :ui-namespace="localUiNamespace"
            :instance-id="instanceId"
            :definition="field"
          />
        </q-card-section>
        <q-card-actions v-bind="uiProps.cardActions">
          <component
            :is="buttonsCard"
            v-if="buttonsCard"
            :ui-namespace="localUiNamespace"
            :i18n-scope="i18nScope"
            :is-loading="isLoading"
            confirm-btn-type="submit"
            @cancel="onClose"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type {
  LinidAttributeConfiguration,
  LinidQCardActionsProps,
  LinidQCardProps,
  LinidQDialogProps,
} from '@linagora/linid-im-front-corelib';
import {
  loadAsyncComponent,
  useDialog,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { QForm } from 'quasar';
import { computed, ref } from 'vue';
import type { FormDialogEvent } from '../../types/dialog';
import { DialogKey } from '../../types/dialog';

const { show } = useDialog<FormDialogEvent>(DialogKey.Form, onOpen);
const title = ref<string>('');
const content = ref<string>('');
const uiNamespace = ref<string>('');
const i18nScope = ref<string>('');
const instanceId = ref<string>('');
const formFields = ref<LinidAttributeConfiguration[]>([]);
const isLoading = ref(false);
const formData = ref<Record<string, unknown>>({});
const form = ref<QForm>();
let onSubmit: (formData: Record<string, unknown>) => Promise<void>;

const { ui } = useUiDesign();

const localUiNamespace = computed(() => `${uiNamespace.value}.form-dialog`);

const uiProps = computed(() => ({
  dialog: ui<LinidQDialogProps>(localUiNamespace.value, 'q-dialog'),
  card: ui<LinidQCardProps>(localUiNamespace.value, 'q-card'),
  cardActions: ui<LinidQCardActionsProps>(
    localUiNamespace.value,
    'q-card-actions'
  ),
}));

const fieldComponent = loadAsyncComponent('catalogUI/EntityAttributeField');
const buttonsCard = loadAsyncComponent('catalogUI/ButtonsCard');

/**
 * Handles the submit action.
 * Validates the form first and aborts if any field is invalid, keeping the
 * dialog open so validation errors stay visible. Form fields are loaded
 * asynchronously, so the explicit validate() call guarantees they are checked
 * regardless of their mount timing rather than relying on the native submit.
 * On success, calls onSubmit with the current form data and closes the dialog;
 * keeps it open if onSubmit rejects so the user can correct errors.
 * Errors from onSubmit are caught here to prevent unhandled promise rejections —
 * onSubmit is responsible for its own error handling and must re-throw to signal
 * failure (e.g. After displaying an error notification).
 */
async function handleSubmit() {
  if (!(await form.value?.validate())) {
    return;
  }

  isLoading.value = true;
  try {
    await onSubmit(formData.value);
    formData.value = {};
    show.value = false;
  } catch {
    // onSubmit handles its own errors; keep the dialog open for correction
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handles the close event. Closes the dialog.
 */
function onClose() {
  formData.value = {};
  isLoading.value = false;
  show.value = false;
}

/**
 * Handles the open event.
 * Opens the dialog and sets the title and content based on the event data.
 * @param dialogData - The data for the form dialog.
 */
function onOpen(dialogData: FormDialogEvent) {
  uiNamespace.value = dialogData.uiNamespace;
  i18nScope.value = dialogData.i18nScope;
  instanceId.value = dialogData.instanceId || '';
  title.value = dialogData.title || '';
  content.value = dialogData.content || '';
  formFields.value = dialogData.formFields || [];
  formData.value = dialogData.initialFormData || {};
  onSubmit = dialogData.onSubmit || (() => Promise.resolve());
}
</script>
