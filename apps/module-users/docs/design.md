# **Module Users Design Configuration 🎨**

This document describes the design configuration keys available for the Users module. These keys are used in the `design.json` file to customize the visual appearance of the module pages.

> For CatalogUI component configuration, see the [CatalogUI design documentation](../../catalog-ui/docs/design.md).
>
> For detailed Quasar component props, see the [corelib design documentation](https://github.com/linagora/linid-im-front-corelib/blob/main/docs/ui-design.md).

---

## **📋 Overview**

The Users module uses a namespace-based design system where each page defines its own namespace derived from the module instance ID.

**Pattern:** `{instanceId}.{page-name}.{element}`

The `instanceId` corresponds to the module instance identifier (e.g., `moduleUsers`) configured in the host application. It is a top-level key in `design.json`, at the same level as `default`.

---

## **📄 Pages**

### HomePage

The main page displaying the users list in a table.

**Namespace:** `{instanceId}.homepage`

**Module-specific keys:**

| Key             | Quasar Component | Description                              |
| --------------- | ---------------- | ---------------------------------------- |
| `see-button`    | q-btn            | Button to navigate to user details page. |
| `create-button` | q-btn            | Button to navigate to user creation page |

**CatalogUI components used:**

- `GenericEntityTable` - configured via `{instanceId}.homepage.generic-entity-table`
- `AdvancedSearchCard` - configured via `{instanceId}.homepage.advanced-search-card`
- `ButtonsCard` - configured via `{instanceId}.homepage.buttons-card`

```json
{
  "moduleUsers": {
    "homepage": {
      "see-button": {
        "q-btn": { "color": "primary", "flat": true, "dense": true }
      },
      "create-button": {
        "q-btn": { "color": "positive", "unelevated": true }
      },
      "generic-entity-table": {
        "q-table": { "dense": true, "bordered": true }
      },
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
}
```

---

### UserDetailsPage

Page displaying detailed information about a specific user.

**Namespace:** `{instanceId}.user-details-page`

**Module-specific keys:**

| Key           | Quasar Component | Description                          |
| ------------- | ---------------- | ------------------------------------ |
| `edit-button` | q-btn            | Button to navigate to edit user page |

**CatalogUI components used:**

- `EntityDetailsCard` - configured via `{instanceId}.user-details-page.entity-details-card`
- `ButtonsCard` - configured via `{instanceId}.user-details-page.buttons-card`

```json
{
  "moduleUsers": {
    "user-details-page": {
      "edit-button": {
        "q-btn": { "color": "primary", "unelevated": true }
      },
      "entity-details-card": {
        "q-card": { "flat": true, "bordered": true },
        "[FIELD_NAME]": {
          "information-card": {
            "q-card": { "flat": true },
            "q-icon": { "name": "info", "color": "primary" }
          }
        }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "edit", "color": "primary" },
        "confirm-button": {
          "q-btn": { "color": "primary", "unelevated": true }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    }
  }
}
```

---

### EditUserPage

Page for editing an existing user with multi-section forms.

**Namespace:** `{instanceId}.edit-user-page`

**Module-specific keys:**

| Key                        | Quasar Component | Description                                                                     |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `form-section-{sectionId}` | q-card           | Card container for each form section. Replace `{sectionId}` with the section ID |

**CatalogUI components used:**

- `ButtonsCard` - configured via `{instanceId}.edit-user-page.buttons-card`
- `EntityAttributeField` - configured via `{instanceId}.edit-user-page.form-section-{sectionId}.EntityAttributeField`

**Notes:**

- Each form section defined in `formSections` configuration can be styled individually using `form-section-{sectionId}`
- Fields within sections use `EntityAttributeField` component which can be customized per field

```json
{
  "moduleUsers": {
    "edit-user-page": {
      "form-section-basicInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "firstName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "lastName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "email": {
            "q-input": { "outlined": true, "dense": true }
          }
        }
      },
      "form-section-additionalInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "phoneNumber": {
            "q-input": { "outlined": true, "dense": true }
          },
          "active": {
            "q-checkbox": { "dense": true }
          }
        }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "save", "color": "primary" },
        "confirm-button": {
          "q-btn": { "color": "primary", "unelevated": true, "icon": "save" }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    }
  }
}
```

---

### NewUserPage

Page for creating a new user with multi-section forms.

**Namespace:** `{instanceId}.new-user-page`

**Module-specific keys:**

| Key                        | Quasar Component | Description                                                                     |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `form-section-{sectionId}` | q-card           | Card container for each form section. Replace `{sectionId}` with the section ID |

**CatalogUI components used:**

- `ButtonsCard` - configured via `{instanceId}.new-user-page.buttons-card`
- `EntityAttributeField` - configured via `{instanceId}.new-user-page.form-section-{sectionId}.EntityAttributeField`

**Notes:**

- Each form section defined in `formSections` configuration can be styled individually using `form-section-{sectionId}`
- Fields within sections use `EntityAttributeField` component which can be customized per field

```json
{
  "moduleUsers": {
    "new-user-page": {
      "form-section-basicInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "firstName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "lastName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "email": {
            "q-input": { "outlined": true, "dense": true }
          }
        }
      },
      "form-section-additionalInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "phoneNumber": {
            "q-input": { "outlined": true, "dense": true }
          },
          "active": {
            "q-checkbox": { "dense": true }
          }
        }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "add", "color": "positive" },
        "confirm-button": {
          "q-btn": { "color": "positive", "unelevated": true, "icon": "add" }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    }
  }
}
```

---

## **💡 Complete Configuration Example**

A full example showing all Users module pages configured together:

```json
{
  "moduleUsers": {
    "homepage": {
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "add", "color": "positive" }
      },
      "create-button": {
        "q-btn": { "color": "positive", "unelevated": true }
      },
      "generic-entity-table": {
        "q-table": { "dense": true, "bordered": true, "flat": true }
      },
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
      },
      "see-button": {
        "q-btn": { "color": "primary", "flat": true, "dense": true }
      }
    },
    "user-details-page": {
      "edit-button": {
        "q-btn": { "color": "primary", "unelevated": true }
      },
      "entity-details-card": {
        "q-card": { "flat": true, "bordered": true },
        "[FIELD_NAME]": {
          "information-card": {
            "q-card": { "flat": true },
            "q-icon": { "name": "info", "color": "primary" }
          }
        }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "edit", "color": "primary" },
        "confirm-button": {
          "q-btn": { "color": "primary", "unelevated": true }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    },
    "edit-user-page": {
      "form-section-basicInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "firstName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "lastName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "email": {
            "q-input": { "outlined": true, "dense": true }
          }
        }
      },
      "form-section-additionalInfo": {
        "q-card": { "flat": true, "bordered": true }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "save", "color": "primary" },
        "confirm-button": {
          "q-btn": { "color": "primary", "unelevated": true, "icon": "save" }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    },
    "new-user-page": {
      "form-section-basicInfo": {
        "q-card": { "flat": true, "bordered": true },
        "EntityAttributeField": {
          "firstName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "lastName": {
            "q-input": { "outlined": true, "dense": true }
          },
          "email": {
            "q-input": { "outlined": true, "dense": true }
          }
        }
      },
      "form-section-additionalInfo": {
        "q-card": { "flat": true, "bordered": true }
      },
      "buttons-card": {
        "q-card": { "flat": true },
        "q-icon": { "name": "add", "color": "positive" },
        "confirm-button": {
          "q-btn": { "color": "positive", "unelevated": true, "icon": "add" }
        },
        "cancel-button": {
          "q-btn": { "color": "negative", "outline": true }
        }
      }
    }
  }
}
```

---

## **📚 Related Documentation**

- **CatalogUI Components:** See [CatalogUI design documentation](../../catalog-ui/docs/design.md) for detailed component configuration
- **Quasar Component Props:** See corelib documentation for detailed props of each Quasar component
- **useUiDesign Composable:** Available from `@linagora/linid-im-front-corelib`
