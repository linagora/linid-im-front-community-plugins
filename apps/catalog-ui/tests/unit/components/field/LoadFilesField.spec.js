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
import Papa from 'papaparse';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoadFilesField from '../../../../src/components/field/LoadFilesField.vue';

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
  useNunjucks: () => ({
    renderString: renderStringMock,
  }),
}));

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((file, config) => {
      config.complete({
        data: [{ firstName: 'John' }],
        errors: [],
      });
    }),
  },
}));

/**
 * Build the parsing options, fresh on every call so a test cannot leak state into the next one.
 * @param overrides - Options overriding the defaults.
 * @returns The parsing options.
 */
function createParsingOptions(overrides = {}) {
  return {
    fieldMappingTemplates: {
      firstName: '{{ firstName }}',
      email: '{{ email }}',
    },
    useColumnIndexParsing: false,
    expectedCsvHeaders: ['firstName', 'email'],
    skipFirstCsvNLines: 0,
    ...overrides,
  };
}

describe('Test component: LoadFilesField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(LoadFilesField, {
      props: {
        uiNamespace: 'test-ui',
        i18nScope: 'test-scope',
        parsingOptions: createParsingOptions(),
      },
      global: {
        stubs: ['q-file'],
      },
    });
  });

  describe('Test function: loadFiles', () => {
    it('should emit loaded rows and notify success', async () => {
      renderStringMock.mockReturnValue('John');

      await wrapper.vm.loadFiles([new File(['content'], 'test.csv')]);

      expect(wrapper.emitted('update:data')[0][0]).toHaveLength(1);
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'positive',
          message: 'loadSuccess',
        })
      );
      expect(wrapper.vm.isLoading).toBe(false);
    });

    it('should notify warning when no row is loaded', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({ data: [], errors: [] });
      });

      await wrapper.vm.loadFiles([new File(['content'], 'test.csv')]);

      expect(wrapper.emitted('update:data')[0][0]).toEqual([]);
      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'warning', message: 'loadEmpty' })
      );
    });

    it('should show error notification on error', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.error(new Error('parse error'));
      });

      await wrapper.vm.loadFiles([new File(['content'], 'test.csv')]);

      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'negative', message: 'loadError' })
      );
    });
  });

  describe('Test function: parseCsv', () => {
    it('should return parsed rows with internal fields', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({
          data: [{ firstName: 'John', email: 'john@test.com' }],
          errors: [],
        });
      });
      renderStringMock.mockReturnValue('mapped');

      const result = await wrapper.vm.parseCsv(
        new File(['content'], 'test.csv')
      );

      expect(result).toEqual([
        {
          __status: 'READY',
          __id: 1,
          __file: 'test.csv',
          firstName: 'mapped',
          email: 'mapped',
        },
      ]);
      expect(Papa.parse).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({ header: true })
      );
    });

    it('should use column index parsing when enabled', async () => {
      await wrapper.setProps({
        parsingOptions: createParsingOptions({ useColumnIndexParsing: true }),
      });
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({ data: [['John', 'john@test.com']], errors: [] });
      });

      await wrapper.vm.parseCsv(new File(['content'], 'test.csv'));

      expect(Papa.parse).toHaveBeenCalledWith(
        expect.any(File),
        expect.objectContaining({ header: false })
      );
    });

    it('should reject when parse errors exist', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({ data: [], errors: [{ message: 'error' }] });
      });

      await expect(
        wrapper.vm.parseCsv(new File(['content'], 'test.csv'))
      ).rejects.toBeDefined();
    });
  });

  describe('Test function: mapItem', () => {
    it('should render each mapping template with the row as context', () => {
      renderStringMock.mockReturnValue('mapped-value');
      const row = { firstName: 'John', email: 'john@test.com' };

      const result = wrapper.vm.mapItem(row);

      expect(renderStringMock).toHaveBeenCalledWith('{{ firstName }}', row);
      expect(renderStringMock).toHaveBeenCalledWith('{{ email }}', row);
      expect(result).toEqual({
        firstName: 'mapped-value',
        email: 'mapped-value',
      });
    });
  });

  describe('Test function: mapItemByIndex', () => {
    it('should map CSV row array to object using expectedCsvHeaders', () => {
      expect(wrapper.vm.mapItemByIndex(['John', 'john@test.com'])).toEqual({
        firstName: 'John',
        email: 'john@test.com',
      });
    });

    it('should return empty object if expectedCsvHeaders is undefined', async () => {
      await wrapper.setProps({
        parsingOptions: createParsingOptions({ expectedCsvHeaders: undefined }),
      });

      expect(wrapper.vm.mapItemByIndex(['John', 'john@test.com'])).toEqual({});
    });
  });

  describe('Test function: parseCsvWithColumnIndex', () => {
    it('should parse CSV file using column index mapping', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({ data: [['John', 'john@test.com']], errors: [] });
      });
      renderStringMock.mockImplementation((template, context) =>
        template.includes('firstName') ? context.firstName : context.email
      );

      const result = await wrapper.vm.parseCsvWithColumnIndex(
        new File(['John,john@test.com'], 'test.csv')
      );

      expect(result).toEqual([
        {
          __status: 'READY',
          __id: 1,
          __file: 'test.csv',
          firstName: 'John',
          email: 'john@test.com',
        },
      ]);
    });

    it('should reject if parse errors exist', async () => {
      Papa.parse.mockImplementationOnce((_file, config) => {
        config.complete({ data: [], errors: [{ message: 'error' }] });
      });

      await expect(
        wrapper.vm.parseCsvWithColumnIndex(new File([''], 'test.csv'))
      ).rejects.toBeDefined();
    });
  });
});
