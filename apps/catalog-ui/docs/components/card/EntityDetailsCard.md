# **EntityDetailsCard 🗂️**

The **EntityDetailsCard** component is a composable, read-only container designed to display
a collection of entity attributes using multiple `InformationCard` components within a
structured card layout.

It handles attribute ordering, optional inclusion of remaining fields, loading states,
and internationalization, making it well suited for entity detail and summary views.

---

## **🎯 Purpose**

- Displays multiple entity attributes in a structured card format
- Delegates attribute rendering to reusable `InformationCard` components
- Supports configurable field ordering and automatic field completion
- Integrates loading states across all displayed attributes
- Provides consistent styling and UI theming via a UI namespace

---

## **⚙️ Props**

| Prop name             | Type                      | Default | Required | Description                                                      |
| --------------------- | ------------------------- | ------- | -------- | ---------------------------------------------------------------- |
| `entity`              | `Record<string, unknown>` | —       | Yes      | Entity object containing the attributes to display               |
| `fieldOrder`          | `string[]`                | `[]`    | No       | Explicit order of fields to render                               |
| `showRemainingFields` | `Boolean`                 | `false` | No       | Whether to display entity fields not listed in `fieldOrder`      |
| `isLoading`           | `Boolean`                 | `false` | No       | Enables loading state for all child `InformationCard` components |
| `uiNamespace`         | `String`                  | —       | Yes      | Base UI namespace used for design system customization           |
| `i18nScope`           | `String`                  | —       | Yes      | Identifier used to scope translations                            |
| `formatters`          | `FieldFormatter[]`        | —       | No       | Formatters applied to specific entity attributes before display  |

---

## **🧩 Internal Behavior**

### Field resolution logic

The component determines which fields to display as follows:

1. Starts with the fields defined in `fieldOrder`
2. If `showRemainingFields` is `true`, appends all remaining keys from `entity`
   that are not already listed
3. The resulting list is used to render `InformationCard` components in order

---

### Value resolution

- Each field value is resolved from the `entity` object
- Missing or `null` values are coerced to an empty string
- All values are rendered as strings

---

## **🧩 Rendered Structure**

- A `q-card` container styled via the design system
- A localized title section
- A flexible container holding multiple `InformationCard` components
- Each attribute:
  - Uses a localized label
  - Receives its value from the entity
  - Shares a common loading state

---

## **🌍 Internationalization**

- The card title is resolved using:

```ts
t('EntityDetailsCard.title');
```

- Attribute labels are resolved dynamically per field:

```ts
t(`EntityDetailsCard.attributes.${field}`);
```

This allows full localization of entity metadata without hardcoding labels.

---

## **🎨 Value Formatting**

Attribute values can be formatted before display using the optional `formatters` property.
For detailed information about available formatters and configuration options, see the
[**Value Formatting Guide**](../value-formatting.md).

---

## **🧩 Usage Examples**

### Basic usage

Displays selected entity fields in a fixed order.

```vue
<EntityDetailsCard :entity="user" :field-order="['username', 'email']" ui-namespace="users" i18n-scope="users" />
```

---

### Including remaining entity fields

Displays ordered fields first, then automatically appends remaining attributes.

```vue
<EntityDetailsCard :entity="user" :field-order="['username', 'email']" :show-remaining-fields="true" ui-namespace="users" i18n-scope="users" />
```

---

### Loading state

Displays loading placeholders for all attributes.

```vue
<EntityDetailsCard :entity="{}" :field-order="['username', 'email']" :is-loading="true" ui-namespace="users" i18n-scope="users" />
```

---

## **📐 Layout & Styling**

- Uses a responsive flex container for attribute cards
- Each `InformationCard` is spaced using margin utilities
- The card appearance is customizable via the provided `uiNamespace`
- Compatible with grid layouts and detail panels

---

## **✅ Advantages**

- **Composable:** Built on top of `InformationCard` for consistent attribute rendering
- **Configurable:** Supports explicit ordering and dynamic field inclusion
- **Localized:** Fully integrated with scoped internationalization
- **Scalable:** Works with entities of varying sizes and structures
- **Consistent:** Enforces uniform presentation across entity detail views

---

## **📌 Notes**

- This component is strictly read-only and intended for display purposes
- Attribute values are stringified before rendering
- All child cards share the same loading state
- Styling and behavior can be customized via the UI design system namespace
- Ideal for entity detail pages, summary panels, and administrative views
