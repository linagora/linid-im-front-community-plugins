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
import ButtonsCard from '../../../src/components/ButtonsCard.vue';

const mockUi = vi.fn(() => ({}));
const mockT = vi.fn((key) => key);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useScopedI18n: () => ({
    t: mockT,
  }),
  useUiDesign: () => ({
    ui: mockUi,
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

  it('should have default confirmLoading as false', () => {
    expect(wrapper.props('confirmLoading')).toBe(false);
  });

  it('should compute uiNamespace correctly', () => {
    expect(wrapper.vm.uiNamespace).toBe('test-namespace.buttons-card');
  });

  it('should initialize uiProps with all required properties', () => {
    expect(wrapper.vm.uiProps).toBeDefined();
    expect(wrapper.vm.uiProps.card).toBeDefined();
    expect(wrapper.vm.uiProps.cardActions).toBeDefined();
    expect(wrapper.vm.uiProps.confirmButton).toBeDefined();
    expect(wrapper.vm.uiProps.cancelButton).toBeDefined();
  });

  it('should call ui() for card with correct namespace', () => {
    expect(mockUi).toHaveBeenCalledWith(
      'test-namespace.buttons-card',
      'q-card'
    );
  });

  it('should call ui() for card actions with correct namespace', () => {
    expect(mockUi).toHaveBeenCalledWith(
      'test-namespace.buttons-card',
      'q-card-actions'
    );
  });

  it('should call ui() for confirm button with correct namespace', () => {
    expect(mockUi).toHaveBeenCalledWith(
      'test-namespace.buttons-card.confirm-button',
      'q-btn'
    );
  });

  it('should call ui() for cancel button with correct namespace', () => {
    expect(mockUi).toHaveBeenCalledWith(
      'test-namespace.buttons-card.cancel-button',
      'q-btn'
    );
  });
});
