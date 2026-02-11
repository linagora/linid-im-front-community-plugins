# **Module Configuration 🔧**

This document provides a comprehensive guide for configuring the **module-import** remote module in your LinID application. It focuses on the options required to attach the import functionality to a parent module and configure CSV handling.

---

## **📋 Overview**

The **module-import** module allows any parent module to support data import from CSV files. It provides:

- An **Import button** that can be placed in a configurable zone of the parent module
- A **page to upload and preview CSV files**
- **Mapping of CSV columns to entity properties**
- Validation and submission of data to the parent module's API

All behavior is controlled via the parent module configuration.

---

## **⚙️ Required Configuration**

### **Module-Specific Options**

The module expects options defined in the `ModuleImportOptions` interface:

```typescript
export interface ModuleImportOptions {
  /**
   * Parent module instance id.
   */
  parentInstanceId: string;
  /**
   * Type of file to import.
   */
  type: 'CSV';
  /**
   * Indicates if the CSV has a header line.
   */
  hasHeaders: boolean;
  /**
   * List of all expected CSV header columns.
   */
  csvHeaders: string[];
  /**
   * Mapping of CSV headers to API property names.
   * Key: CSV header name
   * Value: API property name
   */
  csvHeadersMapping: Record<string, string>;
}
```

| Option              | Type                    | Required | Description                                                                          |
| ------------------- | ----------------------- | -------- | ------------------------------------------------------------------------------------ |
| `parentInstanceId`  | `string`                | ✅ Yes   | The instance id of the parent module to which this import module is attached         |
| `type`              | `'CSV'`                 | ✅ Yes   | Type of import supported. Currently, only CSV is supported                           |
| `hasHeaders`        | `boolean`               | ✅ Yes   | Indicates whether the CSV file contains a header row                                 |
| `csvHeaders`        | `string[]`              | ✅ Yes   | Array of expected CSV headers                                                        |
| `csvHeadersMapping` | `Record<string,string>` | ✅ Yes   | Mapping from CSV headers to API properties. Example: `{ "First Name": "firstName" }` |

---

## **📝 Example Configuration**

```json
{
  "instanceId": "moduleImportUsers",
  "remoteName": "moduleImport",
  "apiEndpoint": "api/users",
  "basePath": "/users/import",
  "options": {
    "parentInstanceId": "moduleUsers",
    "type": "CSV",
    "hasHeaders": true,
    "csvHeaders": ["First Name", "Last Name", "Email", "Active"],
    "csvHeadersMapping": {
      "First Name": "firstName",
      "Last Name": "lastName",
      "Email": "email",
      "Active": "active"
    }
  }
}
```

**Explanation:**

- `parentInstanceId` links the import module to the **Users Module**
- `csvHeaders` defines the columns expected in the CSV file
- `csvHeadersMapping` maps the CSV headers to the backend entity fields

---

## **✅ Best Practices**

- Ensure `parentInstanceId` matches the exact instance id of the parent module.
- Keep `csvHeaders` and `csvHeadersMapping` consistent with the backend API field names.
- Validate CSV files for correct headers before import to prevent API errors.
- Use meaningful CSV header names to improve user experience during preview.
