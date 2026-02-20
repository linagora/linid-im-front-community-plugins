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
import ImportedDataTable from '../../../../src/components/table/ImportedDataTable.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: (key) => key,
    translateOrDefault: (a, b) => b,
  }),
  useUiDesign: () => ({
    ui: () => ({}),
  }),
  getModuleHostConfiguration: () => ({
    options: {
      csvHeadersMapping: {
        firstName: '{{ First Name }}',
        email: '{{ Email }}',
      },
    },
  }),
}));

describe('Test component: ImportedDataTable', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(ImportedDataTable, {
      props: {
        instanceId: 'instance-id',
        uiNamespace: 'ui-namespace',
        i18nScope: 'i18n-scope',
        rows: [],
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

  describe('Test computed: columns', () => {
    it('should retrieve valid columns from module host configuration', () => {
      const columns = wrapper.vm.columns;

      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns).toHaveLength(6);

      expect(columns[0]).toMatchObject({
        field: '__error',
        name: '__error',
        label: 'headers.__error',
        sortable: false,
      });

      expect(columns[1]).toMatchObject({
        field: '__id',
        name: '__delete',
        label: 'headers.__delete',
        sortable: false,
      });

      expect(columns[2]).toMatchObject({
        field: '__file',
        name: '__file',
        label: 'headers.__file',
        sortable: true,
      });

      expect(columns[3]).toMatchObject({
        field: '__status',
        name: '__status',
        label: 'headers.__status',
        sortable: true,
      });

      expect(columns[4]).toMatchObject({
        field: 'firstName',
        name: 'firstName',
        label: 'headers.firstName',
        sortable: true,
      });

      expect(columns[5]).toMatchObject({
        field: 'email',
        name: 'email',
        label: 'headers.email',
        sortable: true,
      });
    });
  });

  describe('Test function: getRowClass', () => {
    it('should return "row-error" when row status is ERROR', () => {
      const row = { __status: 'ERROR' };
      expect(wrapper.vm.getRowClass(row)).toBe('row-error');
    });

    it('should return empty string when row status is READY', () => {
      const row = { __status: 'READY' };
      expect(wrapper.vm.getRowClass(row)).toBe('');
    });

    it('should return empty string when row status is undefined', () => {
      const row = { __status: '' };
      expect(wrapper.vm.getRowClass(row)).toBe('');
    });

    it('should ignore other properties and only check __status', () => {
      const row = { __status: 'PENDING', firstName: 'John' };
      expect(wrapper.vm.getRowClass(row)).toBe('');
    });
  });
});
