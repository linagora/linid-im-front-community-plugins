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
          props: [
            'modelValue',
            'prefix',
            'suffix',
            'options',
            'rules',
            'hint',
            'optionValue',
            'optionLabel',
            'emitValue',
            'mapOptions',
          ],
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

    it('should be initialized to null if entity value and default value are not set', () => {
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

    it('should be initialized to null if default value is not in values', () => {
      mountingOptions.props.definition.inputSettings.defaultValue =
        'default-role';
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
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

  describe('Test watch: entity', () => {
    beforeEach(() => {
      mountingOptions.props.entity.role = 'user';
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
    });

    it('should update localValue when entity attribute value changes', async () => {
      expect(wrapper.vm.localValue).toEqual('user');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          role: 'admin',
        },
      });

      expect(wrapper.vm.localValue).toEqual('admin');
    });

    it('should set localValue to appropriate default when attribute is undefined', async () => {
      expect(wrapper.vm.localValue).toEqual('user');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
        },
      });

      // Without values or defaultValue, it should be null
      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should set localValue to null when attribute is null', async () => {
      expect(wrapper.vm.localValue).toEqual('user');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          role: null,
        },
      });

      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should update localValue when entity reference changes', async () => {
      const newEntity = {
        name: 'updated-name',
        role: 'moderator',
      };
      expect(wrapper.vm.localValue).toEqual('user');

      await wrapper.setProps({ entity: newEntity });

      expect(wrapper.vm.localValue).toEqual('moderator');
    });

    it('should not update localValue when another entity attribute changes', async () => {
      wrapper.vm.localValue = 'maintainer';

      await wrapper.setProps({
        entity: {
          name: 'updated-name',
          role: 'user',
        },
      });

      expect(wrapper.vm.localValue).toEqual('maintainer');
    });
  });

  describe('Test computed: options', () => {
    it('should return values normalized to FieldListValue objects', () => {
      mountingOptions.props.definition.inputSettings.values = [
        'value1',
        'value2',
      ];
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options).toEqual([
        { value: 'value1' },
        { value: 'value2' },
      ]);
    });

    it('should return empty array when values is not set', () => {
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options).toEqual([]);
    });

    it('should filter values by filterContext matching the current entity field value', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          { value: 'Paris', filterContext: { country: 'France' } },
          { value: 'Lyon', filterContext: { country: 'France' } },
          { value: 'London', filterContext: { country: 'UK' } },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['Paris', 'Lyon']);
    });

    it('should apply OR logic when filterContext accepts an array of values for a key', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          {
            value: 'Valence',
            filterContext: { country: ['France', 'Espagne'] },
          },
          { value: 'Paris', filterContext: { country: 'France' } },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'Espagne',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['Valence']);
    });

    it('should apply AND logic across multiple filterContext keys', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          {
            value: 'Paris',
            filterContext: { country: 'France', region: 'Ile-de-France' },
          },
          {
            value: 'Lyon',
            filterContext: {
              country: 'France',
              region: 'Auvergne-Rhône-Alpes',
            },
          },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
        region: 'Ile-de-France',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['Paris']);
    });

    it('should always include values with no filterContext', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          { value: 'All' },
          { value: 'Paris', filterContext: { country: 'France' } },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'UK',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['All']);
    });

    it('should return empty array when no filterContext matches the current entity state', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [{ value: 'Paris', filterContext: { country: 'France' } }],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'UK',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options).toEqual([]);
    });

    it('should include values when a filterContext entity field is null', () => {
      mountingOptions.props.definition.inputSettings = {
        values: [{ value: 'Paris', filterContext: { country: 'France' } }],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: null,
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['Paris']);
    });

    it('should update options reactively when a dependency field changes', async () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          { value: 'Paris', filterContext: { country: 'France' } },
          { value: 'London', filterContext: { country: 'UK' } },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['Paris']);

      await wrapper.setProps({
        entity: { ...mountingOptions.props.entity, country: 'UK' },
      });

      expect(wrapper.vm.options.map((o) => o.value)).toEqual(['London']);
    });
  });

  describe('Test watch: options', () => {
    it('should clear localValue and emit update:entity when selected value is no longer in options', async () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          { value: 'Paris', filterContext: { country: 'France' } },
          { value: 'London', filterContext: { country: 'UK' } },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
        role: 'Paris',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
      expect(wrapper.vm.localValue).toEqual('Paris');

      await wrapper.setProps({
        entity: {
          ...mountingOptions.props.entity,
          country: 'UK',
          role: 'Paris',
        },
      });

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity').at(-1)[0].role).toBeNull();
    });

    it('should not clear localValue when selected value remains in options', async () => {
      mountingOptions.props.definition.inputSettings = {
        values: [
          {
            value: 'Valence',
            filterContext: { country: ['France', 'Espagne'] },
          },
        ],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
        role: 'Valence',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
      const emitCountBefore = wrapper.emitted('update:entity')?.length ?? 0;

      await wrapper.setProps({
        entity: {
          ...mountingOptions.props.entity,
          country: 'Espagne',
          role: 'Valence',
        },
      });

      expect(wrapper.vm.localValue).toEqual('Valence');
      expect(
        (wrapper.emitted('update:entity')?.length ?? 0) - emitCountBefore
      ).toEqual(0);
    });

    it('should not emit when localValue is already null', async () => {
      mountingOptions.props.definition.inputSettings = {
        values: [{ value: 'Paris', filterContext: { country: 'France' } }],
      };
      mountingOptions.props.entity = {
        ...mountingOptions.props.entity,
        country: 'France',
      };
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);
      expect(wrapper.vm.localValue).toBeNull();

      await wrapper.setProps({
        entity: { ...mountingOptions.props.entity, country: 'UK' },
      });

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });
  });

  describe('Test hook: onMounted', () => {
    it('should update value if localValue is not null and entity attribute is null', () => {
      mountingOptions.props.definition.inputSettings = {
        defaultValue: 'default-role',
        values: ['default-role', 'value1'],
      };
      mountingOptions.props.entity.role = null;
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toEqual('default-role');
      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          role: 'default-role',
        },
      ]);
    });

    it('should not update value if localValue is null', () => {
      mountingOptions.props.definition.inputSettings = {
        values: ['default-role', 'value1'],
      };
      mountingOptions.props.entity.role = null;
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toBeNull();
      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });

    it('should not update value if entity attribute is already set', () => {
      mountingOptions.props.definition.inputSettings = {
        defaultValue: 'default-role',
        values: ['default-role', 'value1'],
      };
      mountingOptions.props.entity.role = 'entity-role';
      wrapper = shallowMount(EntityAttributeListField, mountingOptions);

      expect(wrapper.vm.localValue).toBe('entity-role');
      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });
  });
});
