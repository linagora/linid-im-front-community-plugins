# **BaseLayout 🏗️**

The **BaseLayout** component is a foundational layout for all module pages in LinID.
It provides a **standard page structure** using Quasar's `QLayout`, a header with application info and navigation, and a `router-view` for dynamic content.

---

## **🎯 Purpose**

- Provides a consistent layout structure across all modules
- Handles the main page container for rendering module views
- Integrates a header with application branding, version info and navigation menu
- Serves as the base for more complex layouts in the future
- Leverages the LinID UI design system for consistent theming

---

## **🧩 Structure**

### **Header (QHeader)**

The header contains two toolbars:

#### **1. Main Toolbar**

- **QAvatar:** Application logo
- **QToolbarTitle:** Application title (i18n: `application.title`)
- **QBadge:** Application version (i18n: `application.version`)

#### **2. Navigation Toolbar**

- **NavigationMenu:** Tab-based navigation using items from `uiStore.mainNavigationItems`

### **Page Container**

- Uses `router-view` to render module-specific content dynamically

### **Zone Renderer**

- **LinidZoneRenderer:** Renders components registered in the `base-layout.dialogComponent` zone
- Used to display dialogs at the layout level, such as the confirmation dialog from `ConfirmationDialog.vue`

---

## **🎨 UI Customization**

The component uses hierarchical UI namespaces for styling:

| Element         | Namespace            | Component                  |
| --------------- | -------------------- | -------------------------- |
| Header          | `base-layout.header` | `q-header`                 |
| Toolbar         | `base-layout.header` | `q-toolbar`                |
| Avatar          | `base-layout.header` | `q-avatar`                 |
| Toolbar Title   | `base-layout.header` | `q-toolbar-title`          |
| Badge           | `base-layout.header` | `q-badge`                  |
| Navigation Menu | `base-layout.header` | (passed to NavigationMenu) |

Example customization:

```typescript
ui('base-layout.header', 'q-header'); // Customize header
ui('base-layout.header', 'q-avatar'); // Customize logo
```

---

## **📊 Data Flow**

1. **UI Store:** `useLinidUiStore()` provides `mainNavigationItems` for navigation
2. **i18n:** `useScopedI18n('application')` provides translated text for title and version
3. **Navigation:** `NavigationMenu` receives items and namespace, handles routing
4. **Zone Renderer:** `LinidZoneRenderer` allows dynamic component injection via the zone system

---

## **✅ Advantages**

- **Zero Configuration:** No props required, works out of the box
- **Consistency:** Ensures all modules share the same layout style
- **Type-Safe:** Full TypeScript support with typed UI props
- **Scalable:** Can be extended with slots or additional features
- **Framework-Friendly:** Fully compatible with Vue 3, Quasar, and Vue Router
- **Design System Integration:** Uses LinID's UI design system for theming
- **i18n Ready:** Supports internationalization for application info

---

## **🧪 Testing**

The component includes `data-cy` attributes for Cypress testing:

- Header: `data-cy="header"`
- Main toolbar: `data-cy="toolbar"`
- Logo: `data-cy="application_logo"`
- Title: `data-cy="application_title"`
- Version badge: `data-cy="application_version"`
- Navigation toolbar: `data-cy="navigation_toolbar"`

---

## **📌 Notes**

- For now, this is the simplest possible layout: it only includes a page container, a header with static content, and router-view.
- Use this as the base for creating module-specific layouts if needed.
- Additional layout components will be added over time, such as sidebars and dynamic sections.
