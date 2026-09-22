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

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const { getNestedValue, setNestedValue } = await vi.importActual(
    '@linagora/linid-im-front-corelib'
  );
  return {
    getNestedValue,
    setNestedValue,
    useUiDesign: () => ({
      ui: mockUi,
    }),
    useScopedI18n: () => ({
      translateOrDefault: vi.fn(),
      t: mockT,
    }),
    useQuasarRules: () => [vi.fn(), vi.fn(), vi.fn()],
    useNunjucks: () => ({
      renderString: (value, context) =>
        value.replace(
          /\{\{\s*([\w.]+)\s*\}\}/g,
          (_, path) =>
            path.split('.').reduce((acc, key) => acc?.[key], context) ?? ''
        ),
    }),
  };
});

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
          name: 'type',
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
          name: 'type',
          ...mountingOptions.props.definition,
          inputSettings: {
            route: mountingOptions.props.definition.inputSettings.route,
          },
        },
      });

      expect(wrapper.vm.pageSize).toEqual(20);
    });
  });

  describe('Test computed: renderedRoute', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should return an empty string if route is missing', async () => {
      await wrapper.setProps({
        definition: {
          name: 'type',
          ...mountingOptions.props.definition,
          inputSettings: {
            size: 10,
          },
        },
      });

      expect(wrapper.vm.renderedRoute).toEqual('');
    });

    it('should render the route template against the entity', async () => {
      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-1' },
        definition: {
          name: 'type',
          ...mountingOptions.props.definition,
          inputSettings: {
            route: '/api/organizations/{{ entity.organizationId }}/units',
            size: 10,
          },
        },
      });

      expect(wrapper.vm.renderedRoute).toEqual(
        '/api/organizations/org-1/units'
      );
    });
  });

  describe('Test computed: configurationError', () => {
    it('should report a route missing from inputSettings', async () => {
      mountingOptions.props.definition.inputSettings = {};
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.configurationError).toEqual(
        'validation.dynamicList.missingRoute'
      );
      expect(wrapper.vm.displayedError).toEqual(
        'validation.dynamicList.missingRoute'
      );
      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    // A templated route that has not resolved yet is a load waiting for its values, not a broken
    // configuration: the setting is there, so nothing is reported.
    it('should report nothing when a configured route renders empty', async () => {
      mountingOptions.props.definition.inputSettings.route =
        '{{ entity.listRoute }}';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.renderedRoute).toEqual('');
      expect(wrapper.vm.configurationError).toBeNull();
      expect(wrapper.vm.displayedError).toBeNull();
      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    // Being derived from the props, it cannot be cleared by the loading flow — unlike the `error`
    // ref, which every suspension resets.
    it('should stay reported once a dependency is filled in', async () => {
      mountingOptions.props.definition.inputSettings = {
        routeDependencies: ['entity.organizationId'],
      };
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-1' },
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.displayedError).toEqual(
        'validation.dynamicList.missingRoute'
      );
      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should let a fetch error through when the configuration is sound', async () => {
      mockGetDynamicListPage.mockRejectedValue(new Error('Network error'));
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.configurationError).toBeNull();
      expect(wrapper.vm.displayedError).toEqual(
        'validation.dynamicList.fetchError'
      );
    });
  });

  describe('Test watch: fetch trigger — rendered route', () => {
    // A route that rendered empty is a suspension, not a configuration error: nothing can be
    // requested, but nothing is invalidated either. `missingRoute` is derived from the `route`
    // setting alone, so a template that resolved to nothing never reports it.
    it('should suspend without requesting anything when the rendered route becomes empty', async () => {
      mountingOptions.props.entity.listRoute = '/api/types';
      mountingOptions.props.entity.type = 'value2';
      mountingOptions.props.definition.inputSettings.route =
        '{{ entity.listRoute }}';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      expect(wrapper.vm.allOptions.length).toEqual(3);
      mockGetDynamicListPage.mockClear();

      await wrapper.setProps({
        entity: { name: 'entity-name', listRoute: '', type: 'value2' },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
      expect(wrapper.vm.displayedError).toBeNull();
      expect(wrapper.vm.allOptions.length).toEqual(3);
      expect(wrapper.vm.localValue).toEqual('value2');
      expect(wrapper.vm.currentFetch).not.toBeNull();
    });

    it('should call fetchPage on mount', async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledTimes(1);
      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/types',
        {
          page: 0,
          size: 10,
        },
        expect.any(AbortSignal)
      );
    });

    it('should not reload when the entity changes outside of the route', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/units';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();

      await wrapper.setProps({
        entity: { name: 'renamed', organizationId: 'org-1' },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    // `clearSelection()` runs before the reload, so `ensurePresetValueInOptions()` finds no value
    // left to represent: the new list never presents the old selection as one of its own options.
    // A route change abandons everything the previous one produced: page 0 of the new route is
    // requested, the list is replaced, the cursor restarts — and the selection is dropped before
    // the reload, so `ensurePresetValueInOptions()` finds no value left to re-inject as a
    // placeholder. A unit chosen under org-1 must not survive as an option of org-2's list.
    it('should reload from page 0 and drop the selection when the rendered route changes', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.entity.type = 'unit-a';
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/units';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      expect(wrapper.vm.localValue).toEqual('unit-a');
      expect(wrapper.vm.allOptions[0]).toEqual({
        label: 'unit-a',
        value: 'unit-a',
      });
      mockGetDynamicListPage.mockClear();
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [{ label: 'Unit B', value: 'unit-b' }],
        last: true,
      });

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          organizationId: 'org-2',
          type: 'unit-a',
        },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/organizations/org-2/units',
        { page: 0, size: 10 },
        expect.any(AbortSignal)
      );
      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Unit B', value: 'unit-b' },
      ]);
      expect(wrapper.vm.currentFetch.nextPage).toEqual(1);
      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          organizationId: 'org-2',
          type: null,
        },
      ]);
    });

    // A -> B -> A while the very first request for A is still in flight. The response that lands
    // first belongs to a fetch that was replaced, even though the fetch now current reads from the
    // same URL: the guard compares identities, not routes, so page 0 must be appended only once.
    it('should discard a superseded response targeting the same route', async () => {
      const resolvers = [];
      mockGetDynamicListPage.mockImplementation(
        () => new Promise((resolve) => resolvers.push(resolve))
      );
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/units';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-2' },
      });
      await nextTick();
      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-1' },
      });
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledTimes(3);
      resolvers[0]({
        ...mockPage,
        content: [{ label: 'Stale', value: 'stale' }],
        last: true,
      });
      await nextTick();
      await nextTick();

      // The stale response owns none of the shared state anymore: not the list, not the spinner,
      // which the fetch that replaced it is still driving.
      expect(wrapper.vm.allOptions).toEqual([]);
      expect(wrapper.vm.isLoading).toEqual(true);
      expect(wrapper.vm.error).toBeNull();

      resolvers[2]({
        ...mockPage,
        content: [{ label: 'Unit A', value: 'unit-a' }],
        last: true,
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Unit A', value: 'unit-a' },
      ]);
      expect(wrapper.vm.isLoading).toEqual(false);
      expect(wrapper.vm.currentFetch.nextPage).toEqual(1);
      expect(wrapper.vm.currentFetch.hasMore).toEqual(false);
    });
  });

  describe('Test computed: areDependenciesSatisfied', () => {
    const mountWith = (routeDependencies, entity) => {
      mountingOptions.props.definition.inputSettings.routeDependencies =
        routeDependencies;
      mountingOptions.props.entity = entity;
      return shallowMount(EntityAttributeDynamicListField, mountingOptions);
    };

    it('should be true when no dependency is declared', () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(true);
    });

    it('should be true when every dependency holds a value', () => {
      wrapper = mountWith(['entity.organizationId', 'entity.unitId'], {
        organizationId: 'org-1',
        unitId: 'unit-1',
      });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(true);
    });

    it('should be false when a dependency is undefined', () => {
      wrapper = mountWith(['entity.organizationId'], { name: 'entity-name' });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(false);
    });

    it('should be false when a dependency is a blank string', () => {
      wrapper = mountWith(['entity.organizationId'], {
        organizationId: '   ',
      });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(false);
    });

    it('should be false when a dependency is an empty array', () => {
      wrapper = mountWith(['entity.roles'], { roles: [] });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(false);
    });

    it('should be true when a dependency holds a falsy but non-empty value', () => {
      wrapper = mountWith(['entity.count', 'entity.enabled'], {
        count: 0,
        enabled: false,
      });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(true);
    });

    // A present-but-empty value rather than an absent path, so this covers a combination none of the
    // single-dependency cases above reach: `every` must reject on a later entry, not only the first.
    it('should be false when only part of the dependencies are set', () => {
      wrapper = mountWith(['entity.organizationId', 'entity.unitId'], {
        organizationId: 'org-1',
        unitId: '',
      });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(false);
    });

    it('should resolve a dependency located in a nested path', () => {
      wrapper = mountWith(['entity.extraParameters.organizationId'], {
        extraParameters: { organizationId: 'org-1' },
      });

      expect(wrapper.vm.areDependenciesSatisfied).toEqual(true);
    });
  });

  describe('Test computed: isDisabled', () => {
    it('should be false when no dependency is declared and disable is unset', () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.isDisabled).toEqual(false);
    });

    it('should be true when disable is set in inputSettings', () => {
      mountingOptions.props.definition.inputSettings.disable = true;
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.isDisabled).toEqual(true);
    });

    // inputSettings come from a JSON configuration, so disable is read as truthy rather than
    // compared to true: a "true" string must disable this field as it disables the other ones.
    it('should be true when disable is truthy without being a boolean', () => {
      mountingOptions.props.definition.inputSettings.disable = 'true';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.isDisabled).toEqual(true);
    });

    it('should be true when a dependency is empty', () => {
      mountingOptions.props.definition.inputSettings.routeDependencies = [
        'entity.organizationId',
      ];
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);

      expect(wrapper.vm.isDisabled).toEqual(true);
    });
  });

  describe('Test watch: fetch trigger — dependencies', () => {
    beforeEach(() => {
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/units';
      mountingOptions.props.definition.inputSettings.routeDependencies = [
        'entity.organizationId',
      ];
    });

    it('should not fetch while a dependency is empty', async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
      expect(wrapper.vm.error).toBeNull();
    });

    // Covers the single-dependency case too: the fetch only happens on the last one filled in.
    it('should fetch once every dependency holds a value', async () => {
      mountingOptions.props.definition.inputSettings.routeDependencies = [
        'entity.organizationId',
        'entity.unitId',
      ];
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      await wrapper.setProps({ entity: { organizationId: 'org-1' } });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();

      await wrapper.setProps({
        entity: { organizationId: 'org-1', unitId: 'unit-1' },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/organizations/org-1/units',
        { page: 0, size: 10 },
        expect.any(AbortSignal)
      );
    });

    it('should reload only once when a dependency also changes the rendered route', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-2' },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledTimes(1);
      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/organizations/org-2/units',
        { page: 0, size: 10 },
        expect.any(AbortSignal)
      );
    });

    it('should keep the options and the selection when a dependency becomes empty', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.entity.type = 'value2';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      expect(wrapper.vm.allOptions.length).toEqual(3);
      mockGetDynamicListPage.mockClear();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: '', type: 'value2' },
      });
      await nextTick();
      await nextTick();

      // The field is disabled, so the list is unreachable — but keeping it is what lets q-select
      // still resolve the selected value to its label instead of showing the raw value. The fetch
      // is suspended, not abandoned: it keeps its cursor so restoring the dependency resumes it.
      expect(wrapper.vm.allOptions.length).toEqual(3);
      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
      expect(wrapper.vm.localValue).toEqual('value2');
      expect(wrapper.emitted('update:entity')).toBeUndefined();
      expect(wrapper.vm.currentFetch).not.toBeNull();
      expect(wrapper.vm.currentFetch.nextPage).toEqual(1);
    });

    // Suspending does not abort: the request reads the route the field is still on, so its response
    // belongs to the list being displayed and is kept, placeholder included.
    it('should keep a page arriving after a dependency was emptied', async () => {
      let resolvePage;
      mockGetDynamicListPage.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePage = resolve;
          })
      );
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.entity.type = 'unit-b';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: '', type: 'unit-b' },
      });
      await nextTick();
      resolvePage({
        ...mockPage,
        content: [{ label: 'Unit A', value: 'unit-a' }],
        last: true,
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.localValue).toEqual('unit-b');
      expect(wrapper.vm.allOptions).toEqual([
        { label: 'unit-b', value: 'unit-b' },
        { label: 'Unit A', value: 'unit-a' },
      ]);
    });

    // The whole point of suspending rather than abandoning: the route is unchanged, so the callback
    // returns at once and nothing is reloaded — options, selection and cursor all carry on, and the
    // next scroll asks for page 1 rather than replaying page 0.
    it('should resume where it stopped when the dependency is restored to the same value', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.entity.type = 'unit-a';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: '', type: 'unit-a' },
      });
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          organizationId: 'org-1',
          type: 'unit-a',
        },
      });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
      expect(wrapper.vm.localValue).toEqual('unit-a');
      expect(wrapper.emitted('update:entity')).toBeUndefined();
      // The placeholder built on the first load is still there — nothing rebuilt it, nothing
      // dropped it.
      expect(wrapper.vm.allOptions[0]).toEqual({
        label: 'unit-a',
        value: 'unit-a',
      });
      expect(wrapper.vm.allOptions.length).toEqual(4);

      wrapper.vm.onVirtualScroll({ to: 3, ref: null });
      await nextTick();
      await nextTick();

      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/organizations/org-1/units',
        { page: 1, size: 10 },
        expect.any(AbortSignal)
      );
    });

    // The error belongs to the fetch, and a suspension keeps the fetch — so it keeps the error. The
    // alternative would make the message depend on *when* the request failed: one cleared by the
    // suspension if it failed before, one left standing if it failed while suspended.
    it('should keep a previous fetch error when a dependency becomes empty', async () => {
      mockGetDynamicListPage.mockRejectedValue(new Error('Network error'));
      mountingOptions.props.entity.organizationId = 'org-1';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: null },
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');
    });

    // An abandoned fetch does clear it: `cancelFetch()` is what kills the fetch the error belonged
    // to, so the route change starts from a clean state.
    it('should clear a previous fetch error when the route changes', async () => {
      mockGetDynamicListPage.mockRejectedValue(new Error('Network error'));
      mountingOptions.props.entity.organizationId = 'org-1';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');
      mockGetDynamicListPage.mockResolvedValue(mockPage);

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-2' },
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.allOptions.length).toEqual(3);
    });

    it('should keep the preset value on the first load', async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          organizationId: 'org-1',
          type: 'unit-a',
        },
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.localValue).toEqual('unit-a');
      expect(wrapper.vm.allOptions[0]).toEqual({
        label: 'unit-a',
        value: 'unit-a',
      });
      expect(wrapper.emitted('update:entity')).toBeUndefined();
    });

    // The mirror of `should resume … restored to the same value`: coming back to the same route
    // keeps everything, moving to another one drops the selection — even when the field went
    // through the suspended state in between, a path the direct org-1 -> org-2 test never takes.
    it('should drop the selection when the route changes through an emptied dependency', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.entity.type = 'unit-a';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: '', type: 'unit-a' },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.vm.localValue).toEqual('unit-a');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          organizationId: 'org-2',
          type: 'unit-a',
        },
      });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        { name: 'entity-name', organizationId: 'org-2', type: null },
      ]);
    });
  });

  describe('Test function: cancelFetch', () => {
    beforeEach(async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();
    });

    it('should abandon the current fetch, abort its request and clear the states it owns', () => {
      const { controller } = wrapper.vm.currentFetch;
      wrapper.vm.error = 'validation.dynamicList.fetchError';
      wrapper.vm.isLoading = true;

      wrapper.vm.cancelFetch();

      // Dropping `currentFetch` is what makes `isStale` work: without it, a response that already
      // landed would be applied to the list that replaced it.
      expect(wrapper.vm.currentFetch).toBeNull();
      expect(controller.signal.aborted).toBe(true);
      expect(wrapper.vm.isLoading).toEqual(false);
      expect(wrapper.vm.error).toBeNull();
    });

    it('should be called on unmount so the in-flight request is aborted', () => {
      const { controller } = wrapper.vm.currentFetch;
      expect(controller.signal.aborted).toBe(false);

      wrapper.unmount();

      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('Test function: fetchPage', () => {
    beforeEach(async () => {
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      mockGetDynamicListPage.mockClear();
    });

    it('should not fetch when a request of the current fetch is already pending', async () => {
      wrapper.vm.currentFetch.hasPendingRequest = true;

      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should not fetch when hasMore is false', async () => {
      wrapper.vm.currentFetch.hasMore = false;
      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).not.toHaveBeenCalled();
    });

    it('should call getDynamicListPage with size from props and current page', async () => {
      await wrapper.vm.fetchPage();

      expect(mockGetDynamicListPage).toHaveBeenCalledWith(
        '/api/types',
        {
          page: 1, // 1 because already fetched page 0 on mount
          size: 10,
        },
        expect.any(AbortSignal)
      );
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

    // `inputSettings` is optional on the attribute configuration, and every read of it in the
    // component is optional-chained. `toOption` falls back to `{}`, so elements are used as-is.
    // Dropping the settings suspends the load rather than abandoning it, which is what leaves the
    // fetch installed and still requestable here.
    it('should use the fetched element as-is when inputSettings is absent', async () => {
      await wrapper.setProps({
        definition: { name: 'type', type: 'String', input: 'DynamicList' },
      });
      await nextTick();
      wrapper.vm.allOptions = [];

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Value 1', value: 'value1' },
        { label: 'Value 2', value: 'value2' },
        { label: 'Value 3', value: 'value3' },
      ]);
    });

    it('should map fetched elements with the option label and value templates', async () => {
      mountingOptions.props.definition.inputSettings.optionLabel =
        '{{ lastname }} {{ firstname }}';
      mountingOptions.props.definition.inputSettings.optionValue = '{{ id }}';
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [
          { id: 'account-1', lastname: 'Doe', firstname: 'John' },
          { id: 'account-2', lastname: 'Smith', firstname: 'Jane' },
        ],
      });
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      wrapper.vm.allOptions = [];

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Doe John', value: 'account-1' },
        { label: 'Smith Jane', value: 'account-2' },
      ]);
    });

    it('should keep the element value when only the option label template is set', async () => {
      mountingOptions.props.definition.inputSettings.optionLabel =
        '{{ lastname }} {{ firstname }}';
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [
          {
            lastname: 'Doe',
            firstname: 'John',
            label: 'raw label',
            value: 'raw-value',
          },
        ],
      });
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      wrapper.vm.allOptions = [];

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'Doe John', value: 'raw-value' },
      ]);
    });

    it('should keep the element label when only the option value template is set', async () => {
      mountingOptions.props.definition.inputSettings.optionValue = '{{ id }}';
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [{ id: 'account-1', label: 'raw label', value: 'raw-value' }],
      });
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      wrapper.vm.allOptions = [];

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'raw label', value: 'account-1' },
      ]);
    });

    it('should set hasMore based on last page flag', async () => {
      wrapper.vm.currentFetch.hasMore = true;
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        last: true,
      });

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.currentFetch.hasMore).toEqual(false);
    });

    it('should set error on fetch failure', async () => {
      mockGetDynamicListPage.mockRejectedValue(new Error('Network error'));
      await wrapper.vm.fetchPage();

      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');
      expect(wrapper.vm.isLoading).toEqual(false);
    });

    it('should set error when the response carries no content', async () => {
      wrapper.vm.currentFetch.nextPage = 7;
      mockGetDynamicListPage.mockResolvedValue({});

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.error).toEqual('validation.dynamicList.fetchError');
      expect(wrapper.vm.isLoading).toEqual(false);
      expect(wrapper.vm.currentFetch.nextPage).toEqual(7);
    });

    it('should discard a failure from a fetch that was replaced', async () => {
      let rejectPage;
      mockGetDynamicListPage.mockImplementation(
        () =>
          new Promise((_, reject) => {
            rejectPage = reject;
          })
      );

      const stalePage = wrapper.vm.fetchPage();
      wrapper.vm.cancelFetch();
      rejectPage(new Error('Network error'));
      await stalePage;

      expect(wrapper.vm.error).toBeNull();
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
          name: 'type',
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
          name: 'type',
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
          name: 'type',
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
          name: 'type',
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

  describe('Test function: clearSelection', () => {
    beforeEach(() => {
      mountingOptions.props.entity.type = 'unit-a';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should reset localValue and emit the entity without the value', () => {
      expect(wrapper.vm.localValue).toEqual('unit-a');

      wrapper.vm.clearSelection();

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          type: null,
        },
      ]);
    });

    it('should not emit when nothing is selected', () => {
      wrapper.vm.localValue = null;

      wrapper.vm.clearSelection();

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')).toBeUndefined();
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

    // Two real options sharing a value is a backend duplicate, not a placeholder: a placeholder is
    // identified by `label === value`, and neither of these is. Nothing must be removed — the
    // duplicate-count check alone would otherwise delete a legitimate option.
    it('should remove nothing when duplicate options are not placeholders', async () => {
      mountingOptions.props.entity.type = 'value1';
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      await nextTick();
      await nextTick();
      wrapper.vm.allOptions = [{ label: 'First label', value: 'value1' }];
      mockGetDynamicListPage.mockResolvedValue({
        ...mockPage,
        content: [{ label: 'Second label', value: 'value1' }],
        last: true,
      });

      await wrapper.vm.fetchPage();

      expect(wrapper.vm.allOptions).toEqual([
        { label: 'First label', value: 'value1' },
        { label: 'Second label', value: 'value1' },
      ]);
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

  describe('Test nested attributes', () => {
    beforeEach(() => {
      mountingOptions.props.definition.name = 'extraParameters.type';
      mountingOptions.props.entity.extraParameters = {
        type: 'value1',
        login: 'jdoe',
      };
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
    });

    it('should read the value from the nested path', () => {
      expect(wrapper.vm.localValue).toEqual('value1');
    });

    it('should emit the complete entity with only the nested value updated', () => {
      wrapper.vm.localValue = 'value2';

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          extraParameters: { type: 'value2', login: 'jdoe' },
        },
      ]);
    });

    it('should create missing intermediate objects when updating', () => {
      delete mountingOptions.props.entity.extraParameters;
      wrapper = shallowMount(EntityAttributeDynamicListField, mountingOptions);
      wrapper.vm.localValue = 'value2';

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          extraParameters: { type: 'value2' },
        },
      ]);
    });
  });
});
