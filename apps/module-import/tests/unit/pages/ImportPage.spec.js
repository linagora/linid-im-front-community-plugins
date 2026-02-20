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
import ImportPage from '../../../src/pages/ImportPage.vue';
import { useRouter } from 'vue-router';

const pushMock = vi.fn();
const postMock = vi.fn(() => Promise.resolve({}));
const notifyMock = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({
    meta: {
      instanceId: 'instanceId',
    },
  }),
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useNotify: () => ({ Notify: notifyMock }),
  getHttpClient: () => ({
    post: postMock,
  }),
  getModuleHostConfiguration: vi.fn(() => ({
    instanceId: 'instanceId',
    apiEndpoint: 'apiEndpoint',
    options: {
      parentInstanceId: 'parentInstanceId',
      previousPath: 'previousPath',
      csvHeadersMapping: {
        name: '{{name}}',
      },
      useColumnMapping: false,
      numberOfParallelImports: 2,
    },
  })),
  loadAsyncComponent: vi.fn(() => null),
  useScopedI18n: () => ({ t: (key) => key }),
  useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
}));

describe('Test component: ImportPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(ImportPage);
  });

  describe('cancel', () => {
    it('should redirect to previous page', () => {
      wrapper.vm.cancel();
      expect(useRouter().push).toHaveBeenCalledWith({ path: 'previousPath' });
    });
  });

  describe('deleteRow', () => {
    it('should remove wanted row', () => {
      wrapper.vm.fileItems = [{ __id: 1 }, { __id: 2 }];
      wrapper.vm.deleteRow(2);
      expect(wrapper.vm.fileItems).toEqual([{ __id: 1 }]);
    });
  });

  describe('updateData', () => {
    it('should update fileItems', () => {
      const newData = [{ __id: 10 }];
      wrapper.vm.updateData(newData);
      expect(wrapper.vm.fileItems).toEqual(newData);
    });
  });

  describe('importAllData', () => {
    it('should notify success', async () => {
      wrapper.vm.fileItems = [{ __id: 1 }];
      await wrapper.vm.importAllData();
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'positive' })
      );
    });

    it('should notify warning if some fail', async () => {
      wrapper.vm.fileItems = [{ __id: 1 }, { __id: 2 }];
      postMock.mockResolvedValueOnce({});
      postMock.mockRejectedValueOnce(new Error('fail'));
      await wrapper.vm.importAllData();
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      );
    });

    it('should notify error if all fail', async () => {
      wrapper.vm.fileItems = [{ __id: 1 }];
      postMock.mockRejectedValueOnce(new Error('fail'));
      await wrapper.vm.importAllData();
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      );
    });
  });

  describe('importData', () => {
    it('should set data as imported', async () => {
      const data = { __id: 1 };
      postMock.mockResolvedValueOnce({});
      const result = await wrapper.vm.importData(data);
      expect(result).toBe(true);
      expect(data.__status).toBe('IMPORTED');
    });

    it('should set data as error', async () => {
      const data = { __id: 1 };
      postMock.mockRejectedValueOnce(new Error('fail'));
      const result = await wrapper.vm.importData(data);
      expect(result).toBe(false);
      expect(data.__status).toBe('ERROR');
      expect(data.__error).toBe('fail');
    });
  });

  describe('clear', () => {
    it('should notify and clear rows', () => {
      wrapper.vm.fileItems = [
        { __id: 1, __status: 'ERROR' },
        { __id: 2, __status: 'IMPORTED' },
        { __id: 3, __status: 'READY' },
      ];
      wrapper.vm.clear(['ERROR', 'IMPORTED']);
      expect(wrapper.vm.fileItems).toEqual([{ __id: 3, __status: 'READY' }]);
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'positive' })
      );
    });
  });
});
