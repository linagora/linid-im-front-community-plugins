# **GenericTreeCard 🌳**

The **GenericTreeCard** component displays a tree inside a card layout. It fetches a paginated
endpoint returning flat nodes, builds the tree from their parent identifiers and delegates the
rendering to the `GenericTree` component. Node selection can navigate to configured routes, and
per-node buttons, such as an edition dialog, are hosted by the typed `node-actions` zones.

It standardizes endpoint-driven trees so features can display hierarchical collections purely
through configuration, without implementing their own fetching, tree building and action flows.

---

## **🎯 Purpose**

- Fetches every page of a paginated endpoint returning flat nodes
- Builds the tree from the node identifier, parent identifier and type properties
- Delegates the rendering to `GenericTree` (search, per-node action menus, icons)
- Navigates to a route resolved from the selected node type
- Renders a `node-actions` zone on every node, scoped by node type
- Reloads the tree when configured UI events are emitted

---

## **⚙️ Props**

| Prop name          | Type                      | Default      | Description                                                                                                                                            |
| ------------------ | ------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`              | `String`                  | —            | Nunjucks template of the endpoint returning the flat nodes, rendered with `entity`. Every page is fetched until the last one                           |
| `idKey`            | `String`                  | `'id'`       | Name of the node property holding its unique identifier                                                                                                |
| `parentIdKey`      | `String`                  | `'parentId'` | Name of the node property holding the identifier of its parent. Nodes without a parent, or whose parent is not part of the fetched nodes, become roots |
| `typeKey`          | `String`                  | `'type'`     | Name of the node property holding its type                                                                                                             |
| `nodesQuerySize`   | `Number`                  | `50`         | Number of nodes fetched per page                                                                                                                       |
| `nodeTypes`        | `TreeNodeType[]`          | —            | Node types forwarded to `GenericTree`. The card handles no node action itself: per-node buttons go through the `node-actions.[TYPE]` zones             |
| `searchEnabled`    | `Boolean`                 | `false`      | Whether the tree search input is enabled, forwarded to `GenericTree`, which filters the nodes on their translated labels                               |
| `navigationRoutes` | `Record<string, string>`  | —            | Routes resolved when a node is selected, indexed by node type. Each route is a Nunjucks template rendered with `entity` and `item` (the selected node) |
| `reloadOn`         | `String[]`                | —            | Event keys reloading the tree when they are emitted through the UI event subject                                                                       |
| `entity`           | `Record<string, unknown>` | `undefined`  | Entity owning the tree, provided to the Nunjucks context. Injected by the hosting zone                                                                 |
| `enableActions`    | `Boolean`                 | `true`       | When `false`, hides the header actions section (slots and zone renderer)                                                                               |
| `instanceId`       | `String`                  | —            | Instance identifier passed to the form dialog fields (e.g. API validation rules)                                                                       |
| `uiNamespace`      | `String`                  | —            | Base UI namespace used for design system customization                                                                                                 |
| `i18nScope`        | `String`                  | —            | Identifier used to scope translations                                                                                                                  |

### Endpoint response

The `url` endpoint must return a Spring `Page<T>` of flat nodes. Pages are requested with a plain
zero-based pagination (`page`, `size`) until the last one, and the complete tree is built from the
accumulated nodes:

```json
{
  "content": [
    { "id": "s1", "parentId": null, "type": "STRUCTURE", "label": "DDT44" },
    { "id": "h1", "parentId": "s1", "type": "HIERARCHY", "label": "Accounting" }
  ],
  "last": true
}
```

### Node labels

Node labels are translated by `GenericTree` through the `types.[TYPE].label` key, rendered with the
flat node properties as named parameters, for example `"label": "{label}"`.

---

## **🧩 Slots**

| Slot                     | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `prepend-header-actions` | Rendered before the header actions zone renderer |
| `append-header-actions`  | Rendered after the header actions zone renderer  |

---

## **🧩 Zones**

| Zone                                                   | Entity            | Description                                              |
| ------------------------------------------------------ | ----------------- | -------------------------------------------------------- |
| `[UI_NAMESPACE].generic-tree-card.header-actions`      | The owning entity | Buttons rendered in the card header actions area         |
| `[UI_NAMESPACE].generic-tree-card.node-actions.[TYPE]` | The flat node     | Buttons rendered on every node of the `[TYPE]` node type |

---

## **🧩 Internal Behavior**

- The tree is loaded as soon as the rendered `url` is available, and reloaded whenever it changes.
  A load still in flight is aborted when a new one starts, and the loading skeleton only replaces
  the tree on the first load: on reloads the tree stays mounted, keeping its expanded nodes.
- A card hosted by a details page receives an empty entity until the page has loaded it: the
  endpoint is not fetched until the entity is resolved.
- Selecting a node resolves the route configured for its type in `navigationRoutes` and navigates
  to it. Types without a configured route do not navigate.
- The card handles no node action itself: per-node buttons are configured through the
  `node-actions.[TYPE]` zones, which receive the flat node as `entity`, the
  `[UI_NAMESPACE].generic-tree-card.node-actions` UI namespace and the
  `[I18N_SCOPE].GenericTreeCard.NodeActions` i18n scope.
- Events listed in `reloadOn` reload the tree when they are emitted through the UI event subject,
  typically by a `FormDialogButton` hosted in a `node-actions` zone (through its `emitOnSubmit`
  prop) or in another zone of the page.

---

## **🌍 Internationalization**

All keys live under `[I18N_SCOPE].GenericTreeCard`:

| Key           | Description                                        |
| ------------- | -------------------------------------------------- |
| `title`       | Card title (hidden when the key does not exist)    |
| `loadError`   | Tree loading error notification                    |
| `NodeActions` | Scope passed to the `node-actions` zone components |
| `GenericTree` | Dedicated scope of the embedded tree               |

See [`GenericTree.md`](../tree/GenericTree.md) for the keys of the embedded tree (node type labels
and action labels) and [`FormDialog.md`](../dialog/FormDialog.md) for the dialog keys.

---

## **🎨 UI Design**

The namespace is `[UI_NAMESPACE].generic-tree-card`. See the [design documentation](../../design.md#generictreecard).

---

## **🧩 Usage Examples**

### Zone configuration

```json
{
  "zone": "moduleStructuresPage.content.after",
  "plugin": "catalogUI/GenericTreeCard",
  "props": {
    "url": "/api/structure-tree",
    "nodeTypes": [{ "type": "STRUCTURE" }, { "type": "HIERARCHY" }],
    "navigationRoutes": {
      "STRUCTURE": "/structures/{{ item.id }}",
      "HIERARCHY": "/hierarchies/{{ item.id }}"
    },
    "reloadOn": ["structure-updated", "hierarchy-updated"]
  }
}
```

### Node actions zone

Per-node buttons are configured through the typed `node-actions` zones, which receive the flat node
as `entity`. For example, an edition dialog on the hierarchy nodes, with `emitOnSubmit` matching the
`reloadOn` of the card so the tree reloads after the update:

```json
{
  "zone": "moduleStructuresPage.generic-tree-card.node-actions.HIERARCHY",
  "plugin": "catalogUI/FormDialogButton",
  "props": {
    "url": "/api/hierarchies/{{ entity.id }}",
    "method": "PUT",
    "fillFormWithEntity": true,
    "body": { "label": "{{ entity.label }}" },
    "formFields": [{ "name": "label", "type": "String", "input": "Text", "required": true }],
    "emitOnSubmit": "hierarchy-updated"
  }
}
```

### Header actions zone

Buttons are added to the card header through the `header-actions` zone. The zone passes the owning
entity, the `[UI_NAMESPACE].generic-tree-card.buttons-card` UI namespace and the
`[I18N_SCOPE].GenericTreeCard.ButtonsCard` i18n scope to the hosted components:

```json
{
  "zone": "moduleStructuresPage.generic-tree-card.header-actions",
  "plugin": "catalogUI/RedirectButton",
  "props": { "to": "/structures/hierarchies/new" }
}
```

### Direct usage

```vue
<GenericTreeCard url="/api/structure-tree" :node-types="[{ type: 'STRUCTURE' }, { type: 'HIERARCHY' }]" :navigation-routes="{ STRUCTURE: '/structures/{{ item.id }}' }" ui-namespace="myModule" i18n-scope="myModule" />
```

---

## **✅ Advantages**

- Endpoint-driven trees without feature-specific code
- Configuration-driven navigation and edition flows
- Consistent card layout, dialogs and notifications with the other generic cards
- Reuses the `GenericTree` rendering (search, action menus, icons, design namespaces)
