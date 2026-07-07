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

import { shallowMount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const actual = await vi.importActual('@linagora/linid-im-front-corelib');
  return {
    ...actual,
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
    useScopedI18n: vi.fn(() => ({ t: (key) => key })),
    getHttpClient: vi.fn(() => ({
      get: vi.fn(),
    })),
  };
});

import TreeSearchFilterPanel from '../../../../src/components/smart-filter/TreeSearchFilterPanel.vue';
import { getHttpClient } from '@linagora/linid-im-front-corelib';

const ROOT_ID = '1';
const CHILD1_ID = '2';
const CHILD2_ID = '3';
const GRANDCHILD_ID = '4';

/**
 * Builder for creating node data with default values.
 * @param overrides Object - properties to override default values.
 * @returns Object - node data object.
 */
const buildNodeDTO = (overrides = {}) => ({
  id: ROOT_ID,
  name: 'Root',
  type: '',
  parents: [{ id: null }],
  ...overrides,
});

/**
 * Builder for creating paginated response.
 * @param content - The content of the page.
 * @param overrides - Properties to override default values.
 * @returns Paginated response object.
 */
const buildPage = (content, overrides = {}) => ({
  content,
  last: true,
  page: 0,
  size: 5,
  ...overrides,
});

describe('TreeSearchFilterPanel', () => {
  let wrapper;
  let mockHttpClient;

  const mockNodesData = [
    buildNodeDTO({ id: ROOT_ID, name: 'Root', parents: [{ id: null }] }),
    buildNodeDTO({
      id: CHILD1_ID,
      name: 'Child 1',
      parents: [{ id: ROOT_ID }],
    }),
    buildNodeDTO({
      id: CHILD2_ID,
      name: 'Child 2',
      parents: [{ id: ROOT_ID }],
    }),
    buildNodeDTO({
      id: GRANDCHILD_ID,
      name: 'Grandchild',
      parents: [{ id: CHILD1_ID }],
    }),
  ];

  const defaultProps = {
    uiNamespace: 'test',
    i18nScope: 'test',
    items: [],
    fieldName: 'testField',
    url: 'http://test.api/nodes',
    idKey: 'id',
    parentsKey: 'parents',
    parentIdKey: 'id',
    typeKey: 'type',
    nodesQuerySize: 5,
  };

  beforeEach(() => {
    // Create fresh mock for each test
    mockHttpClient = { get: vi.fn() };
    vi.mocked(getHttpClient).mockReturnValue(mockHttpClient);
    wrapper = shallowMount(TreeSearchFilterPanel, {
      props: { ...defaultProps },
    });
  });

  afterEach(() => {
    vi.mocked(getHttpClient).mockReset();
  });

  describe('Test function: onSearch', () => {
    it('should emit search event with correct field name and ticked nodes', async () => {
      wrapper.vm.tickedNodeKeys = ['node1', 'node2'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toHaveLength(2);
      expect(event.values.map((item) => item.value)).toEqual([
        'node1',
        'node2',
      ]);
    });

    it('should emit search event with LinidFilterValue structure', async () => {
      wrapper.vm.tickedNodeKeys = ['node1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values[0]).toEqual({
        operator: '',
        isNegation: false,
        value: 'node1',
      });
    });

    it('should emit search event with empty array when no nodes ticked', async () => {
      wrapper.vm.tickedNodeKeys = [];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('testField');
      expect(event.values).toEqual([]);
    });

    it('should use correct fieldName from props', async () => {
      await wrapper.setProps({ fieldName: 'customField' });
      wrapper.vm.tickedNodeKeys = ['node1'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.field).toBe('customField');
    });

    it('should emit search event with multiple ticked nodes', async () => {
      wrapper.vm.tickedNodeKeys = ['node1', 'node2', 'node3'];
      await wrapper.vm.onSearch();

      const event = wrapper.emitted('search')[0][0];
      expect(event.values).toHaveLength(3);
      expect(event.values.map((item) => item.value)).toEqual([
        'node1',
        'node2',
        'node3',
      ]);
    });
  });

  describe('Test function: getNodes', () => {
    it('should call valid endpoint with pagination parameters', async () => {
      const mockResponse = buildPage([
        buildNodeDTO({ id: ROOT_ID }),
        buildNodeDTO({ id: CHILD1_ID }),
      ]);
      mockHttpClient.get.mockResolvedValue({ data: mockResponse });

      const result = await wrapper.vm.getNodes({ page: 0, size: 5 });

      expect(mockHttpClient.get).toHaveBeenCalledWith('http://test.api/nodes', {
        params: { page: 0, size: 5 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should pass correct pagination page parameter to HTTP client', async () => {
      mockHttpClient.get.mockResolvedValue({ data: buildPage([]) });

      await wrapper.vm.getNodes({ page: 2, size: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ page: 2 }),
      });
    });

    it('should pass correct pagination size parameter to HTTP client', async () => {
      mockHttpClient.get.mockResolvedValue({ data: buildPage([]) });

      await wrapper.vm.getNodes({ page: 0, size: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ size: 10 }),
      });
    });

    it('should return the data from HTTP response', async () => {
      const testData = buildPage([buildNodeDTO()]);
      mockHttpClient.get.mockResolvedValue({ data: testData });

      const result = await wrapper.vm.getNodes({ page: 0, size: 5 });

      expect(result).toEqual(testData);
    });

    it('should propagate backend errors to the caller', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      await expect(wrapper.vm.getNodes({ page: 0, size: 5 })).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('Test function: getAllNodes', () => {
    it('should return all results when there is a single page', async () => {
      const page = buildPage(mockNodesData, { last: true });
      mockHttpClient.get.mockClear();
      mockHttpClient.get.mockResolvedValue({ data: page });

      const result = await wrapper.vm.getAllNodes();

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNodesData);
    });

    it('should iterate through multiple pages and aggregate all results', async () => {
      const page1 = buildPage([mockNodesData[0], mockNodesData[1]], {
        last: false,
        number: 0,
      });
      const page2 = buildPage([mockNodesData[2], mockNodesData[3]], {
        last: true,
        number: 1,
      });

      mockHttpClient.get.mockClear();
      mockHttpClient.get
        .mockResolvedValueOnce({ data: page1 })
        .mockResolvedValueOnce({ data: page2 });

      const result = await wrapper.vm.getAllNodes();

      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockNodesData);
    });

    it('should use nodesQuerySize prop for pagination size', async () => {
      mockHttpClient.get.mockClear();
      mockHttpClient.get.mockResolvedValue({
        data: buildPage([], { last: true }),
      });

      await wrapper.vm.getAllNodes();

      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ size: 5 }),
      });
    });

    it('should call pages with correct page numbers', async () => {
      const page1 = buildPage([buildNodeDTO()], { last: false });
      const page2 = buildPage([buildNodeDTO()], { last: true });

      mockHttpClient.get.mockClear();
      mockHttpClient.get
        .mockResolvedValueOnce({ data: page1 })
        .mockResolvedValueOnce({ data: page2 });

      await wrapper.vm.getAllNodes();

      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        {
          params: { page: 0, size: 5 },
        }
      );
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        {
          params: { page: 1, size: 5 },
        }
      );
    });

    it('should return an empty array when the page is empty', async () => {
      const page = buildPage([], { last: true });
      mockHttpClient.get.mockClear();
      mockHttpClient.get.mockResolvedValue({ data: page });

      const result = await wrapper.vm.getAllNodes();

      expect(result).toEqual([]);
    });

    it('should propagate backend errors to the caller', async () => {
      mockHttpClient.get.mockClear();
      mockHttpClient.get.mockRejectedValue(new Error('boom'));

      await expect(wrapper.vm.getAllNodes()).rejects.toThrow('boom');
    });
  });

  describe('Test function: toTreeNode', () => {
    it('should build tree structure from flat node array', () => {
      const result = wrapper.vm.toTreeNode(mockNodesData, ROOT_ID);

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe(CHILD1_ID);
      expect(result[1].key).toBe(CHILD2_ID);
    });

    it('should recursively build child nodes', () => {
      const result = wrapper.vm.toTreeNode(mockNodesData, ROOT_ID);

      expect(result[0].nodes).toHaveLength(1);
      expect(result[0].nodes[0].key).toBe(GRANDCHILD_ID);
    });

    it('should return empty array for leaf nodes', () => {
      const result = wrapper.vm.toTreeNode(mockNodesData, GRANDCHILD_ID);

      expect(result).toEqual([]);
    });

    it('should preserve node data in tree structure', () => {
      const result = wrapper.vm.toTreeNode(mockNodesData, ROOT_ID);

      expect(result[0].value).toEqual(mockNodesData[1]);
      expect(result[0].value.id).toBe(CHILD1_ID);
    });

    it('should set correct key using idKey prop', () => {
      const result = wrapper.vm.toTreeNode(mockNodesData, ROOT_ID);

      expect(result[0].key).toBe(CHILD1_ID);
      expect(result[1].key).toBe(CHILD2_ID);
    });

    it('should handle nodes with multiple children', () => {
      const multiChildNodes = [
        buildNodeDTO({ id: ROOT_ID, parents: [{ id: null }] }),
        buildNodeDTO({ id: CHILD1_ID, parents: [{ id: ROOT_ID }] }),
        buildNodeDTO({ id: CHILD2_ID, parents: [{ id: ROOT_ID }] }),
        buildNodeDTO({ id: GRANDCHILD_ID, parents: [{ id: ROOT_ID }] }),
      ];

      const result = wrapper.vm.toTreeNode(multiChildNodes, ROOT_ID);

      expect(result).toHaveLength(3);
    });

    it('should handle deeply nested tree structures', () => {
      const deepNodes = [
        buildNodeDTO({ id: '1', parents: [{ id: null }] }),
        buildNodeDTO({ id: '2', parents: [{ id: '1' }] }),
        buildNodeDTO({ id: '3', parents: [{ id: '2' }] }),
        buildNodeDTO({ id: '4', parents: [{ id: '3' }] }),
      ];

      const result = wrapper.vm.toTreeNode(deepNodes, '1');

      expect(result).toHaveLength(1);
      expect(result[0].nodes).toHaveLength(1);
      expect(result[0].nodes[0].nodes).toHaveLength(1);
      expect(result[0].nodes[0].nodes[0].nodes).toHaveLength(0);
    });
  });

  describe('Test function: loadData', () => {
    it('should fetch nodes and build tree structure', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: buildPage(mockNodesData, { last: true }),
      });

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toHaveLength(1);
      expect(wrapper.vm.items[0].key).toBe(ROOT_ID);
    });

    it('should identify root node correctly', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: buildPage(mockNodesData, { last: true }),
      });

      await wrapper.vm.loadData();

      const root = wrapper.vm.items[0];
      expect(root.value.id).toBe(ROOT_ID);
      expect(root.value.name).toBe('Root');
    });

    it('should build child tree nodes under root', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: buildPage(mockNodesData, { last: true }),
      });

      await wrapper.vm.loadData();

      const root = wrapper.vm.items[0];
      expect(root.nodes).toHaveLength(2);
      expect(root.nodes[0].key).toBe(CHILD1_ID);
      expect(root.nodes[1].key).toBe(CHILD2_ID);
    });

    it('should handle multiple pages of data', async () => {
      const page1 = buildPage(mockNodesData.slice(0, 2), { last: false });
      const page2 = buildPage(mockNodesData.slice(2), { last: true });

      mockHttpClient.get
        .mockResolvedValueOnce({ data: page1 })
        .mockResolvedValueOnce({ data: page2 });

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toHaveLength(1);
      expect(wrapper.vm.items[0].nodes).toHaveLength(2);
    });

    it('should not add items if root node not found', async () => {
      const noRootData = [
        buildNodeDTO({ id: CHILD1_ID, parents: [{ id: ROOT_ID }] }),
        buildNodeDTO({ id: CHILD2_ID, parents: [{ id: ROOT_ID }] }),
      ];

      mockHttpClient.get.mockResolvedValue({
        data: buildPage(noRootData, { last: true }),
      });

      await wrapper.vm.loadData();

      expect(wrapper.vm.items).toHaveLength(0);
    });

    it('should preserve full node data in tree values', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: buildPage(mockNodesData, { last: true }),
      });

      await wrapper.vm.loadData();

      const childNode = wrapper.vm.items[0].nodes[0];
      expect(childNode.value).toEqual(mockNodesData[1]);
    });

    it('should propagate backend errors to the caller', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('boom'));

      await expect(wrapper.vm.loadData()).rejects.toThrow('boom');
    });

    it('should call getNodes with correct URL', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: buildPage(mockNodesData, { last: true }),
      });

      await wrapper.vm.loadData();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'http://test.api/nodes',
        expect.any(Object)
      );
    });
  });
});
