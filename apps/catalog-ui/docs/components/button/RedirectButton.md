# **RedirectButton ↗️**

The **RedirectButton** component provides a reusable action button linking to a route rendered from
a Nunjucks template, the navigation being handled by the Vue Router.

The target route is resolved from the entity of the hosting zone, so a navigation action is driven
by configuration alone: no dedicated component is needed to expose a link towards another page,
such as the import page of a module or a page dedicated to the entity of a table row.

---

## **🎯 Purpose**

- Displays an action button navigating to a configurable route
- Resolves the route from a Nunjucks template rendered with the entity and its parent
- Renders as a link handled by the Vue Router: a click stays in the single-page application, while
  the browser link controls keep working (open in a new tab, copy the link)
- Can be disabled from an entity flag by passing a Nunjucks template as `disable`

---

## **⚙️ Props**

| Prop name     | Type                              | Default | Description                                                                                                                                                             |
| ------------- | --------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `to`          | `String`                          | —       | Target route, defined as a Nunjucks template                                                                                                                            |
| `entity`      | `Record<string, unknown> \| null` | —       | Entity associated with the current context, provided to the Nunjucks context. Injected by the hosting zone                                                              |
| `parent`      | `Record<string, unknown> \| null` | —       | Parent of the entity (e.g. the application owning a role), provided to the Nunjucks context                                                                             |
| `disable`     | `String \| Boolean`               | `false` | Disables the button, preventing the navigation. A string is a Nunjucks template rendered with the entity and its parent, disabling the button when it renders to `true` |
| `instanceId`  | `String`                          | —       | Instance identifier, used as i18n scope fallback                                                                                                                        |
| `uiNamespace` | `String`                          | —       | Base UI namespace used for design system customization                                                                                                                  |
| `i18nScope`   | `String`                          | —       | Identifier used to scope translations                                                                                                                                   |

### Templating

The `to` prop and a string `disable` are Nunjucks templates, rendered with a context containing
`entity` and `parent`:

```typescript
{
  to: '/accounts/{{ entity.id }}',
  disable: "{{ entity.status != 'ACTIVE' }}",
}
```

When the button targets an entity owned by another one (e.g. a role of an application), the owner is
provided through the `parent` prop:

```typescript
{
  to: '/applications/{{ parent.id }}/roles/{{ entity.id }}',
}
```

The component works when `entity` is `null`: templates are then rendered with an empty entity, which
suits static routes such as `/accounts/import`.

Rendered values are not URL-encoded: apply the `urlencode` filter to a value placed in a query string,
for example `/accounts?search={{ entity.name | urlencode }}`.

---

## **🧩 Internal Behavior**

- The button is disabled when `disable` is `true`, or when it is a Nunjucks template rendering to
  `true`; any other rendered value keeps the button enabled
- The `to` template is rendered with a context containing `entity` and `parent`, trimmed, and bound
  as the button link: a click navigates through the router, while `Ctrl`, `Cmd` or middle click opens
  the route in a new tab

---

## **🌍 Internationalization**

All keys are resolved under `${i18nScope}.RedirectButton`, the `i18nScope` prop falling back to the
`instanceId` prop. When neither is provided, the scope is `RedirectButton` alone:

| Key     | Description         |
| ------- | ------------------- |
| `title` | Label of the button |

---

## **🎨 UI Design**

Design keys are resolved under `${uiNamespace}.redirect-button`:

| Namespace                        | Type    | Description                                 |
| -------------------------------- | ------- | ------------------------------------------- |
| `${uiNamespace}.redirect-button` | `q-btn` | Action button (e.g. custom `icon`, `color`) |

---

## **🧩 Usage Examples**

### Through a zone configuration

The button is declared in the `zones` property of the module host configuration (see
[Generic Pages](../../generic-pages.md)). The hosting zone injects `instanceId`, `uiNamespace` and
`i18nScope`, along with the row `entity` when it renders entity actions.

Static route, in the actions of a table page:

```json
{
  "zone": "moduleAccountsPage.header.actions",
  "plugin": "catalogUI/RedirectButton",
  "props": {
    "to": "/accounts/import"
  }
}
```

This zone is rendered inside the actions card of the page, so the button receives a `uiNamespace` scoped
to `.buttons-card` and an `i18nScope` scoped to `.ButtonsCard`: its label is then resolved under
`moduleAccountsPage.ButtonsCard.RedirectButton.title`.

Route derived from the row entity, in the row actions of a table:

```json
{
  "zone": "moduleAccountsPage.row-actions",
  "plugin": "catalogUI/RedirectButton",
  "props": {
    "to": "/accounts/{{ entity.id }}/history",
    "disable": "{{ entity.status != 'ACTIVE' }}"
  }
}
```

### Direct usage

```vue
<RedirectButton :entity="account" to="/accounts/{{ entity.id }}/history" disable="{{ entity.status != 'ACTIVE' }}" ui-namespace="accounts.list" i18n-scope="accounts.list" />
```

---

## **✅ Advantages**

- **Standardized:** One consistent way to expose a navigation action
- **Configurable:** Route and disabling rule are driven by configuration
- **Zone-ready:** Designed to be rendered through a zone, with or without an injected entity
