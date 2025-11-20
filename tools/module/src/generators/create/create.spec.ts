import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { createGenerator } from './create';
import type { CreateGeneratorSchema } from './schema';

describe('create generator', () => {
  let tree: Tree;
  const options: CreateGeneratorSchema = {
    name: 'test',
    description: 'A description',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await createGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
