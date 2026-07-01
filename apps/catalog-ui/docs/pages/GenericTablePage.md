# **GenericTablePage**

The **GenericTablePage** component provides a reusable, federated page template for displaying and managing tabular data.

It is designed to work with Module Federation-based modules and relies on a host-provided configuration to dynamically render:

- table structure
- data loading
- navigation behavior
- optional action panel

---

## **Purpose**

- Provide a standard table-based page layout across modules
- Abstract pagination, data fetching, and routing logic
- Integrate seamlessly with Module Federation configuration
- Support optional actions via a configurable action card
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
}
```

### **Options**

| Option             | Type             | Description                                           |
| ------------------ | ---------------- | ----------------------------------------------------- |
| `idKey`            | `string`         | Key used to identify each row and build detail routes |
| `columns`          | `QTableColumn[]` | Table column definitions (Quasar format)              |
| `enableActions`    | `boolean`        | Enables or disables the actions card above the table  |
| `creationPagePath` | `string`         | Route path used for the "create" button navigation    |

---

## **Layout Structure**

The page is composed of three main sections:

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

### **3. Table Section**

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

## **Internationalization**

- Scoped by `instanceId`
- Column labels are translated dynamically
- Default keys:
  - `title`
  - `seeButton`
  - `error`
  - `ButtonsCard.create`

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
- `@linagora/linid-im-front-corelib`
- Quasar Framework

---

## **Summary**

The **GenericTablePage** is a fully generic, federated CRUD-like table page that:

- abstracts data loading and pagination
- standardizes navigation patterns
- supports optional action zones
- integrates tightly with Module Federation architecture
