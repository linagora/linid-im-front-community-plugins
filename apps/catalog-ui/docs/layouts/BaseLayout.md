# **BaseLayout 🏗️**

The **BaseLayout** component is a foundational layout for all module pages in LinID.
It provides a **standard page structure** using Quasar’s `QLayout` and a `router-view` for dynamic content.

---

## **🎯 Purpose**

* Provides a consistent layout structure across modules
* Handles the main page container for rendering module views
* Serves as the base for more complex layouts in the future

---

## **⚙️ Props**

Currently, `BaseLayout` does **not accept any props**.

---

## **✅ Advantages**

* **Consistency:** Ensures all modules share the same layout style
* **Simplicity:** Minimal configuration, easy to use
* **Scalable:** Can be extended with slots or additional features as the app grows
* **Framework-friendly:** Fully compatible with Vue 3 and Quasar

---

## **📌 Notes**

* For now, this is the simplest possible layout: it only includes a page container and router-view.
* Use this as the base for creating module-specific layouts if needed.
* Additional layout components will be added over time, such as sidebars, headers, and dynamic sections.
