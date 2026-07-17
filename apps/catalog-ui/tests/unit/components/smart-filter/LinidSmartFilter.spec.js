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
import LinidSmartFilter from '../../../../src/components/smart-filter/LinidSmartFilter.vue';

vi.mock('@linagora/linid-im-front-corelib', () => {
  let idCounter = 0;
  class LinidFilter {
    constructor(name, type, options, values) {
      idCounter += 1;
      this.id = `generated-${name}-${idCounter}`;
      this.name = name;
      this.type = type;
      this.options = options;
      this.values = values;
    }
  }
  return {
    LinidFilter,
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
    useScopedI18n: () => ({
      t: vi.fn((key) => key),
      translateOrDefault: vi.fn((_defaultValue, key) => key),
    }),
  };
});

vi.mock('../../../../src/components/smart-filter/LinidFilterPanel.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock('../../../../src/components/chip/LinidFilterChip.vue', () => ({
  default: { template: '<div />' },
}));
vi.mock(
  '../../../../src/components/smart-filter/TextSearchFilterPanel.vue',
  () => ({ default: { template: '<div />' } })
);
vi.mock(
  '../../../../src/components/smart-filter/NumberSearchFilterPanel.vue',
  () => ({ default: { template: '<div />' } })
);
vi.mock(
  '../../../../src/components/smart-filter/DateSearchFilterPanel.vue',
  () => ({ default: { template: '<div />' } })
);
vi.mock(
  '../../../../src/components/smart-filter/ListSearchFilterPanel.vue',
  () => ({ default: { template: '<div />' } })
);
vi.mock(
  '../../../../src/components/smart-filter/TreeSearchFilterPanel.vue',
  () => ({ default: { template: '<div />' } })
);

const TEXT_FILTER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const DATE_FILTER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

function makeFilter(id, name, type, options = {}) {
  return {
    id,
    name,
    type,
    options: { fieldName: name, ...options },
    values: [],
  };
}

const textFilter = makeFilter(TEXT_FILTER_ID, 'username', 'text');
const dateFilter = makeFilter(DATE_FILTER_ID, 'createdAt', 'date');

const defaultProps = {
  uiNamespace: 'MyApp',
  i18nScope: 'myScope',
  options: {
    filters: [textFilter, dateFilter],
  },
};

function mountComponent(props = {}) {
  return shallowMount(LinidSmartFilter, {
    props: {
      ...defaultProps,
      ...props,
    },
    global: {
      stubs: {
        QField: {
          template: '<div/>',
          props: ['prefix'],
        },
      },
    },
  });
}

describe('Test component: LinidSmartFilter', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test watcher: isFilterMenuOpen', () => {
    it('should reset selectedFilterName to empty string when the menu closes', async () => {
      wrapper.vm.selectedFilterName = 'username';
      wrapper.vm.isFilterMenuOpen = true;

      await wrapper.vm.$nextTick();
      wrapper.vm.isFilterMenuOpen = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedFilterName).toBe('');
    });

    it('should not reset selectedFilterName when the menu opens', async () => {
      wrapper.vm.selectedFilterName = 'username';
      wrapper.vm.isFilterMenuOpen = false;

      await wrapper.vm.$nextTick();
      wrapper.vm.isFilterMenuOpen = true;
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedFilterName).toBe('username');
    });
  });

  describe('Test watcher: filters', () => {
    it('should initialize activeFilters as an empty array when no filters prop is provided', () => {
      expect(wrapper.vm.activeFilters).toHaveLength(0);
    });

    it('should initialize activeFilters from props.filters on mount', () => {
      const activeFilter = { ...textFilter, values: [{ value: 'alice' }] };
      const w = mountComponent({ filters: [activeFilter] });

      const initialized = w.vm.activeFilters.find(
        (f) => f.id === TEXT_FILTER_ID
      );
      expect(initialized).toBeDefined();
      expect(initialized.values).toEqual([{ value: 'alice' }]);
    });

    it('should store a copy of each filter, not the original reference', () => {
      const activeFilter = { ...textFilter, values: [{ value: 'alice' }] };
      const w = mountComponent({ filters: [activeFilter] });

      const initialized = w.vm.activeFilters.find(
        (f) => f.id === TEXT_FILTER_ID
      );
      expect(initialized).not.toBe(activeFilter);
    });

    it('should resynchronize activeFilters when props.filters changes after mount', async () => {
      expect(wrapper.vm.activeFilters).toHaveLength(0);
      const updatedFilter = { ...textFilter, values: [{ value: 'bob' }] };

      await wrapper.setProps({ filters: [updatedFilter] });

      const updated = wrapper.vm.activeFilters.find(
        (f) => f.id === TEXT_FILTER_ID
      );
      expect(updated).toBeDefined();
      expect(updated.values).toEqual([{ value: 'bob' }]);
    });

    it('should reset activeFilters to an empty array when props.filters becomes undefined', async () => {
      const activeFilter = { ...textFilter, values: [{ value: 'alice' }] };
      const w = mountComponent({ filters: [activeFilter] });

      await w.setProps({ filters: undefined });

      expect(w.vm.activeFilters).toHaveLength(0);
    });
  });

  describe('Test computed: selectedFilter', () => {
    it('should return undefined when no filter is selected', () => {
      expect(wrapper.vm.selectedFilter).toBeUndefined();
    });

    it('should return the matching filter when selectedFilterName is set', () => {
      wrapper.vm.selectedFilterName = 'username';

      expect(wrapper.vm.selectedFilter).toEqual(textFilter);
    });

    it('should return undefined when selectedFilterName does not match any filter', () => {
      wrapper.vm.selectedFilterName = 'unknown-name';

      expect(wrapper.vm.selectedFilter).toBeUndefined();
    });
  });

  describe('Test computed: currentPanelProps', () => {
    it('should only contain uiNamespace and i18nScope when no filter is selected', () => {
      expect(wrapper.vm.currentPanelProps).toEqual({
        fieldName: undefined,
        uiNamespace: 'MyApp.linid-smart-filter',
        i18nScope: 'myScope.LinidSmartFilter',
      });
    });

    it('should spread the selected filter options and set fieldName, uiNamespace and i18nScope', () => {
      const filterWithExtraOptions = makeFilter(
        TEXT_FILTER_ID,
        'username',
        'text',
        { placeholder: 'Search username' }
      );
      const w = mountComponent({
        options: { filters: [filterWithExtraOptions, dateFilter] },
      });
      w.vm.selectedFilterName = 'username';

      expect(w.vm.currentPanelProps).toEqual({
        fieldName: 'username',
        placeholder: 'Search username',
        uiNamespace: 'MyApp.linid-smart-filter',
        i18nScope: 'myScope.LinidSmartFilter',
      });
    });
  });

  describe('Test function: onSearch', () => {
    it('should do nothing when no filter is selected', () => {
      wrapper.vm.selectedFilterName = '';

      wrapper.vm.onSearch({ field: 'username', values: [{ value: 'alice' }] });

      expect(wrapper.emitted('update:filters')).toBeFalsy();
    });

    it('should do nothing when payload values is empty', () => {
      wrapper.vm.selectedFilterName = 'username';

      wrapper.vm.onSearch({ field: 'username', values: [] });

      expect(wrapper.emitted('update:filters')).toBeFalsy();
    });

    it('should add a new filter entry for the searched field', () => {
      wrapper.vm.selectedFilterName = 'username';
      const values = [{ value: 'alice' }];

      wrapper.vm.onSearch({ field: 'username', values });

      const newFilter = wrapper.vm.activeFilters.find(
        (f) => f.name === 'username'
      );
      expect(newFilter).toBeDefined();
      expect(newFilter.values).toEqual(values);
    });

    it('should always push a new entry, even when one with the same field name already exists', () => {
      wrapper.vm.selectedFilterName = 'username';
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'old' }],
      });

      wrapper.vm.onSearch({ field: 'username', values: [{ value: 'new' }] });

      const matching = wrapper.vm.activeFilters.filter(
        (f) => f.name === 'username'
      );
      expect(matching).toHaveLength(2);
      expect(matching[0].values).toEqual([{ value: 'old' }]);
      expect(matching[1].values).toEqual([{ value: 'new' }]);
      expect(matching[1].id).not.toBe(matching[0].id);
    });

    it('should copy the type and options from the selected filter onto the new entry', () => {
      wrapper.vm.selectedFilterName = 'username';

      wrapper.vm.onSearch({ field: 'username', values: [{ value: 'alice' }] });

      const newFilter = wrapper.vm.activeFilters.find(
        (f) => f.name === 'username'
      );
      expect(newFilter.type).toBe(textFilter.type);
      expect(newFilter.options).toEqual(textFilter.options);
    });

    it('should emit update:filters after applying values', () => {
      wrapper.vm.selectedFilterName = 'username';

      wrapper.vm.onSearch({ field: 'username', values: [{ value: 'alice' }] });

      expect(wrapper.emitted('update:filters')).toBeTruthy();
    });

    it('should emit only filters with non-empty values', () => {
      wrapper.vm.selectedFilterName = 'username';
      const values = [{ value: 'alice' }];

      wrapper.vm.onSearch({ field: 'username', values });

      const emitted = wrapper.emitted('update:filters')[0][0];
      expect(emitted).toHaveLength(1);
      expect(emitted[0].name).toBe('username');
      expect(emitted[0].values).toEqual(values);
    });
  });

  describe('Test function: onChipRemove', () => {
    it('should remove the filter from the state', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });

      wrapper.vm.onChipRemove(TEXT_FILTER_ID);

      expect(
        wrapper.vm.activeFilters.find((f) => f.id === TEXT_FILTER_ID)
      ).toBeUndefined();
    });

    it('should emit update:filters after removing a chip', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });

      wrapper.vm.onChipRemove(TEXT_FILTER_ID);

      expect(wrapper.emitted('update:filters')).toBeTruthy();
    });

    it('should emit only the remaining active filters after removal', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });
      wrapper.vm.activeFilters.push({
        ...dateFilter,
        values: [{ value: '2026-01-01' }],
      });

      wrapper.vm.onChipRemove(TEXT_FILTER_ID);

      const emitted = wrapper.emitted('update:filters')[0][0];
      expect(emitted.find((f) => f.id === TEXT_FILTER_ID)).toBeUndefined();
      const keptFilter = emitted.find((f) => f.id === DATE_FILTER_ID);
      expect(keptFilter.values).toEqual([{ value: '2026-01-01' }]);
    });
  });

  describe('Test function: onClearFilters', () => {
    it('should remove every filter from the state', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });
      wrapper.vm.activeFilters.push({
        ...dateFilter,
        values: [{ value: '2026-01-01' }],
      });

      wrapper.vm.onClearFilters();

      expect(wrapper.vm.activeFilters).toHaveLength(0);
    });

    it('should emit update:filters with an empty array', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });

      wrapper.vm.onClearFilters();

      expect(wrapper.emitted('update:filters')[0][0]).toHaveLength(0);
    });

    it('should emit update:filters even when there is no active filter', () => {
      wrapper.vm.onClearFilters();

      expect(wrapper.emitted('update:filters')).toBeTruthy();
    });
  });

  describe('Test function: emitFilters', () => {
    it('should emit only filters that have active values', () => {
      wrapper.vm.activeFilters.push({
        ...textFilter,
        values: [{ value: 'alice' }],
      });

      wrapper.vm.emitFilters();

      const emitted = wrapper.emitted('update:filters')[0][0];
      expect(emitted).toHaveLength(1);
      expect(emitted[0].id).toBe(TEXT_FILTER_ID);
      expect(emitted[0].values).toEqual([{ value: 'alice' }]);
    });

    it('should not emit filters with empty values', () => {
      wrapper.vm.activeFilters.push({ ...textFilter, values: [] });

      wrapper.vm.emitFilters();

      const emitted = wrapper.emitted('update:filters')[0][0];
      expect(emitted).toHaveLength(0);
    });
  });
});
