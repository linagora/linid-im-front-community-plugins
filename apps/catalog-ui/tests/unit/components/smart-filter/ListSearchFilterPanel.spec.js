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

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const actual = await vi.importActual('@linagora/linid-im-front-corelib');
  return {
    ...actual,
    useScopedI18n: vi.fn(() => ({ t: (key) => key })),
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
    LinidFilterValue: class {
      constructor(isNegation, operator, value) {
        this.isNegation = isNegation;
        this.operator = operator;
        this.value = value;
      }
    },
  };
});

import ListSearchFilterPanel from '../../../../src/components/smart-filter/ListSearchFilterPanel.vue';

describe('ListSearchFilterPanel', () => {
  let wrapper;
  const mockItems = [
    { value: 'item1', label: 'Item 1' },
    { value: 'item2', label: 'Item 2' },
    { value: 'item3', label: 'Item 3' },
    { value: 'item4', label: 'Item 4' },
  ];

  beforeEach(() => {
    wrapper = shallowMount(ListSearchFilterPanel, {
      props: {
        uiNamespace: 'test',
        i18nScope: 'test',
        items: mockItems,
        fieldName: 'testField',
      },
    });
  });

  describe('onSearch', () => {
    it('should emit search event with correct field name and selected items', async () => {
      wrapper.vm.tickedItems = ['item1', 'item2'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toHaveLength(2);
      expect(event.values.map((item) => item.value)).toEqual([
        'item1',
        'item2',
      ]);
    });

    it('should emit search event with LinidFilterValue structure', async () => {
      wrapper.vm.tickedItems = ['item1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values[0]).toEqual({
        isNegation: false,
        operator: '',
        value: 'item1',
      });
    });

    it('should emit search event with empty array when no items selected', async () => {
      wrapper.vm.tickedItems = [];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toEqual([]);
    });

    it('should use correct fieldName from props', async () => {
      await wrapper.setProps({ fieldName: 'customField' });
      wrapper.vm.tickedItems = ['item1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('customField');
    });

    it('should emit search event with multiple selected items', async () => {
      wrapper.vm.tickedItems = ['item1', 'item3', 'item4'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values).toHaveLength(3);
      expect(event.values.map((item) => item.value)).toEqual([
        'item1',
        'item3',
        'item4',
      ]);
    });

    it('should emit search event with all filter value properties correctly set', async () => {
      wrapper.vm.tickedItems = ['item1', 'item2'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      event.values.forEach((item) => {
        expect(item).toHaveProperty('operator', '');
        expect(item).toHaveProperty('isNegation', false);
        expect(item).toHaveProperty('value');
      });
    });
  });
});
