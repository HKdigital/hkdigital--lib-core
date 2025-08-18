import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { kebabToTitleCase, basename } from '$lib/util/string.js';

/**
 * Validates if a path is within the project's src/routes directory
 * @param {string} path - Path to validate
 * @returns {boolean}
 */
export function isValidRoutePath(path) {
  const normalizedPath = resolve(path);
  const routesPath = resolve(process.cwd(), 'src/routes');
  return normalizedPath.startsWith(routesPath);
}

/**
 * Scans route folders recursively, only including folders with +page.svelte
 * @param {Object} options - Scan options
 * @param {string} options.dirPath - Directory path to scan
 * @param {number} [options.maxDepth=1] - Maximum depth to scan
 * @param {Set<string>} [options.skipFolders] - Folders to skip
 *
 * @param {number} [depth=0] - Do not set manually!
 *
 * @returns {Promise<Array<{displayName: string, path: string, depth: number}>>}
 *
 * @throws {Error} If path is outside project routes directory
 */
export async function scanRouteFolders(
  { dirPath, maxDepth = 1, skipFolders },
  depth = 0
) {
  // console.debug({
  //   maxDepth,
  //   depth
  // });

  if (!isValidRoutePath(dirPath)) {
    throw new Error('Invalid path: Must be within src/routes directory');
  }

  if (depth > maxDepth) return [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
      if (
        !entry.isDirectory() ||
        skipFolders?.has(entry.name) ||
        entry.name.startsWith('.')
      ) {
        continue;
      }

      const fullPath = join(dirPath, entry.name);
      const currentPath = entry.name;

      const dirContents = await readdir(fullPath);
      const hasPageFile = dirContents.includes('+page.svelte');

      if (hasPageFile) {
        results.push({
          displayName: entry.name,
          path: currentPath,
          depth
        });
      }

      if (maxDepth > 1) {
        const subFolders = await scanRouteFolders(
          {
            dirPath: fullPath,
            maxDepth,
            skipFolders
          },
          depth + 1
        );

        for (const subFolder of subFolders) {
          const path = `${currentPath}/${subFolder.path}`;

          const displayName = kebabToTitleCase(basename(subFolder.path));

          results.push({
            displayName,
            path,
            depth: subFolder.depth
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to scan directory');
  }
}
