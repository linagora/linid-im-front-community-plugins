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
import type { CommonComponentProps } from './common';

/**
 * API endpoints used by the GenericEditableTableCard component.
 *
 * Each endpoint is a Nunjucks template rendered with a context containing `parentEntity`.
 * The `delete` endpoint context additionally contains `entity`, the row being removed.
 */
export interface GenericEditableTableCardEndpoints {
  /**
   * Endpoint used to fetch the items (GET).
   */
  find: string;

  /**
   * Endpoint used to create a new item (POST). The submitted form data is sent as the request body.
   */
  create: string;

  /**
   * Endpoint used to delete an item (DELETE). The row being removed is available in the
   * template context as `entity`.
   */
  delete: string;
}

/**
 * Props definition for the GenericEditableTableCard component.
 *
 * This interface describes the configuration used to manage a simple collection
 * inside a card: a table listing the items, an add button opening a form dialog,
 * and a per-row delete action guarded by a confirmation dialog.
 */
export interface GenericEditableTableCardProps extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data (e.g. API validation rules)
   * by the creation form dialog fields.
   */
  instanceId?: string;

  /**
   * Parent entity provided to the Nunjucks context when rendering the endpoints.
   * Typically injected by the zone hosting the component.
   */
  parentEntity?: Record<string, unknown>;

  /**
   * Columns of the table. Labels are translated through the component i18n scope.
   * A `table_actions` column is automatically appended when not declared, to host
   * the per-row delete button.
   */
  columns: QTableColumn[];

  /**
   * Form fields rendered in the creation form dialog, defined as an array of
   * LinidAttributeConfiguration objects (see FormDialog).
   */
  formFields: LinidAttributeConfiguration[];

  /**
   * API endpoints used to fetch, create and delete items.
   */
  endpoints: GenericEditableTableCardEndpoints;

  /**
   * Name of the row property used as unique row key in the table.
   * @default 'id'
   */
  rowKey?: string;
}
