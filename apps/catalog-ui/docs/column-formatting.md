# **Column Formatting**

## **GenericTableColumn**

Each column definition can be enhanced with optional formatting properties:

```ts
interface GenericTableColumn extends QTableColumn {
  /**
   * The formatter function name to be used for this column.
   */
  formatter?: string;
  /**
   * Options to be passed to the formatter function.
   */
  formatOptions?: Record<string, unknown>;
}
```

## **Date Formatting**

To format date values in table cells, use the `formatter` and `formatOptions` properties:

1. Set `formatter: string` on your column definition to enable date formatting
2. Provide `formatOptions` with a `formatKey` property that resolves to a translation key against the **global i18n scope** (from corelib's `useCommonMapper`, which uses `useI18n()`, not the component's scoped i18n)
3. The translation key should resolve to a dayjs-compatible format string
4. The cell value will automatically be formatted when data is displayed

### **Supported Formatters**

Currently, only the following formatter is available:

- **`toDate`** — Formats date/datetime values using a dayjs-compatible format string from a translation key.
  (Returns an empty string when the value cannot be parsed, so malformed dates render as blank cells rather than displaying the raw value.)

In the future, additional formatters may be implemented to support other data types.

### **Example i18n Configuration**

```json
{
  "application": {
    "dateTimeFormat": "DD/MM/YYYY HH:mm:ss",
    "dateFormat": "DD/MM/YYYY"
  }
}
```
