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

import type { CommonComponentProps } from './common';

/**
 * Props definition for the EntityDetailsCard component.
 *
 * This interface describes the configuration used to render
 * a list of entity attributes in a structured and ordered manner.
 */
export interface EntityDetailsCardProps extends CommonComponentProps {
  /**
   * Entity object containing the attributes to display.
   * Keys represent attribute names, values represent attribute values.
   */
  entity: Record<string, unknown>;

  /**
   * Ordered list of attribute names to display first.
   * The order of this array defines the display order.
   */
  fieldOrder?: string[];

  /**
   * Indicates whether entity attributes not listed in `fieldOrder`
   * should also be displayed after the ordered fields.
   * @default false,
   */
  showRemainingFields?: boolean;

  /**
   * Indicates whether the component is in a loading state.
   * When true, attribute values may be replaced with placeholders.
   * @default false,
   */
  isLoading?: boolean;
}
