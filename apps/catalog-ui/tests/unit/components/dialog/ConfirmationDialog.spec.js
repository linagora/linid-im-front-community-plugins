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
import { ref } from 'vue';
import ConfirmationDialog from '../../../../src/components/dialog/ConfirmationDialog.vue';

const mockOpenHandler = { handler: null };
const mockShowRef = ref(false);

vi.mock('@linagora/linid-im-front-corelib', () => {
  return {
    loadAsyncComponent: () => 'div',
    useDialog: (_key, onOpen) => {
      mockOpenHandler.handler = onOpen;
      return { show: mockShowRef };
    },
    useUiDesign: () => ({
      ui: vi.fn(() => ({})),
    }),
  };
});

describe('Test component: ConfirmationDialog', () => {
  let wrapper;

  beforeEach(async () => {
    mockShowRef.value = false;
    mockOpenHandler.handler = null;

    wrapper = shallowMount(ConfirmationDialog, {
      global: {
        stubs: {
          QCard: {},
          QBtn: {},
          QDialog: {},
          QCardSection: {},
        },
      },
    });
  });

  describe('Test computed: uiProps', () => {
    it('should return dialog props with correct namespace', async () => {
      mockOpenHandler.handler({
        title: 'Test Title',
        content: 'Test Content',
        uiNamespace: 'test-namespace',
        i18nScope: 'test-scope',
        onConfirm: vi.fn(() => Promise.resolve()),
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.uiProps).toBeDefined();
      expect(wrapper.vm.uiProps.dialog).toBeDefined();
    });
  });

  describe('Test function: handleConfirm', () => {
    it('should set show.value to false and call onConfirm when executed', async () => {
      const mockOnConfirm = vi.fn(() => Promise.resolve());

      // Set up the component state directly
      mockShowRef.value = true;
      wrapper.vm.onConfirm = mockOnConfirm;

      await wrapper.vm.$nextTick();

      // Call handleConfirm directly
      wrapper.vm.handleConfirm();

      await wrapper.vm.$nextTick();

      // Verify show.value is false and onConfirm was called
      expect(wrapper.vm.show).toBe(false);
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  describe('Test function: onClose', () => {
    it('should set show.value to false when executed', async () => {
      mockShowRef.value = true;

      await wrapper.vm.$nextTick();

      wrapper.vm.onClose();

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.show).toBe(false);
    });
  });

  describe('Test function: onOpen', () => {
    it('should update title, content, uiNamespace, i18nScope, and onConfirm when called', async () => {
      const mockOnConfirm = vi.fn(() => Promise.resolve());

      mockOpenHandler.handler({
        title: 'Test Title',
        content: 'Test Content',
        uiNamespace: 'test-namespace',
        i18nScope: 'test-scope',
        onConfirm: mockOnConfirm,
      });

      await wrapper.vm.$nextTick();

      // Verify all properties are updated
      expect(wrapper.vm.title).toBe('Test Title');
      expect(wrapper.vm.content).toBe('Test Content');
      expect(wrapper.vm.uiNamespace).toBe('test-namespace');
      expect(wrapper.vm.i18nScope).toBe('test-scope');
      expect(wrapper.vm.show).toBe(false);
    });
  });
});
