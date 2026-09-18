# **ConfirmDialogButton 🗑️**

The **ConfirmDialogButton** component provides a reusable action button opening the shared
`ConfirmationDialog`, then sending a configurable `DELETE`, `POST` or `PUT` HTTP request once the
user has confirmed.

The request URL and body are resolved from Nunjucks templates, so the whole action is driven by
configuration: no dedicated component is needed to expose a custom entity action guarded by a
confirmation, such as deleting the entity of a table row.

---

## **🎯 Purpose**

- Displays an action button opening the shared `ConfirmationDialog`
- Sends a configurable `DELETE`, `POST` or `PUT` request once the action is confirmed
- Resolves the request URL and body from Nunjucks templates rendered with the entity and its parent
- Can be disabled from an entity flag through the `disableWhen` template
- Emits an event with the API response after a successful request
- Can notify a hosting page after a request through `emitOnSubmit`, so it can react (e.g. reload
  its table)

---

## **⚙️ Props**

| Prop name      | Type                              | Default    | Description                                                                                                           |
| -------------- | --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `url`          | `String`                          | —          | Request URL, defined as a Nunjucks template                                                                           |
| `method`       | `'DELETE' \| 'POST' \| 'PUT'`     | `'DELETE'` | HTTP method used to send the request                                                                                  |
| `body`         | `Record<string, unknown>`         | `{}`       | JSON payload sent as the request body. Every nested string property is a Nunjucks template. Omitted when empty        |
| `entity`       | `Record<string, unknown> \| null` | —          | Entity associated with the current context, provided to the Nunjucks context. Injected by the hosting zone            |
| `parent`       | `Record<string, unknown> \| null` | —          | Parent of the entity (e.g. the application owning a role), provided to the Nunjucks context                           |
| `disable`      | `Boolean`                         | `false`    | Disables the button, preventing the dialog from opening                                                               |
| `disableWhen`  | `String`                          | —          | Nunjucks template rendered with the entity and its parent; the button is disabled when it renders to `true`           |
| `instanceId`   | `String`                          | —          | Instance identifier, used as i18n scope fallback                                                                      |
| `emitOnSubmit` | `String`                          | —          | When set, emits an event with this key on `uiEventSubject` after a successful request, with the response body as data |
| `uiNamespace`  | `String`                          | —          | Base UI namespace used for design system customization                                                                |
| `i18nScope`    | `String`                          | —          | Identifier used to scope translations                                                                                 |

### Templating

The `url`, every nested string property of `body` and `disableWhen` are Nunjucks templates, rendered
with a context containing `entity` and `parent`:

```typescript
{
  url: '/roles/{{ entity.id }}',
  method: 'DELETE',
  disableWhen: '{{ not entity.deletable }}',
}
```

When the button targets an entity owned by another one (e.g. a role of an application), the owner is
provided through the `parent` prop:

```typescript
{
  url: '/applications/{{ parent.id }}/roles/{{ entity.id }}/archive',
  method: 'PUT',
  body: {
    name: '{{ entity.name }}',
  },
}
```

The component works when `entity` is `null`: templates are then rendered with an empty entity.

---

## **📤 Events**

| Event       | Payload   | Description                                                                   |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| `submitted` | `unknown` | Emitted with the response body returned by the API after a successful request |

---

## **🧩 Internal Behavior**

- The button opens the shared `ConfirmationDialog`; the entity properties are available as named
  parameters in the dialog title and content translations
- The button is disabled when `disable` is set or when the `disableWhen` template renders to `true`
- On confirm, the `url` and `body` templates are rendered with a context containing `entity` and
  `parent`, and the request is sent with the configured method; an empty body is not sent
- On success: positive notification, `submitted` event with the API response, the `emitOnSubmit` key
  (if any) published on `uiEventSubject` with the response body
- On failure: negative notification, nothing is emitted
- The dialog closes in both cases

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.ConfirmDialogButton`, the `i18nScope` prop falling back to
the `instanceId` prop. When neither is provided, the scope is `ConfirmDialogButton` alone:

| Key                                | Description                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `title`                            | Label of the button                                                          |
| `ConfirmationDialog.title`         | Title of the confirmation dialog (entity properties interpolable)            |
| `ConfirmationDialog.content`       | Optional content of the confirmation dialog (entity properties interpolable) |
| `ConfirmationDialog.ButtonsCard.*` | Labels of the dialog buttons (`cancel`, `confirm`, `confirmLoading`)         |
| `submitSuccess`                    | Notification shown after a successful request                                |
| `submitError`                      | Notification shown when the request fails                                    |

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.confirm-dialog-button`:

| Namespace                                                  | Type       | Description                                                         |
| ---------------------------------------------------------- | ---------- | ------------------------------------------------------------------- |
| `${uiNamespace}.confirm-dialog-button`                     | `q-btn`    | Action button (e.g. custom `icon`, `color`)                         |
| `${uiNamespace}.confirm-dialog-button.confirmation-dialog` | `q-dialog` | Confirmation dialog opened by the button (see `ConfirmationDialog`) |

---

## **🧩 Usage Examples**

### Through a zone configuration

The button is declared in the `zones` property of the module host configuration (see
[Generic Pages](../../generic-pages.md)). The hosting zone injects the row `entity`, along with
`instanceId`, `uiNamespace` and `i18nScope`:

```json
{
  "zone": "moduleRolesPage.row-actions",
  "plugin": "catalogUI/ConfirmDialogButton",
  "props": {
    "url": "/roles/{{ entity.id }}",
    "method": "DELETE",
    "disableWhen": "{{ not entity.deletable }}",
    "emitOnSubmit": "role-deleted"
  }
}
```

### Direct usage

```vue
<ConfirmDialogButton :entity="role" url="/roles/{{ entity.id }}" disable-when="{{ not entity.deletable }}" ui-namespace="roles.list" i18n-scope="roles.list" @submitted="onRoleDeleted" />
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for confirmed entity actions
- **Composable:** Built on top of the shared `ConfirmationDialog`
- **Configurable:** URL, method, body and disabling rule are driven by configuration
- **Zone-ready:** Designed to be rendered through a zone with the row entity injected
