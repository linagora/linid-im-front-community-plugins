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
import LinidFilterPanel from '../../../../src/components/smart-filter/LinidFilterPanel.vue';

const uiMock = vi.fn(() => ({}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: uiMock }),
  useScopedI18n: () => ({ t: vi.fn((key) => key) }),
}));

const TEXT_FILTER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DATE_FILTER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const TEXT_FILTER_2_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

const filters = [
  {
    id: TEXT_FILTER_ID,
    name: 'textFilter',
    type: 'text',
    options: {},
    values: [],
  },
  {
    id: DATE_FILTER_ID,
    name: 'createdAt',
    type: 'date',
    options: {},
    values: [],
  },
];

const defaultProps = {
  uiNamespace: 'Homepage',
  i18nScope: 'myScope',
  filters,
  selected: DATE_FILTER_ID,
};

function mountComponent(props = {}) {
  return shallowMount(LinidFilterPanel, {
    props: { ...defaultProps, ...props },
  });
}

describe('Test component: LinidFilterPanel', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test computed: selectedFilterId', () => {
    it('should use the selected prop when it matches an existing filter', () => {
      wrapper = mountComponent({ selected: DATE_FILTER_ID });

      expect(wrapper.vm.selectedFilterId).toBe(DATE_FILTER_ID);
    });

    it('should fall back to the first filter when selected does not match any filter', () => {
      wrapper = mountComponent({ selected: 'unknown-filter' });

      expect(wrapper.vm.selectedFilterId).toBe(TEXT_FILTER_ID);
    });

    it('should fall back to an empty string when there is no filter', () => {
      wrapper = mountComponent({ filters: [], selected: 'unknown-filter' });

      expect(wrapper.vm.selectedFilterId).toBe('');
    });
  });

  describe('Test computed: filterTypes', () => {
    it('should not duplicate an entry when several filters share the same type', () => {
      wrapper = mountComponent({
        filters: [
          ...filters,
          {
            id: TEXT_FILTER_2_ID,
            name: 'displayName',
            type: 'text',
            options: {},
            values: [],
          },
        ],
      });

      expect(wrapper.vm.filterTypes).toEqual(['text', 'date']);
    });
  });

  describe('Test computed: uiProps', () => {
    it('should resolve one ui entry per distinct filter type', () => {
      wrapper = mountComponent();

      expect(Object.keys(wrapper.vm.uiProps.types)).toEqual(
        expect.arrayContaining(['text', 'date'])
      );
    });

    it('should be empty when there is no filter', () => {
      wrapper = mountComponent({ filters: [], selected: '' });

      expect(wrapper.vm.uiProps.types).toEqual({});
    });

    it('should resolve header ui props (title icon and separator)', () => {
      wrapper = mountComponent();

      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.linid-filter-panel.header',
        'q-icon'
      );
      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.linid-filter-panel.header',
        'q-separator'
      );
    });

    it('should resolve content ui props (list, item and separator)', () => {
      wrapper = mountComponent();

      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.linid-filter-panel.content',
        'q-list'
      );
      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.linid-filter-panel.content',
        'q-item'
      );
      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.linid-filter-panel.content',
        'q-separator'
      );
    });
  });

  describe('Test computed: selectedFilter', () => {
    it('should resolve the filter object matching selectedFilterId', () => {
      wrapper = mountComponent({ selected: DATE_FILTER_ID });

      expect(wrapper.vm.selectedFilter).toEqual(filters[1]);
    });

    it('should be undefined when there is no filter', () => {
      wrapper = mountComponent({ filters: [], selected: 'unknown-filter' });

      expect(wrapper.vm.selectedFilter).toBeUndefined();
    });
  });

  describe('Test function: selectFilter', () => {
    it('should emit update:selected with the given filter id', () => {
      wrapper = mountComponent({ selected: DATE_FILTER_ID });
      vi.clearAllMocks();

      wrapper.vm.selectFilter(TEXT_FILTER_ID);

      expect(wrapper.emitted('update:selected')).toBeTruthy();
      expect(wrapper.emitted('update:selected').at(-1)).toEqual([
        TEXT_FILTER_ID,
      ]);
    });
  });

  describe('Test watcher: selectedFilterId', () => {
    it('should emit update:selected on mount when selected does not match any filter', () => {
      wrapper = mountComponent({ selected: 'unknown-filter' });

      expect(wrapper.emitted('update:selected')).toBeTruthy();
      expect(wrapper.emitted('update:selected')[0]).toEqual([TEXT_FILTER_ID]);
    });

    it('should not emit update:selected on mount when selected already matches a filter', () => {
      wrapper = mountComponent({ selected: DATE_FILTER_ID });

      expect(wrapper.emitted('update:selected')).toBeFalsy();
    });

    it('should emit update:selected when the selected filter is removed from filters', async () => {
      wrapper = mountComponent({ selected: DATE_FILTER_ID });
      vi.clearAllMocks();

      await wrapper.setProps({ filters: [filters[0]] });

      expect(wrapper.emitted('update:selected')).toBeTruthy();
      expect(wrapper.emitted('update:selected').at(-1)).toEqual([
        TEXT_FILTER_ID,
      ]);
    });

    it('should not emit update:selected when filters is empty and selected is already empty', () => {
      wrapper = mountComponent({ filters: [], selected: '' });

      expect(wrapper.emitted('update:selected')).toBeFalsy();
    });
  });
});
