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

import { getEntityById } from '@linagora/linid-im-front-corelib';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericDetailsPage from '../../../src/pages/GenericDetailsPage.vue';

const mockRoute = {
  meta: {
    instanceId: 'test-instance-id',
  },
  matched: [{ path: '/page' }],
  params: {
    id: 'test-entity-id',
  },
};

const mockNotify = vi.fn();
const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterHistoryState = { back: null };
const mockSubscription = { unsubscribe: vi.fn() };
const mockSubscribe = vi.fn(() => mockSubscription);
const mockModuleOptions = {
  sections: [
    { key: 'identity', fieldOrder: ['code', 'name'] },
    { key: 'audit', fieldOrder: ['createdBy'], showRemainingFields: true },
  ],
  editPath: '/page/{{ entity.id }}/edit',
  reloadDetailsOn: ['form'],
};

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: {
    name: 'LinidZoneRenderer',
    props: ['zone'],
    template: '<div />',
  },
  getEntityById: vi.fn(() => Promise.resolve({ id: 'test-entity-id' })),
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
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => ({
    render: (value, context) =>
      value.replace('{{ entity.id }}', context.entity.id),
  }),
  uiEventSubject: {
    subscribe: (callback) => mockSubscribe(callback),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
    options: { history: { state: mockRouterHistoryState } },
  }),
}));

describe('Test component: GenericDetailsPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterHistoryState.back = null;
    wrapper = shallowMount(GenericDetailsPage, {
      global: {
        stubs: {
          QPage: {
            name: 'QPage',
            template: '<div><slot /></div>',
          },
          ButtonsCard: {
            name: 'ButtonsCard',
            template: '<div><slot name="append-buttons" /></div>',
          },
          EntityDetailsCard: true,
          LinidZoneRenderer: false,
        },
      },
    });
  });

  describe('Test function: loadData', () => {
    it('should load the entity on mount and expose it', async () => {
      await flushPromises();

      expect(getEntityById).toHaveBeenCalledWith(
        'test-instance-id',
        'test-entity-id'
      );
      expect(wrapper.vm.entity).toEqual({ id: 'test-entity-id' });
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should notify and navigate back on loading error', async () => {
      vi.mocked(getEntityById).mockRejectedValueOnce(new Error('boom'));

      await wrapper.vm.loadData();

      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'error',
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/page');
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Test function: goBack', () => {
    it('should use the browser history when a previous entry exists', () => {
      mockRouterHistoryState.back = '/previous';

      wrapper.vm.goBack();

      expect(mockRouterBack).toHaveBeenCalled();
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('should navigate to the parent path when there is no history entry', () => {
      wrapper.vm.goBack();

      expect(mockRouterBack).not.toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/page');
    });
  });

  describe('Test function: goToEdit', () => {
    it('should navigate to the rendered edit page path', async () => {
      await flushPromises();

      wrapper.vm.goToEdit();

      expect(mockRouterPush).toHaveBeenCalledWith('/page/test-entity-id/edit');
    });
  });

  describe('Test hook: onMounted', () => {
    it('should reload the entity when a configured UI event is emitted', async () => {
      await flushPromises();
      vi.mocked(getEntityById).mockClear();

      const callback = mockSubscribe.mock.calls[0][0];
      callback({ key: 'form' });

      expect(getEntityById).toHaveBeenCalledWith(
        'test-instance-id',
        'test-entity-id'
      );
    });

    it('should not reload the entity for an unrelated UI event', async () => {
      await flushPromises();
      vi.mocked(getEntityById).mockClear();

      const callback = mockSubscribe.mock.calls[0][0];
      callback({ key: 'unrelated' });

      expect(getEntityById).not.toHaveBeenCalled();
    });
  });

  describe('Test hook: onUnmounted', () => {
    it('should unsubscribe from the UI event bus', () => {
      wrapper.unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Test zones: LinidZoneRenderer', () => {
    it('should expose the titleAppend, extraButtons and extraContent zones', async () => {
      await flushPromises();

      const renderers = wrapper.findAllComponents({
        name: 'LinidZoneRenderer',
      });
      const zones = renderers.map((renderer) => renderer.props('zone'));

      expect(zones).toEqual([
        'test-instance-id.titleAppend',
        'test-instance-id.extraButtons',
        'test-instance-id.extraContent',
      ]);
    });

    it('should forward the instance context to the zone renderers', async () => {
      await flushPromises();

      const renderers = wrapper.findAllComponents({
        name: 'LinidZoneRenderer',
      });

      renderers.forEach((renderer) => {
        expect(renderer.attributes()).toMatchObject({
          instanceid: 'test-instance-id',
        });
      });
    });
  });
});
