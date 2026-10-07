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
import EntityAttributeTreeField from '../../../../src/components/field/EntityAttributeTreeField.vue';

const mockUi = vi.fn(() => ({}));
const mockT = vi.fn((key) => key);
const mockRules = [vi.fn()];

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
    useQuasarRules: () => mockRules,
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

const mockFetchAllPages = vi.fn();

vi.mock('../../../../src/services/paginationService', () => ({
  fetchAllPages: (...args) => mockFetchAllPages(...args),
}));

describe('Test component: EntityAttributeTreeField', () => {
  let wrapper;

  const flatNodes = [
    { id: 'root', type: 'ROOT', label: 'Root' },
    { id: 'child-1', parentId: 'root', type: 'LEAF', label: 'Child 1' },
    { id: 'child-2', parentId: 'root', type: 'LEAF', label: 'Child 2' },
  ];

  const initialMountingOptions = {
    props: {
      uiNamespace: 'namespace',
      instanceId: 'id',
      i18nScope: 'scope',
      definition: {
        name: 'scopeId',
        type: 'String',
        required: true,
        hasValidations: false,
        input: 'Tree',
        inputSettings: {
          route: '/api/geographies',
        },
      },
      entity: {
        name: 'entity-name',
      },
    },
    global: {
      stubs: {
        QField: {
          template: '<div class="q-field"><slot name="control" /></div>',
          props: [
            'modelValue',
            'rules',
            'loading',
            'error',
            'errorMessage',
            'hint',
            'disable',
          ],
        },
      },
    },
  };
  let mountingOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAllPages.mockResolvedValue(flatNodes);
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

  describe('Test ref: localValue', () => {
    it('should be initialized with the entity value', () => {
      mountingOptions.props.entity.scopeId = 'child-1';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('child-1');
    });

    it('should be initialized to null when the entity value is not set', () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.localValue).toBeNull();
    });

    it('should follow the entity value, as the edition page loads it after mounting', async () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      await wrapper.setProps({
        entity: { name: 'entity-name', scopeId: 'child-2' },
      });

      expect(wrapper.vm.localValue).toEqual('child-2');
      expect(wrapper.vm.selectedKey).toEqual('child-2');
    });
  });

  describe('Test function: loadNodes', () => {
    it('should load the nodes from the route and build the tree', async () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledWith(
        '/api/geographies',
        50,
        expect.any(AbortSignal)
      );
      expect(wrapper.vm.nodes).toHaveLength(1);
      expect(wrapper.vm.nodes[0].key).toEqual('root');
      expect(wrapper.vm.nodes[0].nodes.map((node) => node.key)).toEqual([
        'child-1',
        'child-2',
      ]);
    });

    it('should render the route template against the entity', async () => {
      mountingOptions.props.entity.organizationId = 'org-1';
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/tree';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledWith(
        '/api/organizations/org-1/tree',
        50,
        expect.any(AbortSignal)
      );
    });

    it('should not reload when an entity edit leaves the rendered route unchanged', async () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'edited-name' },
      });
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledTimes(1);
    });

    it('should use the configured keys and query size', async () => {
      mountingOptions.props.definition.inputSettings = {
        route: '/api/tree',
        idKey: 'uuid',
        parentIdKey: 'parent',
        typeKey: 'kind',
        nodesQuerySize: 10,
      };
      mockFetchAllPages.mockResolvedValue([
        { uuid: 'a', kind: 'ROOT' },
        { uuid: 'b', parent: 'a', kind: 'LEAF' },
      ]);
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledWith(
        '/api/tree',
        10,
        expect.any(AbortSignal)
      );
      expect(wrapper.vm.nodes[0].nodes[0]).toMatchObject({
        key: 'b',
        type: 'LEAF',
      });
    });

    it('should retry the failed load of a static route on demand', async () => {
      mockFetchAllPages.mockRejectedValueOnce(new Error('network'));
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.displayedError).toEqual('validation.tree.fetchError');

      wrapper.vm.retry();
      await nextTick();
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledTimes(2);
      expect(wrapper.vm.displayedError).toBeNull();
      expect(wrapper.vm.nodes).toHaveLength(1);
    });

    it('should not render the tree while the nodes are loading, so the first tree render holds them', async () => {
      let resolveFetch;
      mockFetchAllPages.mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      );
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      expect(wrapper.vm.isLoading).toBe(true);
      expect(wrapper.findComponent({ name: 'GenericTree' }).exists()).toBe(
        false
      );

      resolveFetch(flatNodes);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.isLoading).toBe(false);
      expect(wrapper.findComponent({ name: 'GenericTree' }).exists()).toBe(
        true
      );
    });

    it('should abort the load in flight when a new route starts loading', async () => {
      const signals = [];
      mockFetchAllPages.mockImplementation((route, size, signal) => {
        signals.push(signal);
        return new Promise(() => undefined);
      });
      mountingOptions.props.definition.inputSettings.route =
        '/api/{{ entity.kind }}/tree';
      mountingOptions.props.entity.kind = 'first';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', kind: 'second' },
      });
      await nextTick();

      expect(signals).toHaveLength(2);
      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
    });

    it('should clear the selection when the route changes, as it belongs to the previous tree', async () => {
      mountingOptions.props.definition.inputSettings.route =
        '/api/{{ entity.kind }}/tree';
      mountingOptions.props.entity.kind = 'first';
      mountingOptions.props.entity.scopeId = 'child-1';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', kind: 'second', scopeId: 'child-1' },
      });
      await nextTick();

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity').at(-1)).toEqual([
        { name: 'entity-name', kind: 'second', scopeId: null },
      ]);
    });

    it('should wait for the declared route dependencies before loading', async () => {
      mountingOptions.props.definition.inputSettings.route =
        '/api/organizations/{{ entity.organizationId }}/tree';
      mountingOptions.props.definition.inputSettings.routeDependencies = [
        'entity.organizationId',
      ];
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      expect(mockFetchAllPages).not.toHaveBeenCalled();
      expect(wrapper.vm.isDisabled).toBe(true);

      await wrapper.setProps({
        entity: { name: 'entity-name', organizationId: 'org-1' },
      });
      await nextTick();

      expect(mockFetchAllPages).toHaveBeenCalledWith(
        '/api/organizations/org-1/tree',
        50,
        expect.any(AbortSignal)
      );
      expect(wrapper.vm.isDisabled).toBe(false);
    });

    it('should report a failed load under the field', async () => {
      mockFetchAllPages.mockRejectedValue(new Error('network'));
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.displayedError).toEqual('validation.tree.fetchError');
      expect(wrapper.vm.nodes).toEqual([]);
    });
  });

  describe('Test function: initialExpansion', () => {
    it('should expand the root nodes alone when the field holds no value', async () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.expandedKeys).toEqual(['root']);
    });

    it('should expand the path to the selected node, as on an edition form', async () => {
      mountingOptions.props.entity.scopeId = 'child-1';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      expect(wrapper.vm.expandedKeys).toEqual(['child-1', 'root']);
    });

    it('should expand the path when the entity value arrives after the nodes', async () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();
      await nextTick();

      await wrapper.setProps({
        entity: { name: 'entity-name', scopeId: 'child-2' },
      });

      expect(wrapper.vm.expandedKeys).toEqual(['child-2', 'root']);
    });
  });

  describe('Test computed: uiProps', () => {
    it('should resolve the field design from the field namespace', () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(mockUi).toHaveBeenCalledWith('namespace.scopeId', 'q-field');
      expect(mockUi).toHaveBeenCalledWith(
        'namespace.scopeId.retry-button',
        'q-btn'
      );
    });
  });

  describe('Test computed: isDisabled', () => {
    it('should be false by default', () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.isDisabled).toBe(false);
    });

    it('should be true when the disable setting is set', () => {
      mountingOptions.props.definition.inputSettings.disable = true;
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.isDisabled).toBe(true);
    });
  });

  describe('Test function: clearSelection', () => {
    it('should drop the value and emit the emptied entity', () => {
      mountingOptions.props.entity.scopeId = 'child-1';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      wrapper.vm.clearSelection();

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        { name: 'entity-name', scopeId: null },
      ]);
    });

    it('should do nothing when the field holds no value', () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      wrapper.vm.clearSelection();

      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });
  });

  describe('Test computed: configurationError', () => {
    it('should report a route missing from inputSettings and not load', async () => {
      mountingOptions.props.definition.inputSettings = {};
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
      await nextTick();

      expect(wrapper.vm.displayedError).toEqual('validation.tree.missingRoute');
      expect(mockFetchAllPages).not.toHaveBeenCalled();
    });
  });

  describe('Test computed: rules', () => {
    it('should carry the configured validation rules', () => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.rules).toEqual(mockRules);
    });

    it('should be empty when ignoreRules is set on the component', () => {
      mountingOptions.props.ignoreRules = true;
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should be empty when ignoreRules is set in inputSettings', () => {
      mountingOptions.props.definition.inputSettings.ignoreRules = true;
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      expect(wrapper.vm.rules).toEqual([]);
    });
  });

  describe('Test function: updateValue', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);
    });

    it('should store the selected node key and emit the updated entity', () => {
      wrapper.vm.updateValue('child-1');

      expect(wrapper.vm.localValue).toEqual('child-1');
      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        { name: 'entity-name', scopeId: 'child-1' },
      ]);
    });

    it('should ignore an empty key', () => {
      wrapper.vm.updateValue('');

      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });

    it('should ignore the already selected key', async () => {
      mountingOptions.props.entity.scopeId = 'child-1';
      wrapper = shallowMount(EntityAttributeTreeField, mountingOptions);

      wrapper.vm.updateValue('child-1');

      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });
  });
});
