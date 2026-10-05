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

import type { TreeNodeType } from '@linagora/linid-im-front-corelib';
import type { CommonComponentProps } from './common';

/**
 * Props definition for the GenericTreeCard component.
 *
 * This interface describes the configuration used to display a tree inside a card: the paginated
 * endpoint returning the flat nodes, the mapping of the node properties, the node types, and the
 * optional navigation routes resolved when a node is selected. Per-node buttons, such as an
 * edition dialog, are hosted by the `node-actions` zones of the card.
 */
export interface GenericTreeCardProps extends CommonComponentProps {
  /**
   * Identifier of the instance used for contextual data (e.g. API validation rules)
   * by the edition form dialog fields.
   */
  instanceId?: string;

  /**
   * Entity owning the tree, provided to the Nunjucks context when rendering the endpoints.
   * Typically injected by the zone hosting the component.
   */
  entity?: Record<string, unknown>;

  /**
   * Endpoint used to fetch the flat tree nodes (GET), defined as a Nunjucks template rendered with
   * a context containing `entity`. The endpoint must return a paginated response: every page is
   * fetched until the last one, and the complete tree is built from the accumulated nodes.
   */
  url: string;

  /**
   * Name of the node property holding its unique identifier.
   * @default 'id'
   */
  idKey?: string;

  /**
   * Name of the node property holding the identifier of its parent node. Nodes without a parent,
   * or whose parent is not part of the fetched nodes, are rendered as roots.
   * @default 'parentId'
   */
  parentIdKey?: string;

  /**
   * Name of the node property holding its type, matched against the declared node types.
   * @default 'type'
   */
  typeKey?: string;

  /**
   * Number of nodes fetched per page when loading the tree.
   * @default 50
   */
  nodesQuerySize?: number;

  /**
   * The types of nodes, forwarded to the GenericTree component. The card handles no node action
   * itself: per-node buttons are configured through the `node-actions.[TYPE]` zones instead.
   */
  nodeTypes: TreeNodeType[];

  /**
   * Whether the tree search input is enabled, forwarded to the GenericTree component.
   * @default false
   */
  searchEnabled?: boolean;

  /**
   * Routes resolved when a node is selected, indexed by node type. Each route is a Nunjucks
   * template rendered with a context containing `entity` and `item` (the selected node), for
   * example `/organizations/{{ entity.id }}/units/{{ item.id }}`. Selecting a node whose type is
   * not declared here does not navigate.
   */
  navigationRoutes?: Record<string, string>;

  /**
   * Event keys reloading the tree when they are emitted through the UI event subject, typically
   * by components updating the displayed nodes from outside the card.
   */
  reloadOn?: string[];

  /**
   * When false, hides the entire header actions section (slots and zone renderer).
   * @default true
   */
  enableActions?: boolean;
}
