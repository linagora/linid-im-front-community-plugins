# **Generic Page Module**

## **🧩 Overview**

The `GenericPageModule` is a Module Federation remote responsible for integrating a generic page into the host application.

It provides a standard page composition model based on:

- a layout module
- a page module
- a route definition
- a lifecycle hook

---

## **📦 Module Contract**

The module is implemented as a `BasicRemoteModule<ModulePageOptions>` and exposes the following responsibilities:

- Register the module in the host system
- Contribute a navigation entry in the main menu
- Provide a federated route configuration
- Resolve layout and page components via Module Federation

---

## **⚙️ Lifecycle Behavior**

During `postInit`, the module registers itself into the host navigation menu using the configured `basePath` and localized label.

No additional lifecycle behavior is required beyond this registration step.

---

## **🧭 Routing**

The module exposes a federated route structure:

- `basePath` → root route of the page module
- `pagePath` → internal page route
- `layout` → layout component resolved via Module Federation
- `page` → page component resolved via Module Federation

This results in a nested route structure:

```

basePath/
└── pagePath → page rendered inside layout

```

---

## **📡 Module Federation Exposes**

### **PageRoutes**

Path:

```ts
./PageRoutes
```

Purpose:
Exposes the route definition used by the host router to mount the page module.

---

### **PageLifecycle**

Path:

```ts
./PageLifecycle
```

Purpose:
Handles module initialization lifecycle logic (`postInit`, registration, etc.).

---

## **📘 Configuration**

The module is configured using `ModulePageOptions`:

```ts
interface ModulePageOptions {
  addNavigationMenu?: boolean; // default false
  layout: string; // MF remote/component for layout
  page: string; // MF remote/component for page
  pagePath: string; // route path inside the module
}
```

---

## **🔗 Module Lifecycle Summary**

1. Module is initialized via `BasicRemoteModule`
2. `postInit` registers navigation entry only if `addNavigationMenu` is set to true.
3. Routes are exposed via `PageRoutes`
4. Lifecycle logic is exposed via `PageLifecycle`
5. Page is rendered using federated layout + page components

---

## **📌 Notes**

This module is intended as a **generic reusable page container**.
All domain-specific logic must be implemented in the federated page or layout modules.
