# **GenericTablePage**

The **GenericTablePage** component provides a reusable, federated page template for displaying and managing tabular data.

It is designed to work with Module Federation-based modules and relies on a host-provided configuration to dynamically render:

- table structure
- data loading
- navigation behavior
- optional action panel
- optional, URL-synced filter panel

---

## **Purpose**

- Provide a standard table-based page layout across modules
- Abstract pagination, data fetching, and routing logic
- Integrate seamlessly with Module Federation configuration
- Support optional actions via a configurable action card
- Support optional filtering via a configurable smart filter, synced with the URL
- Enable consistent navigation to entity creation and detail pages
- Ensure full compatibility with Quasar QTable ecosystem

---

## **Configuration**

The component is driven by `ModuleGenericTablePageOptions`:

```ts
interface ModuleGenericTablePageOptions {
  idKey: string;
  columns: QTableColumn[];
  enableActions: boolean;
  creationPagePath: string;
  keepQueryParams?: string[];
  filters?: LinidFilter[];
}
```

### **Options**

| Option             | Type             | Description                                                                                             |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `idKey`            | `string`         | Key used to identify each row and build detail routes                                                   |
| `columns`          | `QTableColumn[]` | Table column definitions (Quasar format)                                                                |
| `enableActions`    | `boolean`        | Enables or disables the actions card above the table                                                    |
| `creationPagePath` | `string`         | Route path used for the "create" button navigation                                                      |
| `keepQueryParams`  | `string[]`       | Optional. URL query parameter keys to preserve as-is when the active filters are synced to the URL      |
| `filters`          | `LinidFilter[]`  | Optional. Filter definitions rendered by `LinidSmartFilter`. Omitted or empty disables the smart filter |

---

## **Layout Structure**

The page is composed of four main sections:

### **1. Header (optional)**

Displayed only if a translation key `title` exists.

- Title is resolved via scoped i18n (`instanceId`)
- Rendered as a page header

---

### **2. Actions Section (optional)**

Rendered only when `enableActions = true`.

Includes:

- `ButtonsCard` (local `catalog-ui` component, directly imported)
- Extension zone for additional buttons, rendered via `LinidZoneRenderer` (Module Federation)
- A default **Create button**

#### **Create button behavior**

- Navigates to `creationPagePath`
- Fully configurable via Module Federation options
- Styled via design system (`buttons-card.create-button`)

---

### **3. Filter Section (optional)**

Rendered only when `options.filters` is a non-empty array.

Includes:

- `LinidSmartFilter` (federated component)
- Active filters are initialized from the URL query params on mount
- Filter changes reset pagination to page 1, sync the URL, and reload the table data

See [LinidSmartFilter](../components/smart-filter/LinidSmartFilter.md) for the filtering UI itself.

---

### **4. Table Section**

Renders a table component:

- `GenericEntityTable` (local `catalog-ui` component, directly imported)
- Supports pagination
- Supports dynamic column labels (i18n scoped)
- Uses `idKey` to identify rows

#### **Row rendering**

Each row includes:

- dynamic cells based on column definition
- a default **See button** for navigation to detail page

---

## **Navigation Behavior**

### **Create Navigation**

Triggered by the create button:

```ts
router.push({ path: creationPagePath });
```

---

### **Detail Navigation**

Triggered by the "See" button:

```ts
router.push({ path: `${parentPath}/${row[idKey]}` });
```

- `idKey` is used to extract the row identifier
- Navigation is relative to the parent route

---

## **Data Loading**

Data is fetched using:

- `getEntities(instanceId)`
- pagination mapping utilities

### **Flow**

1. Component mounts
2. `loadData()` is called
3. API request is executed
4. Table state is updated
5. Pagination is synchronized
6. Errors trigger a notification

---

## **Pagination**

The component supports full server-side pagination:

- Quasar pagination format (`QuasarPagination`)
- Converted internally using `usePagination`
- Updated on every request event

---

## **Filtering**

Rendered only when `options.filters` is provided and non-empty.

- Filter definitions (`options.filters`) are passed as the catalog to `LinidSmartFilter`
- Active filters are initialized on mount from the URL via `getFiltersFromUrl` (from `useLinidFilterUrl`), matched against the configured filter definitions
- On `update:filters`:
  1. The active filters are updated
  2. Pagination is reset to page 1
  3. The URL is updated via `setFiltersInUrl`, preserving any keys listed in `keepQueryParams`
  4. `loadData()` is called, sending the active filters as a query filter (built by `toQueryFilter`) to `getEntities`

Each active filter is serialized to a query param using `filter.toString()`, keyed by `filter.name`. See `useLinidFilterUrl` in `@linagora/linid-im-front-corelib` for the exact URL format, and [LinidSmartFilter](../components/smart-filter/LinidSmartFilter.md) for the filtering UI and supported filter types.

---

## **Internationalization**

- Scoped by `instanceId`
- Column labels are translated dynamically
- Default keys:
  - `title`
  - `seeButton`
  - `error`
  - `ButtonsCard.create`
  - `DeleteFavoriteDialog.title` — title of the delete-favorite confirmation dialog
  - `DeleteFavoriteDialog.content` — body of the delete-favorite confirmation dialog (`{label}` placeholder available)
  - `OverrideFavoriteDialog.title` — title of the override-favorite form dialog
  - `OverrideFavoriteDialog.content` — body of the override-favorite form dialog
  - `CreateFavoriteDialog.title` — title of the create-favorite form dialog
  - `CreateFavoriteDialog.content` — body of the create-favorite form dialog
  - `RemoveFavoriteNotifyMessage` — notification message displayed when a favorite filter set is successfully deleted
  - `CreateFavoriteNotifyMessage` — notification message displayed when a new favorite filter set is successfully created
  - `OverrideFavoriteNotifyMessage` — notification message displayed when an existing favorite filter set is successfully updated with new filters

---

## **UI Customization**

Uses LinID design system via:

- `useUiDesign()`
- Namespaced UI keys:
  - `{instanceId}.see-button`
  - `{instanceId}.buttons-card.create-button`

---

## **Slots / Extension Points**

### **Extra Buttons Zone**

Allows injection of custom actions:

```vue
<LinidZoneRenderer zone="{instanceId}.extraButtons" />
```

Used for extending the action bar without modifying the component.

---

## **Events**

This component does not emit events directly.

Instead, it relies on:

- router navigation
- external data injection via Module Federation

---

## **Dependencies**

- `GenericEntityTable` (local `catalog-ui` component)
- `ButtonsCard` (local `catalog-ui` component, optional)
- `LinidZoneRenderer` from `@linagora/linid-im-front-corelib` (renders the federated `extraButtons` zone)
- `catalogUI/LinidSmartFilter` (optional)
- `@linagora/linid-im-front-corelib`
- Quasar Framework

---

## **Summary**

The **GenericTablePage** is a fully generic, federated CRUD-like table page that:

- abstracts data loading and pagination
- standardizes navigation patterns
- supports optional action zones
- supports optional, URL-synced filtering via `LinidSmartFilter`
- integrates tightly with Module Federation architecture
