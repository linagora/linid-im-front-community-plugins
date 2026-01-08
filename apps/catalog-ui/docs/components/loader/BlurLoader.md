# **BlurLoader ✨**

The **BlurLoader** component is a lightweight skeleton loader used to indicate
loading states in the UI.
It renders a **shimmering blurred placeholder** whose dimensions and appearance
can be easily customized.

---

## **🎯 Purpose**

- Provides a visual placeholder while content is loading
- Improves perceived performance and user experience
- Replaces static spinners with contextual skeleton elements

---

## **⚙️ Props**

| Prop name | Type      | Default | Description                                                      |
| --------- | --------- | ------- | ---------------------------------------------------------------- |
| `width`   | `String`  | `md`    | Controls the width of the loader (`xs`, `sm`, `md`, `lg`, `xl`)  |
| `height`  | `String`  | `md`    | Controls the height of the loader (`xs`, `sm`, `md`, `lg`, `xl`) |
| `primary` | `Boolean` | `false` | Enables a lighter, primary-friendly color variant                |

---

## **📐 Size Variants**

### Width presets

- `xs` → 25px
- `sm` → 50px
- `md` → 100px
- `lg` → 150px
- `xl` → 300px

### Height presets

- `xs` → 0.75rem
- `sm` → 1rem
- `md` → 1.25rem
- `lg` → 2rem
- `xl` → 2.5rem

---

## **🧩 Usage Example**

### Basic usage

Displays a default medium-sized loader.

```vue
<BlurLoader />
```

---

### Custom size

Adjust the loader dimensions to better match the expected content.

```vue
<BlurLoader width="lg" height="sm" />
```

---

### Primary variant

Use the `primary` variant when the loader is displayed on a dark or primary-colored background.

```vue
<BlurLoader primary />
```

---

### Simulating text content

Multiple loaders can be stacked to mimic the appearance of loading text.

```vue
<div class="column q-gutter-sm">
  <BlurLoader width="xl" height="sm" />
  <BlurLoader width="lg" height="sm" />
  <BlurLoader width="md" height="sm" />
</div>
```

---

## **✅ Advantages**

- **Flexible:** Easily adapts to multiple layout contexts
- **Reusable:** Can represent text lines, buttons, or content blocks
- **Lightweight:** No dependencies, minimal runtime cost
- **Accessible UX:** Clearly communicates loading states

---

## **📌 Notes**

- The shimmer animation is implemented using pure CSS for optimal performance.
- The `primary` variant is designed for use on dark or primary-colored backgrounds.
- This component is intended to be composable (multiple loaders can be stacked to simulate complex layouts).
- Ideal for replacing content progressively as data becomes available.
