import type { Tree } from '@nx/devkit';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  offsetFromRoot,
} from '@nx/devkit';
import type { CreateGeneratorSchema } from './schema';

/**
 * Creates a new module with the specified options.
 * @param tree The file system tree.
 * @param options The options for creating the module.
 * @returns A function that logs the completion message.
 */
export async function createGenerator(
  tree: Tree,
  options: CreateGeneratorSchema
) {
  const resolvedName = names(options.name).fileName;
  const projectRoot = `apps/${resolvedName}`;

  const resolvedOptions = {
    ...options,
    name: resolvedName,
    projectRoot,
    offsetFromRoot: offsetFromRoot(projectRoot),
    port: options.port ?? 5001,
  };

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    projectRoot,
    resolvedOptions
  );
  await formatFiles(tree);

  return () => {
    console.log(`✅ Module ${resolvedOptions.name} created successfully!`);
    console.log(`📦 Description: ${resolvedOptions.description}`);
    console.log(`🚀 Port: ${resolvedOptions.port}`);
    console.log(`\nAvailable commands:`);
    console.log(
      `  pnpm nx serve ${resolvedOptions.name}              # Start in dev mode`
    );
    console.log(
      `  pnpm nx preview ${resolvedOptions.name}            # Start in preview mode`
    );
    console.log(
      `  pnpm nx build ${resolvedOptions.name}              # Build the app`
    );
    console.log(
      `  pnpm nx test ${resolvedOptions.name}               # Run tests`
    );
    console.log(
      `  pnpm nx lint ${resolvedOptions.name}               # Check linting`
    );
    console.log(
      `  pnpm nx lint:fix ${resolvedOptions.name}           # Fix linting issues`
    );
    console.log(
      `  pnpm nx format:check ${resolvedOptions.name}       # Check formatting`
    );
    console.log(
      `  pnpm nx format:fix ${resolvedOptions.name}         # Fix formatting issues`
    );
    console.log(
      `  pnpm nx typecheck ${resolvedOptions.name}          # Run type checking`
    );
  };
}

export default createGenerator;
