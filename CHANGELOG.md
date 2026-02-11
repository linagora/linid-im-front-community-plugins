# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.1.0 (2026-02-11)

### ⚠️ Breaking Changes

- migrate Nx configuration from `nx.json` plugins to `project.json`
- remove `publicPath` from configuration

### Features

#### Module Users

- register users module in main navigation
- add users listing page
- add user details page
- add user creation page
- add user edition page
- add user creation and edition forms
- integrate `GenericEntityTable` in users page
- integrate `EntityDetailsCard` in user details page
- integrate `AdvancedSearchCard` in homepage
- add `AdvancedSearchConfiguration` type
- add i18n configuration for module-users
- add extensive `data-cy` attributes for E2E testing

#### Catalog UI

- add `GenericEntityTable` component
- add `EntityDetailsCard` component
- add `InformationCard` component
- add `ButtonsCard` component
- add `BlurLoader` component
- add `AdvancedSearchCard` component
- add `NavigationMenu` component
- add header in `BaseLayout`
- add logo and clickable title in header
- add fields wrapper component
- forward slots in `GenericEntityTable`
- add validation support for `EntityAttributeField`
- allow configurable confirm button type and disabled state
- share Axios instance via Module Federation
- add `data-cy` attributes to field components

#### Core / Global

- add date-picker field
- emit entity update on datepicker selection
- call `notify` from corelib
- improve default module generation
- upgrade `linid-im-front-corelib` up to `0.0.37`

### Bug Fixes

#### Module Users

- replace `loading` with `isLoading` in homepage
- remove unused i18n keys
- expose missing `HomePage`
- fix routing configuration

#### Catalog UI

- prevent tab focus loss on child routes
- fix translation key in `EntityDetailsCard`
- use `loadAsyncComponent` for Module Federation
- correct UI namespace structure and naming
- reorganize component folders

#### Build / CI

- make CI fail on unit test failure
- add missing preview command
- fix generated `package.json` issues
- reset Nx before Docker build
- add missing dependencies (Vue, Module Federation Vite, Quasar Vite)

### Refactoring

#### Module Users

- restructure page layouts
- improve responsiveness and component reactivity

#### Catalog UI

- improve `AdvancedSearchCard` layout
- use `h4` for `EntityDetailsCard` title
- replace `instanceId` with `i18nScope` for translations

### Tests

- enhance E2E readiness with additional `data-cy` selectors
- remove trivial prop tests for `ButtonsCard`

### Documentation

- setup and complete project documentation
- improve README and workspace documentation
- document table pagination
- document `AdvancedSearchCard`
- document `design.json` configuration (catalog-ui & module-users)
- document advanced search configuration
- document i18n configuration
- document homepage `isLoading` behavior
- unify module-users documentation
- update copyright year to 2026

### Build System & Tooling

- migrate from npm to pnpm
- upgrade dependencies to latest versions
- optimize Node and pnpm caching
- configure ESLint, Prettier and header enforcement
- enforce copyright headers via `eslint-plugin-headers`
- clean and format configuration files
- remove obsolete Nx test targets
- install Sass

### 0.0.1 (2025-12-04)

### Features

- add Pinia state management library ([4fa5839](https://github.com/linagora/linid-im-front-community-plugins/commit/4fa583965318246255acf7487e31af0f47408a7b))
- migrate to @module-federation/vite and fix Nx build ([3013f50](https://github.com/linagora/linid-im-front-community-plugins/commit/3013f50cf75e846be0dc469e284bc436bf20d36c))
- setup pull-request workflow ([f2510d1](https://github.com/linagora/linid-im-front-community-plugins/commit/f2510d1c6a9bd3239efe2f5789805dd6dae9e35f))
- setup release workflow ([793d556](https://github.com/linagora/linid-im-front-community-plugins/commit/793d5566a05bf4e863e2b1eac323044fb94499fb))
- **test:** add Vitest configuration and test infrastructure ([a7dae1a](https://github.com/linagora/linid-im-front-community-plugins/commit/a7dae1a5930c6041c153032e2a20ff01d3f1bf5e))

### Bug Fixes

- configure catalog-ui for Module Federation runtime ([39afa02](https://github.com/linagora/linid-im-front-community-plugins/commit/39afa024bf8179c0592760266931cd8ef08ac949))
