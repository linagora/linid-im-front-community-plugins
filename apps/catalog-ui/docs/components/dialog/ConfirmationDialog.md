# **ConfirmationDialog 🔔**

Generic, event-driven confirmation dialog for LinID applications.

---

## **⚙️ Overview**

The `ConfirmationDialog` component listens for UI events to display a confirmation dialog. It supports dynamic content, customizable buttons, and asynchronous confirmation handling.

The dialog is **draggable**: click and hold the header to reposition it anywhere on screen.

## **⚙️ Usage**

### Dialog Key

The dialog is identified by `DialogKey.Confirmation`:

```typescript
export enum DialogKey {
  Confirmation = 'confirmation',
  Form = 'form',
}
```

Use `DialogKey.Confirmation` (value: `'confirmation'`) as the `key` when dispatching the dialog event.

### Event Data Interface

`title` and `content` are defined on the internal `BaseDialogEvent` base interface. `ConfirmationDialogEvent` extends it to add `onConfirm`:

```typescript
// Internal base (not exported) — shared by all dialog events
interface BaseDialogEvent extends DialogEvent {
  title?: string; // Dialog title
  content?: string; // Dialog content (HTML supported)
}

export interface ConfirmationDialogEvent extends BaseDialogEvent {
  onConfirm?: () => Promise<void>; // Async callback on confirm
}
```

**Inherited from `DialogEvent`:**

- `uiNamespace: string` — Parent UI namespace used to build the internal design namespace for the dialog. The component appends `.confirmation-dialog` to this value, so actual design keys are read from `${uiNamespace}.confirmation-dialog`. You can pass the parent component's namespace if you want all dialogs opened from that parent to share the same design, or a dedicated namespace if you want per-dialog customization.
- `i18nScope: string` — Translation scope **specific to this dialog instance**. It must not be the scope of the parent component, as it is used to resolve button labels within the dialog. Each dialog usage should define its own dedicated scope.

> **Important:** `i18nScope` must always be a scope dedicated to the dialog, not the one of the calling component. `uiNamespace` can be shared with the parent if you want consistent dialog styling, or dialog-specific for finer control.

## **📝 Example**

### Delete Confirmation

```typescript
function confirmDelete(itemId: string) {
  uiEventSubject.next({
    key: DialogKey.Confirmation,
    data: {
      type: 'open',
      title: t('delete-user-confirmation.title'),
      content: t('delete-user-confirmation.content'),
      // uiNamespace: can be the parent's namespace (shared dialog design)
      //   or a dedicated one for this dialog.
      //   The component internally uses `${uiNamespace}.confirmation-dialog` for design keys.
      uiNamespace: 'moduleUsers.homepage',
      // i18nScope: must be specific to this dialog, NOT the parent component's scope.
      i18nScope: 'DeleteUserConfirmation',
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

The component internally computes `localUiNamespace = ${uiNamespace}.confirmation-dialog` and uses it for all design key lookups.

- If `uiNamespace = "moduleUsers.homepage"`, the effective design namespace is `moduleUsers.homepage.confirmation-dialog`.
- Use this to configure `q-dialog` in your design.json:

```json
{
  "moduleUsers": {
    "homepage": {
      "confirmation-dialog": {
        "q-dialog": { "maximized": false }
      }
    }
  }
}
```

You can pass the parent component's `uiNamespace` to share dialog styling across all dialogs of a given page, or a dedicated namespace for per-dialog customization.

### Button Customization

Buttons (`ButtonsCard`) also receive `localUiNamespace` as their `uiNamespace`, so their design keys are scoped under `${uiNamespace}.confirmation-dialog` as well.

- Use `i18nScope` to define button labels via translation keys (see [ButtonsCard documentation](../card/ButtonsCard.md)).
