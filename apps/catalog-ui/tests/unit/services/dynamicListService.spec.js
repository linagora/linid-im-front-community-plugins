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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDynamicListPage } from '../../../src/services/dynamicListService';

const mockGet = vi.fn();

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getHttpClient: () => ({
    get: mockGet,
  }),
}));

describe('Test service: dynamicListService', () => {
  const mockPage = {
    content: ['value1', 'value2', 'value3'],
    totalElements: 50,
    totalPages: 5,
    number: 0,
    size: 10,
    last: false,
    first: true,
    numberOfElements: 3,
    empty: false,
    sort: { sorted: false, unsorted: true, empty: true },
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockPage });
  });

  describe('Test function: getDynamicListPage', () => {
    it('should call GET with route and pagination params', async () => {
      await getDynamicListPage('/api/types', { page: 0, size: 10 });

      expect(mockGet).toHaveBeenCalledWith('/api/types', {
        params: { page: 0, size: 10 },
      });
    });

    it('should return the page data from response', async () => {
      const result = await getDynamicListPage('/api/types', {
        page: 0,
        size: 10,
      });

      expect(result).toEqual(mockPage);
    });

    it('should propagate errors', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      await expect(
        getDynamicListPage('/api/types', { page: 0, size: 10 })
      ).rejects.toThrow('Network error');
    });
  });
});
