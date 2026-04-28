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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import GenericTree from '../../../../src/components/tree/GenericTree.vue';

const uiMock = vi.fn((namespace) => ({ namespace }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: uiMock }),
  useScopedI18n: () => ({ t: vi.fn() }),
  useTree: () => ({ toQTreeNodes: vi.fn(() => []) }),
}));

const folderNode = {
  type: 'folder',
  key: 'folder-1',
  value: 'Folder 1',
  nodes: [
    {
      type: 'file',
      key: 'file-1',
      value: 'File 1',
      nodes: [],
    },
  ],
};

const folderWithTwoFiles = {
  type: 'folder',
  key: 'folder-1',
  value: 'Folder 1',
  nodes: [
    {
      type: 'file',
      key: 'file-1',
      value: 'File 1',
      nodes: [],
    },
    {
      type: 'file',
      key: 'file-2',
      value: 'File 2',
      nodes: [],
    },
  ],
};

describe('Test component: GenericTree', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(GenericTree, {
      props: {
        uiNamespace: 'Homepage',
        i18nScope: 'myScope',
        nodes: [folderNode],
      },
    });
  });

  describe('Test computed: uiPropsTypes', () => {
    it('should contain an entry for each unique type found in nodes', async () => {
      const result = wrapper.vm.uiPropsTypes;

      expect(Object.keys(result)).toEqual(['folder', 'file']);
    });

    it('should not duplicate types when the same type appears in multiple nodes', async () => {
      await wrapper.setProps({ nodes: [folderWithTwoFiles] });

      const result = wrapper.vm.uiPropsTypes;

      expect(Object.keys(result)).toEqual(['folder', 'file']);
    });

    it('should return an empty object when nodes is empty', async () => {
      await wrapper.setProps({ nodes: [] });

      expect(wrapper.vm.uiPropsTypes).toEqual({});
    });

    it('should update when nodes prop changes', async () => {
      await wrapper.setProps({
        nodes: [
          {
            type: 'group',
            key: 'group-1',
            value: 'Group 1',
            nodes: [],
          },
        ],
      });

      const result = wrapper.vm.uiPropsTypes;

      expect(Object.keys(result)).toEqual(['group']);
      expect(uiMock).toHaveBeenCalledWith(
        'Homepage.GenericTree.types.group',
        'q-icon'
      );
    });
  });
});
