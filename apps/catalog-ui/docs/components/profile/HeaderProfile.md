# **HeaderProfile**

The **HeaderProfile** component displays the authenticated user's profile information in the application header.
It renders a button showing the user's name and, on click, opens a dropdown menu with the full name and email address retrieved from the LinID user store, together with a language switcher that lets the user change the application language.

---

## **Purpose**

- Displays the authenticated user's identity in the header
- Provides quick access to profile information (name and email) via a dropdown menu
- Allows the user to switch the application language via a dropdown selector
- Integrates with the LinID user store to reactively reflect the current user state
- Integrates with the UI store and the corelib i18n helpers to read and update the active locale
- Integrates with the LinID design system for consistent styling
- Extensible via `LinidZoneRenderer`: plugins can inject additional menu items into the profile dropdown

---

## **Props**

| Prop          | Type     | Required | Default | Description                            |
| ------------- | -------- | -------- | ------- | -------------------------------------- |
| `uiNamespace` | `string` | Yes      | -       | UI design namespace for custom styling |
| `i18nScope`   | `string` | No       | -       | i18n scope for translations            |

### HeaderProfileProps Interface

```typescript
export interface HeaderProfileProps extends CommonComponentProps {}
```

---

## **Events**

This component emits no events. Language selection updates the shared i18n instance directly rather than emitting an event to the parent.

---

## **Language Switcher**

The profile menu includes a language selector. Its data comes from several distinct sources, all provided by the **host** application; the component itself contains no hard-coded language list, name or flag.

### How it works

1. **Available languages** — read at runtime from the shared i18n instance via `getI18nInstance().global.availableLocales`. This reflects the locales for which the host has loaded messages (configured in `config.json` → `i18n.languages`). The dropdown list is built by iterating over this array, so adding a language to the host configuration automatically adds it to the switcher.
2. **Active language** — read from `getI18nInstance().global.locale`. Because this value is typed as `string | WritableComputedRef<string>` but is a writable ref at runtime, it is accessed through a cast to `WritableComputedRef<string>`. On selection, the component assigns this value, which updates the whole UI reactively.
3. **Language display names (endonyms)** — resolved through the `application` i18n scope using a second scoped translator: `tApp('languages.' + locale)`. Values are each language written in its own language (e.g. "Français", "English (US)"), so they must be **identical across all locale files** (see the i18n documentation).
4. **Flags** — served by the host as static SVG files at `/icons/{locale}.svg` (e.g. `/icons/fr-FR.svg`). The component references them by an absolute URL built from the locale code; it does **not** import or bundle them. This keeps the flags out of the Module Federation bundle but couples the component to a host that serves these files.

### Host requirements

To use the language switcher, the host **must** provide, for every supported locale:

- locale messages loaded for each language listed in `config.json` → `i18n.languages`
- the translation key `HeaderProfile.language.title`
- the translation key `application.languages.{locale}`
- a flag SVG served at `/icons/{locale}.svg`

If any of these is missing for a given locale, that language will render with a broken flag image or an untranslated key, and no error will be raised.

### Behaviour notes

- The currently active language stays visible in the list but is **disabled** (not selectable), per specification.
- Selecting a language closes the entire profile menu. This is both the expected behaviour for a selector and a deliberate fix: the dropdown button re-measures its width on the next open, which avoids a layout overlap that occurred when the label changed while the menu stayed open.
- Selecting a language changes it for the current session only. Persisting the choice across sessions (user preferences) is handled elsewhere and is out of this component's scope.

---

## **UI Customization**

The component uses the LinID design system through `useUiDesign()`. The local namespace is built as `{uiNamespace}.header-profile`. You can customize:

- **Button**: `{uiNamespace}.header-profile` → applies to `q-btn`
- **Avatar section**: `{uiNamespace}.header-profile` → applies to `q-item-section` (icon side)
- **Email label**: `{uiNamespace}.header-profile` → applies to `q-item-label` (caption)

> **Note:** The language switcher (`q-select`) is not configurable through the design system, and the flags are static SVGs served by the host at `/icons/{locale}.svg`.

Here is a sample JSON configuration for the design system:

```json
{
  "myModule": {
    "header-profile": {
      "q-btn": {
        "flat": true,
        "round": false,
        "color": "white"
      },
      "q-item-section": {
        "avatar": true
      },
      "q-item-label": {
        "caption": true
      }
    }
  }
}
```

---

## **Advantages**

- **Reactive:** Automatically reflects user state changes via Pinia store and the shared i18n instance
- **Consistent:** Integrates with the LinID design system for uniform header styling
- **Configuration-driven:** The language list is derived from the host i18n configuration, not hard-coded
- **Type-safe:** Full TypeScript support via `CommonComponentProps`
- **Test-friendly:** Includes `data-cy` attributes for E2E testing
- **Federation-ready:** Exposed as a Module Federation remote for consumption by host applications

---

## **Usage Example**

### Direct Import

```vue
<script setup lang="ts">
import HeaderProfile from '@/components/profile/HeaderProfile.vue';
</script>

<template>
  <HeaderProfile ui-namespace="base-layout.header" />
</template>
```

### Via Module Federation

```vue
<script setup lang="ts">
import { loadAsyncComponent } from '@linagora/linid-im-front-corelib';

const HeaderProfile = loadAsyncComponent('catalogUI/HeaderProfile');
</script>

<template>
  <HeaderProfile ui-namespace="base-layout.header" />
</template>
```

---

## **Module Federation**

This component is exposed as a Module Federation remote entry:

| Key          | Value                                      |
| ------------ | ------------------------------------------ |
| Remote name  | `catalogUI`                                |
| Exposed path | `./HeaderProfile`                          |
| Source file  | `src/components/profile/HeaderProfile.vue` |

The host application must declare `catalogUI` as a remote in its Module Federation configuration and share the following singletons: `vue`, `quasar`, `pinia`, `@linagora/linid-im-front-corelib`.

---

## **Testing**

The component includes `data-cy` attributes for Cypress testing:

- Profile button: `data-cy="header_profile_button"`
- Dropdown menu: `data-cy="header_profile_menu"`
- Profile info item: `data-cy="header_profile_info"`
- User full name: `data-cy="header_profile_name"`
- User email: `data-cy="header_profile_email"`
- Language selector row: `data-cy="header_profile_language"`
- Language selector: `data-cy="header_profile_language_select"`
- Language option (per locale): `data-cy="header_profile_language_option_[LOCALE]"`

Example test:

```typescript
cy.get('[data-cy="header_profile_button"]').click();
cy.get('[data-cy="header_profile_menu"]').should('be.visible');
cy.get('[data-cy="header_profile_name"]').should('contain.text', 'John Doe');
cy.get('[data-cy="header_profile_email"]').should('contain.text', 'john.doe@example.com');
cy.get('[data-cy="header_profile_language_select"]').click();
cy.get('[data-cy="header_profile_language_option_en-US"]').click();
```

---

## **Notes**

- The component reads `fullName` and `email` from the `useLinidUserStore()` Pinia store — these values must be populated before the component is rendered (typically after OIDC authentication)
- The component has no fallback display when the user is not authenticated; the parent layout is responsible for rendering it only when a user session exists
- The template is excluded from v8 coverage (`<!-- v8 ignore start/stop -->`) as it contains only presentation logic
- **UI namespacing:** The local namespace `{uiNamespace}.header-profile` is derived from the prop, allowing each host application to style the component independently
- **Host coupling:** The language switcher expects the host to serve flag assets at `/icons/{locale}.svg` and to provide the `application.language.title` and `application.languages.{locale}` translation keys. Reusing this component in another host requires these to be present.

---

## **Architecture**

The component follows a simple reactive read pattern:

1. **Props in:** Receives `uiNamespace` to build its design system namespace
2. **Store read:** Reads `fullName` and `email` from `useLinidUserStore()` as computed properties
3. **UI props:** Resolves Quasar component props via `useUiDesign()` for `q-btn`, `q-item-section`, and `q-item-label`
4. **i18n read:** Reads the active locale and the list of available locales from the UI store (`useLinidUiStore().i18n`); resolves the switcher title and the language names via the `application` scope
5. **Render:** Displays a `q-btn` with the user's name; on click, a `q-menu` shows the full profile info
6. **Language switch:** On selecting a language, calls the corelib `changeLocale` helper — which applies the locale to vue-i18n (updating the whole UI reactively), reflects it in the store, and persists it — then closes the profile menu. The currently active language is shown but disabled in the list.
7. **Extension point:** A `LinidZoneRenderer` with zone `{uiNamespace}.header-profile.menu-items` allows plugins to inject additional menu items (e.g. logout, settings)

This architecture ensures:

- **Separation of concerns:** User data is handled by the user store, locale state by the UI store and the corelib i18n helpers, not the component
- **Reusability:** The component can be dropped into any layout that provides the correct `uiNamespace` and the required host resources
- **Reactivity:** Any update to the user store is automatically reflected without additional wiring
