<!--
  Copyright (C) 2026 Linagora

  This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
  Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
  any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
  LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
  which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
  of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
  Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
  sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
  as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
  and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
  intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
  <http://www.linagora.com/licenses/> for more details.

  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
  details.

  You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
  LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
  General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
  LinID Identity Manager software.
-->

<template>
  <!-- v8 ignore start -->
  <q-file
    v-model="files"
    :loading="isLoading"
    v-bind="uiProps"
    :label="translateOrDefault('', 'label')"
    :counter-label="(opt) => translateOrDefault('', 'counter-label', opt)"
    :hint="translateOrDefault('', 'hint')"
    :prefix="translateOrDefault('', 'prefix')"
    :suffix="translateOrDefault('', 'suffix')"
    class="load-files-field"
    multiple
    clearable
    data-cy="field_import_files"
  />
  <!-- v8 ignore stop -->
</template>

<script setup lang="ts">
import type { LinidQFileProps } from '@linagora/linid-im-front-corelib';
import {
  useNotify,
  useNunjucks,
  useScopedI18n,
  useUiDesign,
} from '@linagora/linid-im-front-corelib';
import type { ParseError, ParseResult } from 'papaparse';
import Papa from 'papaparse';
import { ref, watch } from 'vue';
import type { ImportedData } from '../../types/importedDataTable';
import type {
  LoadFilesFieldOutputs,
  LoadFilesFieldProps,
} from '../../types/loadFilesField';

const props = defineProps<LoadFilesFieldProps>();
const emit = defineEmits<LoadFilesFieldOutputs>();

const { t, translateOrDefault } = useScopedI18n(
  `${props.i18nScope}.LoadFilesField`
);
const { ui } = useUiDesign();
const { Notify } = useNotify();
const { renderString } = useNunjucks();

const files = ref<File[] | null>(null);
const isLoading = ref(false);
const uiProps = ui<LinidQFileProps>(
  `${props.uiNamespace}.load-files-field`,
  'q-file'
);

let id = 0;

watch(
  files,
  async (list) => {
    if (list && list.length > 0) {
      await loadFiles(Array.from(list));
    }
  },
  { deep: true }
);

/**
 * Loads and parses multiple CSV files, transforms their content,
 * and emits the normalized data to the parent component.
 *
 * Each file is parsed asynchronously. The resulting rows from all files
 * are flattened into a single array, mapped to the internal `ImportedData`
 * structure, and assigned a unique incremental identifier and an initial
 * `READY` status.
 *
 * The `isLoading` reactive flag is set to `true` while processing
 * and reset to `false` when finished.
 * @param files - An array of File objects representing CSV files to import.
 * @returns A Promise that resolves once all files have been parsed
 *          and the processed data has been emitted.
 */
function loadFiles(files: File[]): Promise<void> {
  isLoading.value = true;
  id = 0;

  return Promise.all(files.map(parseCsv))
    .then((data: ImportedData[][]) => {
      const result = data.flat();

      emit('update:data', result);

      if (result.length === 0) {
        return Notify({
          type: 'warning',
          message: t('loadEmpty'),
          attrs: {
            'data-cy': 'notify_load_warning',
          },
        });
      }

      Notify({
        type: 'positive',
        message: t('loadSuccess'),
        attrs: {
          'data-cy': 'notify_load_success',
        },
      });
    })
    .catch(() => {
      Notify({
        type: 'negative',
        message: t('loadError'),
        attrs: {
          'data-cy': 'notify_load_error',
        },
      });
    })
    .finally(() => {
      isLoading.value = false;
    });
}

/**
 * Parses a CSV file using the strategy defined in the parsing options.
 *
 * If `useColumnIndexParsing` is enabled, the file is parsed using positional
 * column mapping (`parseCsvWithColumnIndex`). Otherwise, header-based parsing
 * (`parseCsvWithHeader`) is used.
 * @param file - The CSV file to parse.
 * @returns A Promise that resolves with an array of `ImportedData`
 *          objects representing the parsed and normalized rows.
 */
function parseCsv(file: File): Promise<ImportedData[]> {
  if (props.parsingOptions.useColumnIndexParsing) {
    return parseCsvWithColumnIndex(file);
  }

  return parseCsvWithHeader(file);
}

/**
 * Parses a single CSV file without header using PapaParse, mapping each column
 * to the `expectedCsvHeaders` entry at the same index.
 *
 * If any parsing errors occur, the returned Promise is rejected
 * with a `ParseError` or an array of `ParseError`s.
 *
 * Each row is mapped using `mapItem()` and assigned:
 * - `__status` = 'READY'
 * - `__id` = unique incremental identifier
 * - `__file` = original file name.
 * @param file - The CSV file to parse.
 * @returns A Promise that resolves with an array of `ImportedData` objects
 *          for the parsed rows.
 */
function parseCsvWithColumnIndex(file: File): Promise<ImportedData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      skipFirstNLines: props.parsingOptions.skipFirstCsvNLines,
      complete: (results: ParseResult<string[]>) => {
        if (results.errors && results.errors.length > 0) {
          reject(results.errors);
          return;
        }

        resolve(
          results.data.map((item: string[]) => ({
            __status: 'READY',
            __id: ++id,
            __file: file.name,
            ...mapItem(mapItemByIndex(item)),
          }))
        );
      },
      error: (error: ParseError) => {
        reject(error);
      },
    });
  });
}

/**
 * Parses a single CSV file using PapaParse and returns the rows
 * as an array of `ImportedData` objects.
 *
 * The parser is configured to:
 * - Treat the first row as headers (`header: true`)
 * - Skip empty lines (`skipEmptyLines: true`).
 *
 * If any parsing errors occur, the returned Promise is rejected
 * with a `ParseError` or an array of `ParseError`s.
 *
 * Each row is mapped using `mapItem()` and assigned:
 * - `__status` = 'READY'
 * - `__id` = unique incremental identifier
 * - `__file` = original file name.
 * @param file - The CSV file to parse.
 * @returns A Promise that resolves with an array of `ImportedData` objects
 *          for the parsed rows.
 */
function parseCsvWithHeader(file: File): Promise<ImportedData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      skipFirstNLines: props.parsingOptions.skipFirstCsvNLines - 1,
      complete: (results: ParseResult<Record<string, unknown>>) => {
        if (results.errors && results.errors.length > 0) {
          reject(results.errors);
          return;
        }

        resolve(
          results.data.map((item: Record<string, unknown>) => ({
            __status: 'READY',
            __id: ++id,
            __file: file.name,
            ...mapItem(item),
          }))
        );
      },
      error: (error: ParseError) => {
        reject(error);
      },
    });
  });
}

/**
 * Maps a parsed CSV row to a normalized object based on the
 * configured field mapping.
 *
 * For each key in `fieldMappingTemplates`, a template string is
 * rendered using Nunjucks, with the original row data as context.
 * @param item - A single parsed CSV row represented as a key-value object.
 * @returns A new object containing the mapped and rendered properties
 *          according to `fieldMappingTemplates`.
 */
function mapItem(item: Record<string, unknown>): Record<string, unknown> {
  const { fieldMappingTemplates } = props.parsingOptions;

  return Object.fromEntries(
    Object.keys(fieldMappingTemplates).map((key) => [
      key,
      renderString(fieldMappingTemplates[key], item),
    ])
  );
}

/**
 * Maps a CSV row represented as a string array (column-based parsing)
 * to an object keyed by the configured `expectedCsvHeaders`.
 *
 * Each column value is assigned to the corresponding property name
 * defined in `expectedCsvHeaders`, based on its index.
 * If `expectedCsvHeaders` is undefined, an empty object is returned.
 * @param item - A single parsed CSV row represented as an array of string values.
 * @returns An object mapping expected column names to their corresponding values.
 */
function mapItemByIndex(item: string[]): Record<string, unknown> {
  return Object.fromEntries(
    (props.parsingOptions.expectedCsvHeaders ?? []).map((name, index) => [
      name,
      item[index],
    ])
  );
}
</script>
