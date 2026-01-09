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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import EntityDetailsCard from '../../../../src/components/card/EntityDetailsCard.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({ ui: vi.fn() }),
  useScopedI18n: () => ({ t: vi.fn() }),
}));

describe('Test component: EntityDetailsCard', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(EntityDetailsCard, {
      props: {
        uiNamespace: 'namespace',
        instanceId: 'id',
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
        },
      },
    });
  });

  describe('Test props: fieldOrder', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.fieldOrder).toEqual([]);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ fieldOrder: ['test'] });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.fieldOrder).toEqual(['test']);
    });
  });

  describe('Test props: showRemainingFields', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.showRemainingFields).toEqual(false);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ showRemainingFields: true });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showRemainingFields).toEqual(true);
    });
  });

  describe('Test props: isLoading', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.isLoading).toEqual(false);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ isLoading: true });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isLoading).toEqual(true);
    });
  });

  describe('Test computed: fieldNames', () => {
    it('should retrieve valid field names', async () => {
      wrapper.setProps({ fieldOrder: ['field1', 'field2', 'name'] });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.fieldNames).toEqual(['field1', 'field2', 'name']);
    });

    it('should retrieve valid field names with remainingField', async () => {
      wrapper.setProps({
        fieldOrder: ['type', 'field1'],
        showRemainingFields: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.fieldNames).toEqual([
        'type',
        'field1',
        'name',
        'description',
      ]);
    });
  });

  describe('Test computed: values', () => {
    it('should retrieve valid values', async () => {
      wrapper.setProps({ fieldOrder: ['field1', 'field2', 'name'] });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.values).toEqual({
        field1: '',
        field2: '',
        name: 'entity-name',
      });
    });
  });
});
