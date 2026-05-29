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

const uiMock = vi.fn((namespace, component) => ({ namespace, component }));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: uiMock }),
  useScopedI18n: () => ({ t: vi.fn() }),
  useTree: () => ({ toQTreeNodes: vi.fn(() => []) }),
}));

const fileNode = (key = 'file-1', extraActions = []) => ({
  type: 'file',
  key,
  value: `File ${key}`,
  extraActions,
  nodes: [],
});

const folderNode = (key = 'folder-1', children = [], extraActions = []) => ({
  type: 'folder',
  key,
  value: `Folder ${key}`,
  extraActions,
  nodes: children,
});

const defaultProps = {
  uiNamespace: 'Homepage',
  i18nScope: 'myScope',
  nodes: [folderNode('folder-1', [fileNode('file-1')])],
  nodeTypes: [],
  selectedNode: '',
  searchEnabled: false,
  filterMethod: vi.fn(() => true),
};

function mountComponent(props = {}) {
  return shallowMount(GenericTree, { props: { ...defaultProps, ...props } });
}

describe('Test component: GenericTree', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mountComponent();
  });

  describe('test function: buildIndexes (resolvedActionsByNode)', () => {
    it('should be empty when nodeTypes and extraActions are all empty', () => {
      expect(wrapper.vm.resolvedActionsByNode).toEqual({});
    });

    it('should not include a node that has no actions', async () => {
      await wrapper.setProps({
        nodeTypes: [{ type: 'folder', actions: ['delete'] }],
      });

      expect('file-1' in wrapper.vm.resolvedActionsByNode).toBe(false);
    });

    it('should include a node when it has actions from nodeTypes', async () => {
      await wrapper.setProps({
        nodeTypes: [{ type: 'folder', actions: ['rename', 'delete'] }],
      });

      expect(wrapper.vm.resolvedActionsByNode['folder-1']).toEqual([
        'rename',
        'delete',
      ]);
    });

    it('should include a node when it has extraActions', async () => {
      await wrapper.setProps({
        nodes: [folderNode('folder-1', [], ['share'])],
      });

      expect(wrapper.vm.resolvedActionsByNode['folder-1']).toEqual(['share']);
    });

    it('should merge and deduplicate actions from nodeTypes and extraActions', async () => {
      await wrapper.setProps({
        nodes: [folderNode('folder-1', [], ['rename', 'share'])],
        nodeTypes: [{ type: 'folder', actions: ['rename', 'delete'] }],
      });

      expect(wrapper.vm.resolvedActionsByNode['folder-1']).toEqual([
        'rename',
        'delete',
        'share',
      ]);
    });

    it('should recursively collect actions for nested nodes', async () => {
      await wrapper.setProps({
        nodeTypes: [
          { type: 'folder', actions: ['delete'] },
          { type: 'file', actions: ['download'] },
        ],
      });

      expect(wrapper.vm.resolvedActionsByNode['folder-1']).toEqual(['delete']);
      expect(wrapper.vm.resolvedActionsByNode['file-1']).toEqual(['download']);
    });
  });

  describe('Test function: buildIndexes (resolvedActionsByType)', () => {
    it('should be empty when nodeTypes and extraActions are all empty', () => {
      expect(wrapper.vm.resolvedActionsByType).toEqual({});
    });

    it('should contain an entry for each type that has at least one action', async () => {
      await wrapper.setProps({
        nodeTypes: [
          { type: 'folder', actions: ['delete'] },
          { type: 'file', actions: ['download'] },
        ],
      });

      expect(Object.keys(wrapper.vm.resolvedActionsByType)).toEqual(
        expect.arrayContaining(['folder', 'file'])
      );
    });

    it('should not create a type entry for a type with no actions', async () => {
      await wrapper.setProps({
        nodeTypes: [{ type: 'folder', actions: ['delete'] }],
      });

      expect('file' in wrapper.vm.resolvedActionsByType).toBe(false);
    });

    it('should not duplicate a type when the same type appears in multiple nodes', async () => {
      await wrapper.setProps({
        nodes: [
          folderNode('folder-1', [fileNode('file-1'), fileNode('file-2')]),
        ],
        nodeTypes: [{ type: 'file', actions: ['download'] }],
      });

      const keys = Object.keys(wrapper.vm.resolvedActionsByType).filter(
        (k) => k === 'file'
      );
      expect(keys).toHaveLength(1);
    });

    it('should accumulate all actions seen across nodes of the same type', async () => {
      await wrapper.setProps({
        nodes: [
          folderNode(
            'folder-1',
            [folderNode('folder-2', [], ['archive'])],
            ['share']
          ),
        ],
        nodeTypes: [{ type: 'folder', actions: ['delete'] }],
      });

      expect(wrapper.vm.resolvedActionsByType['folder']).toEqual(
        expect.arrayContaining(['delete', 'share', 'archive'])
      );
    });

    it('should deduplicate actions accumulated across nodes of the same type', async () => {
      await wrapper.setProps({
        nodes: [
          fileNode('file-1', ['download']),
          fileNode('file-2', ['download']),
        ],
        nodeTypes: [{ type: 'file', actions: [] }],
      });

      expect(wrapper.vm.resolvedActionsByType['file']).toEqual(['download']);
    });
  });

  describe('Test function: buildIndexes (treeNodeRecord)', () => {
    it('should store the exact node object for each key', () => {
      const record = wrapper.vm.treeNodeRecord;

      expect(record['folder-1'].type).toBe('folder');
      expect(record['folder-1'].value).toBe('Folder folder-1');
      expect(record['file-1'].type).toBe('file');
      expect(record['file-1'].value).toBe('File file-1');
    });

    it('should index all nodes recursively including deeply nested ones', async () => {
      await wrapper.setProps({
        nodes: [
          folderNode('folder-1', [
            folderNode('folder-2', [fileNode('file-deep')]),
          ]),
        ],
      });

      const record = wrapper.vm.treeNodeRecord;

      expect(Object.keys(record)).toEqual(
        expect.arrayContaining(['folder-1', 'folder-2', 'file-deep'])
      );
    });

    it('should be empty when nodes is empty', async () => {
      await wrapper.setProps({ nodes: [] });

      expect(wrapper.vm.treeNodeRecord).toEqual({});
    });
  });
});
