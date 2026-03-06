/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
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
import { nextTick } from 'vue';
import EntityAttributeDynamicListField from '../../../../src/components/field/EntityAttributeDynamicListField.vue';

const mockUi = vi.fn(() => ({}));
const mockT = vi.fn((key) => key);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({
    ui: mockUi,
  }),
  useScopedI18n: () => ({
    translateOrDefault: vi.fn(),
    t: mockT,
  }),
  useQuasarRules: () => [vi.fn(), vi.fn(), vi.fn()],
}));

const mockGetDynamicListPage = vi.fn();

vi.mock('../../../../src/services/dynamicListService', () => ({
  getDynamicListPage: (...args) => mockGetDynamicListPage(...args),
}));

describe('Test component: EntityAttributeDynamicListField', () => {
  let wrapper;
  const mockPage = {
    content: [
      { label: 'Value 1', value: 'value1' },
      { label: 'Value 2', value: 'value2' },
      { label: 'Value 3', value: 'value3' },
    ],
    totalElements: 50,
    totalPages: 5,
    number: 0,
    size: 10,
    last: false,
    first: true,
    numberOfElements: 3,
    empty: false,
    sort: { sorted: false, unsorted: true, empty: true },
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
    },
  };

  const initialMountingOptions = {
    props: {
      uiNamespace: 'namespace',
      instanceId: 'id',
      i18nScope: 'scope',
      definition: {
        name: 'type',
        type: 'String',
        required: false,
        hasValidations: false,
        input: 'DynamicList',
        inputSettings: {
          route: '/api/types',
          size: 10,
        },
      },
      entity: {
        name: 'entity-name',
      },
    },
    global: {
      stubs: {
        QSelect: {
          template: '<select><slot name="no-option" /></select>',
          props: [
            'modelValue',
            'prefix',
            'suffix',
            'options',
            'optionLabel',
            'optionValue',
            'emitValue',
            'mapOptions',
            'rules',
            'hint',
            'loading',
          ],
          emits: ['update:modelValue', 'virtualScroll'],
        },
        QItem: {
          template: '<div class="q-item"><slot /></div>',
        },
        QItemSection: {
          template: '<div><slot /></div>',
        },
      },
    },
  };
  let mountingOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDynamicListPage.mockResolvedValue(mockPage);
    mountingOptions = {
      ...initialMountingOptions,
      props: {
        ...initialMountingOptions.props,
        definition: {
          ...initialMountingOptions.props.definition,
          inputSettings: {
            ...initialMountingOptions.props.definition.inputSettings,
          },
        },
        entity: { ...initialMountingOptions.props.entity },
      },
    };
  });

  describe('Test props: ignoreRules', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should use default value', () => {
      expect(wrapper.vm.ignoreRules).toEqual(false);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ ignoreRules: true });

      expect(wrapper.vm.ignoreRules).toEqual(true);
    });
  });

  describe('Test ref: localValue', () => {
    it('should be initialized with entity value', () => {
      mountingOptions.props.entity.type = 'entity-type';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('entity-type');
    });

    it('should be initialized to null if entity value is not set', () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.localValue).toBeNull();
    });
  });

  describe('Test computed: pageSize', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should return size from inputSettings', () => {
      expect(wrapper.vm.pageSize).toEqual(10);
    });

    it('should return default size when not configured', async () => {
      await wrapper.setProps({
        definition: {
          ...mountingOptions.props.definition,
          inputSettings: {
            route: mountingOptions.props.definition.inputSettings.route,
          },
        },
      });

      expect(wrapper.vm.pageSize).toEqual(20);
    });
  });

  describe('Test computed: route', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should return route from inputSettings', () => {
      expect(wrapper.vm.route).toEqual('/api/types');
    });

    it('should return null if route is missing', async () => {
      await wrapper.setProps({
        definition: {
          ...mountingOptions.props.definition,
          inputSettings: {
            size: 10,
          },
        },
      });

      expect(wrapper.vm.route).toBeUndefined();
    });
  });

  describe('Test hook: onMounted', () => {
    it('should set error when route is missing from inputSettings', async () => {
      mountingOptions.props.definition.inputSettings = {};
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.error).toEqual('validation.dynamicList.missingRoute');
      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should call fetchPage on mount', async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledTimes(1);
      expect(mockGetDynamicListPage).toHaveBeenCalledWith('/api/types', {
        page: 0,
        size: 10,
      });
    });
  });

  describe('Test function: fetchPage', () => {
    beforeEach(async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();
    });

    it('should not fetch when route is missing', async () => {
      await wrapper.setProps({
        definition: {
          ...mountingOptions.props.definition,
          inputSettings: {
            size: 30,
          },
        },
      });

      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should not fetch when loading is true', async () => {
      wrapper.vm.isLoading = true;

      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should not fetch when hasMore is false', async () => {
      wrapper.vm.hasMore = false;
      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should call getDynamicListPage with size from props and current page', async () => {
      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).toHaveBeenCalledWith('/api/types', {
        page: 1, // 1 because already fetched page 0 on mount
        size: 10,
      });
    });

    it('should not change options if response content is empty', async () => {
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [],
      });

      wrapper.vm.allOptions = [
        { label: 'Value 1', value: 'value1' },
        { label: 'Value 2', value: 'value2' },
      ];
      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Value 1', value: 'value1' },
        { label: 'Value 2', value: 'value2' },
      ]);
    });

    it('should populate options after successful fetch', async () => {
      wrapper.vm.allOptions = [];
      await wrapper.vm.fetchPage();
      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Value 1', value: 'value1' },
        { label: 'Value 2', value: 'value2' },
        { label: 'Value 3', value: 'value3' },
      ]);
    });

    it('should increment page number after successful fetch', async () => {
      wrapper.vm.currentPage = 7;
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [
          { label: 'Value 4', value: 'value4' },
          { label: 'Value 5', value: 'value5' },
        ],
      });

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.currentPage).toEqual(8);
    });

    it('should set hasMore based on last page flag', async () => {
      wrapper.vm.hasMore = true;
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        last: true,
      });

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.hasMore).toEqual(false);
    });

    it('should set error on fetch failure', async () => {
      mockGetDynamicListPage.mockRejectedValue(new Error('Network error'));
      await wrapper.vm.fetchPage();

      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');
    });
  });

  describe('Test function: onVirtualScroll', () => {
    beforeEach(async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();
    });

    it('should not fetch when not at the end of the list', async () => {
      wrapper.vm.allOptions = [
        { label: 'Value 4', value: 'value4' },
        { label: 'Value 5', value: 'value5' },
      ];
      wrapper.vm.onVirtualScroll({ to: 0, ref: null });
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should fetch next page when scroll reaches end', async () => {
      wrapper.vm.allOptions = [
        { label: 'Value 4', value: 'value4' },
        { label: 'Value 5', value: 'value5' },
      ];
      wrapper.vm.onVirtualScroll({ to: 2, ref: null });
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalled();
    });
  });

  describe('Test computed: rules', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should return empty array if ignoreRules property is true', async () => {
      await wrapper.setProps({
        ignoreRules: true,
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {
            route: '/api/types',
            unique: true,
          },
        },
      });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should return empty array if ignoreRules field from inputSettings is true', async () => {
      await wrapper.setProps({
        ignoreRules: false,
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {
            route: '/api/types',
            unique: true,
            ignoreRules: true,
          },
        },
      });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should return rules if ignoreRules is false', async () => {
      await wrapper.setProps({
        ignoreRules: false,
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {
            route: '/api/types',
            unique: true,
            ignoreRules: false,
          },
        },
      });

      expect(wrapper.vm.rules.length).toEqual(3);
    });

    it('should return rules if ignoreRules is unset', async () => {
      await wrapper.setProps({
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {
            route: '/api/types',
            unique: true,
          },
        },
      });

      expect(wrapper.vm.rules.length).toEqual(3);
    });
  });

  describe('Test function: ensurePresetValueInOptions', () => {
    it('should add placeholder when entity has preset value not in options', async () => {
      mountingOptions.props.entity.type = 'unknown-value';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.allOptions[0]).toEqual({
        label: 'unknown-value',
        value: 'unknown-value',
      });
      expect(wrapper.vm.allOptions.length).toEqual(4);
    });

    it('should not add placeholder when entity value is found in options', async () => {
      mountingOptions.props.entity.type = 'value2';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.allOptions.length).toEqual(3);
      expect(wrapper.vm.allOptions.every((o) => o.label !== 'value2')).toBe(
        true
      );
    });

    it('should not add placeholder when entity has no value', async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.allOptions.length).toEqual(3);
    });
  });

  describe('Test function: removePlaceholderIfResolved', () => {
    it('should remove placeholder when real option is loaded on subsequent page', async () => {
      mountingOptions.props.entity.type = 'value-on-page2';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.allOptions[0]).toEqual({
        label: 'value-on-page2',
        value: 'value-on-page2',
      });

      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [{ label: 'Real Label', value: 'value-on-page2' }],
        last: true,
      });
      await wrapper.vm.fetchPage();

      const matching = wrapper.vm.allOptions.filter(
        (o) => o.value === 'value-on-page2'
      );
      expect(matching.length).toEqual(1);
      expect(matching[0].label).toEqual('Real Label');
    });
  });

  describe('Test function: updateValue', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should emit event', () => {
      wrapper.vm.localValue = 'admin';

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          type: 'admin',
        },
      ]);
    });
  });

  describe('Test watch: entity', () => {
    beforeEach(() => {
      mountingOptions.props.entity.type = 'standard';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should update localValue when entity attribute value changes', async () => {
      expect(wrapper.vm.localValue).toEqual('standard');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          type: 'premium',
        },
      });

      expect(wrapper.vm.localValue).toEqual('premium');
    });

    it('should set localValue to null when attribute is undefined', async () => {
      expect(wrapper.vm.localValue).toEqual('standard');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
        },
      });

      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should set localValue to null when attribute is null', async () => {
      expect(wrapper.vm.localValue).toEqual('standard');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          type: null,
        },
      });

      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should update localValue when entity reference changes', async () => {
      const newEntity = {
        name: 'updated-name',
        type: 'enterprise',
      };
      expect(wrapper.vm.localValue).toEqual('standard');

      await wrapper.setProps({ entity: newEntity });

      expect(wrapper.vm.localValue).toEqual('enterprise');
    });

    it('should not update localValue when another entity attribute changes', async () => {
      wrapper.vm.localValue = 'free';

      await wrapper.setProps({
        entity: {
          name: 'updated-name',
          type: 'standard',
        },
      });

      expect(wrapper.vm.localValue).toEqual('free');
    });
  });
});
