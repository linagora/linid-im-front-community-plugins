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
   * List of zone identifiers where the "Go to Import Page" button should be displayed.
   *
   * Each entry represents the name of a UI zone in which
   * the import navigation action will be injected.
   */
  zones: string[];
  /**
   * Mapping of final object keys to Nunjucks templates.
   * Key: property name in the resulting object
   * Value: Nunjucks template string using the CSV row as context
   */
  fieldMappingTemplates: Record<string, string>;
  /**
   * When enabled, the importer ignores CSV header names and maps values based on predefined column indexes.
   */
  useColumnIndexParsing: boolean;
  /**
   * List of CSV header names that must be present in the file. Used only when useColumnIndexParsing is true.
   */
  expectedCsvHeaders?: string[];
  /**
   * Number of initial CSV lines to skip before processing.
   * Useful if your CSV contains extra metadata or description rows at the top.
   */
  skipFirstCsvNLines: number;
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

| Option                    | Type                    | Required | Description                                                                                                                                                                             |
| ------------------------- | ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fieldMappingTemplates`   | `Record<string,string>` | ✅ Yes   | Maps target object field names to Nunjucks templates. Each template is evaluated using the current CSV row as context and produces the final value assigned to the corresponding field. |
| `useColumnIndexParsing`   | `boolean`               | ✅ Yes   | When enabled, the importer ignores CSV header names and maps values based on predefined column indexes.                                                                                 |
| `expectedCsvHeaders`      | `string[]`              | ❌ No    | List of CSV header names that must be present in the file. Used only when useColumnIndexParsing is true.                                                                                |
| `skipFirstCsvNLines`      | `number`                | ✅ Yes   | Number of CSV lines to skip at the beginning of the file                                                                                                                                |
| `numberOfParallelImports` | `number`                | ✅ Yes   | Maximum number of import requests that can run in parallel                                                                                                                              |
| `previousPath`            | `string`                | ✅ Yes   | Path to navigate back when the user clicks "Cancel" or "Go Back"                                                                                                                        |
| `zones`                   | `string[]`              | ✅ Yes   | List of zone identifiers where the "Go to Import Page" button should be displayed.                                                                                                      |

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
    "fieldMappingTemplates": {
      "firstName": "{{ 'First Name' }}",
      "lastName": "{{ 'Last Name' }}",
      "email": "{{ Email | lower }}",
      "active": "{{ true if Active == 'yes' else false }}"
    },
    "useColumnIndexParsing": true,
    "expectedCsvHeaders": ["First Name", "Last Name", "Email", "Active"],
    "skipFirstCsvNLines": 1,
    "numberOfParallelImports": 5,
    "previousPath": "/users"
  }
}
```

**Explanation:**

- `zones` links the import module to the **Users Module** homepage
- `fieldMappingTemplates` defines how each property of the resulting object is generated from the CSV row using **Nunjucks templates**
- You can use any field from the CSV row in the template, with basic logic or formatting (e.g., lowercase, conditional, concatenation)
- `useColumnIndexParsing` When enabled, the importer ignores CSV header names and maps values based on predefined column indexes.
- `skipFirstCsvNLines` skips the first line of the CSV (useful for descriptions or comments)
- `numberOfParallelImports` allows multiple import requests to run concurrently for better performance
- `previousPath` specifies where the user is redirected when cancelling the import

---

## **✅ Best Practices**

- Ensure `zones` matches the exact instance id of the parent module and the zone name.
- Use meaningful final property names in `fieldMappingTemplates`.
- Validate CSV rows and headers before import to prevent API errors.
- Leverage Nunjucks templating to transform CSV data into the exact structure expected by your backend API.
- Test templates with sample CSV rows to ensure correct mapping before enabling import.
