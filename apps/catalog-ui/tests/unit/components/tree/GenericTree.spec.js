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
  extraActions: [],
  nodes: [
    {
      type: 'file',
      key: 'file-1',
      value: 'File 1',
      extraActions: [],
      nodes: [],
    },
  ],
};

const folderWithTwoFiles = {
  type: 'folder',
  key: 'folder-1',
  value: 'Folder 1',
  extraActions: [],
  nodes: [
    {
      type: 'file',
      key: 'file-1',
      value: 'File 1',
      extraActions: [],
      nodes: [],
    },
    {
      type: 'file',
      key: 'file-2',
      value: 'File 2',
      extraActions: [],
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
        nodeTypes: [],
        selectedNode: folderNode,
      },
    });
  });

  describe('Test function: flattenTreeNode (via computed treeNodeRecord)', () => {
    it('should return an empty object when nodes is empty', async () => {
      await wrapper.setProps({ nodes: [] });

      expect(wrapper.vm.treeNodeRecord).toEqual({});
    });

    it('should index a single root-level node by its key', async () => {
      const singleNode = {
        type: 'folder',
        key: 'folder-1',
        value: 'Folder 1',
        extraActions: [],
        nodes: [],
      };
      await wrapper.setProps({ nodes: [singleNode] });

      expect(wrapper.vm.treeNodeRecord['folder-1']).toEqual(singleNode);
    });

    it('should index multiple root-level nodes by their keys', async () => {
      const nodeA = {
        type: 'folder',
        key: 'folder-a',
        value: 'A',
        extraActions: [],
        nodes: [],
      };
      const nodeB = {
        type: 'folder',
        key: 'folder-b',
        value: 'B',
        extraActions: [],
        nodes: [],
      };
      await wrapper.setProps({ nodes: [nodeA, nodeB] });

      expect(wrapper.vm.treeNodeRecord['folder-a']).toEqual(nodeA);
      expect(wrapper.vm.treeNodeRecord['folder-b']).toEqual(nodeB);
    });

    it('should recursively index nested nodes by their keys', () => {
      // folderNode contains file-1 as a child
      expect(wrapper.vm.treeNodeRecord['folder-1']).toBeDefined();
      expect(wrapper.vm.treeNodeRecord['file-1']).toBeDefined();
      expect(wrapper.vm.treeNodeRecord['file-1'].key).toBe('file-1');
    });

    it('should index nodes at multiple levels of nesting', async () => {
      await wrapper.setProps({
        nodes: [
          {
            type: 'folder',
            key: 'level-1',
            value: 'Level 1',
            extraActions: [],
            nodes: [
              {
                type: 'folder',
                key: 'level-2',
                value: 'Level 2',
                extraActions: [],
                nodes: [
                  {
                    type: 'file',
                    key: 'level-3',
                    value: 'Level 3',
                    extraActions: [],
                    nodes: [],
                  },
                ],
              },
            ],
          },
        ],
      });

      expect(wrapper.vm.treeNodeRecord['level-1']).toBeDefined();
      expect(wrapper.vm.treeNodeRecord['level-2']).toBeDefined();
      expect(wrapper.vm.treeNodeRecord['level-3']).toBeDefined();
    });

    it('should update when nodes prop changes', async () => {
      expect(wrapper.vm.treeNodeRecord['folder-1']).toBeDefined();

      await wrapper.setProps({
        nodes: [
          {
            type: 'group',
            key: 'group-1',
            value: 'Group 1',
            extraActions: [],
            nodes: [],
          },
        ],
      });

      expect(wrapper.vm.treeNodeRecord['folder-1']).toBeUndefined();
      expect(wrapper.vm.treeNodeRecord['group-1']).toBeDefined();
    });
  });

  describe('Test computed: resolvedActionsIndex (and function buildResolvedActionsIndex)', () => {
    describe('nodes index', () => {
      it('should return empty arrays for all nodes when nodeTypes and extraActions are empty', () => {
        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes).toEqual({
          'folder-1': [],
          'file-1': [],
        });
      });

      it('should include actions from nodeTypes for matching nodes', async () => {
        await wrapper.setProps({
          nodeTypes: [{ type: 'folder', actions: ['rename', 'delete'] }],
        });

        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes['folder-1']).toEqual(['rename', 'delete']);
        expect(nodes['file-1']).toEqual([]);
      });

      it('should include extraActions from nodes', async () => {
        await wrapper.setProps({
          nodes: [{ ...folderNode, extraActions: ['share'] }],
        });

        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes['folder-1']).toEqual(['share']);
        expect(nodes['file-1']).toEqual([]);
      });

      it('should merge and deduplicate actions from nodeTypes and extraActions', async () => {
        await wrapper.setProps({
          nodes: [{ ...folderNode, extraActions: ['rename', 'share'] }],
          nodeTypes: [{ type: 'folder', actions: ['rename', 'delete'] }],
        });

        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes['folder-1']).toEqual(['rename', 'delete', 'share']);
      });

      it('should recursively collect actions for nested nodes', async () => {
        await wrapper.setProps({
          nodeTypes: [
            { type: 'folder', actions: ['delete'] },
            { type: 'file', actions: ['download'] },
          ],
        });

        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes['folder-1']).toEqual(['delete']);
        expect(nodes['file-1']).toEqual(['download']);
      });

      it('should return empty objects when nodes is empty', async () => {
        await wrapper.setProps({ nodes: [] });

        const { nodes } = wrapper.vm.resolvedActionsIndex;

        expect(nodes).toEqual({});
      });
    });

    describe('types index', () => {
      it('should return an empty types object when nodes is empty', async () => {
        await wrapper.setProps({ nodes: [] });

        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(types).toEqual({});
      });

      it('should contain an entry for each unique type found in nodes', () => {
        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(Object.keys(types)).toEqual(
          expect.arrayContaining(['folder', 'file'])
        );
      });

      it('should not duplicate types when the same type appears in multiple nodes', async () => {
        await wrapper.setProps({ nodes: [folderWithTwoFiles] });

        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(Object.keys(types)).toEqual(
          expect.arrayContaining(['folder', 'file'])
        );
        expect(Object.keys(types).filter((t) => t === 'file')).toHaveLength(1);
      });

      it('should accumulate all actions seen for a type across all its nodes', async () => {
        await wrapper.setProps({
          nodes: [
            {
              type: 'folder',
              key: 'folder-1',
              value: 'Folder 1',
              extraActions: ['share'],
              nodes: [
                {
                  type: 'folder',
                  key: 'folder-2',
                  value: 'Folder 2',
                  extraActions: ['archive'],
                  nodes: [],
                },
              ],
            },
          ],
          nodeTypes: [{ type: 'folder', actions: ['delete'] }],
        });

        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(types['folder']).toEqual(
          expect.arrayContaining(['delete', 'share', 'archive'])
        );
      });

      it('should deduplicate actions accumulated across nodes of the same type', async () => {
        await wrapper.setProps({
          nodes: [
            {
              type: 'file',
              key: 'file-1',
              value: 'File 1',
              extraActions: ['download'],
              nodes: [],
            },
            {
              type: 'file',
              key: 'file-2',
              value: 'File 2',
              extraActions: ['download'],
              nodes: [],
            },
          ],
          nodeTypes: [{ type: 'file', actions: [] }],
        });

        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(types['file']).toEqual(['download']);
      });

      it('should update the types index when nodes prop changes', async () => {
        await wrapper.setProps({
          nodes: [
            {
              type: 'group',
              key: 'group-1',
              value: 'Group 1',
              extraActions: [],
              nodes: [],
            },
          ],
          nodeTypes: [{ type: 'group', actions: ['edit'] }],
        });

        const { types } = wrapper.vm.resolvedActionsIndex;

        expect(Object.keys(types)).toEqual(['group']);
        expect(types['group']).toEqual(['edit']);
      });
    });
  });
});
