# **Module Import Design Configuration 🎨**

This document describes the design configuration keys available for the **Import module**. These keys are used in the `design.json` file to customize the visual appearance of the module pages.

> For CatalogUI component configuration, see the [CatalogUI design documentation](../../catalog-ui/docs/design.md).
> For detailed Quasar component props, see the [corelib design documentation](https://github.com/linagora/linid-im-front-corelib/blob/main/docs/ui-design.md).

---

## **📋 Overview**

The Import module uses a namespace-based design system where each page defines its own namespace derived from the module instance ID.

**Pattern:** `{instanceId}.{page-name}.{element}`

The `instanceId` corresponds to the module instance identifier (e.g., `moduleImport`) configured in the host application. It is a top-level key in `design.json`, at the same level as `default`.

---

## **📄 Pages**

### ImportPage

The main page for uploading and importing CSV files.

**Namespace:** `{instanceId}.import-page`

**Module-specific keys:** _(currently empty)_

```json
{
  "moduleImport": {
    "import-page": {
      "import-card": {
        "q-card": {}
      },
      "load-files-field": {
        "q-file": {}
      },
      "imported-data-table": {
        "q-table": {},
        "q-spinner": {},
        "expand-button-open": {
          "q-btn": {}
        },
        "expand-button-close": {
          "q-btn": {}
        },
        "delete-button": {
          "q-btn": {}
        },
        "READY": {
          "q-badge": {}
        },
        "IMPORTING": {
          "q-badge": {}
        },
        "IMPORTED": {
          "q-badge": {}
        },
        "ERROR": {
          "q-badge": {}
        }
      },
      "buttons-card": {
        "q-card": {},
        "q-icon": {},
        "q-card-actions": {},
        "confirm-button": {
          "q-btn": {}
        },
        "cancel-button": {
          "q-btn": {}
        },
        "clear-button": {
          "q-btn-dropdown": {},
          "q-list": {},
          "q-item": {},
          "q-item-section": {},
          "q-item-label": {}
        }
      }
    }
  }
}
```

## **🧩 Components**

### ImportButton

The button to go to ImportPage

**Namespace:** `{instanceId}.import-button`

**Module-specific keys:** _(currently empty)_

```json
{
  "moduleUsers": {
    "import-button": {
      "q-btn": {}
    }
  }
}
```

---

## **📚 Related Documentation**

- **CatalogUI Components:** See [CatalogUI design documentation](../../catalog-ui/docs/design.md)
- **Quasar Component Props:** See corelib documentation for detailed props of each Quasar component
- **useUiDesign Composable:** Available from `@linagora/linid-im-front-corelib`
