declare module 'papaparse' {
  /**
   * Result object returned after a parsing operation.
   *
   * @typeParam T - The inferred row type. When `header: true`, this is typically
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
     * Typically includes information such as detected delimiter,
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
   *
   * @typeParam T - The expected row type in the resulting data.
   */
  export interface ParseConfig<T = unknown> {
    /**
     * If true, the first row is treated as a header row and used
     * to generate object keys for each parsed row.
     *
     * @default false
     */
    header?: boolean;

    /**
     * If true, empty lines in the input are skipped.
     *
     * @default false
     */
    skipEmptyLines?: boolean;

    /**
     * Callback executed when parsing completes successfully.
     *
     * @param results - The full parsing result, including data,
     * errors, and metadata.
     */
    complete?: (results: ParseResult<T>) => void;

    /**
     * Callback executed when a fatal error occurs during parsing.
     *
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
   * - Browser `Blob`
   *
   * Parsing is asynchronous when used with File/Blob inputs.
   *
   * @typeParam T - The inferred row type of the parsed data.
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
     *
     * @see parse
     */
    parse: typeof parse;
  };

  export default Papa;
}
