# **SupersetWidgetCard 📊**

The **SupersetWidgetCard** component provides an embeddable Apache Superset dashboard inside the LinID Identity Manager UI.

It handles the complete dashboard embedding flow: resolving the Superset dashboard ID from its slug when necessary, requesting a guest token from the backend, mounting the dashboard through the Superset Embedded SDK, displaying a loading state, and cleaning up the embedded dashboard when the component is unmounted.

It is designed to make Superset dashboards configurable through zones or direct component usage without requiring each feature to implement the Superset embedding lifecycle itself.

---

## **🎯 Purpose**

- Embeds an Apache Superset dashboard using the Superset Embedded SDK
- Identifies the dashboard using a configurable slug
- Optionally accepts a dashboard ID directly
- Resolves the dashboard ID from the slug when no ID is provided
- Requests a guest token from the LinID backend
- Supports Row Level Security (RLS) through a configurable `rlsId`
- Renders the `rlsId` as a Nunjucks template using the current entity
- Supports Superset UI configuration overrides
- Displays a loading indicator while the dashboard is being initialized
- Displays a translated error notification when embedding fails
- Automatically unmounts the Superset dashboard when the component is destroyed
- Provides an optional translated dashboard title

---

## **⚙️ Props**

| Prop name        | Type                      | Default | Description                                                                                               |
| ---------------- | ------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `entity`         | `Record<string, unknown>` | `{}`    | Entity made available to the Nunjucks context when rendering the `rlsId`                                  |
| `supersetDomain` | `string`                  | —       | Base URL of the Apache Superset instance                                                                  |
| `dashboardSlug`  | `string`                  | —       | Slug identifying the Superset dashboard to embed                                                          |
| `dashboardId`    | `string`                  | —       | Optional Superset dashboard ID. When omitted, the ID is resolved from `dashboardSlug` through the backend |
| `rlsId`          | `string`                  | —       | Optional Nunjucks template used to determine the RLS identifier sent when requesting the guest token      |
| `uiConfig`       | `Record<string, unknown>` | —       | Optional Superset Embedded SDK UI configuration overriding the component defaults                         |
| `style`          | `string[]`                | —       | CSS classes/styles applied to the root widget container                                                   |
| `instanceId`     | `string`                  | —       | Instance identifier inherited from `CommonComponentProps`                                                 |
| `uiNamespace`    | `string`                  | —       | UI namespace inherited from `CommonComponentProps`                                                        |
| `i18nScope`      | `string`                  | —       | Translation scope inherited from `CommonComponentProps`                                                   |

### Type definition

```typescript
export interface SupersetWidgetCardProps extends CommonComponentProps {
  entity?: Record<string, unknown>;
  supersetDomain: string;
  dashboardSlug: string;
  dashboardId?: string;
  rlsId?: string;
  uiConfig?: Record<string, unknown>;
  style: string[];
}
```

---

## **🔐 Guest Token**

The component does not obtain the Superset guest token directly from Superset.

Instead, it calls the LinID backend:

```http
POST /superset/token
```

with:

```typescript
{
  dashboardSlug: props.dashboardSlug,
  dashboardId: dashboardId.value,
  rlsId: render(props.rlsId, nunjucksContext.value),
}
```

The backend is responsible for generating the guest token.

The response is expected to contain:

```typescript
{
  token: string;
  dashboardId: string;
}
```

Only the `token` is returned to the Superset Embedded SDK.

---

## **🆔 Dashboard ID Resolution**

The component supports two ways of identifying the Superset dashboard.

### Dashboard ID provided

When `dashboardId` is provided:

```vue
<SupersetWidgetCard dashboard-slug="USER_LOG_DASHBOARD" dashboard-id="123" ... />
```

the provided ID is used directly.

### Dashboard ID not provided

When `dashboardId` is omitted, the component resolves it through:

```http
GET /superset/dashboard-id/{dashboardSlug}
```

For example:

```http
GET /superset/dashboard-id/USER_LOG_DASHBOARD
```

The returned ID is then used to initialize the Superset Embedded SDK.

This allows configurations to reference dashboards by their stable slug without having to expose the internal Superset dashboard ID in the frontend configuration.

---

## **🔒 Row Level Security**

The optional `rlsId` prop supports dynamic RLS configuration.

The value is interpreted as a Nunjucks template and rendered with the component entity:

```typescript
const nunjucksContext = computed(() => ({
  entity: props.entity ?? {},
}));
```

For example:

```vue
<SupersetWidgetCard dashboard-slug="USER_LOG_DASHBOARD" rls-id="{{ entity.id }}" :entity="user" />
```

If:

```typescript
entity = {
  id: '123456',
};
```

the value sent to the backend is:

```text
123456
```

This allows the same Superset dashboard to be embedded with an RLS identifier dynamically derived from the entity displayed by the hosting page.

---

## **🎨 Superset UI Configuration**

The component applies the following default Superset UI configuration:

```typescript
{
  hideTitle: true,
  hideChartControls: true,
  hideTab: true,
  filters: {
    expanded: false,
    visible: false,
  },
}
```

The `uiConfig` prop is merged on top of these defaults:

```typescript
dashboardUiConfig: {
  hideTitle: true,
  hideChartControls: true,
  hideTab: true,
  filters: {
    expanded: false,
    visible: false,
  },
  ...props.uiConfig,
}
```

Therefore, custom configuration can override the defaults.

For example:

```vue
<SupersetWidgetCard
  dashboard-slug="USER_LOG_DASHBOARD"
  :ui-config="{
    hideTitle: false,
    hideTab: false,
  }"
/>
```

---

## **🌍 Internationalization**

Translations are resolved under:

```text
${i18nScope}.SupersetWidgetCard
```

### Dashboard title

The component optionally displays:

```text
slug.${dashboardSlug}.title
```

For example:

```text
myPage.SupersetWidgetCard.slug.USER_LOG_DASHBOARD.title
```

If the translation key exists, the title is rendered above the dashboard.

If the key does not exist, no title section is rendered.

### Error notification

When the dashboard cannot be embedded, the component displays:

```text
${i18nScope}.SupersetWidgetCard.error
```

as a negative notification.

---

## **🔄 Lifecycle**

The component manages the complete Superset embedding lifecycle.

### Mount

When the component is mounted:

```typescript
onMounted(() => {
  mountWidget();
});
```

`mountWidget()`:

1. Enables the loading state
2. Resolves the dashboard ID if necessary
3. Requests a guest token
4. Initializes the Superset Embedded SDK
5. Stores the SDK `unmount` function
6. Disables the loading state

### Unmount

When the component is destroyed:

```typescript
onBeforeUnmount(() => {
  unmountFn?.();
});
```

the Superset dashboard is explicitly unmounted.

This prevents the embedded dashboard from remaining attached to the DOM after the Vue component has been destroyed.

---

## **⏳ Loading State**

The widget displays a Quasar `q-inner-loading` while the Superset dashboard is being initialized:

```vue
<q-inner-loading :showing="loading" />
```

The loading state is enabled before initialization and disabled in the `finally` block:

```typescript
loading.value = true;

try {
  // Dashboard initialization
} catch (e) {
  // Error handling
} finally {
  loading.value = false;
}
```

Consequently, the loading indicator is removed whether the dashboard initialization succeeds or fails.

---

## **❌ Error Handling**

Any error occurring during the dashboard initialization flow is caught by `mountWidget()`.

The component:

- Displays a negative notification
- Uses the translated `error` key
- Removes the loading state
- Does not expose the underlying error directly to the UI

```typescript
catch (e) {
  Notify({
    type: 'negative',
    message: t('error'),
  });
}
```

---

## **🎨 UI Design**

The component uses the following main CSS classes:

| Class                          | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `.superset-widget-card`        | Root container of the widget                  |
| `.superset-widget-card--title` | Container for the optional dashboard title    |
| `.superset-mount`              | Mount point used by the Superset Embedded SDK |

The root container uses:

```css
.superset-widget-card {
  position: relative;
  width: 100%;
}
```

The Superset mount point occupies the available width and height:

```css
.superset-mount {
  width: 100%;
  height: 100%;
  display: flex;
}
```

The embedded iframe is explicitly sized to fill the container:

```css
.superset-mount :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
  border: none;
  display: block;
}
```

---

## **🧩 Internal Functions**

### `fetchGuestToken`

Requests a guest token from the LinID backend.

The request contains:

- `dashboardSlug`
- resolved `dashboardId`
- rendered `rlsId`

It returns the token consumed by the Superset Embedded SDK.

### `getDashboardId`

Resolves the Superset dashboard ID from its configured slug through the LinID backend.

### `mountWidget`

Initializes the complete Superset embedding process.

It resolves the dashboard ID when necessary, configures the Superset Embedded SDK, registers the guest-token callback, manages the loading state, handles errors, and stores the SDK cleanup function.

---

## **🔌 Plugin / Zone Usage**

The component can be used as a plugin through the LinID zone system.

The hosting zone can inject common component properties such as:

- `entity`
- `instanceId`
- `uiNamespace`
- `i18nScope`

The `entity` is particularly useful when the dashboard requires dynamic RLS:

```json
{
  "plugin": "catalogUI/SupersetWidgetCard",
  "props": {
    "supersetDomain": "https://superset.example.com",
    "dashboardSlug": "USER_LOG_DASHBOARD",
    "rlsId": "{{ entity.id }}"
  }
}
```

---

## **🧩 Usage Examples**

### Basic usage

```vue
<SupersetWidgetCard superset-domain="https://superset.example.com" dashboard-slug="USER_LOG_DASHBOARD" :style="['height: 600px']" />
```

### With a dashboard ID

```vue
<SupersetWidgetCard superset-domain="https://superset.example.com" dashboard-slug="USER_LOG_DASHBOARD" dashboard-id="12" :style="['height: 600px']" />
```

### With dynamic RLS

```vue
<SupersetWidgetCard :entity="user" superset-domain="https://superset.example.com" dashboard-slug="USER_LOG_DASHBOARD" rls-id="{{ entity.id }}" :style="['height: 600px']" />
```

### With custom UI configuration

```vue
<SupersetWidgetCard
  superset-domain="https://superset.example.com"
  dashboard-slug="USER_LOG_DASHBOARD"
  :ui-config="{
    hideTitle: false,
    hideChartControls: false,
    filters: {
      expanded: true,
      visible: true,
    },
  }"
  :style="['height: 600px']"
/>
```

### Through a zone configuration

```json
{
  "zone": "userDetailsPage.content.after",
  "plugin": "catalogUI/SupersetWidgetCard",
  "props": {
    "supersetDomain": "https://superset.example.com",
    "dashboardSlug": "USER_LOG_DASHBOARD",
    "rlsId": "{{ entity.id }}",
    "style": ["height: 600px"]
  }
}
```

---

## **🔗 Backend Endpoints**

The component expects the LinID backend to expose the following endpoints:

| Method | Endpoint                                 | Purpose                                          |
| ------ | ---------------------------------------- | ------------------------------------------------ |
| `GET`  | `/superset/dashboard-id/{dashboardSlug}` | Resolves the Superset dashboard ID from its slug |
| `POST` | `/superset/token`                        | Generates a Superset guest token                 |

The token endpoint receives:

```typescript
{
  dashboardSlug: string;
  dashboardId?: string;
  rlsId?: string;
}
```

and returns:

```typescript
{
  token: string;
  dashboardId: string;
}
```

---

## **✅ Advantages**

- **Simple:** Embeds a Superset dashboard with a single reusable component
- **Secure:** Guest tokens are generated by the LinID backend rather than exposing Superset authentication credentials
- **RLS-ready:** Supports dynamic Row Level Security identifiers through Nunjucks
- **Configurable:** Dashboard ID, slug and Superset UI options can be configured independently
- **Zone-ready:** Works naturally with LinID's zone-based plugin architecture
- **Entity-aware:** RLS configuration can dynamically reference the hosting entity
- **Lifecycle-safe:** Explicitly cleans up the Superset Embedded SDK instance when unmounted
- **Responsive:** The embedded iframe automatically fills the widget container
- **Internationalized:** Dashboard titles and error messages use the component i18n scope
