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

import { getEntityById, updateEntity } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditUserPage from '../../../src/pages/EditUserPage.vue';

const mockT = vi.fn((key) => key);
const mockPush = vi.fn();
const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  query: {
    id: '123',
  },
  matched: [
    {
      path: '/users',
    },
  ],
};

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const actual = await vi.importActual('@linagora/linid-im-front-corelib');
  return {
    ...actual,
    getEntityById: vi.fn(() =>
      Promise.resolve({ id: '123', name: 'John Doe' })
    ),
    updateEntity: vi.fn(() => Promise.resolve()),
    useScopedI18n: () => ({
      t: mockT,
    }),
  };
});

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Test component: EditUserPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(EditUserPage);
  });

  it('should compute instanceId from route meta', () => {
    expect(wrapper.vm.instanceId).toBe('test-instance-id');
  });

  it('should compute userId from route query', () => {
    expect(wrapper.vm.userId).toBe('123');
  });

  it('should compute parentPath from route matched', () => {
    expect(wrapper.vm.parentPath).toBe('/users');
  });

  it('should compute i18nScope correctly', () => {
    expect(wrapper.vm.i18nScope).toBe('test-instance-id.EditUserPage');
  });

  it('should initialize buttonsCard component', () => {
    expect(wrapper.vm.buttonsCard).toBeDefined();
    expect(wrapper.vm.buttonsCard).not.toBeNull();
  });

  describe('Test function: loadData', () => {
    it('should load user data successfully', async () => {
      wrapper.vm.user = {};
      wrapper.vm.loading = false;

      const loadDataPromise = wrapper.vm.loadData();
      expect(wrapper.vm.loading).toBe(true);
      await loadDataPromise;

      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.user).toEqual({ id: '123', name: 'John Doe' });
      expect(getEntityById).toHaveBeenCalledWith('test-instance-id', '123');
    });

    it('should reset user on error', async () => {
      getEntityById.mockImplementationOnce(() => Promise.reject());
      wrapper.vm.user = { id: '123', name: 'John Doe' };

      await wrapper.vm.loadData();

      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.user).toEqual({});
    });
  });

  describe('Test function: save', () => {
    it('should update user and redirect to parent path', async () => {
      wrapper.vm.saving = false;

      const savePromise = wrapper.vm.save();
      expect(wrapper.vm.saving).toBe(true);
      await savePromise;

      expect(updateEntity).toHaveBeenCalledWith('test-instance-id', '123', {});
      expect(mockPush).toHaveBeenCalledWith({ path: '/users' });
      expect(wrapper.vm.saving).toBe(false);
    });

    it('should not redirect if update fails', async () => {
      updateEntity.mockImplementationOnce(() => Promise.reject());
      mockPush.mockClear();

      await wrapper.vm.save();

      expect(mockPush).not.toHaveBeenCalled();
      expect(wrapper.vm.saving).toBe(false);
    });
  });

  describe('Test function: cancel', () => {
    it('should redirect to parent path when called', () => {
      wrapper.vm.cancel();

      expect(mockPush).toHaveBeenCalledWith({ path: '/users' });
    });
  });
});
