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
import DropdownButton from '../../../../src/components/button/DropdownButton.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: vi.fn((key) => key),
  }),
  useUiDesign: () => ({
    ui: vi.fn(() => ({})),
  }),
}));

describe('Test component: DropdownButton', () => {
  let wrapper;

  const items = [
    {
      key: 'action1',
      clickable: true,
    },
    {
      key: 'action2',
      clickable: true,
      children: ['subAction1', 'subAction2'],
    },
    {
      key: 'action3',
      clickable: false,
    },
  ];

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    items,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(DropdownButton, {
      props: defaultProps,
    });
  });

  describe('Test computed: uiProps', () => {
    it('should contain all required top-level ui prop sections', () => {
      const { uiProps } = wrapper.vm;

      expect(uiProps).toBeDefined();
      expect(uiProps).toHaveProperty('dropdownBtn');
      expect(uiProps).toHaveProperty('list');
      expect(uiProps).toHaveProperty('menu');
      expect(uiProps).toHaveProperty('menuTrigger');
      expect(uiProps).toHaveProperty('items');
    });

    it('should contain menuTrigger with iconSection and icon', () => {
      const { uiProps } = wrapper.vm;

      expect(uiProps.menuTrigger).toHaveProperty('iconSection');
      expect(uiProps.menuTrigger).toHaveProperty('icon');
    });

    it('should build an items entry for each provided item', () => {
      const { uiProps } = wrapper.vm;

      expect(Object.keys(uiProps.items)).toHaveLength(3);
      expect(uiProps.items).toHaveProperty('action1');
      expect(uiProps.items).toHaveProperty('action2');
      expect(uiProps.items).toHaveProperty('action3');
    });

    it('should include children entries for items with children', () => {
      const { uiProps } = wrapper.vm;
      const item2UI = uiProps.items.action2;

      expect(item2UI).toHaveProperty('children');
      expect(item2UI.children).toHaveProperty('subAction1');
      expect(item2UI.children).toHaveProperty('subAction2');
    });

    it('should update items entries when items prop changes', async () => {
      const newItems = [{ key: 'newAction', clickable: true }];
      wrapper.setProps({ items: newItems });

      await wrapper.vm.$nextTick();
      const { uiProps } = wrapper.vm;

      expect(Object.keys(uiProps.items)).toHaveLength(1);
      expect(uiProps.items).toHaveProperty('newAction');
      expect(uiProps.items).not.toHaveProperty('action1');
    });
  });

  describe('Test computed: itemsWithUI', () => {
    it('should map each item with its item data', () => {
      const { itemsWithUI } = wrapper.vm;

      expect(itemsWithUI).toHaveLength(3);
      expect(itemsWithUI[0].item).toEqual(items[0]);
      expect(itemsWithUI[1].item).toEqual(items[1]);
      expect(itemsWithUI[2].item).toEqual(items[2]);
    });

    it('should include ui props for each item', () => {
      const { itemsWithUI } = wrapper.vm;

      itemsWithUI.forEach(({ ui }) => {
        expect(ui).toBeDefined();
        expect(ui).toHaveProperty('item');
        expect(ui).toHaveProperty('iconSection');
        expect(ui).toHaveProperty('icon');
        expect(ui).toHaveProperty('labelSection');
        expect(ui).toHaveProperty('label');
      });
    });

    it('should include children ui props for items with children', () => {
      const { itemsWithUI } = wrapper.vm;
      const itemWithChildren = itemsWithUI[1];

      expect(itemWithChildren.ui.children).toBeDefined();
      expect(itemWithChildren.ui.children).toHaveProperty('subAction1');
      expect(itemWithChildren.ui.children).toHaveProperty('subAction2');
    });

    it('should not include children ui props for items without children', () => {
      const { itemsWithUI } = wrapper.vm;
      const itemWithoutChildren = itemsWithUI[0];

      expect(itemWithoutChildren.ui.children).toBeUndefined();
    });

    it('should return empty array when no items are provided', async () => {
      wrapper.setProps({ items: [] });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.itemsWithUI).toEqual([]);
    });

    it('should update when items prop changes', async () => {
      const newItems = [{ key: 'newAction', clickable: true }];
      wrapper.setProps({ items: newItems });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.itemsWithUI).toHaveLength(1);
      expect(wrapper.vm.itemsWithUI[0].item).toEqual(newItems[0]);
    });
  });

  describe('Test function: buildMenuItemUIProps', () => {
    it('should return an object with all required ui prop keys', () => {
      const result = wrapper.vm.buildMenuItemUIProps(
        'test-namespace.items.action1'
      );

      expect(result).toHaveProperty('item');
      expect(result).toHaveProperty('iconSection');
      expect(result).toHaveProperty('icon');
      expect(result).toHaveProperty('labelSection');
      expect(result).toHaveProperty('label');
    });

    it('should return consistent structure for any namespace', () => {
      const result1 = wrapper.vm.buildMenuItemUIProps('namespace-a');
      const result2 = wrapper.vm.buildMenuItemUIProps('namespace-b');

      expect(Object.keys(result1)).toEqual(Object.keys(result2));
    });
  });
});
