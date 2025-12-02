# **CONTRIBUTING 🤝**

Thank you for contributing to **linid-im-front-community-plugins**, the monorepo containing all community modules and component catalogs for the LinID Identity Manager platform.

This document explains the conventions, workflows, and best practices to follow when contributing to this Nx-powered monorepo.

---

# **📌 Git Conventions**

## **🌿 Branch Naming**

All branches must follow one of the following naming patterns:

| Type            | Pattern                           | Example                               |
| --------------- | --------------------------------- | ------------------------------------- |
| **Main**        | `main` or `dev`                   | `main`                                |
| **Feature**     | `feature/<short-description>`     | `feature/catalog-ui-add-icons`        |
| **Bugfix**      | `bugfix/<short-description>`      | `bugfix/fix-catalog-render-error`     |
| **Improvement** | `improvement/<short-description>` | `improvement/refactor-module-builder` |
| **Release**     | `release/<version>`               | `release/1.3.0`                       |
| **Hotfix**      | `hotfix/<short-description>`      | `hotfix/catalog-missing-export`       |

### **Rules**

✔ lowercase only
✔ dashes (`-`), underscores (`_`) and dots (`.`) allowed
✔ branch names must be short and descriptive
✔ use English for descriptions

---

## **📝 Commit Message Format (Conventional Commits)**

This project follows the **Conventional Commits** format:

```
<type>(<scope>): <short summary>
```

### **Accepted types**

* `feat` – A new feature
* `fix` – A bug fix
* `docs` – Documentation changes only
* `style` – Code formatting only (no logic)
* `refactor` – Code refactoring without behavior change
* `perf` – Performance improvements
* `test` – Test-related changes
* `security` – Security-related changes
* `deprecated` – Deprecation of APIs or modules
* `chore` – Internal tooling, CI, dependency bumps…
* `build` – Build pipeline or configuration updates

---

## **📦 Commit Scope & Versioning Rules (Important)**

In this monorepo, **your commit scope determines which module receives a version bump**.

### 📌 **1. Scoped commits → bump the matching module**

Example:

```
feat(module-users): add bulk import feature
```

➡ The **module-users** package will receive a **minor** version bump.
➡ Only this module is impacted.

Another example:

```
fix(catalog-ui): fix missing props validation
```

➡ `catalog-ui` will bump **patch** version only.

### 📌 **2. Unscoped commit → global change**

Example:

```
feat: introduce new shared plugin utils
```

➡ This means the change applies to the **whole monorepo**.
➡ All affected modules will be bumped accordingly (usually minor).

### 📌 Summary table

| Commit                | Meaning              | Version impact                    |
| --------------------- | -------------------- | --------------------------------- |
| `feat(module-x): ...` | Feature for module X | bump X (minor)                    |
| `fix(module-x): ...`  | Fix for module X     | bump X (patch)                    |
| `feat: ...`           | Global feature       | bump all affected modules (minor) |
| `fix: ...`            | Global fix           | bump all affected modules (patch) |

---

## **🔏 Commit Signing**

All commits **must be signed**:
Unsigned commits will be rejected.

---

# **📚 Documentation Guidelines**

## **📁 Documentation Directory**

All documentation must be placed under:

```
/docs
```

Each plugin, module, generator or architectural concept must have its own Markdown file.

---

## **📊 Diagrams with Mermaid**

Mermaid is used for flowcharts and architecture diagrams.

* Files must be `.md` or `.mmd`
* Output PNG must be committed with the source

### Generate diagrams

```sh
mmdc -i docs/diagram.mmd -o docs/diagram.png
```

Any diagram change **must regenerate the PNG**.

---

# **🚀 Development**

This project is an **Nx monorepo** using **pnpm** as the package manager.

## **📦 Installation**

### ⭐ Quick Start

```sh
corepack enable
pnpm install
```

### Using pnpm manually

```sh
pnpm install
```

---

## **🛠️ Local Development**

### Start a module or catalog in dev mode

```sh
pnpm dev
```

This will start the `catalog-ui` module (or any default development target defined later).

### Build all projects

```sh
pnpm build
```

### Run all checks

```sh
pnpm validate
```

### Type checking

```sh
pnpm typecheck
```

### Testing

```sh
pnpm test          # Runs the full test suite once
pnpm test:watch    # Runs tests in watch mode
pnpm test:coverage # Generates a coverage report
```

### Lint & Format

```sh
pnpm lint
pnpm lint:fix

pnpm format
pnpm format:check
```

---

# **📦 Nx Commands**

### View project graph

```sh
pnpm graph
```

### Reset Nx cache

```sh
pnpm reset
```

### Only run tasks affected by git changes

```sh
pnpm exec nx affected -t lint test typecheck build
```

---

# **⚙️ Module Generator**

The monorepo includes a generator to scaffold a new module.

### Run generator

```sh
pnpm nx generate @linid-im-front-community-plugins/module:create
```

or

```sh
pnpm exec nx generate @linid-im-front-community-plugins/module:create
```

This will:

* create a new remote module
* configure module federation
* setup tests, linting, tsconfig
* generate base pages & components

---

# **🧼 Code Quality**

We enforce strict quality standards via:

* **ESLint**
* **Prettier**
* **TypeScript**
* **Nx task orchestration**

Use:

```sh
pnpm validate
```

to run **all checks** at once.

## Copyright Headers

All source files located in the `src` folder must contain a copyright header at the beginning of the file. This header is based on the content of the `COPYRIGHT` file at the project root.

### Affected Files

Copyright headers are mandatory for the following files:

- TypeScript files (`.ts`)
- JavaScript files (`.js`)
- Vue files (`.vue`)

### Automatic Verification

An ESLint rule is configured via the `eslint-plugin-headers` plugin to check for the presence of these headers.

### Automatic Header Addition

If a file does not contain the required copyright header, you can add it automatically by running:

```bash
pnpm lint:fix
```

This command will analyze all files in the `src` folder and add missing headers according to the `COPYRIGHT` file.

### Manual Verification

To check compliance without modifying files, use:

```bash
pnpm lint
```

Any file without the appropriate header will be reported as a lint error.

---

# **🧪 E2E & Integration Testing**

Dedicated E2E suite will come later.

➡ **Coming soon… ⏳**

---

# **🚀 Releases (Semantic Release for Monorepos)**

Releases are automated using **Semantic Release** with Nx awareness.

When merging into `main`:

* Version bumps are determined **per module**, based on commit scopes
* `package.json` versions are updated
* Changelogs are generated for each module
* Git tags are created automatically

⚠ **No manual versioning is allowed.**

---

# **📜 License**

This project is distributed under the
**GNU Affero General Public License v3**.

See: [`LICENSE.md`](LICENSE.md)
