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
import LogoutMenuItem from '../../../../src/components/profile/LogoutMenuItem.vue';

const { mockPush, mockUiEventSubjectNext, mockUi } = vi.hoisted(() => ({
  mockPush: vi.fn(() => Promise.resolve()),
  mockUiEventSubjectNext: vi.fn(),
  mockUi: vi.fn(() => ({})),
}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({ t: (key) => key }),
  useUiDesign: () => ({ ui: mockUi }),
  uiEventSubject: { next: mockUiEventSubjectNext },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('Test component: LogoutMenuItem', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    path: '/logout',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(LogoutMenuItem, { props: defaultProps });
  });

  describe('Test props: i18nScope', () => {
    it('should default to the application logout scope', () => {
      expect(wrapper.vm.i18nScope).toBe('application.logout');
    });
  });

  describe('Test uiProps', () => {
    const localUiNamespace = 'test-namespace.logout-menu-item';

    it('should call ui with the logout-menu-item namespace for q-separator', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-separator');
    });

    it('should call ui with the logout-menu-item namespace for q-item', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-item');
    });

    it('should call ui with the icon namespace for q-item-section and q-icon', () => {
      expect(mockUi).toHaveBeenCalledWith(
        `${localUiNamespace}.icon`,
        'q-item-section'
      );
      expect(mockUi).toHaveBeenCalledWith(`${localUiNamespace}.icon`, 'q-icon');
    });

    it('should call ui with the label namespace for q-item-section and q-item-label', () => {
      expect(mockUi).toHaveBeenCalledWith(
        `${localUiNamespace}.label`,
        'q-item-section'
      );
      expect(mockUi).toHaveBeenCalledWith(
        `${localUiNamespace}.label`,
        'q-item-label'
      );
    });

    it('should use an avatar section and the logout icon by default', () => {
      expect(wrapper.vm.uiProps.iconSection).toEqual({ avatar: true });
      expect(wrapper.vm.uiProps.icon).toEqual({ name: 'logout' });
    });

    it('should let the design override the default icon', () => {
      mockUi.mockImplementation((namespace, component) =>
        component === 'q-icon' ? { name: 'power_settings_new' } : {}
      );

      wrapper = shallowMount(LogoutMenuItem, { props: defaultProps });

      expect(wrapper.vm.uiProps.icon).toEqual({ name: 'power_settings_new' });
    });
  });

  describe('Test function: openConfirmationDialog', () => {
    it('should open the confirmation dialog with the logout translations and namespaces', () => {
      wrapper.vm.openConfirmationDialog();

      expect(mockUiEventSubjectNext).toHaveBeenCalledWith({
        key: 'confirmation',
        data: {
          type: 'open',
          title: 'ConfirmationDialog.title',
          content: 'ConfirmationDialog.content',
          uiNamespace: 'test-namespace.logout-menu-item',
          i18nScope: 'application.logout.ConfirmationDialog',
          onConfirm: expect.any(Function),
        },
      });
    });

    it('should use the provided i18n scope for the dialog', async () => {
      await wrapper.setProps({ i18nScope: 'custom' });

      wrapper.vm.openConfirmationDialog();

      expect(mockUiEventSubjectNext.mock.calls[0][0].data.i18nScope).toBe(
        'custom.ConfirmationDialog'
      );
    });

    it('should not navigate before the user confirms', () => {
      wrapper.vm.openConfirmationDialog();

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Test function: logout', () => {
    it('should navigate to the configured path', async () => {
      await wrapper.vm.logout();

      expect(mockPush).toHaveBeenCalledWith('/logout');
    });

    it('should navigate when the dialog is confirmed', async () => {
      wrapper.vm.openConfirmationDialog();

      await mockUiEventSubjectNext.mock.calls[0][0].data.onConfirm();

      expect(mockPush).toHaveBeenCalledWith('/logout');
    });
  });
});
