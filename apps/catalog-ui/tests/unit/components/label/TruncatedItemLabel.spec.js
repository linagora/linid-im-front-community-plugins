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
import { describe, expect, it } from 'vitest';
import TruncatedItemLabel from '../../../../src/components/label/TruncatedItemLabel.vue';

describe('Test component: TruncatedItemLabel', () => {
  const defaultProps = { label: 'A label long enough to be truncated' };

  /**
   * Forces the measured widths of the element onEnter reads, resolved through the
   * component template ref rather than the wrapper root, which is a fragment.
   * Both report 0 otherwise, as happy-dom has no layout engine.
   * @param wrapper - The component wrapper.
   * @param scrollWidth - Width of the content, overflow included.
   * @param clientWidth - Visible width of the box.
   */
  function setWidths(wrapper, scrollWidth, clientWidth) {
    const element = wrapper.vm.labelEl.$el;

    Object.defineProperty(element, 'scrollWidth', {
      value: scrollWidth,
      configurable: true,
    });
    Object.defineProperty(element, 'clientWidth', {
      value: clientWidth,
      configurable: true,
    });
  }

  describe('Test function: onEnter', () => {
    it('should show the tooltip when the text overflows its box', () => {
      const wrapper = shallowMount(TruncatedItemLabel, { props: defaultProps });
      setWidths(wrapper, 240, 120);

      wrapper.vm.onEnter();

      expect(wrapper.vm.visible).toBe(true);
    });

    it('should not show the tooltip when the text fits exactly', () => {
      const wrapper = shallowMount(TruncatedItemLabel, { props: defaultProps });
      setWidths(wrapper, 120, 120);

      wrapper.vm.onEnter();

      expect(wrapper.vm.visible).toBe(false);
    });

    it('should show the tooltip when the text overflows by a single pixel', () => {
      const wrapper = shallowMount(TruncatedItemLabel, { props: defaultProps });
      setWidths(wrapper, 121, 120);

      wrapper.vm.onEnter();

      expect(wrapper.vm.visible).toBe(true);
    });

    it('should not show the tooltip when the label ref is not set', () => {
      const wrapper = shallowMount(TruncatedItemLabel, { props: defaultProps });
      setWidths(wrapper, 240, 120);
      wrapper.vm.labelEl = null;

      wrapper.vm.onEnter();

      expect(wrapper.vm.visible).toBe(false);
    });

    it('should not show the tooltip when the label ref has no root element', () => {
      const wrapper = shallowMount(TruncatedItemLabel, { props: defaultProps });
      setWidths(wrapper, 240, 120);
      wrapper.vm.labelEl = { $el: undefined };

      wrapper.vm.onEnter();

      expect(wrapper.vm.visible).toBe(false);
    });
  });
});
