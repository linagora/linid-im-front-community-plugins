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

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TextSearchFilterPanel from '../../../../src/components/smart-filter/TextSearchFilterPanel.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
  useScopedI18n: () => ({
    t: vi.fn((key) => key),
    translateOrDefault: vi.fn((_defaultValue, key) => key),
  }),
  LinidFilterValue: class {
    constructor(isNegation, operator, value) {
      this.isNegation = isNegation;
      this.operator = operator;
      this.value = value;
    }
  },
}));

const defaultProps = {
  uiNamespace: 'SmartFilter',
  i18nScope: 'myScope',
  fieldName: 'username',
};

function mountComponent(props = {}) {
  return shallowMount(TextSearchFilterPanel, {
    props: { ...defaultProps, ...props },
    global: {
      stubs: {
        QInput: {
          template: '<input />',
          props: ['modelValue', 'prefix', 'suffix'],
        },
      },
    },
  });
}

describe('Test component: TextSearchFilterPanel', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test computed: operators', () => {
    it('should expose 4 operator options', () => {
      expect(wrapper.vm.operators).toHaveLength(4);
    });

    it('should use base labels when negation is disabled', () => {
      expect(wrapper.vm.operators.map((o) => o.value)).toEqual([
        'contains',
        'startsWith',
        'endsWith',
        'equals',
      ]);
      expect(wrapper.vm.operators[0].label).toBe('operators.contains');
      expect(wrapper.vm.operators[1].label).toBe('operators.startsWith');
      expect(wrapper.vm.operators[2].label).toBe('operators.endsWith');
      expect(wrapper.vm.operators[3].label).toBe('operators.equals');
    });

    it('should use negated labels when negation is enabled', async () => {
      wrapper.vm.isNegation = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.operators[0].label).toBe('operators.notContains');
      expect(wrapper.vm.operators[1].label).toBe('operators.notStartsWith');
      expect(wrapper.vm.operators[2].label).toBe('operators.notEndsWith');
      expect(wrapper.vm.operators[3].label).toBe('operators.notEquals');
    });
  });

  describe('Test function: buildFilterValue', () => {
    it('should map contains to lk_ with wildcards on both sides', () => {
      wrapper.vm.inputValue = 'alice';
      wrapper.vm.selectedOperatorKey = 'contains';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('lk_');
      expect(result.value).toBe('*alice*');
      expect(result.isNegation).toBe(false);
    });

    it('should map startsWith to lk_ with a trailing wildcard', () => {
      wrapper.vm.inputValue = 'ali';
      wrapper.vm.selectedOperatorKey = 'startsWith';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('lk_');
      expect(result.value).toBe('ali*');
    });

    it('should map endsWith to lk_ with a leading wildcard', () => {
      wrapper.vm.inputValue = 'ice';
      wrapper.vm.selectedOperatorKey = 'endsWith';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('lk_');
      expect(result.value).toBe('*ice');
    });

    it('should map equals to an empty operator with the raw input value', () => {
      wrapper.vm.inputValue = 'alice';
      wrapper.vm.selectedOperatorKey = 'equals';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('');
      expect(result.value).toBe('alice');
    });

    it('should propagate isNegation to the filter value', () => {
      wrapper.vm.isNegation = true;

      const result = wrapper.vm.buildFilterValue();

      expect(result.isNegation).toBe(true);
    });
  });

  describe('Test function: onSearch', () => {
    it('should emit search with the field name and the constructed filter value', () => {
      wrapper.vm.inputValue = 'alice';
      wrapper.vm.selectedOperatorKey = 'contains';

      wrapper.vm.onSearch();

      expect(wrapper.emitted('search')).toBeTruthy();
      const payload = wrapper.emitted('search')[0][0];
      expect(payload.field).toBe('username');
      expect(payload.values).toHaveLength(1);
      expect(payload.values[0].operator).toBe('lk_');
      expect(payload.values[0].value).toBe('*alice*');
    });

    it('should use the fieldName prop as the field in the payload', () => {
      wrapper = mountComponent({ fieldName: 'email' });

      wrapper.vm.onSearch();

      expect(wrapper.emitted('search')[0][0].field).toBe('email');
    });
  });
});
