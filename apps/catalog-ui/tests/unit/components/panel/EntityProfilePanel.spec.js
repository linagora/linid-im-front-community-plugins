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
import EntityProfilePanel from '../../../../src/components/panel/EntityProfilePanel.vue';

const { mockPush, mockRender, mockUi, mockUseScopedI18n, mockUiEventNext } =
  vi.hoisted(() => {
    const t = vi.fn((key) => key);
    const te = vi.fn(() => false);
    const translateOrDefault = vi.fn((defaultValue) => defaultValue);
    const mockRender = vi.fn((template) => template);

    return {
      mockPush: vi.fn(),
      mockRender,
      mockUi: vi.fn(() => ({})),
      mockUseScopedI18n: vi.fn(() => ({ t, te, translateOrDefault })),
      mockUiEventNext: vi.fn(),
    };
  });

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: { template: '<div />' },
  useNunjucks: () => ({ render: mockRender }),
  uiEventSubject: { next: mockUiEventNext },
  useScopedI18n: mockUseScopedI18n,
  useUiDesign: () => ({ ui: mockUi }),
}));

describe('Test component: EntityProfilePanel', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    parentPath: '/users',
    formFields: [{ name: 'email' }],
    updateEndpoint: 'api/users/{{ entity.id }}',
    updateBody: { email: '{{ entity.email }}' },
  };

  function createWrapper(props = {}) {
    return shallowMount(EntityProfilePanel, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: [
          'ButtonsCard',
          'EntityDetailsCard',
          'FormDialogButton',
          'StatusBadge',
          'LinidZoneRenderer',
          'QCard',
          'QCardSection',
          'QImg',
          'QBtn',
        ],
      },
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  describe('Test props: entity', () => {
    it('should use default value', () => {
      expect(wrapper.vm.entity).toEqual({});
    });

    it('should use provided value', async () => {
      const entity = { id: '1', displayName: 'John Doe' };

      await wrapper.setProps({ entity });

      expect(wrapper.vm.entity).toEqual(entity);
    });
  });

  describe('Test props: isLoading', () => {
    it('should use default value', () => {
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ isLoading: true });

      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Test props: enableNavigation', () => {
    it('should use default value', () => {
      expect(wrapper.vm.enableNavigation).toBe(true);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ enableNavigation: false });

      expect(wrapper.vm.enableNavigation).toBe(false);
    });
  });

  describe('Test props: enableAvatar', () => {
    it('should use default value', () => {
      expect(wrapper.vm.enableAvatar).toBe(true);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ enableAvatar: false });

      expect(wrapper.vm.enableAvatar).toBe(false);
    });
  });

  describe('Test props: enableTitles', () => {
    it('should use default value', () => {
      expect(wrapper.vm.enableTitles).toBe(true);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ enableTitles: false });

      expect(wrapper.vm.enableTitles).toBe(false);
    });
  });

  describe('Test props: formFields', () => {
    it('should use default value', () => {
      const w = createWrapper({ formFields: undefined });

      expect(w.vm.formFields).toEqual([]);
    });

    it('should use provided value', async () => {
      const formFields = [{ name: 'displayName' }];

      await wrapper.setProps({ formFields });

      expect(wrapper.vm.formFields).toEqual(formFields);
    });
  });

  describe('Test props: updateEndpoint', () => {
    it('should use default value', () => {
      const w = createWrapper({ updateEndpoint: undefined });

      expect(w.vm.updateEndpoint).toBeUndefined();
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ updateEndpoint: 'api/groups/{{ entity.id }}' });

      expect(wrapper.vm.updateEndpoint).toBe('api/groups/{{ entity.id }}');
    });
  });

  describe('Test props: updateBody', () => {
    it('should use default value', () => {
      const w = createWrapper({ updateBody: undefined });

      expect(w.vm.updateBody).toBeUndefined();
    });

    it('should use provided value', async () => {
      const updateBody = { displayName: '{{ entity.displayName }}' };

      await wrapper.setProps({ updateBody });

      expect(wrapper.vm.updateBody).toEqual(updateBody);
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should build the namespace from uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.entity-profile-panel'
      );
    });

    it('should use instanceId as prefix when uiNamespace is empty', () => {
      const w = createWrapper({ uiNamespace: '', instanceId: 'my-instance' });

      expect(w.vm.localUiNamespace).toBe('my-instance.entity-profile-panel');
    });

    it('should fall back to the bare namespace when neither uiNamespace nor instanceId is provided', () => {
      const w = createWrapper({ uiNamespace: '' });

      expect(w.vm.localUiNamespace).toBe('entity-profile-panel');
    });

    it('should recompute when uiNamespace changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(wrapper.vm.localUiNamespace).toBe(
        'new-namespace.entity-profile-panel'
      );
    });
  });

  describe('Test computed: localI18nScope', () => {
    it('should build the scope from i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.EntityProfilePanel');
    });

    it('should use instanceId as prefix when i18nScope is not provided', () => {
      const w = createWrapper({
        i18nScope: undefined,
        instanceId: 'my-instance',
      });

      expect(w.vm.localI18nScope).toBe('my-instance.EntityProfilePanel');
    });

    it('should fall back to the bare scope when neither i18nScope nor instanceId is provided', () => {
      const w = createWrapper({ i18nScope: undefined });

      expect(w.vm.localI18nScope).toBe('EntityProfilePanel');
    });

    it('should recompute when i18nScope changes', async () => {
      await wrapper.setProps({ i18nScope: 'new-scope' });

      expect(wrapper.vm.localI18nScope).toBe('new-scope.EntityProfilePanel');
    });
  });

  describe('Test computed: uiProps', () => {
    const localUiNamespace = 'test-namespace.entity-profile-panel';

    it('should call ui with the local namespace for q-card', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-card');
    });

    it('should call ui with the back-button namespace for q-btn', () => {
      expect(mockUi).toHaveBeenCalledWith(
        `${localUiNamespace}.navigation.buttons-card.back-button`,
        'q-btn'
      );
    });

    it('should call ui with the local namespace for q-img', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-img');
    });

    it('should call ui with the local namespace for q-icon', () => {
      expect(mockUi).toHaveBeenCalledWith(localUiNamespace, 'q-icon');
    });

    it('should expose the ui props of every styled element', () => {
      expect(Object.keys(wrapper.vm.uiProps)).toEqual([
        'card',
        'backButton',
        'image',
        'avatarIcon',
      ]);
    });

    it('should recompute when uiNamespace changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(mockUi).toHaveBeenCalledWith(
        'new-namespace.entity-profile-panel',
        'q-card'
      );
    });
  });

  describe('Test computed: zoneNames', () => {
    it('should build every zone name from the local ui namespace', () => {
      expect(wrapper.vm.zoneNames).toEqual({
        prependNavigation:
          'test-namespace.entity-profile-panel.navigation.prepend',
        appendNavigation:
          'test-namespace.entity-profile-panel.navigation.append',
        beforeHeader: 'test-namespace.entity-profile-panel.header.before',
        afterHeader: 'test-namespace.entity-profile-panel.header.after',
        prependActions: 'test-namespace.entity-profile-panel.actions.prepend',
        appendActions: 'test-namespace.entity-profile-panel.actions.append',
        beforeDetails: 'test-namespace.entity-profile-panel.details.before',
        afterDetails: 'test-namespace.entity-profile-panel.details.after',
        footer: 'test-namespace.entity-profile-panel.footer',
      });
    });

    it('should recompute when uiNamespace changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(wrapper.vm.zoneNames.footer).toBe(
        'new-namespace.entity-profile-panel.footer'
      );
    });
  });

  describe('Test computed: computedI18nScopes', () => {
    it('should build the scope of each buttons card and of the zones it hosts', () => {
      expect(wrapper.vm.computedI18nScopes).toEqual({
        navigation: 'test-scope.EntityProfilePanel.navigation',
        navigationZones: 'test-scope.EntityProfilePanel.navigation.ButtonsCard',
        actions: 'test-scope.EntityProfilePanel.actions',
        actionsZones: 'test-scope.EntityProfilePanel.actions.ButtonsCard',
        editButton:
          'test-scope.EntityProfilePanel.actions.ButtonsCard.editButton',
      });
    });

    it('should recompute when i18nScope changes', async () => {
      await wrapper.setProps({ i18nScope: 'new-scope' });

      expect(wrapper.vm.computedI18nScopes.actionsZones).toBe(
        'new-scope.EntityProfilePanel.actions.ButtonsCard'
      );
    });
  });

  describe('Test computed: computedUiNamespaces', () => {
    it('should build the namespace of each buttons card and of the zones it hosts', () => {
      expect(wrapper.vm.computedUiNamespaces).toEqual({
        navigation: 'test-namespace.entity-profile-panel.navigation',
        navigationZones:
          'test-namespace.entity-profile-panel.navigation.buttons-card',
        actions: 'test-namespace.entity-profile-panel.actions',
        actionsZones:
          'test-namespace.entity-profile-panel.actions.buttons-card',
        editButton:
          'test-namespace.entity-profile-panel.actions.buttons-card.edit-button',
      });
    });

    it('should recompute when uiNamespace changes', async () => {
      await wrapper.setProps({ uiNamespace: 'new-namespace' });

      expect(wrapper.vm.computedUiNamespaces.actionsZones).toBe(
        'new-namespace.entity-profile-panel.actions.buttons-card'
      );
    });
  });

  describe('Test function: goBack', () => {
    it('should render parentPath as a Nunjucks template with the entity as context', () => {
      wrapper.vm.goBack();

      expect(mockRender).toHaveBeenCalledWith('/users', { entity: {} });
    });

    it('should navigate to the rendered parentPath', () => {
      wrapper.vm.goBack();

      expect(mockPush).toHaveBeenCalledWith('/users');
    });

    it('should pass the current entity to the render context', async () => {
      const entity = { id: '42' };
      await wrapper.setProps({ entity });

      wrapper.vm.goBack();

      expect(mockRender).toHaveBeenCalledWith('/users', { entity });
    });

    it('should navigate to the updated parentPath', async () => {
      await wrapper.setProps({ parentPath: '/groups' });

      wrapper.vm.goBack();

      expect(mockPush).toHaveBeenCalledWith('/groups');
    });
  });

  describe('Test function: onSubmitted', () => {
    it('should not emit update:entity when data is null', () => {
      wrapper.vm.onSubmitted(null);

      expect(wrapper.emitted('update:entity')).toBeUndefined();
      expect(mockUiEventNext).not.toHaveBeenCalled();
    });

    it('should not emit update:entity when data is undefined', () => {
      wrapper.vm.onSubmitted(undefined);

      expect(wrapper.emitted('update:entity')).toBeUndefined();
      expect(mockUiEventNext).not.toHaveBeenCalled();
    });

    it('should not emit update:entity when data is an empty string', () => {
      wrapper.vm.onSubmitted('');

      expect(wrapper.emitted('update:entity')).toBeUndefined();
      expect(mockUiEventNext).not.toHaveBeenCalled();
    });

    it('should not emit update:entity when data is a non-empty string', () => {
      wrapper.vm.onSubmitted('<html>502 Bad Gateway</html>');

      expect(wrapper.emitted('update:entity')).toBeUndefined();
    });

    it('should not emit update:entity when data is an array', () => {
      wrapper.vm.onSubmitted([{ id: '1' }]);

      expect(wrapper.emitted('update:entity')).toBeUndefined();
    });

    it('should emit update:entity with the response data', () => {
      const data = { id: '1', email: 'jane.doe@example.com' };

      wrapper.vm.onSubmitted(data);

      expect(wrapper.emitted('update:entity')).toEqual([[data]]);
    });

    it('should publish the emitOnUpdate event when configured', () => {
      const data = { id: '1' };
      const w = createWrapper({ emitOnUpdate: 'reload-user' });

      w.vm.onSubmitted(data);

      expect(mockUiEventNext).toHaveBeenCalledWith({
        key: 'reload-user',
        data,
      });
    });

    it('should publish the emitOnUpdate event when data is not an object', () => {
      const w = createWrapper({ emitOnUpdate: 'reload-user' });

      w.vm.onSubmitted('<html>502 Bad Gateway</html>');

      expect(w.emitted('update:entity')).toBeUndefined();
      expect(mockUiEventNext).toHaveBeenCalledWith({
        key: 'reload-user',
        data: '<html>502 Bad Gateway</html>',
      });
    });

    it('should publish the emitOnUpdate event when data is empty', () => {
      const w = createWrapper({ emitOnUpdate: 'reload-user' });

      w.vm.onSubmitted(undefined);

      expect(w.emitted('update:entity')).toBeUndefined();
      expect(mockUiEventNext).toHaveBeenCalledWith({
        key: 'reload-user',
        data: undefined,
      });
    });

    it('should not publish any event when emitOnUpdate is not configured', () => {
      wrapper.vm.onSubmitted({ id: '1' });

      expect(mockUiEventNext).not.toHaveBeenCalled();
    });
  });
});
