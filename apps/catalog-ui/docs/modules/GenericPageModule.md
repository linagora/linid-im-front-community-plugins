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

The module exposes a federated route structure built from two different levels of the host
configuration:

| Key        | Location                  | Role                                            |
| ---------- | ------------------------- | ----------------------------------------------- |
| `basePath` | module configuration root | Root route the module is mounted at             |
| `pagePath` | `options`                 | Internal page route, nested under `basePath`    |
| `layout`   | `options`                 | Layout component resolved via Module Federation |
| `page`     | `options`                 | Page component resolved via Module Federation   |

This results in a nested route structure:

```

basePath/
└── pagePath → page rendered inside layout

```

`parentPath` is not part of this structure: it is not a mount point but a navigation target,
read by the page itself when the user cancels or goes back.

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

### **⚙️ Default Registered Components**

Some components are registered automatically, without any configuration in the module file.

| Zone                          | Component                      | Registered by                    |
| ----------------------------- | ------------------------------ | -------------------------------- |
| `base-layout.dialogComponent` | `catalogUI/ConfirmationDialog` | `catalogUI/PageLifecycle` (init) |
| `base-layout.dialogComponent` | `catalogUI/FormDialog`         | `catalogUI/PageLifecycle` (init) |

Both dialogs are registered with `registerPluginOnce`, so they are mounted a single time even when several module
instances use `catalogUI/PageLifecycle`. This is what allows any component of a generic page to open a confirmation
or a form dialog through the `uiEventSubject` bus, without declaring anything.

---

## **📘 Configuration**

The module is configured using `ModulePageOptions`:

```ts
interface ModulePageOptions extends ModulePageLifecycleHostOptions {
  layout: string; // MF remote/component for layout
  page: string; // MF remote/component for page
  parentPath: string; // route to return to, e.g. on cancel
  pagePath: string; // route path inside the module
}

// from @linagora/linid-im-front-corelib
interface ModulePageLifecycleHostOptions {
  addNavigationMenu?: boolean; // default false
}
```

`parentPath` supports Nunjucks template interpolation with an `entity` variable, so the
path can reference fields of the entity being edited (e.g. `"/entities/{{ entity.parentId }}"`).
Generic pages render it when the user cancels or navigates back.

These options are the shared baseline. Each generic page extends `ModulePageOptions` with
its own type — `ModuleGenericCreationPageOptions`, `ModuleGenericDetailsPageOptions`, and so
on — adding page-specific options on top. See [Generic Pages](../generic-pages.md) for the
per-page contracts.

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
