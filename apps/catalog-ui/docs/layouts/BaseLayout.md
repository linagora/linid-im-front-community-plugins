# **BaseLayout 🏗️**

The **BaseLayout** component is a foundational layout for all module pages in LinID.
It provides a **standard page structure** using Quasar’s `QLayout`, a header with navigation, and a `router-view` for dynamic content.

---

## **🎯 Purpose**

- Provides a consistent layout structure across modules
- Handles the main page container for rendering module views
- Integrates a header with application info, user details, and navigation menu
- Serves as the base for more complex layouts in the future

---

## **⚙️ Props**

| Prop          | Type   | Description                                                                                                                                                                                                                               |
| ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header`      | Object | Header configuration object containing: <br> &nbsp;&nbsp;- `appTitle` (String): Application title <br> &nbsp;&nbsp;- `appVersion` (String): Application version <br> &nbsp;&nbsp;- `userFullName` (String): Full name of the current user |
| `uiNamespace` | String | UI design namespace for custom styling and design system support                                                                                                                                                                          |

---

## **🧩 Structure**

- **Header:** Displays the application logo, title, user information (with version badge), and a navigation menu
- **NavigationMenu:** Renders navigation items (e.g., Home, Users) in the header toolbar
- **Page Container:** Uses `router-view` to render module-specific content

---

## **✅ Advantages**

- **Consistency:** Ensures all modules share the same layout style
- **Simplicity:** Minimal configuration, easy to use
- **Scalable:** Can be extended with slots or additional features as the app grows
- **Framework-friendly:** Fully compatible with Vue 3 and Quasar
- **UI Design System:** Integrates with LinID’s UI design system for theming

---

## **📌 Notes**

- For now, this is the simplest possible layout: it only includes a page container, a header with static content, and router-view.
- Use this as the base for creating module-specific layouts if needed.
- Additional layout components will be added over time, such as sidebars and dynamic sections.
