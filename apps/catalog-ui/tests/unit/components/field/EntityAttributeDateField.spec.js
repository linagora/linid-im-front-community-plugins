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
import EntityAttributeDateField from '../../../../src/components/field/EntityAttributeDateField.vue';

const mockUi = vi.fn(() => ({}));
const mockGlobalT = vi.fn((key) => key);
const mockRender = vi.fn((value) => value);
const mockMinDate = vi.fn(() => null);
const mockMaxDate = vi.fn(() => null);
const mockFormatQDate = vi.fn(() => '2026/01/01');
const mockToQDateFormat = vi.fn((d) => d);
const mockValidDate = vi.fn(() => vi.fn());
const mockRequired = vi.fn();
const mockAfterDate = vi.fn(() => vi.fn());
const mockBeforeDate = vi.fn(() => vi.fn());
const mockFromDate = vi.fn(() => vi.fn());
const mockUpToDate = vi.fn(() => vi.fn());
const mockValidateFromApi = vi.fn(() => vi.fn());
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);
const mockGlobalTe = vi.fn(() => false);

vi.mock('@linagora/linid-im-front-corelib', () => ({
  getI18nInstance: () => ({
    global: {
      t: mockGlobalT,
      te: mockGlobalTe,
    },
  }),
  QDATE_DEFAULT_MASK: 'YYYY/MM/DD',
  useUiDesign: () => ({
    ui: mockUi,
  }),
  useScopedI18n: () => ({
    t: vi.fn(),
    translateOrDefault: mockTranslateOrDefault,
  }),
  useNunjucks: () => ({ render: mockRender }),
  useDayjs: () => ({ minDate: mockMinDate, maxDate: mockMaxDate }),
  useQuasarDate: () => ({
    toQDateFormat: mockToQDateFormat,
    formatQDate: mockFormatQDate,
  }),
  useQuasarFieldValidation: () => ({
    required: mockRequired,
    validDate: mockValidDate,
    afterDate: mockAfterDate,
    beforeDate: mockBeforeDate,
    fromDate: mockFromDate,
    upToDate: mockUpToDate,
    validateFromApi: mockValidateFromApi,
  }),
}));

describe('Test component: EntityAttributeDateField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatQDate.mockImplementation(() => '2026/01/01');
    mockToQDateFormat.mockImplementation((d) => d);
    mockTranslateOrDefault.mockImplementation((defaultValue) => defaultValue);
    mockGlobalTe.mockImplementation(() => false);
    wrapper = shallowMount(EntityAttributeDateField, {
      props: {
        uiNamespace: 'namespace',
        instanceId: 'id',
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {},
        },
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '1990/01/01',
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

  describe('Test props: ignoreRules', () => {
    it('should use default value', async () => {
      expect(wrapper.vm.ignoreRules).toEqual(false);
    });

    it('should use provided value', async () => {
      await wrapper.setProps({ ignoreRules: true });

      expect(wrapper.vm.ignoreRules).toEqual(true);
    });
  });

  describe('Test computed: mask', () => {
    it('should resolve to QDATE_DEFAULT_MASK when inputSettings is not defined', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
        },
      });

      expect(wrapper.vm.mask).toEqual('YYYY/MM/DD');
    });

    it('should resolve to QDATE_DEFAULT_MASK when mask and maskI18NKey are not defined', () => {
      expect(wrapper.vm.mask).toEqual('YYYY/MM/DD');
      expect(mockGlobalTe).toHaveBeenCalledWith(undefined);
    });

    it('should resolve to QDATE_DEFAULT_MASK when mask is null', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { mask: null },
        },
      });

      expect(wrapper.vm.mask).toEqual('YYYY/MM/DD');
    });

    it('should resolve to QDATE_DEFAULT_MASK when mask is an empty string', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { mask: '' },
        },
      });

      expect(wrapper.vm.mask).toEqual('YYYY/MM/DD');
    });

    it('should use the static mask as the resolved value when maskI18NKey does not resolve via te', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { mask: 'DD/MM/YYYY' },
        },
      });

      expect(wrapper.vm.mask).toEqual('DD/MM/YYYY');
    });

    it('should call te with the configured maskI18NKey and keep the static mask when te returns false', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            maskI18NKey: 'global.dateFormat',
          },
        },
      });

      expect(mockGlobalTe).toHaveBeenCalledWith('global.dateFormat');
      expect(wrapper.vm.mask).toEqual('DD/MM/YYYY');
    });

    it('should return the globally translated value when maskI18NKey resolves via te', async () => {
      mockGlobalTe.mockReturnValueOnce(true);
      mockGlobalT.mockReturnValueOnce('MM/DD/YYYY');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            maskI18NKey: 'global.dateFormat',
          },
        },
      });

      expect(wrapper.vm.mask).toEqual('MM/DD/YYYY');
      expect(mockGlobalT).toHaveBeenCalledWith('global.dateFormat');
    });
  });

  describe('Test computed: renderedDefinition', () => {
    it('should delegate t context function to getI18nInstance().global.t', () => {
      const definitionRenderCall = mockRender.mock.calls.find(
        ([value]) => typeof value === 'object' && value !== null
      );
      definitionRenderCall[1].t('some.key');

      expect(mockGlobalT).toHaveBeenCalledWith('some.key');
    });
  });

  describe('Test computed: rules', () => {
    it('should return empty array if ignoreRules property is true', async () => {
      await wrapper.setProps({
        ignoreRules: true,
        definition: {
          hasValidations: true,
          required: true,
        },
      });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should return empty array if ignoreRules field from inputSettings is true', async () => {
      await wrapper.setProps({
        ignoreRules: false,
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: { ignoreRules: true },
        },
      });

      expect(wrapper.vm.rules).toEqual([]);
    });

    it('should return rules if ignoreRules is false', async () => {
      await wrapper.setProps({
        definition: {
          ignoreRules: false,
          hasValidations: true,
          required: true,
          inputSettings: {
            ignoreRules: false,
          },
        },
      });

      expect(wrapper.vm.rules.length).toEqual(3);
    });

    it('should return rules if ignoreRules is unset', async () => {
      await wrapper.setProps({
        definition: {
          hasValidations: true,
          required: true,
          inputSettings: {},
        },
      });

      expect(wrapper.vm.rules.length).toEqual(3);
    });

    it('should return only validDate rule when required is false', async () => {
      await wrapper.setProps({
        definition: {
          hasValidations: false,
          required: false,
          inputSettings: {},
        },
      });

      expect(wrapper.vm.rules.length).toEqual(1);
    });

    it('should include option-based rules when date constraints are set', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          hasValidations: true,
          required: false,
          inputSettings: {
            options: { afterDate: '2026/01/01' },
          },
        },
      });

      expect(wrapper.vm.rules.length).toEqual(3);
    });

    it('should call validateFromApi with instanceId and definition name when hasValidations is true', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: true,
          input: 'Date',
          inputSettings: {},
        },
      });

      expect(mockValidateFromApi).toHaveBeenCalledWith('id', 'birthdate');
    });

    it('should pass the mask to the constraint rule factories when DD/MM/YYYY mask is set', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      mockFormatQDate.mockReturnValue('31/01/2026');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            options: { afterDate: '31/01/2026' },
          },
        },
      });

      expect(mockAfterDate).toHaveBeenCalledWith('31/01/2026', 'DD/MM/YYYY');
    });
  });

  describe('Test computed: dateConstraints', () => {
    it('should return null when inputSettings has no options', () => {
      expect(wrapper.vm.dateConstraints).toBeNull();
    });

    it('should return an empty array when options is an empty object', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: {} },
        },
      });

      expect(wrapper.vm.dateConstraints).toEqual([]);
    });

    it('should exclude the constraint and not call the aggregate when option value is an empty string', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: '' } },
        },
      });

      expect(wrapper.vm.dateConstraints).toEqual([]);
      expect(mockMaxDate).not.toHaveBeenCalled();
    });

    it('should exclude the constraint and not call the aggregate when array contains only empty strings', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: ['', '  '] } },
        },
      });

      expect(wrapper.vm.dateConstraints).toEqual([]);
      expect(mockMaxDate).not.toHaveBeenCalled();
    });

    it('should exclude the constraint when the aggregate function returns null', async () => {
      mockMaxDate.mockReturnValue(null);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.dateConstraints).toEqual([]);
    });

    it('should call maxDate with a single-element array when afterDate is a string', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: '2026/01/01' } },
        },
      });

      expect(mockMaxDate).toHaveBeenCalledWith(['2026/01/01'], 'YYYY/MM/DD');
    });

    it('should call minDate with the array as-is when beforeDate is an array', async () => {
      const mockDayjsResult = { toISOString: () => '2026-06-01T00:00:00.000Z' };
      mockMinDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            options: { beforeDate: ['2026/06/01', '2026/12/31'] },
          },
        },
      });

      expect(mockMinDate).toHaveBeenCalledWith(
        ['2026/06/01', '2026/12/31'],
        'YYYY/MM/DD'
      );
    });

    it('should return the formatted date string when aggregate returns a Dayjs object', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      mockFormatQDate.mockReturnValue('2026/01/01');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.dateConstraints[0].dateRef).toEqual('2026/01/01');
    });

    it('should pass the mask to the aggregate and formatQDate with DD/MM/YYYY mask', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      mockFormatQDate.mockReturnValue('31/01/2026');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            options: { afterDate: '31/01/2026' },
          },
        },
      });

      expect(mockMaxDate).toHaveBeenCalledWith(['31/01/2026'], 'DD/MM/YYYY');
      expect(mockFormatQDate).toHaveBeenCalledWith(
        '2026-01-31T00:00:00.000Z',
        'DD/MM/YYYY'
      );
      expect(wrapper.vm.dateConstraints[0].dateRef).toEqual('31/01/2026');
    });
  });

  describe('Test computed: options', () => {
    it('should return undefined when there are no date constraints', () => {
      expect(wrapper.vm.options).toBeUndefined();
    });

    it('should return undefined when all constraint refs are null', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: {} },
        },
      });

      expect(wrapper.vm.options).toBeUndefined();
    });

    it('should filter dates strictly after afterRef', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { afterDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.options('2026/01/02')).toBe(true);
      expect(wrapper.vm.options('2026/01/01')).toBe(false);
      expect(wrapper.vm.options('2025/12/31')).toBe(false);
    });

    it('should filter dates strictly before beforeRef', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMinDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { beforeDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.options('2025/12/31')).toBe(true);
      expect(wrapper.vm.options('2026/01/01')).toBe(false);
      expect(wrapper.vm.options('2026/01/02')).toBe(false);
    });

    it('should filter dates from fromRef inclusive', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { fromDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.options('2026/01/01')).toBe(true);
      expect(wrapper.vm.options('2026/01/02')).toBe(true);
      expect(wrapper.vm.options('2025/12/31')).toBe(false);
    });

    it('should filter dates up to upToRef inclusive', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-01T00:00:00.000Z' };
      mockMinDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { options: { upToDate: '2026/01/01' } },
        },
      });

      expect(wrapper.vm.options('2026/01/01')).toBe(true);
      expect(wrapper.vm.options('2025/12/31')).toBe(true);
      expect(wrapper.vm.options('2026/01/02')).toBe(false);
    });

    it('should combine multiple constraints with AND logic', async () => {
      const mockDayjsAfter = { toISOString: () => 'AFTER_ISO' };
      const mockDayjsBefore = { toISOString: () => 'BEFORE_ISO' };
      mockMaxDate.mockReturnValue(mockDayjsAfter);
      mockMinDate.mockReturnValue(mockDayjsBefore);
      mockFormatQDate.mockImplementation((isoString) => {
        if (isoString === 'AFTER_ISO') {
          return '2026/01/01';
        }
        if (isoString === 'BEFORE_ISO') {
          return '2026/06/01';
        }
        return '2026/01/01';
      });
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            options: { afterDate: '2026/01/01', beforeDate: '2026/06/01' },
          },
        },
      });

      expect(wrapper.vm.options('2026/03/15')).toBe(true);
      expect(wrapper.vm.options('2025/12/31')).toBe(false);
      expect(wrapper.vm.options('2026/07/01')).toBe(false);
    });

    it('should correctly filter cross-month boundary dates with DD/MM/YYYY mask', async () => {
      // afterDate = 31 Jan 2026 in DD/MM/YYYY; the predicate must accept 1 Feb 2026
      // even though '01/02/2026' < '31/01/2026' lexicographically.
      // toQDateFormat is expected to normalise the stored ref to YYYY/MM/DD so
      // the string comparison inside options() remains valid.
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      mockFormatQDate.mockReturnValue('31/01/2026');
      // Simulate toQDateFormat normalising DD/MM/YYYY → YYYY/MM/DD
      mockToQDateFormat.mockReturnValue('2026/01/31');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            options: { afterDate: '31/01/2026' },
          },
        },
      });

      // Quasar passes dates to options() in its internal YYYY/MM/DD format
      expect(wrapper.vm.options('2026/02/01')).toBe(true); // 1 Feb > 31 Jan
      expect(wrapper.vm.options('2026/01/31')).toBe(false); // equal to boundary
      expect(wrapper.vm.options('2025/12/31')).toBe(false); // before boundary
    });

    it('should pass the mask to toQDateFormat when building the options predicate with DD/MM/YYYY mask', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      mockFormatQDate.mockReturnValue('31/01/2026');
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            options: { afterDate: '31/01/2026' },
          },
        },
      });

      // Access options to trigger the lazy computed and the toQDateFormat call
      wrapper.vm.options('2026/01/01');

      expect(mockToQDateFormat).toHaveBeenCalledWith(
        '31/01/2026',
        'DD/MM/YYYY'
      );
    });
  });

  describe('Test function: updateValue', () => {
    it('should emit event', () => {
      wrapper.vm.localValue = '1990/01/05';

      wrapper.vm.updateValue();

      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '1990/01/05',
        },
      ]);
    });
  });

  describe('Test watch: entity', () => {
    it('should update localValue when entity attribute value changes', async () => {
      expect(wrapper.vm.localValue).toEqual('1990/01/01');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '2000/12/31',
        },
      });

      expect(wrapper.vm.localValue).toEqual('2000/12/31');
    });

    it('should set localValue to null when attribute is undefined', async () => {
      expect(wrapper.vm.localValue).toEqual('1990/01/01');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
        },
      });

      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should set localValue to null when attribute is null', async () => {
      expect(wrapper.vm.localValue).toEqual('1990/01/01');

      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: null,
        },
      });

      expect(wrapper.vm.localValue).toEqual(null);
    });

    it('should update localValue when entity reference changes', async () => {
      const newEntity = {
        name: 'updated-name',
        description: 'updated-description',
        type: 'updated-type',
        isAdmin: true,
        birthdate: '1985/06/15',
      };
      expect(wrapper.vm.localValue).toEqual('1990/01/01');

      await wrapper.setProps({ entity: newEntity });

      expect(wrapper.vm.localValue).toEqual('1985/06/15');
    });

    it('should not update localValue when another entity attribute changes', async () => {
      wrapper.vm.localValue = '01/01/2026';

      await wrapper.setProps({
        entity: {
          name: 'updated-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '1990/01/01',
        },
      });

      expect(wrapper.vm.localValue).toEqual('01/01/2026');
    });
  });
});
