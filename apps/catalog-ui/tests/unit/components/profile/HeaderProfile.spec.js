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
import { reactive } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HeaderProfile from '../../../../src/components/profile/HeaderProfile.vue';

const mockUserStore = reactive({
  user: {
    username: 'jdoe',
    fullName: 'John Doe',
    email: 'john@example.com',
    roles: [],
  },
  isAuthenticated: true,
});

const mockUi = vi.fn(() => ({}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useLinidUserStore: () => mockUserStore,
  useUiDesign: () => ({ ui: mockUi }),
  LinidZoneRenderer: { template: '<div />' },
}));

describe('Test component: HeaderProfile', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserStore.user = {
      username: 'jdoe',
      fullName: 'John Doe',
      email: 'john@example.com',
      roles: [],
    };
    mockUserStore.isAuthenticated = true;

    wrapper = shallowMount(HeaderProfile, {
      props: defaultProps,
    });
  });

  describe('Test props: uiNamespace', () => {
    it('should use provided value', () => {
      expect(wrapper.vm.uiNamespace).toBe('test-namespace');
    });

    it('should update when prop changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(wrapper.vm.uiNamespace).toBe('new-namespace');
    });
  });

  describe('Test computed: name', () => {
    it('should return the fullName from the user store', () => {
      expect(wrapper.vm.name).toBe('John Doe');
    });
  });

  describe('Test computed: email', () => {
    it('should return the email from the user store', () => {
      expect(wrapper.vm.email).toBe('john@example.com');
    });
  });

  describe('Test uiProps', () => {
    const localUiNamespace = 'test-namespace.header-profile';

    it('should call ui with header-profile namespace for q-btn', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-btn');
    });

    it('should call ui with header-profile namespace for q-item-section', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-item-section');
    });

    it('should call ui with header-profile.email namespace for q-item-label', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-item-label');
    });
  });
});
