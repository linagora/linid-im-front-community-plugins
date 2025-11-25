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

| Area            | Technology               |
| --------------- |--------------------------|
| Language        | TypeScript               |
| Framework       | Vue.js (Composition API) |
| UI Toolkit      | Quasar Framework         |
| Build System    | **Nx Workspace**         |
| Module System   | Module Federation        |
| Package Manager | npm / pnpm               |

---

## **📋 Technical Prerequisites**

To develop or run this plugin hub, ensure the following:

* **Node.js ≥ 22.19**
* **npm or pnpm ≥ 10**
* A host project using:

    * Vue.js 3
    * Quasar Framework (recommended)
    * Module Federation
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

## **🐳 Docker for Module Federation Remotes**

Each remote module in this Nx monorepo can be built and deployed independently using Docker.

### **Build a Remote Docker Image**

```bash
# Replace <remote-name> with your Nx project name
docker build -f docker/<remote-name>.Dockerfile -t <remote-name> .
```

* The `-f` flag points to the Dockerfile for the remote.
* `.` specifies the build context (root of the repository).

### **Run a Remote Container**

```bash
# Expose a dedicated port for the remote
docker run -p 5001:80 <remote-name>
```

* The remote will be available at `http://localhost:5001/mf-manifest.json`.
* Update the host application’s `public/remotes.json` to point to this URL.

### **Notes & Best Practices**

* **Independent builds:** Each remote should be able to build and run in isolation.
* **Clean build environment:** Remove local `node_modules` before building, or rely on the Dockerfile multi-stage build.
* **CI-friendly:** The Dockerfile sets `ENV CI=true` to prevent pnpm TTY issues.
* **Runtime configuration:** Use environment variables or Nginx `envsubst` for dynamic URLs or API endpoints.
* **Versioning:** Tag Docker images with version numbers or commit SHAs to manage deployments.
* **Dedicated ports:** Each remote should expose a unique port to avoid conflicts.

This makes each remote fully containerized, easy to deploy, and compatible with your Module Federation host.

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
