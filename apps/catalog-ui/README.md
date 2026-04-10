# **catalogUI**

## **🧩 Overview**

`catalogUI` is a **shared UI component library** for the LinID Identity Manager frontend.
It provides **reusable visual components** that can be consumed by multiple modules across the application, ensuring consistency in design, accessibility, and functionality.

> This library is part of the LinID plugin ecosystem and integrates seamlessly with the Module Federation architecture used in the front-end.

---

## **✨ Features**

- Shared Vue 3 components for building module UIs
- Components categorized by function (Layout, Forms, Navigation…)
- Designed for **reusability** across multiple modules
- Fully compatible with Quasar and TypeScript

---

## **Tech Stack 🛠️**

| Area            | Technology                |
| --------------- | ------------------------- |
| Language        | TypeScript                |
| Framework       | Vue.js (Composition API)  |
| UI Toolkit      | Quasar Framework          |
| Module System   | Webpack Module Federation |
| Package Manager | npm / pnpm                |
| Monorepo Tool   | Nx                        |

---

## **📋 Technical Prerequisites**

Ensure the following requirements to use or develop catalogUI:

- **Node.js** ≥ 20 (LTS)
- **Package manager:** pnpm 10+ (managed via Corepack)
- **Vue.js 3** project
- **Quasar Framework** for UI components
- A bundler supporting **Module Federation**

---

## **📜 License**

This project is licensed under: **GNU Affero General Public License version 3**
See: [`LICENSE.md`](../../LICENSE.md) for details.

---

## **📚 Components**

The library organizes components by category. For each component, documentation is provided in a dedicated Markdown file inside `apps/catalogUI/docs/`.

### **Layout Components**

- 🏗️ **BaseLayout** — The core layout component for all module pages
  → Documentation is inside: [`BaseLayout.md`](./docs/layouts/BaseLayout.md)

### **Navigation Components**

- **NavigationMenu** — Tab-based navigation menu for module pages
  → Documentation is inside: [`NavigationMenu.md`](./docs/components/menu/NavigationMenu.md)

### **Profile Components**

- 👤 **HeaderProfile** — User profile button for the application header, displaying the authenticated user's name and email from the LinID user store
  → Documentation is inside: [`HeaderProfile.md`](./docs/components/profile/HeaderProfile.md)

### **Table Components**

- **GenericEntityTable** — Minimal QTable wrapper for simple entity lists
  → Documentation is inside: [`GenericEntityTable.md`](./docs/components/table/GenericEntityTable.md)

### **Card Components**

- ✨ **InformationCard** — Reusable card component for displaying labeled read-only information with optional loading states
  → Documentation is inside: [`InformationCard.md`](./docs/components/card/InformationCard.md)

- ✨ **EntityDetailsCard** — Composable container card for displaying multiple entity attributes using `InformationCard` components  
  → Documentation is inside: [`EntityDetailsCard.md`](./docs/components/card/EntityDetailsCard.md)

- ✨ **ButtonsCard** — A card component with action buttons
  → Documentation is inside: [`ButtonsCard.md`](./docs/components/card/ButtonsCard.md)

- 🔍 **AdvancedSearchCard** — Generic search card with default and expandable advanced filters sections
  → Documentation is inside: [`AdvancedSearchCard.md`](./docs/components/card/AdvancedSearchCard.md)

### **Forms Components**

- 🧩 **EntityAttributeField** — Dynamic attribute field resolver that selects and renders the correct input component
  → Documentation is inside: [`EntityAttributeField.md`](./docs/components/field/EntityAttributeField.md)

- 🔘 **EntityAttributeBooleanField** — Boolean attribute input based on a toggle switch (`QToggle`)
  → Documentation is inside: [`EntityAttributeBooleanField.md`](./docs/components/field/EntityAttributeBooleanField.md)

- ✏️ **EntityAttributeTextField** — Text attribute input with full i18n and UI customization support
  → Documentation is inside: [`EntityAttributeTextField.md`](./docs/components/field/EntityAttributeTextField.md)

- 🔢 **EntityAttributeNumberField** — Numeric attribute input with automatic number casting and scoped translations
  → Documentation is inside: [`EntityAttributeNumberField.md`](./docs/components/field/EntityAttributeNumberField.md)

- 🔢 **EntityAttributeDateField** — Date attribute input with automatic date casting and scoped translations
  → Documentation is inside: [`EntityAttributeDateField.md`](./docs/components/field/EntityAttributeDateField.md)

- 📋 **EntityAttributeListField** — Single-selection dropdown for list attributes with predefined values
  → Documentation is inside: [`EntityAttributeListField.md`](./docs/components/field/EntityAttributeListField.md)

- 📋 **EntityAttributeDynamicListField** — Single-selection dropdown for dynamic list attributes with lazy loading from a backend endpoint
  → Documentation is inside: [`EntityAttributeDynamicListField.md`](./docs/components/field/EntityAttributeDynamicListField.md)

### **Feedback & Utility Components**

- ✨ **BlurLoader** — Skeleton loader for representing loading states
  → Documentation is inside: [`BlurLoader.md`](./docs/components/loader/BlurLoader.md)

> More categories and components will be added as the library evolves.

---

## **🤝 Contributing**

We welcome contributions to improve and extend catalogUI.
Please refer to the **[CONTRIBUTING.md](../../CONTRIBUTING.md)** file in the monorepo root for:

- Development workflow
- Code guidelines
- Commit conventions
- Pull request rules

---

## **📘 Documentation**

Additional documentation for the library is located in the `apps/catalog-ui/docs/` folder:

- Each component has a dedicated Markdown file describing its usage, props, events, and examples.
- See `BaseLayout.md` as the first example of component documentation.
- More docs will be added as new components are created.

### **Design Configuration**

For information on how to customize the visual appearance of CatalogUI components using the `design.json` configuration system, see:

→ **[Design Configuration Guide](./docs/design.md)**
