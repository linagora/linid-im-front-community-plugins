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
import GenericSortableListCard from '../../../../src/components/card/GenericSortableListCard.vue';

const mockNotify = vi.fn();
let mockZones = {};
let mockResizeCallback;
const mockHttpGet = vi.fn();
const mockHttpPost = vi.fn(() => Promise.resolve({ data: {} }));
const mockHttpPut = vi.fn(() => Promise.resolve({ data: {} }));
const mockHttpDelete = vi.fn(() => Promise.resolve({ data: {} }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    get: mockHttpGet,
    post: mockHttpPost,
    put: mockHttpPut,
    delete: mockHttpDelete,
  }),
  useScopedI18n: () => ({
    t: vi.fn((key) => `translated:${key}`),
    te: vi.fn(() => false),
    translateOrDefault: vi.fn((defaultValue) => defaultValue),
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useLinidZoneStore: () => ({
    hasZoneEntries: (zone) => (mockZones[zone]?.length ?? 0) > 0,
  }),
  useValueFormatter: () => ({
    formatValue: vi.fn((value, formatter, options) =>
      value == null || !formatter
        ? value
        : `${value}_formatted_${options?.formatKey}`
    ),
  }),
  useNunjucks: () => ({
    render: (value, context) =>
      value
        .replace('{{ entity.id }}', context.entity?.id ?? '')
        .replace('{{ item.id }}', context.item?.id ?? ''),
  }),
  uiEventSubject: {
    next: vi.fn(),
  },
}));

vi.mock('vuedraggable', () => ({ default: { template: '<div />' } }));

vi.mock('@vueuse/core', () => ({
  useResizeObserver: vi.fn((_target, callback) => {
    mockResizeCallback = callback;
  }),
}));

describe('Test component: GenericSortableListCard', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    entity: { id: 'parent-1' },
    formFields: [
      {
        name: 'name',
        type: 'String',
        input: 'Text',
        required: true,
        inputSettings: {},
      },
      {
        name: 'order',
        type: 'Number',
        input: 'Number',
        required: true,
        inputSettings: {},
      },
    ],
    endpoints: {
      find: '/api/parents/{{ entity.id }}/items',
      create: '/api/parents/{{ entity.id }}/items',
      delete: '/api/parents/{{ entity.id }}/items/{{ item.id }}',
      update: '/api/parents/{{ entity.id }}/items/{{ item.id }}',
    },
    itemKey: 'id',
    orderKey: 'order',
    fields: [
      { name: 'name', label: 'columns.name' },
      { name: 'order', label: 'columns.order' },
    ],
  };

  const singlePageResponse = (items) => ({
    data: { content: items, last: true },
  });

  function mountComponent(props = {}, slots = {}) {
    return shallowMount(GenericSortableListCard, {
      props: { ...defaultProps, ...props },
      slots,
      global: { stubs: { LinidZoneRenderer: true } },
    });
  }

  /**
   * Prefix every plugin zone is registered under, derived from localUiNamespace.
   */
  const zonePrefix = 'test-namespace.generic-sortable-list-card';

  /**
   * Mounts the component without a uiNamespace, silencing the resulting Vue warning
   * about the missing required prop.
   * @returns The component wrapper.
   */
  function mountWithoutUiNamespace() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mounted = mountComponent({ uiNamespace: undefined });
    warn.mockRestore();

    return mounted;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockZones = {};
    mockResizeCallback = undefined;
    mockHttpGet.mockResolvedValue(singlePageResponse([]));
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .GenericSortableListCard to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe(
        'test-scope.GenericSortableListCard'
      );
    });

    it('should fall back to instanceId when i18nScope is not provided', () => {
      wrapper = mountComponent({ i18nScope: undefined });
      expect(wrapper.vm.localI18nScope).toBe(
        'test-instance.GenericSortableListCard'
      );
    });

    it('should use GenericSortableListCard alone when neither i18nScope nor instanceId is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined, instanceId: undefined });
      expect(wrapper.vm.localI18nScope).toBe('GenericSortableListCard');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .generic-sortable-list-card to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.generic-sortable-list-card'
      );
    });

    it('should fall back to instanceId when uiNamespace is not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      wrapper = mountComponent({ uiNamespace: undefined });
      warn.mockRestore();
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-instance.generic-sortable-list-card'
      );
    });

    it('should use generic-sortable-list-card alone when neither uiNamespace nor instanceId is provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      wrapper = mountComponent({
        uiNamespace: undefined,
        instanceId: undefined,
      });
      warn.mockRestore();
      expect(wrapper.vm.localUiNamespace).toBe('generic-sortable-list-card');
    });
  });

  describe('Test computed: beforeFieldLabelsZoneName', () => {
    it('should suffix the local ui namespace with field-labels.before', () => {
      expect(wrapper.vm.beforeFieldLabelsZoneName).toBe(
        `${zonePrefix}.field-labels.before`
      );
    });

    it('should follow the instanceId fallback when uiNamespace is not provided', () => {
      wrapper = mountWithoutUiNamespace();

      expect(wrapper.vm.beforeFieldLabelsZoneName).toBe(
        'test-instance.generic-sortable-list-card.field-labels.before'
      );
    });
  });

  describe('Test computed: afterFieldLabelsZoneName', () => {
    it('should suffix the local ui namespace with field-labels.after', () => {
      expect(wrapper.vm.afterFieldLabelsZoneName).toBe(
        `${zonePrefix}.field-labels.after`
      );
    });
  });

  describe('Test computed: beforeFieldValuesZoneName', () => {
    it('should suffix the local ui namespace with field-values.before', () => {
      expect(wrapper.vm.beforeFieldValuesZoneName).toBe(
        `${zonePrefix}.field-values.before`
      );
    });
  });

  describe('Test computed: afterFieldValuesZoneName', () => {
    it('should suffix the local ui namespace with field-values.after', () => {
      expect(wrapper.vm.afterFieldValuesZoneName).toBe(
        `${zonePrefix}.field-values.after`
      );
    });
  });

  describe('Test computed: hasBeforeFieldsSection', () => {
    it('should be false when neither the slots nor the zones provide content', () => {
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(false);
    });

    it('should be true when the label slot is provided', () => {
      wrapper = mountComponent({}, { 'before-field-labels': '<div />' });
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(true);
    });

    it('should be true when the value slot is provided', () => {
      wrapper = mountComponent({}, { 'before-field-values': '<div />' });
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(true);
    });

    it('should be true when the label zone has an entry', () => {
      mockZones = { [`${zonePrefix}.field-labels.before`]: [{}] };
      wrapper = mountComponent();
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(true);
    });

    it('should be true when the value zone has an entry', () => {
      mockZones = { [`${zonePrefix}.field-values.before`]: [{}] };
      wrapper = mountComponent();
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(true);
    });

    it('should not be impacted by the after fields sources', () => {
      mockZones = { [`${zonePrefix}.field-values.after`]: [{}] };
      wrapper = mountComponent({}, { 'after-field-labels': '<div />' });
      expect(wrapper.vm.hasBeforeFieldsSection).toBe(false);
    });
  });

  describe('Test computed: hasAfterFieldsSection', () => {
    it('should be false when neither the slots nor the zones provide content', () => {
      expect(wrapper.vm.hasAfterFieldsSection).toBe(false);
    });

    it('should be true when the label slot is provided', () => {
      wrapper = mountComponent({}, { 'after-field-labels': '<div />' });
      expect(wrapper.vm.hasAfterFieldsSection).toBe(true);
    });

    it('should be true when the value slot is provided', () => {
      wrapper = mountComponent({}, { 'after-field-values': '<div />' });
      expect(wrapper.vm.hasAfterFieldsSection).toBe(true);
    });

    it('should be true when the label zone has an entry', () => {
      mockZones = { [`${zonePrefix}.field-labels.after`]: [{}] };
      wrapper = mountComponent();
      expect(wrapper.vm.hasAfterFieldsSection).toBe(true);
    });

    it('should be true when the value zone has an entry', () => {
      mockZones = { [`${zonePrefix}.field-values.after`]: [{}] };
      wrapper = mountComponent();
      expect(wrapper.vm.hasAfterFieldsSection).toBe(true);
    });

    it('should not be impacted by the before fields sources', () => {
      mockZones = { [`${zonePrefix}.field-values.before`]: [{}] };
      wrapper = mountComponent({}, { 'before-field-labels': '<div />' });
      expect(wrapper.vm.hasAfterFieldsSection).toBe(false);
    });
  });

  describe('Test computed: resolvedFields', () => {
    it('should translate the label of each field', () => {
      expect(wrapper.vm.resolvedFields.map((field) => field.label)).toEqual([
        'translated:columns.name',
        'translated:columns.order',
      ]);
    });

    it('should preserve the other field properties', () => {
      wrapper = mountComponent({
        fields: [
          {
            name: 'createdAt',
            label: 'columns.createdAt',
            formatter: 'toDate',
            formatOptions: { formatKey: 'application.dateFormat' },
          },
        ],
      });

      expect(wrapper.vm.resolvedFields[0]).toEqual({
        name: 'createdAt',
        label: 'translated:columns.createdAt',
        formatter: 'toDate',
        formatOptions: { formatKey: 'application.dateFormat' },
      });
    });

    it('should return an empty array when no field is configured', () => {
      wrapper = mountComponent({ fields: [] });

      expect(wrapper.vm.resolvedFields).toEqual([]);
    });
  });

  describe('Test computed: formattedItems', () => {
    it('should expose one entry per configured field and drop the other item properties', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([{ id: 'item-1', order: 1, name: 'First' }])
      );
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.vm.formattedItems).toEqual([{ name: 'First', order: 1 }]);
    });

    it('should apply the formatter of each field with its options', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-1', order: 1, createdAt: '2026-07-30' },
        ])
      );
      wrapper = mountComponent({
        fields: [
          {
            name: 'createdAt',
            label: 'columns.createdAt',
            formatter: 'toDate',
            formatOptions: { formatKey: 'application.dateFormat' },
          },
        ],
      });
      await flushPromises();

      expect(wrapper.vm.formattedItems).toEqual([
        { createdAt: '2026-07-30_formatted_application.dateFormat' },
      ]);
    });

    it('should be empty when no item is loaded', () => {
      expect(wrapper.vm.formattedItems).toEqual([]);
    });

    it.each([
      ['the item has no value for the field', { id: 'item-1', order: 1 }],
      ['the value is null', { id: 'item-1', order: 1, name: null }],
    ])('should fall back to an empty string when %s', async (_label, item) => {
      mockHttpGet.mockResolvedValue(singlePageResponse([item]));
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.vm.formattedItems[0].name).toBe('');
    });

    it('should keep a falsy value that is not nullish', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([{ id: 'item-1', order: 0, name: '' }])
      );
      wrapper = mountComponent();
      await flushPromises();

      expect(wrapper.vm.formattedItems).toEqual([{ name: '', order: 0 }]);
    });
  });

  describe('Test function: loadData', () => {
    it('should load items on mount from the rendered find endpoint', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-1', order: 1, name: 'First' },
          { id: 'item-2', order: 2, name: 'Second' },
        ])
      );
      wrapper = mountComponent();

      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/api/parents/parent-1/items',
        expect.objectContaining({ params: { page: 0, size: 50 } })
      );
      expect(wrapper.vm.items).toEqual([
        { id: 'item-1', order: 1, name: 'First' },
        { id: 'item-2', order: 2, name: 'Second' },
      ]);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should sort items by orderKey ascending', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-2', order: 2, name: 'Second' },
          { id: 'item-1', order: 1, name: 'First' },
        ])
      );
      wrapper = mountComponent();

      await flushPromises();

      expect(wrapper.vm.items[0].id).toBe('item-1');
      expect(wrapper.vm.items[1].id).toBe('item-2');
    });

    it('should apply itemMapperFn to each item before storing', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([{ id: 'item-1', order: 1, raw: true }])
      );
      wrapper = mountComponent({
        itemMapperFn: (item) => ({ ...item, mapped: true }),
      });

      await flushPromises();

      expect(wrapper.vm.items[0].mapped).toBe(true);
    });

    it('should overwrite items with an empty array when the response is empty', async () => {
      wrapper.vm.items = [{ id: 'existing', order: 1 }];
      mockHttpGet.mockResolvedValue(singlePageResponse([]));

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toEqual([]);
    });

    it('should reload when the entity is resolved asynchronously by the hosting page', async () => {
      wrapper = mountComponent({ entity: {} });
      await flushPromises();
      mockHttpGet.mockClear();

      await wrapper.setProps({ entity: { id: 'parent-1' } });
      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/api/parents/parent-1/items',
        expect.anything()
      );
    });

    it('should not reload when the resolved endpoint is unchanged', async () => {
      wrapper = mountComponent();
      await flushPromises();
      mockHttpGet.mockClear();

      await wrapper.setProps({ entity: { id: 'parent-1', extra: 'value' } });
      await flushPromises();

      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should clear items and notify on loading error', async () => {
      wrapper.vm.items = [{ id: 'item-1', order: 1 }];
      mockHttpGet.mockRejectedValue(new Error('load failed'));

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toEqual([]);
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated:loadError',
      });
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: getAllItems', () => {
    it('should return all items from a single page', async () => {
      mockHttpGet.mockClear();
      mockHttpGet.mockResolvedValue(
        singlePageResponse([{ id: 'item-1', order: 1 }])
      );

      const result = await wrapper.vm.getAllItems();

      expect(result).toEqual([{ id: 'item-1', order: 1 }]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should paginate through all pages until last is true', async () => {
      mockHttpGet.mockClear();
      mockHttpGet
        .mockResolvedValueOnce({
          data: { content: [{ id: 'item-1', order: 1 }], last: false },
        })
        .mockResolvedValueOnce({
          data: { content: [{ id: 'item-2', order: 2 }], last: true },
        });

      const result = await wrapper.vm.getAllItems();

      expect(result).toEqual([
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
      ]);
      expect(mockHttpGet).toHaveBeenCalledTimes(2);
      expect(mockHttpGet).toHaveBeenNthCalledWith(
        1,
        '/api/parents/parent-1/items',
        { params: { page: 0, size: 50 } }
      );
      expect(mockHttpGet).toHaveBeenNthCalledWith(
        2,
        '/api/parents/parent-1/items',
        { params: { page: 1, size: 50 } }
      );
    });

    it('should use the itemsQuerySize prop as the page size', async () => {
      mockHttpGet.mockResolvedValue(singlePageResponse([]));
      wrapper = mountComponent({ itemsQuerySize: 10 });
      await flushPromises();
      mockHttpGet.mockClear();
      mockHttpGet.mockResolvedValue(singlePageResponse([]));

      await wrapper.vm.getAllItems();

      expect(mockHttpGet).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        params: { page: 0, size: 10 },
      });
    });

    it('should treat a missing last flag as the final page', async () => {
      mockHttpGet.mockClear();
      mockHttpGet.mockResolvedValue({
        data: { content: [{ id: 'item-1', order: 1 }] },
      });

      const result = await wrapper.vm.getAllItems();

      expect(result).toHaveLength(1);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });
  });

  describe('Test function: openCreateDialog', () => {
    it('should open the form dialog with the correct data including a default order value', async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([{ id: 'item-1', order: 1 }])
      );
      wrapper = mountComponent();
      await flushPromises();

      wrapper.vm.openCreateDialog();

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'form',
        data: {
          type: 'open',
          title: 'translated:CreateFormDialog.title',
          content: '',
          uiNamespace: 'test-namespace.generic-sortable-list-card',
          i18nScope: 'test-scope.GenericSortableListCard.CreateFormDialog',
          instanceId: 'test-instance',
          formFields: defaultProps.formFields,
          initialFormData: { order: 2 },
          onSubmit: wrapper.vm.createItem,
        },
      });
    });

    it('should set the initial order to 1 when the list is empty', () => {
      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({ order: 1 });
    });

    it('should prefill each field with the default value of its input settings', () => {
      wrapper = mountComponent({
        formFields: [
          {
            name: 'name',
            type: 'String',
            input: 'Text',
            required: true,
            inputSettings: { defaultValue: 'unnamed' },
          },
          ...defaultProps.formFields.slice(1),
        ],
      });

      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({ name: 'unnamed', order: 1 });
    });

    it('should prefill the order even when it is not declared in the form fields', () => {
      wrapper = mountComponent({ formFields: [defaultProps.formFields[0]] });

      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({ order: 1 });
    });

    it('should keep the computed order over the default value of the order field', () => {
      wrapper = mountComponent({
        formFields: [
          defaultProps.formFields[0],
          {
            ...defaultProps.formFields[1],
            inputSettings: { defaultValue: 99 },
          },
        ],
      });

      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({ order: 1 });
    });

    it('should omit a field declaring no default value', () => {
      wrapper = mountComponent({
        formFields: [{ name: 'name', type: 'String', input: 'Text' }],
      });

      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({ order: 1 });
    });

    it.each([
      ['false', false],
      ['zero', 0],
      ['an empty string', ''],
    ])('should keep %s as a default value', (_label, defaultValue) => {
      wrapper = mountComponent({
        formFields: [
          {
            ...defaultProps.formFields[0],
            inputSettings: { defaultValue },
          },
        ],
      });

      wrapper.vm.openCreateDialog();

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.data.initialFormData).toEqual({
        name: defaultValue,
        order: 1,
      });
    });
  });

  describe('Test function: createItem', () => {
    it('should post the form data, notify, emit created and reload items', async () => {
      mockHttpPost.mockResolvedValueOnce({
        data: { id: 'new-id', name: 'new item' },
      });
      mockHttpGet.mockClear();

      await wrapper.vm.createItem({ name: 'new item' });

      expect(mockHttpPost).toHaveBeenCalledWith('/api/parents/parent-1/items', {
        name: 'new item',
      });
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'translated:createSuccess',
      });
      expect(wrapper.emitted('created')).toEqual([
        [{ id: 'new-id', name: 'new item' }],
      ]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should notify and rethrow on creation error without reloading', async () => {
      const error = new Error('create failed');
      mockHttpPost.mockRejectedValueOnce(error);
      mockHttpGet.mockClear();

      await expect(wrapper.vm.createItem({ name: 'new item' })).rejects.toBe(
        error
      );

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated:createError',
      });
      expect(wrapper.emitted('created')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: openDeleteDialog', () => {
    it('should open the confirmation dialog with a confirm callback deleting the item', async () => {
      wrapper.vm.openDeleteDialog({ id: 'item-1' }, 0);

      const event = uiEventSubject.next.mock.calls[0][0];
      expect(event.key).toBe('confirmation');
      expect(event.data.type).toBe('open');
      expect(event.data.title).toBe(
        'translated:DeleteConfirmationDialog.title'
      );
      expect(event.data.content).toBe(
        'translated:DeleteConfirmationDialog.content'
      );
      expect(event.data.uiNamespace).toBe(
        'test-namespace.generic-sortable-list-card'
      );
      expect(event.data.i18nScope).toBe(
        'test-scope.GenericSortableListCard.DeleteConfirmationDialog'
      );

      await event.data.onConfirm();

      expect(mockHttpDelete).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1'
      );
    });
  });

  describe('Test function: deleteItem', () => {
    it('should delete the item, update order, notify, emit deleted and reload', async () => {
      wrapper.vm.items = [
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
      ];
      mockHttpGet.mockClear();

      await wrapper.vm.deleteItem({ id: 'item-1' }, 0);

      expect(mockHttpDelete).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1'
      );
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'translated:deleteSuccess',
      });
      expect(wrapper.emitted('deleted')).toEqual([[{ id: 'item-1' }]]);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should remove the item from the local list immediately', async () => {
      wrapper.vm.items = [
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
      ];

      await wrapper.vm.deleteItem({ id: 'item-1' }, 0);

      expect(wrapper.vm.items.some((item) => item.id === 'item-1')).toBe(false);
    });

    it('should notify on deletion error without emitting nor reloading', async () => {
      mockHttpDelete.mockRejectedValueOnce(new Error('delete failed'));
      mockHttpGet.mockClear();

      await wrapper.vm.deleteItem({ id: 'item-1' }, 0);

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated:deleteError',
      });
      expect(wrapper.emitted('deleted')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: openEditDialog', () => {
    it('should open the form dialog pre-filled with the item data', () => {
      const item = { id: 'item-1', order: 1, name: 'First' };

      wrapper.vm.openEditDialog(item);

      expect(uiEventSubject.next).toHaveBeenCalledWith({
        key: 'form',
        data: {
          type: 'open',
          title: 'translated:EditFormDialog.title',
          content: '',
          uiNamespace: 'test-namespace.generic-sortable-list-card',
          i18nScope: 'test-scope.GenericSortableListCard.EditFormDialog',
          instanceId: 'test-instance',
          formFields: defaultProps.formFields,
          initialFormData: item,
          onSubmit: expect.any(Function),
        },
      });
    });

    it('should bind the onSubmit callback to updateItem for the given item', async () => {
      const item = { id: 'item-1', order: 1, name: 'First' };
      wrapper.vm.openEditDialog(item);

      const { onSubmit } = uiEventSubject.next.mock.calls[0][0].data;
      await onSubmit({ name: 'Updated' });

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { name: 'Updated' }
      );
    });
  });

  describe('Test function: updateItem', () => {
    it('should put the form data, notify, emit updated and reload', async () => {
      const item = { id: 'item-1', order: 1, name: 'First' };
      mockHttpGet.mockClear();

      await wrapper.vm.updateItem({ name: 'Updated' }, item);

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { name: 'Updated' }
      );
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'translated:updateSuccess',
      });
      expect(wrapper.emitted('updated')).toHaveLength(1);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should emit updated with the server response data', async () => {
      const item = { id: 'item-1', order: 1, name: 'First' };
      mockHttpPut.mockResolvedValueOnce({
        data: { id: 'item-1', order: 1, name: 'Updated' },
      });

      await wrapper.vm.updateItem({ name: 'Updated' }, item);

      expect(wrapper.emitted('updated')[0][0]).toMatchObject({
        id: 'item-1',
        order: 1,
        name: 'Updated',
      });
    });

    it('should notify and rethrow on update error without reloading', async () => {
      const error = new Error('update failed');
      mockHttpPut.mockRejectedValueOnce(error);
      mockHttpGet.mockClear();

      await expect(
        wrapper.vm.updateItem({ name: 'Updated' }, { id: 'item-1', order: 1 })
      ).rejects.toBe(error);

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated:updateError',
      });
      expect(wrapper.emitted('updated')).toBeUndefined();
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: onOrderChange', () => {
    beforeEach(async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-1', order: 1 },
          { id: 'item-2', order: 2 },
          { id: 'item-3', order: 3 },
        ])
      );
      wrapper = mountComponent();
      await flushPromises();
    });

    it('should set isOrderHasChanged to true when an item is added in the list', () => {
      wrapper.vm.onOrderChange({
        added: { element: { id: 'item-4', order: 4 }, newIndex: 3 },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(true);
    });

    it('should set isOrderHasChanged to true when an item is removed in the list', () => {
      wrapper.vm.onOrderChange({
        removed: { element: { id: 'item-1', order: 1 }, oldIndex: 0 },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(true);
    });

    it('should set isOrderHasChanged to true when an item is moved to a different position', () => {
      wrapper.vm.items = [
        { id: 'item-2', order: 2 },
        { id: 'item-1', order: 1 },
        { id: 'item-3', order: 3 },
      ];

      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-1', order: 1 },
          oldIndex: 0,
          newIndex: 1,
        },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(true);
    });

    it('should set isOrderHasChanged back to false when items are reordered back to their initial state', () => {
      wrapper.vm.items = [
        { id: 'item-2', order: 2 },
        { id: 'item-1', order: 1 },
        { id: 'item-3', order: 3 },
      ];
      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-1', order: 1 },
          oldIndex: 0,
          newIndex: 1,
        },
      });
      expect(wrapper.vm.isOrderHasChanged).toBe(true);

      wrapper.vm.items = [
        { id: 'item-1', order: 1 },
        { id: 'item-2', order: 2 },
        { id: 'item-3', order: 3 },
      ];
      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-1', order: 1 },
          oldIndex: 1,
          newIndex: 0,
        },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(false);
    });

    it('should not reset isOrderHasChanged when other items are still out of their original order', () => {
      wrapper.vm.isOrderHasChanged = true;
      wrapper.vm.items = [
        { id: 'item-1', order: 1 },
        { id: 'item-3', order: 3 },
        { id: 'item-2', order: 2 },
      ];

      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-1', order: 1 },
          oldIndex: 2,
          newIndex: 0,
        },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(true);
    });
  });

  describe('Test function: onOrderChange (non-contiguous order values)', () => {
    beforeEach(async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-a', order: 5 },
          { id: 'item-b', order: 10 },
          { id: 'item-c', order: 15 },
        ])
      );
      wrapper = mountComponent();
      await flushPromises();
    });

    it('should set isOrderHasChanged to true when an item is moved away from its initial position', () => {
      wrapper.vm.items = [
        { id: 'item-b', order: 10 },
        { id: 'item-a', order: 5 },
        { id: 'item-c', order: 15 },
      ];

      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-a', order: 5 },
          oldIndex: 0,
          newIndex: 1,
        },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(true);
    });

    it('should reset isOrderHasChanged to false when items are dragged back to their initial positions', () => {
      wrapper.vm.items = [
        { id: 'item-b', order: 10 },
        { id: 'item-a', order: 5 },
        { id: 'item-c', order: 15 },
      ];
      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-a', order: 5 },
          oldIndex: 0,
          newIndex: 1,
        },
      });
      expect(wrapper.vm.isOrderHasChanged).toBe(true);

      wrapper.vm.items = [
        { id: 'item-a', order: 5 },
        { id: 'item-b', order: 10 },
        { id: 'item-c', order: 15 },
      ];
      wrapper.vm.onOrderChange({
        moved: {
          element: { id: 'item-a', order: 5 },
          oldIndex: 1,
          newIndex: 0,
        },
      });

      expect(wrapper.vm.isOrderHasChanged).toBe(false);
    });
  });

  describe('Test function: saveOrder', () => {
    beforeEach(async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-1', order: 1, name: 'First' },
          { id: 'item-2', order: 2, name: 'Second' },
        ])
      );
      wrapper = mountComponent();
      await flushPromises();
      wrapper.vm.isOrderHasChanged = true;
    });

    it('should send a PUT for each item with its new index-based order', async () => {
      mockHttpGet.mockClear();

      await wrapper.vm.saveOrder();

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { id: 'item-1', order: 1, name: 'First' }
      );
      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-2',
        { id: 'item-2', order: 2, name: 'Second' }
      );
    });

    it('should notify, emit order-updated, reset isOrderHasChanged and reload', async () => {
      mockHttpGet.mockClear();

      await wrapper.vm.saveOrder();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'translated:updateOrderSuccess',
      });
      expect(wrapper.emitted('order-updated')).toHaveLength(1);
      expect(wrapper.vm.isOrderHasChanged).toBe(false);
      expect(mockHttpGet).toHaveBeenCalledOnce();
    });

    it('should notify on save order error without emitting nor resetting the flag', async () => {
      mockHttpPut.mockRejectedValueOnce(new Error('save failed'));
      mockHttpGet.mockClear();

      await wrapper.vm.saveOrder();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated:updateOrderError',
      });
      expect(wrapper.emitted('order-updated')).toBeUndefined();
      expect(wrapper.vm.isOrderHasChanged).toBe(true);
      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test function: updateItemsOrder', () => {
    it('should send a PUT for each item with its 1-based position as the order key', async () => {
      wrapper.vm.items = [
        { id: 'item-2', order: 1 },
        { id: 'item-1', order: 2 },
      ];

      await wrapper.vm.updateItemsOrder();

      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-2',
        { id: 'item-2', order: 1 }
      );
      expect(mockHttpPut).toHaveBeenCalledWith(
        '/api/parents/parent-1/items/item-1',
        { id: 'item-1', order: 2 }
      );
    });

    it('should send all PUT requests in parallel', async () => {
      wrapper.vm.items = [
        { id: 'item-1', order: 2 },
        { id: 'item-2', order: 1 },
        { id: 'item-3', order: 3 },
      ];

      await wrapper.vm.updateItemsOrder();

      expect(mockHttpPut).toHaveBeenCalledTimes(3);
    });
  });

  describe('Test function: applyLocalItemUpdate', () => {
    /**
     * Emits an update:entity event on the subject the component subscribed to on mount.
     * @param item - The updated item carried by the event.
     */
    function emitEntityUpdate(item) {
      mockUiEventCallback({ key: 'update:entity', data: item });
    }

    beforeEach(async () => {
      mockHttpGet.mockResolvedValue(
        singlePageResponse([
          { id: 'item-1', order: 1, name: 'First' },
          { id: 'item-2', order: 2, name: 'Second' },
        ])
      );
      wrapper = mountComponent({ listenToItemUpdate: 'update:entity' });
      await flushPromises();
    });

    it('should not subscribe when listenToItemUpdate is not set', async () => {
      mockHttpGet.mockResolvedValue(singlePageResponse([]));
      const localWrapper = mountComponent();
      await flushPromises();

      localWrapper.unmount();

      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it('should replace the matching item without sending any request', () => {
      emitEntityUpdate({ id: 'item-2', order: 2, name: 'Renamed' });

      expect(wrapper.vm.items).toEqual([
        { id: 'item-1', order: 1, name: 'First' },
        { id: 'item-2', order: 2, name: 'Renamed' },
      ]);
      expect(mockHttpPut).not.toHaveBeenCalled();
    });

    it('should flag the local changes as unsaved when the item diverges from the loaded one', () => {
      emitEntityUpdate({ id: 'item-2', order: 2, name: 'Renamed' });

      expect(wrapper.vm.hasUnsavedItemChanges).toBe(true);
      expect(wrapper.vm.unsavedChangesHintKey).toBe('saveUpdatedItemsHint');
    });

    it('should not flag anything when the item is updated back to its loaded values', () => {
      emitEntityUpdate({ id: 'item-2', order: 2, name: 'Renamed' });

      emitEntityUpdate({ id: 'item-2', order: 2, name: 'Second' });

      expect(wrapper.vm.hasUnsavedItemChanges).toBe(false);
      expect(wrapper.vm.unsavedChangesHintKey).toBeNull();
    });

    it('should leave the list untouched when no item matches the updated one', () => {
      emitEntityUpdate({ id: 'unknown', order: 9, name: 'Ghost' });

      expect(wrapper.vm.items).toEqual([
        { id: 'item-1', order: 1, name: 'First' },
        { id: 'item-2', order: 2, name: 'Second' },
      ]);
      expect(wrapper.vm.hasUnsavedItemChanges).toBe(false);
    });

    it('should ignore events emitted under another key', () => {
      mockUiEventCallback({
        key: 'other:event',
        data: { id: 'item-2', name: 'Renamed' },
      });

      expect(wrapper.vm.items).toEqual([
        { id: 'item-1', order: 1, name: 'First' },
        { id: 'item-2', order: 2, name: 'Second' },
      ]);
      expect(wrapper.vm.hasUnsavedItemChanges).toBe(false);
    });

    it('should ignore events with null data', () => {
      mockUiEventCallback({ key: 'update:entity', data: null });

      expect(wrapper.vm.items).toEqual([
        { id: 'item-1', order: 1, name: 'First' },
        { id: 'item-2', order: 2, name: 'Second' },
      ]);
      expect(wrapper.vm.hasUnsavedItemChanges).toBe(false);
    });

    it('should clear the unsaved item changes once the items are reloaded', async () => {
      emitEntityUpdate({ id: 'item-2', order: 2, name: 'Renamed' });

      await wrapper.vm.saveChanges();

      expect(wrapper.vm.hasUnsavedItemChanges).toBe(false);
      expect(wrapper.vm.unsavedChangesHintKey).toBeNull();
    });

    it('should unsubscribe from the ui events on unmount', () => {
      wrapper.unmount();

      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });
  });

  describe('Test observer: item actions section width', () => {
    /**
     * Invokes the resize callback registered by the component, as the observer would.
     * @param entries - Resize observer entries reported to the callback.
     */
    function reportResize(entries) {
      mockResizeCallback(entries);
    }

    it('should default the item actions width to 100px', () => {
      expect(wrapper.vm.itemActionsWidth).toBe('100px');
    });

    it('should align the header width on the observed section width', () => {
      reportResize([{ target: { offsetWidth: 240 } }]);

      expect(wrapper.vm.itemActionsWidth).toBe('240px');
    });

    it('should update the width on every reported resize', () => {
      reportResize([{ target: { offsetWidth: 240 } }]);
      expect(wrapper.vm.itemActionsWidth).toBe('240px');

      reportResize([{ target: { offsetWidth: 320 } }]);

      expect(wrapper.vm.itemActionsWidth).toBe('320px');
    });

    it('should fall back to the default width when no entry is reported', () => {
      reportResize([{ target: { offsetWidth: 240 } }]);

      reportResize([]);

      expect(wrapper.vm.itemActionsWidth).toBe('100px');
    });

    it('should fall back to the default width when the entry has no target', () => {
      reportResize([{ target: { offsetWidth: 240 } }]);

      reportResize([{ target: null }]);

      expect(wrapper.vm.itemActionsWidth).toBe('100px');
    });

    it('should fall back to the default width when the target reports no width', () => {
      reportResize([{ target: { offsetWidth: 240 } }]);

      reportResize([{ target: {} }]);

      expect(wrapper.vm.itemActionsWidth).toBe('100px');
    });
  });
});
