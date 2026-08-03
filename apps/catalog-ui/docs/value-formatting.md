# **Value Formatting**

Column and field definitions can be enhanced with optional formatting properties, contributed by corelib's
`FormatterConfiguration`:

```ts
// from @linagora/linid-im-front-corelib
interface FormatterConfiguration {
  /** Formatter applied to the value before display. An unknown name displays the raw value. */
  formatter?: string;
  /** Options forwarded to the formatter. */
  formatOptions?: Record<string, unknown>;
}
```

Formatters are referenced by name, never by function reference, so definitions stay serializable in the JSON module options.

## **Where it applies**

Two definition types mix `FormatterConfiguration` in, depending on whether the component renders a table or a list:

```ts
// src/types/ModuleGenericTablePageOptions.ts — table columns
interface GenericTableColumn extends QTableColumn, FormatterConfiguration {}

// src/types/genericSortableListCard.ts — sortable list fields
interface GenericListField extends FormatterConfiguration {
  name: string;
  label: string;
}
```

| Component                  | Prop      | Definition type      | Formats through                        |
| -------------------------- | --------- | -------------------- | -------------------------------------- |
| `GenericEntityTable`       | `columns` | `GenericTableColumn` | Quasar's native `format` on the column |
| `GenericEditableTableCard` | `columns` | `GenericTableColumn` | Forwarded to `GenericEntityTable`      |
| `GenericTablePage`         | options   | `GenericTableColumn` | Forwarded to `GenericEntityTable`      |
| `GenericSortableListCard`  | `fields`  | `GenericListField`   | Applied directly when rendering a cell |

The value being formatted is read from the row or item under the column `field` (table) or the field `name`
(sortable list).

## **Date Formatting**

To format date values, use the `formatter` and `formatOptions` properties:

1. Set `formatter: 'toDate'` on your column or field definition to enable date formatting
2. Provide `formatOptions` with a `formatKey` property that resolves to a translation key against the **global i18n scope** (corelib's `useValueFormatter` delegates to `useCommonMapper().toDate`, which uses `useI18n()`, not the component's scoped i18n)
3. The translation key should resolve to a dayjs-compatible format string
4. The cell value will automatically be formatted when data is displayed

`formatKey` is a translation **key**, not a format string: `'application.dateFormat'` is correct, `'DD/MM/YYYY'` is not.

### **Supported Formatters**

Currently, only the following formatter is available:

- **`toDate`** — Formats date/datetime values using a dayjs-compatible format string from a translation key.
  (Returns an empty string when the value cannot be parsed, so malformed dates render as blank cells rather than displaying the raw value.)

The registry lives in corelib: adding a formatter is a corelib change, and it becomes available to every generic component at once. Nullish values, unknown formatter names and missing options are returned unchanged rather than throwing.

### **Example i18n Configuration**

```json
{
  "application": {
    "dateTimeFormat": "DD/MM/YYYY HH:mm:ss",
    "dateFormat": "DD/MM/YYYY"
  }
}
```
