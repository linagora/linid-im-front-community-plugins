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
import AdvancedSearchCard from '../../../../src/components/card/AdvancedSearchCard.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: vi.fn((key) => key),
    te: vi.fn(() => true),
  }),
  useUiDesign: () => ({
    ui: vi.fn(() => ({})),
  }),
}));

describe('Test component: AdvancedSearchCard', () => {
  let wrapper;

  const fields = [
    {
      name: 'firstName',
      type: 'String',
      required: false,
      hasValidations: false,
      input: 'Text',
      inputSettings: {},
    },
    {
      name: 'lastName',
      type: 'String',
      required: false,
      hasValidations: false,
      input: 'Text',
      inputSettings: {},
    },
    {
      name: 'email',
      type: 'String',
      required: false,
      hasValidations: false,
      input: 'Text',
      inputSettings: {},
    },
    {
      name: 'isActive',
      type: 'Boolean',
      required: false,
      hasValidations: false,
      input: 'Boolean',
      inputSettings: {},
    },
  ];

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    fields,
    defaultFieldsNames: ['firstName', 'lastName'],
    advancedFieldsNames: ['email', 'isActive'],
    filters: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(AdvancedSearchCard, {
      props: defaultProps,
    });
  });

  describe('Test props: uiNamespace', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.uiNamespace).toBe('test-namespace');
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(wrapper.vm.uiNamespace).toBe('new-namespace');
    });
  });

  describe('Test props: i18nScope', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.i18nScope).toBe('test-scope');
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ i18nScope: 'new-scope' });

      expect(wrapper.vm.i18nScope).toBe('new-scope');
    });
  });

  describe('Test props: instanceId', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.instanceId).toBe('test-instance');
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ instanceId: 'new-instance' });

      expect(wrapper.vm.instanceId).toBe('new-instance');
    });
  });

  describe('Test props: fields', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.fields).toEqual(fields);
    });

    it('should update when prop changes', async () => {
      const newFields = [
        {
          name: 'newField',
          type: 'String',
          required: false,
          hasValidations: false,
          input: 'Text',
          inputSettings: {},
        },
      ];

      await wrapper.setProps({ fields: newFields });

      expect(wrapper.vm.fields).toEqual(newFields);
    });
  });

  describe('Test props: defaultFieldsNames', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.defaultFieldsNames).toEqual(['firstName', 'lastName']);
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ defaultFieldsNames: ['email'] });

      expect(wrapper.vm.defaultFieldsNames).toEqual(['email']);
    });
  });

  describe('Test props: advancedFieldsNames', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.advancedFieldsNames).toEqual(['email', 'isActive']);
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ advancedFieldsNames: ['firstName'] });

      expect(wrapper.vm.advancedFieldsNames).toEqual(['firstName']);
    });
  });

  describe('Test props: filters', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.filters).toEqual({});
    });

    it('should update when prop changes', async () => {
      const newFilters = { firstName: 'John' };

      await wrapper.setProps({ filters: newFilters });

      expect(wrapper.vm.filters).toEqual(newFilters);
    });
  });

  describe('Test computed: defaultFieldsDefinitions', () => {
    it('should return field definitions for default fields', () => {
      const result = wrapper.vm.defaultFieldsDefinitions;

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('firstName');
      expect(result[1].name).toBe('lastName');
    });

    it('should return empty array when no matching fields', async () => {
      await wrapper.setProps({ defaultFieldsNames: ['nonExistent'] });

      expect(wrapper.vm.defaultFieldsDefinitions).toEqual([]);
    });
  });

  describe('Test computed: advancedFieldsDefinitions', () => {
    it('should return field definitions for advanced fields', () => {
      const result = wrapper.vm.advancedFieldsDefinitions;

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('email');
      expect(result[1].name).toBe('isActive');
    });

    it('should return empty array when no matching fields', async () => {
      await wrapper.setProps({ advancedFieldsNames: ['nonExistent'] });

      expect(wrapper.vm.advancedFieldsDefinitions).toEqual([]);
    });
  });

  describe('Test function: toggleExpanded', () => {
    it('should toggle isExpanded from false to true', () => {
      expect(wrapper.vm.isExpanded).toBe(false);

      wrapper.vm.toggleExpanded();

      expect(wrapper.vm.isExpanded).toBe(true);
    });

    it('should toggle isExpanded from true to false', async () => {
      wrapper.vm.isExpanded = true;

      wrapper.vm.toggleExpanded();

      expect(wrapper.vm.isExpanded).toBe(false);
    });
  });

  describe('Test function: onFilterChange', () => {
    it('should emit update:filters event with updated filters', () => {
      const updatedFilters = { firstName: 'John', lastName: 'Doe' };

      wrapper.vm.onFilterChange(updatedFilters);

      expect(wrapper.emitted('update:filters')).toBeTruthy();
      expect(wrapper.emitted('update:filters')[0]).toEqual([updatedFilters]);
    });

    it('should update localFilters', () => {
      const updatedFilters = { firstName: 'Jane' };

      wrapper.vm.onFilterChange(updatedFilters);

      expect(wrapper.vm.localFilters).toEqual(updatedFilters);
    });
  });

  describe('Test watch: filters', () => {
    it('should update localFilters when filters prop changes', async () => {
      const newFilters = { email: 'test@example.com' };

      await wrapper.setProps({ filters: newFilters });

      expect(wrapper.vm.localFilters).toEqual(newFilters);
    });
  });
});
