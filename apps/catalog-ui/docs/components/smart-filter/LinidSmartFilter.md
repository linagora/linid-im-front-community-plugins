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

| Namespace Path                                                                        | Target           | Description                                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `{uiNamespace}.linid-smart-filter`                                                    | `q-field`        | Filter field container styling and configuration                                                            |
| `{uiNamespace}.linid-smart-filter`                                                    | `q-menu`         | Dropdown menu styling and configuration                                                                     |
| `{uiNamespace}.linid-smart-filter.iconSearch`                                         | `q-icon`         | Search icon styling                                                                                         |
| `{uiNamespace}.linid-smart-filter.iconMenuClose`                                      | `q-icon`         | Right dropdown icon styling (menu open)                                                                     |
| `{uiNamespace}.linid-smart-filter.iconMenuOpen`                                       | `q-icon`         | Right dropdown icon styling (menu closed)                                                                   |
| `{uiNamespace}.linid-smart-filter.linid-filter-chip.[FILTER]`                         | `q-chip`         | Configures the chip container that displays the selected values associated with a specific filter field.    |
| `{uiNamespace}.linid-smart-filter.linid-filter-chip.[FILTER]`                         | `q-avatar`       | Configures the avatar section of the chip, which displays the filter field name before the selected values. |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.header`                          | `q-icon`         | Icon displayed in the panel title bar                                                                       |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.header`                          | `q-separator`    | Horizontal separator below the panel title                                                                  |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content`                         | `q-list`         | Filter navigation list styling                                                                              |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content`                         | `q-item`         | Filter item styling                                                                                         |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content`                         | `q-separator`    | Vertical separator between the filter list and the editor area                                              |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content.icon-section`            | `q-item-section` | Avatar section of a filter item (icon)                                                                      |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content.label-section`           | `q-item-section` | Label section of a filter item (name)                                                                       |
| `{uiNamespace}.linid-smart-filter.linid-filter-panel.content.types.[FILTER_TYPE]`     | `q-icon`         | Icon displayed next to a filter of a given type                                                             |
| `{uiNamespace}.linid-smart-filter.text-search-filter-panel`                           | `q-input`        | Text input field styling                                                                                    |
| `{uiNamespace}.linid-smart-filter.text-search-filter-panel`                           | `q-checkbox`     | Negation checkbox styling                                                                                   |
| `{uiNamespace}.linid-smart-filter.text-search-filter-panel`                           | `q-option-group` | Operator radio group styling                                                                                |
| `{uiNamespace}.linid-smart-filter.text-search-filter-panel`                           | `q-btn`          | Search button styling                                                                                       |
| `{uiNamespace}.linid-smart-filter.number-search-filter-panel`                         | `q-input`        | Numeric input field styling                                                                                 |
| `{uiNamespace}.linid-smart-filter.number-search-filter-panel`                         | `q-checkbox`     | Negation checkbox styling                                                                                   |
| `{uiNamespace}.linid-smart-filter.number-search-filter-panel`                         | `q-option-group` | Operator radio group styling                                                                                |
| `{uiNamespace}.linid-smart-filter.number-search-filter-panel`                         | `q-btn`          | Search button styling                                                                                       |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.header`                        | `q-icon`         | Icon displayed in the panel title bar                                                                       |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.header`                        | `q-separator`    | Horizontal separator below the panel title                                                                  |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content`                       | `q-list`         | Favorites navigation list styling                                                                           |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content`                       | `q-item`         | Favorites item styling                                                                                      |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content`                       | `q-separator`    | Vertical separator between the favorites list and the editor area                                           |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.icon-section`          | `q-item-section` | Avatar section of a favorite item                                                                           |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.icon-section`          | `q-icon`         | Avatar section of a favorite item (icon)                                                                    |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.label-section`         | `q-item-section` | Label section of a favorite item (name)                                                                     |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.delete-section`        | `q-item-section` | Delete section of a favorite item                                                                           |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.delete-section`        | `q-btn`          | Delete button of a favorite item                                                                            |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.no-data-icon-section`  | `q-item-section` | Avatar section for no-data item                                                                             |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.no-data-icon-section`  | `q-icon`         | Avatar section for no-data item (icon)                                                                      |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.no-data-label-section` | `q-item-section` | Label section for no-data item (name)                                                                       |
| `{uiNamespace}.linid-smart-filter.tree-search-filter-panel`                           | `GenericTree`    | Tree component styling and configuration                                                                    |
| `{uiNamespace}.linid-smart-filter.tree-search-filter-panel`                           | `q-btn`          | Search button styling                                                                                       |

- **Design Configuration Example:** See [design.md](../../design.md#LinidSmartFilter).

---

## **Internationalization**

The component uses scoped i18n with the following translation keys:

| Key                                                                            | Description                                                  | Usage                  | Parameters |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------- | ---------- |
| `[INSTANCE_ID].LinidSmartFilter.label`                                         | Filter field label (optional)                                | Input label            | -          |
| `[INSTANCE_ID].LinidSmartFilter.hint`                                          | Helper text for the filter (optional)                        | Input hint             | -          |
| `[INSTANCE_ID].LinidSmartFilter.prefix`                                        | Input prefix (optional)                                      | Input prefix           | -          |
| `[INSTANCE_ID].LinidSmartFilter.suffix`                                        | Input suffix (optional)                                      | Input suffix           | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterChip.[FILTER].type`                 | Filter type label (optional, default filter.name)            | Filter label           | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterChip.[FILTER].separator`            | Separator between filter values                              | Filter separator label | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterPanel.title`                        | Panel section title                                          | Header title           | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.inputLabel`              | Text input label (optional, defaults to empty string)        | QInput label           | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.inputHint`               | Text input hint (optional, defaults to empty string)         | QInput hint            | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.inputPrefix`             | Text input prefix (optional, defaults to empty string)       | QInput prefix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.inputSuffix`             | Text input suffix (optional, defaults to empty string)       | QInput suffix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.negateLabel`             | Negation checkbox label                                      | QCheckbox label        | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.searchButton`            | Search button label                                          | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.contains`      | "contains" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.startsWith`    | "startsWith" operator label                                  | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.endsWith`      | "endsWith" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.equals`        | "equals" operator label                                      | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.notContains`   | Negated "contains" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.notStartsWith` | Negated "startsWith" label                                   | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.notEndsWith`   | Negated "endsWith" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.TextSearchFilterPanel.operators.notEquals`     | Negated "equals" label                                       | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.inputLabel`            | Numeric input label (optional, defaults to empty string)     | QInput label           | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.inputHint`             | Numeric input hint (optional, defaults to empty string)      | QInput hint            | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.inputPrefix`           | Numeric input prefix (optional, defaults to empty string)    | QInput prefix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.inputSuffix`           | Numeric input suffix (optional, defaults to empty string)    | QInput suffix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.negateLabel`           | Negation checkbox label                                      | QCheckbox label        | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.searchButton`          | Search button label                                          | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.inferior`    | "inferior" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.superior`    | "superior" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.equals`      | "equals" operator label                                      | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.notInferior` | Negated "inferior" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.notSuperior` | Negated "superior" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.NumberSearchFilterPanel.operators.notEquals`   | Negated "equals" label                                       | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.title`                      | Panel section title                                          | Header title           | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.noData`                     | No data panel section                                        | No data label          | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.deleteButton`               | Label for delete button (optional, defaults to empty string) | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.TreeSearchFilterPanel.searchButton`            | Search button label                                          | QBtn label             | -          |

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
      },
      "LinidFilterPanel": {
        "title": "Filter By"
      },
      "LinidFavoritePanel": {
        "title": "Favorites",
        "noData": "No available favorites",
        "deleteButton": "Delete"
      },
      "TextSearchFilterPanel": {
        "inputLabel": "Value",
        "inputHint": "Enter a value to search",
        "inputPrefix": "~",
        "inputSuffix": "*",
        "negateLabel": "Negate",
        "searchButton": "Search",
        "operators": {
          "contains": "contains",
          "startsWith": "startsWith",
          "endsWith": "endsWith",
          "equals": "equals",
          "notContains": "not contains",
          "notStartsWith": "not startsWith",
          "notEndsWith": "not endsWith"
        }
      },
      "NumberSearchFilterPanel": {
        "inputLabel": "Value",
        "inputHint": "Enter a number to search",
        "inputPrefix": "$",
        "inputSuffix": "kg",
        "negateLabel": "Negate",
        "searchButton": "Search",
        "operators": {
          "inferior": "inferior",
          "superior": "superior",
          "equals": "equals",
          "notInferior": "not inferior",
          "notSuperior": "not superior",
          "notEquals": "not equals"
        }
      },
      "TreeSearchFilterPanel": {
        "searchButton": "Search"
      }
    }
  }
}
```
