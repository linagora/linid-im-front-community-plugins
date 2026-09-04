# **GenericCreationPage**

The **GenericCreationPage** component provides a reusable, federated page template for creating a new entity.

It follows the same generic and configurable approach as `GenericTablePage` and `GenericDetailsPage`: the page is fully driven by the module host configuration and can be integrated into different modules without requiring a custom implementation.

---

## **Purpose**

- Provide a reusable creation page for any entity
- Render a configurable creation form based on entity attribute definitions
- Group form fields into ordered sections, extensible through zones
- Let injected plugins feed the edited entity through the UI event bus
- Handle entity persistence through the generic entity creation mechanism
- Redirect the user to the created entity details page after successful creation

---

## **Configuration**

The page resolves its options from the module host configuration (`getModuleHostConfiguration(instanceId).options`), typed by `ModuleGenericCreationPageOptions`.

| Option           | Type            | Required | Description                                                                                  |
| ---------------- | --------------- | -------- | -------------------------------------------------------------------------------------------- |
| `formSections`   | `FormSection[]` | Yes      | Sections grouping the entity attributes displayed in the creation form                       |
| `idKey`          | `string`        | Yes      | Entity attribute used to retrieve the identifier of the created entity after saving          |
| `parentPath`     | `string`        | Yes      | Route path used to navigate back to the previous page after saving the entity                |
| `updateEntityOn` | `string[]`      | No       | UI event keys (from the `uiEventSubject` bus) whose payload is merged into the edited entity |

Each `FormSection` defines a group of fields rendered in the form.

| Field    | Type                          | Required | Description                                                              |
| -------- | ----------------------------- | -------- | ------------------------------------------------------------------------ |
| `id`     | `string`                      | Yes      | Unique section identifier used for translations and UI design namespaces |
| `fields` | `EntityAttributeDefinition[]` | Yes      | Ordered list of entity attributes rendered inside the section            |

Example module configuration:

```json
{
  "instanceId": "moduleApplicationCreationPage",
  "remoteName": "catalogUI",
  "apiEndpoint": "applications",
  "basePath": "/applications",
  "options": {
    "layout": "catalogUI/BaseLayout",
    "page": "catalogUI/GenericCreationPage",
    "pagePath": "create",
    "parentPath": "/applications",
    "idKey": "id",
    "formSections": [
      {
        "id": "identity",
        "fields": [
          {
            "name": "code",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      },
      {
        "id": "configuration",
        "fields": [
          {
            "name": "enabled",
            "type": "boolean"
          }
        ]
      }
    ]
  }
}
```

---

## **Form Rendering**

The creation form is generated from the configured `formSections`.

- Each section is rendered as a dedicated card.
- Sections are displayed in the order declared in the configuration.
- Each configured attribute is rendered using `EntityAttributeField`.
- Field values are automatically synchronized with the current entity through `v-model:entity`.

The entity starts as an empty object and is progressively populated while the user fills the form.

---

## **Entity Synchronization**

Beyond the form fields, the edited entity can also be fed by the UI event bus (`uiEventSubject`), so a plugin injected in one of the page zones can contribute to the entity being created.

- The page subscribes to the bus on mount and unsubscribes on unmount.
- When `updateEntityOn` is configured, the data of every UI event whose key is listed is **merged** into the entity state.
- The merge is shallow: the emitted keys overwrite the values already typed in the form, the other ones are preserved. A partial payload is therefore enough to feed a few attributes.
- Events carrying a payload that is not a plain object (`null` and arrays included) are ignored.
- Without `updateEntityOn`, UI events are ignored and the entity is only driven by the form fields.

```json
{
  "options": {
    "updateEntityOn": ["applicationTemplateSelected"]
  }
}
```

---

## **Data Saving**

When the form is submitted:

1. The page enters a loading state.
2. The entity is saved using `saveEntity(instanceId, entity)`.
3. On success:

- A positive notification (`{instanceId}.success`) is displayed.
- The user is redirected to the created entity details page using the returned identifier.

4. On failure:

- A negative notification (`{instanceId}.error`) is displayed.
- The user remains on the creation page.

The redirect path is generated using the parent route and the identifier returned from the backend:

```text
{parentPath}/{entity[idKey]}
```

---

## **Navigation Behavior**

- The footer `ButtonsCard` provides the cancel action.
- Cancel navigation redirects the user back to the parent route.
- The creation page should generally not be exposed in the main navigation menu (`addNavigationMenu` disabled).

After successful creation, the user is redirected to the details page of the newly created entity.

---

## **Layout Structure**

The page is composed of:

- Optional page title, displayed when the `{instanceId}.title` translation exists
- Header `ButtonsCard` containing:

  - Only the custom actions injected through the `header.actions` zone (its own cancel and confirm buttons are disabled)

- Configurable form sections, each one wrapping its fields between the `prepend` and `append` zones
- Footer `ButtonsCard` containing:

  - Cancel and submit actions
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
data-cy="field-container_{id}"
```

---

## **Zones**

This page exposes all default generic page zones described in the main **Zones** documentation, plus two additional page-specific zones rendered for **each** configured form section:

| Zone                                             | Location                                        | Typical Use                                                 |
| ------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| `{instanceId}.content.form-section-{id}.prepend` | Inside the section card, before the first field | Section introduction, template picker, custom leading field |
| `{instanceId}.content.form-section-{id}.append`  | Inside the section card, after the last field   | Extra custom fields, contextual help, computed summary      |

Both zones receive the current `entity`, so an injected plugin can react to the values being typed and, combined with `updateEntityOn`, emit a payload merged back into the entity.

Since these zones are rendered inside the field container (`row q-col-gutter-md`), injected components should carry their own grid classes (for example `col-12 col-sm-6 col-md-4`) to align with the generated fields.

---

## **Internationalization**

| Key                                          | Description                          |
| -------------------------------------------- | ------------------------------------ |
| `{instanceId}.title`                         | Optional page title                  |
| `{instanceId}.success`                       | Entity creation success notification |
| `{instanceId}.error`                         | Entity creation error notification   |
| `{instanceId}.ButtonsCard.cancel`            | Cancel button label                  |
| `{instanceId}.ButtonsCard.confirm`           | Submit button label                  |
| `{instanceId}.formSections.{id}.title`       | Form section title                   |
| `{instanceId}.formSections.{id}.description` | Form section description             |

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
  "moduleApplicationCreationPage.form-section-identity": {
    "q-card": {
      "flat": true,
      "bordered": true
    }
  }
}
```

The same namespace is also passed to the fields of the section and to its `prepend` and `append` zones, so an injected plugin is customized under the same key as the fields surrounding it.

---

## **Dependencies**

- `LinidZoneRenderer` (zone injection points)
- `EntityAttributeField` (dynamic entity attribute rendering)
- `ButtonsCard` (navigation and form actions)
- `saveEntity` / `getModuleHostConfiguration` / `uiEventSubject` from `@linagora/linid-im-front-corelib`
- `useScopedI18n` (translations)
- `useUiDesign` (UI customization)
