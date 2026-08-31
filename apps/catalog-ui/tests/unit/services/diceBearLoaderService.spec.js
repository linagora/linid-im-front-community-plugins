/*
 * Copyright (C) 2026 Linagora
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General
 * Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version, provided you comply with the Additional Terms applicable for LinID Identity Manager software by
 * LINAGORA pursuant to Section 7 of the GNU Affero General Public License, subsections (b), (c), and (e), pursuant to
 * which these Appropriate Legal Notices must notably (i) retain the display of the "LinID™" trademark/logo at the top
 * of the interface window, the display of the "You are using the Open Source and free version of LinID™, powered by
 * Linagora © 2009–2013. Contribute to LinID R&D by subscribing to an Enterprise offer!" infobox and in the e-mails
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

import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.resetModules() + vi.doMock + dynamic import is the standard vitest pattern for
// testing functions that close over module-level state (the styleCache Map here).
// Each beforeEach reloads the module with a fresh cache and a fresh Style mock.

let loadDiceBearStyle;
let diceBearStyleModules;
let Style;

const ADVENTURER_KEY =
  '/node_modules/@dicebear/styles/dist/adventurer.min.json';

beforeEach(async () => {
  vi.resetModules();

  vi.doMock('@dicebear/core', () => ({
    Style: vi.fn().mockImplementation(function (def) {
      return { _def: def };
    }),
  }));

  const serviceModule =
    await import('../../../src/services/diceBearLoaderService');
  loadDiceBearStyle = serviceModule.loadDiceBearStyle;
  diceBearStyleModules = serviceModule.diceBearStyleModules;

  // Clear any real glob entries so tests control the loaders explicitly.
  for (const key of Object.keys(diceBearStyleModules)) {
    delete diceBearStyleModules[key];
  }

  const coreModule = await import('@dicebear/core');
  Style = coreModule.Style;
});

describe('Test service: loadDiceBearStyle', () => {
  it('should throw when the style name has no matching module', async () => {
    await expect(loadDiceBearStyle('nonexistent')).rejects.toThrow(
      'Unknown DiceBear style: nonexistent'
    );
  });

  it('should instantiate and return a Style from the loader definition', async () => {
    const definition = { schema: 'adventurer-v1' };
    diceBearStyleModules[ADVENTURER_KEY] = vi.fn(async () => ({
      default: definition,
    }));

    const result = await loadDiceBearStyle('adventurer');

    expect(Style).toHaveBeenCalledWith(definition);
    expect(result).toEqual({ _def: definition });
  });

  it('should return the cached Style instance on a second call without calling the loader again', async () => {
    const loader = vi.fn(async () => ({
      default: { schema: 'adventurer-v1' },
    }));
    diceBearStyleModules[ADVENTURER_KEY] = loader;

    const first = await loadDiceBearStyle('adventurer');
    const second = await loadDiceBearStyle('adventurer');

    expect(loader).toHaveBeenCalledTimes(1);
    expect(Style).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('should keep separate cache entries for different style names', async () => {
    const LORELEI_KEY = '/node_modules/@dicebear/styles/dist/lorelei.min.json';
    diceBearStyleModules[ADVENTURER_KEY] = vi.fn(async () => ({
      default: { schema: 'adventurer' },
    }));
    diceBearStyleModules[LORELEI_KEY] = vi.fn(async () => ({
      default: { schema: 'lorelei' },
    }));

    const adventurer = await loadDiceBearStyle('adventurer');
    const lorelei = await loadDiceBearStyle('lorelei');

    expect(adventurer).not.toBe(lorelei);
    expect(Style).toHaveBeenCalledTimes(2);
  });

  it('should evict the cache on rejection so a subsequent call retries the loader', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk load failed'))
      .mockResolvedValueOnce({ default: { schema: 'adventurer-v1' } });
    diceBearStyleModules[ADVENTURER_KEY] = loader;

    // First call: the loader rejects — the rejected Promise must not stay cached.
    await expect(loadDiceBearStyle('adventurer')).rejects.toThrow(
      'chunk load failed'
    );

    // Second call: the cache was evicted, so the loader is retried and succeeds.
    const result = await loadDiceBearStyle('adventurer');

    expect(loader).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ _def: { schema: 'adventurer-v1' } });
  });

  it('should invoke the loader and Style constructor only once across concurrent calls for the same style', async () => {
    let resolve;
    const loader = vi.fn(
      () =>
        new Promise((r) => {
          resolve = () => r({ default: { schema: 'adventurer-v1' } });
        })
    );
    diceBearStyleModules[ADVENTURER_KEY] = loader;

    // Both calls start before the loader resolves — they must share the same Promise.
    const p1 = loadDiceBearStyle('adventurer');
    const p2 = loadDiceBearStyle('adventurer');

    resolve();
    const [result1, result2] = await Promise.all([p1, p2]);

    // The loader was called exactly once despite two concurrent callers.
    expect(loader).toHaveBeenCalledTimes(1);
    expect(Style).toHaveBeenCalledTimes(1);
    // Both callers receive the same Style instance.
    expect(result1).toBe(result2);
  });
});
