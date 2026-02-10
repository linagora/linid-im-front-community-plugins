# **ConfirmationDialog 🔔**

Generic, event-driven confirmation dialog for LinID applications.

---

## **⚙️ Overview**

The `ConfirmationDialog` component listens for UI events to display a confirmation dialog. It supports dynamic content, customizable buttons, and asynchronous confirmation handling.

## **⚙️ Usage**

### Event Data Interface

```typescript
export interface ConfirmationDialogEvent extends DialogEvent {
  title?: string; // Dialog title
  content?: string; // Dialog content (HTML supported)
  onConfirm?: () => Promise<void>; // Async callback on confirm
}
```

**Inherited from `DialogEvent`:**

- `uiNamespace?: string` - UI namespace for button customization
- `i18nScope?: string` - i18n scope for button labels

## **📝 Example**

### Delete Confirmation

```typescript
function confirmDelete(itemId: string) {
  uiEventSubject.next({
    type: 'open',
    key: 'dialog',
    data: {
      type: 'open',
      title: 'Delete item',
      content: 'This action is irreversible.',
      uiNamespace: 'users.delete-confirmation',
      i18nScope: 'users.delete',
      onConfirm: async () => {
        await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      },
    },
  });
}
```

## **🎨 UI Customization**

The dialog and its buttons can be customized using the `uiNamespace` and `i18nScope` properties:

### Dialog Customization

- `${uiNamespace}.dialog-cancel-button` - Dialog container (type: `q-dialog`)

### Button Customization

Buttons are managed by the `ButtonsCard` component. To customize button labels and styling:

- Use `uiNamespace` to apply UI design keys for button appearance
- Use `i18nScope` to define button labels via translation keys

Refer to the [ButtonsCard documentation](../card/ButtonsCard.md) for available customization options.
