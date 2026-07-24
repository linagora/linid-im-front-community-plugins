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

const mockAddMainNavigationMenuItems = vi.fn();
const mockT = vi.fn((key) => `translated_${key}`);

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const actual = await vi.importActual('@linagora/linid-im-front-corelib');

  return {
    ...actual,

    useLinidUiStore: () => ({
      addMainNavigationMenuItems: mockAddMainNavigationMenuItems,
    }),

    useLinidZoneStore: () => ({
      registerPluginOnce: vi.fn(),
    }),

    getI18nInstance: () => ({
      global: {
        t: mockT,
      },
    }),
  };
});

describe('Test module lifecycle: ModulePage', () => {
  let modulePage;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module =
      await import('../../../src/federation/module-page-lifecycle.ts');
    modulePage = module.default;
  });

  it('should have correct module metadata', () => {
    expect(modulePage.id).toBe('modulePage');
    expect(modulePage.name).toBe('Page module');
    expect(modulePage.version).toBe('0.0.1');
    expect(modulePage.description).toBe('Module to manage page entity.');
  });

  describe('Test function: postInit', () => {
    it('should not add navigation item', async () => {
      const config = {
        instanceId: 'page-instance-2',
        basePath: '/custom-page-path',
      };

      const result = await modulePage.postInit(config);

      expect(mockAddMainNavigationMenuItems).toHaveBeenCalledTimes(0);
      expect(result).toEqual({ success: true });
    });

    it('should add navigation item with custom basePath when provided', async () => {
      const config = {
        instanceId: 'page-instance-2',
        basePath: '/custom-page-path',
        options: {
          addNavigationMenu: true,
        },
      };

      const result = await modulePage.postInit(config);

      expect(mockAddMainNavigationMenuItems).toHaveBeenCalledTimes(1);
      expect(mockAddMainNavigationMenuItems).toHaveBeenCalledWith({
        id: 'page-instance-2',
        label: 'translated_page-instance-2.NavigationMenu.label',
        path: '/custom-page-path',
      });
      expect(result).toEqual({ success: true });
    });
  });
});
