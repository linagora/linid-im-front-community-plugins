# **LogoutMenuItem**

The **LogoutMenuItem** component is the logout entry of the profile menu of the application header.
It renders a separator followed by a clickable item (icon and label) and, on click, opens a confirmation dialog. Once the user confirms, the component navigates to the logout route given by the host; on cancel, the user stays on the current page.

It is rendered by default as the last entry of [HeaderProfile](./HeaderProfile.md), which forwards its `logoutPath` prop and hides it when `hideLogout` is set. It is an internal component of the catalog and is not exposed through Module Federation.

---

## **Purpose**

- Provides a consistent logout entry at the end of the profile menu, shared by every host
- Asks the user for a confirmation before leaving the application
- Delegates the logout itself to a host route, so the component stays agnostic of the authentication mechanism (OIDC, SAML, …)
- Integrates with the LinID design system and i18n for consistent styling and wording

---

## **Props**

| Prop          | Type     | Required | Default              | Description                                            |
| ------------- | -------- | -------- | -------------------- | ------------------------------------------------------ |
| `uiNamespace` | `string` | Yes      | -                    | UI design namespace for custom styling                 |
| `i18nScope`   | `string` | No       | `application.logout` | i18n scope for translations                            |
| `path`        | `string` | Yes      | -                    | Route the user is sent to once the logout is confirmed |

### LogoutMenuItemProps Interface

```typescript
export interface LogoutMenuItemProps extends CommonComponentProps {
  path: string;
}
```

---

## **Events**

This component emits no events. The navigation to `path` is performed through the shared router once the dialog is confirmed.

---

## **How it works**

1. The item closes the profile menu (`v-close-popup`) and opens the shared confirmation dialog through the corelib `uiEventSubject` (`confirmation` key), with the title and content resolved from the i18n scope.
2. On confirm, the component calls `router.push(path)`. The host route is responsible for the actual logout (for instance ending the OIDC session).
3. On cancel, the dialog closes and nothing else happens.

### Host requirements

- A `ConfirmationDialog` must be mounted in the layout. `BaseLayout` renders the `base-layout.dialogComponent` zone for this purpose, in which the host registers `catalogUI/ConfirmationDialog`.
- The route given in `path` (`logoutPath` of `HeaderProfile`, `/logout` by default) must exist in the host router and perform the logout.
- The translation keys described below must be provided by the host.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()`. The local namespace is built as `{uiNamespace}.logout-menu-item`. You can customize:

- **Separator**: `{uiNamespace}.logout-menu-item` → applies to `q-separator`
- **Item**: `{uiNamespace}.logout-menu-item` → applies to `q-item`
- **Icon section**: `{uiNamespace}.logout-menu-item.icon` → applies to `q-item-section` (`avatar: true` by default)
- **Icon**: `{uiNamespace}.logout-menu-item.icon` → applies to `q-icon` (`name: "logout"` by default)
- **Label section**: `{uiNamespace}.logout-menu-item.label` → applies to `q-item-section`
- **Label**: `{uiNamespace}.logout-menu-item.label` → applies to `q-item-label`
- **Confirmation dialog**: `{uiNamespace}.logout-menu-item.confirmation-dialog` → see [ConfirmationDialog](../dialog/ConfirmationDialog.md) (dialog, card and buttons)

Here is a sample JSON configuration for the design system; `uiNamespace` is the local namespace of `HeaderProfile`, i.e. `base-layout.header.header-profile` in `BaseLayout`:

```json
{
  "base-layout": {
    "header": {
      "header-profile": {
        "logout-menu-item": {
          "q-item": { "dense": true },
          "icon": {
            "q-item-section": { "avatar": true },
            "q-icon": { "name": "logout" }
          },
          "confirmation-dialog": {
            "q-dialog": { "persistent": false },
            "buttons-card": {
              "confirm-button": {
                "q-btn": { "color": "primary", "unelevated": true, "outline": false }
              },
              "cancel-button": {
                "q-btn": { "color": "primary", "outline": true }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## **i18n**

All keys are resolved under the `i18nScope` (default `application.logout`):

| Key                                      | Description                                         |
| ---------------------------------------- | --------------------------------------------------- |
| `label`                                  | Label of the menu entry                             |
| `ConfirmationDialog.title`               | Title of the confirmation dialog                    |
| `ConfirmationDialog.content`             | Message of the confirmation dialog (HTML supported) |
| `ConfirmationDialog.ButtonsCard.confirm` | Label of the confirm button                         |
| `ConfirmationDialog.ButtonsCard.cancel`  | Label of the cancel button                          |

```json
{
  "application": {
    "logout": {
      "label": "Log out",
      "ConfirmationDialog": {
        "title": "Log out",
        "content": "Are you sure you want to log out?",
        "ButtonsCard": {
          "confirm": "Log out",
          "cancel": "Cancel"
        }
      }
    }
  }
}
```

---

## **Testing**

The component includes `data-cy` attributes for Cypress testing:

- Menu entry: `data-cy="header_profile_logout"`
- Menu entry label: `data-cy="header_profile_logout_label"`

The confirmation dialog exposes its own attributes (`confirmation_dialog_card`, `confirmation_dialog_title`, `confirmation_dialog_content`, `button_confirm`, `button_cancel`).

Example test:

```typescript
cy.get('[data-cy="header_profile_button"]').click();
cy.get('[data-cy="header_profile_logout"]').click();
cy.get('[data-cy="confirmation_dialog_card"]').should('be.visible');
cy.get('[data-cy="button_confirm"]').click();
```

---

## **Notes**

- The component renders two root nodes (separator and item) and does not forward attributes, so it can be dropped as-is in a `q-list`.
- The template is excluded from v8 coverage (`<!-- v8 ignore start/stop -->`) as it contains only presentation logic.
