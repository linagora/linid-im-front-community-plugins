# **EntityAttributeDateField ✏️**

The **EntityAttributeDateField** component is a specialized attribute field designed to handle **date-based attributes**
within an entity.

It relies on Quasar’s `QInput` and `QDate` component and integrates with the LinID design system and scoped i18n to provide a fully
customizable, localized, and reactive date input.

---

## **🎯 Purpose**

- Renders a date attribute using a standard input field with a date-picker
- Synchronizes the input value with the entity model
- Emits normalized entity updates on user input
- Supports scoped translations for labels, hints, prefixes, and suffixes
- Applies a configurable date format mask resolved from global i18n translations
- Enables UI customization via the design system
- Supports disabling the field via `inputSettings.disable`

---

## **⚙️ Props**

The component uses the shared `AttributeFieldProps` interface with `FieldDateSettings`.

| Prop          | Type                                             | Required | Description                                                                  |
| ------------- | ------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `instanceId`  | `string`                                         | Yes      | Identifier used for contextual data                                          |
| `i18nScope`   | `string`                                         | Yes      | I18n scope for localizing the component                                      |
| `uiNamespace` | `string`                                         | Yes      | Base UI design namespace for styling                                         |
| `definition`  | `LinidAttributeConfiguration<FieldDateSettings>` | Yes      | Attribute definition (name, type, input configuration)                       |
| `entity`      | `Record<string, unknown>`                        | Yes      | Entity object containing the date attribute value                            |
| `ignoreRules` | `boolean`                                        | No       | Indicates whether to bypass validation rules for this field (default: false) |

### AttributeFieldProps Interface

```ts
export interface AttributeFieldProps<T = Record<string, unknown>> extends CommonComponentProps {
  /** Identifier of the instance used for contextual data. */
  instanceId: string;

  /** Attribute configuration describing how the field should be rendered. */
  definition: LinidAttributeConfiguration<T>;

  /** Entity object holding the attribute value. */
  entity: Record<string, unknown>;

  /**
   * Indicates whether to bypass validation rules for this field.
   * When set to true, validation rules will not be applied.
   * @default false
   */
  ignoreRules?: boolean;
}
```

### FieldDateSettings

```ts
export interface FieldDateSettings extends FieldSettings {
  /**
   * Static date format mask used for internal date parsing and constraint computation (e.g. "YYYY/MM/DD").
   * Acts as the fallback when `valueFormatI18NKey` is absent or unresolved from the global i18n instance.
   * Falls back to QDATE_DEFAULT_MASK if not provided or falsy (including empty string).
   * @default QDATE_DEFAULT_MASK
   */
  valueFormat?: string;

  /**
   * Absolute internationalization key for the internal date format mask, looked up against the **global** i18n instance.
   * If the global i18n has a translation for this key, it will be used instead of the `valueFormat` fallback.
   * This enables locale-specific parsing formats (e.g. "YYYY/MM/DD" for a specific locale).
   * Must be an absolute key (not scoped to the component's i18n scope).
   * Falls back to `valueFormat` and then to QDATE_DEFAULT_MASK if not provided or unresolved.
   */
  valueFormatI18NKey?: string;

  /**
   * Static date format mask used for displaying dates in the input field and for validation rules (e.g. "DD/MM/YYYY").
   * Acts as the fallback when `maskI18NKey` is absent or unresolved from the global i18n instance.
   * This mask affects how users see dates in the input and which validation rules are applied.
   * Falls back to QDATE_DEFAULT_MASK if not provided or falsy (including empty string).
   * @default QDATE_DEFAULT_MASK
   */
  mask?: string;

  /**
   * Absolute internationalization key for the display date format mask, looked up against the **global** i18n instance.
   * If the global i18n has a translation for this key, it will be used instead of the `mask` fallback.
   * This enables locale-specific display formats (e.g. "DD/MM/YYYY" for French, "MM/DD/YYYY" for English).
   * Must be an absolute key (not scoped to the component's i18n scope).
   * Falls back to `mask` and then to QDATE_DEFAULT_MASK if not provided or unresolved.
   * This mask is used only for display and validation; the internal `valueFormat` is used for parsing and constraints.
   */
  maskI18NKey?: string;

  /**
   * Constraint options for the date picker (see below).
   */
  options?: FieldDateOptions;

  /** When true, the input is rendered as non-interactive (disabled state). */
  disable?: boolean;
}

export interface FieldDateOptions {
  afterDate?: string | string[]; // Exclusive lower bound(s)
  beforeDate?: string | string[]; // Exclusive upper bound(s)
  fromDate?: string | string[]; // Inclusive lower bound(s)
  upToDate?: string | string[]; // Inclusive upper bound(s)
}
```

---

## **📤 Events**

| Event           | Payload                   | Description                                                                      |
| --------------- | ------------------------- | -------------------------------------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the user edits the input field or selects a date in the date-picker |

### Event Semantics

- Emits the **entire updated entity object**
- Preserves immutability by creating a new entity reference
- Ensures the parent component remains the single source of truth

---

## **🌍 Internationalization (i18n)**

The component uses `useScopedI18n` to resolve translations for multiple UI text elements.

### Translation Scope

```ts
`${i18nScope}.fields.${definition.name}`;
```

### Supported Translation Keys

| Key      | Usage in UI                              |
| -------- | ---------------------------------------- |
| `label`  | Input label                              |
| `hint`   | Helper text                              |
| `prefix` | Input prefix                             |
| `suffix` | Input suffix                             |
| `close`  | Close button label, to close date-picker |

### Date Mask

The component supports two distinct date format masks:

#### 1. Internal Mask (`valueFormat` / `valueFormatI18NKey`)

The **internal mask** is used for:

- Storage of date values in the parent entity
- Aggregating date constraint values (`afterDate`/`beforeDate`/`fromDate`/`upToDate`) before they are converted to the display mask

Resolution order:

1. If `inputSettings.valueFormatI18NKey` is set and the **global** i18n instance has a translation for it (checked via `te`), the globally translated value is used — enabling locale-specific storage formats.
2. Otherwise, falls back to the static `inputSettings.valueFormat`
3. If `inputSettings.valueFormat` is also falsy (`undefined`, `null`, or `''`), falls back to the corelib's `QDATE_DEFAULT_MASK` constant

#### 2. Display Mask (`mask` / `maskI18NKey`)

The **display mask** is used for:

- The date-picker component's display and internal parsing format (`:mask` prop on `q-date`)
- Formatting dates shown to the user in the input field (applied after date-picker selection or manual input)
- Validation rules applied when checking user input, and the date-picker's available `options`
- User-facing date formatting and presentation

Every conversion between the two masks (reading the stored entity value, writing back a user edit, or converting a
date constraint) goes through the corelib's `formatDate(date, outputFormat, inputFormat)` helper (from
`useCommonMapper()`), which parses `date` against `inputFormat` and formats it as `outputFormat` in a single call.

Resolution order:

1. If `inputSettings.maskI18NKey` is set and the **global** i18n instance has a translation for it (checked via `te`), the globally translated value is used — enabling locale-specific display formats (e.g. `DD/MM/YYYY` for `fr`, `MM/DD/YYYY` for `en`).
2. Otherwise, falls back to the static `inputSettings.mask`
3. If `inputSettings.mask` is also falsy (`undefined`, `null`, or `''`), falls back to the corelib's `QDATE_DEFAULT_MASK` constant

### Fallback Behavior

```ts
translateOrDefault('', 'label');
```

- Returns the translated value if the key exists
- Falls back to the provided default value if missing
- Prevents displaying raw translation keys

---

## **🎨 UI Customization**

UI customization is handled via the LinID design system using `useUiDesign()`.

### Namespace Resolution

```ts
`${uiNamespace}.${definition.name}`;
```

### Applied Component

- Quasar component: `q-input`, `q-btn`, `q-icon` and `q-date`
- Props type: `LinidQInputProps`, `LinidQBtnProps`, `LinidQInputProps` and `LinidQDateProps`

Example:

```ts
uiNamespace = 'entity-editor'

// Final UI namespace
entity-editor.username → q-input
entity-editor.username → q-btn
entity-editor.username → q-icon
entity-editor.username → q-date
```

This allows full control over appearance, validation rules, and behavior per attribute.

---

## **✅ Validation**

The component implements automatic validation based on the attribute's `inputSettings`, the `definition.required` property, and the `definition.hasValidations` property, **plus all date constraints defined in `options`**.

### Validation Rules

Validation rules are dynamically generated:

- `required` (if applicable)
- `validDate(mask)` (always)
- `afterDate`, `beforeDate`, `fromDate`, `upToDate` (if corresponding options are set)
- `validateFromApi` (if `definition.hasValidations` is `true`)

Example:

```ts
const rules = computed(() => {
  if (props.ignoreRules || props.definition.inputSettings?.ignoreRules) return [];
  const rules = [validDate(mask.value)];
  if (props.definition.required) rules.unshift(required);

  // Date constraints are processed via a table-driven approach
  const rulesFromConstraints: ValidationRule[] = dateConstraints.value?.map(({ dateRef, validator }) => validator(dateRef as string, mask.value)) ?? [];

  if (props.definition.hasValidations) {
    rulesFromConstraints.push(validateFromApi(props.instanceId, props.definition.name));
  }
  return [...rules, ...rulesFromConstraints];
});
```

### Supported Validation Types

| Setting          | Description                                                                          | Example                |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| `required`       | Marks the field as mandatory. Setting comes from the `definition.required` property. | `required: true`       |
| `validDate`      | Ensures the value is a valid date (with mask)                                        |                        |
| `afterDate`      | Value must be strictly after the given date(s)                                       | `afterDate: '...'`     |
| `beforeDate`     | Value must be strictly before the given date(s)                                      | `beforeDate: '...'`    |
| `fromDate`       | Value must be on or after the given date(s)                                          | `fromDate: '...'`      |
| `upToDate`       | Value must be on or before the given date(s)                                         | `upToDate: '...'`      |
| `hasValidations` | Appends an API-backed validation rule (`validateFromApi`) when `true`                | `hasValidations: true` |
| `ignoreRules`    | Bypass validation when set to `true`                                                 | `ignoreRules: true`    |

### Validation Behavior

- If `ignoreRules` (prop) and `definition.inputSettings.ignoreRules` are both `false` or undefined, validation rules are applied
- If `ignoreRules` (prop) or `definition.inputSettings.ignoreRules` est `true`, no validation is performed
- Validation messages are automatically translated using the instance's i18n scope

---

## **🧭 Nested Attributes**

The attribute `name` supports **dot notation** to target values located inside sub-objects of the entity (e.g. `extraParameters.login`):

- The initial value is read from the nested path (`getNestedValue` from corelib)
- Updates rewrite only the targeted nested property, preserving the rest of the entity structure (`setNestedValue` from corelib)
- Missing intermediate objects are created when updating; intermediate values that are not objects are replaced by objects
- The `update:entity` event still emits the **complete** updated entity object

---

## **🔁 Data Flow & Dynamic Rendering**

1. Initial value is read from the entity at the path `definition.name` (dot notation supported)
2. The masks and all options are rendered via Nunjucks with context `{ entity, today, t }`
3. User edits the input field or selects a date in the date-picker
4. `displayValue` is updated via `v-model`
5. `updateValueFromInput()` or `updateValueFromPicker()` is called
6. `update:entity` event emits the new entity object with the date value in `valueFormat`

```text
QInput/QDate → displayValue → updateValue* → update:entity
```

---

## **🧠 Internal State Management**

```ts
const displayValue = ref<string | null>(toDisplayValue(getNestedValue(props.entity, props.definition.name)));
```

- Uses a local reactive reference to isolate UI interaction
- Holds the display value that is shown in the input field, converted from `valueFormat` to `mask`
- After date-picker selection or manual input, the value is converted back from `mask` to `valueFormat` before being written to the entity
- When the entity is updated from outside, a `watch` re-runs the same `valueFormat` → `mask` conversion so `displayValue` stays in sync
- If the stored value doesn't strictly match `valueFormat` (e.g. a value saved before `valueFormat` was configured), it falls back to a lenient parse instead of being blanked out

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import EntityAttributeDateField from '@/components/field/EntityAttributeDateField.vue';

const entity = reactive({
  birthdate: '1990/01/30',
});

const definition = {
  name: 'birthdate',
  input: 'Date',
  type: 'Date',
  required: true,
  hasValidations: true,
  inputSettings: {
    ignoreRules: false,
    valueFormat: 'YYYY/MM/DD',
    valueFormatI18NKey: 'global.internalDateFormat', // absolute key for the storage format
    mask: 'DD/MM/YYYY',
    maskI18NKey: 'global.displayDateFormat', // absolute key for display
    options: {
      afterDate: '{{ entity.startDate }}',
      upToDate: '{{ today }}',
    },
  },
};

const onUpdateEntity = (updatedEntity: Record<string, unknown>) => {
  Object.assign(entity, updatedEntity);
};
</script>

<template>
  <EntityAttributeDateField
    ui-namespace="entity-editor"
    instance-id="user-1"
    :definition="definition"
    :entity="entity"
    @update:entity="onUpdateEntity"
  />
</template>
```

In this example:

- The date-picker and the input field both use `mask: 'DD/MM/YYYY'` for display and parsing
- The entity stores `birthdate` using `valueFormat: 'YYYY/MM/DD'`
- Both masks can be overridden by global i18n translations for locale-specific formatting

---

## **✅ Advantages**

- **Focused responsibility:** Dedicated to date attributes
- **Immutable updates:** Avoids mutating the parent entity directly
- **Localized UI:** Supports multiple translatable UI elements
- **Highly customizable:** Fully integrated with the UI design system
- **Reusable:** Works across modules with different schemas
- **Framework-native:** Built using Vue 3 Composition API and Quasar standards

---

## **🧪 Testing Considerations**

- Verify initial input value matches the entity state
- Assert `update:entity` emission on input changes
- Mock `useScopedI18n` to control translation output for `label`/`hint`/`prefix`/`suffix`/`close`
- Mock `getI18nInstance().global.te`/`.t` to control mask resolution:
  - The `valueFormatI18NKey` lookup and its translated value for storage, independently of the `valueFormat`/`QDATE_DEFAULT_MASK` fallback chain
  - The `maskI18NKey` lookup and its translated value for the date-picker, input display and validation, independently of the `mask`/`QDATE_DEFAULT_MASK` fallback chain
- Mock `getI18nInstance` to control the `today`/`entity` context translations used in `renderedDefinition`
- Mock `useCommonMapper().formatDate` to control the `valueFormat` ↔ `mask` conversions, and assert it is called with the expected `(date, outputFormat, inputFormat)` arguments when `mask` and `valueFormat` differ
- Shallow mount the component to isolate logic from UI rendering
- Verify that `validateFromApi` is called with the correct `instanceId` and `definition.name` when `hasValidations` is `true`
- Verify the input is rendered as disabled when `definition.inputSettings.disable` is `true`
- Verify that the display mask is used for validation rules (e.g. `validDate(mask.value)`)
- Verify that the internal `valueFormat` is used to aggregate and store date constraint values, and is converted to `mask` before being handed to validators and the date-picker's `options`

---

## **📌 Notes**

- The component assumes `definition.input === 'Date'`
- Uses `FieldDateSettings` for `inputSettings`, which supports `valueFormat`, `valueFormatI18NKey`, `mask`, `maskI18NKey`, `options`, `ignoreRules`, and `disable`
- The date format masks are resolved via the **global** i18n instance, not the component's scoped i18n:
  - `valueFormatI18NKey` (internal mask used for storage and constraint aggregation) is checked against the global instance first (as an **absolute** key) and translated via global `t` if found; otherwise falls back to the static `valueFormat`, and finally to the corelib's `QDATE_DEFAULT_MASK` constant
  - `maskI18NKey` (display mask used by the date-picker, the input field and validation) is checked against the global instance first (as an **absolute** key) and translated via global `t` if found; otherwise falls back to the static `mask`, and finally to the corelib's `QDATE_DEFAULT_MASK` constant
- Conversions between `valueFormat` and `mask` are delegated to the corelib's `formatDate` (`useCommonMapper()`), which replaces the previous `useQuasarDate()` (`toQDateFormat`/`formatQDate`) helpers
- Validation is handled internally using `useQuasarFieldValidation` with support for `required`, date constraints, and API-backed validation (`validateFromApi` when `hasValidations` is `true`)
- The field is rendered as non-interactive when `definition.inputSettings.disable` is `true`
- Missing translations safely fall back to default values
- Intended for use via `EntityAttributeField`, not directly in most cases

---

## **🏗️ Architecture Summary**

**EntityAttributeDateField** is a **leaf component** in the attribute rendering hierarchy.

It is responsible only for:

- Rendering the date input with the date-picker
- Managing local UI state
- Emitting normalized entity updates

All higher-level concerns such as validation, schema resolution, and layout orchestration are handled upstream, ensuring a clean and maintainable architecture.
