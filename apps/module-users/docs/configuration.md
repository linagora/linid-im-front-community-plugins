# **Module Configuration 🔧**

This document provides a comprehensive guide for configuring the **module-users** remote module in your LinID application. It covers all required and optional configuration parameters, integration with the host application, and best practices.

---

## **📋 Overview**

The **module-users** module is a remote module that provides user management functionality including:

- User listing and search
- User detail view
- User creation
- User editing

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
}
```

| Option                | Type             | Required | Description                                                                                                                                                               |
| --------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `userIdKey`           | `string`         | ✅ Yes   | The property name used to identify users in your data model (e.g., 'userId', 'id', 'uid')                                                                                 |
| `userTableColumns`    | `QTableColumn[]` | ✅ Yes   | An array of column definitions for the user table. Each column follows Quasar's `QTableColumn` interface and can define label, field, alignment, sorting, and formatting. |
| `fieldOrder`          | `string[]`       | ✅ Yes   | Ordered list of user attribute names to display first in the user details card. The order defines display priority.                                                       |
| `showRemainingFields` | `boolean`        | ⬜ No    | If true, displays all user attributes not in `fieldOrder` after the ordered fields in the details card. Default: `false`                                                  |

### Option - `userTableColumns`

- Each column object allows customization of the table layout:
  - `name`: internal column identifier
  - `label`: displayed column header (can be translated via i18n)
  - `field`: property in the user data to display
  - `align`: alignment of the cell content (`left`, `right`, `center`)
  - Other Quasar `QTableColumn` properties are also supported

### **Special Column: `table_actions`**

The **module-users** table can include a special **actions column** that is reserved for buttons or other row-level actions (e.g., “See User”, “Edit User”).

#### **Column Definition Example**

```json
{
  "name": "table_actions",
  "field": "id",
  "label": "column-action",
  "style": "width: 200px",
  "headerStyle": "width: 200px"
}
```

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
        "label": "column-action"
      },
      {
        "name": "email",
        "field": "email",
        "label": "column-email",
        "align": "left"
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
        "label": "column-action"
      },
      {
        "name": "email",
        "field": "email",
        "label": "column-email",
        "align": "left"
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
        "label": "column-action"
      },
      {
        "name": "email",
        "field": "email",
        "label": "column-email",
        "align": "left"
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
        "label": "column-action"
      },
      {
        "name": "email",
        "field": "email",
        "label": "column-email",
        "align": "left"
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
/users/:id            → User detail page (future)
/users/:id/edit       → Edit user page (EditUserPage)
```

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
