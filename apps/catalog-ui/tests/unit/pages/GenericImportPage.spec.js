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

import { saveEntity } from '@linagora/linid-im-front-corelib';
import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericImportPage from '../../../src/pages/GenericImportPage.vue';

const mockRouterPush = vi.fn();
const mockNotify = vi.fn();
const mockRenderString = vi.fn((template) => template);

vi.mock('vue-router', () => ({
  useRoute: () => ({
    meta: {
      instanceId: 'test-instance-id',
    },
    query: {},
  }),
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: {
    template: '<div />',
  },
  saveEntity: vi.fn(() => Promise.resolve({})),
  getModuleHostConfiguration: () => ({
    options: {
      parentPath: '/parent',
      fieldMappingTemplates: {
        name: '{{name}}',
      },
      useColumnIndexParsing: false,
      skipFirstCsvNLines: 0,
      numberOfParallelImports: 2,
    },
  }),
  useNotify: () => ({ Notify: mockNotify }),
  useNunjucks: () => ({ renderString: mockRenderString }),
  useScopedI18n: () => ({ t: (key) => key, te: () => false }),
  useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
}));

describe('Test component: GenericImportPage', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(GenericImportPage, {
      global: {
        stubs: [
          'ButtonsCard',
          'DropdownButton',
          'LoadFilesField',
          'ImportedDataTable',
          'q-card',
          'q-card-section',
        ],
      },
    });
  });

  describe('Test computed: fields', () => {
    it('should list the mapped fields', () => {
      expect(wrapper.vm.fields).toEqual(['name']);
    });
  });

  describe('Test function: cancel', () => {
    it('should redirect to the rendered parent path', () => {
      wrapper.vm.cancel();
      expect(mockRenderString).toHaveBeenCalledWith('/parent', {
        entity: {},
        query: {},
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/parent');
    });
  });

  describe('Test function: deleteRow', () => {
    it('should remove wanted row', () => {
      wrapper.vm.fileItems = [{ __id: 1 }, { __id: 2 }];
      wrapper.vm.deleteRow(2);
      expect(wrapper.vm.fileItems).toEqual([{ __id: 1 }]);
    });
  });

  describe('Test function: updateData', () => {
    it('should update fileItems', () => {
      const newData = [{ __id: 10 }];
      wrapper.vm.updateData(newData);
      expect(wrapper.vm.fileItems).toEqual(newData);
    });
  });

  describe('Test function: importAllData', () => {
    it('should notify success', async () => {
      wrapper.vm.fileItems = [{ __id: 1, __status: 'READY' }];
      await wrapper.vm.importAllData();
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'positive' })
      );
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should only import rows ready to be imported', async () => {
      wrapper.vm.fileItems = [
        { __id: 1, __status: 'READY' },
        { __id: 2, __status: 'IMPORTED' },
      ];
      await wrapper.vm.importAllData();
      expect(saveEntity).toHaveBeenCalledTimes(1);
    });

    it('should notify warning if some fail', async () => {
      wrapper.vm.fileItems = [
        { __id: 1, __status: 'READY' },
        { __id: 2, __status: 'READY' },
      ];
      saveEntity.mockResolvedValueOnce({});
      saveEntity.mockRejectedValueOnce(new Error('fail'));
      await wrapper.vm.importAllData();
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      );
    });

    it('should notify error if all fail', async () => {
      wrapper.vm.fileItems = [{ __id: 1, __status: 'READY' }];
      saveEntity.mockRejectedValueOnce(new Error('fail'));
      await wrapper.vm.importAllData();
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'negative' })
      );
    });
  });

  describe('Test function: importData', () => {
    it('should send the row without internal fields and set it as imported', async () => {
      const data = {
        __id: 1,
        __status: 'READY',
        __file: 'file.csv',
        name: 'John',
      };
      const result = await wrapper.vm.importData(data);
      expect(saveEntity).toHaveBeenCalledWith('test-instance-id', {
        name: 'John',
      });
      expect(result).toBe(true);
      expect(data.__status).toBe('IMPORTED');
    });

    it('should set data as error', async () => {
      const data = { __id: 1 };
      saveEntity.mockRejectedValueOnce(new Error('fail'));
      const result = await wrapper.vm.importData(data);
      expect(result).toBe(false);
      expect(data.__status).toBe('ERROR');
      expect(data.__error).toBe('fail');
    });
  });

  describe('Test function: clear', () => {
    it('should remove matching rows and notify positive', () => {
      wrapper.vm.fileItems = [
        { __id: 1, __status: 'ERROR' },
        { __id: 2, __status: 'IMPORTED' },
        { __id: 3, __status: 'READY' },
      ];
      wrapper.vm.clear(['ERROR', 'IMPORTED']);
      expect(wrapper.vm.fileItems).toEqual([{ __id: 3, __status: 'READY' }]);
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'positive' })
      );
    });

    it('should notify warning if no rows are removed', () => {
      wrapper.vm.fileItems = [{ __id: 1, __status: 'READY' }];
      wrapper.vm.clear(['ERROR']);
      expect(wrapper.vm.fileItems).toEqual([{ __id: 1, __status: 'READY' }]);
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning' })
      );
    });
  });

  describe('Test function: onClearItemClick', () => {
    it.each([
      ['clearAll', []],
      [
        'clearError',
        [
          { __id: 2, __status: 'IMPORTED' },
          { __id: 3, __status: 'READY' },
        ],
      ],
      [
        'clearImported',
        [
          { __id: 1, __status: 'ERROR' },
          { __id: 3, __status: 'READY' },
        ],
      ],
    ])('should clear the rows matching %s', (key, expected) => {
      wrapper.vm.fileItems = [
        { __id: 1, __status: 'ERROR' },
        { __id: 2, __status: 'IMPORTED' },
        { __id: 3, __status: 'READY' },
      ];
      wrapper.vm.onClearItemClick({ key });
      expect(wrapper.vm.fileItems).toEqual(expected);
    });
  });
});
