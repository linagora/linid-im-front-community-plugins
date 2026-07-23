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

import type { ModulePageOptions } from './ModulePageOptions';

/**
 * Configuration of a single details section displayed on the generic details page.
 *
 * Each section is rendered as its own details card, allowing the entity attributes to be grouped
 * by category.
 */
export interface DetailSection {
  /**
   * Unique key of the section.
   *
   * Used to resolve the section translations (title and attribute labels) and its UI design
   * namespace.
   */
  key: string;

  /**
   * Ordered list of entity attribute keys displayed in the section.
   */
  fieldOrder: string[];

  /**
   * Whether the section also displays the entity attributes not listed in any `fieldOrder`.
   *
   * Defaults to `false`.
   */
  showRemainingFields?: boolean;
}

/**
 * Configuration options for a generic entity details page.
 *
 * Defines how the details of a single entity are rendered, including the sections grouping its
 * attributes and the optional actions available from the page.
 */
export interface ModuleGenericDetailsPageOptions extends ModulePageOptions {
  /**
   * Sections grouping the displayed entity attributes by category.
   *
   * Sections are rendered in the declared order.
   */
  sections: DetailSection[];

  /**
   * Nunjucks template of the edit page path, rendered with the loaded entity as context, for example
   * `/applications/{{ entity.id }}/edit`.
   *
   * When set, the page renders an edit button redirecting to the rendered path.
   */
  editPath?: string;

  /**
   * UI event keys triggering a reload of the entity data.
   *
   * When an event with one of these keys is emitted on the UI event bus, the page reloads the
   * entity from the backend.
   */
  reloadDetailsOn?: string[];
}
