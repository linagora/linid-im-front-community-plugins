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

import type { LinidFilter } from '@linagora/linid-im-front-corelib';
import type { QTableColumn } from 'quasar';
import type { ModulePageOptions } from './ModulePageOptions';

/**
 * Configuration options for a generic table page.
 *
 * Defines how a table-based page is rendered, including its columns,
 * row identifier, and optional actions available from the page.
 */
export interface ModuleGenericTablePageOptions extends ModulePageOptions {
  /**
   * The key used to identify data. Used for detail route.
   */
  idKey: string;

  /**
   * The columns configuration for the table.
   * Each column should follow Quasar's QTableColumn definition.
   */
  columns: QTableColumn[];

  /**
   * Whether the actions card should be displayed on the page.
   *
   * When enabled, the page renders the actions section containing actions
   * such as entity creation.
   */
  enableActions: boolean;

  /**
   * Route path used by the creation action.
   *
   * When the creation button is clicked, the user is redirected to this path.
   * This should correspond to a valid route exposed by the module.
   */
  creationPagePath: string;

  /**
   * URL query parameter keys to preserve when filter state is synced to the URL.
   * Keys listed here are kept as-is. All other keys are replaced with the serialized filter values.
   *
   * Use this when the page shares the URL with other components that own
   * their own query parameters (e.g. A tree panel that writes a `node` key).
   */
  keepQueryParams?: string[];

  /**
   * Filter definitions exposed through the LinidSmartFilter component.
   *
   * When provided and non-empty, the smart filter is rendered above the
   * table, filter changes are reflected in the URL query params, and the
   * table data is reloaded with the active filters. When omitted or empty,
   * no smart filter is rendered.
   */
  filters?: LinidFilter[];
}
