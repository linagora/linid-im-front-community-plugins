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
    :disable="disable"
    class="form-dialog-button"
    data-cy="form-dialog-button"
    @click="openDialog"
  />
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQBtnProps } from '@linagora/linid-im-front-corelib';
import {
  getHttpClient,
  uiEventSubject,
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import { computed } from 'vue';
import { DialogKey } from '../../types/dialog';
import type {
  FormDialogButtonOutputs,
  FormDialogButtonProps,
} from '../../types/formDialogButton';

const props = withDefaults(defineProps<FormDialogButtonProps>(), {
  method: 'POST',
  body: () => ({}),
  fillFormWithEntity: false,
  disable: false,
});

const emit = defineEmits<FormDialogButtonOutputs>();

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix ? `${prefix}.FormDialogButton` : 'FormDialogButton';
});
const localUiNamespace = computed(
  () => `${props.uiNamespace}.form-dialog-button`
);

const { t, translateOrDefault } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { render } = useNunjucks();
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  button: ui<LinidQBtnProps>(localUiNamespace.value, 'q-btn'),
}));

/**
 * Opens the shared form dialog with the configured form fields. The entity properties are available
 * as named parameters in the dialog title and content translations. When `fillFormWithEntity` is
 * enabled, the form is pre-filled with the entity values.
 */
function openDialog(): void {
  uiEventSubject.next({
    key: DialogKey.Form,
    data: {
      type: 'open',
      title: t('FormDialog.title', props.entity ?? {}),
      content: translateOrDefault('', 'FormDialog.content', props.entity ?? {}),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.FormDialog`,
      instanceId: props.instanceId,
      formFields: props.formFields,
      initialFormData: props.fillFormWithEntity
        ? { ...props.entity }
        : undefined,
      onSubmit: submitForm,
    },
  });
}

/**
 * Sends the configured request with the URL and body rendered as Nunjucks templates, then notifies
 * the user and emits the `submitted` event with the response body returned by the API. The template
 * context exposes `entity`, the configured entity merged with the submitted form data, and
 * `parent`, the parent of the entity.
 * @param formData - The submitted form data, merged into the entity of the template context.
 * @returns A promise that resolves when the submission handling is complete. The promise rejects
 * when the request fails, so the form dialog stays open for correction.
 */
async function submitForm(formData: Record<string, unknown>): Promise<void> {
  const context = {
    entity: { ...(props.entity ?? {}), ...formData },
    parent: props.parent ?? {},
  };
  const requestUrl = render(props.url, context);
  const requestBody = render(props.body, context);

  try {
    const { data } =
      props.method === 'PUT'
        ? await getHttpClient().put(requestUrl, requestBody)
        : await getHttpClient().post(requestUrl, requestBody);

    Notify({ type: 'positive', message: t('submitSuccess') });
    emit('submitted', data);
  } catch (error) {
    Notify({ type: 'negative', message: t('submitError') });
    throw error;
  }
}
</script>

<style scoped></style>
