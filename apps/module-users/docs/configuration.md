# **Module Configuration 🔧**

This document provides a comprehensive guide for configuring the **module-users** remote module in your LinID application. It covers all required and optional configuration parameters, integration with the host application, and best practices.

---

## **📋 Overview**

The **module-users** module is a remote module that provides user management functionality including:

- **User listing and search** with optional advanced filters
- **User detail view** with configurable field ordering
- **User creation** with multi-section forms (accessible via a "Create" button on the HomePage)
- **User editing** with multi-section forms and change detection

To integrate this module into your application, you need to configure it in your host application's module configuration.

---

## **⚙️ Required Configuration**

### **Basic Module Configuration**

Every module requires the following core configuration parameters:

| Parameter     | Type     | Description                                                 | Example         |
| ------------- | -------- | ----------------------------------------------------------- | --------------- |
| `instanceId`  | `string` | Unique identifier for this module instance                  | `'moduleUsers'` |
| `remoteName`  | `string` | Name of the remote module (must match the federated module) | `'moduleUsers'` |
| `apiEndpoint` | `string` | API endpoint for user data operations                       | `'api/users'`   |
| `basePath`    | `string` | Base path for the module routes                             | `'/users'`      |

### **Module-Specific Options**

The module requires specific options defined in the `ModuleUsersOptions` interface:

```typescript
export interface ModuleUsersOptions {
  /**
   * The key used to identify users in routes and data.
   */
  userIdKey: string;
  /**
   * The columns configuration for the user table.
   * Each column should follow Quasar's QTableColumn definition.
   */
  userTableColumns: QTableColumn[];
  /**
   * Ordered list of user attribute names to display first in the details card.
   * The order of this array defines the display order.
   */
  fieldOrder: string[];
  /**
   * Indicates whether user attributes not listed in `fieldOrder`
   * should also be displayed after the ordered fields in the details card.
   * @default false
   */
  showRemainingFields?: boolean;
  /**
   * Configuration for the advanced search feature.
   * Enables the AdvancedSearchCard on the HomePage.
   */
  advancedSearch: AdvancedSearchConfiguration;
  /**
   * Configuration for edit/create forms with sections and field ordering.
   * Defines how fields are grouped and ordered in the forms.
   */
  formSections: FormSection[];
}

export interface AdvancedSearchConfiguration {
  /**
   * List of field definitions available for filtering.
   */
  fields: LinidAttributeConfiguration[];
  /**
   * Names of fields to display in the default (always visible) section.
   */
  defaultFieldsNames: string[];
  /**
   * Names of fields to display in the advanced (expandable) section.
   */
  advancedFieldsNames: string[];
}

export interface FormSection {
  /**
   * Unique identifier for the section.
   */
  id: string;
  /**
   * Display order (lower appears first).
   */
  order: number;
  /**
   * Fields in this section, with their configuration.
   * The order of fields is determined by their own configuration.
   */
  fields: EditableFieldConfiguration[];
}

export interface EditableFieldConfiguration extends LinidAttributeConfiguration {
  /**
   * Display order (lower numbers appear first).
   */
  order: number;
}
```

| Option                | Type                          | Required | Description                                                                                                                                                               |
| --------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userIdKey`           | `string`                      | ✅ Yes   | The property name used to identify users in your data model (e.g., 'userId', 'id', 'uid')                                                                                 |
| `userTableColumns`    | `QTableColumn[]`              | ✅ Yes   | An array of column definitions for the user table. Each column follows Quasar's `QTableColumn` interface and can define label, field, alignment, sorting, and formatting. |
| `fieldOrder`          | `string[]`                    | ✅ Yes   | Ordered list of user attribute names to display first in the user details card. The order defines display priority.                                                       |
| `showRemainingFields` | `boolean`                     | ⬜ No    | If true, displays all user attributes not in `fieldOrder` after the ordered fields in the details card. Default: `false`                                                  |
| `advancedSearch`      | `AdvancedSearchConfiguration` | ✅ Yes   | Configuration for the advanced search feature. Enables the AdvancedSearchCard on the HomePage.                                                                            |
| `formSections`        | `FormSection[]`               | ✅ Yes   | Configuration for the edit and create form pages. Defines sections with ordered fields for user creation and editing.                                                     |

### Option - `userTableColumns`

- Each column object allows customization of the table layout:
  - `name`: internal column identifier
  - `label`: displayed column header (can be translated via i18n)
  - `field`: property in the user data to display
  - `align`: alignment of the cell content (`left`, `right`, `center`)
  - Other Quasar `QTableColumn` properties are also supported

### **Special Column: `table_actions`**

The **module-users** table can include a special **actions column** that is reserved for buttons or other row-level actions. Currently, the module implements a "See User" button that navigates to the user detail page.

**Note:** The "Create" button for adding new users appears in the page header (outside the table) and is automatically displayed by the HomePage component.

#### **Column Definition Example**

```json
{
  "name": "table_actions",
  "field": "id",
  "label": "columnAction",
  "style": "width: 200px",
  "headerStyle": "width: 200px"
}
```

### **Option - `advancedSearch`**

The `advancedSearch` option enables the `AdvancedSearchCard` component on the HomePage, allowing users to filter the user list based on configurable criteria.

#### **Configuration Structure**

| Property              | Type                            | Description                                                        |
| --------------------- | ------------------------------- | ------------------------------------------------------------------ |
| `fields`              | `LinidAttributeConfiguration[]` | List of field definitions available for filtering                  |
| `defaultFieldsNames`  | `string[]`                      | Names of fields to display in the default (always visible) section |
| `advancedFieldsNames` | `string[]`                      | Names of fields to display in the advanced (expandable) section    |

#### **Field Definition (`LinidAttributeConfiguration`)**

Each field in the `fields` array follows the `LinidAttributeConfiguration` interface:

```typescript
interface LinidAttributeConfiguration {
  name: string; // Field identifier (e.g., "email")
  type: string; // Backend type (e.g., "String", "Integer", "Boolean")
  required: boolean; // Whether the field is required
  hasValidations: boolean; // Whether the field has validation rules
  input: string; // UI input type: "Text", "Number", "Boolean", "Date"
  inputSettings: object; // Additional settings for the input
}
```

#### **Example Configuration**

```json
{
  "advancedSearch": {
    "fields": [
      {
        "name": "email",
        "type": "String",
        "required": false,
        "hasValidations": false,
        "input": "Text",
        "inputSettings": {}
      },
      {
        "name": "firstName",
        "type": "String",
        "required": false,
        "hasValidations": false,
        "input": "Text",
        "inputSettings": {}
      },
      {
        "name": "lastName",
        "type": "String",
        "required": false,
        "hasValidations": false,
        "input": "Text",
        "inputSettings": {}
      },
      {
        "name": "active",
        "type": "Boolean",
        "required": false,
        "hasValidations": false,
        "input": "Boolean",
        "inputSettings": {}
      }
    ],
    "defaultFieldsNames": ["email", "firstName"],
    "advancedFieldsNames": ["lastName", "active"]
  }
}
```

In this example:

- The `email` and `firstName` fields are always visible in the search card
- The `lastName` and `active` fields are hidden under an expandable "More filters" section

### **Option - `formSections`**

The `formSections` option configures the structure of the create and edit user forms. Forms are organized into sections, each containing an ordered list of fields.

**Used by:** `NewUserPage` (user creation) and `EditUserPage` (user editing)

**Key Features:**

- Sections and fields are automatically sorted by their `order` property
- Each section is displayed as a separate Quasar card
- The EditUserPage includes automatic change detection (save button disabled when no changes)
- Form validation is handled by Quasar's native form validation

#### **Configuration Structure**

| Property | Type                           | Description                                              |
| -------- | ------------------------------ | -------------------------------------------------------- |
| `id`     | `string`                       | Unique identifier for the section                        |
| `order`  | `number`                       | Display order (lower values appear first)                |
| `fields` | `EditableFieldConfiguration[]` | List of fields in this section with their configurations |

#### **FormSection Interface**

Each section in the `formSections` array follows this structure:

```typescript
interface FormSection {
  id: string; // Unique section identifier (e.g., "basicInfo")
  order: number; // Display order (1, 2, 3...)
  fields: EditableFieldConfiguration[];
}
```

#### **EditableFieldConfiguration Interface**

Each field extends `LinidAttributeConfiguration` with an additional `order` property:

```typescript
interface EditableFieldConfiguration extends LinidAttributeConfiguration {
  name: string; // Field identifier (e.g., "firstName")
  type: string; // Field type ("text", "email", "select", etc.)
  required: boolean; // Whether the field is required
  order: number; // Display order within the section
  // ... other LinidAttributeConfiguration properties
}
```

#### **Example Configuration**

```json
{
  "formSections": [
    {
      "id": "basicInfo",
      "order": 1,
      "fields": [
        {
          "name": "firstName",
          "type": "String",
          "required": true,
          "hasValidations": true,
          "input": "Text",
          "inputSettings": {},
          "order": 1
        },
        {
          "name": "lastName",
          "type": "String",
          "required": true,
          "hasValidations": true,
          "input": "Text",
          "inputSettings": {},
          "order": 2
        },
        {
          "name": "email",
          "type": "String",
          "required": true,
          "hasValidations": true,
          "input": "Text",
          "inputSettings": { "pattern": "^\\S+@\\S+\\.\\S+$" },
          "order": 3
        }
      ]
    },
    {
      "id": "additionalInfo",
      "order": 2,
      "fields": [
        {
          "name": "phoneNumber",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {},
          "order": 1
        },
        {
          "name": "active",
          "type": "Boolean",
          "required": false,
          "hasValidations": false,
          "input": "Boolean",
          "inputSettings": {},
          "order": 2
        }
      ]
    }
  ]
}
```

#### **How It Works**

1. **Sections** are displayed as separate cards in the form, ordered by their `order` property
2. **Fields** within each section are rendered in order according to their `order` property
3. Each section can have an optional **title** and **description** defined in i18n translations:
   - `{i18nScope}.formSections.{sectionId}.title`
   - `{i18nScope}.formSections.{sectionId}.description`
4. Fields use the `EntityAttributeField` component which automatically renders the appropriate input type

#### **Benefits**

- **Organized forms**: Group related fields into logical sections
- **Flexible ordering**: Control the exact display order of sections and fields
- **Dynamic rendering**: Fields automatically render based on their type configuration
- **Validation**: Each field can have its own validation rules
- **i18n support**: Section titles and descriptions are fully translatable

---

## **📝 Complete Configuration Example**

### **JSON Configuration File**

Create a `moduleUsers.json` file in your configuration directory:

```json
{
  "instanceId": "moduleUsers",
  "remoteName": "moduleUsers",
  "apiEndpoint": "api/users",
  "basePath": "/users",
  "options": {
    "userIdKey": "userId",
    "fieldOrder": ["email", "username", "createdAt"],
    "showRemainingFields": false,
    "userTableColumns": [
      {
        "name": "table_actions",
        "field": "id",
        "label": "columnAction"
      },
      {
        "name": "email",
        "field": "email",
        "label": "columnEmail",
        "align": "left"
      }
    ],
    "advancedSearch": {
      "fields": [
        {
          "name": "email",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {}
        },
        {
          "name": "firstName",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {}
        }
      ],
      "defaultFieldsNames": ["email"],
      "advancedFieldsNames": ["firstName"]
    },
    "formSections": [
      {
        "id": "basicInfo",
        "order": 1,
        "fields": [
          {
            "name": "firstName",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 1
          },
          {
            "name": "lastName",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 2
          },
          {
            "name": "email",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": { "pattern": "^\\S+@\\S+\\.\\S+$" },
            "order": 3
          }
        ]
      },
      {
        "id": "additionalInfo",
        "order": 2,
        "fields": [
          {
            "name": "phoneNumber",
            "type": "String",
            "required": false,
            "hasValidations": false,
            "input": "Text",
            "inputSettings": {},
            "order": 1
          },
          {
            "name": "active",
            "type": "Boolean",
            "required": false,
            "hasValidations": false,
            "input": "Boolean",
            "inputSettings": {},
            "order": 2
          }
        ]
      }
    ]
  }
}
```

### **Alternative Data Models**

Depending on your backend API, you might use different identifier keys:

```json
// Example 1: Using 'id' as identifier
{
  "instanceId": "moduleUsers",
  "remoteName": "moduleUsers",
  "apiEndpoint": "api/users",
  "basePath": "/users",
  "options": {
    "userIdKey": "id",
    "fieldOrder": ["email", "username"],
    "showRemainingFields": true,
    "userTableColumns": [
      {
        "name": "table_actions",
        "field": "id",
        "label": "columnAction"
      },
      {
        "name": "email",
        "field": "email",
        "label": "columnEmail",
        "align": "left"
      }
    ],
    "advancedSearch": {
      "fields": [
        {
          "name": "email",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {}
        }
      ],
      "defaultFieldsNames": ["email"],
      "advancedFieldsNames": []
    },
    "formSections": [
      {
        "id": "basicInfo",
        "order": 1,
        "fields": [
          {
            "name": "email",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 1
          },
          {
            "name": "username",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 2
          }
        ]
      }
    ]
  }
}
```

```json
// Example 2: Using 'uid' as identifier
{
  "instanceId": "moduleUsers",
  "remoteName": "moduleUsers",
  "apiEndpoint": "api/users",
  "basePath": "/users",
  "options": {
    "userIdKey": "uid",
    "fieldOrder": ["email", "username", "uid"],
    "showRemainingFields": false,
    "userTableColumns": [
      {
        "name": "table_actions",
        "field": "uid",
        "label": "columnAction"
      },
      {
        "name": "email",
        "field": "email",
        "label": "columnEmail",
        "align": "left"
      }
    ],
    "advancedSearch": {
      "fields": [
        {
          "name": "email",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {}
        }
      ],
      "defaultFieldsNames": ["email"],
      "advancedFieldsNames": []
    },
    "formSections": [
      {
        "id": "basicInfo",
        "order": 1,
        "fields": [
          {
            "name": "email",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 1
          },
          {
            "name": "username",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 2
          }
        ]
      }
    ]
  }
}
```

---

## **🔗 Integration with Host Application**

### **Step 1: Create Configuration File**

Create `moduleUsers.json` in your configuration directory:

```json
{
  "instanceId": "moduleUsers",
  "remoteName": "moduleUsers",
  "apiEndpoint": "api/users",
  "basePath": "/users",
  "options": {
    "userIdKey": "userId",
    "fieldOrder": ["email", "username", "createdAt"],
    "showRemainingFields": false,
    "userTableColumns": [
      {
        "name": "table_actions",
        "field": "userId",
        "label": "columnAction"
      },
      {
        "name": "email",
        "field": "email",
        "label": "columnEmail",
        "align": "left"
      }
    ],
    "advancedSearch": {
      "fields": [
        {
          "name": "email",
          "type": "String",
          "required": false,
          "hasValidations": false,
          "input": "Text",
          "inputSettings": {}
        }
      ],
      "defaultFieldsNames": ["email"],
      "advancedFieldsNames": []
    },
    "formSections": [
      {
        "id": "basicInfo",
        "order": 1,
        "fields": [
          {
            "name": "email",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 1
          },
          {
            "name": "username",
            "type": "String",
            "required": true,
            "hasValidations": true,
            "input": "Text",
            "inputSettings": {},
            "order": 2
          },
          {
            "name": "createdAt",
            "type": "String",
            "required": false,
            "hasValidations": false,
            "input": "Date",
            "inputSettings": {},
            "order": 3
          }
        ]
      }
    ]
  }
}
```

### **Step 2: Configure Module Federation**

Add the module to your `remotes.json` file. This file contains an array of remote module configurations:

```json
[
  {
    "name": "moduleUsers",
    "entry": "http://localhost:5002/mf-manifest.json"
  }
]
```

For production or other environments, update the `entry` URL accordingly:

```json
[
  {
    "name": "moduleUsers",
    "entry": "https://your-domain.com/modules/users/mf-manifest.json"
  },
  {
    "name": "otherModule",
    "entry": "https://your-domain.com/modules/other/mf-manifest.json"
  }
]
```

---

## **🛣️ Route Structure**

The `userIdKey` configuration specifies which property in your user data contains the user identifier. This value is used to populate the `:id` parameter in the routes.

### **Generated Routes**

The module creates the following routes:

```
/users                → User list page (HomePage)
/users/new            → Create new user page (NewUserPage)
/users/:id            → User detail page (UserDetailsPage)
/users/:id/edit       → Edit user page (EditUserPage)
```

### **Page Components Overview**

| Route             | Component       | Purpose                                   | Key Features                                           |
| ----------------- | --------------- | ----------------------------------------- | ------------------------------------------------------ |
| `/users`          | HomePage        | List all users with search and pagination | Advanced search, create button, row-level actions      |
| `/users/new`      | NewUserPage     | Create a new user                         | Multi-section form, field validation                   |
| `/users/:id`      | UserDetailsPage | Display user details                      | Configurable field order, edit button                  |
| `/users/:id/edit` | EditUserPage    | Edit an existing user                     | Multi-section form, change detection, field validation |

### **How userIdKey Works**

The `userIdKey` determines which field in your user data object contains the identifier value:

```typescript
// Configuration
{
  "options": {
    "userIdKey": "userId"  // ← Look for user.userId in the data
  }
}

// User data from API
const user = {
  userId: "abc-123",      // ← This field is identified by userIdKey
  username: "john.doe",
  email: "john@example.com"
  // ... other properties
};

// The value of user[userIdKey] is used in the route
// URL becomes: /users/abc-123/edit
```

### **Accessing the ID in Components**

In your components, retrieve the ID from the route parameter:

```typescript
// The route parameter is always 'id'
const route = useRoute();
const userId = route.params.id; // Value: "abc-123"

// This value matches user[userIdKey] from your data
// Where userIdKey is configured as "userId" in this example
```

---

## **📊 Data Model Requirements**

Your backend API should return user objects with the configured identifier:

```typescript
// Example with userIdKey: 'userId'
interface User {
  userId: string;    // ← Must match userIdKey configuration
  username: string;
  email: string;
  // ... other properties
}

// Example API response
{
  "userId": "123",
  "username": "john.doe",
  "email": "john.doe@example.com"
  // ... other properties
}
```

---

## **✅ Best Practices**

### **1. Consistency**

- Ensure `userIdKey` matches the property name in your backend API responses
- Use the same identifier key across all user-related modules and services

### **2. Documentation**

- Document your chosen `userIdKey` in your project's API documentation
- Keep this configuration versioned with your application code

---

## **🐛 Troubleshooting**

### **Common Issues**

**Issue:** Routes return 404 errors

- **Solution:** Verify that `userIdKey` matches the property in your API responses
- **Check:** Ensure the base path doesn't conflict with other routes

**Issue:** User data not loading correctly

- **Solution:** Confirm the `apiEndpoint` is correct and accessible
- **Check:** Verify the backend returns data with the correct identifier property
