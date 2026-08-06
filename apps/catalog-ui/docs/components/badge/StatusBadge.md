# StatusBadge

## Overview

The `StatusBadge` component is a reusable badge component that standardizes the display of entity statuses across applications.

## Features

- **Automatic Value Resolution**: Extracts status values from entity objects using a configurable key
- **Global i18n Support**: Translates status values using a centralized `StatusBadge` i18n section
- **Design Configuration**: Applies global badge styling based on status values
- **Type-Safe**: Full TypeScript support with proper type definitions
- **Reusable**: Designed to work across multiple applications without modification

## Component API

### Props

The component accepts the following props:

| Prop           | Type     | Description                                                                                          |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `entity`       | `Object` | The source entity containing the status value                                                        |
| `valueKey`     | `String` | The key used to retrieve the badge value from the entity (e.g., `status`, `state`)                   |
| `defaultValue` | `String` | The fallback value to display when the entity or the property at `valueKey` is `null` or `undefined` |

### Example Usage

```vue
<template>
  <component
    :is="StatusBadge"
    v-if="StatusBadge"
    :entity="user"
    value-key="status"
    default-value="UNKNOWN"
  />
</template>

<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';

const StatusBadge = loadAsyncComponent('catalogUI/StatusBadge');
const user = {
  id: '123',
  name: 'John Doe',
  status: 'ACTIVE', // This value will be used for the badge
};
</script>
```

## Configuration

### 1. Internationalization (i18n)

Define translations in your host application's i18n configuration under the global `StatusBadge` section:

```json
{
  "StatusBadge": {
    "ACTIVE": "Active",
    "INACTIVE": "Inactive",
    "PENDING": "Pending",
    "SUSPENDED": "Suspended",
    "ARCHIVED": "Archived"
  }
}
```

### 2. UI Design Configuration

Configure the badge appearance per status in your UI design system:

```json
{
  "status-badge": {
    "ACTIVE": {
      "q-badge": {
        "color": "positive",
        "textColor": "white"
      }
    },
    "INACTIVE": {
      "q-badge": {
        "color": "negative",
        "textColor": "white"
      }
    }
  }
}
```

## Behavior

### Value Resolution

The component resolves the status value using the following logic:

```typescript
const statusValue = entity[valueKey] || defaultValue;
```

If `entity[valueKey]` is `undefined`, `null`, or any falsy value, the component will use the `defaultValue` prop instead.
This ensures the badge always has a value to display, preventing empty or broken UI states.

### Label Translation

The badge displays the translated label using:

```typescript
const label = i18n.t(`StatusBadge.${statusValue}`);
```

If the translation key doesn't exist, it will display the key itself (Vue i18n default behavior).
