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
 */

import { saveEntity } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericCreationPage from '../../../src/pages/GenericCreationPage.vue';

const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  matched: [{ path: '/page' }],
};

const mockNotify = vi.fn();
const mockRouterPush = vi.fn();

const mockModuleOptions = {
  idKey: 'id',
  formSections: [
    {
      id: 'identity',
      fields: [
        {
          name: 'code',
        },
        {
          name: 'name',
        },
      ],
    },
  ],
};

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: {
    template: '<div />',
  },
  saveEntity: vi.fn(() =>
    Promise.resolve({
      id: 'created-entity-id',
    })
  ),
  getModuleHostConfiguration: () => ({
    options: mockModuleOptions,
  }),
  useScopedI18n: () => ({
    t: vi.fn((v) => v),
    te: vi.fn(() => false),
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({
    ui: () => ({}),
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('Test component: GenericCreationPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(GenericCreationPage, {
      global: {
        stubs: [
          'ButtonsCard',
          'EntityAttributeField',
          'q-form',
          'q-card',
          'q-card-section',
        ],
      },
    });
  });

  describe('Test initialization', () => {
    it('should initialize an empty entity', () => {
      expect(wrapper.vm.entity).toEqual({});
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should load creation page configuration', () => {
      expect(wrapper.vm.options).toEqual(mockModuleOptions);
    });
  });

  describe('Test function: save', () => {
    it('should save entity and redirect to details page on success', async () => {
      wrapper.vm.entity = {
        code: 'APP',
        name: 'Application',
      };

      await wrapper.vm.save();

      expect(saveEntity).toHaveBeenCalledWith('test-instance-id', {
        code: 'APP',
        name: 'Application',
      });

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'success',
      });

      expect(mockRouterPush).toHaveBeenCalledWith({
        path: '/page/created-entity-id',
      });

      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should notify on save error', async () => {
      vi.mocked(saveEntity).mockRejectedValueOnce(new Error('creation error'));

      await wrapper.vm.save();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });

      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should set loading state while saving', async () => {
      let resolveSave;

      vi.mocked(saveEntity).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSave = resolve;
          })
      );

      const promise = wrapper.vm.save();

      expect(wrapper.vm.isLoading).toBe(true);

      resolveSave({
        id: 'created-entity-id',
      });

      await promise;

      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: cancel', () => {
    it('should navigate to the parent path', () => {
      wrapper.vm.cancel();

      expect(mockRouterPush).toHaveBeenCalledWith({
        path: '/page',
      });
    });
  });
});
