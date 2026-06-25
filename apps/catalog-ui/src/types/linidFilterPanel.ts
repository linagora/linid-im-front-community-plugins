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
  LinidFilterValue,
  LinidQIconProps,
  LinidQItemProps,
  LinidQItemSectionProps,
  LinidQListProps,
  LinidQSeparatorProps,
} from '@linagora/linid-im-front-corelib';
import type { CommonComponentProps } from './common';

/**
 * Props for the LinidFilterPanel component.
 */
export interface LinidFilterPanelProps extends CommonComponentProps {
  /**
   * Available filters to display in the navigation list.
   */
  filters: LinidFilter[];
  /**
   * Identifier of the currently selected filter (v-model:selected).
   * When it does not match any filter in `filters`, the first filter is selected instead.
   */
  selected: string;
}

/**
 * Defines the UI properties for each filter type, used to resolve the per-type icon.
 */
export type LinidFilterPanelUIPropsTypes = Record<
  string,
  {
    /**
     * The UI properties for the displayed icon.
     */
    icon: LinidQIconProps;
  }
>;

/**
 * UI props for the LinidFilterPanel component.
 */
export interface LinidFilterPanelUIProps {
  /**
   * The UI properties for the filter navigation list.
   */
  list: LinidQListProps;
  /**
   * The UI properties for each filter item.
   */
  item: LinidQItemProps;
  /**
   * The UI properties for the filter item icon, keyed by filter type.
   */
  types: LinidFilterPanelUIPropsTypes;
  /**
   * The UI properties for the icon item section (avatar).
   */
  iconSection: LinidQItemSectionProps;
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
   * The UI properties for the vertical separator between the filter list and the editor.
   */
  contentSeparator: LinidQSeparatorProps;
}

/**
 * Base search payload for filter panel components. Can be extended to add filter-specific fields.
 */
export interface LinidFilterPanelSearchPayload {
  /**
   * The field name targeted by the filter.
   */
  field: string;
  /**
   * The list of filter values to apply.
   */
  values: LinidFilterValue[];
}

/**
 * Generic search output type for filter panel components.
 * Specialize with a payload type extending `LinidFilterPanelSearchPayload` to add filter-specific fields.
 */
export type LinidFilterPanelSearchOutputs<
  T extends LinidFilterPanelSearchPayload = LinidFilterPanelSearchPayload,
> = {
  (e: 'search', payload: T): void;
};

/**
 * Defines the events emitted by the LinidFilterPanel component.
 */
export type LinidFilterPanelOutputs = {
  (e: 'update:selected', filterId: string): void;
};
