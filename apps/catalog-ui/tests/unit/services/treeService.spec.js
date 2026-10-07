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

import { describe, expect, it } from 'vitest';
import { toTreeNodes } from '../../../src/services/treeService';

const keys = { idKey: 'id', parentIdKey: 'parentId', typeKey: 'type' };

describe('Test service: treeService', () => {
  describe('Test function: toTreeNodes', () => {
    it('should nest the nodes under their parent and keep the API order', () => {
      const { roots } = toTreeNodes(
        [
          { id: 'root', type: 'FOLDER' },
          { id: 'child-2', parentId: 'root', type: 'FILE' },
          { id: 'child-1', parentId: 'root', type: 'FILE' },
        ],
        keys
      );

      expect(roots).toHaveLength(1);
      expect(roots[0].key).toBe('root');
      expect(roots[0].nodes.map((node) => node.key)).toEqual([
        'child-2',
        'child-1',
      ]);
    });

    it('should expose the flat node as the node value and default a missing type', () => {
      const flatNode = { id: 1, label: 'Node 1' };

      const { roots } = toTreeNodes([flatNode], keys);

      expect(roots[0]).toMatchObject({
        key: '1',
        type: '',
        value: flatNode,
        nodes: [],
      });
    });

    it('should make a node whose parent is unknown a root', () => {
      const { roots } = toTreeNodes(
        [{ id: 'orphan', parentId: 'missing', type: 'FILE' }],
        keys
      );

      expect(roots.map((node) => node.key)).toEqual(['orphan']);
    });

    it('should make a node referencing itself as parent a root', () => {
      const { roots } = toTreeNodes(
        [{ id: 'loop', parentId: 'loop', type: 'FILE' }],
        keys
      );

      expect(roots.map((node) => node.key)).toEqual(['loop']);
    });

    it('should read the identity properties from the given keys', () => {
      const { roots } = toTreeNodes(
        [
          { uuid: 'a', kind: 'FOLDER' },
          { uuid: 'b', parent: 'a', kind: 'FILE' },
        ],
        { idKey: 'uuid', parentIdKey: 'parent', typeKey: 'kind' }
      );

      expect(roots).toHaveLength(1);
      expect(roots[0].nodes[0]).toMatchObject({ key: 'b', type: 'FILE' });
    });

    it('should expose the parent key of every node', () => {
      const { parentByKey } = toTreeNodes(
        [
          { id: 'root', type: 'FOLDER' },
          { id: 'child', parentId: 'root', type: 'FILE' },
        ],
        keys
      );

      expect(parentByKey.get('root')).toBeNull();
      expect(parentByKey.get('child')).toBe('root');
    });

    it('should index every node by its key', () => {
      const { nodesByKey } = toTreeNodes(
        [
          { id: 'root', type: 'FOLDER' },
          { id: 'child', parentId: 'root', type: 'FILE' },
        ],
        keys
      );

      expect([...nodesByKey.keys()].sort()).toEqual(['child', 'root']);
      expect(nodesByKey.get('child').key).toBe('child');
    });
  });
});
