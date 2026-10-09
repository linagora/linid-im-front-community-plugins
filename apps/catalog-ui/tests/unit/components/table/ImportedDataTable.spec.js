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
    translateOrDefault: (_defaultValue, key) => key,
  }),
  useUiDesign: () => ({
    ui: () => ({}),
  }),
}));

describe('Test component: ImportedDataTable', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = shallowMount(ImportedDataTable, {
      props: {
        uiNamespace: 'ui-namespace',
        i18nScope: 'i18n-scope',
        fields: ['firstName', 'email'],
        rows: [],
      },
    });
  });

  describe('Test computed: columns', () => {
    it('should put internal columns first, then the configured fields', () => {
      const columns = wrapper.vm.columns;

      expect(
        columns.map(({ name, field, label, sortable }) => ({
          name,
          field,
          label,
          sortable,
        }))
      ).toEqual([
        {
          name: '__error',
          field: '__error',
          label: 'headers.__error',
          sortable: false,
        },
        {
          name: '__delete',
          field: '__id',
          label: 'headers.__delete',
          sortable: false,
        },
        {
          name: '__file',
          field: '__file',
          label: 'headers.__file',
          sortable: true,
        },
        {
          name: '__status',
          field: '__status',
          label: 'headers.__status',
          sortable: true,
        },
        {
          name: 'firstName',
          field: 'firstName',
          label: 'headers.firstName',
          sortable: true,
        },
        {
          name: 'email',
          field: 'email',
          label: 'headers.email',
          sortable: true,
        },
      ]);
    });
  });

  describe('Test function: getRowClass', () => {
    it('should return "row-error" when row status is ERROR', () => {
      expect(wrapper.vm.getRowClass({ __status: 'ERROR' })).toBe('row-error');
    });

    it.each(['READY', 'IMPORTING', 'IMPORTED'])(
      'should return empty string when row status is %s',
      (status) => {
        expect(wrapper.vm.getRowClass({ __status: status })).toBe('');
      }
    );
  });
});
