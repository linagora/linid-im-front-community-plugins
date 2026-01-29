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

import type { LinidAttributeConfiguration } from '@linagora/linid-im-front-corelib';
import type { QTableColumn } from 'quasar';

/**
 * Options for the ModuleUsers remote module.
 */
export interface ModuleUsersOptions {
  /**
   * The key used to identify users. Used for user detail route and edit route.
   */
  userIdKey: string;
  /**
   * The columns configuration for the user table.
   * Each column should follow Quasar's QTableColumn definition.
   */
  userTableColumns: QTableColumn[];
  /**
   * Ordered list of user attribute names to display first in the details card.
   * The order of this array defines the display order.
   */
  fieldOrder: string[];
  /**
   * Indicates whether user attributes not listed in `fieldOrder`
   * should also be displayed after the ordered fields in the details card.
   * @default false
   */
  showRemainingFields?: boolean;
  /**
   * Configuration for the advanced search feature.
   * Enables the AdvancedSearchCard on the HomePage.
   */
  advancedSearch: AdvancedSearchConfiguration;
}

/**
 * Configuration for the advanced search feature in the Users module.
 */
export interface AdvancedSearchConfiguration {
  /**
   * List of field definitions available for filtering.
   * Each field follows the LinidAttributeConfiguration interface.
   */
  fields: LinidAttributeConfiguration[];
  /**
   * Names of fields to display in the default (always visible) section.
   */
  defaultFieldsNames: string[];
  /**
   * Names of fields to display in the advanced (expandable) section.
   */
  advancedFieldsNames: string[];
}
