/*
 * Copyright (C) 2025 Linagora
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import BaseLayout from '../../../src/layouts/BaseLayout.vue';

const mockUi = vi.fn(() => ({}));

vi.mock('@linagora/linid-im-front-corelib', () => ({
  useUiDesign: () => ({
    ui: mockUi,
  }),
}));

describe('Test layout: BaseLayout', () => {
  let wrapper;

  const defaultProps = {
    uiNamespace: 'test-namespace',
    header: {
      appTitle: 'LinID Identity Manager',
      userFullName: 'John Doe',
      appVersion: 'v1.0.0',
    },
  };

  beforeEach(() => {
    mockUi.mockClear();
    wrapper = shallowMount(BaseLayout, {
      props: defaultProps,
    });
  });

  it('should initialize uiProps object with all required properties', () => {
    expect(mockUi).toHaveBeenCalledTimes(6);
    expect(wrapper.vm.uiProps).toBeDefined();

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-header');
    expect(wrapper.vm.uiProps).toHaveProperty('header');

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-toolbar');
    expect(wrapper.vm.uiProps).toHaveProperty('toolbar');

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-avatar');
    expect(wrapper.vm.uiProps).toHaveProperty('avatar');

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-toolbar-title');
    expect(wrapper.vm.uiProps).toHaveProperty('toolbarTitle');

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-btn');
    expect(wrapper.vm.uiProps).toHaveProperty('btn');

    expect(mockUi).toHaveBeenCalledWith('test-namespace', 'q-badge');
    expect(wrapper.vm.uiProps).toHaveProperty('badge');
  });
});
