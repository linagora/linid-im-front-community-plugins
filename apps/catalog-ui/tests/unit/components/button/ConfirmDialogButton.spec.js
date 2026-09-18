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
import ConfirmDialogButton from '../../../../src/components/button/ConfirmDialogButton.vue';

const mockNotify = vi.fn();
const mockRequest = vi.fn(() => Promise.resolve({ data: {} }));
const mockT = vi.fn((key) => key);
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    request: mockRequest,
  }),
  useScopedI18n: () => ({
    t: mockT,
    translateOrDefault: mockTranslateOrDefault,
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => {
    function renderString(value, context) {
      return value
        .replace(/\{\{ not entity\.(\w+) \}\}/g, (_, key) =>
          String(!context.entity?.[key])
        )
        .replace(
          /\{\{ entity\.(\w+) \}\}/g,
          (_, key) => context.entity?.[key] ?? ''
        )
        .replace(
          /\{\{ parent\.(\w+) \}\}/g,
          (_, key) => context.parent?.[key] ?? ''
        );
    }
    function render(value, context) {
      if (typeof value === 'string') {
        return renderString(value, context);
      }
      if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, render(v, context)])
        );
      }
      return value;
    }
    return { renderString, render };
  },
  uiEventSubject: {
    next: vi.fn(),
  },
}));

describe('Test component: ConfirmDialogButton', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    entity: { id: '123', name: 'entity name', deletable: true },
    url: '/roles/{{ entity.id }}',
    method: 'DELETE',
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(ConfirmDialogButton, {
      props: { ...defaultProps, ...props },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .ConfirmDialogButton to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.ConfirmDialogButton');
    });

    it('should fall back to the instanceId when no i18nScope is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined });

      expect(wrapper.vm.localI18nScope).toBe(
        'test-instance.ConfirmDialogButton'
      );
    });

    it('should use the component name alone when neither i18nScope nor instanceId is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined, instanceId: undefined });

      expect(wrapper.vm.localI18nScope).toBe('ConfirmDialogButton');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .confirm-dialog-button to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.confirm-dialog-button'
      );
    });
  });

  describe('Test computed: isDisabled', () => {
    it('should be enabled by default', () => {
      expect(wrapper.vm.isDisabled).toBe(false);
    });

    it('should be disabled when disable is true', () => {
      wrapper = mountComponent({ disable: true });

      expect(wrapper.vm.isDisabled).toBe(true);
    });

    it('should be disabled when the disable template renders to true', () => {
      wrapper = mountComponent({
        entity: { id: '123', deletable: false },
        disable: '{{ not entity.deletable }}',
      });

      expect(wrapper.vm.isDisabled).toBe(true);
    });

    it('should be enabled when the disable template renders to false', () => {
      wrapper = mountComponent({ disable: '{{ not entity.deletable }}' });

      expect(wrapper.vm.isDisabled).toBe(false);
    });
  });

  describe('Test function: openDialog', () => {
    it('should open the confirmation dialog with the entity interpolated in the texts', () => {
      wrapper.vm.openDialog();

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'confirmation',
        data: {
          type: 'open',
          title: 'ConfirmationDialog.title',
          content: '',
          uiNamespace: 'test-namespace.confirm-dialog-button',
          i18nScope: 'test-scope.ConfirmDialogButton.ConfirmationDialog',
          onConfirm: wrapper.vm.submit,
        },
      });
      expect(mockT).toHaveBeenCalledWith(
        'ConfirmationDialog.title',
        defaultProps.entity
      );
      expect(mockTranslateOrDefault).toHaveBeenCalledWith(
        '',
        'ConfirmationDialog.content',
        defaultProps.entity
      );
    });

    it('should interpolate the dialog texts with an empty object when the entity is null', () => {
      wrapper = mountComponent({ entity: null });

      wrapper.vm.openDialog();

      expect(mockT).toHaveBeenCalledWith('ConfirmationDialog.title', {});
      expect(mockTranslateOrDefault).toHaveBeenCalledWith(
        '',
        'ConfirmationDialog.content',
        {}
      );
    });
  });

  describe('Test function: submit', () => {
    it('should send a DELETE request without body to the rendered url, notify and emit submitted', async () => {
      const response = { id: '123' };
      mockRequest.mockImplementationOnce(() =>
        Promise.resolve({ data: response })
      );

      await wrapper.vm.submit();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/roles/123',
        data: undefined,
      });
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'submitSuccess',
      });
      expect(wrapper.emitted('submitted')).toEqual([[response]]);
    });

    it('should send the rendered body with the configured method', async () => {
      wrapper = mountComponent({
        parent: { id: 'app-1' },
        url: '/applications/{{ parent.id }}/roles/{{ entity.id }}/archive',
        method: 'PUT',
        body: {
          name: '{{ entity.name }}',
          nested: { applicationId: '{{ parent.id }}' },
        },
      });

      await wrapper.vm.submit();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/applications/app-1/roles/123/archive',
        data: {
          name: 'entity name',
          nested: { applicationId: 'app-1' },
        },
      });
    });

    it('should render the templates with empty objects when the entity is null', async () => {
      wrapper = mountComponent({
        entity: null,
        method: 'POST',
        body: { name: '{{ entity.name }}' },
      });

      await wrapper.vm.submit();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/roles/',
        data: { name: '' },
      });
    });

    it('should notify without emitting nor throwing on request error', async () => {
      mockRequest.mockImplementationOnce(() =>
        Promise.reject(new Error('submit failed'))
      );

      await expect(wrapper.vm.submit()).resolves.toBeUndefined();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'submitError',
      });
      expect(wrapper.emitted('submitted')).toBeUndefined();
    });

    it('should not emit any event on uiEventSubject when emitOnSubmit is not configured', async () => {
      await wrapper.vm.submit();

      expect(uiEventSubject.next).not.toHaveBeenCalled();
    });

    it('should emit the configured event on uiEventSubject after a successful request', async () => {
      const response = { id: '123' };
      mockRequest.mockImplementationOnce(() =>
        Promise.resolve({ data: response })
      );
      wrapper = mountComponent({ emitOnSubmit: 'role-deleted' });

      await wrapper.vm.submit();

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'role-deleted',
        data: response,
      });
    });

    it('should not emit any event on uiEventSubject when the request fails', async () => {
      wrapper = mountComponent({ emitOnSubmit: 'role-deleted' });
      mockRequest.mockImplementationOnce(() =>
        Promise.reject(new Error('submit failed'))
      );

      await wrapper.vm.submit();

      expect(uiEventSubject.next).not.toHaveBeenCalled();
    });
  });
});
