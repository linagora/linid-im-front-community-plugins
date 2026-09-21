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
import RedirectButton from '../../../../src/components/button/RedirectButton.vue';

const mockT = vi.fn((key) => key);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: mockT,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => ({
    renderString(value, context) {
      return value
        .replace(/\{\{ not entity\.(\w+) \}\}/g, (_, key) =>
          String(!context.entity?.[key])
        )
        .replace(
          /\{\{ entity\.(\w+) \}\}/g,
          (_, key) => context.entity?.[key] ?? ''
        )
        .replace(
          /\{\{ parent\.(\w+) \}\}/g,
          (_, key) => context.parent?.[key] ?? ''
        );
    },
  }),
}));

describe('Test component: RedirectButton', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    entity: { id: '123', active: true },
    to: '/accounts/{{ entity.id }}',
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(RedirectButton, {
      props: { ...defaultProps, ...props },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .RedirectButton to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.RedirectButton');
    });

    it('should fall back to the instanceId when no i18nScope is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined });

      expect(wrapper.vm.localI18nScope).toBe('test-instance.RedirectButton');
    });

    it('should use the component name alone when neither i18nScope nor instanceId is provided', () => {
      wrapper = mountComponent({ i18nScope: undefined, instanceId: undefined });

      expect(wrapper.vm.localI18nScope).toBe('RedirectButton');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .redirect-button to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.redirect-button'
      );
    });
  });

  describe('Test computed: isDisabled', () => {
    it('should be enabled by default', () => {
      expect(wrapper.vm.isDisabled).toBe(false);
    });

    it('should be disabled when disable is true', () => {
      wrapper = mountComponent({ disable: true });

      expect(wrapper.vm.isDisabled).toBe(true);
    });

    it('should be disabled when the disable template renders to true', () => {
      wrapper = mountComponent({
        entity: { id: '123', active: false },
        disable: '{{ not entity.active }}',
      });

      expect(wrapper.vm.isDisabled).toBe(true);
    });

    it('should be enabled when the disable template renders to false', () => {
      wrapper = mountComponent({ disable: '{{ not entity.active }}' });

      expect(wrapper.vm.isDisabled).toBe(false);
    });

    it('should be enabled when the disable template renders to anything but true', () => {
      wrapper = mountComponent({ disable: '{{ entity.id }}' });

      expect(wrapper.vm.isDisabled).toBe(false);
    });
  });

  describe('Test computed: targetRoute', () => {
    it('should render the route with the entity', () => {
      expect(wrapper.vm.targetRoute).toBe('/accounts/123');
    });

    it('should keep a route without template as is', () => {
      wrapper = mountComponent({ to: '/accounts/import' });

      expect(wrapper.vm.targetRoute).toBe('/accounts/import');
    });

    it('should render the route with the parent', () => {
      wrapper = mountComponent({
        parent: { id: 'app-1' },
        to: '/applications/{{ parent.id }}/roles/{{ entity.id }}',
      });

      expect(wrapper.vm.targetRoute).toBe('/applications/app-1/roles/123');
    });

    it('should follow the entity updates', async () => {
      await wrapper.setProps({ entity: { id: '456', active: true } });

      expect(wrapper.vm.targetRoute).toBe('/accounts/456');
    });

    it('should trim the rendered route', () => {
      wrapper = mountComponent({ to: '  /accounts/{{ entity.id }}\n' });

      expect(wrapper.vm.targetRoute).toBe('/accounts/123');
    });

    it('should render the route with an empty entity when the entity is null', () => {
      wrapper = mountComponent({ entity: null });

      expect(wrapper.vm.targetRoute).toBe('/accounts/');
    });
  });
});
