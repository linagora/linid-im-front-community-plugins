/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the “You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!” infobox and in the e-mails
 * sent with the Program, notice appended to any type of outbound messages (e.g. e-mail and meeting requests) as well
 * as in the LinID Identity Manager user interface, (ii) retain all hypertext links between LinID Identity Manager
 * and https://linid.org/, as well as between LINAGORA and LINAGORA.com, and (iii) refrain from infringing LINAGORA
 * intellectual property rights over its trademarks and commercial brands. Other Additional Terms apply, see
 * <http://www.linagora.com/licenses/> for more details.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License and its applicable Additional Terms for
 * LinID Identity Manager along with this program. If not, see <http://www.gnu.org/licenses/> for the GNU Affero
 * General Public License version 3 and <http://www.linagora.com/licenses/> for the Additional Terms applicable to the
 * LinID Identity Manager software.
 */

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
      `  pnpm nx test:coverage ${resolvedOptions.name}      # Run tests with coverage`
    );
    console.log(
      `  pnpm nx test:watch ${resolvedOptions.name}         # Run tests in watch mode`
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
