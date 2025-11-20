# linid-im-front-community-plugins

Community plugins for LinID Identity Manager frontend.

## Installation

This project uses **pnpm** as the package manager with Nx for monorepo management.

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 10.20.0 (managed via Corepack)

### Quick start

```sh
# Enable Corepack (included with Node.js 16.9+)
corepack enable

# Install dependencies (Corepack will use pnpm@10.20.0 automatically)
pnpm install
```

**Note:** The `packageManager` field in `package.json` ensures everyone uses the same pnpm version (10.20.0).

### Using pnpm (recommended)

```sh
# Install pnpm globally if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development

This is an Nx monorepo containing multiple modules that serve as remote applications for the LinID Identity Manager host application. Each module is independently developed, tested, and can be deployed as a standalone remote.

### Quick Commands

```sh
# Start development server for catalog-ui
pnpm dev

# Build all projects
pnpm build

# Run all checks (lint, test, typecheck, build)
pnpm exec nx run-many -t lint test typecheck build
```

### Build all projects

```sh
# With pnpm (recommended)
pnpm build

# With npm
npm run build
```

## Code Quality

This project uses ESLint, Prettier, and TypeScript to ensure consistent code quality.

### Run all checks

```sh
# Run all checks (typecheck, lint, format, test)
pnpm validate
```

### Format

```sh
# Automatically format the codebase
pnpm format

# Check formatting without modifying files
pnpm format:check
```

### Linting

```sh
# Lint all projects
pnpm lint

# Auto-fix ESLint issues
pnpm lint:fix
```

### Type Checking

```sh
# Type check all projects
pnpm typecheck
```

### Testing

```sh
# Run tests for all projects
pnpm test
```

## Nx Commands

```sh
# View project graph
pnpm graph

# Clear Nx cache
pnpm reset

# Run affected tasks only (based on git changes)
pnpm exec nx affected -t build test lint

# Show what will be affected
pnpm exec nx show projects --affected
```

### Editor Setup

The project includes `.vscode/settings.json` which enables:

- Auto-format on save
- ESLint auto-fix on save

### Module Generator

This section describes the module generator available in the project.

#### Overview

The generator allows you to quickly create a new module with a standardized base structure and all necessary configurations.

#### Usage

To generate a module, run the following command:

```sh
pnpm nx generate @linid-im-front-community-plugins/module:create

# or
pnpm exec nx generate @linid-im-front-community-plugins/module:create
```

## CI/CD

The project uses GitHub Actions for continuous integration. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.

## License

This project is licensed under the GNU Affero General Public License version 3 - see [LICENSE](LICENSE.md) for details.
