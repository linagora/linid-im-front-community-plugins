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

import { getEntities } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericTablePage from '../../../src/pages/GenericTablePage.vue';

const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  matched: [{ path: '/page' }],
  query: {},
};

const mockNotify = vi.fn();
const mockRouterPush = vi.fn();
const mockModuleOptions = {
  idKey: 'id',
  creationPagePath: '/new',
  columns: [
    { name: 'id', label: 'ID', field: 'id' },
    { name: 'name', label: 'Name', field: 'name' },
  ],
};
const mockSetFiltersInUrl = vi.fn();
const mockGetFiltersFromUrl = vi.fn(() => []);

const { MockLinidFilter } = vi.hoisted(() => ({
  MockLinidFilter: class MockLinidFilter {
    constructor(name, type, options, values) {
      this.name = name;
      this.type = type;
      this.options = options;
      this.values = values;
    }

    toString() {
      return this.values.join('|');
    }
  },
}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getEntities: vi.fn(() =>
    Promise.resolve({
      content: [{ id: 1 }],
      number: 0,
      size: 50,
      totalElements: 1,
    })
  ),
  useScopedI18n: () => ({
    t: vi.fn((v) => v),
    te: vi.fn(() => false),
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  getModuleHostConfiguration: () => ({
    options: mockModuleOptions,
  }),
  usePagination: () => ({
    toPagination: (p) => p,
    toQuasarPagination: () => 'Updated pagination',
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useLinidFilterUrl: () => ({
    setFiltersInUrl: mockSetFiltersInUrl,
    getFiltersFromUrl: mockGetFiltersFromUrl,
  }),
  LinidFilter: MockLinidFilter,
}));

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockRouterPush }),
}));

describe('Test component: GenericTablePage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(GenericTablePage, {
      global: {
        stubs: ['GenericEntityTable'],
      },
    });
  });

  describe('Test computed: instanceId', () => {
    it('should retrieve valid instanceId from route meta', () => {
      expect(wrapper.vm.instanceId).toBe('test-instance-id');
    });
  });

  describe('Test computed: parentPath', () => {
    it('should retrieve valid parentPath from route matched', () => {
      expect(wrapper.vm.parentPath).toBe('/page');
    });
  });

  describe('Test computed: i18nScope', () => {
    it('should retrieve valid i18nScope', () => {
      expect(wrapper.vm.i18nScope).toBe('test-instance-id');
    });
  });

  describe('Test computed: uiNamespace', () => {
    it('should retrieve valid uiNamespace', () => {
      expect(wrapper.vm.uiNamespace).toBe('test-instance-id');
    });
  });

  describe('Test computed: options', () => {
    it('should retrieve valid options from module host configuration', () => {
      expect(wrapper.vm.options).toEqual({
        idKey: 'id',
        creationPagePath: '/new',
        columns: [
          { name: 'id', label: 'ID', field: 'id' },
          { name: 'name', label: 'Name', field: 'name' },
        ],
      });
    });
  });

  describe('Test computed: uiProps', () => {
    it('should retrieve valid uiProps', () => {
      const uiProps = wrapper.vm.uiProps;
      expect(uiProps).toBeDefined();
      expect(uiProps.seeButton).toBeDefined();
      expect(uiProps.createButton).toBeDefined();
    });
  });

  describe('Test computed: columns', () => {
    it('should translate label of each columns', () => {
      const cols = wrapper.vm.columns;
      expect(cols).toHaveLength(2);

      expect(cols[0].label).toBe('ID');
      expect(cols[1].label).toBe('Name');
    });
  });

  describe('Test function: loadData', () => {
    it('should retrieve data', async () => {
      wrapper.vm.items = [];
      wrapper.vm.pagination = {};
      wrapper.vm.isLoading = true;

      await wrapper.vm.loadData();

      expect(wrapper.vm.isLoading).toEqual(false);
      expect(wrapper.vm.items).toEqual([{ id: 1 }]);
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.vm.pagination).toEqual('Updated pagination');
    });

    it('should reset items on error and call Notify', async () => {
      getEntities.mockImplementation(() => Promise.reject());
      wrapper.vm.items = [{ id: 1 }];
      wrapper.vm.isLoading = true;

      await wrapper.vm.loadData();

      expect(wrapper.vm.isLoading).toEqual(false);
      expect(wrapper.vm.items).toEqual([]);
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });
    });
  });

  describe('Test function: goToDetailPage', () => {
    it('should redirect to details page', async () => {
      const item = { id: '42' };
      wrapper.vm.goToDetailPage(item);

      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith({
        path: `/page/42`,
      });
    });
  });

  describe('Test function: onRequest', () => {
    it('should call loadData with valid pagination', async () => {
      vi.clearAllMocks();
      const paginationEvent = {
        pagination: {
          page: 2,
          rowsPerPage: 5,
          sortBy: undefined,
          descending: true,
        },
      };

      await wrapper.vm.onRequest(paginationEvent);

      expect(wrapper.vm.pagination).toEqual(paginationEvent.pagination);
      expect(getEntities).toHaveBeenCalledTimes(1);
      expect(getEntities).toHaveBeenCalledWith(
        'test-instance-id',
        {},
        paginationEvent.pagination
      );
    });
  });

  describe('Test function: goToCreate', () => {
    it('should redirect to the creation page', async () => {
      wrapper.vm.goToCreate();

      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith({ path: '/new' });
    });
  });

  describe('Test function: onFiltersChange', () => {
    it('should update filters, reset pagination, sync URL and reload data', async () => {
      vi.clearAllMocks();
      wrapper.vm.pagination.page = 3;
      const newFilters = [new MockLinidFilter('name', 'text', {}, ['paris'])];

      await wrapper.vm.onFiltersChange(newFilters);

      expect(wrapper.vm.filters).toEqual(newFilters);
      expect(wrapper.vm.pagination.page).toBe(1);
      expect(mockSetFiltersInUrl).toHaveBeenCalledWith(newFilters, []);
      expect(getEntities).toHaveBeenCalledWith(
        'test-instance-id',
        { name: 'paris' },
        expect.objectContaining({ page: 1 })
      );
    });

    it('should pass keepQueryParams to setFiltersInUrl when configured', async () => {
      mockModuleOptions.keepQueryParams = ['node'];
      wrapper = shallowMount(GenericTablePage, {
        global: { stubs: ['GenericEntityTable'] },
      });
      const newFilters = [new MockLinidFilter('name', 'text', {}, ['paris'])];

      await wrapper.vm.onFiltersChange(newFilters);

      expect(mockSetFiltersInUrl).toHaveBeenCalledWith(newFilters, ['node']);

      mockModuleOptions.keepQueryParams = undefined;
    });
  });

  describe('Test function: toQueryFilter', () => {
    it('should build a query filter from the active filters', () => {
      wrapper.vm.filters = [
        new MockLinidFilter('name', 'text', {}, ['paris', 'lyon']),
      ];

      expect(wrapper.vm.toQueryFilter()).toEqual({ name: 'paris|lyon' });
    });

    it('should return an empty object when there are no active filters', () => {
      wrapper.vm.filters = [];

      expect(wrapper.vm.toQueryFilter()).toEqual({});
    });
  });

  describe('Test constant: filters', () => {
    it('should initialize filters from the URL using the configured filter definitions', () => {
      const urlFilters = [new MockLinidFilter('name', 'text', {}, ['paris'])];
      mockGetFiltersFromUrl.mockReturnValueOnce(urlFilters);
      mockModuleOptions.filters = [new MockLinidFilter('name', 'text', {}, [])];

      const localWrapper = shallowMount(GenericTablePage, {
        global: { stubs: ['GenericEntityTable'] },
      });

      expect(mockGetFiltersFromUrl).toHaveBeenCalledWith(
        mockModuleOptions.filters
      );
      expect(localWrapper.vm.filters).toEqual(urlFilters);

      mockModuleOptions.filters = undefined;
    });
  });
});
