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

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import FormDialog from '../../../../src/components/dialog/FormDialog.vue';

const mockShowRef = ref(false);

const mockUi = vi.fn((namespace, type) => {
  return { persistent: true, namespace, type };
});

vi.mock('@linagora/linid-im-front-corelib', () => {
  return {
    loadAsyncComponent: () => 'div',
    useDialog: (_key) => {
      return { show: mockShowRef };
    },
    useUiDesign: () => ({
      ui: mockUi,
    }),
  };
});

describe('Test component: FormDialog', () => {
  let wrapper;
  let mockValidate;

  beforeEach(async () => {
    mockShowRef.value = false;

    wrapper = shallowMount(FormDialog, {
      global: {
        stubs: {
          QCard: true,
          QBtn: true,
          QDialog: true,
          QCardSection: true,
          QForm: true,
        },
      },
    });

    // The form is a template ref on the async-loaded QForm; the component is
    // stubbed in unit tests, so we provide a controllable validate() mock that
    // resolves to a valid form by default.
    mockValidate = vi.fn(() => Promise.resolve(true));
    wrapper.vm.form = { validate: mockValidate };
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .form-dialog to the provided uiNamespace', () => {
      wrapper.vm.uiNamespace = 'my-namespace';
      expect(wrapper.vm.localUiNamespace).toBe('my-namespace.form-dialog');
    });
  });

  describe('Test computed: uiProps', () => {
    it('should return dialog, card and cardActions props using localUiNamespace', () => {
      wrapper.vm.uiNamespace = 'my-namespace';
      const props = wrapper.vm.uiProps;
      expect(props).toBeDefined();
      expect(props.dialog).toBeDefined();
      expect(props.card).toBeDefined();
      expect(props.cardActions).toBeDefined();
      expect(props.dialog.namespace).toBe('my-namespace.form-dialog');
      expect(props.dialog.type).toBe('q-dialog');
      expect(props.card.namespace).toBe('my-namespace.form-dialog');
      expect(props.card.type).toBe('q-card');
      expect(props.cardActions.namespace).toBe('my-namespace.form-dialog');
      expect(props.cardActions.type).toBe('q-card-actions');
    });
  });

  describe('Test function: handleSubmit', () => {
    it('should call onSubmit with formData, reset formData and set show to false', async () => {
      const mockOnSubmit = vi.fn(() => Promise.resolve());

      mockShowRef.value = true;
      wrapper.vm.onSubmit = mockOnSubmit;
      wrapper.vm.formData = { name: 'test' };

      await wrapper.vm.handleSubmit();

      expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'test' });
      expect(wrapper.vm.formData).toEqual({});
      expect(wrapper.vm.show).toBe(false);
    });

    it('should set isLoading to true during submit then false after', async () => {
      let isLoadingDuringSubmit;
      const mockOnSubmit = vi.fn(async () => {
        isLoadingDuringSubmit = wrapper.vm.isLoading;
      });

      wrapper.vm.onSubmit = mockOnSubmit;

      await wrapper.vm.handleSubmit();

      expect(isLoadingDuringSubmit).toBe(true);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should reset isLoading and keep dialog open when onSubmit rejects', async () => {
      const mockOnSubmit = vi.fn(() =>
        Promise.reject(new Error('submit failed'))
      );

      mockShowRef.value = true;
      wrapper.vm.onSubmit = mockOnSubmit;
      wrapper.vm.formData = { name: 'test' };

      await wrapper.vm.handleSubmit();

      expect(wrapper.vm.isLoading).toBe(false);
      expect(wrapper.vm.show).toBe(true);
      expect(wrapper.vm.formData).toEqual({ name: 'test' });
    });

    it('should not call onSubmit and keep dialog open when the form is invalid', async () => {
      mockValidate.mockResolvedValue(false);
      const mockOnSubmit = vi.fn(() => Promise.resolve());

      mockShowRef.value = true;
      wrapper.vm.onSubmit = mockOnSubmit;
      wrapper.vm.formData = { name: 'test' };

      await wrapper.vm.handleSubmit();

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(wrapper.vm.show).toBe(true);
      expect(wrapper.vm.formData).toEqual({ name: 'test' });
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should validate the form before submitting', async () => {
      const mockOnSubmit = vi.fn(() => Promise.resolve());

      wrapper.vm.onSubmit = mockOnSubmit;

      await wrapper.vm.handleSubmit();

      expect(mockValidate).toHaveBeenCalledOnce();
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Test function: onClose', () => {
    it('should set show to false, reset formData and isLoading', () => {
      mockShowRef.value = true;
      wrapper.vm.formData = { name: 'test' };
      wrapper.vm.isLoading = true;

      wrapper.vm.onClose();

      expect(wrapper.vm.show).toBe(false);
      expect(wrapper.vm.formData).toEqual({});
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: onOpen', () => {
    it('should use default values for optional fields', () => {
      wrapper.vm.onOpen({
        uiNamespace: 'test-namespace',
        i18nScope: 'test-scope',
      });

      expect(wrapper.vm.title).toBe('');
      expect(wrapper.vm.content).toBe('');
      expect(wrapper.vm.uiNamespace).toBe('test-namespace');
      expect(wrapper.vm.i18nScope).toBe('test-scope');
      expect(wrapper.vm.instanceId).toBe('');
      expect(wrapper.vm.formFields).toEqual([]);
      expect(wrapper.vm.formData).toEqual({});
    });

    it('should initialize formData with initialFormData when provided', () => {
      wrapper.vm.onOpen({
        uiNamespace: 'test-namespace',
        i18nScope: 'test-scope',
        initialFormData: { username: 'johndoe', role: 'user' },
      });

      expect(wrapper.vm.formData).toEqual({
        username: 'johndoe',
        role: 'user',
      });
    });

    it('should use provided values', () => {
      const mockOnSubmit = vi.fn(() => Promise.resolve());
      const defaultOnSubmit = vi.fn(() => Promise.reject());
      const formFields = [{ name: 'field1', type: 'String' }];

      wrapper.vm.title = '';
      wrapper.vm.content = '';
      wrapper.vm.uiNamespace = '';
      wrapper.vm.i18nScope = '';
      wrapper.vm.formFields = [];
      wrapper.vm.onSubmit = defaultOnSubmit;

      wrapper.vm.onOpen({
        title: 'Test Title',
        content: 'Test Content',
        uiNamespace: 'test-namespace',
        i18nScope: 'test-scope',
        instanceId: 'test-id',
        formFields,
        initialFormData: { field1: 'value1' },
        onSubmit: mockOnSubmit,
      });

      expect(wrapper.vm.title).toBe('Test Title');
      expect(wrapper.vm.content).toBe('Test Content');
      expect(wrapper.vm.uiNamespace).toBe('test-namespace');
      expect(wrapper.vm.i18nScope).toBe('test-scope');
      expect(wrapper.vm.instanceId).toBe('test-id');
      expect(wrapper.vm.formFields).toStrictEqual(formFields);
      expect(wrapper.vm.formData).toEqual({ field1: 'value1' });
      expect(wrapper.vm.show).toBe(false);
      expect(wrapper.vm.onSubmit).toBe(mockOnSubmit);
      expect(wrapper.vm.onSubmit).not.toBe(defaultOnSubmit);
      expect(wrapper.vm.uiProps.dialog).toEqual({
        persistent: true,
        namespace: 'test-namespace.form-dialog',
        type: 'q-dialog',
      });
      expect(wrapper.vm.uiProps.card).toEqual({
        persistent: true,
        namespace: 'test-namespace.form-dialog',
        type: 'q-card',
      });
    });
  });
});
