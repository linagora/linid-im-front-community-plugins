# **UserDetailsPage 👤**

The **UserDetailsPage** component displays detailed information about a specific user using the `EntityDetailsCard` component from the catalog. It provides navigation options to edit the user or return to the user list.

---

## **🎯 Purpose**

- Display comprehensive user details in a structured card format
- Manage loading states during data fetching
- Provide navigation controls (back to list, edit user)
- Use configurable field ordering and display options from module configuration

---

## **📋 Features**

### **User Details Display**

- Uses `EntityDetailsCard` from the catalog to display user attributes
- Supports configurable field ordering via `fieldOrder` option
- Can show all remaining fields or only selected ones via `showRemainingFields` option
- Handles loading states with skeleton placeholders

### **Navigation Controls**

- **Back Button**: Returns to the user list page
- **Edit Button**: Navigates to the edit page for the current user

### **Error Handling**

- Displays notification on data fetch errors
- Automatically redirects to user list on error

---

## **⚙️ Configuration**

The page behavior is controlled by the module configuration. See [configuration.md](../configuration.md) for details.

### **Key Configuration Options**

| Option                | Type       | Description                                                                 |
| --------------------- | ---------- | --------------------------------------------------------------------------- |
| `userIdKey`           | `string`   | The property name used to identify users (e.g., 'userId', 'id', 'uid')      |
| `fieldOrder`          | `string[]` | Ordered list of user attributes to display first in the details card        |
| `showRemainingFields` | `boolean`  | If true, displays all attributes not in `fieldOrder` after the ordered ones |

---

## **🌍 Internationalization**

The page uses scoped translations under `{instanceId}.UserDetailsPage`:

### **Required Translation Keys**

```json
{
  "UserDetailsPage": {
    "title": "User Details",
    "edit": "Edit",
    "error": "Failed to load user details"
  }
}
```

### **EntityDetailsCard Translations**

The `EntityDetailsCard` component requires translations under `{instanceId}.UserDetailsPage.EntityDetailsCard`:

```json
{
  "UserDetailsPage": {
    "EntityDetailsCard": {
      "title": "User informations",
      "attributes": {
        "email": "Email",
        "username": "Username",
        "createdAt": "Created At",
        "updatedAt": "Updated At",
        "status": "Status"
      }
    }
  }
}
```

**Note**: Add translation keys for each field that will be displayed based on your `fieldOrder` and user data structure.

---

## **📊 Data Flow**

### **Component Lifecycle**

1. **Mount**: Component loads user data via `loadData()` on mount
2. **Loading**: `isLoading` is set to `true` during data fetch
3. **Success**: User data is stored in `user` ref, `isLoading` set to `false`
4. **Error**: Notification shown, user redirected to list page

### **Loading State Management**

The loading state is owned and managed by the page:

```typescript
// Owned by UserDetailsPage
const isLoading = ref<boolean>(false);

// Passed to EntityDetailsCard
<component
  :is="entityDetailsCard"
  :is-loading="isLoading"
  ...
/>
```

---

## **🧩 Configuration Examples**

### **Example 1: Display Only Selected Fields**

```json
{
  "options": {
    "userIdKey": "userId",
    "fieldOrder": ["email", "username", "createdAt"],
    "showRemainingFields": false
  }
}
```

**Result**: Only `email`, `username`, and `createdAt` are displayed in that order.

### **Example 2: Display All Fields with Priority Order**

```json
{
  "options": {
    "userIdKey": "userId",
    "fieldOrder": ["email", "username"],
    "showRemainingFields": true
  }
}
```

**Result**: `email` and `username` are shown first, followed by all other user attributes.

### **Example 3: Display All Fields (No Priority)**

```json
{
  "options": {
    "userIdKey": "userId",
    "fieldOrder": [],
    "showRemainingFields": true
  }
}
```

**Result**: All user attributes are displayed in their natural order from the data object.

---

## **🛣️ Route Parameters**

The page uses the `:id` route parameter to identify which user to load:

```
/users/:id  → User details page
```

The value from `route.params.id` is used to fetch the user data via `getEntityById()`.

---

## **🎨 UI Customization**

The page uses the UI design system for customization. All design properties can be configured via the UI namespace.

### **UI Namespaces**

| Element             | Namespace                                                   |
| ------------------- | ----------------------------------------------------------- |
| Entity Details Card | `{instanceId}.user-details-page.entity-details-card`        |
| Edit Button         | `{instanceId}.user-details-page.edit-button`                |
| Buttons Card        | `{instanceId}.user-details-page` (inherited by ButtonsCard) |

### **Customization Example**

```json
{
  "moduleUsers": {
    "user-details-page": {
      "edit-button": {
        "color": "primary",
        "icon": "edit",
        "flat": true
      },
      "entity-details-card": {
        "flat": true,
        "bordered": true
      }
    }
  }
}
```

---

## **🧪 Testing**

The component includes comprehensive unit tests covering:

- User data loading
- Loading state management
- Error handling and notifications
- Navigation functions (edit, back)

See [UserDetailsPage.spec.js](../../tests/unit/pages/UserDetailsPage.spec.js) for test implementation.

---

## **✅ Best Practices**

### **1. Field Ordering**

- Order fields by importance (most important first)
- Consider user workflows when ordering fields
- Use `showRemainingFields: true` for admin/debug views

### **2. Translations**

- Provide translations for all fields that might appear
- Use meaningful, user-friendly labels
- Keep translations consistent across pages

### **3. Error Handling**

- Customize error messages per locale
- Provide clear guidance when errors occur
- Log errors for debugging (when appropriate)

---

## **🐛 Troubleshooting**

### **Issue**: Fields not displaying

- **Check**: Verify field names in `fieldOrder` match property names in user data
- **Check**: Ensure translations exist for each field under `EntityDetailsCard.attributes`

### **Issue**: Incorrect user loaded

- **Check**: Verify `userIdKey` matches the identifier property in your data
- **Check**: Confirm route parameter is being passed correctly

### **Issue**: Loading state stuck

- **Check**: Verify API endpoint returns data successfully
- **Check**: Review network errors in browser console
