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
import type { CommonComponentProps } from './common';
import type { GenericTableColumn } from './ModuleGenericTablePageOptions';

/**
 * API endpoints used by the GenericEditableTableCard component.
 *
 * Each endpoint is a Nunjucks template rendered with a context containing `entity`, the entity owning
 * the collection. The `update` and `delete` endpoint contexts additionally contain `item`, the row
 * being edited or removed.
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
   * Endpoint used to update an item (PUT). The submitted form data is sent as the request body, and
   * the row being edited is available in the template context as `item`.
   *
   * Optional: the per-row edit button is only rendered when this endpoint is configured.
   */
  update?: string;

  /**
   * Endpoint used to delete an item (DELETE). The row being removed is available in the
   * template context as `item`.
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
   * Entity owning the managed collection, provided to the Nunjucks context when rendering the
   * endpoints. Typically injected by the zone hosting the component.
   */
  entity?: Record<string, unknown>;

  /**
   * Columns of the table. Labels are translated through the component i18n scope.
   * A `table_actions` column is automatically appended when not declared, to host
   * the per-row delete button.
   */
  columns: GenericTableColumn[];

  /**
   * Form fields rendered in the creation and edition form dialogs, defined as an array of
   * LinidAttributeConfiguration objects (see FormDialog).
   */
  formFields: LinidAttributeConfiguration[];

  /**
   * Form fields rendered in the edition form dialog instead of `formFields`, defined as an array
   * of LinidAttributeConfiguration objects (see FormDialog). Useful when the edition dialog manages
   * different properties than the creation dialog, such as relationship attributes of the row.
   */
  editFormFields?: LinidAttributeConfiguration[];

  /**
   * JSON payload fully replacing the update request body: only the properties declared here are
   * sent. When omitted, the submitted form data is sent as-is. Every nested string property is
   * rendered as a Nunjucks template with a context containing `entity`, `item` (the row being
   * edited) and `formData` (the submitted form data). A string property holding a single dotted
   * lookup resolving to a plain object is replaced by that object.
   */
  updateBody?: Record<string, unknown>;

  /**
   * API endpoints used to fetch, create, update and delete items.
   */
  endpoints: GenericEditableTableCardEndpoints;

  /**
   * Name of the row property used as unique row key in the table.
   * @default 'id'
   */
  rowKey?: string;
}

/**
 * Outputs (events) emitted by the GenericEditableTableCard component.
 */
export interface GenericEditableTableCardOutputs {
  /**
   * Emitted with the submitted form data after a successful creation.
   */
  created: [item: Record<string, unknown>];

  /**
   * Emitted with the updated item returned by the API after a successful update.
   */
  updated: [item: Record<string, unknown>];

  /**
   * Emitted with the removed row after a successful deletion.
   */
  deleted: [item: Record<string, unknown>];
}
