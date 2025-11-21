# **Shared UI Guidelines 🛠️**

This document provides guidelines for developing **reusable UI components** in the LinID frontend ecosystem.
These rules ensure components are **consistent, accessible, and compatible** across modules while integrating with the **Catalog UI** and **Module Federation architecture**.

---

## **🎯 Purpose**

* Promote **reusable, standardized UI components** for all modules
* Ensure **design consistency** across the application
* Facilitate **integration with Catalog UI** and other modules
* Establish **best practices** for localization and styling

---

## **🧩 Component Structure**

All shared UI components should follow these rules:

1. **Single Responsibility:** Each component should do one thing and do it well.
2. **Composable:** Prefer slots and props for flexibility over hard-coded content.
3. **Lightweight:** Avoid unnecessary dependencies; rely on Quasar and core utilities.
4. **Self-contained styles:** Use scoped CSS or style variables defined in the theme.

Example folder structure:

```
MyComponent/
├─ MyComponent.vue
├─ MyComponent.spec.ts # unit tests
└─ README.md           # component-specific documentation
```

---

## **🎨 Styling & Quasar Attributes**

All **design-related attributes** (labels, icons, colors, sizes, spacing, density…) must be stored in the **translations JSON** file and **not hard-coded** in the component.

### **Example translation structure**

```json
{
  "MyComponent": {
    "title": {
      "label": "Save",
      "icon": "save",
      "color": "primary",
      "dense": true
    },
    "description": {
      "label": "This is a description",
      "color": "secondary"
    }
  }
}
```

* `label`: Text to display
* `icon`: Name of the Quasar icon
* `color`: Must be **one of the default Quasar colors** (`primary`, `secondary`, `accent`, `positive`, `negative`, `info`, `warning`)
* `dense`: Boolean value controlling density (true/false)
* Future attributes can be added, but **all design-related props must stay in translations**

### **Using translations in components**

```vue
<template>
  <q-btn
    :label="$t('MyComponent.title.label')"
    :icon="$t('MyComponent.title.icon')"
    :color="$t('MyComponent.title.color')"
    :dense="$t('MyComponent.title.dense')"
  />
</template>
```

### **Documentation Requirement**

**Each component must document which Quasar attributes it uses from the translation files.**

* List all attributes (label, icon, color, dense, etc.) in the component README or dedicated docs file
* Specify default values and intended usage
* This ensures **consistency**, **easy localization**, and clarity for developers consuming the component

---

## **⚙️ Props & Slots**

* **Props:** Expose all dynamic behavior via props
* **Slots:** Allow content injection where customization is required
* **Events:** Use descriptive, kebab-case event names

Example:

```ts
props: {
  label: { type: String, required: false }
},
emits: ['submit', 'cancel']
```

---

## **✅ Best Practices**

* Prefer **composition over inheritance**
* Avoid side effects (do not modify global state directly)
* Include **unit tests** for functional behavior
* Document **all props, events, slots, and used Quasar attributes from translations**
* Always **use default Quasar colors** for consistency
* Maintain translation files organized per component

---

## **📌 Notes**

* All UI components in **Catalog UI** should comply with these guidelines
* Follow this structure to ensure **consistency, reusability, and scalability**
* Future updates may include **design tokens, themes, and accessibility rules**
