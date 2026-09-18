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
    class="confirm-dialog-button"
    data-cy="confirm-dialog-button"
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
import type {
  ConfirmDialogButtonOutputs,
  ConfirmDialogButtonProps,
} from '../../types/confirmDialogButton';
import { DialogKey } from '../../types/dialog';

const props = withDefaults(defineProps<ConfirmDialogButtonProps>(), {
  method: 'DELETE',
  body: () => ({}),
  disable: false,
});

const emit = defineEmits<ConfirmDialogButtonOutputs>();

const localI18nScope = computed(() => {
  const prefix = props.i18nScope || props.instanceId;
  return prefix ? `${prefix}.ConfirmDialogButton` : 'ConfirmDialogButton';
});
const localUiNamespace = computed(
  () => `${props.uiNamespace}.confirm-dialog-button`
);

const { t, translateOrDefault } = useScopedI18n(localI18nScope.value);
const { Notify } = useNotify();
const { render, renderString } = useNunjucks();
const { ui } = useUiDesign();

const uiProps = computed(() => ({
  button: ui<LinidQBtnProps>(localUiNamespace.value, 'q-btn'),
}));

/** Nunjucks context shared by the `url`, `body` and `disableWhen` templates. */
const templateContext = computed(() => ({
  entity: props.entity ?? {},
  parent: props.parent ?? {},
}));

/**
 * Whether the button is disabled: explicitly through `disable`, or when the `disableWhen` template
 * renders to `true` with the current entity.
 */
const isDisabled = computed(
  () =>
    props.disable ||
    (!!props.disableWhen &&
      renderString(props.disableWhen, templateContext.value).trim() === 'true')
);

/**
 * Opens the shared confirmation dialog. The entity properties are available as named parameters in
 * the dialog title and content translations.
 */
function openDialog(): void {
  uiEventSubject.next({
    key: DialogKey.Confirmation,
    data: {
      type: 'open',
      title: t('ConfirmationDialog.title', props.entity ?? {}),
      content: translateOrDefault(
        '',
        'ConfirmationDialog.content',
        props.entity ?? {}
      ),
      uiNamespace: localUiNamespace.value,
      i18nScope: `${localI18nScope.value}.ConfirmationDialog`,
      onConfirm: submit,
    },
  });
}

/**
 * Sends the configured request once the user has confirmed, with the URL and body rendered as
 * Nunjucks templates, then notifies the user, emits the `submitted` event with the response body
 * returned by the API, and publishes `emitOnSubmit` if configured. On failure, notifies the user
 * and emits nothing. The dialog closes either way.
 * @returns A promise that resolves when the submission handling is complete.
 */
async function submit(): Promise<void> {
  const requestBody = render(props.body, templateContext.value);

  try {
    const { data } = await getHttpClient().request({
      method: props.method,
      url: renderString(props.url, templateContext.value),
      data: Object.keys(requestBody).length > 0 ? requestBody : undefined,
    });

    Notify({ type: 'positive', message: t('submitSuccess') });
    emit('submitted', data);

    if (props.emitOnSubmit) {
      uiEventSubject.next({ key: props.emitOnSubmit, data });
    }
  } catch {
    Notify({ type: 'negative', message: t('submitError') });
  }
}
</script>

<style scoped></style>
