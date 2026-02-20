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
import LoadFilesField from '../../../../src/components/field/LoadFilesField.vue';
import Papa from 'papaparse';

const notifyMock = vi.fn();
const renderStringMock = vi.fn();

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useNotify: () => ({
    Notify: notifyMock,
  }),
  useScopedI18n: () => ({
    t: (key) => key,
    translateOrDefault: () => '',
  }),
  useUiDesign: () => ({
    ui: () => ({}),
  }),
  getModuleHostConfiguration: vi.fn(() => ({
    options: {
      csvHeadersMapping: {
        firstName: '{{ First Name }}',
        email: '{{ Email }}',
      },
      useColumnMapping: false,
      expectedColumns: ['firstName', 'email'],
    },
  })),
}));

vi.mock('nunjucks', () => ({
  default: {
    configure: () => ({
      renderString: renderStringMock,
    }),
  },
}));

vi.mock('papaparse', () => {
  return {
    default: {
      parse: vi.fn((file, config) => {
        config.complete({
          data: [{ firstName: 'John' }],
          errors: [],
        });
      }),
    },
  };
});

describe('Test component: LoadFilesField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(LoadFilesField, {
      props: {
        instanceId: 'test-instance',
        uiNamespace: 'test-ui',
        i18nScope: 'test-scope',
      },
      global: {
        stubs: {
          QFile: {
            name: 'QFile',
            props: [
              'modelValue',
              'loading',
              'label',
              'counterLabel',
              'hint',
              'prefix',
              'suffix',
              'multiple',
            ],
            template: '<div />',
          },
        },
      },
    });
  });

  describe('Test computed: options', () => {
    it('should retrieve options from module host configuration', () => {
      const options = wrapper.vm.options;
      expect(options).toBeDefined();
      expect(options.csvHeadersMapping).toEqual({
        firstName: '{{ First Name }}',
        email: '{{ Email }}',
      });
    });
  });

  describe('Test function: loadFiles', () => {
    it('should load files successfully', async () => {
      const file = new File(['content'], 'test.csv');

      vi.spyOn(wrapper.vm, 'parseCsv').mockResolvedValue([
        {
          __status: 'READY',
          __id: 1,
          __file: 'test.csv',
          firstName: 'John',
        },
      ]);

      await wrapper.vm.loadFiles([file]);

      expect(wrapper.emitted()['update:data']).toBeTruthy();
      expect(wrapper.emitted()['update:data'][0][0]).toHaveLength(1);
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'positive',
          message: 'loadSuccess',
        })
      );
    });

    it('should show error notification on error', async () => {
      const file = new File(['content'], 'test.csv');

      Papa.parse.mockImplementation((_, config) => {
        config.error(new Error('parse error'));
      });

      await wrapper.vm.loadFiles([file]);

      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'negative',
        })
      );
    });
  });

  describe('Test function: parseCsv', () => {
    it('on success should return parsed files without error and with valid data', async () => {
      const file = new File(['content'], 'test.csv');

      Papa.parse.mockImplementation((_file, config) => {
        config.complete({
          data: [{ 'First Name': 'John', Email: 'john@test.com' }],
          errors: [],
        });
      });

      renderStringMock.mockReturnValue('mapped');

      const result = await wrapper.vm.parseCsv(file);

      expect(result).toHaveLength(1);
      expect(result[0].__status).toBe('READY');
      expect(result[0].__file).toBe('test.csv');
      expect(result[0].firstName).toBeDefined();
    });

    it('on error should reject when parse errors exist', async () => {
      const file = new File(['content'], 'test.csv');

      Papa.parse.mockImplementation((_file, config) => {
        config.complete({
          data: [],
          errors: [{ message: 'error' }],
        });
      });

      await expect(wrapper.vm.parseCsv(file)).rejects.toBeDefined();
    });
  });

  describe('Test function: mapItem', () => {
    it('should mapped item', () => {
      renderStringMock.mockReturnValue('mapped-value');

      const result = wrapper.vm.mapItem({
        'First Name': 'John',
        Email: 'john@test.com',
      });

      expect(renderStringMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        firstName: 'mapped-value',
        email: 'mapped-value',
      });
    });
  });

  describe('Test function: mapItemByIndex', () => {
    it('should map CSV row array to object using expectedColumns', () => {
      wrapper.vm.options.expectedColumns = ['firstName', 'email'];
      const row = ['John', 'john@test.com'];

      const result = wrapper.vm.mapItemByIndex(row);

      expect(result).toEqual({
        firstName: 'John',
        email: 'john@test.com',
      });
    });

    it('should return empty object if expectedColumns is undefined', () => {
      wrapper.vm.options.expectedColumns = undefined;
      const row = ['John', 'john@test.com'];

      const result = wrapper.vm.mapItemByIndex(row);

      expect(result).toEqual({});
    });
  });

  describe('Test function: parseCsvWithColumnIndex', () => {
    it('should parse CSV file using column index mapping', async () => {
      wrapper.vm.options.useColumnMapping = true;
      wrapper.vm.options.expectedColumns = ['firstName', 'email'];

      const file = new File(['John,john@test.com'], 'test.csv');

      Papa.parse.mockImplementation((_file, config) => {
        config.complete({
          data: [['John', 'john@test.com']],
          errors: [],
        });
      });

      renderStringMock.mockImplementation((template, context) => {
        if (template.includes('First Name')) {
          return context.firstName;
        }
        if (template.includes('Email')) {
          return context.email;
        }
        return 'mapped';
      });

      const result = await wrapper.vm.parseCsvWithColumnIndex(file);

      expect(result).toHaveLength(1);
      expect(result[0].__status).toBe('READY');
      expect(result[0].__id).toBe(1);
      expect(result[0].__file).toBe('test.csv');
      expect(result[0].firstName).toBe('John');
      expect(result[0].email).toBe('john@test.com');
    });

    it('should reject if parse errors exist', async () => {
      wrapper.vm.options.useColumnMapping = true;
      wrapper.vm.options.expectedColumns = ['firstName', 'email'];

      const file = new File(['John,john@test.com'], 'test.csv');

      Papa.parse.mockImplementation((_file, config) => {
        config.complete({
          data: [],
          errors: [{ message: 'error' }],
        });
      });

      await expect(
        wrapper.vm.parseCsvWithColumnIndex(file)
      ).rejects.toBeDefined();
    });
  });
});
