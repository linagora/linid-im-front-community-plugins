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

Each `DetailSection` is defined as:

| Field                 | Type       | Required | Description                                                              |
| --------------------- | ---------- | -------- | ------------------------------------------------------------------------ |
| `key`                 | `string`   | Yes      | Unique key used for translations and UI design namespaces                |
| `fieldOrder`          | `string[]` | Yes      | Ordered list of entity attribute keys displayed in the section           |
| `showRemainingFields` | `boolean`  | No       | Also displays the attributes not listed in any `fieldOrder` (default no) |

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
    "sections": [
      { "key": "identity", "fieldOrder": ["code", "name", "description"] },
      {
        "key": "audit",
        "fieldOrder": ["createdBy", "updatedBy", "insertDate", "updateDate"]
      }
    ]
  }
}
```

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

## **Zones**

The page exposes three zones through `LinidZoneRenderer`, allowing the host application or other modules to inject
components (federated plugins via `registerPlugin`, or local Vue components via `registerComponent`):

| Zone                        | Location                                        | Typical Use                        |
| --------------------------- | ----------------------------------------------- | ---------------------------------- |
| `{instanceId}.titleAppend`  | Next to the page title                          | Status badge                       |
| `{instanceId}.extraButtons` | Inside the actions card, before the edit button | Extra navigation or action buttons |
| `{instanceId}.extraContent` | Between the header and the details sections     | Banners, contextual action panels  |

All zones receive the following props through attribute forwarding: `entity`, `instanceId`, `uiNamespace` and
`i18nScope`. The `extraContent` zone additionally receives `entityId` and `isLoading`.

Injected components can trigger an entity reload by emitting a UI event listed in the `reloadDetailsOn` module option
(see **Data Loading**).

---

## **Dependencies**

- `LinidZoneRenderer` (zone injection points)
- `EntityDetailsCard` (attribute rendering)
- `ButtonsCard` (navigation actions)
- `getEntityById` / `getModuleHostConfiguration` / `uiEventSubject` from `@linagora/linid-im-front-corelib`
