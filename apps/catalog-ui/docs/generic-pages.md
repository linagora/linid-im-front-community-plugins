# Catalog UI - Generic Pages

This document lists the generic pages provided by `catalog-ui` and the zones they expose.

Generic pages are fully driven by the module host configuration: a module declares which page it uses through the
`options.page` property, and injects its own components into the page zones through the `zones` property.

> **📋 Status:** Zones reflect the current implementation of the generic pages.

---

## **📋 Overview**

| Page                                                  | Exposed as                      | Purpose                                                        |
| ----------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| [GenericTablePage](./pages/GenericTablePage.md)       | `catalogUI/GenericTablePage`    | Paginated, filterable list of entities                         |
| [GenericDetailsPage](./pages/GenericDetailsPage.md)   | `catalogUI/GenericDetailsPage`  | Details of a single entity, grouped in sections                |
| [GenericCreationPage](./pages/GenericCreationPage.md) | `catalogUI/GenericCreationPage` | Creation of a single entity, with fields grouped in sections   |
| [GenericEditionPage](./pages/GenericEditionPage.md)   | `catalogUI/GenericEditionPage`  | Edition of an existing entity, with fields grouped in sections |

These pages are used together with the generic page modules documented in
[GenericPageModule.md](./modules/GenericPageModule.md).

---

## **🧩 Zones**

Zones are injection points rendered by `LinidZoneRenderer`. The host application or any other module can register components into them, either as federated plugins (`registerPlugin`) or as local Vue components (`registerComponent`).

All zone names are prefixed by the `instanceId` of the module instance rendering the page, ensuring that multiple instances of the same generic page expose distinct zone namespaces.

### Default Zones

Most generic pages expose a common set of zones that can be used to extend the page layout without modifying the page implementation.

| Zone                          | Location                 | Typical Use                        |
| ----------------------------- | ------------------------ | ---------------------------------- |
| `{instanceId}.header.before`  | Before the entire header | Page-level banners                 |
| `{instanceId}.header.prefix`  | Before the page title    | Icons, avatars                     |
| `{instanceId}.header.suffix`  | After the page title     | Status badges, indicators          |
| `{instanceId}.header.actions` | Header actions area      | Additional navigation or actions   |
| `{instanceId}.header.after`   | After the entire header  | Contextual action panels           |
| `{instanceId}.content.before` | Before the main content  | Warnings, banners, helper content  |
| `{instanceId}.content.after`  | After the main content   | Related content, additional panels |

These zones represent the default extension points used throughout the generic page framework.

A specific page may:

- expose additional page-specific zones;
- omit some of the default zones when they are not relevant to its layout;
- provide additional props to one or more zones.

Any deviations from the default zone model are documented in the corresponding page documentation.

---

## **📝 Configuring a Zone**

Zones are declared in the `zones` property of the module host configuration:

```json
{
  "instanceId": "moduleApplicationDetailsPage",
  "remoteName": "catalogUI",
  "lifecycleRemote": "catalogUI/PageLifecycle",
  "routesRemote": "catalogUI/PageRoutes",
  "apiEndpoint": "applications",
  "basePath": "/applications",
  "zones": [
    {
      "zone": "moduleApplicationDetailsPage.header.suffix",
      "plugin": "myModule/ApplicationStatusBadge"
    },
    {
      "zone": "moduleApplicationDetailsPage.content.after",
      "plugin": "myModule/ApplicationRulesTable",
      "props": {
        "endpoint": "/applications/{{ entity.id }}/rules"
      }
    }
  ],
  "options": {
    "layout": "catalogUI/BaseLayout",
    "page": "catalogUI/GenericDetailsPage",
    "pagePath": ":id",
    "sections": []
  }
}
```

Each entry declares the target `zone`, the `plugin` to render, and the `props` passed to it. The props declared here
are merged with the props forwarded by the page itself.

### Registering a local component

Module configuration files can only declare federated plugins. To render a component that is not exposed through
Module Federation — a local component of the module itself — register it programmatically in the module lifecycle
with `registerComponent`:

```typescript
import { useLinidZoneStore } from '@linagora/linid-im-front-corelib';
import ApplicationStatusBadge from './components/ApplicationStatusBadge.vue';

/**
 * Registers the module components in the zones of the generic pages.
 * @param config - The host configuration associated with this module instance.
 */
export function postInit(config: ModuleHostConfig<unknown>) {
  const linidZoneStore = useLinidZoneStore();
  const zone = `${config.instanceId}.header.suffix`;

  linidZoneStore.registerComponent(zone, ApplicationStatusBadge, {
    instanceId: config.instanceId,
  });
}
```

Unlike `registerPlugin`, which has a `registerPluginOnce` variant, `registerComponent` has no deduplicating
counterpart: calling it twice for the same zone renders the component twice.

---

## **📚 Related Documentation**

- [GenericTablePage](./pages/GenericTablePage.md) — table page component
- [GenericDetailsPage](./pages/GenericDetailsPage.md) — details page component
- [GenericCreationPage](./pages/GenericCreationPage.md) — creation page component
- [GenericEditionPage](./pages/GenericEditionPage.md) — edition page component
- [GenericPageModule](./modules/GenericPageModule.md) — page routes and lifecycle federation modules
- [Design Configuration](./design.md) — UI design namespaces
- [Translation Keys](./i18n.md) — i18n scopes
