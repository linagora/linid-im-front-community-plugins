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
import { flushPromises, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericEditableTableCard from '../../../../src/components/card/GenericEditableTableCard.vue';

const mockNotify = vi.fn();
const mockHttpGet = vi.fn(() => Promise.resolve({ data: [] }));
const mockHttpPost = vi.fn(() => Promise.resolve({ data: {} }));
const mockHttpDelete = vi.fn(() => Promise.resolve({ data: {} }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    get: mockHttpGet,
    post: mockHttpPost,
    delete: mockHttpDelete,
  }),
  useScopedI18n: () => ({
    t: vi.fn((key) => key),
    te: vi.fn(() => false),
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => ({
    render: (value, context) =>
      value
        .replace('{{ parentEntity.id }}', context.parentEntity?.id)
        .replace('{{ entity.id }}', context.entity?.id),
  }),
  uiEventSubject: {
    next: vi.fn(),
  },
}));

describe('Test component: GenericEditableTableCard', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    parentEntity: { id: 'parent-1' },
    columns: [{ name: 'name', label: 'columns.name', field: 'name' }],
    formFields: [
      {
        name: 'name',
        type: 'String',
        input: 'Text',
        required: true,
        inputSettings: {},
      },
    ],
    endpoints: {
      find: '/api/parents/{{ parentEntity.id }}/items',
      create: '/api/parents/{{ parentEntity.id }}/items',
      delete: '/api/parents/{{ parentEntity.id }}/items/{{ entity.id }}',
    },
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(GenericEditableTableCard, {
      props: { ...defaultProps, ...props },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttpGet.mockImplementation(() => Promise.resolve({ data: [] }));
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .GenericEditableTableCard to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe(
        'test-scope.GenericEditableTableCard'
      );
    });

    it('should fall back to instanceId when i18nScope is not provided', () => {
      wrapper = mountComponent({ i18nScope: undefined });
      expect(wrapper.vm.localI18nScope).toBe(
        'test-instance.GenericEditableTableCard'
      );
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .generic-editable-table-card to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.generic-editable-table-card'
      );
    });
  });

  describe('Test computed: columns', () => {
    it('should translate column labels and append the actions column', () => {
      expect(wrapper.vm.columns).toEqual([
        { name: 'name', label: 'columns.name', field: 'name' },
        { name: 'table_actions', label: '', field: '', align: 'right' },
      ]);
    });

    it('should not append the actions column when already declared', () => {
      wrapper = mountComponent({
        columns: [
          { name: 'name', label: 'columns.name', field: 'name' },
          { name: 'table_actions', label: '', field: '', align: 'left' },
        ],
      });

      expect(
        wrapper.vm.columns.filter((column) => column.name === 'table_actions')
      ).toHaveLength(1);
      expect(wrapper.vm.columns[1].align).toBe('left');
    });
  });

  describe('Test function: loadData', () => {
    it('should load items on mount from the rendered find endpoint', async () => {
      mockHttpGet.mockImplementation(() =>
        Promise.resolve({ data: [{ id: 'item-1' }] })
      );
      wrapper = mountComponent();

      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledWith('/api/parents/parent-1/items');
      expect(wrapper.vm.items).toEqual([{ id: 'item-1' }]);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should support paginated responses exposing a content array', async () => {
      mockHttpGet.mockImplementation(() =>
        Promise.resolve({ data: { content: [{ id: 'item-1' }] } })
      );

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toEqual([{ id: 'item-1' }]);
    });

    it('should default to an empty list when the response has no content', async () => {
      mockHttpGet.mockImplementation(() => Promise.resolve({ data: {} }));

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toEqual([]);
    });

    it('should clear items and notify on loading error', async () => {
      wrapper.vm.items = [{ id: 'item-1' }];
      mockHttpGet.mockImplementation(() =>
        Promise.reject(new Error('load failed'))
      );

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toEqual([]);
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'loadError',
      });
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: openCreateDialog', () => {
    it('should open the form dialog with the configured form fields', () => {
      wrapper.vm.openCreateDialog();

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'form',
        data: {
          type: 'open',
          title: 'CreateFormDialog.title',
          content: '',
          uiNamespace: 'test-namespace.generic-editable-table-card',
          i18nScope: 'test-scope.GenericEditableTableCard.CreateFormDialog',
          instanceId: 'test-instance',
          formFields: defaultProps.formFields,
          onSubmit: wrapper.vm.createItem,
        },
      });
    });
  });

  describe('Test function: createItem', () => {
    it('should post the form data, notify, emit created and reload items', async () => {
      mockHttpGet.mockClear();

      await wrapper.vm.createItem({ name: 'new item' });

      expect(mockHttpPost).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        name: 'new item',
      });
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'createSuccess',
      });
      expect(wrapper.emitted('created')).toEqual([[{ name: 'new item' }]]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should notify and rethrow on creation error without reloading', async () => {
      const error = new Error('create failed');
      mockHttpPost.mockImplementationOnce(() => Promise.reject(error));
      mockHttpGet.mockClear();

      await expect(wrapper.vm.createItem({ name: 'new item' })).rejects.toBe(
        error
      );

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'createError',
      });
      expect(wrapper.emitted('created')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: openDeleteDialog', () => {
    it('should open the confirmation dialog with a confirm callback deleting the item', async () => {
      wrapper.vm.openDeleteDialog({ id: 'item-1' });

      expect(uiEventSubject.next).toHaveBeenCalledOnce();
      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.key).toBe('confirmation');
      expect(event.data.type).toBe('open');
      expect(event.data.title).toBe('DeleteConfirmationDialog.title');
      expect(event.data.content).toBe('DeleteConfirmationDialog.content');
      expect(event.data.uiNamespace).toBe(
        'test-namespace.generic-editable-table-card'
      );
      expect(event.data.i18nScope).toBe(
        'test-scope.GenericEditableTableCard.DeleteConfirmationDialog'
      );

      await event.data.onConfirm();

      expect(mockHttpDelete).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1'
      );
    });
  });

  describe('Test function: deleteItem', () => {
    it('should delete the item, notify, emit deleted and reload items', async () => {
      mockHttpGet.mockClear();

      await wrapper.vm.deleteItem({ id: 'item-1' });

      expect(mockHttpDelete).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1'
      );
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'deleteSuccess',
      });
      expect(wrapper.emitted('deleted')).toEqual([[{ id: 'item-1' }]]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should notify on deletion error without emitting nor reloading', async () => {
      mockHttpDelete.mockImplementationOnce(() =>
        Promise.reject(new Error('delete failed'))
      );
      mockHttpGet.mockClear();

      await wrapper.vm.deleteItem({ id: 'item-1' });

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'deleteError',
      });
      expect(wrapper.emitted('deleted')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });
});
