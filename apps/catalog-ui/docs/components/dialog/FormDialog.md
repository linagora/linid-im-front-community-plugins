# **FormDialog 📋**

Generic, event-driven form dialog for LinID applications.

---

## **⚙️ Overview**

The `FormDialog` component listens for UI events to display a dialog containing a dynamic form. It renders form
fields from `LinidAttributeConfiguration` definitions, manages local form state, and handles asynchronous form
submission with a loading indicator.

## **⚙️ Usage**

### Dialog Key

The dialog is identified by `DialogKey.Form`:

```typescript
export enum DialogKey {
  Confirmation = 'confirmation',
  Form = 'form',
}
```

Use `DialogKey.Form` (value: `'form'`) as the `key` when dispatching the dialog event.

### Event Data Interface

`title` and `content` are defined on the internal `BaseDialogEvent` base interface. `FormDialogEvent` extends it
to add `formFields` and `onSubmit`:

```typescript
// Internal base (not exported) — shared by all dialog events
interface BaseDialogEvent extends DialogEvent {
  title?: string; // Dialog title
  content?: string; // Dialog content (HTML supported)
}

export interface FormDialogEvent extends BaseDialogEvent {
  instanceId?: string; // Instance identifier passed to each rendered field (required by AttributeFieldProps)
  formFields?: LinidAttributeConfiguration[]; // Form fields to render
  initialFormData?: Record<string, unknown>; // Initial values to pre-fill the form fields (keys are field names)
  /**
   * Async callback triggered on submit.
   * - Must **resolve** to signal success — the dialog will close and formData will be reset.
   * - Must **reject** (or re-throw) to signal failure — the dialog stays open so the user can correct errors.
   *   Handle the error yourself (e.g. display a notification) before re-throwing.
   */
  onSubmit?: (formData: Record<string, unknown>) => Promise<void>;
}
```

**Inherited from `DialogEvent`:**

- `uiNamespace: string` — Parent UI namespace used to build the internal design namespace for the dialog. The component appends `.form-dialog` to this value, so actual design keys are read from `${uiNamespace}.form-dialog`. You can pass the parent component's namespace if you want all dialogs opened from that parent to share the same design, or a dedicated namespace if you want per-dialog customization.
- `i18nScope: string` — Translation scope **specific to this dialog instance**. It must not be the scope of the parent component, as it is used to resolve button labels and field labels within the dialog. Each dialog usage should define its own dedicated scope.

> **Important:** `i18nScope` must always be a scope dedicated to the dialog, not the one of the calling component. `uiNamespace` can be shared with the parent if you want consistent dialog styling, or dialog-specific for finer control.

## **📝 Example**

### Create User

```typescript
function openCreateUserDialog() {
  uiEventSubject.next({
    key: DialogKey.Form,
    data: {
      type: 'open',
      title: t('create-user-dialog.title'),
      content: t('create-user-dialog.content'),
      // uiNamespace: can be the parent's namespace (shared dialog design)
      //   or a dedicated one for this dialog.
      //   The component internally uses `${uiNamespace}.form-dialog` for design keys.
      uiNamespace: 'moduleUsers.homepage',
      // i18nScope: must be specific to this dialog, NOT the parent component's scope.
      i18nScope: 'CreateUserDialog',
      // instanceId: passed to each field component for contextual data (e.g. API validation).
      instanceId: 'homepage',
      formFields: [
        {
          name: 'username',
          input: 'Text',
          type: 'String',
          required: true,
          hasValidations: false,
          inputSettings: { minLength: 3, maxLength: 50 },
        },
        {
          name: 'role',
          input: 'List',
          type: 'String',
          required: true,
          hasValidations: false,
          inputSettings: { values: ['admin', 'user', 'guest'] },
        },
      ],
      // Optional: pre-fill the form with existing data
      initialFormData: { username: 'johndoe', role: 'user' },
      onSubmit: async (formData) => {
        try {
          await createUser(formData);
        } catch (e) {
          showErrorNotification(e);
          throw e; // re-throw so FormDialog keeps the dialog open
        }
      },
    },
  });
}
```

## **🧠 Internal Behavior**

### Form State

The component maintains a local `formData` object that acts as the entity for all rendered field components:

```ts
const formData = ref<Record<string, unknown>>({});
```

Each `EntityAttributeField` is bound via `v-model:entity="formData"`, so field value changes propagate directly
into `formData` without any intermediate event handling.

When the dialog opens, `formData` is initialized with `initialFormData` if provided, or `{}` otherwise. On
successful submit or cancel, `formData` is reset to `{}`.

### Field Rendering

Form fields are rendered by iterating over `formFields` and mounting an `EntityAttributeField` (loaded via
`loadAsyncComponent('catalogUI/EntityAttributeField')`) for each entry:

```html
<q-card-section
  v-for="field in formFields"
  :key="field.name"
>
  <EntityAttributeField
    v-model:entity="formData"
    :i18n-scope="i18nScope"
    :ui-namespace="localUiNamespace"
    :instance-id="instanceId"
    :definition="field"
  />
</q-card-section>
```

> `localUiNamespace` is a computed value equal to `${uiNamespace}.form-dialog`. It is used internally for all design key lookups (dialog, card, fields, and buttons).

The field type rendered for each entry depends on `field.input` — see the
[EntityAttributeField documentation](../field/EntityAttributeField.md) for the full dispatch table.

### Submit Handling

Form submission is triggered by `q-form @submit`, which fires when the confirm button (typed `submit`) is clicked
and all field validations pass:

1. `isLoading` is set to `true` (disables the confirm button and shows a loading state in `ButtonsCard`)
2. The `onSubmit(formData.value)` callback is awaited
3. On success: `formData` is reset to `{}` and the dialog closes
4. `isLoading` is reset to `false` in the `finally` block — whether the submission succeeded or threw

> **Contract:** `onSubmit` must **reject** (or re-throw) to signal failure. If it resolves, the dialog assumes success and closes. A typical pattern is to catch the error, display a notification, then re-throw.

### Cancel / Close Handling

When the user cancels or the dialog fires `@hide`:

- `formData` is reset to `{}`
- `isLoading` is reset to `false`
- The dialog closes

## **🎨 UI Customization**

The dialog, its card, and buttons can be customized using the `uiNamespace` and `i18nScope` properties:

### Dialog and Card Customization

The component internally computes `localUiNamespace = ${uiNamespace}.form-dialog` and uses it for all design key lookups.

- If `uiNamespace = "moduleUsers.homepage"`, the effective design namespace is `moduleUsers.homepage.form-dialog`.
- Use this to configure `q-dialog`, `q-card` and `q-card-actions` in your design.json:

```json
{
  "moduleUsers": {
    "homepage": {
      "form-dialog": {
        "q-dialog": { "maximized": false },
        "q-card": { "flat": true, "bordered": true },
        "q-card-actions": { "align": "right" }
      }
    }
  }
}
```

You can pass the parent component's `uiNamespace` to share dialog styling across all dialogs of a given page, or a dedicated namespace for per-dialog customization.

### Button and Field Customization

Buttons (`ButtonsCard`) and fields (`EntityAttributeField`) also receive `localUiNamespace` as their `uiNamespace`, so their design keys are scoped under `${uiNamespace}.form-dialog` as well.

- Use `i18nScope` to define button labels via translation keys (see [ButtonsCard documentation](../card/ButtonsCard.md)).
- The confirm button uses `confirm-btn-type="submit"`, triggering native HTML form submission and running field validations before `onSubmit` is called.
