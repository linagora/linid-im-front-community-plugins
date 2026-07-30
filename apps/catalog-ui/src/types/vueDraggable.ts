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

/**
 * Union of all change events emitted by vuedraggable when the list is modified.
 */
export type DraggableChangeEvent<T> =
  DraggableAddedEvent<T> | DraggableRemovedEvent<T> | DraggableMoveEvent<T>;

/**
 * Event emitted by vuedraggable when an item is added to the list from another draggable container.
 */
export type DraggableAddedEvent<T> = {
  /**
   * Payload describing the added item.
   */
  added: {
    /**
     * The item that was added to the list.
     */
    element: T;
    /**
     * Index at which the item was inserted.
     */
    newIndex: number;
  };
};

/**
 * Event emitted by vuedraggable when an item is removed from the list and moved to another draggable container.
 */
export type DraggableRemovedEvent<T> = {
  /**
   * Payload describing the removed item.
   */
  removed: {
    /**
     * The item that was removed from the list.
     */
    element: T;
    /**
     * Index from which the item was removed.
     */
    oldIndex: number;
  };
};

/**
 * Event emitted by vuedraggable when an item is reordered within the same list.
 */
export type DraggableMoveEvent<T> = {
  /**
   * Payload describing the moved item.
   */
  moved: {
    /**
     * The item that was moved.
     */
    element: T;
    /**
     * Index from which the item was dragged.
     */
    oldIndex: number;
    /**
     * Index at which the item was dropped.
     */
    newIndex: number;
  };
};
