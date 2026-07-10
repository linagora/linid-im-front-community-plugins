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
  LinidFilter,
  LinidFilterSet,
  LinidQBtnProps,
  LinidQIconProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQSeparatorProps,
} from '@linagora/linid-im-front-corelib';
import type { CommonComponentProps } from './common';

/**
 * Props for the LinidFavoritePanel component.
 */
export interface LinidFavoritePanelProps extends CommonComponentProps {
  /**
   * Available favorites to display in the navigation list.
   */
  favorites: LinidFilterSet[];
  /**
   * Filters used.
   */
  filters: LinidFilter[];
}

/**
 * UI props for the LinidFavoritePanel component.
 */
export interface LinidFavoritePanelUIProps {
  /**
   * The UI properties for the filter navigation list.
   */
  list: LinidQListProps;
  /**
   * The UI properties for each filter item.
   */
  item: LinidQItemProps;
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
   The UI properties for the no-data label item section.
   */
  noDataLabelSection: LinidQItemSectionProps;
  /**
   * The UI properties for the  no-data icon in icon item section (avatar).
   */
  noDataIcon: LinidQIconProps;
  /**
   * The UI properties for the label item section.
   */
  labelSection: LinidQItemSectionProps;
  /**
   * The UI properties for the icon displayed in the title bar.
   */
  titleIcon: LinidQIconProps;
  /**
   * The UI properties for the horizontal separator below the title.
   */
  titleSeparator: LinidQSeparatorProps;
  /**
   * The UI properties for the rename item section.
   */
  renameSection: LinidQItemSectionProps;
  /**
   * The UI properties for the rename button.
   */
  renameButton: LinidQBtnProps;
  /**
   * The UI properties for the override item section.
   */
  overrideSection: LinidQItemSectionProps;
  /**
   * The UI properties for the override button.
   */
  overrideButton: LinidQBtnProps;
  /**
   * The UI properties for the delete item section.
   */
  deleteSection: LinidQItemSectionProps;
  /**
   * The UI properties for the delete button.
   */
  deleteButton: LinidQBtnProps;
  /**
   * The UI properties for the create button.
   */
  createButton: LinidQBtnProps;
}

/**
 * Defines the events emitted by the LinidFavoritePanel component.
 */
export type LinidFavoritePanelOutputs = {
  (e: 'apply', favorite: LinidFilterSet): void;
  (e: 'delete', favorite: LinidFilterSet): void;
  (e: 'rename', favorite: LinidFilterSet): void;
  (e: 'create'): void;
  (e: 'override', favorite: LinidFilterSet): void;
};
