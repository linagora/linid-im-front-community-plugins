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
import HomePage from '../../../src/pages/HomePage.vue';

const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  matched: [{ path: '/users' }],
};

const mockNotify = vi.fn();
const mockRouterPush = vi.fn();

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
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  getModuleHostConfiguration: () => ({
    options: {
      userIdKey: 'id',
      userTableColumns: [
        { name: 'id', label: 'ID', field: 'id' },
        { name: 'name', label: 'Name', field: 'name' },
      ],
    },
  }),
  loadAsyncComponent: () => ({}),
  usePagination: () => ({
    toPagination: (p) => p,
    toQuasarPagination: () => 'Updated pagination',
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockRouterPush }),
}));

describe('Test component: HomePage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(HomePage, {
      global: {
        stubs: ['GenericEntityTable'],
      },
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
      wrapper.vm.users = [];
      wrapper.vm.pagination = {};
      wrapper.vm.loading = true;

      await wrapper.vm.loadData();

      expect(wrapper.vm.loading).toEqual(false);
      expect(wrapper.vm.users).toEqual([{ id: 1 }]);
      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.vm.pagination).toEqual('Updated pagination');
    });

    it('should reset users on error and call Notify', async () => {
      getEntities.mockImplementation(() => Promise.reject());
      wrapper.vm.users = [{ id: 1 }];
      wrapper.vm.loading = true;

      await wrapper.vm.loadData();

      expect(wrapper.vm.loading).toEqual(false);
      expect(wrapper.vm.users).toEqual([]);
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });
    });
  });

  describe('Test function: goToUser', () => {
    it('should redirect to user details page', async () => {
      const user = { id: '42' };
      wrapper.vm.goToUser(user);

      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith({
        path: `/users/42`,
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

  describe('Test function: onFiltersChange', () => {
    it('should update filters and reset pagination to page 1', async () => {
      vi.clearAllMocks();
      wrapper.vm.pagination = { page: 3, rowsPerPage: 10 };
      wrapper.vm.filters = {};

      const newFilters = { email: 'test@example.com', firstName: 'John' };
      await wrapper.vm.onFiltersChange(newFilters);

      expect(wrapper.vm.filters).toEqual(newFilters);
      expect(wrapper.vm.pagination.page).toBe(1);
      expect(getEntities).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test function: buildQueryParams', () => {
    it('should filter out empty values', () => {
      wrapper.vm.filters = {
        email: 'test@example.com',
        firstName: '',
        lastName: null,
        active: undefined,
        role: 'admin',
      };

      const result = wrapper.vm.buildQueryParams();

      expect(result).toEqual({
        email: 'test@example.com',
        role: 'admin',
      });
    });

    it('should return empty object when all filters are empty', () => {
      wrapper.vm.filters = {
        email: '',
        firstName: null,
        lastName: undefined,
      };

      const result = wrapper.vm.buildQueryParams();

      expect(result).toEqual({});
    });

    it('should keep boolean false values', () => {
      wrapper.vm.filters = {
        active: false,
        email: 'test@example.com',
      };

      const result = wrapper.vm.buildQueryParams();

      expect(result).toEqual({
        active: false,
        email: 'test@example.com',
      });
    });
  });
});
