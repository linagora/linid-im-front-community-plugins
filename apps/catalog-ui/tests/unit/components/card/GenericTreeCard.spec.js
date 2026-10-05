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

import { flushPromises, shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GenericTreeCard from '../../../../src/components/card/GenericTreeCard.vue';

const mockNotify = vi.fn();
const mockHttpGet = vi.fn();
const mockT = vi.fn((key) => key);
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);
const mockRouterPush = vi.fn();
const mockSubscription = { unsubscribe: vi.fn() };
const mockSubscribe = vi.fn(() => mockSubscription);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  LinidZoneRenderer: { template: '<div />' },
  getHttpClient: () => ({
    get: mockHttpGet,
  }),
  useScopedI18n: () => ({
    t: mockT,
    te: vi.fn(() => false),
    translateOrDefault: mockTranslateOrDefault,
  }),
  useNotify: () => ({
    Notify: mockNotify,
  }),
  useUiDesign: () => ({ ui: () => ({}) }),
  useNunjucks: () => {
    function render(value, context) {
      if (typeof value === 'string') {
        return value
          .replace('{{ entity.id }}', context.entity?.id ?? '')
          .replace('{{ item.id }}', context.item?.id ?? '');
      }
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [
            key,
            render(nested, context),
          ])
        );
      }
      return value;
    }
    return { render, renderString: render };
  },
  uiEventSubject: {
    next: vi.fn(),
    subscribe: (callback) => mockSubscribe(callback),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

/**
 * Builds a paginated response holding the given flat nodes.
 * @param content - The flat nodes of the page.
 * @param last - Whether the page is the last one.
 * @returns The paginated response.
 */
function buildPage(content, last = true) {
  return Promise.resolve({ data: { content, last } });
}

const flatNodes = [
  { id: 's1', parentId: null, type: 'STRUCTURE', label: 'Structure 1' },
  { id: 'h1', parentId: 's1', type: 'HIERARCHY', label: 'Hierarchy 1' },
  { id: 'h2', parentId: 'h1', type: 'HIERARCHY', label: 'Hierarchy 2' },
  { id: 's2', parentId: null, type: 'STRUCTURE', label: 'Structure 2' },
];

describe('Test component: GenericTreeCard', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
    instanceId: 'test-instance',
    url: '/api/structure-tree',
    nodeTypes: [
      { type: 'STRUCTURE' },
      { type: 'HIERARCHY', actions: ['edit'] },
    ],
    navigationRoutes: {
      STRUCTURE: '/structures/{{ item.id }}',
      HIERARCHY: '/hierarchies/{{ item.id }}',
    },
  };

  /**
   * Mounts the component with the default props merged with the given overrides.
   * @param props - Props overriding the default ones.
   * @returns The mounted wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(GenericTreeCard, {
      props: { ...defaultProps, ...props },
    });
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockHttpGet.mockImplementation(() => buildPage(flatNodes));
    wrapper = mountComponent();
    await flushPromises();
  });

  describe('Test computed: localI18nScope', () => {
    it('should append .GenericTreeCard to the provided i18nScope', () => {
      expect(wrapper.vm.localI18nScope).toBe('test-scope.GenericTreeCard');
    });
  });

  describe('Test computed: localUiNamespace', () => {
    it('should append .generic-tree-card to the provided uiNamespace', () => {
      expect(wrapper.vm.localUiNamespace).toBe(
        'test-namespace.generic-tree-card'
      );
    });
  });

  describe('Test function: loadData', () => {
    it('should fetch the first page with the configured page size', () => {
      expect(mockHttpGet).toHaveBeenCalledWith('/api/structure-tree', {
        params: { page: 0, size: 50 },
        signal: expect.any(AbortSignal),
      });
    });

    it('should fetch every page until the last one', async () => {
      mockHttpGet
        .mockImplementationOnce(() => buildPage([flatNodes[0]], false))
        .mockImplementationOnce(() => buildPage([flatNodes[1]], true));

      await wrapper.vm.loadData();

      expect(mockHttpGet).toHaveBeenCalledWith('/api/structure-tree', {
        params: { page: 0, size: 50 },
        signal: expect.any(AbortSignal),
      });
      expect(mockHttpGet).toHaveBeenCalledWith('/api/structure-tree', {
        params: { page: 1, size: 50 },
        signal: expect.any(AbortSignal),
      });
      expect(wrapper.vm.nodes).toHaveLength(1);
      expect(wrapper.vm.nodes[0].nodes).toHaveLength(1);
    });

    it('should build the tree from the flat nodes, keeping every root', () => {
      expect(wrapper.vm.nodes).toHaveLength(2);
      expect(wrapper.vm.nodes[0].key).toBe('s1');
      expect(wrapper.vm.nodes[1].key).toBe('s2');
    });

    it('should nest the children under their parent node', () => {
      const [structure] = wrapper.vm.nodes;

      expect(structure.nodes).toHaveLength(1);
      expect(structure.nodes[0].key).toBe('h1');
      expect(structure.nodes[0].type).toBe('HIERARCHY');
      expect(structure.nodes[0].nodes[0].key).toBe('h2');
    });

    it('should rebuild the tree from scratch on reload', async () => {
      await wrapper.vm.loadData();

      expect(wrapper.vm.nodes).toHaveLength(2);
      expect(wrapper.vm.nodes[0].nodes).toHaveLength(1);
    });

    it('should clear the nodes and notify the user on failure', async () => {
      mockHttpGet.mockImplementation(() => Promise.reject(new Error('fail')));

      await wrapper.vm.loadData();

      expect(wrapper.vm.nodes).toEqual([]);
      expect(mockNotify).toHaveBeenCalledWith({
        type: 'negative',
        message: 'loadError',
      });
    });

    it('should not fetch the nodes while the entity is not resolved', async () => {
      mockHttpGet.mockClear();

      mountComponent({ entity: {} });
      await flushPromises();

      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should load the tree once the entity is resolved', async () => {
      mockHttpGet.mockClear();
      wrapper = mountComponent({ entity: {} });
      await flushPromises();
      expect(mockHttpGet).not.toHaveBeenCalled();

      await wrapper.setProps({ entity: { id: 'e1' } });
      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
    });

    it('should clear the node index on failure', async () => {
      expect(wrapper.vm.nodesByKey.size).toBeGreaterThan(0);
      mockHttpGet.mockImplementation(() => Promise.reject(new Error('fail')));

      await wrapper.vm.loadData();

      expect(wrapper.vm.nodesByKey.size).toBe(0);
    });

    it('should abort the previous load when a new one starts', () => {
      const signals = [];
      mockHttpGet.mockImplementation((url, { signal }) => {
        signals.push(signal);
        return new Promise(() => undefined);
      });

      wrapper.vm.loadData();
      wrapper.vm.loadData();

      expect(signals[0].aborted).toBe(true);
      expect(signals[1].aborted).toBe(false);
    });

    it('should ignore an aborted load without notifying the user or ending the loading state', async () => {
      mockHttpGet
        .mockImplementationOnce(
          (url, { signal }) =>
            new Promise((_, reject) => {
              signal.addEventListener('abort', () =>
                reject(new Error('canceled'))
              );
            })
        )
        .mockImplementationOnce(() => new Promise(() => undefined));

      const first = wrapper.vm.loadData();
      wrapper.vm.loadData();
      await first;

      expect(mockNotify).not.toHaveBeenCalled();
      expect(wrapper.vm.nodes).toHaveLength(2);
      expect(wrapper.vm.isLoading).toBe(true);
    });
  });

  describe('Test function: onNodeSelected', () => {
    it('should navigate to the route configured for the node type', () => {
      wrapper.vm.onNodeSelected('h1');

      expect(mockRouterPush).toHaveBeenCalledWith('/hierarchies/h1');
    });

    it('should not navigate when no route is configured for the node type', async () => {
      wrapper = mountComponent({
        navigationRoutes: { STRUCTURE: '/structures/{{ item.id }}' },
      });
      await flushPromises();

      wrapper.vm.onNodeSelected('h1');

      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('should not navigate when the selected node is unknown', () => {
      wrapper.vm.onNodeSelected('unknown');

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe('Test hook: onMounted', () => {
    it('should reload the tree when a configured event is emitted', async () => {
      wrapper = mountComponent({ reloadOn: ['structure-updated'] });
      await flushPromises();
      mockHttpGet.mockClear();

      const callback = mockSubscribe.mock.calls.at(-1)[0];
      callback({ key: 'structure-updated' });
      await flushPromises();

      expect(mockHttpGet).toHaveBeenCalled();
    });

    it('should ignore events that are not configured', async () => {
      wrapper = mountComponent({ reloadOn: ['structure-updated'] });
      await flushPromises();
      mockHttpGet.mockClear();

      const callback = mockSubscribe.mock.calls.at(-1)[0];
      callback({ key: 'other-event' });
      await flushPromises();

      expect(mockHttpGet).not.toHaveBeenCalled();
    });
  });

  describe('Test hook: onUnmounted', () => {
    it('should unsubscribe from the UI event bus on unmount', () => {
      wrapper.unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should abort the pending load on unmount', () => {
      const signals = [];
      mockHttpGet.mockImplementation((url, { signal }) => {
        signals.push(signal);
        return new Promise(() => undefined);
      });
      wrapper.vm.loadData();

      wrapper.unmount();

      expect(signals.at(-1).aborted).toBe(true);
    });
  });

  describe('Test function: toTreeNodes', () => {
    it('should turn an orphan node into a root', () => {
      const roots = wrapper.vm.toTreeNodes([
        { id: 'h1', parentId: 'missing', type: 'HIERARCHY' },
      ]);

      expect(roots).toHaveLength(1);
      expect(roots[0].key).toBe('h1');
    });

    it('should turn a node being its own parent into a root', () => {
      const roots = wrapper.vm.toTreeNodes([
        { id: 'h1', parentId: 'h1', type: 'HIERARCHY' },
      ]);

      expect(roots).toHaveLength(1);
      expect(roots[0].nodes).toEqual([]);
    });

    it('should default the type of a node without one to an empty string', () => {
      const roots = wrapper.vm.toTreeNodes([{ id: 'h1', parentId: null }]);

      expect(roots[0].type).toBe('');
    });

    it('should read the configured identifier, parent and type properties', async () => {
      wrapper = mountComponent({
        idKey: 'uuid',
        parentIdKey: 'father',
        typeKey: 'kind',
      });
      await flushPromises();

      const roots = wrapper.vm.toTreeNodes([
        { uuid: 'a', father: null, kind: 'STRUCTURE' },
        { uuid: 'b', father: 'a', kind: 'HIERARCHY' },
      ]);

      expect(roots).toHaveLength(1);
      expect(roots[0].type).toBe('STRUCTURE');
      expect(roots[0].nodes[0].key).toBe('b');
      expect(roots[0].nodes[0].type).toBe('HIERARCHY');
    });
  });
});
