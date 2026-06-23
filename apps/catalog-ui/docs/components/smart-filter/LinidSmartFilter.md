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

| Namespace Path                                   | Target    | Description                                      |
| ------------------------------------------------ | --------- | ------------------------------------------------ |
| `{uiNamespace}.linid-smart-filter`               | `q-field` | Filter field container styling and configuration |
| `{uiNamespace}.linid-smart-filter`               | `q-menu`  | Dropdown menu styling and configuration          |
| `{uiNamespace}.linid-smart-filter.iconSearch`    | `q-icon`  | Search icon styling                              |
| `{uiNamespace}.linid-smart-filter.iconMenuClose` | `q-icon`  | Right dropdown icon styling (menu open)          |
| `{uiNamespace}.linid-smart-filter.iconMenuOpen`  | `q-icon`  | Right dropdown icon styling (menu closed)        |

- **Design Configuration Example:** See [design.md](../../design.md#LinidSmartFilter).

---
