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
const mockHttpGet = vi.fn(() => Promise.resolve({ data: { content: [] } }));
const mockToPagination = vi.fn(() => 'Converted pagination');
const mockToQuasarPagination = vi.fn(() => 'Updated pagination');
const mockHttpPost = vi.fn(() => Promise.resolve({ data: {} }));
const mockHttpPut = vi.fn(() => Promise.resolve({ data: {} }));
const mockT = vi.fn((key) => key);
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);
const mockHttpDelete = vi.fn(() => Promise.resolve({ data: {} }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: { template: '<div />' },
  getHttpClient: () => ({
    get: mockHttpGet,
    post: mockHttpPost,
    put: mockHttpPut,
    delete: mockHttpDelete,
  }),
  useScopedI18n: () => ({
    t: mockT,
    te: vi.fn(() => false),
    translateOrDefault: mockTranslateOrDefault,
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  usePagination: () => ({
    toPagination: mockToPagination,
    toQuasarPagination: mockToQuasarPagination,
  }),
  useNunjucks: () => {
    function render(value, context) {
      if (typeof value === 'string') {
        return value
          .replace('{{ entity.id }}', context.entity?.id ?? '')
          .replace('{{ item.id }}', context.item?.id ?? '')
          .replace('{{ formData.name }}', context.formData?.name ?? '');
      }
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [
            key,
            render(nested, context),
          ])
        );
      }
      return value;
    }
    return { render, renderString: render };
  },
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
    entity: { id: 'parent-1' },
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
      find: '/api/parents/{{ entity.id }}/items',
      create: '/api/parents/{{ entity.id }}/items',
      update: '/api/parents/{{ entity.id }}/items/{{ item.id }}',
      delete: '/api/parents/{{ entity.id }}/items/{{ item.id }}',
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
    mockHttpGet.mockImplementation(() =>
      Promise.resolve({ data: { content: [] } })
    );
    mockToPagination.mockImplementation(() => 'Converted pagination');
    mockToQuasarPagination.mockImplementation(() => 'Updated pagination');
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .GenericEditableTableCard to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe(
        'test-scope.GenericEditableTableCard'
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

    it('should not append the actions column when enableRowActions is false', () => {
      wrapper = mountComponent({ enableRowActions: false });

      expect(
        wrapper.vm.columns.some((column) => column.name === 'table_actions')
      ).toBe(false);
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
    it('should load the first page on mount from the rendered find endpoint', async () => {
      const data = { content: [{ id: 'item-1' }], totalElements: 1 };
      mockHttpGet.mockImplementation(() => Promise.resolve({ data }));
      wrapper = mountComponent();

      await flushPromises();

      expect(mockToPagination).toHaveBeenCalledWith({
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0,
        sortBy: null,
        descending: true,
      });
      expect(mockHttpGet).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        params: 'Converted pagination',
      });
      expect(wrapper.vm.items).toEqual([{ id: 'item-1' }]);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should update the pagination from the received page and the current pagination', async () => {
      const data = { content: [], number: 2, size: 5, totalElements: 23 };
      const current = {
        page: 3,
        rowsPerPage: 5,
        rowsNumber: 60,
        sortBy: 'name',
        descending: false,
      };
      wrapper.vm.pagination = current;
      mockHttpGet.mockImplementation(() => Promise.resolve({ data }));

      await wrapper.vm.loadData();

      expect(mockToPagination).toHaveBeenLastCalledWith(current);
      expect(mockToQuasarPagination).toHaveBeenCalledWith(data, current);
      expect(wrapper.vm.pagination).toBe('Updated pagination');
    });

    it('should not load nor notify while the parent entity is not resolved', async () => {
      mockHttpGet.mockClear();
      mockNotify.mockClear();
      wrapper = mountComponent({ entity: {} });

      await flushPromises();

      expect(mockHttpGet).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.vm.items).toEqual([]);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should load on mount when no parent entity is provided', async () => {
      mockHttpGet.mockClear();
      wrapper = mountComponent({
        entity: undefined,
        endpoints: { ...defaultProps.endpoints, find: '/api/items' },
      });

      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledWith('/api/items', {
        params: 'Converted pagination',
      });
    });

    it('should reload when the entity is resolved asynchronously by the hosting page', async () => {
      wrapper = mountComponent({ entity: {} });
      await flushPromises();
      mockHttpGet.mockClear();

      await wrapper.setProps({ entity: { id: 'parent-1' } });
      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        params: 'Converted pagination',
      });
    });

    it('should not reload when the resolved endpoint is unchanged', async () => {
      wrapper = mountComponent();
      await flushPromises();
      mockHttpGet.mockClear();

      await wrapper.setProps({ entity: { id: 'parent-1', name: 'new' } });
      await flushPromises();

      expect(mockHttpGet).not.toHaveBeenCalled();
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

  describe('Test function: onRequest', () => {
    it('should apply the requested pagination and reload the items', async () => {
      mockHttpGet.mockClear();
      const requested = {
        page: 2,
        rowsPerPage: 5,
        rowsNumber: 23,
        sortBy: 'name',
        descending: false,
      };

      await wrapper.vm.onRequest({ pagination: requested });

      expect(mockToPagination).toHaveBeenCalledWith(requested);
      expect(mockHttpGet).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        params: 'Converted pagination',
      });
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

    it('should not call the API when the create endpoint is not configured', async () => {
      wrapper = mountComponent({
        endpoints: { ...defaultProps.endpoints, create: undefined },
      });
      mockHttpGet.mockClear();

      await wrapper.vm.createItem({ name: 'new item' });

      expect(mockHttpPost).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.emitted('created')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: openEditDialog', () => {
    it('should open the form dialog pre-filled with the edited item', () => {
      const item = { id: 'item-1', name: 'current name' };

      wrapper.vm.openEditDialog(item);

      expect(uiEventSubject.next).toHaveBeenCalledOnce();
      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.key).toBe('form');
      expect(event.data.type).toBe('open');
      expect(event.data.title).toBe('EditFormDialog.title');
      expect(event.data.content).toBe('');
      expect(event.data.uiNamespace).toBe(
        'test-namespace.generic-editable-table-card'
      );
      expect(event.data.i18nScope).toBe(
        'test-scope.GenericEditableTableCard.EditFormDialog'
      );
      expect(event.data.instanceId).toBe('test-instance');
      expect(event.data.formFields).toEqual(defaultProps.formFields);
      expect(event.data.initialFormData).toBe(item);
      expect(mockT).toHaveBeenCalledWith('EditFormDialog.title', item);
      expect(mockTranslateOrDefault).toHaveBeenCalledWith(
        '',
        'EditFormDialog.content',
        item
      );
    });

    it('should submit the form data against the edited item', async () => {
      wrapper.vm.openEditDialog({ id: 'item-1' });
      const event = uiEventSubject.next.mock.calls[0][0];

      await event.data.onSubmit({ name: 'new name' });

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { name: 'new name' }
      );
    });

    it('should use the edit form fields instead of the form fields when configured', () => {
      const editFormFields = [
        {
          name: 'relationExtraParameters.role',
          type: 'String',
          input: 'Text',
          inputSettings: {},
        },
      ];
      wrapper = mountComponent({ editFormFields });

      wrapper.vm.openEditDialog({ id: 'item-1' });

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.formFields).toEqual(editFormFields);
    });
  });

  describe('Test function: updateItem', () => {
    it('should put the form data, notify, emit the updated item and reload items', async () => {
      const updated = { id: 'item-1', name: 'new name' };
      mockHttpPut.mockImplementationOnce(() =>
        Promise.resolve({ data: updated })
      );
      mockHttpGet.mockClear();

      await wrapper.vm.updateItem({ id: 'item-1' }, { name: 'new name' });

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { name: 'new name' }
      );
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'updateSuccess',
      });
      // the API response is the source of truth for the emitted item.
      expect(wrapper.emitted('updated')).toEqual([[updated]]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should notify and rethrow on update error without reloading', async () => {
      const error = new Error('update failed');
      mockHttpPut.mockImplementationOnce(() => Promise.reject(error));
      mockHttpGet.mockClear();

      await expect(
        wrapper.vm.updateItem({ id: 'item-1' }, { name: 'new name' })
      ).rejects.toBe(error);

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'updateError',
      });
      expect(wrapper.emitted('updated')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should send the rendered update body instead of the form data when configured', async () => {
      wrapper = mountComponent({
        updateBody: { extraParameters: '{{ formData.name }}' },
      });
      await flushPromises();

      await wrapper.vm.updateItem({ id: 'item-1' }, { name: 'new name' });

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { extraParameters: 'new name' }
      );
    });

    it('should not call the API when the update endpoint is not configured', async () => {
      wrapper = mountComponent({
        endpoints: { ...defaultProps.endpoints, update: undefined },
      });
      await flushPromises();
      mockHttpGet.mockClear();

      await wrapper.vm.updateItem({ id: 'item-1' }, { name: 'new name' });

      expect(mockHttpPut).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.emitted('updated')).toBeUndefined();
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

    it('should not call the API when the delete endpoint is not configured', async () => {
      wrapper = mountComponent({
        endpoints: { ...defaultProps.endpoints, delete: undefined },
      });
      mockHttpGet.mockClear();

      await wrapper.vm.deleteItem({ id: 'item-1' });

      expect(mockHttpDelete).not.toHaveBeenCalled();
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.emitted('deleted')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });
});
