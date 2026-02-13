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
import EntityAttributeListField from '../../../../src/components/field/EntityAttributeListField.vue';

const mockUi = vi.fn(() => ({}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({
    ui: mockUi,
  }),
  useScopedI18n: () => ({ translateOrDefault: vi.fn() }),
  useQuasarRules: () => [vi.fn(), vi.fn()],
}));

describe('Test component: EntityAttributeListField', () => {
  let wrapper;
  const initialMountingOptions = {
    props: {
      uiNamespace: 'namespace',
      instanceId: 'id',
      definition: {
        name: 'role',
        type: 'String',
        required: false,
        hasValidations: false,
        input: 'List',
        inputSettings: {},
      },
      entity: {
        name: 'entity-name',
      },
    },
    global: {
      stubs: {
        QSelect: {
          template: '<select />',
          props: ['modelValue', 'prefix', 'suffix', 'options', 'rules', 'hint'],
          emits: ['update:modelValue'],
        },
      },
    },
  };
  let mountingOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mountingOptions = {
      ...initialMountingOptions,
      props: {
        ...initialMountingOptions.props,
        definition: {
          ...initialMountingOptions.props.definition,
          inputSettings: {},
        },
        entity: { ...initialMountingOptions.props.entity },
      },
    };
  });

  describe('Test props: ignoreRules', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
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
      mountingOptions.props.entity.role = 'entity-role';
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('entity-role');
    });

    it('should be initialized with default value if entity value is not set', () => {
      mountingOptions.props.definition.inputSettings = {
        defaultValue: 'value2',
      };
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('value2');
    });

    it('should be initialized with first element of values if entity value and default value are not set', () => {
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('value1');
    });

    it('should be initialized to null if entity value, default value and values are not set', () => {
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toBeNull();
    });

    it('should be initialized with entity value even if default value is set', () => {
      mountingOptions.props.entity.role = 'entity-role';
      mountingOptions.props.definition.inputSettings.defaultValue =
        'default-role';
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('entity-role');
    });

    it('should be initialized with entity value even if values are set', () => {
      mountingOptions.props.entity.role = 'entity-role';
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
      expect(wrapper.vm.localValue).toEqual('entity-role');
    });

    it('should be initialized with default value if values are set', () => {
      mountingOptions.props.definition.inputSettings.defaultValue = 'value2';
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('value2');
    });

    it('should be initialized with first element of values if default value is not in values', () => {
      mountingOptions.props.definition.inputSettings.defaultValue =
        'default-role';
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('value1');
    });

    it('should be initialized to null if default value is not in values and values is undefined', () => {
      mountingOptions.props.definition.inputSettings.defaultValue =
        'default-role';
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toBeNull();
    });
  });

  describe('Test computed: rules', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
    });

    it('should return empty array if ignoreRules property is true', async () => {
      await wrapper.setProps({
        ignoreRules: true,
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {},
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
            ignoreRules: false,
          },
        },
      });

      expect(wrapper.vm.rules.length).toEqual(2);
    });

    it('should return rules if ignoreRules is unset', async () => {
      await wrapper.setProps({
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {},
        },
      });

      expect(wrapper.vm.rules.length).toEqual(2);
    });
  });

  describe('Test function: updateValue', () => {
    beforeEach(() => {
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
    });

    it('should emit event', () => {
      wrapper.vm.localValue = 'admin';

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          role: 'admin',
        },
      ]);
    });
  });
});
