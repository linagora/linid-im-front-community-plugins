# **NavigationMenu 🧭**

The **NavigationMenu** component provides a tab-based navigation system for module pages in LinID.
It leverages Quasar’s `QTabs` and `QRouteTab` to enable seamless navigation between different views.

---

## **🎯 Purpose**

- Offers a consistent tab navigation interface across modules
- Allows users to switch between different sections or pages
- Integrates with Vue Router for dynamic routing

---

## **⚙️ Props**

| Prop          | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `items`       | Array  | List of navigation items (id, label, path, icon) |
| `activeItem`  | String | The currently active tab (item id or path)       |
| `uiNamespace` | String | UI design namespace for custom styling           |
| `dataCy`      | String | Data attribute for testing                       |

---

## **✅ Advantages**

- **Consistency:** Uniform navigation experience across modules
- **Customizable:** Supports custom icons, labels, and routes
- **Reactive:** Emits events on tab change and selection
- **Framework-friendly:** Built for Vue 3 and Quasar, integrates with router

---

## **📌 Notes**

- Use `items` to define the tabs and their routes.
- Emits `update:activeItem` and `select` events for parent components to react to navigation changes.
- Can be extended with additional UI props or slots if needed.
- Ideal for module-level navigation; combine with layout components for full page structure.
