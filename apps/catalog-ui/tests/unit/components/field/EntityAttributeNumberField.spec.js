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

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EntityAttributeNumberField from '../../../../src/components/field/EntityAttributeNumberField.vue';

const mockUi = vi.fn(() => ({}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({
    ui: mockUi,
  }),
  useScopedI18n: () => ({ translateOrDefault: vi.fn() }),
  useQuasarRules: () => [vi.fn(), vi.fn(), vi.fn(), vi.fn()],
}));

describe('Test component: EntityAttributeNumberField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(EntityAttributeNumberField, {
      props: {
        uiNamespace: 'namespace',
        instanceId: 'id',
        definition: {
          name: 'age',
          type: 'Integer',
          required: false,
          hasValidations: false,
          input: 'Number',
          inputSettings: {},
        },
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          age: 18,
        },
      },
      global: {
        stubs: {
          QInput: {
            template: '<input />',
            props: ['modelValue', 'prefix', 'suffix'],
            emits: ['update:modelValue'],
          },
        },
      },
    });
  });

  describe('Test computed: rules', async () => {
    it('should return rules', async () => {
      wrapper.setProps({
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: { min: 0, max: 100 },
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.rules.length).toEqual(4);
    });
  });

  describe('Test function: updateEntity', () => {
    it('should emit event', () => {
      wrapper.vm.localValue = 25;

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          age: 25,
        },
      ]);
    });
  });
});
