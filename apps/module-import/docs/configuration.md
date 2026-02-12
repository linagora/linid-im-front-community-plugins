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
   * Type of file to import.
   */
  type: 'CSV';
  /**
   * Mapping of final object keys to Nunjucks templates.
   * Key: property name in the resulting object
   * Value: Nunjucks template string using the CSV row as context
   */
  csvHeadersMapping: Record<string, string>;
}
```

| Option              | Type                    | Required | Description                                                                                                                                        |                                     |
| ------------------- | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `parentInstanceId`  | `string`                | ✅ Yes   | The instance id of the parent module to which this import module is attached                                                                       |                                     |
| `type`              | `'CSV'`                 | ✅ Yes   | Type of import supported. Currently, only CSV is supported                                                                                         |                                     |
| `csvHeadersMapping` | `Record<string,string>` | ✅ Yes   | Mapping from **final object keys** to **Nunjucks templates**. Each template uses the CSV row as context. Example: `{ "firstName": "{{ 'First Name' | safe }}", "email": "{{ Email }}" }` |

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
    "csvHeadersMapping": {
      "firstName": "{{ 'First Name' }}",
      "lastName": "{{ 'Last Name' }}",
      "email": "{{ Email | lower }}",
      "active": "{{ true if Active == 'yes' else false }}"
    }
  }
}
```

**Explanation:**

- `parentInstanceId` links the import module to the **Users Module**
- `csvHeadersMapping` defines how each property of the resulting object is generated from the CSV row using **Nunjucks templates**
- You can use any field from the CSV row in the template, with basic logic or formatting (e.g., lowercase, conditional, concatenation)

---

## **✅ Best Practices**

- Ensure `parentInstanceId` matches the exact instance id of the parent module.
- Use meaningful final property names in `csvHeadersMapping`.
- Validate CSV rows and headers before import to prevent API errors.
- Leverage Nunjucks templating to transform CSV data into the exact structure expected by your backend API.
- Test templates with sample CSV rows to ensure correct mapping before enabling import.
