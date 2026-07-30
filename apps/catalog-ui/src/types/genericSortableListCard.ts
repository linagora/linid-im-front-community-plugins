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

import type {
  LinidAttributeConfiguration,
  LinidDraggableProps,
  LinidQBtnProps,
  LinidQCardProps,
  LinidQIconProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQScrollAreaProps,
} from '@linagora/linid-im-front-corelib';
import type { CommonComponentProps } from './common';

/**
 * Props definition for the GenericSortableListCard component.
 */
export interface GenericSortableListCardProps extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data (e.g. API validation rules)
   * by the creation form dialog fields.
   */
  instanceId?: string;

  /**
   * Entity provided to the Nunjucks context when rendering the endpoints.
   * Typically injected by the zone hosting the component.
   */
  entity?: Record<string, unknown>;

  /**
   * Form fields rendered in the creation form dialog, defined as an array of
   * LinidAttributeConfiguration objects (see FormDialog).
   */
  formFields: LinidAttributeConfiguration[];

  /**
   * API endpoints used to fetch, create, delete and update items.
   */
  endpoints: GenericSortableListCardEndpoints;

  /**
   * Name of the item property used as unique item key in the list.
   * @default 'id'
   */
  itemKey?: string;

  /**
   * Name of the item property used to store the sort order index when saving the item order.
   */
  orderKey: string;

  /**
   * Name of the item property displayed as the label in the list when no slot content is provided.
   */
  labelKey: string;

  /**
   * Number of items fetched per page when paginating through the find endpoint.
   * @default 50
   */
  itemsQuerySize?: number;

  /**
   * Optional function applied to each item after fetching, used to transform or normalize
   * item data before it is stored and rendered.
   * @default (item) => item
   */
  itemMapperFn?: (item: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * API endpoints used by the GenericSortableListCard component.
 *
 * Each endpoint is a Nunjucks template rendered with a context containing `entity`.
 * The `delete` and `update` endpoints context additionally contains `item`, the item being removed/updated.
 */
export interface GenericSortableListCardEndpoints {
  /**
   * Endpoint used to fetch the items (GET).
   */
  find: string;

  /**
   * Endpoint used to create a new item (POST). The submitted form data is sent as the request body.
   */
  create: string;

  /**
   * Endpoint used to delete an item (DELETE). The item being removed is available in the
   * template context as `item`.
   */
  delete: string;

  /**
   * Endpoint used to update an item (PUT). Used both for individual item edits and for saving
   * the sort order. The item being updated is available in the template context as `item`.
   * The submitted form data or the reordered item (with its new order index) is sent as the request body.
   */
  update: string;
}

/**
 * Defines the events emitted by the GenericSortableListCard component.
 */
export type GenericSortableListCardOutputs<T = Record<string, unknown>> = {
  /**
   * Emitted with the submitted form data after a successful creation.
   */
  created: [item: T];

  /**
   * Emitted with the removed item after a successful deletion.
   */
  deleted: [item: T];

  /**
   * Emitted with the full reordered item list after the sort order has been successfully saved.
   */
  'order-updated': [items: T[]];

  /**
   * Emitted with the submitted form data after a successful item update.
   */
  updated: [item: T];
};

/**
 * UI props for GenericSortableListCard component.
 */
export interface GenericSortableListCardUIProps {
  /**
   * The UI properties for the card container.
   */
  card: LinidQCardProps;
  /**
   * The UI properties for the scroll area wrapping the sortable list.
   */
  scrollArea: LinidQScrollAreaProps;
  /**
   * The UI properties for the sortable list.
   */
  list: LinidQListProps;
  /**
   * The UI properties for each list item.
   */
  item: LinidQItemProps;
  /**
   * The UI properties passed to the vuedraggable container (animation, handle, scroll, etc.).
   */
  draggable: LinidDraggableProps;
  /**
   * The UI properties for the icon item section (avatar).
   */
  iconSection: LinidQItemSectionProps;
  /**
   * The UI properties for the icon in icon item section (avatar).
   */
  icon: LinidQIconProps;
  /**
   * The UI properties for the no-data icon item section (avatar).
   */
  noDataIconSection: LinidQItemSectionProps;
  /**
   * The UI properties for the no-data label item section.
   */
  noDataLabelSection: LinidQItemSectionProps;
  /**
   * The UI properties for the no-data icon in icon item section (avatar).
   */
  noDataIcon: LinidQIconProps;
  /**
   * The UI properties for the label item section.
   */
  labelSection: LinidQItemSectionProps;
  /**
   * The UI properties for the edit item section.
   */
  editSection: LinidQItemSectionProps;
  /**
   * The UI properties for the edit button.
   */
  editButton: LinidQBtnProps;
  /**
   * The UI properties for the delete item section.
   */
  deleteSection: LinidQItemSectionProps;
  /**
   * The UI properties for the delete button.
   */
  deleteButton: LinidQBtnProps;
  /**
   * The UI properties for the add button.
   */
  addButton: LinidQBtnProps;
  /**
   * The UI properties for the save button.
   */
  saveButton: LinidQBtnProps;
}
