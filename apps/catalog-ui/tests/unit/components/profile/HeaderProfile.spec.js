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

import { shallowMount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changeLocale } from '@linagora/linid-im-front-corelib';
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
const mockUiStore = reactive({
  i18n: { locale: 'fr-FR', languages: ['fr-FR', 'en-US'] },
});

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useLinidUserStore: () => mockUserStore,
  useLinidUiStore: () => mockUiStore,
  useUiDesign: () => ({ ui: mockUi }),
  useScopedI18n: () => ({ t: (key) => key }),
  changeLocale: vi.fn(() => Promise.resolve()),
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

    mockUiStore.i18n = { locale: 'fr-FR', languages: ['fr-FR', 'en-US'] };

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

  describe('Test computed: availableLocales', () => {
    it('should return the languages from the ui store', () => {
      expect(wrapper.vm.availableLocales).toEqual(['fr-FR', 'en-US']);
    });
  });

  describe('Test watch: selectedLanguage', () => {
    it('should call changeLocale when the selected language changes', async () => {
      wrapper.vm.selectedLanguage = 'en-US';
      await wrapper.vm.$nextTick();

      expect(vi.mocked(changeLocale)).toHaveBeenCalledWith('en-US');
    });

    it('should hide the profile menu when the selected language changes', async () => {
      const hide = vi.fn();
      wrapper.vm.profileMenu = { hide };

      wrapper.vm.selectedLanguage = 'en-US';
      await wrapper.vm.$nextTick();

      expect(hide).toHaveBeenCalled();
    });

    it('should log an error when changeLocale fails', async () => {
      const error = new Error('boom');
      vi.mocked(changeLocale).mockRejectedValueOnce(error);
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(vi.fn());

      wrapper.vm.selectedLanguage = 'en-US';
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(consoleError).toHaveBeenCalledWith('changeLocale failed', error);

      consoleError.mockRestore();
    });

    it('should revert the selection to the store locale when changeLocale fails', async () => {
      vi.mocked(changeLocale).mockRejectedValueOnce(new Error('boom'));
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(vi.fn());

      wrapper.vm.selectedLanguage = 'en-US';
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(wrapper.vm.selectedLanguage).toBe('fr-FR');

      consoleError.mockRestore();
    });

    it('should not call changeLocale when the selection is synced from the store', async () => {
      mockUiStore.i18n.locale = 'en-US';
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(vi.mocked(changeLocale)).not.toHaveBeenCalled();
    });
  });

  describe('Test watch: uiStore.i18n.locale', () => {
    it('should sync selectedLanguage when the store locale changes', async () => {
      mockUiStore.i18n.locale = 'en-US';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.selectedLanguage).toBe('en-US');
    });

    it('should not hide the profile menu when the store locale changes', async () => {
      const hide = vi.fn();
      wrapper.vm.profileMenu = { hide };

      mockUiStore.i18n.locale = 'en-US';
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect(hide).not.toHaveBeenCalled();
    });
  });
});
