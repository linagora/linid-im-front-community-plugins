# **FormDialogButton 📝**

The **FormDialogButton** component provides a reusable action button opening the shared `FormDialog`
to collect user input, then sending it through a configurable `POST` or `PUT` HTTP request.

The request URL and body are resolved from Nunjucks templates, so the whole action is driven by
configuration: no dedicated component is needed to expose a custom entity action backed by a form.

---

## **🎯 Purpose**

- Displays an action button opening the shared `FormDialog` with configurable fields
- Validates the configured fields before submitting the request
- Sends the collected input through a configurable `POST` or `PUT` request
- Resolves the request URL and body from Nunjucks templates rendered with the entity, its parent
  and the form values
- Optionally pre-fills the form with the entity values
- Emits an event with the API response after a successful request

---

## **⚙️ Props**

| Prop name            | Type                              | Default  | Description                                                                                                |
| -------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `url`                | `String`                          | —        | Request URL, defined as a Nunjucks template                                                                |
| `method`             | `'POST' \| 'PUT'`                 | `'POST'` | HTTP method used to send the request                                                                       |
| `body`               | `Record<string, unknown>`         | `{}`     | JSON payload sent as the request body. Every nested string property is a Nunjucks template                 |
| `formFields`         | `LinidAttributeConfiguration[]`   | —        | Form fields rendered in the form dialog (see `FormDialog`)                                                 |
| `entity`             | `Record<string, unknown> \| null` | —        | Entity associated with the current context, provided to the Nunjucks context. Injected by the hosting zone |
| `parent`             | `Record<string, unknown> \| null` | —        | Parent of the entity (e.g. the application owning a role), provided to the Nunjucks context                |
| `fillFormWithEntity` | `Boolean`                         | `false`  | Pre-fills the form fields with the matching entity properties when the dialog opens                        |
| `instanceId`         | `String`                          | —        | Instance identifier passed to the form dialog fields (e.g. API validation rules)                           |
| `uiNamespace`        | `String`                          | —        | Base UI namespace used for design system customization                                                     |
| `i18nScope`          | `String`                          | —        | Identifier used to scope translations                                                                      |

### Templating

The `url` and every nested string property of `body` are Nunjucks templates, rendered when the form
is submitted with a context containing `entity` (the configured entity merged with the submitted
form values) and `parent`. Form values take precedence over entity properties with the same name,
so templates can read both the current context and the user input through the same variable:

```typescript
{
  url: '/applications/{{ entity.id }}/export',
  body: {
    name: '{{ entity.name }}', // filled by the "name" form field
    applicationId: '{{ entity.id }}',
  },
}
```

When the button targets an entity owned by another one (e.g. a role of an application), the owner is
provided through the `parent` prop and stays untouched by the form values:

```typescript
{
  url: '/applications/{{ parent.id }}/roles/{{ entity.id }}',
  method: 'PUT',
  body: {
    name: '{{ entity.name }}', // filled by the "name" form field
  },
}
```

The component works when `entity` is `null`: templates are then rendered with the form values only.

---

## **📤 Events**

| Event       | Payload   | Description                                                                   |
| ----------- | --------- | ----------------------------------------------------------------------------- |
| `submitted` | `unknown` | Emitted with the response body returned by the API after a successful request |

---

## **🧩 Internal Behavior**

- The button opens the shared `FormDialog` with the configured `formFields`; the entity properties
  are available as named parameters in the dialog title and content translations
- When `fillFormWithEntity` is enabled, the form is pre-filled with the entity values: fields whose
  name matches an entity property are initialized with the entity value, which is useful for `PUT`
  edition use cases
- On submit, the `url` and `body` templates are rendered with a context containing `entity` merged
  with the form values and `parent`, and the request is sent with the configured method
- On success: positive notification, `submitted` event with the API response, dialog closes
- On failure: negative notification, the dialog stays open for correction

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.FormDialogButton`, the `i18nScope` prop falling back to
the `instanceId` prop. When neither is provided, the scope is `FormDialogButton` alone:

| Key                  | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| `title`              | Label of the button                                                  |
| `FormDialog.title`   | Title of the form dialog (entity properties interpolable)            |
| `FormDialog.content` | Optional content of the form dialog (entity properties interpolable) |
| `FormDialog.*`       | Scope given to the `FormDialog` (buttons, field labels)              |
| `submitSuccess`      | Notification shown after a successful request                        |
| `submitError`        | Notification shown when the request fails                            |

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.form-dialog-button`:

| Namespace                                       | Type       | Description                                         |
| ----------------------------------------------- | ---------- | --------------------------------------------------- |
| `${uiNamespace}.form-dialog-button`             | `q-btn`    | Action button (e.g. custom `icon`, `color`)         |
| `${uiNamespace}.form-dialog-button.form-dialog` | `q-dialog` | Form dialog opened by the button (see `FormDialog`) |

---

## **🧩 Usage Examples**

### Through a zone configuration

The button is declared in the `zones` property of the module host configuration (see
[Generic Pages](../../generic-pages.md)). The hosting zone injects the page `entity`, along with
`instanceId`, `uiNamespace` and `i18nScope`:

```json
{
  "zone": "moduleApplicationDetailsPage.buttons-card.append",
  "plugin": "catalogUI/FormDialogButton",
  "props": {
    "url": "/applications/{{ entity.id }}/export",
    "method": "POST",
    "body": {
      "name": "{{ entity.name }}",
      "description": "{{ entity.description }}",
      "applicationId": "{{ entity.id }}"
    },
    "formFields": [
      {
        "name": "name",
        "type": "String",
        "input": "Text",
        "required": true,
        "inputSettings": {}
      },
      {
        "name": "description",
        "type": "String",
        "input": "TextArea",
        "required": false,
        "inputSettings": {}
      }
    ]
  }
}
```

### Direct usage

```vue
<FormDialogButton :entity="application" url="/applications/{{ entity.id }}/export" method="POST" :body="body" :form-fields="formFields" ui-namespace="applications.details" i18n-scope="applications.details" instance-id="applications" @submitted="onExportCreated" />
```

---

## **✅ Advantages**

- **Standardized:** One consistent flow for form-backed entity actions
- **Composable:** Built on top of the shared `FormDialog`
- **Configurable:** URL, method, body and form fields are driven by configuration
- **Zone-ready:** Designed to be rendered through a zone with the page entity injected
