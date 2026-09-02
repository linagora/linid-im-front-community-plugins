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
const mockFormatDate = vi.fn((date) => date);
const mockValidDate = vi.fn(() => vi.fn(() => true));
const mockRequired = vi.fn();
const mockAfterDate = vi.fn(() => vi.fn());
const mockBeforeDate = vi.fn(() => vi.fn());
const mockFromDate = vi.fn(() => vi.fn());
const mockUpToDate = vi.fn(() => vi.fn());
const mockValidateFromApi = vi.fn(() => vi.fn());
const mockTranslateOrDefault = vi.fn((defaultValue) => defaultValue);
const mockGlobalTe = vi.fn(() => false);

vi.mock('@linagora/linid-im-front-corelib', async () => {
  const { getNestedValue, setNestedValue } = await vi.importActual(
    '@linagora/linid-im-front-corelib'
  );
  return {
    getNestedValue,
    setNestedValue,
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
    useCommonMapper: () => ({
      formatDate: mockFormatDate,
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
  };
});

describe('Test component: EntityAttributeDateField', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatDate.mockImplementation((date) => date);
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

  describe('Test computed: valueFormat', () => {
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

      expect(wrapper.vm.valueFormat).toEqual('YYYY/MM/DD');
    });

    it('should resolve to QDATE_DEFAULT_MASK when valueFormat and valueFormatI18NKey are not defined', () => {
      expect(wrapper.vm.valueFormat).toEqual('YYYY/MM/DD');
      expect(mockGlobalTe).toHaveBeenCalledWith(undefined);
    });

    it('should resolve to QDATE_DEFAULT_MASK when valueFormat is null', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { valueFormat: null },
        },
      });

      expect(wrapper.vm.valueFormat).toEqual('YYYY/MM/DD');
    });

    it('should resolve to QDATE_DEFAULT_MASK when valueFormat is an empty string', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { valueFormat: '' },
        },
      });

      expect(wrapper.vm.valueFormat).toEqual('YYYY/MM/DD');
    });

    it('should use the static valueFormat as the resolved value when valueFormatI18NKey does not resolve via te', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { valueFormat: 'YYYY-MM-DD' },
        },
      });

      expect(wrapper.vm.valueFormat).toEqual('YYYY-MM-DD');
    });

    it('should call te with the configured valueFormatI18NKey and keep the static valueFormat when te returns false', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            valueFormat: 'YYYY-MM-DD',
            valueFormatI18NKey: 'global.internalDateFormat',
          },
        },
      });

      expect(mockGlobalTe).toHaveBeenCalledWith('global.internalDateFormat');
      expect(wrapper.vm.valueFormat).toEqual('YYYY-MM-DD');
    });

    it('should return the globally translated value when valueFormatI18NKey resolves via te', async () => {
      mockGlobalTe.mockImplementation(
        (key) => key === 'global.internalDateFormat'
      );
      mockGlobalT.mockImplementation((key) =>
        key === 'global.internalDateFormat' ? 'DD-MM-YYYY' : key
      );
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            valueFormat: 'YYYY-MM-DD',
            valueFormatI18NKey: 'global.internalDateFormat',
          },
        },
      });

      expect(wrapper.vm.valueFormat).toEqual('DD-MM-YYYY');
      expect(mockGlobalT).toHaveBeenCalledWith('global.internalDateFormat');
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
          name: 'birthdate',
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
          name: 'birthdate',
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
          name: 'birthdate',
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
          name: 'birthdate',
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
          name: 'birthdate',
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
          name: 'birthdate',
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
      mockFormatDate.mockReturnValue('31/01/2026');
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

    it('should convert the constraint date ref from valueFormat to mask when the two formats differ', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            valueFormat: 'YYYY-MM-DD',
            options: { afterDate: '2026-01-31' },
          },
        },
      });

      // computeRef formats the aggregated Dayjs result using valueFormat
      expect(mockFormatDate).toHaveBeenCalledWith(
        '2026-01-31T00:00:00.000Z',
        'YYYY-MM-DD'
      );
      // the rules computed then converts that valueFormat-formatted ref to the display mask
      expect(mockFormatDate).toHaveBeenCalledWith(
        expect.any(String),
        'DD/MM/YYYY',
        'YYYY-MM-DD'
      );
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

      expect(wrapper.vm.dateConstraints[0].dateRef).toEqual(
        '2026-01-01T00:00:00.000Z'
      );
    });

    it('should pass the valueFormat to the aggregate and to formatDate with DD/MM/YYYY mask', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
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

      expect(mockMaxDate).toHaveBeenCalledWith(['31/01/2026'], 'YYYY/MM/DD');
      expect(mockFormatDate).toHaveBeenCalledWith(
        '2026-01-31T00:00:00.000Z',
        'YYYY/MM/DD'
      );
      expect(wrapper.vm.dateConstraints[0].dateRef).toEqual(
        '2026-01-31T00:00:00.000Z'
      );
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
      mockFormatDate.mockReturnValue('2026/01/01');
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
      mockFormatDate.mockReturnValue('2026/01/01');
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
      mockFormatDate.mockReturnValue('2026/01/01');
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
      mockFormatDate.mockReturnValue('2026/01/01');
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
      mockFormatDate.mockImplementation((value, outputFormat, inputFormat) => {
        // computeRef's call (2 args): pass the ISO sentinel through unchanged
        if (inputFormat === undefined) {
          return value;
        }
        // options' call (3 args): resolve the sentinel to the final ref
        if (value === 'AFTER_ISO') {
          return '2026/01/01';
        }
        if (value === 'BEFORE_ISO') {
          return '2026/06/01';
        }
        return value;
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
      // formatDate is expected to normalise the stored ref to YYYY/MM/DD so
      // the string comparison inside options() remains valid.
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      // Simulate formatDate normalising DD/MM/YYYY → YYYY/MM/DD
      mockFormatDate.mockReturnValue('2026/01/31');
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

    it('should pass the mask and valueFormat to formatDate when building the options predicate with differing formats', async () => {
      const mockDayjsResult = { toISOString: () => '2026-01-31T00:00:00.000Z' };
      mockMaxDate.mockReturnValue(mockDayjsResult);
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {
            mask: 'DD/MM/YYYY',
            valueFormat: 'YYYY-MM-DD',
            options: { afterDate: '2026-01-31' },
          },
        },
      });

      // Access options to trigger the lazy computed and the formatDate call
      wrapper.vm.options('2026/01/01');

      expect(mockFormatDate).toHaveBeenCalledWith(
        '2026-01-31T00:00:00.000Z',
        'DD/MM/YYYY',
        'YYYY-MM-DD'
      );
    });
  });

  describe('Test function: updateValueFromInput', () => {
    it('should emit event', () => {
      wrapper.vm.updateValueFromInput('1990/01/05');

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

    it('should convert the input value from mask to valueFormat when the two formats differ', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { mask: 'DD/MM/YYYY', valueFormat: 'YYYY-MM-DD' },
        },
      });

      wrapper.vm.updateValueFromInput('05/01/1990');

      expect(mockFormatDate).toHaveBeenCalledWith(
        '05/01/1990',
        'YYYY-MM-DD',
        'DD/MM/YYYY'
      );
    });

    it('should not emit event when the input value is an incomplete date not matching the mask', () => {
      mockValidDate.mockReturnValueOnce(vi.fn(() => 'validation.invalidDate'));

      wrapper.vm.updateValueFromInput('1990/01/0');

      expect(wrapper.emitted('update:entity')).toBeFalsy();
    });

    it('should emit event with an empty value when the input is cleared', () => {
      wrapper.vm.updateValueFromInput('');

      expect(wrapper.emitted('update:entity')).toBeTruthy();
      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '',
        },
      ]);
    });
  });

  describe('Test function: updateValueFromPicker', () => {
    it('should emit event', () => {
      wrapper.vm.updateValueFromPicker('1990/01/05');

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

    it('should convert the picker value from mask to valueFormat when the two formats differ', async () => {
      await wrapper.setProps({
        definition: {
          name: 'birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: { mask: 'DD/MM/YYYY', valueFormat: 'YYYY-MM-DD' },
        },
      });

      wrapper.vm.updateValueFromPicker('05/01/1990');

      expect(mockFormatDate).toHaveBeenCalledWith(
        '05/01/1990',
        'YYYY-MM-DD',
        'DD/MM/YYYY'
      );
    });
  });

  describe('Test reactivity: displayValue', () => {
    it('should initialize displayValue from entity attribute', () => {
      expect(wrapper.vm.displayValue).toEqual('1990/01/01');
    });

    it('should sync displayValue when the entity attribute value changes externally', async () => {
      await wrapper.setProps({
        entity: {
          name: 'entity-name',
          description: 'entity-description',
          type: 'entity-type',
          isAdmin: false,
          birthdate: '2000/12/31',
        },
      });

      expect(wrapper.vm.displayValue).toEqual('2000/12/31');
    });

    it('should initialize displayValue to empty string when attribute is undefined', async () => {
      const newWrapper = shallowMount(EntityAttributeDateField, {
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

      expect(newWrapper.vm.displayValue).toEqual('');
    });

    it('should initialize displayValue to empty string when attribute is null', async () => {
      const newWrapper = shallowMount(EntityAttributeDateField, {
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
            birthdate: null,
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

      expect(newWrapper.vm.displayValue).toEqual('');
    });

    it('should update displayValue when entity reference changes', async () => {
      const newEntity = {
        name: 'updated-name',
        description: 'updated-description',
        type: 'updated-type',
        isAdmin: true,
        birthdate: '1985/06/15',
      };

      const newWrapper = shallowMount(EntityAttributeDateField, {
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
          entity: newEntity,
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

      expect(newWrapper.vm.displayValue).toEqual('1985/06/15');
    });
  });

  describe('Test nested attributes', () => {
    beforeEach(async () => {
      await wrapper.setProps({
        definition: {
          name: 'extraParameters.birthdate',
          type: 'Date',
          required: false,
          hasValidations: false,
          input: 'Date',
          inputSettings: {},
        },
        entity: {
          name: 'entity-name',
          extraParameters: { birthdate: '1990/01/01', role: 'admin' },
        },
      });
    });

    it('should read the value from the nested path', () => {
      const newWrapper = shallowMount(EntityAttributeDateField, {
        props: {
          uiNamespace: 'namespace',
          instanceId: 'id',
          definition: {
            name: 'extraParameters.birthdate',
            type: 'Date',
            required: false,
            hasValidations: false,
            input: 'Date',
            inputSettings: {},
          },
          entity: {
            name: 'entity-name',
            extraParameters: { birthdate: '1990/01/01', role: 'admin' },
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

      expect(newWrapper.vm.displayValue).toEqual('1990/01/01');
    });

    it('should emit the complete entity with only the nested value updated', () => {
      wrapper.vm.updateValueFromInput('1990/01/05');

      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          extraParameters: { birthdate: '1990/01/05', role: 'admin' },
        },
      ]);
    });

    it('should create missing intermediate objects when updating', async () => {
      await wrapper.setProps({ entity: { name: 'entity-name' } });

      wrapper.vm.updateValueFromInput('1990/01/05');

      expect(wrapper.emitted('update:entity')[0]).toEqual([
        {
          name: 'entity-name',
          extraParameters: { birthdate: '1990/01/05' },
        },
      ]);
    });

    it('should read nested value from updated entity reference', async () => {
      const newEntity = {
        name: 'entity-name',
        extraParameters: { birthdate: '2000/12/31', role: 'user' },
      };

      const newWrapper = shallowMount(EntityAttributeDateField, {
        props: {
          uiNamespace: 'namespace',
          instanceId: 'id',
          definition: {
            name: 'extraParameters.birthdate',
            type: 'Date',
            required: false,
            hasValidations: false,
            input: 'Date',
            inputSettings: {},
          },
          entity: newEntity,
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

      expect(newWrapper.vm.displayValue).toEqual('2000/12/31');
    });
  });
});
