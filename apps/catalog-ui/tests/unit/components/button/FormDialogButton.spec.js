/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the "You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!" infobox and in the e-mails
 * sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
 * as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
 * and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
 * intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
 * <http://www.linagora.com/licenses/> for more details.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
 * LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
 * General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
 * LinID Identity Manager software.
 */

import { uiEventSubject } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FormDialogButton from '../../../../src/components/button/FormDialogButton.vue';

const mockNotify = vi.fn();
const mockHttpPost = vi.fn(() => Promise.resolve({ data: {} }));
const mockHttpPut = vi.fn(() => Promise.resolve({ data: {} }));
const mockT = vi.fn((key) => key);
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    post: mockHttpPost,
    put: mockHttpPut,
  }),
  useScopedI18n: () => ({
    t: mockT,
    translateOrDefault: mockTranslateOrDefault,
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => ({
    render: function render(value, context) {
      if (typeof value === 'string') {
        return value
          .replace(
            /\{\{ entity\.(\w+) \}\}/g,
            (_, key) => context.entity?.[key] ?? ''
          )
          .replace(
            /\{\{ parent\.(\w+) \}\}/g,
            (_, key) => context.parent?.[key] ?? ''
          );
      }
      if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, render(v, context)])
        );
      }
      return value;
    },
  }),
  uiEventSubject: {
    next: vi.fn(),
  },
}));

describe('Test component: FormDialogButton', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    entity: { id: '123', description: 'entity description' },
    url: '/applications/{{ entity.id }}/export',
    body: {
      name: '{{ entity.name }}',
      description: '{{ entity.description }}',
      nested: { applicationId: '{{ entity.id }}' },
    },
    formFields: [
      {
        name: 'name',
        type: 'String',
        input: 'Text',
        required: true,
        inputSettings: {},
      },
    ],
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(FormDialogButton, {
      props: { ...defaultProps, ...props },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .FormDialogButton to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.FormDialogButton');
    });

    it('should fall back to the instanceId when no i18nScope is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined });

      expect(wrapper.vm.localI18nScope).toBe('test-instance.FormDialogButton');
    });

    it('should use the component name alone when neither i18nScope nor instanceId is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined, instanceId: undefined });

      expect(wrapper.vm.localI18nScope).toBe('FormDialogButton');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .form-dialog-button to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.form-dialog-button'
      );
    });
  });

  describe('Test function: openDialog', () => {
    it('should open the form dialog with the configured form fields', () => {
      wrapper.vm.openDialog();

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'form',
        data: {
          type: 'open',
          title: 'FormDialog.title',
          content: '',
          uiNamespace: 'test-namespace.form-dialog-button',
          i18nScope: 'test-scope.FormDialogButton.FormDialog',
          instanceId: 'test-instance',
          formFields: defaultProps.formFields,
          initialFormData: undefined,
          onSubmit: wrapper.vm.submitForm,
        },
      });
      expect(mockT).toHaveBeenCalledWith('FormDialog.title', {
        id: '123',
        description: 'entity description',
      });
      expect(mockTranslateOrDefault).toHaveBeenCalledWith(
        '',
        'FormDialog.content',
        { id: '123', description: 'entity description' }
      );
    });

    it('should interpolate the dialog title and content with an empty object when the entity is null', () => {
      wrapper = mountComponent({ entity: null });

      wrapper.vm.openDialog();

      expect(mockT).toHaveBeenCalledWith('FormDialog.title', {});
      expect(mockTranslateOrDefault).toHaveBeenCalledWith(
        '',
        'FormDialog.content',
        {}
      );
    });

    it('should pre-fill the form with the entity values when fillFormWithEntity is enabled', () => {
      wrapper = mountComponent({ fillFormWithEntity: true });

      wrapper.vm.openDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual(defaultProps.entity);
      expect(event.data.initialFormData).not.toBe(defaultProps.entity);
    });

    it('should pre-fill the form with an empty object when fillFormWithEntity is enabled without entity', () => {
      wrapper = mountComponent({ entity: null, fillFormWithEntity: true });

      wrapper.vm.openDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({});
    });
  });

  describe('Test function: submitForm', () => {
    it('should post the rendered body to the rendered url, notify and emit submitted', async () => {
      const response = { id: 'export-1' };
      mockHttpPost.mockImplementationOnce(() =>
        Promise.resolve({ data: response })
      );

      await wrapper.vm.submitForm({ name: 'My Export' });

      expect(mockHttpPost).toHaveBeenCalledWith('/applications/123/export', {
        name: 'My Export',
        description: 'entity description',
        nested: { applicationId: '123' },
      });
      expect(mockHttpPut).not.toHaveBeenCalled();
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'submitSuccess',
      });
      expect(wrapper.emitted('submitted')).toEqual([[response]]);
    });

    it('should send the request with PUT when the method is PUT', async () => {
      wrapper = mountComponent({ method: 'PUT' });

      await wrapper.vm.submitForm({ name: 'My Export' });

      expect(mockHttpPut).toHaveBeenCalledWith('/applications/123/export', {
        name: 'My Export',
        description: 'entity description',
        nested: { applicationId: '123' },
      });
      expect(mockHttpPost).not.toHaveBeenCalled();
    });

    it('should override the entity values with the submitted form values in the template context', async () => {
      await wrapper.vm.submitForm({ description: 'form description' });

      expect(mockHttpPost).toHaveBeenCalledWith('/applications/123/export', {
        name: '',
        description: 'form description',
        nested: { applicationId: '123' },
      });
    });

    it('should expose the parent in the template context without merging the form values into it', async () => {
      wrapper = mountComponent({
        entity: { id: 'role-1', name: 'old name' },
        parent: { id: 'app-1', name: 'application name' },
        url: '/applications/{{ parent.id }}/roles/{{ entity.id }}',
        method: 'PUT',
        body: {
          name: '{{ entity.name }}',
          applicationName: '{{ parent.name }}',
        },
      });

      await wrapper.vm.submitForm({ name: 'new name' });

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/applications/app-1/roles/role-1',
        {
          name: 'new name',
          applicationName: 'application name',
        }
      );
    });

    it('should render the templates with the form values only when the entity is null', async () => {
      wrapper = mountComponent({ entity: null, url: '/exports' });

      await wrapper.vm.submitForm({ name: 'My Export' });

      expect(mockHttpPost).toHaveBeenCalledWith('/exports', {
        name: 'My Export',
        description: '',
        nested: { applicationId: '' },
      });
    });

    it('should send an empty body when no body is configured', async () => {
      wrapper = mountComponent({ body: undefined });

      await wrapper.vm.submitForm({ name: 'My Export' });

      expect(mockHttpPost).toHaveBeenCalledWith('/applications/123/export', {});
    });

    it('should notify and rethrow on request error without emitting', async () => {
      const error = new Error('submit failed');
      mockHttpPost.mockImplementationOnce(() => Promise.reject(error));

      await expect(wrapper.vm.submitForm({ name: 'My Export' })).rejects.toBe(
        error
      );

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'submitError',
      });
      expect(wrapper.emitted('submitted')).toBeUndefined();
    });
  });
});
