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

/**
 * Options for the ModuleImport remote module.
 */
export interface ModuleImportOptions {
  /**
   * List of zone identifiers where the "Go to Import Page" button should be displayed.
   *
   * Each entry represents the name of a UI zone in which
   * the import navigation action will be injected.
   */
  zones: string[];
  /**
   * Path to navigate back when the user clicks the "Cancel" or "Go Back" button.
   * Typically points to the parent or previous page of the import module.
   */
  previousPath: string;
  /**
   * Mapping csv header to api properties.
   */
  csvHeadersMapping: Record<string, string>;
  /**
   * Whether to apply column mapping when parsing CSV files.
   * When true, headers from the CSV are mapped to internal field names.
   */
  useColumnMapping: boolean;
  /**
   * Optional list of expected column names in the CSV.
   * Can be used to validate that the CSV contains all required columns.
   */
  expectedColumns?: string[];
  /**
   * Number of lines to skip at the beginning of the CSV file.
   * Useful when the CSV contains metadata or comments before the header row.
   */
  skipFirstCsvNLines?: number;
  /**
   * Maximum number of CSV rows to import concurrently.
   * Limits parallel processing to prevent overloading the server.
   */
  numberOfParallelImports: number;
}
