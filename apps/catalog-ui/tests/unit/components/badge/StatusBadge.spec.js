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
import { describe, expect, it, vi } from 'vitest';
import StatusBadge from '../../../../src/components/badge/StatusBadge.vue';

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const { getNestedValue } = await vi.importActual(
    '@linagora/linid-im-front-corelib'
  );
  return {
    getNestedValue,
    useUiDesign: () => ({ ui: vi.fn(() => ({})) }),
  };
});

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: vi.fn((key) => key) }),
}));

describe('Test component: StatusBadge', () => {
  /**
   * Mounts the component with the given props.
   * @param props - Props overriding the defaults.
   * @returns The component wrapper.
   */
  function mountComponent(props = {}) {
    return shallowMount(StatusBadge, {
      props: {
        entity: { status: 'ACTIVE' },
        valueKey: 'status',
        defaultValue: 'UNKNOWN',
        ...props,
      },
    });
  }

  describe('Test computed: statusValue', () => {
    it('should read the value from the entity', () => {
      const wrapper = mountComponent();

      expect(wrapper.vm.statusValue).toBe('ACTIVE');
    });

    it('should fall back to the default value when the entity has no value', () => {
      const wrapper = mountComponent({ entity: {} });

      expect(wrapper.vm.statusValue).toBe('UNKNOWN');
    });

    it('should resolve a nested value key with dot notation', () => {
      const wrapper = mountComponent({
        entity: { extraParameters: { status: 'SUSPENDED' } },
        valueKey: 'extraParameters.status',
      });

      expect(wrapper.vm.statusValue).toBe('SUSPENDED');
    });

    it('should fall back to the default value for an unresolvable nested path', () => {
      const wrapper = mountComponent({ valueKey: 'extraParameters.status' });

      expect(wrapper.vm.statusValue).toBe('UNKNOWN');
    });
  });
});
