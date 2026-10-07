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

import type { TreeNode } from '@linagora/linid-im-front-corelib';

/** The flat node properties holding the node identity and hierarchy. */
export interface TreeNodeKeys {
  /** The property holding the node identifier. */
  idKey: string;
  /** The property holding the parent node identifier. */
  parentIdKey: string;
  /** The property holding the node type. */
  typeKey: string;
}

/** A built tree: its root nodes and every node indexed by its key. */
export interface BuiltTree {
  /** The root nodes of the tree. */
  roots: TreeNode<Record<string, unknown>>[];
  /** Every tree node indexed by its key. */
  nodesByKey: Map<string, TreeNode<Record<string, unknown>>>;
  /** The parent key of every node, null for the nodes without one. */
  parentByKey: Map<string, string | null>;
}

/**
 * Builds a tree from flat nodes using their identifier and parent identifier properties. Nodes
 * without a parent, or whose parent is not part of the flat nodes, become roots. The nodes keep
 * the order returned by the API.
 * @param flatNodes - The flat nodes, typically fetched from a list endpoint.
 * @param keys - The flat node properties holding the node identity and hierarchy.
 * @param keys.idKey - The property holding the node identifier.
 * @param keys.parentIdKey - The property holding the parent node identifier.
 * @param keys.typeKey - The property holding the node type.
 * @returns The root nodes of the built tree, with every node indexed by its key and the parent
 *   key of every node.
 */
export function toTreeNodes(
  flatNodes: Record<string, unknown>[],
  { idKey, parentIdKey, typeKey }: TreeNodeKeys
): BuiltTree {
  const index: Record<string, TreeNode<Record<string, unknown>>> = {};
  const parentByKey = new Map<string, string | null>();

  for (const flatNode of flatNodes) {
    const key = String(flatNode[idKey]);
    const parentId = flatNode[parentIdKey];
    index[key] = {
      key,
      type: String(flatNode[typeKey] ?? ''),
      value: flatNode,
      nodes: [],
    };
    parentByKey.set(key, parentId == null ? null : String(parentId));
  }

  const roots: TreeNode<Record<string, unknown>>[] = [];

  for (const flatNode of flatNodes) {
    const node = index[String(flatNode[idKey])];
    const parentId = flatNode[parentIdKey];
    const parent = parentId == null ? undefined : index[String(parentId)];

    if (parent && parent !== node) {
      parent.nodes.push(node);
    } else {
      roots.push(node);
    }
  }

  return {
    roots,
    nodesByKey: new Map(Object.values(index).map((node) => [node.key, node])),
    parentByKey,
  };
}
