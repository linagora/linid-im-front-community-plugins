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
import MenuButton from '../../../../src/components/button/MenuButton.vue';

const mockUi = vi.fn((namespace, component) => ({ namespace, component }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: { template: '<div />' },
  useScopedI18n: () => ({ translateOrDefault: vi.fn() }),
  useUiDesign: () => ({ ui: mockUi }),
}));

describe('Test component: MenuButton', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    entity: { id: '1' },
    items: ['edit', 'delete'],
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(MenuButton, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: ['QBtn', 'QMenu', 'QList', 'QItem', 'LinidZoneRenderer'],
      },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test props: zone', () => {
    it('should use default value', () => {
      expect(wrapper.vm.zone).toBe(false);
    });

    it('should use provided value', () => {
      expect(mountComponent({ zone: true }).vm.zone).toBe(true);
    });
  });

  describe('Test props: disable', () => {
    it('should use default value', () => {
      expect(wrapper.vm.disable).toBe(false);
    });

    it('should use provided value', () => {
      expect(mountComponent({ disable: true }).vm.disable).toBe(true);
    });
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .MenuButton to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.MenuButton');
    });

    it('should fall back to the instanceId when no i18nScope is provided', () => {
      expect(mountComponent({ i18nScope: undefined }).vm.localI18nScope).toBe(
        'test-instance.MenuButton'
      );
    });

    it('should use the component name alone when neither i18nScope nor instanceId is provided', () => {
      expect(
        mountComponent({ i18nScope: undefined, instanceId: undefined }).vm
          .localI18nScope
      ).toBe('MenuButton');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .menu-button to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe('test-namespace.menu-button');
    });
  });

  describe('Test computed: uiProps', () => {
    it('should resolve the button, menu, list and item design targets under the local namespace', () => {
      expect(wrapper.vm.uiProps).toEqual({
        button: { namespace: 'test-namespace.menu-button', component: 'q-btn' },
        menu: { namespace: 'test-namespace.menu-button', component: 'q-menu' },
        list: { namespace: 'test-namespace.menu-button', component: 'q-list' },
        item: { namespace: 'test-namespace.menu-button', component: 'q-item' },
      });
    });
  });
});
