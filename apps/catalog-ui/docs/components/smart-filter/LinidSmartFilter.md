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

| Prop               | Type                                                         | Required | Default | Description                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------ | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uiNamespace`      | `string`                                                     | Yes      | -       | UI design namespace for styling and configuring the component through the design system.                                                                                                             |
| `i18nScope`        | `string`                                                     | Yes      | -       | i18n scope for localizing strings within the component.                                                                                                                                              |
| `filters`          | `LinidFilter[]`                                              | No       | -       | Active filters currently applied. This is the controlled state: the parent passes back the array received from `update:filters`. Only filters with non-empty values are included.                    |
| `options`          | `{ filters?: LinidFilter[]; filterSets?: LinidFilterSet[] }` | No       | -       | Available filter definitions (`options.filters`) and saved filter configurations (`options.filterSets`). `options.filters` is the full catalog of filters the user can apply.                        |
| `isMenuPersistent` | `boolean`                                                    | No       | `false` | When `true`, the dropdown menu ignores outside clicks and stays open. Useful when a dialog opened from inside the menu (e.g. a confirmation or form dialog) would otherwise cause the menu to close. |

---

## **Events**

| Event               | Payload          | Description                                                                                                                               |
| ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `update:filters`    | `LinidFilter[]`  | Emitted whenever the user applies or removes a filter. The payload contains only the filters that have at least one active value applied. |
| `apply:favorite`    | `LinidFilterSet` | Emitted when a favorite filter set is applied. The payload contains the applied favorite filter set.                                      |
| `delete:favorite`   | `LinidFilterSet` | Emitted when a favorite filter set is deleted. The payload contains the deleted favorite filter set.                                      |
| `create:favorite`   | -                | Emitted when the user wants to create a new favorite filter set.                                                                          |
| `override:favorite` | -                | Emitted when the user wants to override an existing favorite filter set.                                                                  |

---

## **Architecture Overview**

The component separates two concerns that are easy to conflate:

- **`options.filters`** defines _which filters exist_ — their type, their label, and any type-specific configuration (e.g. the list of items for a `list` filter). This is the catalog. It is provided once by the parent and never changes at runtime.
- **`filters`** carries _which filters are active_ — only those to which the user has applied at least one value. This is the controlled state: the parent receives it via `update:filters` and passes it back as a prop on the next render.

When the user applies or removes a filter, the component emits `update:filters`. The parent must pass the updated array back via the `filters` prop for the chips to reflect the new state.

### Component structure

```
LinidSmartFilter
├── Search field (always visible)
│   ├── Search icon (left)
│   ├── Active filter chips (one per applied filter)
│   └── Dropdown arrow (right)
└── Dropdown menu (opens on click)
    └── Filter panel
        ├── Filter list (left column — one entry per available filter)
        └── Filter editor (right column — changes based on the selected filter type)
```

---

## **Filter Type → Panel Mapping**

When the user selects a filter in the left column, the editor on the right displays a panel adapted to the filter's type:

| Filter type | Editor UI                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------- |
| `text`      | Text input with operator options (contains, starts with, …) and a negation toggle           |
| `number`    | Numeric input with operator options (less than, greater than, equals) and a negation toggle |
| `date`      | Date input with a date picker, operator options, and a negation toggle                      |
| `list`      | Checkbox list of predefined items                                                           |
| `tree`      | Hierarchical tree selector                                                                  |

Switching from one filter to another always resets the editor to its initial state, even if both filters share the same type.

---

## **Event Flow**

### Applying a filter

1. The user selects a filter in the left column, fills in the editor, and clicks **Search**.
2. The component emits `update:filters` with all currently active filters (including the newly applied one).
3. The parent updates its state and passes the new array back as `:filters`.
4. The chip for that filter appears.
5. The menu closes and the filter selection is reset — reopening the menu shows no filter pre-selected.

### Switching between filters

1. The user clicks a different filter name in the left column.
2. The editor on the right is replaced with a fresh panel for the newly selected filter.
3. Any previously typed values in the old panel are discarded — they are not applied until the user explicitly clicks **Search**.

### Closing the menu without applying

If the user closes the menu without clicking **Search** (clicking outside, pressing Escape), the filter selection is reset. Reopening the menu shows no filter pre-selected, and any values typed in the editor are lost.

---

## **Chip Lifecycle**

Each applied filter is displayed as a chip in the search field. The chip shows the filter label and its current value(s).

**A chip appears** when the user clicks **Search** in the editor with at least one value entered — a new, independent chip, even if a chip for the same filter already exists. Searching the same filter multiple times produces multiple separate chips, each with its own value(s), rather than merging into a single chip. Clicking **Search** with an empty editor has no effect — no chip is created.

**A chip disappears** when the user clicks × on it. This is the only way to remove an active filter. The filter's values are cleared and `update:filters` is emitted with the remaining active filters.

---

## **Example Usage**

### Minimal

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LinidFilter, LinidFilterSet } from '@linagora/linid-im-front-corelib';

const filters = ref([]);

const filterDefinitions = [new LinidFilter('firstname', 'text', { fieldName: 'firstname' }, []), new LinidFilter('lastname', 'text', { fieldName: 'lastname' }, [])];
const filterSet = [new LinidFilterSet('id', 'label', [])];

function onUpdateFilters(updated) {
  filters.value = updated;
}
</script>

<template>
  <linid-smart-filter
    ui-namespace="myApp"
    i18n-scope="myScope"
    :filters="filters"
    :options="{ filters: filterDefinitions, filterSet: filterSets }"
    @update:filters="onUpdateFilters"
  />
</template>
```

### With all filter types

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { LinidFilter, LinidFilterSet } from '@linagora/linid-im-front-corelib';

const filters = ref([]);

const filterDefinitions = [
  new LinidFilter('username', 'text', { fieldName: 'username' }, []),
  new LinidFilter('age', 'number', { fieldName: 'age' }, []),
  new LinidFilter('createdAt', 'date', { fieldName: 'createdAt', maskI18NKey: 'application.dateFormat' }, []),
  new LinidFilter(
    'status',
    'list',
    {
      fieldName: 'status',
      items: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Deactivated', value: 'deactivated' },
      ],
    },
    []
  ),
  new LinidFilter(
    'ou',
    'tree',
    {
      fieldName: 'ou',
      items: [{ type: 'ou', key: 'ou=root', value: 'Root', nodes: [{ type: 'ou', key: 'ou=engineering', value: 'Engineering', nodes: [] }] }],
    },
    []
  ),
];
const filterSet = [new LinidFilterSet('id', 'label', [])];
</script>

<template>
  <linid-smart-filter
    ui-namespace="myApp"
    i18n-scope="myScope"
    :filters="filters"
    :options="{ filters: filterDefinitions, filterSet: filterSets }"
    @update:filters="filters = $event"
  />
</template>
```

> **Note:** `LinidFilter` auto-generates a stable `id` via `crypto.randomUUID()` at construction time. Define the filter instances once (outside `setup` or in a constant) to prevent `id` regeneration on every render — each active filter chip is keyed by `id`, so regeneration would cause the chip list to unnecessarily re-render.

---

## **Types**

All types are exported from the component's type definition file:

### `LinidSmartFilterProps`

Extends `CommonComponentProps` from the corelib:

```typescript
export interface LinidSmartFilterProps extends CommonComponentProps {
  /**
   * Active filters currently applied. Only filters with non-empty values are included.
   * This is the controlled state: the parent passes back the value received from `update:filters`.
   */
  filters?: LinidFilter[];

  /**
   * Available filter definitions and saved filter sets.
   */
  options?: {
    /**
     * Full catalog of filters the user can apply. Each entry defines the filter type,
     * its field name, and any type-specific options (e.g. list items, date mask).
     */
    filters?: LinidFilter[];

    /**
     * Saved search configurations the user can restore.
     */
    filterSets?: LinidFilterSet[];
  };

  /**
   * Determines whether the filter menu should remain open.
   * Set to `true` before opening a dialog triggered from inside the menu to prevent
   * the menu from closing when focus moves to the dialog. Reset to `false` in the
   * dialog's `afterClose` callback.
   */
  isMenuPersistent?: boolean;
}
```

### `LinidSmartFilterOutputs`

```typescript
export type LinidSmartFilterOutputs = {
  /**
   * Emitted when the user applies or removes a filter.
   * The payload contains only the filters with at least one active value.
   */
  (e: 'update:filters', filters: LinidFilter[]): void;
};
```

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()` and applies props to Quasar components:

| Namespace Path                                                                        | Target           | Description                                                                                                 |
| ------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `{uiNamespace}.linid-smart-filter`                                                    | `q-field`        | Filter field container styling and configuration                                                            |
| `{uiNamespace}.linid-smart-filter`                                                    | `q-menu`         | Dropdown menu styling and configuration                                                                     |
| `{uiNamespace}.linid-smart-filter`                                                    | `q-separator`    | Separator between panel in menu.                                                                            |
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
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel`                           | `q-list`         | List items container styling                                                                                |
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel`                           | `q-item`         | List item styling                                                                                           |
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel.checkboxSection`           | `q-item-section` | Checkbox area styling                                                                                       |
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel.checkboxSection`           | `q-checkbox`     | Checkbox styling                                                                                            |
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel.labelSection`              | `q-item-section` | Label area styling                                                                                          |
| `{uiNamespace}.linid-smart-filter.list-search-filter-panel`                           | `q-btn`          | Search button styling                                                                                       |
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
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.create-button`         | `q-btn`          | Create favorite button styling                                                                              |
| `{uiNamespace}.linid-smart-filter.linid-favorite-panel.content.override-button`       | `q-btn`          | Override favorite button styling                                                                            |
| `{uiNamespace}.linid-smart-filter.tree-search-filter-panel`                           | `GenericTree`    | Tree component styling and configuration                                                                    |
| `{uiNamespace}.linid-smart-filter.tree-search-filter-panel`                           | `q-btn`          | Search button styling                                                                                       |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-input`        | Date text input field styling                                                                               |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-icon`         | Calendar icon trigger styling                                                                               |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-date`         | Date picker styling                                                                                         |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-checkbox`     | Negation checkbox styling                                                                                   |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-option-group` | Operator radio group styling                                                                                |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel`                           | `q-btn`          | Search button styling                                                                                       |
| `{uiNamespace}.linid-smart-filter.date-search-filter-panel.close`                     | `q-btn`          | Date picker close button styling                                                                            |

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
| `[INSTANCE_ID].LinidSmartFilter.LinidFilterPanel.columnFilter.[columnName]`    | Column filter label                                          | Column filter label    | -          |
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
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.createFavorite`             | Label for create button                                      | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.overrideFavorite`           | Label for override button                                    | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.LinidFavoritePanel.deleteButton`               | Label for delete button (optional, defaults to empty string) | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.TreeSearchFilterPanel.searchButton`            | Search button label                                          | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.TreeSearchFilterPanel.errorLoadingData`        | Error message when failing to load tree data                 | Notification message   | -          |
| `[INSTANCE_ID].LinidSmartFilter.ListSearchFilterPanel.searchButton`            | Search button label                                          | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.inputLabel`              | Date input label (optional, defaults to empty string)        | QInput label           | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.inputHint`               | Date input hint (optional, defaults to empty string)         | QInput hint            | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.inputPrefix`             | Date input prefix (optional, defaults to empty string)       | QInput prefix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.inputSuffix`             | Date input suffix (optional, defaults to empty string)       | QInput suffix          | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.negateLabel`             | Negation checkbox label                                      | QCheckbox label        | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.close`                   | Date picker close button label                               | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.searchButton`            | Search button label                                          | QBtn label             | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.inferior`      | "inferior" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.superior`      | "superior" operator label                                    | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.equals`        | "equals" operator label                                      | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.notInferior`   | Negated "inferior" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.notSuperior`   | Negated "superior" label                                     | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.operators.notEquals`     | Negated "equals" label                                       | Radio option label     | -          |
| `[INSTANCE_ID].LinidSmartFilter.DateSearchFilterPanel.validation.invalidDate`  | Invalid date format error message                            | QInput validation rule | `format`   |

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
        "createFavorite": "Create Favorite",
        "overrideFavorite": "Override Favorite",
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
        "searchButton": "Search",
        "errorLoadingData": "Failed to load tree data."
      },
      "ListSearchFilterPanel": {
        "searchButton": "Search"
      },
      "DateSearchFilterPanel": {
        "inputLabel": "Date",
        "inputHint": "Select or enter a date",
        "inputPrefix": "≥",
        "inputSuffix": "(UTC)",
        "negateLabel": "Negate",
        "close": "Close",
        "searchButton": "Search",
        "operators": {
          "inferior": "inferior",
          "superior": "superior",
          "equals": "equals",
          "notInferior": "not inferior",
          "notSuperior": "not superior",
          "notEquals": "not equals"
        },
        "validation": {
          "invalidDate": "Invalid date. Expected format: {format}"
        }
      }
    }
  }
}
```
