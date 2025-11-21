# **linid-im-front-community-plugins**

## **🧩 Overview**

`linid-im-front-community-plugins` is the central **plugin hub** for the LinID Identity Management ecosystem.
It contains all **community plugins**, including:

* **Modules** → Functional feature blocks that extend the host application
* **Component Catalogs** → Collections of reusable UI components consumed across modules

This repository is designed to integrate seamlessly with the **Vue.js/Quasar module-federation architecture** used across LinID front-end applications.

It enables:

* Independent development of modular features
* Remote loading of UI components and modules
* A scalable ecosystem where new functionality can be plugged into the host at runtime

---

## **✨ Features**

* Centralized repository for all community plugins
* Supports both **modules** and **component catalogs**
* Fully compatible with **Module Federation**
* Designed for seamless integration into all LinID front-end apps
* Scalable architecture enabling future extensions

---

## **🔍 Understanding Modules vs. Component Catalogs**

### **Modules**

A **module** is a functional part of the application that introduces domain-specific features.
For example:

* A **User module** manages the CRUD lifecycle of users and exposes routing/pages
* A **Group module** might depend on the User module to:

    * Add CRUD functionality for groups
    * Insert plugin components into User pages (e.g., display groups a user belongs to)

Modules = **Feature-oriented**, often include pages, forms, services, and plugin components.

### **Component Catalogs**

A **component catalog** is a set of **generic reusable UI components**.
These components are not tied to a specific business feature.

Example:
`catalog-ui` — a shared visual component library used by various modules.

Catalogs = **UI-oriented**, no business logic, reusable everywhere.

---

## **🧪 Current Available Plugins**

### **📦 Component Catalogs**

| Name        | Description                                                             |
| ----------- | ----------------------------------------------------------------------- |
| `catalog-ui` | A reusable, generic catalog of UI components used across LinID modules. |

### **🧩 Modules**

> *Coming soon…*

---

## **Tech Stack 🛠️**

| Area            | Technology                |
| --------------- | ------------------------- |
| Language        | TypeScript                |
| Framework       | Vue.js (Composition API)  |
| UI Toolkit      | Quasar Framework          |
| Build System    | **Nx Workspace**          |
| Module System   | Webpack Module Federation |
| Package Manager | npm / pnpm                |

---

## **📋 Technical Prerequisites**

To develop or run this plugin hub, ensure the following:

* **Node.js ≥ 22.19**
* **npm or pnpm ≥ 10**
* A host project using:

    * Vue.js 3
    * Quasar Framework (recommended)
    * Webpack 5 + Module Federation
* A workspace environment supporting **Nx**

---

## 📚 Configuration Guide

All configuration documentation is located in the `docs/` folder.

### **1️⃣ Plugin Documentation**

Each plugin (module or component catalog) contains its own documentation inside its folder.

* 🎨 **Catalog UI** — A reusable set of visual components designed for all LinID modules
  → Documentation is inside: [apps/catalog-ui/README.md](apps/catalog-ui/README.md)

These documents explain how developers can extend the community plugins ecosystem, create new modules, and integrate them with the host app:

* 🧱 **Creating a New Module** — How to scaffold, structure, expose, and register a new remote module
  → Documentation inside: [docs/create-module.md](docs/create-module.md)

* 🔌 **Plugin Architecture Overview** — How modules, catalogs, and the host communicate through Module Federation
  → Documentation inside: [docs/plugin-architecture.md](docs/plugin-architecture.md)

* 🧩 **Plugin Zones & Injection Points** — How modules can contribute UI to other modules dynamically
  → Documentation inside: [docs/plugin-zones.md](docs/plugin-zones.md)

* 🛠️ **Shared UI & Cross-Module Guidelines** — Best practices for building reusable UI components and interacting with Catalog UI
  → Documentation inside: [docs/shared-ui-guidelines.md](docs/shared-ui-guidelines.md)

---

## **📜 License**

This project is licensed under: **GNU Affero General Public License version 3**

---

## **🤝 Contributing**

Contributions are welcome!
Please refer to the **[CONTRIBUTING.md](CONTRIBUTING.md)** file for:

* Development workflow
* Coding guidelines
* Commit conventions
* PR rules
