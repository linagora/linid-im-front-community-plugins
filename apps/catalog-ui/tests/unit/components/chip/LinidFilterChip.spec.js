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

const mockHttpGet = vi.fn();
const mockTe = vi.fn(() => true);

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const actual = await vi.importActual('@linagora/linid-im-front-corelib');
  return {
    ...actual,
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
    useScopedI18n: vi.fn(() => ({
      t: (key, named) => (named ? String(named.name) : key),
      te: mockTe,
      translateOrDefault: (defaultValue) => defaultValue,
    })),
    useNunjucks: () => ({
      renderString: (template, context) =>
        template
          .replace(
            "{{ values | join('|') | urlencode }}",
            encodeURIComponent((context.values ?? []).join('|'))
          )
          .replace("{{ values | join('|') }}", (context.values ?? []).join('|'))
          .replace('{{ value }}', String(context.value)),
    }),
    getHttpClient: vi.fn(() => ({ get: mockHttpGet })),
  };
});

import LinidFilterChip from '../../../../src/components/chip/LinidFilterChip.vue';

const DYNAMIC_LABEL_OPTIONS = {
  url: "/organizational-units?id={{ values | join('|') }}",
  responseItemsPath: 'content',
  valuePath: 'id',
};

/**
 * Builder for creating a filter value.
 * @param value - The raw filter value.
 * @param item - The already resolved item, if any.
 * @returns A filter value object.
 */
const buildValue = (value, item) => ({
  isNegation: false,
  operator: '',
  value,
  item,
});

/**
 * Builder for creating a filter.
 * @param overrides - Properties to override default values.
 * @returns A filter object.
 */
const buildFilter = (overrides = {}) => ({
  id: 'filter-id',
  name: 'organizationalUnitId',
  type: 'tree',
  options: {},
  values: [],
  ...overrides,
});

/**
 * Builder for creating an HTTP response.
 * @param items - The items returned in the `content` collection.
 * @param status - The HTTP status of the response.
 * @returns An HTTP response object.
 */
const buildResponse = (items, status = 200) => ({
  status,
  data: { content: items },
});

/**
 * Mounts the component and waits for the resolution triggered on mount.
 * @param filter - The filter to display.
 * @returns The mounted wrapper.
 */
async function mountChip(filter) {
  const wrapper = shallowMount(LinidFilterChip, {
    props: { filter, uiNamespace: 'test', i18nScope: 'test' },
  });
  await flushPromises();
  return wrapper;
}

describe('Test component: LinidFilterChip', () => {
  beforeEach(() => {
    mockHttpGet.mockReset();
    mockTe.mockReturnValue(true);
  });

  describe('Test function: toLabel', () => {
    it('should translate the item through the value key', async () => {
      const wrapper = await mountChip(
        buildFilter({ values: [buildValue('1', { id: 1, name: 'toto' })] })
      );

      expect(wrapper.vm.toLabel(wrapper.vm.values[0])).toBe('toto');
    });

    it('should fall back to the raw value when the item is missing', async () => {
      const wrapper = await mountChip(
        buildFilter({ values: [buildValue('1')] })
      );

      expect(wrapper.vm.toLabel(wrapper.vm.values[0])).toBe('1');
    });

    it('should fall back to the raw value when the value key does not exist', async () => {
      mockTe.mockReturnValue(false);
      const wrapper = await mountChip(
        buildFilter({ values: [buildValue('1', { id: 1, name: 'toto' })] })
      );

      expect(wrapper.vm.toLabel(wrapper.vm.values[0])).toBe('1');
    });
  });

  describe('Test function: resolveItems', () => {
    it('should not perform any request without dynamic label options', async () => {
      await mountChip(buildFilter({ values: [buildValue('1')] }));

      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should not perform any request when every value is already resolved', async () => {
      await mountChip(
        buildFilter({
          values: [buildValue('1', { id: 1 }), buildValue('2', { id: 2 })],
          dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
        })
      );

      expect(mockHttpGet).not.toHaveBeenCalled();
    });

    it('should request only the values without an item', async () => {
      mockHttpGet.mockResolvedValue(buildResponse([{ id: 2, name: 'tata' }]));

      await mountChip(
        buildFilter({
          values: [buildValue('1', { id: 1, name: 'toto' }), buildValue('2')],
          dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
        })
      );

      expect(mockHttpGet).toHaveBeenCalledTimes(1);
      expect(mockHttpGet).toHaveBeenCalledWith('/organizational-units?id=2', {
        params: { page: 0 },
      });
    });

    it('should escape the separator joining the values in the query string', async () => {
      mockHttpGet.mockResolvedValue(buildResponse([]));

      await mountChip(
        buildFilter({
          values: [buildValue('1'), buildValue('2')],
          dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
        })
      );

      const [url] = mockHttpGet.mock.calls[0];

      expect(url).not.toContain('|');
      expect(url).toBe('/organizational-units?id=1%7C2');
    });

    it('should not encode again a template escaping the separator itself', async () => {
      mockHttpGet.mockResolvedValue(buildResponse([]));

      await mountChip(
        buildFilter({
          values: [buildValue('1'), buildValue('2')],
          dynamicLabelOptions: {
            ...DYNAMIC_LABEL_OPTIONS,
            url: "/organizational-units?id={{ values | join('|') | urlencode }}",
          },
        })
      );

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/organizational-units?id=1%7C2',
        {
          params: { page: 0 },
        }
      );
    });

    it('should leave a url without query string untouched', async () => {
      mockHttpGet.mockResolvedValue({
        data: { id: 1, name: 'toto' },
        status: 200,
      });

      await mountChip(
        buildFilter({
          values: [buildValue('1')],
          dynamicLabelOptions: {
            multipleRequests: true,
            url: '/organizational-units/{{ value }}',
          },
        })
      );

      expect(mockHttpGet).toHaveBeenCalledWith('/organizational-units/1');
    });

    it('should assign each returned item to the value it matches', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
      });
      mockHttpGet.mockResolvedValue(
        buildResponse([
          { id: 2, name: 'tata' },
          { id: 1, name: 'toto' },
        ])
      );

      await mountChip(filter);

      expect(mockHttpGet).toHaveBeenCalledWith(
        '/organizational-units?id=1%7C2',
        {
          params: { page: 0 },
        }
      );
      expect(filter.values[0].item).toEqual({ id: 1, name: 'toto' });
      expect(filter.values[1].item).toEqual({ id: 2, name: 'tata' });
    });

    it('should leave a value without item when nothing matches it', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
      });
      mockHttpGet.mockResolvedValue(buildResponse([{ id: 1, name: 'toto' }]));

      await mountChip(filter);

      expect(filter.values[0].item).toEqual({ id: 1, name: 'toto' });
      expect(filter.values[1].item).toBeUndefined();
    });

    it('should use the whole response body when no items path is configured', async () => {
      const filter = buildFilter({
        values: [buildValue('1')],
        dynamicLabelOptions: {
          ...DYNAMIC_LABEL_OPTIONS,
          responseItemsPath: undefined,
        },
      });
      mockHttpGet.mockResolvedValue({
        status: 200,
        data: [{ id: 1, name: 'toto' }],
      });

      await mountChip(filter);

      expect(filter.values[0].item).toEqual({ id: 1, name: 'toto' });
    });

    it('should request the next page while the response is partial', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
      });
      mockHttpGet
        .mockResolvedValueOnce(buildResponse([{ id: 1, name: 'toto' }], 206))
        .mockResolvedValueOnce(buildResponse([{ id: 2, name: 'tata' }], 206));

      await mountChip(filter);

      expect(mockHttpGet).toHaveBeenCalledTimes(2);
      expect(mockHttpGet).toHaveBeenLastCalledWith(
        '/organizational-units?id=1%7C2',
        { params: { page: 1 } }
      );
      expect(filter.values[1].item).toEqual({ id: 2, name: 'tata' });
    });

    it('should stop following pages when a partial response returns no item', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
      });
      mockHttpGet
        .mockResolvedValueOnce(buildResponse([{ id: 1, name: 'toto' }], 206))
        .mockResolvedValueOnce(buildResponse([], 206));

      await mountChip(filter);

      expect(mockHttpGet).toHaveBeenCalledTimes(2);
      expect(filter.values[1].item).toBeUndefined();
    });

    it('should perform one request per unresolved value in multiple requests mode', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: {
          multipleRequests: true,
          url: '/organizational-units/{{ value }}',
        },
      });
      mockHttpGet.mockImplementation((url) =>
        Promise.resolve({
          status: 200,
          data: { id: Number(url.split('/').pop()) },
        })
      );

      await mountChip(filter);

      expect(mockHttpGet).toHaveBeenCalledTimes(2);
      expect(mockHttpGet).toHaveBeenCalledWith('/organizational-units/1');
      expect(mockHttpGet).toHaveBeenCalledWith('/organizational-units/2');
      expect(filter.values[0].item).toEqual({ id: 1 });
      expect(filter.values[1].item).toEqual({ id: 2 });
    });

    it('should keep the values resolved by the successful requests when one fails', async () => {
      const filter = buildFilter({
        values: [buildValue('1'), buildValue('2')],
        dynamicLabelOptions: {
          multipleRequests: true,
          url: '/organizational-units/{{ value }}',
        },
      });
      mockHttpGet
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ status: 200, data: { id: 2 } });

      const wrapper = await mountChip(filter);

      expect(filter.values[0].item).toBeUndefined();
      expect(filter.values[1].item).toEqual({ id: 2 });
      expect(wrapper.vm.loading).toBe(false);
    });

    it('should clear the loading state when the request fails', async () => {
      const filter = buildFilter({
        values: [buildValue('1')],
        dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
      });
      mockHttpGet.mockRejectedValue(new Error('Network error'));

      const wrapper = await mountChip(filter);

      expect(wrapper.vm.loading).toBe(false);
      expect(filter.values[0].item).toBeUndefined();
    });

    it('should be loading while the request is pending', async () => {
      let resolveRequest;
      mockHttpGet.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
      );

      const wrapper = shallowMount(LinidFilterChip, {
        props: {
          filter: buildFilter({
            values: [buildValue('1')],
            dynamicLabelOptions: DYNAMIC_LABEL_OPTIONS,
          }),
          uiNamespace: 'test',
          i18nScope: 'test',
        },
      });
      await flushPromises();

      expect(wrapper.vm.loading).toBe(true);

      resolveRequest(buildResponse([{ id: 1, name: 'toto' }]));
      await flushPromises();

      expect(wrapper.vm.loading).toBe(false);
    });
  });
});
