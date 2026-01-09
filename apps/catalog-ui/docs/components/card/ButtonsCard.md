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

---

## **⚙️ Props**

| Prop             | Type      | Required | Default | Description                            |
| ---------------- | --------- | -------- | ------- | -------------------------------------- |
| `uiNamespace`    | `string`  | Yes      | -       | UI design namespace for custom styling |
| `i18nScope`      | `string`  | Yes      | -       | i18n scope for translations            |
| `confirmLoading` | `boolean` | No       | `false` | Loading state for the confirm button   |

### ButtonsCardProps Interface

```typescript
export interface ButtonsCardProps {
  /** UI design namespace for custom styling. */
  uiNamespace: string;
  /** i18n scope for translations. */
  i18nScope: string;
  /** Loading state for the confirm button. */
  confirmLoading?: boolean;
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

## **🎨 UI Customization**

The component uses the LinID design system through `useUiDesign()`. You can customize:

- **Card container**: `{uiNamespace}.buttons-card` → applies to `q-card`
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
          /* custom styles */
        },
        "q-card-actions": {
          /* custom styles */
        },
        "confirm-button": {
          "q-btn": {
            /* custom styles */
          }
        },
        "cancel-button": {
          "q-btn": {
            /* custom styles */
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

- `{i18nScope}.ButtonsCard.confirm` - Label for the confirm button
- `{i18nScope}.ButtonsCard.cancel` - Label for the cancel button
- `{i18nScope}.ButtonsCard.confirmLoading` - Label shown during loading state

Example:

```json
{
  "moduleUsers.EditUserPage.ButtonsCard": {
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
- **Loading states:** Built-in support for asynchronous operations
- **Customizable:** Supports UI design system for consistent styling
- **i18n ready:** Fully internationalized with scoped translations
- **Test-friendly:** Includes `data-cy` attributes for E2E testing

---

## **💡 Usage Example**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ButtonsCard from '@/components/ButtonsCard.vue';
import { saveEntity } from '@linagora/linid-im-front-corelib';

const router = useRouter();
const saving = ref(false);
const formData = ref({});

async function handleConfirm() {
  saving.value = true;

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
    :confirm-loading="saving"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
```

---

## **📌 Notes**

- **Event-driven:** The component only emits events; the parent component handles the actual business logic
- **Loading state management:** The parent is responsible for managing and passing the `confirmLoading` state
- **No internal state:** The component does not manage any internal state for loading or form data
- **Scoped translations:** Use the `i18nScope` prop to namespace your translations properly
- **Loading UI:** When `confirmLoading` is true, the confirm button shows a spinner and changes its label
- **Template coverage:** The template section is ignored from code coverage (`v8 ignore`) as it contains only presentation logic
- **Flexibility:** Ideal for forms, dialogs, and any action-requiring interfaces

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

---

## **🏗️ Architecture**

The component follows a simple event-driven architecture:

1. **Props in:** Receives `uiNamespace`, `i18nScope`, and optional `confirmLoading`
2. **UI customization:** Uses the design system to apply consistent styling
3. **User interaction:** Captures button clicks
4. **Events out:** Emits `confirm` or `cancel` events to the parent
5. **Parent responsibility:** The parent component handles the actual logic and state management

This architecture ensures:

- **Separation of concerns:** UI presentation is separated from business logic
- **Reusability:** The component can be used in any context requiring confirm/cancel actions
- **Testability:** Both the component and parent logic can be tested independently
- **Flexibility:** Parents have full control over what happens when buttons are clicked

---

## **🎨 CSS Classes**

The component applies the following CSS classes for styling customization:

- `.buttons-card` - Main card container
- `.buttons-card--actions` - Card actions container
- `.buttons-card--cancel-button` - Cancel button
- `.buttons-card--confirm-button` - Confirm button
- `.buttons-card--confirm-button-loading` - Spinner shown during loading

These classes can be targeted in your global or scoped styles for additional customization beyond the design system.
