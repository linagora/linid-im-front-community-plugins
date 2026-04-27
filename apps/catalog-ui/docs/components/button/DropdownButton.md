# **DropdownButton**

The **DropdownButton** component provides a reusable dropdown action button with support for flat items and one-level nested sub-menus.
It dynamically builds UI design props for each menu entry, integrates with scoped translations, and emits a normalized event payload when an action is selected.

---

## **Purpose**

- Offers a consistent dropdown action menu across catalog UI screens
- Supports both direct actions and grouped actions with one nested submenu level
- Integrates with the LinID design system for consistent styling
- Uses scoped i18n keys for the button label, parent labels, and child labels
- Emits a normalized action key so parent components can handle all actions in one place
- Provides `data-cy` attributes for straightforward E2E targeting

---

## **Props**

| Prop          | Type         | Required | Default | Description                                  |
| ------------- | ------------ | -------- | ------- | -------------------------------------------- |
| `uiNamespace` | `string`     | Yes      | -       | UI design namespace for custom styling       |
| `i18nScope`   | `string`     | Yes      | -       | i18n scope for translations                  |
| `items`       | `MenuItem[]` | Yes      | -       | List of menu items displayed in the dropdown |

### MenuItem Interface

```typescript
/**
 * Defines the shape of a dropdown button menu item.
 */
export interface MenuItem {
  /**
   * The unique identifier of the menu item, used as an i18n key and as the base of the emitted action key.
   */
  key: string;

  /**
   * Whether the menu item is clickable or not.
   */
  clickable: boolean;

  /**
   * An optional array of child menu item keys, representing a nested menu structure.
   */
  children?: string[];
}
```

### DropdownButtonProps Interface

```typescript
/**
 * Defines the shape of the props for a dropdown button component.
 */
export interface DropdownButtonProps extends CommonComponentProps {
  /**
   * An array of menu items to be displayed in the dropdown.
   */
  items: MenuItem[];
}
```

---

## **Events**

| Event       | Payload           | Description                            |
| ----------- | ----------------- | -------------------------------------- |
| `itemClick` | `{ key: string }` | Emitted when a leaf action is selected |

**Important:**

- A root item without children emits its own `key` as payload: `{ key: 'edit' }`
- A child item emits a dotted key composed from its parent and child keys: `{ key: 'export.csv' }`
- Parent items that own children do not emit an event themselves; only their children do

### DropdownButtonOutputs Interface

```typescript
/**
 * Outputs (events) emitted by the DropdownButton component.
 */
export interface DropdownButtonOutputs {
  /**
   * Emitted when a menu item is clicked.
   */
  itemClick: [
    {
      /**
       * The action key of the clicked item. For a root item it equals the item's key (e.g. `'edit'`).
       * For a child item it is a dot-separated composite of the parent key and child key (e.g. `'export.csv'`).
       */
      key: string;
    },
  ];
}
```

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()`. You can customize:

- **Dropdown button**: `{uiNamespace}.dropdown-button` → applies to `q-btn-dropdown`
- **Root list**: `{uiNamespace}.dropdown-button` → applies to `q-list`
- **Sub-menu**: `{uiNamespace}.dropdown-button` → applies to `q-menu`
- **Sub-menu trigger icon section**: `{uiNamespace}.dropdown-button.menu-trigger` → applies to `q-item-section`
- **Sub-menu trigger icon**: `{uiNamespace}.dropdown-button.menu-trigger` → applies to `q-icon`
- **Root item container**: `{uiNamespace}.dropdown-button.items.{itemKey}` → applies to `q-item`
- **Root item icon section**: `{uiNamespace}.dropdown-button.items.{itemKey}.icon` → applies to `q-item-section`
- **Root item icon**: `{uiNamespace}.dropdown-button.items.{itemKey}.icon` → applies to `q-icon`
- **Root item label section**: `{uiNamespace}.dropdown-button.items.{itemKey}.label` → applies to `q-item-section`
- **Root item label**: `{uiNamespace}.dropdown-button.items.{itemKey}.label` → applies to `q-item-label`
- **Child item container**: `{uiNamespace}.dropdown-button.items.{itemKey}.children.{childKey}` → applies to `q-item`
- **Child item icon section**: `{uiNamespace}.dropdown-button.items.{itemKey}.children.{childKey}.icon` → applies to `q-item-section`
- **Child item icon**: `{uiNamespace}.dropdown-button.items.{itemKey}.children.{childKey}.icon` → applies to `q-icon`
- **Child item label section**: `{uiNamespace}.dropdown-button.items.{itemKey}.children.{childKey}.label` → applies to `q-item-section`
- **Child item label**: `{uiNamespace}.dropdown-button.items.{itemKey}.children.{childKey}.label` → applies to `q-item-label`

Here is a sample JSON configuration for the design system:

```json
{
  "catalogPage": {
    "dropdown-button": {
      "q-btn-dropdown": {
        "color": "primary",
        "outline": true,
        "icon": "more_vert"
      },
      "q-list": {
        "dense": true
      },
      "q-menu": {
        "autoClose": false
      },
      "menu-trigger": {
        "q-item-section": {
          "side": true
        },
        "q-icon": {
          "name": "keyboard_arrow_right",
          "size": "16px"
        }
      },
      "items": {
        "edit": {
          "q-item": {
            "clickable": true
          },
          "label": {
            "q-item-label": {
              "lines": 1
            }
          }
        },
        "export": {
          "children": {
            "csv": {
              "q-item": {
                "clickable": true
              }
            },
            "pdf": {
              "q-item": {
                "clickable": true
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

## **Internationalization**

The component requires an i18n scope (`i18nScope`) and expects the following keys:

- `{i18nScope}.DropdownButton.title` - Label displayed on the dropdown button
- `{i18nScope}.DropdownButton.{ITEM_KEY}` - Label for a root item without children
- `{i18nScope}.DropdownButton.{ITEM_KEY}.title` - Label for a root item that opens a submenu
- `{i18nScope}.DropdownButton.{ITEM_KEY}.{CHILD_KEY}` - Label for a child item inside a submenu

Example:

```json
{
  "moduleUsers.UsersPage": {
    "DropdownButton": {
      "title": "Actions",
      "edit": "Edit user",
      "archive": "Archive user",
      "export": {
        "title": "Export",
        "csv": "Export as CSV",
        "pdf": "Export as PDF"
      }
    }
  }
}
```

---

## **Advantages**

- **Consistency:** Uniform action dropdown pattern across modules
- **Type-safe:** Full TypeScript support for props, events, and UI mapping
- **Structured:** Supports simple actions and grouped actions with one submenu level
- **Customizable:** Fine-grained UI namespacing for root items and child items
- **i18n ready:** Fully internationalized with predictable translation keys
- **Simple integration:** One event channel for all selected actions
- **Test-friendly:** Includes `data-cy` attributes for E2E testing
- **Reusable:** Parent components only provide item definitions and handle emitted action keys

---

## **Usage Example**

### Basic Usage Through Module Federation

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import type { MenuItem } from '@/types/dropdownButton';

const dropdownButton = loadAsyncComponent('catalogUI/DropdownButton');

const items: MenuItem[] = [
  {
    key: 'edit',
    clickable: true,
  },
  {
    key: 'export',
    clickable: true,
    children: ['csv', 'pdf'],
  },
  {
    key: 'archive',
    clickable: false,
  },
];

function onItemClick({ key }: { key: string }) {
  if (key === 'edit') {
    openEditionDialog();
  }

  if (key === 'export.csv') {
    exportAsCsv();
  }

  if (key === 'export.pdf') {
    exportAsPdf();
  }
}
</script>

<template>
  <component
    :is="dropdownButton"
    v-if="dropdownButton"
    ui-namespace="catalogPage"
    i18n-scope="moduleUsers.UsersPage"
    :items="items"
    @item-click="onItemClick"
  />
</template>
```

### With Centralized Action Dispatch Through Module Federation

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';
import type { MenuItem } from '@/types/dropdownButton';

const dropdownButton = loadAsyncComponent('catalogUI/DropdownButton');

const items: MenuItem[] = [
  { key: 'open', clickable: true },
  { key: 'duplicate', clickable: true },
  { key: 'export', clickable: true, children: ['csv', 'json'] },
];

const actionHandlers: Record<string, () => void> = {
  open: () => openEntity(),
  duplicate: () => duplicateEntity(),
  'export.csv': () => exportEntity('csv'),
  'export.json': () => exportEntity('json'),
};

function onItemClick({ key }: { key: string }) {
  actionHandlers[key]?.();
}
</script>

<template>
  <component
    :is="dropdownButton"
    v-if="dropdownButton"
    ui-namespace="catalogPage"
    i18n-scope="moduleImport.ImportPage"
    :items="items"
    @item-click="onItemClick"
  />
</template>
```

---

## **Notes**

- **One submenu level only:** The component supports root items and one child level. Child items cannot themselves define nested children
- **Leaf items only emit:** Only direct leaf actions emit `itemClick`
- **Parent translation rule:** Items with children use the `.title` translation key for the visible root label
- **Clickable parent requirement:** If an item has children, its submenu is rendered only when `clickable` is `true`
- **Disabled leaf behavior:** A root item without children can be rendered as non-clickable by setting `clickable: false`
- **Reactive item mapping:** Both `uiProps` and `itemsWithUI` are computed properties, so any runtime change to the `items` prop (e.g. changing available actions based on entity state) is automatically reflected in the rendered menu
- **UI namespacing:** Every root item and child item gets its own namespace for granular customization
- **Template coverage:** The template contains only presentation and event wiring logic

---

## **Testing**

The component includes `data-cy` attributes for Cypress testing:

- Main dropdown button: `data-cy="dropdown-button"`
- Root item: `data-cy="dropdown-button_item_{itemName}"`
- Child item: `data-cy="dropdown-button_item_{parentName}_{childName}"`

---

## **Architecture**

The component follows a declarative action-menu architecture:

1. **Props in:** Receives a UI namespace, an i18n scope, and the menu item definitions
2. **Local namespace resolution:** Builds a local component namespace from `uiNamespace`
3. **UI props generation:** Generates design-system props for the dropdown button, root items, submenu trigger, and child items
4. **Item enrichment:** Creates `itemsWithUI` by pairing each item with its generated UI configuration
5. **Rendering:** Displays either a direct action item or a parent item with a nested submenu depending on `children`
6. **User interaction:** Captures clicks on leaf items
7. **Events out:** Emits a normalized `itemClick` payload containing the selected action key

This architecture ensures:

- **Separation of concerns:** The component handles rendering and event normalization, while the parent handles business actions
- **Reusability:** The same component can drive many action menus with different item definitions
- **Scalability:** UI customization remains granular even when menus grow in size
- **Testability:** The action mapping and emitted payloads are easy to validate
- **Predictability:** Translation and emitted key formats follow stable naming rules

---

## **CSS Classes**

The component applies the following CSS classes for styling customization:

- `.dropdown-button` - Main dropdown button container
- `.dropdown-button--list` - Root or submenu list container
- `.dropdown-button--item` - Root or child menu item
- `.dropdown-button--item--icon-section` - Icon section inside a menu item
- `.dropdown-button--item--label-section` - Label section inside a menu item
- `.dropdown-button--item--label` - Label text inside a menu item
- `.dropdown-button--sub-menu` - Nested submenu container
- `.dropdown-button--sub-menu--trigger-section` - Section containing the submenu trigger icon

These classes can be targeted in your global or scoped styles for additional customization beyond the design system.

---

## **Menu Structure Support**

The component supports the following item configurations:

| Item Shape                                                     | Behavior                                         | Emitted Key                |
| -------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| `{ key: 'edit', clickable: true }`                             | Renders a direct action item                     | `edit`                     |
| `{ key: 'archive', clickable: false }`                         | Renders a disabled root item                     | None                       |
| `{ key: 'export', clickable: true, children: ['csv', 'pdf'] }` | Renders a parent item with submenu               | `export.csv`, `export.pdf` |
| `{ key: 'export', clickable: false, children: ['csv'] }`       | Renders the parent row without an active submenu | None                       |

This makes the component suitable for compact action menus where some commands are immediate and others must be grouped under a common parent action.
