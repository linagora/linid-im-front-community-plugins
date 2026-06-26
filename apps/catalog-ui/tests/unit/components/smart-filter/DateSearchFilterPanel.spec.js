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
import DateSearchFilterPanel from '../../../../src/components/smart-filter/DateSearchFilterPanel.vue';

const mockTe = vi.hoisted(() => vi.fn(() => false));
const mockGlobalT = vi.hoisted(() => vi.fn((key) => key));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
  useScopedI18n: () => ({
    t: vi.fn((key) => key),
    translateOrDefault: vi.fn((_defaultValue) => _defaultValue),
  }),
  LinidFilterValue: class {
    constructor(isNegation, operator, value) {
      this.isNegation = isNegation;
      this.operator = operator;
      this.value = value;
    }
  },
  QDATE_DEFAULT_MASK: 'YYYY/MM/DD',
  getI18nInstance: () => ({ global: { te: mockTe, t: mockGlobalT } }),
  useQuasarFieldValidation: () => ({
    validDate: vi.fn(() => () => true),
  }),
}));

const defaultProps = {
  uiNamespace: 'SmartFilter',
  i18nScope: 'myScope',
  fieldName: 'createdAt',
};

function mountComponent(props = {}) {
  return shallowMount(DateSearchFilterPanel, {
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

describe('Test component: DateSearchFilterPanel', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test computed: operators', () => {
    it('should expose 3 operator options', () => {
      expect(wrapper.vm.operators).toHaveLength(3);
    });

    it('should use base labels when negation is disabled', () => {
      expect(wrapper.vm.operators.map((o) => o.value)).toEqual([
        'inferior',
        'superior',
        'equals',
      ]);
      expect(wrapper.vm.operators[0].label).toBe('operators.inferior');
      expect(wrapper.vm.operators[1].label).toBe('operators.superior');
      expect(wrapper.vm.operators[2].label).toBe('operators.equals');
    });

    it('should use negated labels when negation is enabled', async () => {
      wrapper.vm.isNegation = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.operators[0].label).toBe('operators.notInferior');
      expect(wrapper.vm.operators[1].label).toBe('operators.notSuperior');
      expect(wrapper.vm.operators[2].label).toBe('operators.notEquals');
    });
  });

  describe('Test computed: computedMask', () => {
    it('should use the default mask when no mask prop is provided', () => {
      expect(wrapper.vm.computedMask).toBe('YYYY/MM/DD');
    });

    it('should use the mask prop when provided', () => {
      wrapper = mountComponent({ mask: 'DD/MM/YYYY' });
      expect(wrapper.vm.computedMask).toBe('DD/MM/YYYY');
    });

    it('should use the translated value when maskI18NKey exists in the global i18n catalog', () => {
      mockTe.mockReturnValueOnce(true);
      mockGlobalT.mockReturnValueOnce('MM/DD/YYYY');
      wrapper = mountComponent({ maskI18NKey: 'format.date' });
      expect(wrapper.vm.computedMask).toBe('MM/DD/YYYY');
    });

    it('should fall back to mask prop when maskI18NKey key does not exist in the global i18n catalog', () => {
      wrapper = mountComponent({
        maskI18NKey: 'nonexistent.key',
        mask: 'DD/MM/YYYY',
      });
      expect(wrapper.vm.computedMask).toBe('DD/MM/YYYY');
    });
  });

  describe('Test function: buildDateValue', () => {
    it('should format inferior as start-of-day', () => {
      wrapper.vm.inputValue = '2024-01-01';
      wrapper.vm.selectedOperatorKey = 'inferior';

      expect(wrapper.vm.buildDateValue()).toBe('2024-01-01 00:00:00');
    });

    it('should format superior as end-of-day', () => {
      wrapper.vm.inputValue = '2024-06-15';
      wrapper.vm.selectedOperatorKey = 'superior';

      expect(wrapper.vm.buildDateValue()).toBe('2024-06-15 23:59:59');
    });

    it('should format equals as a full-day between range', () => {
      wrapper.vm.inputValue = '2024-12-31';
      wrapper.vm.selectedOperatorKey = 'equals';

      expect(wrapper.vm.buildDateValue()).toBe(
        '2024-12-31 00:00:00_bt_2024-12-31 23:59:59'
      );
    });
  });

  describe('Test function: buildFilterValue', () => {
    it('should map inferior to lt_ operator with start-of-day value', () => {
      wrapper.vm.inputValue = '2024-01-01';
      wrapper.vm.selectedOperatorKey = 'inferior';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('lt_');
      expect(result.value).toBe('2024-01-01 00:00:00');
      expect(result.isNegation).toBe(false);
    });

    it('should map superior to gt_ operator with end-of-day value', () => {
      wrapper.vm.inputValue = '2024-06-15';
      wrapper.vm.selectedOperatorKey = 'superior';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('gt_');
      expect(result.value).toBe('2024-06-15 23:59:59');
    });

    it('should map equals to an empty operator with full-day between range value', () => {
      wrapper.vm.inputValue = '2024-12-31';
      wrapper.vm.selectedOperatorKey = 'equals';

      const result = wrapper.vm.buildFilterValue();

      expect(result.operator).toBe('');
      expect(result.value).toBe('2024-12-31 00:00:00_bt_2024-12-31 23:59:59');
    });

    it('should propagate isNegation to the filter value', () => {
      wrapper.vm.isNegation = true;

      const result = wrapper.vm.buildFilterValue();

      expect(result.isNegation).toBe(true);
    });
  });

  describe('Test function: onSearch', () => {
    it('should emit search with the field name and the constructed filter value', () => {
      wrapper.vm.inputValue = '2024-01-01';
      wrapper.vm.selectedOperatorKey = 'inferior';

      wrapper.vm.onSearch();

      expect(wrapper.emitted('search')).toBeTruthy();
      const payload = wrapper.emitted('search')[0][0];
      expect(payload.field).toBe('createdAt');
      expect(payload.values).toHaveLength(1);
      expect(payload.values[0].operator).toBe('lt_');
      expect(payload.values[0].value).toBe('2024-01-01 00:00:00');
    });

    it('should use the fieldName prop as the field in the payload', () => {
      wrapper = mountComponent({ fieldName: 'updatedAt' });

      wrapper.vm.onSearch();

      expect(wrapper.emitted('search')[0][0].field).toBe('updatedAt');
    });
  });
});
