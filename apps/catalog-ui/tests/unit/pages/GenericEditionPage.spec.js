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

import { getEntityById, updateEntity } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericEditionPage from '../../../src/pages/GenericEditionPage.vue';

const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  params: {
    id: 'entity-123',
  },
};

const mockNotify = vi.fn();
const mockRouterPush = vi.fn();

const mockModuleOptions = {
  idKey: 'id',
  parentPath: '/page/{{ entity.id }}',
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

const mockEntity = {
  id: 'entity-123',
  code: 'APP',
  name: 'Application',
};

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: {
    template: '<div />',
  },
  getEntityById: vi.fn(() => Promise.resolve(mockEntity)),
  updateEntity: vi.fn(() =>
    Promise.resolve({
      id: 'entity-123',
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
  useNunjucks: () => ({
    render: vi.fn((value, context) =>
      value.replace('{{ entity.id }}', context.entity?.id || '')
    ),
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('Test component: GenericEditionPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(GenericEditionPage, {
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
    it('should load entity data on mount', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.entity).toEqual(mockEntity);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should load edition page configuration', () => {
      expect(wrapper.vm.options).toEqual(mockModuleOptions);
    });

    it('should extract entity id from route params', () => {
      expect(wrapper.vm.entityId).toBe('entity-123');
    });
  });

  describe('Test function: loadData', () => {
    it('should load entity data on mount', async () => {
      vi.clearAllMocks();

      await wrapper.vm.loadData();

      expect(getEntityById).toHaveBeenCalledWith(
        'test-instance-id',
        'entity-123'
      );
      expect(wrapper.vm.entity).toEqual(mockEntity);
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should set loading state while loading data', async () => {
      vi.clearAllMocks();

      let resolveLoad;

      vi.mocked(getEntityById).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          })
      );

      const promise = wrapper.vm.loadData();

      expect(wrapper.vm.isLoading).toBe(true);

      resolveLoad(mockEntity);

      await promise;

      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should notify on load error and navigate back', async () => {
      vi.mocked(getEntityById).mockRejectedValueOnce(new Error('load error'));

      await wrapper.vm.loadData();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/page/entity-123');

      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: save', () => {
    it('should update entity and redirect to parent page on success', async () => {
      wrapper.vm.entity = {
        id: 'entity-123',
        code: 'APP-UPDATED',
        name: 'Application Updated',
      };

      await wrapper.vm.save();

      expect(updateEntity).toHaveBeenCalledWith(
        'test-instance-id',
        'entity-123',
        {
          id: 'entity-123',
          code: 'APP-UPDATED',
          name: 'Application Updated',
        }
      );

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'positive',
        message: 'success',
      });

      expect(mockRouterPush).toHaveBeenCalledWith('/page/entity-123');

      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should notify on save error', async () => {
      vi.clearAllMocks();

      vi.mocked(updateEntity).mockRejectedValueOnce(new Error('update error'));

      await wrapper.vm.save();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });

      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should set loading state while saving', async () => {
      vi.clearAllMocks();

      let resolveSave;

      vi.mocked(updateEntity).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSave = resolve;
          })
      );

      const promise = wrapper.vm.save();

      expect(wrapper.vm.isLoading).toBe(true);

      resolveSave({
        id: 'entity-123',
      });

      await promise;

      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: goBack', () => {
    it('should navigate to the parent path', () => {
      wrapper.vm.goBack();

      expect(mockRouterPush).toHaveBeenCalledWith('/page/entity-123');
    });
  });
});
