# **Module Configuration 🔧**

This document provides a comprehensive guide for configuring the **module-import** remote module in your LinID application. It focuses on the options required to attach the import functionality to a parent module and configure CSV handling with templating.

---

## **📋 Overview**

The **module-import** module allows any parent module to support data import from CSV files. It provides:

- An **Import button** that can be placed in a configurable zone of the parent module
- A **page to upload and preview CSV files**
- **Mapping of CSV rows to entity properties using Nunjucks templates**
- Validation and submission of data to the parent module's API

All behavior is controlled via the parent module configuration.

---

## **⚙️ Required Configuration**

### **Module-Specific Options**

The module expects options defined in the `ModuleImportOptions` interface:

```ts
export interface ModuleImportOptions {
  /**
   * Parent module instance id.
   */
  parentInstanceId: string;
  /**
   * Mapping of final object keys to Nunjucks templates.
   * Key: property name in the resulting object
   * Value: Nunjucks template string using the CSV row as context
   */
  csvHeadersMapping: Record<string, string>;
  /**
   * Whether to validate the CSV headers against expectedColumns.
   * If true, the import page will check the CSV columns before processing.
   */
  useColumnMapping: boolean;
  /**
   * Optional list of expected CSV columns.
   * Used when `useColumnMapping` is true to validate the uploaded CSV.
   */
  expectedColumns?: string[];
  /**
   * Number of initial CSV lines to skip before processing.
   * Useful if your CSV contains extra metadata or description rows at the top.
   */
  skipFirstCsvNLines?: number;
  /**
   * Maximum number of parallel import requests to the API.
   */
  numberOfParallelImports: number;
  /**
   * Path to navigate back when the user clicks the "Cancel" or "Go Back" button.
   */
  previousPath: string;
}
```

| Option                    | Type                    | Required | Description                                                                                                                                                                                  |
|---------------------------|-------------------------| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `csvHeadersMapping`       | `Record<string,string>` | ✅ Yes   | Mapping from **final object keys** to **Nunjucks templates**. Each template uses the CSV row as context. Example: `{ "firstName": "{{ 'First Name'    \| safe }}", "email": "{{ Email }}" }` |
| `useColumnMapping`        | `boolean`               | ✅ Yes   | Whether to validate CSV headers before import                                                                                                                                                |
| `expectedColumns`         | `string[]`              | ❌ No    | List of expected CSV headers, used when `useColumnMapping` is true                                                                                                                           |
| `skipFirstCsvNLines`      | `number`                | ❌ No    | Number of CSV lines to skip at the beginning of the file                                                                                                                                     |
| `numberOfParallelImports` | `number`                | ✅ Yes   | Maximum number of import requests that can run in parallel                                                                                                                                   |
| `previousPath`            | `string`                | ✅ Yes   | Path to navigate back when the user clicks "Cancel" or "Go Back"                                                                                                                             |
| `zones`                   | `string[]`              | ✅ Yes   | List of zone identifiers where the "Go to Import Page" button should be displayed.                                                                                                           |

---

## **📝 Example Configuration**

```json
{
  "instanceId": "moduleImportUsers",
  "remoteName": "moduleImport",
  "apiEndpoint": "api/users",
  "basePath": "/users/import",
  "options": {
    "zones": ["moduleUsers.HomePage.extraButtons"],
    "type": "CSV",
    "csvHeadersMapping": {
      "firstName": "{{ 'First Name' }}",
      "lastName": "{{ 'Last Name' }}",
      "email": "{{ Email | lower }}",
      "active": "{{ true if Active == 'yes' else false }}"
    },
    "useColumnMapping": true,
    "expectedColumns": [
      "First Name",
      "Last Name",
      "Email",
      "Active"
    ],
    "skipFirstCsvNLines": 1,
    "numberOfParallelImports": 5,
    "previousPath": "/users"
  }
}
```

**Explanation:**

- `zones` links the import module to the **Users Module** homepage
- `csvHeadersMapping` defines how each property of the resulting object is generated from the CSV row using **Nunjucks templates**
- You can use any field from the CSV row in the template, with basic logic or formatting (e.g., lowercase, conditional, concatenation)
- `useColumnMapping` enables validation of CSV headers against `expectedColumns`
- `skipFirstCsvNLines` skips the first line of the CSV (useful for descriptions or comments)
- `numberOfParallelImports` allows multiple import requests to run concurrently for better performance
- `previousPath` specifies where the user is redirected when cancelling the import

---

## **✅ Best Practices**

- Ensure `zones` matches the exact instance id of the parent module and the zone name.
- Use meaningful final property names in `csvHeadersMapping`.
- Validate CSV rows and headers before import to prevent API errors.
- Leverage Nunjucks templating to transform CSV data into the exact structure expected by your backend API.
- Test templates with sample CSV rows to ensure correct mapping before enabling import.
