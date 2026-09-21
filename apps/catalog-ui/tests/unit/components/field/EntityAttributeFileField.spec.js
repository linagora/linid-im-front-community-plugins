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
import EntityAttributeFileField from '../../../../src/components/field/EntityAttributeFileField.vue';

const mockUi = vi.fn(() => ({}));
const mockRules = [vi.fn(), vi.fn(), vi.fn()];
const mockUseQuasarRules = vi.fn(() => mockRules);

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const { getNestedValue, setNestedValue } = await vi.importActual(
    '@linagora/linid-im-front-corelib'
  );
  return {
    getNestedValue,
    setNestedValue,
    useUiDesign: () => ({
      ui: mockUi,
    }),
    useScopedI18n: () => ({ translateOrDefault: vi.fn() }),
    useQuasarRules: (...args) => mockUseQuasarRules(...args),
  };
});

/**
 * Builds a fake file with the given name.
 * @param name - File name, extension included.
 * @returns The file.
 */
function fakeFile(name) {
  return { name, size: 10 };
}

describe('Test component: EntityAttributeFileField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = shallowMount(EntityAttributeFileField, {
      props: {
        uiNamespace: 'namespace',
        instanceId: 'id',
        i18nScope: 'scope',
        definition: {
          name: 'file',
          type: 'File',
          required: true,
          hasValidations: false,
          input: 'File',
          inputSettings: {
            maxFileSize: 1,
            allowedExtensions: ['PNG', '.jpg'],
          },
        },
        entity: {
          name: 'entity-name',
        },
      },
      global: {
        stubs: {
          QFile: {
            template: '<input />',
            props: ['modelValue', 'accept', 'rules'],
            emits: ['update:modelValue'],
          },
        },
      },
    });
  });

  describe('Test computed: allowedExtensions', () => {
    it('should normalize the configured extensions', () => {
      expect(wrapper.vm.allowedExtensions).toEqual(['png', 'jpg']);
    });

    it('should be empty when unset', async () => {
      await wrapper.setProps({
        definition: { name: 'file', inputSettings: {} },
      });

      expect(wrapper.vm.allowedExtensions).toEqual([]);
    });
  });

  describe('Test computed: accept', () => {
    it('should join the extensions with a leading dot', () => {
      expect(wrapper.vm.accept).toEqual('.png,.jpg');
    });

    it('should be undefined when no extension is configured', async () => {
      await wrapper.setProps({
        definition: { name: 'file', inputSettings: {} },
      });

      expect(wrapper.vm.accept).toBeUndefined();
    });
  });

  describe('Test computed: rules', () => {
    it('should return empty array if ignoreRules property is true', async () => {
      await wrapper.setProps({ ignoreRules: true });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should return empty array if ignoreRules field from inputSettings is true', async () => {
      await wrapper.setProps({
        definition: { name: 'file', inputSettings: { ignoreRules: true } },
      });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should build the rules from the size and extension validators of the definition', () => {
      expect(wrapper.vm.rules).toBe(mockRules);
      expect(mockUseQuasarRules).toHaveBeenCalledWith(
        'id',
        wrapper.vm.definition,
        ['maxFileSize', 'allowedExtensions'],
        'scope.fields.file'
      );
    });
  });

  describe('Test function: updateValue', () => {
    it('should emit the entity with the selected file', () => {
      const file = fakeFile('avatar.png');
      wrapper.vm.localValue = file;

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')[0]).toEqual([
        { name: 'entity-name', file },
      ]);
    });
  });

  describe('Test watch: entity', () => {
    it('should update localValue when the entity attribute changes', async () => {
      const file = fakeFile('avatar.png');
      expect(wrapper.vm.localValue).toEqual(null);

      await wrapper.setProps({ entity: { name: 'entity-name', file } });

      expect(wrapper.vm.localValue).toEqual(file);
    });

    it('should set localValue to null when the attribute is removed', async () => {
      await wrapper.setProps({
        entity: { name: 'entity-name', file: fakeFile('avatar.png') },
      });
      await wrapper.setProps({ entity: { name: 'entity-name' } });

      expect(wrapper.vm.localValue).toEqual(null);
    });
  });
});
