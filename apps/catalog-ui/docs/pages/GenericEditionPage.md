# **GenericEditionPage**

The **GenericEditionPage** component provides a reusable, federated page template for editing an existing entity.

It follows the same generic and configurable approach as `GenericTablePage` and `GenericCreationPage`: the page is fully driven by the module host configuration and can be integrated into different modules without requiring a custom implementation.

---

## **Purpose**

- Provide a reusable edition page for any entity
- Load and display entity data based on the entity identifier from the route
- Render a configurable edition form based on entity attribute definitions
- Group form fields into ordered sections
- Handle entity persistence through the generic entity update mechanism
- Redirect the user back to the parent page after successful update

---

## **Configuration**

The page resolves its options from the module host configuration (`getModuleHostConfiguration(instanceId).options`), typed by `ModuleGenericEditionPageOptions`.

| Option         | Type            | Required | Description                                                                   |
| -------------- | --------------- | -------- | ----------------------------------------------------------------------------- |
| `formSections` | `FormSection[]` | Yes      | Sections grouping the entity attributes displayed in the edition form         |
| `idKey`        | `string`        | Yes      | Entity attribute used to retrieve the identifier from the entity data         |
| `parentPath`   | `string`        | Yes      | Route path used to navigate back to the previous page after saving the entity |

Each `FormSection` defines a group of fields rendered in the form.

| Field    | Type                          | Required | Description                                                              |
| -------- | ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `id`     | `string`                      | Yes      | Unique section identifier used for translations and UI design namespaces |
| `fields` | `EntityAttributeDefinition[]` | Yes      | Ordered list of entity attributes rendered inside the section            |

Example module configuration:

```json
{
  "instanceId": "moduleApplicationsEditionPage",
  "remoteName": "catalogUI",
  "entity": "applications",
  "lifecycleRemote": "catalogUI/PageLifecycle",
  "routesRemote": "catalogUI/PageRoutes",
  "i18nRemote": "catalogUI/EmptyI18n",
  "apiEndpoint": "applications",
  "basePath": "/applications",
  "options": {
    "layout": "catalogUI/BaseLayout",
    "page": "catalogUI/GenericEditionPage",
    "idKey": "id",
    "parentPath": "/applications",
    "pagePath": ":id/edit",
    "formSections": [
      {
        "id": "general",
        "fields": [
          {
            "name": "code",
            "type": "String",
            "input": "Text",
            "required": true
          },
          {
            "name": "name",
            "type": "String",
            "input": "Text",
            "required": true
          },
          {
            "name": "type",
            "type": "String",
            "input": "Text",
            "required": true
          },
          {
            "name": "description",
            "type": "String",
            "input": "Text",
            "required": true
          }
        ]
      }
    ]
  }
}
```

---

## **Entity Loading**

When the page is mounted:

1. The page enters a loading state.
2. The entity identifier is extracted from the route parameters (`route.params.id`).
3. The entity data is loaded using `getEntityById(instanceId, entityId)`.
4. On success:

   - The entity data populates the form fields.

5. On failure:

   - A negative notification (`{instanceId}.error`) is displayed.
   - The user is redirected to the parent route.

---

## **Form Rendering**

The edition form is generated from the configured `formSections`.

- Each section is rendered as a dedicated card.
- Sections are displayed in the order declared in the configuration.
- Each configured attribute is rendered using `EntityAttributeField`.
- Field values are automatically synchronized with the loaded entity through `v-model:entity`.
- Form fields are pre-populated with the existing entity data.

---

## **Data Saving**

When the form is submitted:

1. The page enters a loading state.
2. The entity is saved using `updateEntity(instanceId, entityId, entity)`.
3. On success:

   - A positive notification (`{instanceId}.success`) is displayed.
   - The user is redirected back to the parent route.

4. On failure:

   - A negative notification (`{instanceId}.error`) is displayed.
   - The user remains on the edition page.

The redirect path is the parent route configured in the page options:

```text
{parentPath}/{entity[idKey]}
```

---

## **Navigation Behavior**

- The header `ButtonsCard` provides a cancel action.
- Cancel navigation redirects the user back to the parent route.
- The edition page should generally not be exposed in the main navigation menu (`addNavigationMenu` disabled).

After successful edition, the user is redirected to the detail page.

---

## **Layout Structure**

The page is composed of:

- Header section containing:

  - Optional page title, displayed when the `{instanceId}.title` translation exists
  - `ButtonsCard` with cancel action and optional custom actions through zones

- Optional header zones for extensibility
- Configurable form sections
- Footer `ButtonsCard` containing:

  - Submit action
  - Optional custom actions through zones

Each form section card receives:

- `data-cy="form-section-card_{id}"`
- UI design namespace:

```text
{instanceId}.form-section-{id}
```

- Translation scope:

```text
{instanceId}.formSections.{id}
```

Each field container receives:

```text
data-cy="field-container_{fieldName}"
```

---

## **Zones**

This page exposes all default generic page zones described in the main **Zones** documentation.

No additional page-specific zones are provided.

---

## **Internationalization**

| Key                                          | Description                         |
| -------------------------------------------- | ----------------------------------- |
| `{instanceId}.title`                         | Optional page title                 |
| `{instanceId}.success`                       | Entity edition success notification |
| `{instanceId}.error`                         | Entity edition error notification   |
| `{instanceId}.ButtonsCard.cancel`            | Cancel button label                 |
| `{instanceId}.ButtonsCard.confirm`           | Submit button label                 |
| `{instanceId}.formSections.{id}.title`       | Form section title                  |
| `{instanceId}.formSections.{id}.description` | Form section description            |

Field-specific translations (labels, hints, validation messages, placeholders) are handled by `EntityAttributeField`.

---

## **UI Customization**

The page uses the LinID design system through `useUiDesign()`.

### Form Sections

Each section card can be customized through:

```text
{instanceId}.form-section-{id}
```

Applied to:

```text
q-card
```

Example:

```json
{
  "moduleApplicationEditionPage.form-section-identity": {
    "q-card": {
      "flat": true,
      "bordered": true
    }
  }
}
```

---

## **Dependencies**

- `LinidZoneRenderer` (zone injection points)
- `EntityAttributeField` (dynamic entity attribute rendering)
- `ButtonsCard` (navigation and form actions)
- `getEntityById` / `updateEntity` / `getModuleHostConfiguration` from `@linagora/linid-im-front-corelib`
- `useScopedI18n` (translations)
- `useUiDesign` (UI customization)
- `useNotify` (user notifications)
