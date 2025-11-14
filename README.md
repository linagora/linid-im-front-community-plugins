# linid-im-front-community-plugins

Community plugins for LinID Identity Manager frontend.

## Installation

This project uses **pnpm** as the package manager with Nx for monorepo management.

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

This is an Nx monorepo containing micro-frontend applications using Module Federation.

### Build all projects

```sh
# With pnpm (recommended)
pnpm build

# With npm
npm run build
```

### Build catalog-ui

```sh
# Using Nx
pnpm exec nx build catalog-ui

# Or using the npm script
pnpm catalog-ui:build
```

### Run catalog-ui locally

```sh
# Preview the built catalog-ui
pnpm exec nx run catalog-ui:preview

# Or using the npm script
pnpm catalog-ui:preview
```

### Development server

```sh
# Start dev server for catalog-ui
pnpm exec nx serve catalog-ui
```

## Code Quality

This project uses ESLint, Prettier, and TypeScript to ensure consistent code quality.

### Run all checks

```sh
# Run linting, tests, build, and type checking for all projects
pnpm exec nx run-many -t lint test build typecheck
```

### Linting

```sh
# Lint all projects
pnpm lint

# Lint a specific project
pnpm exec nx lint catalog-ui
```

### Type Checking

```sh
# Type check all projects
pnpm typecheck

# Type check a specific project
pnpm exec nx typecheck catalog-ui
```

### Testing

```sh
# Run tests for all projects
pnpm test

# Run tests for a specific project
pnpm exec nx test catalog-ui
```

### Nx Commands

```sh
# View project graph
pnpm exec nx graph

# Clear Nx cache
pnpm exec nx reset
```

## CI/CD

The project uses GitHub Actions for continuous integration. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.

## License

This project is licensed under the GNU Affero General Public License version 3 - see [LICENSE](LICENSE.md) for details.
