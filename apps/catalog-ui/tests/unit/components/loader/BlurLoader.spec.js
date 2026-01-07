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
import BlurLoader from '../../../../src/components/loader/BlurLoader.vue';

describe('Test component: BlurLoader', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(BlurLoader);
  });

  describe('Test props: width', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.width).toEqual('md');
    });

    it('should use provided value', async () => {
      wrapper.setProps({ width: 'xl' });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.width).toEqual('xl');
    });

    it('should validate value', () => {
      const validator = BlurLoader.props.width.validator;

      expect(validator('xs')).toBe(true);
      expect(validator('md')).toBe(true);
      expect(validator('')).toBe(false);
      expect(validator('medium')).toBe(false);
    });
  });

  describe('Test props: height', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.height).toEqual('md');
    });

    it('should use provided value', async () => {
      wrapper.setProps({ height: 'xl' });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.height).toEqual('xl');
    });

    it('should validate value', () => {
      const validator = BlurLoader.props.height.validator;

      expect(validator('xs')).toBe(true);
      expect(validator('md')).toBe(true);
      expect(validator('')).toBe(false);
      expect(validator('medium')).toBe(false);
    });
  });

  describe('Test props: primary', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.primary).toEqual(false);
    });

    it('should use provided value', async () => {
      wrapper.setProps({ primary: true });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.primary).toEqual(true);
    });
  });

  describe('Test computed: widthClass', () => {
    it('should use provided value', async () => {
      expect(wrapper.vm.widthClass).toEqual('blur-loader--width-md');

      wrapper.setProps({ width: 'xl' });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.widthClass).toEqual('blur-loader--width-xl');
    });
  });

  describe('Test computed: heightClass', () => {
    it('should use provided value', async () => {
      expect(wrapper.vm.heightClass).toEqual('blur-loader--height-md');

      wrapper.setProps({ height: 'xl' });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.heightClass).toEqual('blur-loader--height-xl');
    });
  });

  describe('Test computed: primaryClass', () => {
    it('should use provided value', async () => {
      expect(wrapper.vm.primaryClass).toEqual('');

      wrapper.setProps({ primary: true });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.primaryClass).toEqual('blur-loader--primary');
    });
  });
});
