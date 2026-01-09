# **ButtonsCard 🎯**

The **ButtonsCard** component provides a reusable card with confirm and cancel action buttons for LinID.
It leverages Quasar's `QCard` and `QBtn` components to offer a consistent action interface across modules.

---

## **🎯 Purpose**

- Offers a consistent action button interface for forms and user actions
- Provides confirm and cancel buttons with customizable behavior
- Integrates loading states for asynchronous operations
- Provides customizable UI styling through the design system
- Emits events for parent components to handle actions
- Supports flexible button layouts through slots

---

## **⚙️ Props**

| Prop                | Type      | Required | Default | Description                            |
| ------------------- | --------- | -------- | ------- | -------------------------------------- |
| `uiNamespace`       | `string`  | Yes      | -       | UI design namespace for custom styling |
| `i18nScope`         | `string`  | Yes      | -       | i18n scope for translations            |
| `isLoading`         | `boolean` | No       | `false` | Loading state for the confirm button   |
| `showConfirmButton` | `boolean` | No       | `true`  | Whether to show the confirm button     |
| `showCancelButton`  | `boolean` | No       | `true`  | Whether to show the cancel button      |

### ButtonsCardProps Interface

```typescript
export interface ButtonsCardProps {
  /** UI design namespace for custom styling. */
  uiNamespace: string;
  /** i18n scope for translations. */
  i18nScope: string;
  /** Loading state for the confirm button. */
  isLoading?: boolean;
  /** Whether to show the confirm button. */
  showConfirmButton?: boolean;
  /** Whether to show the cancel button. */
  showCancelButton?: boolean;
}
```

---

## **📤 Events**

| Event     | Payload | Description                                |
| --------- | ------- | ------------------------------------------ |
| `confirm` | -       | Emitted when the confirm button is clicked |
| `cancel`  | -       | Emitted when the cancel button is clicked  |

**Important:** These events do not carry any payload. The parent component is responsible for handling the actions and managing state.

---

## **🎰 Slots**

The component provides four slots to customize the button layout:

| Slot              | Position                               | Description                                                                                   |
| ----------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `default`         | Main buttons area                      | Replace the default cancel and confirm buttons completely with custom buttons                 |
| `prepend-buttons` | Before the default buttons             | Inject custom buttons or elements before the cancel/confirm buttons                           |
| `extra-buttons`   | Between the cancel and confirm buttons | Inject additional action buttons between the default cancel and confirm (inside default slot) |
| `append-buttons`  | After the confirm button               | Inject custom buttons or elements after the confirm button                                    |

### Slot Usage Examples

#### Default slot

Replace the default cancel and confirm buttons completely with your own buttons:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage">
  <q-btn label="Close" @click="handleClose" />
  <q-btn label="Apply" @click="handleApply" />
  <q-btn label="Save" @click="handleSave" />
</ButtonsCard>
```

**Use cases:**

- Custom button combinations that don't fit the cancel/confirm pattern
- Multiple action buttons with specific ordering
- Complete control over button styling and behavior

**Important:** When using the default slot:

- The `@confirm` and `@cancel` events will **never be emitted**
- The `isLoading`, `showCancelButton`, and `showConfirmButton` props have **no effect**
- You must handle all button actions directly via `@click` handlers on your custom buttons

---

#### Controlling button visibility

You can control which default buttons are shown using the `showCancelButton` and `showConfirmButton` props:

```vue
<!-- Only show cancel button -->
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" :show-confirm-button="false" @cancel="handleClose" />

<!-- Only show confirm button -->
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" :show-cancel-button="false" @confirm="handleSubmit" />

<!-- Show both (default behavior) -->
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" @confirm="handleConfirm" @cancel="handleCancel" />
```

**Use cases:**

- Read-only forms or detail pages (only cancel/close button)
- Simple confirmation dialogs (only confirm button)
- Custom combinations with extra-buttons slot

---

#### `prepend-buttons` slot

Add buttons before the default cancel and confirm buttons:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" @confirm="handleConfirm" @cancel="handleCancel">
  <template #prepend-buttons>
    <q-btn label="Help" @click="showHelp" />
  </template>
</ButtonsCard>
```

**Use cases:**

- Help buttons
- Info buttons
- Navigation buttons to other sections

---

#### `extra-buttons` slot

Add buttons between the default cancel and confirm buttons:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" @confirm="handleConfirm" @cancel="handleCancel">
  <template #extra-buttons>
    <q-btn label="Reset" @click="resetForm" />
    <q-btn label="Save as Draft" @click="saveDraft" />
  </template>
</ButtonsCard>
```

**Use cases:**

- Reset/Clear buttons
- Save as draft functionality
- Alternative save options
- Preview buttons

**Note:** This slot only works when using the default cancel/confirm buttons (i.e., not using the default slot).

---

#### `append-buttons` slot

Add buttons after the confirm button:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" @confirm="handleConfirm" @cancel="handleCancel">
  <template #append-buttons>
    <q-btn label="Delete" @click="handleDelete" />
  </template>
</ButtonsCard>
```

**Use cases:**

- Delete or destructive action buttons
- Secondary actions that should appear after the primary confirm button
- Additional actions that are contextually separate from the main cancel/confirm flow

---

#### Combined slots usage

Using multiple named slots together:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" :is-loading="isLoading" @confirm="handleConfirm" @cancel="handleCancel">
  <template #prepend-buttons>
    <q-btn label="Help" @click="showHelp" />
  </template>

  <template #extra-buttons>
    <q-btn label="Reset" @click="handleReset" />
    <q-btn label="Save as Draft" @click="handleSaveDraft" />
  </template>

  <template #append-buttons>
    <q-btn label="Delete" @click="handleDelete" />
  </template>
</ButtonsCard>
```

Using the default slot to completely replace buttons:

```vue
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage">
  <template #prepend-buttons>
    <q-btn label="Help" @click="showHelp" />
  </template>

  <!-- Replace default buttons -->
  <q-btn label="Discard" @click="handleDiscard" />
  <q-btn label="Save & Close" @click="handleSaveAndClose" />
  <q-btn label="Save & New" @click="handleSaveAndNew" />

  <template #append-buttons>
    <q-btn label="Delete" @click="handleDelete" />
  </template>
</ButtonsCard>
```

Using visibility props with extra buttons:

```vue
<!-- Only confirm button + extra actions -->
<ButtonsCard ui-namespace="edit-user-page" i18n-scope="moduleUsers.EditUserPage" :show-cancel-button="false" :is-loading="isLoading" @confirm="handleSubmit">
  <template #extra-buttons>
    <q-btn label="Reset" @click="handleReset" />
  </template>
</ButtonsCard>
```

---

## **🎨 UI Customization**

The component uses the LinID design system through `useUiDesign()`. You can customize:

- **Card container**: `{uiNamespace}.buttons-card` → applies to `q-card`
- **Icon**: `{uiNamespace}.buttons-card` → applies to `q-icon`
- **Card actions**: `{uiNamespace}.buttons-card` → applies to `q-card-actions`
- **Confirm button**: `{uiNamespace}.buttons-card.confirm-button` → applies to confirm `q-btn`
- **Cancel button**: `{uiNamespace}.buttons-card.cancel-button` → applies to cancel `q-btn`

Here a sample JSON configuration for the design system:

```json
{
  "moduleUsers": {
    "edit-user-page": {
      "buttons-card": {
        "q-card": {
          "flat": true,
          "bordered": true
        },
        "q-icon": {
          "name": "info",
          "color": "primary"
        },
        "q-card-actions": {
          "align": "right"
        },
        "confirm-button": {
          "q-btn": {
            "color": "primary",
            "unelevated": true
          }
        },
        "cancel-button": {
          "q-btn": {
            "color": "grey",
            "flat": true
          }
        }
      }
    }
  }
}
```

---

## **🌍 Internationalization**

The component uses scoped i18n with the following translation keys:

- `{i18nScope}.ButtonsCard.title` - Title displayed in the card header
- `{i18nScope}.ButtonsCard.confirm` - Label for the confirm button
- `{i18nScope}.ButtonsCard.cancel` - Label for the cancel button
- `{i18nScope}.ButtonsCard.confirmLoading` - Label shown during loading state for the confirm button

**Note :**
If the translation for the title is empty or missing, the title section will not be displayed in the card (see implementation: `v-if="t('title')"`).

Example:

```json
{
  "moduleUsers.EditUserPage.ButtonsCard": {
    "title": "Actions",
    "confirm": "Save",
    "cancel": "Cancel",
    "confirmLoading": "Saving..."
  }
}
```

---

## **✅ Advantages**

- **Consistency:** Uniform action button interface across modules
- **Type-safe:** Full TypeScript support with defined interfaces
- **Flexible:** Parent controls the actual actions through event handlers
- **Extensible:** Slots allow custom button layouts without modifying the component
- **Loading states:** Built-in support for asynchronous operations
- **Customizable:** Supports UI design system for consistent styling
- **i18n ready:** Fully internationalized with scoped translations
- **Test-friendly:** Includes `data-cy` attributes for E2E testing

---

## **💡 Usage Example**

### Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ButtonsCard from '@/components/card/ButtonsCard.vue';
import { saveEntity } from '@linagora/card/linid-im-front-corelib';

const router = useRouter();
const isLoading = ref(false);
const formData = ref({});

async function handleConfirm() {
  isLoading.value = true;
  try {
    await saveEntity('instanceId', formData.value);
    router.push('/users');
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  router.push('/users');
}
</script>

<template>
  <ButtonsCard
    ui-namespace="edit-user-page"
    i18n-scope="moduleUsers.EditUserPage"
    :is-loading="isLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
```

### Advanced Usage with Slots

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ButtonsCard from '@/components/ButtonsCard.vue';
import { saveEntity, saveDraft } from '@linagora/linid-im-front-corelib';

const router = useRouter();
const $q = useQuasar();
const isLoading = ref(false);
const formData = ref({});

async function handleConfirm() {
  isLoading.value = true;
  try {
    await saveEntity('instanceId', formData.value);
    router.push('/users');
  } finally {
    isLoading.value = false;
  }
}

function handleCancel() {
  router.push('/users');
}

async function handleSaveDraft() {
  try {
    await saveDraft('instanceId', formData.value);
    $q.notify({ type: 'positive', message: 'Draft saved' });
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to save draft' });
  }
}

function handleReset() {
  formData.value = {};
}

function showHelp() {
  $q.dialog({
    title: 'Help',
    message: 'Instructions for filling this form...',
  });
}

async function handleDelete(id: string) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this item?',
    cancel: true,
  }).onOk(async () => {
    await deleteEntity('instanceId', id);
    console.log('Item deleted');
    router.push('/users');
  });
}
</script>

<template>
  <ButtonsCard
    ui-namespace="edit-user-page"
    i18n-scope="moduleUsers.EditUserPage"
    :is-loading="isLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <template #prepend-buttons>
      <q-btn
        label="Help"
        @click="showHelp"
      />
    </template>

    <template #extra-buttons>
      <q-btn
        label="Reset"
        @click="handleReset"
      />
      <q-btn
        label="Save as Draft"
        @click="handleSaveDraft"
      />
    </template>

    <template #append-buttons>
      <q-btn
        label="Delete"
        @click="handleDelete"
      />
    </template>
  </ButtonsCard>
</template>
```

---

## **📌 Notes**

- **Event-driven:** The component only emits events; the parent component handles the actual business logic
- **Button visibility:** Use `showCancelButton` and `showConfirmButton` props to control which default buttons are displayed. Both default to `true`
- **Default slot behavior:** When using the default slot, you completely replace the cancel and confirm buttons. The `confirm` and `cancel` events will not be emitted, and the `showCancelButton`/`showConfirmButton` props have no effect
- **Loading state management:** The parent is responsible for managing and passing the `isLoading` state (only applies to default confirm button)
- **No internal state:** The component does not manage any internal state for loading or form data
- **Scoped translations:** Use the `i18nScope` prop to namespace your translations properly
- **Loading UI:** When `isLoading` is true, the default confirm button shows a spinner and changes its label
- **Template coverage:** The template section is ignored from code coverage (`v8 ignore`) as it contains only presentation logic
- **Flexibility:** Ideal for forms, dialogs, and any action-requiring interfaces. Use named slots for additions, visibility props for hiding buttons, or the default slot for complete replacement
- **Slot positioning:** Use slots strategically to maintain a logical button order and user experience
- **Accessibility:** Ensure any buttons added through slots maintain proper accessibility attributes

---

## **🧪 Testing**

The component includes `data-cy` attributes for Cypress testing:

- Cancel button: `data-cy="button_cancel"`
- Confirm button: `data-cy="button_confirm"`

Example test:

```typescript
cy.get('[data-cy="button_confirm"]').click();
cy.get('[data-cy="button_cancel"]').should('be.visible');
```

When using slots, add `data-cy` attributes to your custom buttons:

```vue
<template #extra-buttons>
  <q-btn
    label="Reset"
    data-cy="button_reset"
    @click="handleReset"
  />
</template>
```

```typescript
cy.get('[data-cy="button_reset"]').should('be.visible').click();
```

---

## **🏗️ Architecture**

The component follows a simple event-driven architecture:

1. **Props in:** Receives `uiNamespace`, `i18nScope`, and optional `isLoading`
2. **UI customization:** Uses the design system to apply consistent styling
3. **Slots:** Provides extension points for custom buttons and content
4. **User interaction:** Captures button clicks
5. **Events out:** Emits `confirm` or `cancel` events to the parent
6. **Parent responsibility:** The parent component handles the actual logic and state management

This architecture ensures:

- **Separation of concerns:** UI presentation is separated from business logic
- **Reusability:** The component can be used in any context requiring confirm/cancel actions
- **Extensibility:** Slots allow customization without modifying the component
- **Testability:** Both the component and parent logic can be tested independently
- **Flexibility:** Parents have full control over what happens when buttons are clicked

---

## **🎨 CSS Classes**

The component applies the following CSS classes for styling customization:

- `.buttons-card` - Main card container
- `.buttons-card--title` - Card title text
- `.buttons-card--actions` - Card actions container
- `.buttons-card--cancel-button` - Cancel button
- `.buttons-card--confirm-button` - Confirm button
- `.buttons-card--confirm-button-loading` - Spinner shown during loading

These classes can be targeted in your global or scoped styles for additional customization beyond the design system.

---

## **🔄 Button Order**

The buttons are rendered in the following order:

### With default buttons (default slot not used):

1. **Prepend buttons** (via `prepend-buttons` slot)
2. **Cancel button** (default)
3. **Extra buttons** (via `extra-buttons` slot)
4. **Confirm button** (default)
5. **Append buttons** (via `append-buttons` slot)

### With custom buttons (using default slot):

1. **Prepend buttons** (via `prepend-buttons` slot)
2. **Custom buttons** (via default slot - replaces cancel, extra-buttons, and confirm)
3. **Append buttons** (via `append-buttons` slot)

This order ensures a logical flow from left to right, with the primary action typically positioned last for better UX.
