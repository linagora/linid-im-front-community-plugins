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
import { defineComponent } from 'vue';
import GenericEntityTable from '../../../src/components/GenericEntityTable.vue';

const mockUi = vi.fn(() => ({ dense: true }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({
    ui: mockUi,
  }),
}));

describe('GenericEntityTable', () => {
  let wrapper;

  const columns = [
    { name: 'id', label: 'ID', field: 'id', align: 'left' },
    { name: 'name', label: 'Name', field: 'name', align: 'left' },
  ];

  const rows = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  const defaultProps = {
    columns,
    rows,
    uiNamespace: 'catalog-ui',
  };

  beforeEach(() => {
    mockUi.mockClear();
    wrapper = shallowMount(GenericEntityTable, {
      props: defaultProps,
      global: {
        stubs: {
          'q-table': defineComponent({
            name: 'QTable',
            props: {
              columns: { type: Array, default: () => [] },
              rows: { type: Array, default: () => [] },
              rowKey: { type: [String, Function], default: 'id' },
            },
            template: '<div />',
          }),
        },
      },
    });
  });

  it('should call ui() for q-table with correct namespace', () => {
    expect(mockUi).toHaveBeenCalledWith(
      'catalog-ui.generic-entity-table',
      'q-table'
    );
  });

  it('should expose uiProps for table', () => {
    expect(wrapper.vm.uiProps).toBeDefined();
    expect(wrapper.vm.uiProps).toEqual({ dense: true });
  });

  it('should pass columns, rows, and rowKey to q-table', () => {
    const table = wrapper.findComponent({ name: 'QTable' });

    expect(table.props('columns')).toStrictEqual(columns);
    expect(table.props('rows')).toStrictEqual(rows);
    expect(table.props('rowKey')).toBe('id');
  });
});
