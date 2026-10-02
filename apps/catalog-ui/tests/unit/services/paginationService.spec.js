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
import { fetchAllPages } from '../../../src/services/paginationService';

const mockGet = vi.fn();

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    get: mockGet,
  }),
}));

/**
 * Builds a paginated response holding the given items.
 * @param content - The items of the page.
 * @param last - Whether the page is the last one.
 * @returns The paginated response.
 */
function buildPage(content, last = true) {
  return { data: { content, last } };
}

describe('Test service: paginationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test function: fetchAllPages', () => {
    it('should fetch a single page with the given size', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      mockGet.mockResolvedValue(buildPage(items));

      const result = await fetchAllPages('/api/items', 5);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith('/api/items', {
        params: { page: 0, size: 5 },
      });
      expect(result).toEqual(items);
    });

    it('should iterate through every page and aggregate their content', async () => {
      mockGet
        .mockResolvedValueOnce(buildPage([{ id: '1' }, { id: '2' }], false))
        .mockResolvedValueOnce(buildPage([{ id: '3' }], true));

      const result = await fetchAllPages('/api/items', 2);

      expect(mockGet).toHaveBeenNthCalledWith(1, '/api/items', {
        params: { page: 0, size: 2 },
      });
      expect(mockGet).toHaveBeenNthCalledWith(2, '/api/items', {
        params: { page: 1, size: 2 },
      });
      expect(result).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
    });

    it('should return an empty array when the page is empty', async () => {
      mockGet.mockResolvedValue(buildPage([]));

      const result = await fetchAllPages('/api/items', 5);

      expect(result).toEqual([]);
    });

    it('should stop the iteration on a response without a body', async () => {
      mockGet.mockResolvedValue({ data: null });

      const result = await fetchAllPages('/api/items', 5);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should accumulate the pages even when one has no content', async () => {
      mockGet
        .mockResolvedValueOnce({ data: { last: false } })
        .mockResolvedValueOnce(buildPage([{ id: '1' }], true));

      const result = await fetchAllPages('/api/items', 5);

      expect(result).toEqual([{ id: '1' }]);
    });

    it('should forward the abort signal to every request', async () => {
      const { signal } = new AbortController();
      mockGet.mockResolvedValue(buildPage([]));

      await fetchAllPages('/api/items', 5, signal);

      expect(mockGet).toHaveBeenCalledWith('/api/items', {
        params: { page: 0, size: 5 },
        signal,
      });
    });

    it('should propagate backend errors to the caller', async () => {
      mockGet.mockRejectedValue(new Error('boom'));

      await expect(fetchAllPages('/api/items', 5)).rejects.toThrow('boom');
    });
  });
});
