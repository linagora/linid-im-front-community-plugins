# **EntityAttributeTreeField 🌳**

The **EntityAttributeTreeField** component renders an entity attribute as a **tree node picker**: the user selects a
node in a tree fetched from a backend endpoint, and the key of the selected node is stored as the attribute value.

It is rendered by `EntityAttributeField` for attribute definitions declaring `input: 'Tree'`, and therefore works in
every generic form page (`GenericCreationPage`, `GenericEditionPage`, `FormDialog`, ...). On an edition form, the node
matching the current attribute value is pre-selected.

---

## **🎯 Purpose**

- Select a tree node as the value of an entity attribute (e.g. a geographical scope)
- Fetch the complete flat node list from a backend route and build the tree client-side
- Pre-select the node matching the entity value, so edition forms open on the current value
- Participate in form validation through a `q-field` wrapper carrying the attribute rules

---

## **⚙️ Props**

The component accepts all props defined by `AttributeFieldProps<FieldTreeSettings>` — see
[EntityAttributeField](EntityAttributeField.md) for the common props (`instanceId`, `i18nScope`, `uiNamespace`,
`definition`, `entity`, `ignoreRules`).

### FieldTreeSettings

The `definition.inputSettings` object supports:

| Setting             | Type             | Required | Default    | Description                                                                                                                        |
| ------------------- | ---------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `route`             | `string`         | Yes      | -          | Backend route returning the flat tree nodes, rendered as a Nunjucks template with the edited entity as `entity`                    |
| `routeDependencies` | `string[]`       | No       | `[]`       | Paths of the values the `route` needs (e.g. `["entity.orgId"]`): while any is empty the field is disabled and nothing is requested |
| `nodeTypes`         | `TreeNodeType[]` | No       | `[]`       | The node types rendered in the tree; a type declared with `selectable: false` renders expandable, not selectable                   |
| `idKey`             | `string`         | No       | `id`       | The flat node property holding the node identifier, stored as the field value                                                      |
| `parentIdKey`       | `string`         | No       | `parentId` | The flat node property holding the parent node identifier                                                                          |
| `typeKey`           | `string`         | No       | `type`     | The flat node property holding the node type                                                                                       |
| `searchEnabled`     | `boolean`        | No       | `false`    | Displays the tree's built-in text filter above the nodes                                                                           |
| `nodesQuerySize`    | `number`         | No       | `50`       | Number of nodes fetched per page while loading the complete tree                                                                   |
| `ignoreRules`       | `boolean`        | No       | `false`    | Bypasses the validation rules for this field                                                                                       |
| `disable`           | `boolean`        | No       | `false`    | Renders the field in a disabled state                                                                                              |

### Node loading

The complete node list is fetched from `route` (every page, like `GenericTreeCard`), then built into a tree from the
`idKey` / `parentIdKey` / `typeKey` properties: nodes without a parent, or whose parent is not part of the fetched
nodes, become roots, and the nodes keep the order returned by the API. The route is re-fetched when its rendered
value changes; entity edits that leave the rendered route unchanged do not trigger a reload. When the route changes,
the current selection is cleared, since it belongs to a tree that no longer applies. A templated route must declare
its `routeDependencies`: the field stays disabled and requests nothing while any of them is empty.

---

## **📤 Events**

| Event           | Payload                   | Description                                       |
| --------------- | ------------------------- | ------------------------------------------------- |
| `update:entity` | `Record<string, unknown>` | Emitted when the user selects a node in the tree. |

The payload is the complete entity object with the selected node key written at the attribute path. Selecting the
already selected node, and the tree reporting an empty key, emit nothing.

---

## **🌍 Internationalization (i18n)**

### Translation Scope

All translations are resolved under the field scope:

```text
{i18nScope}.fields.{definition.name}
```

### Supported Translation Keys

| Key                            | Usage                                                   |
| ------------------------------ | ------------------------------------------------------- |
| `label`                        | The field label                                         |
| `hint`                         | The field hint                                          |
| `validation.required`          | Shown when a required field is submitted without a node |
| `validation.tree.missingRoute` | Shown when the configuration declares no `route`        |
| `validation.tree.fetchError`   | Shown when loading the nodes fails                      |
| `validation.tree.retry`        | Label of the retry button after a failed load           |

### Tree Translation Keys

The embedded tree resolves its own keys under the same field scope, as documented by
[GenericTree](../tree/GenericTree.md):

| Key                              | Usage                                                     |
| -------------------------------- | --------------------------------------------------------- |
| `GenericTree.types.{TYPE}.label` | The node label template, interpolated with the node value |
| `GenericTree.filterLabel`        | The label of the built-in filter input                    |
| `GenericTree.filterHint`         | The hint of the built-in filter input                     |
| `GenericTree.noNodesLabel`       | Shown when the tree holds no node                         |
| `GenericTree.noResultsLabel`     | Shown when the filter matches no node                     |

---

## **🎨 UI Customization**

### Namespace Resolution

```text
{uiNamespace}.{definition.name}
```

### Applied Components

- The wrapping field reads `q-field` properties from the namespace above.
- The embedded tree reads its properties under `{uiNamespace}.{definition.name}.GenericTree` (`q-tree`, `q-input`
  for the filter, and `types.{TYPE}.q-icon` for the node icons).
- The selected node is highlighted and carries a check icon next to its label (a positive `check` by default,
  customizable under `{uiNamespace}.{definition.name}.GenericTree.selected-icon.q-icon`).

### Initial Expansion

The field controls the initial expansion of the tree:

- When it holds no value, as on a creation form, only the root nodes are expanded: the first level is visible.
- When it holds a value, as on an edition form, the path to the selected node is expanded and the rest stays
  collapsed.

The user can then fold and unfold nodes freely on top of this initial state. While a filter is typed in the search
input, the whole tree expands so every match is visible, and the previous expansion comes back once the filter is
cleared.

## **✅ Validation**

The tree itself is not a Quasar form component, so the field wraps it in a **`q-field`** holding the attribute value
and the validation rules built by `useQuasarRules`. The surrounding `q-form` of the generic pages therefore validates
the field on submit like any other input: submitting a required field without a selected node blocks the submission
and displays the `validation.required` message under the tree, before any request is sent.

Validation is bypassed when `ignoreRules` is set on the component or in `inputSettings`.

The error message is displayed below the tree, without the q-field error icon. The embedded filter input is kept out
of the error state styling: it only filters the loaded tree and is never what the validation is about.

A failed load displays a retry button in place of the tree (`retry-button` design namespace, `validation.tree.retry`
label), since a static route has no other way to be requested again.

For an optional attribute, enabling `q-field.clearable` through the design gives the field a clear button: clearing
empties the value on the entity. Selecting a node never unselects it from the tree itself.

A broken configuration (missing `route`) and a failed load are displayed as the field error, in place of the tree.

---

## **🧭 Nested Attributes**

Like every attribute field, the attribute `name` supports dot notation to read and write the value nested inside
sub-objects of the entity (e.g. `extraParameters.scopeId`).

---

## **🔁 Data Flow**

1. The route is rendered against the entity and the complete flat node list is fetched.
2. The tree is built from the flat nodes and rendered inside the `q-field`.
3. The node matching the entity value, when any, is pre-selected.
4. When the user selects a node, the node key is written at the attribute path and `update:entity` is emitted.
5. When the entity value changes from the outside (e.g. the edition page finishes loading its entity), the
   selection follows it.

---

## **Example Configuration**

```json
{
  "name": "scopeId",
  "input": "Tree",
  "required": true,
  "inputSettings": {
    "route": "/api/geographies",
    "searchEnabled": true,
    "nodeTypes": [{ "type": "PAYS", "selectable": false }, { "type": "REGION" }, { "type": "EPCI" }, { "type": "DEPARTEMENT" }, { "type": "COMMUNE" }]
  }
}
```

With the matching translations:

```json
{
  "fields": {
    "scopeId": {
      "label": "Geographical scope *",
      "validation": {
        "required": "This field is required.",
        "tree": {
          "missingRoute": "The tree field is missing its route.",
          "fetchError": "Unable to load the tree. Please try again later.",
          "retry": "Retry"
        }
      },
      "GenericTree": {
        "filterLabel": "Search",
        "filterHint": "Type a node name",
        "noNodesLabel": "No node available",
        "noResultsLabel": "No node matches the filter",
        "types": {
          "PAYS": { "label": "{label}" },
          "REGION": { "label": "{label}" },
          "EPCI": { "label": "{label}" },
          "DEPARTEMENT": { "label": "{label}" },
          "COMMUNE": { "label": "{label}" }
        }
      }
    }
  }
}
```
