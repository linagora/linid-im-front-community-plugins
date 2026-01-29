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
import ButtonsCard from '../../../../src/components/card/ButtonsCard.vue';

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: vi.fn(() => ({})),
  }),
  useUiDesign: () => ({
    ui: vi.fn(() => ({})),
  }),
}));

describe('Test component: ButtonsCard', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    i18nScope: 'test-scope',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(ButtonsCard, {
      props: defaultProps,
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

  describe('Test props: showConfirmButton', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.showConfirmButton).toEqual(true);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ showConfirmButton: false });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showConfirmButton).toEqual(false);
    });
  });

  describe('Test props: showCancelButton', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.showCancelButton).toEqual(true);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ showCancelButton: false });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showCancelButton).toEqual(false);
    });
  });

  describe('Test props: isDisabled', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.isDisabled).toEqual(false);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ isDisabled: true });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isDisabled).toEqual(true);
    });
  });

  describe('Test props: confirmBtnType', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.confirmBtnType).toEqual('button');
    });

    it('should use provided value', async () => {
      wrapper.setProps({ confirmBtnType: 'submit' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.confirmBtnType).toEqual('submit');
    });
  });
});
