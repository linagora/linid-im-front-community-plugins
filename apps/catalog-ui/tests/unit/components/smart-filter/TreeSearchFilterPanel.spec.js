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
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
    useScopedI18n: vi.fn(() => ({ t: (key) => key })),
  };
});

import TreeSearchFilterPanel from '../../../../src/components/smart-filter/TreeSearchFilterPanel.vue';

describe('TreeSearchFilterPanel', () => {
  let wrapper;
  const mockTreeNodes = [
    { key: 'node1', type: 'test', value: {}, nodes: [] },
    { key: 'node2', type: 'test', value: {}, nodes: [] },
    { key: 'node3', type: 'test', value: {}, nodes: [] },
  ];

  beforeEach(() => {
    wrapper = shallowMount(TreeSearchFilterPanel, {
      props: {
        uiNamespace: 'test',
        i18nScope: 'test',
        items: mockTreeNodes,
        fieldName: 'testField',
      },
    });
  });

  describe('onSearch', () => {
    it('should emit search event with correct field name and ticked nodes', async () => {
      wrapper.vm.tickedNodeKeys = ['node1', 'node2'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toHaveLength(2);
      expect(event.values.map((item) => item.value)).toEqual([
        'node1',
        'node2',
      ]);
    });

    it('should emit search event with LinidFilterValue structure', async () => {
      wrapper.vm.tickedNodeKeys = ['node1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values[0]).toEqual({
        operator: '',
        isNegation: false,
        value: 'node1',
      });
    });

    it('should emit search event with empty array when no nodes ticked', async () => {
      wrapper.vm.tickedNodeKeys = [];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toEqual([]);
    });

    it('should use correct fieldName from props', async () => {
      await wrapper.setProps({ fieldName: 'customField' });
      wrapper.vm.tickedNodeKeys = ['node1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('customField');
    });

    it('should emit search event with multiple ticked nodes', async () => {
      wrapper.vm.tickedNodeKeys = ['node1', 'node2', 'node3'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values).toHaveLength(3);
      expect(event.values.map((item) => item.value)).toEqual([
        'node1',
        'node2',
        'node3',
      ]);
    });

    it('should emit search event with all filter value properties correctly set', async () => {
      wrapper.vm.tickedNodeKeys = ['node1', 'node3'];
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
