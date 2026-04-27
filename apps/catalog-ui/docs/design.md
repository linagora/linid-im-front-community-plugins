# **CatalogUI Design Configuration 🎨**

This document describes the design configuration keys available for CatalogUI components. These keys are used in the `design.json` file to customize the visual appearance of components.

> For detailed Quasar component props, see the [corelib design documentation](https://github.com/linagora/linid-im-front-corelib/blob/main/docs/ui-design.md).

---

## **📋 Overview**

CatalogUI components use a namespace-based design system. Each component appends its own identifier to the parent `uiNamespace` prop, creating a hierarchical configuration structure.

**Pattern:** `{parentNamespace}.{component-name}.{q-component}`

---

## **🔤 Placeholder Reference**

The examples in this document use placeholders that should be replaced with actual values:

| Placeholder          | Description                                              | Example                       |
| -------------------- | -------------------------------------------------------- | ----------------------------- |
| `[INSTANCE_ID]`      | The module instance identifier (same level as `default`) | `moduleUsers`                 |
| `[PAGE_NAME]`        | The page or view name within the module                  | `homepage`, `details-page`    |
| `[ROUTE_ID]`         | The route identifier for navigation menu tabs            | `moduleUsers`, `moduleGroups` |
| `[FIELD_NAME]`       | The entity attribute field name                          | `uid`, `mail`, `displayName`  |
| `[ITEM_KEY]`         | The root dropdown action key                             | `edit`, `export`, `archive`   |
| `[CHILD_KEY]`        | The nested dropdown action key                           | `csv`, `pdf`, `json`          |
| `[PARENT_NAMESPACE]` | The full namespace path passed by the parent component   | `moduleUsers.homepage`        |

---

## **🧩 Components**

### BaseLayout

The main application layout with header, toolbar, and navigation.

**Namespace:** `base-layout.header`

```json
{
  "base-layout": {
    "header": {
      "q-header": { "elevated": true },
      "q-toolbar": { "inset": false },
      "q-avatar": { "size": "md", "color": "primary" },
      "q-img": { "src": "/toolbarApplicationLogo.svg" },
      "q-toolbar-title": { "shrink": false },
      "q-badge": { "color": "primary", "floating": false }
    }
  }
}
```

---

### HeaderProfile

User profile button displayed in the application header. This component is a child of BaseLayout.

**Namespace:** `{uiNamespace}.header-profile`

```json
{
  "base-layout": {
    "header": {
      "header-profile": {
        "q-btn": { "flat": true, "round": false, "color": "white", "noCaps": true },
        "q-item-section": { "avatar": true },
        "q-item-label": { "caption": true }
      }
    }
  }
}
```

---

### NavigationMenu

Tab-based navigation menu for routing between modules. This component is a child of BaseLayout.

**Namespace:** `{uiNamespace}.navigation-menu`

```json
{
  "[PARENT_NAMESPACE]": {
    "navigation-menu": {
      "q-tabs": { "dense": false, "align": "left", "noCaps": true },
      "route-[ROUTE_ID]": {
        "q-route-tab": { "icon": "person", "noCaps": true }
      }
    }
  }
}
```

---

### GenericEntityTable

Data table for displaying entity lists.

**Namespace:** `{uiNamespace}.generic-entity-table`

```json
{
  "[PARENT_NAMESPACE]": {
    "generic-entity-table": {
      "q-table": { "dense": true, "bordered": true, "flat": true }
    }
  }
}
```

---

### InformationCard

Card component for displaying information with an optional icon.

**Namespace:** `{uiNamespace}.information-card`

```json
{
  "[PARENT_NAMESPACE]": {
    "information-card": {
      "q-card": { "flat": true, "bordered": true },
      "q-icon": { "name": "info", "color": "primary", "size": "sm" }
    }
  }
}
```

---

### ButtonsCard

Card with confirm/cancel action buttons.

**Namespace:** `{uiNamespace}.buttons-card`

```json
{
  "[PARENT_NAMESPACE]": {
    "buttons-card": {
      "q-card": { "flat": true },
      "q-icon": { "name": "save", "color": "primary" },
      "q-card-actions": { "align": "right" },
      "confirm-button": {
        "q-btn": { "color": "primary", "unelevated": true }
      },
      "cancel-button": {
        "q-btn": { "color": "negative", "outline": true }
      }
    }
  }
}
```

---

### DropdownButton

Dropdown action button supporting flat actions and one submenu level.

**Namespace:** `{uiNamespace}.dropdown-button`

```json
{
  "[PARENT_NAMESPACE]": {
    "dropdown-button": {
      "q-btn-dropdown": { "color": "primary", "outline": true, "icon": "more_vert" },
      "q-list": { "dense": true },
      "q-menu": { "autoClose": false },
      "menu-trigger": {
        "q-item-section": { "side": true },
        "q-icon": { "name": "keyboard_arrow_right", "size": "16px" }
      },
      "items": {
        "[ITEM_KEY]": {
          "q-item": { "clickable": true },
          "icon": {
            "q-item-section": { "avatar": true },
            "q-icon": { "name": "edit" }
          },
          "label": {
            "q-item-label": { "lines": 1 }
          },
          "children": {
            "[CHILD_KEY]": {
              "q-item": { "clickable": true },
              "icon": {
                "q-item-section": { "avatar": true },
                "q-icon": { "name": "description" }
              },
              "label": {
                "q-item-label": { "lines": 1 }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### EntityDetailsCard

Card for displaying entity attribute details. Fields inside the card can be configured individually.

**Namespace:** `{uiNamespace}.entity-details-card`

```json
{
  "[PARENT_NAMESPACE]": {
    "entity-details-card": {
      "q-card": { "flat": true, "bordered": true },
      "[FIELD_NAME]": {
        "information-card": {
          "q-card": { "flat": true },
          "q-icon": { "name": "info", "color": "primary" }
        }
      }
    }
  }
}
```

---

### AdvancedSearchCard

Expandable search card with default and advanced filters.

**Namespace:** `{uiNamespace}.advanced-search-card`

```json
{
  "[PARENT_NAMESPACE]": {
    "advanced-search-card": {
      "q-card": { "flat": true, "bordered": true },
      "q-icon": { "name": "search", "color": "primary" },
      "toggle-button": {
        "q-btn": { "flat": true, "dense": true }
      },
      "default-filters": {
        "fields": {
          "[FIELD_NAME]": {
            "EntityAttributeField": {
              "[FIELD_NAME]": {
                "q-input": { "outlined": true, "dense": true }
              }
            }
          }
        }
      },
      "advanced-filters": {
        "fields": {
          "[FIELD_NAME]": {
            "EntityAttributeField": {
              "[FIELD_NAME]": {
                "q-input": { "outlined": true, "dense": true }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### EntityAttributeTextField

Text input field for entity attributes.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-input": { "outlined": true, "dense": true, "clearable": true }
    }
  }
}
```

---

### EntityAttributeNumberField

Number input field for entity attributes.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-input": { "outlined": true, "dense": true, "type": "number" }
    }
  }
}
```

---

### EntityAttributeBooleanField

Toggle switch for boolean attributes.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-toggle": { "color": "primary", "dense": true }
    }
  }
}
```

---

### EntityAttributeDateField

Date picker field for date attributes.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-input": { "outlined": true, "dense": true },
      "q-icon": { "name": "event", "color": "primary" },
      "q-btn": { "flat": true, "round": true },
      "q-date": { "minimal": true, "color": "primary" }
    }
  }
}
```

---

### EntityAttributeListField

Dropdown select field for list attributes.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-select": { "outlined": true, "dense": true }
    }
  }
}
```

---

### EntityAttributeDynamicListField

Dropdown select field for dynamic list attributes with lazy loading from a backend endpoint.

**Namespace:** `{uiNamespace}` (direct, no suffix)

```json
{
  "[PARENT_NAMESPACE]": {
    "[FIELD_NAME]": {
      "q-select": { "outlined": true, "dense": true }
    }
  }
}
```

---

## **💡 Complete Configuration Example**

A full example showing all CatalogUI components configured together:

```json
{
  "default": {
    "q-btn": { "dense": true, "noCaps": true },
    "q-card": { "flat": false },
    "q-input": { "outlined": true, "dense": true },
    "q-table": { "dense": true }
  },
  "base-layout": {
    "header": {
      "q-header": { "elevated": true },
      "q-toolbar": { "inset": false },
      "q-avatar": { "size": "md", "color": "primary" },
      "q-toolbar-title": { "shrink": false },
      "q-badge": { "color": "secondary" },
      "header-profile": {
        "q-btn": { "flat": true, "color": "white", "noCaps": true },
        "q-item-section": { "avatar": true },
        "q-item-label": { "caption": true }
      },
      "navigation-menu": {
        "q-tabs": { "dense": false, "align": "left", "noCaps": true },
        "route-[ROUTE_ID]": {
          "q-route-tab": { "icon": "person", "noCaps": true }
        }
      }
    }
  },
  "[INSTANCE_ID]": {
    "[PAGE_NAME]": {
      "advanced-search-card": {
        "q-card": { "flat": true, "bordered": true },
        "q-icon": { "name": "search", "color": "primary" },
        "toggle-button": {
          "q-btn": { "flat": true, "icon": "tune" }
        },
        "default-filters": {
          "fields": {
            "[FIELD_NAME]": {
              "EntityAttributeField": {
                "[FIELD_NAME]": {
                  "q-input": { "outlined": true, "dense": true }
                }
              }
            }
          }
        },
        "advanced-filters": {
          "fields": {
            "[FIELD_NAME]": {
              "EntityAttributeField": {
                "[FIELD_NAME]": {
                  "q-input": { "outlined": true, "dense": true }
                }
              }
            }
          }
        }
      },
      "generic-entity-table": {
        "q-table": { "dense": true, "bordered": true, "flat": true }
      },
      "entity-details-card": {
        "q-card": { "flat": true, "bordered": true },
        "[FIELD_NAME]": {
          "information-card": {
            "q-card": { "flat": true },
            "q-icon": { "name": "info", "color": "info" }
          }
        }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "confirm-button": {
          "q-btn": { "color": "primary", "icon": "save" }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      },
      "dropdown-button": {
        "q-btn-dropdown": { "color": "primary", "outline": true, "icon": "more_vert" },
        "q-list": { "dense": true },
        "q-menu": { "autoClose": false },
        "menu-trigger": {
          "q-item-section": { "side": true },
          "q-icon": { "name": "keyboard_arrow_right" }
        },
        "items": {
          "edit": {
            "q-item": { "clickable": true },
            "label": {
              "q-item-label": { "lines": 1 }
            }
          },
          "export": {
            "children": {
              "csv": {
                "q-item": { "clickable": true }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## **📚 Related Documentation**

- **Quasar Component Props:** See corelib documentation for detailed props of each Quasar component (q-btn, q-card, q-input, etc.)
- **useUiDesign Composable:** Available from `@linagora/linid-im-front-corelib`
