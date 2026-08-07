# **GenericDetailsPage**

The **GenericDetailsPage** component provides a reusable, federated page template for displaying the details of a single entity.

It follows the same generic and configurable approach as `GenericTablePage`: the page is fully driven by the module host configuration and can be integrated into different modules without requiring a custom implementation.

---

## **Purpose**

- Provide a reusable details page for any entity
- Display entity attributes with `EntityDetailsCard`, grouped by configurable sections
- Load the entity automatically on page initialization
- Offer navigation back to the previous page, and optionally to the entity edit page

---

## **Configuration**

The page resolves its options from the module host configuration (`getModuleHostConfiguration(instanceId).options`), typed by `ModuleGenericDetailsPageOptions`:

| Option            | Type              | Required | Description                                                                                                                  |
| ----------------- | ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `sections`        | `DetailSection[]` | Yes      | Sections grouping the displayed attributes by category, rendered in the declared order                                       |
| `editPath`        | `string`          | No       | Nunjucks template of the edit page path, rendered with the loaded `entity` as context; when set, an edit button is displayed |
| `reloadDetailsOn` | `string[]`        | No       | UI event keys (from the `uiEventSubject` bus) triggering a reload of the entity                                              |
| `parentPath`      | `string`          | Yes      | Route path used to navigate back to the previous page after saving the entity                                                |

Each `DetailSection` is defined as:

| Field                 | Type               | Required | Description                                                              |
| --------------------- | ------------------ | -------- | ------------------------------------------------------------------------ |
| `key`                 | `string`           | Yes      | Unique key used for translations and UI design namespaces                |
| `fieldOrder`          | `string[]`         | Yes      | Ordered list of entity attribute keys displayed in the section           |
| `showRemainingFields` | `boolean`          | No       | Also displays the attributes not listed in any `fieldOrder` (default no) |
| `formatters`          | `FieldFormatter[]` | No       | Formatters applied to specific section attributes before display         |

Example module configuration:

```json
{
  "instanceId": "moduleApplicationDetailsPage",
  "remoteName": "catalogUI",
  "apiEndpoint": "applications",
  "basePath": "/applications",
  "options": {
    "layout": "catalogUI/BaseLayout",
    "page": "catalogUI/GenericDetailsPage",
    "pagePath": ":id",
    "parentPath": "/applications",
    "sections": [
      { "key": "identity", "fieldOrder": ["code", "name", "description"] },
      {
        "key": "audit",
        "formatters": [
          {
            "field": "insertDate",
            "formatter": "toDate",
            "formatOptions": {
              "formatKey": "application.dateFormat"
            }
          },
          {
            "field": "updateDate",
            "formatter": "toDate",
            "formatOptions": {
              "formatKey": "application.dateFormat"
            }
          }
        ],
        "fieldOrder": ["createdBy", "updatedBy", "insertDate", "updateDate"]
      }
    ]
  }
}
```

---

## **Value Formatting**

Section attributes can be formatted before display using the optional `formatters` property.
For detailed information about available formatters and configuration options, see the
[**Value Formatting Guide**](../value-formatting.md).

The `formatters` array contains `FieldFormatter` objects that specify:

- `field` — The attribute name to format
- `formatter` — The formatter name (e.g., `'toDate'`)
- `formatOptions` — Configuration options for the formatter

---

## **Data Loading**

- On page mount (`onMounted`), the entity is automatically fetched with `getEntityById(instanceId, entityId)`.
- The entity identifier comes from the `:id` route parameter.
- The endpoint URL is resolved from the module configuration file (`apiEndpoint`).
- On failure, a negative notification (`{instanceId}.error`) is displayed and the user is navigated back.
- When `reloadDetailsOn` is configured, the entity is reloaded every time a UI event with one of the configured keys is emitted.

---

## **Navigation Behavior**

- Detail pages should not enable the `addNavigationMenu` module option, so the module stays out of the host main navigation menu (it is disabled by default).
- The button card displays a cancel button navigating back to the previous page.
- The navigation uses the browser history when possible, and falls back to the parent route (`basePath`) otherwise.
- When `editPath` is set, an edit button redirects to the rendered path (e.g. `/applications/{{ entity.id }}/edit`).

---

## **Layout Structure**

- Optional page title, displayed when the `{instanceId}.title` translation exists
- A `ButtonsCard` hosting the back button and the optional edit button
- One `EntityDetailsCard` per configured section, rendered in the declared order

Each section card receives:

- `data-cy="details-section_{key}"`
- The i18n scope `{instanceId}.sections.{key}` (title: `...EntityDetailsCard.title`, labels: `...EntityDetailsCard.attributes.{field}`)
- The UI design namespace `{instanceId}.sections.{key}`

---

## **Zones**

This page exposes all default generic page zones described in the main **Zones** documentation, plus two additional page-specific zones:

| Zone                      | Location                          | Typical Use                       |
| ------------------------- | --------------------------------- | --------------------------------- |
| `{instanceId}.side-left`  | Left sidebar of the details page  | Related entities, navigation menu |
| `{instanceId}.side-right` | Right sidebar of the details page | Metadata, related information     |

Every zone additionally receives the loaded `entity`, and the `content.before`, `content.after`, `side-left`, and `side-right` zones also receive `entityId` and `isLoading`.

---

## **Internationalization**

| Key                                                                | Description                       |
| ------------------------------------------------------------------ | --------------------------------- |
| `{instanceId}.title`                                               | Optional page title               |
| `{instanceId}.error`                                               | Entity loading error notification |
| `{instanceId}.ButtonsCard.cancel`                                  | Back button label                 |
| `{instanceId}.ButtonsCard.edit`                                    | Edit button label                 |
| `{instanceId}.sections.{key}.EntityDetailsCard.title`              | Section title                     |
| `{instanceId}.sections.{key}.EntityDetailsCard.attributes.{field}` | Attribute label                   |

---

## **UI Customization**

The page uses the LinID design system through `useUiDesign()`:

- **Edit button**: `{instanceId}.buttons-card.edit-button` → applies to `q-btn`
- **Section cards**: `{instanceId}.sections.{key}.entity-details-card` namespaces (see `EntityDetailsCard`)

---

## **Dependencies**

- `LinidZoneRenderer` (zone injection points)
- `EntityDetailsCard` (attribute rendering)
- `ButtonsCard` (navigation actions)
- `getEntityById` / `getModuleHostConfiguration` / `uiEventSubject` from `@linagora/linid-im-front-corelib`
