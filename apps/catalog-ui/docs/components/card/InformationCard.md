# **InformationCard 🧾**

The **InformationCard** component is a lightweight, reusable UI element designed
to display a labeled piece of information in a structured card layout.
It supports optional icons, loading states, and custom content through slots.

---

## **🎯 Purpose**

- Displays a labeled value in a clear and consistent card format
- Supports loading states with a skeleton placeholder
- Allows visual context via optional icons
- Designed for entity details, metadata, and read-only information views

---

## **⚙️ Props**

| Prop name   | Type      | Default | Description                                                   |
| ----------- | --------- | ------- | ------------------------------------------------------------- |
| `label`     | `String`  | `''`    | Text label describing the displayed value                     |
| `value`     | `String`  | `''`    | Value to display when not in a loading state                  |
| `isLoading` | `Boolean` | `false` | Enables the loading state and displays a skeleton placeholder |

---

## **🧩 Slots**

### Default slot

Replaces the displayed value when `isLoading` is `false`.

```vue
<InformationCard label="Email">
  <span>john.doe@example.com</span>
</InformationCard>
```

---

### `loading` slot

Overrides the default loading placeholder when `isLoading` is `true`.

```vue
<InformationCard label="Status" is-loading>
  <template #loading>
    <q-spinner size="sm" />
  </template>
</InformationCard>
```

If not provided, a `BlurLoader` is rendered by default.

---

## **🧩 Usage Examples**

### Basic usage

Displays a simple labeled value.

```vue
<InformationCard label="Username" value="johndoe" />
```

---

### Loading state

Displays a skeleton loader while data is being fetched.

```vue
<InformationCard label="Email" :is-loading="true" />
```

---

### Custom loading content

Replaces the default loader with a custom placeholder.

```vue
<InformationCard label="Last Login" :is-loading="true">
  <template #loading>
    <q-spinner color="primary" size="sm" />
  </template>
</InformationCard>
```

---

### Fully custom value content

Uses the default slot to render complex or formatted content.

```vue
<InformationCard label="Roles">
  <q-chip
    v-for="role in roles"
    :key="role"
    dense
  >
    {{ role }}
  </q-chip>
</InformationCard>
```

---

## **📐 Layout & Styling**

- Minimum width: **350px**
- Label section supports icons and text alignment
- Value section is emphasized using bold typography
- Compatible with responsive layouts and grid systems

---

## **✅ Advantages**

- **Reusable:** Suitable for any read-only information display
- **Flexible:** Supports icons, loading states, and custom slots
- **Consistent:** Enforces uniform layout across entity detail views
- **Composable:** Works well inside lists, grids, or cards

---

## **📌 Notes**

- The default loading indicator uses the `BlurLoader` component.
- When both `value` prop and default slot are provided, the slot content takes precedence.
- The component is intended for display purposes only (no editing capabilities).
- Ideal for use in detail views, summary panels, and metadata sections.
