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

declare module 'papaparse' {
  /**
   * Result object returned after a parsing operation.
   * @template T - The inferred row type. When `header: true`, this is typically
   * a key-value object. Otherwise, it is usually `string[]`.
   */
  export interface ParseResult<T> {
    /**
     * Parsed rows.
     *
     * - If `header: true`, each row is an object keyed by column name.
     * - If `header: false` or omitted, each row is an array of strings.
     */
    data: T[];

    /**
     * List of non-fatal parsing errors encountered during processing.
     * Parsing may still succeed even if errors are present.
     */
    errors: ParseError[];

    /**
     * Metadata about the parsing process.
     * Typically, includes information such as detected delimiter,
     * linebreak type, aborted state, and field count.
     */
    meta: unknown;
  }

  /**
   * Describes an error encountered during CSV parsing.
   */
  export interface ParseError {
    /**
     * High-level category of the error (e.g. "Quotes", "Delimiter", "FieldMismatch").
     */
    type: string;

    /**
     * Machine-readable error code.
     */
    code: string;

    /**
     * Human-readable error message describing the issue.
     */
    message: string;

    /**
     * Row index (0-based) where the error occurred, if applicable.
     */
    row?: number;
  }

  /**
   * Configuration options for the CSV parser.
   * @template T - The expected row type in the resulting data.
   */
  export interface ParseConfig<T = unknown> {
    /**
     * If true, the first row is treated as a header row and used
     * to generate object keys for each parsed row.
     * @default false
     */
    header?: boolean;

    /**
     * If true, empty lines in the input are skipped.
     * @default false
     */
    skipEmptyLines?: boolean;

    /**
     * Callback executed when parsing completes successfully.
     * @param results - The full parsing result, including data,
     * errors, and metadata.
     */
    complete?: (results: ParseResult<T>) => void;

    /**
     * Callback executed when a fatal error occurs during parsing.
     * @param error - The error encountered.
     */
    error?: (error: ParseError) => void;
  }

  /**
   * Parses CSV input.
   *
   * Supports:
   * - Raw CSV string input
   * - Browser `File`
   * - Browser `Blob`.
   *
   * Parsing is asynchronous when used with File/Blob inputs.
   * @template T - The inferred row type of the parsed data.
   * @param input - The CSV source to parse.
   * @param config - Optional parsing configuration.
   */
  export function parse<T = unknown>(
    input: string | File | Blob,
    config?: ParseConfig<T>
  ): void;

  /**
   * Default PapaParse export object.
   */
  const Papa: {
    /**
     * Parses CSV input using the provided configuration.
     * @see parse
     */
    parse: typeof parse;
  };

  export default Papa;
}
