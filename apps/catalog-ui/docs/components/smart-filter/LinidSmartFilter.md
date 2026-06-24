# **LinidSmartFilter**

The **LinidSmartFilter** component provides a filtering interface with a toggle-able menu. It allows users to select and manage active filters, and save filter configurations.

---

## **Purpose**

- Provide a reusable filtering component for search and data filtering
- Support dynamic filter options and saved filter sets
- Manage the relationship between available filters, active filters, and saved configurations
- Provide a consistent UI/UX for filtering across the application

---

## **Props**

| Prop          | Type                                                         | Required | Default | Description                                                                              |
| ------------- | ------------------------------------------------------------ | -------- | ------- | ---------------------------------------------------------------------------------------- |
| `uiNamespace` | `string`                                                     | Yes      | -       | UI design namespace for styling and configuring the component through the design system. |
| `i18nScope`   | `string`                                                     | Yes      | -       | i18n scope for localizing strings within the component.                                  |
| `filters`     | `LinidFilter[]`                                              | Yes      | -       | Array of currently active filters. Represents the filter state applied to data.          |
| `options`     | `{ filters?: LinidFilter[]; filterSets?: LinidFilterSet[] }` | Yes      | -       | Available filter definitions and saved filter configurations.                            |

---

## **Events**

Currently, the `LinidSmartFilter` component does not emit custom events.

---

## **Types**

All types are exported from the component's type definition file:

### `LinidSmartFilterProps`

Extends `CommonComponentProps` from the corelib:

```typescript
export interface LinidSmartFilterProps extends CommonComponentProps {
  /**
   * Represents the active filter state
   */
  filters?: LinidFilter[];

  /**
   * Available filter definitions and saved filter sets.
   */
  options?: {
    /**
     * Represents all usable filters.
     */
    filters?: LinidFilter[];

    /**
     * Represents saved search configurations.
     */
    filterSets?: LinidFilterSet[];
  };
}
```

## **UI Customization**

The component uses the LinID design system through `useUiDesign()` and applies props to Quasar components:

| Namespace Path                                                | Target     | Description                                                                                                 |
| ------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `{uiNamespace}.linid-smart-filter`                            | `q-field`  | Filter field container styling and configuration                                                            |
| `{uiNamespace}.linid-smart-filter`                            | `q-menu`   | Dropdown menu styling and configuration                                                                     |
| `{uiNamespace}.linid-smart-filter.iconSearch`                 | `q-icon`   | Search icon styling                                                                                         |
| `{uiNamespace}.linid-smart-filter.iconMenuClose`              | `q-icon`   | Right dropdown icon styling (menu open)                                                                     |
| `{uiNamespace}.linid-smart-filter.iconMenuOpen`               | `q-icon`   | Right dropdown icon styling (menu closed)                                                                   |
| `{uiNamespace}.linid-smart-filter.linid-filter-chip.[FILTER]` | `q-chip`   | Configures the chip container that displays the selected values associated with a specific filter field.    |
| `{uiNamespace}.linid-smart-filter.linid-filter-chip.[FILTER]` | `q-avatar` | Configures the avatar section of the chip, which displays the filter field name before the selected values. |

- **Design Configuration Example:** See [design.md](../../design.md#LinidSmartFilter).

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

| Key                                                                 | Description                                       | Usage                  | Parameters |
| ------------------------------------------------------------------- | ------------------------------------------------- | ---------------------- | ---------- |
| `[INSTANCE_ID].LinidSmartFilter.label`                              | Filter field label (optional)                     | Input label            | -          |
| `[INSTANCE_ID].LinidSmartFilter.hint`                               | Helper text for the filter (optional)             | Input hint             | -          |
| `[INSTANCE_ID].LinidSmartFilter.prefix`                             | Input prefix (optional)                           | Input prefix           | -          |
| `[INSTANCE_ID].LinidSmartFilter.suffix`                             | Input suffix (optional)                           | Input suffix           | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterChip.[FILTER].type`      | Filter type label (optional, default filter.name) | Filter label           | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterChip.[FILTER].separator` | Separator between filter values                   | Filter separator label | -          |

Example:

```json
{
  "[INSTANCE_ID]": {
    "LinidSmartFilter": {
      "label": "Search",
      "hint": "Enter your search criteria",
      "prefix": "",
      "suffix": "",
      "LinidFilterChip": {
        "[FILTER]": {
          "type": "Filter name",
          "separator": "or"
        }
      }
    }
  }
}
```
