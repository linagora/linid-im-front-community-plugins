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

const mockT = vi.fn((key) => `translated_${key}`);
const mockPush = vi.fn();
const mockNotify = vi.fn();
const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  params: {
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
    useNotify: () => ({
      Notify: mockNotify,
    }),
    useUiDesign: () => ({
      ui: () => ({}),
    }),
    getEntityConfiguration: vi.fn(async () => ({
      attributes: [
        {
          name: 'enabled',
          type: 'Boolean',
          required: true,
          hasValidations: false,
          input: 'Boolean',
        },
        {
          name: 'email',
          type: 'String',
          required: true,
          hasValidations: true,
          input: 'Text',
          inputSettings: {
            maxLength: 255,
          },
        },
        {
          name: 'firstName',
          type: 'String',
          required: true,
          hasValidations: true,
          input: 'Text',
          inputSettings: {
            maxLength: 100,
          },
        },
      ],
    })),
    getModuleHostConfiguration: () => ({
      entity: 'user',
      options: {
        userIdKey: 'id',
        formSections: [
          {
            id: 'secondary',
            order: 2,
            fieldsOrder: ['enabled'],
          },
          {
            id: 'main',
            order: 1,
            fieldsOrder: ['firstName', 'email'],
          },
        ],
      },
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

  describe('Test computed: instanceId', () => {
    it('should retrieve valid instanceId from route meta', () => {
      expect(wrapper.vm.instanceId).toBe('test-instance-id');
    });
  });

  describe('Test computed: userId', () => {
    it('should retrieve valid user id from route params', () => {
      expect(wrapper.vm.userId).toBe('123');
    });
  });

  describe('Test computed: parentPath', () => {
    it('should retrieve valid parent path from route matched', () => {
      expect(wrapper.vm.parentPath).toBe('/users');
    });
  });

  describe('Test computed: userDetailPath', () => {
    it('should retrieve valid user detail path from parentPath and userId', () => {
      expect(wrapper.vm.userDetailPath).toBe('/users/123');
    });
  });

  describe('Test computed: i18nScope', () => {
    it('should compute i18nScope correctly', () => {
      expect(wrapper.vm.i18nScope).toBe('test-instance-id.EditUserPage');
    });
  });

  describe('Test computed: uiNamespace', () => {
    it('should retrieve valid uiNamespace', () => {
      expect(wrapper.vm.uiNamespace).toBe('test-instance-id.edit-user-page');
    });
  });

  describe('Test computed: moduleConfig', () => {
    it('should retrieve module configuration from module host configuration', () => {
      const moduleConfig = wrapper.vm.moduleConfig;
      expect(moduleConfig).toBeDefined();
      expect(moduleConfig.entity).toBe('user');
      expect(moduleConfig.options.userIdKey).toBe('id');
    });
  });

  describe('Test computed: options', () => {
    it('should retrieve options from module host configuration', () => {
      const options = wrapper.vm.options;
      expect(options).toBeDefined();
      expect(options.userIdKey).toBe('id');
      expect(options.formSections).toHaveLength(2);
    });
  });

  describe('Test computed: attributes', () => {
    it('should retrieve attributes from entity configuration', async () => {
      const attributes = wrapper.vm.attributes;
      expect(attributes).toBeDefined();
      expect(attributes).toHaveLength(3);
      expect(attributes[0].name).toBe('enabled');
      expect(attributes[1].name).toBe('email');
      expect(attributes[2].name).toBe('firstName');
    });
  });

  describe('Test computed: isDisabled', () => {
    it('should be true when user data equals initial user data', () => {
      wrapper.vm.user = { id: '123', name: 'John Doe' };
      expect(wrapper.vm.isDisabled).toBe(true);
    });

    it('should be false when user data differs from initial data', () => {
      expect(wrapper.vm.isDisabled).toBe(true);
      wrapper.vm.user = { id: '123', name: 'David Williams' };
      expect(wrapper.vm.isDisabled).toBe(false);
    });
  });

  describe('Test computed: formSections', () => {
    it('should retrieve form sections from module host configuration and sort them by order', () => {
      const formSections = wrapper.vm.formSections;
      expect(formSections).toHaveLength(2);
      expect(formSections[0].id).toBe('main');
      expect(formSections[1].id).toBe('secondary');
      expect(formSections[0].fields).toHaveLength(2);
      expect(formSections[0].fields[0].name).toBe('firstName');
      expect(formSections[0].fields[1].name).toBe('email');
      expect(formSections[1].fields).toHaveLength(1);
      expect(formSections[1].fields[0].name).toBe('enabled');
    });
  });

  describe('Test computed: uiProps', () => {
    it('should retrieve uiProps with default values', () => {
      const uiProps = wrapper.vm.uiProps;
      expect(uiProps).toBeDefined();
      expect(uiProps.card).toBeDefined();
      expect(uiProps.card.main).toBeDefined();
      expect(uiProps.card.secondary).toBeDefined();
    });
  });

  describe('Test function: loadData', () => {
    it('should load user data successfully', async () => {
      wrapper.vm.user = {};
      wrapper.vm.isLoadingUser = false;

      const loadDataPromise = wrapper.vm.loadData();
      expect(wrapper.vm.isLoadingUser).toBe(true);
      await loadDataPromise;

      expect(wrapper.vm.isLoadingUser).toBe(false);
      expect(wrapper.vm.user).toEqual({ id: '123', name: 'John Doe' });
      expect(getEntityById).toHaveBeenCalledWith('test-instance-id', '123');
    });

    it('should show error notification and redirect to /users on error', async () => {
      getEntityById.mockImplementationOnce(() => Promise.reject());
      mockNotify.mockClear();

      await wrapper.vm.loadData();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated_loadError',
      });
      expect(wrapper.vm.isLoadingUser).toBe(false);
      expect(mockPush).toHaveBeenCalledWith({ path: '/users' });
    });
  });

  describe('Test function: save', () => {
    it('should update user and redirect to user detail', async () => {
      wrapper.vm.isLoading = false;
      mockNotify.mockClear();

      const savePromise = wrapper.vm.save();
      expect(wrapper.vm.isLoading).toBe(true);
      await savePromise;

      expect(updateEntity).toHaveBeenCalledWith('test-instance-id', '123', {
        id: '123',
        name: 'John Doe',
      });
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'translated_editSuccess',
      });
      expect(mockPush).toHaveBeenCalledWith({ path: '/users/123' });
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should show error notification and not redirect if update fails', async () => {
      updateEntity.mockImplementationOnce(() => Promise.reject());
      mockPush.mockClear();
      mockNotify.mockClear();

      await wrapper.vm.save();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'translated_editError',
      });
      expect(mockPush).not.toHaveBeenCalled();
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: cancel', () => {
    it('should redirect to user detail when called', () => {
      wrapper.vm.cancel();

      expect(mockPush).toHaveBeenCalledWith({ path: '/users/123' });
    });
  });
});
